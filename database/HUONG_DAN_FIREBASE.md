# Hướng dẫn cấu hình Firebase

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Tạo dự án"**
3. Đặt tên project (ví dụ: `finsl-ecommerce`)
4. Bật/tắt Google Analytics tùy ý
5. Click **"Create project"**

## Bước 2: Tạo Firestore Database

1. Trong Firebase Console, chọn project vừa tạo
2. Ở menu bên trái, click **"Firestore Database"**
3. Click **"Create database"**
4. Chọn **"Start in test mode"** (cho phát triển)
5. Chọn location gần nhất (ví dụ: `asia-southeast1`)
6. Click **"Enable"**

## Bước 3: Tải Service Account Key

1. Click vào **biểu tượng bánh răng** (Settings) ở menu bên trái
2. Chọn **"Project settings"**
3. Chọn tab **"Service accounts"**
4. Click **"Generate new private key"**
5. Xác nhận và tải file JSON về

## Bước 4: Cấu hình trong dự án

### Cách 1: Sử dụng file serviceAccountKey.json (Khuyến nghị)

1. Đổi tên file JSON vừa tải về thành `serviceAccountKey.json`
2. Copy file vào thư mục `database/`
3. Mở file `firebaseConfig.js` và thay đổi:

```javascript
// Bỏ comment dòng này:
const serviceAccount = require('./serviceAccountKey.json');

// Comment hoặc xóa phần cấu hình trực tiếp bên dưới
```

### Cách 2: Cấu hình trực tiếp trong code

1. Mở file JSON đã tải về
2. Copy các giá trị vào file `firebaseConfig.js`:

```javascript
const serviceAccount = {
  type: "service_account",
  project_id: "your-project-id",           // Từ file JSON
  private_key_id: "xxx",                   // Từ file JSON
  private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com",
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/..."
};
```

## Bước 5: Khởi tạo dữ liệu mẫu

Sau khi cấu hình xong, chạy server và gọi API để tạo dữ liệu mẫu:

```bash
# Chạy server
cd database
node server.js

# Trong terminal khác hoặc Postman, gọi API:
curl -X POST http://localhost:3001/seed-data
```

## Bước 6: Cấu hình Firestore Rules (Cho production)

Vào **Firestore Database > Rules** và thay đổi:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc tất cả
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Cấu trúc Collections trong Firestore

Sau khi chạy seed-data, Firestore sẽ có các collections:

```
├── categories/
│   ├── 1 (Linh kiện điện tử)
│   ├── 2 (Thời trang)
│   └── 3 (Truyện tranh)
├── products/
│   ├── 1 (Module Wifi ESP8266)
│   ├── 2 (Màn hình LCD 1602)
│   └── ...
├── users/
│   ├── 1 (admin)
│   └── 2 (customer1)
├── orders/
│   └── ... (được tạo khi đặt hàng)
├── order_items/
│   └── ... (chi tiết đơn hàng)
└── counters/
    ├── categories
    ├── products
    ├── users
    └── orders
```

## Lưu ý quan trọng

⚠️ **KHÔNG** commit file `serviceAccountKey.json` lên Git!

Thêm vào `.gitignore`:
```
serviceAccountKey.json
```

## Khởi chạy Server

```bash
cd database
npm start
# hoặc
node server.js
```

Server sẽ chạy tại: `http://localhost:3001`

## Test API

```bash
# Lấy danh sách products
curl http://localhost:3001/products

# Lấy danh sách categories
curl http://localhost:3001/categories

# Đăng nhập
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
