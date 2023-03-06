import GeoJSON from 'ol/format/GeoJSON.js';
// import Map from 'ol/Map.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
// import View from 'ol/View.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import {map} from './baseMap.js';
const style = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
});

const colorMap = new VectorLayer({
	name:'矢量点击层',
  source: new VectorSource({
    url: '../data/map.geojson',
    format: new GeoJSON(),
  }),
  style: function (feature) {
    const color = feature.get('COLOR_NNH') || '#74fff6';
    style.getFill().setColor(color);
    return style;
  },
});
map.addLayer(colorMap)


const highlightStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: highlightStyle,
});

let highlight;
const displayFeatureInfo = function (pixel) {
  colorMap.getFeatures(pixel).then(function (features) {
    const feature = features.length ? features[0] : undefined;
    const info = document.getElementById('info');
    if (features.length) {
      info.innerHTML = feature.get('ECO_NAME') + ': ' + feature.get('NNH_NAME');
    } else {
      info.innerHTML = '&nbsp;';
    }

    if (feature !== highlight) {
      if (highlight) {
        featureOverlay.getSource().removeFeature(highlight);
      }
      if (feature) {
        featureOverlay.getSource().addFeature(feature);
      }
      highlight = feature;
    }
  });
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});

export default colorMap
