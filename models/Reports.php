<?php

class Reports {
  protected $pdo;

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  /* ── GET /api/reports/stats ─────────────────────── */
  public function stats() {
    requireAuth($this->pdo);
    $result = execQuery("CALL getDashboardStats()", null, $this->pdo);
    if (empty($result) || isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch stats.'];
    }
    return ['status' => 'success', 'data' => $result[0]];
  }


  /* ── GET /api/reports/recent-loans ─────────────── */
  public function recentLoans() {
    requireAuth($this->pdo);
    $result = execQuery("CALL getRecentLoans()", null, $this->pdo);
    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch recent loans.'];
    }
    return ['status' => 'success', 'count' => count($result), 'data' => $result];
  }


  /* ── GET /api/reports/all-loans ─────────────────── */
  public function allLoans() {
    requireAuth($this->pdo);
    $result = execQuery("CALL getAllLoans()", null, $this->pdo);
    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch loans.'];
    }
    return ['status' => 'success', 'count' => count($result), 'data' => $result];
  }


  /* ── GET /api/admin/books ───────────────────────── */
  public function adminBooks() {
    requireAdmin($this->pdo);
    $result = execQuery("CALL getBooks()", null, $this->pdo);
    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch books.'];
    }
    return ['status' => 'success', 'count' => count($result), 'data' => $result];
  }


  /* ── GET /api/admin/members ─────────────────────── */
  public function adminMembers() {
    requireAdmin($this->pdo);
    $result = execQuery("CALL getUsers()", null, $this->pdo);
    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch members.'];
    }
    $members = array_map(function ($u) {
      return [
        'user_id'      => $u['fld_user_id'],
        'username'     => $u['fld_username'],
        'email'        => $u['fld_email'],
        'role'         => $u['fld_role'],
        'fname'        => $u['fld_fname'],
        'mname'        => $u['fld_mname'],
        'lname'        => $u['fld_lname'],
        'phone'        => aesDecrypt($u['fld_phone'],   $u['fld_phone_iv'],   $u['fld_phone_tag']),
        'address'      => aesDecrypt($u['fld_address'], $u['fld_address_iv'], $u['fld_address_tag']),
        'is_active'    => $u['fld_is_active'],
        'date_created' => $u['fld_date_created'],
      ];
    }, $result);
    return ['status' => 'success', 'count' => count($members), 'data' => $members];
  }


  /* ── GET /api/admin/loans ───────────────────────── */
  public function adminLoans() {
    requireAdmin($this->pdo);
    // Auto-mark overdue then return all loans with member & book info
    $result = execQuery("CALL getAllLoans()", null, $this->pdo);
    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch loans.'];
    }
    return ['status' => 'success', 'count' => count($result), 'data' => $result];
  }


  /* ── PUT /api/admin/members/{user_id}/status ────── */
  public function toggleMemberStatus($userId) {
    requireAdmin($this->pdo);

    if (!is_numeric($userId) || (int)$userId <= 0) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid user ID.'];
    }

    // Prevent admin from deactivating themselves
    // (session user_id is available from requireAdmin's return — call it again for the user_id)
    $session = requireAdmin($this->pdo);
    if ((int)$session['fld_user_id'] === (int)$userId) {
      http_response_code(403);
      return ['status' => 'error', 'message' => 'You cannot change your own account status.'];
    }

    $result = execCmd("CALL ToggleUserStatus(?)", [(int)$userId], $this->pdo);

    if ($result === true) {
      return ['status' => 'success', 'message' => 'Member status updated successfully.'];
    }

    http_response_code(404);
    return ['status' => 'error', 'message' => $result['error'] ?? 'Failed to update member status. User may not exist.'];
  }


  /* ── GET /api/reports/borrowed-books ────────────── */
  public function borrowedBooks() {
    requireAdmin($this->pdo);
    $result = execQuery("CALL getBorrowedBooks()", null, $this->pdo);
    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch borrowed books.'];
    }
    return ['status' => 'success', 'count' => count($result), 'data' => $result];
  }


  /* ── GET /api/reports/overdue-books ─────────────── */
  public function overdueBooks() {
    requireAdmin($this->pdo);
    execCmd("CALL markOverdueLoans()", null, $this->pdo);
    $result = execQuery("CALL getOverdueBooks()", null, $this->pdo);
    if (isset($result['error'])) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to fetch overdue books.'];
    }
    return ['status' => 'success', 'count' => count($result), 'data' => $result];
  }
}
