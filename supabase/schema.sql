-- ==============================================================================
-- QUIZLET CLONE - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Hướng dẫn: Mở Supabase Dashboard -> Vào mục SQL Editor -> Bấm "New Query" ->
-- Dán toàn bộ nội dung file này vào và bấm "Run".
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: study_sets
CREATE TABLE IF NOT EXISTS public.study_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLE: flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_set_id UUID NOT NULL REFERENCES public.study_sets(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    meaning TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLE: study_progress (Tùy chọn theo dõi tiến độ)
CREATE TABLE IF NOT EXISTS public.study_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    correct_count INT NOT NULL DEFAULT 0,
    incorrect_count INT NOT NULL DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, flashcard_id)
);

-- 6. INDEXES (Tối ưu hiệu năng truy vấn)
CREATE INDEX IF NOT EXISTS idx_study_sets_user_id ON public.study_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_study_set_id ON public.flashcards(study_set_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_id ON public.study_progress(user_id);

-- 7. FUNCTION & TRIGGER: Tự động cập nhật `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_study_sets_updated_at ON public.study_sets;
CREATE TRIGGER tr_study_sets_updated_at
    BEFORE UPDATE ON public.study_sets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_flashcards_updated_at ON public.flashcards;
CREATE TRIGGER tr_flashcards_updated_at
    BEFORE UPDATE ON public.flashcards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. FUNCTION & TRIGGER: Tự động tạo record profiles khi user đăng ký Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Bật RLS trên tất cả bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLICIES: profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- POLICIES: study_sets
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own study sets" ON public.study_sets;
CREATE POLICY "Users can view own study sets"
    ON public.study_sets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own study sets" ON public.study_sets;
CREATE POLICY "Users can insert own study sets"
    ON public.study_sets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study sets" ON public.study_sets;
CREATE POLICY "Users can update own study sets"
    ON public.study_sets FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own study sets" ON public.study_sets;
CREATE POLICY "Users can delete own study sets"
    ON public.study_sets FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- POLICIES: flashcards
-- User chỉ được xem/thêm/sửa/xóa flashcards thuộc study set của chính mình
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view flashcards in own study sets" ON public.flashcards;
CREATE POLICY "Users can view flashcards in own study sets"
    ON public.flashcards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sets
            WHERE study_sets.id = flashcards.study_set_id
            AND study_sets.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert flashcards in own study sets" ON public.flashcards;
CREATE POLICY "Users can insert flashcards in own study sets"
    ON public.flashcards FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.study_sets
            WHERE study_sets.id = flashcards.study_set_id
            AND study_sets.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update flashcards in own study sets" ON public.flashcards;
CREATE POLICY "Users can update flashcards in own study sets"
    ON public.flashcards FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sets
            WHERE study_sets.id = flashcards.study_set_id
            AND study_sets.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete flashcards in own study sets" ON public.flashcards;
CREATE POLICY "Users can delete flashcards in own study sets"
    ON public.flashcards FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.study_sets
            WHERE study_sets.id = flashcards.study_set_id
            AND study_sets.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- POLICIES: study_progress
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own study progress" ON public.study_progress;
CREATE POLICY "Users can manage own study progress"
    ON public.study_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
