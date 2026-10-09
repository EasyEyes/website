function fillNumberLength(n, length) {
  let str = n.toString();
  while (str.length < length) str = "0" + str;
  return str;
}
for (let i = 1; i <= 99; i++) {
  const name = `questionAndAnswer${fillNumberLength(i, 2)}`;
  paramReader.read(name);
}
for (let i = 1; i <= 99; i++) {
  const name = `questionAnswer${fillNumberLength(i, 2)}`;
  paramReader.read(name);
}
for (let i = 1; i <= 99; i++) {
  const unused = `questionAnswer${fillNumberLength(i, 2)}`;
}
for (let i = 1; i <= 999; i++) {
  const wrongRange = `questionAnswer${fillNumberLength(i, 2)}`;
  paramReader.read(wrongRange);
}
