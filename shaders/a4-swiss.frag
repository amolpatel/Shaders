precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_colorMult;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;
uniform vec4 u_ambient;
uniform vec2 center;
uniform float scaleFactor;


vec4 lit(float l ,float h, float m) {
  return vec4(1.0, abs(l), (l > 0.0) ? pow(max(0.0, h), m) : 0.0,1.0);
}

void main() {
    // color values from a3 shader
    vec3 a_normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToView = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLight + surfaceToView);
    vec4 litR = lit(dot(a_normal, surfaceToLight), dot(a_normal, halfVector), u_shininess);
    vec4 outColor = vec4((u_lightColor * (litR.y * u_colorMult + u_specular * litR.z * u_specularFactor)).rgb,1.0);

    gl_FragColor = outColor + u_ambient;

    //create 12 holes
    vec3 hole_arr[12];

    // random function:
    // http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
    for(int i = 0; i < 12; i++){
      hole_arr[i] = vec3(float(fract(sin(dot(vec2(-i,i), vec2(112.8,-78.233))) * 438.5453)), float(fract(sin(dot(vec2(i,78.233), vec2(12.9898,i))) * 48.5453)), (float(i) * .01));
    }

    // check if magnitude of hole minus texture coordinate is less than radius
    for(int i = 0; i < 12; i++){
      if(length(hole_arr[i].xy - v_texCoord) < hole_arr[i].z) discard;
    }

}
