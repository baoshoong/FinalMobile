const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db, storage, admin } = require('./firebaseConfig');

// Configuration
const PORT = process.env.PORT || 3001;
const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.1.5:3001';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Cấu hình multer để lưu file tạm
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '_' + file.originalname;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)'));
    }
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on ${API_BASE_URL}`);
  console.log('Using Firebase Firestore as database');
  console.log('Static files served from:', path.join(__dirname, 'images'));
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep process alive
setInterval(() => {
  console.log('Server is still running...');
}, 30000);

// ============================================
// ROOT ROUTE - TEST SERVER
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API Server with Firebase',
    status: 'running',
    endpoints: {
      categories: 'GET /categories',
      products: 'GET /products',
      login: 'POST /login',
      register: 'POST /register',
      orders: 'GET /orders',
      seedData: 'POST /seed-data'
    }
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Tạo ID tự động tăng cho collection
async function getNextId(collectionName) {
  const counterRef = db.collection('counters').doc(collectionName);
  const counterDoc = await counterRef.get();
  
  let nextId = 1;
  if (counterDoc.exists) {
    nextId = counterDoc.data().currentId + 1;
  }
  
  await counterRef.set({ currentId: nextId });
  return nextId;
}

// ============================================
// API AUTHENTICATION
// ============================================

// API đăng ký
app.post('/register', async (req, res) => {
  try {
    const { username, password, email, full_name, phone, address } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Tên đăng nhập và mật khẩu là bắt buộc' });
    }
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await db.collection('users')
      .where('username', '==', username)
      .get();
    
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    
    // Tạo user_id mới
    const user_id = await getNextId('users');
    
    // Thêm user mới vào Firestore
    const newUser = {
      user_id,
      username,
      password,
      email: email || null,
      full_name: full_name || null,
      phone: phone || null,
      address: address || null,
      role: 'customer',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(user_id.toString()).set(newUser);
    
    res.status(201).json({ 
      message: 'Đăng ký thành công',
      user_id: user_id,
      username: username,
      role: 'customer'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Không thể tạo tài khoản' });
  }
});

// API đăng nhập
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Tên đăng nhập và mật khẩu là bắt buộc' });
    }
    
    // Query chỉ theo username, sau đó check password
    const usersSnapshot = await db.collection('users')
      .where('username', '==', username)
      .get();
    
    if (usersSnapshot.empty) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const userData = usersSnapshot.docs[0].data();
    
    // Kiểm tra password
    if (userData.password !== password) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const user = {
      user_id: userData.user_id,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      phone: userData.phone,
      address: userData.address,
      role: userData.role
    };
    
    console.log('Login successful for user:', user);
    res.json({ 
      message: 'Đăng nhập thành công',
      user: user
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Lỗi khi đăng nhập' });
  }
});

// API test - Kiểm tra users trong database
app.get('/test/users', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        user_id: data.user_id,
        username: data.username,
        role: data.role,
        email: data.email
      };
    });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách users' });
  }
});

// ============================================
// API UPLOAD IMAGE
// ============================================
app.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }
    
    console.log('File uploaded:', req.file.filename);
    
    res.json({ 
      success: true, 
      filename: req.file.filename,
      url: `${API_BASE_URL}/images/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Lỗi khi upload ảnh: ' + error.message });
  }
});

// ============================================
// API CATEGORIES
// ============================================

app.get('/categories', async (req, res) => {
  try {
    const categoriesSnapshot = await db.collection('categories').orderBy('category_id').get();
    const categories = categoriesSnapshot.docs.map(doc => doc.data());
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Không thể tải danh mục' });
  }
});

app.post('/categories', async (req, res) => {
  try {
    const { category_name, image_url } = req.body;
    
    if (!category_name) {
      return res.status(400).json({ error: 'Tên danh mục không được để trống' });
    }

    const category_id = await getNextId('categories');
    
    const newCategory = {
      category_id,
      category_name,
      image_url: image_url || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('categories').doc(category_id.toString()).set(newCategory);
    
    res.status(201).json({ 
      message: 'Thêm danh mục thành công',
      category_id 
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Không thể thêm danh mục' });
  }
});

app.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, image_url } = req.body;
    
    if (!category_name) {
      return res.status(400).json({ error: 'Tên danh mục không được để trống' });
    }

    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();
    
    if (!categoryDoc.exists) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    
    await categoryRef.update({
      category_name,
      image_url
    });
    
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Không thể cập nhật danh mục' });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();
    
    if (!categoryDoc.exists) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    
    await categoryRef.delete();
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Không thể xóa danh mục' });
  }
});

