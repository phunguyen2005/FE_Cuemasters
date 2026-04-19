# 🎱 CueMasters Frontend

Hệ thống giúp quản lý đặt bàn, thanh toán và theo dõi trạng thái bàn theo thời gian thực.

## 🚀 Công nghệ sử dụng
- **Core:** React 18 + TypeScript + Vite
- **UI:** TailwindCSS (Premium glassmorphism design)
- **Icons:** Lucide React
- **State Management:** Zustand
- **Real-time:** SignalR
- **Animation:** Tailwind CSS Animate

## 🛠 Hướng dẫn cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/phunguyen2005/FE_Cuemasters.git
   cd FE_Cuemasters
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   - Copy file `.env.example` thành `.env`:
     ```bash
     cp .env.example .env
     ```
   - Cập nhật `VITE_API_URL` trỏ về backend API của bạn.
   - Cập nhật Google OAuth:
     - `VITE_GOOGLE_CLIENT_ID`
     - `VITE_GOOGLE_REDIRECT_URI` (mặc định `http://localhost:3000/auth/google/callback`)

4. **Cấu hình Google Cloud Console:**
   - Tạo OAuth Client loại **Web application**.
   - Thêm Authorized JavaScript origins: `http://localhost:3000`
   - Thêm Authorized redirect URIs: `http://localhost:3000/auth/google/callback`

5. **Chạy ứng dụng (Development):**
   ```bash
   npm run dev
   ```

## 📂 Cấu trúc dự án
- `/src/pages/admin`: Giao diện quản trị, quản lý bàn, menu F&B, dashboard analytics.
- `/src/pages/staff`: Giao diện dành cho nhân viên tại quầy.
- `/src/components`: Các UI components dùng chung.
- `/src/stores`: Quản lý state toàn cục (Auth, Table, Booking).
