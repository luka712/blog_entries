import './style.css'
import materialVertexShaderSource from './MaterialVertexShader.glsl?raw';
import materialFragmentShaderSource from './MaterialFragmentShader.glsl?raw';
import luminanceVertexShaderSource from './LuminanceVertexShader.glsl?raw';
import luminanceFragmentShaderSource from './LuminanceFragmentShader.glsl?raw';
import * as dat from 'dat.gui';
import { mat4 } from 'gl-matrix';


let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;

const options = {
  useFramebuffer: true,
  renderBackground: true,
  renderBackgroundToFramebuffer: true
}

// pink 
const clearColor = { r: 1, g: 0.71, b: 0.76 }

let spriteProgram: WebGLProgram;
let spriteVAO: WebGLVertexArrayObject;

let materialProjectionMatrixLocation: WebGLUniformLocation;
let materialViewMatrixLocation: WebGLUniformLocation;
let materialModelMatrixLocation: WebGLUniformLocation;

let materialFoxTexture: WebGLTexture;
let materialCatTexture: WebGLTexture;
let materialHuskyTexture: WebGLTexture;

// framebuffer,renderbuffer setup
let renderBufferTexture: WebGLTexture;
let frameBuffer: WebGLFramebuffer;
let postProcessProgram: WebGLProgram;
let postProcessVAO: WebGLVertexArrayObject;

function initGui()
{
  const gui = new dat.GUI();

  gui.add(options, "useFramebuffer");
  gui.add(options, "renderBackground");
  gui.add(options, "renderBackgroundToFramebuffer");
}

function createWebGLProgram(vertexSource: string, fragmentSource: string): WebGLProgram 
{
  // create vertex shader.
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
  {
    const log = gl.getShaderInfoLog(vertexShader);
    console.error(`Failed to compile vertex shader: ${log}`);
  }

  // create fragment shader.
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
  {
    const log = gl.getShaderInfoLog(fragmentShader);
    console.error(`Failed to compile fragment shader: ${log}`);
  }

  // create program
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
  {
    const log = gl.getProgramInfoLog(program);
    console.error(`Failed to link program: ${log}`);
  }

  return program;
}

function createSpriteVAO(): WebGLVertexArrayObject 
{
  // vao 
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  // Create position and texture attributes for material shader
  // each vertex is position(x,y,z) and textureCoords(t,s)
  const data = new Float32Array([
    // x   y   z    t  s    // position and texture coords
    0.5, 0.5, 0, 1, 1,   // vertex 1 
    0.5, -0.5, 0, 1, 0,   // vertex 2 
    -0.5, -0.5, 0, 0, 0,  // vertex 3
    -0.5, 0.5, 0, 0, 1   // vertex 4
  ])

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // position vec3 * sizeof(float) + texureCoods vec2 * sizeof(float) 
  const stride = 3 * Float32Array.BYTES_PER_ELEMENT + 2 * Float32Array.BYTES_PER_ELEMENT;

  // describe attribute aPosition 
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(0);

  // describe attribute aTexCoords
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(1);

  // create index buffer 
  const indicesData = new Uint8Array([
    0, 1, 2, // first triangle
    0, 2, 3  // second triangle
  ])
  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesData, gl.STATIC_DRAW);

  // unbind vao 
  gl.bindVertexArray(null);

  return vao;
}

function createSpriteTexture(elementId: string): WebGLTexture
{
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const img = document.getElementById(elementId) as HTMLImageElement;
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  // use neareast neighbour filter, for pixel perect art.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function createPostProcessVAO(): WebGLVertexArrayObject
{
  // Post process vertex array object and data buffers
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const data = new Float32Array([
    // x   y   z    t  s    // position and texture coords
    1, 1, 0, 1, 1,   // vertex 1 
    1, -1, 0, 1, 0,   // vertex 2 
    -1, -1, 0, 0, 0,  // vertex 3
    -1, 1, 0, 0, 1   // vertex 4
  ])
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // position vec3 * sizeof(float) + texureCoods vec2 * sizeof(float) 
  const stride = 3 * Float32Array.BYTES_PER_ELEMENT + 2 * Float32Array.BYTES_PER_ELEMENT;

  // describe attribute aPosition 
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(0);

  // describe attribute aTexCoords
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(1);

  // create index buffer 
  const indicesData = new Uint8Array([
    0, 1, 2, // first triangle
    0, 2, 3  // second triangle
  ])
  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesData, gl.STATIC_DRAW);

  // unbind vao 
  gl.bindVertexArray(null);

  return vao;
}

