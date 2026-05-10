-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 05:43 PM
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
-- Database: `library_service`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `DeleteSession` (IN `p_session_id` VARCHAR(128))   BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        DELETE FROM library_management.tbl_sessions
        WHERE fld_session_id = p_session_id;
    COMMIT;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getBookById` (IN `p_book_id` INT)   BEGIN
    SELECT *
    FROM library_management.tbl_books
    WHERE fld_book_id = p_book_id
    LIMIT 1;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getBooks` ()   BEGIN
    SELECT *
    FROM library_management.tbl_books;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getBorrowedBooks` ()   BEGIN
    SELECT
        l.fld_loan_id,
        u.fld_user_id,
        u.fld_fname,
        u.fld_lname,
        b.fld_book_id,
        b.fld_title,
        b.fld_author,
        l.fld_loan_date,
        l.fld_due_date,
        l.fld_status
    FROM library_management.tbl_loans l
    JOIN library_management.tbl_users u ON l.fld_user_id = u.fld_user_id
    JOIN library_management.tbl_books b ON l.fld_book_id = b.fld_book_id
    WHERE l.fld_status = 'borrowed'
    ORDER BY l.fld_loan_date DESC;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getLoansByUser` (IN `p_user_id` INT)   BEGIN
    SELECT
        l.fld_loan_id,
        l.fld_user_id,
        b.fld_title,
        b.fld_author,
        l.fld_loan_date,
        l.fld_due_date,
        l.fld_return_date,
        l.fld_status
    FROM library_management.tbl_loans l
    JOIN library_management.tbl_books b ON l.fld_book_id = b.fld_book_id
    WHERE l.fld_user_id = p_user_id
    ORDER BY l.fld_loan_date DESC;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getOverdueBooks` ()   BEGIN
    SELECT
        l.fld_loan_id,
        u.fld_user_id,
        u.fld_fname,
        u.fld_lname,
        b.fld_book_id,
        b.fld_title,
        b.fld_author,
        l.fld_loan_date,
        l.fld_due_date,
        l.fld_status
    FROM library_management.tbl_loans l
    JOIN library_management.tbl_users u ON l.fld_user_id = u.fld_user_id
    JOIN library_management.tbl_books b ON l.fld_book_id = b.fld_book_id
    WHERE l.fld_status = 'overdue'
    ORDER BY l.fld_due_date ASC;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `GetSessionById` (IN `p_session_id` VARCHAR(128))   BEGIN
    SELECT
        s.fld_session_id,
        s.fld_user_id,
        s.fld_expires_at,
        u.fld_role,
        u.fld_is_active
    FROM library_management.tbl_sessions s
    JOIN library_management.tbl_users u
        ON s.fld_user_id = u.fld_user_id
    WHERE s.fld_session_id = p_session_id
      AND s.fld_expires_at  > NOW()
      AND u.fld_is_active   = 1
    LIMIT 1;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getUserByEmail` (IN `p_email` VARCHAR(150))   BEGIN
    SELECT *
    FROM library_management.tbl_users
    WHERE fld_email    = p_email
      AND fld_is_active = 1
    LIMIT 1;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getUserById` (IN `p_user_id` INT)   BEGIN
    SELECT *
    FROM library_management.tbl_users
    WHERE fld_user_id  = p_user_id
      AND fld_is_active = 1
    LIMIT 1;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getUsers` ()   BEGIN
    SELECT *
    FROM library_management.tbl_users;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `InsertBook` (IN `p_title` VARCHAR(255), IN `p_author` VARCHAR(255), IN `p_isbn` VARCHAR(20), IN `p_category` VARCHAR(100), IN `p_publisher` VARCHAR(150), IN `p_year_pub` YEAR, IN `p_total_copies` INT)   BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        INSERT INTO library_management.tbl_books (
            `fld_title`, `fld_author`, `fld_isbn`,
            `fld_category`, `fld_publisher`, `fld_year_pub`,
            `fld_total_copies`, `fld_avail_copies`
        )
        VALUES (
            p_title, p_author, p_isbn,
            p_category, p_publisher, p_year_pub,
            p_total_copies, p_total_copies
        );
    COMMIT;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `InsertLoan` (IN `p_user_id` INT, IN `p_book_id` INT, IN `p_loan_date` DATE, IN `p_due_date` DATE)   BEGIN
    DECLARE v_avail INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

        SELECT fld_avail_copies INTO v_avail
        FROM library_management.tbl_books
        WHERE fld_book_id = p_book_id
        FOR UPDATE;

        IF v_avail > 0 THEN
            INSERT INTO library_management.tbl_loans (
                `fld_user_id`, `fld_book_id`,
                `fld_loan_date`, `fld_due_date`
            )
            VALUES (p_user_id, p_book_id, p_loan_date, p_due_date);

            UPDATE library_management.tbl_books
            SET fld_avail_copies = fld_avail_copies - 1
            WHERE fld_book_id = p_book_id;
        ELSE
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'No available copies for this book.';
        END IF;

    COMMIT;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `InsertSession` (IN `p_session_id` VARCHAR(128), IN `p_user_id` INT, IN `p_ip_address` VARCHAR(45), IN `p_user_agent` TEXT, IN `p_expires_at` DATETIME)   BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        INSERT INTO library_management.tbl_sessions (
            `fld_session_id`, `fld_user_id`,
            `fld_ip_address`, `fld_user_agent`,
            `fld_expires_at`
        )
        VALUES (
            p_session_id, p_user_id,
            p_ip_address, p_user_agent,
            p_expires_at
        );
    COMMIT;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `InsertUser` (IN `p_username` VARCHAR(50), IN `p_email` VARCHAR(150), IN `p_password` VARCHAR(255), IN `p_fname` VARCHAR(100), IN `p_mname` VARCHAR(100), IN `p_lname` VARCHAR(100), IN `p_phone` TEXT, IN `p_phone_iv` VARCHAR(24), IN `p_phone_tag` VARCHAR(32), IN `p_address` TEXT, IN `p_address_iv` VARCHAR(24), IN `p_address_tag` VARCHAR(32))   BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        INSERT INTO library_management.tbl_users (
            `fld_username`, `fld_email`, `fld_password`,
            `fld_fname`, `fld_mname`, `fld_lname`,
            `fld_phone`, `fld_phone_iv`, `fld_phone_tag`,
            `fld_address`, `fld_address_iv`, `fld_address_tag`
        )
        VALUES (
            p_username, p_email, p_password,
            p_fname, p_mname, p_lname,
            p_phone, p_phone_iv, p_phone_tag,
            p_address, p_address_iv, p_address_tag
        );
    COMMIT;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `markOverdueLoans` ()   BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        UPDATE library_management.tbl_loans
        SET fld_status = 'overdue'
        WHERE fld_status  = 'borrowed'
          AND fld_due_date < CURDATE();
    COMMIT;
