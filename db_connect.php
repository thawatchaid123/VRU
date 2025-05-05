<?php
$host = 'localhost';
$dbname = 'reportss';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'การเชื่อมต่อฐานข้อมูลล้มเหลว: ' . $conn->connect_error]));
}
$conn->set_charset('utf8');
?>