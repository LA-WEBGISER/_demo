// var SHADOW_VSHADER_SOURCE = `
// 	attribute vec4 a_Position;
// 	uniform mat4 u_MvpMatrix;
// 	attribute vec2 a_TexCoord;
// 	varying vec2 v_TexCoord;
// 	void main(void){
// 		gl_Position = u_MvpMatrix * a_Position;
// 		v_TexCoord = a_TexCoord;
// 	}
// `;

// var SHADOW_FSHADER_SOURCE = `
// 	precision mediump float;
// 	uniform sampler2D u_Sampler;
// 	varying vec2 v_TexCoord;
// 	void main(void){
// 		gl_FragColor = texture2D(u_Sampler,v_TexCoord);
// 	}
// `;




var vsSource = `
attribute vec4 a_Position;
attribute vec4 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;//变换法向量的矩阵
uniform vec3 u_viewWorldPosition;//眼睛位置

varying  vec3 v_Normal;
varying  vec3 v_Position;
varying vec3 v_surfaceToView;
varying vec2 v_TexCoord;

			void main(void){
				gl_Position = u_MvpMatrix * a_Position;
				v_Position = vec3(u_ModelMatrix * a_Position);
				v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
				v_surfaceToView = u_viewWorldPosition - v_Position;
				v_TexCoord = a_TexCoord;
				
				
			}
		`;
var fsSource = `

precision mediump float;
uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;//光源位置
uniform vec3 u_AmbientLight; //环境光颜色
uniform float u_shininess;
uniform vec3 u_shininessColor;
uniform sampler2D u_Sampler;

varying  vec3 v_Normal;
varying  vec3 v_Position;
varying vec3 v_surfaceToView;
varying vec2 v_TexCoord;

			void main(void){
				vec3 normal = normalize(v_Normal);
				vec3 lightDirection = normalize(u_LightPosition - v_Position);
				float nDotL = max(dot(normal,lightDirection),0.0);
				vec3 surfaceToViewDirection = normalize(v_surfaceToView);
				vec3 halfvector = normalize(surfaceToViewDirection + lightDirection);
				float spec=0.0;
				if(nDotL >0.0){
					spec=pow(dot(normal,halfvector),u_shininess);//镜面光强
				}
				
				
				vec3 specular = u_shininessColor * (spec * vec3(texture2D(u_Sampler, v_TexCoord)));
				vec3 diffuse = u_LightColor * nDotL * vec3(texture2D(u_Sampler, v_TexCoord));
				vec3 ambient = u_AmbientLight * vec3(texture2D(u_Sampler, v_TexCoord));
				vec3 num = (specular + diffuse + ambient);
				gl_FragColor = vec4(num ,1.0);
			}
		`;
let gl;
var OFFSCREEN_WIDTH = 256,
	OFFSCREEN_HEIGHT = 256;
var LIGHT_X = 0,
	LIGHT_Y = 0,
	LIGHT_Z = 20;

