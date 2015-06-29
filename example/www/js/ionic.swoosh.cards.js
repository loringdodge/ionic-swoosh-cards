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

      this.parentWidth = this.el.parentNode.offsetWidth;
      this.width = this.el.offsetWidth;

      this.startX = this.startY = this.x = this.y = 0;

      this.bindEvents();
    },

    // Swipe a card out programatically
    swipe: function() {
      this.transitionOut();
    },

    // Snap the card back to its original position
    snapBack: function() {
      this.onSnapBack(this.x, this.y, this.rotationAngle);
    },

    /***************
     * Utils
     ***************/

    isUnderThreshold: function() {
      return Math.abs(this.thresholdAmount) < 0.4;
    },

    destroy: function(duration) {
      var self = this;
      setTimeout(function() {
        console.log('destroy')
        self.onDestroy && self.onDestroy();
      }, duration);
    },

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

    /***************
     * Animations
     ***************/

    // Animation to fly the card away
    animateFlyAway: function(index) {

      console.log('flyaway')

      var self = this;

      var card = this.el;

      card.style.transition = card.style.webkitTransition = '';

      var top = -600;
      var scale = 180;

      var animation = collide.animation({
        duration: 1000,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'gravity',
        frequency: 5,
        friction: 250,
        initialForce: false
      })

      .on('step', function(v) {
        card.style.transformOrigin = card.style.webkitTransformOrigin = '0 50%';
        card.style.transform = card.style.webkitTransform = 'translate3d(' + top*v + 'px, 0,0) rotate3d(.25, -1, 0, '+ scale*v +'deg)';
      })
      .start();

      // Trigger destroy after card has swiped out
      this.destroy(1000);

    },


    // Animation to fly the card away
    animateStepForward: function(index) {

      var self  = this;

      var card = this.el;

      var overlay = card.childNodes[0].childNodes[0];

      var shadow = (0.5 + (index / 20));
      var opacity = 0 + (index / 10);

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
        self.setTransform('translate3d(' + Math.max(0, (self.top - (30 * v))) + 'px, 0, 0) scale('+ Math.max(0, (self.scale + (0.1 * v))) +')');
        self.setBoxShadow('0px 50px 100px rgba(0,0,0,'+ shadow +')');
        self.setOpacity(opacity, overlay);
      })

      .on('complete', function() {
        self.top = self.top - 30;
        self.scale = self.scale + 0.1;
      })
      .start();

    },

    // Animation to fly the card away
    animateStepBackward: function(index) {

      var self  = this;

      var card = this.el;

      var overlay = card.childNodes[0].childNodes[0];

      self.top = (index * 30);
      self.scale = Math.max(0, (1 - (index / 10)));
      self.shadow = (0.5 + (index / 20));
      self.opacity = 0.2 + (index / 10);

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
        self.setTransform('translate3d(' + self.top*v + 'px, 0, 0) scale('+ self.scale*v +')');
        self.setBoxShadow('0px 50px 100px rgba(0,0,0,'+ self.shadow +')');
        self.setOpacity(self.opacity, overlay);
      })
      .start();

    },


    // Fly the card out or animate back into resting position.
    transitionOut: function(e) {
      var self = this;

      self.animateFlyAway();

    },

    /***************
     * Events
     ***************/

    // Bind drag events on the card.
    bindEvents: function() {
      var self = this;
      // ionic.onGesture('dragstart', function(e) {
      //   ionic.requestAnimationFrame(function() { self._doDragStart(e) });
      // }, this.el);

      // ionic.onGesture('drag', function(e) {
      //   ionic.requestAnimationFrame(function() { self._doDrag(e) });
      //   // Indicate we want to stop parents from using this
      //   e.gesture.srcEvent.preventDefault();
      // }, this.el);

      // ionic.onGesture('dragend', function(e) {
      //   ionic.requestAnimationFrame(function() { self._doDragEnd(e) });
      // }, this.el);
    },

    // doDragStart
    _doDragStart: function(e) {
      e.preventDefault();

    },

    // doDrag
    _doDrag: function(e) {
      e.preventDefault();

      if(this.drag === 'false'){
        return false;
      }

      var o = e.gesture.deltaX / -1000;

      this.rotationAngle = Math.atan(o);

      this.x = this.startX + (e.gesture.deltaX * 0.8);
      this.y = this.startY + (e.gesture.deltaY * 0.8);

      this.el.style.transform = this.el.style.webkitTransform = 'translate3d(' + this.x + 'px, ' + this.y  + 'px, 0) rotate(' + (this.rotationAngle || 0) + 'rad)';

      this.thresholdAmount = (this.x / (this.parentWidth/2));

      var self = this;
      setTimeout(function() {
        self.onPartialSwipe(self.thresholdAmount);
      });
    },

    // doDragEnd
    _doDragEnd: function(e) {
      this.transitionOut(e);
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

    sortCards: function($timeout) {

      var self = this;

      var existingCards = this.collection;

      console.log(this.collection)

      for(i = 0; i < existingCards.length; i++) {

        var card = existingCards[i];

        if(!card) continue;

        if(i === 0) {

          var overlay = existingCards[i].childNodes[0].childNodes[0];
          existingCards[i].swipeableCard.setZindex(9, overlay);

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

    moveCardsForward: function ($element, $timeout) {

      var self = this;

      var existingCards = $element[0].querySelectorAll('swoosh-card');

      this.collection = existingCards;

      console.log(existingCards)

      for(var i = 0; i < existingCards.length; i++){

        var card = existingCards[i];

        if(i === 0){

          (function(j) {
            $timeout(function() {

              existingCards[j].swipeableCard.animateFlyAway(existingCards[j], j);

            }, 100 * j);

          })(i);

        } else {

          if(i === 1) {

            var overlay = existingCards[i].childNodes[0].childNodes[0];
            existingCards[i].swipeableCard.setZindex(9, overlay);

          }

          (function(j) {
            $timeout(function() {

              existingCards[j].swipeableCard.animateStepForward(j - 1);

            }, 100 * j);

          })(i);

        }

      }

    },

    bringCardUp: function(card, amt, max, i) {
      var position, newTop;
      position = card.style.transform || card.style.webkitTransform;
      newTop = Math.max(max - 30, Math.min(max, max - (max * Math.abs(amt))));
      newScale = (1 - (Math.max(i - 1, Math.min(i, i - (i * Math.abs(amt)))) / 10));
      card.style.transform = card.style.webkitTransform = 'translate3d(' + newTop + 'px, 0, 0) scale('+ newScale+')';
    },

    partial: function(amt) {
      cards = $element[0].querySelectorAll('swoosh-card');

      var max = Math.min(cards.length, 10);
      for(var i = 1; i < cards.length; i++){
        bringCardUp(cards[i], amt, 30 * i, i);
      }
    },

    /***************
     * Utils
     ***************/


  });

  /***********************************
   * Swoosh Card Directive (singular)
   ***********************************/
  angular.module('ionic.contrib.ui.tinderCards', ['ionic'])

  .directive('swooshCard', ['$timeout', function($timeout) {

    return {
      restrict: 'E',
      template: '<div class="swoosh-card"><div class="overlay"></div><div class="content" ng-transclude></div></div>',
      require: '^swooshCards',
      transclude: true,

      scope: {
        drag: '@',
        animation: '@',
        onTransitionOut: '&',
        onPartialSwipe: '&',
        onSnapBack: '&',
        onDestroy: '&'
      },

      controller: ['$scope', '$element', function($scope, $element) {

          var el = $element[0];

          // Force hardware acceleration for animation - better performance on first touch
          el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0px, 0px)';

          $timeout(function() {

            // Instantiate our card view
            angular.extend(el.swipeableCard, {

              drag: $scope.drag,

              onClickTransitionOut: function() {

              },

              onDestroy: function() {
                $timeout(function() {
                  $scope.onDestroy();
                });
              }

            });

            $scope.$parent.swipeCard = el;

          });

          $scope.$parent.onClickTransitionOut = function(card) {
            var element = $scope.$parent.swipeCard;
            element.swipeableCard.onClickTransitionOut();
            $scope.$emit('removeCard', element, card);
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

        var cardCollection = new SwipeableCardCollection();

        $timeout(function() {

          var cards = $element[0].querySelectorAll('swoosh-card');

          for(var i = 0; i < cards.length; i++){
            cards[i].swipeableCard = new SwipeableCardView({
              el: cards[i],
              collection: cardCollection
            })
          }

          cardCollection.collection = cards;

          cardCollection.sortCards($timeout);

        });

        $scope.$on('removeCard', function(event, element, card) {
          $timeout(function() {
            cardCollection.moveCardsForward($element, $timeout);
          }, 500);
        });

      }]
    }
  }])

  /***********************************
   * Swoosh Card Factory
   ***********************************/
  .factory('swooshCardDelegate', ['$rootScope', function($rootScope) {
    return {

    }
  }]);

})(window.ionic);
