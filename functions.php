<?php

/* ─────────────────────────────────────────────
 |  Encryption Key
 |  Loaded from .env as a 64-char hex string
 |  representing 32 bytes (AES-256)
 ───────────────────────────────────────────── */
define('ENCRYPTION_KEY', hex2bin($_ENV['ENCRYPTION_KEY']));


/* ─────────────────────────────────────────────
 |  execQuery  –  for SELECT / stored procs
 |  that return result sets
 ───────────────────────────────────────────── */
function execQuery($sql, $values, $pdo) {
  $data = [];
  $stmt = $pdo->prepare($sql);
  try {
    $stmt->execute($values ?? []);
    if ($stmt->rowCount() > 0) {
      if ($res = $stmt->fetchAll()) {
        $data = $res;
      }
      $stmt->closeCursor();
    }
  } catch (\PDOException $er) {
    http_response_code(500);
    return ['error' => $er->getMessage()];
  }
  return $data;
}


/* ─────────────────────────────────────────────
 |  execCmd  –  for INSERT / UPDATE / DELETE
 |  stored procs that do NOT return rows
 ───────────────────────────────────────────── */
function execCmd($sql, $values, $pdo) {
  $stmt = $pdo->prepare($sql);
  try {
    $stmt->execute($values ?? []);
    $stmt->closeCursor();
    return true;
  } catch (\PDOException $er) {
    return ['error' => $er->getMessage()];
  }
}


/* ─────────────────────────────────────────────
 |  jsonResponse  –  send JSON and exit
 ───────────────────────────────────────────── */
function jsonResponse($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}


/* ─────────────────────────────────────────────
 |  AES-256-GCM  ENCRYPTION
 |  Returns ['ciphertext', 'iv', 'tag']
 |  or null on failure
 ───────────────────────────────────────────── */
function aesEncrypt($plaintext) {
  if ($plaintext === null || $plaintext === '') return null;

  $key  = ENCRYPTION_KEY;           // 32 bytes
  $iv   = random_bytes(12);         // 12-byte IV recommended for GCM
  $tag  = '';

  $cipher = openssl_encrypt(
    $plaintext,
    'aes-256-gcm',
    $key,
    OPENSSL_RAW_DATA,
    $iv,
    $tag,   // 16-byte auth tag written here
    '',
    16
  );

  if ($cipher === false) return null;

  return [
    'ciphertext' => base64_encode($cipher),   // TEXT  column
    'iv'         => base64_encode($iv),        // VARCHAR(24) – base64 of 12 bytes = 16 chars
    'tag'        => bin2hex($tag),             // VARCHAR(32) – hex of 16 bytes = 32 chars
  ];
}


/* ─────────────────────────────────────────────
 |  AES-256-GCM  DECRYPTION
 |  Returns plaintext string or null on failure
 ───────────────────────────────────────────── */
function aesDecrypt($ciphertext, $iv, $tag) {
  if (!$ciphertext || !$iv || !$tag) return null;

  $key = ENCRYPTION_KEY;

  $plain = openssl_decrypt(
    base64_decode($ciphertext),
    'aes-256-gcm',
    $key,
    OPENSSL_RAW_DATA,
    base64_decode($iv),
    hex2bin($tag)
  );

  return ($plain !== false) ? $plain : null;
}


/* ─────────────────────────────────────────────
 |  Session helpers
 ───────────────────────────────────────────── */
function generateSessionId() {
  return 'sess_' . bin2hex(random_bytes(16));  // sess_ + 32 hex chars
}

function getSessionIdFromHeader() {
  $headers = getallheaders();
  $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
  if (preg_match('/^Bearer\s+(.+)$/i', trim($auth), $m)) {
    return $m[1];
  }
  return null;
}

/* ─────────────────────────────────────────────
 |  requireAuth  –  validate session, return
 |  session row or send 401 and exit
 ───────────────────────────────────────────── */
function requireAuth($pdo) {
  $sessionId = getSessionIdFromHeader();

  if (!$sessionId) {
    jsonResponse([
      'status'  => 'error',
      'message' => 'Unauthorized. Provide Authorization: Bearer <session_id> header.',
    ], 401);
  }

  $result = execQuery("CALL GetSessionById(?)", [$sessionId], $pdo);

  if (empty($result) || isset($result['error'])) {
    jsonResponse([
      'status'  => 'error',
      'message' => 'Invalid or expired session.',
    ], 401);
  }

  return $result[0];
}

/* ─────────────────────────────────────────────
 |  requireAdmin  –  validate session AND role
 ───────────────────────────────────────────── */
function requireAdmin($pdo) {
  $user = requireAuth($pdo);

  if ($user['fld_role'] !== 'admin') {
    jsonResponse([
      'status'  => 'error',
      'message' => 'Forbidden. Admin access required.',
    ], 403);
  }

  return $user;
}
