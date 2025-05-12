<?php
// File: /VRU-main/update_environment_status.php

define('DB_HOST', 'localhost');
define('DB_NAME', 'reportss');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// --- Headers ---
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Check Request Method ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}

// --- Get Input Data ---
$inputData = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($inputData['id']) || !isset($inputData['status'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields: 'id' and 'status'."]);
    exit();
}

$reportId = filter_var($inputData['id'], FILTER_VALIDATE_INT);
$inputStatus = htmlspecialchars(strip_tags(trim($inputData['status'])), ENT_QUOTES, 'UTF-8');

if ($reportId === false || $reportId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid 'id' provided."]);
    exit();
}
if (empty($inputStatus)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or empty 'status' provided."]);
    exit();
}

// Validate status
$allowedStatuses = ['received', 'in_progress', 'completed', 'rejected'];
if (!in_array($inputStatus, $allowedStatuses)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid status value provided. Allowed: " . implode(', ', $allowedStatuses)
    ]);
    exit();
}

// --- Database Connection ---
$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES => false
];

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Database Connection Error (Update Environment Status): " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// --- Update Status ---
$sql = "UPDATE report_of_environment
        SET
            status = :newStatus,
            update_at = NOW()
        WHERE
            id = :reportId";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':newStatus', $inputStatus, PDO::PARAM_STR);
    $stmt->bindParam(':reportId', $reportId, PDO::PARAM_INT);

    $success = $stmt->execute();

    if ($success && $stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "สถานะปัญหาสิ่งแวดล้อมอัปเดตเรียบร้อยแล้ว"
        ]);
    } elseif ($success && $stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "ไม่พบรายการที่ต้องการอัปเดต หรือสถานะไม่มีการเปลี่ยนแปลง"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "ไม่สามารถอัปเดตสถานะปัญหาสิ่งแวดล้อมในฐานข้อมูลได้"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Database Query Error (Update Environment Status): " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Database query error during update."
    ]);
    exit();
} catch (Exception $e) {
    http_response_code(500);
    error_log("Unexpected Error (Update Environment Status): " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "An unexpected error occurred during update."]);
    exit();
}
?>