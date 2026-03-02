# 🖼️ Hướng dẫn Debug Lỗi Ảnh Sản Phẩm (Image Display Troubleshooting)

## 📋 Vấn đề: Sau khi đăng nhập, ảnh sản phẩm không hiển thị

---

## ✅ Các sửa chữa đã thực hiện:

### 1. **Server API Optimization** (`database/server.js`)
- ✅ **Helper function `getFullImageUrl()`** - chuyên xử lý image URL
  - Kiểm tra xem URL đã là full URL hay chỉ là filename
  - Tự động thêm `${API_BASE_URL}/images/` nếu cần
  - Tránh lặp URL: `http://.../images/http://...`

- ✅ **GET /products endpoint**
  - Sử dụng helper function để trả về đúng format URL
  - Đảm bảo client nhận được full URL

- ✅ **GET /orders/:id & /products/:id endpoints**
  - Cũng sử dụng helper function
  - Consistent với GET /products

### 2. **Mobile App Enhancement** (`screens/`)

#### **CustomerInterfaceScreen.js** - Danh sách sản phẩm
- ✅ Validate image URL trước render
- ✅ Fallback placeholder nếu URL không valid
- ✅ Detailed logging cho debug:
  ```
  ⏳ Loading image: [tên sản phẩm]
  ✅ Image loaded: [tên sản phẩm]
  ❌ Image load error: [tên sản phẩm] URL: [url]
  ```

#### **ProductDetailScreen.js** - Chi tiết sản phẩm
- ✅ URL validation
- ✅ Placeholder image khi URL không hợp lệ
- ✅ Detailed logging

#### **CartScreen.js** - Giỏ hàng
- ✅ URL validation
- ✅ Fallback cho ảnh không load được

---

## 🧪 Cách Debug Lỗi Ảnh:

### **Bước 1: Kiểm tra Server Logs**

Mở terminal server, bạn sẽ thấy console logs:

```
✅ File uploaded successfully:
   - Filename: 1677123456789_image.jpg
   - Size: 245678 bytes
   - URL: http://192.168.x.x:3001/images/1677123456789_image.jpg
```

### **Bước 2: Kiểm tra API Response**

**Mở Postman/Browser** và truy cập:
```
http://192.168.x.x:3001/products
```

**Tìm sản phẩm có ảnh, xem response:**
```json
{
  "product_id": 1,
  "product_name": "Sản phẩm A",
  "image_url": "http://192.168.x.x:3001/images/1677123456789_image.jpg",
  ...
}
```

**⚠️ Điều kiện image_url phải:**
- ✅ Bắt đầu bằng `http://` hoặc `https://`
- ✅ Không lặp `/images/images/...`
- ✅ URL hợp lệ và server có thể truy cập được

### **Bước 3: Test Direct Image URL**

Copy `image_url` từ API response, mở browser mới:
```
http://192.168.x.x:3001/images/1677123456789_image.jpg
```

**✅ Ảnh sẽ hiển thị** → Server phục vụ ảnh bình thường
**❌ 404 Not Found** → Ảnh không tồn tại trên server

### **Bước 4: Kiểm tra React Native Console Logs**

Khi vào app:

1. **Mở React Native debugger** (Terminal Expo)
   - hoặc nhấn `d` trong Expo CLI
   - hoặc dùng Chrome DevTools

2. **Xem Console để tìm logs:**
   ```
   📥 Fetching from: http://192.168.x.x:3001/products
   
   Rendering Product:
     - ID: 1
     - Name: Sản phẩm A
     - Image URL: http://192.168.x.x:3001/images/1677123456789_image.jpg
   
   ⏳ Loading image: Sản phẩm A
   ✅ Image loaded: Sản phẩm A
   ```
   
   **Nếu có error:**
   ```
   ❌ Image load error for Sản phẩm A
      URL: http://192.168.x.x:3001/images/1677123456789_image.jpg
      Error: [error message]
   ```

---

