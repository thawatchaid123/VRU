<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'reportss');

function connectDatabase() {
    try {
        $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
        if ($mysqli->connect_error) {
            throw new Exception("การเชื่อมต่อล้มเหลว: " . $mysqli->connect_error);
        }
        $mysqli->set_charset("utf8mb4");
        return $mysqli;
    } catch (Exception $e) {
        throw new Exception("ไม่สามารถเชื่อมต่อกับฐานข้อมูล: " . $e->getMessage());
    }
}

// แก้ไขฟังก์ชัน getPendingReports เพื่อเพิ่มการกรองตามเดือนและปี
function getPendingReports($mysqli) {
    // รับพารามิเตอร์ month และ year จาก GET request
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    // เตรียม SQL query พื้นฐาน
    $sql = "SELECT r.*, u.first_name, u.last_name 
            FROM reports r 
            JOIN users u ON r.employee_id = u.employee_id 
            WHERE 1=1"; // ใช้ 1=1 เพื่อให้ง่ายต่อการเพิ่มเงื่อนไข
    
    $params = [];
    $types = "";

    // เพิ่มเงื่อนไขการกรองตามเดือน
    if ($month !== null) {
        $sql .= " AND MONTH(r.created_at) = ?";
        $params[] = $month;
        $types .= "i";
    }

    // เพิ่มเงื่อนไขการกรองตามปี
    if ($year !== null) {
        $sql .= " AND YEAR(r.created_at) = ?";
        $params[] = $year;
        $types .= "i";
    }

    // เพิ่มการเรียงลำดับ
    $sql .= " ORDER BY r.created_at DESC";

    // เตรียม statement
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        throw new Exception("เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: " . $mysqli->error);
    }

    // bind parameters ถ้ามี
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $pending_reports = [];
    
    while ($row = $result->fetch_assoc()) {
        $pending_reports[] = [
            'id' => $row['id'],
            'employee_name' => $row['first_name'] . ' ' . $row['last_name'],
            'employee_id' => $row['employee_id'],
            'issue' => $row['reports'],
            'category' => $row['category'],
            'created_at' => $row['created_at'],
            'status' => $row['status'],
            'image_path' => $row['image_path'] ? base64_encode($row['image_path']) : null
        ];
    }
    
    $stmt->close();
    return $pending_reports;
}

// ฟังก์ชันอื่นๆ คงเดิม
function validateEmployee($mysqli, $employee_id) {
    $stmt = $mysqli->prepare("SELECT employee_id FROM users WHERE employee_id = ?");
    if (!$stmt) {
        throw new Exception("เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: " . $mysqli->error);
    }

    $stmt->bind_param("s", $employee_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("ไม่พบรหัสพนักงานในระบบ");
    }
    
    $userRow = $result->fetch_assoc();
    $stmt->close();
    return $userRow['employee_id'];
}

function createReport($mysqli, $employee_id, $issue, $category, $imageData = null) {
    $status = 1;
    
    $stmt = $mysqli->prepare("INSERT INTO reports (employee_id, reports, category, status, image_path) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: " . $mysqli->error);
    }

    $stmt->bind_param("sssis", $employee_id, $issue, $category, $status, $imageData);
    if (!$stmt->execute()) {
        throw new Exception("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " . $stmt->error);
    }
    
    $report_id = $mysqli->insert_id;
    $stmt->close();
    return $report_id;
}

function getReportDetails($mysqli, $report_id) {
    $stmt = $mysqli->prepare("SELECT r.*, u.first_name, u.last_name 
                            FROM reports r 
                            JOIN users u ON r.employee_id = u.employee_id 
                            WHERE r.id = ?");
    if (!$stmt) {
        throw new Exception("เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: " . $mysqli->error);
    }

    $stmt->bind_param("i", $report_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $report = $result->fetch_assoc();
    $stmt->close();
    
    return [
        'id' => $report['id'],
        'employee_name' => $report['first_name'] . ' ' . $report['last_name'],
        'employee_id' => $report['employee_id'],
        'issue' => $report['reports'],
        'category' => $report['category'],
        'created_at' => $report['created_at'],
        'status' => $report['status'],
        'image_path' => $report['image_path'] ? base64_encode($report['image_path']) : null
    ];
}

try {
    $mysqli = connectDatabase();

    if ($_SERVER["REQUEST_METHOD"] == "GET") {
        $pending_reports = getPendingReports($mysqli);
        echo json_encode(['success' => true, 'reports' => $pending_reports]);
        exit;
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (!isset($_POST["phone"]) || !isset($_POST["issue"]) || !isset($_POST["category"])) {
            throw new Exception("กรุณากรอกข้อมูลให้ครบถ้วน");
        }

        $employee_id = $mysqli->real_escape_string($_POST["phone"]);
        $issue = $mysqli->real_escape_string($_POST["issue"]);
        $category = $mysqli->real_escape_string($_POST["category"]);

        $mysqli->begin_transaction();

        try {
            $confirmed_employee_id = validateEmployee($mysqli, $employee_id);
            
            $imageData = null;
            if (isset($_FILES['photos']) && !empty($_FILES['photos']['name'][0])) {
                $imageData = file_get_contents($_FILES['photos']['tmp_name'][0]);
            }

            $report_id = createReport($mysqli, $confirmed_employee_id, $issue, $category, $imageData);
            $report_details = getReportDetails($mysqli, $report_id);

            $mysqli->commit();

            echo json_encode([
                'success' => true,
                'message' => 'บันทึกข้อมูลสำเร็จ',
                'report' => $report_details
            ]);

        } catch (Exception $e) {
            $mysqli->rollback();
            throw $e;
        }
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($mysqli)) {
        $mysqli->close();
    }
}
?>