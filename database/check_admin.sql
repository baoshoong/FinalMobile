-- Kiểm tra và tạo tài khoản admin nếu chưa có
USE Finsl;

-- Xem tất cả users
SELECT user_id, username, role, email FROM Users;

-- Kiểm tra admin
SELECT user_id, username, password, role FROM Users WHERE role = 'admin';

-- Nếu không có admin, tạo mới (uncomment dòng dưới nếu cần)
-- INSERT INTO Users (username, password, email, full_name, phone, address, role) 
-- VALUES ('admin', 'admin123', 'admin@finsl.com', 'Administrator', '0123456789', 'Admin Office', 'admin');
