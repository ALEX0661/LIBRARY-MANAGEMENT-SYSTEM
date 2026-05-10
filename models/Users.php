<?php

class Users {
  protected $pdo;

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  /* ── GET /api/users/profile ─────────────────────── */
  public function getProfile() {
    $session = requireAuth($this->pdo);
    $userId  = $session['fld_user_id'];

    $result = execQuery("CALL getUserById(?)", [$userId], $this->pdo);

    if (empty($result) || isset($result['error'])) {
      http_response_code(404);
      return ['status' => 'error', 'message' => 'User not found.'];
    }

    $user = $result[0];

    return [
      'status' => 'success',
      'data'   => [
        'user_id'      => $user['fld_user_id'],
        'username'     => $user['fld_username'],
        'email'        => $user['fld_email'],
        'role'         => $user['fld_role'],
        'fname'        => $user['fld_fname'],
        'mname'        => $user['fld_mname'],
        'lname'        => $user['fld_lname'],
        'phone'        => aesDecrypt($user['fld_phone'],   $user['fld_phone_iv'],   $user['fld_phone_tag']),
        'address'      => aesDecrypt($user['fld_address'], $user['fld_address_iv'], $user['fld_address_tag']),
        'date_created' => $user['fld_date_created'],
      ],
    ];
  }


  /* ── PUT /api/users/profile ─────────────────────── */
  public function updateProfile() {
    $session = requireAuth($this->pdo);
    $userId  = $session['fld_user_id'];
    $dt      = json_decode(file_get_contents("php://input"));

    if (empty($dt->fname) || empty($dt->lname)) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'fname and lname are required.'];
    }

    // Encrypt phone
    $phoneEnc = $phoneIv = $phoneTag = null;
    if (!empty($dt->phone)) {
      $enc = aesEncrypt($dt->phone);
      if ($enc) {
        $phoneEnc = $enc['ciphertext'];
        $phoneIv  = $enc['iv'];
        $phoneTag = $enc['tag'];
      }
    }

    // Encrypt address
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
      $userId,
      trim($dt->fname),
      $dt->mname ?? null,
      trim($dt->lname),
      $phoneEnc, $phoneIv, $phoneTag,
      $addrEnc,  $addrIv,  $addrTag,
    ];

    $result = execCmd("CALL UpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);

    if ($result === true) {
      return ['status' => 'success', 'message' => 'Profile updated successfully.'];
    }

    http_response_code(500);
    return ['status' => 'error', 'message' => $result['error'] ?? 'Profile update failed.'];
  }


  /* ── PUT /api/users/change-password ─────────────── */
  public function changePassword() {
    $session = requireAuth($this->pdo);
    $userId  = $session['fld_user_id'];
    $dt      = json_decode(file_get_contents("php://input"));

    if (empty($dt->current_password) || empty($dt->new_password)) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'current_password and new_password are required.'];
    }

    if (strlen($dt->new_password) < 8) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'new_password must be at least 8 characters.'];
    }

    if ($dt->current_password === $dt->new_password) {
      http_response_code(400);
      return ['status' => 'error', 'message' => 'New password must differ from current password.'];
    }

    // Fetch the stored hash
    $result = execQuery("CALL getUserById(?)", [$userId], $this->pdo);

    if (empty($result) || isset($result['error'])) {
      http_response_code(404);
      return ['status' => 'error', 'message' => 'User not found.'];
    }

    $user = $result[0];

    if (!password_verify($dt->current_password, $user['fld_password'])) {
      http_response_code(401);
      return ['status' => 'error', 'message' => 'Current password is incorrect.'];
    }

    $newHash = password_hash($dt->new_password, PASSWORD_BCRYPT, ['cost' => 12]);

    $updated = execCmd("CALL UpdatePassword(?, ?)", [$userId, $newHash], $this->pdo);

    if ($updated === true) {
      return ['status' => 'success', 'message' => 'Password changed successfully.'];
    }

    http_response_code(500);
    return ['status' => 'error', 'message' => 'Password update failed.'];
  }
}
