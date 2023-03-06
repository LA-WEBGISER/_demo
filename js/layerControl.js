import { map } from './baseMap.js'

    var layersContent = document.getElementById('layerTree');              //图层目录容器
    let layers = map.getLayers();    //获取地图中所有图层
    var layer = [];                   //map中的图层数组
    var layerName = [];               //图层名称数组
    var layerVisibility = [];         //图层可见属性数组

for (let i = 0; i < layers.getLength() ; i++) {
      layer[i] = layers.item(i);
      layerName[i] = layer[i].get('name');
      layerVisibility[i] = layer[i].getVisible();

      let eleLi = document.createElement('li');           //新增li元素，用来承载图层项
      var eleInput = document.createElement('input');     //创建复选框元素，用来控制图层开启关闭
      eleInput.type = "checkbox";
      eleInput.name = "layers"; 
      eleLi.appendChild(eleInput);                        //将复选框添加到li元素中
      // layersContent.appendChild(eleLi);                               //将li元素作为子节点放入到图层目录中（按图层加载正序）
      layersContent.insertBefore(eleLi,layersContent.childNodes[0]);     //将li元素作为子节点放入到图层目录中（按图层加载倒序）
      var eleLable = document.createElement('label');     //创建label元素
      // eleLable.className = "layer";
      // eleLable.htmlFor = "layer";
      setInnerText(eleLable, layerName[i]);                //在label中设置图层名称
      eleLi.appendChild(eleLable);                         //将label加入到li中

      if (layerVisibility[i]) {                            //设置图层默认显示状态
        eleInput.checked = true;
      }
      addChangeEvent(eleInput, layer[i]);              //为checkbox添加变更事件
      // console.log(layer[i]);
      console.log(layers.item(i));

    };
	
	 function setInnerText(element, text) {
	  if (typeof element.textContent == "string") {
	      element.textContent = text;
	  } else {
	      element.innerText = text;
	  }
	}
	
	/*
	* 为checkbox元素绑定变更事件
	*/
	  function addChangeEvent(element, layer) {
	  element.onclick = function () {
	      if (element.checked) {
	          //显示图层
	          layer.setVisible(true);
	      }
	      else {
	          //不显示图层
	          layer.setVisible(false);
	      }
	  };
	}
	
	 
	let layerlistbtn=document.getElementById('layerlistbtn')
	  let cc = document.getElementById("layerControl");
	  layerlistbtn.addEventListener('click',()=>{
		  if (cc.style.display !== "block" ){
		    cc.style.display = "block";
		  } else {
		    cc.style.display = "none";
		  }
	  })
	  
	
	export default {setInnerText,addChangeEvent}