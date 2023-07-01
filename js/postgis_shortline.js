      import Feature from 'ol/Feature'
      import VectorLayer from 'ol/layer/Vector';
      import VectorSource from 'ol/source/Vector';
      import {
      	map
      } from './baseMap.js';
      import ImageWMS from 'ol/source/ImageWMS';
      import {
      	Image as ImageLayer,
      	Tile as TileLayer
      } from 'ol/layer.js';
      import {
      	Point
      } from 'ol/geom';
      // 初始化起始点要素和目标点要素
      var startPoint = new Feature();
      var destPoint = new Feature();

      // 用于包含起始点要素和目标点要素的图层
      const vectorLayer = new VectorLayer({
      	source: new VectorSource({
      		features: [startPoint, destPoint]
      	})
      });
      map.addLayer(vectorLayer);

      // 注册一个鼠标点击事件，用户点击地图时就会触发
      var result = null;
	  let start_click = document.getElementById('one_start')
	  start_click.addEventListener('click',()=>{
			  map.on('click', function(event) {
			  	if (startPoint.getGeometry() == null) {
			  		// 设置起始点要素的坐标信息
			  		startPoint.setGeometry(new Point(event.coordinate));
			  	} else if (destPoint.getGeometry() == null) {
			  		// 设置目标点要素的坐标信息
			  		destPoint.setGeometry(new Point(event.coordinate));
			  		var startCoord = startPoint.getGeometry().getCoordinates();
			  		var destCoord = destPoint.getGeometry().getCoordinates();
			  		// 设置GeoServer的SQL视图的请求参数
			  		var viewparams = [
			  			'x1:' + startCoord[0], 'y1:' + startCoord[1],
			  			'x2:' + destCoord[0], 'y2:' + destCoord[1]
			  		];
			  		viewparams = viewparams.join(';');
			  		// 向GeoServer发送WMS请求，并将结果路径渲染出来
			  		result = new ImageLayer({
			  			source: new ImageWMS({
			  				url: 'http://localhost:8080/geoserver/shenzhen/wms',
			  				params: {
			  					LAYERS: 'shenzhen:shenzhen',
			  					FORMAT: 'image/png',
			  					viewparams: viewparams
			  				}
			  			})
			  		});
			  		map.addLayer(result);
			  	}
			  });
		 
	  })
      // 用户点击clear按钮，就会触发事件
      const clearButton = document.getElementById('one_clear');
      clearButton.addEventListener('click', function(event) {
      	// 将起始点要素和目标点要素的坐标信息清空
      	startPoint.setGeometry(null);
      	destPoint.setGeometry(null);
      	// 移除结果路径图层
      	map.removeLayer(result);
      });
      export default {
      	clearButton
      }