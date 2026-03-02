# 🖼️ SmartImage - Image Component không bị lỗi khi đổi mạng

## 🚀 Tính năng

✅ **Tự động cập nhật URL** khi đổi mạng WiFi/4G  
✅ **Cache hình ảnh** vào local storage  
✅ **Hoạt động offline** với cached images  
✅ **Auto retry** khi load fail (3 lần)  
✅ **Loading states** và placeholder đẹp  

## 📦 Cài đặt

Package đã được cài sẵn:
```bash
npm install expo-file-system@~18.0.8
```

## 🎯 Cách dùng

### Import:
```jsx
import SmartImage from '../../components/ImageHelper';
```

### Sử dụng:
```jsx
<SmartImage
  imageUrl={product.image_url}
  style={styles.productImage}
  productName={product.product_name}
  placeholderText="Không có ảnh"
  showLoading={true}
/>
```

## 🔧 Props

| Prop | Type | Required | Mặc định | Mô tả |
|------|------|----------|----------|-------|
| `imageUrl` | string | ✅ | - | URL hoặc filename của hình |
| `style` | object | ✅ | - | Style cho Image |
| `productName` | string | ❌ | '' | Tên (cho logging) |
| `placeholderIcon` | string | ❌ | 'image' | Icon khi không có ảnh |
| `placeholderText` | string | ❌ | 'Không có ảnh' | Text placeholder |
| `showLoading` | bool | ❌ | false | Hiển thị loading |

## 🌟 So sánh với Image thường

### ❌ Image bình thường:
```jsx
<Image
  source={{ uri: product.image_url }}
  style={styles.productImage}
  onError={handleError}
/>
// ❌ Bị lỗi khi đổi mạng
// ❌ Không cache
// ❌ Không retry
```

### ✅ SmartImage:
```jsx
<SmartImage
  imageUrl={product.image_url}
  style={styles.productImage}
  productName={product.product_name}
/>
// ✅ Tự động cập nhật URL
// ✅ Cache offline
// ✅ Auto retry
```

## 📱 Screens đã sử dụng

- ✅ CustomerInterfaceScreen - Danh sách sản phẩm
- ✅ ProductDetailScreen - Chi tiết sản phẩm
- ✅ CartScreen - Giỏ hàng
- ✅ ProductManagementScreen - Quản lý (Admin)

## 📚 Tài liệu chi tiết

Xem [IMAGE_NETWORK_FIX.md](./IMAGE_NETWORK_FIX.md) để biết thêm chi tiết.

## 🧪 Test

### Test đổi mạng:
1. Kết nối WiFi A
2. Mở app và browse sản phẩm
3. Đổi sang WiFi B hoặc 4G
4. Reload app
5. ✅ Hình vẫn hiển thị bình thường

### Test offline:
1. Browse sản phẩm (cache hình)
2. Tắt WiFi/4G
3. Browse lại
4. ✅ Hình hiển thị từ cache

## 💡 Tips

- Hình sẽ được cache tự động sau lần load đầu
- Clear cache: `FileSystem.deleteAsync(FileSystem.cacheDirectory)`
- Check logs để debug: `✅ Loaded from cache`, `🌐 Loading from network`

---

**Made with ❤️ for better mobile UX**
