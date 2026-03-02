# 🌐 Giải pháp Hình ảnh Không Bị Lỗi Khi Đổi Mạng

## 📋 Vấn đề đã giải quyết

**Trước đây**: Khi đổi mạng WiFi/4G, hình ảnh không hiển thị vì URL có IP cố định
```
❌ http://192.168.1.100:3001/images/product.jpg (IP cũ - không hoạt động)
```

**Bây giờ**: Hình ảnh tự động cập nhật URL theo mạng hiện tại + cache offline
```
✅ Tự động build: http://192.168.2.50:3001/images/product.jpg (IP mới)
✅ Load từ cache nếu đã tải trước đó
✅ Retry tự động nếu fail
✅ Placeholder đẹp khi không có ảnh
```

---

## 🎯 Các tính năng chính

### 1. **SmartImage Component** (`components/ImageHelper.js`)

Component thông minh xử lý hình ảnh:

- ✅ **Dynamic URL Building**: Tự động xây dựng URL từ `API_BASE_URL` hiện tại
- ✅ **Image Caching**: Lưu cache vào local storage, dùng offline
- ✅ **Auto Retry**: Tự động retry tối đa 3 lần khi load fail
- ✅ **Fallback Placeholder**: Hiển thị icon đẹp khi không có ảnh
- ✅ **Loading State**: Hiển thị loading indicator (optional)

### 2. **Server Optimization** (`database/server.js`)

Server chỉ lưu **filename** thay vì full URL:

```javascript
// ✅ Lưu trong database:
{
  "image_url": "1709123456789_product.jpg"  // Chỉ filename
}

// ❌ KHÔNG lưu full URL:
{
  "image_url": "http://192.168.1.100:3001/images/..." // Sẽ hỏng khi đổi mạng
}
```

### 3. **Auto Network Detection** (`config/api.js`)

API_BASE_URL tự động cập nhật theo IP hiện tại từ Expo dev server

---

## 🚀 Cách sử dụng SmartImage

### Ví dụ cơ bản:

```jsx
import SmartImage from '../../components/ImageHelper';

<SmartImage
  imageUrl={product.image_url}  // Chỉ cần truyền filename hoặc old URL
  style={styles.productImage}
  productName={product.product_name}  // Cho logging
  placeholderIcon="image"  // Icon hiển thị khi không có ảnh
  placeholderText="Không có ảnh"
  showLoading={true}  // Hiển thị loading spinner
/>
```

### Props:

| Prop | Type | Required | Default | Mô tả |
|------|------|----------|---------|-------|
| `imageUrl` | string | ✅ | - | URL hoặc filename của hình |
| `style` | object | ✅ | - | Style cho Image component |
| `productName` | string | ❌ | '' | Tên sản phẩm (cho logging) |
| `placeholderIcon` | string | ❌ | 'image' | Icon FontAwesome5 |
| `placeholderText` | string | ❌ | 'Không có ảnh' | Text hiển thị |
| `showLoading` | bool | ❌ | false | Hiển thị loading |

---

## 🔧 Các thay đổi đã thực hiện

### 1. ✅ Component mới

- Tạo `components/ImageHelper.js` - SmartImage component
- Install package: `expo-file-system@~18.0.8`

### 2. ✅ Screens đã cập nhật

Tất cả screens đã dùng SmartImage thay cho Image:

- ✅ `screens/Customer/CustomerInterfaceScreen.js` - Danh sách sản phẩm
- ✅ `screens/Customer/ProductDetailScreen.js` - Chi tiết sản phẩm  
- ✅ `screens/Customer/CartScreen.js` - Giỏ hàng
- ✅ `screens/Admin/ProductManagementScreen.js` - Quản lý sản phẩm

### 3. ✅ Server cập nhật

**File**: `database/server.js`

```javascript
// Helper function - chỉ trả về filename
function getFullImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  // Extract filename từ old URLs
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    const filename = imageUrl.split('/images/').pop();
    if (filename && !filename.includes('http')) {
      return filename;
    }
  }
  
  return imageUrl; // Trả về filename
}

// Upload endpoint - chỉ trả về filename
app.post('/upload-image', (req, res) => {
  res.json({ 
    success: true, 
    filename: filename,  // ✅ Chỉ filename
    size: req.file.size
    // ❌ KHÔNG có url property
  });
});
```

---

## 📱 Flow hoạt động

### Upload hình mới:

```
1. Admin chọn image
2. Upload lên server
3. Server lưu file vào /images/ folder
4. Server trả về: { filename: "123_product.jpg" }
5. Lưu vào database: image_url = "123_product.jpg"
```

### Hiển thị hình:

```
1. Client nhận: image_url = "123_product.jpg"
2. SmartImage check cache local
   ├─ Có cache → Load từ cache (✅ offline)
   └─ Không cache → Continue
3. SmartImage build URL: API_BASE_URL + "/images/" + filename
   → http://192.168.x.x:3001/images/123_product.jpg
4. Load hình từ network
5. Auto cache về local cho lần sau
6. Nếu failed → Retry 3 lần → Hiển thị placeholder
```

