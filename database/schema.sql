-- ============================================
-- Tourism Management System - Database Schema
-- ============================================
-- This script creates the complete database structure
-- Run this on a fresh MySQL server to set up the database

-- Create Database
DROP DATABASE IF EXISTS tourism_db;

CREATE DATABASE tourism_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tourism_db;

-- ============================================
-- Table: admins
-- ============================================
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_admin_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: tourists
-- ============================================
CREATE TABLE tourists (
    tourist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    admin_id INT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_tourist_email (email),
    INDEX idx_tourist_admin (admin_id),
    CONSTRAINT fk_tourist_admin FOREIGN KEY (admin_id) REFERENCES admins (admin_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: cities
-- ============================================
CREATE TABLE cities (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image VARCHAR(500) NULL,
    admin_id INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_city_admin (admin_id),
    CONSTRAINT fk_city_admin FOREIGN KEY (admin_id) REFERENCES admins (admin_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE categories (
    cate_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    admin_id INT NOT NULL,
    city_id INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_category_admin (admin_id),
    INDEX idx_category_city (city_id),
    CONSTRAINT fk_category_admin FOREIGN KEY (admin_id) REFERENCES admins (admin_id) ON DELETE CASCADE,
    CONSTRAINT fk_category_city FOREIGN KEY (city_id) REFERENCES cities (city_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: places
-- ============================================
CREATE TABLE places (
    place_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    location VARCHAR(500) NULL,
    image VARCHAR(500) NULL,
    admin_id INT NOT NULL,
    cate_id INT NOT NULL,
    city_id INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_place_admin (admin_id),
    INDEX idx_place_category (cate_id),
    INDEX idx_place_city (city_id),
    CONSTRAINT fk_place_admin FOREIGN KEY (admin_id) REFERENCES admins (admin_id) ON DELETE CASCADE,
    CONSTRAINT fk_place_category FOREIGN KEY (cate_id) REFERENCES categories (cate_id) ON DELETE CASCADE,
    CONSTRAINT fk_place_city FOREIGN KEY (city_id) REFERENCES cities (city_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: activities
-- ============================================
CREATE TABLE activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    day_number INT NOT NULL,
    description TEXT NULL,
    tourist_id INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_activity_tourist (tourist_id),
    CONSTRAINT fk_activity_tourist FOREIGN KEY (tourist_id) REFERENCES tourists (tourist_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: questions
-- ============================================
CREATE TABLE questions (
    ques_id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    admin_id INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_question_admin (admin_id),
    CONSTRAINT fk_question_admin FOREIGN KEY (admin_id) REFERENCES admins (admin_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: suggested_destinations
-- ============================================
CREATE TABLE suggested_destinations (
    sug_des_id INT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    description TEXT NULL,
    admin_id INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_suggested_destination_admin (admin_id),
    CONSTRAINT fk_suggested_destination_admin FOREIGN KEY (admin_id) REFERENCES admins (admin_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: options
-- ============================================
CREATE TABLE options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    admin_id INT NOT NULL,
    ques_id INT NOT NULL,
    sug_des_id INT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_option_admin (admin_id),
    INDEX idx_option_question (ques_id),
    INDEX idx_option_suggested_destination (sug_des_id),
    CONSTRAINT fk_option_admin FOREIGN KEY (admin_id) REFERENCES admins (admin_id) ON DELETE CASCADE,
    CONSTRAINT fk_option_question FOREIGN KEY (ques_id) REFERENCES questions (ques_id) ON DELETE CASCADE,
    CONSTRAINT fk_option_suggested_destination FOREIGN KEY (sug_des_id) REFERENCES suggested_destinations (sug_des_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Table: likes (Many-to-Many: Tourist <-> Place)
-- ============================================
CREATE TABLE likes (
    tourist_id INT NOT NULL,
    place_id INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (tourist_id, place_id),
    INDEX idx_like_tourist (tourist_id),
    INDEX idx_like_place (place_id),
    CONSTRAINT fk_like_tourist FOREIGN KEY (tourist_id) REFERENCES tourists (tourist_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_place FOREIGN KEY (place_id) REFERENCES places (place_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert a default admin (password: admin123 - hashed with bcrypt)
INSERT INTO
    admins (name, email, password)
VALUES (
        'System Admin',
        'admin@tourism.com',
        '$2a$10$rZ8vqXKZ5vXqXKZ5vXqXKOqXKZ5vXqXKZ5vXqXKZ5vXqXKZ5vXqXK'
    );

-- Note: The password hash above is a placeholder.
-- Use the actual bcrypt hash when creating real admin accounts.

-- ============================================
-- Database Setup Complete
-- ============================================
-- You can now run your Node.js application
-- Make sure to update your .env file with the correct DATABASE_URL