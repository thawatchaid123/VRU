<?php
// File: /VRU-main/search.php

// แสดง Error ทั้งหมดเพื่อ Debug (ควรปิดใน Production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// --- Headers ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// จัดการ Preflight Request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- การเชื่อมต่อฐานข้อมูล ---
$host = 'localhost';
$dbname = 'reportss';
$username = 'root';
$password = '';

// โครงสร้าง Response เริ่มต้น
$response = [
    'success' => false,
    'error' => '',
    'reports' => []
];

try {
    // เชื่อมต่อด้วย PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // อ่าน Input JSON จาก Request Body
    $input = json_decode(file_get_contents('php://input'), true);

    // ตรวจสอบว่า 'employee_id' (เบอร์โทร) ส่งมาและไม่ว่าง
    if (!isset($input['employee_id']) || empty(trim($input['employee_id']))) {
        throw new Exception('กรุณาระบุเบอร์โทรศัพท์');
    }

    // รับค่าเบอร์โทรและป้องกัน XSS
    $search_phone = htmlspecialchars(trim($input['employee_id']));

    // เตรียมคำสั่ง SQL
    $stmt = $pdo->prepare("
        SELECT
            id,
            name,
            lastname,
            phone,
            repair_name,
            location_name,
            details,
            image,
            status,
            created_at,
            rating,
            comment
        FROM
            report_of_repair
        WHERE
            phone = :search_phone
        ORDER BY
            created_at DESC
    ");

    // Execute คำสั่ง SQL
    $stmt->execute(['search_phone' => $search_phone]);

    // ดึงข้อมูลทั้งหมด
    $repair_reports_data = $stmt->fetchAll();

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (empty($repair_reports_data)) {
        $response['success'] = true;
        $response['reports'] = [];
        $response['message'] = 'ไม่พบข้อมูลการแจ้งซ่อมสำหรับเบอร์โทรนี้';
    } else {
        $response['success'] = true;
        $response['reports'] = $repair_reports_data;
    }

} catch (PDOException $e) {
    http_response_code(500);
    $response['error'] = 'Database Error: ' . $e->getMessage();
} catch (Exception $e) {
    http_response_code(400);
    $response['error'] = $e->getMessage();
}

// ส่ง JSON Response
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit();
?>