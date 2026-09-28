# TOPIK II Reading 20-21 Setup

Run these two SQL files in Supabase SQL Editor, in order:

1. migrations/20260929000011_topik_reading_20_21.sql
2. seed/topik_reading_20_21_seed.sql

The generated seed comes from seed/sources/TOPIK_READING_20_21_SEED_DATA.json. It keeps the source Q19/Q22 companion questions, but the learner routes target Q20 and Q21 only.

Validate before running:

    npm run validate:topik-reading-20-21
    node scripts/topikReading2021Seed.mjs

The seed is idempotent. It validates 11 memory groups, 88 idioms, priority S/A/B counts, 13 NEEDS_GLOSS entries, one NEEDS_REVIEW entry, and eight source exercise sets for both question pairs.
