///<reference path='./typings/tsd.d.ts'/>
///<reference path="./localTypings/webglutils.d.ts"/>
define(["require", "exports", './loader'], function (require, exports, loader) {
    ////////////////////////////////////////////////////////////////////////////////////////////
    // stats module by mrdoob (https://github.com/mrdoob/stats.js) to show the performance
    // of your graphics
    var stats = new Stats();
    stats.setMode(1); // 0: fps, 1: ms, 2: mb
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    ////////////////////////////////////////////////////////////////////////////////////////////
    // utilities
    var rand = function (min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    };
    var randInt = function (range) {
        return Math.floor(Math.random() * range);
    };
    ////////////////////////////////////////////////////////////////////////////////////////////
    // get some of our canvas elements that we need
    var canvas = document.getElementById("webgl");
    var effect = 0;
    var ischanged = 0;
    window["onEffect1"] = function () {
        console.log("install effect1!");
        //////////////
        ///////// YOUR CODE HERE TO cause the program to use your first shader effect
        ///////// (you can probably just use some sort of global variable to indicate which effect)
        //////////////
        effect = 1;
    };
    window["onEffect2"] = function () {
        console.log("install effect2!");
        //////////////
        ///////// YOUR CODE HERE TO cause the program to use your second shader effect
        ///////// (you can probably just use some sort of global variable to indicate which effect)
        //////////////
        effect = 2;
    };
    window["onEffect3"] = function () {
        console.log("install effect3!");
        //////////////
        ///////// YOUR CODE HERE TO cause the program to use your third shader effect
        ///////// (you can probably just use some sort of global variable to indicate which effect)
        //////////////
        effect = 3;
        ischanged = 1;
    };
    window["onEffect4"] = function () {
        console.log("install effect4!");
        //////////////
        ///////// YOUR CODE HERE TO cause the program to use your fourth shader effect
        ///////// (you can probably just use some sort of global variable to indicate which effect)
        //////////////
        effect = 4;
    };
    ////////////////////////////////////////////////////////////////////////////////////////////
    // some simple interaction using the mouse.
    // we are going to get small motion offsets of the mouse, and use these to rotate the object
    //
    // our offset() function from assignment 0, to give us a good mouse position in the canvas
    function offset(e) {
        e = e || window.event;
        var target = e.target || e.srcElement, rect = target.getBoundingClientRect(), offsetX = e.clientX - rect.left, offsetY = e.clientY - rect.top;
        return vec2.fromValues(offsetX, offsetY);
    }
    var mouseStart = undefined; // previous mouse position
    var mouseDelta = undefined; // the amount the mouse has moved
    var mouseAngles = vec2.create(); // angle offset corresponding to mouse movement
    // start things off with a down press
    canvas.onmousedown = function (ev) {
        mouseStart = offset(ev);
        mouseDelta = vec2.create(); // initialize to 0,0
        vec2.set(mouseAngles, 0, 0);
    };
    // stop things with a mouse release
    canvas.onmouseup = function (ev) {
        if (mouseStart != undefined) {
            var clickEnd = offset(ev);
            vec2.sub(mouseDelta, clickEnd, mouseStart); // delta = end - start
            vec2.scale(mouseAngles, mouseDelta, 10 / canvas.height);
            // now toss the two values since the mouse is up
            mouseDelta = undefined;
            mouseStart = undefined;
        }
    };
    // if we're moving and the mouse is down
    canvas.onmousemove = function (ev) {
        if (mouseStart != undefined) {
            var m = offset(ev);
            vec2.sub(mouseDelta, m, mouseStart); // delta = mouse - start
            vec2.copy(mouseStart, m); // start becomes current position
            vec2.scale(mouseAngles, mouseDelta, 10 / canvas.height);
        }
    };
    // stop things if you move out of the window
    canvas.onmouseout = function (ev) {
        if (mouseStart != undefined) {
            vec2.set(mouseAngles, 0, 0);
            mouseDelta = undefined;
            mouseStart = undefined;
        }
    };
    ////////////////////////////////////////////////////////////////////////////////////////////
    // start things off by calling initWebGL
    initWebGL();
    var programs_arr = [];
    function initWebGL() {
        // get the rendering context for webGL
        var gl = getWebGLContext(canvas);
        if (!gl) {
            return; // no webgl!  Bye bye
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
        loader.loadFiles(['shaders/a3-shader.vert', 'shaders/a4-mandelbrot.frag', 'shaders/a3-shader.vert', 'shaders/a4-swiss.frag', 'shaders/a3-shader.vert', 'shaders/a4-green.frag', 'shaders/a4-warble.vert', 'shaders/a3-shader.frag', 'shaders/a3-shader.vert', 'shaders/a3-shader.frag'], function (shaderText) {
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
    function main(gl, program) {
        // use the webgl-utils library to create setters for all the uniforms and attributes in our shaders.
        // It enumerates all of the uniforms and attributes in the program, and creates utility functions to
        // allow "setUniforms" and "setAttributes" (below) to set the shader variables from a javascript object.
        // The objects have a key for each uniform or attribute, and a value containing the parameters for the
        // setter function
        var uniformSetters = createUniformSetters(gl, program[effect]);
        var attribSetters = createAttributeSetters(gl, program[effect]);
        // Blair noted we are allowed to use code on https://raw.githubusercontent.com/mrdoob/three.js/master/src/extras/geometries/PlaneBufferGeometry.js
        var width = 10;
        var height = 10;
        var widthSegments = 100;
        var heightSegments = 100;
        var width_half = width / 2;
        var height_half = height / 2;
        var gridX = Math.floor(widthSegments) || 1;
        var gridY = Math.floor(heightSegments) || 1;
        var gridX1 = gridX + 1;
        var gridY1 = gridY + 1;
        var segment_width = width / gridX;
        var segment_height = height / gridY;
        var vertices = new Float32Array(gridX1 * gridY1 * 3);
        var normals = new Float32Array(gridX1 * gridY1 * 3);
        var textCoords = new Float32Array(gridX1 * gridY1 * 2);
        var offset = 0;
        var offset2 = 0;
        for (var iy = 0; iy < gridY1; iy++) {
            var y = iy * segment_height - height_half;
            for (var ix = 0; ix < gridX1; ix++) {
                var x = ix * segment_width - width_half;
                vertices[offset] = x;
                vertices[offset + 1] = -y;
                normals[offset + 2] = 1;
                textCoords[offset2] = ix / gridX;
                textCoords[offset2 + 1] = 1 - (iy / gridY);
                offset += 3;
                offset2 += 2;
            }
        }
        offset = 0;
        var indices = new ((vertices.length / 3) > 65535 ? Uint32Array : Uint16Array)(gridX * gridY * 6);
        for (var iy = 0; iy < gridY; iy++) {
            for (var ix = 0; ix < gridX; ix++) {
                var a = ix + gridX1 * iy;
                var b = ix + gridX1 * (iy + 1);
                var c = (ix + 1) + gridX1 * (iy + 1);
                var d = (ix + 1) + gridX1 * iy;
                indices[offset] = a;
                indices[offset + 1] = b;
                indices[offset + 2] = d;
                indices[offset + 3] = b;
                indices[offset + 4] = c;
                indices[offset + 5] = d;
                offset += 6;
            }
        }
        // an indexed quad
        var arrays = {
            position: { numComponents: 3, data: vertices, },
            texcoord: { numComponents: 2, data: textCoords, },
            normal: { numComponents: 3, data: normals, },
            indices: { numComponents: 3, data: indices, },
        };
        var center = [0, 0, 0];
        var scaleFactor = 20;
        function degToRad(d) {
            return d * Math.PI / 180;
        }
        var cameraAngleRadians = degToRad(0);
        var fieldOfViewRadians = degToRad(60);
        var cameraHeight = 50;
        var uniformsThatAreTheSameForAllObjects = {
            u_lightWorldPos: [50, 30, -100],
            u_viewInverse: mat4.create(),
            u_lightColor: [1, 1, 1, 1],
            u_ambient: [0.1, 0.1, 0.1, 0.1]
        };
        var uniformsThatAreComputedForEachObject = {
            u_worldViewProjection: mat4.create(),
            u_world: mat4.create(),
            u_worldInverseTranspose: mat4.create(),
        };
        // var texture = .... create a texture of some form
        var baseColor = rand(240);
        var objectState = {
            materialUniforms: {
                u_colorMult: chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
                //u_diffuse:               texture,
                u_specular: [1, 1, 1, 1],
                u_shininess: 450,
                u_specularFactor: 0.75,
                u_time: 0.0,
            }
        };
        var textures_arr = [];
        var green_screen = new Image();
        green_screen.src = "resources/ewan.jpg";
        green_screen.onload = function () {
            render_green(green_screen);
        };
        var background_image = new Image();
        background_image.src = "resources/background.jpg";
        background_image.onload = function () {
            render_background(background_image);
        };
        var render_green = function (green) {
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
        };
        var render_background = function (background) {
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
        };
        // some variables we'll reuse below
        var projectionMatrix = mat4.create();
        var viewMatrix = mat4.create();
        var rotationMatrix = mat4.create();
        var matrix = mat4.create(); // a scratch matrix
        var invMatrix = mat4.create();
        var axisVector = vec3.create();
        requestAnimationFrame(drawScene);
        // Draw the scene.
        function drawScene(time) {
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
            mat4.perspective(projectionMatrix, fieldOfViewRadians, aspect, 1, 2000);
            // Compute the camera's matrix using look at.
            var cameraPosition = [0, 0, -200];
            var target = [0, 0, 0];
            var up = [0, 1, 0];
            var cameraMatrix = mat4.lookAt(uniformsThatAreTheSameForAllObjects.u_viewInverse, cameraPosition, target, up);
            // Make a view matrix from the camera matrix.
            mat4.invert(viewMatrix, cameraMatrix);
            uniformSetters = createUniformSetters(gl, program[effect]);
            attribSetters = createAttributeSetters(gl, program[effect]);
            // tell WebGL to use our shader program (will need to change this)
            gl.useProgram(program[effect]);
            if (effect == 3 && ischanged) {
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
                var yAxis = vec3.transformMat4(axisVector, vec3.fromValues(0, 1, 0), invMatrix);
                // rotate about teh world Y axis
                mat4.rotate(matrix, matrix, mouseAngles[0], yAxis);
                // save the resulting matrix back to the cumulative rotation matrix
                mat4.copy(rotationMatrix, matrix);
                // use mouseAngles[1] to scale
                scaleFactor += mouseAngles[1];
                vec2.set(mouseAngles, 0, 0);
            }
            // add a translate and scale to the object World xform, so we have:  R * T * S
            mat4.translate(matrix, rotationMatrix, [-center[0] * scaleFactor, -center[1] * scaleFactor,
                -center[2] * scaleFactor]);
            mat4.scale(matrix, matrix, [scaleFactor, scaleFactor, scaleFactor]);
            mat4.copy(uniformsThatAreComputedForEachObject.u_world, matrix);
            // get proj * view * world
            mat4.multiply(matrix, viewMatrix, uniformsThatAreComputedForEachObject.u_world);
            mat4.multiply(uniformsThatAreComputedForEachObject.u_worldViewProjection, projectionMatrix, matrix);
            // get worldInvTranspose.  For an explaination of why we need this, for fixing the normals, see
            // http://www.unknownroad.com/rtfm/graphics/rt_normals.html
            mat4.transpose(uniformsThatAreComputedForEachObject.u_worldInverseTranspose, mat4.invert(matrix, uniformsThatAreComputedForEachObject.u_world));
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
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImE0LnRzIl0sIm5hbWVzIjpbIm9mZnNldCIsImluaXRXZWJHTCIsIm1haW4iLCJtYWluLmRlZ1RvUmFkIiwibWFpbi5kcmF3U2NlbmUiXSwibWFwcGluZ3MiOiJBQUFBLHlDQUF5QztBQUN6QyxxREFBcUQ7O0lBaUJyRCw0RkFBNEY7SUFDNUYsc0ZBQXNGO0lBQ3RGLG1CQUFtQjtJQUNuQixJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyx1QkFBdUI7SUFFM0MsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUM3QyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7SUFFbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBRSxDQUFDO0lBRTlDLDRGQUE0RjtJQUM1RixZQUFZO0lBQ1osSUFBSSxJQUFJLEdBQUcsVUFBUyxHQUFXLEVBQUUsR0FBWTtRQUMzQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0QixHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNWLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUM7SUFFRixJQUFJLE9BQU8sR0FBRyxVQUFTLEtBQUs7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQztJ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R0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFFcENBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLFlBQVlBLENBQUVBLE1BQU1BLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLENBQUVBLENBQUNBO1FBQ3ZEQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxZQUFZQSxDQUFFQSxNQUFNQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFFQSxDQUFDQTtRQUN0REEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsWUFBWUEsQ0FBRUEsTUFBTUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7UUFFekRBLElBQUlBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1FBQ2ZBLElBQUlBLE9BQU9BLEdBQUdBLENBQUNBLENBQUNBO1FBRWhCQSxHQUFHQSxDQUFDQSxDQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxHQUFHQSxNQUFNQSxFQUFFQSxFQUFFQSxFQUFHQSxFQUFHQSxDQUFDQTtZQUV2Q0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsY0FBY0EsR0FBR0EsV0FBV0EsQ0FBQ0E7WUFFMUNBLEdBQUdBLENBQUNBLENBQUVBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLE1BQU1BLEVBQUVBLEVBQUVBLEVBQUdBLEVBQUdBLENBQUNBO2dCQUV2Q0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsYUFBYUEsR0FBR0EsVUFBVUEsQ0FBQ0E7Z0JBRXhDQSxRQUFRQSxDQUFFQSxNQUFNQSxDQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDdkJBLFFBQVFBLENBQUVBLE1BQU1BLEdBQUdBLENBQUNBLENBQUVBLEdBQUdBLENBQUVBLENBQUNBLENBQUNBO2dCQUU3QkEsT0FBT0EsQ0FBRUEsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBRTFCQSxVQUFVQSxDQUFFQSxPQUFPQSxDQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxLQUFLQSxDQUFDQTtnQkFDbkNBLFVBQVVBLENBQUVBLE9BQU9BLEdBQUdBLENBQUNBLENBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUVBLEVBQUVBLEdBQUdBLEtBQUtBLENBQUVBLENBQUNBO2dCQUUvQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ1pBLE9BQU9BLElBQUlBLENBQUNBLENBQUNBO1lBRWRBLENBQUNBO1FBRUZBLENBQUNBO1FBRURBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1FBRVhBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUVBLENBQUVBLFFBQVFBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUVBLEdBQUdBLEtBQUtBLEdBQUdBLFdBQVdBLEdBQUdBLFdBQVdBLENBQUVBLENBQUVBLEtBQUtBLEdBQUdBLEtBQUtBLEdBQUdBLENBQUNBLENBQUVBLENBQUNBO1FBRXZHQSxHQUFHQSxDQUFDQSxDQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxHQUFHQSxLQUFLQSxFQUFFQSxFQUFFQSxFQUFHQSxFQUFHQSxDQUFDQTtZQUV0Q0EsR0FBR0EsQ0FBQ0EsQ0FBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsR0FBR0EsS0FBS0EsRUFBRUEsRUFBRUEsRUFBR0EsRUFBR0EsQ0FBQ0E7Z0JBRXRDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDekJBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUVBLEVBQUVBLEdBQUdBLENBQUNBLENBQUVBLENBQUNBO2dCQUNqQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7Z0JB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MURBLHFEQUFxREE7WUFDckRBLEVBQUVBLENBQUNBLFlBQVlBLENBQUNBLEVBQUVBLENBQUNBLFNBQVNBLEVBQUVBLFVBQVVBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLENBQUNBLGNBQWNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBRTVFQSxjQUFjQTtZQUNkQSxLQUFLQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUVaQSxxQkFBcUJBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ25DQSxDQUFDQTtJQUNIRixDQUFDQSIsImZpbGUiOiJhNC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD0nLi90eXBpbmdzL3RzZC5kLnRzJy8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuL2xvY2FsVHlwaW5ncy93ZWJnbHV0aWxzLmQudHNcIi8+XG5cbi8qXG4gKiBQb3J0aW9ucyBvZiB0aGlzIGNvZGUgYXJlXG4gKiBDb3B5cmlnaHQgMjAxNSwgQmxhaXIgTWFjSW50eXJlLlxuICpcbiAqIFBvcnRpb25zIG9mIHRoaXMgY29kZSB0YWtlbiBmcm9tIGh0dHA6Ly93ZWJnbGZ1bmRhbWVudGFscy5vcmcsIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi93ZWJnbC1mdW5kYW1lbnRhbHNcbiAqIGFuZCBhcmUgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGxpY2Vuc2UuICBJbiBwYXJ0aWN1bGFyLCBmcm9tXG4gKiAgICBodHRwOi8vd2ViZ2xmdW5kYW1lbnRhbHMub3JnL3dlYmdsL3dlYmdsLWxlc3MtY29kZS1tb3JlLWZ1bi5odG1sXG4gKiAgICBodHRwOi8vd2ViZ2xmdW5kYW1lbnRhbHMub3JnL3dlYmdsL3Jlc291cmNlcy9wcmltaXRpdmVzLmpzXG4gKlxuICogVGhvc2UgcG9ydGlvbnMgQ29weXJpZ2h0IDIwMTQsIEdyZWdnIFRhdmFyZXMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICovXG5cbmltcG9ydCBsb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlcicpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gc3RhdHMgbW9kdWxlIGJ5IG1yZG9vYiAoaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi9zdGF0cy5qcykgdG8gc2hvdyB0aGUgcGVyZm9ybWFuY2Vcbi8vIG9mIHlvdXIgZ3JhcGhpY3NcbnZhciBzdGF0cyA9IG5ldyBTdGF0cygpO1xuc3RhdHMuc2V0TW9kZSggMSApOyAvLyAwOiBmcHMsIDE6IG1zLCAyOiBtYlxuXG5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucmlnaHQgPSAnMHB4JztcbnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG5cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHN0YXRzLmRvbUVsZW1lbnQgKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHV0aWxpdGllc1xudmFyIHJhbmQgPSBmdW5jdGlvbihtaW46IG51bWJlciwgbWF4PzogbnVtYmVyKSB7XG4gIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgIG1heCA9IG1pbjtcbiAgICBtaW4gPSAwO1xuICB9XG4gIHJldHVybiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbik7XG59O1xuXG52YXIgcmFuZEludCA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByYW5nZSk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZ2V0IHNvbWUgb2Ygb3VyIGNhbnZhcyBlbGVtZW50cyB0aGF0IHdlIG5lZWRcbnZhciBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbFwiKTtcblxudmFyIGVmZmVjdCA9IDA7XG52YXIgaXNjaGFuZ2VkID0gMDtcblxud2luZG93W1wib25FZmZlY3QxXCJdID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiaW5zdGFsbCBlZmZlY3QxIVwiKTtcblxuICAvLy8vLy8vLy8vLy8vL1xuICAvLy8vLy8vLy8gWU9VUiBDT0RFIEhFUkUgVE8gY2F1c2UgdGhlIHByb2dyYW0gdG8gdXNlIHlvdXIgZmlyc3Qgc2hhZGVyIGVmZmVjdFxuICAvLy8vLy8vLy8gKHlvdSBjYW4gcHJvYmFibHkganVzdCB1c2Ugc29tZSBzb3J0IG9mIGdsb2JhbCB2YXJpYWJsZSB0byBpbmRpY2F0ZSB3aGljaCBlZmZlY3QpXG4gIC8vLy8vLy8vLy8vLy8vXG4gIGVmZmVjdCA9IDE7XG59XG5cbndpbmRvd1tcIm9uRWZmZWN0MlwiXSA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcImluc3RhbGwgZWZmZWN0MiFcIik7XG5cbiAgLy8vLy8vLy8vLy8vLy9cbiAgLy8vLy8vLy8vIFlPVVIgQ09ERSBIRVJFIFRPIGNhdXNlIHRoZSBwcm9ncmFtIHRvIHVzZSB5b3VyIHNlY29uZCBzaGFkZXIgZWZmZWN0XG4gIC8vLy8vLy8vLyAoeW91IGNhbiBwcm9iYWJseSBqdXN0IHVzZSBzb21lIHNvcnQgb2YgZ2xvYmFsIHZhcmlhYmxlIHRvIGluZGljYXRlIHdoaWNoIGVmZmVjdClcbiAgLy8vLy8vLy8vLy8vLy9cbiAgZWZmZWN0ID0gMjtcbn1cblxud2luZG93W1wib25FZmZlY3QzXCJdID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiaW5zdGFsbCBlZmZlY3QzIVwiKTtcblxuICAvLy8vLy8vLy8vLy8vL1xuICAvLy8vLy8vLy8gWU9VUiBDT0RFIEhFUkUgVE8gY2F1c2UgdGhlIHByb2dyYW0gdG8gdXNlIHlvdXIgdGhpcmQgc2hhZGVyIGVmZmVjdFxuICAvLy8vLy8vLy8gKHlvdSBjYW4gcHJvYmFibHkganVzdCB1c2Ugc29tZSBzb3J0IG9mIGdsb2JhbCB2YXJpYWJsZSB0byBpbmRpY2F0ZSB3aGljaCBlZmZlY3QpXG4gIC8vLy8vLy8vLy8vLy8vXG4gIGVmZmVjdCA9IDM7XG4gIGlzY2hhbmdlZCA9IDE7XG5cbn1cblxud2luZG93W1wib25FZmZlY3Q0XCJdID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiaW5zdGFsbCBlZmZlY3Q0IVwiKTtcblxuICAvLy8vLy8vLy8vLy8vL1xuICAvLy8vLy8vLy8gWU9VUiBDT0RFIEhFUkUgVE8gY2F1c2UgdGhlIHByb2dyYW0gdG8gdXNlIHlvdXIgZm91cnRoIHNoYWRlciBlZmZlY3RcbiAgLy8vLy8vLy8vICh5b3UgY2FuIHByb2JhYmx5IGp1c3QgdXNlIHNvbWUgc29ydCBvZiBnbG9iYWwgdmFyaWFibGUgdG8gaW5kaWNhdGUgd2hpY2ggZWZmZWN0KVxuICAvLy8vLy8vLy8vLy8vL1xuICBlZmZlY3QgPSA0O1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gc29tZSBzaW1wbGUgaW50ZXJhY3Rpb24gdXNpbmcgdGhlIG1vdXNlLlxuLy8gd2UgYXJlIGdvaW5nIHRvIGdldCBzbWFsbCBtb3Rpb24gb2Zmc2V0cyBvZiB0aGUgbW91c2UsIGFuZCB1c2UgdGhlc2UgdG8gcm90YXRlIHRoZSBvYmplY3Rcbi8vXG4vLyBvdXIgb2Zmc2V0KCkgZnVuY3Rpb24gZnJvbSBhc3NpZ25tZW50IDAsIHRvIGdpdmUgdXMgYSBnb29kIG1vdXNlIHBvc2l0aW9uIGluIHRoZSBjYW52YXNcbmZ1bmN0aW9uIG9mZnNldChlOiBNb3VzZUV2ZW50KTogR0xNLklBcnJheSB7XG4gICAgZSA9IGUgfHwgPE1vdXNlRXZlbnQ+IHdpbmRvdy5ldmVudDtcblxuICAgIHZhciB0YXJnZXQgPSA8RWxlbWVudD4gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LFxuICAgICAgICByZWN0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICBvZmZzZXRYID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0LFxuICAgICAgICBvZmZzZXRZID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICByZXR1cm4gdmVjMi5mcm9tVmFsdWVzKG9mZnNldFgsIG9mZnNldFkpO1xufVxuXG52YXIgbW91c2VTdGFydCA9IHVuZGVmaW5lZDsgIC8vIHByZXZpb3VzIG1vdXNlIHBvc2l0aW9uXG52YXIgbW91c2VEZWx0YSA9IHVuZGVmaW5lZDsgIC8vIHRoZSBhbW91bnQgdGhlIG1vdXNlIGhhcyBtb3ZlZFxudmFyIG1vdXNlQW5nbGVzID0gdmVjMi5jcmVhdGUoKTsgIC8vIGFuZ2xlIG9mZnNldCBjb3JyZXNwb25kaW5nIHRvIG1vdXNlIG1vdmVtZW50XG5cbi8vIHN0YXJ0IHRoaW5ncyBvZmYgd2l0aCBhIGRvd24gcHJlc3NcbmNhbnZhcy5vbm1vdXNlZG93biA9IChldjogTW91c2VFdmVudCkgPT4ge1xuICAgIG1vdXNlU3RhcnQgPSBvZmZzZXQoZXYpO1xuICAgIG1vdXNlRGVsdGEgPSB2ZWMyLmNyZWF0ZSgpOyAgLy8gaW5pdGlhbGl6ZSB0byAwLDBcbiAgICB2ZWMyLnNldChtb3VzZUFuZ2xlcywgMCwgMCk7XG59XG5cbi8vIHN0b3AgdGhpbmdzIHdpdGggYSBtb3VzZSByZWxlYXNlXG5jYW52YXMub25tb3VzZXVwID0gKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgaWYgKG1vdXNlU3RhcnQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGNsaWNrRW5kID0gb2Zmc2V0KGV2KTtcbiAgICAgICAgdmVjMi5zdWIobW91c2VEZWx0YSwgY2xpY2tFbmQsIG1vdXNlU3RhcnQpOyAgICAgICAgLy8gZGVsdGEgPSBlbmQgLSBzdGFydFxuICAgICAgICB2ZWMyLnNjYWxlKG1vdXNlQW5nbGVzLCBtb3VzZURlbHRhLCAxMC9jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAvLyBub3cgdG9zcyB0aGUgdHdvIHZhbHVlcyBzaW5jZSB0aGUgbW91c2UgaXMgdXBcbiAgICAgICAgbW91c2VEZWx0YSA9IHVuZGVmaW5lZDtcbiAgICAgICAgbW91c2VTdGFydCA9IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbi8vIGlmIHdlJ3JlIG1vdmluZyBhbmQgdGhlIG1vdXNlIGlzIGRvd25cbmNhbnZhcy5vbm1vdXNlbW92ZSA9IChldjogTW91c2VFdmVudCkgPT4ge1xuICAgIGlmIChtb3VzZVN0YXJ0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgbSA9IG9mZnNldChldik7XG4gICAgICB2ZWMyLnN1Yihtb3VzZURlbHRhLCBtLCBtb3VzZVN0YXJ0KTsgICAgLy8gZGVsdGEgPSBtb3VzZSAtIHN0YXJ0XG4gICAgICB2ZWMyLmNvcHkobW91c2VTdGFydCwgbSk7ICAgICAgICAgICAgICAgLy8gc3RhcnQgYmVjb21lcyBjdXJyZW50IHBvc2l0aW9uXG4gICAgICB2ZWMyLnNjYWxlKG1vdXNlQW5nbGVzLCBtb3VzZURlbHRhLCAxMC9jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgLy8gY29uc29sZS5sb2coXCJtb3VzZW1vdmUgbW91c2VBbmdsZXM6IFwiICsgbW91c2VBbmdsZXNbMF0gKyBcIiwgXCIgKyBtb3VzZUFuZ2xlc1sxXSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlbW92ZSBtb3VzZURlbHRhOiBcIiArIG1vdXNlRGVsdGFbMF0gKyBcIiwgXCIgKyBtb3VzZURlbHRhWzFdKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2Vtb3ZlIG1vdXNlU3RhcnQ6IFwiICsgbW91c2VTdGFydFswXSArIFwiLCBcIiArIG1vdXNlU3RhcnRbMV0pO1xuICAgfVxufVxuXG4vLyBzdG9wIHRoaW5ncyBpZiB5b3UgbW92ZSBvdXQgb2YgdGhlIHdpbmRvd1xuY2FudmFzLm9ubW91c2VvdXQgPSAoZXY6IE1vdXNlRXZlbnQpID0+IHtcbiAgICBpZiAobW91c2VTdGFydCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHZlYzIuc2V0KG1vdXNlQW5nbGVzLCAwLCAwKTtcbiAgICAgIG1vdXNlRGVsdGEgPSB1bmRlZmluZWQ7XG4gICAgICBtb3VzZVN0YXJ0ID0gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHN0YXJ0IHRoaW5ncyBvZmYgYnkgY2FsbGluZyBpbml0V2ViR0xcbmluaXRXZWJHTCgpO1xudmFyIHByb2dyYW1zX2FyciA9IFtdO1xuZnVuY3Rpb24gaW5pdFdlYkdMKCkge1xuICAvLyBnZXQgdGhlIHJlbmRlcmluZyBjb250ZXh0IGZvciB3ZWJHTFxuICB2YXIgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCA9IGdldFdlYkdMQ29udGV4dChjYW52YXMpO1xuICBpZiAoIWdsKSB7XG4gICAgcmV0dXJuOyAgLy8gbm8gd2ViZ2whICBCeWUgYnllXG4gIH1cblxuICAvLyB0dXJuIG9uIGJhY2tmYWNlIGN1bGxpbmcgYW5kIHpidWZmZXJpbmdcbiAgLy9nbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuXG4gIC8vIGF0dGVtcHQgdG8gZG93bmxvYWQgYW5kIHNldCB1cCBvdXIgR0xTTCBzaGFkZXJzLiAgV2hlbiB0aGV5IGRvd25sb2FkLCBwcm9jZXNzZWQgdG8gdGhlIG5leHQgc3RlcFxuICAvLyBvZiBvdXIgcHJvZ3JhbSwgdGhlIFwibWFpblwiIHJvdXRpbmdcbiAgLy9cbiAgLy8gWU9VIFNIT1VMRCBNT0RJRlkgVEhJUyBUTyBET1dOTE9BRCBBTEwgWU9VUiBTSEFERVJTIGFuZCBzZXQgdXAgYWxsIGZvdXIgU0hBREVSIFBST0dSQU1TLFxuICAvLyBUSEVOIFBBU1MgQU4gQVJSQVkgT0YgUFJPR1JBTVMgVE8gbWFpbigpLiAgWW91J2xsIGhhdmUgdG8gZG8gb3RoZXIgdGhpbmdzIGluIG1haW4gdG8gZGVhbFxuICAvLyB3aXRoIG11bHRpcGxlIHNoYWRlcnMgYW5kIHN3aXRjaCBiZXR3ZWVuIHRoZW1cblxuICBsb2FkZXIubG9hZEZpbGVzKFsnc2hhZGVycy9hMy1zaGFkZXIudmVydCcsICdzaGFkZXJzL2E0LW1hbmRlbGJyb3QuZnJhZycsJ3NoYWRlcnMvYTMtc2hhZGVyLnZlcnQnLCAnc2hhZGVycy9hNC1zd2lzcy5mcmFnJywgJ3NoYWRlcnMvYTMtc2hhZGVyLnZlcnQnLCAnc2hhZGVycy9hNC1ncmVlbi5mcmFnJywgJ3NoYWRlcnMvYTQtd2FyYmxlLnZlcnQnLCAnc2hhZGVycy9hMy1zaGFkZXIuZnJhZycsICdzaGFkZXJzL2EzLXNoYWRlci52ZXJ0JywgJ3NoYWRlcnMvYTMtc2hhZGVyLmZyYWcnXSwgZnVuY3Rpb24gKHNoYWRlclRleHQpIHtcblxuICAgIHZhciBwcm9ncmFtMF9hcnIgPSBbXTtcbiAgICBwcm9ncmFtMF9hcnJbMF0gPSBzaGFkZXJUZXh0WzhdO1xuICAgIHByb2dyYW0wX2FyclsxXSA9IHNoYWRlclRleHRbOV07XG5cbiAgICB2YXIgcHJvZ3JhbTFfYXJyID0gW107XG4gICAgcHJvZ3JhbTFfYXJyWzBdID0gc2hhZGVyVGV4dFswXTtcbiAgICBwcm9ncmFtMV9hcnJbMV0gPSBzaGFkZXJUZXh0WzFdO1xuXG4gICAgdmFyIHByb2dyYW0yX2FyciA9IFtdO1xuICAgIHByb2dyYW0yX2FyclswXSA9IHNoYWRlclRleHRbMl07XG4gICAgcHJvZ3JhbTJfYXJyWzFdID0gc2hhZGVyVGV4dFszXTtcblxuICAgIHZhciBwcm9ncmFtM19hcnIgPSBbXTtcbiAgICBwcm9ncmFtM19hcnJbMF0gPSBzaGFkZXJUZXh0WzRdO1xuICAgIHByb2dyYW0zX2FyclsxXSA9IHNoYWRlclRleHRbNV07XG5cbiAgICB2YXIgcHJvZ3JhbTRfYXJyID0gW107XG4gICAgcHJvZ3JhbTRfYXJyWzBdID0gc2hhZGVyVGV4dFs2XTtcbiAgICBwcm9ncmFtNF9hcnJbMV0gPSBzaGFkZXJUZXh0WzddO1xuXG4gICAgdmFyIHByb2dyYW0wID0gY3JlYXRlUHJvZ3JhbUZyb21Tb3VyY2VzKGdsLCBwcm9ncmFtMF9hcnIpO1xuICAgIHZhciBwcm9ncmFtMSA9IGNyZWF0ZVByb2dyYW1Gcm9tU291cmNlcyhnbCwgcHJvZ3JhbTFfYXJyKTtcbiAgICB2YXIgcHJvZ3JhbTIgPSBjcmVhdGVQcm9ncmFtRnJvbVNvdXJjZXMoZ2wsIHByb2dyYW0yX2Fycik7XG4gICAgdmFyIHByb2dyYW0zID0gY3JlYXRlUHJvZ3JhbUZyb21Tb3VyY2VzKGdsLCBwcm9ncmFtM19hcnIpO1xuICAgIHZhciBwcm9ncmFtNCA9IGNyZWF0ZVByb2dyYW1Gcm9tU291cmNlcyhnbCwgcHJvZ3JhbTRfYXJyKTtcblxuICAgIHByb2dyYW1zX2FyciA9IFtwcm9ncmFtMCwgcHJvZ3JhbTEsIHByb2dyYW0yLCBwcm9ncmFtMywgcHJvZ3JhbTRdO1xuXG4gICAgbWFpbihnbCwgcHJvZ3JhbXNfYXJyKTtcblxuICB9LCBmdW5jdGlvbiAodXJsKSB7XG4gICAgICBhbGVydCgnU2hhZGVyIGZhaWxlZCB0byBkb3dubG9hZCBcIicgKyB1cmwgKyAnXCInKTtcbiAgfSk7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB3ZWJHTCBpcyBzZXQgdXAsIGFuZCBvdXIgU2hhZGVyIHByb2dyYW0gaGFzIGJlZW4gY3JlYXRlZC4gIEZpbmlzaCBzZXR0aW5nIHVwIG91ciB3ZWJHTCBhcHBsaWNhdGlvblxuZnVuY3Rpb24gbWFpbihnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LCBwcm9ncmFtOiBXZWJHTFByb2dyYW1bXSkge1xuXG4gIC8vIHVzZSB0aGUgd2ViZ2wtdXRpbHMgbGlicmFyeSB0byBjcmVhdGUgc2V0dGVycyBmb3IgYWxsIHRoZSB1bmlmb3JtcyBhbmQgYXR0cmlidXRlcyBpbiBvdXIgc2hhZGVycy5cbiAgLy8gSXQgZW51bWVyYXRlcyBhbGwgb2YgdGhlIHVuaWZvcm1zIGFuZCBhdHRyaWJ1dGVzIGluIHRoZSBwcm9ncmFtLCBhbmQgY3JlYXRlcyB1dGlsaXR5IGZ1bmN0aW9ucyB0b1xuICAvLyBhbGxvdyBcInNldFVuaWZvcm1zXCIgYW5kIFwic2V0QXR0cmlidXRlc1wiIChiZWxvdykgdG8gc2V0IHRoZSBzaGFkZXIgdmFyaWFibGVzIGZyb20gYSBqYXZhc2NyaXB0IG9iamVjdC5cbiAgLy8gVGhlIG9iamVjdHMgaGF2ZSBhIGtleSBmb3IgZWFjaCB1bmlmb3JtIG9yIGF0dHJpYnV0ZSwgYW5kIGEgdmFsdWUgY29udGFpbmluZyB0aGUgcGFyYW1ldGVycyBmb3IgdGhlXG4gIC8vIHNldHRlciBmdW5jdGlvblxuICB2YXIgdW5pZm9ybVNldHRlcnMgPSBjcmVhdGVVbmlmb3JtU2V0dGVycyhnbCwgcHJvZ3JhbVtlZmZlY3RdKTtcbiAgdmFyIGF0dHJpYlNldHRlcnMgID0gY3JlYXRlQXR0cmlidXRlU2V0dGVycyhnbCwgcHJvZ3JhbVtlZmZlY3RdKTtcblxuXG4gIC8vIEJsYWlyIG5vdGVkIHdlIGFyZSBhbGxvd2VkIHRvIHVzZSBjb2RlIG9uIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9tcmRvb2IvdGhyZWUuanMvbWFzdGVyL3NyYy9leHRyYXMvZ2VvbWV0cmllcy9QbGFuZUJ1ZmZlckdlb21ldHJ5LmpzXG4gIHZhciB3aWR0aCA9IDEwO1xuICB2YXIgaGVpZ2h0ID0gMTA7XG4gIHZhciB3aWR0aFNlZ21lbnRzID0gMTAwO1xuICB2YXIgaGVpZ2h0U2VnbWVudHMgPSAxMDA7XG4gIHZhciB3aWR0aF9oYWxmID0gd2lkdGggLyAyO1xuXHR2YXIgaGVpZ2h0X2hhbGYgPSBoZWlnaHQgLyAyO1xuXG5cdHZhciBncmlkWCA9IE1hdGguZmxvb3IoIHdpZHRoU2VnbWVudHMgKSB8fCAxO1xuXHR2YXIgZ3JpZFkgPSBNYXRoLmZsb29yKCBoZWlnaHRTZWdtZW50cyApIHx8IDE7XG5cblx0dmFyIGdyaWRYMSA9IGdyaWRYICsgMTtcblx0dmFyIGdyaWRZMSA9IGdyaWRZICsgMTtcblxuXHR2YXIgc2VnbWVudF93aWR0aCA9IHdpZHRoIC8gZ3JpZFg7XG5cdHZhciBzZWdtZW50X2hlaWdodCA9IGhlaWdodCAvIGdyaWRZO1xuXG5cdHZhciB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoIGdyaWRYMSAqIGdyaWRZMSAqIDMgKTtcblx0dmFyIG5vcm1hbHMgPSBuZXcgRmxvYXQzMkFycmF5KCBncmlkWDEgKiBncmlkWTEgKiAzICk7XG5cdHZhciB0ZXh0Q29vcmRzID0gbmV3IEZsb2F0MzJBcnJheSggZ3JpZFgxICogZ3JpZFkxICogMiApO1xuXG5cdHZhciBvZmZzZXQgPSAwO1xuXHR2YXIgb2Zmc2V0MiA9IDA7XG5cblx0Zm9yICggdmFyIGl5ID0gMDsgaXkgPCBncmlkWTE7IGl5ICsrICkge1xuXG5cdFx0dmFyIHkgPSBpeSAqIHNlZ21lbnRfaGVpZ2h0IC0gaGVpZ2h0X2hhbGY7XG5cblx0XHRmb3IgKCB2YXIgaXggPSAwOyBpeCA8IGdyaWRYMTsgaXggKysgKSB7XG5cblx0XHRcdHZhciB4ID0gaXggKiBzZWdtZW50X3dpZHRoIC0gd2lkdGhfaGFsZjtcblxuXHRcdFx0dmVydGljZXNbIG9mZnNldCBdID0geDtcblx0XHRcdHZlcnRpY2VzWyBvZmZzZXQgKyAxIF0gPSAtIHk7XG5cblx0XHRcdG5vcm1hbHNbIG9mZnNldCArIDIgXSA9IDE7XG5cblx0XHRcdHRleHRDb29yZHNbIG9mZnNldDIgXSA9IGl4IC8gZ3JpZFg7XG5cdFx0XHR0ZXh0Q29vcmRzWyBvZmZzZXQyICsgMSBdID0gMSAtICggaXkgLyBncmlkWSApO1xuXG5cdFx0XHRvZmZzZXQgKz0gMztcblx0XHRcdG9mZnNldDIgKz0gMjtcblxuXHRcdH1cblxuXHR9XG5cblx0b2Zmc2V0ID0gMDtcblxuXHR2YXIgaW5kaWNlcyA9IG5ldyAoICggdmVydGljZXMubGVuZ3RoIC8gMyApID4gNjU1MzUgPyBVaW50MzJBcnJheSA6IFVpbnQxNkFycmF5ICkoIGdyaWRYICogZ3JpZFkgKiA2ICk7XG5cblx0Zm9yICggdmFyIGl5ID0gMDsgaXkgPCBncmlkWTsgaXkgKysgKSB7XG5cblx0XHRmb3IgKCB2YXIgaXggPSAwOyBpeCA8IGdyaWRYOyBpeCArKyApIHtcblxuXHRcdFx0dmFyIGEgPSBpeCArIGdyaWRYMSAqIGl5O1xuXHRcdFx0dmFyIGIgPSBpeCArIGdyaWRYMSAqICggaXkgKyAxICk7XG5cdFx0XHR2YXIgYyA9ICggaXggKyAxICkgKyBncmlkWDEgKiAoIGl5ICsgMSApO1xuXHRcdFx0dmFyIGQgPSAoIGl4ICsgMSApICsgZ3JpZFgxICogaXk7XG5cblx0XHRcdGluZGljZXNbIG9mZnNldCBdID0gYTtcblx0XHRcdGluZGljZXNbIG9mZnNldCArIDEgXSA9IGI7XG5cdFx0XHRpbmRpY2VzWyBvZmZzZXQgKyAyIF0gPSBkO1xuXG5cdFx0XHRpbmRpY2VzWyBvZmZzZXQgKyAzIF0gPSBiO1xuXHRcdFx0aW5kaWNlc1sgb2Zmc2V0ICsgNCBdID0gYztcblx0XHRcdGluZGljZXNbIG9mZnNldCArIDUgXSA9IGQ7XG5cblx0XHRcdG9mZnNldCArPSA2O1xuXG5cdFx0fVxuXG5cdH1cblxuICAvLyBhbiBpbmRleGVkIHF1YWRcbiAgdmFyIGFycmF5cyA9IHtcbiAgICAgcG9zaXRpb246IHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogdmVydGljZXMsfSxcbiAgICAgdGV4Y29vcmQ6IHsgbnVtQ29tcG9uZW50czogMiwgZGF0YTogdGV4dENvb3Jkcyx9LFxuICAgICBub3JtYWw6ICAgeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBub3JtYWxzLH0sXG4gICAgIGluZGljZXM6ICB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IGluZGljZXMsfSxcbiAgfTtcblxuXG4gIHZhciBjZW50ZXIgPSBbMCwwLDBdO1xuICB2YXIgc2NhbGVGYWN0b3IgPSAyMDtcblxuXG4gIGZ1bmN0aW9uIGRlZ1RvUmFkKGQpIHtcbiAgICByZXR1cm4gZCAqIE1hdGguUEkgLyAxODA7XG4gIH1cblxuICB2YXIgY2FtZXJhQW5nbGVSYWRpYW5zID0gZGVnVG9SYWQoMCk7XG4gIHZhciBmaWVsZE9mVmlld1JhZGlhbnMgPSBkZWdUb1JhZCg2MCk7XG4gIHZhciBjYW1lcmFIZWlnaHQgPSA1MDtcblxuICB2YXIgdW5pZm9ybXNUaGF0QXJlVGhlU2FtZUZvckFsbE9iamVjdHMgPSB7XG4gICAgdV9saWdodFdvcmxkUG9zOiAgICAgICAgIFs1MCwgMzAsIC0xMDBdLFxuICAgIHVfdmlld0ludmVyc2U6ICAgICAgICAgICBtYXQ0LmNyZWF0ZSgpLFxuICAgIHVfbGlnaHRDb2xvcjogICAgICAgICAgICBbMSwgMSwgMSwgMV0sXG4gICAgdV9hbWJpZW50OiAgICAgICAgICAgICAgIFswLjEsIDAuMSwgMC4xLCAwLjFdXG4gIH07XG5cbiAgdmFyIHVuaWZvcm1zVGhhdEFyZUNvbXB1dGVkRm9yRWFjaE9iamVjdCA9IHtcbiAgICB1X3dvcmxkVmlld1Byb2plY3Rpb246ICAgbWF0NC5jcmVhdGUoKSxcbiAgICB1X3dvcmxkOiAgICAgICAgICAgICAgICAgbWF0NC5jcmVhdGUoKSxcbiAgICB1X3dvcmxkSW52ZXJzZVRyYW5zcG9zZTogbWF0NC5jcmVhdGUoKSxcbiAgfTtcblxuICAvLyB2YXIgdGV4dHVyZSA9IC4uLi4gY3JlYXRlIGEgdGV4dHVyZSBvZiBzb21lIGZvcm1cblxuICB2YXIgYmFzZUNvbG9yID0gcmFuZCgyNDApO1xuICB2YXIgb2JqZWN0U3RhdGUgPSB7XG4gICAgICBtYXRlcmlhbFVuaWZvcm1zOiB7XG4gICAgICAgIHVfY29sb3JNdWx0OiAgICAgICAgICAgICBjaHJvbWEuaHN2KHJhbmQoYmFzZUNvbG9yLCBiYXNlQ29sb3IgKyAxMjApLCAwLjUsIDEpLmdsKCksXG4gICAgICAgIC8vdV9kaWZmdXNlOiAgICAgICAgICAgICAgIHRleHR1cmUsXG4gICAgICAgIHVfc3BlY3VsYXI6ICAgICAgICAgICAgICBbMSwgMSwgMSwgMV0sXG4gICAgICAgIHVfc2hpbmluZXNzOiAgICAgICAgICAgICA0NTAsXG4gICAgICAgIHVfc3BlY3VsYXJGYWN0b3I6ICAgICAgICAwLjc1LFxuICAgICAgICB1X3RpbWU6IDAuMCxcbiAgICAgIH1cbiAgfTtcblxuICB2YXIgdGV4dHVyZXNfYXJyID0gW107XG5cbiAgdmFyIGdyZWVuX3NjcmVlbiA9IG5ldyBJbWFnZSgpO1xuICBncmVlbl9zY3JlZW4uc3JjID0gXCJyZXNvdXJjZXMvZXdhbi5qcGdcIjtcbiAgZ3JlZW5fc2NyZWVuLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgcmVuZGVyX2dyZWVuKGdyZWVuX3NjcmVlbik7XG4gIH1cblxuICB2YXIgYmFja2dyb3VuZF9pbWFnZSA9IG5ldyBJbWFnZSgpO1xuICBiYWNrZ3JvdW5kX2ltYWdlLnNyYyA9IFwicmVzb3VyY2VzL2JhY2tncm91bmQuanBnXCI7XG4gIGJhY2tncm91bmRfaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICByZW5kZXJfYmFja2dyb3VuZChiYWNrZ3JvdW5kX2ltYWdlKTtcbiAgfVxuXG4gIHZhciByZW5kZXJfZ3JlZW4gPSBmdW5jdGlvbihncmVlbjogSFRNTEltYWdlRWxlbWVudCl7XG5cbiAgICAvLyByZXR1cm5zIHRoZSBsb2NhdGlvbiBvZiBhbiBhdHRyaWJ1dGUgdmFyaWFibGVcbiAgICB2YXIgdGV4Q29vcmRMb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW1bZWZmZWN0XSwgXCJhX3RleGNvb3JkXCIpO1xuXG4gICAgLy8gYmluZCBidWZmZXIgd2l0aCB0ZXh0dXJlIGNvb3JkaW5hdGVzXG4gICAgdmFyIHRleENvb3JkQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbiAgICAvLyBjcmVhdGUgZ3JlZW4gc2NyZWVuIHRleHR1cmUgYW5kIGJpbmQgaXRcbiAgICB2YXIgdGV4dHVyZV9ncmVlbiA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlX2dyZWVuKTtcblxuICAgIC8vIHNldCB0ZXh0dXJlIHBhcmFtZXRlcnMgdG8gaGFuZGxlIHZhcmlhYmxlIHNpemUgaW1hZ2VzXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcblxuICAgIC8vIGFsbG93cyBlbGVtZW50cyBvZiBhbiBpbWFnZSBhcnJheSB0byBiZSByZWFkIGJ5IHNoYWRlcnNcbiAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGdyZWVuKTtcblxuXG4gICAgdGV4dHVyZXNfYXJyLnB1c2godGV4dHVyZV9ncmVlbik7XG4gIH1cblxuICB2YXIgcmVuZGVyX2JhY2tncm91bmQgPSBmdW5jdGlvbiAoYmFja2dyb3VuZDogSFRNTEltYWdlRWxlbWVudCkge1xuXG4gICAgLy8gcmV0dXJucyB0aGUgbG9jYXRpb24gb2YgYW4gYXR0cmlidXRlIHZhcmlhYmxlXG4gICAgdmFyIHRleENvb3JkTG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtW2VmZmVjdF0sIFwiYV90ZXhjb29yZFwiKTtcblxuICAgIC8vIGJpbmQgYnVmZmVyIHdpdGggdGV4dHVyZSBjb29yZGluYXRlc1xuICAgIHZhciB0ZXhDb29yZEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuXG4gICAgLy8gY3JlYXRlIGJhY2tncm91bmQgdGV4dHVyZSBhbmQgYmluZCBpdFxuICAgIHZhciB0ZXh0dXJlX2JhY2tncm91bmQgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZV9iYWNrZ3JvdW5kKTtcblxuICAgIC8vIHNldCB0ZXh0dXJlIHBhcmFtZXRlcnMgdG8gaGFuZGxlIHZhcmlhYmxlIHNpemUgaW1hZ2VzXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcblxuICAgIC8vIGFsbG93cyBlbGVtZW50cyBvZiBhbiBpbWFnZSBhcnJheSB0byBiZSByZWFkIGJ5IHNoYWRlcnNcbiAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGJhY2tncm91bmQpO1xuICAgIHRleHR1cmVzX2Fyci5wdXNoKHRleHR1cmVfYmFja2dyb3VuZCk7XG4gIH1cblxuXG4gIC8vIHNvbWUgdmFyaWFibGVzIHdlJ2xsIHJldXNlIGJlbG93XG4gIHZhciBwcm9qZWN0aW9uTWF0cml4ID0gbWF0NC5jcmVhdGUoKTtcbiAgdmFyIHZpZXdNYXRyaXggPSBtYXQ0LmNyZWF0ZSgpO1xuICB2YXIgcm90YXRpb25NYXRyaXggPSBtYXQ0LmNyZWF0ZSgpO1xuICB2YXIgbWF0cml4ID0gbWF0NC5jcmVhdGUoKTsgIC8vIGEgc2NyYXRjaCBtYXRyaXhcbiAgdmFyIGludk1hdHJpeCA9IG1hdDQuY3JlYXRlKCk7XG4gIHZhciBheGlzVmVjdG9yID0gdmVjMy5jcmVhdGUoKTtcblxuXG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXdTY2VuZSk7XG5cbiAgLy8gRHJhdyB0aGUgc2NlbmUuXG4gIGZ1bmN0aW9uIGRyYXdTY2VuZSh0aW1lOiBudW1iZXIpIHtcbiAgICB0aW1lICo9IDAuMDAxO1xuXG4gICAgb2JqZWN0U3RhdGUubWF0ZXJpYWxVbmlmb3Jtcy51X3RpbWUgPSB0aW1lO1xuXG4gICAgLy8gbWVhc3VyZSB0aW1lIHRha2VuIGZvciB0aGUgbGl0dGxlIHN0YXRzIG1ldGVyXG4gICAgc3RhdHMuYmVnaW4oKTtcblxuICAgIC8vIGlmIHRoZSB3aW5kb3cgY2hhbmdlZCBzaXplLCByZXNldCB0aGUgV2ViR0wgY2FudmFzIHNpemUgdG8gbWF0Y2guICBUaGUgZGlzcGxheWVkIHNpemUgb2YgdGhlIGNhbnZhc1xuICAgIC8vIChkZXRlcm1pbmVkIGJ5IHdpbmRvdyBzaXplLCBsYXlvdXQsIGFuZCB5b3VyIENTUykgaXMgc2VwYXJhdGUgZnJvbSB0aGUgc2l6ZSBvZiB0aGUgV2ViR0wgcmVuZGVyIGJ1ZmZlcnMsXG4gICAgLy8gd2hpY2ggeW91IGNhbiBjb250cm9sIGJ5IHNldHRpbmcgY2FudmFzLndpZHRoIGFuZCBjYW52YXMuaGVpZ2h0XG4gICAgcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShjYW52YXMpO1xuXG4gICAgLy8gU2V0IHRoZSB2aWV3cG9ydCB0byBtYXRjaCB0aGUgY2FudmFzXG4gICAgZ2wudmlld3BvcnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgIC8vIENsZWFyIHRoZSBjYW52YXMgQU5EIHRoZSBkZXB0aCBidWZmZXIuXG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgcHJvamVjdGlvbiBtYXRyaXhcbiAgICB2YXIgYXNwZWN0ID0gY2FudmFzLmNsaWVudFdpZHRoIC8gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICBtYXQ0LnBlcnNwZWN0aXZlKHByb2plY3Rpb25NYXRyaXgsZmllbGRPZlZpZXdSYWRpYW5zLCBhc3BlY3QsIDEsIDIwMDApO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgY2FtZXJhJ3MgbWF0cml4IHVzaW5nIGxvb2sgYXQuXG4gICAgdmFyIGNhbWVyYVBvc2l0aW9uID0gWzAsIDAsIC0yMDBdO1xuICAgIHZhciB0YXJnZXQgPSBbMCwgMCwgMF07XG4gICAgdmFyIHVwID0gWzAsIDEsIDBdO1xuICAgIHZhciBjYW1lcmFNYXRyaXggPSBtYXQ0Lmxvb2tBdCh1bmlmb3Jtc1RoYXRBcmVUaGVTYW1lRm9yQWxsT2JqZWN0cy51X3ZpZXdJbnZlcnNlLCBjYW1lcmFQb3NpdGlvbiwgdGFyZ2V0LCB1cCk7XG5cbiAgICAvLyBNYWtlIGEgdmlldyBtYXRyaXggZnJvbSB0aGUgY2FtZXJhIG1hdHJpeC5cbiAgICBtYXQ0LmludmVydCh2aWV3TWF0cml4LCBjYW1lcmFNYXRyaXgpO1xuXG4gICAgdW5pZm9ybVNldHRlcnMgPSBjcmVhdGVVbmlmb3JtU2V0dGVycyhnbCwgcHJvZ3JhbVtlZmZlY3RdKTtcbiAgICBhdHRyaWJTZXR0ZXJzICA9IGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMoZ2wsIHByb2dyYW1bZWZmZWN0XSk7XG5cbiAgICAvLyB0ZWxsIFdlYkdMIHRvIHVzZSBvdXIgc2hhZGVyIHByb2dyYW0gKHdpbGwgbmVlZCB0byBjaGFuZ2UgdGhpcylcbiAgICBnbC51c2VQcm9ncmFtKHByb2dyYW1bZWZmZWN0XSk7XG5cbiAgICBpZihlZmZlY3QgPT0gMyAmJiBpc2NoYW5nZWQpe1xuICAgICAgaXNjaGFuZ2VkID0gMDtcbiAgICAgIC8vIHJldHVybnMgYW4gaW50ZWdlciB0aGF0IHJlcHJlc2VudHMgdGhlIGxvY2F0aW9uIG9mIGEgc3BlY2lmaWMgdW5pZm9ybSB2YXJpYWJsZSB3aXRoaW4gYSBwcm9ncmFtIG9iamVjdFxuICAgICAgdmFyIHVfaW1hZ2UwX2xvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1zX2FycltlZmZlY3RdLCBcInVfaW1hZ2UwXCIpO1xuICAgICAgdmFyIHVfaW1hZ2UxX2xvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1zX2FycltlZmZlY3RdLCBcInVfaW1hZ2UxXCIpO1xuXG4gICAgICAvLyBhc3NpZ25zIGFuIGludGVnZXIgdmFsdWUgdG8gYSB1bmlmb3JtIHZhcmlhYmxlIGZvciB0aGUgY3VycmVudCBwcm9ncmFtIG9iamVjdFxuICAgICAgZ2wudW5pZm9ybTFpKHVfaW1hZ2UwX2xvY2F0aW9uLCAwKTtcbiAgICAgIGdsLnVuaWZvcm0xaSh1X2ltYWdlMV9sb2NhdGlvbiwgMSk7XG5cbiAgICAgIC8vIHNwZWNpZmllcyB3aGljaCB0ZXh0dXJlIHVuaXQgdG8gbWFrZSBhY3RpdmVcbiAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xuXG4gICAgICAvLyBiaW5kIGEgbmFtZWQgdGV4dHVyZSB0byBhIHRleHR1cmluZyB0YXJnZXRcbiAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmVzX2FyclswXSk7XG5cbiAgICAgIC8vIHNwZWNpZmllcyB3aGljaCB0ZXh0dXJlIHVuaXQgdG8gbWFrZSBhY3RpdmVcbiAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTEpO1xuXG4gICAgICAvLyBiaW5kIGEgbmFtZWQgdGV4dHVyZSB0byBhIHRleHR1cmluZyB0YXJnZXRcbiAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmVzX2FyclsxXSk7XG5cbiAgICB9XG5cbiAgICAvLyBTZXR1cCBhbGwgdGhlIG5lZWRlZCBhdHRyaWJ1dGVzIGFuZCBidWZmZXJzLlxuICAgIC8vIGlmKGVmZmVjdCA9PSAzKXtcbiAgICAvLyAgIGFycmF5cy50ZXhjb29yZC5kYXRhID0gWzEsIDEsIDAsIDEsIDEsIDAsIDAsIDBdO1xuICAgIC8vIH1lbHNle1xuICAgIC8vICAgYXJyYXlzLnRleGNvb3JkLmRhdGEgPSBbMCwgMCwgMSwgMCwgMCwgMSwgMSwgMV07XG4gICAgLy8gfVxuICAgIHZhciBidWZmZXJJbmZvID0gY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXMoZ2wsIGFycmF5cyk7XG4gICAgc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXMoZ2wsIGF0dHJpYlNldHRlcnMsIGJ1ZmZlckluZm8pO1xuXG4gICAgLy8gU2V0IHRoZSB1bmlmb3JtcyB0aGF0IGFyZSB0aGUgc2FtZSBmb3IgYWxsIG9iamVjdHMuICBVbmxpa2UgdGhlIGF0dHJpYnV0ZXMsIGVhY2ggdW5pZm9ybSBzZXR0ZXJcbiAgICAvLyBpcyBkaWZmZXJlbnQsIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0aGUgdW5pZm9ybSB2YXJpYWJsZS4gIExvb2sgaW4gd2ViZ2wtdXRpbC5qcyBmb3IgdGhlXG4gICAgLy8gaW1wbGVtZW50YXRpb24gb2YgIHNldFVuaWZvcm1zIHRvIHNlZSB0aGUgZGV0YWlscyBmb3Igc3BlY2lmaWMgdHlwZXNcbiAgICBzZXRVbmlmb3Jtcyh1bmlmb3JtU2V0dGVycywgdW5pZm9ybXNUaGF0QXJlVGhlU2FtZUZvckFsbE9iamVjdHMpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbXB1dGUgdGhlIHZpZXcgbWF0cml4IGFuZCBjb3JyZXNwb25kaW5nIG90aGVyIG1hdHJpY2VzIGZvciByZW5kZXJpbmcuXG5cbiAgICAvLyBmaXJzdCBtYWtlIGEgY29weSBvZiBvdXIgcm90YXRpb25NYXRyaXhcbiAgICBtYXQ0LmNvcHkobWF0cml4LCByb3RhdGlvbk1hdHJpeCk7XG5cbiAgICAvLyBhZGp1c3QgdGhlIHJvdGF0aW9uIGJhc2VkIG9uIG1vdXNlIGFjdGl2aXR5LiAgbW91c2VBbmdsZXMgaXMgc2V0IGlmIHVzZXIgaXMgZHJhZ2dpbmdcbiAgICBpZiAobW91c2VBbmdsZXNbMF0gIT09IDAgfHwgbW91c2VBbmdsZXNbMV0gIT09IDApIHtcbiAgICAgIC8qXG4gICAgICAgKiBvbmx5IHJvdGF0ZSBhcm91bmQgWSwgdXNlIHRoZSBzZWNvbmQgbW91c2UgdmFsdWUgZm9yIHNjYWxlLiAgTGVhdmluZyB0aGUgb2xkIGNvZGUgZnJvbSBBM1xuICAgICAgICogaGVyZSwgY29tbWVudGVkIG91dFxuICAgICAgICpcbiAgICAgIC8vIG5lZWQgYW4gaW52ZXJzZSB3b3JsZCB0cmFuc2Zvcm0gc28gd2UgY2FuIGZpbmQgb3V0IHdoYXQgdGhlIHdvcmxkIFggYXhpcyBmb3Igb3VyIGZpcnN0IHJvdGF0aW9uIGlzXG4gICAgICBtYXQ0LmludmVydChpbnZNYXRyaXgsIG1hdHJpeCk7XG4gICAgICAvLyBnZXQgdGhlIHdvcmxkIFggYXhpc1xuICAgICAgdmFyIHhBeGlzID0gdmVjMy50cmFuc2Zvcm1NYXQ0KGF4aXNWZWN0b3IsIHZlYzMuZnJvbVZhbHVlcygxLDAsMCksIGludk1hdHJpeCk7XG5cbiAgICAgIC8vIHJvdGF0ZSBhYm91dCB0aGUgd29ybGQgWCBheGlzICh0aGUgWCBwYXJhbGxlbCB0byB0aGUgc2NyZWVuISlcbiAgICAgIG1hdDQucm90YXRlKG1hdHJpeCwgbWF0cml4LCAtbW91c2VBbmdsZXNbMV0sIHhBeGlzKTtcbiAgICAgICovXG5cbiAgICAgIC8vIG5vdyBnZXQgdGhlIGludmVyc2Ugd29ybGQgdHJhbnNmb3JtIHNvIHdlIGNhbiBmaW5kIHRoZSB3b3JsZCBZIGF4aXNcbiAgICAgIG1hdDQuaW52ZXJ0KGludk1hdHJpeCwgbWF0cml4KTtcbiAgICAgIC8vIGdldCB0aGUgd29ybGQgWSBheGlzXG4gICAgICB2YXIgeUF4aXMgPSB2ZWMzLnRyYW5zZm9ybU1hdDQoYXhpc1ZlY3RvciwgdmVjMy5mcm9tVmFsdWVzKDAsMSwwKSwgaW52TWF0cml4KTtcblxuICAgICAgLy8gcm90YXRlIGFib3V0IHRlaCB3b3JsZCBZIGF4aXNcbiAgICAgIG1hdDQucm90YXRlKG1hdHJpeCwgbWF0cml4LCBtb3VzZUFuZ2xlc1swXSwgeUF4aXMpO1xuXG4gICAgICAvLyBzYXZlIHRoZSByZXN1bHRpbmcgbWF0cml4IGJhY2sgdG8gdGhlIGN1bXVsYXRpdmUgcm90YXRpb24gbWF0cml4XG4gICAgICBtYXQ0LmNvcHkocm90YXRpb25NYXRyaXgsIG1hdHJpeCk7XG5cbiAgICAgIC8vIHVzZSBtb3VzZUFuZ2xlc1sxXSB0byBzY2FsZVxuICAgICAgc2NhbGVGYWN0b3IgKz0gbW91c2VBbmdsZXNbMV07XG5cbiAgICAgIHZlYzIuc2V0KG1vdXNlQW5nbGVzLCAwLCAwKTtcbiAgICB9XG5cbiAgICAvLyBhZGQgYSB0cmFuc2xhdGUgYW5kIHNjYWxlIHRvIHRoZSBvYmplY3QgV29ybGQgeGZvcm0sIHNvIHdlIGhhdmU6ICBSICogVCAqIFNcbiAgICBtYXQ0LnRyYW5zbGF0ZShtYXRyaXgsIHJvdGF0aW9uTWF0cml4LCBbLWNlbnRlclswXSpzY2FsZUZhY3RvciwgLWNlbnRlclsxXSpzY2FsZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLWNlbnRlclsyXSpzY2FsZUZhY3Rvcl0pO1xuICAgIG1hdDQuc2NhbGUobWF0cml4LCBtYXRyaXgsIFtzY2FsZUZhY3Rvciwgc2NhbGVGYWN0b3IsIHNjYWxlRmFjdG9yXSk7XG4gICAgbWF0NC5jb3B5KHVuaWZvcm1zVGhhdEFyZUNvbXB1dGVkRm9yRWFjaE9iamVjdC51X3dvcmxkLCBtYXRyaXgpO1xuXG4gICAgLy8gZ2V0IHByb2ogKiB2aWV3ICogd29ybGRcbiAgICBtYXQ0Lm11bHRpcGx5KG1hdHJpeCwgdmlld01hdHJpeCwgdW5pZm9ybXNUaGF0QXJlQ29tcHV0ZWRGb3JFYWNoT2JqZWN0LnVfd29ybGQpO1xuICAgIG1hdDQubXVsdGlwbHkodW5pZm9ybXNUaGF0QXJlQ29tcHV0ZWRGb3JFYWNoT2JqZWN0LnVfd29ybGRWaWV3UHJvamVjdGlvbiwgcHJvamVjdGlvbk1hdHJpeCwgbWF0cml4KTtcblxuICAgIC8vIGdldCB3b3JsZEludlRyYW5zcG9zZS4gIEZvciBhbiBleHBsYWluYXRpb24gb2Ygd2h5IHdlIG5lZWQgdGhpcywgZm9yIGZpeGluZyB0aGUgbm9ybWFscywgc2VlXG4gICAgLy8gaHR0cDovL3d3dy51bmtub3ducm9hZC5jb20vcnRmbS9ncmFwaGljcy9ydF9ub3JtYWxzLmh0bWxcbiAgICBtYXQ0LnRyYW5zcG9zZSh1bmlmb3Jtc1RoYXRBcmVDb21wdXRlZEZvckVhY2hPYmplY3QudV93b3JsZEludmVyc2VUcmFuc3Bvc2UsXG4gICAgICAgICAgICAgICAgICAgbWF0NC5pbnZlcnQobWF0cml4LCB1bmlmb3Jtc1RoYXRBcmVDb21wdXRlZEZvckVhY2hPYmplY3QudV93b3JsZCkpO1xuXG4gICAgLy8gU2V0IHRoZSB1bmlmb3JtcyB3ZSBqdXN0IGNvbXB1dGVkXG4gICAgc2V0VW5pZm9ybXModW5pZm9ybVNldHRlcnMsIHVuaWZvcm1zVGhhdEFyZUNvbXB1dGVkRm9yRWFjaE9iamVjdCk7XG5cbiAgICAvLyBTZXQgdGhlIHVuaWZvcm1zIHRoYXQgYXJlIHNwZWNpZmljIHRvIHRoZSB0aGlzIG9iamVjdC5cbiAgICBzZXRVbmlmb3Jtcyh1bmlmb3JtU2V0dGVycywgb2JqZWN0U3RhdGUubWF0ZXJpYWxVbmlmb3Jtcyk7XG5cbiAgICAvLyBEcmF3IHRoZSBnZW9tZXRyeS4gICBFdmVyeXRoaW5nIGlzIGtleWVkIHRvIHRoZSBcIlwiXG4gICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgYnVmZmVySW5mby5udW1FbGVtZW50cywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuXG4gICAgLy8gc3RhdHMgbWV0ZXJcbiAgICBzdGF0cy5lbmQoKTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3U2NlbmUpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
