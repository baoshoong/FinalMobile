const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 3001;
const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.1.5:3001';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Lấy extension từ file gốc
    const ext = path.extname(file.originalname);
    // Tạo tên file unique: timestamp + tên gốc
    const filename = Date.now() + '_' + file.originalname;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
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

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0901333127hmk',
  database: 'Finsl',
});

// Start server FIRST
const server = app.listen(PORT, () => {
  console.log(`Server running on ${API_BASE_URL}`);
  console.log('Static files served from:', path.join(__dirname, 'images'));
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Then connect to database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    console.error('Server will continue running but database operations will fail');
  } else {
    console.log('Connected to MySQL!');
  }
});

// Keep process alive
setInterval(() => {
  console.log('Server is still running...');
}, 30000);

// ============================================
// API AUTHENTICATION
// ============================================

// API đăng ký
app.post('/register', (req, res) => {
  const { username, password, email, full_name, phone, address } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Tên đăng nhập và mật khẩu là bắt buộc' });
  }
  
  // Kiểm tra username đã tồn tại chưa
  const checkQuery = 'SELECT * FROM Users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra tên đăng nhập' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    
    // Thêm user mới vào database
    const insertQuery = 'INSERT INTO Users (username, password, email, full_name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [username, password, email || null, full_name || null, phone || null, address || null, 'customer'], (err, results) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Không thể tạo tài khoản' });
      }
      
      res.status(201).json({ 
        message: 'Đăng ký thành công',
        user_id: results.insertId,
        username: username,
        role: 'customer'
      });
    });
  });
});

// API đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password }); // Debug log
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Tên đăng nhập và mật khẩu là bắt buộc' });
  }
  
  const query = 'SELECT user_id, username, email, full_name, phone, address, role FROM Users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Lỗi khi đăng nhập' });
    }
    
    console.log('Login query results:', results); // Debug log
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const user = results[0];
    console.log('Login successful for user:', user); // Debug log
    res.json({ 
      message: 'Đăng nhập thành công',
      user: user
    });
  });
});

// API test - Kiểm tra users trong database
app.get('/test/users', (req, res) => {
  const query = 'SELECT user_id, username, role, email FROM Users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách users' });
    }
    res.json({ users: results });
  });
});

// API tạo tài khoản admin (chỉ dùng 1 lần)
// app.post('/test/create-admin', (req, res) => {
//   const { username, password } = req.body;
  
//   const adminUsername = username || 'admin';
//   const adminPassword = password || 'admin123';
  
//   // Kiểm tra admin đã tồn tại chưa
//   const checkQuery = 'SELECT * FROM Users WHERE username = ?';
//   db.query(checkQuery, [adminUsername], (err, results) => {
//     if (err) {
//       console.error('Error checking admin:', err);
//       return res.status(500).json({ error: 'Lỗi khi kiểm tra admin' });
//     }
    
//     if (results.length > 0) {
//       return res.status(400).json({ error: 'Username đã tồn tại' });
//     }
    
//     // Tạo admin mới
//     const insertQuery = 'INSERT INTO Users (username, password, email, full_name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
//     db.query(insertQuery, [
//       adminUsername, 
//       adminPassword, 
//       'admin@finsl.com', 
//       'Administrator', 
//       '0123456789', 
//       'Admin Office', 
//       'admin'
//     ], (err, results) => {
//       if (err) {
//         console.error('Error creating admin:', err);
//         return res.status(500).json({ error: 'Không thể tạo admin' });
//       }
      
//       res.json({ 
//         message: 'Tạo admin thành công',
//         user: {
//           user_id: results.insertId,
//           username: adminUsername,
//           role: 'admin'
//         }
//       });
//     });
//   });
// });

// ============================================
// API UPLOAD IMAGE
// ============================================
app.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }
    
    console.log('File uploaded:', req.file.filename);
    
    // Trả về tên file đã lưu
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

