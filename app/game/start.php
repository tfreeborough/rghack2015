<?php	
		
	/*
	 * This should be included whilst we are debugging the application
	 */
	
	/*
	 * Typically we'd handle this when we handle the back-end routing, but since we're calling specific scripts
	 * we can just add it in here
	 */
	define('ROOT',$_SERVER['DOCUMENT_ROOT']);
	require ROOT.'/rghack2015/app/services/classLoader.php';
	
	
		
	$deck = '["Alistar", "Zilean", "Kindred", "Brand", "Sona", "Teemo", "Caitlyn", "Chogath", "Karthus", "Bard", "Riven", "Rengar", "MasterYi", "Maokai", "Morgana", "Darius", "Soraka"]';
	
	error_reporting( E_ALL );
	ini_set( "display_errors", 1 );
	
	$address = 'http://192.168.56.101/socket/init';

	$input = json_decode(file_get_contents("php://input"));
	$nodeMastery = new NodeMasteryModel;
	$data = array('deck' => $deck, "name" => $input->name, "id" => $input->id, "iconId" => $input->iconId, "masteries" => $nodeMastery->loadMasteryById($input->id));

	$options = array(
    	'http' => array(
        	'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => http_build_query($data),
		),
	);
	
	$context = stream_context_create($options);
	
	$result = file_get_contents($address, false, $context);

	if ($result === "0" || $result === "1") {

		echo $result;

	} else {
		
		echo 'Game Failed to connect';
		
	}
	
	
?>