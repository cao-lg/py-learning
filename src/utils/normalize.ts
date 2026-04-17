export const normalizeOutput = (s: string): string => {
  return s
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n');
};

export const compareOutputs = (expected: string, actual: string): { matched: boolean; diff: { expected: string; actual: string }[] } => {
  const normalizedExpected = normalizeOutput(expected);
  const normalizedActual = normalizeOutput(actual);

  if (normalizedExpected === normalizedActual) {
    return { matched: true, diff: [] };
  }

  const expectedLines = normalizedExpected.split('\n');
  const actualLines = normalizedActual.split('\n');
  const diff: { expected: string; actual: string }[] = [];

  const maxLen = Math.max(expectedLines.length, actualLines.length);
  for (let i = 0; i < maxLen; i++) {
    const expLine = expectedLines[i] ?? '';
    const actLine = actualLines[i] ?? '';
    if (expLine !== actLine) {
      diff.push({ expected: expLine, actual: actLine });
    }
  }

  return { matched: false, diff };
};
