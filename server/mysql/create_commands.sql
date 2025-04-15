CREATE SCHEMA `dice-prod-db` ;

CREATE TABLE `dice-prod-db`.`users` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  birthday DATE NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  description TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_users_deleted_at` (`deleted_at`),
  UNIQUE (`email`, `deleted_at`)
);

CREATE TABLE `dice-prod-db`.`active_sessions` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  user_agent VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_active_sessions_deleted_at` (`deleted_at`),
  FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);

CREATE TABLE `dice-prod-db`.`email_verification_sessions` (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_email_verification_sessions_deleted_at` (`deleted_at`),
    FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);

CREATE TABLE  `dice-prod-db`.`password_reset_sessions` (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_password_reset_sessions_deleted_at` (`deleted_at`),
    FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);