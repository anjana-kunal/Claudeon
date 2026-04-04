import{Fia as v,Gia as k}from"./chunk-cs8pe1v7.js";function z(f){let g=0;for(let j=0;j<f.length;j++)g=(g<<5)-g+f.charCodeAt(j)|0;return g}function A(f){if(typeof Bun<"u")return Bun.hash(f).toString();return k("crypto").createHash("sha256").update(f).digest("hex")}function B(f,g){if(typeof Bun<"u")return Bun.hash(g,Bun.hash(f)).toString();return k("crypto").createHash("sha256").update(f).update("\x00").update(g).digest("hex")}var w=()=>{};
export{z as R$,A as S$,B as T$,w as U$};

//# debugId=B0DA0C320BDDCFE464756E2164756E21
