-- 予約システム データベース初期化スクリプト
-- MySQL用

-- データベース作成（必要に応じて）
-- CREATE DATABASE reservation_system;
-- USE reservation_system;

-- coursesテーブル
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT '所要時間（分）',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- slotsテーブル
CREATE TABLE slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    capacity INT NOT NULL COMMENT '最大人数',
    reserved_count INT DEFAULT 0 COMMENT '現在予約人数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_slot (date, time)
);

-- customersテーブル
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- reservationsテーブル
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    people INT NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED', 'VISITED') DEFAULT 'CONFIRMED',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (slot_id) REFERENCES slots(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- adminsテーブル
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ挿入（サンプル）
INSERT INTO courses (name, description, price, duration) VALUES
('12種類ブレンドコース', '12種類の香料からオリジナル香水を作成', 5000.00, 60),
('20種類ブレンドコース', '20種類の香料からオリジナル香水を作成（限定）', 8000.00, 90);

INSERT INTO slots (date, time, capacity) VALUES
('2026-04-10', '11:00:00', 6),
('2026-04-10', '13:00:00', 6),
('2026-04-10', '15:00:00', 6);

INSERT INTO admins (email, password_hash, role) VALUES
('admin@example.com', '$2a$10$example.hash', 'admin');  -- パスワードは実際にはbcryptでハッシュ化