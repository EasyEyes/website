"""Prepare candidate ACAD clips locally. Never performs network requests."""

import argparse
import csv
import io
import json
import re
import wave
from collections import Counter, defaultdict
from pathlib import Path
from zipfile import ZipFile


def rows(archive, name):
    with archive.open(name) as source:
        return list(csv.DictReader(io.TextIOWrapper(source, encoding="utf-8-sig")))


def prepare(audio_zip, mapping_zip, destination, limit):
    path_pattern = re.compile(r"ASU-wav/(\d+)([FM])(?:-trans)?/(\d+Y_\d+M)/(R[^/]+)\.wav")
    key_pattern = re.compile(r"(\d+)/\d+_(\d+Y_\d+M)_(R[^/]+)\.wav")
    with ZipFile(audio_zip) as audio, ZipFile(mapping_zip) as mapping:
        sources = defaultdict(list)
        for entry in audio.infolist():
            match = path_pattern.fullmatch(entry.filename)
            if match:
                child, gender, age, task = match.groups()
                sources[int(child), age, task].append((entry, gender.lower()))
        duration = {
            row["audio_relative_path"]: float(row["recording_duration_seconds"])
            for row in rows(mapping, "ACAD_recording_manifest.csv")
        }
        pool = defaultdict(list)
        for row in rows(mapping, "ACAD_utterance_manifest.csv"):
            path = row["audio_relative_path"]
            key = key_pattern.fullmatch(path)
            reference = row["text_normalized_for_stt"]
            if (
                not key
                or row["task"] not in {"23", "24", "26"}
                or row["inexact_transcription"] != "False"
                or row["jsonl_vs_chat_text"] != "match"
                or not re.fullmatch(r"[a-z]{2,5}( [a-z]{2,5}){2}", reference)
                or len(set(reference.split())) != 3
            ):
                continue
            child, age, task = key.groups()
            matched = sources[int(child), age, task]
            if len(matched) != 1 or not row["gender"].startswith(matched[0][1]):
                continue
            start, end = float(row["start_seconds"]), float(row["end_seconds"])
            if not 0 <= start < end or not 0.5 <= end - start <= 12:
                continue
            pool[row["task"]].append((matched[0][0], row, start, end))
        # Rotate across lists, preferring speakers not yet used.
        destination.mkdir(parents=True, exist_ok=False)
        speakers, variants, lists = Counter(), Counter(), Counter()
        clips = []
        while pool and len(clips) < limit:
            task = min(pool, key=lambda key: (lists[key], key))
            candidates = pool[task]
            index = min(
                range(len(candidates)),
                key=lambda i: (
                    speakers[candidates[i][1]["child_id"]],
                    variants[candidates[i][1]["text_normalized_for_stt"]],
                    candidates[i][1]["utterance_id"],
                ),
            )
            entry, row, start, end = candidates.pop(index)
            if not candidates:
                del pool[task]
            child = row["child_id"]
            if speakers[child] >= 2:
                continue
            with audio.open(entry) as source, wave.open(source) as source_wav:
                rate, frames = source_wav.getframerate(), source_wav.getnframes()
                channels, width = source_wav.getnchannels(), source_wav.getsampwidth()
                if (
                    (rate, channels, width) != (44100, 1, 2)
                    or abs(frames / rate - duration[row["audio_relative_path"]]) > 0.05
                    or end > frames / rate + 0.05
                ):
                    continue
                first, last = round(start * rate), min(round(end * rate), frames)
                source_wav.setpos(first)
                pcm = source_wav.readframes(last - first)
                if len(pcm) != (last - first) * width:
                    continue
            clip_id = f"clip-{len(clips) + 1:04d}"
            name = f"{clip_id}.wav"
            with wave.open(str(destination / name), "wb") as output:
                output.setparams((channels, width, rate, 0, "NONE", "not compressed"))
                output.writeframes(pcm)
            clips.append({
                "id": clip_id,
                "file": name,
                "reference": row["text_human_orthographic"],
                "referenceStatus": "candidate",
                "speakerGroup": f"speaker-{int(child):02d}",
                "list": task,
                "sourceUtterance": row["utterance_id"],
                "startSeconds": first / rate,
                "endSeconds": last / rate,
            })
            speakers[child] += 1
            variants[row["text_normalized_for_stt"]] += 1
            lists[task] += 1
        result = {
            "version": 1,
            "source": "ACAD / TalkBank (Bunton & Story); transcript: DrivenData",
            "clips": clips,
        }
        (destination / "manifest.json").write_text(
            json.dumps(result, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(f"{len(clips)} candidate clips, {len(speakers)} speakers; lists: {dict(lists)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio", type=Path, required=True)
    parser.add_argument("--mapping", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--limit", type=int, default=48, choices=range(1, 301), metavar="1-300")
    args = parser.parse_args()
    prepare(args.audio, args.mapping, args.out, args.limit)
