<?php
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $jsonData = file_get_contents("php://input");
    if (!$jsonData) {
        throw new Exception("ไม่ได้รับข้อมูล JSON");
    }

    $data = json_decode($jsonData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON ไม่ถูกต้อง: " . json_last_error_msg());
    }

    if (empty($data['username']) || empty($data['password'])) {
        throw new Exception("กรุณากรอกข้อมูลให้ครบ");
    }

    if (!filter_var($data['username'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("รูปแบบอีเมลไม่ถูกต้อง");
    }

    $conn = new mysqli("localhost", "root", "", "reportss");
    if ($conn->connect_error) {
        throw new Exception("การเชื่อมต่อฐานข้อมูลล้มเหลว: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception("เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL");
    }

    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'ไม่พบบัญชีผู้ใช้นี้'
        ]);
        exit;
    }

    if ($data['password'] === $user['password']) {
        $_SESSION['user_id'] = $user['id'];

        $userResponse = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'user_type' => $user['user_type'],
            'employee_id' => $user['employee_id'],
            'phone_number' => $user['phone_number']
        ];

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'เข้าสู่ระบบสำเร็จ',
            'user' => $userResponse
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'รหัสผ่านไม่ถูกต้อง'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
