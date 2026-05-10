-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 05:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `library_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_books`
--

CREATE TABLE `tbl_books` (
  `fld_book_id` int(11) NOT NULL,
  `fld_title` varchar(255) NOT NULL,
  `fld_author` varchar(255) NOT NULL,
  `fld_isbn` varchar(20) DEFAULT NULL,
  `fld_category` varchar(100) DEFAULT NULL,
  `fld_publisher` varchar(150) DEFAULT NULL,
  `fld_year_pub` year(4) DEFAULT NULL,
  `fld_total_copies` int(5) NOT NULL DEFAULT 1,
  `fld_avail_copies` int(5) NOT NULL DEFAULT 1,
  `fld_description` text DEFAULT NULL,
  `fld_date_added` timestamp NOT NULL DEFAULT current_timestamp(),
  `fld_date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `tbl_books`
--

INSERT INTO `tbl_books` (`fld_book_id`, `fld_title`, `fld_author`, `fld_isbn`, `fld_category`, `fld_publisher`, `fld_year_pub`, `fld_total_copies`, `fld_avail_copies`, `fld_description`, `fld_date_added`, `fld_date_updated`) VALUES
(1, 'Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 'Prentice Hall', '2008', 3, 1, 'A handbook of agile software craftsmanship.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(2, 'The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Technology', 'Addison-Wesley', '1999', 2, 2, 'From journeyman to master. A guide to software development.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(3, 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Mathematics', 'MIT Press', '2009', 2, 1, 'The comprehensive textbook on algorithms and data structures.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(4, '1984', 'George Orwell', '9780451524935', 'Fiction', 'Signet Classic', '1949', 5, 3, 'A dystopian novel about totalitarianism and surveillance.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(5, 'Sapiens', 'Yuval N. Harari', '9780062316097', 'Non-Fiction', 'Harper', '2011', 3, 3, 'A brief history of humankind.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(6, 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 'Scribner', '1925', 4, 3, 'A story of the mysteriously wealthy Jay Gatsby.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(7, 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Non-Fiction', 'Farrar Straus Giroux', '2011', 2, 2, 'Explores the two systems that drive the way we think.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(8, 'Computer Networks', 'Andrew S. Tanenbaum', '9780132126953', 'Technology', 'Pearson', '2010', 2, 2, 'A top-down approach to computer networking.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(9, 'Discrete Mathematics', 'Kenneth H. Rosen', '9780073383095', 'Mathematics', 'McGraw-Hill', '2011', 3, 3, 'Covers logic, sets, functions, relations, and graph theory.', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(10, 'The Alchemist', 'Paulo Coelho', '9780062315007', 'Fiction', 'HarperOne', '1988', 4, 4, 'A philosophical novel about following your dreams.', '2026-03-01 16:35:30', '2026-03-01 16:35:30');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_loans`
--

CREATE TABLE `tbl_loans` (
  `fld_loan_id` int(11) NOT NULL,
  `fld_user_id` int(11) NOT NULL,
  `fld_book_id` int(11) NOT NULL,
  `fld_loan_date` date NOT NULL,
  `fld_due_date` date NOT NULL,
  `fld_return_date` date DEFAULT NULL,
  `fld_status` enum('borrowed','returned','overdue') NOT NULL DEFAULT 'borrowed',
  `fld_date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `fld_date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_loans`
--

INSERT INTO `tbl_loans` (`fld_loan_id`, `fld_user_id`, `fld_book_id`, `fld_loan_date`, `fld_due_date`, `fld_return_date`, `fld_status`, `fld_date_created`, `fld_date_updated`) VALUES
(1, 2, 1, '2026-02-20', '2026-03-06', NULL, 'borrowed', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(2, 3, 3, '2026-02-22', '2026-03-08', NULL, 'borrowed', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(3, 4, 4, '2026-02-25', '2026-03-11', NULL, 'borrowed', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(4, 5, 6, '2026-02-26', '2026-03-12', NULL, 'borrowed', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(5, 2, 4, '2026-02-01', '2026-02-15', NULL, 'overdue', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(6, 3, 1, '2026-02-03', '2026-02-17', NULL, 'overdue', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(7, 4, 2, '2026-01-10', '2026-01-24', '2026-01-22', 'returned', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(8, 5, 5, '2026-01-15', '2026-01-29', '2026-01-28', 'returned', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(9, 2, 7, '2026-01-20', '2026-02-03', '2026-02-01', 'returned', '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(10, 3, 10, '2026-01-25', '2026-02-08', '2026-02-07', 'returned', '2026-03-01 16:35:30', '2026-03-01 16:35:30');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sessions`
--

CREATE TABLE `tbl_sessions` (
  `fld_session_id` varchar(128) NOT NULL,
  `fld_user_id` int(11) NOT NULL,
  `fld_ip_address` varchar(45) DEFAULT NULL,
  `fld_user_agent` text DEFAULT NULL,
  `fld_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fld_expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_sessions`
--

INSERT INTO `tbl_sessions` (`fld_session_id`, `fld_user_id`, `fld_ip_address`, `fld_user_agent`, `fld_created_at`, `fld_expires_at`) VALUES
('sess_abc123def456abc123def456abc123de', 2, '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2026-03-02 00:00:00', '2026-12-31 23:59:59'),
('sess_xyz789uvw012xyz789uvw012xyz789uv', 3, '192.168.1.11', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '2026-03-02 01:00:00', '2026-12-31 23:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `fld_user_id` int(11) NOT NULL,
  `fld_username` varchar(50) NOT NULL,
  `fld_email` varchar(150) NOT NULL,
  `fld_password` varchar(255) NOT NULL,
  `fld_role` enum('admin','member') NOT NULL DEFAULT 'member',
  `fld_fname` varchar(100) NOT NULL,
  `fld_mname` varchar(100) DEFAULT NULL,
  `fld_lname` varchar(100) NOT NULL,
  `fld_phone` text DEFAULT NULL,
  `fld_phone_iv` varchar(24) DEFAULT NULL,
  `fld_phone_tag` varchar(32) DEFAULT NULL,
  `fld_address` text DEFAULT NULL,
  `fld_address_iv` varchar(24) DEFAULT NULL,
  `fld_address_tag` varchar(32) DEFAULT NULL,
  `fld_is_active` tinyint(1) NOT NULL DEFAULT 1,
  `fld_date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `fld_date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`fld_user_id`, `fld_username`, `fld_email`, `fld_password`, `fld_role`, `fld_fname`, `fld_mname`, `fld_lname`, `fld_phone`, `fld_phone_iv`, `fld_phone_tag`, `fld_address`, `fld_address_iv`, `fld_address_tag`, `fld_is_active`, `fld_date_created`, `fld_date_updated`) VALUES
(1, 'admin', 'admin@library.com', '$2y$12$4dCBFDXYDkDlDi1GL3VeEuZAr3V7EHJmw8raK5cFBk.IVqpuLN9ti', 'admin', 'James', NULL, 'Santos', 'U2FsdGVkX19xYWJjZGVmZ2g=', 'a1b2c3d4e5f6a1b2c3d4e5f6', 'aabbccddeeff00112233445566778899', 'U2FsdGVkX19xYWJjMTIzNDU2', 'b2c3d4e5f6a1b2c3d4e5f6a1', 'bbccddeeff001122334455667788990a', 1, '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(2, 'mjreyes', 'maria.reyes@email.com', '$2y$12$4dCBFDXYDkDlDi1GL3VeEuZAr3V7EHJmw8raK5cFBk.IVqpuLN9ti', 'member', 'Maria', 'Jose', 'Reyes', 'U2FsdGVkX19hYmNkZWZnaA==', 'c3d4e5f6a1b2c3d4e5f6a1b2', 'ccddeeff001122334455667788990abb', 'U2FsdGVkX19hYmMxMjM0NTY=', 'd4e5f6a1b2c3d4e5f6a1b2c3', 'ddeeff001122334455667788990abbcc', 1, '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(3, 'jdcruz', 'juan.cruz@email.com', '$2y$12$4dCBFDXYDkDlDi1GL3VeEuZAr3V7EHJmw8raK5cFBk.IVqpuLN9ti', 'member', 'Juan', 'Dela', 'Cruz', 'U2FsdGVkX19iY2RlZmdoaQ==', 'e5f6a1b2c3d4e5f6a1b2c3d4', 'eeff001122334455667788990abbccdd', 'U2FsdGVkX19iY2QyMzQ1Njc=', 'f6a1b2c3d4e5f6a1b2c3d4e5', 'ff001122334455667788990abbccddee', 1, '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(4, 'agluna', 'anna.luna@email.com', '$2y$12$4dCBFDXYDkDlDi1GL3VeEuZAr3V7EHJmw8raK5cFBk.IVqpuLN9ti', 'member', 'Anna', 'Grace', 'Luna', 'U2FsdGVkX19jZGVmZ2hpag==', 'a1f6b2e5c3d4a1f6b2e5c3d4', '001122334455667788990abbccddeeff', 'U2FsdGVkX19jZGUzNDU2Nzg=', 'b2a1c3f6d4e5b2a1c3f6d4e5', '1122334455667788990abbccddeeff00', 1, '2026-03-01 16:35:30', '2026-03-01 16:35:30'),
(5, 'rbmendoza', 'rico.mendoza@email.com', '$2y$12$4dCBFDXYDkDlDi1GL3VeEuZAr3V7EHJmw8raK5cFBk.IVqpuLN9ti', 'member', 'Rico', 'Bautista', 'Mendoza', 'U2FsdGVkX19kZWZnaGlqaw==', 'c3b2d4a1e5f6c3b2d4a1e5f6', '2233445566778899aabbccddeeff0011', 'U2FsdGVkX19kZWY0NTY3ODk=', 'd4c3e5b2f6a1d4c3e5b2f6a1', '33445566778899aabbccddeeff001122', 1, '2026-03-01 16:35:30', '2026-03-01 16:35:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_books`
--
ALTER TABLE `tbl_books`
  ADD PRIMARY KEY (`fld_book_id`),
  ADD UNIQUE KEY `uq_isbn` (`fld_isbn`);

--
-- Indexes for table `tbl_loans`
--
ALTER TABLE `tbl_loans`
  ADD PRIMARY KEY (`fld_loan_id`),
  ADD KEY `idx_loans_user_id` (`fld_user_id`),
  ADD KEY `idx_loans_book_id` (`fld_book_id`),
  ADD KEY `idx_loans_status` (`fld_status`);

--
-- Indexes for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  ADD PRIMARY KEY (`fld_session_id`),
  ADD KEY `idx_sessions_user_id` (`fld_user_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`fld_user_id`),
  ADD UNIQUE KEY `uq_username` (`fld_username`),
  ADD UNIQUE KEY `uq_email` (`fld_email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_books`
--
ALTER TABLE `tbl_books`
  MODIFY `fld_book_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_loans`
--
ALTER TABLE `tbl_loans`
  MODIFY `fld_loan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `fld_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_loans`
--
ALTER TABLE `tbl_loans`
  ADD CONSTRAINT `fk_loans_book` FOREIGN KEY (`fld_book_id`) REFERENCES `tbl_books` (`fld_book_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_loans_user` FOREIGN KEY (`fld_user_id`) REFERENCES `tbl_users` (`fld_user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`fld_user_id`) REFERENCES `tbl_users` (`fld_user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
