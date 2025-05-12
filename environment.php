<?php
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'reportss';
$tableName = 'environment';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT id, problem, location FROM $tableName ORDER BY problem ASC");
            $environments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($environments);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['problem'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Problem is required']);
                exit();
            }

            $problem = trim($input['problem']);
            $location = isset($input['location']) ? trim($input['location']) : null;

            $sql = "INSERT INTO $tableName (problem, location) VALUES (:problem, :location)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':problem', $problem, PDO::PARAM_STR);
            $stmt->bindParam(':location', $location, PDO::PARAM_STR);

            if ($stmt->execute()) {
                $lastId = $pdo->lastInsertId();
                http_response_code(201);
                echo json_encode(['id' => $lastId, 'problem' => $problem, 'location' => $location]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add environment']);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['id']) || empty($input['problem'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Environment ID and problem are required for update']);
                exit();
            }

            $id = filter_var($input['id'], FILTER_VALIDATE_INT);
            $problem = trim($input['problem']);
            $location = isset($input['location']) ? trim($input['location']) : null;

            if ($id === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid Environment ID']);
                exit();
            }

            $sql = "UPDATE $tableName SET problem = :problem, location = :location WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':problem', $problem, PDO::PARAM_STR);
            $stmt->bindParam(':location', $location, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Environment updated successfully']);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Environment not found or no change made']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update environment']);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Environment ID is required for deletion']);
                exit();
            }

            $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
            if ($id === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid Environment ID']);
                exit();
            }

            $sql = "DELETE FROM $tableName WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Environment deleted successfully']);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Environment not found']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete environment']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['error' => 'Problem already exists.']);
    } else {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
