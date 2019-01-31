<?php
	header('content-type:application:json;charset=utf8'); 
	header('Access-Control-Allow-Origin:*'); 
	header('Access-Control-Allow-Methods:POST'); 
	header('Access-Control-Allow-Headers:x-requested-with,content-type'); 
	date_default_timezone_set('PRC');
	$fp = fopen("pathresult.csv", 'r');
	if ($fp == null){
		echo("");
		return;
	}
	echo fread($fp,filesize("pathresult.csv"));
	fclose($fp);
?>