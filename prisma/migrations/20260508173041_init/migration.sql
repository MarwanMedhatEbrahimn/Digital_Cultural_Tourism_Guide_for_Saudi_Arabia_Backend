-- CreateTable
CREATE TABLE `admins` (
    `admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email`(`email`),
    INDEX `idx_admin_email`(`email`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tourists` (
    `tourist_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `admin_id` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email`(`email`),
    INDEX `idx_tourist_admin`(`admin_id`),
    INDEX `idx_tourist_email`(`email`),
    PRIMARY KEY (`tourist_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `city_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `name_ar` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `admin_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_city_admin`(`admin_id`),
    PRIMARY KEY (`city_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `city_images` (
    `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL,
    `city_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_city_image_city`(`city_id`),
    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `cate_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `name_ar` VARCHAR(255) NULL,
    `admin_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_category_admin`(`admin_id`),
    PRIMARY KEY (`cate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `city_categories` (
    `city_id` INTEGER NOT NULL,
    `cate_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_city_category_city`(`city_id`),
    INDEX `idx_city_category_category`(`cate_id`),
    PRIMARY KEY (`city_id`, `cate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `places` (
    `place_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `name_ar` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `location` VARCHAR(500) NULL,
    `location_ar` VARCHAR(500) NULL,
    `admin_id` INTEGER NOT NULL,
    `cate_id` INTEGER NOT NULL,
    `city_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `name`(`name`),
    INDEX `idx_place_admin`(`admin_id`),
    INDEX `idx_place_category`(`cate_id`),
    INDEX `idx_place_city`(`city_id`),
    PRIMARY KEY (`place_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `place_images` (
    `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL,
    `place_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_place_image_place`(`place_id`),
    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activities` (
    `activity_id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_number` INTEGER NOT NULL,
    `description` TEXT NULL,
    `tourist_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_activity_tourist`(`tourist_id`),
    PRIMARY KEY (`activity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `ques_id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` TEXT NOT NULL,
    `admin_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_question_admin`(`admin_id`),
    PRIMARY KEY (`ques_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `options` (
    `option_id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` TEXT NOT NULL,
    `admin_id` INTEGER NOT NULL,
    `ques_id` INTEGER NOT NULL,
    `sug_des_id` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_option_admin`(`admin_id`),
    INDEX `idx_option_question`(`ques_id`),
    INDEX `idx_option_suggested_destination`(`sug_des_id`),
    PRIMARY KEY (`option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suggested_destinations` (
    `sug_des_id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `admin_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_suggested_destination_admin`(`admin_id`),
    PRIMARY KEY (`sug_des_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `likes` (
    `tourist_id` INTEGER NOT NULL,
    `place_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_like_place`(`place_id`),
    INDEX `idx_like_tourist`(`tourist_id`),
    PRIMARY KEY (`tourist_id`, `place_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tourists` ADD CONSTRAINT `fk_tourist_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `fk_city_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `city_images` ADD CONSTRAINT `fk_city_image_city` FOREIGN KEY (`city_id`) REFERENCES `cities`(`city_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `fk_category_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `city_categories` ADD CONSTRAINT `fk_city_category_city` FOREIGN KEY (`city_id`) REFERENCES `cities`(`city_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `city_categories` ADD CONSTRAINT `fk_city_category_category` FOREIGN KEY (`cate_id`) REFERENCES `categories`(`cate_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `places` ADD CONSTRAINT `fk_place_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `places` ADD CONSTRAINT `fk_place_category` FOREIGN KEY (`cate_id`) REFERENCES `categories`(`cate_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `places` ADD CONSTRAINT `fk_place_city` FOREIGN KEY (`city_id`) REFERENCES `cities`(`city_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `place_images` ADD CONSTRAINT `fk_place_image_place` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `fk_activity_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists`(`tourist_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `fk_question_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `options` ADD CONSTRAINT `fk_option_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `options` ADD CONSTRAINT `fk_option_question` FOREIGN KEY (`ques_id`) REFERENCES `questions`(`ques_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `options` ADD CONSTRAINT `fk_option_suggested_destination` FOREIGN KEY (`sug_des_id`) REFERENCES `suggested_destinations`(`sug_des_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `suggested_destinations` ADD CONSTRAINT `fk_suggested_destination_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `fk_like_place` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `fk_like_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists`(`tourist_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
