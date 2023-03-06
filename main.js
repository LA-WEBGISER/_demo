import {map} from './js/baseMap.js'
import basemapChange from './js/layerChange.js'
import {styleFunction,addInteraction,showSegments,clearPrevious} from './js/measure.js'
import layerControl from './js/layerControl.js'
import clickmove from './js/clickmove.js'
//键盘控制
window.addEventListener('keydown',e=>{
	console.log(e.key.indexOf())
	if(e.key ==='ArrowDown'){
		showSegments.checked=true
		clearPrevious.checked=false
		
	}else if(e.key === 'ArrowUp'){
		showSegments.checked=false
		clearPrevious.checked=true
	}
})










