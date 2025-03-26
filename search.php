<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$dbname = 'reportss';
$username = 'root';
$password = '';

$response = [
    'success' => false,
    'error' => '',
    'reports' => []
];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['employee_id']) || empty($input['employee_id'])) {
        throw new Exception('กรุณาระบุรหัสพนักงาน');
    }

    $employee_id = htmlspecialchars(trim($input['employee_id']));

    $stmt = $pdo->prepare("
        SELECT 
            id,
            employee_id, 
            reports, 
            image_path,
            category,
            `status`,
            created_at,
            updated_at
        FROM 
            reports 
        WHERE 
            employee_id = :employee_id
        ORDER BY 
            created_at DESC
    ");
    
    $stmt->execute(['employee_id' => $employee_id]);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($reports)) {
        throw new Exception('ไม่พบข้อมูล');
    }

    $response['success'] = true;
    $response['reports'] = array_map(function($report) {
        // แปลงข้อมูล BLOB เป็น base64
        if (!empty($report['image_path'])) {
            $report['image_path'] = 'data:image/jpeg;base64,' . base64_encode($report['image_path']);
        }
        return $report;
    }, $reports);

} catch (Exception $e) { 
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
exit();