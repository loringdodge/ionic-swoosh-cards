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
        self.onDestroy && self.onDestroy();
      }, duration);
    },

    /***************
     * Animations
     ***************/

    animateTo: function(x, y) {

    },

    // Animation to fly the card away
    animateFlyAway: function() {

      var self = this;

      var top = -600;
      var scale = 180;

      var animation = collide.animation({
        duration: 7000,
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
        self.el.style.transformOrigin = self.el.style.webkitTransformOrigin = '0 50%';
        self.el.style.transform = self.el.style.webkitTransform = 'translate3d(' + top*v + 'px, 0,0) rotate3d(.25, -1, 0, '+ scale*v +'deg)';
      })
      .start();

      // Trigger destroy after card has swiped out
      this.destroy(1000);

    },

    // Fly the card out or animate back into resting position.
    transitionOut: function(e) {
      var self = this;

      // if(this.isUnderThreshold()) {
      //   self.onSnapBack(this.x, this.y, this.rotationAngle);
      //   return;
      // }

      self.animateFlyAway();

    },

    /***************
     * Events
     ***************/

    // Bind drag events on the card.
    bindEvents: function() {
      var self = this;
      ionic.onGesture('dragstart', function(e) {
        ionic.requestAnimationFrame(function() { self._doDragStart(e) });
      }, this.el);

      ionic.onGesture('drag', function(e) {
        ionic.requestAnimationFrame(function() { self._doDrag(e) });
        // Indicate we want to stop parents from using this
        e.gesture.srcEvent.preventDefault();
      }, this.el);

      ionic.onGesture('dragend', function(e) {
        ionic.requestAnimationFrame(function() { self._doDragEnd(e) });
      }, this.el);
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

      this.el = opts.el;

    },

    // Animation to fly the card away
    animateStepForward: function() {

      var self = this;

      var top = -600;
      var scale = 180;

      var animation = collide.animation({
        duration: 7000,
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
        self.el.style.transformOrigin = self.el.style.webkitTransformOrigin = '0 50%';
        self.el.style.transform = self.el.style.webkitTransform = 'translate3d(' + top*v + 'px, 0,0) rotate3d(.25, -1, 0, '+ scale*v +'deg)';
      })
      .start();

      // Trigger destroy after card has swiped out
      this.destroy(1000);

    },

    moveCardsForward: function () {

      var cards = this.el;

      var max = Math.min(cards.length, 10);
      for(var i = 1; i < cards.length; i++){
        bringCardUp(cards[i], amt, 30 * i, i);
      }
    },

    sortCards: function($element, $timeout) {

      var self = this;

      this.el = $element[0].querySelectorAll('swoosh-card');

      var existingCards = this.el;

      for(i = 0; i < existingCards.length; i++) {

        var card = existingCards[i];

        if(!card) continue;

        if(i === 0) {

          var overlay = existingCards[i].childNodes[0].childNodes[0];
          self.setZindex(overlay, 9)

        } else {

          (function(j) {
            $timeout(function() {

              var overlay = existingCards[j].childNodes[0].childNodes[0];
              var top = (j * 30);
              var scale = Math.max(0, (1 - (j / 10)));
              var shadow = (0.5 + (j / 20));
              var opacity = 0.2 + (j / 10);
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
                self.setTransform(existingCards[j],'translate3d(' + top*v + 'px, 0, 0) scale('+ scale*v +')');
                self.setBoxShadow(existingCards[j], '0px 50px 100px rgba(0,0,0,'+ shadow +')');
                self.setOpacity(overlay, opacity);
              })
              .start();
            }, 100 * j);
          })(i);
        }
        self.setZindex(card, existingCards.length - i);
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

    setZindex: function(element, index) {
      element.style.zIndex = element.style.webkitzIndex = index;
    },

    setTransform: function(element, value) {
      element.style.transform = element.style.webkitTransform = value;
    },

    setOpacity: function(element, value) {
      element.style.opacity = element.style.webkitOpacity = value;
    },

    setBoxShadow: function(element, value) {
      element.style.boxShadow = element.style.webkitBoxShadow = value;
    },

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
        spacing: '@',
        max: '@',
        animation: '@',
        onTransitionOut: '&',
        onPartialSwipe: '&',
        onSnapBack: '&',
        onDestroy: '&'
      },

      controller: ['$scope', '$element', function($scope, $element) {
        // Emits event 'removeCard' which should have a listener in a parent scope
        $scope.$parent.onClickTransitionOut = function(card) {
          var element = $scope.$parent.swipeCard;
          element.onClickTransitionOut();
          $scope.$emit('removeCard', element, card);
        }
      }],

      link: function($scope, $element, $attr, swipeCards) {

          var el = $element[0];

          // Force hardware acceleration for animation - better performance on first touch
          el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0px, 0px)';

          // Instantiate our card view
          var swipeableCard = new SwipeableCardView({
            el: el,

            drag: $scope.drag,

            onPartialSwipe: function(amt) {
              swipeCards.partial(amt);
              var self = this;
              $timeout(function() {
                $scope.onPartialSwipe({amt: amt});
              });
            },

            onTransitionOut: function(amt) {
              $timeout(function() {
                $scope.onTransitionOut({amt: amt});
              });
            },

            onClickTransitionOut: function() {
              var self = this;
              self.animateFlyAway();
            },

            onDestroy: function() {
              $timeout(function() {
                $scope.onDestroy();
              });
            }

          });

          $scope.$parent.swipeCard = swipeableCard;


      }
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
      scope: {},

      controller: ['$scope', '$element', '$timeout', function($scope, $element, $timeout) {

        var cardCollection = new SwipeableCardCollection();

        $timeout(function() {
          cardCollection.sortCards($element, $timeout);
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
