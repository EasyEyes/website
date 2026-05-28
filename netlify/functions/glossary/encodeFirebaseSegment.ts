const ENCODING_MAP: Record<string, string> = {
  ".": "_dot_",
  "#": "_hash_",
  $: "_dollar_",
  "[": "_lbracket_",
  "]": "_rbracket_",
  "/": "_slash_",
};

export function encodeFirebaseSegment(segment: string): string {
  return segment.replace(/[.#$[\]/]/g, (c) => ENCODING_MAP[c]);
}
