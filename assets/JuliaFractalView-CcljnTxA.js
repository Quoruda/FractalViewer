import{F as x}from"./FullScreenShader-x3R6pP4u.js";import{_,c as n,a as m,o as s,b as g,d as i,e as y,t as d,n as b,r as v,f as V,w as h,g as f}from"./index-BSujwAS7.js";const C={class:"range-slider"},S={key:0,class:"range-label"},z={class:"range-value"},N={class:"slider-container"},F={class:"slider-track"},I=["min","max","step","value"],k={__name:"RangeSlider",props:{modelValue:{type:Number,required:!0},min:{type:Number,default:0},max:{type:Number,default:100},step:{type:Number,default:1},label:{type:String,default:""},decimals:{type:Number,default:2}},emits:["update:modelValue"],setup(a,{emit:l}){const e=a,r=l,u=c=>{r("update:modelValue",parseFloat(c.target.value))},t=n(()=>e.modelValue.toFixed(e.decimals)),o=n(()=>(e.modelValue-e.min)/(e.max-e.min)*100);return(c,w)=>(s(),m("div",C,[a.label?(s(),m("label",S,[y(d(a.label)+" ",1),i("span",z,d(t.value),1)])):g("",!0),i("div",N,[i("div",F,[i("div",{class:"slider-fill",style:b({width:o.value+"%"})},null,4)]),i("input",{type:"range",min:a.min,max:a.max,step:a.step,value:a.modelValue,onInput:u,class:"slider"},null,40,I)])]))}},p=_(k,[["__scopeId","data-v-22825b36"]]),R={__name:"JuliaFractalView",setup(a){const l=v(-1),e=v(0),r=n(()=>`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
vec2 c = vec2(${l.value}, ${e.value});
const float maxLimit = 64.0;
const int MAX_ITER = 1000;
int dynamicMaxIterations  = int(80.0 + 60.0 * log(u_zoom + 1.0));


vec2 multiplyComplex(vec2 a, vec2 b){
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float magnitudeSquared(vec2 v){
  return v.x * v.x + v.y * v.y;
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
      vec3 coldColor = vec3(1.00, 0.50, 0.25);
      vec3 warmColor = vec3(0.08, 0.20, 0.35);

      float t = float(i) / float(dynamicMaxIterations);
      t = 0.5 + 0.5 * sin(6.2831 * t * 1.5);  // Crée des oscillations subtiles
      vec3 color = mix(coldColor, warmColor, t);


      gl_FragColor = vec4(color, 1.0);
      break;
    }
  }
}
`);return(u,t)=>(s(),V(x,{fragmentShader:r.value},{default:h(()=>[f(p,{modelValue:l.value,"onUpdate:modelValue":t[0]||(t[0]=o=>l.value=o),min:-1,max:1,step:.001,decimals:3,label:"Partie réelle"},null,8,["modelValue"]),f(p,{modelValue:e.value,"onUpdate:modelValue":t[1]||(t[1]=o=>e.value=o),min:-1,max:1,step:.001,decimals:3,label:"Partie imaginaire"},null,8,["modelValue"])]),_:1},8,["fragmentShader"]))}};export{R as default};
