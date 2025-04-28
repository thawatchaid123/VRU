<?php
// อนุญาต CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// เชื่อมต่อกับฐานข้อมูล
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reportss";

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4"); // เพิ่มการรองรับภาษาไทย

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    http_response_code(500);
    die("Connection failed: " . $conn->connect_error);
}

// ตรวจสอบว่าเป็น POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die("Method not allowed");
}

try {
    // รับค่าและทำความสะอาดข้อมูล
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $phoneNumber = preg_replace('/[^0-9]/', '', $_POST['phoneNumber']);
    $nationalId = preg_replace('/[^0-9]/', '', $_POST['nationalId']);
    $employeeId = filter_var($_POST['employeeId'], FILTER_SANITIZE_STRING);
    $firstName = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);
    $userType = $_POST['userType'];

    // ตรวจสอบความถูกต้องของข้อมูล
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("รูปแบบอีเมลไม่ถูกต้อง");
    }
    if (strlen($phoneNumber) !== 10) {
        throw new Exception("เบอร์โทรศัพท์ต้องมี 10 หลัก");
    }
    if (strlen($nationalId) !== 13) {
        throw new Exception("เลขบัตรประชาชนต้องมี 13 หลัก");
    }

    // เข้ารหัสรหัสผ่าน
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // เตรียมคำสั่ง SQL แบบ prepared statement
    $stmt = $conn->prepare("INSERT INTO users (email, password, phone_number, national_id, employee_id, first_name, last_name, user_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $email, $hashedPassword, $phoneNumber, $nationalId, $employeeId, $firstName, $lastName, $userType);

    if ($stmt->execute()) {
        http_response_code(200);
        echo "ลงทะเบียนสำเร็จ";
    } else {
        throw new Exception("Error: " . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo "การลงทะเบียนล้มเหลว: " . $e->getMessage();
}

$conn->close();
?>