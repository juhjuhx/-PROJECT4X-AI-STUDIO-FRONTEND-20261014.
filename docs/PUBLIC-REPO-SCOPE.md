# Public Git Scope vs Private Engineering Handoff

**Public main** contains working code (`src/`, `tests/`, `scripts/`, lockfile), contemporary game rules, architecture, UI integration constraints, selected historical design decisions, sanitized agent memory and dependency license notices.

**Excluded, preserved separately:** 2026-10-14 original FULL-ENGINEERING-HANDOFF ZIP, older zipped artifacts, production screenshots with private evidence paths, full canonical game snapshots, local machine logs, absolute user paths, `dist/`, `node_modules/`, private backups and stale `*-ORIGINAL.md` fragments. The original full handoff has SHA256 `3a38615112e4f943923c3371c4e5220d60ee8f1b282876320fde3349c66aeb8f`; AI Studio ZIP has `c048fc51178a107d4683810075e5c61c7bc5b8c30864a1a4f0015ea231d9eb63`.

Older documents sometimes reference paths only present in that private archive. Such links are provenance references, **not** promises that the exact historical files are in this Git checkout. Open source candidates are reference-only unless project `package.json` or `import` proves otherwise.
