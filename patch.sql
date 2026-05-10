-- ============================================================
--  library_service  –  PATCH v2: new + updated stored procedures
--  Run this in phpMyAdmin against the library_service database
--  after importing the original library_management.sql and
--  library_service.sql files.
-- ============================================================

-- ── Add description column to books if not already present ──
ALTER TABLE library_management.tbl_books
  MODIFY COLUMN `fld_total_copies` int(5) NOT NULL DEFAULT 1,
  MODIFY COLUMN `fld_avail_copies` int(5) NOT NULL DEFAULT 1;

-- ── Add is_active column to books for soft-delete support ───
ALTER TABLE library_management.tbl_books
  ADD COLUMN IF NOT EXISTS `fld_is_active` TINYINT(1) NOT NULL DEFAULT 1;

USE library_service;

DELIMITER $$

-- ── Dashboard stat counts ────────────────────────────────────
DROP PROCEDURE IF EXISTS getDashboardStats$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getDashboardStats` ()
BEGIN
    -- Auto-mark overdue loans before counting
    UPDATE library_management.tbl_loans
    SET fld_status = 'overdue'
    WHERE fld_status = 'borrowed' AND fld_due_date < CURDATE();

    SELECT
        (SELECT COUNT(*) FROM library_management.tbl_books WHERE fld_is_active = 1)                               AS total_books,
        (SELECT COUNT(*) FROM library_management.tbl_loans  WHERE fld_status = 'borrowed')                        AS active_loans,
        (SELECT COUNT(*) FROM library_management.tbl_loans  WHERE fld_status = 'overdue')                         AS overdue_items,
        (SELECT COUNT(*) FROM library_management.tbl_users  WHERE fld_role = 'member' AND fld_is_active = 1)      AS total_members,
        (SELECT COUNT(*) FROM library_management.tbl_loans  WHERE fld_loan_date = CURDATE())                      AS loans_today,
        (SELECT COUNT(*) FROM library_management.tbl_loans  WHERE fld_due_date  = CURDATE() AND fld_status = 'borrowed') AS due_today;
END$$


-- ── Get all active books ─────────────────────────────────────
DROP PROCEDURE IF EXISTS getBooks$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getBooks` ()
BEGIN
    SELECT * FROM library_management.tbl_books
    WHERE fld_is_active = 1
    ORDER BY fld_title ASC;
END$$


