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

#define MaxIterations 40

vec4 lit(float l ,float h, float m) {
  return vec4(1.0, abs(l),(l > 0.0) ? pow(max(0.0, h), m) : 0.0,1.0);
}

void main() {

    // color values from a3 shader
    vec3 a_normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToView = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLight + surfaceToView);
    vec4 litR = lit(dot(a_normal, surfaceToLight), dot(a_normal, halfVector), u_shininess);
    vec4 outColor = vec4((u_lightColor * (litR.y * u_colorMult + u_specular * litR.z * u_specularFactor)).rgb,1.0);

    // create texture coordinates within the range
    vec2 text_coord = v_texCoord * vec2(4.0, 4.0) - vec2(2.0, 2.0);

    // assign c value
    float c  = text_coord.x;
    float c_original = c;

    // assign z value
    float z  = text_coord.y;
    float z_original = z;

    // create color values
    vec3  red = vec3(1, .2, .3);
    vec3  green = vec3(.1, 1, .1);
    vec3  blue = vec3(.4, .1, 1);
    vec3 color;

    //
    float z_squared = 0.0;
    int count = MaxIterations;

    // algorithm for calculating positions to color
    for (int x = 0; x < MaxIterations; x++){
        float c_curr = c;
        c = (c_curr * c_curr) - (z * z) + c_original;
        z = 2.0 * c_curr * z + z_original;
        z_squared = (c * c) + (z * z);
        // if point is outside of set, break
        if(z_squared > 4.0){
          count = x;
          break;
        }
    }

    // calculate color based on number of iterations
    // if inside the set, use blue
    if (z_squared < 4.0){
        color = blue;
    //else if on outside or edge, blend edge and outside color based on number of iterations
    }else{
        color = mix(red, green, fract(float(count) * 0.05));
    }

    gl_FragColor = vec4(color, 1.0) * (outColor + u_ambient);
}
