<?php

/*
 * This should be included whilst we are debugging the application
 */
error_reporting( E_ALL );
ini_set( "display_errors", 1 );

/*
 * Typically we'd handle this when we handle the back-end routing, but since we're calling specific scripts
 * we can just add it in here
 */
define('ROOT',$_SERVER['DOCUMENT_ROOT']);
require ROOT.'/rghack2015/app/services/classLoader.php';

class LoginController{

    private $login;
    private $request;
    private $post;

    public function __construct()
    {
        $this->request = new requestObject();
        $this->login = new LoginModel();
        $this->summoner = new SummonerModel();
        $this->post = $this->request->getPOST();
        if(isset($this->post->action)) {
            switch ($this->post->action) {
                case 'authenticateUser':
                    $this->authenticateUser($this->post);
                    break;
                case 'verifyAccount':
                    $this->verifyUser($this->post);
                    break;
                default:
                    responder::sendResponse(400);
            }
        }

    }

    public function authenticateUser($posted)
    {
       // var_dump($posted);
        if(isset($posted->name) && strlen($posted->name) > 0) {
            if ($this->login->attemptAuthentication($posted->name)) {
                return responder::sendResponse(200);
            } else {
                return responder::sendResponse(400);
            }
        }else{
            return responder::sendResponse(400);
        }
    }

    public function verifyUser($posted)
    {
        $uid = $posted->runepageString[0];
        $runepage = $posted->runepageString[1];
        $summonerName = $posted->id;
        if($this->login->checkForRunepage($uid,$runepage)){
            $this->summoner = $this->summoner->loadSummonerByName($summonerName);
            return responder::sendResponse(200, ['summonerID' => $uid,'profileIconID' => $this->summoner->getProfileIcon(),'champMasteries' => $this->summoner->getChampMasteries()]);
        }else{
            return responder::sendResponse(400);
        }
    }

}

new LoginController();
?>