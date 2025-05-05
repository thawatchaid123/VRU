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

// อ่าน JSON จาก request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$reportId = $data['report_id'] ?? null;
$rating = $data['rating'] ?? null;
$comment = $data['comment'] ?? null;

if (!$reportId || !is_numeric($reportId) || $rating === null || !is_numeric($rating) || $rating < 1 || $rating > 5) {
    sendResponse(false, 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง: ต้องระบุ report_id และ rating (1-5)');
}

// แปลง comment เป็น NULL หากเป็นสตริงว่าง
$comment = trim($comment) !== '' ? $comment : null;

// ตรวจสอบว่า report_id มีอยู่ในตาราง
$checkSql = "SELECT id FROM report_of_repair WHERE id = ?";
$checkStmt = $conn->prepare($checkSql);
if (!$checkStmt) {
    sendResponse(false, 'เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: ' . $conn->error);
}
$checkStmt->bind_param('i', $reportId);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows === 0) {
    $checkStmt->close();
    sendResponse(false, 'ไม่พบรายการแจ้งซ่อมที่ระบุ');
}
$checkStmt->close();

// อัปเดต rating และ comment
$sql = "UPDATE report_of_repair SET rating = ?, comment = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    sendResponse(false, 'เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: ' . $conn->error);
}

$stmt->bind_param('isi', $rating, $comment, $reportId);
if ($stmt->execute()) {
    sendResponse(true, 'บันทึกคะแนนและความคิดเห็นเรียบร้อย');
} else {
    sendResponse(false, 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $stmt->error);
}

// ปิดการเชื่อมต่อ
$stmt->close();
$conn->close();
?>