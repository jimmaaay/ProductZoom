# Product zoom
A responsive jQuery image zoom plugin.

## Getting Started

```
  <img id="zoom" src="/images/image.jpg"/>

  <script>
    $("#zoom").productZoom();
  </script>
```

## Options

| Option  | Type  | Default  |  Description |
| ------- | ----- | -------- | ------------ |
| poplets |  jQuery object, Boolean | false | Allows changing of main image by clicking on poplets. ( See poplet section on how to use) |
| mobileBreakPoint | Number | 767 | Screen width at which point will change to double tap to open zoom. |
| doubleTapGap | Number | 300 | Maximum gap between double tapping the image to open the zoom image. |
| loaderInnerHTML | String | Loading... | HTML that is shown when the zoom image is being loaded |
| getZoomImage | Function | See below | A function that returns the zoom image src. By default it will return the image src that is being zoomed. |
| getPopletImage | Function | See below | A function that will return the image to be zoomed. |

### Option Functions

#### getZoomImage


##### Default

```javascript

  function(imgSrc){
    return imgSrc;
  }

```

This function is called each time either of the below happens:

* Initialisation of the plugin
* The image is changed by poplets
* On Mouse Enter
* On Mobile Double Tap

##### Arguments

* `imgSrc` Image source of the current zoom image

##### Returns

This function must return either a string back ( for img ) or the boolean `false` for no zoom image

#### getPopletImage

##### Default

```javascript

  function(src, index, info){
    return src;
  }

```

This function is called on intialisation of the plugin for each poplet item.

##### Arguments

All of the properties below are captured at the initialisation of the plugin, so any amends done after will not be pulled through.

* `src` Image Source of the Poplet Image
* `index` Index of the active Poplet item
* `info` Any information that is assigned to `data-info`


##### Returns

This function may either return a string ( for an image ) or a jQuery object.

If a jQuery object is returned this will be inserted instead of the image into its place. ( Zoom will be disabled for this img)


### Using poplets

1. Add the class of `product-zoom-poplet-item` to each poplet item.
2. Pass the container of the poplet items as a jQuery element into the poplets property.
3. Look at Example 2.



#### Notes
* Plugin assumes that the first poplet item is the active image.  ( Cannot have replacement element for first item)


## Methods

Methods are called on a product zoom instance, through the product

| Method  |  Description |
| ------- | ------------ |
| destroy | Removes the productZoom instance |

```javascript

$("#zoom").productZoom("destroy"); 

```

## Examples


### Example 1
Basic usage
```
  <img id="zoom" src="/images/image.jpg"/>

  <script>
    $("#zoom").productZoom();
  </script>
```


### Example 2
Using poplets
```

  <img id="zoom" src="/images/image.jpg"/>

  <div id="poplets">
    <img src="/images/image-poplet-1.jpg" class="product-zoom-poplet-item"/>
    <img src="/images/image-poplet-2.jpg" class="product-zoom-poplet-item"/>
    <img src="/images/image-poplet-3.jpg" class="product-zoom-poplet-item"/>
  </div>

  <script>
  $("#zoom").productZoom({
    poplets:$("#poplets")
    });
  </script>

```

### Example 3
Having a poplet item change the image to be a video

```

  <img id="zoom" src="/images/image.jpg"/>

  <div id="poplets">
    <img src="/images/image-poplet-1.jpg" class="product-zoom-poplet-item"/>
    <img src="/images/image-poplet-2.jpg" class="product-zoom-poplet-item"/>
    <img src="/images/image-poplet-3.jpg" class="product-zoom-poplet-item" data-info="video"/>
  </div>

  <script>
  $("#zoom").productZoom({
    poplets:$("#poplets"),
    getPopletImage:function(src, index, info){
      if(info === "video"){
         return $('<iframe width="560" height="315" src="https://www.youtube.com/embed/Yic7IRO9d6I" frameborder="0" allowfullscreen></iframe>');
       }
       return src;
    }
    });
  </script>

```

### Example 4
Change the zoom image.
```
<img id="zoom" src="/images/image.jpg"/>

<div id="poplets">
  <img src="/images/image-poplet-1.jpg" class="product-zoom-poplet-item"/>
  <img src="/images/image-poplet-2.jpg" class="product-zoom-poplet-item"/>
  <img src="/images/image-poplet-3.jpg" class="product-zoom-poplet-item" data-info="video"/>
</div>

<script>
$("#zoom").productZoom({
  poplets:$("#poplets"),
  getZoomImage:function(src){
    //  "/images/something.jpg"
    var array = src.split("."); // ["/images/something", "jpg"]    
    var url = array.splice(0,1) + "_zoom"; // "/images/something_zoom"
    array.unshift(url); // ["/images/something_zoom", "jpg"]
    return array.join("."); // "/images/something_zoom.jpg"    
  }
  });
</script>
```