app.get('/categories', (req, res) => {
  const query = 'SELECT * FROM Categories';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Thêm danh mục mới
app.post('/categories', (req, res) => {
  const { category_name, image_url } = req.body;
  
  if (!category_name) {
    return res.status(400).json({ error: 'Tên danh mục không được để trống' });
  }

  const query = 'INSERT INTO Categories (category_name, image_url) VALUES (?, ?)';
  db.query(query, [category_name, image_url || null], (err, results) => {
    if (err) {
      console.error('Error adding category:', err);
      return res.status(500).json({ error: 'Không thể thêm danh mục' });
    }
    res.status(201).json({ 
      message: 'Thêm danh mục thành công',
      category_id: results.insertId 
    });
  });
});

// Sửa danh mục
app.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { category_name, image_url } = req.body;
  
  if (!category_name) {
    return res.status(400).json({ error: 'Tên danh mục không được để trống' });
  }

  const query = 'UPDATE Categories SET category_name = ?, image_url = ? WHERE category_id = ?';
  db.query(query, [category_name, image_url, id], (err, results) => {
    if (err) {
      console.error('Error updating category:', err);
      return res.status(500).json({ error: 'Không thể cập nhật danh mục' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    res.json({ message: 'Cập nhật danh mục thành công' });
  });
});

// Xóa danh mục
app.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM Categories WHERE category_id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting category:', err);
      return res.status(500).json({ error: 'Không thể xóa danh mục' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    res.json({ message: 'Xóa danh mục thành công' });
  });
});


app.get('/products', (req, res) => {
  const showHidden = req.query.showHidden === 'true'; // Admin có thể xem tất cả
  const { search, category_id, min_price, max_price, sort_by, order } = req.query;
  
  let query = `
    SELECT 
      product_id, 
      product_name, 
      product_description, 
      price, 
      stock, 
      CONCAT('${API_BASE_URL}/images/', image_url) AS image_url, 
      category_id,
      is_hidden
    FROM Products
    WHERE 1=1
  `;
  
  const params = [];
  
  // Nếu không phải admin (showHidden = false), chỉ lấy sản phẩm chưa ẩn
  if (!showHidden) {
    query += ' AND (is_hidden = 0 OR is_hidden IS NULL)';
  }
  
  // Search by name or description
  if (search) {
    query += ' AND (product_name LIKE ? OR product_description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  // Filter by category
  if (category_id) {
    query += ' AND category_id = ?';
    params.push(category_id);
  }
  
  // Filter by price range
  if (min_price) {
    query += ' AND price >= ?';
    params.push(min_price);
  }
  if (max_price) {
    query += ' AND price <= ?';
    params.push(max_price);
  }
  
  // Sort by field
  const validSortFields = ['product_name', 'price', 'stock'];
  const validOrders = ['ASC', 'DESC'];
  
  if (sort_by && validSortFields.includes(sort_by)) {
    const sortOrder = order && validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    query += ` ORDER BY ${sort_by} ${sortOrder}`;
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});


app.post('/products', (req, res) => {
  const { product_name, product_description, price, stock, image_url, category_id } = req.body;
  const query = `
    INSERT INTO Products 
    (product_name, product_description, price, stock, image_url, category_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [product_name, product_description, price, stock, image_url, category_id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Product added successfully!');
  });
});

// API toggle visibility (ẩn/hiện sản phẩm)
app.put('/products/:id/visibility', (req, res) => {
  const { id } = req.params;
  const { is_hidden } = req.body;
  
  const query = 'UPDATE Products SET is_hidden = ? WHERE product_id = ?';
  
  db.query(query, [is_hidden, id], (err, results) => {
    if (err) {
      console.error('Error updating product visibility:', err);
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Product not found');
    }
    res.send('Product visibility updated successfully!');
  });
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { product_name, product_description, price, stock, image_url, category_id } = req.body;
  const query = `
    UPDATE Products 
    SET 
      product_name = ?, 
      product_description = ?, 
      price = ?, 
      stock = ?, 
      image_url = ?, 
      category_id = ? 
    WHERE product_id = ?
  `;
  db.query(query, [product_name, product_description, price, stock, image_url, category_id, id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.affectedRows === 0) return res.status(404).send('Product not found');
    res.send('Product updated successfully!');
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    DELETE FROM Products 
    WHERE product_id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.affectedRows === 0) return res.status(404).send('Product not found');
    res.send('Product deleted successfully!');
  });
});

// ============================================
// API ORDERS (QUẢN LÝ ĐƠN HÀNG)
// ============================================

// Tạo đơn hàng mới
app.post('/orders', (req, res) => {
  const { user_id, total_amount, customer_name, customer_phone, customer_address, notes, items } = req.body;
  
  if (!user_id || !total_amount || !customer_name || !customer_phone || !customer_address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
  }

  // Bắt đầu transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Lỗi khi tạo đơn hàng' });
    }

    // Insert vào bảng Orders
    const orderQuery = `
      INSERT INTO Orders (user_id, total_amount, customer_name, customer_phone, customer_address, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    db.query(orderQuery, [user_id, total_amount, customer_name, customer_phone, customer_address, notes || null], (err, orderResult) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error creating order:', err);
          res.status(500).json({ error: 'Không thể tạo đơn hàng' });
        });
      }

      const orderId = orderResult.insertId;

      // Insert vào bảng OrderItems
      const orderItemsQuery = `
        INSERT INTO OrderItems (order_id, product_id, product_name, product_image, quantity, price, subtotal)
        VALUES ?
      `;
      
      const orderItemsValues = items.map(item => [
        orderId,
        item.product_id,
        item.product_name,
        item.image_url,
        item.quantity,
        item.price,
        item.quantity * item.price
      ]);

      db.query(orderItemsQuery, [orderItemsValues], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error creating order items:', err);
            res.status(500).json({ error: 'Không thể tạo chi tiết đơn hàng' });
          });
        }

        // Cập nhật stock sản phẩm
        const updateStockPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            const updateQuery = 'UPDATE Products SET stock = stock - ? WHERE product_id = ?';
            db.query(updateQuery, [item.quantity, item.product_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });

        Promise.all(updateStockPromises)
          .then(() => {
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error committing transaction:', err);
                  res.status(500).json({ error: 'Không thể hoàn tất đơn hàng' });
                });
              }
              
              res.status(201).json({
                message: 'Đặt hàng thành công!',
                order_id: orderId
              });
            });
          })
          .catch((err) => {
            db.rollback(() => {
              console.error('Error updating stock:', err);
              res.status(500).json({ error: 'Không thể cập nhật tồn kho' });
            });
          });
      });
    });
  });
});

