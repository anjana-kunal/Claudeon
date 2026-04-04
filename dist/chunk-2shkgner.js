import{Zl as v,_l as M,tH as U,wE as F,xE as x,xH as B}from"./chunk-tzyj4bcp.js";import{HV as j,OV as A,wX as P}from"./chunk-n3383yqa.js";import{b9 as G,h9 as b}from"./chunk-asavmsds.js";import{Fia as V}from"./chunk-cs8pe1v7.js";async function C(X){let{messages:K,getAppState:R,options:{mainLoopModel:O,tools:$,agentDefinitions:z,customSystemPrompt:Y,appendSystemPrompt:Z}}=X,W=U(K),{messages:Q}=await v(W),I=R();return F(Q,O,async()=>I.toolPermissionContext,$,z,void 0,{options:{customSystemPrompt:Y,appendSystemPrompt:Z}},void 0,W)}async function c(X,K){let R=await C(K);return{type:"text",value:D(R)}}function D(X){let{categories:K,totalTokens:R,rawMaxTokens:O,percentage:$,model:z,memoryFiles:Y,mcpTools:Z,agents:W,skills:Q,messageBreakdown:I,systemTools:_,systemPromptSections:L}=X,q=`## Context Usage

`;q+=`**Model:** ${z}  
`,q+=`**Tokens:** ${G(R)} / ${G(O)} (${$}%)
`,q+=`
`;let N=K.filter((E)=>E.tokens>0&&E.name!=="Free space"&&E.name!=="Autocompact buffer");if(N.length>0){q+=`### Estimated usage by category

`,q+=`| Category | Tokens | Percentage |
`,q+=`|----------|--------|------------|
`;for(let J of N){let h=(J.tokens/O*100).toFixed(1);q+=`| ${J.name} | ${G(J.tokens)} | ${h}% |
`}let E=K.find((J)=>J.name==="Free space");if(E&&E.tokens>0){let J=(E.tokens/O*100).toFixed(1);q+=`| Free space | ${G(E.tokens)} | ${J}% |
`}let H=K.find((J)=>J.name==="Autocompact buffer");if(H&&H.tokens>0){let J=(H.tokens/O*100).toFixed(1);q+=`| Autocompact buffer | ${G(H.tokens)} | ${J}% |
`}q+=`
`}if(Z.length>0){q+=`### MCP Tools

`,q+=`| Tool | Server | Tokens |
`,q+=`|------|--------|--------|
`;for(let E of Z)q+=`| ${E.name} | ${E.serverName} | ${G(E.tokens)} |
`;q+=`
`}if(_&&_.length>0&&process.env.USER_TYPE==="ant"){q+=`### [ANT-ONLY] System Tools

`,q+=`| Tool | Tokens |
`,q+=`|------|--------|
`;for(let E of _)q+=`| ${E.name} | ${G(E.tokens)} |
`;q+=`
`}if(L&&L.length>0&&process.env.USER_TYPE==="ant"){q+=`### [ANT-ONLY] System Prompt Sections

`,q+=`| Section | Tokens |
`,q+=`|---------|--------|
`;for(let E of L)q+=`| ${E.name} | ${G(E.tokens)} |
`;q+=`
`}if(W.length>0){q+=`### Custom Agents

`,q+=`| Agent Type | Source | Tokens |
`,q+=`|------------|--------|--------|
`;for(let E of W){let H;switch(E.source){case"projectSettings":H="Project";break;case"userSettings":H="User";break;case"localSettings":H="Local";break;case"flagSettings":H="Flag";break;case"policySettings":H="Policy";break;case"plugin":H="Plugin";break;case"built-in":H="Built-in";break;default:H=String(E.source)}q+=`| ${E.agentType} | ${H} | ${G(E.tokens)} |
`}q+=`
`}if(Y.length>0){q+=`### Memory Files

`,q+=`| Type | Path | Tokens |
`,q+=`|------|------|--------|
`;for(let E of Y)q+=`| ${E.type} | ${E.path} | ${G(E.tokens)} |
`;q+=`
`}if(Q&&Q.tokens>0&&Q.skillFrontmatter.length>0){q+=`### Skills

`,q+=`| Skill | Source | Tokens |
`,q+=`|-------|--------|--------|
`;for(let E of Q.skillFrontmatter)q+=`| ${E.name} | ${j(E.source)} | ${G(E.tokens)} |
`;q+=`
`}if(I&&process.env.USER_TYPE==="ant"){if(q+=`### [ANT-ONLY] Message Breakdown

`,q+=`| Category | Tokens |
`,q+=`|----------|--------|
`,q+=`| Tool calls | ${G(I.toolCallTokens)} |
`,q+=`| Tool results | ${G(I.toolResultTokens)} |
`,q+=`| Attachments | ${G(I.attachmentTokens)} |
`,q+=`| Assistant messages (non-tool) | ${G(I.assistantMessageTokens)} |
`,q+=`| User messages (non-tool-result) | ${G(I.userMessageTokens)} |
`,q+=`
`,I.toolCallsByType.length>0){q+=`#### Top Tools

`,q+=`| Tool | Call Tokens | Result Tokens |
`,q+=`|------|-------------|---------------|
`;for(let E of I.toolCallsByType)q+=`| ${E.name} | ${G(E.callTokens)} | ${G(E.resultTokens)} |
`;q+=`
`}if(I.attachmentsByType.length>0){q+=`#### Top Attachments

`,q+=`| Attachment | Tokens |
`,q+=`|------------|--------|
`;for(let E of I.attachmentsByType)q+=`| ${E.name} | ${G(E.tokens)} |
`;q+=`
`}}return q}var w=V(()=>{M();x();b();B();A();P()});
export{C as he,c as ie,w as je};

//# debugId=2DF3C3D641BDF05C64756E2164756E21
