<?php
// Headers CORS pour permettre les requêtes depuis React
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
if(isset($_FILES['file']))
{
    if(move_uploaded_file($_FILES['file']['tmp_name'], 'tmp/'.$_FILES['file']['name']))
    {
        echo json_encode(array('success'=>true,'name'=>'tmp/'.$_FILES['file']['name']));
    }
}

