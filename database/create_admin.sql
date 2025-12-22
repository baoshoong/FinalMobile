-- ============================================
-- TẠO TÀI KHOẢN ADMIN
-- ============================================

USE Finsl;

-- Xóa admin cũ nếu có (tùy chọn)
-- DELETE FROM Users WHERE username = 'admin';

-- Tạo tài khoản admin mới
INSERT INTO Users (username, password, email, full_name, phone, address, role) 
VALUES ('admin', '123456', 'admin@finsl.com', 'Administrator', '0123456789', 'Admin Office', 'admin');

-- Kiểm tra kết quả
SELECT user_id, username, role, email FROM Users WHERE role = 'admin';

SELECT 'Tạo tài khoản admin thành công!' AS Message;
