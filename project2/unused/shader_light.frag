precision mediump float;

varying vec3 fPosition;
varying vec3 fNormal;

uniform vec3 color;
const float shininess = 60.0;

const vec3 lightAmb = vec3(0.5, 0.5, 0.5);
const vec3 lightDif = vec3(0.7, 0.7, 0.7);
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);

vec3 ambientColor = lightAmb * color;
vec3 diffuseColor = lightDif * color;
vec3 specularColor = lightSpe * vec3(1.0, 1.0, 1.0);

varying vec3 fLight;
varying vec3 fViewer;

void main() {

    vec3 L = normalize(fLight);
    vec3 V = normalize(fViewer);
    vec3 N = normalize(fNormal);
   
    // Compute the halfway vector for Phong-Blinn model
    vec3 H = normalize(L+V);

    // compute diffuse reflection, don't let the vertex be illuminated from behind...
    float diffuseFactor = max( dot(L,N), 0.0 );
    vec3 diffuse = diffuseFactor * diffuseColor;

    // compute specular reflection
    float specularFactor = pow(max(dot(N,H), 0.0), shininess);
    vec3 specular = specularFactor * specularColor;

    // specular reflection should be 0 if normal is pointing away from light source
    if( dot(L,N) < 0.0 ) {
        specular = vec3(0.0, 0.0, 0.0);
    }

    // add all 3 components from the illumination model (ambient, diffuse and specular)
    gl_FragColor = vec4(ambientColor + diffuse + specular, 1.0);
}
