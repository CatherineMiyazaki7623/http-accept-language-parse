# http-accept-language-parse

Parses an `Accept-Language` header into a sorted, weight-normalized list of locale tags.

```js
import { parseAcceptLanguage } from 'http-accept-language-parse';

const locales = parseAcceptLanguage('en-US,fr;q=0.5,de;q=0.9');
// [
//   { tag: 'en-US', q: 1 },
//   { tag: 'de', q: 0.9 },
//   { tag: 'fr', q: 0.5 }
// ]
```

The library exports a single function, `parseAcceptLanguage`.

## Why this exists

Servers often need to know which language a client prefers, but raw
`Accept-Language` headers are messy. They contain quality weights, duplicates,
and wildcards. This parser turns that into a clean, ordered list without any
dependencies.

The main trade-off is strictness. The parser accepts only tags made of
letters, digits, and hyphens, and it rejects malformed quality values. That
keeps behaviour predictable, but it means unusual but technically valid tags
are dropped.

## Awkward edge

Entries with `q=0` are removed entirely, because they explicitly indicate that
a language is not acceptable. The remaining weights are then normalized so the
highest becomes 1.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

