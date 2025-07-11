precision highp float;
precision highp int;

layout ( location = 0 ) out vec4 pc_fragColor;

in float vLength;
in float fresnel;
in float magnitude;

//vec3 lowColor = vec3(0.08, 0.29, 0.09);
vec3 lowColor = vec3( 0.29, 0.27, 0.08 );
vec3 highColor = vec3( 0.0, 0.93, 1.0 );

void main( ){
    // if (fresnel < 0.1) { 
    //     discard;
    // }

    vec3 color = mix( lowColor, highColor, vec3( magnitude ) );
    // float darkening = mix(0.0, 1.0, vLength);
    // color *= pow(darkening, 3.0);

    pc_fragColor = vec4( vec3( color ), 1.0 );
}