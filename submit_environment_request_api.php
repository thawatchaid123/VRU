<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// รวมไฟล์เชื่อมต่อฐานข้อมูล
require_once 'db_connect.php';

function sendResponse($success, $message, $data = null)
{
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed');
}

$firstName = $_POST['reporterFirstName'] ?? '';
$lastName = $_POST['reporterLastName'] ?? '';
$phone = $_POST['reporterPhone'] ?? '';
$problem = $_POST['problem'] ?? '';
$locationDetails = $_POST['locationDetails'] ?? '';
$environmentDetails = $_POST['environmentDetails'] ?? '';
$imagePath = null;

if (!$firstName || !$lastName || !$phone || !$problem || !$locationDetails || !$environmentDetails) {
    sendResponse(false, 'กรุณากรอกข้อมูลให้ครบถ้วน');
}

if (isset($_FILES['environmentImage']) && $_FILES['environmentImage']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'Uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $fileExt = pathinfo($_FILES['environmentImage']['name'], PATHINFO_EXTENSION);
    $fileName = 'environment_' . time() . '.' . $fileExt;
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($_FILES['environmentImage']['tmp_name'], $filePath)) {
        sendResponse(false, 'ไม่สามารถอัปโหลดรูปภาพสิ่งแวดล้อมได้');
    }
    $imagePath = $filePath;
}

$sql = "INSERT INTO report_of_environment (name, lastname, phone, problem, location, details, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    sendResponse(false, 'เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: ' . $conn->error);
}

$stmt->bind_param('sssssss', $firstName, $lastName, $phone, $problem, $locationDetails, $environmentDetails, $imagePath);
if ($stmt->execute()) {
    sendResponse(true, 'บันทึกข้อมูลการแจ้งปัญหาสิ่งแวดล้อมเรียบร้อย');
} else {
    sendResponse(false, 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $stmt->error);
}

// ปิดการเชื่อมต่อ
$stmt->close();
$conn->close();
?>