function main() {
	let canvas = document.getElementById('glcanvas')
	gl = canvas.getContext('webgl');
	// initShaders();

	// let shadowProgram = createProgram(gl, SHADOW_VSHADER_SOURCE, SHADOW_FSHADER_SOURCE)
	// shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, 'a_Position');
	// shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram, 'u_MvpMatrix');
	// shadowProgram.a_TexCoord = gl.getUniformLocation(shadowProgram,'a_TexCoord')
	let normalProgram = createProgram(gl, vsSource, fsSource)



	normalProgram.a_Position = gl.getAttribLocation(normalProgram, 'a_Position');
	normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, 'u_MvpMatrix');
	normalProgram.u_NormalMatrix = gl.getUniformLocation(normalProgram, 'u_NormalMatrix');
	normalProgram.a_Normal = gl.getAttribLocation(normalProgram, "a_Normal")
	normalProgram.a_TexCoord = gl.getAttribLocation(normalProgram, "a_TexCoord")
	//模型设置
	normalProgram.u_ModelMatrix = gl.getUniformLocation(normalProgram, 'u_ModelMatrix')
	// normalProgram.a_Color = gl.getAttribLocation(normalProgram, 'a_Color')
	// 光照设置
	normalProgram.u_LightColor = gl.getUniformLocation(normalProgram, 'u_LightColor'); //漫反射
	normalProgram.u_AmbientLight = gl.getUniformLocation(normalProgram, 'u_AmbientLight'); //环境光
	normalProgram.u_LightPosition = gl.getUniformLocation(normalProgram, 'u_LightPosition') //光源位置
	normalProgram.u_viewWorldPosition = gl.getUniformLocation(normalProgram, 'u_viewWorldPosition'); //眼睛位置
	normalProgram.u_shininess = gl.getUniformLocation(normalProgram, 'u_shininess') //高光系数
	normalProgram.u_shininessColor = gl.getUniformLocation(normalProgram, 'u_shininessColor') //高光颜色

	gl.useProgram(normalProgram)
	gl.uniform3f(normalProgram.u_LightColor,1.0,1.0,1.0)
	gl.uniform3f(normalProgram.u_AmbientLight, 0.3,0.3,0.3)
	gl.uniform3f(normalProgram.u_LightPosition, 0,0, 20)
	gl.uniform3f(normalProgram.u_viewWorldPosition, 20.0, 10.0, 30.0)
	gl.uniform1f(normalProgram.u_shininess, 200)
	gl.uniform3f(normalProgram.u_shininessColor, 1.0,1.0,1.0)

	let n = initVertexBuffers(gl);
	let plane = initVertexBuffersForPlane(gl);
	let fbo = initFramebufferObject(gl); //初始化帧缓冲区并建立对象
	let texture = initTextures(gl,normalProgram);
	// gl.activeTexture(gl.TEXTURE1); // Set a texture object to the texture unit
	// gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
	// gl.clearColor(1.0,1.0,1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	let g_modelMatrix = new Matrix4();

	var viewProjMatrixFromLight = new Matrix4(); // Prepare a view projection matrix for generating a shadow map
	viewProjMatrixFromLight.setPerspective(50.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0);
	viewProjMatrixFromLight.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

	//v-p视图投影矩阵
	let viewProjMatrix = new Matrix4()
	viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0)
	viewProjMatrix.lookAt(5.0, 10.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
	//离屏绘制矩阵
	// let mvpMatrixFromLight_c = new Matrix4();
	// let mvpMatrixFromLight_p = new Matrix4();



	//键盘事件
	document.onkeydown = function(ev) {

		keydown(ev, gl, normalProgram, n, viewProjMatrix, g_modelMatrix)


	}
	var currentAngle = 0.0;
	let tick = function() {
		currentAngle = animate(currentAngle);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
		gl.clearColor(1.0,1.0,1.0,1.0)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(normalProgram);
		draw(gl, normalProgram, n,texture, viewProjMatrixFromLight, g_modelMatrix)
		// mvpMatrixFromLight_c.set(g_mvpMatrix)
		
		// mvpMatrixFromLight_p.set(g_mvpMatrix)

		gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Change the drawing destination to color buffer
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		
		// gl.uniform1i(normalProgram.u_ShadowMap, 0);

		// gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_c.elements);
		
		drawPlane(gl, normalProgram, plane,currentAngle,fbo.texture ,viewProjMatrix, g_modelMatrix)
		// gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_p.elements);
		

		window.requestAnimationFrame(tick, canvas);
	}

	tick()

}



let angle_step = 3.0;
let g_arm1Angle = 90.0;
let g_joint1Angle = 45.0;
let g_joint2Angle = 90.0;
let g_joint3Angle = 0.0;

function keydown(ev, gl, normalProgram, o, viewProjMatrix, g_modelMatrix) {
	switch (ev.keyCode) {
		case 38:
			if (g_joint1Angle < 135.0) g_joint1Angle += angle_step;
			break;
		case 40:
			if (g_joint1Angle > -135.0) g_joint1Angle -= angle_step;
			break;
		case 39:
			g_arm1Angle = (g_arm1Angle + angle_step) % 360;
			break;
		case 37:
			g_arm1Angle = (g_arm1Angle - angle_step) % 360;
			break;
		case 90:
			g_joint2Angle = (g_joint2Angle + angle_step) % 360;
			break;
		case 88:
			g_joint2Angle = (g_joint2Angle - angle_step) % 360;
			break;
		case 86:
			if (g_joint3Angle < 60) g_joint3Angle = (g_joint3Angle + angle_step) % 360;
			break;
		case 67:
			if (g_joint3Angle > -60) g_joint3Angle = (g_joint3Angle - angle_step) % 360;
			break;
		default:
			return;
	}

}

