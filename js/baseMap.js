import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import Map from 'ol/Map';
import View from 'ol/View';
import {
	OverviewMap,
	ZoomToExtent,
	defaults as defaultControls,
	
} from 'ol/control';
import XYZ from 'ol/source/XYZ';
import { Vector } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import {vector,raster} from './heatMap.js';
import {vector2,wmtsSource,wmssource} from './OGC.js';


export let td_vec=new TileLayer({
	name:'天地图矢量图层',
	source:new XYZ({
		
		url: "http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=8331e08d1656e2ee9467634ec70d1ae9",
		wrapX: false
	}),
	visible:false
})

export let td_cva=new TileLayer({
	name:'天地图矢量注记',
	source:new XYZ({
		
		url: "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=8331e08d1656e2ee9467634ec70d1ae9",
		wrapX: false
	}),
	visible:false
})


 export let td_img = new TileLayer({
	 name: "天地图影像图层",
	source: new XYZ({
		
		url: "http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8331e08d1656e2ee9467634ec70d1ae9",
		
		wrapX: false
	}),
	visible:true
});



 export let td_cia = new TileLayer({
	 name: "天地图影像注记图层",
	source: new XYZ({
		
		url: "http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=8331e08d1656e2ee9467634ec70d1ae9",
		wrapX: false
	}),
	visible:true
});

export let views = new View({
	
	center: [14101606, 5746241],
	
	zoom: 12,
	minZoom: 6,
	maxZoom: 18,
	
})
const source = new XYZ({
	url:'http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8331e08d1656e2ee9467634ec70d1ae9'
});
const overviewMapControl = new OverviewMap({
	layers: [
		new TileLayer({
			source: source
		})
	],
	collapsed: false
})

const zoomToExtent = new ZoomToExtent({
	extent:[
		
		 14090968.211420412,5745622.892282406,
		 14102685.35749526,5736081.485979275
		         
		// 14101606.552068463,5746241.980183128,
		// 14102706.489454897,5745182.964441222
	],
	layers:[
		new TileLayer({
			source:source
			
		})
	],
	
});

export let map = new Map({
	target: 'map',
	controls: defaultControls().extend([overviewMapControl,zoomToExtent]),
	layers: [td_img, td_cia,td_vec,td_cva,raster,vector,vector2,wmtsSource,wmssource],
	view: views })

 

