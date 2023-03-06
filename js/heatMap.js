import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import {Heatmap as HeatmapLayer, Tile as TileLayer} from 'ol/layer';
import Stamen from 'ol/source/Stamen'
import XYZ from 'ol/source/XYZ'

const blur = document.getElementById('blur');
const radius = document.getElementById('radius');

export const vector = new HeatmapLayer({
	name:'热力图',
  source: new VectorSource({
    url: '../data/heatPoint.geojson',
    format: new GeoJSON(),
  }),
  visible:false,
  blur: parseInt(blur.value, 10),
  radius: parseInt(radius.value, 10),
  
});

export const raster = new TileLayer({
	name:'热力地图',
  source: new Stamen({
	 layer:'watercolor'
  }),
   visible:false,
});

// let views=new View({
// 	center: [14095606,5740241],
// 	zoom: 12,
// })

// let map1=new Map({
//   layers: [raster, vector],
//   target: 'map1',
//   view:views
// });

blur.addEventListener('input', function () {
  vector.setBlur(parseInt(blur.value, 10));
});

radius.addEventListener('input', function () {
  vector.setRadius(parseInt(radius.value, 10));
});



	// var closeSync = function () {
	// 	map2.setView(new ol.View({
	// 	  // 定位
	// 	  center: ol.proj.fromLonLat([116, 36]),
	// 	  // 缩放
	// 	  zoom: 4
	// 	}))
	
