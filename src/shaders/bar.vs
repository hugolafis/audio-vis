uniform float bufferData[NUM_BARS];

in uint bufferIndex;

const float uintToFloat = 1.0 / 255.0;

void main() {
  vec3 transformed = position;

  if (position.y >= 0.0) {
    float val = (bufferData[bufferIndex] * uintToFloat) * 2.0;
    transformed.y = -1.0 + val;
  }

  gl_Position = vec4(transformed, 1.0);
}


