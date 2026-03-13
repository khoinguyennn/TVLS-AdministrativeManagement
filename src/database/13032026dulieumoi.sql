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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '0a7d13ba-188e-11f1-9590-1a2a86231e2b:1-1444,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_reports`
--

LOCK TABLES `device_reports` WRITE;
/*!40000 ALTER TABLE `device_reports` DISABLE KEYS */;
INSERT INTO `device_reports` VALUES (1,10,4,'Kêu tít tít ',NULL,NULL,'pending',NULL,NULL,'2026-03-09 10:30:45','2026-03-09 10:30:45'),(2,1,1,'máy lạnh không mát','/uploads/reports/report-1773103573170-368046117.jpg',8,'completed','ok','2026-03-10 08:00:25','2026-03-10 07:46:13','2026-03-10 08:00:25'),(3,1,5,'camera bị kêu','/uploads/reports/report-1773104831799-211299736.jpg',8,'waiting_replacement','chờ thay thế thiết bị',NULL,'2026-03-10 08:07:11','2026-03-10 08:37:50'),(4,1,2,'abc','/uploads/reports/report-1773107068943-389319872.jpg',8,'completed',NULL,'2026-03-10 08:47:44','2026-03-10 08:44:28','2026-03-10 08:47:44'),(5,1,9,'máy quét không thể quét được','/uploads/reports/report-1773143190254-672703361.jpg',8,'completed',NULL,NULL,'2026-03-10 18:46:30','2026-03-12 08:00:00'),(6,1,4,'abc','/uploads/reports/report-1773145812026-580077839.jpg',NULL,'pending',NULL,NULL,'2026-03-10 19:30:12','2026-03-10 19:30:12'),(7,1,7,'tivi hỏng màn hình','/uploads/reports/report-1773145974134-425428343.jpg',NULL,'pending',NULL,NULL,'2026-03-10 19:32:54','2026-03-10 19:32:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'Máy lạnh',69,'active','2026-03-09 10:28:20','2026-03-09 10:28:20'),(2,'Máy in',33,'active','2026-03-09 10:28:41','2026-03-10 08:47:44'),(3,'Máy tính ',68,'waiting_replacement','2026-03-09 10:29:00','2026-03-09 10:29:00'),(4,'Camera',4,'active','2026-03-09 10:29:21','2026-03-09 10:29:21'),(5,'Camera',29,'active','2026-03-10 08:05:32','2026-03-10 08:05:32'),(6,'Máy chiếu',8,'active','2026-03-10 18:43:24','2026-03-10 18:43:24'),(7,'Tivi',66,'active','2026-03-10 18:43:35','2026-03-10 18:43:35'),(8,'Máy chiếu',2,'active','2026-03-10 18:43:48','2026-03-10 18:43:48'),(9,'Máy quét',46,'active','2026-03-10 18:44:15','2026-03-12 08:15:38');
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
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `category` enum('computer','projector','furniture','lab-equipment','other') NOT NULL DEFAULT 'other',
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` datetime DEFAULT NULL,
  `warranty_expiry` datetime DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `status` enum('working','broken','maintenance','disposed') NOT NULL DEFAULT 'working',
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `equipment_room_id` (`room_id`),
  CONSTRAINT `equipment_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment`
--

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balances`
--

LOCK TABLES `leave_balances` WRITE;
/*!40000 ALTER TABLE `leave_balances` DISABLE KEYS */;
INSERT INTO `leave_balances` VALUES (1,1,2026,12,2),(2,7,2026,12,0),(3,8,2026,12,0),(4,9,2026,12,0),(5,6,2026,12,0),(6,5,2026,12,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (8,1,1,'2026-03-09','2026-03-10',2,'test','approved',7,NULL,'2026-03-08 13:50:44','2026-03-08 13:51:35','2026-03-08 13:51:12','2026-03-08 13:51:35'),(9,1,9,'2026-03-18','2026-03-20',3,'abc','rejected',7,'test từ chối','2026-03-08 13:53:38','2026-03-08 13:58:16','2026-03-08 13:57:54','2026-03-08 13:58:16'),(10,1,4,'2026-03-20','2026-03-22',3,'abc','rejected',7,'ạdjaisdjoiasjd','2026-03-08 14:01:59','2026-03-08 14:02:35','2026-03-08 14:02:09','2026-03-08 14:02:35'),(13,10,6,'2026-03-09','2026-03-10',2,'Đám cưới','approved',4,NULL,'2026-03-09 07:49:21','2026-03-09 07:53:07','2026-03-09 07:52:22','2026-03-09 07:53:07'),(14,1,8,'2026-03-24','2026-03-25',2,'abcasdas','approved',7,NULL,'2026-03-09 18:31:15','2026-03-09 18:37:16','2026-03-09 18:36:59','2026-03-09 18:37:16');
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
  KEY `rooms_building_id` (`building_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'A24.407'),(2,1,'A24.406'),(3,1,'A24.405'),(4,1,'A24.404'),(5,1,'A24.403'),(6,1,'A24.402'),(7,1,'A24.401'),(8,1,'A24.307'),(9,1,'A24.306'),(10,1,'A24.305'),(11,1,'A24.304'),(12,1,'A24.303'),(13,1,'A24.302'),(14,1,'A24.301'),(15,1,'A24.207'),(16,1,'A24.206'),(17,1,'A24.205'),(18,1,'A24.204'),(19,1,'A24.203'),(20,1,'A24.202'),(21,1,'A24.201'),(22,1,'A24.107'),(23,1,'A24.106'),(24,1,'A24.105'),(25,1,'A24.104'),(26,1,'A24.103'),(27,1,'A24.102'),(28,1,'A24.101'),(29,2,'C14.401'),(30,2,'C14.301'),(31,2,'C14.302'),(32,2,'C14.201'),(33,2,'C14.202'),(34,2,'C14.101'),(35,2,'C14.402'),(36,2,'C14.403'),(37,2,'C14.404'),(38,2,'C14.405'),(39,2,'C14.303'),(40,2,'C14.304'),(41,2,'C14.305'),(42,2,'C14.306'),(43,2,'C14.203'),(44,2,'C14.204'),(45,2,'C14.205'),(46,2,'C14.206'),(47,2,'C14.102'),(48,2,'C14.103'),(49,2,'C14.104'),(50,3,'Lớp 2C'),(51,3,'Lớp 2D'),(52,3,'Lớp 3A'),(53,3,'Lớp 3B'),(54,3,'Lớp 3C'),(55,3,'Lớp 3D'),(56,3,'Lớp 1A'),(57,3,'Lớp 1B'),(58,3,'Lớp 1C'),(59,3,'Lớp 1D'),(60,3,'Lớp 2A'),(61,3,'Lớp 2B'),(62,4,'A74.103'),(63,4,'A74.105'),(64,4,'A74.102'),(65,4,'A74.101'),(66,4,'A74.203'),(67,4,'A74.204'),(68,4,'A74.202'),(69,4,'A74.201'),(70,1,'A21.022');
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
INSERT INTO `sequelize_migrations` VALUES ('20260304-fix-duplicate-indexes.js'),('20260306-create-facility-tables.js'),('20260308-add-approver-signed-at.js'),('20260308-add-signed-at-to-leave-requests.js'),('20260312-update-staff-status-enum.js');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signature_configs`
--

LOCK TABLES `signature_configs` WRITE;
/*!40000 ALTER TABLE `signature_configs` DISABLE KEYS */;
INSERT INTO `signature_configs` VALUES (3,7,'/uploads/signatures/signature-1772939157665-390763047.png','$2b$10$HYFdiUE4SANMCCn/dNeiVudnlqubXCvq6f.z8WqFLbPDYdvCjSzTa','2026-03-08 10:05:57','2026-03-08 10:05:57'),(4,1,'/uploads/signatures/signature-1-1772939237355.png','$2b$10$zjaLAYs.0Y/L3IEq4eWNLeouCL0VlgG2twFdt33z7aRt5YDnDfF4a','2026-03-08 10:07:17','2026-03-08 10:07:17'),(5,4,'/uploads/signatures/signature-4-1773017078967.png','$2b$10$IUpU9oNd.oZtXLBwpyYnyO90jP8hJiK8np.ioXr0Fx6PXX9M1Vd.i','2026-03-09 07:44:38','2026-03-09 07:44:39'),(6,10,'/uploads/signatures/signature-10-1773017530444.png','$2b$10$1Y8.MScz8ip6SgMjfBac5uIgujNqOnXLXGRjYgPIMw0frIChafeB.','2026-03-09 07:52:10','2026-03-09 07:52:10'),(7,9,'/uploads/signatures/signature-9-1773211129752.png','$2b$10$0hYeTt3oSGGYof6E7QELPeThuQHjDGXtN32UUx8G0ZNsSrouPlv0W','2026-03-11 13:38:49','2026-03-11 13:38:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_addresses`
--

LOCK TABLES `staff_addresses` WRITE;
/*!40000 ALTER TABLE `staff_addresses` DISABLE KEYS */;
INSERT INTO `staff_addresses` VALUES (7,1,'contact','Trà Vinh','Phước Hưng','','Ấp Chợ, xã Phước Hưng, huyện Trà Cú, tỉnh Trà Vinh','0987769860'),(8,1,'hometown','Trà Vinh','Phước Hưng','','',NULL),(11,5,'contact','','','','','0904789498'),(12,5,'hometown','','','','',NULL),(15,6,'contact','','','','Trà Vinh','0982454710'),(16,6,'hometown','','','','',NULL),(17,7,'contact','','','','Trà Vinh','0904542520'),(18,7,'hometown','','','','',NULL),(21,8,'contact','','','','Trà Vinh','0914880571'),(22,8,'hometown','','','','',NULL),(23,9,'contact','','','','Trà Vinh','0909207380'),(24,9,'hometown','','','','',NULL),(25,10,'contact','','','','Trà Vinh','0944087766'),(26,10,'hometown','','','','',NULL),(27,11,'contact','','','','Trà Vinh','0939902502'),(28,11,'hometown','','','','',NULL),(31,13,'contact','','','','Trà Vinh','0983669655'),(32,13,'hometown','','','','',NULL),(33,12,'contact','','','','Trà Vinh','0814688629'),(34,12,'hometown','','','','',NULL),(35,14,'contact','','','','Trà Vinh','0972462627'),(36,14,'hometown','','','','',NULL),(37,15,'contact','','','','','0947235791'),(38,15,'hometown','','','','',NULL),(41,16,'contact','','','','Trà Vinh','0987589249'),(42,16,'hometown','','','','',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_bank_accounts`
--

LOCK TABLES `staff_bank_accounts` WRITE;
/*!40000 ALTER TABLE `staff_bank_accounts` DISABLE KEYS */;
INSERT INTO `staff_bank_accounts` VALUES (6,1,'MB Bank','Chi nhánh Trà Vinh','8888274567'),(8,1,'MB Bank','Chi nhánh Trà Vinh','8888274567');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_evaluations`
--

LOCK TABLES `staff_evaluations` WRITE;
/*!40000 ALTER TABLE `staff_evaluations` DISABLE KEYS */;
INSERT INTO `staff_evaluations` VALUES (6,1,'Hoàn thành tốt nhiệm vụ',1,2022,'ABC');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_organizations`
--

LOCK TABLES `staff_organizations` WRITE;
/*!40000 ALTER TABLE `staff_organizations` DISABLE KEYS */;
INSERT INTO `staff_organizations` VALUES (1,1,1,'2019-03-26',0,NULL),(4,1,1,'2019-03-26',0,NULL),(6,5,0,NULL,0,NULL),(7,6,0,NULL,0,NULL),(8,6,0,NULL,0,NULL),(9,7,0,NULL,0,NULL),(10,8,0,NULL,0,NULL),(11,8,0,NULL,0,NULL),(12,9,0,NULL,0,NULL),(13,10,0,NULL,0,NULL),(14,11,0,NULL,0,NULL),(15,12,0,NULL,0,NULL),(16,13,0,NULL,0,NULL),(17,12,0,NULL,0,NULL),(18,14,0,NULL,0,NULL),(19,15,0,NULL,0,NULL),(20,16,0,NULL,0,NULL),(21,16,0,NULL,0,NULL);
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
INSERT INTO `staff_positions` VALUES (6,1,'Giáo viên','Giáo viên','Trường Thực hành Sư phạm','Giáo viên','ABC',NULL,'002023',NULL,'HĐ'),(8,1,'Giáo viên','Giáo viên','Trường Thực hành Sư phạm','Giáo viên','ABC','','002023','','HĐ'),(9,5,'Giáo viên','','','','','','','',''),(10,6,'Giáo viên','','','','','','','',''),(11,6,'Giáo viên','','','','','','','',''),(12,7,'Giáo viên','','','','','','','',''),(13,8,'Giáo viên','','','','','','','',''),(14,8,'Giáo viên','','','','','','','',''),(15,9,'Giáo viên','','','','','','','',''),(16,10,'Giáo viên','','','','','','','',''),(17,11,'Giáo viên','','','','','','','',''),(18,12,'Giáo viên','','','','','','','',''),(19,13,'Giáo viên','','','','','','','',''),(20,12,'Giáo viên','','','','','','','',''),(21,14,'Giáo viên','','','','','','','',''),(22,15,'Giáo viên','','','','','','','',''),(23,16,'Giáo viên','','','','','','','',''),(24,16,'Giáo viên','','','','','','','','');
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
  `staff_status` enum('working','resigned','transferred','maternity_leave','unpaid_leave') DEFAULT 'working',
  `recruitment_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `staff_code` (`staff_code`),
  CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
INSERT INTO `staff_profiles` VALUES (1,7,'00001','male','2004-01-27','084204008230','2021-05-31','CCSQLHCVTTVATXH','Kinh','Phật giáo','working','2023-05-22','2026-03-12 19:27:42','2026-03-13 09:49:14'),(5,13,'1','male','1987-05-12','084087001648',NULL,NULL,NULL,NULL,'working',NULL,'2026-03-13 09:56:15','2026-03-13 09:56:15'),(6,14,'2','male','1991-12-19','084091001190','1999-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:00:32','2026-03-13 10:01:34'),(7,15,'3','male','1984-12-08','084084001944','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:03:39','2026-03-13 10:03:39'),(8,16,'4','female','1981-01-01','084181002023','1900-01-01','Trà Vinh',NULL,NULL,'working','1900-01-01','2026-03-13 10:07:27','2026-03-13 10:07:37'),(9,17,'5','male','1976-09-15','084076001778','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:09:18','2026-03-13 10:09:18'),(10,18,'6','female','1986-04-09','086189001273','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:11:02','2026-03-13 10:11:02'),(11,19,'7','male','1990-02-25','084090000539','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:12:16','2026-03-13 10:12:16'),(12,20,'8','female','1994-04-24','084194005255','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:13:47','2026-03-13 10:15:23'),(13,21,'9','female','1982-04-10','084182002135','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:15:13','2026-03-13 10:15:13'),(14,22,'10','male','1981-03-02','084081014493','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:17:37','2026-03-13 10:17:37'),(15,23,'11','male','1978-09-15','084178002010','1900-01-01','Trà Vinh',NULL,NULL,'working','1985-01-01','2026-03-13 10:20:15','2026-03-13 10:20:15'),(16,5,'12','female','2004-02-26','084304003503','2022-01-01','Trà Vinh',NULL,NULL,'working','2022-01-01','2026-03-13 10:21:27','2026-03-13 10:31:47');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_qualifications`
--

LOCK TABLES `staff_qualifications` WRITE;
/*!40000 ALTER TABLE `staff_qualifications` DISABLE KEYS */;
INSERT INTO `staff_qualifications` VALUES (6,1,'12/12','Kỹ sư','Kỹ thuật phần mềm','Đại học Trà Vinh',2026,'Ứng dụng CNTT nâng cao','Bậc 3 (B1)'),(8,1,'12/12','Kỹ sư','Kỹ thuật phần mềm','Đại học Trà Vinh',2026,'Ứng dụng CNTT nâng cao','Bậc 3 (B1)');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_salaries`
--

LOCK TABLES `staff_salaries` WRITE;
/*!40000 ALTER TABLE `staff_salaries` DISABLE KEYS */;
INSERT INTO `staff_salaries` VALUES (6,1,4.65,8,2340000,'2022-09-01',NULL,NULL,NULL,0.25,NULL),(8,1,4.65,8,2340000,'2022-09-01',0.00,0.00,0.00,0.25,'');
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'tramkhoinguyen27122@gmail.com','$2b$10$.5aTrQnrpUgVLmPlOgyl0ORBUKiw82/kmG1MVX9BVtqFC0YcIB3Fi','2026-02-19 13:25:01','2026-03-13 09:05:32','Khôi Nguyên','teacher','active','2026-03-13 09:05:32','/uploads/avatars/avatar-1772692826191-990826819.jpg'),(3,'admin@thsp.edu.vn','$2b$10$DRvoUodQBxoIFOypWPSWxuuDxzAGp3hJpXLzYwpkGJwyPghGjtw46','2026-03-03 20:46:48','2026-03-13 10:18:36','Quản trị viên','admin','active','2026-03-13 10:18:36',NULL),(4,'trinhfokko@gmail.com','$2b$10$14smnhiT1lPXX4KSQqZ6wOSP3JjkUjkUUXGfGHCZ1pQJGY9cBsWl6','2026-03-04 08:32:11','2026-03-09 10:42:21','Huệ Trinh','admin','active','2026-03-09 10:39:40','/uploads/avatars/avatar-1773027741664-458164425.jpg'),(5,'nhi96942@gmail.com','$2b$10$M0yCbiHPUkUbjcKoA3S0S.orbq2YvCHQxVSIROR81jzuW3IcIVGFa','2026-03-04 08:34:26','2026-03-13 10:18:12','Yến Nhi','teacher','active','2026-03-13 10:18:12',NULL),(6,'reisoh2771@gmail.com','$2b$10$0BKdNtkiLBLE0wlaCdTL/ueicMISernxEbuqQ0NbVEc5lYb8J/U86','2026-03-04 08:38:27','2026-03-11 10:26:32','Khôi Nguyên','teacher','active','2026-03-11 10:26:32',NULL),(7,'tramkhoinguyen.dev@gmail.com','$2b$10$cobvd8OLJn7kvxmc8nwOoub6AA2XA3FNPi4UyKxYL9XX1oT91YciK','2026-03-04 15:22:03','2026-03-13 09:06:10','Trầm Khôi Nguyên','admin','active','2026-03-13 09:06:10','/uploads/avatars/avatar-1772692875649-70945503.jpg'),(8,'tramkhoinguyen2701@gmail.com','$2b$10$o0x6YjQ5TftuE5OqeOERtOEamdlS.LkQKiqEbgH4V6saws1iSne3u','2026-03-05 15:33:41','2026-03-13 08:44:29','Nguyễn Văn Minh','technician','active','2026-03-13 08:44:29',NULL),(9,'vodangkhoa@tvu.edu.vn','$2b$10$XcvLXv6nXDAgRoXcckQQvu2m0iXvolk41SiQaabqauL8jFo6UImlK','2026-03-05 15:37:04','2026-03-11 13:37:52','Võ Đăng Khoa','manager','active','2026-03-11 13:37:52',NULL),(10,'meomeo@gmail.com','$2b$10$PFjgDJckTVWQix4Ei9HrnuWB5HHxsEBVp4mtnTJ5XABOsGY.xQyXe','2026-03-09 07:48:16','2026-03-09 10:38:45','Meo Meo','teacher','active','2026-03-09 10:29:39','/uploads/avatars/avatar-1773027525927-779504110.jpg'),(11,'meokt@gmail.com','$2b$10$N/QE2AJOf4OEl.RLEtFvReZktwkyLd1S90nTlClkJdyDy0/PjmGEO','2026-03-09 10:33:11','2026-03-09 10:35:35','Mèo Kỹ thuật','technician','active','2026-03-09 10:33:36','/uploads/avatars/avatar-1773027335827-445151863.jpg'),(12,'admin@example.com','$2b$10$8DYK/E8vlcCq1hFRltqoJeQa.fQbdPoA7N.pmfC73o8Jj4Z0FGrq2','2026-03-13 09:47:54','2026-03-13 09:47:54','nn','teacher','active',NULL,NULL),(13,'bhkhanh@tvu.edu.vn','$2b$10$HJ2YUvAUrGy/OIT5OQoUd.s/AHRf9Bmic4A324UBecTnKs/IAHsuG','2026-03-13 09:56:15','2026-03-13 09:56:15','Bùi Hữu Khánh','teacher','active',NULL,NULL),(14,'buitan@tvu.edu.vn','$2b$10$5A4IFJUXnOOvkG2o1YCxguAfbBjiRcmp8a3L9W4qk94EIhhxLZ0OW','2026-03-13 10:00:32','2026-03-13 10:00:32','Bùi Quốc Tần','teacher','active',NULL,NULL),(15,'btngan@tvu.edu.vn','$2b$10$Yh9JbpjF4npZZufjJCP4jOHdIokqSuaUlRO/2bvqoY89wGuYzDTr6','2026-03-13 10:03:39','2026-03-13 10:03:39','Bùi Thế Ngân','teacher','active',NULL,NULL),(16,'btcloan@tvu.edu.vn','$2b$10$pYV42bH7mcUMgCJpMPCXTuoDVdfgixLocwV.Wrrj1iP9oPs89Q.cu','2026-03-13 10:07:27','2026-03-13 10:07:27','Bùi Thị Cẩm Loan','teacher','active',NULL,NULL),(17,'buicat@tvu.edu.vn','$2b$10$4VF2Gr7g/cOuZUJqUH2LMuCZ11vK6vcEjrAKhFWf9kW/914h5OVVC','2026-03-13 10:09:18','2026-03-13 10:09:18','Bùi Văn Cất','teacher','active',NULL,NULL),(18,'ctbtram@tvu.edu.vn','$2b$10$57pY4KOc5XbrXLwWVGB4QOnNCtdTcbQR1xSdPRkqXDTAPzoL6jm5O','2026-03-13 10:11:02','2026-03-13 10:11:02','Châu Thị Bích Trâm','teacher','active',NULL,NULL),(19,'Cvngoan@tvu.edu.vn','$2b$10$IuWD2Sh1YunhW6O7ioMgWuBGbRlEiG8s2RNA684PhWnMsUMs7Fm7u','2026-03-13 10:12:16','2026-03-13 10:12:16','Châu Văn Ngoan','teacher','active',NULL,NULL),(20,'cttrang@tvu.edu.vn','$2b$10$SUhbK/lPL0m/4QR2UDxhcOUQHnj9UL0oJSYhYogypujjqKXBWUkLO','2026-03-13 10:13:47','2026-03-13 10:13:47','Chung Thùy Trang','teacher','active',NULL,NULL),(21,'dhnlan@tvu.edu.vn','$2b$10$I1Jadu6xqx1cxWEqJAvk.evJoaLYZhmGHmUjzLgk/m.kZ5ZdgZpP.','2026-03-13 10:15:13','2026-03-13 10:15:13','Dương Hiền Ngọc Lan','teacher','active',NULL,NULL),(22,'dhvu@tvu.edu.vn','$2b$10$vU7VTfmJrIZU3Rx9PgK4Re4FnZsj5O.LM0kIclwIzgx9ofBankkSy','2026-03-13 10:17:37','2026-03-13 10:17:37','Dương Hồ Vũ','teacher','active',NULL,NULL),(23,'dnpthao@tvu.edu.vn','$2b$10$TyK8K1cLK0LhTCSKLqSaJel0FbiqwXQJ.2yViEYkHIJbqR1NvYpm2','2026-03-13 10:20:15','2026-03-13 10:20:15','Dương Ngọc Phương Thảo','teacher','active',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_orders`
--

LOCK TABLES `work_orders` WRITE;
/*!40000 ALTER TABLE `work_orders` DISABLE KEYS */;
INSERT INTO `work_orders` VALUES (1,'WO-20260313-0001','kk','kk','kk','2026-03-18 07:00:00','2026-03-15 07:00:00','kk',3,NULL,7,'pending','2026-03-13 09:50:09','2026-03-13 09:50:09'),(2,'WO-20260313-0002','jj','jj','jj','2026-03-14 07:00:00','2026-03-16 07:00:00','jj',3,NULL,5,'pending','2026-03-13 09:50:54','2026-03-13 09:50:54'),(3,'WO-20260313-0003','Tham gia Hội thi Viết chữ đẹp cấp tỉnh dành cho học sinh tiểu học Năm học 2025-2026','Tham gia Hội thi Viết chữ đẹp cấp tỉnh dành cho học sinh tiểu học Năm học 2025-2026','Hội trường Sở GDĐT Vĩnh Long.','2026-03-14 07:00:00','2026-03-24 07:00:00','',3,NULL,5,'pending','2026-03-13 10:30:02','2026-03-13 10:30:02'),(4,'WO-20260313-0004','Hội giảng cấp tỉnh','Hội giảng cấp tỉnh','Trường THCS Tiểu Cần','2026-03-21 07:00:00','2026-03-22 07:00:00','',3,NULL,5,'pending','2026-03-13 10:31:07','2026-03-13 10:31:07'),(5,'WO-20260313-0005','Hội giảng cấp tỉnh','Hội giảng cấp tỉnh','Trường THCS Tiểu Cần','2026-03-21 07:00:00','2026-03-22 07:00:00','',3,NULL,5,'pending','2026-03-13 10:31:20','2026-03-13 10:31:20');
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

-- Dump completed on 2026-03-13 10:33:59
