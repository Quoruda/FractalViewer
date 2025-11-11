import{_ as w,c as y,a as S,o as h,b as C,d as o,e as A,t as B,n as q,r as b,w as D,f as K,g as P,h as R,i as z,j as T,v as $}from"./index-CjwQT9DZ.js";import{F as U}from"./FullScreenShader-zdvPIgFQ.js";const E={class:"range-slider"},J={key:0,class:"range-label"},L=["min","max","step","value"],j={class:"slider-container"},X={class:"slider-track"},G=["min","max","step","value"],H={__name:"RangeSlider",props:{modelValue:{type:Number,required:!0},min:{type:Number,default:0},max:{type:Number,default:100},step:{type:Number,default:1},label:{type:String,default:""},decimals:{type:Number,default:2}},emits:["update:modelValue"],setup(a,{emit:s}){const e=a,l=s,n=m=>{l("update:modelValue",parseFloat(m.target.value))},u=m=>{const i=parseFloat(m.target.value);isNaN(i)||l("update:modelValue",i)},c=m=>{let i=parseFloat(m.target.value);isNaN(i)?i=e.min:i=Math.max(e.min,Math.min(e.max,i)),l("update:modelValue",i)};y(()=>e.modelValue.toFixed(e.decimals));const d=y(()=>(e.modelValue-e.min)/(e.max-e.min)*100);return(m,i)=>(h(),S("div",E,[a.label?(h(),S("label",J,[A(B(a.label)+" ",1),o("input",{type:"number",min:a.min,max:a.max,step:a.step,value:a.modelValue,onInput:u,onBlur:c,class:"range-value"},null,40,L)])):C("",!0),o("div",j,[o("div",X,[o("div",{class:"slider-fill",style:q({width:d.value+"%"})},null,4)]),o("input",{type:"range",min:a.min,max:a.max,step:a.step,value:a.modelValue,onInput:n,class:"slider"},null,40,G)])]))}},M=w(H,[["__scopeId","data-v-53996263"]]),O={style:{"margin-top":"1rem","margin-left":"10px"}},Q={class:"demo-toggle",style:{display:"flex","align-items":"center",gap:"0.5rem",cursor:"pointer"}},W={__name:"JuliaFractalView",props:{demo:{type:Boolean,default:!1}},setup(a){const s=b(-1),e=b(0),l=b(!1);let n=null,u=null;const c=[{r:-.7269,i:.1889},{r:-.8,i:.156},{r:-.162,i:1.04},{r:-.12,i:.74},{r:-.391,i:-.587},{r:.285,i:.01},{r:.45,i:.1428},{r:-.70176,i:-.3842},{r:-.4,i:.6},{r:.3,i:.5},{r:-.54,i:.54},{r:.355,i:.355},{r:-.1,i:.651},{r:.4,i:.2},{r:-.7,i:.27015},{r:.285,i:0},{r:-.835,i:-.2321},{r:-.8,i:0},{r:-.79,i:.15},{r:-.162,i:1.04},{r:0,i:.8},{r:-.4,i:-.59},{r:-1.476,i:0},{r:.27334,i:.00742},{r:-.038088,i:.9754633},{r:-.11,i:.6557},{r:-.194,i:.6557},{r:.3,i:-.01},{r:-.75,i:.11},{r:-.70176,i:.3842},{r:.28,i:.008},{r:-.481762,i:-.531657},{r:0,i:1},{r:-1,i:0},{r:.32,i:.043},{r:-.618,i:0},{r:-.4,i:-.6},{r:.34,i:-.05},{r:-.123,i:.745},{r:-.1,i:-.8},{r:-1.25,i:0},{r:0,i:-.8},{r:-.75,i:0},{r:.28,i:-.53},{r:-.221,i:-.713},{r:-.12256,i:.74486},{r:-.7,i:.3},{r:.28,i:.53}],d=v=>{u||(u=v);const t=(v-u)/1e3,r=1,V=2,f=r+V,_=t%(f*c.length)/f,F=Math.floor(_),k=(F+1)%c.length,I=_-F;let p;if(I<r/f)p=0;else{const g=(I-r/f)/(V/f);p=g<.5?2*g*g:1-Math.pow(-2*g+2,2)/2}const x={r:s.value,i:e.value},N=c[k];s.value=x.r+(N.r-x.r)*p,e.value=x.i+(N.i-x.i)*p,l.value&&(n=requestAnimationFrame(d))};D(l,v=>{v?(u=null,n=requestAnimationFrame(d)):n&&(cancelAnimationFrame(n),n=null)}),K(()=>{n&&cancelAnimationFrame(n)}),a.demo&&(l.value=!0,u=null,n=requestAnimationFrame(d));const i=y(()=>`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
vec2 c = vec2(${s.value}, ${e.value});
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
`);return(v,t)=>(h(),P(U,{fragmentShader:i.value},{default:R(()=>[z(M,{modelValue:s.value,"onUpdate:modelValue":t[0]||(t[0]=r=>s.value=r),min:-2,max:2,step:1e-4,decimals:3,label:"Partie réelle",disabled:l.value},null,8,["modelValue","disabled"]),z(M,{modelValue:e.value,"onUpdate:modelValue":t[1]||(t[1]=r=>e.value=r),min:-2,max:2,step:1e-4,decimals:3,label:"Partie imaginaire",disabled:l.value},null,8,["modelValue","disabled"]),o("div",O,[o("label",Q,[T(o("input",{type:"checkbox","onUpdate:modelValue":t[2]||(t[2]=r=>l.value=r),class:"demo-checkbox-input","aria-label":"Activer le mode démonstration"},null,512),[[$,l.value]]),t[3]||(t[3]=o("span",{class:"demo-custom","aria-hidden":"true"},null,-1)),t[4]||(t[4]=o("span",{class:"demo-label",style:{"user-select":"none"}},"Mode démonstration",-1))])])]),_:1},8,["fragmentShader"]))}},ee=w(W,[["__scopeId","data-v-74b5f4ef"]]);export{ee as default};
