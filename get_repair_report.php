<?php
// File: /VRU-main/get_repair_report.php

// --- Configuration ---
define('DB_HOST', 'localhost');
define('DB_NAME', 'reportss');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// --- Headers ---
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Database Connection (using PDO) ---
$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$pdo = null;

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Database Connection Error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// --- Fetch Data ---
$sql = "SELECT
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
            update_at,
            rating,
            comment
        FROM
            report_of_repair
        ORDER BY
            id DESC";

try {
    $stmt = $pdo->query($sql);
    $reports = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $reports
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Database Query Error (Get Reports): " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Error executing database query."
    ]);
    exit();
} catch (Exception $e) {
    http_response_code(500);
    error_log("Unexpected Error (Get Reports): " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "An unexpected error occurred."
    ]);
    exit();
}
?>