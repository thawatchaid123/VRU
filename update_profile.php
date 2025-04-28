<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reportss";

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    http_response_code(500);
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die("Method not allowed");
}

try {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $phoneNumber = preg_replace('/[^0-9]/', '', $_POST['phoneNumber']);
    $nationalId = preg_replace('/[^0-9]/', '', $_POST['nationalId']);
    $employeeId = filter_var($_POST['employeeId'], FILTER_SANITIZE_STRING);
    $firstName = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);

    if (strlen($phoneNumber) !== 10) {
        throw new Exception("เบอร์โทรศัพท์ต้องมี 10 หลัก");
    }
    if (strlen($nationalId) !== 13) {
        throw new Exception("เลขบัตรประชาชนต้องมี 13 หลัก");
    }

    $stmt = $conn->prepare("UPDATE users SET phone_number=?, national_id=?, employee_id=?, first_name=?, last_name=? WHERE email=?");
    $stmt->bind_param("ssssss", $phoneNumber, $nationalId, $employeeId, $firstName, $lastName, $email);

    if ($stmt->execute()) {
        http_response_code(200);
        echo "อัพเดตข้อมูลสำเร็จ";
    } else {
        throw new Exception("Error: " . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo "การอัพเดตล้มเหลว: " . $e->getMessage();
}

$conn->close();
?>