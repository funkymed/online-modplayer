<?php
// Headers CORS pour permettre le chargement des fichiers MOD depuis React
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Récupérer le nom du fichier depuis l'URL
$file = $_GET['file'] ?? '';

if (empty($file)) {
    http_response_code(400);
    echo 'No file specified';
    exit;
}

// Construire le chemin complet du fichier
$filepath = $file;

// Vérifier que le fichier existe et est dans le répertoire tmp/
if (!file_exists($filepath) || !is_readable($filepath)) {
    http_response_code(404);
    echo 'File not found';
    exit;
}

// Vérifier que le fichier est bien dans le répertoire tmp pour la sécurité
$realpath = realpath($filepath);
$tmp_dir = realpath('tmp/');
if (!$realpath || strpos($realpath, $tmp_dir) !== 0) {
    http_response_code(403);
    echo 'Access denied';
    exit;
}

// Définir le type de contenu approprié
$extension = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));
switch ($extension) {
    case 'mod':
        header('Content-Type: audio/mod');
        break;
    case 'it':
        header('Content-Type: audio/it');
        break;
    case 'xm':
        header('Content-Type: audio/xm');
        break;
    default:
        header('Content-Type: application/octet-stream');
}

// Définir la taille du fichier
header('Content-Length: ' . filesize($filepath));

// Permettre la mise en cache
header('Cache-Control: public, max-age=3600');
header('ETag: "' . md5_file($filepath) . '"');

// Servir le fichier
readfile($filepath);