var g_baseBuffer = null;
var g_arm1Buffer = null;
var g_arm2Buffer = null;
var g_palmBuffer = null;
var g_fingerBuffer = null;

function initVertexBuffers(gl) {
	let base = new Float32Array([
		5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0, 5.0, 0.0, 5.0,
		5.0, 2.0, 5.0, 5.0, 0.0, 5.0, 5.0, 0.0, -5.0, 5.0, 2.0, -5.0,
		5.0, 2.0, 5.0, 5.0, 2.0, -5.0, -5.0, 2.0, -5.0, -5.0, 2.0, 5.0,
		-5.0, 2.0, -5.0, -5.0, 0.0, -5.0, -5.0, 0.0, 5.0, -5.0, 2.0, 5.0,
		-5.0, 0.0, -5.0, -5.0, 0.0, 5.0, 5.0, 0.0, 5.0, 5.0, 0.0, -5.0,
		-5.0, 2.0, -5.0, -5.0, 0.0, -5.0, 5.0, 0.0, -5.0, 5.0, 2.0, -5.0,
	]);

	let arm1 = new Float32Array([
		1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5,
		1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
		1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5,
		-1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5, -1.5, 10.0, 1.5,
		-1.5, 0.0, -1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5,
		-1.5, 10.0, -1.5, -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
	]);
	let arm2 = new Float32Array([
		1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5,
		1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
		1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5,
		-1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5, -1.5, 10.0, 1.5,
		-1.5, 0.0, -1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5,
		-1.5, 10.0, -1.5, -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
	]);
	let palm = new Float32Array([
		1.5, 2.0, 1.0, -1.5, 2.0, 1.0, -1.5, 0.0, 1.0, 1.5, 0.0, 1.0,
		1.5, 2.0, 1.0, 1.5, 0.0, 1.0, 1.5, 0.0, -1.0, 1.5, 2.0, -1.0,
		1.5, 2.0, 1.0, 1.5, 2.0, -1.0, -1.5, 2.0, -1.0, -1.5, 2.0, 1.0,
		-1.5, 2.0, -1.0, -1.5, 0.0, -1.0, -1.5, 0.0, 1.0, -1.5, 2.0, 1.0,
		-1.5, 0.0, -1.0, -1.5, 0.0, 1.0, 1.5, 0.0, 1.0, 1.5, 0.0, -1.0,
		-1.5, 2.0, -1.0, -1.5, 0.0, -1.0, 1.5, 0.0, -1.0, 1.5, 2.0, -1.0,
	]);
	let finger = new Float32Array([
		0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5,
		0.5, 2.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 2.0, -0.5,
		0.5, 2.0, 0.5, 0.5, 2.0, -0.5, -0.5, 2.0, -0.5, -0.5, 2.0, 0.5,
		-0.5, 2.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 2.0, 0.5,
		-0.5, 0.0, -0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5,
		-0.5, 2.0, -0.5, -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 2.0, -0.5,

	]);





	var normals = new Float32Array([
		0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
		-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
		0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
		0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
	]);

  var texCoords = new Float32Array([   // Texture coordinates
     1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
     0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
     1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
     0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v1-v6-v7-v2 left
     0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v7-v4-v3-v2 down
     0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0     // v4-v7-v6-v5 back
  ]);
	var indices = new Uint8Array([
		0, 1, 2, 0, 2, 3, //前
		4, 5, 6, 4, 6, 7, //右
		8, 9, 10, 8, 10, 11, //上
		12, 13, 14, 12, 14, 15, //左
		16, 17, 18, 16, 18, 19, //下
		20, 21, 22, 20, 22, 23, //后




	]);



	let o = new Object();

	o.g_baseBuffer = initArrayBufferForLaterUse(gl, base, 3, gl.FLOAT);
	o.g_arm1Buffer = initArrayBufferForLaterUse(gl, arm1, 3, gl.FLOAT);
	o.g_arm2Buffer = initArrayBufferForLaterUse(gl, arm2, 3, gl.FLOAT);
	o.g_palmBuffer = initArrayBufferForLaterUse(gl, palm, 3, gl.FLOAT);
	o.g_fingerBuffer = initArrayBufferForLaterUse(gl, finger, 3, gl.FLOAT);
	o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
	// o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
	o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT)
	o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE)
	// initArrayBuffer(gl, arm, 3, gl.FLOAT, 'a_Position')
	o.numIndices = indices.length;

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	return o;
}


