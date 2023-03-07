#version 300 es
precision mediump float;

in vec2 texCoords;

uniform sampler2D textureSampler;

out vec4 outColor;

void main() 
{
    vec4 texColor = texture(textureSampler, texCoords);
    float luminance = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    outColor = vec4(vec3(luminance), texColor.a);
}