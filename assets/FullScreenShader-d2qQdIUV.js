import{_ as E,r as m,h as A,i as B,j as z,a as w,o as S,d as F,b as I,t as U,k as D,g as Y,l as N,F as X}from"./index-C0F7Rtko.js";const k={class:"shader-container"},G=["width","height"],W={key:0,class:"error"},V={__name:"WebGLShader",props:{vertexShader:{type:String,default:`
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
    `},width:{type:Number,default:800},height:{type:Number,default:600}},setup(h){const n=h,d=m(null),f=m("");let e=null,a=null,v=null,y=Date.now();const l=m({x:0,y:0});let g=!1,_={x:0,y:0};const u=m(1);let s={};function x(t,r,i){const o=t.createShader(r);if(t.shaderSource(o,i),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){const c=t.getShaderInfoLog(o);throw t.deleteShader(o),new Error(`Erreur compilation shader: ${c}`)}return o}function R(t,r,i){const o=t.createProgram();if(t.attachShader(o,r),t.attachShader(o,i),t.linkProgram(o),!t.getProgramParameter(o,t.LINK_STATUS)){const c=t.getProgramInfoLog(o);throw t.deleteProgram(o),new Error(`Erreur link program: ${c}`)}return o}function L(){f.value="";try{if(e=d.value.getContext("webgl")||d.value.getContext("experimental-webgl"),!e)throw new Error("WebGL non supporté");const t=x(e,e.VERTEX_SHADER,n.vertexShader),r=x(e,e.FRAGMENT_SHADER,n.fragmentShader);a=R(e,t,r),e.deleteShader(t),e.deleteShader(r);const i=new Float32Array([-1,-1,1,-1,-1,1,1,1]),o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,i,e.STATIC_DRAW);const c=e.getAttribLocation(a,"a_position");e.enableVertexAttribArray(c),e.vertexAttribPointer(c,2,e.FLOAT,!1,0,0),e.useProgram(a),s={resolution:e.getUniformLocation(a,"u_resolution"),time:e.getUniformLocation(a,"u_time"),offset:e.getUniformLocation(a,"u_offset"),zoom:e.getUniformLocation(a,"u_zoom")},b()}catch(t){f.value=t.message,console.error(t)}}function b(){if(!e||!a)return;const t=(Date.now()-y)/1e3;s.resolution&&e.uniform2f(s.resolution,n.width,n.height),s.time&&e.uniform1f(s.time,t),s.offset&&e.uniform2f(s.offset,l.value.x,l.value.y),s.zoom&&e.uniform1f(s.zoom,u.value),e.viewport(0,0,n.width,n.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLE_STRIP,0,4),v=requestAnimationFrame(b)}return A(()=>{L();const t=d.value;t.addEventListener("mousedown",r=>{g=!0,_={x:r.clientX,y:r.clientY},t.style.cursor="grabbing"}),t.addEventListener("mousemove",r=>{if(!g)return;const i=(r.clientX-_.x)/n.width,o=(r.clientY-_.y)/n.height;l.value.x-=i/u.value,l.value.y+=o/u.value,_={x:r.clientX,y:r.clientY}}),t.addEventListener("mouseup",()=>{g=!1,t.style.cursor="grab"}),t.addEventListener("mouseleave",()=>{g=!1,t.style.cursor="grab"}),t.addEventListener("wheel",r=>{r.preventDefault();const i=t.getBoundingClientRect(),o=(r.clientX-i.left)/n.width,c=1-(r.clientY-i.top)/n.height,C=o/u.value+l.value.x,P=c/u.value+l.value.y,T=r.deltaY>0?.9:1.1,p=u.value*T;l.value.x=C-o/p,l.value.y=P-c/p,u.value=p,console.log(u)}),t.style.cursor="grab"}),B(()=>{v&&cancelAnimationFrame(v),e&&a&&e.deleteProgram(a)}),z(()=>[n.vertexShader,n.fragmentShader],()=>{v&&cancelAnimationFrame(v),y=Date.now(),L()}),(t,r)=>(S(),w("div",k,[F("canvas",{ref_key:"canvas",ref:d,width:h.width,height:h.height},null,8,G),f.value?(S(),w("div",W,U(f.value),1)):I("",!0)]))}},$=E(V,[["__scopeId","data-v-1d85ef3b"]]),H={class:"layout-container"},M={__name:"FullScreenShader",props:{fragmentShader:{type:String,required:!1,default:`
    precision highp float;
    uniform vec2 u_resolution;
    void main(){
      vec2 uv = gl_FragCoord.xy / u_resolution;
      gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(uv.x * 10.0), 1.0);
    }
    `}},setup(h){const n=m(window.innerWidth),d=m(window.innerHeight);function f(){n.value=window.innerWidth,d.value=window.innerHeight}return A(()=>{window.addEventListener("resize",f)}),D(()=>{window.removeEventListener("resize",f)}),(e,a)=>(S(),w(X,null,[Y($,{class:"fullscreen-shader",width:n.value,height:d.value,fragmentShader:h.fragmentShader},null,8,["width","height","fragmentShader"]),F("div",H,[N(e.$slots,"default",{},void 0)])],64))}},q=E(M,[["__scopeId","data-v-e7390950"]]);export{q as F};