// ============================================
// API PRODUCTS
// ============================================

app.get('/products', async (req, res) => {
  try {
    const showHidden = req.query.showHidden === 'true';
    const { search, category_id, min_price, max_price, sort_by, order } = req.query;
    
    let query = db.collection('products');
    
    // Build query
    const productsSnapshot = await query.get();
    let products = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        image_url: data.image_url ? `${API_BASE_URL}/images/${data.image_url}` : null
      };
    });
    
    // Filter hidden products
    if (!showHidden) {
      products = products.filter(p => !p.is_hidden);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.product_name.toLowerCase().includes(searchLower) ||
        (p.product_description && p.product_description.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by category
    if (category_id) {
      products = products.filter(p => p.category_id === parseInt(category_id));
    }
    
    // Filter by price range
    if (min_price) {
      products = products.filter(p => p.price >= parseFloat(min_price));
    }
    if (max_price) {
      products = products.filter(p => p.price <= parseFloat(max_price));
    }
    
    // Sort
    if (sort_by) {
      const sortOrder = order && order.toUpperCase() === 'DESC' ? -1 : 1;
      products.sort((a, b) => {
        if (a[sort_by] < b[sort_by]) return -1 * sortOrder;
        if (a[sort_by] > b[sort_by]) return 1 * sortOrder;
        return 0;
      });
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Không thể tải sản phẩm' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { product_name, product_description, price, stock, image_url, category_id } = req.body;
    
    const product_id = await getNextId('products');
    
    const newProduct = {
      product_id,
      product_name,
      product_description: product_description || null,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image_url: image_url || null,
      category_id: category_id ? parseInt(category_id) : null,
      is_hidden: false,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('products').doc(product_id.toString()).set(newProduct);
    
    res.status(201).send('Product added successfully!');
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Không thể thêm sản phẩm' });
  }
});

app.put('/products/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_hidden } = req.body;
    
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send('Product not found');
    }
    
    await productRef.update({ is_hidden });
    res.send('Product visibility updated successfully!');
  } catch (error) {
    console.error('Error updating product visibility:', error);
    res.status(500).json({ error: 'Không thể cập nhật trạng thái sản phẩm' });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_description, price, stock, image_url, category_id } = req.body;
    
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send('Product not found');
    }
    
    await productRef.update({
      product_name,
      product_description,
      price: parseFloat(price),
      stock: parseInt(stock),
      image_url,
      category_id: category_id ? parseInt(category_id) : null
    });
    
    res.send('Product updated successfully!');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Không thể cập nhật sản phẩm' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send('Product not found');
    }
    
    await productRef.delete();
    res.send('Product deleted successfully!');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Không thể xóa sản phẩm' });
  }
});

// ============================================
// API ORDERS
// ============================================

