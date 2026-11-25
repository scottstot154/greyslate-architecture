export function evaluateEditorAccess(configuredEmail?: string, identityEmail?: string | null) {
  const expected = configuredEmail?.trim().toLowerCase();
  const actual = identityEmail?.trim().toLowerCase();
  return {
    configured: Boolean(expected),
    signedIn: Boolean(actual),
    allowed: Boolean(expected && actual && expected === actual),
  };
}
