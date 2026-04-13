import{An as r,Bi as p,KG as C,MG as _,NE as k,OE as L,PE as l,sy as A,ty as d,xH as i,yi as G,zn as F}from"./chunk-sx42anxf.js";import{$P as U,bQ as u}from"./chunk-906farf8.js";import{OU as O,PU as h}from"./chunk-mpyxhv23.js";import{Caa as b,Eaa as I,mba as y,qba as D}from"./chunk-qr0xq9ye.js";import{Gba as j,Tba as T}from"./chunk-akrrkem2.js";import{Fia as N}from"./chunk-cs8pe1v7.js";import{join as M}from"path";function f(){return`IMPORTANT: This message and these instructions are NOT part of the actual user conversation. Do NOT include any references to "documentation updates", "magic docs", or these update instructions in the document content.

Based on the user conversation above (EXCLUDING this documentation update instruction message), update the Magic Doc file to incorporate any NEW learnings, insights, or information that would be valuable to preserve.

The file {{docPath}} has already been read for you. Here are its current contents:
<current_doc_content>
{{docContents}}
</current_doc_content>

Document title: {{docTitle}}
{{customInstructions}}

Your ONLY task is to use the Edit tool to update the documentation file if there is substantial new information to add, then stop. You can make multiple edits (update multiple sections as needed) - make all Edit tool calls in parallel in a single message. If there's nothing substantial to add, simply respond with a brief explanation and do not call any tools.

CRITICAL RULES FOR EDITING:
- Preserve the Magic Doc header exactly as-is: # MAGIC DOC: {{docTitle}}
- If there's an italicized line immediately after the header, preserve it exactly as-is
- Keep the document CURRENT with the latest state of the codebase - this is NOT a changelog or history
- Update information IN-PLACE to reflect the current state - do NOT append historical notes or track changes over time
- Remove or replace outdated information rather than adding "Previously..." or "Updated to..." notes
- Clean up or DELETE sections that are no longer relevant or don't align with the document's purpose
- Fix obvious errors: typos, grammar mistakes, broken formatting, incorrect information, or confusing statements
- Keep the document well organized: use clear headings, logical section order, consistent formatting, and proper nesting

DOCUMENTATION PHILOSOPHY - READ CAREFULLY:
- BE TERSE. High signal only. No filler words or unnecessary elaboration.
- Documentation is for OVERVIEWS, ARCHITECTURE, and ENTRY POINTS - not detailed code walkthroughs
- Do NOT duplicate information that's already obvious from reading the source code
- Do NOT document every function, parameter, or line number reference
- Focus on: WHY things exist, HOW components connect, WHERE to start reading, WHAT patterns are used
- Skip: detailed implementation steps, exhaustive API docs, play-by-play narratives

What TO document:
- High-level architecture and system design
- Non-obvious patterns, conventions, or gotchas
- Key entry points and where to start reading code
- Important design decisions and their rationale
- Critical dependencies or integration points
- References to related files, docs, or code (like a wiki) - help readers navigate to relevant context

What NOT to document:
- Anything obvious from reading the code itself
- Exhaustive lists of files, functions, or parameters
- Step-by-step implementation details
- Low-level code mechanics
- Information already in CLAUDE.md or other project docs

Use the Edit tool with file_path: {{docPath}}

REMEMBER: Only update if there is substantial new information. The Magic Doc header (# MAGIC DOC: {{docTitle}}) must remain unchanged.`}async function g(){let w=y(),z=M(j(),"magic-docs","prompt.md");try{return await w.readFile(z,{encoding:"utf-8"})}catch{return f()}}function m(w,z){return w.replace(/\{\{(\w+)\}\}/g,(B,J)=>Object.prototype.hasOwnProperty.call(z,J)?z[J]:B)}async function R(w,z,B,J){let Z=await g(),K=J?`

DOCUMENT-SPECIFIC UPDATE INSTRUCTIONS:
The document author has provided specific instructions for how this file should be updated. Pay extra attention to these instructions and follow them carefully:

"${J}"

These instructions take priority over the general rules below. Make sure your updates align with these specific guidelines.`:"";return m(Z,{docContents:w,docPath:z,docTitle:B,customInstructions:K})}var S=N(()=>{T();D()});function qw(){X.clear()}function x(w){let z=w.match(s);if(!z||!z[1])return null;let B=z[1].trim(),J=z.index+z[0].length,K=w.slice(J).match(/^\s*\n(?:\s*\n)?(.+?)(?:\n|$)/);if(K&&K[1]){let Y=K[1].match(a);if(Y&&Y[1]){let $=Y[1].trim();return{title:B,instructions:$}}}return{title:B}}function n(w){if(!X.has(w))X.set(w,{path:w})}function c(){return{agentType:"magic-docs",whenToUse:"Update Magic Docs",tools:[G],model:"sonnet",source:"built-in",baseDir:"built-in",getSystemPrompt:()=>""}}async function o(w,z){let{messages:B,systemPrompt:J,userContext:Z,systemContext:K,toolUseContext:V}=z,Y=U(V.readFileState);Y.delete(w.path);let $={...V,readFileState:Y},q="";try{let W=(await L.call({file_path:w.path},$)).data;if(W.type==="text")q=W.file.content}catch(Q){if(b(Q)||Q instanceof Error&&Q.message.startsWith("File does not exist")){X.delete(w.path);return}throw Q}let v=x(q);if(!v){X.delete(w.path);return}let E=await R(q,w.path,v.title,v.instructions),P=async(Q,W)=>{if(Q.name===G&&typeof W==="object"&&W!==null&&"file_path"in W){let H=W.file_path;if(typeof H==="string"&&H===w.path)return{behavior:"allow",updatedInput:W}}return{behavior:"deny",message:`only ${G} is allowed for ${w.path}`,decisionReason:{type:"other",reason:`only ${G} is allowed`}}};for await(let Q of A({agentDefinition:c(),promptMessages:[_({content:E})],toolUseContext:$,canUseTool:P,isAsync:!0,forkContextMessages:B,querySource:"magic_docs",override:{systemPrompt:J,userContext:Z,systemContext:K},availableTools:$.options.tools}));}async function vw(){if(process.env.USER_TYPE==="ant")k((w,z)=>{if(x(z))n(w)}),F(e)}var s,a,X,e;var t=N(()=>{d();p();l();I();u();r();i();h();S();s=/^#\s*MAGIC\s+DOC:\s*(.+)$/im,a=/^[_*](.+?)[_*]\s*$/m,X=new Map;e=O(async function(w){let{messages:z,querySource:B}=w;if(B!=="repl_main_thread")return;if(C(z))return;if(X.size===0)return;for(let K of Array.from(X.values()))await o(K,w)})});
export{qw as Ve,vw as We,t as Xe};

//# debugId=7934DB42F696FA8664756E2164756E21
