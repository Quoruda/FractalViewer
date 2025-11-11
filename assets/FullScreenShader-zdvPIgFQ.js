import{_ as T,r as m,k as P,l as k,w as G,a as b,o as A,d as B,b as W,t as M,f as V,i as $,m as H,F as O}from"./index-CjwQT9DZ.js";const q={class:"shader-container"},Z=["width","height"],K={key:0,class:"error"},j={__name:"WebGLShader",props:{vertexShader:{type:String,default:`
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `},fragmentShader:{type:String,default:`
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_offset;
      uniform float u_zoom;

      void main() {
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uv = (gl_FragCoord.xy / u_resolution) * u_zoom + u_offset;
        uv = uv * vec2(aspect, 1.0);

        // Grille
        vec2 grid = fract(uv * 10.0);
        float line = step(0.95, grid.x) + step(0.95, grid.y);

        // Cercles animés
        vec2 center = floor(uv * 10.0) + 0.5;
        center = center / 10.0;
        float dist = length(uv - center);
        float circle = smoothstep(0.05, 0.04, dist);

        // Couleur basée sur la position
        vec3 color = vec3(fract(center.x), fract(center.y), sin(u_time + center.x + center.y) * 0.5 + 0.5);

        // Combinaison
        color = mix(vec3(0.1), color, circle);
        color = mix(color, vec3(1.0), line * 0.5);

        gl_FragColor = vec4(color, 1.0);
      }
    `},width:{type:Number,default:800},height:{type:Number,default:600}},setup(g){const r=g,h=m(null),v=m("");let o=null,l=null,_=null,F=Date.now();const i=m({x:0,y:0});let u=!1,d={x:0,y:0};const s=m(1);let L=0,w={x:0,y:0},f={};function Y(e,t,a){const n=e.createShader(t);if(e.shaderSource(n,a),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(n);throw e.deleteShader(n),new Error(`Erreur compilation shader: ${c}`)}return n}function z(e,t,a){const n=e.createProgram();if(e.attachShader(n,t),e.attachShader(n,a),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){const c=e.getProgramInfoLog(n);throw e.deleteProgram(n),new Error(`Erreur link program: ${c}`)}return n}function X(){v.value="";try{if(o=h.value.getContext("webgl")||h.value.getContext("experimental-webgl"),!o)throw new Error("WebGL non supporté");const e=Y(o,o.VERTEX_SHADER,r.vertexShader),t=Y(o,o.FRAGMENT_SHADER,r.fragmentShader);l=z(o,e,t),o.deleteShader(e),o.deleteShader(t);const a=new Float32Array([-1,-1,1,-1,-1,1,1,1]),n=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,n),o.bufferData(o.ARRAY_BUFFER,a,o.STATIC_DRAW);const c=o.getAttribLocation(l,"a_position");o.enableVertexAttribArray(c),o.vertexAttribPointer(c,2,o.FLOAT,!1,0,0),o.useProgram(l),f={resolution:o.getUniformLocation(l,"u_resolution"),time:o.getUniformLocation(l,"u_time"),offset:o.getUniformLocation(l,"u_offset"),zoom:o.getUniformLocation(l,"u_zoom")},C()}catch(e){v.value=e.message,console.error(e)}}function C(){if(!o||!l)return;const e=(Date.now()-F)/1e3;f.resolution&&o.uniform2f(f.resolution,r.width,r.height),f.time&&o.uniform1f(f.time,e),f.offset&&o.uniform2f(f.offset,i.value.x,i.value.y),f.zoom&&o.uniform1f(f.zoom,s.value),o.viewport(0,0,r.width,r.height),o.clearColor(0,0,0,1),o.clear(o.COLOR_BUFFER_BIT),o.drawArrays(o.TRIANGLE_STRIP,0,4),_=requestAnimationFrame(C)}function D(e){const t=e[0].clientX-e[1].clientX,a=e[0].clientY-e[1].clientY;return Math.sqrt(t*t+a*a)}function R(e){return{x:(e[0].clientX+e[1].clientX)/2,y:(e[0].clientY+e[1].clientY)/2}}return P(()=>{X();const e=h.value;e.addEventListener("mousedown",t=>{u=!0,d={x:t.clientX,y:t.clientY},e.style.cursor="grabbing"}),e.addEventListener("mousemove",t=>{if(!u)return;const a=(t.clientX-d.x)/r.width,n=(t.clientY-d.y)/r.height;i.value.x-=a/s.value,i.value.y+=n/s.value,d={x:t.clientX,y:t.clientY}}),e.addEventListener("mouseup",()=>{u=!1,e.style.cursor="grab"}),e.addEventListener("mouseleave",()=>{u=!1,e.style.cursor="grab"}),e.addEventListener("wheel",t=>{t.preventDefault();const a=e.getBoundingClientRect(),n=(t.clientX-a.left)/r.width,c=1-(t.clientY-a.top)/r.height,y=n/s.value+i.value.x,x=c/s.value+i.value.y,S=t.deltaY>0?.9:1.1,p=s.value*S;i.value.x=y-n/p,i.value.y=x-c/p,s.value=p}),e.addEventListener("touchstart",t=>{t.preventDefault(),t.touches.length===1?(u=!0,d={x:t.touches[0].clientX,y:t.touches[0].clientY}):t.touches.length===2&&(u=!1,L=D(t.touches),w=R(t.touches))},{passive:!1}),e.addEventListener("touchmove",t=>{if(t.preventDefault(),t.touches.length===1&&u){const a=t.touches[0],n=(a.clientX-d.x)/r.width,c=(a.clientY-d.y)/r.height;i.value.x-=n/s.value,i.value.y+=c/s.value,d={x:a.clientX,y:a.clientY}}else if(t.touches.length===2){const a=D(t.touches),n=R(t.touches),c=a/L,y=e.getBoundingClientRect(),x=(n.x-y.left)/r.width,S=1-(n.y-y.top)/r.height,p=x/s.value+i.value.x,I=S/s.value+i.value.y,E=s.value*c;i.value.x=p-x/E,i.value.y=I-S/E,s.value=E;const U=(n.x-w.x)/r.width,N=(n.y-w.y)/r.height;i.value.x-=U/s.value,i.value.y+=N/s.value,L=a,w=n}},{passive:!1}),e.addEventListener("touchend",t=>{t.preventDefault(),t.touches.length===0?u=!1:t.touches.length===1&&(u=!0,d={x:t.touches[0].clientX,y:t.touches[0].clientY})},{passive:!1}),e.addEventListener("touchcancel",t=>{t.preventDefault(),u=!1},{passive:!1}),e.style.cursor="grab",e.style.touchAction="none"}),k(()=>{_&&cancelAnimationFrame(_),o&&l&&o.deleteProgram(l)}),G(()=>[r.vertexShader,r.fragmentShader],()=>{_&&cancelAnimationFrame(_),F=Date.now(),X()}),(e,t)=>(A(),b("div",q,[B("canvas",{ref_key:"canvas",ref:h,width:g.width,height:g.height},null,8,Z),v.value?(A(),b("div",K,M(v.value),1)):W("",!0)]))}},J=T(j,[["__scopeId","data-v-1162c2b3"]]),Q={class:"layout-container"},ee={__name:"FullScreenShader",props:{fragmentShader:{type:String,required:!1,default:`
    precision highp float;
    uniform vec2 u_resolution;
    void main(){
      vec2 uv = gl_FragCoord.xy / u_resolution;
      gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(uv.x * 10.0), 1.0);
    }
    `}},setup(g){const r=m(window.innerWidth),h=m(window.innerHeight);function v(){r.value=window.innerWidth,h.value=window.innerHeight}return P(()=>{window.addEventListener("resize",v)}),V(()=>{window.removeEventListener("resize",v)}),(o,l)=>(A(),b(O,null,[$(J,{class:"fullscreen-shader",width:r.value,height:h.value,fragmentShader:g.fragmentShader},null,8,["width","height","fragmentShader"]),B("div",Q,[H(o.$slots,"default",{},void 0)])],64))}},oe=T(ee,[["__scopeId","data-v-e7390950"]]);export{oe as F};
