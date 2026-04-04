import{Fia as B}from"./chunk-cs8pe1v7.js";function F(z){let k=z.trim();if(!k.startsWith("/"))return null;let b=k.slice(1).split(" ");if(!b[0])return null;let j=b[0],l=!1,q=1;if(b.length>1&&b[1]==="(MCP)")j=j+" (MCP)",l=!0,q=2;let A=b.slice(q).join(" ");return{commandName:j,args:A,isMcp:l}}var C=()=>{};
export{F as tg,C as ug};

//# debugId=6C1A2A9EB0F4EE0664756E2164756E21
