
import Control from 'ol/control/Control';
import {Group as LayerGroup, Tile as TileLayer, Image as ImageLayer, Vector as VectorLayer} from 'ol/layer';
import {TileImage} from 'ol/source';
import { unByKey } from 'ol/Observable';
import './ol-loadingpanel.css';

/**
 * OpenLayers Loading Panel Control.
 * See [the examples](./examples) for usage.
 * @constructor
 * @extends {ol/control/Control~Control}
 * @param {Object} opt_options Control options, extends ol/control/Control~Control#options adding:
 */
export default class LoadingPanel extends Control {

    constructor(opt_options) {
        var options = opt_options || {};
        
		//widget type
		if(options.widget) if(['animatedgif', 'progressbar'].indexOf(options.widget) == -1) alert("invalid value for 'widget'");
		var widget = (options.widget)? options.widget : 'animatedgif';
		
		//class name
		var className = options.className ? options.className : 'ol-loading-panel';
		//element
		var elementDom = (widget == 'animatedgif')? 'span' : 'progress';
		var element = document.createElement(elementDom);
		element.className = className + ' ' + 'ol-unselectable';
		if(widget == 'progressbar') {
			//element progress bar for old browsers
			var div = document.createElement('div');
			div.className = 'ol-progress-bar';
			var span = document.createElement('span');
			div.appendChild(span);
		}
		super({ element: element, target: options.target });
		
		//properties
		this.widget = widget;
        this.layerCount = 0;		
		this.hasPostRenderedOnce = undefined;
		this.hasPostRenderedMore = false;
		this.mapListeners = [];
		this.tileListeners = [];
		this.loadStatus_ = false;
		this.loadProgress_ = [0,1];
		
		//progress mode
		if(options.progressMode) if(['tile','layer'].indexOf(options.progressMode) == -1) alert("invalid value for 'progressMode'");
		this.loadProgressByTile_ = ( options.progressMode == 'layer')? false : true;
		
		//other options
		this.showPanel = (typeof options.showPanel == 'boolean') ? options.showPanel : true;

		//events
		this.oncustomstart = (options.onstart)? options.onstart : false;
		this.oncustomprogress = (options.onprogress)? options.onprogress : false;
		this.oncustomend = (options.onend)? options.onend : false;

    }
	
	/**
	 * Setup the loading panel
	 */
	setup() {
		var this_ = this;
		
		var size = this.getMap().getSize();
		this.element.style.left = String( Math.round( size[0]/2 ) ) + 'px';
		this.element.style.bottom = String( Math.round( size[1]/2 ) ) + 'px';
        
        // Clean up listeners associated with the previous map
        for (var i = 0, key; i < this_.mapListeners.length; i++) {
            unByKey(this_.mapListeners[i]);
        }
        this_.mapListeners.length = 0;  
        
        //pointerdown event
		this.mapListeners.push(this.getMap().on('pointerdown', function() {
			this_.hide();
			this_.hasPostRenderedOnce = undefined;
			this_.hasPostRenderedMore = false;
		}));

		//display loading panel before render
		/*this.mapListeners.push(this.getMap().on("change", function(e){
			this_.registerLayersLoadEvents_();
			this_.show();
			if(this_.oncustomstart) this_.oncustomstart.apply(this_,[]);
		}));*/

		//hide loading panel after render
		this.mapListeners.push(this.getMap().on("postrender", function(e){
			this_.updateLoadStatus_();
			if(this_.hasPostRenderedOnce){
				this_.hasPostRenderedMore = true;
			}
			if(typeof this_.hasPostRenderedOnce == "undefined"){
				this_.hasPostRenderedOnce = true;
				this_.hasPostRenderedMore = false;			
			}
			if(this_.loadStatus_ && this_.hasPostRenderedMore){
				if(this_.oncustomend) this_.oncustomend.apply(this_,[]);
				this_.hide();
				this_.hasPostRenderedOnce = undefined;
				this_.hasPostRenderedMore = false;
			}
		}));
		
	}


	/**
	 * Reports load progress for a source
	 * @param source
	 * @return true if complete false otherwise
	 */
	updateSourceLoadStatus_(source){
		return Math.round(source.loaded / source.loading * 100) == 100;
	}

	/**
	 * Register layer load events
	 * @param layer
	 */
	registerLayerLoadEvents_(layer) {
		
		var this_ = this;
        
        var eventProperty = (layer.getSource() instanceof TileImage)? "tile" : "image";
        var startEvents = (layer.getSource() instanceof TileImage)? "tileloadstart" : "imageloadstart";
        var endEvents = (layer.getSource() instanceof TileImage)? ["tileloadend", "tileloaderror"] : ["imageloadend", "imageloaderror"];
        //on start
		layer.getSource().on(startEvents, function(e) {
			if(this_.layerCount = 0) this_.show();
			//map load status to false in case we add start events
            if( this_.loadStatus_ ) {
				this_.loadStatus_ = false;
				this_.loadProgress_ = [0,0];
				if(this_.widget == 'progressbar') {
					this_.element.value = this_.loadProgress_[0];
					this_.element.max = this_.loadProgress_[1];
				}
				this_.show();
				if(this_.oncustomstart) this_.oncustomstart.apply(this_,[]);
			}
            if(!this.loaded) this.loaded = 0;
			this.loading = (this.loading)? this.loading+1 : 1;
			this.isLoaded = this_.updateSourceLoadStatus_(this);
			if( this_.loadProgressByTile_) {
				this_.loadProgress_[1] += 1;
				if(this_.widget == 'progressbar'){
					this_.element.max = this_.loadProgress_[1];
					var progressBarDiv = this_.element.getElementsByClassName('ol-progress-bar');
					if( progressBarDiv.length > 0 ) progressBarDiv[0].children()[0].width = String(parseInt(100 * this_.progress()))+'%';
				}
			}
		});
        //on end
		layer.getSource().on(endEvents, function(e) {
			if(e[eventProperty].getState() == 3) console.warn("Loading " + eventProperty + " failed for resource '"+e[eventProperty].src_+"'");
		
			this.loaded += 1;
			this.isLoaded = this_.updateSourceLoadStatus_(this);
			if( this_.loadProgressByTile_) {
				this_.loadProgress_[0] += 1;
				if(this_.widget == 'progressbar'){
					this_.element.value = this_.loadProgress_[0];
					var progressBarDiv = this_.element.getElementsByClassName('ol-progress-bar');
					if( progressBarDiv.length > 0 ) progressBarDiv[0].children()[0].width = String(parseInt(100 * this_.progress()))+'%';
				}
				if(this_.oncustomprogress) this_.oncustomprogress.apply(this_,this_.loadProgress_);
			}
		});
		
	}

