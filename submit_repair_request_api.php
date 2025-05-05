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
$repairName = $_POST['locationName'] ?? '';
$locationName = $_POST['locationDetails'] ?? '';
$details = $_POST['repairDetails'] ?? '';
$imagePath = null;

if (!$firstName || !$lastName || !$phone || !$repairName || !$locationName || !$details) {
    sendResponse(false, 'กรุณากรอกข้อมูลให้ครบถ้วน');
}

if (isset($_FILES['repairImage']) && $_FILES['repairImage']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $fileExt = pathinfo($_FILES['repairImage']['name'], PATHINFO_EXTENSION);
    $fileName = 'repair_' . time() . '.' . $fileExt;
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($_FILES['repairImage']['tmp_name'], $filePath)) {
        sendResponse(false, 'ไม่สามารถอัปโหลดรูปภาพได้');
    }
    $imagePath = $filePath;
}

$sql = "INSERT INTO report_of_repair (name, lastname, phone, repair_name, location_name, details, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    sendResponse(false, 'เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: ' . $conn->error);
}

$stmt->bind_param('sssssss', $firstName, $lastName, $phone, $repairName, $locationName, $details, $imagePath);
if ($stmt->execute()) {
    sendResponse(true, 'บันทึกข้อมูลการแจ้งซ่อมเรียบร้อย');
} else {
    sendResponse(false, 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $stmt->error);
}

// ปิดการเชื่อมต่อ
$stmt->close();
$conn->close();
