///<reference path='./typings/tsd.d.ts'/>
///<reference path="./localTypings/webglutils.d.ts"/>

/*
 * Portions of this code are
 * Copyright 2015, Blair MacIntyre.
 *
 * Portions of this code taken from http://webglfundamentals.org, at https://github.com/greggman/webgl-fundamentals
 * and are subject to the following license.  In particular, from
 *    http://webglfundamentals.org/webgl/webgl-less-code-more-fun.html
 *    http://webglfundamentals.org/webgl/resources/primitives.js
 *
 * Those portions Copyright 2014, Gregg Tavares.
 * All rights reserved.
 */

import loader = require('./loader');

////////////////////////////////////////////////////////////////////////////////////////////
// stats module by mrdoob (https://github.com/mrdoob/stats.js) to show the performance
// of your graphics
var stats = new Stats();
stats.setMode( 1 ); // 0: fps, 1: ms, 2: mb

stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

////////////////////////////////////////////////////////////////////////////////////////////
// utilities
var rand = function(min: number, max?: number) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

var randInt = function(range) {
  return Math.floor(Math.random() * range);
};

////////////////////////////////////////////////////////////////////////////////////////////
// get some of our canvas elements that we need
var canvas = <HTMLCanvasElement>document.getElementById("webgl");

var effect = 0;
var ischanged = 0;

window["onEffect1"] = () => {
    console.log("install effect1!");

  //////////////
  ///////// YOUR CODE HERE TO cause the program to use your first shader effect
  ///////// (you can probably just use some sort of global variable to indicate which effect)
  //////////////
  effect = 1;
}

window["onEffect2"] = () => {
    console.log("install effect2!");

  //////////////
  ///////// YOUR CODE HERE TO cause the program to use your second shader effect
  ///////// (you can probably just use some sort of global variable to indicate which effect)
  //////////////
  effect = 2;
}

window["onEffect3"] = () => {
    console.log("install effect3!");

  //////////////
  ///////// YOUR CODE HERE TO cause the program to use your third shader effect
  ///////// (you can probably just use some sort of global variable to indicate which effect)
  //////////////
  effect = 3;
  ischanged = 1;

}

window["onEffect4"] = () => {
    console.log("install effect4!");

  //////////////
  ///////// YOUR CODE HERE TO cause the program to use your fourth shader effect
  ///////// (you can probably just use some sort of global variable to indicate which effect)
  //////////////
  effect = 4;
}

////////////////////////////////////////////////////////////////////////////////////////////
// some simple interaction using the mouse.
// we are going to get small motion offsets of the mouse, and use these to rotate the object
//
// our offset() function from assignment 0, to give us a good mouse position in the canvas
function offset(e: MouseEvent): GLM.IArray {
    e = e || <MouseEvent> window.event;

    var target = <Element> e.target || e.srcElement,
        rect = target.getBoundingClientRect(),
        offsetX = e.clientX - rect.left,
        offsetY = e.clientY - rect.top;

    return vec2.fromValues(offsetX, offsetY);
}

var mouseStart = undefined;  // previous mouse position
var mouseDelta = undefined;  // the amount the mouse has moved
var mouseAngles = vec2.create();  // angle offset corresponding to mouse movement

// start things off with a down press
canvas.onmousedown = (ev: MouseEvent) => {
    mouseStart = offset(ev);
    mouseDelta = vec2.create();  // initialize to 0,0
    vec2.set(mouseAngles, 0, 0);
}

// stop things with a mouse release
canvas.onmouseup = (ev: MouseEvent) => {
    if (mouseStart != undefined) {
        const clickEnd = offset(ev);
        vec2.sub(mouseDelta, clickEnd, mouseStart);        // delta = end - start
        vec2.scale(mouseAngles, mouseDelta, 10/canvas.height);

        // now toss the two values since the mouse is up
        mouseDelta = undefined;
        mouseStart = undefined;
    }
}

// if we're moving and the mouse is down
canvas.onmousemove = (ev: MouseEvent) => {
    if (mouseStart != undefined) {
      const m = offset(ev);
      vec2.sub(mouseDelta, m, mouseStart);    // delta = mouse - start
      vec2.copy(mouseStart, m);               // start becomes current position
      vec2.scale(mouseAngles, mouseDelta, 10/canvas.height);

      // console.log("mousemove mouseAngles: " + mouseAngles[0] + ", " + mouseAngles[1]);
      // console.log("mousemove mouseDelta: " + mouseDelta[0] + ", " + mouseDelta[1]);
      // console.log("mousemove mouseStart: " + mouseStart[0] + ", " + mouseStart[1]);
   }
}

