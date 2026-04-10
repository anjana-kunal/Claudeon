import{MG as V,Sm as L,Tm as Z,ZD as O,_D as $,kH as X,xH as v}from"./chunk-nvfqakxv.js";import{Fia as Y}from"./chunk-cs8pe1v7.js";function W(G){let D=[],H=G.matchAll(y);for(let z of H)if(z.index!==void 0)D.push({word:z[0],start:z.index,end:z.index+z[0].length});return D}async function b({question:G,cacheSafeParams:D}){let H=`<system-reminder>This is a side question from the user. You must answer this question directly in a single response.

IMPORTANT CONTEXT:
- You are a separate, lightweight agent spawned to answer this one question
- The main agent is NOT interrupted - it continues working independently in the background
- You share the conversation context but are a completely separate instance
- Do NOT reference being interrupted or what you were "previously doing" - that framing is incorrect

CRITICAL CONSTRAINTS:
- You have NO tools available - you cannot read files, run commands, search, or take any actions
- This is a one-off response - there will be no follow-up turns
- You can ONLY provide information based on what you already know from the conversation context
- NEVER say things like "Let me try...", "I'll now...", "Let me check...", or promise to take any action
- If you don't know the answer, say so - do not offer to look it up or investigate

Simply answer the question with the information you have.</system-reminder>

${G}`,z=await O({promptMessages:[V({content:H})],cacheSafeParams:D,canUseTool:async()=>({behavior:"deny",message:"Side questions cannot use tools",decisionReason:{type:"other",reason:"side_question"}}),querySource:"side_question",forkLabel:"side_question",maxTurns:1,skipCacheWrite:!0});return{response:C(z.messages),usage:z.totalUsage}}function C(G){let D=G.flatMap((z)=>z.type==="assistant"?z.message.content:[]);if(D.length>0){let z=X(D,`

`).trim();if(z)return z;let J=D.find((K)=>K.type==="tool_use");if(J)return`(The model tried to call ${"name"in J?J.name:"a tool"} instead of answering directly. Try rephrasing or ask in the main conversation.)`}let H=G.find((z)=>z.type==="system"&&("subtype"in z)&&z.subtype==="api_error");if(H)return`(API error: ${L(H.error)})`;return null}var y;var F=Y(()=>{Z();$();v();y=/^\/btw\b/gi});
export{W as Sf,b as Tf,F as Uf};

//# debugId=B9A4C412CE62783464756E2164756E21