## 🔍 Nếu ảnh vẫn không hiển thị:

### ❌ Trường hợp 1: API trả về `image_url: null` hoặc rỗng

**Nguyên nhân:** Sản phẩm được tạo mà không upload ảnh

**Giải pháp:**
1. Xóa sản phẩm cũ
2. Tạo sản phẩm mới, **BẮT BUỘC upload ảnh**
3. Xác nhận console server hiển thị:
   ```
   ✅ File uploaded successfully:
      - Filename: [filename]
   ```

---

### ❌ Trường hợp 2: API trả về duplicated URL
```
"image_url": "http://192.168.x.x:3001/images/http://192.168.x.x:3001/images/file.jpg"
```

**Nguyên nhân:** Cách image_url được lưu bị sao

**Giải pháp:**
- ✅ **Đã sửa** - Server bây giờ check URL trước khi prefix
- Seed database lại hoặc xóa/tạo lại sản phẩm

---

### ❌ Trường hợp 3: Image URL không khớp IP hiện tại

Ví dụ: Tạo trên WiFi 192.168.1.5, nhưng chuyển sang WiFi khác

**Nguyên nhân:** IP Address thay đổi, nhưng cached URL cũ

**Giải pháp:**
1. **Restart server** → Sẽ detect IP mới
2. **Clear cache app Expo**:
   ```powershell
   npx expo start --clear
   ```
3. **Re-login vào app**

---

### ❌ Trường hợp 4: CORS hoặc Network Issue

**Console error:**
```
Network request failed
Image download error: Network timeout
```

**Giải pháp:**
1. **Kiểm tra ping đến server:**
   ```powershell
   ping 192.168.x.x
   ```

2. **Mở port 3001 trong firewall:**
   ```powershell
   # Windows Firewall - cho phép port 3001
   netsh advfirewall firewall add rule name="Allow 3001" dir=in action=allow protocol=tcp localport=3001
   ```

3. **Kiểm tra CORS headers** (DevTools Network tab):
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   ```

---

## 📊 Checklist Debug:

- [ ] **Server logs** - Hiển thị upload thành công?
- [ ] **API Response** - image_url có full URL không?
- [ ] **Browser test** - Direct URL có load được ảnh không?
- [ ] **Console logs** - React Native thấy image URL không?
- [ ] **Image file** - Tồn tại trong `database/images` folder?
- [ ] **Network access** - Điện thoại ping được server không?
- [ ] **Firewall** - Port 3001 được mở không?
- [ ] **Cache** - Đã clear Expo cache chưa?

---

## 🛠️ Reset và Test Lại:

```powershell
# 1. Dừng server Ctrl+C

# 2. Xóa database (seed lại)
# Bào console paste:
curl -X POST http://192.168.x.x:3001/seed-data

# 3. Xóa all images
Remove-Item -Path "database\images\*" -Force

# 4. Restart server
node server.js

# 5. Restart Expo
npx expo start --clear

# 6. Re-login vào app
```

---

## 📞 Nội dung log cần attach để report:

1. **Server console output** lúc tạo sản phẩm
2. **Postman response** từ `/products` endpoint
3. **React Native console logs** - Rendering Product section
4. **Network tab** - XHR request tới `/products`
5. **Error message** chính xác
6. **File size & format** của ảnh test

---

## ✨ Tóm tắt Flow:

```
User chọn ảnh
    ↓
Upload → Server lưu file + trả về filename
    ↓
Store filename vào database (image_url: "1677123456789_image.jpg")
    ↓
Client GET /products
    ↓
Server: Helper getFullImageUrl() → "http://192.168.x.x:3001/images/1677123456789_image.jpg"
    ↓
Client nhận full URL
    ↓
Image.source={{ uri: fullUrl }} → React Native loads image
    ↓
✅ Ảnh hiển thị
```

Nếu một bước bị lỗi → ảnh không hiển thị. Console logs giúp xác định bước nào lỗi!
