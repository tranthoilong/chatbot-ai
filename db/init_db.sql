CREATE TABLE Users (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) NOT NULL,           
    email VARCHAR(255) NOT NULL UNIQUE,             
    password VARCHAR(255) NOT NULL,      
    status INTEGER DEFAULT 1,             
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Roles (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User_Roles (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES Users(id),
    role_id UUID NOT NULL REFERENCES Roles(id),
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE TABLE Permissions (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    permission JSON NOT NULL,
    is_full_access BOOLEAN DEFAULT FALSE,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Role_Permissions (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES Roles(id),
    permission_id UUID NOT NULL REFERENCES Permissions(id),
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Plans (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,           
    price DECIMAL(10, 2),                  
    max_api_keys INT,                       
    max_usage INT,                          
    duration INT,                           
    description TEXT,                      
    status INTEGER DEFAULT 1,               
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User_Plans (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,                  
    plan_id UUID NOT NULL,                   
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    end_date TIMESTAMP,                    
    status INTEGER DEFAULT 1,        
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Api_Keys (
     id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,                
    api_key UUID UNIQUE NOT NULL,  
    last_used TIMESTAMP,            
    usage_count INT DEFAULT 0,           
    status INTEGER DEFAULT 1,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO Plans (id,name, price, max_api_keys, max_usage, duration, description)
VALUES 
('76b5d822-c42d-4692-a296-33182642a8c9','Free Trial', 0.00, 1, 100, 1, 'Gói thử nghiệm miễn phí với hạn mức sử dụng tối đa 100 lần'),
('52bf7a93-4785-4737-ac2e-84ff0f14056d','Premium', 9.99, 5, NULL, 12, 'Gói Premium với 5 API keys và không giới hạn sử dụng'),
('d8d214f3-2778-446d-8e4c-31dc7934d91c','Pro', 19.99, 10, NULL, 12, 'Gói Pro với 10 API keys và không giới hạn sử dụng');

INSERT INTO Roles (id, name, description)
VALUES 
('2a759f6b-3aa5-47a4-8b9a-26b060bb7ff5','Admin', 'Quản trị viên'),
('4e90af5d-64d3-4c90-9f11-afb5659eecd3','User', 'Người dùng'),
('ffc88a0e-eed2-4ec9-ad53-10f3d3291348','Guest', 'Khách hàng');

INSERT INTO Permissions (id, permission, is_full_access)
VALUES 
('fb146f84-6a92-4743-b095-389c7c2d2163','{"api_keys": 1, "usage": 100}', TRUE),
('9d05a5a3-0d84-415b-8dba-73418d755fff','{"api_keys": 5, "usage": -1}', FALSE),
('d61ec64c-5dbd-4c21-a03c-0a227927b37c','{"api_keys": 10, "usage": -1}', FALSE);

INSERT INTO Role_Permissions (role_id, permission_id)
VALUES 
('2a759f6b-3aa5-47a4-8b9a-26b060bb7ff5', 'fb146f84-6a92-4743-b095-389c7c2d2163'), -- Admin gets full access permission
('4e90af5d-64d3-4c90-9f11-afb5659eecd3', '9d05a5a3-0d84-415b-8dba-73418d755fff'), -- User gets premium permission
('ffc88a0e-eed2-4ec9-ad53-10f3d3291348', 'd61ec64c-5dbd-4c21-a03c-0a227927b37c'); -- Guest gets basic permission

INSERT INTO Users (id, username, email, password)
VALUES 
('2a759f6b-3aa5-47a4-8b9a-26b060bb7ff5', 'Admin', 'admin@gmail.com', '$2b$10$rlX7tDj3lvjS7N7ws77tBesLrldHHs9SU/HYP9xfPk3yTA4FE6msK'),
('4e90af5d-64d3-4c90-9f11-afb5659eecd3', 'User', 'user@gmail.com', '$2b$10$rlX7tDj3lvjS7N7ws77tBesLrldHHs9SU/HYP9xfPk3yTA4FE6msK'),
('ffc88a0e-eed2-4ec9-ad53-10f3d3291348', 'Guest', 'guest@gmail.com', '$2b$10$rlX7tDj3lvjS7N7ws77tBesLrldHHs9SU/HYP9xfPk3yTA4FE6msK');

INSERT INTO User_Roles (user_id, role_id)
VALUES 
('2a759f6b-3aa5-47a4-8b9a-26b060bb7ff5', '2a759f6b-3aa5-47a4-8b9a-26b060bb7ff5'), -- Admin user gets Admin role
('4e90af5d-64d3-4c90-9f11-afb5659eecd3', '4e90af5d-64d3-4c90-9f11-afb5659eecd3'), -- Regular user gets User role  
('ffc88a0e-eed2-4ec9-ad53-10f3d3291348', 'ffc88a0e-eed2-4ec9-ad53-10f3d3291348'); -- Guest user gets Guest role


CREATE TABLE Chat_Id(
    id        TEXT PRIMARY KEY,
    api_key UUID NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Chat_Message(
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);