import{Fia as K}from"./chunk-cs8pe1v7.js";function C(f){return(j)=>{if(j.code==="EPIPE")f.destroy()}}function M(){process.stdout.on("error",C(process.stdout)),process.stderr.on("error",C(process.stderr))}function G(f,j){if(f.destroyed)return;f.write(j)}function N(f){G(process.stdout,f)}function Q(f){G(process.stderr,f)}function R(f){console.error(f),process.exit(1)}function S(f,j){return new Promise((H)=>{let q=(J)=>{clearTimeout(B),f.off("end",z),f.off("data",A),H(J)},z=()=>q(!1),A=()=>clearTimeout(B),B=setTimeout(q,j,!0);f.once("end",z),f.once("data",A)})}var L=()=>{};
export{M as Aba,N as Bba,Q as Cba,R as Dba,S as Eba,L as Fba};

//# debugId=D50385BD07DC670264756E2164756E21
