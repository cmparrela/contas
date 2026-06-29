export function buildMongoUpdate(patch: Record<string, unknown>): Record<string, unknown> {
  const set: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined) unset[key] = 1;
    else set[key] = value;
  }
  const op: Record<string, unknown> = {};
  if (Object.keys(set).length) op.$set = set;
  if (Object.keys(unset).length) op.$unset = unset;
  return op;
}
