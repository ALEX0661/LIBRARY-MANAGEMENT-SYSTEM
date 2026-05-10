<?php

class Auth {
  protected $pdo;

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  /* ── POST /api/auth/register ─────────────── */
  public function register() {
    $dt = json_decode(file_get_contents("php://input"));

    // --- Required field validation ---
    if (
      empty($dt->username) || empty($dt->email) ||
      empty($dt->password) || empty($dt->fname) || empty($dt->lname)
    ) {
      http_response_code(400);
      return [
        'status'  => 'error',
        'message' => 'Required fields: username, email, password, fname, lname',
      ];
    }

    if (!filter_var($dt->email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Invalid email format.'];
    }

    if (strlen($dt->password) < 8) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'Password must be at least 8 characters.'];
    }

    // --- Hash password (NOT encrypted, per requirement) ---
    $hashedPassword = password_hash($dt->password, PASSWORD_BCRYPT, ['cost' => 12]);

    // --- AES-256-GCM encrypt phone ---
    $phoneEnc = $phoneIv = $phoneTag = null;
    if (!empty($dt->phone)) {
      $enc = aesEncrypt($dt->phone);
      if ($enc) {
        $phoneEnc = $enc['ciphertext'];
        $phoneIv  = $enc['iv'];
        $phoneTag = $enc['tag'];
      }
    }

    // --- AES-256-GCM encrypt address ---
    $addrEnc = $addrIv = $addrTag = null;
    if (!empty($dt->address)) {
      $enc = aesEncrypt($dt->address);
      if ($enc) {
        $addrEnc = $enc['ciphertext'];
        $addrIv  = $enc['iv'];
        $addrTag = $enc['tag'];
      }
    }

    $values = [
      $dt->username,
      $dt->email,
      $hashedPassword,
      $dt->fname,
      $dt->mname ?? null,
      $dt->lname,
      $phoneEnc, $phoneIv, $phoneTag,
      $addrEnc,  $addrIv,  $addrTag,
    ];

    $result = execCmd("CALL InsertUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);

    if ($result === true) {
      http_response_code(201);
      return ['status' => 'success', 'message' => 'User registered successfully.'];
    }

    // Duplicate username/email gives a DB constraint error
    http_response_code(409);
    return [
      'status'  => 'error',
      'message' => $result['error'] ?? 'Registration failed. Username or email may already exist.',
    ];
  }


  /* ── POST /api/auth/login ────────────────── */
  public function login() {
    $dt = json_decode(file_get_contents("php://input"));

    if (empty($dt->email) || empty($dt->password)) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'email and password are required.'];
    }

    $result = execQuery("CALL getUserByEmail(?)", [$dt->email], $this->pdo);

    // Same generic message for missing user OR wrong password (prevents user enumeration)
    if (empty($result) || isset($result['error'])) {
      http_response_code(401);
      return ['status' => 'error', 'message' => 'Invalid credentials.'];
    }

    $user = $result[0];

    if (!password_verify($dt->password, $user['fld_password'])) {
      http_response_code(401);
      return ['status' => 'error', 'message' => 'Invalid credentials.'];
    }

    // --- Create session ---
    $sessionId = generateSessionId();
    $expiresAt = date('Y-m-d H:i:s', time() + (int)($_ENV['SESSION_LIFETIME'] ?? 86400));
    $ip        = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua        = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $sessionResult = execCmd(
      "CALL InsertSession(?, ?, ?, ?, ?)",
      [$sessionId, $user['fld_user_id'], $ip, $ua, $expiresAt],
      $this->pdo
    );

    if ($sessionResult !== true) {
      http_response_code(500);
      return ['status' => 'error', 'message' => 'Failed to create session.'];
    }

    return [
      'status'  => 'success',
      'message' => 'Login successful.',
      'data'    => [
        'session_id' => $sessionId,
        'expires_at' => $expiresAt,
        'user'       => [
          'user_id'  => $user['fld_user_id'],
          'username' => $user['fld_username'],
          'email'    => $user['fld_email'],
          'role'     => $user['fld_role'],
          'fname'    => $user['fld_fname'],
          'mname'    => $user['fld_mname'],
          'lname'    => $user['fld_lname'],
        ],
      ],
    ];
  }


  /* ── POST /api/auth/logout ───────────────── */
  public function logout() {
    $sessionId = getSessionIdFromHeader();

    if (!$sessionId) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'No session provided.'];
    }

    $result = execCmd("CALL DeleteSession(?)", [$sessionId], $this->pdo);

    if ($result === true) {
      return ['status' => 'success', 'message' => 'Logged out successfully.'];
    }

    http_response_code(500);
    return ['status' => 'error', 'message' => 'Logout failed.'];
  }
}
