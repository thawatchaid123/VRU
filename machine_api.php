<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function validateImage($file) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    $max_size = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowed_types)) {
        throw new Exception('Invalid file type');
    }
    
    if ($file['size'] > $max_size) {
        throw new Exception('File too large');
    }
    
    return true;
}

$host = 'localhost';
$dbname = 'reportss';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            $stmt = $conn->prepare("SELECT machine_id, machine_type, start_date, operation_details, 
                                  image_data, image_type FROM machines 
                                  ORDER BY start_date DESC");
            $stmt->execute();
            $machines = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert image data to base64 for each record
            foreach ($machines as &$machine) {
                if ($machine['image_data'] !== null) {
                    $machine['image_url'] = 'data:' . $machine['image_type'] . ';base64,' . 
                                          base64_encode($machine['image_data']);
                } else {
                    $machine['image_url'] = null;
                }
                unset($machine['image_data']);
                unset($machine['image_type']);
            }
            
            echo json_encode($machines);
            break;

        case 'POST':
            try {
                $machineId = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_STRING);
                $machineType = filter_input(INPUT_POST, 'type', FILTER_SANITIZE_STRING);
                $startDate = filter_input(INPUT_POST, 'startDate', FILTER_SANITIZE_STRING);
                $operationDetails = filter_input(INPUT_POST, 'operationDetails', FILTER_SANITIZE_STRING);
                
                if (!$machineId || !$machineType || !$startDate) {
                    throw new Exception('Missing required fields');
                }

                // Handle image
                $imageData = null;
                $imageType = null;
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    validateImage($_FILES['image']);
                    $imageData = file_get_contents($_FILES['image']['tmp_name']);
                    $imageType = $_FILES['image']['type'];
                }
                
                // Insert data into database
                $stmt = $conn->prepare("INSERT INTO machines (machine_id, machine_type, start_date, 
                                      operation_details, image_data, image_type) 
                                      VALUES (:machine_id, :machine_type, :start_date, 
                                      :operation_details, :image_data, :image_type)");
                
                $stmt->execute([
                    ':machine_id' => $machineId,
                    ':machine_type' => $machineType,
                    ':start_date' => $startDate,
                    ':operation_details' => $operationDetails,
                    ':image_data' => $imageData,
                    ':image_type' => $imageType
                ]);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Machine data saved successfully'
                ]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>