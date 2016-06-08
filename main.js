(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

       var ProductZoom = function(options, target) {

          var self = this;

           var defaultOptions = {
               poplets: false,
               mobileBreakPoint: 767,
               doubleTapGap: 300,
               loaderInnerHTML:"Loading...",
               getZoomImage: function(imgSrc) {
                   return imgSrc;
               },
               getPopletImage: function(src, index, info) { // called when clicking on poplet
                   return src;
               },
           };

           var optionTypes = {
             poplets:["boolean", "object"],
             mobileBreakPoint:"number",
             doubleTapGap:"number",
             loaderInnerHTML:"string",
             getZoomImage:"function",
             getPopletImage:"function"
           };

           var errorMsg = [];

           self.target = target;
           self.options = $.extend({}, defaultOptions, options); // same as Object.assign

           for (var optionKey in self.options){ // some validation on options
             var value = self.options[optionKey];
             var acceptedTypes = optionTypes[optionKey];
             if(Array.isArray(acceptedTypes)){
               if(acceptedTypes.indexOf(typeof value) === -1){
                 errorMsg.push(optionKey + " cannot be " + typeof value);
               }
             }
             else{
               if(typeof value !== acceptedTypes){
                 errorMsg.push(optionKey + " cannot be " + typeof value);
               }
             }
           }

           if(errorMsg.length !== 0){
             throw errorMsg.join("|");
           }

           if (self.options.poplets !== false) {
               if (!(self.options.poplets instanceof $ && self.options.poplets.size() === 1)) throw "Either no element was provided or an invalid property was used";
           }

           self.init();

       }


       ProductZoom.prototype.init = function() {
           var self = this;
           var currentImage = 0;
           self.images = [self.target.attr("src")];
           self.currentImage = 0;
           self.imageHidden = false;
           self.window = $(window);


           self.zoomBox = $("<div class='product-zoom__box'></div>");
           self.zoomBoxCont = $("<div class='product-zoom__box__cont'></div>");
           self.zoomCursor = $("<div class='product-zoom__box-cursor'></div>");
           self.mobileCloseZoom = $("<button class='product-zoom__box__close' type='button'>Close</button>");
           self.target.wrap("<div class='product-zoom'></div>");
           //console.log(self.target.parent());

           //setTimeout(function() {

          // },0)
           self.productZoom = self.target.parent();

           //console.log(self.produ);
           self.zoomVariables = {
               containerOffset: self.productZoom.offset(),
               showZoom: false,
               zoomImageSrc: false,
               cursorBoxWidth: null,
               zoomAmount: null,
               maxRight: null,
               maxBottom: null
           }
           self.animateVariables = {
               cursorTransform: null,
               zoomTransform: null,
               raf: false
           };

           self.isFileCache = {

           };

           self.windowVariables = {
               width: self.window.width(),
               timeout: null
           }

           self.touchVariables = {
               raf: false,
               lastTap: null,
               lastCoords: {
                   x: null,
                   y: null
               },
               startLocation: {
                   x: 0,
                   y: 0
               },
               useStartLocation: true,
               prevTranslate: {
                   x: 0,
                   y: 0
               }

           }

           self.zoomBox.append(self.zoomBoxCont).append(self.mobileCloseZoom);
           self.productZoom.append(self.zoomBox).append(self.zoomCursor);

           self.zoomImageExists(function(ret) {
               if (ret === true && currentImage === self.currentImage) {
                   self.productZoom.addClass("product-zoom--has-zoom");
               }
           })

           if (self.options.poplets) {

               self.options.poplets.find(".product-zoom-poplet-item").each(function(i) {


                   var $this = $(this);
                   var $img;
                   var ret;
                   if ($this.is("IMG")) {
                       $img = $this;
                   } else {
                       $img = $this.find("img");
                   }

                   if ($img.size() !== 1) throw "Found " + $img.size() + " images(s) in poplet item";
                   $img.attr("data-index", i);
                   if (i === 0){
                     $img.addClass("product-zoom-poplet-item--active");
                      return;
                    }

                   ret = self.options.getPopletImage($img.attr("src"), i, $img.attr("data-info"));

                   if (typeof ret === "string" || ret instanceof $) {
                       self.images.push(ret);
                   }


               });


           }
           self.addListeners();

        // },0);


       };

       ProductZoom.prototype.changeImage = function(index) {
           var self = this;
           var src = self.images[index];

           if (typeof src === "string") {
               if (self.imageHidden === true) {
                   self.target.show();
                   self.target.siblings(".product-zoom__jQueryEl").remove();
                   self.imageHidden = false;
               }
               self.target.attr("src", self.images[index]);

           } else { // instance of jquery
               self.target.hide();
               self.imageHidden = true;
               src.addClass("product-zoom__jQueryEl")
               src.insertAfter(self.target)
           }

           self.currentImage = index;
           self.productZoom.removeClass("product-zoom--has-zoom");

           self.zoomVariables.containerOffset = self.productZoom.offset();

           self.zoomImageExists(function(ret) {
               if (ret === true && self.currentImage === index) {
                   self.productZoom.addClass("product-zoom--has-zoom");
               }
           });

       };

       // event handlers
       //========================================================================

       ProductZoom.prototype.events = {
           mouseEnter: function(e) {
               var self = e.data.self;
               var currentIndex = self.currentImage;

               self.zoomVariables.mainImageWidth = self.productZoom.width();

               if (self.windowVariables.width > self.options.mobileBreakPoint) {
                   self.productZoom.addClass("product-zoom--show");
                   self.zoomVariables.showZoom = true;
                   self.zoomImageExists(function(ret) {
                       if (ret === true && self.zoomVariables.showZoom === true && currentIndex === self.currentImage) {
                           self.productZoom.addClass("product-zoom--has-zoom");
                           self.getZoomImage();
                           self.mouseMove(e.pageX - self.zoomVariables.containerOffset.left, e.pageY - self.zoomVariables.containerOffset.top);
                       }
                   });
               }

           },
           mouseLeave: function(e) {
              var self = e.data.self;
               if (self.windowVariables.width > self.options.mobileBreakPoint) { // mobile breakpoint

                   self.zoomVariables.showZoom = false;
                   self.productZoom
                       .removeClass("product-zoom--show")
                       .removeClass("product-zoom--has-zoom");

                   self.zoomBoxCont
                   .height("100%")
                   .children().remove();
               }
           },
           mouseMove: function(e) {
                var self = e.data.self;
               if (self.windowVariables.width > self.options.mobileBreakPoint) { // mobile breakpoint
                   self.mouseMove(e.pageX - self.zoomVariables.containerOffset.left, e.pageY - self.zoomVariables.containerOffset.top);
               }
           },
           popletClick: function(e) {
               var self = e.data.self;
               var $target = $(e.target);
               var $img;
               var index;
               if ($target.is("IMG")) {
                   $img = $target;
               } else {
                   $img = $target.find("img");
               }
               self.options.poplets.find(".product-zoom-poplet-item--active").removeClass("product-zoom-poplet-item--active");
               index = parseInt($img.attr("data-index"));
               $img.addClass("product-zoom-poplet-item--active");
               if (isNaN(index)) throw "data-index is not a number";

               self.changeImage(index);

           },

           windowResize: function(e) {
               var self = e.data.self;
               clearTimeout(self.windowVariables.timeout)
               self.windowVariables.timeout = setTimeout(function() {
                   self.windowVariables.width = self.window.width();
                   self.zoomVariables.containerOffset = self.productZoom.offset();
                   self.zoomVariables.mainImageWidth = self.productZoom.width();
               }, 50);
           },
           touchEnd: function(e) {
               var self = e.data.self;
               var $target = $(e.target);
               var $parent = $target.parents(".product-zoom__box__cont");
               var lastTap = self.touchVariables.lastTap;
               var now = Date.now();

               if ($target.hasClass("product-zoom__box__cont") || $parent.size() !== 0 || $target.hasClass("product-zoom__box__close")) {
                   self.touchVariables.useStartLocation = true;
               } else {
                   if (typeof lastTap === "number") {
                       if (now - lastTap <= self.options.doubleTapGap) { // double tap delay
                           self.mobileDoubleTap();
                       }
                   }

               }

               self.touchVariables.lastTap = now;
           },
           touchMove: function(e) {
               var self = e.data.self;
               var changedTouches = e.originalEvent.changedTouches[0]; // only take one fingers data
               e.preventDefault(); // stops movement while moving shiz
               self.touchMove(changedTouches.clientX, changedTouches.clientY);

           },
           touchStart: function(e) {
               var self = e.data.self;
               self.touchVariables.startLocation = {
                   x: e.originalEvent.changedTouches[0].clientX,
                   y: e.originalEvent.changedTouches[0].clientY,
               }
           },
           mobileCloseZoom: function(e) {
              var self = e.data.self;
               self.zoomVariables.showZoom = false;
               self.productZoom.removeClass("product-zoom--show");
               self.zoomBoxCont
               .height("100%")
               .children().remove();

           }
       };

       //========================================================================


       ProductZoom.prototype.addListeners = function() {
           var self = this;
           self.window.on("resize", {self:self}, this.events.windowResize);
           self.mobileCloseZoom.on("click", {self:self}, this.events.mobileCloseZoom);
           self.productZoom
               .on("mouseenter", {self:self}, this.events.mouseEnter)
               .on("mouseleave", {self:self},this.events.mouseLeave)
               .on("mousemove", {self:self},this.events.mouseMove)
               .on("touchend", {self:self},this.events.touchEnd)
               .on("touchstart", ".product-zoom__box__cont", {self:self},this.events.touchStart)
               .on("touchmove", ".product-zoom__box__cont", {self:self},this.events.touchMove)

           if (self.options.poplets) {
               self.options.poplets.on("click", ".product-zoom-poplet-item", {self:self}, self.events.popletClick);
           }
       };

       ProductZoom.prototype.touchMove = function(x, y) {

           var self = this;

           //using pure js as quicker
           //========================================================================

           var zoomBoxDimensions = {
             width:self.zoomBox[0].offsetWidth,
             height:self.zoomBox[0].offsetHeight
           }

           var contDimensions = {
             width:self.zoomBoxCont[0].offsetWidth,
             height:self.zoomBoxCont[0].offsetHeight
           }

           //========================================================================

           var prevX;
           var prevY;
           var translateX;
           var translateY;
           var minX = (contDimensions.width - zoomBoxDimensions.width) * -1; // turn into a minus number
           var minY = (contDimensions.height - zoomBoxDimensions.height) * -1; // turn into a minus number
           var maxX = 0;
           var maxY = 0;

           if (self.touchVariables.useStartLocation === true) {
               self.touchVariables.useStartLocation = false;
               prevX = self.touchVariables.startLocation.x;
               prevY = self.touchVariables.startLocation.y;

           } else {
               prevX = self.touchVariables.lastCoords.x;
               prevY = self.touchVariables.lastCoords.y;
           }

           translateX = self.touchVariables.prevTranslate.x - (prevX - x);
           translateY = self.touchVariables.prevTranslate.y - (prevY - y);

           if (translateX > maxX) {
               translateX = 0;
           }

           if (translateX < minX) {
               translateX = minX;
           }

           if (translateY > maxY) {
               translateY = 0;
           }

           if (translateY < minY) {
               translateY = minY;
           }

           self.touchVariables.prevTranslate = {
               x: translateX,
               y: translateY
           };

           self.touchVariables.lastCoords = { // maybe need to set boundaries like translateX and translateY
               x: x,
               y: y
           };

           self.animate(self.touchVariables.prevTranslate.x, self.touchVariables.prevTranslate.y, true);

       };

       ProductZoom.prototype.mobileDoubleTap = function() {
           var self = this;
           var currentImage = self.currentImage;

           self.zoomImageExists(function(ret) {
               if (ret === true && currentImage === self.currentImage) {
                   self.zoomVariables.showZoom = true;
                   self.productZoom.addClass("product-zoom--show");
                   self.touchVariables.lastCoords = {
                       x: 0,
                       y: 0
                   };

                   self.getZoomImage();
               }
           });
       };

       ProductZoom.prototype.isFile = function(src, callback) {
           var self = this;
           if (!self.isFileCache.hasOwnProperty(src)) {
               $.ajax({
                       type: "HEAD",
                       url: src
                   })
                   .done(function(res, text, obj) {
                       self.isFileCache[src] = true;
                       callback(true);
                   })
                   .error(function(res, text, obj) {
                       self.isFileCache[src] = false;
                       callback(false);
                   })
           } else {
               callback(self.isFileCache[src]);
           }
       };

       ProductZoom.prototype.zoomImageExists = function(callback) {
           // do ajax head stuff here
           var self = this;
           var currentIndex = this.currentImage
           var src;

           if (typeof this.images[currentIndex] === "string") {
               src = this.options.getZoomImage(this.images[currentIndex]);
           } else { // instance of jquery
               src = false;
           }



           self.zoomVariables.zoomImageSrc = src;
           if (src === false) {
               callback(false);
           } else {
               self.isFile(src, callback);
           }


       };


       ProductZoom.prototype.getZoomImage = function() {
           var self = this;
           var currentIndex = self.currentImage
           var src = self.zoomVariables.zoomImageSrc;
           var imgDimensions = {
               width: self.target.width(),
               height: self.target.height()
           };
           self.zoomBoxCont.append("<div class='product-zoom__loader'>" + self.options.loaderInnerHTML+"</div>")

           if (src !== false) {

               var img = document.createElement("IMG");
               img.onload = function() {
                   if (self.zoomVariables.showZoom === true && currentIndex === self.currentImage) {
                       self.zoomVariables.zoomAmount = img.naturalWidth / imgDimensions.width;
                       self.zoomBoxCont.children().remove();
                       self.zoomBoxCont[0].appendChild(img);
                       self.zoomBoxCont
                           .width(img.naturalWidth + "px")
                           .height(img.naturalHeight + "px");
                       self.zoomVariables.cursorBoxWidth = imgDimensions.width / 100 * (100 / self.zoomVariables.zoomAmount);
                       self.zoomCursor
                           .width(self.zoomVariables.cursorBoxWidth + "px")
                           .height(self.zoomVariables.cursorBoxWidth + "px");
                       self.zoomVariables.maxBottom = imgDimensions.height - self.zoomVariables.cursorBoxWidth;
                       self.zoomVariables.maxRight = imgDimensions.width - self.zoomVariables.cursorBoxWidth;
                       self.zoomVariables.mainImageWidth = self.productZoom.width();
                   }
               }
               img.src = src;

           }

       };

       ProductZoom.prototype.animate = function(left, top, isMobile) {
           var self = this;
           var cursorTransform = "translate3d(" + left + "px," + top + "px,0)"; // use for moblie (zoom thingy as well);
           var zoomTransform = "translate3d(-" + left * self.zoomVariables.zoomAmount + "px,-" + top * self.zoomVariables.zoomAmount + "px,0)";

           function animate() {
               if (!isMobile) {
                   self.zoomCursor.css({
                       transform: self.animateVariables.cursorTransform
                   });
                   self.zoomBoxCont.css({
                       transform: self.animateVariables.zoomTransform
                   });
               } else {
                   self.zoomBoxCont.css({
                       transform: self.animateVariables.cursorTransform
                   });
               }

           }


           self.animateVariables.cursorTransform = cursorTransform;
           self.animateVariables.zoomTransform = zoomTransform;

           if (window.requestAnimationFrame) {
               if (self.animateVariables.raf === false) {
                   self.animateVariables.raf = true;

                   requestAnimationFrame(function() {

                       animate();
                       self.animateVariables.raf = false;
                   });

               }
           } else {
               animate();
           }


       };


       ProductZoom.prototype.mouseMove = function(x, y) {
           var self = this;
           var position = {
               left: x - (self.zoomVariables.cursorBoxWidth / 2),
               top: y - (self.zoomVariables.cursorBoxWidth / 2)
           };
           var top = position.top;
           var left = position.left;

           if (top > self.zoomVariables.maxBottom) {
               top = self.zoomVariables.maxBottom;
           } else if (top < 0) {
               top = 0;
           }

           if (left > self.zoomVariables.maxRight) {
               left = self.zoomVariables.maxRight;
           } else if (left < 0) {
               left = 0;
           }


           if(x > self.zoomVariables.mainImageWidth){
             self.events.mouseLeave({ // fake jquery event
               data:{
                 self:self
               }
             });
           }
           else{
           self.animate(left, top);
          }
       };





       ProductZoom.prototype.removeListeners = function() {
           var self = this;
           self.window.off("resize", this.events.windowResize);
           self.productZoom
               .off("mouseenter", this.events.mouseEnter)
               .off("mouseleave", this.events.mouseLeave)
               .off("mousemove", this.events.mouseMove)
               .off("touchend", this.events.touchEnd)
               .off("touchstart", ".product-zoom__box__cont", this.events.touchStart)
               .off("touchmove", ".product-zoom__box__cont", this.events.touchMove)


           if (self.options.poplets) {
               self.options.poplets.off("click", ".product-zoom-poplet-item", self.events.popletClick);
           }


       };


       //methods publicly available
       //========================================================================

       ProductZoom.prototype.public = {
           destroy: function(e) {
               var self = this.bbbProductZoom;
               self.removeListeners();
               self.target.appendTo(self.productZoom.parent()); // might need to check if productZoomParnet is still correct one??
               self.productZoom.remove();
               self.zoomBox.remove();
               self.zoomCursor.remove();
               self.zoomBoxCont.remove();

               delete this.bbbProductZoom;


           }

       }

       //========================================================================


       $.fn.productZoom = function(options) {
         var optionArg;

           if (typeof options === "string") {

               if (!this[0].hasOwnProperty("bbbProductZoom")) throw "Cannot pass method without intialising plugin";

               if (typeof this[0].bbbProductZoom.public[options] !== "function") throw "Cannot find function with the name of " + options;
               this[0].bbbProductZoom.public[options].call(this[0]);
           } else if (typeof options === "object" || typeof options === "undefined") {
             optionArg = options || {};
               if (this[0].hasOwnProperty("bbbProductZoom")) throw "Cannot  re-initialise plugin";
               this[0].bbbProductZoom = new ProductZoom(optionArg, this);
           } else throw "Cannot pass " + typeof options;


       }


}));