-- ── Get single book by ID ────────────────────────────────────
DROP PROCEDURE IF EXISTS getBookById$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getBookById` (IN `p_book_id` INT)
BEGIN
    SELECT * FROM library_management.tbl_books
    WHERE fld_book_id = p_book_id
      AND fld_is_active = 1
    LIMIT 1;
END$$


-- ── Search books by title/author/category ───────────────────
DROP PROCEDURE IF EXISTS searchBooks$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `searchBooks` (
    IN `p_search`   VARCHAR(255),
    IN `p_category` VARCHAR(100)
)
BEGIN
    SELECT * FROM library_management.tbl_books
    WHERE fld_is_active = 1
      AND (
            p_search = ''
            OR fld_title    LIKE CONCAT('%', p_search, '%')
            OR fld_author   LIKE CONCAT('%', p_search, '%')
            OR fld_isbn     LIKE CONCAT('%', p_search, '%')
          )
      AND (
            p_category = ''
            OR fld_category = p_category
          )
    ORDER BY fld_title ASC;
END$$


-- ── Insert book (updated: includes description param) ────────
DROP PROCEDURE IF EXISTS InsertBook$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `InsertBook` (
    IN `p_title`        VARCHAR(255),
    IN `p_author`       VARCHAR(255),
    IN `p_isbn`         VARCHAR(20),
    IN `p_category`     VARCHAR(100),
    IN `p_publisher`    VARCHAR(150),
    IN `p_year_pub`     YEAR,
    IN `p_total_copies` INT,
    IN `p_description`  TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        INSERT INTO library_management.tbl_books (
            `fld_title`, `fld_author`, `fld_isbn`,
            `fld_category`, `fld_publisher`, `fld_year_pub`,
            `fld_total_copies`, `fld_avail_copies`, `fld_description`
        )
        VALUES (
            p_title, p_author, p_isbn,
            p_category, p_publisher, p_year_pub,
            p_total_copies, p_total_copies, p_description
        );
    COMMIT;
END$$


-- ── Update book ──────────────────────────────────────────────
DROP PROCEDURE IF EXISTS UpdateBook$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `UpdateBook` (
    IN `p_book_id`      INT,
    IN `p_title`        VARCHAR(255),
    IN `p_author`       VARCHAR(255),
    IN `p_isbn`         VARCHAR(20),
    IN `p_category`     VARCHAR(100),
    IN `p_publisher`    VARCHAR(150),
    IN `p_year_pub`     YEAR,
    IN `p_total_copies` INT,
    IN `p_description`  TEXT
)
BEGIN
    DECLARE v_current_total  INT DEFAULT 0;
    DECLARE v_current_avail  INT DEFAULT 0;
    DECLARE v_new_avail      INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

        SELECT fld_total_copies, fld_avail_copies
        INTO v_current_total, v_current_avail
        FROM library_management.tbl_books
        WHERE fld_book_id = p_book_id AND fld_is_active = 1
        FOR UPDATE;

        -- Recalculate available copies when total changes
        IF p_total_copies IS NOT NULL THEN
            SET v_new_avail = v_current_avail + (p_total_copies - v_current_total);
            IF v_new_avail < 0 THEN
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'total_copies cannot be less than the number of currently borrowed copies.';
            END IF;
        ELSE
            SET p_total_copies = v_current_total;
            SET v_new_avail    = v_current_avail;
        END IF;

        UPDATE library_management.tbl_books
        SET
            fld_title        = p_title,
            fld_author       = p_author,
            fld_isbn         = COALESCE(p_isbn,        fld_isbn),
            fld_category     = COALESCE(p_category,    fld_category),
            fld_publisher    = COALESCE(p_publisher,   fld_publisher),
            fld_year_pub     = COALESCE(p_year_pub,    fld_year_pub),
            fld_total_copies = p_total_copies,
            fld_avail_copies = v_new_avail,
            fld_description  = COALESCE(p_description, fld_description)
        WHERE fld_book_id = p_book_id
          AND fld_is_active = 1;

    COMMIT;
END$$


-- ── Soft-delete book (marks inactive, blocks if active loans) ─
DROP PROCEDURE IF EXISTS DeleteBook$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `DeleteBook` (IN `p_book_id` INT)
BEGIN
    DECLARE v_active_loans INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

        SELECT COUNT(*) INTO v_active_loans
        FROM library_management.tbl_loans
        WHERE fld_book_id = p_book_id
          AND fld_status IN ('borrowed', 'overdue');

        IF v_active_loans > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Cannot delete book with active or overdue loans.';
        END IF;

        UPDATE library_management.tbl_books
        SET fld_is_active = 0
        WHERE fld_book_id = p_book_id;

    COMMIT;
END$$


-- ── Get a single loan with book & member info ────────────────
DROP PROCEDURE IF EXISTS getLoanById$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getLoanById` (IN `p_loan_id` INT)
BEGIN
    SELECT
        l.fld_loan_id,
        l.fld_user_id,
        l.fld_book_id,
        b.fld_title,
        b.fld_author,
        b.fld_isbn,
        CONCAT(u.fld_fname, ' ', u.fld_lname) AS member_name,
        u.fld_fname,
        u.fld_lname,
        l.fld_loan_date,
        l.fld_due_date,
        l.fld_return_date,
        l.fld_status,
        l.fld_date_created
    FROM library_management.tbl_loans l
    JOIN library_management.tbl_users u ON l.fld_user_id = u.fld_user_id
    JOIN library_management.tbl_books b ON l.fld_book_id = b.fld_book_id
    WHERE l.fld_loan_id = p_loan_id
    LIMIT 1;
END$$


