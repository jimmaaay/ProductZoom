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
| poplets |  jQuery object, Boolean | false | Allows changing of main image by clicking on poplets. |
| mobileBreakPoint | Number | 767 | Screen width at which point will change to double tap to open zoom. |
| doubleTapGap | Number | 300 | Maximum gap between double tapping the image to open the zoom image. |
| loaderInnerHTML | String | Loading... | HTML that is shown when the zoom image is being loaded |
| getZoomImage | Function | See below | A function that returns the zoom image src. By default it will return the image src that is being zoomed. |
| getPopletImage | Function | See below | A function that will return the image to be zoomed. |

### Option Methods

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
//Default

  function(src, index, info){
    return src;
  }

```

This function is called on intialisation of the plugin for each poplet item.

##### Arguments

All of the properties below are captured at the initialisation of the plugin, so any amends done after will not be pulled through.

* `src` Image Source of the Poplet Image
* `index` Index of the active Poplet item
* `info` Any information that is assigned to the `data-info`


##### Returns

This function may either return a string ( for an image ) or a jQuery object.

If a jQuery object is returned this will be inserted instead of the image into its place. ( Zoom will be disabled for this img)
