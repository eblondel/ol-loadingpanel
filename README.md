# OpenLayers Loading Panel

Loading panel control for an [OpenLayers](https://github.com/openlayers/openlayers) map.


This module has been initially developed for the needs of the OpenFIGIS [FigisMap](https://github.com/openfigis/FigisMap) project used as web-mapping framework in the FAO Fisheries & Aquaculture [website](http://www.fao.org/fishery/en), principally through the Fisheries Global Information System (FIGIS).

Beyond the capacity to display a simple animated GIF, the ol-loadingpanel allows to provide the actual **layer loading progress**, e.g. by means of a progress bar. Depending on the application needs, the plugin is **customizable with loading events listeners** (start, progress, end).

Initially  developed for Openlayers 3, the plugin is under revision for supporting later versions of OpenLayers.

## Status

The plugin has been **successfully tested** and, for information, it is used in production in [FIGIS](http://www.fao.org/fishery/topic/18042/en) and several map viewers built on the [OpenFairViewer](https://github.com/eblondel/OpenFairViewer) framework

For users/developers interested in contributing, contributions, bug reporting and/or fixing are more than welcome! If you have questions or suggestions, please do not hesitate to [contact me](mailto:emmanuel.blondel1@gmail.com)

## Examples

_UNDER REVIEW (CURRENT UPGRADE TO OPENLAYERS 6)_

The examples demonstrate usage and can be viewed online thanks to [RawGit](http://rawgit.com/):

* [Basic usage - with Animated GIF](http://rawgit.com/eblondel/ol-loadingpanel/master/examples/loadingpanel.html)
   * Create a map instance with a basic loading panel control, with an animated GIF
* [Basic usage - with Progress bar](http://rawgit.com/eblondel/ol-loadingpanel/master/examples/loadingpanel-progress.html)
   * Create a map instance with a basic loading panel control, with a progress bar
* [Using event listeners](http://rawgit.com/eblondel/ol-loadingpanel/master/examples/loadingpanel-events.html)
   * Create a map instance adding event listeners ``onstart``, ``onprogress``, ``onend``
   
## API

_UNDER REVIEW (CURRENT UPGRADE TO OPENLAYERS 6)_

### `new LoadingPanel(opt_options)`

OpenLayers Loading Panel.

See [the examples](./examples) for usage.

#### Parameters:

The ``LoadingPanel`` accepts a single ``opt_options`` parameter (of type ``Object``), and accepts the following properties:

|Name|Type|Description|
|:---|:---|:----------|
|`className`|`String`| control CSS class name. Default value is ``ol-loading-panel``|
|`widget`|`String`| widget type: ``animatedgif`` (default value) or ``progressbar``|
|`progressMode`|`String`| mode to use for reporting progress: ``tile`` (default) or ``layer``|
|`showPanel`|`Boolean`| If the loading panel has to be shown. Default value is ``true``. Value ``false`` can be used if an external loading panel element is used, together with the ``ol.control.LoadingPanel`` ``events``|
|`onstart`|`Object`| a function to register on load start ``event``, with no parameter.|
|`onprogress`|`Object`| a function to register on load progress ``event`` defined as ``function(loaded, toload){...}`` where ``loaded`` is the number of ``tiles`` (or ``layers``) loaded, and ``toload`` is the total number of ``tiles`` (or ``layers``) to be loaded |
|`onend`|`Object`| a function to register on load end  ``event``, with no parameter.|

#### Extends

`ol/control/Control`

#### Methods

##### `show()`

Show the loading panel.

##### `hide()`

Hide the loading panel.

##### `progressDetails()`

Returns an array of [loaded,toload] values.

##### `progress()`

Returns a number between 0 and 1.

##### `setMap(map)`

Set the map instance the control is associated with.

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`map`|`ol/Map`| The map instance. |

## License

MIT (c) 2015 Emmanuel Blondel

## Contributors

* [Marco Balestra](https://github.com/marcobalestra)

## Applications

* [FigisMap](https://github.com/openfigis/FigisMap) Javascript API for the Fisheries Global Information System (FIGIS)
* [OpenFairViewer](https://github.com/eblondel/OpenFairViewer) 

## Sponsors

* UN FAO FI Department, as part of the [Fisheries Global Information System](http://www.fao.org/fishery/topic/18042/en) (FIGIS)
[![FIGIS](http://www.fao.org/figis/servlet/IRS?iid=17437)](http://www.fao.org/fishery/topic/18042/e)
