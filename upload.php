<?php
if(isset($_FILES['file']))
{
    if(move_uploaded_file($_FILES['file']['tmp_name'], 'mods/'.$_FILES['file']['name']))
    {
        echo json_encode(array('success'=>true,'name'=>'mods/'.$_FILES['file']['name']));
    }
}

