precision highp float;
precision highp int;

in float height;

layout ( location = 0 ) out vec4 pc_fragColor;

void main( ){
  float val = height;
  vec3 color = vec3( val );
  pc_fragColor = vec4( color, 1.0 );
}