-- ── Recent loans (dashboard) ─────────────────────────────────
DROP PROCEDURE IF EXISTS getRecentLoans$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getRecentLoans` ()
BEGIN
    SELECT
        l.fld_loan_id,
        b.fld_title,
        b.fld_author,
        CONCAT(u.fld_fname, ' ', u.fld_lname) AS member_name,
        l.fld_loan_date,
        l.fld_due_date,
        l.fld_return_date,
        l.fld_status
    FROM library_management.tbl_loans l
    JOIN library_management.tbl_users u ON l.fld_user_id = u.fld_user_id
    JOIN library_management.tbl_books b ON l.fld_book_id = b.fld_book_id
    ORDER BY l.fld_date_created DESC
    LIMIT 10;
END$$


-- ── All loans with join (admin panel) ───────────────────────
DROP PROCEDURE IF EXISTS getAllLoans$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getAllLoans` ()
BEGIN
    -- Auto-mark overdue first
    UPDATE library_management.tbl_loans
    SET fld_status = 'overdue'
    WHERE fld_status = 'borrowed' AND fld_due_date < CURDATE();

    SELECT
        l.fld_loan_id,
        l.fld_user_id,
        l.fld_book_id,
        b.fld_title,
        b.fld_author,
        b.fld_isbn,
        CONCAT(u.fld_fname, ' ', u.fld_lname) AS member_name,
        u.fld_fname,
        u.fld_lname,
        l.fld_loan_date,
        l.fld_due_date,
        l.fld_return_date,
        l.fld_status,
        l.fld_date_created
    FROM library_management.tbl_loans l
    JOIN library_management.tbl_users u ON l.fld_user_id = u.fld_user_id
    JOIN library_management.tbl_books b ON l.fld_book_id = b.fld_book_id
    ORDER BY l.fld_date_created DESC;
END$$


-- ── Return a loan ────────────────────────────────────────────
DROP PROCEDURE IF EXISTS ReturnLoan$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `ReturnLoan` (IN `p_loan_id` INT)
BEGIN
    DECLARE v_book_id INT DEFAULT 0;
    DECLARE v_status  VARCHAR(20) DEFAULT '';

    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

        SELECT fld_book_id, fld_status
        INTO v_book_id, v_status
        FROM library_management.tbl_loans
        WHERE fld_loan_id = p_loan_id
        FOR UPDATE;

        IF v_book_id = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Loan not found.';
        END IF;

        IF v_status = 'returned' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'This loan has already been returned.';
        END IF;

        UPDATE library_management.tbl_loans
        SET
            fld_status      = 'returned',
            fld_return_date = CURDATE()
        WHERE fld_loan_id = p_loan_id;

        UPDATE library_management.tbl_books
        SET fld_avail_copies = fld_avail_copies + 1
        WHERE fld_book_id = v_book_id;

    COMMIT;
END$$


-- ── Update password ──────────────────────────────────────────
DROP PROCEDURE IF EXISTS UpdatePassword$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `UpdatePassword` (
    IN `p_user_id`  INT,
    IN `p_password` VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
        UPDATE library_management.tbl_users
        SET fld_password = p_password
        WHERE fld_user_id = p_user_id;
    COMMIT;
END$$


-- ── Toggle member active/inactive status ─────────────────────
DROP PROCEDURE IF EXISTS ToggleUserStatus$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `ToggleUserStatus` (IN `p_user_id` INT)
BEGIN
    DECLARE v_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLWARNING, SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

        SELECT COUNT(*) INTO v_exists
        FROM library_management.tbl_users
        WHERE fld_user_id = p_user_id;

        IF v_exists = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'User not found.';
        END IF;

        UPDATE library_management.tbl_users
        SET fld_is_active = IF(fld_is_active = 1, 0, 1)
        WHERE fld_user_id = p_user_id;

    COMMIT;
END$$


-- ── Borrowed books report ────────────────────────────────────
DROP PROCEDURE IF EXISTS getBorrowedBooks$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getBorrowedBooks` ()
BEGIN
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


-- ── Mark overdue loans ───────────────────────────────────────
DROP PROCEDURE IF EXISTS markOverdueLoans$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `markOverdueLoans` ()
BEGIN
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


-- ── Overdue books report ─────────────────────────────────────
DROP PROCEDURE IF EXISTS getOverdueBooks$$
CREATE DEFINER=`grp5`@`localhost` PROCEDURE `getOverdueBooks` ()
BEGIN
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

DELIMITER ;
