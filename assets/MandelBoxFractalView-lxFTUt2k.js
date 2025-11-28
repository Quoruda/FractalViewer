import{F as c}from"./FullScreenShader-uZ4b5job.js";import{R as r}from"./RangeSlider-B7c8-dk7.js";import{r as l,c as n,a as d,b as f,d as m,h as p,e as i}from"./index-frrM4VUH.js";const b={__name:"MandelBoxFractalView",setup(u){const e=l(-3),t=l(1),s=n(()=>`
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_time;
uniform float u_scale;
uniform float u_foldLimit;

const float MAX_DISTANCE = 12.0;
const float MIN_RADIUS2 = 0.25;
const float FIXED_RADIUS2 = 1.0;
const int MAX_ITER = 10;
const float EPSILON = 0.001;
const int MAX_STEPS = 64;
const float SURFACE_DIST = 0.001;

//------------------------------------------------------
// Box folding
//------------------------------------------------------
void box_folding(inout vec3 p) {
    float fold = abs(u_foldLimit);
    p = clamp(p, -fold, fold) * 2.0 - p;
}

//------------------------------------------------------
// Sphere folding
//------------------------------------------------------
void sphere_folding(inout vec3 p, inout float dr) {
    float r2 = dot(p, p);
    if (r2 < MIN_RADIUS2) {
        float temp = FIXED_RADIUS2 / MIN_RADIUS2;
        p *= temp;
        dr *= temp;
    } else if (r2 < FIXED_RADIUS2) {
        float temp = FIXED_RADIUS2 / r2;
        p *= temp;
        dr *= temp;
    }
}

//------------------------------------------------------
// Mandelbox Distance Estimator
//------------------------------------------------------
float SDF(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;

    for (int i = 0; i < MAX_ITER; i++) {
        box_folding(z);
        sphere_folding(z, dr);
        z = z * u_scale + pos;         // garde le signe du scale
        dr = dr * abs(u_scale) + 1.0;  // dérivée avec |scale|
    }

    float r = length(z);
    return (r - 2.0) / abs(dr);        // DE conservateur
}

// Version qui retourne aussi les données pour la coloration
vec4 SDF_detailed(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float orbit_trap = 1e10;
    float iterations = 0.0;

    for (int i = 0; i < MAX_ITER; i++) {
        box_folding(z);
        sphere_folding(z, dr);

        // Orbit trap pour coloration
        orbit_trap = min(orbit_trap, length(z));

        z = z * u_scale + pos;
        dr = dr * abs(u_scale) + 1.0;
        iterations = float(i);
    }

    float r = length(z);
    float dist = (r - 2.0) / abs(dr);

    return vec4(dist, iterations / float(MAX_ITER), orbit_trap, r);
}

//------------------------------------------------------
// Calcul de la normale
//------------------------------------------------------
vec3 get_normal(vec3 p) {
    vec2 e = vec2(EPSILON, 0.0);
    return normalize(vec3(
        SDF(p + e.xyy) - SDF(p - e.xyy),
        SDF(p + e.yxy) - SDF(p - e.yxy),
        SDF(p + e.yyx) - SDF(p - e.yyx)
    ));
}

//------------------------------------------------------
// Ambient Occlusion
//------------------------------------------------------
float calcAO(vec3 pos, vec3 normal) {
    float ao = 0.0;
    float scale = 1.0;
    for (int i = 0; i < 3; i++) {  // réduit de 5 à 3 pour meilleures perfs
        float hr = 0.01 + 0.02 * float(i);
        vec3 aopos = normal * hr + pos;
        float dd = SDF(aopos);
        ao += -(dd - hr) * scale;
        scale *= 0.75;
    }
    return clamp(1.0 - 3.0 * ao, 0.0, 1.0);
}

//------------------------------------------------------
// Ray marching (retourne distance et données de coloration)
//------------------------------------------------------
vec4 ray_marching(vec3 pt, vec3 dir) {
    float total_distance = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 pos = pt + dir * total_distance;
        float distance = SDF(pos);

        float hitEps = max(EPSILON, SURFACE_DIST * total_distance);
        if (distance < hitEps) {
            vec4 details = SDF_detailed(pos);
            return vec4(max(total_distance, 0.001), details.yzw);
        }
        if (total_distance > MAX_DISTANCE) return vec4(-1.0, 0.0, 0.0, 0.0);

        total_distance += distance * 0.85; // facteur de sécurité
    }

    return vec4(-1.0, 0.0, 0.0, 0.0);
}

//------------------------------------------------------
// Programme principal
//------------------------------------------------------
void main() {
    float speed = 0.04;
    float t = max(0.0, u_time) * speed;

    // Position caméra
    vec3 base_pos = vec3(0.0, 0.0, 3.5);
    float travel = t * 0.08;
    vec3 camera_pos = base_pos + vec3(0.0, 0.0, -travel) *0.0;

    // Rotations caméra
    float yaw = u_offset.x * 3.14159;
    float pitch = -u_offset.y * 1.57;

    vec3 forward = normalize(vec3(
        sin(yaw) * cos(pitch),
        sin(pitch),
        -cos(yaw) * cos(pitch)
    ));
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    // Projection
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    uv.x *= aspect;

    vec3 ray_dir = normalize(forward + uv.x * right * 0.8 + uv.y * up * 0.8);

    // Ciel
    float skyGradient = ray_dir.y * 0.5 + 0.5;
    vec3 skyColor = mix(
        vec3(0.05, 0.03, 0.08),
        vec3(0.25, 0.4, 0.7),
        skyGradient
    );

    vec4 march_result = ray_marching(camera_pos, ray_dir);
    float distance = march_result.x;
    float iter_ratio = march_result.y;
    float orbit_trap = march_result.z;
    float final_radius = march_result.w;

    vec3 color = skyColor;

    if (distance > 0.0 && distance < MAX_DISTANCE) {
        vec3 hit_point = camera_pos + ray_dir * distance;
        vec3 normal = get_normal(hit_point);

        // Lumières
        vec3 light1_dir = normalize(vec3(1.0, 1.0, -0.5));
        vec3 light2_dir = normalize(vec3(-0.5, 0.5, 1.0));

        float diffuse1 = max(0.0, dot(normal, light1_dir));
        float diffuse2 = max(0.0, dot(normal, light2_dir));

        vec3 view_dir = normalize(camera_pos - hit_point);
        vec3 reflect_dir1 = reflect(-light1_dir, normal);
        float spec = pow(max(0.0, dot(view_dir, reflect_dir1)), 32.0);

        float ao = calcAO(hit_point, normal);

        // === Système de couleurs avec propagation depuis le centre ===

        // Distance du point de hit depuis l'origine
        float distFromOrigin = length(hit_point);

        // Palette de couleurs
        vec3 color1 = vec3(0.25, 0.30, 0.45);   // Bleu vif
        vec3 color2 = vec3(0.65, 0.35, 0.50);   // Prune saturé
        vec3 color3 = vec3(0.70, 0.50, 0.35);   // Brun orangé riche
        vec3 color4 = vec3(0.40, 0.60, 0.65);   // Bleu-vert lumineux
        vec3 color5 = vec3(0.75, 0.65, 0.40);   // Beige doré chaud

        // Propagation basée sur la distance + orbit trap pour plus de complexité
        float colorSpread = fract(distFromOrigin * 0.8 + orbit_trap * 1.5 - t * 0.3);

        // Interpolation fluide entre les couleurs avec smoothstep
        vec3 base_color;
        float segment = colorSpread * 4.0;

        if (segment < 1.0) {
            base_color = mix(color1, color2, smoothstep(0.0, 1.0, segment));
        } else if (segment < 2.0) {
            base_color = mix(color2, color3, smoothstep(0.0, 1.0, segment - 1.0));
        } else if (segment < 3.0) {
            base_color = mix(color3, color4, smoothstep(0.0, 1.0, segment - 2.0));
        } else {
            base_color = mix(color4, color5, smoothstep(0.0, 1.0, segment - 3.0));
        }

        // Modulation subtile basée sur les composantes XYZ
        float spatialMod = sin(hit_point.x * 2.0) * 0.06 +
                          sin(hit_point.y * 2.5) * 0.06 +
                          sin(hit_point.z * 2.0) * 0.06;
        base_color += spatialMod;

        // Variation très légère basée sur les itérations
        base_color = mix(base_color, base_color * 1.15, iter_ratio * 0.15);

        // Accentuation réduite basée sur la normale
        float normalEdge = pow(1.0 - abs(dot(normal, view_dir)), 2.0);
        base_color = mix(base_color, vec3(0.7, 0.65, 0.6), normalEdge * 0.1);

        float ambient = 0.25;
        float lighting = ambient + diffuse1 * 0.6 + diffuse2 * 0.4;

        color = base_color * lighting * ao;
        color += vec3(1.0) * spec * 0.5;

        // Brouillard
        float depth = distance / MAX_DISTANCE;
        float fog = smoothstep(0.3, 1.0, depth);
        color = mix(color, vec3(0.02, 0.01, 0.05), fog * 0.4);
    }

    color = clamp(color, 0.0, 1.0);
    color = pow(color, vec3(1.0 / 2.2)); // gamma standard
    gl_FragColor = vec4(color, 1.0);
}

`);return(_,o)=>(m(),d(c,{fragmentShader:s.value,"custom-uniforms":{scale:e.value,foldLimit:t.value},zoomImpactOnOffset:!1},{default:f(()=>[o[2]||(o[2]=p(" > ",-1)),i(r,{modelValue:e.value,"onUpdate:modelValue":o[0]||(o[0]=a=>e.value=a),min:-5,max:5,step:.01,label:"Scale"},null,8,["modelValue"]),i(r,{modelValue:t.value,"onUpdate:modelValue":o[1]||(o[1]=a=>t.value=a),min:0,max:5,step:.01,label:"Fold Limit"},null,8,["modelValue"])]),_:1},8,["fragmentShader","custom-uniforms"]))}};export{b as default};
