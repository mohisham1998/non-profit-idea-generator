# Clone & Run on Another PC

This repo includes `.env` so you can clone and run immediately. **Use a private GitHub repo** — `.env` contains API keys and database credentials.

## After cloning

```bash
pnpm install
docker-compose up -d postgres   # or full stack
pnpm run dev
```

## If you use a public repo

Do **not** commit `.env`. Remove it from the repo and use `.env.example` instead. On the new PC, copy `.env.example` to `.env` and add your real values.
