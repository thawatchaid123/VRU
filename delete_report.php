<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);
$report_id = $data['report_id'] ?? null;

if (!$report_id) {
    echo json_encode(['success' => false, 'error' => 'ต้องระบุ report_id']);
    exit;
}

// เชื่อมต่อฐานข้อมูล (ปรับตามการตั้งค่าของคุณ)
$conn = new mysqli('localhost', 'username', 'password', 'database');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// ลบรายการ
$sql = "DELETE FROM reports WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $report_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'ไม่สามารถลบรายการได้']);
}

$stmt->close();
$conn->close();
?>