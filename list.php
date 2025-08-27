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


function getDirectoryList($directory, $filter)
{

    // create an array to hold directory list
    $results = array();
    // create a handler for the directory
    $handler = opendir($directory);
    // open directory and walk through the filenames
    while ($file = readdir($handler)) {

        // if file isn't this directory or its parent, add it to the results
        if ($file != "." && $file != ".." && $file != ".DS_Store") {
            if(empty($filter) || !$filter) {
                $results[] = $directory.'/'.$file;
            } else {
                if(strstr(strtolower($file), $filter)) {
                    $results[] = $directory.'/'.$file;
                }

            }
        }
    }
    // tidy up: close the handler
    closedir($handler);
    // done!
    return $results;
}
$list = getDirectoryList('tmp', isset($_GET['filter']) ? $_GET['filter'] : false);
usort($list, 'strnatcasecmp');

//sort($list);
//$list = array_reverse($list);
echo json_encode($list);
