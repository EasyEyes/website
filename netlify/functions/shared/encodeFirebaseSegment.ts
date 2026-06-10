const ENCODING_MAP: Record<string, string> = {
  ".": "_dot_",
  "#": "_hash_",
  $: "_dollar_",
  "[": "_lbracket_",
  "]": "_rbracket_",
  "/": "_slash_",
};

const DECODING_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ENCODING_MAP).map(([k, v]) => [v, k])
);

export function encodeFirebaseSegment(segment: string): string {
  return segment.replace(/[.#$[\]/]/g, (c) => ENCODING_MAP[c]);
}

export function decodeFirebaseSegment(segment: string): string {
  return segment.replace(
    /_dot_|_hash_|_dollar_|_lbracket_|_rbracket_|_slash_/g,
    (m) => DECODING_MAP[m]
  );
}
