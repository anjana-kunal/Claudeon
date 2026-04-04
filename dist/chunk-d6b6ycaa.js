import{DN as Z,EN as P}from"./chunk-0ywz3kjm.js";import{A3 as V,D3 as X,H3 as L,T3 as x,b4 as O,x3 as U,y3 as H}from"./chunk-n3383yqa.js";import{A9 as Q,C9 as B,z9 as J}from"./chunk-c13kxgct.js";import{Fia as y}from"./chunk-cs8pe1v7.js";function W(){if(U("datadog"))return!1;if(w!==void 0)return w;try{return x($)}catch{return!1}}function K(f,j){let q=V(f);if(q===0)return;let z=q!==null?{...j,sample_rate:q}:j;if(W())Z(f,J(z));X(f,z)}function Y(f,j){return K(f,j),Promise.resolve()}function k(){w=x($)}function r(){Q({logEvent:K,logEventAsync:Y})}var $="tengu_log_datadog_events",w=void 0;var b=y(()=>{P();L();O();B();H()});
export{k as Kg,r as Lg,b as Mg};

//# debugId=018B0D68FB44D55564756E2164756E21
