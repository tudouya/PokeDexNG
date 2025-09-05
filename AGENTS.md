# Repository Guidelines

## Project Structure & Module Organization

- Source: `src/`
  - `app/` (Next.js routes/layouts), `components/` (UI), `hooks/`, `lib/` (db, auth, utils), `types/`.
- Database: `prisma/` (schema, migrations, `seed.ts`).
- Assets: `public/`.
- Docs: `docs/`.
- Environment: `.env*` files (see `env.example`).

## Build, Test, and Development Commands

- `pnpm dev`: Start Next.js dev server on `localhost:3000`.
- `pnpm build`: Production build (checks types as part of Next build).
- `pnpm start`: Run the built app.
- `pnpm typecheck`: TypeScript diagnostics only.
- `pnpm lint` / `pnpm lint:fix`: Lint code / fix issues, then format.
- `pnpm format`: Prettier formatting (Tailwind classes sorted).
- Database:
  - `pnpm db:generate`: Generate Prisma client.
  - `pnpm db:migrate`: Apply dev migrations.
  - `pnpm db:seed`: Seed initial data (needs `DATABASE_URL`, `ADMIN_PASSWORD`).
  - `pnpm db:studio`: Open Prisma Studio.
- Utilities: `pnpm test:auth` verifies local auth flow.

## Coding Style & Naming Conventions

- Language: TypeScript + React Server Components (Next.js App Router).
- Formatting: Prettier + `prettier-plugin-tailwindcss`; 2‑space indent; single quotes per Prettier config.
- Linting: ESLint (`eslint-config-next`). Keep `src/` warning-free.
- Filenames: kebab-case (`nav-user.tsx`, `data-table.ts`).
- Components: PascalCase exports in `src/components/`.
- Hooks: `use-*` camelCase in `src/hooks/`.

## Testing Guidelines

- No formal test runner yet. Use:
  - `pnpm typecheck` and `pnpm lint` as gates.
  - `pnpm test:auth` for auth sanity checks.
- When adding tests, place unit tests under `src/__tests__/` and prefer Vitest; UI/e2e may use Playwright.

## Commit & Pull Request Guidelines

- Commits: Conventional Commits (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `chore: ...`, `style: ...`).
- Before PR: ensure `pnpm typecheck`, `pnpm lint`, `pnpm build`, and any necessary `db:migrate`/`db:generate` pass.
- PRs must include:
  - Clear description and rationale; link related issues.
  - Screenshots/GIFs for UI changes.
  - Migration notes if Prisma schema changes (include seeding impacts).

## Security & Configuration Tips

- Copy `env.example` to `.env.local` for development.
- Required: `DATABASE_URL` (MySQL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_PASSWORD` for seeding.
- Never commit secrets. Rotate keys for production. Use `pnpm db:reset` carefully (destructive).
