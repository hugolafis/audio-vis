precision highp float;
precision highp int;

layout(location = 0) out vec4 pc_fragColor;

in float fresnel;

void main() {
    if (fresnel < 0.3) { 
        discard;
    }

    pc_fragColor = vec4(vec3(fresnel), 1.0);
}