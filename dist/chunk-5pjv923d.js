import{Dia as a}from"./chunk-cs8pe1v7.js";var i=a((f)=>{function u(t){let r={};if(t=t.replace(/^\?/,""),t)for(let n of t.split("&")){let[e,s=null]=n.split("=");if(e=decodeURIComponent(e),s)s=decodeURIComponent(s);if(!(e in r))r[e]=s;else if(Array.isArray(r[e]))r[e].push(s);else r[e]=[r[e],s]}return r}f.parseQueryString=u});var U=a((d)=>{var y=i(),c=(t)=>{if(typeof t==="string")return c(new URL(t));let{hostname:r,pathname:n,port:e,protocol:s,search:o}=t,p;if(o)p=y.parseQueryString(o);return{hostname:r,port:e?parseInt(e):void 0,protocol:s,path:n,query:p}};d.parseUrl=c});
export{U as yia};

//# debugId=65C46EFED0B9BC4164756E2164756E21
