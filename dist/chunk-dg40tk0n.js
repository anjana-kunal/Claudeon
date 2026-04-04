import{Zm as H,_m as k,fN as L,hN as b,kH as J,xH as z}from"./chunk-tzyj4bcp.js";import{U4 as D,Z4 as R}from"./chunk-ecxjperv.js";import{x6 as Y,z6 as A}from"./chunk-6kr4cjqv.js";import{Z6 as F,_6 as X}from"./chunk-0xkapbpg.js";import{B9 as W,C9 as M}from"./chunk-c13kxgct.js";import{wba as q,zba as h}from"./chunk-qr0xq9ye.js";import{ifa as f,qha as C}from"./chunk-cn83pdqq.js";import{Fia as V}from"./chunk-cs8pe1v7.js";function T(U){let Q=[];for(let w of U){if(w.type!=="user"&&w.type!=="assistant")continue;if("isMeta"in w&&w.isMeta)continue;if("origin"in w&&w.origin&&w.origin.kind!=="human")continue;let K=w.message.content;if(typeof K==="string")Q.push(K);else if(Array.isArray(K)){for(let B of K)if("type"in B&&B.type==="text"&&"text"in B)Q.push(B.text)}}let G=Q.join(`
`);return G.length>$?G.slice(-$):G}async function S(U,Q){let G=U.trim();if(!G)return null;try{let w=await L({systemPrompt:H([P]),userPrompt:G,outputFormat:{type:"json_schema",schema:{type:"object",properties:{title:{type:"string"}},required:["title"],additionalProperties:!1}},signal:Q,options:{querySource:"generate_session_title",agents:[],isNonInteractiveSession:f(),hasAppendSystemPrompt:!1,mcpTools:[]}}),K=J(w.message.content),B=I().safeParse(D(K)),Z=B.success?B.data.title.trim()||null:null;return W("tengu_session_title_generated",{success:Z!==null}),Z}catch(w){return q(`generateSessionTitle failed: ${w}`,{level:"error"}),W("tengu_session_title_generated",{success:!1}),null}}var $=1000,P=`Generate a concise, sentence-case title (3-7 words) that captures the main topic or goal of this coding session. The title should be clear enough that the user recognizes the session in a list. Use sentence case: capitalize only the first word and proper nouns.

Return JSON with a single "title" field.

Good examples:
{"title": "Fix login button on mobile"}
{"title": "Add OAuth authentication"}
{"title": "Debug failing CI tests"}
{"title": "Refactor API client error handling"}

Bad (too vague): {"title": "Code changes"}
Bad (too long): {"title": "Investigate and fix the issue where the login button does not respond on mobile devices"}
Bad (wrong case): {"title": "Fix Login Button On Mobile"}`,I;var _=V(()=>{A();C();M();b();h();R();X();z();k();I=F(()=>Y.object({title:Y.string()}))});
export{T as Ob,S as Pb,_ as Qb};

//# debugId=54B485BB505DA34864756E2164756E21
