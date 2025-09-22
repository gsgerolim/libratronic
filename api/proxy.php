<?php
// Simple proxy to forward requests to the ESP host to bypass CORS when needed.
// Usage: proxy.php?host=http://esp32.local&path=/api/status  (POST body forwarded)
header("Content-Type: application/json");

$host = $_GET["host"] ?? "";
$path = $_GET["path"] ?? "";
if (!$host || !$path) {
  http_response_code(400);
  echo json_encode(["error"=>"host and path required"]);
  exit;
}

$method = $_SERVER["REQUEST_METHOD"];
$ch = curl_init();
$url = rtrim($host, "/") . $path;
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$headers = ["Content-Type: application/json"];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

if ($method === "POST") {
  $body = file_get_contents("php://input");
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($response === false) {
  http_response_code(502);
  echo json_encode(["error"=>"proxy failed", "detail"=>curl_error($ch)]);
  curl_close($ch);
  exit;
}
curl_close($ch);
http_response_code($httpcode);
echo $response;
