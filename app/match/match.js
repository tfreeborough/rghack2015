'use strict';

angular.module("MatchApp", [])
.config(["$routeProvider", function($routeProvider){
	$routeProvider
		.when("/match", {
			templateUrl: "match/match.html",
			controller: "MatchCtrl"
		})
}])
.service("Match", function(User){
	this.game = {
		gameID: 747,
		player0: {
			profileId: User.user.profileIconID,
			name: User.user.name, 
			currentHealth: 100,
			draw: []
		},
		player1: {
			profileId: 901,
			name: "Phreak",
			currentHealth: 100,
			draw: []
		}
	};
})
.factory("ActionLog", function($http, $q, $log){
	return {
		sendAction: function(player, action){
			var p = $q.defer();

			$http({
				method: "POST",
				url: talkServer + 'action',
				data: $.param({
					player: player,
					action: JSON.stringify(action)
				}),
				headers: {
					"Content-Type":"application/x-www-form-urlencoded"
				}
			})
			.success(function(result){
				p.resolve(result);
			})
			.error(function(){
				p.reject(false);
			})

			return p.promise;
		}
	}
})
.controller("MatchCtrl", ['$scope', '$interval', '$log', '$q', 'User', 'Match', 'ActionLog', function($scope, $interval, $log, $q, User, Match, ActionLog){
	$scope.game = Match.game;
	$scope.game.whosTurn = 0;
	$scope.game.cardPlaced = false;
	$scope.game.playerNum = User.playerNum;
	$scope.game.gameResult = null;
	
	$log.info("Game:");
	console.log($scope.game);

	$scope.dims = {
		height: '100%',
		width: '100%'
	}

	//on ready get page dimensions
	// angular.element(document).ready(function(){
	// 	$scope.dims.height = $(document).height();
	// 	console.log($scope.dims);
	// })
	
	//WATCH HEIGHT
	$scope.$watch(function(){
		return window.innerHeight;
	}, function(val){
		$scope.dims.height = val;
	})

	//WATCH WIDTH
	$scope.$watch(function(){
		return window.innerWidth;
	}, function(){
		$scope.dims.width = $('#board').height();
		$log.info("dimensions");
		$log.debug($scope.dims);

	})

	//socket stuff
	var sourceUrl = talkServer + 'game?player=' + User.playerNum; 
	console.log(sourceUrl);
	var player = new EventSource(sourceUrl);
 	$scope.game.player0.draw = [];
 	$scope.game.player0.onField = [];
 	soundController('match');

 	player.onmessage = function(event) {
    	
    	console.log(event.data);
    	var e = {};
    	$.extend(true, e, JSON.parse(event.data));

    	//TURNS
    	if(e.type == "turn"){
    		$scope.game.turn = e.data;
    		$scope.game.whosTurn = (e.data % 2 == User.playerNum) ? ($scope.game.cardPlaced = false, User.playerNum) : 1 - User.playerNum;
    	}

    	if(e.type == "opponent"){
    		$scope.game.player1.name = e.data.name;
    		$scope.game.player1.profileId = e.data.icon;
    	}

    	if(e.type == "hand"){
    		$scope.game.player0.draw = e.data;
    	}

    	if(e.type == "player"){
    		$scope.game.player0.onField = e.data;
    	}

    	if(e.type == "enemy"){
    		$scope.game.player1.onField = e.data;
    	}

    	if(e.type == "death"){
    		//sound for death, e.data will be champion ID
    		soundController('death', '' + e.data);
    	}

    	if(e.type == "victory"){
    		$scope.game.gameResult = 'victory';
    	}

    	if(e.type == "defeat"){
    		$scope.game.gameResult = "defeat";
    	}

    	if(e.type == "attacked"){
    		$log.info("attacked");
    		$log.debug(e.data);
    		$scope.attackAnimation(e.data);
    	}

    	if(e.type == "damage"){
    		$scope.attackedAnimation(e.data.id, e.data.amount);	
    	}

    	if(e.type == "nexus"){
    		$scope.game.player0.currentHealth = e.data[User.playerNum];
    		$scope.game.player1.currentHealth = e.data[1 - User.playerNum];
    	}

    	//when zileans ult takes place
    	if(e.type == "zilean"){
    		$scope.reviveAnimcation(e.data);
    	}

    	if(e.type == "taunt"){
    		$scope.game.showTaunt = true;
    		$timeout(function(){
    			$scope.game.showTaunt = false;
    		}, 500);
    	}

    	//ENEMY HAND
    	if(e.type == "enemyPlace"){
    		$log.info("enemyPlace");
    		$log.debug(e.data);	
    	}

    	$scope.$digest();
  	};

  	$scope.submitAction = function(action){
  		var p = $q.defer();

  		ActionLog.sendAction(User.playerNum, action).then(function(response){
  			$log.info("ActionLog.sendAction: Response -");
  			$log.debug(action);
  			$log.debug(response);

  			p.resolve(true);
  		})

  		return p.promise;
  	}

  	$scope.endTurn = function(){
  		$scope.submitAction({type: "endturn"}).then(function(){
			soundController('yourTurn');
			$scope.game.pendingAttack = false;
		});

  	}

  	var selectedCard;
  	var enemyCard;
  	$scope.$on("attack", function(e, action){
  	 	var type = action.type;
  	 	var enemyCard = action.enemyCard;
  	 	var card = action.card;

		//log resulting status
		$log.info("performAttack: Enemy Champion: " + enemyCard.champion + ", health: " + enemyCard.health);

		if(type == "basic"){
			soundController('attack',card.championid);
			$scope.submitAction({type: "attack", card: card.id, target: enemyCard.id});
			card.basicFlag = true;
		}
		else if(type == "special"){
			soundController("special", card.championid);
			$scope.submitAction({type: "ability", card: card.id, target: enemyCard.id});
		}

		//listener = null;
	});

  	$scope.performAttack = function(card, type){
  		$scope.game.attackType = type;
  		selectedCard = card;

  		//If type is
  		if(type == "basic" || card.targetType=="single"){
  			$scope.game.pendingAttack = true;
  		} else if(card.targetType=="none") {
  			$scope.submitAction({type: "ability", card: card.id, target: null});
  		}
  		$log.info("performAttack: Champion: " + card.champion + ", type: " + type);
  		
  	}

  	$scope.reviveAnimcation = function(target){
  		$('#'+target).addClass('animated flipInX');
  		
  		$('#'+target).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$('#'+target).removeClass('animated flipInX');
		});
  	}

  	$scope.sendTaunt = function(){
  		$scope.submitAction({type: "taunt"});
  	}

  	$scope.attackAnimation = function(card){
  		
		$('#'+card).addClass('animated').addClass('flip');

  		$('#'+card).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$('#'+card).removeClass('animated flip');
			
		});
  	}

  	$scope.attackedAnimation = function(target, damage){
  		$('#'+target).addClass('animated').addClass('shake');
		$('#'+target).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$('#'+target).removeClass('animated shake');
			//show damage
			$('#'+target+"_dmg").text(damage).addClass('animated bounceIn');
			$('#'+target).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
				setTimeout(function(){
					$('#'+target+"_dmg").removeClass('animated bounceIn').addClass('animated fadeOutUp');
					$('#'+target).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
						$('#'+target+"_dmg").removeClass('animated fadeOutUp');
						$('#'+target+'_dmg').text('');
					});
				},300);
			});
		});
  	}

  	attackedAnimation = $scope.attackedAnimation;

	$scope.stunAnimation = function(target){
		$('#'+target).addClass('slowAnimate infinite swing stunned');
	}

	$scope.removeStunAnimation = function(target){
		$('#'+target).removeClass('slowAnimate infinite swing stunned');
	}

  	$scope.targetEnemy = function(card){
  		if($scope.game.pendingAttack){
  			$log.info("targetEnemy: Enemy Champion " + card.champion);
  			$scope.$broadcast("attack", {type: $scope.game.attackType, card: selectedCard, enemyCard: card});
  		}

  		$scope.attackAnimation(selectedCard.id, card.id);
		// $('#'+selectedCard.id).addClass('animated').addClass('flip');

		// $('#'+selectedCard.id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
		// 	$('#'+selectedCard.id).removeClass('animated flip');
		// 	$('#'+card.id).addClass('animated').addClass('shake');
		// 	$('#'+card.id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
		// 		$('#'+card.id).removeClass('animated shake');
		// 	});
		// });

  	}

  	$scope.placeCard = function(card){
  		// //remove from draw
  		// $scope.game.player0.draw.splice($scope.game.player0.draw.indexOf(card), 1);
  		// //push to field
  		// $scope.game.player0.onField.push(card);

  		$log.info("placeCard");
  		$log.debug(card);

  		//send action
  		if($scope.game.cardPlaced == false){
	  		$scope.submitAction({type: "place", hand: card.id}).then(function(){
	  			$scope.game.cardPlaced = true;
				soundController('summon',card.championid);
	  		})
  		}
  	}
}])