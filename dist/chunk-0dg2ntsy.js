import{Sg as D}from"./chunk-8vqy1jz9.js";import{Q7 as C}from"./chunk-aqv78bm4.js";import{Dia as B}from"./chunk-cs8pe1v7.js";var H=B((q)=>{Object.defineProperty(q,"__esModule",{value:!0});q.getMachineId=void 0;var E=D(),F=C();async function G(){try{let f=(await(0,E.execAsync)('ioreg -rd1 -c "IOPlatformExpertDevice"')).stdout.split(`
`).find((z)=>z.includes("IOPlatformUUID"));if(!f)return;let k=f.split('" = "');if(k.length===2)return k[1].slice(0,-1)}catch(b){F.diag.debug(`error reading machine id: ${b}`)}return}q.getMachineId=G});export default H();

//# debugId=F96D990FA69E061E64756E2164756E21