// stop things if you move out of the window
canvas.onmouseout = (ev: MouseEvent) => {
    if (mouseStart != undefined) {
      vec2.set(mouseAngles, 0, 0);
      mouseDelta = undefined;
      mouseStart = undefined;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// start things off by calling initWebGL
initWebGL();
var programs_arr = [];
function initWebGL() {
  // get the rendering context for webGL
  var gl: WebGLRenderingContext = getWebGLContext(canvas);
  if (!gl) {
    return;  // no webgl!  Bye bye
  }

  // turn on backface culling and zbuffering
  //gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // attempt to download and set up our GLSL shaders.  When they download, processed to the next step
  // of our program, the "main" routing
  //
  // YOU SHOULD MODIFY THIS TO DOWNLOAD ALL YOUR SHADERS and set up all four SHADER PROGRAMS,
  // THEN PASS AN ARRAY OF PROGRAMS TO main().  You'll have to do other things in main to deal
  // with multiple shaders and switch between them

  loader.loadFiles(['shaders/a3-shader.vert', 'shaders/a4-mandelbrot.frag','shaders/a3-shader.vert', 'shaders/a4-swiss.frag', 'shaders/a3-shader.vert', 'shaders/a4-green.frag', 'shaders/a4-warble.vert', 'shaders/a3-shader.frag', 'shaders/a3-shader.vert', 'shaders/a3-shader.frag'], function (shaderText) {

    var program0_arr = [];
    program0_arr[0] = shaderText[8];
    program0_arr[1] = shaderText[9];

    var program1_arr = [];
    program1_arr[0] = shaderText[0];
    program1_arr[1] = shaderText[1];

    var program2_arr = [];
    program2_arr[0] = shaderText[2];
    program2_arr[1] = shaderText[3];

    var program3_arr = [];
    program3_arr[0] = shaderText[4];
    program3_arr[1] = shaderText[5];

    var program4_arr = [];
    program4_arr[0] = shaderText[6];
    program4_arr[1] = shaderText[7];

    var program0 = createProgramFromSources(gl, program0_arr);
    var program1 = createProgramFromSources(gl, program1_arr);
    var program2 = createProgramFromSources(gl, program2_arr);
    var program3 = createProgramFromSources(gl, program3_arr);
    var program4 = createProgramFromSources(gl, program4_arr);

    programs_arr = [program0, program1, program2, program3, program4];

    main(gl, programs_arr);

  }, function (url) {
      alert('Shader failed to download "' + url + '"');
  });
}

////////////////////////////////////////////////////////////////////////////////////////////
// webGL is set up, and our Shader program has been created.  Finish setting up our webGL application
function main(gl: WebGLRenderingContext, program: WebGLProgram[]) {

  // use the webgl-utils library to create setters for all the uniforms and attributes in our shaders.
  // It enumerates all of the uniforms and attributes in the program, and creates utility functions to
  // allow "setUniforms" and "setAttributes" (below) to set the shader variables from a javascript object.
  // The objects have a key for each uniform or attribute, and a value containing the parameters for the
  // setter function
  var uniformSetters = createUniformSetters(gl, program[effect]);
  var attribSetters  = createAttributeSetters(gl, program[effect]);


  // Blair noted we are allowed to use code on https://raw.githubusercontent.com/mrdoob/three.js/master/src/extras/geometries/PlaneBufferGeometry.js
  var width = 10;
  var height = 10;
  var widthSegments = 100;
  var heightSegments = 100;
  var width_half = width / 2;
	var height_half = height / 2;

	var gridX = Math.floor( widthSegments ) || 1;
	var gridY = Math.floor( heightSegments ) || 1;

	var gridX1 = gridX + 1;
	var gridY1 = gridY + 1;

	var segment_width = width / gridX;
	var segment_height = height / gridY;

	var vertices = new Float32Array( gridX1 * gridY1 * 3 );
	var normals = new Float32Array( gridX1 * gridY1 * 3 );
	var textCoords = new Float32Array( gridX1 * gridY1 * 2 );

	var offset = 0;
	var offset2 = 0;

	for ( var iy = 0; iy < gridY1; iy ++ ) {

		var y = iy * segment_height - height_half;

		for ( var ix = 0; ix < gridX1; ix ++ ) {

			var x = ix * segment_width - width_half;

			vertices[ offset ] = x;
			vertices[ offset + 1 ] = - y;

			normals[ offset + 2 ] = 1;

			textCoords[ offset2 ] = ix / gridX;
			textCoords[ offset2 + 1 ] = 1 - ( iy / gridY );

			offset += 3;
			offset2 += 2;

		}

	}

	offset = 0;

	var indices = new ( ( vertices.length / 3 ) > 65535 ? Uint32Array : Uint16Array )( gridX * gridY * 6 );

	for ( var iy = 0; iy < gridY; iy ++ ) {

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var a = ix + gridX1 * iy;
			var b = ix + gridX1 * ( iy + 1 );
			var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
			var d = ( ix + 1 ) + gridX1 * iy;

			indices[ offset ] = a;
			indices[ offset + 1 ] = b;
			indices[ offset + 2 ] = d;

			indices[ offset + 3 ] = b;
			indices[ offset + 4 ] = c;
			indices[ offset + 5 ] = d;

			offset += 6;

		}

	}

  // an indexed quad
  var arrays = {
     position: { numComponents: 3, data: vertices,},
     texcoord: { numComponents: 2, data: textCoords,},
     normal:   { numComponents: 3, data: normals,},
     indices:  { numComponents: 3, data: indices,},
  };


  var center = [0,0,0];
  var scaleFactor = 20;


  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var cameraAngleRadians = degToRad(0);
  var fieldOfViewRadians = degToRad(60);
  var cameraHeight = 50;

  var uniformsThatAreTheSameForAllObjects = {
    u_lightWorldPos:         [50, 30, -100],
    u_viewInverse:           mat4.create(),
    u_lightColor:            [1, 1, 1, 1],
    u_ambient:               [0.1, 0.1, 0.1, 0.1]
  };

  var uniformsThatAreComputedForEachObject = {
    u_worldViewProjection:   mat4.create(),
    u_world:                 mat4.create(),
    u_worldInverseTranspose: mat4.create(),
  };

  // var texture = .... create a texture of some form

  var baseColor = rand(240);
  var objectState = {
      materialUniforms: {
        u_colorMult:             chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
        //u_diffuse:               texture,
        u_specular:              [1, 1, 1, 1],
        u_shininess:             450,
        u_specularFactor:        0.75,
        u_time: 0.0,
      }
  };

  var textures_arr = [];

  var green_screen = new Image();
  green_screen.src = "resources/ewan.jpg";
  green_screen.onload = function(){
    render_green(green_screen);
  }

  var background_image = new Image();
  background_image.src = "resources/background.jpg";
  background_image.onload = function(){
    render_background(background_image);
  }

  var render_green = function(green: HTMLImageElement){

    // returns the location of an attribute variable
    var texCoordLocation = gl.getAttribLocation(program[effect], "a_texcoord");

    // bind buffer with texture coordinates
    var texCoordBuffer = gl.createBuffer();

    // create green screen texture and bind it
    var texture_green = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_green);

    // set texture parameters to handle variable size images
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // allows elements of an image array to be read by shaders
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, green);


    textures_arr.push(texture_green);
  }

  var render_background = function (background: HTMLImageElement) {

    // returns the location of an attribute variable
    var texCoordLocation = gl.getAttribLocation(program[effect], "a_texcoord");

    // bind buffer with texture coordinates
    var texCoordBuffer = gl.createBuffer();

    // create background texture and bind it
    var texture_background = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_background);

    // set texture parameters to handle variable size images
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // allows elements of an image array to be read by shaders
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, background);
    textures_arr.push(texture_background);
  }


  // some variables we'll reuse below
  var projectionMatrix = mat4.create();
  var viewMatrix = mat4.create();
  var rotationMatrix = mat4.create();
  var matrix = mat4.create();  // a scratch matrix
  var invMatrix = mat4.create();
  var axisVector = vec3.create();



  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time: number) {
    time *= 0.001;

    objectState.materialUniforms.u_time = time;

    // measure time taken for the little stats meter
    stats.begin();

    // if the window changed size, reset the WebGL canvas size to match.  The displayed size of the canvas
    // (determined by window size, layout, and your CSS) is separate from the size of the WebGL render buffers,
    // which you can control by setting canvas.width and canvas.height
    resizeCanvasToDisplaySize(canvas);

    // Set the viewport to match the canvas
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(projectionMatrix,fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, -200];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = mat4.lookAt(uniformsThatAreTheSameForAllObjects.u_viewInverse, cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    mat4.invert(viewMatrix, cameraMatrix);

    uniformSetters = createUniformSetters(gl, program[effect]);
    attribSetters  = createAttributeSetters(gl, program[effect]);

    // tell WebGL to use our shader program (will need to change this)
    gl.useProgram(program[effect]);

    if(effect == 3 && ischanged){
      ischanged = 0;
      // returns an integer that represents the location of a specific uniform variable within a program object
      var u_image0_location = gl.getUniformLocation(programs_arr[effect], "u_image0");
      var u_image1_location = gl.getUniformLocation(programs_arr[effect], "u_image1");

      // assigns an integer value to a uniform variable for the current program object
      gl.uniform1i(u_image0_location, 0);
      gl.uniform1i(u_image1_location, 1);

      // specifies which texture unit to make active
      gl.activeTexture(gl.TEXTURE0);

      // bind a named texture to a texturing target
      gl.bindTexture(gl.TEXTURE_2D, textures_arr[0]);

      // specifies which texture unit to make active
      gl.activeTexture(gl.TEXTURE1);

      // bind a named texture to a texturing target
      gl.bindTexture(gl.TEXTURE_2D, textures_arr[1]);

    }

    // Setup all the needed attributes and buffers.
    // if(effect == 3){
    //   arrays.texcoord.data = [1, 1, 0, 1, 1, 0, 0, 0];
    // }else{
    //   arrays.texcoord.data = [0, 0, 1, 0, 0, 1, 1, 1];
    // }
    var bufferInfo = createBufferInfoFromArrays(gl, arrays);
    setBuffersAndAttributes(gl, attribSetters, bufferInfo);

    // Set the uniforms that are the same for all objects.  Unlike the attributes, each uniform setter
    // is different, depending on the type of the uniform variable.  Look in webgl-util.js for the
    // implementation of  setUniforms to see the details for specific types
    setUniforms(uniformSetters, uniformsThatAreTheSameForAllObjects);

    ///////////////////////////////////////////////////////
    // Compute the view matrix and corresponding other matrices for rendering.

    // first make a copy of our rotationMatrix
    mat4.copy(matrix, rotationMatrix);

    // adjust the rotation based on mouse activity.  mouseAngles is set if user is dragging
    if (mouseAngles[0] !== 0 || mouseAngles[1] !== 0) {
      /*
       * only rotate around Y, use the second mouse value for scale.  Leaving the old code from A3
       * here, commented out
       *
      // need an inverse world transform so we can find out what the world X axis for our first rotation is
      mat4.invert(invMatrix, matrix);
      // get the world X axis
      var xAxis = vec3.transformMat4(axisVector, vec3.fromValues(1,0,0), invMatrix);

      // rotate about the world X axis (the X parallel to the screen!)
      mat4.rotate(matrix, matrix, -mouseAngles[1], xAxis);
      */

      // now get the inverse world transform so we can find the world Y axis
      mat4.invert(invMatrix, matrix);
      // get the world Y axis
      var yAxis = vec3.transformMat4(axisVector, vec3.fromValues(0,1,0), invMatrix);

      // rotate about teh world Y axis
      mat4.rotate(matrix, matrix, mouseAngles[0], yAxis);

      // save the resulting matrix back to the cumulative rotation matrix
      mat4.copy(rotationMatrix, matrix);

      // use mouseAngles[1] to scale
      scaleFactor += mouseAngles[1];

      vec2.set(mouseAngles, 0, 0);
    }

    // add a translate and scale to the object World xform, so we have:  R * T * S
    mat4.translate(matrix, rotationMatrix, [-center[0]*scaleFactor, -center[1]*scaleFactor,
                                            -center[2]*scaleFactor]);
    mat4.scale(matrix, matrix, [scaleFactor, scaleFactor, scaleFactor]);
    mat4.copy(uniformsThatAreComputedForEachObject.u_world, matrix);

    // get proj * view * world
    mat4.multiply(matrix, viewMatrix, uniformsThatAreComputedForEachObject.u_world);
    mat4.multiply(uniformsThatAreComputedForEachObject.u_worldViewProjection, projectionMatrix, matrix);

    // get worldInvTranspose.  For an explaination of why we need this, for fixing the normals, see
    // http://www.unknownroad.com/rtfm/graphics/rt_normals.html
    mat4.transpose(uniformsThatAreComputedForEachObject.u_worldInverseTranspose,
                   mat4.invert(matrix, uniformsThatAreComputedForEachObject.u_world));

    // Set the uniforms we just computed
    setUniforms(uniformSetters, uniformsThatAreComputedForEachObject);

    // Set the uniforms that are specific to the this object.
    setUniforms(uniformSetters, objectState.materialUniforms);

    // Draw the geometry.   Everything is keyed to the ""
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    // stats meter
    stats.end();

    requestAnimationFrame(drawScene);
  }
}
