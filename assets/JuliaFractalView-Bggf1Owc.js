import{_ as A,r as p,w as S,o as M,c as C,a as I,b as R,d as k,e as h,f as u,g as T,v as q}from"./index-BkrhsR9a.js";import{F as B}from"./FullScreenShader-BqJyaBy9.js";import{R as F}from"./RangeSlider-CdByZfbh.js";const D={style:{"margin-top":"1rem","margin-left":"10px"}},K={class:"demo-toggle",style:{display:"flex","align-items":"center",gap:"0.5rem",cursor:"pointer"}},E={__name:"JuliaFractalView",props:{demo:{type:Boolean,default:!1}},setup(V){const i=p(-1),r=p(0),o=p(!1);let a=null,l=null;const f=[{r:-.7269,i:.1889},{r:-.8,i:.156},{r:-.162,i:1.04},{r:-.12,i:.74},{r:-.391,i:-.587},{r:.285,i:.01},{r:.45,i:.1428},{r:-.70176,i:-.3842},{r:-.4,i:.6},{r:.3,i:.5},{r:-.54,i:.54},{r:-.1,i:.651},{r:.4,i:.2},{r:-.7,i:.27015},{r:-.835,i:-.2321},{r:-.8,i:0},{r:-.79,i:.15},{r:0,i:.8},{r:-.4,i:-.59},{r:-1.476,i:0},{r:.27334,i:.00742},{r:-.038088,i:.9754633},{r:-.11,i:.6557},{r:-.194,i:.6557},{r:-.75,i:.11},{r:.28,i:.008},{r:-.481762,i:-.531657},{r:0,i:1},{r:-1,i:0},{r:.32,i:.043},{r:-.618,i:0},{r:-.4,i:-.6},{r:.34,i:-.05},{r:-.123,i:.745},{r:-1.25,i:0},{r:0,i:-.8},{r:-.75,i:0},{r:.28,i:-.53},{r:-.12256,i:.74486},{r:-.7,i:.3},{r:.28,i:.53}],v=n=>{l||(l=n);const e=(n-l)/1e3,t=1,g=2,s=t+g,x=e%(s*f.length)/s,_=Math.floor(x),w=(_+1)%f.length,b=x-_;let c;if(b<t/s)c=0;else{const d=(b-t/s)/(g/s);c=d<.5?2*d*d:1-Math.pow(-2*d+2,2)/2}const m={r:i.value,i:r.value},y=f[w];i.value=m.r+(y.r-m.r)*c,r.value=m.i+(y.i-m.i)*c,o.value&&(a=requestAnimationFrame(v))};S(o,n=>{n?(l=null,a=requestAnimationFrame(v)):a&&(cancelAnimationFrame(a),a=null)}),M(()=>{a&&cancelAnimationFrame(a)}),V.demo&&(o.value=!0,l=null,a=requestAnimationFrame(v));const z=C(()=>`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_i;
uniform float u_r;
vec2 c = vec2(u_r, u_i);
const float maxLimit = 4.0;
const int MAX_ITER = 600;


vec2 multiplyComplex(vec2 a, vec2 b){
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float magnitudeSquared(vec2 v){
  return v.x * v.x + v.y * v.y;
}

// Fonction pour convertir HSV en RGB
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution ) / u_zoom + u_offset;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 z = (uv * 4.0 - vec2(2.0, 2.0)) * vec2(aspect, 1.0);

  float magnitude;
  gl_FragColor = vec4(0.0, 0.0, 0.0 , 1.0);

  for(int i = 0; i < MAX_ITER; i++){
    z = multiplyComplex(z, z) + c;
    magnitude = magnitudeSquared(z);
    if(magnitude > maxLimit){
      float t = float(i) / float(MAX_ITER);

      // Lissage pour des transitions plus douces
      float log_zn = log(magnitude) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      t = (float(i) + 1.0 - nu) / float(MAX_ITER);

      // Créer un dégradé de couleurs harmonieux
      float hue = fract(t * 2.0);
      float saturation = 0.65 + 0.15 * sin(t * 20.0);
      float brightness = 0.5 + 0.4 * sin(t * 15.0);

      vec3 color = hsv2rgb(vec3(hue, saturation, brightness));

      gl_FragColor = vec4(color, 1.0);
      break;
    }
  }
}
`);return(n,e)=>(k(),I(B,{fragmentShader:z.value,"custom-uniforms":{r:i.value,i:r.value}},{default:R(()=>[h(F,{modelValue:i.value,"onUpdate:modelValue":e[0]||(e[0]=t=>i.value=t),min:-2,max:2,step:1e-4,decimals:3,label:"Partie réelle",disabled:o.value},null,8,["modelValue","disabled"]),h(F,{modelValue:r.value,"onUpdate:modelValue":e[1]||(e[1]=t=>r.value=t),min:-2,max:2,step:1e-4,decimals:3,label:"Partie imaginaire",disabled:o.value},null,8,["modelValue","disabled"]),u("div",D,[u("label",K,[T(u("input",{type:"checkbox","onUpdate:modelValue":e[2]||(e[2]=t=>o.value=t),class:"demo-checkbox-input","aria-label":"Activer le mode démonstration"},null,512),[[q,o.value]]),e[3]||(e[3]=u("span",{class:"demo-custom","aria-hidden":"true"},null,-1)),e[4]||(e[4]=u("span",{class:"demo-label",style:{"user-select":"none"}},"Mode démonstration",-1))])])]),_:1},8,["fragmentShader","custom-uniforms"]))}},L=A(E,[["__scopeId","data-v-8b7a14b9"]]);export{L as default};
