out float fresnel;

const float PI = 3.14159265359;
const float invPi = 1.0 / PI;
const vec3 FORWARD = vec3(0.0, 0.0, 1.0);
const float displacementRange = 1.0;

void main() {

    vec3 normal = normalize(position);
    vec3 viewNormal = normalize( (viewMatrix * vec4(normal, 0.0)).xyz );

    // Displacement
    float angle = (abs(atan(viewNormal.x, -viewNormal.y))) * PI * 2.0 * invPi;
    angle *= displacementRange; 
    vec3 displaced = position + normal * angle;

    // Fresnel 
    vec3 displacedNormal = normalize(displaced);
    vec3 displacedViewNormal = normalize( (viewMatrix * vec4(displacedNormal, 0.0)).xyz );
    
    float dotP = dot(displacedViewNormal, FORWARD);
    dotP = clamp(dotP, 0.0, 1.0) * 2.0;
    float invDotP = 2.0 - dotP;
    float combined = dotP * invDotP;
    fresnel = pow( combined, 2.0);


    gl_PointSize = 2.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}

