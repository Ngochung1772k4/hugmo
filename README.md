# Quizlet Clone - Web App Học Từ Vựng (Flashcards & Multiple Choice)

Một ứng dụng web học từ vựng hiện đại, mượt mà được xây dựng theo phong cách Quizlet MVP với **React, Vite, TypeScript, Tailwind CSS** và **Supabase** (PostgreSQL, Auth & Row Level Security).

---

## 🌟 Tính Năng Nổi Bật

1. **Quản lý Study Sets (Bộ từ vựng)**:
   - Tạo, sửa, xóa bộ từ vựng kèm danh sách thẻ từ.
   - Tìm kiếm bộ từ vựng theo tên trên Dashboard.
   - Hộp thoại xác nhận trước khi xóa (Delete Confirmation Modal).

2. **Nhập liệu siêu nhanh (Quick Add)**:
   - Dán hàng chục từ vựng cùng lúc dạng: `từ = nghĩa`, `từ : nghĩa`, `từ - nghĩa` hoặc copy trực tiếp từ Excel / Google Sheets (`từ [TAB] nghĩa`).
   - Tự động parse và hiển thị bản xem trước.
   - Cơ chế **"Save All"**: lưu toàn bộ bộ từ vựng và flashcards chỉ trong 1 lần nhấn chuột, không phải lưu từng thẻ.

3. **Chế độ Flashcard (Lật thẻ 3D)**:
   - Hiệu ứng lật 3D đẹp mắt khi click hoặc nhấn phím <kbd>Space</kbd>.
   - Hỗ trợ phím điều hướng: <kbd>&larr;</kbd> (Thẻ trước), <kbd>&rarr;</kbd> (Thẻ sau).
   - Thanh tiến độ động (`8 / 25`), tính năng xáo trộn (Shuffle) và phát âm từ vựng (Text-to-Speech).

4. **Chế độ Trắc nghiệm 4 đáp án (Multiple Choice Quiz)**:
   - Thuật toán tự động sinh 4 đáp án (1 đúng + 3 phân tâm từ các từ khác trong cùng set), đảm bảo không trùng lặp và vị trí A/B/C/D được xáo trộn ngẫu nhiên.
   - Tự động cảnh báo nếu set có ít hơn 4 từ.
   - Phản hồi Đúng/Sai tức thì (xanh lá / đỏ) cùng hiển thị đáp án đúng.
   - Màn hình tổng kết điểm số, % độ chính xác, hiệu ứng Confetti ăn mừng, và danh sách các từ trả lời sai để ôn tập lại.

5. **Bảo mật & Database**:
   - Supabase Row Level Security (RLS) bảo vệ dữ liệu ở cấp độ cơ sở dữ liệu: Người dùng A tuyệt đối không thể xem, sửa hoặc xóa dữ liệu của Người dùng B.
   - Chế độ **Demo Mode** tích hợp sẵn: Cho phép trải nghiệm toàn bộ tính năng và học thử ngay lập tức trên máy local kể cả khi chưa cấu hình Supabase.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Di chuyển vào thư mục dự án
```bash
cd C:\Users\ngoch\.gemini\antigravity-ide\scratch\quizlet-clone-web
```

### 2. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 3. Thiết lập Cơ sở dữ liệu Supabase

1. Truy cập [https://supabase.com](https://supabase.com) và tạo một tài khoản miễn phí.
2. Bấm **New project**:
   - **Name**: `quizlet-clone` (hoặc tên tùy thích).
   - **Database Password**: Đặt mật khẩu của bạn.
   - **Region**: Chọn `Singapore (ap-southeast-1)` để đạt tốc độ nhanh nhất.
3. Chạy câu lệnh tạo bảng (SQL Schema):
   - Ở menu bên trái của Supabase Dashboard, bấm vào mục **SQL Editor**.
   - Bấm **New query**.
   - Mở file `supabase/schema.sql` trong dự án này, copy toàn bộ nội dung và dán vào SQL Editor.
   - Bấm nút **Run** (màu xanh lá). Toàn bộ bảng (`profiles`, `study_sets`, `flashcards`, `study_progress`), các indexes, triggers và RLS Policies sẽ được thiết lập tự động.
4. Cấu hình xác thực Email:
   - Vào **Authentication** ➜ **Providers** ➜ **Email**.
   - Tắt mục **"Confirm email"** để khi đăng ký tài khoản mới có thể đăng nhập ngay mà không cần xác thực hộp thư.

### 4. Cấu hình biến môi trường `.env`

Tạo hoặc mở file `.env` tại thư mục gốc của dự án:
```env
VITE_SUPABASE_URL=https://vkqhspfcavyppboksrym.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
> **Cách lấy Anon Key trên Supabase**:
> Vào **Project Settings** (biểu tượng bánh răng ⚙️ ở dưới cùng bên trái) ➜ Chọn **API Keys** ➜ Tại tab **Legacy anon, service_role API keys**, bấm nút **Copy** ở dòng **`anon` `public`**.

### 5. Khởi chạy Development Server
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`).

