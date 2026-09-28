# 📦 CONTEXT HANDOFF: QUIZLET CLONE WEB APP

Tài liệu bàn giao bối cảnh dự án để tiếp tục phát triển (Dành cho AI Agent / Codex / Developer).

---

## 1. Thông Tin Chung (Project Overview)

* **Tên dự án**: `quizlet-clone-web`
* **Đường dẫn thư mục**: `C:\Users\ngoch\.gemini\antigravity-ide\scratch\quizlet-clone-web`
* **Mục tiêu**: Web app học từ vựng cá nhân theo concept Quizlet (tối giản, mượt mà, bảo mật), hỗ trợ 3 chế độ học:
  1. **Flashcards 3D** (Lật thẻ 3 chiều, phím tắt bàn phím)
  2. **Multiple Choice Quiz** (Trắc nghiệm 4 đáp án xáo trộn ngẫu nhiên)
  3. **Written Answer** (Tự nhớ và gõ từ vựng, hỗ trợ tiếng Hàn Hangul, cơ chế 3 lần thử & vòng lặp Retry từ sai)
* **Tech Stack**:
  * **Frontend**: React 18, Vite, TypeScript (Strict Mode, `verbatimModuleSyntax: true`).
  * **Styling**: Tailwind CSS + Custom 3D Card Flip & Shake animations.
  * **Icons**: `lucide-react`.
  * **Hiệu ứng**: `canvas-confetti`.
  * **Routing**: `react-router-dom` v6.
  * **Backend / Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security - RLS).

---

## 2. Trạng Thái Kết Nối Supabase & Database Schema

* **Project URL**: `https://vkqhspfcavyppboksrym.supabase.co`
* **Cấu hình `.env`**: Đã điền sẵn `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` chính xác.
* **Authentication**: Đã tắt chế độ `Confirm email` trên Supabase (user đăng ký xong là vào học ngay lập tức).
* **Database Tables (Đã chạy SQL schema và test kết nối thành công 100%)**:
  1. `public.profiles`: `id`, `user_id`, `display_name`, `created_at` (Trigger tự tạo profile khi user signup Auth).
  2. `public.study_sets`: `id`, `user_id`, `title`, `description`, `created_at`, `updated_at`.
  3. `public.flashcards`: `id`, `study_set_id`, `term`, `meaning`, `order_index`, timestamps.
  4. `public.study_progress`: `id`, `user_id`, `flashcard_id`, `correct_count`, `incorrect_count`.
  * **RLS Policies**: Đã bật trên tất cả các bảng, ràng buộc `auth.uid() = user_id`. User A không thể đọc/ghi dữ liệu của User B.
  * **File Schema**: `supabase/schema.sql`.

---

## 3. Các Tính Năng Đã Triển Khai Hoàn Chỉnh

### A. Authentication & Demo Mode
* **Routes**: `/login`, `/register`.
* **Guard**: `ProtectedRoute` tự động chuyển hướng về `/login` nếu chưa đăng nhập.
* **Demo Mode**: Có sẵn nút *"Explore Demo Mode"* cho phép trải nghiệm ngay với dữ liệu mẫu (TOPIK 3 tiếng Hàn & Oxford 3000 IT) được lưu trữ qua `localStorage` nếu chạy offline.

### B. Quản lý Study Sets & Nhập Liệu Nhanh (Dashboard & Editor)
* **Trang chính (`/dashboard`)**:
  * Liệt kê các Study Set kèm số lượng thẻ, thời gian cập nhật tương đối (`2 hours ago`, `Just now`).
  * Tìm kiếm theo tiêu đề Study Set theo thời gian thực.
  * Modal xác nhận xóa an toàn (`ConfirmDialog`).
* **Tạo & Sửa (`/study-sets/new`, `/study-sets/:id/edit`)**:
  * **Quick Add Modal**: Nhập hàng loạt từ vựng qua việc dán text (hỗ trợ `từ = nghĩa`, `từ : nghĩa`, hoặc copy trực tiếp từ Excel dạng `từ [TAB] nghĩa`).
  * **Cơ chế Save All**: Lưu toàn bộ tiêu đề, mô tả và toàn bộ thẻ chỉ trong 1 lần bấm nút duy nhất.

### C. 3 Chế Độ Học Cốt Lõi

1. **Flashcard Mode (`/study-sets/:id/flashcards`)**:
   * Card lật 3D mượt mà (`rotateY(180deg)`), hỗ trợ click hoặc phím tắt <kbd>Space</kbd>.
   * Điều hướng thẻ: Nút bấm hoặc phím <kbd>&larr;</kbd> (Previous), <kbd>&rarr;</kbd> (Next).
   * Thanh tiến độ `X / Total`, xáo trộn (Shuffle), Restart, Text-to-Speech phát âm.

2. **Multiple Choice Quiz Mode (`/study-sets/:id/quiz`)**:
   * Thuật toán tự sinh 4 đáp án: 1 đúng + 3 phân tâm lấy từ các thẻ khác cùng set (khử trùng lặp, xáo trộn đều vị trí A, B, C, D).
   * Xử lý thân thiện nếu set có ít hơn 4 từ.
   * Phản hồi tức thì: Xanh lá (đúng), Đỏ (sai + làm nổi bật đáp án đúng).
   * Màn hình kết quả: Điểm số, % Accuracy, danh sách các từ làm sai, hiệu ứng Confetti.

