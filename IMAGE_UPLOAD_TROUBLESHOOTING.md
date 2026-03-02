# 🖼️ Hướng dẫn khắc phục lỗi tải ảnh (Image Upload Troubleshooting)

## ✅ Các sửa chữa đã thực hiện:

### 1. **Server Configuration** (`database/server.js`)
- ✅ Tăng dung lượng file từ 5MB → **50MB**
- ✅ Cải thiện CORS configuration cho file uploads
- ✅ Tüng dung lượng body parser từ 100KB → **50MB**
- ✅ Tìm kiếm tế file types: JPEG, PNG, GIF, WebP
- ✅ Thêm logging chi tiết cho upload errors
- ✅ Thêm health check endpoint

### 2. **Mobile App** (`screens/Admin/AddProductScreen.js` & `EditProductScreen.js`)
- ✅ Sửa MIME type detection (không còn hardcode `image/jpeg`)
- ✅ Hỗ trợ tất cả định dạng ảnh: JPG, PNG, GIF, WebP
- ✅ Thêm chi tiết logging cho upload
- ✅ Cải thiện error handling

---

## 🧪 Cách kiểm tra Image Upload:

### Bước 1: Kiểm tra Server Health Check
Mở browser hoặc Postman:
```
http://192.168.x.x:3001/health
```

Phản hồi thành công sẽ hiển thị:
```json
{
  "status": "healthy",
  "images": {
    "directory": "E:\\..\\images",
    "exists": true,
    "accessible": true,
    "fileCount": 5,
    "servedFrom": "http://192.168.x.x:3001/images/"
  }
}
```

### Bước 2: Test Upload Image (Manual - Postman/CURL)

**Postman:**
1. Tạo POST request: `http://192.168.x.x:3001/upload-image`
2. Tab "Body" → chọn "form-data"
3. Key: `image` → Type: "File" → Chọn file ảnh
4. Send

**CURL:**
```bash
curl -X POST http://192.168.x.x:3001/upload-image \
  -F "image=@C:\path\to\image.jpg"
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "filename": "1677123456789_image.jpg",
  "url": "http://192.168.x.x:3001/images/1677123456789_image.jpg",
  "size": 245678
}
```

### Bước 3: Test Image Serving
Dán URL ảnh từ bước 2 vào browser:
```
http://192.168.x.x:3001/images/1677123456789_image.jpg
```

Ảnh sẽ hiển thị nếu server đang phục vụ đúng.

---

## 🔍 Nếu vẫn có lỗi, kiểm tra:

### ❌ Lỗi: "File quá lớn"
- ✅ **Đã sửa**: Dung lượng tối đa là 50MB
- Nếu vẫn lỗi, kiểm tra file size: `file properties`

### ❌ Lỗi: "Định dạng file không hỗ trợ"
- ✅ **Đã sửa**: Hỗ trợ JPG, PNG, GIF, WebP
- Đảm bảo ảnh có đuôi đúng: `.jpg`, `.png`, `.gif`
- Không dùng `.bmp`, `.tiff`, v.v.

### ❌ Lỗi: "Không thể kết nối tới server"
- Kiểm tra: `ipconfig` - lấy IPv4 thực tế
- Đảm bảo điện thoại và PC **cùng WiFi**
- Tắt tường lửa hoặc mở port 3001
- Kiểm tra Health Check: `http://IP:3001/health`

### ❌ Lỗi: "Ảnh không hiển thị"
1. Kiểm tra folder `database/images/` tồn tại?
   ```powershell
   Test-Path "E:\workspace\Mobile\FinalMobile-main\database\images"
   ```

2. Kiểm tra permissions:
   ```powershell
   # Windows - Xem properties của folder
   icacls "E:\workspace\Mobile\FinalMobile-main\database\images"
   ```

3. Test URL trực tiếp trong browser:
   - `http://192.168.x.x:3001/images/` (xem danh sách ảnh)

---

## 📋 Server Console Logs:

Khi upload ảnh, nhìn console sẽ thấy:

**✅ Upload thành công:**
```
📤 Uploading...
✅ File uploaded successfully:
   - Filename: 1677123456789_image.jpg
   - Size: 245678 bytes
   - URL: http://192.168.x.x:3001/images/1677123456789_image.jpg
```

**❌ Upload thất bại:**
```
Multer error: File too large
Upload validation error: Only image files accepted
```

---

## 🛠️ Reset và kiểm tra lại:

```powershell
# 1. Xóa thư mục ảnh cũ
Remove-Item -Path "database\images" -Recurse -Force

# 2. Khởi động lại server
cd database
node server.js

# 3. Server sẽ tạo lại folder images
# Output: 📁 Created images directory: ...
```

---

## 🎯 Tóm tắt các thay đổi:

| Vấn đề | Trước | Sau | 
|-------|-------|-----|
| File size limit | 5 MB | 50 MB |
| MIME type | Hardcode JPEG | Auto-detect |
| Body size limit | 100 KB | 50 MB |
| File types | JPEG, PNG, GIF | JPEG, PNG, GIF, WebP |
| Error logging | Cơ bản | Chi tiết |
| Health check | ❌ | ✅ |

---

## 📞 Nếu vẫn không được, hãy attach:

1. **Server console output** (từ khi start server)
2. **Mobile console logs** (khi click upload)
3. **Network tab** (Developer Tools - xem request/response)
4. **Error message** chính xác
5. **File size & format** của ảnh test