---

## 📁 Cấu Trúc Dự Án

```text
quizlet-clone-web/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .env
├── supabase/
│   └── schema.sql              # Schema tạo bảng, RLS policies, trigger & indexes
├── src/
│   ├── types/
│   │   └── index.ts            # Định nghĩa types cho StudySet, Flashcard, Quiz
│   ├── lib/
│   │   └── supabase.ts         # Supabase client & fallback detector
│   ├── contexts/
│   │   └── AuthContext.tsx     # Supabase Auth Provider & Demo Mode
│   ├── services/
│   │   └── studySetService.ts  # Tầng dịch vụ CRUD Study Sets & Flashcards
│   ├── components/
│   │   ├── Navbar.tsx          # Thanh điều hướng với status badge & logout
│   │   ├── ProtectedRoute.tsx  # Guard bảo vệ các trang yêu cầu đăng nhập
│   │   ├── StudySetCard.tsx    # Card hiển thị bộ từ vựng trên Dashboard
│   │   ├── Flashcard.tsx       # Component lật thẻ 3D + Text-to-Speech
│   │   ├── VocabularyRow.tsx   # Dòng nhập liệu từ vựng trong form
│   │   ├── QuickAddModal.tsx   # Modal dán nhanh từ vựng số lượng lớn
│   │   ├── QuizOption.tsx      # Nút chọn đáp án trắc nghiệm A, B, C, D
│   │   ├── ProgressBar.tsx     # Thanh tiến độ animated
│   │   └── ConfirmDialog.tsx   # Modal xác nhận xóa
│   ├── pages/
│   │   ├── Login.tsx           # Trang đăng nhập
│   │   ├── Register.tsx        # Trang đăng ký
│   │   ├── Dashboard.tsx       # Trang tổng quan & tìm kiếm
│   │   ├── CreateStudySet.tsx  # Tạo bộ từ vựng mới
│   │   ├── EditStudySet.tsx    # Chỉnh sửa bộ từ vựng
│   │   ├── StudySetDetail.tsx  # Chi tiết bộ từ vựng & chọn chế độ học
│   │   ├── FlashcardMode.tsx   # Chế độ học Flashcards (phím tắt, lật 3D)
│   │   └── QuizMode.tsx        # Chế độ học trắc nghiệm 4 đáp án & kết quả
│   ├── App.tsx                 # Cấu hình routing React Router
│   ├── index.css               # Tailwind CSS & 3D card flip styles
│   └── main.tsx                # Entry point
```

---

## 🧪 Kiểm Thử (Manual Testing Flow)

1. **Đăng nhập / Đăng ký**:
   - Truy cập `/dashboard` khi chưa login ➜ Tự động redirect về `/login`.
   - Bấm "Create account" ➜ Đăng ký tài khoản mới ➜ Tự động vào Dashboard.
   - Có thể bấm nút "Explore Demo Mode" để trải nghiệm ngay với dữ liệu mẫu TOPIK.
2. **Tạo bộ từ vựng**:
   - Bấm **+ Create Study Set**.
   - Bấm **Quick Paste**, dán danh sách từ:
     ```text
     인간 = con người
     도시 = thành phố
     환경 = môi trường
     발전 = phát triển
     사회 = xã hội
     기술 = công nghệ
     ```
   - Nhấn **Import** ➜ Tất cả từ tự động điền vào các dòng.
   - Nhấn **Save All** ➜ Lưu thành công và mở trang chi tiết bộ từ vựng.
3. **Flashcard Mode**:
   - Bấm **Flashcards** ➜ Click thẻ hoặc bấm phím <kbd>Space</kbd> để lật 3D.
   - Bấm phím mũi tên <kbd>&rarr;</kbd> hoặc <kbd>&larr;</kbd> để chuyển thẻ.
4. **Multiple Choice Quiz Mode**:
   - Bấm **Multiple Choice** ➜ Trả lời các câu hỏi 4 đáp án.
   - Chọn đáp án đúng ➜ Hiển thị viền xanh lá, icon check.
   - Chọn đáp án sai ➜ Hiển thị viền đỏ và chỉ rõ đáp án đúng.
   - Hoàn thành bài thi ➜ Hiển thị điểm số, tỷ lệ % và danh sách từ sai để ôn tập lại.
5. **Xóa bộ từ vựng**:
   - Bấm nút Delete ➜ Xuất hiện modal cảnh báo: *"Are you sure you want to delete... This will permanently delete all vocabulary cards inside it."*
   - Xác nhận xóa ➜ Bộ từ vựng và flashcards được xóa an toàn.
