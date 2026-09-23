/**
 * Parses an Accept-Language header value into a sorted, weight-normalized
 * list of locale tags.
 *
 * The output is an array of objects with `tag` and `q` properties. Entries
 * are sorted by descending q value, with ties broken by the order of first
 * appearance in the header. Weights are normalized so that the highest q
 * present becomes 1, preserving their relative proportions.
 *
 * Wildcards (`*`) and invalid entries are skipped, because they do not
 * identify a concrete locale that a server could match against.
 *
 * @param {string} header - The raw Accept-Language header value.
 * @returns {{tag: string, q: number}[]} Normalized locale entries.
 */
export function parseAcceptLanguage(header) {
  if (typeof header !== 'string') {
    return [];
  }

  const seen = new Set();
  const entries = [];

  for (const part of header.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }

    const pieces = trimmed.split(';').map((piece) => piece.trim());
    const tag = pieces[0];

    if (!tag || tag === '*') {
      continue;
    }

    // Validate the tag roughly: letters, digits, and hyphens only.
    if (!/^[A-Za-z0-9-]+$/.test(tag)) {
      continue;
    }

    let q = 1;
    let hasQ = false;

    for (let i = 1; i < pieces.length; i += 1) {
      const match = pieces[i].match(/^q=([0-9.]+)$/i);
      if (match) {
        const parsed = Number(match[1]);
        // Reject NaN, negative, or values greater than 1.
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
          q = parsed;
          hasQ = true;
        }
      }
    }

    // Ignore entries explicitly marked as unacceptable.
    if (hasQ && q === 0) {
      continue;
    }

    const key = tag.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    entries.push({ tag, q });
  }

  if (entries.length === 0) {
    return [];
  }

  const maxQ = Math.max(...entries.map((entry) => entry.q));

  return entries
    .map((entry) => ({
      tag: entry.tag,
      q: maxQ > 0 ? entry.q / maxQ : 0,
    }))
    .sort((a, b) => b.q - a.q);
}
