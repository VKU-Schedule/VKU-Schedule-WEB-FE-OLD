# Student Registration Portal

Portal đăng ký tín chỉ cho sinh viên VKU.

## Tính năng

- Đăng nhập bằng Google (email @vku.udn.vn)
- Xem danh sách lớp học phần available
- Đăng ký lớp học phần
- Xem danh sách lớp đã đăng ký
- Hủy đăng ký lớp học phần

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Tạo project trên [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Copy Firebase config vào file `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin Firebase của bạn:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

VITE_USER_API_URL=http://localhost:8081/api
VITE_DAOTAO_API_URL=http://localhost:8080/api
```

### 3. Run development server

```bash
npm run dev
```

Portal sẽ chạy tại http://localhost:5173

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Firebase Authentication
- React Router DOM
- Lucide React (icons)

## Flow

1. Sinh viên đăng nhập bằng Google (@vku.udn.vn)
2. Firebase xác thực và trả về ID Token
3. Frontend gọi User Service để verify và tạo student record
4. Sinh viên xem và đăng ký lớp học phần
5. Frontend gọi Daotao Service để thực hiện đăng ký