// Lấy danh sách đơn hàng (Admin - tất cả đơn, Customer - đơn của mình)
app.get('/orders', (req, res) => {
  const { user_id, role } = req.query;
  
  let query = `
    SELECT 
      o.order_id,
      o.user_id,
      o.order_date,
      o.total_amount,
      o.status,
      o.customer_name,
      o.customer_phone,
      o.customer_address,
      o.notes,
      o.updated_at,
      u.username
    FROM Orders o
    LEFT JOIN Users u ON o.user_id = u.user_id
  `;
  
  const params = [];
  
  // Nếu là customer, chỉ lấy đơn hàng của mình
  if (role !== 'admin' && user_id) {
    query += ' WHERE o.user_id = ?';
    params.push(user_id);
  }
  
  query += ' ORDER BY o.order_date DESC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Không thể tải đơn hàng' });
    }
    res.json(results);
  });
});

// Lấy chi tiết một đơn hàng
app.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  
  const orderQuery = `
    SELECT 
      o.*,
      u.username,
      u.email
    FROM Orders o
    LEFT JOIN Users u ON o.user_id = u.user_id
    WHERE o.order_id = ?
  `;
  
  const itemsQuery = `
    SELECT * FROM OrderItems
    WHERE order_id = ?
  `;
  
  db.query(orderQuery, [id], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ error: 'Không thể tải đơn hàng' });
    }
    
    if (orderResults.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    
    db.query(itemsQuery, [id], (err, itemsResults) => {
      if (err) {
        console.error('Error fetching order items:', err);
        return res.status(500).json({ error: 'Không thể tải chi tiết đơn hàng' });
      }
      
      res.json({
        order: orderResults[0],
        items: itemsResults
      });
    });
  });
});

