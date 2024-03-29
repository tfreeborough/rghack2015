"use strict";

angular.module("LobbyApp", [])
    .config(["$routeProvider", function($routeProvider) {
        $routeProvider
            .when("/lobby", {
                templateUrl: "lobby/lobby.html",
                controller: "LobbyCtrl"
            })
    }])
    .factory("Lobby", function($q, $timeout, $http, LobbyMock) {
        return {
            findMatch: function(User) {
                var p = $q.defer();
                console.log(User)
                $http.post("game/start.php", {name: User.name, id: User.summonerID, iconId: User.profileIconID})
                    .success(function(response) {
                        p.resolve(response);
                    })
                    .error(function() {
                        p.reject(false);
                    })

                return p.promise;
            }
        }
    })
    .factory("LobbyMock", function($q, $timeout) {
        return {
            findMatch: function() {
                var p = $q.defer();

                $timeout(function() {
                    p.resolve({
                        gameID: 747,
                        player0: {
                            profileId: 511,
                            name: "Sal",
                            currentHealth: 100
                        },
                        player1: {
                            profileId: 901,
                            name: "Phreak",
                            currentHealth: 100
                        }
                    });
                }, 1000);

                return p.promise;
            }
        }
    })
    .controller("LobbyCtrl", ["$scope", "$location", "$log", "Lobby", "Match", "User", function($scope, $location, $log, Lobby, Match, User) {
    	console.log(User);

        $scope.form = {
            isSearching: false
        }

        //finds a match
        $scope.play = function() {
            $scope.form.isSearching = true;

            Lobby.findMatch(User.user).then(function(playerNum) {
                //load match object
                //Match.game = game;

                //hardcode
                Match.game = {
                    gameID: 747,
                    player0: {
                        profileId: User.user.profileIconID,
                        name: User.user.name,
                        currentHealth: 100
                    },
                    player1: {
                        profileId: 901,
                        name: "Phreak",
                        currentHealth: 100
                    }
                };

                //ser user service playerNum to response
                User.playerNum = playerNum;

                console.log(User.playerNum);

                //go to match
                $location.url("/match");

            })
        }
    }])