3. **Written Answer Mode (`/study-sets/:id/write`)**:
   * **Pre-study screen**: Cho phép chọn hướng học (`Meaning → Term` [mặc định] hoặc `Term → Meaning`).
   * **Unicode Normalization & Validation (`src/utils/answerValidation.ts`)**:
     * Sử dụng `input.trim().normalize('NFC')`.
     * Tiếng Hàn: So khớp chính xác sau chuẩn hóa NFC (không tự động sửa chính tả, không xóa khoảng trắng ở giữa từ).
     * Tiếng Anh / Latin: So khớp không phân biệt hoa thường (Case-insensitive).
   * **3-Attempts Logic**:
     * Thử tối đa 3 lần cho mỗi từ. Gõ sai lần 1, 2: Viền đỏ rung nhẹ (shake), thông báo số lần thử còn lại và giữ focus ô input để gõ lại.
     * Đúng ở lần 1, 2, hoặc 3 đều tính là `isPassed = true`.
     * Sai lần 3 hoặc bấm `Reveal Answer` (Bỏ cuộc): Hiện đáp án đúng và tính `isPassed = false`.
   * **Vòng lặp Retry Wrong Answers (Multi-Round Loop)**:
     * Kết thúc bài, nếu có từ sai, người dùng có thể bấm `Retry Wrong Answers`.
     * Chỉ những từ `isPassed === false` mới được chuyển sang Round tiếp theo.
     * Tiếp tục lặp cho đến khi người học trả lời đúng hết toàn bộ ➜ Màn hình `🎉 All words mastered!`.
   * **Phím tắt**: <kbd>Enter</kbd> để Check ➜ <kbd>Enter</kbd> để qua câu tiếp theo.

---

## 4. Cấu Trúc File & Mã Nguồn (File Tree)

```text
quizlet-clone-web/
├── index.html
├── package.json
├── tailwind.config.js          # Chứa utilities 3D flip card và keyframe animation shake
├── tsconfig.json               # TypeScript config (verbatimModuleSyntax: true)
├── vite.config.ts
├── .env                        # Chứa VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
├── HANDOFF.md                  # File tài liệu bàn giao dự án này
├── supabase/
│   └── schema.sql              # SQL Schema tạo bảng, indexes, RLS và triggers
├── src/
│   ├── types/
│   │   └── index.ts            # StudySet, Flashcard, WriteDirection, WriteAttemptRecord, QuestionStatus
│   ├── lib/
│   │   └── supabase.ts         # Supabase Client khởi tạo
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth provider (Supabase Auth + fallback Demo Mode)
│   ├── services/
│   │   └── studySetService.ts  # Tầng dịch vụ CRUD Study Sets & Flashcards (Local + Supabase)
│   ├── utils/
│   │   └── answerValidation.ts # Hàm normalizeAnswer, checkAnswer (Unicode NFC)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── StudySetCard.tsx
│   │   ├── Flashcard.tsx
│   │   ├── VocabularyRow.tsx
│   │   ├── QuickAddModal.tsx
│   │   ├── QuizOption.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── written/
│   │       ├── WrittenPreStudy.tsx   # Màn hình cấu hình chọn hướng học
│   │       ├── WrittenQuestion.tsx   # Card hiển thị từ gợi ý + Audio TTS
│   │       ├── WrittenInput.tsx      # Ô input auto-focus, Enter handler, shake animation
│   │       ├── WrittenFeedback.tsx   # Banner phản hồi 3 lần thử & Reveal answer
│   │       └── WrittenResult.tsx     # Màn hình kết quả & vòng lặp Retry Wrong Answers
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CreateStudySet.tsx
│   │   ├── EditStudySet.tsx
│   │   ├── StudySetDetail.tsx   # Hiển thị 3 chế độ học: Flashcards, Quiz, Written
│   │   ├── FlashcardMode.tsx
│   │   ├── QuizMode.tsx
│   │   └── WrittenMode.tsx      # Logic state machine vòng lặp học gõ đáp án
│   ├── App.tsx                  # Khai báo các Route
│   ├── index.css                # CSS custom 3D perspective
│   └── main.tsx
```

---

## 5. Lệnh Khởi Chạy & Kiểm Tra Mã Nguồn

* **Chạy server dev**:
  ```powershell
  cd C:\Users\ngoch\.gemini\antigravity-ide\scratch\quizlet-clone-web
  npm run dev -- --host 127.0.0.1 --port 5173
  ```
  *(Truy cập web app tại: `http://127.0.0.1:5173`)*
* **Kiểm tra TypeScript & Bundle**:
  ```powershell
  npm run build
  ```
  *(Đã kiểm tra: Build thành công 100%, 0 lỗi type).*

---

## 6. Gợi Ý Các Tính Năng Tiếp Theo (Backlog / Next Steps)

1. **Chế độ Luyện Nghe - Viết (Audio Dictation Mode)**: Chỉ phát âm thanh tiếng Hàn/Anh, yêu cầu người học gõ lại chính xác từ vựng đã nghe.
2. **Thuật toán lặp lại ngắt quãng (Spaced Repetition / Leitner)**: Tận dụng bảng `study_progress` để lưu lại số lần sai/đúng và tự động xếp lịch ôn lại sau 1, 3, 7 ngày.
3. **Gắn sao (Star) từ khó**: Đánh dấu các từ vựng cần lưu ý để lọc ra học riêng.
4. **Hỗ trợ nhiều đáp án đồng nghĩa**: Mở rộng `accepted_answers: string[]` trên DB (hàm `checkAnswerWithAlternatives` đã được viết sẵn trong `src/utils/answerValidation.ts`).
