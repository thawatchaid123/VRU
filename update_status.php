<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'This endpoint requires a POST request'
    ]);
    exit();
}

try {
    $conn = new PDO(
        "mysql:host=localhost;dbname=reportss",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'การเชื่อมต่อฐานข้อมูลล้มเหลว: ' . $e->getMessage()
    ]);
    exit();
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['report_id']) || !isset($data['status']) || !isset($data['type'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'ข้อมูลไม่ครบถ้วน ต้องการ report_id, status, และ type',
        'received_data' => $data
    ]);
    exit();
}

// ตรวจสอบ type
$validTypes = ['repair', 'environment'];
if (!in_array($data['type'], $validTypes)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'ประเภทไม่ถูกต้อง ต้องเป็นหนึ่งใน: ' . implode(', ', $validTypes)
    ]);
    exit();
}

// รายการสถานะที่อนุญาต
$validStatuses = ['pending', 'in_progress', 'completed', 'rejected'];
if (!in_array($data['status'], $validStatuses)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'สถานะไม่ถูกต้อง ต้องเป็นหนึ่งใน: ' . implode(', ', $validStatuses)
    ]);
    exit();
}

error_log('Received POST data: ' . print_r($data, true));

// กำหนดตารางและคอลัมน์ตาม type
$table = $data['type'] === 'repair' ? 'report_of_repair' : 'report_of_environment';
$columns = $data['type'] === 'repair' 
    ? 'name, lastname, phone, repair_name, location_name, details, image, status'
    : 'name, lastname, phone, problem, location, details, image, status';

// ตรวจสอบว่า report_id มีอยู่ในตารางที่ระบุ
$stmtCheck = $conn->prepare("SELECT COUNT(*) FROM $table WHERE id = :report_id");
$stmtCheck->execute([':report_id' => $data['report_id']]);
if ($stmtCheck->fetchColumn() == 0) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'ไม่พบรายการที่ระบุ (report_id: ' . $data['report_id'] . ', type: ' . $data['type'] . ')'
    ]);
    exit();
}

try {
    // อัปเดตสถานะ
    $stmt = $conn->prepare("
        UPDATE $table 
        SET status = :status
        WHERE id = :report_id
    ");

    $result = $stmt->execute([
        ':status' => $data['status'],
        ':report_id' => $data['report_id']
    ]);

    if ($stmt->rowCount() > 0) {
        // ดึงข้อมูลล่าสุดหลังจากอัปเดต
        $stmtFetch = $conn->prepare("
            SELECT $columns
            FROM $table 
            WHERE id = :report_id
        ");
        $stmtFetch->execute([':report_id' => $data['report_id']]);
        $reportData = $stmtFetch->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'อัพเดทสถานะเรียบร้อยแล้ว',
            'data' => $reportData
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'ไม่พบรายการที่ระบุ (report_id: ' . $data['report_id'] . ', type: ' . $data['type'] . ')'
        ]);
    }
} catch (PDOException $e) {
    error_log("SQL Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล: ' . $e->getMessage()
    ]);
}
?>