angular.module('starter', ['ionic', 'ionic.swoosh.cards'])


.config(function($stateProvider, $urlRouterProvider) {

})

.directive('noScroll', function($document) {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {

      $document.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
})

.controller('CardsCtrl', function($scope, $timeout) {

  var cardTypes = [
    {
      country: 'Switzerland',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'http://c4.staticflickr.com/4/3924/18886530069_840bc7d2a5_m.jpg',
    }, {
      country: 'Germany',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'http://c1.staticflickr.com/1/421/19046467146_548ed09e19_m.jpg'
    }, {
      country: 'Belgium',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'http://c1.staticflickr.com/1/278/18452005203_a3bd2d7938_m.jpg'
    }, {
      country: 'France',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'http://c1.staticflickr.com/1/297/19072713565_be3113bc67_m.jpg'
    }, {
      country: 'France',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'http://c1.staticflickr.com/1/536/19072713515_5961d52357_m.jpg'
    }, {
      country: 'France',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'http://c4.staticflickr.com/4/3937/19072713775_156a560e09_m.jpg'
    }, {
      country: 'France',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'http://c1.staticflickr.com/1/267/19067097362_14d8ed9389_m.jpg'
    }
  ];

  $scope.cards = {
    master: Array.prototype.slice.call(cardTypes, 0),
    active: Array.prototype.slice.call(cardTypes, 0),
    discards: [],
    liked: [],
    disliked: []
  }

  $scope.cardDestroyed = function(index) {
    var card = $scope.cards.active.splice(index, 1);
    // $scope.addCard(card);
  };

  $scope.addCard = function(card) {
    $scope.cards.active.push(angular.extend({}, card));
  }

  $scope.refreshCards = function() {
    // Set $scope.cards to null so that directive reloads
    $scope.cards.active = null;
    $timeout(function() {
      $scope.cards.active = Array.prototype.slice.call($scope.cards.master, 0);
    });
  }

  $scope.$on('discard', function(event, element, card) {
    // var discarded = $scope.cards.master.splice($scope.cards.master.indexOf(card), 1);
    // $scope.cards.discards.push(discarded);
  });

})

.controller('CardCtrl', function($scope) {

});
