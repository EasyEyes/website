function consume(reader, name) {
  return reader.read(name);
}
function wrapper(reader, value) {
  return consume(reader, value);
}
wrapper(paramReader, "font");
wrapper(paramReader, "instructionFont");
const constantName = "fontSource";
consume(paramReader, constantName);
consume(paramReader, externalInput);
const unusedName = "conditionName";
const streamReader = { read() {} };
streamReader.read();
import { names } from "./caller-constants.js";
consume(paramReader, names.color);
