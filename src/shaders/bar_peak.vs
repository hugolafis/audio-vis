uniform float bufferData[NUM_BARS];

in uint bufferIndex;
out float height;

float normalizeToRange( float x, float minNew, float maxNew ){
  return x * ( maxNew - minNew ) + minNew;
}

void main( ){
  vec3 transformed = position;

  float val = bufferData[bufferIndex] * 2.0;
  if ( position.y >= 0.0 ){
    transformed.y = -1.0 + val;
  }else{
    transformed.y = -1.0 + val - 0.01; // todo define in pixels
  }

  height = ( bufferData[bufferIndex] );
  height *= ( transformed.y * 0.5 + 0.5 );
  height = normalizeToRange( height, 0.01, 1.0 );

  gl_Position = vec4( transformed, 1.0 );
}
