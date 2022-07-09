#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01

uniform float uTime;
uniform float uAspect;

varying vec2 vUv;

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

vec3 rd(vec2 uv, vec3 ro, vec3 lookAt, float zoom) {
    vec3 F = normalize(lookAt - ro);
    vec3 R = normalize(cross(vec3(0., 1., 0.), F));
    vec3 U = cross(F, R);
    vec3 C = ro + F * zoom;
    vec3 I = C + uv.x * R + uv.y * U;
    return normalize(I - ro);
}

float sdSphere(vec3 p) {
	return length(p) - 0.5;
}

float scene(vec3 p) {
	return sdSphere(p);
}

float RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    
    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        float dS = abs(scene(p));
        dO += dS;
        if(dO>MAX_DIST || dS<SURF_DIST) break;
    }
    
    return dO;
}


void main() {
	vec2 nUv = vUv - vec2(0.5);
    nUv.x *= uAspect;

	vec3 col = vec3(0.);
    vec3 ro = vec3(0., 4., -5.);

	ro.xz *= Rot(uTime);

	vec3 lookAt = vec3(0., 0., 0.);

    float zoom = 1.;

    vec3 rd = rd(nUv, ro, lookAt, zoom);

    float d = RayMarch(ro, rd);

	if(d<MAX_DIST) {
    	vec3 p = ro + rd * d;
		col = p;
    }

	gl_FragColor = vec4(col, 1.);
}