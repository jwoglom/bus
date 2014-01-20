<?php
$file = 'buses.txt';
$data = json_decode($datajson = file_get_contents($file));

$a = $_REQUEST['act'];

if(!isset($a)) {
    $a = 'fetch';
}

if($a == 'fetch') {
    die($datajson);
}

if($a == 'init') {
    file_put_contents($file, $d = "{}");
    die($d);
}

if($a == 'change') {
    foreach($_REQUEST as $n=>$v) {
        if($n == 'act') continue;
        //if($v == 'delete') unset($data->$n);
        $data->$n = $v;
    }
    file_put_contents($file, $d = json_encode($data));
    die($d);
}