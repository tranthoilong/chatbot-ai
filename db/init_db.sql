CREATE TABLE Users (
    id         UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) NOT NULL,           
    email VARCHAR(255) NOT NULL,             
    password VARCHAR(255) NOT NULL,      
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