function createEmptyFrameBufferTexture(): WebGLTexture 
{
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture;
}

function spritesSetup()
{


  // SPRITE SETUP
  // 1. load vertex and index data
  spriteVAO = createSpriteVAO();

  // 2. load shader and create program. Get uniforms as well
  spriteProgram = createWebGLProgram(materialVertexShaderSource, materialFragmentShaderSource);

  // now get uniforms
  materialProjectionMatrixLocation = gl.getUniformLocation(spriteProgram, "uProjection")!;
  materialViewMatrixLocation = gl.getUniformLocation(spriteProgram, "uView")!;
  materialModelMatrixLocation = gl.getUniformLocation(spriteProgram, "uModel")!;

  // 3. load and assign sprite textures
  materialCatTexture = createSpriteTexture("cat-texture");
  materialFoxTexture = createSpriteTexture("fox-texture");
  materialHuskyTexture = createSpriteTexture("husky-texture");
}

function framebufferSetup()
{

  // POST PROCESS  
  // 1. first we need an empty texture, to which to render the scene.
  renderBufferTexture = createEmptyFrameBufferTexture();

  // 2. create framebuffer and add texture to color attachment 0
  frameBuffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderBufferTexture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // 3. common opengl/webgl stuff, assign vao, buffer and program to use. We just render whole texture across the screen 
  // and use texture to which scene is rendered.
  postProcessVAO = createPostProcessVAO();
  postProcessProgram = createWebGLProgram(luminanceVertexShaderSource, luminanceFragmentShaderSource);
}

function setup() 
{
  canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
  gl = canvas.getContext("webgl2")!;

  spritesSetup();
  framebufferSetup();

  initGui();

  // transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // RENDER
  render();
}

function drawSprite(texture: WebGLTexture, posX: number, posY: number)
{
  let model = mat4.create();
  mat4.translate(model, model, [posX, posY, 0]);
  mat4.scale(model, model, [128, 128, 0]);
  gl.uniformMatrix4fv(materialModelMatrixLocation, false, model);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
}

function drawScene()
{
  // use sprite program and bind sprite data
  gl.useProgram(spriteProgram);
  gl.bindVertexArray(spriteVAO);

  // create and setup projection matrix
  const projection = mat4.create();
  mat4.ortho(projection, 0, canvas.width, canvas.height, 0, 0.1, 100);
  gl.uniformMatrix4fv(materialProjectionMatrixLocation, false, projection);

  // create and setup view matrix
  const view = mat4.create();
  // 1 in z axis [0,0,1], looks at center [0,0,0] ,  y is up [0,1,0]
  mat4.lookAt(view, [0, 0, 1], [0, 0, 0], [0, 1, 0]);
  gl.uniformMatrix4fv(materialViewMatrixLocation, false, view);

  // draw sprites
  drawSprite(materialCatTexture, 100, 100);
  drawSprite(materialFoxTexture, 500, 100);
  drawSprite(materialHuskyTexture, 300, 300);
}

function render() 
{
  // if framebuffer is to be used
  if (options.useFramebuffer)
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  }
  else 
  {
    // binds the screen buffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // clear the buffer contents, and either use or not clear color.
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (options.renderBackground)
  {
    gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 1);
  }
  else 
  {
    gl.clearColor(1,1,1,0);
  }


  drawScene();

  if (options.useFramebuffer)
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (options.renderBackgroundToFramebuffer)
    {
      gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 1);
    }
    else 
    {
      gl.clearColor(1,1,1,0);
    }
    gl.bindVertexArray(postProcessVAO);
    gl.useProgram(postProcessProgram);
    gl.disable(gl.DEPTH_TEST);
    gl.bindTexture(gl.TEXTURE_2D, renderBufferTexture);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
  }

  requestAnimationFrame(() => render());
}

setup();