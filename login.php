<?php
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // ควรมี Authorization ถ้ามีการใช้ Token ในอนาคต
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// จัดการ OPTIONS request (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start(); // เริ่ม session ถ้าคุณจะใช้ $_SESSION
error_reporting(E_ALL);

// การตั้งค่า Error Handling (แนะนำสำหรับ Production)
// ini_set('display_errors', 0); // ปิดการแสดง error บนหน้าจอ
// ini_set('log_errors', 1);     // เปิดการ log error
// ini_set('error_log', __DIR__ . '/php_errors.log'); // กำหนดไฟล์ log (ตรวจสอบว่า PHP เขียนไฟล์นี้ได้)

// สำหรับ Development, เปิด display_errors ไว้อาจจะช่วย debug ง่ายขึ้น
ini_set('display_errors', 1);


try {
    // รับข้อมูล JSON จาก request body
    $jsonData = file_get_contents("php://input");
    // error_log("Login request data: " . $jsonData); // Uncomment for debugging request data

    if (!$jsonData) {
        throw new Exception("ไม่ได้รับข้อมูล JSON", 400);
    }

    $data = json_decode($jsonData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON ไม่ถูกต้อง: " . json_last_error_msg(), 400);
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (empty($data['username']) || empty($data['password'])) {
        throw new Exception("กรุณากรอกอีเมลและรหัสผ่าน", 400);
    }

    // Validate email format
    if (!filter_var($data['username'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("รูปแบบอีเมลไม่ถูกต้อง", 400);
    }

    // การเชื่อมต่อฐานข้อมูล
    $servername = "localhost";
    $db_username = "root"; // ใช้ชื่อตัวแปรที่สื่อความหมายกว่า
    $db_password = "";
    $dbname = "reportss";

    $conn = new mysqli($servername, $db_username, $db_password, $dbname);
    if ($conn->connect_error) {
        // ไม่ควรแสดง $conn->connect_error โดยตรงให้ user ใน production
        error_log("Database Connection Failed: " . $conn->connect_error);
        throw new Exception("การเชื่อมต่อฐานข้อมูลล้มเหลว", 500);
    }
    $conn->set_charset("utf8mb4");

    // เตรียม SQL statement เพื่อดึงข้อมูลผู้ใช้ (รวมถึงรหัสผ่านที่ hash ไว้)
    $stmt = $conn->prepare("SELECT id, email, first_name, last_name, user_type, employee_id, national_id, phone_number, password FROM users WHERE email = ?");
    if (!$stmt) {
        error_log("SQL Prepare Failed: " . $conn->error);
        throw new Exception("เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL", 500);
    }

    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc(); // ดึงข้อมูลผู้ใช้

    if (!$user) {
        // ไม่พบผู้ใช้ที่มีอีเมลนี้
        // error_log("Login attempt failed: No user found for email: " . htmlspecialchars($data['username']));
        http_response_code(401); // Unauthorized
        echo json_encode([
            'status' => 'error',
            'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' // ข้อความทั่วไปเพื่อความปลอดภัย
        ]);
        exit;
    }

    // error_log("User found for login attempt: " . htmlspecialchars($data['username']));

    // --- ส่วนสำคัญ: ตรวจสอบรหัสผ่าน ---
    // $data['password'] คือรหัสผ่าน (plain text) ที่ผู้ใช้กรอก
    // $user['password'] คือรหัสผ่านที่ถูก hash เก็บไว้ในฐานข้อมูล
    
    // if (password_verify($data['password'], $user['password'])) {
        if ($data['password'] === $user['password']) { 
        // รหัสผ่านถูกต้อง
        $_SESSION['user_id'] = $user['id']; // ตัวอย่างการใช้ session
        // คุณอาจจะสร้าง token หรือวิธีการยืนยันตัวตนอื่นๆ ที่นี่

        // ตรวจสอบ user_type (ถ้าจำเป็น)
        $allowed_user_types = ['employee', 'technician', 'admin'];
        if (!in_array($user['user_type'], $allowed_user_types)) {
            error_log("Invalid user_type ('" . htmlspecialchars($user['user_type']) . "') for user: " . htmlspecialchars($user['email']));
            throw new Exception("ประเภทผู้ใช้ไม่ถูกต้องในระบบ", 403); // Forbidden
        }

        // เตรียมข้อมูลผู้ใช้ที่จะส่งกลับ (ห้ามส่งรหัสผ่านกลับไป)
        $userResponse = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'user_type' => $user['user_type'],
            'employee_id' => $user['employee_id'],
            'national_id' => $user['national_id'],
            'phone_number' => $user['phone_number']
        ];

        http_response_code(200); // OK
        echo json_encode([
            'status' => 'success',
            'message' => 'เข้าสู่ระบบสำเร็จ',
            'user' => $userResponse
        ]);

    } else {
        // รหัสผ่านไม่ถูกต้อง
        // error_log("Login attempt failed: Incorrect password for email: " . htmlspecialchars($data['username']));
        http_response_code(401); // Unauthorized
        echo json_encode([
            'status' => 'error',
            'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' // ข้อความทั่วไป
        ]);
    }

} catch (Exception $e) {
    // error_log("Login Exception: " . $e->getMessage() . " (Code: " . $e->getCode() . ")");

    // กำหนด HTTP status code ตามประเภทของ error
    $statusCode = $e->getCode();
    if (!is_int($statusCode) || $statusCode < 400 || $statusCode >= 600) {
        // ถ้า getCode() ไม่ได้ตั้งไว้ หรือไม่อยู่ในช่วง HTTP error code ที่เหมาะสม
        // ให้ดูจาก message เพื่อพยายามกำหนด status code ที่เหมาะสมขึ้น
        if (strpos($e->getMessage(), "การเชื่อมต่อฐานข้อมูลล้มเหลว") !== false ||
            strpos($e->getMessage(), "เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL") !== false) {
            $statusCode = 500; // Internal Server Error
        } else {
            $statusCode = 400; // Default to Bad Request for other client-side errors
        }
    }

    http_response_code($statusCode);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);

} finally {
    // ปิด statement และ connection
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>