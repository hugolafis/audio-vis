const float PI = 3.14159265359;
const float invPi2 = 1.0 / (PI * 2.0);
const vec3 FORWARD = vec3(0.0, 0.0, 1.0); // todo fix
const float displacementRange = 0.5;
const float uintToFloat = 1.0 / 255.0;

uniform float bufferData[256]; // todo keep in sync...

out float vLength;
out float fresnel;
out float magnitude;

void main() {

    vec3 normal = normalize(position);
    vec3 viewNormal = normalize( (viewMatrix * vec4(normal, 0.0)).xyz );

    // Displacement
    //float angle = ((abs(atan(viewNormal.x, -viewNormal.y))) + PI) * invPi2;
    float angle = atan(normal.y, normal.x);
    float normalisedAngle = (angle + PI) / (2.0 * PI);

    int bufferIndex = int(normalisedAngle * 256.0);
    float bufferValue = bufferData[bufferIndex] * uintToFloat;

    vec3 displaced = position + normal * bufferValue * displacementRange;

    magnitude = length(position) * 2.0;
    magnitude = clamp(magnitude, 0.0, 1.0) * bufferValue;

    //displaced.z = sqrt(bufferValue * displacementRange) * magnitude;
    //displaced = normalize(displaced);

    // Fresnel 
    float dotP = dot(viewNormal, FORWARD);
    dotP = clamp(dotP, 0.0, 1.0) * 2.0;
    float invDotP = 2.0 - dotP;
    float combined = dotP * invDotP;
    fresnel = pow( combined, 5.0);
    // fresnel *= 4.0;
    // fresnel = fresnel - fract(fresnel);
    // fresnel *= 0.25;

    gl_PointSize = 4.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}

