"""Build the local ACAD three-target pack from the audio and annotation archives."""

import argparse
import csv
import io
import json
import re
import wave
from collections import Counter, defaultdict
from pathlib import Path
from zipfile import ZipFile


# TalkBank ACAD task list, records 23, 24 and 26.
TARGETS = {23: "cow house owie", 24: "bike kite five", 26: "boy toy voice"}
WAV_PATH = re.compile(r"ASU-wav/(\d+)([FM])[^/]*/([^/]+)/R(\d+)\.wav", re.I)
ROW_PATH = re.compile(r"(\d+)/(\d+)_(.+)_R(\d+)\.wav", re.I)


def rows(archive, name):
    with archive.open(name) as entry, io.TextIOWrapper(entry, encoding="utf-8-sig") as text:
        return list(csv.DictReader(text))


def prepare(audio_zip, mapping_zip, transcripts_zip, out, verify_existing=False):
    with ZipFile(audio_zip) as audio, ZipFile(mapping_zip) as mapping, ZipFile(transcripts_zip) as transcripts:
        for task, words in TARGETS.items():
            template = audio.read(f"ASU-wav/0files/R{task}.cha").decode("utf-8-sig")
            target = re.findall(r"^\*CHI:\s+(.+)$", template, flags=re.M)
            if len(target) != 1 or target[0].rstrip(".").strip() != words:
                raise ValueError(f"Task {task}: archived CHAT template does not match expected targets")
        index = defaultdict(list)
        for entry in audio.infolist():
            if match := WAV_PATH.fullmatch(entry.filename):
                child, gender, session, task = match.groups()
                index[int(child), gender.upper(), session.upper(), int(task)].append(entry)
        durations = {
            row["audio_relative_path"]: float(row["recording_duration_seconds"])
            for row in rows(mapping, "ACAD_recording_manifest.csv")
        }
        candidates, rejected = [], []
        for row in rows(mapping, "ACAD_utterance_manifest.csv"):
            match = ROW_PATH.fullmatch(row["audio_relative_path"])
            if (not match or row["task"] not in {"23", "24", "26"} or
                    row["word_count"] != "3" or row["inexact_transcription"] != "False" or
                    row["jsonl_vs_chat_text"] != "match"):
                continue
            folder_child, file_child, session, task = match.groups()
            child = int(folder_child)
            uid = row["utterance_id"]
            transcript = re.fullmatch(fr"ACAD_?{child}(?:_([MF]))?_{session}_R{task}_\d+", uid, re.I)
            if (child != int(file_child) or row["task"] != task or
                    row["source_transcript_cha"] != row["audio_relative_path"][:-4] + ".cha" or not transcript):
                rejected.append((uid, "Annotation paths or task disagree"))
                continue
            entries = index[child, row["gender"][0].upper(), session.upper(), int(task)]
            if len(entries) == 1:
                if transcript[1] and transcript[1].upper() != row["gender"][0].upper():
                    rejected.append((uid, "WAV path and transcript gender marker disagree"))
                    continue
                candidates.append((row, child, session.upper(), int(task), entries[0]))

        if not verify_existing:
            out.mkdir(parents=True, exist_ok=False)
        clips, checks = [], []
        for row, child, session, task, entry in sorted(candidates, key=lambda item: item[0]["utterance_id"]):
            uid = row["utterance_id"]
            source = [
                record for line in transcripts.read(row["source_transcript_jsonl"]).splitlines()
                if line.strip() and (record := json.loads(line)).get("utterance_id") == uid
            ]
            if len(source) != 1:
                raise ValueError(f"{uid}: transcript utterance not unique")
            source = source[0]
            if (source["tier"] != "CHI" or source["inexact_transcription"] or
                    source["orthographic_text"] != row["text_human_orthographic"] or
                    source["orthographic_text_normalized"] != row["text_normalized_for_stt"] or
                    any(float(row[field]) != source[field] for field in ("start_seconds", "end_seconds"))):
                raise ValueError(f"{uid}: original transcript and mapping disagree")
            clip_id = f"acad-targets-{len(clips) + 1:04d}"
            name = clip_id + ".wav"
            start, end = float(row["start_seconds"]), float(row["end_seconds"])
            with audio.open(entry) as archive_wav, wave.open(archive_wav) as wav:
                rate, frames = wav.getframerate(), wav.getnframes()
                channels, width = wav.getnchannels(), wav.getsampwidth()
                if (rate, channels, width) != (44100, 1, 2):
                    raise ValueError(f"{uid}: unexpected WAV format")
                if abs(frames / rate - durations[row["audio_relative_path"]]) > 0.05:
                    raise ValueError(f"{uid}: archive and annotation durations differ by more than 50 ms")
                if not 0 <= start < end <= frames / rate + 0.05:
                    raise ValueError(f"{uid}: invalid annotated segment")
                first, last = round(start * rate), min(round(end * rate), frames)
                wav.setpos(first)
                pcm = wav.readframes(last - first)
                if not pcm or len(pcm) != (last - first) * channels * width:
                    raise ValueError(f"{uid}: incomplete WAV segment")
            if verify_existing:
                with wave.open(str(out / name)) as output:
                    if (output.getnchannels(), output.getsampwidth(), output.getframerate(), output.getnframes()) != (
                        channels, width, rate, last - first
                    ) or output.readframes(last - first) != pcm:
                        raise ValueError(f"{name}: local WAV is not the annotated source crop")
            else:
                with wave.open(str(out / name), "wb") as output:
                    output.setparams((channels, width, rate, 0, "NONE", "not compressed"))
                    output.writeframes(pcm)
            target = TARGETS[task]
            reference = " ".join(row["text_normalized_for_stt"].split())
            status = "matchesTargets" if reference == target else "needsReview"
            group = f"speaker-{child:02d}" if str(child) == row["child_id"] else None
            clips.append({
                "id": clip_id, "file": name, "targets": target.split(),
                "reference": source["orthographic_text"],
                "referenceStatus": status,
                **({"speakerGroup": group} if group else {}),
                "session": session, "list": str(task),
            })
            checks.append({
                "file": name, "speaker": group, "session": session,
                "archiveChildId": child, "annotationChildId": row["child_id"],
                "task": task, "sourceUtterance": uid, "wavPath": entry.filename,
                "annotationPath": row["audio_relative_path"],
                "startSeconds": first / rate, "endSeconds": last / rate,
                "targets": target, "normalizedReference": reference, "referenceStatus": status,
            })

    manifest = {"version": 1, "source": "TalkBank ACAD (Bunton & Story); human transcripts: DrivenData", "clips": clips}
    if verify_existing:
        if json.loads((out / "manifest.json").read_text(encoding="utf-8")) != manifest:
            raise ValueError("The existing manifest differs from verified sources")
        print(f"Verified {len(clips)} manifest rows and WAVs against both original archives")
        return
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (out / "source-checks.csv").open("w", encoding="utf-8-sig", newline="") as report:
        writer = csv.DictWriter(report, fieldnames=list(checks[0]))
        writer.writeheader()
        writer.writerows(checks)
    with (out / "excluded-source-rows.csv").open("w", encoding="utf-8-sig", newline="") as report:
        writer = csv.writer(report)
        writer.writerow(("sourceUtterance", "reason"))
        writer.writerows(rejected)
    print(f"{len(rejected)} path-matched rows excluded due to inconsistent source markers")
    print(f"{len(clips)} clips from {len(set(c['speakerGroup'] for c in clips if 'speakerGroup' in c))} confirmed speaker IDs")
    print(f"{sum('speakerGroup' not in c for c in clips)} clips with conflicting speaker IDs (overall only)")
    print(dict(Counter(c["list"] for c in clips)))
    print(dict(Counter(c["referenceStatus"] for c in clips)))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio", type=Path, required=True)
    parser.add_argument("--mapping", type=Path, required=True)
    parser.add_argument("--transcripts", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--verify-existing", action="store_true")
    args = parser.parse_args()
    prepare(args.audio, args.mapping, args.transcripts, args.out, args.verify_existing)
