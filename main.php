<?php

require_once __DIR__ . "/vendor/autoload.php";

$env = Dotenv\Dotenv::createImmutable(__DIR__ . "/config/");
$env->load();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . "/functions.php";

$db      = new Connection();
$pdo     = $db->connect();

$auth    = new Auth($pdo);
$books   = new Books($pdo);
$loans   = new Loans($pdo);
$users   = new Users($pdo);
$reports = new Reports($pdo);

/*
 * URL layout after .htaccess rewrite:
 *   /api/{resource}/{action}/{subparam}/{extra}
 *
 * AUTH
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   POST   /api/auth/logout
 *
 * USERS
 *   GET    /api/users/profile
 *   PUT    /api/users/profile
 *   PUT    /api/users/change-password
 *
 * BOOKS
 *   GET    /api/books
 *   GET    /api/books/{book_id}
 *   POST   /api/books                      (admin)
 *   PUT    /api/books/{book_id}            (admin)
 *   DELETE /api/books/{book_id}            (admin)
 *
 * LOANS
 *   POST   /api/loans
 *   GET    /api/loans/{loan_id}
 *   GET    /api/loans/user/{user_id}
 *   PUT    /api/loans/{loan_id}/return
 *
 * ADMIN
 *   GET    /api/admin/books
 *   GET    /api/admin/members
 *   GET    /api/admin/loans
 *   PUT    /api/admin/members/{user_id}/status
 *
 * REPORTS
 *   GET    /api/reports/stats
 *   GET    /api/reports/recent-loans
 *   GET    /api/reports/all-loans
 *   GET    /api/reports/borrowed-books
 *   GET    /api/reports/overdue-books
 */

$param    = explode("/", trim($_GET['params'] ?? '', "/"));
$resource = $param[1] ?? '';
$action   = $param[2] ?? '';
$subParam = $param[3] ?? null;
$extra    = $param[4] ?? null;
$method   = $_SERVER['REQUEST_METHOD'];

switch ($resource) {

  /* ══ AUTH ════════════════════════════════════════════ */
  case 'auth':
    if ($method !== 'POST') jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
    switch ($action) {
      case 'register': echo json_encode($auth->register()); break;
      case 'login':    echo json_encode($auth->login());    break;
      case 'logout':   echo json_encode($auth->logout());   break;
      default: jsonResponse(['status'=>'error','message'=>'Auth endpoint not found.'], 404);
    }
    break;

  /* ══ USERS ═══════════════════════════════════════════ */
  case 'users':
    switch ($action) {
      case 'profile':
        switch ($method) {
          case 'GET': echo json_encode($users->getProfile());    break;
          case 'PUT': echo json_encode($users->updateProfile()); break;
          default: jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
        }
        break;

      case 'change-password':
        if ($method !== 'PUT') jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
        echo json_encode($users->changePassword());
        break;

      default:
        jsonResponse(['status'=>'error','message'=>'User endpoint not found.'], 404);
    }
    break;

  /* ══ BOOKS ═══════════════════════════════════════════ */
  case 'books':
    switch ($method) {
      case 'GET':
        if ($action === '' || $action === null) {
          echo json_encode($books->getBooks());
        } elseif (is_numeric($action)) {
          echo json_encode($books->getBookById((int)$action));
        } else {
          jsonResponse(['status'=>'error','message'=>'Endpoint not found.'], 404);
        }
        break;

      case 'POST':
        echo json_encode($books->addBook());
        break;

      case 'PUT':
        if (is_numeric($action)) {
          echo json_encode($books->updateBook((int)$action));
        } else {
          jsonResponse(['status'=>'error','message'=>'Endpoint not found.'], 404);
        }
        break;

      case 'DELETE':
        if (is_numeric($action)) {
          echo json_encode($books->deleteBook((int)$action));
        } else {
          jsonResponse(['status'=>'error','message'=>'Endpoint not found.'], 404);
        }
        break;

      default:
        jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
    }
    break;

  /* ══ LOANS ═══════════════════════════════════════════ */
  case 'loans':
    switch ($method) {
      case 'POST':
        echo json_encode($loans->createLoan());
        break;

      case 'GET':
        if ($action === 'user' && $subParam !== null) {
          // GET /api/loans/user/{user_id}
          echo json_encode($loans->getLoansByUser((int)$subParam));
        } elseif (is_numeric($action) && $subParam === null) {
          // GET /api/loans/{loan_id}
          echo json_encode($loans->getLoanById((int)$action));
        } else {
          jsonResponse(['status'=>'error','message'=>'Endpoint not found.'], 404);
        }
        break;

      case 'PUT':
        // PUT /api/loans/{loan_id}/return
        if (is_numeric($action) && $subParam === 'return') {
          echo json_encode($loans->returnLoan((int)$action));
        } else {
          jsonResponse(['status'=>'error','message'=>'Endpoint not found.'], 404);
        }
        break;

      default:
        jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
    }
    break;

  /* ══ ADMIN ═══════════════════════════════════════════ */
  case 'admin':
    switch ($action) {
      case 'books':
        if ($method !== 'GET') jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
        echo json_encode($reports->adminBooks());
        break;

      case 'members':
        // PUT /api/admin/members/{user_id}/status  — toggle active/inactive
        if ($subParam !== null && is_numeric($subParam) && $extra === 'status') {
          if ($method !== 'PUT') jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
          echo json_encode($reports->toggleMemberStatus((int)$subParam));
        } else {
          // GET /api/admin/members
          if ($method !== 'GET') jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
          echo json_encode($reports->adminMembers());
        }
        break;

      case 'loans':
        if ($method !== 'GET') jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
        echo json_encode($reports->adminLoans());
        break;

      default:
        jsonResponse(['status'=>'error','message'=>'Admin endpoint not found.'], 404);
    }
    break;

  /* ══ REPORTS ═════════════════════════════════════════ */
  case 'reports':
    if ($method !== 'GET') jsonResponse(['status'=>'error','message'=>'Method not allowed.'], 405);
    switch ($action) {
      case 'stats':          echo json_encode($reports->stats());         break;
      case 'recent-loans':   echo json_encode($reports->recentLoans());   break;
      case 'all-loans':      echo json_encode($reports->allLoans());      break;
      case 'borrowed-books': echo json_encode($reports->borrowedBooks()); break;
      case 'overdue-books':  echo json_encode($reports->overdueBooks());  break;
      default: jsonResponse(['status'=>'error','message'=>'Report endpoint not found.'], 404);
    }
    break;

  default:
    jsonResponse(['status'=>'error','message'=>'Resource not found.'], 404);
}