function initVertexBuffersForPlane(gl) {
	// Create a plane
	//  v1------v0
	//  |        | 
	//  |        |
	//  |        |
	//  v2------v3

	// Vertex coordinates
	var vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   -1.0,-1.0,1.0,   1.0,-1.0, 1.0,  1.0,-1.0, -1.0,    // v7-v4-v3-v2 down
     -1.0,1.0,-1.0,  -1.0,-1.0,-1.0,  1.0, -1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
	]);

	//texCoords
	var texCoords = new Float32Array([
	  1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
	  0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
	  1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
	  1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
	  0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v7-v4-v3-v2 down
	  0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0     // v4-v7-v6-v5 back
	]);

	// Indices of the vertices
	var indices = new Uint8Array([
		0, 1, 2,   0, 2, 3,    // front
		 4, 5, 6,   4, 6, 7,    // right
		 8, 9,10,   8,10,11,    // up
		12,13,14,  12,14,15,    // left
		16,17,18,  16,18,19,    // down
		20,21,22,  20,22,23     // back
	]);

	var o = new Object(); // Utilize Object object to return multiple buffer objects together

	// Write vertex information to buffer object
	o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
	o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
	o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
	if (!o.vertexBuffer || !o.indexBuffer) return null;

	o.numIndices = indices.length;

	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return o;
}





function initAttributeVariable(gl, a_attribute, buffer) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
	gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	buffer.num = num;
	buffer.type = type;
	return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
	var buffer = gl.createBuffer(); // Create a buffer object
	if (!buffer) {
		console.log('Failed to create the buffer object');
		return null;
	}
	// Write date into the buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

	buffer.type = type;

	return buffer;
}

function draw(gl, normalProgram, o,texture, viewProjMatrix, g_modelMatrix) {

	gl.useProgram(normalProgram)
	initAttributeVariable(gl, normalProgram.a_Position, o.g_baseBuffer)
	initAttributeVariable(gl, normalProgram.a_Normal, o.normalBuffer)
	initAttributeVariable(gl, normalProgram.a_TexCoord, o.texCoordBuffer)
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	//绘制基座
	var baseHeight = 2.0;
	g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
	drawSegment(gl, normalProgram, o, viewProjMatrix, g_modelMatrix);
	//arm1
	initAttributeVariable(gl, normalProgram.a_Position, o.g_arm1Buffer)
	let arm1Length = 10.0;
	g_modelMatrix.translate(0.0, baseHeight, 0.0);
	g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
	drawSegment(gl, normalProgram, o, viewProjMatrix, g_modelMatrix);
	//arm2
	initAttributeVariable(gl, normalProgram.a_Position, o.g_arm2Buffer)
	let arm2Length = 10.0;
	g_modelMatrix.translate(0.0, arm1Length, 0.0);
	g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
	g_modelMatrix.scale(1.2, 1.0, 1.2);
	drawSegment(gl, normalProgram, o, viewProjMatrix, g_modelMatrix);
	//apalm
	initAttributeVariable(gl, normalProgram.a_Position, o.g_palmBuffer)
	var palmLength = 2.0;
	g_modelMatrix.translate(0.0, arm2Length, 0.0);
	g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);
	drawSegment(gl, normalProgram, o, viewProjMatrix, g_modelMatrix)
	//绘制fingers
	initAttributeVariable(gl, normalProgram.a_Position, o.g_fingerBuffer)
	g_modelMatrix.translate(0.0, palmLength, 0.0);
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(1.0, 0.0, 0.0);
	g_modelMatrix.rotate(g_joint3Angle, 0.0, 0.0, 1.0);
	drawSegment(gl, normalProgram, o, viewProjMatrix, g_modelMatrix)
	g_modelMatrix = popMatrix();

	g_modelMatrix.translate(-1.0, 0.0, 0.0);
	g_modelMatrix.rotate(-g_joint3Angle, 0.0, 0.0, 1.0);
	drawSegment(gl, normalProgram, o, viewProjMatrix, g_modelMatrix)



}