### Khi đổi mạng:

```
1. API_BASE_URL tự động cập nhật (từ Expo debuggerHost)
   Old: http://192.168.1.100:3001
   New: http://192.168.2.50:3001
   
2. SmartImage tự động build lại URL mới
   Old: http://192.168.1.100:3001/images/product.jpg
   New: http://192.168.2.50:3001/images/product.jpg ✅
   
3. Nếu đã cache → Dùng cache (không cần network)
4. Nếu chưa cache → Load từ server với IP mới
```

---

## 🧪 Cách kiểm tra

### Test 1: Upload hình mới

```bash
# 1. Start server
cd database
node server.js

# 2. Mở Postman/Browser
POST http://YOUR_IP:3001/upload-image
Form-data: image = [chọn file]

# 3. Kiểm tra response - Chỉ có filename
{
  "success": true,
  "filename": "1709123456789_test.jpg",
  "size": 123456
}
```

### Test 2: Đổi mạng

```bash
# 1. Kết nối WiFi A
# 2. Mở app và xem sản phẩm có hình
# 3. Đổi sang WiFi B hoặc 4G
# 4. Force reload app hoặc navigate lại
# 5. Hình vẫn hiển thị bình thường ✅

# Kiểm tra console logs:
# - ✅ Loaded from cache: [product name]
# - 🌐 Loading from network: [product name]
# - 💾 Cached successfully: [product name]
```

### Test 3: Offline mode

```bash
# 1. Mở app khi có internet
# 2. Browse qua các sản phẩm (để cache hình)
# 3. Tắt WiFi/4G
# 4. Browse lại các sản phẩm đã xem
# 5. Hình vẫn hiển thị từ cache ✅
```

---

## 📊 Console Logs

SmartImage có logging chi tiết:

```
✅ Loaded from cache: Module Wifi ESP8266
🌐 Loading from network: Màn hình LCD 1602 http://192.168.x.x:3001/images/LCD.jpg
💾 Cached successfully: Màn hình LCD 1602
⚠️  Cache failed (still showing image): Network error
🔄 Retry 1/3: Cảm biến mưa
❌ Image render error: Sản phẩm không tồn tại
```

---

## ⚙️ Configuration

### Thay đổi số lần retry:

File: `components/ImageHelper.js`

```javascript
// Line ~145: Thay đổi maxRetries
const handleRetry = () => {
  if (imageState.retryCount < 3) {  // ← Thay đổi số này
    // ...
  }
};
```

### Thay đổi cache directory:

```javascript
// Line ~50
const getCacheKey = (url) => {
  if (!url) return null;
  const filename = url.split('/').pop();
  return `${FileSystem.cacheDirectory}${filename}`;  // ← Thay đổi path
};
```

### Clear cache:

```javascript
import * as FileSystem from 'expo-file-system';

// Clear tất cả cache
await FileSystem.deleteAsync(FileSystem.cacheDirectory, { idempotent: true });

// Clear một file cụ thể
await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}product.jpg`);
```

---

## 🎉 Kết quả

### ✅ Ưu điểm:

1. **Không bị lỗi khi đổi mạng** - URL tự động cập nhật
2. **Hoạt động offline** - Cache local storage
3. **Performance tốt hơn** - Load từ cache nhanh
4. **User experience tốt** - Loading states, placeholders đẹp
5. **Auto retry** - Tự động thử lại khi network unstable
6. **Easy maintenance** - Chỉ cần dùng SmartImage thay Image

### ⚠️ Lưu ý:

1. **Expo Go required** - Cần Expo environment để auto-detect IP
2. **Cache storage** - Hình cached sẽ chiếm storage, có thể cần clear định kỳ
3. **First load** - Lần đầu vẫn cần internet để download
4. **Server must be same network** - Dev server phải cùng mạng với device

---

## 📚 Tài liệu tham khảo

- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [React Native Image](https://reactnative.dev/docs/image)
- [FontAwesome5 Icons](https://fontawesome.com/v5/search)

---

## 🤝 Migration từ code cũ

Nếu có code cũ dùng `<Image>`:

### Before:
```jsx
<Image
  source={{ uri: product.image_url }}
  style={styles.productImage}
  onError={(e) => console.error('Error:', e)}
/>
```

### After:
```jsx
import SmartImage from '../../components/ImageHelper';

<SmartImage
  imageUrl={product.image_url}
  style={styles.productImage}
  productName={product.product_name}
/>
```

**Chỉ cần thay đổi:**
1. Import SmartImage
2. Thay `<Image>` → `<SmartImage>`
3. Thay `source={{ uri: ... }}` → `imageUrl={...}`
4. Xóa styles của placeholder (SmartImage tự xử lý)

---

## ✨ Tóm tắt

- ✅ **100% fix lỗi đổi mạng**
- ✅ **Offline support với cache**
- ✅ **Auto retry và error handling**
- ✅ **Dễ sử dụng như Image bình thường**
- ✅ **Không cần config thêm gì**

**Chỉ cần dùng SmartImage thay cho Image component là xong!** 🎉
