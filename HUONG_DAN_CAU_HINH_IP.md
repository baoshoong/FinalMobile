# Hướng dẫn cấu hình IP cho Project

## 📱 Frontend (React Native)

### Cách thay đổi IP:

1. **Mở file config:**
   ```
   config/api.js
   ```

2. **Thay đổi IP trong file:**
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:3001';
   ```

3. **Cách lấy IP của máy tính:**
   - Mở **Command Prompt** (cmd)
   - Gõ lệnh: `ipconfig`
   - Tìm dòng **"IPv4 Address"** trong phần:
     - **WiFi adapter** (nếu dùng WiFi)
     - **Ethernet adapter** (nếu dùng dây mạng)
   - Copy địa chỉ IP (ví dụ: `192.168.1.100`)

4. **Lưu file và khởi động lại app**

---

## 🖥️ Backend (Node.js Server)

### Cách 1: Sử dụng file .env (Khuyên dùng)

1. **Tạo file `.env` trong thư mục `database/`:**
   ```bash
   cp database/.env.example database/.env
   ```

2. **Chỉnh sửa file `.env`:**
   ```env
   PORT=3001
   API_BASE_URL=http://YOUR_IP:3001
   ```

3. **Cài đặt package dotenv:**
   ```bash
   cd database
   npm install dotenv
   ```

4. **Thêm vào đầu file `server.js`:**
   ```javascript
   require('dotenv').config();
   ```

### Cách 2: Thay đổi trực tiếp trong code

1. **Mở file:**
   ```
   database/server.js
   ```

2. **Tìm dòng:**
   ```javascript
   const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.1.5:3001';
   ```

3. **Thay đổi IP mặc định:**
   ```javascript
   const API_BASE_URL = process.env.API_BASE_URL || 'http://YOUR_IP:3001';
   ```

---

## ⚠️ Lưu ý quan trọng

1. **Cùng mạng WiFi:**
   - Máy tính chạy server và điện thoại phải cùng mạng WiFi

2. **Firewall:**
   - Tắt firewall hoặc cho phép port 3001

3. **Restart:**
   - Sau khi thay đổi IP, cần restart cả:
     - Backend server (Ctrl+C và chạy lại)
     - React Native app (Reload app)

4. **Kiểm tra kết nối:**
   - Mở trình duyệt trên điện thoại
   - Truy cập: `http://YOUR_IP:3001/categories`
   - Nếu thấy dữ liệu JSON → Thành công ✅

---

## 📋 Checklist

- [ ] Đã lấy IP từ `ipconfig`
- [ ] Đã thay đổi IP trong `config/api.js`
- [ ] Đã thay đổi IP trong `database/server.js` hoặc `.env`
- [ ] Máy tính và điện thoại cùng mạng WiFi
- [ ] Đã restart backend server
- [ ] Đã reload React Native app
- [ ] Đã kiểm tra kết nối qua trình duyệt

---

## 🔍 Troubleshooting

### Lỗi: "Network Error" hoặc "Cannot connect"

**Giải pháp:**
1. Kiểm tra IP có đúng không
2. Kiểm tra server có đang chạy không
3. Kiểm tra firewall
4. Thử ping từ điện thoại: `ping YOUR_IP`

### Lỗi: "Unable to resolve host"

**Giải pháp:**
1. Đảm bảo điện thoại và máy tính cùng mạng WiFi
2. Không dùng VPN
3. Restart router nếu cần

### Lỗi: Hình ảnh không hiển thị

**Giải pháp:**
1. Kiểm tra đường dẫn ảnh trong database
2. Kiểm tra thư mục `database/images/` có ảnh không
3. Đảm bảo API_BASE_URL được sử dụng trong query SQL

---

## 🎯 Ví dụ hoàn chỉnh

**IP máy tính:** `192.168.1.100`

**File `config/api.js`:**
```javascript
const API_BASE_URL = 'http://192.168.1.100:3001';
export default API_BASE_URL;
```

**File `database/.env`:**
```env
PORT=3001
API_BASE_URL=http://192.168.1.100:3001
```

**Kiểm tra:**
- Trên trình duyệt điện thoại: `http://192.168.1.100:3001/categories`
- Kết quả: Hiển thị danh sách categories dạng JSON ✅
