-- Bảng người dùng
CREATE TABLE Users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),  -- UUID làm khóa chính
    username VARCHAR(255) NOT NULL,           
    email VARCHAR(255) NOT NULL,             
    password VARCHAR(255) NOT NULL,      
    status INTEGER DEFAULT 1,                  -- Trạng thái của người dùng (1: Active, 0: Inactive)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng gói dịch vụ
CREATE TABLE Plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),  -- UUID làm khóa chính
    name VARCHAR(50) NOT NULL,                 -- Tên gói (ví dụ: Free Trial, Premium, Pro)
    price DECIMAL(10, 2),                      -- Giá của gói dịch vụ
    max_api_keys INT,                          -- Số lượng API keys tối đa mà gói này có thể tạo
    max_usage INT,                             -- Số lần sử dụng tối đa (dành cho gói Free Trial)
    duration INT,                              -- Thời gian sử dụng gói (tính bằng tháng)
    description TEXT,                          -- Mô tả gói dịch vụ
    status INTEGER DEFAULT 1,                  -- Trạng thái của gói (1: Active, 0: Inactive)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng liên kết người dùng với gói dịch vụ
CREATE TABLE User_Plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),  -- UUID làm khóa chính
    user_id CHAR(36),                          -- ID người dùng (UUID)
    plan_id CHAR(36),                          -- ID gói dịch vụ (UUID)
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Ngày bắt đầu sử dụng gói
    end_date TIMESTAMP,                        -- Ngày hết hạn của gói
    status INTEGER DEFAULT 1,                  -- Trạng thái gói dịch vụ (1: Active, 0: Expired)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng API keys
CREATE TABLE Api_Keys (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),  -- UUID làm khóa chính
    user_id CHAR(36),                          -- ID người dùng (UUID)
    api_key VARCHAR(255) UNIQUE NOT NULL,      -- API key (chuỗi duy nhất)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Ngày tạo API key
    last_used TIMESTAMP,                       -- Lần sử dụng cuối cùng của API key
    usage_count INT DEFAULT 0,                 -- Số lần sử dụng API key
    status INTEGER DEFAULT 1,                  -- Trạng thái của API key (1: Active, 0: Inactive)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dữ liệu mẫu cho bảng Plans
INSERT INTO Plans (name, price, max_api_keys, max_usage, duration, description)
VALUES 
('Free Trial', 0.00, 1, 100, 1, 'Gói thử nghiệm miễn phí với hạn mức sử dụng tối đa 100 lần'),
('Premium', 9.99, 5, NULL, 12, 'Gói Premium với 5 API keys và không giới hạn sử dụng'),
('Pro', 19.99, 10, NULL, 12, 'Gói Pro với 10 API keys và không giới hạn sử dụng');