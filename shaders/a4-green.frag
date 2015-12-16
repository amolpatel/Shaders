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
uniform sampler2D u_image0;
uniform sampler2D u_image1;

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
	vec4 outColor = vec4((u_lightColor * (litR.y + u_specular * litR.z * u_specularFactor)).rgb,1.0);


  // flip the image
  vec2 flipped;
  flipped.x = 1.0 - v_texCoord.x;
  flipped.y = 1.0 - v_texCoord.y;

  // retrieve green texture pixel from a u_image0 sampler
	vec4 green = texture2D(u_image0, flipped);

  // retrieve background texture pixel from a u_image1 sampler
	vec4 background = texture2D(u_image1, flipped);

	// figure out what is considered "green"
	float avg_intensity = green.r * 0.5 + green.b * 0.5;

	// figure out the difference between the current pixel and the green threshold
	float color_diff = green.g - avg_intensity;

  // if the pixel is greener than the calculated average, make the a component transparent
	green.a = 1.0 - smoothstep(0.0, 0.25, color_diff);

  // intensify the transparency to allow more of the background color through
	green.a = green.a * green.a * green.a;

  // finally, if the green transparency is less than .1, replace it with the background pixel
	if (green.a < 0.1) green.rgba = background.rgba;

	gl_FragColor = green * outColor;
}
