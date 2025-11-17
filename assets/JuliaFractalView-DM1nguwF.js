import{_ as w,r as p,w as I,o as S,c as A,a as C,b as k,d as q,e as h,f as u,g as B,v as D}from"./index-OAAX1uwx.js";import{F as K}from"./FullScreenShader-DgaGeG_r.js";import{R as F}from"./RangeSlider-IOBid2nZ.js";const R={style:{"margin-top":"1rem","margin-left":"10px"}},P={class:"demo-toggle",style:{display:"flex","align-items":"center",gap:"0.5rem",cursor:"pointer"}},T={__name:"JuliaFractalView",props:{demo:{type:Boolean,default:!1}},setup(z){const o=p(-1),r=p(0),t=p(!1);let a=null,l=null;const f=[{r:-.7269,i:.1889},{r:-.8,i:.156},{r:-.162,i:1.04},{r:-.12,i:.74},{r:-.391,i:-.587},{r:.285,i:.01},{r:.45,i:.1428},{r:-.70176,i:-.3842},{r:-.4,i:.6},{r:.3,i:.5},{r:-.54,i:.54},{r:.355,i:.355},{r:-.1,i:.651},{r:.4,i:.2},{r:-.7,i:.27015},{r:.285,i:0},{r:-.835,i:-.2321},{r:-.8,i:0},{r:-.79,i:.15},{r:-.162,i:1.04},{r:0,i:.8},{r:-.4,i:-.59},{r:-1.476,i:0},{r:.27334,i:.00742},{r:-.038088,i:.9754633},{r:-.11,i:.6557},{r:-.194,i:.6557},{r:.3,i:-.01},{r:-.75,i:.11},{r:-.70176,i:.3842},{r:.28,i:.008},{r:-.481762,i:-.531657},{r:0,i:1},{r:-1,i:0},{r:.32,i:.043},{r:-.618,i:0},{r:-.4,i:-.6},{r:.34,i:-.05},{r:-.123,i:.745},{r:-.1,i:-.8},{r:-1.25,i:0},{r:0,i:-.8},{r:-.75,i:0},{r:.28,i:-.53},{r:-.221,i:-.713},{r:-.12256,i:.74486},{r:-.7,i:.3},{r:.28,i:.53}],v=n=>{l||(l=n);const e=(n-l)/1e3,i=1,x=2,s=i+x,g=e%(s*f.length)/s,b=Math.floor(g),M=(b+1)%f.length,_=g-b;let c;if(_<i/s)c=0;else{const d=(_-i/s)/(x/s);c=d<.5?2*d*d:1-Math.pow(-2*d+2,2)/2}const m={r:o.value,i:r.value},y=f[M];o.value=m.r+(y.r-m.r)*c,r.value=m.i+(y.i-m.i)*c,t.value&&(a=requestAnimationFrame(v))};I(t,n=>{n?(l=null,a=requestAnimationFrame(v)):a&&(cancelAnimationFrame(a),a=null)}),S(()=>{a&&cancelAnimationFrame(a)}),z.demo&&(t.value=!0,l=null,a=requestAnimationFrame(v));const V=A(()=>`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_i;
uniform float u_r;
vec2 c = vec2(u_r, u_i);
const float maxLimit = 4.0;
const int MAX_ITER = 2000;
int dynamicMaxIterations  = int(400.0 + 200.0 * log(u_zoom + 1.0));


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
    if (i >= dynamicMaxIterations) break;
    z = multiplyComplex(z, z) + c;
    magnitude = magnitudeSquared(z);
    if(magnitude > maxLimit){
      float t = float(i) / float(dynamicMaxIterations);

      // Lissage pour des transitions plus douces
      float log_zn = log(magnitude) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      t = (float(i) + 1.0 - nu) / float(dynamicMaxIterations);

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
`);return(n,e)=>(q(),C(K,{fragmentShader:V.value,"custom-uniforms":{r:o.value,i:r.value}},{default:k(()=>[h(F,{modelValue:o.value,"onUpdate:modelValue":e[0]||(e[0]=i=>o.value=i),min:-2,max:2,step:1e-4,decimals:3,label:"Partie réelle",disabled:t.value},null,8,["modelValue","disabled"]),h(F,{modelValue:r.value,"onUpdate:modelValue":e[1]||(e[1]=i=>r.value=i),min:-2,max:2,step:1e-4,decimals:3,label:"Partie imaginaire",disabled:t.value},null,8,["modelValue","disabled"]),u("div",R,[u("label",P,[B(u("input",{type:"checkbox","onUpdate:modelValue":e[2]||(e[2]=i=>t.value=i),class:"demo-checkbox-input","aria-label":"Activer le mode démonstration"},null,512),[[D,t.value]]),e[3]||(e[3]=u("span",{class:"demo-custom","aria-hidden":"true"},null,-1)),e[4]||(e[4]=u("span",{class:"demo-label",style:{"user-select":"none"}},"Mode démonstration",-1))])])]),_:1},8,["fragmentShader","custom-uniforms"]))}},N=w(T,[["__scopeId","data-v-7b668e41"]]);export{N as default};
