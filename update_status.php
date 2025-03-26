<?php
// update_status.php
// เริ่มต้นด้วยการส่ง headers CORS เสมอ
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000'); // ระบุ origin เฉพาะ
header('Access-Control-Allow-Methods: POST, OPTIONS'); // อนุญาต POST และ OPTIONS
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // อนุญาต headers ที่ต้องการ
header('Access-Control-Allow-Credentials: true'); // อนุญาตส่ง credentials (ถ้าต้องการ)
header('Access-Control-Max-Age: 86400'); // ค่าแคชสำหรับ preflight request (24 ชั่วโมง)

// จัดการคำขอ PREFLIGHT (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // ส่งสถานะ 200 สำหรับ PREFLIGHT
    exit(0);
}

// ตรวจสอบว่าเป็น POST request
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
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'การเชื่อมต่อฐานข้อมูลล้มเหลว: ' . $e->getMessage()
    ]);
    exit();
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input data (ส่งเฉพาะ report_id และ status)
if (!isset($data['report_id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'ข้อมูลไม่ครบถ้วน',
        'received_data' => $data
    ]);
    exit();
}

// Validate status is a number (between 1 and 4)
if (!is_numeric($data['status']) || $data['status'] < 1 || $data['status'] > 4) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'สถานะไม่ถูกต้อง ต้องเป็นตัวเลขระหว่าง 1 ถึง 4'
    ]);
    exit();
}

// เพิ่มการล็อกข้อมูลเพื่อ debug
// หลังจากรับ $data
error_log('Received POST data: ' . print_r($data, true));

// ตรวจสอบว่า report_id ตรงกับข้อมูลในตารางก่อนอัปเดต
$stmtCheck = $conn->prepare("SELECT COUNT(*) FROM reports WHERE id = :report_id");
$stmtCheck->execute([':report_id' => $data['report_id']]);
if ($stmtCheck->fetchColumn() == 0) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'ไม่พบรายการแจ้งซ่อมที่ระบุ (report_id: ' . $data['report_id'] . ')'
    ]);
    exit();
}

try {
    $stmt = $conn->prepare("
        UPDATE reports 
        SET status = :status
        WHERE id = :report_id
    ");

    $result = $stmt->execute([
        ':status' => $data['status'], // ใช้ตัวเลขสถานะโดยตรง
        ':report_id' => $data['report_id']
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'อัพเดทสถานะเรียบร้อยแล้ว'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'ไม่พบรายการแจ้งซ่อมที่ระบุ (report_id: ' . $data['report_id'] . ')'
        ]);
    }
} catch(PDOException $e) {
    error_log("SQL Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล: ' . $e->getMessage()
    ]);
}
?>