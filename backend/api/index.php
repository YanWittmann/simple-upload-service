<?php
require_once 'db.php';

header("Content-Type: application/json");

$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'], '/'));

switch ($path[0]) {
    case 'projects':
        handleProjects($requestMethod);
        break;
    case 'uploads':
        handleUploads($requestMethod);
        break;
    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
}

function handleProjects($method)
{
    $db = Database::getConnection();

    if ($method === 'GET') {
        $query = $db->query("SELECT * FROM upload_projects ORDER BY created_at DESC");
        echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['name']) || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input"]);
            return;
        }
        $stmt = $db->prepare("INSERT INTO upload_projects (name) VALUES (:name)");
        $stmt->execute([':name' => $data['name']]);
        echo json_encode(["message" => "Project created"]);
    } elseif ($method === 'DELETE') {
        $id = $path[1] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Project ID required"]);
            return;
        }
        $stmt = $db->prepare("DELETE FROM upload_projects WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["message" => "Project deleted"]);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }
}

function handleUploads($method)
{
    $db = Database::getConnection();

    if ($method === 'GET') {
        $projectId = $_GET['project_id'] ?? null;
        $studentName = $_GET['student_name'] ?? null;

        $query = "SELECT * FROM upload_files";
        $params = [];
        if ($projectId || $studentName) {
            $conditions = [];
            if ($projectId) {
                $conditions[] = "project_id = :project_id";
                $params[':project_id'] = $projectId;
            }
            if ($studentName) {
                $conditions[] = "student_name = :student_name";
                $params[':student_name'] = $studentName;
            }
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        if (!isset($_POST['project_id']) || !isset($_POST['student_name']) || !isset($_FILES['files'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            return;
        }

        $projectId = $_POST['project_id'];
        $studentName = $_POST['student_name'];
        $uploadDir = __DIR__ . '/../uploads/' . $projectId . 'index.php/' . $studentName;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        foreach ($_FILES['files']['tmp_name'] as $index => $tmpName) {
            $fileName = basename($_FILES['files']['name'][$index]);
            $filePath = "$uploadDir/$fileName";
            if (move_uploaded_file($tmpName, $filePath)) {
                $stmt = $db->prepare("INSERT INTO upload_files (student_name, project_id, file_path) VALUES (:student_name, :project_id, :file_path)");
                $stmt->execute([
                    ':student_name' => $studentName,
                    ':project_id' => $projectId,
                    ':file_path' => $filePath
                ]);
            }
        }
        echo json_encode(["message" => "Files uploaded successfully"]);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }
}
