<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//  กำหนด path ของไฟล์ CSS 
$css_file_path = __DIR__ . '/build/static/css/main.12df57f2.css'; 

//  ตรวจสอบว่าไฟล์มีอยู่จริง
if (!file_exists($css_file_path)) {
    header('HTTP/1.1 404 Not Found');
    exit('File not found.');
}

//  กำหนด Content-Type header
header('Content-Type: text/css');

//  อ่านเนื้อหาของไฟล์ CSS และส่งกลับ
echo file_get_contents($css_file_path);
?>