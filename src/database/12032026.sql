-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: dev
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '0a7d13ba-188e-11f1-9590-1a2a86231e2b:1-1065,
732882d0-1837-11f1-9b0a-e0db55bdce6e:1-1024';

--
-- Table structure for table `buildings`
--

DROP TABLE IF EXISTS `buildings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buildings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buildings`
--

LOCK TABLES `buildings` WRITE;
/*!40000 ALTER TABLE `buildings` DISABLE KEYS */;
INSERT INTO `buildings` VALUES (1,'A2','Cấp Mầm non - THCS'),(2,'C1','Cấp THPT'),(3,'B1','Cấp Tiểu học (Khối 1 - 2 - 3)'),(4,'A7','Cấp Tiểu học (Khối 4 - 5)');
/*!40000 ALTER TABLE `buildings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_reports`
--

DROP TABLE IF EXISTS `device_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reporter_id` int NOT NULL,
  `device_id` int NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `status` enum('pending','received','repairing','repaired','waiting_replacement','unfixable','recheck_required','completed') DEFAULT 'pending',
  `technician_note` text,
  `confirmed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reporter_id` (`reporter_id`),
  KEY `device_id` (`device_id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `device_reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`),
  CONSTRAINT `device_reports_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  CONSTRAINT `device_reports_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_reports`
--

LOCK TABLES `device_reports` WRITE;
/*!40000 ALTER TABLE `device_reports` DISABLE KEYS */;
INSERT INTO `device_reports` VALUES (1,10,4,'Kêu tít tít ',NULL,NULL,'pending',NULL,NULL,'2026-03-09 10:30:45','2026-03-09 10:30:45'),(2,5,3,'hư',NULL,8,'repairing',NULL,NULL,'2026-03-09 13:45:11','2026-03-10 16:24:55'),(3,13,3,'không lên',NULL,8,'completed','ok','2026-03-10 16:25:58','2026-03-10 16:20:00','2026-03-10 16:25:58');
/*!40000 ALTER TABLE `device_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `room_id` int DEFAULT NULL,
  `status` enum('active','under_repair','waiting_replacement','broken') DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'Máy lạnh',69,'active','2026-03-09 10:28:20','2026-03-09 10:28:20'),(2,'Máy in',33,'broken','2026-03-09 10:28:41','2026-03-09 10:28:41'),(3,'Máy tính ',68,'active','2026-03-09 10:29:00','2026-03-10 16:25:58'),(4,'Camera',4,'active','2026-03-09 10:29:21','2026-03-09 10:29:21');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `digital_signatures`
--

DROP TABLE IF EXISTS `digital_signatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `digital_signatures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` enum('leave_request') NOT NULL,
  `entity_id` int NOT NULL,
  `signed_by` int NOT NULL,
  `certificate_info` text,
  `document_hash` varchar(255) DEFAULT NULL,
  `signature_value` text,
  `signed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `signed_by` (`signed_by`),
  CONSTRAINT `digital_signatures_ibfk_1` FOREIGN KEY (`signed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `digital_signatures`
--

LOCK TABLES `digital_signatures` WRITE;
/*!40000 ALTER TABLE `digital_signatures` DISABLE KEYS */;
/*!40000 ALTER TABLE `digital_signatures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_balances`
--

DROP TABLE IF EXISTS `leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_balances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `year` int NOT NULL,
  `total_days` int NOT NULL,
  `used_days` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`year`),
  CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balances`
--

LOCK TABLES `leave_balances` WRITE;
/*!40000 ALTER TABLE `leave_balances` DISABLE KEYS */;
INSERT INTO `leave_balances` VALUES (1,5,2026,12,0),(2,12,2026,12,0),(3,10,2026,12,0),(4,8,2026,12,0),(5,14,2026,12,0),(6,13,2026,12,0),(7,29,2026,12,0);
/*!40000 ALTER TABLE `leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` int NOT NULL,
  `reason` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `rejected_reason` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `signed_at` datetime DEFAULT NULL,
  `approver_signed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`),
  CONSTRAINT `leave_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (8,1,1,'2026-03-09','2026-03-10',2,'test','approved',7,NULL,'2026-03-08 13:50:44','2026-03-08 13:51:35','2026-03-08 13:51:12','2026-03-08 13:51:35'),(9,1,9,'2026-03-18','2026-03-20',3,'abc','rejected',7,'test từ chối','2026-03-08 13:53:38','2026-03-08 13:58:16','2026-03-08 13:57:54','2026-03-08 13:58:16'),(10,1,4,'2026-03-20','2026-03-22',3,'abc','rejected',7,'ạdjaisdjoiasjd','2026-03-08 14:01:59','2026-03-08 14:02:35','2026-03-08 14:02:09','2026-03-08 14:02:35'),(13,10,6,'2026-03-09','2026-03-10',2,'Đám cưới','approved',4,NULL,'2026-03-09 07:49:21','2026-03-09 07:53:07','2026-03-09 07:52:22','2026-03-09 07:53:07');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `max_days_per_year` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,'Nghỉ phép năm',12),(2,'Nghỉ ốm',30),(3,'Nghỉ thai sản',180),(4,'Nghỉ việc riêng (có lương)',3),(5,'Nghỉ việc riêng (không lương)',NULL),(6,'Nghỉ kết hôn',3),(7,'Nghỉ tang (thân nhân)',3),(8,'Nghỉ bù',NULL),(9,'Nghỉ học tập / bồi dưỡng',NULL),(10,'Nghỉ lễ / tết (bổ sung)',NULL);
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_otps`
--

DROP TABLE IF EXISTS `password_reset_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_reset_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_otps`
--

LOCK TABLES `password_reset_otps` WRITE;
/*!40000 ALTER TABLE `password_reset_otps` DISABLE KEYS */;
INSERT INTO `password_reset_otps` VALUES (1,1,'tramkhoinguyen27122@gmail.com','849009','2026-03-04 10:24:55',1,'2026-03-04 10:19:55','2026-03-04 10:20:36');
/*!40000 ALTER TABLE `password_reset_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `building_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'A24.407'),(2,1,'A24.406'),(3,1,'A24.405'),(4,1,'A24.404'),(5,1,'A24.403'),(6,1,'A24.402'),(7,1,'A24.401'),(8,1,'A24.307'),(9,1,'A24.306'),(10,1,'A24.305'),(11,1,'A24.304'),(12,1,'A24.303'),(13,1,'A24.302'),(14,1,'A24.301'),(15,1,'A24.207'),(16,1,'A24.206'),(17,1,'A24.205'),(18,1,'A24.204'),(19,1,'A24.203'),(20,1,'A24.202'),(21,1,'A24.201'),(22,1,'A24.107'),(23,1,'A24.106'),(24,1,'A24.105'),(25,1,'A24.104'),(26,1,'A24.103'),(27,1,'A24.102'),(28,1,'A24.101'),(29,2,'C14.401'),(30,2,'C14.301'),(31,2,'C14.302'),(32,2,'C14.201'),(33,2,'C14.202'),(34,2,'C14.101'),(35,2,'C14.402'),(36,2,'C14.403'),(37,2,'C14.404'),(38,2,'C14.405'),(39,2,'C14.303'),(40,2,'C14.304'),(41,2,'C14.305'),(42,2,'C14.306'),(43,2,'C14.203'),(44,2,'C14.204'),(45,2,'C14.205'),(46,2,'C14.206'),(47,2,'C14.102'),(48,2,'C14.103'),(49,2,'C14.104'),(50,3,'Lớp 2C'),(51,3,'Lớp 2D'),(52,3,'Lớp 3A'),(53,3,'Lớp 3B'),(54,3,'Lớp 3C'),(55,3,'Lớp 3D'),(56,3,'Lớp 1A'),(57,3,'Lớp 1B'),(58,3,'Lớp 1C'),(59,3,'Lớp 1D'),(60,3,'Lớp 2A'),(61,3,'Lớp 2B'),(62,4,'A74.103'),(63,4,'A74.105'),(64,4,'A74.102'),(65,4,'A74.101'),(66,4,'A74.203'),(67,4,'A74.204'),(68,4,'A74.202'),(69,4,'A74.201');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelize_migrations`
--

DROP TABLE IF EXISTS `sequelize_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelize_migrations` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelize_migrations`
--

LOCK TABLES `sequelize_migrations` WRITE;
/*!40000 ALTER TABLE `sequelize_migrations` DISABLE KEYS */;
INSERT INTO `sequelize_migrations` VALUES ('20260304-fix-duplicate-indexes.js'),('20260308-add-approver-signed-at.js'),('20260308-add-signed-at-to-leave-requests.js');
/*!40000 ALTER TABLE `sequelize_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `signature_configs`
--

DROP TABLE IF EXISTS `signature_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `signature_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `signature_image` varchar(255) DEFAULT NULL,
  `pin_hash` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `signature_configs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signature_configs`
--

LOCK TABLES `signature_configs` WRITE;
/*!40000 ALTER TABLE `signature_configs` DISABLE KEYS */;
INSERT INTO `signature_configs` VALUES (3,7,'/uploads/signatures/signature-1772939157665-390763047.png','$2b$10$HYFdiUE4SANMCCn/dNeiVudnlqubXCvq6f.z8WqFLbPDYdvCjSzTa','2026-03-08 10:05:57','2026-03-08 10:05:57'),(4,1,'/uploads/signatures/signature-1-1772939237355.png','$2b$10$zjaLAYs.0Y/L3IEq4eWNLeouCL0VlgG2twFdt33z7aRt5YDnDfF4a','2026-03-08 10:07:17','2026-03-08 10:07:17'),(5,4,'/uploads/signatures/signature-4-1773017078967.png','$2b$10$IUpU9oNd.oZtXLBwpyYnyO90jP8hJiK8np.ioXr0Fx6PXX9M1Vd.i','2026-03-09 07:44:38','2026-03-09 07:44:39'),(6,10,'/uploads/signatures/signature-10-1773017530444.png','$2b$10$1Y8.MScz8ip6SgMjfBac5uIgujNqOnXLXGRjYgPIMw0frIChafeB.','2026-03-09 07:52:10','2026-03-09 07:52:10');
/*!40000 ALTER TABLE `signature_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_addresses`
--

DROP TABLE IF EXISTS `staff_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_profile_id` int NOT NULL,
  `address_type` enum('contact','hometown') NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `hamlet` varchar(100) DEFAULT NULL,
  `detail_address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_profile_id` (`staff_profile_id`),
  CONSTRAINT `staff_addresses_ibfk_1` FOREIGN KEY (`staff_profile_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_addresses`
--

LOCK TABLES `staff_addresses` WRITE;
/*!40000 ALTER TABLE `staff_addresses` DISABLE KEYS */;
INSERT INTO `staff_addresses` VALUES (7,5,'contact','','','','','0904542520'),(8,5,'hometown','','','','',NULL),(9,6,'contact','','','','','0904789498'),(10,6,'hometown','','','','',NULL),(11,7,'contact','','','','','0982454710'),(12,7,'hometown','','','','',NULL),(15,9,'contact','','','','','0909207380'),(16,9,'hometown','','','','',NULL),(19,11,'contact','','','','','0939902502'),(20,11,'hometown','','','','',NULL),(21,12,'contact','','','','','0814688629	'),(22,12,'hometown','','','','',NULL),(25,13,'contact','','','','','0983669655'),(26,13,'hometown','','','','',NULL),(29,10,'contact','','','','','0944087766'),(30,10,'hometown','','','','',NULL),(31,8,'contact','','','','','0914880571'),(32,8,'hometown','','','','',NULL),(33,14,'contact','','','','','0972462627'),(34,14,'hometown','','','','',NULL),(35,15,'contact','','','','','0947235791'),(36,15,'hometown','','','','',NULL),(37,16,'contact','','','','','0983639025'),(38,16,'hometown','','','','',NULL),(39,17,'contact','','','','','0973983428'),(40,17,'hometown','','','','',NULL),(49,20,'contact','','','','','0987589249'),(50,20,'hometown','','','','',NULL),(51,21,'contact','','','','','0987589249'),(52,21,'hometown','','','','',NULL);
/*!40000 ALTER TABLE `staff_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_bank_accounts`
--

DROP TABLE IF EXISTS `staff_bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_bank_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_profile_id` int NOT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_profile_id` (`staff_profile_id`),
  CONSTRAINT `staff_bank_accounts_ibfk_1` FOREIGN KEY (`staff_profile_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_bank_accounts`
--

LOCK TABLES `staff_bank_accounts` WRITE;
/*!40000 ALTER TABLE `staff_bank_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_evaluations`
--

DROP TABLE IF EXISTS `staff_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_profile_id` int NOT NULL,
  `civil_servant_rating` varchar(255) DEFAULT NULL,
  `excellent_teacher` tinyint(1) DEFAULT '0',
  `evaluation_year` int DEFAULT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `staff_profile_id` (`staff_profile_id`),
  CONSTRAINT `staff_evaluations_ibfk_1` FOREIGN KEY (`staff_profile_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_evaluations`
--

LOCK TABLES `staff_evaluations` WRITE;
/*!40000 ALTER TABLE `staff_evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_organizations`
--

DROP TABLE IF EXISTS `staff_organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_profile_id` int NOT NULL,
  `is_union_member` tinyint(1) DEFAULT '0',
  `union_join_date` date DEFAULT NULL,
  `is_party_member` tinyint(1) DEFAULT '0',
  `party_join_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_profile_id` (`staff_profile_id`),
  CONSTRAINT `staff_organizations_ibfk_1` FOREIGN KEY (`staff_profile_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_organizations`
--

LOCK TABLES `staff_organizations` WRITE;
/*!40000 ALTER TABLE `staff_organizations` DISABLE KEYS */;
INSERT INTO `staff_organizations` VALUES (4,5,0,NULL,0,NULL),(5,6,0,NULL,0,NULL),(6,7,0,NULL,0,NULL),(7,8,0,NULL,0,NULL),(8,9,0,NULL,0,NULL),(9,10,0,NULL,0,NULL),(10,11,0,NULL,0,NULL),(11,12,0,NULL,0,NULL),(12,13,0,NULL,0,NULL),(13,13,0,NULL,0,NULL),(14,10,0,NULL,0,NULL),(15,10,0,NULL,0,NULL),(16,8,0,NULL,0,NULL),(17,14,0,NULL,0,NULL),(18,15,0,NULL,0,NULL),(19,16,0,NULL,0,NULL),(20,17,0,NULL,0,NULL),(25,20,0,NULL,0,NULL),(26,21,0,NULL,0,NULL);
/*!40000 ALTER TABLE `staff_organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_positions`
--

DROP TABLE IF EXISTS `staff_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_positions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_profile_id` int NOT NULL,
  `job_position` varchar(255) DEFAULT NULL,
  `position_group` varchar(255) DEFAULT NULL,
  `recruitment_agency` varchar(255) DEFAULT NULL,
  `profession_when_recruited` varchar(255) DEFAULT NULL,
  `rank_level` varchar(100) DEFAULT NULL,
  `education_level` varchar(100) DEFAULT NULL,
  `rank_code` varchar(50) DEFAULT NULL,
  `subject_group` varchar(255) DEFAULT NULL,
  `contract_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_profile_id` (`staff_profile_id`),
  CONSTRAINT `staff_positions_ibfk_1` FOREIGN KEY (`staff_profile_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_positions`
--

LOCK TABLES `staff_positions` WRITE;
/*!40000 ALTER TABLE `staff_positions` DISABLE KEYS */;
INSERT INTO `staff_positions` VALUES (2,5,'Giáo viên','','','','','','','',''),(3,6,'Giáo viên','','','','','','','',''),(4,7,'Giáo viên','','','','','','','',''),(5,8,'Giáo viên','','','','','','','',''),(6,9,'Giáo viên','','','','','','','',''),(7,10,'Giáo viên','','','','','','','',''),(8,11,'Giáo viên','','','','','','','',''),(9,12,'Giáo viên','','','','','','','',''),(10,13,'Giáo viên','','','','','','','',''),(11,13,'Giáo viên','','','','','','','',''),(12,10,'Giáo viên','','','','','','','',''),(13,10,'Giáo viên','','','','','','','',''),(14,8,'Giáo viên','','','','','','','',''),(15,14,'Giáo viên','','','','','','','',''),(16,15,'Giáo viên','','','','','','','',''),(17,16,'Giáo viên','','','','','','','',''),(18,17,'Giáo viên','','','','','','','',''),(23,20,'Giáo viên','','','','','','','',''),(24,21,'Giáo viên','','','','','','','','');
/*!40000 ALTER TABLE `staff_positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_profiles`
--

DROP TABLE IF EXISTS `staff_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `staff_code` varchar(50) NOT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `cccd_number` varchar(20) DEFAULT NULL,
  `cccd_issue_date` date DEFAULT NULL,
  `cccd_issue_place` varchar(255) DEFAULT NULL,
  `ethnicity` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `staff_status` enum('working','probation','maternity_leave','retired','resigned') DEFAULT 'working',
  `recruitment_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `staff_code` (`staff_code`),
  CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
INSERT INTO `staff_profiles` VALUES (5,18,'NV003','male','1984-08-12','084084001944',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:29:25','2026-03-12 13:29:25'),(6,16,'NV001','male','1987-12-05','084087001648',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:34:32','2026-03-12 13:34:32'),(7,17,'NV002','male','1991-12-12','084091001190',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:38:14','2026-03-12 13:38:14'),(8,19,'NV004','female','1984-01-01','084181002023',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:40:01','2026-03-12 13:56:43'),(9,20,'NV005','male','1976-12-09','084076001778',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:43:24','2026-03-12 13:43:24'),(10,21,'NV006','female','1989-04-09','086189001273',NULL,NULL,NULL,NULL,'working','1989-04-09','2026-03-12 13:47:04','2026-03-12 13:56:32'),(11,22,'NV007','male','1980-02-25','084090000539',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:49:47','2026-03-12 13:49:47'),(12,23,'NV008','female','1994-04-24','084194005255',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:51:00','2026-03-12 13:51:00'),(13,24,'NV009','female','1982-04-10','084182002135',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:52:09','2026-03-12 13:55:50'),(14,25,'NV010','male','1981-03-02','084081014493',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 13:58:34','2026-03-12 13:58:34'),(15,26,'NV011','female','1978-09-15','084178002010',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 14:00:49','2026-03-12 14:00:49'),(16,27,'NV012','female','1974-04-11','084174001431',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 14:03:02','2026-03-12 14:03:02'),(17,28,'NV013','female','1994-01-01','084194001177',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 14:07:43','2026-03-12 14:07:43'),(20,12,'NV020','female',NULL,'084304003503',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 15:57:12','2026-03-12 15:57:12'),(21,30,'NV022','female','2004-02-26','084304003503',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-12 16:02:51','2026-03-12 16:02:51');
/*!40000 ALTER TABLE `staff_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_qualifications`
--

DROP TABLE IF EXISTS `staff_qualifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_qualifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_profile_id` int NOT NULL,
  `general_education_level` varchar(100) DEFAULT NULL,
  `professional_level` varchar(255) DEFAULT NULL,
  `major` varchar(255) DEFAULT NULL,
  `training_place` varchar(255) DEFAULT NULL,
  `graduation_year` int DEFAULT NULL,
  `it_level` varchar(100) DEFAULT NULL,
  `foreign_language_level` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_profile_id` (`staff_profile_id`),
  CONSTRAINT `staff_qualifications_ibfk_1` FOREIGN KEY (`staff_profile_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_qualifications`
--

LOCK TABLES `staff_qualifications` WRITE;
/*!40000 ALTER TABLE `staff_qualifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_qualifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_salaries`
--

DROP TABLE IF EXISTS `staff_salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_salaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_profile_id` int NOT NULL,
  `salary_coefficient` decimal(5,2) DEFAULT NULL,
  `salary_level` int DEFAULT NULL,
  `base_salary` bigint DEFAULT NULL,
  `salary_start_date` date DEFAULT NULL,
  `union_allowance_percent` decimal(5,2) DEFAULT NULL,
  `seniority_allowance_percent` decimal(5,2) DEFAULT NULL,
  `incentive_allowance_percent` decimal(5,2) DEFAULT NULL,
  `position_allowance_percent` decimal(5,2) DEFAULT NULL,
  `salary_note` text,
  PRIMARY KEY (`id`),
  KEY `staff_profile_id` (`staff_profile_id`),
  CONSTRAINT `staff_salaries_ibfk_1` FOREIGN KEY (`staff_profile_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_salaries`
--

LOCK TABLES `staff_salaries` WRITE;
/*!40000 ALTER TABLE `staff_salaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_salaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','manager','teacher','technician') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'teacher',
  `status` enum('active','inactive','locked') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'tramkhoinguyen27122@gmail.com','$2b$10$.5aTrQnrpUgVLmPlOgyl0ORBUKiw82/kmG1MVX9BVtqFC0YcIB3Fi','2026-02-19 13:25:01','2026-03-08 13:30:54','Khôi Nguyên','teacher','active','2026-03-08 13:30:54','/uploads/avatars/avatar-1772692826191-990826819.jpg'),(3,'admin@thsp.edu.vn','$2b$10$DRvoUodQBxoIFOypWPSWxuuDxzAGp3hJpXLzYwpkGJwyPghGjtw46','2026-03-03 20:46:48','2026-03-12 08:33:43','Quản trị viên','admin','active','2026-03-12 08:33:43',NULL),(4,'trinhfokko@gmail.com','$2b$10$14smnhiT1lPXX4KSQqZ6wOSP3JjkUjkUUXGfGHCZ1pQJGY9cBsWl6','2026-03-04 08:32:11','2026-03-09 10:42:21','Huệ Trinh','admin','active','2026-03-09 10:39:40','/uploads/avatars/avatar-1773027741664-458164425.jpg'),(5,'nhi96942@gmail.com','$2b$10$M0yCbiHPUkUbjcKoA3S0S.orbq2YvCHQxVSIROR81jzuW3IcIVGFa','2026-03-04 08:34:26','2026-03-12 16:09:14','Yến Nhi','admin','active','2026-03-12 16:09:14',NULL),(6,'reisoh2771@gmail.com','$2b$10$0BKdNtkiLBLE0wlaCdTL/ueicMISernxEbuqQ0NbVEc5lYb8J/U86','2026-03-04 08:38:27','2026-03-05 15:17:57','Khôi Nguyên','teacher','active','2026-03-04 09:49:32',NULL),(7,'tramkhoinguyen.dev@gmail.com','$2b$10$cobvd8OLJn7kvxmc8nwOoub6AA2XA3FNPi4UyKxYL9XX1oT91YciK','2026-03-04 15:22:03','2026-03-08 14:33:03','Trầm Khôi Nguyên','admin','active','2026-03-08 14:33:03','/uploads/avatars/avatar-1772692875649-70945503.jpg'),(8,'minh@gmail.com','$2b$10$o0x6YjQ5TftuE5OqeOERtOEamdlS.LkQKiqEbgH4V6saws1iSne3u','2026-03-05 15:33:41','2026-03-10 15:55:02','Nguyễn Văn Minh','technician','active','2026-03-10 15:55:02',NULL),(9,'vodangkhoa@tvu.edu.vn','$2b$10$l2I8tBYtj1QCzGodaoQzkOMACweUwUfmoPc0YZ7Em31/cfF48/Kp2','2026-03-05 15:37:04','2026-03-05 15:37:04','Võ Đăng Khoa','manager','active',NULL,NULL),(10,'meomeo@gmail.com','$2b$10$PFjgDJckTVWQix4Ei9HrnuWB5HHxsEBVp4mtnTJ5XABOsGY.xQyXe','2026-03-09 07:48:16','2026-03-10 15:44:30','Meo Meo','teacher','active','2026-03-10 15:44:30','/uploads/avatars/avatar-1773027525927-779504110.jpg'),(11,'meokt@gmail.com','$2b$10$N/QE2AJOf4OEl.RLEtFvReZktwkyLd1S90nTlClkJdyDy0/PjmGEO','2026-03-09 10:33:11','2026-03-09 10:35:35','Mèo Kỹ thuật','technician','active','2026-03-09 10:33:36','/uploads/avatars/avatar-1773027335827-445151863.jpg'),(12,'tynhi2600@gmail.com','$2b$10$8b0o6aRG8WCEJG0bYmrZyupR9SkSa2nPzwJKbZrqA9yPaHtMJC2zy','2026-03-09 13:47:33','2026-03-12 16:00:15','Trần Yến Nhi','admin','active','2026-03-12 16:00:15',NULL),(13,'lethic@gmail.com','$2b$10$DN2CPIGWybaForaCoKMsJuiFD50a1sYH.iYCT.61ntk13NQlZgm8G','2026-03-10 15:16:53','2026-03-10 15:54:08','Lê Thị C','teacher','active','2026-03-10 15:54:08',NULL),(14,'tranvand@gmail.com','$2b$10$TvkZ2t2oDHoXcOUDZbFFOuAEC0oGxwYtbYs1XJ22k4RqGYdRwO8ZC','2026-03-10 15:17:29','2026-03-10 15:56:06','Trần Văn D','manager','active','2026-03-10 15:56:06',NULL),(15,'teststaff@thsp.edu.vn','$2b$10$ofxJOBg4JfiH2sxssVG.SOkGY.ZGhztu7elJjvhS/HGcKOdFpl9Im','2026-03-12 08:33:44','2026-03-12 08:33:44','Nguyen Van Test','teacher','active',NULL,NULL),(16,'bhkhanh@tvu.edu.vn','$2b$10$2B1zNvAdLCU3p/qw15VQoe54vTOpAck4NmtaGK5AYFa3iR5.o9HDe','2026-03-12 13:24:10','2026-03-12 13:24:10','Bùi Hữu Khánh','teacher','active',NULL,NULL),(17,'buitan@tvu.edu.vn','$2b$10$gGXeJZtHxy.FvocrNdrxg.1K7y6LNZshwucyL3R6Moz.yV/aZyk.u','2026-03-12 13:26:09','2026-03-12 13:26:09','Bùi Quốc Tần','teacher','active',NULL,NULL),(18,'btngan@tvu.edu.vn','$2b$10$lhty465NBre1bC/CSLWaX.6/qHxWKWYqA7d/m2R/SeBuwsbcK96CK','2026-03-12 13:29:25','2026-03-12 13:29:25','Bùi Thế Ngân','teacher','active',NULL,NULL),(19,'btcloan@tvu.edu.vn','$2b$10$objd4SZIFWUGXRgCMWzewOeq1obrV6BYWKxdWEk0AIZSUdUjbI9zu','2026-03-12 13:40:01','2026-03-12 13:40:01','Bùi Thị Cẩm Loan','teacher','active',NULL,NULL),(20,'buicat@tvu.edu.vn','$2b$10$K4giwqrRj9JhhMNCX/koUO/EX48PDZxDKJhaG4GUOgMouXycn66um','2026-03-12 13:43:24','2026-03-12 13:43:24','Bùi Văn Cất','teacher','active',NULL,NULL),(21,'ctbtram@tvu.edu.vn','$2b$10$hNG3EN4iVOGGNgdm7K/ZWOhDlspF.Iz8XaQ9t5eial1WQAzItsp4i','2026-03-12 13:47:04','2026-03-12 13:47:04','Châu Thị Bích Trâm	','teacher','active',NULL,NULL),(22,'Cvngoan@tvu.edu.vn','$2b$10$hxvGzCA2BNH9LG7RxOwjB.VXh9R17lEYlVvyEMYyP59fGG3WgMVK.','2026-03-12 13:49:47','2026-03-12 13:49:47','Châu Văn Ngoan','teacher','active',NULL,NULL),(23,'cttrang@tvu.edu.vn','$2b$10$Qt3lpu7zbbX2qyAHQzQ.lOV35y7fpTrjGDbwMb46G8Y.1oE/WFk0a','2026-03-12 13:51:00','2026-03-12 13:51:00','Chung Thùy Trang','teacher','active',NULL,NULL),(24,'dhnlan@tvu.edu.vn','$2b$10$3.XnNILK0UpFq5i0rrJjEuIE0Ju3JT5H.Eww0ZgDxoi.XvX9vcZhu','2026-03-12 13:52:09','2026-03-12 13:52:09','Dương Hiền Ngọc Lan','teacher','active',NULL,NULL),(25,'dhvu@tvu.edu.vn','$2b$10$s0w4JkjIEm9DCXi3ccY8n.WyPzcnVM0b0ws09UWI2aStE2N6vLhmK','2026-03-12 13:58:34','2026-03-12 13:58:34','Dương Hồ Vũ','teacher','active',NULL,NULL),(26,'dnpthao@tvu.edu.vn','$2b$10$VEf4nxxWwt0K.MkuoSZTSOTcCvIu7omrD3E5N8yriZGGDhUWPJHB2','2026-03-12 14:00:49','2026-03-12 14:00:49','Dương Ngọc Phương Thảo','teacher','active',NULL,NULL),(27,'dtgioi@tvu.edu.vn','$2b$10$ck7ksbY9pFFpJcJusRFGd.2u7WR0m.1M75QbbHcZAIr.Po39Ih0Gm','2026-03-12 14:03:02','2026-03-12 14:03:02','Dương Thị Giới','teacher','active',NULL,NULL),(28,'httruc@tvu.edu.vn','$2b$10$hzh3iJU/i5wJOjnKlRzseOym0B1t326CWkRfWP6h5c.V8Cc9XfcLy','2026-03-12 14:07:43','2026-03-12 14:07:43','Hồ Thanh Trúc','teacher','active',NULL,NULL),(29,'CKSODK@gmail.com','$2b$10$ptFTgTl2WQeP2S2vRFjKy.jGvaSfhjzDAeQnzNzU3vIvHk3gJzhy.','2026-03-12 14:20:50','2026-03-12 14:21:00','yn','manager','active','2026-03-12 14:21:00',NULL),(30,'110122133@st.tvu.edu.vn','$2b$10$0CbFt/vumWwnoqALKtJzfu9hzKxXZIzLB0fX7x/xikvtNFn5QPr/.','2026-03-12 16:01:46','2026-03-12 16:04:57','Trần Yến Nhi','teacher','active','2026-03-12 16:04:57',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_order_attachments`
--

DROP TABLE IF EXISTS `work_order_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_order_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_order_id` int NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `uploaded_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `work_order_id` (`work_order_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `work_order_attachments_ibfk_1` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `work_order_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_order_attachments`
--

LOCK TABLES `work_order_attachments` WRITE;
/*!40000 ALTER TABLE `work_order_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_order_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_orders`
--

DROP TABLE IF EXISTS `work_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `note` text,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `status` enum('pending','approved','in_progress','completed','rejected','cancelled') DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `work_orders_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `work_orders_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `work_orders_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_orders`
--

LOCK TABLES `work_orders` WRITE;
/*!40000 ALTER TABLE `work_orders` DISABLE KEYS */;
INSERT INTO `work_orders` VALUES (20,'WO-20260312-0001','Tham gia Hội thi Viết chữ đẹp cấp tỉnh dành cho học sinh tiểu học Năm học 2025-2026','Tham gia Hội thi Viết chữ đẹp cấp tỉnh dành cho học sinh tiểu học Năm học 2025-2026','Hội trường Sở GDĐT Vĩnh Long.','2026-03-13 07:00:00','2026-03-18 07:00:00','',5,NULL,12,'pending','2026-03-12 15:57:50','2026-03-12 15:57:50'),(21,'WO-20260312-0002','Hội giảng cấp tỉnh','Hội giảng cấp tỉnh','Trường THCS Tiểu Cần','2026-03-14 07:00:00','2026-03-17 07:00:00','',5,NULL,12,'pending','2026-03-12 15:59:46','2026-03-12 15:59:46'),(22,'WO-20260312-0003','bb','bb','nn','2026-03-18 07:00:00','2026-03-24 07:00:00','',5,NULL,30,'pending','2026-03-12 16:03:23','2026-03-12 16:03:23'),(23,'WO-20260312-0004','bb','bb','bb','2026-03-13 07:00:00','2026-03-16 07:00:00','',5,NULL,26,'pending','2026-03-12 16:04:32','2026-03-12 16:04:32'),(24,'WO-20260312-0005','mm','mm','mm','2026-03-13 07:00:00','2026-03-17 07:00:00','',5,NULL,30,'pending','2026-03-12 16:12:54','2026-03-12 16:12:54');
/*!40000 ALTER TABLE `work_orders` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-12 16:27:17
