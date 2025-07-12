export function getClassName(value: any) {
  const asString = String(value);
  const validVariableNameRegex = /^class\s([A-Za-z_$][A-Za-z0-9_$]*)\s/;
  const matches = asString.match(validVariableNameRegex);

  return matches?.[1] ? matches[1] : asString;
}
