(function() {
  'use strict';

  var $images = $('img');

  function ImagePreloader() {
    this.totalImagesLoaded = 0;
    this.deferred = $.Deferred();
  }

  ImagePreloader.prototype.preload = function($images) {
    var _this = this;

    this.totalImagesOnPage = $images.length;
    
    $images.each(function() {
      if(this.complete) {
        _this.onImageLoaded();
      } else {
        this.onload = $.proxy(_this, 'onImageLoaded');
      }
    });

    return this.deferred.promise();
  };

  ImagePreloader.prototype.onImageLoaded = function() {
    this.totalImagesLoaded++;

    if(this.totalImagesLoaded === this.totalImagesOnPage) {
      this.deferred.resolve();
    }
  };

  new ImagePreloader()
    .preload($images)
    .then(function() {
      $('#portfolio-grid').masonry({
        itemSelector: '.column'
      });
    });
})();
