<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_GET['method'] ?? $_POST['method'] ?? null;

if (!$method) {
    http_response_code(400);
    echo json_encode(["error" => "Method not specified"]);
    exit;
}

authCheck();

switch ($method) {
    case 'getProjects':
        getProjects();
        break;
    case 'createProject':
        createProject();
        break;
    case 'deleteProject':
        deleteProject();
        break;
    case 'getUploads':
        getUploads();
        break;
    case 'uploadFiles':
        uploadFiles();
        break;
    case 'authCheck':
        // already checked
        break;
    default:
        http_response_code(404);
        echo json_encode(["error" => "Unknown method"]);
}

function authCheck() {
    include_once 'adminauth.php';
}

function sanitizeStudentName($name)
{
    $allowedChars = '/[^a-zA-Z0-9_\- ]/';
    return preg_replace($allowedChars, '', $name);
}

function getProjects()
{
    $db = Database::getConnection();
    $query = $db->query("SELECT * FROM upload_projects ORDER BY created_at DESC");
    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
}

function createProject()
{
    $db = Database::getConnection();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['name']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        return;
    }

    $stmt = $db->prepare("INSERT INTO upload_projects (name) VALUES (:name)");
    $stmt->execute([':name' => $data['name']]);
    echo json_encode(["message" => "Project created"]);
}

function deleteProject()
{
    $db = Database::getConnection();
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Project ID required"]);
        return;
    }

    $stmt = $db->prepare("DELETE FROM upload_projects WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(["message" => "Project deleted"]);
}

function getUploads()
{
    $db = Database::getConnection();
    $projectId = $_GET['project_id'] ?? null;
    $studentName = $_GET['student_name'] ?? null;

    if (!$projectId && !$studentName) {
        http_response_code(400);
        echo json_encode(["error" => "Project ID or student name required"]);
        return;
    }

    if ($studentName) {
        $studentName = sanitizeStudentName($studentName);
    }

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
}

function uploadFiles()
{
    $db = Database::getConnection();

    if (!isset($_POST['project_id']) || !isset($_POST['student_name']) || !isset($_FILES['files'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        return;
    }

    $projectId = $_POST['project_id'];
    $studentName = sanitizeStudentName($_POST['student_name']);
    $uploadDir = __DIR__ . '/../uploads/' . $projectId . '/' . $studentName;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    foreach ($_FILES['files']['tmp_name'] as $index => $tmpName) {
        $fileName = basename($_FILES['files']['name'][$index]);
        $filePath = "$uploadDir/$fileName";
        if (move_uploaded_file($tmpName, $filePath)) {
            $stmt = $db->prepare("INSERT INTO upload_files (student_name, project_id, file_name, file_path) VALUES (:student_name, :project_id, :file_name, :file_path)");
            $stmt->execute([
                ':student_name' => $studentName,
                ':project_id' => $projectId,
                ':file_name' => $fileName,
                ':file_path' => $filePath
            ]);
        }
    }

    echo json_encode(["message" => "Files uploaded successfully"]);
}
