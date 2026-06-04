<?php
// strava-token.php - Secure PHP Proxy for Strava OAuth Token Exchange
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed. Only POST is supported.']);
    exit;
}

// Get the POST JSON payload
$inputData = json_decode(file_get_contents('php://input'), true);
$code = isset($inputData['code']) ? trim($inputData['code']) : null;

if (!$code) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request: "code" parameter is required.']);
    exit;
}

// Include configuration file
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error: config.php not found. Please set up config.php on the server.']);
    exit;
}

require_once $configFile;

if (!defined('STRAVA_CLIENT_ID') || !defined('STRAVA_CLIENT_SECRET')) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error: Strava credentials not correctly defined in config.php.']);
    exit;
}

// Prepare the payload for Strava API
$postFields = [
    'client_id'     => STRAVA_CLIENT_ID,
    'client_secret' => STRAVA_CLIENT_SECRET,
    'code'          => $code,
    'grant_type'    => 'authorization_code'
];

$url = 'https://www.strava.com/oauth/token';

if (function_exists('curl_init')) {
    // Initialize cURL request
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);

    // Execute cURL request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        $errorMsg = curl_error($ch);
        curl_close($ch);
        http_response_code(500);
        echo json_encode(['error' => 'cURL Error: ' . $errorMsg]);
        exit;
    }

    curl_close($ch);

    // Output the response from Strava (either success or error)
    http_response_code($httpCode);
    echo $response;
} else {
    // Fallback using stream context (file_get_contents)
    $options = [
        'http' => [
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($postFields),
            'ignore_errors' => true // allows retrieving response body on 4xx/5xx errors
        ]
    ];
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    
    // Parse response headers to get HTTP status code
    $httpCode = 500;
    if (isset($http_response_header) && count($http_response_header) > 0) {
        if (preg_match('{HTTP\/\S+\s+(\d+)}', $http_response_header[0], $matches)) {
            $httpCode = intval($matches[1]);
        }
    }

    if ($response === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Stream Context Error: failed to connect to Strava API.']);
    } else {
        http_response_code($httpCode);
        echo $response;
    }
}