app.post('/orders', async (req, res) => {
  try {
    const { user_id, total_amount, customer_name, customer_phone, customer_address, notes, items } = req.body;
    
    if (!user_id || !total_amount || !customer_name || !customer_phone || !customer_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
    }

    const order_id = await getNextId('orders');
    
    // Tạo đơn hàng
    const newOrder = {
      order_id,
      user_id: parseInt(user_id),
      order_date: admin.firestore.FieldValue.serverTimestamp(),
      total_amount: parseFloat(total_amount),
      status: 'pending',
      customer_name,
      customer_phone,
      customer_address,
      notes: notes || null,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('orders').doc(order_id.toString()).set(newOrder);
    
    // Tạo order items
    const batch = db.batch();
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const orderItemId = `${order_id}_${i + 1}`;
      const orderItemRef = db.collection('order_items').doc(orderItemId);
      
      batch.set(orderItemRef, {
        order_item_id: orderItemId,
        order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.image_url,
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: item.quantity * parseFloat(item.price)
      });
      
      // Cập nhật stock
      const productRef = db.collection('products').doc(item.product_id.toString());
      const productDoc = await productRef.get();
      if (productDoc.exists) {
        const currentStock = productDoc.data().stock;
        batch.update(productRef, { stock: currentStock - item.quantity });
      }
    }
    
    await batch.commit();
    
    res.status(201).json({
      message: 'Đặt hàng thành công!',
      order_id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Không thể tạo đơn hàng' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const { user_id, role } = req.query;
    
    let query = db.collection('orders').orderBy('order_id', 'desc');
    
    const ordersSnapshot = await query.get();
    let orders = [];
    
    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();
      
      // Nếu là customer, chỉ lấy đơn hàng của mình
      if (role !== 'admin' && user_id && orderData.user_id !== parseInt(user_id)) {
        continue;
      }
      
      // Lấy thông tin user
      const userDoc = await db.collection('users').doc(orderData.user_id.toString()).get();
      const username = userDoc.exists ? userDoc.data().username : null;
      
      orders.push({
        ...orderData,
        username,
        order_date: orderData.order_date?.toDate?.() || orderData.order_date,
        updated_at: orderData.updated_at?.toDate?.() || orderData.updated_at
      });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Không thể tải đơn hàng' });
  }
});

app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderDoc = await db.collection('orders').doc(id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    
    const orderData = orderDoc.data();
    
    // Lấy thông tin user
    const userDoc = await db.collection('users').doc(orderData.user_id.toString()).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    // Lấy order items
    const itemsSnapshot = await db.collection('order_items')
      .where('order_id', '==', parseInt(id))
      .get();
    
    const items = itemsSnapshot.docs.map(doc => doc.data());
    
    res.json({
      order: {
        ...orderData,
        username: userData.username,
        email: userData.email,
        order_date: orderData.order_date?.toDate?.() || orderData.order_date,
        updated_at: orderData.updated_at?.toDate?.() || orderData.updated_at
      },
      items
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Không thể tải đơn hàng' });
  }
});

app.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    
    await orderRef.update({
      status,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Không thể cập nhật trạng thái' });
  }
});

app.put('/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    
    const orderData = orderDoc.data();
    
    if (orderData.user_id !== parseInt(user_id) || orderData.status !== 'pending') {
      return res.status(403).json({ error: 'Không thể hủy đơn hàng này' });
    }
    
    await orderRef.update({
      status: 'cancelled',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'Hủy đơn hàng thành công' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Không thể hủy đơn hàng' });
  }
});

// ============================================
// ADMIN STATISTICS
// ============================================

app.get('/admin/statistics', async (req, res) => {
  try {
    const stats = {};
    
    // Get products statistics
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs.map(doc => doc.data());
    const visibleProducts = products.filter(p => !p.is_hidden);
    
    stats.products = {
      total_products: visibleProducts.length,
      total_stock: visibleProducts.reduce((sum, p) => sum + (p.stock || 0), 0)
    };
    
    // Get categories statistics
    const categoriesSnapshot = await db.collection('categories').get();
    stats.categories = {
      total_categories: categoriesSnapshot.size
    };
    
    // Get users statistics
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    stats.users = {
      total_users: users.length,
      total_customers: users.filter(u => u.role === 'customer').length,
      total_admins: users.filter(u => u.role === 'admin').length
    };
    
    // Get orders statistics
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    stats.orders = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      avg_order_value: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length : 0,
      pending_orders: orders.filter(o => o.status === 'pending').length,
      processing_orders: orders.filter(o => o.status === 'processing').length,
      shipped_orders: orders.filter(o => o.status === 'shipped').length,
      delivered_orders: orders.filter(o => o.status === 'delivered').length,
      cancelled_orders: orders.filter(o => o.status === 'cancelled').length
    };
    
    // Get recent orders
    const recentOrdersSnapshot = await db.collection('orders')
      .orderBy('order_id', 'desc')
      .limit(10)
      .get();
    
    stats.recent_orders = await Promise.all(
      recentOrdersSnapshot.docs.map(async (doc) => {
        const orderData = doc.data();
        const userDoc = await db.collection('users').doc(orderData.user_id.toString()).get();
        return {
          order_id: orderData.order_id,
          order_date: orderData.order_date?.toDate?.() || orderData.order_date,
          total_amount: orderData.total_amount,
          status: orderData.status,
          username: userDoc.exists ? userDoc.data().username : null,
          customer_name: orderData.customer_name
        };
      })
    );
    
    // Get low stock products
    stats.low_stock_products = visibleProducts
      .filter(p => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .map(p => ({
        product_id: p.product_id,
        product_name: p.product_name,
        stock: p.stock
      }));
    
    // Get top selling products
    const orderItemsSnapshot = await db.collection('order_items').get();
    const orderItems = orderItemsSnapshot.docs.map(doc => doc.data());
    
    const productSales = {};
    orderItems.forEach(item => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          total_sold: 0,
          total_revenue: 0
        };
      }
      productSales[item.product_id].total_sold += item.quantity;
      productSales[item.product_id].total_revenue += item.subtotal;
    });
    
    stats.top_products = Object.values(productSales)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10)
      .map(p => {
        const product = products.find(prod => prod.product_id === p.product_id);
        return {
          ...p,
          image_url: product ? `${API_BASE_URL}/images/${product.image_url}` : null
        };
      });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Không thể tải thống kê' });
  }
});

