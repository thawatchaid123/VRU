<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
error_log('Session data: ' . print_r($_SESSION, true));

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reportss";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // ปิดการตรวจสอบ session ชั่วคราวเพื่อให้เหมือนโค้ดเดิม
    /*
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
        error_log('Unauthorized access: user_id=' . ($_SESSION['user_id'] ?? 'not set') . ', user_type=' . ($_SESSION['user_type'] ?? 'not set'));
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit;
    }
    */

    $sql = "SELECT id, name, lastname, phone, problem, location, details, image, status, created_at, update_at, rating, comment 
            FROM report_of_environment 
            WHERE 1=1";
    
    $params = [];
    if (isset($_GET['month']) && is_numeric($_GET['month'])) {
        $sql .= " AND MONTH(created_at) = ?";
        $params[] = (int)$_GET['month'];
    }
    if (isset($_GET['year']) && is_numeric($_GET['year'])) {
        $sql .= " AND YEAR(created_at) = ?";
        $params[] = (int)$_GET['year'];
    }
    
    $sql .= " ORDER BY id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $processedReports = array_map(function($report) {
        return [
            'id' => (int)$report['id'],
            'name' => $report['name'],
            'lastname' => $report['lastname'],
            'employee_name' => trim(($report['name'] ?? '') . ' ' . ($report['lastname'] ?? '')),
            'phone' => $report['phone'],
            'problem' => $report['problem'],
            'location' => $report['location'],
            'details' => $report['details'],
            'image' => $report['image'],
            'status' => $report['status'] ?? 'pending',
            'created_at' => $report['created_at'],
            'update_at' => $report['update_at'],
            'rating' => $report['rating'] ? (int)$report['rating'] : null,
            'comment' => $report['comment']
        ];
    }, $reports);

    echo json_encode([
        'success' => true,
        'reports' => $processedReports
    ]);

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log('General error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
} finally {
    $conn = null;
}
?>