function drawPlane(gl, program, plane,currentAngle, texture,viewProjMatrix, g_modelMatrix) {
	// Set rotate angle to model matrix and draw plane


	g_modelMatrix.setTranslate(-5.0, -5.0, -15.0)
	g_modelMatrix.rotate(currentAngle, 0.0, 1.0, 0.0)
	g_modelMatrix.scale(10.0, 10.0, 10.0)

	drawp(gl, program, plane,texture ,viewProjMatrix, g_modelMatrix);
}

function drawp(gl, program, o,texture, viewProjMatrix, g_modelMatrix) {
	initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
	initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);
	if (program.a_Color != undefined) // If a_Color is defined to attribute
		initAttributeVariable(gl, program.a_Color, o.colorBuffer);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	// Calculate the model view project matrix and pass it to u_MvpMatrix
	g_mvpMatrix.set(viewProjMatrix);
	g_mvpMatrix.multiply(g_modelMatrix);
	gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

	gl.drawElements(gl.TRIANGLES, o.numIndices, gl.UNSIGNED_BYTE, 0);
}


//保存原矩阵
var g_matrixStack = [];

function pushMatrix(m) {
	var m2 = new Matrix4(m)
	g_matrixStack.push(m2)
}
//弹出矩阵
function popMatrix() {
	return g_matrixStack.pop();
}

let g_normalMatrix = new Matrix4();
let g_mvpMatrix = new Matrix4();

function drawSegment(gl, normalProgram, o, viewProjMatrix, g_modelMatrix) {
	
	gl.uniformMatrix4fv(normalProgram.u_ModelMatrix, false, g_modelMatrix.elements)

	g_mvpMatrix.set(viewProjMatrix)
	g_mvpMatrix.multiply(g_modelMatrix);
	//鼠标旋转
	// g_mvpMatrix.rotate(currentAngle[0],1.0,0.0,0.0);
	// g_mvpMatrix.rotate(currentAngle[1],0.0,1.0,1.0);
	gl.uniformMatrix4fv(normalProgram.u_MvpMatrix, false, g_mvpMatrix.elements)
	g_normalMatrix.setInverseOf(g_modelMatrix);
	g_normalMatrix.transpose();
	gl.uniformMatrix4fv(normalProgram.u_NormalMatrix, false, g_normalMatrix.elements);

	gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);

}



function initFramebufferObject(gl) {
	var framebuffer, texture, depthBuffer;

	// Define the error handling function
	var error = function() {
		if (framebuffer) gl.deleteFramebuffer(framebuffer);
		if (texture) gl.deleteTexture(texture);
		if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
		return null;
	}

	// Create a framebuffer object (FBO)
	framebuffer = gl.createFramebuffer();
	if (!framebuffer) {
		console.log('Failed to create frame buffer object');
		return error();
	}

	// Create a texture object and set its size and parameters
	texture = gl.createTexture(); // Create a texture object
	if (!texture) {
		console.log('Failed to create texture object');
		return error();
	}
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	// Create a renderbuffer object and Set its size and parameters
	depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
	if (!depthBuffer) {
		console.log('Failed to create renderbuffer object');
		return error();
	}
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

	// Attach the texture and the renderbuffer object to the FBO
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

	// Check if FBO is configured correctly
	var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (gl.FRAMEBUFFER_COMPLETE !== e) {
		console.log('Frame buffer object is incomplete: ' + e.toString());
		return error();
	}

	framebuffer.texture = texture; // keep the required object

	// Unbind the buffer object
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	return framebuffer;
}
function initTextures(gl, program) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return null;
  }

  var image = new Image();  // Create a image object
  if (!image) {
    console.log('Failed to create the image object');
    return null;
  }
  // Register the event handler to be called when image loading is completed
  image.onload = function() {
    // Write the image data to texture object
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Pass the texure unit 0 to u_Sampler
    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, 0);

    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
  };

  // Tell the browser to load an Image
  image.src = '../img/Brick wall.jpg';

  return texture;
}
var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)

var last = Date.now(); // Last time that this function was called
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}