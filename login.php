<?php
<<<<<<< HEAD
// =========================================================================
// CORS Headers - **ต้องอยู่บนสุดก่อน Output หรือ Code อื่นๆ**
// =========================================================================
// อนุญาตให้ Origin ของ React (http://localhost:3000) เข้าถึงได้
header("Access-Control-Allow-Origin: http://localhost:3000");
// อนุญาตให้ส่ง Credentials (เช่น Cookies, Authorization headers) ไปด้วย
header("Access-Control-Allow-Credentials: true");
// อนุญาต Methods ที่ใช้ (GET สำหรับทดสอบ, POST สำหรับ Login, OPTIONS สำหรับ Preflight)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// อนุญาต Headers ที่ React ส่งมา (สำคัญมากสำหรับ Preflight)
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
// กำหนดเวลาให้ Browser Cache ผลลัพธ์ของ Preflight Request (1 ชั่วโมง)
header("Access-Control-Max-Age: 3600");

// =========================================================================
// จัดการ Preflight Request (OPTIONS)
// =========================================================================
// ถ้า Request เป็นแบบ OPTIONS (Browser ส่งมาถามก่อนส่ง Request จริง)
=======
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

<<<<<<< HEAD
// =========================================================================
// เริ่มต้น Session และตั้งค่า Response Header สำหรับ Request จริง (POST)
// **ต้องอยู่หลัง OPTIONS Check**
// =========================================================================
session_start();

// กำหนด Content Type ของ Response ที่จะส่งกลับไปหา React เป็น JSON
header("Content-Type: application/json; charset=UTF-8");

// เปิดการแสดงผล Error (ดีสำหรับการ Debug)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// =========================================================================
// ส่วนประมวลผลหลัก (รับข้อมูล, เชื่อมต่อ DB, ตรวจสอบ Login)
// =========================================================================
try {
    // รับข้อมูล JSON ที่ส่งมาจาก React
    $jsonData = file_get_contents("php://input");
    if (!$jsonData) {
        // ใช้ http_response_code เพื่อให้ Client รู้สถานะ Error ที่เหมาะสม
        http_response_code(400); 
        throw new Exception("ไม่ได้รับข้อมูล JSON");
    }

    // แปลง JSON เป็น PHP Array
    $data = json_decode($jsonData, true);
    // ตรวจสอบว่าการแปลง JSON สำเร็จหรือไม่
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400); // Bad Request
        throw new Exception("รูปแบบข้อมูล JSON ไม่ถูกต้อง: " . json_last_error_msg());
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (empty($data['username']) || empty($data['password'])) {
        http_response_code(400); 
        throw new Exception("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
    }

    // ตรวจสอบรูปแบบอีเมล (Username คือ Email)
    if (!filter_var($data['username'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400); 
        throw new Exception("รูปแบบอีเมลไม่ถูกต้อง");
    }

    $dbHost = "localhost";
    $dbUser = "root";
    $dbPass = ""; 
    $dbName = "reportss"; 

    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        http_response_code(500); 
        error_log("Database Connection Error: " . $conn->connect_error); 
        throw new Exception("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    }
    
    $conn->set_charset("utf8mb4");

    $stmt = $conn->prepare("SELECT id, email, password, first_name, last_name, user_type, employee_id, phone_number FROM users WHERE email = ?");
    if (!$stmt) {
        http_response_code(500);
        error_log("SQL Prepare Error: " . $conn->error);
=======
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
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
        throw new Exception("เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL");
    }

    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
<<<<<<< HEAD
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'ไม่พบบัญชีผู้ใช้นี้ในระบบ'
        ]);
    } else {
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
    }
} catch (Exception $e) {
    if (http_response_code() < 400) {
        http_response_code(500); 
    }
=======
        echo json_encode([
            'status' => 'error',
            'message' => 'ไม่พบบัญชีผู้ใช้นี้'
        ]);
        exit;
    }

    if (password_verify($data['password'], $user['password'])) {
        $userResponse = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'user_type' => $user['user_type'],
            'employee_id' => $user['employee_id'],
            'phone_number' => $user['phone_number']
        ];
        echo json_encode([
            'status' => 'success',
            'user' => $userResponse
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'รหัสผ่านไม่ถูกต้อง'
        ]);
    }

} catch (Exception $e) {
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} finally {
<<<<<<< HEAD
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
=======
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
        $conn->close();
    }
}
?>