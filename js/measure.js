import Map from 'ol/Map';
import View from 'ol/View';
import {
  Circle as CircleStyle,
  Fill,
  Icon,
  RegularShape,
  Stroke,
  Style,
  Text,
} from 'ol/style';
import {Draw, Modify} from 'ol/interaction';
import {LineString, Point} from 'ol/geom';
import { Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {getArea, getLength} from 'ol/sphere';
import { map } from './baseMap.js';


const typeSelect = document.getElementById('type');
export const showSegments = document.getElementById('segments');
export const clearPrevious = document.getElementById('clear');




const style = new Style({
  fill: new Fill({
    color: 'rgba(0, 255, 125, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 255, 255, 1)',
    lineDash: [10, 10],
    width: 2,
  }),
 
  image: new CircleStyle({
    radius: 8,
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.9)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: '20px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

const tipStyle = new Style({
  text: new Text({
    font: '15px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
	offsetY:20
  }),
});

const modifyStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
  text: new Text({
    text: 'Drag to modify',
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const segmentStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textBaseline: 'bottom',
    offsetY: -12,
  }),
  image: new RegularShape({
	  
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
});

const segmentStyles = [segmentStyle];

const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
  } else {
    output = Math.round(area * 100) / 100 + ' m\xB2';
  }
  return output;
};
const formatCircleArea = function(Circle){
	const area = getArea(Circle);
	let output;
	if (area > 10000) {
	  output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
	} else {
	  output = Math.round(area * 100) / 100 + ' m\xB2';
	}
	return output;
}
// const raster = new TileLayer({
//   source: new OSM(),
// });

 const source = new VectorSource();

const modify = new Modify({source:source, style: modifyStyle});

let tipPoint;

export function styleFunction(feature, segments, drawType, tip) {
  const styles = [style];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type) {
    if (type === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry; 
	  }
	  // } else if(type ==='Circle'){
	  // 	point  = geometry.getCenter();
	  // 	label = formatCircleArea(geometry);
	  // 	line = new LineString(geometry.getCoordinates()[0]);
	  // }
	  
	  }
    
 
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new LineString([a, b]);
      const label = formatLength(segment);
	  
	  const dx = b[0] - a[0];
	  const dy = b[1] - a[1];
	  
	  const rotation = Math.atan2(dy,dx);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count],
	  //带箭头的线
		new Style({
			geometry:new Point(a),
			
			image:new Icon({
				src:'../img/logo.png',
				anchor:[0.75,0.5],
				rotateWithView:true,
				rotation:-rotation,
				opacity:'0.8',
				scale:'0.5',
				
			}),
			
		})
					
					);
      count++;
    });
  }
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  if (
    tip &&
    type === 'Point' &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

 const vector = new VectorLayer({
	 name:'vector图层',
  source: source,
  style: function (feature) {
    return styleFunction(feature, showSegments.checked);
  },
});


map.addLayer(vector)
map.addInteraction(modify);

let draw; // global so we can remove it later

 export function addInteraction() {
	 
  const drawType = typeSelect.value;
  
  
  const activeTip =
    'Click to continue drawing the ' +
    (drawType === 'Circle' ? 'Circle' : (drawType ==='Polygon' ? 'polygon' : 'line'));
	
  const idleTip = 'Click to start measuring';
  let tip = idleTip;
  draw = new Draw({
    source: source,
    type: drawType,
    style: function (feature) {
      return styleFunction(feature, showSegments.checked, drawType, tip);
    },
  });
  
  draw.on('drawstart', function () {
    if (clearPrevious.checked) {
      source.clear();
    }
		
  
    modify.setActive(false);
    tip = activeTip;
  });
  draw.on('drawend', function () {
    modifyStyle.setGeometry(tipPoint);
    modify.setActive(true);
    map.once('pointermove', function () {
      modifyStyle.setGeometry();
    });
	
	
    tip = idleTip;
  });
  modify.setActive(true);
  map.addInteraction(draw);
}

typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};



showSegments.onchange = function () {
  vector.changed();
  draw.getOverlay().changed();
};






