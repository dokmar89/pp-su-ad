# PassProve — registration administration

A small Next.js/Supabase administration variant focused on registration handling.

**Status:** Legacy/parallel PassProve implementation retained for reference; not presented as the canonical production release.

## Scope

- Home/admin UI.
- Dedicated registrations route.
- Shared Supabase client module.

## Technology

Next.js, React, TypeScript, Tailwind CSS, Supabase.

## Architecture and source map

- `src/app/page.tsx` — entry screen
- `src/app/registrations/page.tsx` — registration UI
- `src/lib/supabase.ts` — data client

## Local development

Requires Node.js and npm. From the repository root:

```sh
npm install
npm run dev
```

Build command declared by this checkout: `npm run build`.

These are the repository scripts, not a claim of a passing build. Dependency installation, build and live integrations were not executed during the documentation review.

## Configuration and limitations

Verify Supabase authorization on the backend before using registration data. Both npm and pnpm lockfiles are present; select and validate one dependency workflow for future maintenance.

## Documentation next steps

Capture screenshots using synthetic data, document a reproducible test run, and record which integrations have been verified. Keep credentials and deployment-specific configuration outside version control.