// Cập nhật trạng thái đơn hàng (Admin)
app.put('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }
  
  const query = 'UPDATE Orders SET status = ? WHERE order_id = ?';
  
  db.query(query, [status, id], (err, results) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ error: 'Không thể cập nhật trạng thái' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    
    res.json({ message: 'Cập nhật trạng thái thành công' });
  });
});

// Hủy đơn hàng (Customer - chỉ khi status = pending)
app.put('/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  
  // Kiểm tra đơn hàng có thuộc về user này không và status = pending
  const checkQuery = 'SELECT * FROM Orders WHERE order_id = ? AND user_id = ? AND status = "pending"';
  
  db.query(checkQuery, [id, user_id], (err, results) => {
    if (err) {
      console.error('Error checking order:', err);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra đơn hàng' });
    }
    
    if (results.length === 0) {
      return res.status(403).json({ error: 'Không thể hủy đơn hàng này' });
    }
    
    const updateQuery = 'UPDATE Orders SET status = "cancelled" WHERE order_id = ?';
    
    db.query(updateQuery, [id], (err) => {
      if (err) {
        console.error('Error cancelling order:', err);
        return res.status(500).json({ error: 'Không thể hủy đơn hàng' });
      }
      
      res.json({ message: 'Hủy đơn hàng thành công' });
    });
  });
});

// Admin Statistics API
app.get('/admin/statistics', (req, res) => {
  const stats = {};
  
  // Get total products
  db.query('SELECT COUNT(*) as total_products, SUM(stock) as total_stock FROM Products WHERE (is_hidden = 0 OR is_hidden IS NULL)', (err, productStats) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.products = productStats[0];
    
    // Get total categories
    db.query('SELECT COUNT(*) as total_categories FROM Categories', (err, categoryStats) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.categories = categoryStats[0];
      
      // Get total users
      db.query('SELECT COUNT(*) as total_users, SUM(CASE WHEN role = "customer" THEN 1 ELSE 0 END) as total_customers, SUM(CASE WHEN role = "admin" THEN 1 ELSE 0 END) as total_admins FROM Users', (err, userStats) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.users = userStats[0];
        
        // Get order statistics
        db.query(`
          SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(AVG(total_amount), 0) as avg_order_value,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
            SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
          FROM Orders
        `, (err, orderStats) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.orders = orderStats[0];
          
          // Get recent orders (last 10)
          db.query(`
            SELECT o.order_id, o.order_date, o.total_amount, o.status, u.username, o.customer_name
            FROM Orders o
            LEFT JOIN Users u ON o.user_id = u.user_id
            ORDER BY o.order_date DESC
            LIMIT 10
          `, (err, recentOrders) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.recent_orders = recentOrders;
            
            // Get low stock products (stock < 10)
            db.query('SELECT product_id, product_name, stock FROM Products WHERE stock < 10 AND (is_hidden = 0 OR is_hidden IS NULL) ORDER BY stock ASC', (err, lowStock) => {
              if (err) return res.status(500).json({ error: err.message });
              stats.low_stock_products = lowStock;
              
              // Get top selling products
              db.query(`
                SELECT p.product_id, p.product_name, CONCAT('${API_BASE_URL}/images/', p.image_url) AS image_url, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as total_revenue
                FROM OrderItems oi
                JOIN Products p ON oi.product_id = p.product_id
                GROUP BY p.product_id
                ORDER BY total_sold DESC
                LIMIT 10
              `, (err, topProducts) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.top_products = topProducts || [];
                
                res.json(stats);
              });
            });
          });
        });
      });
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
