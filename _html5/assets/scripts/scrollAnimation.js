// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var thisArg = arguments[1];
      var k = 0;

      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }
      return undefined;
    }
  });
}

var SCROLL_ANIMATIONS = [
  'bounce','flash','headShake','hinge','jello','pulse',
  'rubberBand','shake','swing','tada','wobble','bounceIn',
  'bounceOut','fadeIn','fadeOut','flipInX','flipInY',
  'flipOutX','flipOutY','lightSpeedIn','lightSpeedOut',
  'rotateIn','rotateOut','rollIn','rollOut','slideIn',
  'slideOut','zoomIn','zoomOut'
];

function inViewCheck(){
    $($(".animateScroll").get().reverse()).each(function(i) {
        var target = $( this );
        var targetPosition = target.offset().top + target.height();
        var scrollPostition = $(window).scrollTop() + $(window).height();

        if(target.height() > $(window).height()) {
            targetPosition = target.offset().top;
        }

        if (targetPosition < scrollPostition) {
            var objectClass = target.attr('class')
                                .replace('animateScroll' , 'animated')
                                .replace('-disabled', '');
            target.attr('class', objectClass);
        }
    });
};

function animateWhenVisible() {
    inViewCheck();
    $(window).scroll(function() {
        inViewCheck();
    });
};

function initAnimateScroll(elems) {
  elems.each(function(){
    var target = $( this );
    var animation = SCROLL_ANIMATIONS.find(function(a) {
      return target.attr('class').indexOf(a) != -1;
    });
    if (animation) {
      var objectClass = target.attr('class').replace(animation , animation + '-disabled');
      target.attr('class', objectClass);
    }
  });
}

var animateScroll = $('.animateScroll');

if(animateScroll.length) {
  initAnimateScroll(animateScroll);
  animateWhenVisible();
}
