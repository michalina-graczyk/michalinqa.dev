# Agent Instructions

See [CONTEXT.md](./CONTEXT.md) for role and style guidelines.

## Commands

```bash
npm run dev          # Dev server at localhost:4321
npm run build        # Production build
npm run lint         # Check formatting
npm run lint:fix     # Auto-fix formatting
```

## Testing

Start the dev server first, then run tests in a separate terminal:

```bash
npm run test:local
```

When making changes, add or update tests in `tests/` to cover your changes.

## Writing style

English prose — docs, code comments, commit and PR text, issues, user-visible strings —
follows [Simplified Technical English](https://www.asd-ste100.org/) (ASD-STE100): one
meaning per word, active voice, imperative for instructions, simple tenses, one
instruction per sentence (max 20 words), no jargon or metaphor. Code identifiers are exempt.
