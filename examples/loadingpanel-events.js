var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857'),
        zoom: 6
    })
});

//basic function to report events
var lastEvent;
function addEventToReport(event, loaded, toload){
	
	var list = document.getElementById('events').getElementsByTagName('ul')[0];
	if(event == 'start') list.innerHTML = '';
	
	var content = event;
	if(event == 'progress') content = 'progress: ' + String(parseInt(100 * loaded / toload)) + '%';
	
	var element = document.createElement('li');
	element.innerHTML = content;
	
	if(event == 'end') {
		if(lastEvent != 'end') list.appendChild(element);
	}else{
		list.appendChild(element);
	}
	lastEvent = event;
}

//loading panel options
var loadingPanelOptions = {
	widget: 'progressbar',
	onstart : function(){
		addEventToReport('start');
	},
	onprogress: function(loaded, toload){
		addEventToReport('progress', loaded, toload);
	},
	onend : function(){
		addEventToReport('end');
	}
};

//loading panel control
var loadingPanel = new ol.control.LoadingPanel(loadingPanelOptions);
map.addControl(loadingPanel);
