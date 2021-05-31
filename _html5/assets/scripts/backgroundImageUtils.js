'use strict';
class ScrollAnimate {
  constructor() {
    this.zoomOut = $('.bg-zoom-out');
    this.zoomIn = $('.bg-zoom-in');
    this.lastTime = 0;
    this.scrollPos = 0;
    this.windowWidth = $(window).width();
    this.intervalID = 0;
    if (requestAnimationFrame) {
      requestAnimationFrame(t => this.checkPos(t))
    }  else {
      this.intervalID = setInterval(() => this.checkPos(), 16);
    }
  }

  checkPos(t) {
    //console.log('TIME DIFF ==> ' + (t - this.lastTime));
    if (t - this.lastTime < 1000/60) {
      window.requestAnimationFrame(t => this.checkPos(t));
      return;
    }
    let currentScrollPos = window.pageYOffset;
    let currentWidth = $(window).width();
    if (currentScrollPos !== this.scrollPos) {
      this.scrollPos = currentScrollPos;
      if (this.zoomOut.length) zoomInOut(this.zoomOut, true)
      if (this.zoomIn.length) zoomInOut(this.zoomIn, false)
    }
    if (currentWidth !== this.windowWidth) {
      this.windowWidth = currentWidth;
      resetBackground()
    }
    if (requestAnimationFrame){
      requestAnimationFrame(t => this.checkPos(t));
    }
    this.lastTime = t;
  }
}

function initialiseBackground(bg, zoomOut) {
  bg.each( function() {
    var maxZoom = 160;
    var zoomPace = 14;

    var width = parseInt($( this ).css("width"));
    var height = parseInt($( this ).css("height"));
    var parent = $( this ).parent();
    var parentWidth = parseInt(parent.css("width"));
    var parentHeight = parseInt(parent.css("height"));
    var parentOffset = parent.offset().top;
    var viewPortHalf = $(window).height()/2;

    var delta = $(window).scrollTop() + viewPortHalf + 80 - (parentHeight/2) - parentOffset;
    if (delta > 0) {
      var initialZoom = zoomOut ? (maxZoom - delta/zoomPace) + "%" : (100 + delta/zoomPace) + "%";
    } else {
      var initialZoom = zoomOut ? maxZoom + "%" : "100%";
    }

    var aspectRatioDiff = (width / height) - (parentWidth / parentHeight);
    $( this ).attr("data-ar-diff",aspectRatioDiff);

    if (aspectRatioDiff > 0) {
      $( this ).css({"width": "auto","height": initialZoom});
      var leftOffset = (parentWidth - parseInt($( this ).css("width")))/2 ;
      $( this ).css("left", leftOffset + "px");
      $( this ).css("display", "inline");
    } else {
      $( this ).css({"height": "auto","width": initialZoom});
      var leftOffset = (parentWidth - parseInt($( this ).css("width")))/2 ;
      $( this ).css("left", leftOffset + "px");
      $( this ).css("display", "inline");
    }
  });
}

function zoomInOut(bg, zoomOut) {
  bg.each( function() {
    var maxZoom = 160;
    var zoomPace = 14;

    var parent = $( this ).parent();
    var parentHeight = parseInt(parent.css("height"));
    var parentOffset = parent.offset().top;
    var viewPortHalf = $(window).height()/2;

    var delta = parentOffset < $(window).height()
                ? $(window).scrollTop() + viewPortHalf + 80 - (parentHeight/2) - parentOffset
                : $(window).scrollTop() + $(window).height() - (parentHeight/2) - parentOffset;
    if (delta < 0) return ;

    delta = zoomOut ? maxZoom - delta/zoomPace : 100 + delta/zoomPace;
    if (delta < 100) delta = 100;
    if (delta > maxZoom) delta = maxZoom;

    if (parseFloat($( this ).attr("data-ar-diff")) > 0) {
      $( this ).css("height", delta + "%");
    } else {
      $( this ).css("width", delta + "%");
    }
    var leftOffset = (parseInt(parent.css("width")) - parseInt($( this ).css("width")))/2 ;
    $( this ).css("left", leftOffset + "px");
  });
}

function resetBackground() {
  const zoomOut = $('.bg-zoom-out');
  const zoomIn = $('.bg-zoom-in');
  if (zoomOut.length) initialiseBackground(zoomOut,true)
  if (zoomIn.length) initialiseBackground(zoomIn,false)
  return zoomOut.length || zoomIn.length;
}

$(document).ready(function(){
  if (resetBackground()) {
    var scrollTest = new ScrollAnimate();
  }
});
