import{Sga as k,Tga as q,Uga as w,nha as x,qha as A}from"./chunk-cn83pdqq.js";import{Fia as z}from"./chunk-cs8pe1v7.js";function G(g,b){return{name:g,compute:b,cacheBreak:!1}}function I(g,b,f){return{name:g,compute:b,cacheBreak:!0}}async function J(g){let b=k();return Promise.all(g.map(async(f)=>{if(!f.cacheBreak&&b.has(f.name))return b.get(f.name)??null;let j=await f.compute();return q(f.name,j),j}))}function K(){w(),x()}var D=z(()=>{A()});
export{G as lO,I as mO,J as nO,K as oO,D as pO};

//# debugId=6960D79C61888C2B64756E2164756E21
