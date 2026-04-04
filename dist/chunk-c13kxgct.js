import{Fia as A}from"./chunk-cs8pe1v7.js";function C(h){let b;for(let j in h)if(j.startsWith("_PROTO_")){if(b===void 0)b={...h};delete b[j]}return b??h}function D(h){if(x!==null)return;if(x=h,z.length>0){let b=[...z];if(z.length=0,process.env.USER_TYPE==="ant")x.logEvent("analytics_sink_attached",{queued_event_count:b.length});queueMicrotask(()=>{for(let j of b)if(j.async)x.logEventAsync(j.eventName,j.metadata);else x.logEvent(j.eventName,j.metadata)})}}function F(h,b){if(x===null){z.push({eventName:h,metadata:b,async:!1});return}x.logEvent(h,b)}var z,x=null;var B=A(()=>{z=[]});
export{C as z9,D as A9,F as B9,B as C9};

//# debugId=82EBF5C343B0D12564756E2164756E21
