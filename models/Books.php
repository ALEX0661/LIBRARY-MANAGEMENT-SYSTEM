<?php

class Books {
  protected $pdo;

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  /* ── GET /api/books ─────────────────────────────── */
  public function getBooks() {
    // Optional search/filter via query string: ?search=title&category=X
    $search   = $_GET['search']   ?? null;
    $category = $_GET['category'] ?? null;

    if ($search || $category) {
      $result = execQuery(
        "CALL searchBooks(?, ?)",
        [$search ?? '', $category ?? ''],
        $this->pdo
      );
    } else {
      $result = execQuery("CALL getBooks()", null, $this->pdo);
    }

    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch books.'];
    }

    return [
      'status' => 'success',
      'count'  => count($result),
      'data'   => $result,
    ];
  }


  /* ── GET /api/books/{book_id} ───────────────────── */
  public function getBookById($bookId) {
    if (!is_numeric($bookId) || (int)$bookId <= 0) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid book ID.'];
    }

    $result = execQuery("CALL getBookById(?)", [(int)$bookId], $this->pdo);

    if (empty($result) || isset($result['error'])) {
      http_response_code(404);
      return ['status' => 'error', 'message' => 'Book not found.'];
    }

    return ['status' => 'success', 'data' => $result[0]];
  }


  /* ── POST /api/books  (admin only) ─────────────── */
  public function addBook() {
    requireAdmin($this->pdo);

    $dt = json_decode(file_get_contents("php://input"));

    if (empty($dt->title) || empty($dt->author)) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'title and author are required.'];
    }

    $totalCopies = isset($dt->total_copies) ? (int)$dt->total_copies : 1;
    if ($totalCopies < 1) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'total_copies must be at least 1.'];
    }

    if (!empty($dt->year_pub)) {
      $y = (int)$dt->year_pub;
      if ($y < 1000 || $y > (int)date('Y')) {
        http_response_code(400);
        return ['status' => 'error', 'message' => 'year_pub is not a valid year.'];
      }
    }

    $values = [
      trim($dt->title),
      trim($dt->author),
      $dt->isbn        ?? null,
      $dt->category    ?? null,
      $dt->publisher   ?? null,
      $dt->year_pub    ?? null,
      $totalCopies,
      $dt->description ?? null,
    ];

    $result = execCmd("CALL InsertBook(?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);

    if ($result === true) {
      http_response_code(201);
      return ['status' => 'success', 'message' => 'Book added successfully.'];
    }

    http_response_code(409);
    return [
      'status'  => 'error',
      'message' => $result['error'] ?? 'Failed to add book. ISBN may already exist.',
    ];
  }


  /* ── PUT /api/books/{book_id}  (admin only) ─────── */
  public function updateBook($bookId) {
    requireAdmin($this->pdo);

    if (!is_numeric($bookId) || (int)$bookId <= 0) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid book ID.'];
    }

    $dt = json_decode(file_get_contents("php://input"));

    if (empty($dt->title) || empty($dt->author)) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'title and author are required.'];
    }

    if (!empty($dt->year_pub)) {
      $y = (int)$dt->year_pub;
      if ($y < 1000 || $y > (int)date('Y')) {
        http_response_code(400);
        return ['status' => 'error', 'message' => 'year_pub is not a valid year.'];
      }
    }

    if (!empty($dt->total_copies) && (int)$dt->total_copies < 1) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'total_copies must be at least 1.'];
    }

    $values = [
      (int)$bookId,
      trim($dt->title),
      trim($dt->author),
      $dt->isbn        ?? null,
      $dt->category    ?? null,
      $dt->publisher   ?? null,
      $dt->year_pub    ?? null,
      isset($dt->total_copies) ? (int)$dt->total_copies : null,
      $dt->description ?? null,
    ];

    $result = execCmd("CALL UpdateBook(?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);

    if ($result === true) {
      return ['status' => 'success', 'message' => 'Book updated successfully.'];
    }

    http_response_code(isset($result['error']) ? 409 : 404);
    return [
      'status'  => 'error',
      'message' => $result['error'] ?? 'Failed to update book.',
    ];
  }


  /* ── DELETE /api/books/{book_id}  (admin only) ─── */
  public function deleteBook($bookId) {
    requireAdmin($this->pdo);

    if (!is_numeric($bookId) || (int)$bookId <= 0) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid book ID.'];
    }

    $result = execCmd("CALL DeleteBook(?)", [(int)$bookId], $this->pdo);

    if ($result === true) {
      return ['status' => 'success', 'message' => 'Book deleted successfully.'];
    }

    http_response_code(409);
    return [
      'status'  => 'error',
      'message' => $result['error'] ?? 'Failed to delete book. It may have active loans.',
    ];
  }
}
