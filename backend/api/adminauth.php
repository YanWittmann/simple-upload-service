<?php

$data = json_decode(file_get_contents('php://input'), true);

$password = $data['password'] ?? null;
$generate_response = $data['generate_response'] ?? null;

if (!$password) {
    http_response_code(400);
    echo json_encode(["error" => "Password not specified"]);
    exit;
}

if (hash('sha256', $password) !== 'ac3fafe4183d9714894fc7f97bdfe4b79688638c437491d6b4e452f8a3df656d') {
    http_response_code(401);
    echo json_encode(["error" => "Invalid password"]);
    exit;
}

if ($generate_response) {
    http_response_code(200);
    echo json_encode(["message" => "Admin authentication successful"]);
    exit;
}
