//wfs

import ImageWMS from 'ol/source/ImageWMS'
import {
	Tile
} from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {
	Tile as TileLayer,
	Vector as VectorLayer,
	Image as ImageLayer
} from 'ol/layer';
import {
	bbox as bboxStrategy
} from 'ol/loadingstrategy';
import Stamen from 'ol/source/Stamen'
let views = new View({
	center: [14101606, 5746241],
	zoom: 12,
	maxZoom: 15,

})

const vectorSource = new VectorSource({
	format: new GeoJSON(),
	url: 'http://localhost:8080/geoserver/nyc/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=nyc%3Ahlj_wms&maxFeatures=50&outputFormat=application%2Fjson',
	
});

export const vector2 = new VectorLayer({
	name: '瓦片WFS',
	source: vectorSource,
	style: {
		'stroke-width': 2,
		'stroke-color': 'red',

	},
	visible: false
});


//WMTS
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {
	get as getProjection
} from 'ol/proj';
import {
	getTopLeft,
	getWidth
} from 'ol/extent';

const projection = getProjection('EPSG:900913');
const projectionExtent = projection.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = [];
const matrixIds = [];
for (let z = 6; z < 11; z++) {
	// generate resolutions and matrixIds arrays for this WMTS
	resolutions[z] = size / Math.pow(2, z);
	matrixIds[z] = 'EPSG:900913:' + z;
}


let wmtsTileGrid = new WMTSTileGrid({
	origin: getTopLeft(projectionExtent), // 原点（左上角）
	resolutions: resolutions, // 分辨率数组
	matrixIds: matrixIds // 矩阵ID，就是瓦片坐标系z维度各个层级的标识
});

export let wmtsSource = new TileLayer({
	name: '瓦片WMTS',
	source: new WMTS({
		//服务地址
		url: 'http://localhost:8080/geoserver/gwc/service/wmts',
		layer: 'nyc:railways_wmts',
		matrixSet: 'EPSG:900913',
		format: 'image/png',
		projection: projection,
		tileGrid: wmtsTileGrid
		//切片策略
	}),
	visible: false
});



export let wmssource = new ImageLayer({
	name: '单个图像wms',
	source: new ImageWMS({
		url: 'http://localhost:8080/geoserver/nyc/wms?service=WMS&version=1.1.0&request=GetMap&layers=nyc%3Ahlj_wms&bbox=121.17427825927734%2C43.42300796508789%2C135.09567260742188%2C53.56362533569336&width=768&height=559&srs=EPSG%3A4326&format=application/openlayers',
		params: {
			'LAYERS': '	nyc:hlj_wms	',
			
		},
		ratio: 1,
		serverType: 'geoserver',
	}),
	visible: false
})
