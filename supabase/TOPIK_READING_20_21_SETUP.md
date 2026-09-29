# TOPIK II Reading 20-21 Setup

Run these two SQL files in Supabase SQL Editor, in order:

1. migrations/20260929000011_topik_reading_20_21.sql
2. seed/topik_reading_20_21_seed.sql
3. migrations/20260929000012_q21_editorial_glosses.sql
4. seed/topik_reading_21_editorial_glosses.sql

The generated source-book seed comes from seed/sources/TOPIK_READING_20_21_SEED_DATA.json. It keeps the source Q19/Q22 companion questions, but the learner routes target Q20 and Q21 only.

The separate Q21 editorial-gloss seed supplies reviewed learning explanations for expressions omitted from the book glossary. It never modifies meaning_vi_source.

Validate before running:

    npm run validate:topik-reading-20-21
    node scripts/topikReading2021Seed.mjs

The seed is idempotent. It validates 11 memory groups, 88 idioms, priority S/A/B counts, 13 NEEDS_GLOSS entries, one NEEDS_REVIEW entry, and eight source exercise sets for both question pairs.
