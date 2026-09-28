# TOPIK II Reading 1-4

Chạy hai file theo thứ tự trong Supabase SQL Editor:

1. `migrations/20260926000000_topik_reading_q1_4.sql`
2. `migrations/20260926000001_topik_relation_groups.sql`
3. `seed/topik_reading_q1_4_seed.sql`

## Interactive Reader

Run `migrations/20260926000002_topik_interactive_reader.sql` after the TOPIK migrations. It creates passage versioning, annotations, flashcard links, Korean analysis cache, and the reader RPCs.

If `00002` was run before this update and failed near `normalize(..., 'NFC')`, do not rerun it. Run `migrations/20260926000003_repair_interactive_reader_rpcs.sql` once to create the missing RPCs.

Deploy the analysis function after linking the project with the Supabase CLI:

```powershell
supabase functions deploy analyze-korean-selection
supabase secrets set GROQ_API_KEY=your-server-only-groq-key
supabase secrets set GROQ_KOREAN_MODEL=qwen/qwen3.8-27b
```

The Edge Function also needs the standard Supabase function secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`), which Supabase provides in deployed functions. Until the Groq key is configured, the Reader opens its manual-entry fallback and does not pretend an analysis was produced.

Migration tạo bảng, RLS, composite foreign key, RPC `topik_record_attempt` và nhóm ngữ pháp gần nghĩa. Seed được phép chạy lại; toàn bộ upsert nằm trong transaction và sẽ dừng nếu không có đúng 24 câu `FILL_GRAMMAR`, 14 câu `SIMILAR_GRAMMAR`, 38 câu tổng cộng, 152 lựa chọn, 39 nhóm gần nghĩa, 99 thành viên, hoặc một câu publish không có đúng bốn lựa chọn với một đáp án đúng.

Không chạy `supabase/schema.sql` lại trên project đã có dữ liệu. Không thêm service-role key vào `.env` frontend.
