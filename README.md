# Product zoom
A responsive jQuery image zoom plugin.

## Getting Started

```javascript
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

## Option Methods

To finish.
