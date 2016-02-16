# imgpreloader
Lightweight Javascript plugin for watching image loading (ES6 Version)
## Install
`bower i imgwatcher --save`
## Loading backgrounds
``` html
<div data-background-src="http://placehold.it/350x150"></div>
```
## Init
``` js
document.imgWatcher({
  selector: '.preload',

  progress: function(img, percentage) {
    /*
    	img.element -> the current image element
    	img.src -> the current image url
    	img.loaded -> image status (boolean)
    */
  },

  //Processing done
  always: function(images) {
  	//images -> array of img objects
  },
    
  //All images loaded successfully
  done: function(images) {

  }
});
```
## Loading background images
Just add a data attribute to the element you want to apply the image to.
``` html
<div class="preload" data-background-src="image.jpg">
```
