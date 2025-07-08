uniform float bufferData[NUM_BARS];

in uint bufferIndex;
out float height;

const float uintToFloat = 1.0 / 255.0;

float normalizeToRange(float x, float minNew, float maxNew) {
    return x * (maxNew - minNew) + minNew;
}

void main() {
  vec3 transformed = position;

  if (position.y >= 0.0) {
    float val = (bufferData[bufferIndex] * uintToFloat) * 2.0;
    transformed.y = -1.0 + val;
  }

  height = (bufferData[bufferIndex] * uintToFloat);
  height *= (transformed.y * 0.5 + 0.5);
  height = normalizeToRange(height, 0.01, 1.0);

  gl_Position = vec4(transformed, 1.0);
}


