/**
 * Copyright (c) 2015 Emmanuel Blondel
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * /

/**
 * @classdesc
 * A control to display a loader image (typically an animated GIF) when
 * the map tiles are loading, and hide the loader image when tiles are
 * loaded
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.LoadingPanelOptions} opt_options Options.
 * 
 * @author Emmanuel Blondel
 *
 */
ol.control.LoadingPanel = function(opt_options) {
	
	var options = opt_options || {};

    	this.mapListeners = [];

	this.tileListeners = [];

	this.loadStatus_ = false;

	this.loadProgress_ = [0,1];
	
	//widget type
	if(options.widget) if(['animatedgif', 'progressbar'].indexOf(options.widget) == -1) alert("invalid value for 'widget'");
	this.widget = (options.widget)? options.widget : 'animatedgif';

	//progress mode
	if(options.progressMode) if(['tile','layer'].indexOf(options.progressMode) == -1) alert("invalid value for 'progressMode'");
	this.loadProgressByTile_ = ( options.progressMode == 'layer')? false : true;
	
	//other options
	this.showPanel = (typeof options.showPanel == 'boolean') ? options.showPanel : true;
	
	//class name
	var className = options.className ? options.className : 'ol-loading-panel';
	
	//element
	var elementDom = (this.widget == 'animatedgif')? 'span' : 'progress';
	var element = document.createElement(elementDom);
	element.className = className + ' ' + 'ol-unselectable';
	if(this.widget == 'progressbar') {
		//element progress bar for old browsers
		var div = document.createElement('div');
		div.className = 'ol-progress-bar';
		var span = document.createElement('span');
		div.appendChild(span);
	}

	//events
	this.oncustomstart = (options.onstart)? options.onstart : false;
	this.oncustomprogress = (options.onprogress)? options.onprogress : false;
	this.oncustomend = (options.onend)? options.onend : false;

	ol.control.Control.call(this, {
		element: element,
		target: options.target
	});
};

ol.inherits(ol.control.LoadingPanel, ol.control.Control);

/**
 * Setup the loading panel
 */
ol.control.LoadingPanel.prototype.setup = function() {
	var size = this.getMap().getSize();
	this.element.style.left = String( Math.round( size[0]/2 ) ) + 'px';
    this.element.style.bottom = String( Math.round( size[1]/2 ) ) + 'px';
	
	var this_ = this;

	this.mapListeners.push(this.getMap().on('pointerdown', function() {
		this_.hide();
	}));

	//display loading panel before render
	this.mapListeners.push(this.getMap().beforeRender(function(map,framestate){
		this_.registerLayersLoadEvents_();
		this_.show();
		if(this_.oncustomstart) this_.oncustomstart.apply(this_,[]);
	}));

	//hide loading panel after render
	this.mapListeners.push(this.getMap().on("postrender", function(e){
		this_.updateLoadStatus_();
		if( this_.loadStatus_ ){
			if(this_.oncustomend) this_.oncustomend.apply(this_,[]);
			this_.hide();
		}
	}));
	
};


/**
 * Reports load progress for a source
 * @param source
 * @return true if complete false otherwise
 */
ol.control.LoadingPanel.prototype.updateSourceLoadStatus_ = function(source){
	return Math.round(source.loaded / source.loading * 100) == 100;
}

/**
 * Register layer load events
 * @param layer
 */
ol.control.LoadingPanel.prototype.registerLayerLoadEvents_ = function(layer) {
	
	var this_ = this;

	var source = layer.getSource();

	source.on(["tileloadstart", "imageloadstart"], function(e) {
		if( this_.loadStatus_ ) {
			this_.loadStatus_ = false;
			this_.loadProgress_ = [0,1];
			if(this_.widget == 'progressbar') {
				this_.element.value = this_.loadProgress_[0];
				this_.element.max = this_.loadProgress_[1];
			}
			this_.show();
			if(this_.oncustomstart) this_.oncustomstart.apply(this_,[]);
		}
		this.loading = (this.loading)? this.loading + 1 : 1;
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
	
	source.on(["tileloadend", "imageloadend", "tileloaderror", "imageloaderror"], function(e) {
		this.loaded = (this.loaded)? this.loaded + 1 : 1;
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
ol.control.LoadingPanel.prototype.registerLayersLoadEvents_ = function() {
	var groups = this.getMap().getLayers().getArray();
	for(var i=0;i<groups.length;i++) {
		var layer = groups[i];
		if(layer instanceof ol.layer.Group) {
			var layers = layer.getLayers().getArray();
			for(var j=0;j<layers.length;j++){
				var l = layers[j];
				if( !(l instanceof ol.layer.Vector) ) {
					this.tileListeners.push( this.registerLayerLoadEvents_(l) );
				}
			}
		} else if (layer instanceof ol.layer.Layer) {
			if( !(layer instanceof ol.layer.Vector) ) {
				this.tileListeners.push( this.registerLayerLoadEvents_(layer) );
			}
		}
	}
}

/**
 * Gives a load status for the complete stack of layers
 *
 */
ol.control.LoadingPanel.prototype.updateLoadStatus_ = function() {
	

	var loadStatusArray = new Array();
	var groups = this.getMap().getLayers().getArray();
	for(var i=0;i<groups.length;i++) {
		var layer = groups[i];
		if(layer instanceof ol.layer.Group) {
			var layers = layer.getLayers().getArray();
			for(var j=0;j<layers.length;j++){
				var l = layers[j];
				if( !(l instanceof ol.layer.Vector) ) {
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
ol.control.LoadingPanel.prototype.show = function() {
	if ( this.showPanel ) this.element.style.display = 'block';
};

/**
 * Hide the loading panel
 */
ol.control.LoadingPanel.prototype.hide = function() {
	if ( this.showPanel ) this.element.style.display = 'none';
};

/**
 * Show the progress details
 */
ol.control.LoadingPanel.prototype.progressDetails = function() {
	return this.loadProgress_;
};

/**
 * Show the progress details
 */
ol.control.LoadingPanel.prototype.progress = function() {
	return this.loadProgress_[0] / this.loadProgress_[1];	
};


/**
 * Set the map instance the control is associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.LoadingPanel.prototype.setMap = function(map) {
    
	// Clean up listeners associated with the previous map
    	for (var i = 0, key; i < this.mapListeners.length; i++) {
        	this.getMap().unByKey(this.mapListeners[i]);
    	}
	
    	this.mapListeners.length = 0;
        
	ol.control.Control.prototype.setMap.call(this, map);
    	if (map) this.setup();

};
