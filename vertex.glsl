
uniform vec3 uCameraPos;
varying vec3 vOrigin;
varying vec3 vDirection;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec2 vMatcapUv;
void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    // gl_Position.z = gl_Position.w; // set z to camera.far;
    vUv = uv;// - vec2(0.5);


    // matcap uv's
    vec4 modelViewPosition = modelViewMatrix * vec4( position, 1.0 );
    vec3 e = normalize(modelViewPosition.xyz);
    vec3 n = normalize(normalMatrix*normal);
    vec3 r = reflect(e,n);
    float m = 2. * sqrt(r.x*r.x + r.y*r.y + (r.z+1.)*(r.z+1.));
    // float m = -2. * sqrt(r.x*r.x + r.y*r.y + (r.z+1.)*(r.z+1.));
    vec2 matcapUv = r.xy / m + 0.5;
    vMatcapUv = matcapUv;


    // vPosition = position;
    vOrigin = vec3(inverse(modelMatrix) * vec4(uCameraPos, 1.)).xyz;
    vDirection = position - vOrigin;
}