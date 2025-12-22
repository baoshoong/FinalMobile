-- ============================================
-- SCRIPT THIẾT LẬP DATABASE HOÀN CHỈNH
-- Bao gồm cả tạo mới và update database hiện có
-- ============================================

-- Tắt chế độ an toàn
SET SQL_SAFE_UPDATES = 0;

-- ============================================
-- PHẦN 1: TẠO DATABASE VÀ CÁC BẢNG
-- ============================================

CREATE DATABASE IF NOT EXISTS Finsl;
USE Finsl;

-- Xóa các bảng cũ nếu muốn tạo lại từ đầu (BỎ COMMENT NẾU CẦN)
-- DROP TABLE IF EXISTS Products;
-- DROP TABLE IF EXISTS Categories;
-- DROP TABLE IF EXISTS Users;

-- Tạo bảng Categories
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Products
CREATE TABLE IF NOT EXISTS Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
);

-- Tạo bảng Users
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Orders
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tạo bảng OrderItems
CREATE TABLE IF NOT EXISTS OrderItems (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(255),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE RESTRICT
);

-- Thêm index để tăng hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON Orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON Orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON Orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON OrderItems(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON OrderItems(product_id);

-- ============================================
-- PHẦN 2: THÊM CỘT IS_HIDDEN (NẾU CHƯA CÓ)
-- ============================================

-- Kiểm tra và thêm cột is_hidden vào bảng Products
ALTER TABLE Products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Cập nhật giá trị mặc định cho các sản phẩm hiện có
UPDATE Products SET is_hidden = FALSE WHERE is_hidden IS NULL;

-- ============================================
-- PHẦN 3: XÓA DỮ LIỆU CŨ (NẾU CẦN TẠO LẠI)
-- Bỏ comment các dòng dưới nếu muốn xóa dữ liệu cũ
-- ============================================

-- DELETE FROM Products;
-- DELETE FROM Categories;
-- DELETE FROM Users;
-- ALTER TABLE Products AUTO_INCREMENT = 1;
-- ALTER TABLE Categories AUTO_INCREMENT = 1;
-- ALTER TABLE Users AUTO_INCREMENT = 1;

-- ============================================
-- PHẦN 4: THÊM DỮ LIỆU MẪU
-- Chỉ chạy nếu bảng đang trống
-- ============================================

-- Thêm Categories (chỉ nếu chưa có)
INSERT IGNORE INTO Categories (category_id, category_name, image_url) VALUES 
(1, 'Linh kiện điện tử', 'cat_electronic.png'),
(2, 'Thời trang', 'cat_fashion.png'),
(3, 'Truyện tranh', 'cat_manga.png');

-- Thêm Products (chỉ nếu chưa có)
INSERT IGNORE INTO Products (product_id, product_name, product_description, price, stock, image_url, category_id, is_hidden) VALUES 
-- Nhóm Điện tử (Category ID = 1)
(1, 'Module Wifi ESP8266', 'Chip Wifi IoT giá rẻ, phổ biến cho smarthome', 85000, 100, 'ESP8266.jpg', 1, FALSE),
(2, 'Màn hình LCD 1602', 'Màn hình hiển thị ký tự xanh lá', 35000, 50, 'LCD.jpg', 1, FALSE),
(3, 'Cảm biến mưa', 'Module cảm biến phát hiện nước mưa', 25000, 80, 'RainSensor.jpg', 1, FALSE),
(4, 'Vietduino Uno', 'Mạch Arduino phiên bản Việt Nam chất lượng cao', 150000, 20, 'Vietduino.jpg', 1, FALSE),

-- Nhóm Thời trang (Category ID = 2)
(5, 'Quần Jean Nam', 'Quần bò ống đứng, vải bền đẹp', 450000, 30, 'Jean.jpg', 2, FALSE),
(6, 'Áo Sơ mi', 'Áo sơ mi công sở lịch lãm', 250000, 40, 'Shirt.jpg', 2, FALSE),

-- Nhóm Truyện tranh (Category ID = 3)
(7, 'Truyện Berserk', 'Manga hành động giả tưởng đen tối kinh điển', 120000, 15, 'Berserk.jpg', 3, FALSE),
(8, 'Truyện Overlord', 'Light Novel về thế giới game thực tế ảo', 110000, 25, 'Overlord.jpg', 3, FALSE),
(9, 'Truyện Vinland Saga', 'Manga lịch sử về chiến binh Viking', 105000, 20, 'Vinland.jpg', 3, FALSE);

-- Thêm Users mẫu (chỉ nếu chưa có)
INSERT IGNORE INTO Users (user_id, username, password, email, full_name, phone, address, role) VALUES 
(1, 'admin', 'admin123', 'admin@finsl.com', 'Administrator', '0123456789', 'Admin Office', 'admin'),
(2, 'customer1', 'pass123', 'customer@gmail.com', 'Nguyễn Văn A', '0987654321', 'Hà Nội', 'customer');

-- Bật lại chế độ an toàn
SET SQL_SAFE_UPDATES = 1;

-- ============================================
-- PHẦN 5: KIỂM TRA KẾT QUẢ
-- ============================================

SELECT '=== BẢNG CATEGORIES ===' AS Info;
SELECT * FROM Categories;

SELECT '=== BẢNG PRODUCTS ===' AS Info;
SELECT product_id, product_name, price, stock, is_hidden, category_id FROM Products;

SELECT '=== BẢNG USERS ===' AS Info;
SELECT user_id, username, role FROM Users;

SELECT '=== CẤU TRÚC BẢNG PRODUCTS ===' AS Info;
DESCRIBE Products;

-- KẾT THÚC SCRIPT
