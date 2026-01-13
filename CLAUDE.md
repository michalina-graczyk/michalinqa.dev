# CLAUDE.md

## Commands

```bash
npm run dev          # Dev server at localhost:4321
npm run build        # Production build
```

## Testing

Start the dev server first, then run tests in a separate terminal:

```bash
npm run test:local
```

### Test Coverage Requirements

When making changes to the codebase, you MUST add or update tests to cover your changes:

- **UI components**: Add Playwright tests in `tests/` for any new user-facing functionality
- **Navigation changes**: Update `tests/navigation.spec.ts`
- **Content changes**: Update `tests/content.spec.ts`
- **Blog features**: Update `tests/blog.spec.ts`
- **Interactive elements**: Update `tests/button-functionality.spec.ts`

Test files use Playwright. Key patterns:
- Use `data-testid` attributes for reliable element selection
- Use `isMobile` fixture for responsive testing
- Track Mixpanel events with helpers from `tests/helpers/mixpanel.ts`
