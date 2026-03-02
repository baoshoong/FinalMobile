# 🛒 E-Commerce Mobile App

Ứng dụng quản lý bán hàng trên di động sử dụng **React Native (Expo)** và **Firebase Firestore**.

---

## 📋 Yêu cầu hệ thống

| Phần mềm | Phiên bản | Link tải |
|----------|-----------|----------|
| Node.js | >= 20.x | [nodejs.org](https://nodejs.org/) |
| npm | >= 10.x | Đi kèm Node.js |
| Expo Go | Latest | App Store / Play Store |

---

## 🚀 Hướng dẫn cài đặt

### Bước 1: Cài đặt Node.js

#### Windows:
1. Tải Node.js LTS từ [https://nodejs.org/](https://nodejs.org/)
2. Chạy file `.msi` và làm theo hướng dẫn
3. Kiểm tra cài đặt:
```powershell
node --version
npm --version
```

#### macOS:
```bash
brew install node
```

#### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

### Bước 2: Cài đặt Expo Go trên điện thoại

| Platform | Link |
|----------|------|
| Android | [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| iOS | [App Store](https://apps.apple.com/app/expo-go/id982107779) |

---

### Bước 3: Cấu hình Firebase

#### 3.1 Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → Đặt tên project
3. Tắt Google Analytics (không cần thiết) → **Create project**

#### 3.2 Tạo Firestore Database
1. Menu trái → **Firestore Database** → **Create database**
2. Chọn **"Start in test mode"**
3. Chọn location: `asia-southeast1` (Singapore)
4. Click **Enable**

#### 3.3 Tải Service Account Key
1. Click ⚙️ (Settings) → **Project settings**
2. Tab **Service accounts** → **Generate new private key**
3. Tải file JSON về
4. **Đổi tên** thành `serviceAccountKey.json`
5. Copy vào thư mục `database/`

---

### Bước 4: Cài đặt Dependencies

#### Frontend (Expo App):
```powershell
cd FinalMobile-main
npm install
```

#### Backend (Node.js Server):
```powershell
cd database
npm install
```

---

## ▶️ Cách chạy ứng dụng

### ⚠️ QUAN TRỌNG: Cần mở 2 Terminal riêng biệt!

---

### Terminal 1: Chạy Backend Server

```powershell
cd FinalMobile-main/database
node server.js
```

**Output thành công:**
```
Server running on http://192.168.x.x:3001  (IP tự động detect)
Using Firebase Firestore as database
Static files served from: ...\database\images
```

---

### Terminal 2: Chạy Expo App

```powershell
cd FinalMobile-main
npx expo start
```

**Output thành công:**
```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ██▀▀█▀▄▀█ ▄▄▄▄▄ █
█ █   █ █  ▀█ ▀█ ██ █   █ █
...
› Metro waiting on exp://192.168.x.x:8081  (IP tự động detect)
› Scan the QR code above with Expo Go
```

---

### Kết nối điện thoại

1. **Đảm bảo điện thoại và máy tính cùng mạng WiFi**
2. Mở app **Expo Go** trên điện thoại
3. **Scan QR code** hiển thị trong Terminal
4. **Ứng dụng sẽ tự động kết nối đến server** (IP được detect tự động)

---

## 🔐 Tài khoản đăng nhập

### Tạo dữ liệu mẫu (chạy 1 lần)

Sau khi server chạy, mở Terminal mới và chạy:

```powershell
# Lấy IP từ server console và thay vào đây
$IP = "192.168.x.x"  # Xem trong console server output
Invoke-RestMethod -Uri "http://$IP:3001/seed-data" -Method POST
```

Hoặc mở browser: `http://192.168.x.x:3001/seed-data` (thay IP thực tế)

---

### Tài khoản Admin

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Email** | admin@finsl.com |
| **Role** | admin |

**Quyền hạn:**
- ✅ Quản lý sản phẩm (thêm/sửa/xóa/ẩn)
- ✅ Quản lý danh mục
- ✅ Quản lý đơn hàng
- ✅ Xem thống kê

---

### Tài khoản Customer

| Field | Value |
|-------|-------|
| **Username** | `customer1` |
| **Password** | `pass123` |
| **Email** | customer@gmail.com |
| **Role** | customer |

**Quyền hạn:**
- ✅ Xem sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng
- ✅ Xem lịch sử đơn hàng

---

## 🔧 Cấu hình tự động (Không cần thay đổi thủ công!)

✅ **Server** (`database/server.js`): Tự động detect IP từ network interface
✅ **Mobile App** (`config/api.js`): Tự động lấy IP từ Expo dev server

**Chỉ cần:**
1. Đảm bảo điện thoại và PC cùng WiFi
2. Chạy server: `node server.js`
3. Chạy Expo: `npx expo start`
4. Scan QR code - **Done!** ✨

**Nếu production APK**: Đặt biến môi trường `API_BASE_URL`

ipconfig
# Tìm dòng "IPv4 Address" trong phần "Wireless LAN adapter Wi-Fi"
```

---

## 📁 Cấu trúc dự án

```
FinalMobile-main/
├── App.js                 # Entry point
├── config/
│   └── api.js            # Cấu hình API URL
├── screens/
│   ├── Admin/            # Màn hình quản trị
│   │   ├── AdminDashboardScreen.js
│   │   ├── ProductManagementScreen.js
│   │   ├── CategoryManagementScreen.js
│   │   └── OrderManagementScreen.js
│   ├── Customer/         # Màn hình khách hàng
│   │   ├── CustomerInterfaceScreen.js
│   │   ├── CartScreen.js
│   │   └── OrderHistoryScreen.js
│   └── Auth/             # Đăng nhập/Đăng ký
│       ├── LoginScreen.js
│       └── RegisterScreen.js
├── database/             # Backend Server
│   ├── server.js         # Express + Firebase API
│   ├── firebaseConfig.js # Cấu hình Firebase
│   ├── serviceAccountKey.json # 🔒 Firebase key (không commit!)
│   └── images/           # Ảnh sản phẩm
└── package.json
```

---

## 🌐 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Thông tin server |
| POST | `/login` | Đăng nhập |
| POST | `/register` | Đăng ký |
| GET | `/categories` | Danh sách danh mục |
| GET | `/products` | Danh sách sản phẩm |
| POST | `/products` | Thêm sản phẩm |
| PUT | `/products/:id` | Cập nhật sản phẩm |
| DELETE | `/products/:id` | Xóa sản phẩm |
| GET | `/orders` | Danh sách đơn hàng |
| POST | `/orders` | Tạo đơn hàng |
| PUT | `/orders/:id/status` | Cập nhật trạng thái đơn |
| GET | `/admin/statistics` | Thống kê (Admin) |
| POST | `/seed-data` | Tạo dữ liệu mẫu |

---

## ❓ Xử lý lỗi thường gặp

### 1. "Network Error" / "Cannot connect to server"
- ✅ Kiểm tra server đang chạy (`node server.js`)
- ✅ Kiểm tra IP trong `config/api.js`
- ✅ Điện thoại và máy tính cùng WiFi

### 2. "Login failed" / Error 401
- ✅ Chạy seed-data để tạo tài khoản
- ✅ Kiểm tra username/password đúng

### 3. "Text strings must be rendered within <Text>"
- ✅ Reload app (nhấn `r` trong Expo terminal)

### 4. "Port 3001 already in use"
```powershell
# Windows - Kill process đang dùng port
Get-Process -Name node | Stop-Process -Force
```

### 5. Firebase connection error
- ✅ Kiểm tra file `serviceAccountKey.json` tồn tại
- ✅ Kiểm tra nội dung file đúng format

---

## 📱 Phím tắt Expo

| Phím | Chức năng |
|------|-----------|
| `r` | Reload app |
| `m` | Toggle menu |
| `a` | Mở Android emulator |
| `w` | Mở web browser |
| `j` | Mở debugger |

---

## 🔒 Lưu ý bảo mật

⚠️ **KHÔNG commit các file sau lên Git:**

Thêm vào `.gitignore`:
```
# Firebase
database/serviceAccountKey.json

# Node
node_modules/

# Expo
.expo/
```

---

## 👨‍💻 Tác giả

- **Project:** E-Commerce Management App
- **Database:** Firebase Firestore
- **Frontend:** React Native (Expo)
- **Backend:** Node.js + Express

---

## 📄 License

MIT License