// ============================================
// SEED DATA (Chạy 1 lần để tạo dữ liệu mẫu)
// ============================================

app.post('/seed-data', async (req, res) => {
  try {
    // Tạo Categories
    const categories = [
      { category_id: 1, category_name: 'Linh kiện điện tử', image_url: 'cat_electronic.png' },
      { category_id: 2, category_name: 'Thời trang', image_url: 'cat_fashion.png' },
      { category_id: 3, category_name: 'Truyện tranh', image_url: 'cat_manga.png' }
    ];
    
    for (const cat of categories) {
      await db.collection('categories').doc(cat.category_id.toString()).set({
        ...cat,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Tạo Products
    const products = [
      { product_id: 1, product_name: 'Module Wifi ESP8266', product_description: 'Chip Wifi IoT giá rẻ, phổ biến cho smarthome', price: 85000, stock: 100, image_url: 'ESP8266.jpg', category_id: 1 },
      { product_id: 2, product_name: 'Màn hình LCD 1602', product_description: 'Màn hình hiển thị ký tự xanh lá', price: 35000, stock: 50, image_url: 'LCD.jpg', category_id: 1 },
      { product_id: 3, product_name: 'Cảm biến mưa', product_description: 'Module cảm biến phát hiện nước mưa', price: 25000, stock: 80, image_url: 'RainSensor.jpg', category_id: 1 },
      { product_id: 4, product_name: 'Vietduino Uno', product_description: 'Mạch Arduino phiên bản Việt Nam chất lượng cao', price: 150000, stock: 20, image_url: 'Vietduino.jpg', category_id: 1 },
      { product_id: 5, product_name: 'Quần Jean Nam', product_description: 'Quần bò ống đứng, vải bền đẹp', price: 450000, stock: 30, image_url: 'Jean.jpg', category_id: 2 },
      { product_id: 6, product_name: 'Áo Sơ mi', product_description: 'Áo sơ mi công sở lịch lãm', price: 250000, stock: 40, image_url: 'Shirt.jpg', category_id: 2 },
      { product_id: 7, product_name: 'Truyện Berserk', product_description: 'Manga hành động giả tưởng đen tối kinh điển', price: 120000, stock: 15, image_url: 'Berserk.jpg', category_id: 3 },
      { product_id: 8, product_name: 'Truyện Overlord', product_description: 'Light Novel về thế giới game thực tế ảo', price: 110000, stock: 25, image_url: 'Overlord.jpg', category_id: 3 },
      { product_id: 9, product_name: 'Truyện Vinland Saga', product_description: 'Manga lịch sử về chiến binh Viking', price: 105000, stock: 20, image_url: 'Vinland.jpg', category_id: 3 }
    ];
    
    for (const prod of products) {
      await db.collection('products').doc(prod.product_id.toString()).set({
        ...prod,
        is_hidden: false,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Tạo Users
    const users = [
      { user_id: 1, username: 'admin', password: '123456', email: 'admin@finsl.com', full_name: 'Administrator', phone: '0123456789', address: 'Admin Office', role: 'admin' },
      { user_id: 2, username: 'customer1', password: 'pass123', email: 'customer@gmail.com', full_name: 'Nguyễn Văn A', phone: '0987654321', address: 'Hà Nội', role: 'customer' }
    ];
    
    for (const user of users) {
      await db.collection('users').doc(user.user_id.toString()).set({
        ...user,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Cập nhật counters
    await db.collection('counters').doc('categories').set({ currentId: 3 });
    await db.collection('counters').doc('products').set({ currentId: 9 });
    await db.collection('counters').doc('users').set({ currentId: 2 });
    await db.collection('counters').doc('orders').set({ currentId: 0 });
    
    res.json({ message: 'Seed data thành công!' });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: 'Không thể tạo dữ liệu mẫu' });
  }
});

// ============================================
// ERROR HANDLERS
// ============================================

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
