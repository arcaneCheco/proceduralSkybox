uniform sampler2D uMap;

varying vec2 vUv;

vec4 blendScreen(vec4 base, vec4 blend) {
    return 1. - ((1. - base) * (1. - blend));
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 base = texture2D(uMap, vUv);

    vec2 direction = vec2(0.5) - vUv;

    vec4 color = vec4(0.);

    float total = 0.;
    for (float i=0.; i<20.; i++) {
        float lerp = (i + rand(gl_FragCoord.xy)) / 40.;

        float weight = sin(lerp * 3.1415);

        vec4 mysample = texture2D(uMap, vUv + 2.5 * direction * lerp);
        mysample.rgb *= mysample.a;
        color += mysample * weight;
        total += 1.;
    }

    color.a = 1.;
    color.rgb /= (total * 0.1);

    vec4 finalColor = blendScreen(base, color);

    gl_FragColor = finalColor;


    // gl_FragColor = vec4(1., 0., 0., 1.);
    // gl_FragColor = base;
}