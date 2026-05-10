<?php

class Loans {
  protected $pdo;

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  /* ── POST /api/loans ────────────────────────────── */
  public function createLoan() {
    requireAuth($this->pdo);
    $dt = json_decode(file_get_contents("php://input"));

    if (empty($dt->user_id) || empty($dt->book_id) || empty($dt->loan_date) || empty($dt->due_date)) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Required: user_id, book_id, loan_date, due_date (YYYY-MM-DD).'];
    }

    $loanDate = date('Y-m-d', strtotime($dt->loan_date));
    $dueDate  = date('Y-m-d', strtotime($dt->due_date));

    if ($loanDate === '1970-01-01' || $dueDate === '1970-01-01') {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid date format. Use YYYY-MM-DD.'];
    }
    if ($dueDate <= $loanDate) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'due_date must be after loan_date.'];
    }

    $result = execCmd(
      "CALL InsertLoan(?, ?, ?, ?)",
      [(int)$dt->user_id, (int)$dt->book_id, $loanDate, $dueDate],
      $this->pdo
    );

    if ($result === true) {
      http_response_code(201);
      return ['status' => 'success', 'message' => 'Loan created successfully.'];
    }
    http_response_code(409);
    return ['status' => 'error', 'message' => $result['error'] ?? 'No available copies for this book.'];
  }


  /* ── GET /api/loans/{loan_id} ───────────────────── */
  public function getLoanById($loanId) {
    requireAuth($this->pdo);

    if (!is_numeric($loanId) || (int)$loanId <= 0) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid loan ID.'];
    }

    $result = execQuery("CALL getLoanById(?)", [(int)$loanId], $this->pdo);

    if (empty($result) || isset($result['error'])) {
      http_response_code(404);
      return ['status' => 'error', 'message' => 'Loan not found.'];
    }

    return ['status' => 'success', 'data' => $result[0]];
  }


  /* ── GET /api/loans/user/{user_id} ─────────────── */
  public function getLoansByUser($userId) {
    requireAuth($this->pdo);

    if (!is_numeric($userId) || (int)$userId <= 0) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid user ID.'];
    }

    $result = execQuery("CALL getLoansByUser(?)", [(int)$userId], $this->pdo);

    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch loans.'];
    }

    return ['status' => 'success', 'count' => count($result), 'data' => $result];
  }


  /* ── PUT /api/loans/{loan_id}/return ────────────── */
  public function returnLoan($loanId) {
    requireAuth($this->pdo);

    if (!is_numeric($loanId) || (int)$loanId <= 0) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid loan ID.'];
    }

    $result = execCmd("CALL ReturnLoan(?)", [(int)$loanId], $this->pdo);

    if ($result === true) {
      return ['status' => 'success', 'message' => 'Book returned successfully.'];
    }
    http_response_code(409);
    return ['status' => 'error', 'message' => $result['error'] ?? 'Failed to return loan.'];
  }
}
