# nfslides

`nfslides` is a minimalistic slideshow program written in JavaScript.

## Getting Started

* Clone or download this repository.
* Open `index.html` in Chrome 48 or later.
* Open `index.js` in your favorite text editor.
* Edit the slides directly in JavaScript and save.
* The web browser will hot-reload and show your changes automatically.

## Features

The core idea behind `nfslides` is to be *hackable*. The program is small enough
that you can easily understand and change it, modify the styles, templates,
add features, etc.

* 140 lines of core code
* 100 lines of slide templates

Even with this small size there are a number of built-in features:

* Automatic hot-reload of code changes
* Keyboard interface (with help view on **?**)
* Toggle between 16:9 and 4:3 layout
* Toggle between presentation and slide list
* HTML or Markdown (with extra lib) for slide content
* Image slides
* Video slides (youtube or MP4)
* Canvas (with animation)

Try the [sample slideshow](http://htmlpreview.github.io/?https://rawgit.com/niklasfrykholm/nfslides/master/index.html).

## Implementation Details

### Hot-Reloading

If you are using a `file://` URL, the script will automatically reload and
re-render the slides every 500 ms. When you put the files on a server with a
`http://` DLL, hot-reloading is automatically disabled.

Note that hot-reloading is also disabled while animations or videos are playing,
because otherwise the reload would cause stuttering. Use **<space>** to pause
the animations and re-enable hot-reloading.

### Canvas

The canvas by default uses a coordinate system with (0,0) in the center and
2000 units height. So in 16:9 the coordinates will be (-1777,-1000)--(1777,1000)
and in 4:3 (-1333,-1000)--(1333,1000).
