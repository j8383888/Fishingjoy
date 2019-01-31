<?php
	header('content-type:application:json;charset=utf8'); 
	header('Access-Control-Allow-Origin:*'); 
	header('Access-Control-Allow-Methods:POST'); 
	header('Access-Control-Allow-Headers:x-requested-with,content-type'); 
	date_default_timezone_set('PRC');
	$filecontent = file_get_contents("php://input");
	$fp = fopen("export/pathresult.csv", 'w');
	fwrite($fp, $filecontent);
	fclose($fp);
	echo("succeed!");
?>