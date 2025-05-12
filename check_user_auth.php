<?php
// check_user_auth.php

header("Access-Control-Allow-Origin: *"); // อนุญาต Cross-Origin Requests (สำหรับ Development เท่านั้น, ใน Production ควรระบุ Domain จริง)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// การเชื่อมต่อฐานข้อมูล (ตัวอย่าง PDO)
$host = 'localhost'; // หรือ IP ของ DB server
$dbname = 'reportss';  // <<<< ชื่อฐานข้อมูลของคุณ
$username_db = 'your_db_username'; // <<<< Username สำหรับเชื่อมต่อ DB
$password_db = 'your_db_password'; // <<<< Password สำหรับเชื่อมต่อ DB
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$pdo = null;
try {
    $pdo = new PDO($dsn, $username_db, $password_db, $options);
} catch (\PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["authenticated" => false, "message" => "Database connection error: " . $e->getMessage()]);
    exit;
}

$email = '';
$password_from_storage = '';

// ตรวจสอบว่าเป็นการ POST request และมีข้อมูล email, password ส่งมา
// ถ้าใช้ Content-Type: application/x-www-form-urlencoded จาก React (Axios + URLSearchParams)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['email']) && isset($_POST['password'])) {
        $email = trim($_POST['email']);
        $password_from_storage = $_POST['password']; // Password ที่ส่งมาจาก localStorage (ไม่ปลอดภัย)
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(["authenticated" => false, "message" => "Email and password are required."]);
        exit;
    }
}
// ถ้าใช้ Content-Type: application/json จาก React (ต้องอ่าน php://input)
/*
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->email) && isset($data->password)) {
        $email = trim($data->email);
        $password_from_storage = $data->password;
    } else {
        http_response_code(400);
        echo json_encode(["authenticated" => false, "message" => "Email and password are required in JSON body."]);
        exit;
    }
}
*/
else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["authenticated" => false, "message" => "Only POST method is allowed."]);
    exit;
}


if (empty($email) || empty($password_from_storage)) {
    http_response_code(400);
    echo json_encode(["authenticated" => false, "message" => "Email and password cannot be empty."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, email, password FROM users WHERE email = :email"); // <<<< ตรวจสอบชื่อตารางและคอลัมน์
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // **สำคัญมาก: การเปรียบเทียบ Password**
        // 1. ถ้า Password ใน DB ถูกเก็บเป็น Plain Text (ไม่แนะนำอย่างยิ่ง):
        // if ($password_from_storage === $user['password']) {

        // 2. ถ้า Password ใน DB ถูก Hash ด้วย password_hash():
        if (password_verify($password_from_storage, $user['password'])) {
            // Password ถูกต้อง
            // คุณอาจจะต้องการสร้าง session หรือ token ที่นี่สำหรับ request ต่อๆ ไป
            // แต่สำหรับกรณีนี้ เราแค่ยืนยันว่า login ได้
            echo json_encode(["authenticated" => true, "message" => "User authenticated successfully."]);
        } else {
            // Password ไม่ถูกต้อง
            echo json_encode(["authenticated" => false, "message" => "Invalid email or password."]);
        }
    } else {
        // ไม่พบ User
        echo json_encode(["authenticated" => false, "message" => "Invalid email or password."]);
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["authenticated" => false, "message" => "Query error: " . $e->getMessage()]);
}

$pdo = null; // ปิดการเชื่อมต่อ
?>