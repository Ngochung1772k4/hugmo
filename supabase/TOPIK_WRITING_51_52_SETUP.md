# TOPIK II Writing 51-52 Setup

Run these two SQL files in Supabase SQL Editor, in order:

1. migrations/20260929000010_topik_writing_51_52.sql
2. seed/topik_writing_51_52_seed.sql

The seed SQL is generated from seed/sources/TOPIK_Q51_Q52_SEED_DATA.json. Do not edit source answers in the generated SQL.

Before running the SQL, validate the canonical source and regenerate the seed:

    npm run validate:topik-writing
    node scripts/topikWriting5152Seed.mjs

The migration creates the schema, RLS policies, and server-side answer-checking RPC. The seed is idempotent and checks its expected content counts before it commits.
