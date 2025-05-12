<?php
$servername = "localhost";
$db_username = "root";
$db_password = "";
$dbname = "reportss";

$conn = new mysqli($servername, $db_username, $db_password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// --- คำเตือน: ส่วนนี้อันตรายถ้าเงื่อนไข WHERE ไม่ถูกต้อง ---
// คุณต้องมีวิธีระบุ user ที่ password ยังเป็น plain text
// ตัวอย่าง: สมมติว่า plain text password จะไม่มี '$' และสั้นกว่า hash
// หรือถ้าคุณรู้ ID ของ user ที่ต้องการ migrate
$sql_select = "SELECT id, password FROM users WHERE password NOT LIKE '$2y$%' AND password NOT LIKE '$argon2i$%' AND LENGTH(password) < 60"; // ปรับเงื่อนไขนี้ให้เหมาะสม!

$result = $conn->query($sql_select);

if ($result->num_rows > 0) {
    echo "Found " . $result->num_rows . " users with plain text passwords to migrate.<br>";
    while ($row = $result->fetch_assoc()) {
        $user_id = $row['id'];
        $plain_password = $row['password'];

        if (!empty($plain_password)) { // ตรวจสอบว่า password ไม่ใช่ค่าว่าง
            $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);

            $sql_update = "UPDATE users SET password = ? WHERE id = ?";
            $stmt_update = $conn->prepare($sql_update);
            if ($stmt_update) {
                $stmt_update->bind_param("si", $hashed_password, $user_id);
                if ($stmt_update->execute()) {
                    echo "User ID: " . $user_id . " - Password migrated successfully.<br>";
                } else {
                    echo "Error updating User ID: " . $user_id . " - " . $stmt_update->error . "<br>";
                }
                $stmt_update->close();
            } else {
                echo "Error preparing update for User ID: " . $user_id . " - " . $conn->error . "<br>";
            }
        } else {
            echo "User ID: " . $user_id . " - Password was empty, skipped.<br>";
        }
    }
} else {
    echo "No users found with plain text passwords matching the criteria.<br>";
}

$conn->close();
?>