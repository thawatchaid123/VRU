<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json"); // << สำคัญ: ตอบกลับเป็น JSON

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reportss";

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    http_response_code(500);
    // ตอบกลับเป็น JSON object ที่มี key 'message'
    echo json_encode(["message" => "Connection failed: " . $conn->connect_error]);
    die();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    die();
}

try {
    // รับข้อมูลจาก $_POST
    $original_email = isset($_POST['original_email']) ? filter_var(trim($_POST['original_email']), FILTER_SANITIZE_EMAIL) : null;
    $new_email = isset($_POST['new_email']) ? filter_var(trim($_POST['new_email']), FILTER_SANITIZE_EMAIL) : null;
    $firstName = isset($_POST['firstName']) ? filter_var(trim($_POST['firstName']), FILTER_SANITIZE_STRING) : null;
    $lastName = isset($_POST['lastName']) ? filter_var(trim($_POST['lastName']), FILTER_SANITIZE_STRING) : null;
    $phoneNumber = isset($_POST['phoneNumber']) ? preg_replace('/[^0-9]/', '', $_POST['phoneNumber']) : null;
    $newPassword = isset($_POST['password']) && !empty(trim($_POST['password'])) ? trim($_POST['password']) : null;

    // --- การตรวจสอบข้อมูลเบื้องต้น ---
    if (empty($original_email)) {
        throw new Exception("Original email is required to identify the user.");
    }
    if (empty($new_email) || !filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("รูปแบบอีเมลใหม่ไม่ถูกต้อง");
    }
    if (empty($firstName) || empty($lastName) || empty($phoneNumber)) {
        throw new Exception("Fields (First Name, Last Name, Phone, New Email) are required.");
    }
    if (strlen($phoneNumber) !== 10 || $phoneNumber[0] !== '0' || !in_array($phoneNumber[1], ['6', '8', '9'])) {
        throw new Exception("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้อง 10 หลัก, ขึ้นต้นด้วย 0, ตัวที่สองเป็น 6/8/9)");
    }

    // --- (Optional but Recommended) ตรวจสอบว่าอีเมลใหม่ซ้ำกับผู้ใช้อื่นหรือไม่ (ถ้าอีเมลมีการเปลี่ยนแปลง) ---
    if ($new_email !== $original_email) {
        $stmt_check_email = $conn->prepare("SELECT id FROM users WHERE email = ?");
        if (!$stmt_check_email) throw new Exception("Prepare email check failed: " . $conn->error);
        $stmt_check_email->bind_param("s", $new_email);
        $stmt_check_email->execute();
        $result_check_email = $stmt_check_email->get_result();
        if ($result_check_email->num_rows > 0) {
            $stmt_check_email->close();
            throw new Exception("อีเมลนี้ถูกใช้งานแล้วโดยบัญชีอื่น");
        }
        $stmt_check_email->close();
    }
    // --- จบการตรวจสอบอีเมลซ้ำ ---


    // --- สร้างส่วน SET ของ SQL แบบไดนามิก ---
    $setClauses = [];
    $bindTypes = "";
    $bindParams = [];

    // เพิ่ม email ถ้ามีการเปลี่ยนแปลง (หรือจะ update เสมอก็ได้)
    $setClauses[] = "email = ?";
    $bindTypes .= "s";
    $bindParams[] = $new_email;

    $setClauses[] = "first_name = ?";
    $bindTypes .= "s";
    $bindParams[] = $firstName;

    $setClauses[] = "last_name = ?";
    $bindTypes .= "s";
    $bindParams[] = $lastName;

    $setClauses[] = "phone_number = ?";
    $bindTypes .= "s";
    $bindParams[] = $phoneNumber;

    // if ($newPassword !== null) {
    //     $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    //     $setClauses[] = "password = ?";
    //     $bindTypes .= "s";
    //     $bindParams[] = $hashedPassword;
    // }

    if ($newPassword !== null) {
        $setClauses[] = "password = ?";
        $bindTypes .= "s";
        $bindParams[] = $newPassword; // << เก็บเป็น Plain Text ชั่วคราว
    }
    
    if (empty($setClauses)) {
        http_response_code(200);
        echo json_encode(["message" => "ไม่มีข้อมูลให้อัพเดต"]);
        $conn->close();
        exit;
    }

    // เพิ่ม original_email สำหรับ WHERE clause (ต้องอยู่สุดท้ายในการ bind)
    $bindTypes .= "s";
    $bindParams[] = $original_email; // << ใช้ original_email ในการค้นหา

    $sql = "UPDATE users SET " . implode(", ", $setClauses) . " WHERE email = ?"; // << WHERE clause ใช้ original_email

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new Exception("Prepare update failed: (" . $conn->errno . ") " . $conn->error);
    }

    $stmt->bind_param($bindTypes, ...$bindParams);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(["message" => "อัพเดตข้อมูลสำเร็จ"]);
        } else {
            // อาจจะไม่มีการเปลี่ยนแปลง หรือ original_email ไม่พบ
            // ถ้า original_email ไม่พบ ควรจะแจ้ง error ที่ต่างออกไป
            // แต่ถ้าข้อมูลเหมือนเดิมทุกอย่าง ก็ถือว่าสำเร็จได้
            http_response_code(200);
            echo json_encode(["message" => "อัพเดตข้อมูลสำเร็จ (ไม่มีการเปลี่ยนแปลงข้อมูล หรือไม่พบอีเมลเดิม)"]);
        }
    } else {
        throw new Exception("Execute update failed: " . $stmt->error);
    }

    $stmt->close();

} catch (Exception $e) {
    http_response_code(400); // หรือ 500 ขึ้นอยู่กับประเภท Exception
    echo json_encode(["message" => "การอัพเดตล้มเหลว: " . $e->getMessage()]);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>