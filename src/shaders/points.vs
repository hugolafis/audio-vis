out float fresnel;

const vec3 FORWARD = vec3(0.0, 0.0, 1.0);
void main() {
    vec3 normal = normalize(position);
    vec3 viewNormal = normalize( (viewMatrix * vec4(normal, 0.0)).xyz );

    float dotP = dot(viewNormal, FORWARD);
    dotP = clamp(dotP, 0.0, 1.0) * 2.0;
    float invDotP = 2.0 - dotP;

    float combined = dotP * invDotP;

    fresnel = pow( combined, 2.0);

    gl_PointSize = 2.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