END$$

CREATE DEFINER=`grp5`@`localhost` PROCEDURE `UpdateUser` (IN `p_user_id` INT, IN `p_fname` VARCHAR(100), IN `p_mname` VARCHAR(100), IN `p_lname` VARCHAR(100), IN `p_phone` TEXT, IN `p_phone_iv` VARCHAR(24), IN `p_phone_tag` VARCHAR(32), IN `p_address` TEXT, IN `p_address_iv` VARCHAR(24), IN `p_address_tag` VARCHAR(32))   BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        UPDATE library_management.tbl_users
        SET
            fld_fname       = p_fname,
            fld_mname       = p_mname,
            fld_lname       = p_lname,
            fld_phone       = COALESCE(p_phone,       fld_phone),
            fld_phone_iv    = COALESCE(p_phone_iv,    fld_phone_iv),
            fld_phone_tag   = COALESCE(p_phone_tag,   fld_phone_tag),
            fld_address     = COALESCE(p_address,     fld_address),
            fld_address_iv  = COALESCE(p_address_iv,  fld_address_iv),
            fld_address_tag = COALESCE(p_address_tag, fld_address_tag)
        WHERE fld_user_id = p_user_id;
    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_test`
--

CREATE TABLE `tbl_test` (
  `fld_id` int(11) NOT NULL,
  `fld_label` varchar(100) NOT NULL,
  `fld_created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_test`
--

INSERT INTO `tbl_test` (`fld_id`, `fld_label`, `fld_created_at`) VALUES
(1, 'library_service initialized', '2026-03-01 16:35:31'),
(2, 'routines housed here', '2026-03-01 16:35:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_test`
--
ALTER TABLE `tbl_test`
  ADD PRIMARY KEY (`fld_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_test`
--
ALTER TABLE `tbl_test`
  MODIFY `fld_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