	/**
	 * Register layer load events
	 *
	 */
	registerLayersLoadEvents_() {
		var groups = this.getMap().getLayers().getArray();
		for(var i=0;i<groups.length;i++) {
			var layer = groups[i];
			if(layer instanceof LayerGroup) {
				var layers = layer.getLayers().getArray();
				for(var j=0;j<layers.length;j++){
					var l = layers[j];
					if( !(l instanceof VectorLayer) ) {
						this.tileListeners.push( this.registerLayerLoadEvents_(l) );
                        this.layerCount += 1;
					}
				}
			} else {
				if( !(layer instanceof VectorLayer) ) {
					this.tileListeners.push( this.registerLayerLoadEvents_(layer) );
                    this.layerCount += 1;
				}
			}
		}
	}

	/**
	 * Gives a load status for the complete stack of layers
	 *
	 */
	updateLoadStatus_() {
		
		var loadStatusArray = new Array();
		var groups = this.getMap().getLayers().getArray();
		for(var i=0;i<groups.length;i++) {
			var layer = groups[i];
			if(layer instanceof LayerGroup) {
				var layers = layer.getLayers().getArray();
				for(var j=0;j<layers.length;j++){
					var l = layers[j];
					if( !(l instanceof VectorLayer) ) {
						loadStatusArray.push( l.getSource().isLoaded );
					}
				}
			} else {
				loadStatusArray.push( layer.getSource().isLoaded );	
			}
		}
			
		//status
		this.loadStatus_ = (loadStatusArray.indexOf(false) == - 1) && (loadStatusArray.indexOf(true) != -1);
		
		if( !this.loadProgressByTile_ ) {

			//progress
			var count = {}
			loadStatusArray.forEach(function(i) { count[i] = (count[i]||0)+1;  });
			var loaded = (count[true])? count[true] : 0;
		
			//progress events
			if( loaded > this.loadProgress_[0]){
				this.loadProgress_ = [loaded,loadStatusArray.length];
				if(this_.widget == 'progressbar') {
					this_.element.max = this_.loadProgress_[1];
					this_.element.value = this_.loadProgress_[0];
				}
				if(this.oncustomprogress) this.oncustomprogress.apply(this,this.loadProgress_);
			}
		}

	}

	/**
	 * Show the loading panel
	 */
	show() {
		if ( this.showPanel ) this.element.style.display = 'block';
	}
	
	/**
	 * Is the loading panel shown?
	 */
	isShown(){
		return this.element.style.display == 'block';
	}

	/**
	 * Hide the loading panel
	 */
	hide() {
		if ( this.showPanel ) this.element.style.display = 'none';
	}
	
	/**
	 * Is the loading panel hidden?
	 */	
	isHidden(){
		return this.element.style.display == 'none';
	}

	/**
	 * Show the progress details
	 */
	progressDetails() {
		return this.loadProgress_;
	}

	/**
	 * Show the progress details
	 */
	progress() {
		return this.loadProgress_[0] / this.loadProgress_[1];	
	}


	/**
	 * Set the map instance the control is associated with.
	 * @param {ol.Map} map The map instance.
	 */
	setMap(map) {
        var this_ = this;
		super.setMap(map);             
        if (map){
            //first setup
            this.setup();
            
             //register event if a map change is triggered
            this.mapListeners.push(this.getMap().on("change", function(e){
				var layers = this_.getMap().getLayers().getArray();
				var withLayerGroups = layers[0] instanceof LayerGroup;
				var count = layers.length;
				if(withLayerGroups){
					count = layers
						.map(function(item){return item.getLayers().getArray().length})
						.reduce(function(a, b){ return a + b;});
					var thelayers = new Array();
					for(var i=0;i<layers.length;i++){
						var groupLayers = layers[i].getLayers().getArray();
						for(var j=0;j<groupLayers.length;j++){
							thelayers.push(groupLayers[j]);
						}
					}
					layers = thelayers;
				}
				console.log("Count layer = "+count);
				console.log(this_.layerCount);
				if(count > this_.layerCount){
					//last layer
					var l = layers[layers.length-1];
					this_.show();
					this_.registerLayerLoadEvents_(l);
				}
            }));
        }
	}
}

if (window.ol && window.ol.control) {
    window.ol.control.LoadingPanel = LoadingPanel;
}