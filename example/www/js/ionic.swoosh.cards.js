(function(ionic) {

  /***********************************
   * Get transform origin poly
   ***********************************/
  var d = document.createElement('div');
  var transformKeys = ['webkitTransformOrigin', 'transform-origin', '-webkit-transform-origin', 'webkit-transform-origin',
              '-moz-transform-origin', 'moz-transform-origin', 'MozTransformOrigin', 'mozTransformOrigin'];

  var TRANSFORM_ORIGIN = 'webkitTransformOrigin';
  for(var i = 0; i < transformKeys.length; i++) {
    if(d.style[transformKeys[i]] !== undefined) {
      TRANSFORM_ORIGIN = transformKeys[i];
      break;
    }
  }

  var transitionKeys = ['webkitTransition', 'transition', '-webkit-transition', 'webkit-transition',
              '-moz-transition', 'moz-transition', 'MozTransition', 'mozTransition'];
  var TRANSITION = 'webkitTransition';
  for(var i = 0; i < transitionKeys.length; i++) {
    if(d.style[transitionKeys[i]] !== undefined) {
      TRANSITION = transitionKeys[i];
      break;
    }
  }


  /***********************************
   * Swipeable Card View
   ***********************************/
  var SwipeableCardView = ionic.views.View.inherit({

    /***************
     * Initialize
     ***************/

    // Initialize a card with the given options.
    initialize: function(opts) {
      opts = ionic.extend({
      }, opts);

      ionic.extend(this, opts);

      this.el = opts.el;

    },

    /***************
     * Utils
     ***************/

    setZindex: function(value, element) {
      var element = element || this.el;
      element.style.zIndex = element.style.webkitzIndex = value;
    },

    setTransform: function(value) {
      var element = element || this.el;
      element.style.transform = element.style.webkitTransform = value;
    },

    setOpacity: function(value, element) {
      var element = element || this.el;
      element.style.opacity = element.style.webkitOpacity = value;
    },

    setBoxShadow: function(value) {
      var element = element || this.el;
      element.style.boxShadow = element.style.webkitBoxShadow = value;
    },

    setTransition: function(value) {
      var element = element || this.el;
      element.style.transition = element.style.webkitTransition = value;
    },

    calculateBoxShadow: function(index) {
      return (0.5 + (index / 20));
    },

    calculateOpacity: function(index) {
      return (0 + (index / 6));
    },

    calculateScale: function(index) {
      return Math.max(0, (1 - (index / 10)));
    },

    calculateTranslateX: function(index) {
      return (index * this.spacing);
    },

    destroy: function(duration) {
      var self = this;
      setTimeout(function() {
        self.onDestroy && self.onDestroy();
      }, duration);
    },

    /***************
     * Animations
     ***************/

    // Swoosh the card away
    animateSwoosh: function(index) {

      var self = this;

      var card = this.el;

      card.style.transition = card.style.webkitTransition = '';

      var translateX = -600;
      var scale = 180;

      var animation = collide.animation({
        duration: 1000,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 250,
        initialForce: false
      })

      .on('step', function(v) {
        card.style.transformOrigin = card.style.webkitTransformOrigin = '0 50%';
        card.style.transform = card.style.webkitTransform = 'translate3d(' + translateX*v + 'px, 0,0) rotate3d(.25, -1, 0, '+ scale*v +'deg)';
      })
      .start();

      // Trigger destroy after card has swiped out
      this.destroy(700);

    },


    // Move the card one step forward
    animateStepForward: function(index) {

      var self  = this;

      var card = this.el;

      var overlay = card.childNodes[0].childNodes[1];

      var shadow = self.calculateBoxShadow(index);
      var opacity = self.calculateOpacity(index);

      var animation = collide.animation({
        duration: 800,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 250,
        initialForce: false
      })

      .on('step', function(v) {
        self.setTransform('translate3d(' + Math.max(0, (self.translateX - (30 * v))) + 'px, 0, 0) scale('+ Math.max(0, (self.scale + (0.1 * v))) +')');
        self.setBoxShadow('0px 50px 100px rgba(0,0,0,'+ shadow +')');
        self.setOpacity(opacity, overlay);
      })

      .on('complete', function() {
        self.translateX = self.translateX - 30;
        self.scale = self.scale + 0.1;
        if(index === 0 || self.collection.length === 1) {
          var overlay = card.childNodes[0].childNodes[1];
          var content = card.childNodes[0].childNodes[0];
          self.setZindex(9, overlay);
          self.setZindex(10, content);
        }
      })
      .start();

    },

    // Move the card one step backward
    animateStepBackward: function(index) {

      var self  = this;

      var card = this.el;

      var overlay = card.childNodes[0].childNodes[1];

      self.translateX = self.calculateTranslateX(index);
      self.scale = self.calculateScale(index);
      self.shadow = self.calculateBoxShadow(index);
      self.opacity = self.calculateOpacity(index);

      var animation = collide.animation({
        duration: 800,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 250,
        initialForce: false
      })

      .on('step', function(v) {
        self.setTransform('translate3d(' + self.translateX*v + 'px, 0, 0) scale('+ self.scale*v +')');
        self.setBoxShadow('0px 50px 100px rgba(0,0,0,'+ self.shadow +')');
        self.setOpacity(self.opacity, overlay);
      })
      .on('complete', function() {
        // // var overlay = card.childNodes[0].childNodes[0];
        // var cardLength = self.collection.length;
        // // self.setZindex(cardLength - (i - 1), overlay);
        // self.setZindex(cardLength - i);
      })
      .start();

    }

  });


  /***********************************
   * Swipeable Card Collection
   ***********************************/
  var SwipeableCardCollection = ionic.views.View.inherit({

    /***************
     * Initialize
     ***************/

    // Initialize a card with the given options.
    initialize: function(opts) {

      opts = ionic.extend({
      }, opts);

      ionic.extend(this, opts);

    },

    // Sort the cards initially and apply the appropriate animations
    sortCards: function($timeout) {

      var self = this;

      var existingCards = this.collection;

      for(i = 0; i < existingCards.length; i++) {

        var card = existingCards[i];

        if(!card) continue;

        if(i === 0) {
          var overlay = existingCards[i].childNodes[0].childNodes[1];
          var content = existingCards[i].childNodes[0].childNodes[0];
          existingCards[i].swipeableCard.setZindex(9, overlay);
          existingCards[i].swipeableCard.setZindex(10, content);
        } else {
          (function(j) {
            $timeout(function() {
              existingCards[j].swipeableCard.animateStepBackward(j);
            }, 100 * j);
          })(i);
        }
        existingCards[i].swipeableCard.setZindex(existingCards.length - i);
      }
    },

    // Move the cards forward (after a card has been destroyed)
    moveCardsForward: function ($element, $timeout) {

      var self = this;

      var existingCards = $element[0].querySelectorAll('swoosh-card');

      this.collection = existingCards;

      for(var i = 0; i < existingCards.length; i++){

        var card = existingCards[i];

        if(i === 0 || existingCards.length === 1){
          (function(j) {
            $timeout(function() {
              existingCards[j].swipeableCard.animateSwoosh(existingCards[j], j);
            }, 100 * j);
          })(i);
        } else {
          (function(j) {
            $timeout(function() {
              existingCards[j].swipeableCard.animateStepForward(j - 1);
            }, 100 * j);
          })(i);
        }
      }
    }

  });

  /***********************************
   * Swoosh Card Directive (singular)
   ***********************************/
  angular.module('ionic.swoosh.cards', ['ionic'])

  .directive('swooshCard', ['$timeout', function($timeout) {

    return {
      restrict: 'E',
      template: '<div class="swoosh-card"><div class="content" ng-transclude></div><div class="overlay"></div></div>',
      require: '^swooshCards',
      transclude: true,

      scope: {
        onDestroy: '&'
      },

      controller: ['$scope', '$element', function($scope, $element) {

          var el = $element[0];

          // Force hardware acceleration for animation - better performance on first touch
          el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0px, 0px)';

          $timeout(function() {

            // Extend the swipeableCard object
            angular.extend(el.swipeableCard, {
              onDestroy: function() {
                $timeout(function() {
                  $scope.onDestroy();
                });
              }
            });

            $scope.$parent.swipeCard = el;

          });

          // On click, emit a 'discard' message to be received by 'swooshCards' and parent controllers
          $scope.$parent.discard = function(card) {
            var element = $scope.$parent.swipeCard;
            $scope.$emit('discard', element, card);
          }

      }],
    }
  }])

  /***************************************
   * Swoosh Cards Directive (collection)
   ***************************************/
  .directive('swooshCards', ['$rootScope', '$timeout', function($rootScope, $timeout) {

    return {
      restrict: 'E',
      template: '<div class="swoosh-cards" ng-transclude></div>',
      transclude: true,
      scope: {
        spacing: '@',
        max: '@',
      },

      controller: ['$scope', '$element', '$timeout', function($scope, $element, $timeout) {

        // Instantiate a new card collection
        var cardCollection = new SwipeableCardCollection({
          collection: []
        });

        $timeout(function() {

          // Query for all of the cards
          var cards = $element[0].querySelectorAll('swoosh-card');

          // Loop through the cards and instantiate a new SwipeableCardView
          for(var i = 0; i < cards.length; i++){
            cards[i].swipeableCard = new SwipeableCardView({
              el: cards[i],
              collection: cardCollection,
              spacing: ($scope.spacing) ? $scope.spacing : 30
            })

            cardCollection.collection.push(cards[i]);
          }

          cardCollection.max = ($scope.max) ? $scope.max : 10;

          // Sort the cards and display them at specified intervals
          cardCollection.sortCards($timeout);

        });

        // On discard, move all the cards forward one step (emits from 'swooshCard' directive)
        $scope.$on('discard', function(event, element, card) {
          $timeout(function() {
            cardCollection.moveCardsForward($element, $timeout);
          });
        });

      }]
    }
  }])

})(window.ionic);
