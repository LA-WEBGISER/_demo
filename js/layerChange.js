
import {td_img,td_cia,td_vec,td_cva} from './baseMap.js'

let td=document.getElementById('td')
td.addEventListener('click',function(){
	// map.addLayer(td_img)
	// map.addLayer(td_cia)
	td_vec.setVisible(false)
	td_cva.setVisible(false)
	td_img.setVisible(true)
	td_cia.setVisible(true)
	
	
	// map.removeLayer(osm)
	// map.removeLayer(td_vec)
	// map.removeLayer(td_cva)
	 document.getElementById('basemap0').style.background = 'url(../img/tianditu.png) no-repeat right'
})





let tds=document.getElementById('tds')
tds.addEventListener('click',function(){
	// map.addLayer(td_vec)
	// map.addLayer(td_cva)
	
	// map.removeLayer(td_img)
	// map.removeLayer(td_cia)
	// map.removeLayer(osm)
	td_img.setVisible(false)
	td_cia.setVisible(false)
	td_vec.setVisible(true)
	td_cva.setVisible(true)
	
	 document.getElementById('basemap0').style.background = 'url(../img/gaode.png) no-repeat right'
})


export default {
	td,tds
}


