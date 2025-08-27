<?php
if(isset($_FILES['file']))
{
    if(move_uploaded_file($_FILES['file']['tmp_name'], 'tmp/'.$_FILES['file']['name']))
    {
        echo json_encode(array('success'=>true,'name'=>'tmp/'.$_FILES['file']['name']));
    }
}

