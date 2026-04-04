import{Q7 as B}from"./chunk-aqv78bm4.js";import{Dia as z,Gia as A}from"./chunk-cs8pe1v7.js";var F=z((k)=>{Object.defineProperty(k,"__esModule",{value:!0});k.getMachineId=void 0;var C=A("fs"),D=B();async function E(){let v=["/etc/machine-id","/var/lib/dbus/machine-id"];for(let w of v)try{return(await C.promises.readFile(w,{encoding:"utf8"})).trim()}catch(b){D.diag.debug(`error reading machine id: ${b}`)}return}k.getMachineId=E});export default F();

//# debugId=EE762F53602A921C64756E2164756E21
