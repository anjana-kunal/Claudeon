import{IJ as LQ,PK as UQ,Qo as O,Rl as KQ,Ro as AQ,Sl as wQ,Zm as c,_m as xQ,gN as i,hN as N0,jL as WQ,kH as r,kL as GQ,oL as v0,xH as FQ}from"./chunk-nvfqakxv.js";import"./chunk-w98e3nqy.js";import"./chunk-2t7806ew.js";import"./chunk-fsyd24hq.js";import"./chunk-m8cqmtmy.js";import"./chunk-7079pzre.js";import"./chunk-595m1jnw.js";import"./chunk-z52h2j6e.js";import"./chunk-ypae4nye.js";import"./chunk-q7m48t48.js";import"./chunk-yg92ah7w.js";import"./chunk-fyerceam.js";import"./chunk-grapsc6q.js";import"./chunk-aeqbhhhb.js";import"./chunk-906farf8.js";import"./chunk-bnehv7xx.js";import"./chunk-grc1a5d0.js";import"./chunk-he0q471a.js";import"./chunk-rdattb4g.js";import"./chunk-5hdk4rq8.js";import"./chunk-ah92na1g.js";import"./chunk-kk7hxh65.js";import"./chunk-anqkwm0v.js";import"./chunk-7r50whq3.js";import"./chunk-4ks0c5f1.js";import"./chunk-qq2d9n97.js";import"./chunk-6574rjk4.js";import"./chunk-pbg8n371.js";import{ZW as XQ,_W as YQ,_Z as s,bX as EQ,qX as qQ,u0 as DQ,wX as jQ}from"./chunk-qa912cm8.js";import"./chunk-ecxjperv.js";import"./chunk-ccs0fecd.js";import"./chunk-yjgms4ep.js";import"./chunk-6kr4cjqv.js";import"./chunk-pmk2m932.js";import"./chunk-d0tcr1pa.js";import"./chunk-vebf0sqn.js";import"./chunk-0xkapbpg.js";import"./chunk-xgb99t69.js";import"./chunk-6nv052qa.js";import"./chunk-ky8vfv6q.js";import"./chunk-wqqzqd5r.js";import"./chunk-bwprhd4t.js";import"./chunk-aqv78bm4.js";import"./chunk-c3ntnkm9.js";import"./chunk-7tv0hsgs.js";import"./chunk-gxtbrqng.js";import"./chunk-jz8356y4.js";import"./chunk-tv9gy9dh.js";import"./chunk-rfd5sckp.js";import"./chunk-kd48tng1.js";import"./chunk-vqfs5exq.js";import"./chunk-s624r7t4.js";import"./chunk-asavmsds.js";import"./chunk-yn2frn84.js";import"./chunk-c13kxgct.js";import"./chunk-cd3zgh8n.js";import"./chunk-yfk5e454.js";import"./chunk-wk2ksw1t.js";import"./chunk-5q1yqgkp.js";import"./chunk-md1fnd8q.js";import"./chunk-6ytmrnqq.js";import{R_ as m,T_ as RQ}from"./chunk-ksz63da1.js";import{L$ as e,Q$ as PQ}from"./chunk-c4511512.js";import"./chunk-7b1vyv7e.js";import"./chunk-tyqzht40.js";import{Eaa as NQ,eba as f,fba as h,iba as _Q,xaa as t}from"./chunk-qr0xq9ye.js";import"./chunk-2chyymxq.js";import{Gba as a,Tba as vQ}from"./chunk-akrrkem2.js";import"./chunk-cn83pdqq.js";import"./chunk-4rteakec.js";import"./chunk-awpswmwp.js";import"./chunk-nfma275k.js";import"./chunk-rwxy4pne.js";import"./chunk-kdy5gw6d.js";import"./chunk-pam4fwbt.js";import{Fia as OQ}from"./chunk-cs8pe1v7.js";import{execFileSync as MQ}from"child_process";import{constants as yQ}from"fs";import{copyFile as IQ,mkdir as l,mkdtemp as TQ,readdir as n,readFile as VQ,rm as CQ,unlink as kQ,writeFile as QQ}from"fs/promises";import{tmpdir as HQ}from"os";import{extname as bQ,join as F}from"path";function ZQ(){return s()}function SQ(){return s()}function u(){return F(a(),"usage-data")}function d(){return F(u(),"facets")}function o(){return F(u(),"session-meta")}function mQ(Q){let J=bQ(Q).toLowerCase();return gQ[J]||null}function cQ(Q){let J={},$={},q=0,V=0,L=0,Y=0,X=0,K=[],Z=0,W={},_=!1,E=0,v=0,M=new Set,D=[],y=[],I=!1,U=!1,x=!1,C=null;for(let T of Q.messages){let k=T.timestamp;if(T.type==="assistant"&&T.message){if(k)C=k;let j=T.message.usage;if(j)L+=j.input_tokens||0,Y+=j.output_tokens||0;let H=T.message.content;if(Array.isArray(H)){for(let z of H)if(z.type==="tool_use"&&"name"in z){let P=z.name;if(J[P]=(J[P]||0)+1,P===XQ||P===YQ)_=!0;if(P.startsWith("mcp__"))I=!0;if(P==="WebSearch")U=!0;if(P==="WebFetch")x=!0;let B=z.input;if(B){let G=B.file_path||"";if(G){let R=mQ(G);if(R)$[R]=($[R]||0)+1;if(P==="Edit"||P==="Write")M.add(G)}if(P==="Edit"){let R=B.old_string||"",w=B.new_string||"";for(let A of KQ(R,w)){if(A.added)E+=A.count||0;if(A.removed)v+=A.count||0}}if(P==="Write"){let R=B.content||"";if(R)E+=qQ(R,`
`)+1}let N=B.command||"";if(N.includes("git commit"))q++;if(N.includes("git push"))V++}}}}if(T.type==="user"&&T.message){let j=T.message.content,H=!1;if(typeof j==="string"&&j.trim())H=!0;else if(Array.isArray(j)){for(let z of j)if(z.type==="text"&&"text"in z){H=!0;break}}if(H){if(k)try{let P=new Date(k).getHours();D.push(P),y.push(k)}catch{}if(C&&k){let z=new Date(C).getTime(),B=(new Date(k).getTime()-z)/1000;if(B>2&&B<3600)K.push(B)}}if(Array.isArray(j)){for(let z of j)if(z.type==="tool_result"&&"content"in z){if(z.is_error){Z++;let B=z.content,G="Other";if(typeof B==="string"){let N=B.toLowerCase();if(N.includes("exit code"))G="Command Failed";else if(N.includes("rejected")||N.includes("doesn't want"))G="User Rejected";else if(N.includes("string to replace not found")||N.includes("no changes"))G="Edit Failed";else if(N.includes("modified since read"))G="File Changed";else if(N.includes("exceeds maximum")||N.includes("too large"))G="File Too Large";else if(N.includes("file not found")||N.includes("does not exist"))G="File Not Found"}W[G]=(W[G]||0)+1}}}if(typeof j==="string"){if(j.includes("[Request interrupted by user"))X++}else if(Array.isArray(j)){for(let z of j)if(z.type==="text"&&"text"in z&&z.text.includes("[Request interrupted by user")){X++;break}}}}return{toolCounts:J,languages:$,gitCommits:q,gitPushes:V,inputTokens:L,outputTokens:Y,userInterruptions:X,userResponseTimes:K,toolErrors:Z,toolErrorCategories:W,usesTaskAgent:_,usesMcp:I,usesWebSearch:U,usesWebFetch:x,linesAdded:E,linesRemoved:v,filesModified:M,messageHours:D,userMessageTimestamps:y}}function rQ(Q){return!Number.isNaN(Q.created.getTime())&&!Number.isNaN(Q.modified.getTime())}function $Q(Q){let J=cQ(Q),$=UQ(Q)||"unknown",q=Q.created.toISOString(),V=Math.round((Q.modified.getTime()-Q.created.getTime())/1000/60),L=0,Y=0;for(let X of Q.messages){if(X.type==="assistant")Y++;if(X.type==="user"&&X.message){let K=X.message.content,Z=!1;if(typeof K==="string"&&K.trim())Z=!0;else if(Array.isArray(K)){for(let W of K)if(W.type==="text"&&"text"in W){Z=!0;break}}if(Z)L++}}return{session_id:$,project_path:Q.projectPath||"",start_time:q,duration_minutes:V,user_message_count:L,assistant_message_count:Y,tool_counts:J.toolCounts,languages:J.languages,git_commits:J.gitCommits,git_pushes:J.gitPushes,input_tokens:J.inputTokens,output_tokens:J.outputTokens,first_prompt:Q.firstPrompt||"",summary:Q.summary,user_interruptions:J.userInterruptions,user_response_times:J.userResponseTimes,tool_errors:J.toolErrors,tool_error_categories:J.toolErrorCategories,uses_task_agent:J.usesTaskAgent,uses_mcp:J.usesMcp,uses_web_search:J.usesWebSearch,uses_web_fetch:J.usesWebFetch,lines_added:J.linesAdded,lines_removed:J.linesRemoved,files_modified:J.filesModified.size,message_hours:J.messageHours,user_message_timestamps:J.userMessageTimestamps}}function f0(Q){let J=new Map;for(let $ of Q){let q=$.meta.session_id,V=J.get(q);if(!V||$.meta.user_message_count>V.meta.user_message_count||$.meta.user_message_count===V.meta.user_message_count&&$.meta.duration_minutes>V.meta.duration_minutes)J.set(q,$)}return[...J.values()]}function lQ(Q){let J=[],$=$Q(Q);J.push(`Session: ${$.session_id.slice(0,8)}`),J.push(`Date: ${$.start_time}`),J.push(`Project: ${$.project_path}`),J.push(`Duration: ${$.duration_minutes} min`),J.push("");for(let q of Q.messages)if(q.type==="user"&&q.message){let V=q.message.content;if(typeof V==="string")J.push(`[User]: ${V.slice(0,500)}`);else if(Array.isArray(V)){for(let L of V)if(L.type==="text"&&"text"in L)J.push(`[User]: ${L.text.slice(0,500)}`)}}else if(q.type==="assistant"&&q.message){let V=q.message.content;if(Array.isArray(V)){for(let L of V)if(L.type==="text"&&"text"in L)J.push(`[Assistant]: ${L.text.slice(0,300)}`);else if(L.type==="tool_use"&&"name"in L)J.push(`[Tool: ${L.name}]`)}}return J.join(`
`)}async function nQ(Q){try{let J=await i({systemPrompt:c([]),userPrompt:iQ+Q,signal:new AbortController().signal,options:{model:ZQ(),querySource:"insights",agents:[],isNonInteractiveSession:!0,hasAppendSystemPrompt:!1,mcpTools:[],maxOutputTokensOverride:500}});return r(J.message.content)||Q.slice(0,2000)}catch{return Q.slice(0,2000)}}async function oQ(Q){let J=lQ(Q);if(J.length<=30000)return J;let $=25000,q=[];for(let X=0;X<J.length;X+=$)q.push(J.slice(X,X+$));let V=await Promise.all(q.map(nQ)),L=$Q(Q);return[`Session: ${L.session_id.slice(0,8)}`,`Date: ${L.start_time}`,`Project: ${L.project_path}`,`Duration: ${L.duration_minutes} min`,`[Long session - ${q.length} parts summarized]`,""].join(`
`)+V.join(`

---

`)}async function aQ(Q){let J=F(d(),`${Q}.json`);try{let $=await VQ(J,{encoding:"utf-8"}),q=h($);if(!BQ(q)){try{await kQ(J)}catch{}return null}return q}catch{return null}}async function tQ(Q){try{await l(d(),{recursive:!0})}catch{}let J=F(d(),`${Q.session_id}.json`);await QQ(J,f(Q,null,2),{encoding:"utf-8",mode:384})}async function eQ(Q){let J=F(o(),`${Q}.json`);try{let $=await VQ(J,{encoding:"utf-8"});return h($)}catch{return null}}async function sQ(Q){try{await l(o(),{recursive:!0})}catch{}let J=F(o(),`${Q.session_id}.json`);await QQ(J,f(Q,null,2),{encoding:"utf-8",mode:384})}async function Q0(Q,J){try{let $=await oQ(Q),q=`${dQ}${$}

RESPOND WITH ONLY A VALID JSON OBJECT matching this schema:
{
  "underlying_goal": "What the user fundamentally wanted to achieve",
  "goal_categories": {"category_name": count, ...},
  "outcome": "fully_achieved|mostly_achieved|partially_achieved|not_achieved|unclear_from_transcript",
  "user_satisfaction_counts": {"level": count, ...},
  "claude_helpfulness": "unhelpful|slightly_helpful|moderately_helpful|very_helpful|essential",
  "session_type": "single_task|multi_task|iterative_refinement|exploration|quick_question",
  "friction_counts": {"friction_type": count, ...},
  "friction_detail": "One sentence describing friction or empty",
  "primary_success": "none|fast_accurate_search|correct_code_edits|good_explanations|proactive_help|multi_file_changes|good_debugging",
  "brief_summary": "One sentence: what user wanted and whether they got it"
}`,V=await i({systemPrompt:c([]),userPrompt:q,signal:new AbortController().signal,options:{model:ZQ(),querySource:"insights",agents:[],isNonInteractiveSession:!0,hasAppendSystemPrompt:!1,mcpTools:[],maxOutputTokensOverride:4096}}),Y=r(V.message.content).match(/\{[\s\S]*\}/);if(!Y)return null;let X=h(Y[0]);if(!BQ(X))return null;return{...X,session_id:J}}catch($){return e(Error(`Facet extraction failed: ${t($).message}`)),null}}function $0(Q){let $=[];for(let K of Q)for(let Z of K.user_message_timestamps)try{let W=new Date(Z).getTime();$.push({ts:W,sessionId:K.session_id})}catch{}$.sort((K,Z)=>K.ts-Z.ts);let q=new Set,V=new Set,L=0,Y=new Map;for(let K=0;K<$.length;K++){let Z=$[K];while(L<K&&Z.ts-$[L].ts>1800000){let _=$[L];if(Y.get(_.sessionId)===L)Y.delete(_.sessionId);L++}let W=Y.get(Z.sessionId);if(W!==void 0)for(let _=W+1;_<K;_++){let E=$[_];if(E.sessionId!==Z.sessionId){let v=[Z.sessionId,E.sessionId].sort().join(":");q.add(v),V.add(`${$[W].ts}:${Z.sessionId}`),V.add(`${E.ts}:${E.sessionId}`),V.add(`${Z.ts}:${Z.sessionId}`);break}}Y.set(Z.sessionId,K)}let X=new Set;for(let K of q){let[Z,W]=K.split(":");if(Z)X.add(Z);if(W)X.add(W)}return{overlap_events:q.size,sessions_involved:X.size,user_messages_during:V.size}}function J0(Q,J){let $={total_sessions:Q.length,sessions_with_facets:J.size,date_range:{start:"",end:""},total_messages:0,total_duration_hours:0,total_input_tokens:0,total_output_tokens:0,tool_counts:{},languages:{},git_commits:0,git_pushes:0,projects:{},goal_categories:{},outcomes:{},satisfaction:{},helpfulness:{},session_types:{},friction:{},success:{},session_summaries:[],total_interruptions:0,total_tool_errors:0,tool_error_categories:{},user_response_times:[],median_response_time:0,avg_response_time:0,sessions_using_task_agent:0,sessions_using_mcp:0,sessions_using_web_search:0,sessions_using_web_fetch:0,total_lines_added:0,total_lines_removed:0,total_files_modified:0,days_active:0,messages_per_day:0,message_hours:[],multi_clauding:{overlap_events:0,sessions_involved:0,user_messages_during:0}},q=[],V=[],L=[];for(let X of Q){q.push(X.start_time),$.total_messages+=X.user_message_count,$.total_duration_hours+=X.duration_minutes/60,$.total_input_tokens+=X.input_tokens,$.total_output_tokens+=X.output_tokens,$.git_commits+=X.git_commits,$.git_pushes+=X.git_pushes,$.total_interruptions+=X.user_interruptions,$.total_tool_errors+=X.tool_errors;for(let[Z,W]of Object.entries(X.tool_error_categories))$.tool_error_categories[Z]=($.tool_error_categories[Z]||0)+W;if(V.push(...X.user_response_times),X.uses_task_agent)$.sessions_using_task_agent++;if(X.uses_mcp)$.sessions_using_mcp++;if(X.uses_web_search)$.sessions_using_web_search++;if(X.uses_web_fetch)$.sessions_using_web_fetch++;$.total_lines_added+=X.lines_added,$.total_lines_removed+=X.lines_removed,$.total_files_modified+=X.files_modified,L.push(...X.message_hours);for(let[Z,W]of Object.entries(X.tool_counts))$.tool_counts[Z]=($.tool_counts[Z]||0)+W;for(let[Z,W]of Object.entries(X.languages))$.languages[Z]=($.languages[Z]||0)+W;if(X.project_path)$.projects[X.project_path]=($.projects[X.project_path]||0)+1;let K=J.get(X.session_id);if(K){for(let[Z,W]of S(K.goal_categories))if(W>0)$.goal_categories[Z]=($.goal_categories[Z]||0)+W;$.outcomes[K.outcome]=($.outcomes[K.outcome]||0)+1;for(let[Z,W]of S(K.user_satisfaction_counts))if(W>0)$.satisfaction[Z]=($.satisfaction[Z]||0)+W;$.helpfulness[K.claude_helpfulness]=($.helpfulness[K.claude_helpfulness]||0)+1,$.session_types[K.session_type]=($.session_types[K.session_type]||0)+1;for(let[Z,W]of S(K.friction_counts))if(W>0)$.friction[Z]=($.friction[Z]||0)+W;if(K.primary_success!=="none")$.success[K.primary_success]=($.success[K.primary_success]||0)+1}if($.session_summaries.length<50)$.session_summaries.push({id:X.session_id.slice(0,8),date:X.start_time.split("T")[0]||"",summary:X.summary||X.first_prompt.slice(0,100),goal:K?.underlying_goal})}if(q.sort(),$.date_range.start=q[0]?.split("T")[0]||"",$.date_range.end=q[q.length-1]?.split("T")[0]||"",$.user_response_times=V,V.length>0){let X=[...V].sort((K,Z)=>K-Z);$.median_response_time=X[Math.floor(X.length/2)]||0,$.avg_response_time=V.reduce((K,Z)=>K+Z,0)/V.length}let Y=new Set(q.map((X)=>X.split("T")[0]));return $.days_active=Y.size,$.messages_per_day=$.days_active>0?Math.round($.total_messages/$.days_active*10)/10:0,$.message_hours=L,$.multi_clauding=$0(Q),$}async function JQ(Q,J){try{let $=await i({systemPrompt:c([]),userPrompt:Q.prompt+`

DATA:
`+J,signal:new AbortController().signal,options:{model:SQ(),querySource:"insights",agents:[],isNonInteractiveSession:!0,hasAppendSystemPrompt:!1,mcpTools:[],maxOutputTokensOverride:Q.maxTokens}}),q=r($.message.content);if(q){let V=q.match(/\{[\s\S]*\}/);if(V)try{return{name:Q.name,result:h(V[0])}}catch{return{name:Q.name,result:null}}}return{name:Q.name,result:null}}catch($){return e(Error(`${Q.name} failed: ${t($).message}`)),{name:Q.name,result:null}}}async function Y0(Q,J){let $=Array.from(J.values()).slice(0,50).map((U)=>`- ${U.brief_summary} (${U.outcome}, ${U.claude_helpfulness})`).join(`
`),q=Array.from(J.values()).filter((U)=>U.friction_detail).slice(0,20).map((U)=>`- ${U.friction_detail}`).join(`
`),V=Array.from(J.values()).flatMap((U)=>U.user_instructions_to_claude||[]).slice(0,15).map((U)=>`- ${U}`).join(`
`),Y=f({sessions:Q.total_sessions,analyzed:Q.sessions_with_facets,date_range:Q.date_range,messages:Q.total_messages,hours:Math.round(Q.total_duration_hours),commits:Q.git_commits,top_tools:Object.entries(Q.tool_counts).sort((U,x)=>x[1]-U[1]).slice(0,8),top_goals:Object.entries(Q.goal_categories).sort((U,x)=>x[1]-U[1]).slice(0,8),outcomes:Q.outcomes,satisfaction:Q.satisfaction,friction:Q.friction,success:Q.success,languages:Q.languages},null,2)+`

SESSION SUMMARIES:
`+$+`

FRICTION DETAILS:
`+q+`

USER INSTRUCTIONS TO CLAUDE:
`+(V||"None captured"),X=await Promise.all(X0.map((U)=>JQ(U,Y))),K={};for(let{name:U,result:x}of X)if(x)K[U]=x;let Z=K.project_areas?.areas?.map((U)=>`- ${U.name}: ${U.description}`).join(`
`)||"",W=K.what_works?.impressive_workflows?.map((U)=>`- ${U.title}: ${U.description}`).join(`
`)||"",_=K.friction_analysis?.categories?.map((U)=>`- ${U.category}: ${U.description}`).join(`
`)||"",E=K.suggestions?.features_to_try?.map((U)=>`- ${U.feature}: ${U.one_liner}`).join(`
`)||"",v=K.suggestions?.usage_patterns?.map((U)=>`- ${U.title}: ${U.suggestion}`).join(`
`)||"",M=K.on_the_horizon?.opportunities?.map((U)=>`- ${U.title}: ${U.whats_possible}`).join(`
`)||"",y={name:"at_a_glance",prompt:`You're writing an "At a Glance" summary for a Claude Code usage insights report for Claude Code users. The goal is to help them understand their usage and improve how they can use Claude better, especially as models improve.

Use this 4-part structure:

1. **What's working** - What is the user's unique style of interacting with Claude and what are some impactful things they've done? You can include one or two details, but keep it high level since things might not be fresh in the user's memory. Don't be fluffy or overly complimentary. Also, don't focus on the tool calls they use.

2. **What's hindering you** - Split into (a) Claude's fault (misunderstandings, wrong approaches, bugs) and (b) user-side friction (not providing enough context, environment issues -- ideally more general than just one project). Be honest but constructive.

3. **Quick wins to try** - Specific Claude Code features they could try from the examples below, or a workflow technique if you think it's really compelling. (Avoid stuff like "Ask Claude to confirm before taking actions" or "Type out more context up front" which are less compelling.)

4. **Ambitious workflows for better models** - As we move to much more capable models over the next 3-6 months, what should they prepare for? What workflows that seem impossible now will become possible? Draw from the appropriate section below.

Keep each section to 2-3 not-too-long sentences. Don't overwhelm the user. Don't mention specific numerical stats or underlined_categories from the session data below. Use a coaching tone.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "whats_working": "(refer to instructions above)",
  "whats_hindering": "(refer to instructions above)",
  "quick_wins": "(refer to instructions above)",
  "ambitious_workflows": "(refer to instructions above)"
}

SESSION DATA:
${Y}

## Project Areas (what user works on)
${Z}

## Big Wins (impressive accomplishments)
${W}

## Friction Categories (where things go wrong)
${_}

## Features to Try
${E}

## Usage Patterns to Adopt
${v}

## On the Horizon (ambitious workflows for better models)
${M}`,maxTokens:8192},I=await JQ(y,"");if(I.result)K.at_a_glance=I.result;return K}function g(Q){return O(Q).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")}function b(Q,J,$=6,q){let V;if(q)V=q.filter((Y)=>(Y in Q)&&(Q[Y]??0)>0).map((Y)=>[Y,Q[Y]??0]);else V=Object.entries(Q).sort((Y,X)=>X[1]-Y[1]).slice(0,$);if(V.length===0)return'<p class="empty">No data</p>';let L=Math.max(...V.map((Y)=>Y[1]));return V.map(([Y,X])=>{let K=X/L*100,Z=uQ[Y]||Y.replace(/_/g," ").replace(/\b\w/g,(W)=>W.toUpperCase());return`<div class="bar-row">
        <div class="bar-label">${O(Z)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${K}%;background:${J}"></div></div>
        <div class="bar-value">${X}</div>
      </div>`}).join(`
`)}function V0(Q){if(Q.length===0)return'<p class="empty">No response time data</p>';let J={"2-10s":0,"10-30s":0,"30s-1m":0,"1-2m":0,"2-5m":0,"5-15m":0,">15m":0};for(let q of Q)if(q<10)J["2-10s"]=(J["2-10s"]??0)+1;else if(q<30)J["10-30s"]=(J["10-30s"]??0)+1;else if(q<60)J["30s-1m"]=(J["30s-1m"]??0)+1;else if(q<120)J["1-2m"]=(J["1-2m"]??0)+1;else if(q<300)J["2-5m"]=(J["2-5m"]??0)+1;else if(q<900)J["5-15m"]=(J["5-15m"]??0)+1;else J[">15m"]=(J[">15m"]??0)+1;let $=Math.max(...Object.values(J));if($===0)return'<p class="empty">No response time data</p>';return Object.entries(J).map(([q,V])=>{let L=V/$*100;return`<div class="bar-row">
        <div class="bar-label">${q}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${L}%;background:#6366f1"></div></div>
        <div class="bar-value">${V}</div>
      </div>`}).join(`
`)}function Z0(Q){if(Q.length===0)return'<p class="empty">No time data</p>';let J=[{label:"Morning (6-12)",range:[6,7,8,9,10,11]},{label:"Afternoon (12-18)",range:[12,13,14,15,16,17]},{label:"Evening (18-24)",range:[18,19,20,21,22,23]},{label:"Night (0-6)",range:[0,1,2,3,4,5]}],$={};for(let Y of Q)$[Y]=($[Y]||0)+1;let q=J.map((Y)=>({label:Y.label,count:Y.range.reduce((X,K)=>X+($[K]||0),0)})),V=Math.max(...q.map((Y)=>Y.count))||1;return`<div id="hour-histogram">${q.map((Y)=>`
      <div class="bar-row">
        <div class="bar-label">${Y.label}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${Y.count/V*100}%;background:#8b5cf6"></div></div>
        <div class="bar-value">${Y.count}</div>
      </div>`).join(`
`)}</div>`}function z0(Q){let J={};for(let $ of Q)J[$]=(J[$]||0)+1;return f(J)}function B0(Q,J){let $=(z)=>{if(!z)return"";return z.split(`

`).map((P)=>{let B=O(P);return B=B.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),B=B.replace(/^- /gm,"• "),B=B.replace(/\n/g,"<br>"),`<p>${B}</p>`}).join(`
`)},q=J.at_a_glance,V=q?`
    <div class="at-a-glance">
      <div class="glance-title">At a Glance</div>
      <div class="glance-sections">
        ${q.whats_working?`<div class="glance-section"><strong>What's working:</strong> ${g(q.whats_working)} <a href="#section-wins" class="see-more">Impressive Things You Did →</a></div>`:""}
        ${q.whats_hindering?`<div class="glance-section"><strong>What's hindering you:</strong> ${g(q.whats_hindering)} <a href="#section-friction" class="see-more">Where Things Go Wrong →</a></div>`:""}
        ${q.quick_wins?`<div class="glance-section"><strong>Quick wins to try:</strong> ${g(q.quick_wins)} <a href="#section-features" class="see-more">Features to Try →</a></div>`:""}
        ${q.ambitious_workflows?`<div class="glance-section"><strong>Ambitious workflows:</strong> ${g(q.ambitious_workflows)} <a href="#section-horizon" class="see-more">On the Horizon →</a></div>`:""}
      </div>
    </div>
    `:"",L=J.project_areas?.areas||[],Y=L.length>0?`
    <h2 id="section-work">What You Work On</h2>
    <div class="project-areas">
      ${L.map((z)=>`
        <div class="project-area">
          <div class="area-header">
            <span class="area-name">${O(z.name)}</span>
            <span class="area-count">~${z.session_count} sessions</span>
          </div>
          <div class="area-desc">${O(z.description)}</div>
        </div>
      `).join("")}
    </div>
    `:"",X=J.interaction_style,K=X?.narrative?`
    <h2 id="section-usage">How You Use Claude Code</h2>
    <div class="narrative">
      ${$(X.narrative)}
      ${X.key_pattern?`<div class="key-insight"><strong>Key pattern:</strong> ${O(X.key_pattern)}</div>`:""}
    </div>
    `:"",Z=J.what_works,W=Z?.impressive_workflows&&Z.impressive_workflows.length>0?`
    <h2 id="section-wins">Impressive Things You Did</h2>
    ${Z.intro?`<p class="section-intro">${O(Z.intro)}</p>`:""}
    <div class="big-wins">
      ${Z.impressive_workflows.map((z)=>`
        <div class="big-win">
          <div class="big-win-title">${O(z.title||"")}</div>
          <div class="big-win-desc">${O(z.description||"")}</div>
        </div>
      `).join("")}
    </div>
    `:"",_=J.friction_analysis,E=_?.categories&&_.categories.length>0?`
    <h2 id="section-friction">Where Things Go Wrong</h2>
    ${_.intro?`<p class="section-intro">${O(_.intro)}</p>`:""}
    <div class="friction-categories">
      ${_.categories.map((z)=>`
        <div class="friction-category">
          <div class="friction-title">${O(z.category||"")}</div>
          <div class="friction-desc">${O(z.description||"")}</div>
          ${z.examples?`<ul class="friction-examples">${z.examples.map((P)=>`<li>${O(P)}</li>`).join("")}</ul>`:""}
        </div>
      `).join("")}
    </div>
    `:"",v=J.suggestions,M=v?`
    ${v.claude_md_additions&&v.claude_md_additions.length>0?`
    <h2 id="section-features">Existing CC Features to Try</h2>
    <div class="claude-md-section">
      <h3>Suggested CLAUDE.md Additions</h3>
      <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Just copy this into Claude Code to add it to your CLAUDE.md.</p>
      <div class="claude-md-actions">
        <button class="copy-all-btn" onclick="copyAllCheckedClaudeMd()">Copy All Checked</button>
      </div>
      ${v.claude_md_additions.map((z,P)=>`
        <div class="claude-md-item">
          <input type="checkbox" id="cmd-${P}" class="cmd-checkbox" checked data-text="${O(z.prompt_scaffold||z.where||"Add to CLAUDE.md")}\\n\\n${O(z.addition)}">
          <label for="cmd-${P}">
            <code class="cmd-code">${O(z.addition)}</code>
            <button class="copy-btn" onclick="copyCmdItem(${P})">Copy</button>
          </label>
          <div class="cmd-why">${O(z.why)}</div>
        </div>
      `).join("")}
    </div>
    `:""}
    ${v.features_to_try&&v.features_to_try.length>0?`
    <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Just copy this into Claude Code and it'll set it up for you.</p>
    <div class="features-section">
      ${v.features_to_try.map((z)=>`
        <div class="feature-card">
          <div class="feature-title">${O(z.feature||"")}</div>
          <div class="feature-oneliner">${O(z.one_liner||"")}</div>
          <div class="feature-why"><strong>Why for you:</strong> ${O(z.why_for_you||"")}</div>
          ${z.example_code?`
          <div class="feature-examples">
            <div class="feature-example">
              <div class="example-code-row">
                <code class="example-code">${O(z.example_code)}</code>
                <button class="copy-btn" onclick="copyText(this)">Copy</button>
              </div>
            </div>
          </div>
          `:""}
        </div>
      `).join("")}
    </div>
    `:""}
    ${v.usage_patterns&&v.usage_patterns.length>0?`
    <h2 id="section-patterns">New Ways to Use Claude Code</h2>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Just copy this into Claude Code and it'll walk you through it.</p>
    <div class="patterns-section">
      ${v.usage_patterns.map((z)=>`
        <div class="pattern-card">
          <div class="pattern-title">${O(z.title||"")}</div>
          <div class="pattern-summary">${O(z.suggestion||"")}</div>
          ${z.detail?`<div class="pattern-detail">${O(z.detail)}</div>`:""}
          ${z.copyable_prompt?`
          <div class="copyable-prompt-section">
            <div class="prompt-label">Paste into Claude Code:</div>
            <div class="copyable-prompt-row">
              <code class="copyable-prompt">${O(z.copyable_prompt)}</code>
              <button class="copy-btn" onclick="copyText(this)">Copy</button>
            </div>
          </div>
          `:""}
        </div>
      `).join("")}
    </div>
    `:""}
    `:"",D=J.on_the_horizon,y=D?.opportunities&&D.opportunities.length>0?`
    <h2 id="section-horizon">On the Horizon</h2>
    ${D.intro?`<p class="section-intro">${O(D.intro)}</p>`:""}
    <div class="horizon-section">
      ${D.opportunities.map((z)=>`
        <div class="horizon-card">
          <div class="horizon-title">${O(z.title||"")}</div>
          <div class="horizon-possible">${O(z.whats_possible||"")}</div>
          ${z.how_to_try?`<div class="horizon-tip"><strong>Getting started:</strong> ${O(z.how_to_try)}</div>`:""}
          ${z.copyable_prompt?`<div class="pattern-prompt"><div class="prompt-label">Paste into Claude Code:</div><code>${O(z.copyable_prompt)}</code><button class="copy-btn" onclick="copyText(this)">Copy</button></div>`:""}
        </div>
      `).join("")}
    </div>
    `:"",I=process.env.USER_TYPE==="ant"?J.cc_team_improvements?.improvements||[]:[],U=process.env.USER_TYPE==="ant"?J.model_behavior_improvements?.improvements||[]:[],x=I.length>0||U.length>0?`
    <h2 id="section-feedback" class="feedback-header">Closing the Loop: Feedback for Other Teams</h2>
    <p class="feedback-intro">Suggestions for the CC product and model teams based on your usage patterns. Click to expand.</p>
    ${I.length>0?`
    <div class="collapsible-section">
      <div class="collapsible-header" onclick="toggleCollapsible(this)">
        <span class="collapsible-arrow">▶</span>
        <h3>Product Improvements for CC Team</h3>
      </div>
      <div class="collapsible-content">
        <div class="suggestions-section">
          ${I.map((z)=>`
            <div class="feedback-card team-card">
              <div class="feedback-title">${O(z.title||"")}</div>
              <div class="feedback-detail">${O(z.detail||"")}</div>
              ${z.evidence?`<div class="feedback-evidence"><em>Evidence:</em> ${O(z.evidence)}</div>`:""}
            </div>
          `).join("")}
        </div>
      </div>
    </div>
    `:""}
    ${U.length>0?`
    <div class="collapsible-section">
      <div class="collapsible-header" onclick="toggleCollapsible(this)">
        <span class="collapsible-arrow">▶</span>
        <h3>Model Behavior Improvements</h3>
      </div>
      <div class="collapsible-content">
        <div class="suggestions-section">
          ${U.map((z)=>`
            <div class="feedback-card model-card">
              <div class="feedback-title">${O(z.title||"")}</div>
              <div class="feedback-detail">${O(z.detail||"")}</div>
              ${z.evidence?`<div class="feedback-evidence"><em>Evidence:</em> ${O(z.evidence)}</div>`:""}
            </div>
          `).join("")}
        </div>
      </div>
    </div>
    `:""}
    `:"",C=J.fun_ending,T=C?.headline?`
    <div class="fun-ending">
      <div class="fun-headline">"${O(C.headline)}"</div>
      ${C.detail?`<div class="fun-detail">${O(C.detail)}</div>`:""}
    </div>
    `:"",k=`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #334155; line-height: 1.65; padding: 48px 24px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 32px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    h2 { font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 48px; margin-bottom: 16px; }
    .subtitle { color: #64748b; font-size: 15px; margin-bottom: 32px; }
    .nav-toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 32px 0; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
    .nav-toc a { font-size: 12px; color: #64748b; text-decoration: none; padding: 6px 12px; border-radius: 6px; background: #f1f5f9; transition: all 0.15s; }
    .nav-toc a:hover { background: #e2e8f0; color: #334155; }
    .stats-row { display: flex; gap: 24px; margin-bottom: 40px; padding: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .at-a-glance { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .glance-title { font-size: 16px; font-weight: 700; color: #92400e; margin-bottom: 16px; }
    .glance-sections { display: flex; flex-direction: column; gap: 12px; }
    .glance-section { font-size: 14px; color: #78350f; line-height: 1.6; }
    .glance-section strong { color: #92400e; }
    .see-more { color: #b45309; text-decoration: none; font-size: 13px; white-space: nowrap; }
    .see-more:hover { text-decoration: underline; }
    .project-areas { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .project-area { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .area-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .area-name { font-weight: 600; font-size: 15px; color: #0f172a; }
    .area-count { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }
    .area-desc { font-size: 14px; color: #475569; line-height: 1.5; }
    .narrative { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .narrative p { margin-bottom: 12px; font-size: 14px; color: #475569; line-height: 1.7; }
    .key-insight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-top: 12px; font-size: 14px; color: #166534; }
    .section-intro { font-size: 14px; color: #64748b; margin-bottom: 16px; }
    .big-wins { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .big-win { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; }
    .big-win-title { font-weight: 600; font-size: 15px; color: #166534; margin-bottom: 8px; }
    .big-win-desc { font-size: 14px; color: #15803d; line-height: 1.5; }
    .friction-categories { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    .friction-category { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; }
    .friction-title { font-weight: 600; font-size: 15px; color: #991b1b; margin-bottom: 6px; }
    .friction-desc { font-size: 13px; color: #7f1d1d; margin-bottom: 10px; }
    .friction-examples { margin: 0 0 0 20px; font-size: 13px; color: #334155; }
    .friction-examples li { margin-bottom: 4px; }
    .claude-md-section { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .claude-md-section h3 { font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 12px 0; }
    .claude-md-actions { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #dbeafe; }
    .copy-all-btn { background: #2563eb; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .copy-all-btn:hover { background: #1d4ed8; }
    .copy-all-btn.copied { background: #16a34a; }
    .claude-md-item { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; padding: 10px 0; border-bottom: 1px solid #dbeafe; }
    .claude-md-item:last-child { border-bottom: none; }
    .cmd-checkbox { margin-top: 2px; }
    .cmd-code { background: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #1e40af; border: 1px solid #bfdbfe; font-family: monospace; display: block; white-space: pre-wrap; word-break: break-word; flex: 1; }
    .cmd-why { font-size: 12px; color: #64748b; width: 100%; padding-left: 24px; margin-top: 4px; }
    .features-section, .patterns-section { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; }
    .feature-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; }
    .pattern-card { background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 8px; padding: 16px; }
    .feature-title, .pattern-title { font-weight: 600; font-size: 15px; color: #0f172a; margin-bottom: 6px; }
    .feature-oneliner { font-size: 14px; color: #475569; margin-bottom: 8px; }
    .pattern-summary { font-size: 14px; color: #475569; margin-bottom: 8px; }
    .feature-why, .pattern-detail { font-size: 13px; color: #334155; line-height: 1.5; }
    .feature-examples { margin-top: 12px; }
    .feature-example { padding: 8px 0; border-top: 1px solid #d1fae5; }
    .feature-example:first-child { border-top: none; }
    .example-desc { font-size: 13px; color: #334155; margin-bottom: 6px; }
    .example-code-row { display: flex; align-items: flex-start; gap: 8px; }
    .example-code { flex: 1; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; overflow-x: auto; white-space: pre-wrap; }
    .copyable-prompt-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
    .copyable-prompt-row { display: flex; align-items: flex-start; gap: 8px; }
    .copyable-prompt { flex: 1; background: #f8fafc; padding: 10px 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5; }
    .feature-code { background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border: 1px solid #e2e8f0; display: flex; align-items: flex-start; gap: 8px; }
    .feature-code code { flex: 1; font-family: monospace; font-size: 12px; color: #334155; white-space: pre-wrap; }
    .pattern-prompt { background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border: 1px solid #e2e8f0; }
    .pattern-prompt code { font-family: monospace; font-size: 12px; color: #334155; display: block; white-space: pre-wrap; margin-bottom: 8px; }
    .prompt-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
    .copy-btn { background: #e2e8f0; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; color: #475569; flex-shrink: 0; }
    .copy-btn:hover { background: #cbd5e1; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
    .chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .chart-title { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 12px; }
    .bar-row { display: flex; align-items: center; margin-bottom: 6px; }
    .bar-label { width: 100px; font-size: 11px; color: #475569; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; margin: 0 8px; }
    .bar-fill { height: 100%; border-radius: 3px; }
    .bar-value { width: 28px; font-size: 11px; font-weight: 500; color: #64748b; text-align: right; }
    .empty { color: #94a3b8; font-size: 13px; }
    .horizon-section { display: flex; flex-direction: column; gap: 16px; }
    .horizon-card { background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%); border: 1px solid #c4b5fd; border-radius: 8px; padding: 16px; }
    .horizon-title { font-weight: 600; font-size: 15px; color: #5b21b6; margin-bottom: 8px; }
    .horizon-possible { font-size: 14px; color: #334155; margin-bottom: 10px; line-height: 1.5; }
    .horizon-tip { font-size: 13px; color: #6b21a8; background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 4px; }
    .feedback-header { margin-top: 48px; color: #64748b; font-size: 16px; }
    .feedback-intro { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }
    .feedback-section { margin-top: 16px; }
    .feedback-section h3 { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 12px; }
    .feedback-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .feedback-card.team-card { background: #eff6ff; border-color: #bfdbfe; }
    .feedback-card.model-card { background: #faf5ff; border-color: #e9d5ff; }
    .feedback-title { font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
    .feedback-detail { font-size: 13px; color: #475569; line-height: 1.5; }
    .feedback-evidence { font-size: 12px; color: #64748b; margin-top: 8px; }
    .fun-ending { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 24px; margin-top: 40px; text-align: center; }
    .fun-headline { font-size: 18px; font-weight: 600; color: #78350f; margin-bottom: 8px; }
    .fun-detail { font-size: 14px; color: #92400e; }
    .collapsible-section { margin-top: 16px; }
    .collapsible-header { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .collapsible-header h3 { margin: 0; font-size: 14px; font-weight: 600; color: #475569; }
    .collapsible-arrow { font-size: 12px; color: #94a3b8; transition: transform 0.2s; }
    .collapsible-content { display: none; padding-top: 16px; }
    .collapsible-content.open { display: block; }
    .collapsible-header.open .collapsible-arrow { transform: rotate(90deg); }
    @media (max-width: 640px) { .charts-row { grid-template-columns: 1fr; } .stats-row { justify-content: center; } }
  `,H=`
    function toggleCollapsible(header) {
      header.classList.toggle('open');
      const content = header.nextElementSibling;
      content.classList.toggle('open');
    }
    function copyText(btn) {
      const code = btn.previousElementSibling;
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    }
    function copyCmdItem(idx) {
      const checkbox = document.getElementById('cmd-' + idx);
      if (checkbox) {
        const text = checkbox.dataset.text;
        navigator.clipboard.writeText(text).then(() => {
          const btn = checkbox.nextElementSibling.querySelector('.copy-btn');
          if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
        });
      }
    }
    function copyAllCheckedClaudeMd() {
      const checkboxes = document.querySelectorAll('.cmd-checkbox:checked');
      const texts = [];
      checkboxes.forEach(cb => {
        if (cb.dataset.text) { texts.push(cb.dataset.text); }
      });
      const combined = texts.join('\\n');
      const btn = document.querySelector('.copy-all-btn');
      if (btn) {
        navigator.clipboard.writeText(combined).then(() => {
          btn.textContent = 'Copied ' + texts.length + ' items!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy All Checked'; btn.classList.remove('copied'); }, 2000);
        });
      }
    }
    // Timezone selector for time of day chart (data is from our own analytics, not user input)
    const rawHourCounts = ${z0(Q.message_hours)};
    function updateHourHistogram(offsetFromPT) {
      const periods = [
        { label: "Morning (6-12)", range: [6,7,8,9,10,11] },
        { label: "Afternoon (12-18)", range: [12,13,14,15,16,17] },
        { label: "Evening (18-24)", range: [18,19,20,21,22,23] },
        { label: "Night (0-6)", range: [0,1,2,3,4,5] }
      ];
      const adjustedCounts = {};
      for (const [hour, count] of Object.entries(rawHourCounts)) {
        const newHour = (parseInt(hour) + offsetFromPT + 24) % 24;
        adjustedCounts[newHour] = (adjustedCounts[newHour] || 0) + count;
      }
      const periodCounts = periods.map(p => ({
        label: p.label,
        count: p.range.reduce((sum, h) => sum + (adjustedCounts[h] || 0), 0)
      }));
      const maxCount = Math.max(...periodCounts.map(p => p.count)) || 1;
      const container = document.getElementById('hour-histogram');
      container.textContent = '';
      periodCounts.forEach(p => {
        const row = document.createElement('div');
        row.className = 'bar-row';
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = p.label;
        const track = document.createElement('div');
        track.className = 'bar-track';
        const fill = document.createElement('div');
        fill.className = 'bar-fill';
        fill.style.width = (p.count / maxCount) * 100 + '%';
        fill.style.background = '#8b5cf6';
        track.appendChild(fill);
        const value = document.createElement('div');
        value.className = 'bar-value';
        value.textContent = p.count;
        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(value);
        container.appendChild(row);
      });
    }
    document.getElementById('timezone-select').addEventListener('change', function() {
      const customInput = document.getElementById('custom-offset');
      if (this.value === 'custom') {
        customInput.style.display = 'inline-block';
        customInput.focus();
      } else {
        customInput.style.display = 'none';
        updateHourHistogram(parseInt(this.value));
      }
    });
    document.getElementById('custom-offset').addEventListener('change', function() {
      const offset = parseInt(this.value) + 8;
      updateHourHistogram(offset);
    });
  `;return`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Claude Code Insights</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #334155; line-height: 1.65; padding: 48px 24px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 32px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    h2 { font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 48px; margin-bottom: 16px; }
    .subtitle { color: #64748b; font-size: 15px; margin-bottom: 32px; }
    .nav-toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 32px 0; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
    .nav-toc a { font-size: 12px; color: #64748b; text-decoration: none; padding: 6px 12px; border-radius: 6px; background: #f1f5f9; transition: all 0.15s; }
    .nav-toc a:hover { background: #e2e8f0; color: #334155; }
    .stats-row { display: flex; gap: 24px; margin-bottom: 40px; padding: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .at-a-glance { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .glance-title { font-size: 16px; font-weight: 700; color: #92400e; margin-bottom: 16px; }
    .glance-sections { display: flex; flex-direction: column; gap: 12px; }
    .glance-section { font-size: 14px; color: #78350f; line-height: 1.6; }
    .glance-section strong { color: #92400e; }
    .see-more { color: #b45309; text-decoration: none; font-size: 13px; white-space: nowrap; }
    .see-more:hover { text-decoration: underline; }
    .project-areas { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .project-area { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .area-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .area-name { font-weight: 600; font-size: 15px; color: #0f172a; }
    .area-count { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }
    .area-desc { font-size: 14px; color: #475569; line-height: 1.5; }
    .narrative { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .narrative p { margin-bottom: 12px; font-size: 14px; color: #475569; line-height: 1.7; }
    .key-insight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-top: 12px; font-size: 14px; color: #166534; }
    .section-intro { font-size: 14px; color: #64748b; margin-bottom: 16px; }
    .big-wins { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .big-win { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; }
    .big-win-title { font-weight: 600; font-size: 15px; color: #166534; margin-bottom: 8px; }
    .big-win-desc { font-size: 14px; color: #15803d; line-height: 1.5; }
    .friction-categories { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    .friction-category { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; }
    .friction-title { font-weight: 600; font-size: 15px; color: #991b1b; margin-bottom: 6px; }
    .friction-desc { font-size: 13px; color: #7f1d1d; margin-bottom: 10px; }
    .friction-examples { margin: 0 0 0 20px; font-size: 13px; color: #334155; }
    .friction-examples li { margin-bottom: 4px; }
    .claude-md-section { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .claude-md-section h3 { font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 12px 0; }
    .claude-md-actions { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #dbeafe; }
    .copy-all-btn { background: #2563eb; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .copy-all-btn:hover { background: #1d4ed8; }
    .copy-all-btn.copied { background: #16a34a; }
    .claude-md-item { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; padding: 10px 0; border-bottom: 1px solid #dbeafe; }
    .claude-md-item:last-child { border-bottom: none; }
    .cmd-checkbox { margin-top: 2px; }
    .cmd-code { background: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #1e40af; border: 1px solid #bfdbfe; font-family: monospace; display: block; white-space: pre-wrap; word-break: break-word; flex: 1; }
    .cmd-why { font-size: 12px; color: #64748b; width: 100%; padding-left: 24px; margin-top: 4px; }
    .features-section, .patterns-section { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; }
    .feature-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; }
    .pattern-card { background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 8px; padding: 16px; }
    .feature-title, .pattern-title { font-weight: 600; font-size: 15px; color: #0f172a; margin-bottom: 6px; }
    .feature-oneliner { font-size: 14px; color: #475569; margin-bottom: 8px; }
    .pattern-summary { font-size: 14px; color: #475569; margin-bottom: 8px; }
    .feature-why, .pattern-detail { font-size: 13px; color: #334155; line-height: 1.5; }
    .feature-examples { margin-top: 12px; }
    .feature-example { padding: 8px 0; border-top: 1px solid #d1fae5; }
    .feature-example:first-child { border-top: none; }
    .example-desc { font-size: 13px; color: #334155; margin-bottom: 6px; }
    .example-code-row { display: flex; align-items: flex-start; gap: 8px; }
    .example-code { flex: 1; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; overflow-x: auto; white-space: pre-wrap; }
    .copyable-prompt-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
    .copyable-prompt-row { display: flex; align-items: flex-start; gap: 8px; }
    .copyable-prompt { flex: 1; background: #f8fafc; padding: 10px 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5; }
    .feature-code { background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border: 1px solid #e2e8f0; display: flex; align-items: flex-start; gap: 8px; }
    .feature-code code { flex: 1; font-family: monospace; font-size: 12px; color: #334155; white-space: pre-wrap; }
    .pattern-prompt { background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border: 1px solid #e2e8f0; }
    .pattern-prompt code { font-family: monospace; font-size: 12px; color: #334155; display: block; white-space: pre-wrap; margin-bottom: 8px; }
    .prompt-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
    .copy-btn { background: #e2e8f0; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; color: #475569; flex-shrink: 0; }
    .copy-btn:hover { background: #cbd5e1; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
    .chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .chart-title { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 12px; }
    .bar-row { display: flex; align-items: center; margin-bottom: 6px; }
    .bar-label { width: 100px; font-size: 11px; color: #475569; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; margin: 0 8px; }
    .bar-fill { height: 100%; border-radius: 3px; }
    .bar-value { width: 28px; font-size: 11px; font-weight: 500; color: #64748b; text-align: right; }
    .empty { color: #94a3b8; font-size: 13px; }
    .horizon-section { display: flex; flex-direction: column; gap: 16px; }
    .horizon-card { background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%); border: 1px solid #c4b5fd; border-radius: 8px; padding: 16px; }
    .horizon-title { font-weight: 600; font-size: 15px; color: #5b21b6; margin-bottom: 8px; }
    .horizon-possible { font-size: 14px; color: #334155; margin-bottom: 10px; line-height: 1.5; }
    .horizon-tip { font-size: 13px; color: #6b21a8; background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 4px; }
    .feedback-header { margin-top: 48px; color: #64748b; font-size: 16px; }
    .feedback-intro { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }
    .feedback-section { margin-top: 16px; }
    .feedback-section h3 { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 12px; }
    .feedback-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .feedback-card.team-card { background: #eff6ff; border-color: #bfdbfe; }
    .feedback-card.model-card { background: #faf5ff; border-color: #e9d5ff; }
    .feedback-title { font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
    .feedback-detail { font-size: 13px; color: #475569; line-height: 1.5; }
    .feedback-evidence { font-size: 12px; color: #64748b; margin-top: 8px; }
    .fun-ending { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 24px; margin-top: 40px; text-align: center; }
    .fun-headline { font-size: 18px; font-weight: 600; color: #78350f; margin-bottom: 8px; }
    .fun-detail { font-size: 14px; color: #92400e; }
    .collapsible-section { margin-top: 16px; }
    .collapsible-header { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .collapsible-header h3 { margin: 0; font-size: 14px; font-weight: 600; color: #475569; }
    .collapsible-arrow { font-size: 12px; color: #94a3b8; transition: transform 0.2s; }
    .collapsible-content { display: none; padding-top: 16px; }
    .collapsible-content.open { display: block; }
    .collapsible-header.open .collapsible-arrow { transform: rotate(90deg); }
    @media (max-width: 640px) { .charts-row { grid-template-columns: 1fr; } .stats-row { justify-content: center; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>Claude Code Insights</h1>
    <p class="subtitle">${Q.total_messages.toLocaleString()} messages across ${Q.total_sessions} sessions${Q.total_sessions_scanned&&Q.total_sessions_scanned>Q.total_sessions?` (${Q.total_sessions_scanned.toLocaleString()} total)`:""} | ${Q.date_range.start} to ${Q.date_range.end}</p>

    ${V}

    <nav class="nav-toc">
      <a href="#section-work">What You Work On</a>
      <a href="#section-usage">How You Use CC</a>
      <a href="#section-wins">Impressive Things</a>
      <a href="#section-friction">Where Things Go Wrong</a>
      <a href="#section-features">Features to Try</a>
      <a href="#section-patterns">New Usage Patterns</a>
      <a href="#section-horizon">On the Horizon</a>
      <a href="#section-feedback">Team Feedback</a>
    </nav>

    <div class="stats-row">
      <div class="stat"><div class="stat-value">${Q.total_messages.toLocaleString()}</div><div class="stat-label">Messages</div></div>
      <div class="stat"><div class="stat-value">+${Q.total_lines_added.toLocaleString()}/-${Q.total_lines_removed.toLocaleString()}</div><div class="stat-label">Lines</div></div>
      <div class="stat"><div class="stat-value">${Q.total_files_modified}</div><div class="stat-label">Files</div></div>
      <div class="stat"><div class="stat-value">${Q.days_active}</div><div class="stat-label">Days</div></div>
      <div class="stat"><div class="stat-value">${Q.messages_per_day}</div><div class="stat-label">Msgs/Day</div></div>
    </div>

    ${Y}

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-title">What You Wanted</div>
        ${b(Q.goal_categories,"#2563eb")}
      </div>
      <div class="chart-card">
        <div class="chart-title">Top Tools Used</div>
        ${b(Q.tool_counts,"#0891b2")}
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-title">Languages</div>
        ${b(Q.languages,"#10b981")}
      </div>
      <div class="chart-card">
        <div class="chart-title">Session Types</div>
        ${b(Q.session_types||{},"#8b5cf6")}
      </div>
    </div>

    ${K}

    <!-- Response Time Distribution -->
    <div class="chart-card" style="margin: 24px 0;">
      <div class="chart-title">User Response Time Distribution</div>
      ${V0(Q.user_response_times)}
      <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
        Median: ${Q.median_response_time.toFixed(1)}s &bull; Average: ${Q.avg_response_time.toFixed(1)}s
      </div>
    </div>

    <!-- Multi-clauding Section (matching Python reference) -->
    <div class="chart-card" style="margin: 24px 0;">
      <div class="chart-title">Multi-Clauding (Parallel Sessions)</div>
      ${Q.multi_clauding.overlap_events===0?`
        <p style="font-size: 14px; color: #64748b; padding: 8px 0;">
          No parallel session usage detected. You typically work with one Claude Code session at a time.
        </p>
      `:`
        <div style="display: flex; gap: 24px; margin: 12px 0;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${Q.multi_clauding.overlap_events}</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Overlap Events</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${Q.multi_clauding.sessions_involved}</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Sessions Involved</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${Q.total_messages>0?Math.round(100*Q.multi_clauding.user_messages_during/Q.total_messages):0}%</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Of Messages</div>
          </div>
        </div>
        <p style="font-size: 13px; color: #475569; margin-top: 12px;">
          You run multiple Claude Code sessions simultaneously. Multi-clauding is detected when sessions
          overlap in time, suggesting parallel workflows.
        </p>
      `}
    </div>

    <!-- Time of Day & Tool Errors -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-title" style="display: flex; align-items: center; gap: 12px;">
          User Messages by Time of Day
          <select id="timezone-select" style="font-size: 12px; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <option value="0">PT (UTC-8)</option>
            <option value="3">ET (UTC-5)</option>
            <option value="8">London (UTC)</option>
            <option value="9">CET (UTC+1)</option>
            <option value="17">Tokyo (UTC+9)</option>
            <option value="custom">Custom offset...</option>
          </select>
          <input type="number" id="custom-offset" placeholder="UTC offset" style="display: none; width: 80px; font-size: 12px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
        </div>
        ${Z0(Q.message_hours)}
      </div>
      <div class="chart-card">
        <div class="chart-title">Tool Errors Encountered</div>
        ${Object.keys(Q.tool_error_categories).length>0?b(Q.tool_error_categories,"#dc2626"):'<p class="empty">No tool errors</p>'}
      </div>
    </div>

    ${W}

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-title">What Helped Most (Claude's Capabilities)</div>
        ${b(Q.success,"#16a34a")}
      </div>
      <div class="chart-card">
        <div class="chart-title">Outcomes</div>
        ${b(Q.outcomes,"#8b5cf6",6,K0)}
      </div>
    </div>

    ${E}

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-title">Primary Friction Types</div>
        ${b(Q.friction,"#dc2626")}
      </div>
      <div class="chart-card">
        <div class="chart-title">Inferred Satisfaction (model-estimated)</div>
        ${b(Q.satisfaction,"#eab308",6,q0)}
      </div>
    </div>

    ${M}

    ${y}

    ${T}

    ${x}
  </div>
  <script>${H}</script>
</body>
</html>`}function h0(Q,J,$,q){let V={VERSION:"1.0.0-local",BUILD_TIME:"2026-04-10T13:02:36.967Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION,L=q?.hosts.filter((X)=>X.sessionCount>0).map((X)=>X.name),Y={total:$.size,goal_categories:{},outcomes:{},satisfaction:{},friction:{}};for(let X of $.values()){for(let[K,Z]of S(X.goal_categories))if(Z>0)Y.goal_categories[K]=(Y.goal_categories[K]||0)+Z;Y.outcomes[X.outcome]=(Y.outcomes[X.outcome]||0)+1;for(let[K,Z]of S(X.user_satisfaction_counts))if(Z>0)Y.satisfaction[K]=(Y.satisfaction[K]||0)+Z;for(let[K,Z]of S(X.friction_counts))if(Z>0)Y.friction[K]=(Y.friction[K]||0)+Z}return{metadata:{username:process.env.SAFEUSER||process.env.USER||"unknown",generated_at:new Date().toISOString(),claude_code_version:V,date_range:Q.date_range,session_count:Q.total_sessions,...L&&L.length>0&&{remote_hosts_collected:L}},aggregated_data:Q,insights:J,facets_summary:Y}}async function L0(){let Q=LQ(),J;try{J=await n(Q,{withFileTypes:!0})}catch{return[]}let $=J.filter((V)=>V.isDirectory()).map((V)=>F(Q,V.name)),q=[];for(let V=0;V<$.length;V++){let L=await WQ($[V]);for(let[Y,X]of L)q.push({sessionId:Y,path:X.path,mtime:X.mtime,size:X.size});if(V%10===9)await new Promise((Y)=>setImmediate(Y))}return q.sort((V,L)=>L.mtime-V.mtime),q}async function U0(Q){let J;if(process.env.USER_TYPE==="ant"&&Q?.collectRemote){let B=F(a(),"projects"),{hosts:G,totalCopied:N}=await pQ(B);J={hosts:G,totalCopied:N}}let $=await L0(),q=$.length,V=50,L=200,Y=[],X=[];for(let B=0;B<$.length;B+=V){let G=$.slice(B,B+V),N=await Promise.all(G.map(async(R)=>({sessionInfo:R,cached:await eQ(R.sessionId)})));for(let{sessionInfo:R,cached:w}of N)if(w)Y.push(w);else if(X.length<L)X.push(R)}let K=new Map,Z=(B)=>{for(let G of B.messages.slice(0,5))if(G.type==="user"&&G.message){let N=G.message.content;if(typeof N==="string"){if(N.includes("RESPOND WITH ONLY A VALID JSON OBJECT")||N.includes("record_facets"))return!0}}return!1},W=10;for(let B=0;B<X.length;B+=W){let G=X.slice(B,B+W),N=await Promise.all(G.map(async(w)=>{try{return await GQ(w.path)}catch{return[]}})),R=[];for(let w of N)for(let A of w){if(Z(A)||!rQ(A))continue;let p=$Q(A);Y.push(p),R.push(p),K.set(p.session_id,A)}await Promise.all(R.map((w)=>sQ(w)))}let _=new Map;for(let B of Y){let G=_.get(B.session_id);if(!G||B.user_message_count>G.user_message_count||B.user_message_count===G.user_message_count&&B.duration_minutes>G.duration_minutes)_.set(B.session_id,B)}let E=new Set(_.keys());Y=[..._.values()];for(let B of K.keys())if(!E.has(B))K.delete(B);Y.sort((B,G)=>G.start_time.localeCompare(B.start_time));let v=(B)=>{if(B.user_message_count<2)return!1;if(B.duration_minutes<1)return!1;return!0},M=Y.filter(v),D=new Map,y=[],I=50,U=await Promise.all(M.map(async(B)=>({sessionId:B.session_id,cached:await aQ(B.session_id)})));for(let{sessionId:B,cached:G}of U)if(G)D.set(B,G);else{let N=K.get(B);if(N&&y.length<I)y.push({log:N,sessionId:B})}let x=50;for(let B=0;B<y.length;B+=x){let G=y.slice(B,B+x),N=await Promise.all(G.map(async({log:w,sessionId:A})=>{let p=await Q0(w,A);return{sessionId:A,newFacets:p}})),R=[];for(let{sessionId:w,newFacets:A}of N)if(A)D.set(w,A),R.push(A);await Promise.all(R.map((w)=>tQ(w)))}let C=(B)=>{let G=D.get(B);if(!G)return!1;let N=G.goal_categories,R=W0(N).filter((w)=>(N[w]??0)>0);return R.length===1&&R[0]==="warmup_minimal"},T=M.filter((B)=>!C(B.session_id)),k=new Map;for(let[B,G]of D)if(!C(B))k.set(B,G);let j=J0(T,k);j.total_sessions_scanned=q;let H=await Y0(j,D),z=B0(j,H);try{await l(u(),{recursive:!0})}catch{}let P=F(u(),"report.html");return await QQ(P,z,{encoding:"utf-8",mode:384}),{insights:H,htmlPath:P,data:j,remoteStats:J,facets:k}}function S(Q){return Q?Object.entries(Q):[]}function W0(Q){return Q?Object.keys(Q):[]}function BQ(Q){if(!Q||typeof Q!=="object")return!1;let J=Q;return typeof J.underlying_goal==="string"&&typeof J.outcome==="string"&&typeof J.brief_summary==="string"&&J.goal_categories!==null&&typeof J.goal_categories==="object"&&J.user_satisfaction_counts!==null&&typeof J.user_satisfaction_counts==="object"&&J.friction_counts!==null&&typeof J.friction_counts==="object"}var zQ,fQ,hQ,pQ,gQ,uQ,dQ=`Analyze this Claude Code session and extract structured facets.

CRITICAL GUIDELINES:

1. **goal_categories**: Count ONLY what the USER explicitly asked for.
   - DO NOT count Claude's autonomous codebase exploration
   - DO NOT count work Claude decided to do on its own
   - ONLY count when user says "can you...", "please...", "I need...", "let's..."

2. **user_satisfaction_counts**: Base ONLY on explicit user signals.
   - "Yay!", "great!", "perfect!" → happy
   - "thanks", "looks good", "that works" → satisfied
   - "ok, now let's..." (continuing without complaint) → likely_satisfied
   - "that's not right", "try again" → dissatisfied
   - "this is broken", "I give up" → frustrated

3. **friction_counts**: Be specific about what went wrong.
   - misunderstood_request: Claude interpreted incorrectly
   - wrong_approach: Right goal, wrong solution method
   - buggy_code: Code didn't work correctly
   - user_rejected_action: User said no/stop to a tool call
   - excessive_changes: Over-engineered or changed too much

4. If very short or just warmup, use warmup_minimal for goal_category

SESSION:
`,iQ=`Summarize this portion of a Claude Code session transcript. Focus on:
1. What the user asked for
2. What Claude did (tools used, files modified)
3. Any friction or issues
4. The outcome

Keep it concise - 3-5 sentences. Preserve specific details like file names, error messages, and user feedback.

TRANSCRIPT CHUNK:
`,X0,q0,K0,G0,g0;var O0=OQ(()=>{wQ();N0();EQ();vQ();NQ();RQ();PQ();FQ();DQ();v0();_Q();jQ();xQ();AQ();zQ=process.env.USER_TYPE==="ant"?async()=>{let{stdout:Q,code:J}=await m("coder",["list","-o","json"],{timeout:30000});if(J!==0)return[];try{return h(Q).filter((q)=>q.latest_build?.status==="running").map((q)=>q.name)}catch{return[]}}:async()=>[],fQ=process.env.USER_TYPE==="ant"?async(Q)=>{let{stdout:J,code:$}=await m("ssh",[`${Q}.coder`,'find /root/.claude/projects -name "*.jsonl" 2>/dev/null | wc -l'],{timeout:30000});if($!==0)return 0;return parseInt(J.trim(),10)||0}:async()=>0,hQ=process.env.USER_TYPE==="ant"?async(Q,J)=>{let $={copied:0,skipped:0},q=await TQ(F(HQ(),"claude-hs-"));try{if((await m("scp",["-rq",`${Q}.coder:/root/.claude/projects/`,q],{timeout:300000})).code!==0)return $;let L=F(q,"projects"),Y;try{Y=await n(L,{withFileTypes:!0})}catch{return $}await Promise.all(Y.map(async(X)=>{let K=X.name,Z=F(L,K);if(!X.isDirectory())return;let W=`${K}__${Q}`,_=F(J,W);try{await l(_,{recursive:!0})}catch{}let E;try{E=await n(Z,{withFileTypes:!0})}catch{return}await Promise.all(E.map(async(v)=>{let M=v.name;if(!M.endsWith(".jsonl"))return;let D=F(Z,M),y=F(_,M);try{await IQ(D,y,yQ.COPYFILE_EXCL),$.copied++}catch{$.skipped++}}))}))}finally{try{await CQ(q,{recursive:!0,force:!0})}catch{}}return $}:async()=>({copied:0,skipped:0}),pQ=process.env.USER_TYPE==="ant"?async(Q)=>{let J=await zQ(),$=[],q=0,V=0,L=await Promise.all(J.map(async(Y)=>{let X=await fQ(Y);if(X>0){let{copied:K,skipped:Z}=await hQ(Y,Q);return{name:Y,sessionCount:X,copied:K,skipped:Z}}return{name:Y,sessionCount:X,copied:0,skipped:0}}));for(let Y of L)$.push({name:Y.name,sessionCount:Y.sessionCount}),q+=Y.copied,V+=Y.skipped;return{hosts:$,totalCopied:q,totalSkipped:V}}:async()=>({hosts:[],totalCopied:0,totalSkipped:0}),gQ={".ts":"TypeScript",".tsx":"TypeScript",".js":"JavaScript",".jsx":"JavaScript",".py":"Python",".rb":"Ruby",".go":"Go",".rs":"Rust",".java":"Java",".md":"Markdown",".json":"JSON",".yaml":"YAML",".yml":"YAML",".sh":"Shell",".css":"CSS",".html":"HTML"},uQ={debug_investigate:"Debug/Investigate",implement_feature:"Implement Feature",fix_bug:"Fix Bug",write_script_tool:"Write Script/Tool",refactor_code:"Refactor Code",configure_system:"Configure System",create_pr_commit:"Create PR/Commit",analyze_data:"Analyze Data",understand_codebase:"Understand Codebase",write_tests:"Write Tests",write_docs:"Write Docs",deploy_infra:"Deploy/Infra",warmup_minimal:"Cache Warmup",fast_accurate_search:"Fast/Accurate Search",correct_code_edits:"Correct Code Edits",good_explanations:"Good Explanations",proactive_help:"Proactive Help",multi_file_changes:"Multi-file Changes",handled_complexity:"Multi-file Changes",good_debugging:"Good Debugging",misunderstood_request:"Misunderstood Request",wrong_approach:"Wrong Approach",buggy_code:"Buggy Code",user_rejected_action:"User Rejected Action",claude_got_blocked:"Claude Got Blocked",user_stopped_early:"User Stopped Early",wrong_file_or_location:"Wrong File/Location",excessive_changes:"Excessive Changes",slow_or_verbose:"Slow/Verbose",tool_failed:"Tool Failed",user_unclear:"User Unclear",external_issue:"External Issue",frustrated:"Frustrated",dissatisfied:"Dissatisfied",likely_satisfied:"Likely Satisfied",satisfied:"Satisfied",happy:"Happy",unsure:"Unsure",neutral:"Neutral",delighted:"Delighted",single_task:"Single Task",multi_task:"Multi Task",iterative_refinement:"Iterative Refinement",exploration:"Exploration",quick_question:"Quick Question",fully_achieved:"Fully Achieved",mostly_achieved:"Mostly Achieved",partially_achieved:"Partially Achieved",not_achieved:"Not Achieved",unclear_from_transcript:"Unclear",unhelpful:"Unhelpful",slightly_helpful:"Slightly Helpful",moderately_helpful:"Moderately Helpful",very_helpful:"Very Helpful",essential:"Essential"};X0=[{name:"project_areas",prompt:`Analyze this Claude Code usage data and identify project areas.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "areas": [
    {"name": "Area name", "session_count": N, "description": "2-3 sentences about what was worked on and how Claude Code was used."}
  ]
}

Include 4-5 areas. Skip internal CC operations.`,maxTokens:8192},{name:"interaction_style",prompt:`Analyze this Claude Code usage data and describe the user's interaction style.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "narrative": "2-3 paragraphs analyzing HOW the user interacts with Claude Code. Use second person 'you'. Describe patterns: iterate quickly vs detailed upfront specs? Interrupt often or let Claude run? Include specific examples. Use **bold** for key insights.",
  "key_pattern": "One sentence summary of most distinctive interaction style"
}`,maxTokens:8192},{name:"what_works",prompt:`Analyze this Claude Code usage data and identify what's working well for this user. Use second person ("you").

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "intro": "1 sentence of context",
  "impressive_workflows": [
    {"title": "Short title (3-6 words)", "description": "2-3 sentences describing the impressive workflow or approach. Use 'you' not 'the user'."}
  ]
}

Include 3 impressive workflows.`,maxTokens:8192},{name:"friction_analysis",prompt:`Analyze this Claude Code usage data and identify friction points for this user. Use second person ("you").

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "intro": "1 sentence summarizing friction patterns",
  "categories": [
    {"category": "Concrete category name", "description": "1-2 sentences explaining this category and what could be done differently. Use 'you' not 'the user'.", "examples": ["Specific example with consequence", "Another example"]}
  ]
}

Include 3 friction categories with 2 examples each.`,maxTokens:8192},{name:"suggestions",prompt:`Analyze this Claude Code usage data and suggest improvements.

## CC FEATURES REFERENCE (pick from these for features_to_try):
1. **MCP Servers**: Connect Claude to external tools, databases, and APIs via Model Context Protocol.
   - How to use: Run \`claude mcp add <server-name> -- <command>\`
   - Good for: database queries, Slack integration, GitHub issue lookup, connecting to internal APIs

2. **Custom Skills**: Reusable prompts you define as markdown files that run with a single /command.
   - How to use: Create \`.claude/skills/commit/SKILL.md\` with instructions. Then type \`/commit\` to run it.
   - Good for: repetitive workflows - /commit, /review, /test, /deploy, /pr, or complex multi-step workflows

3. **Hooks**: Shell commands that auto-run at specific lifecycle events.
   - How to use: Add to \`.claude/settings.json\` under "hooks" key.
   - Good for: auto-formatting code, running type checks, enforcing conventions

4. **Headless Mode**: Run Claude non-interactively from scripts and CI/CD.
   - How to use: \`claude -p "fix lint errors" --allowedTools "Edit,Read,Bash"\`
   - Good for: CI/CD integration, batch code fixes, automated reviews

5. **Task Agents**: Claude spawns focused sub-agents for complex exploration or parallel work.
   - How to use: Claude auto-invokes when helpful, or ask "use an agent to explore X"
   - Good for: codebase exploration, understanding complex systems

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "claude_md_additions": [
    {"addition": "A specific line or block to add to CLAUDE.md based on workflow patterns. E.g., 'Always run tests after modifying auth-related files'", "why": "1 sentence explaining why this would help based on actual sessions", "prompt_scaffold": "Instructions for where to add this in CLAUDE.md. E.g., 'Add under ## Testing section'"}
  ],
  "features_to_try": [
    {"feature": "Feature name from CC FEATURES REFERENCE above", "one_liner": "What it does", "why_for_you": "Why this would help YOU based on your sessions", "example_code": "Actual command or config to copy"}
  ],
  "usage_patterns": [
    {"title": "Short title", "suggestion": "1-2 sentence summary", "detail": "3-4 sentences explaining how this applies to YOUR work", "copyable_prompt": "A specific prompt to copy and try"}
  ]
}

IMPORTANT for claude_md_additions: PRIORITIZE instructions that appear MULTIPLE TIMES in the user data. If user told Claude the same thing in 2+ sessions (e.g., 'always run tests', 'use TypeScript'), that's a PRIME candidate - they shouldn't have to repeat themselves.

IMPORTANT for features_to_try: Pick 2-3 from the CC FEATURES REFERENCE above. Include 2-3 items for each category.`,maxTokens:8192},{name:"on_the_horizon",prompt:`Analyze this Claude Code usage data and identify future opportunities.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "intro": "1 sentence about evolving AI-assisted development",
  "opportunities": [
    {"title": "Short title (4-8 words)", "whats_possible": "2-3 ambitious sentences about autonomous workflows", "how_to_try": "1-2 sentences mentioning relevant tooling", "copyable_prompt": "Detailed prompt to try"}
  ]
}

Include 3 opportunities. Think BIG - autonomous workflows, parallel agents, iterating against tests.`,maxTokens:8192},...process.env.USER_TYPE==="ant"?[{name:"cc_team_improvements",prompt:`Analyze this Claude Code usage data and suggest product improvements for the CC team.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "improvements": [
    {"title": "Product/tooling improvement", "detail": "3-4 sentences describing the improvement", "evidence": "3-4 sentences with specific session examples"}
  ]
}

Include 2-3 improvements based on friction patterns observed.`,maxTokens:8192},{name:"model_behavior_improvements",prompt:`Analyze this Claude Code usage data and suggest model behavior improvements.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "improvements": [
    {"title": "Model behavior change", "detail": "3-4 sentences describing what the model should do differently", "evidence": "3-4 sentences with specific examples"}
  ]
}

Include 2-3 improvements based on friction patterns observed.`,maxTokens:8192}]:[],{name:"fun_ending",prompt:`Analyze this Claude Code usage data and find a memorable moment.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "headline": "A memorable QUALITATIVE moment from the transcripts - not a statistic. Something human, funny, or surprising.",
  "detail": "Brief context about when/where this happened"
}

Find something genuinely interesting or amusing from the session summaries.`,maxTokens:8192}];q0=["frustrated","dissatisfied","likely_satisfied","satisfied","happy","unsure"],K0=["not_achieved","partially_achieved","mostly_achieved","fully_achieved","unclear_from_transcript"];G0={type:"prompt",name:"insights",description:"Generate a report analyzing your Claude Code sessions",contentLength:0,progressMessage:"analyzing your sessions",source:"builtin",async getPromptForCommand(Q){let J=!1,$=[],q=!1;if(process.env.USER_TYPE==="ant"){if(J=Q?.includes("--homespaces")??!1,$=await zQ(),q=$.length>0,J&&q)console.error(`Collecting sessions from ${$.length} homespace(s): ${$.join(", ")}...`)}let{insights:V,htmlPath:L,data:Y,remoteStats:X}=await U0({collectRemote:J}),K=`file://${L}`,Z="";if(process.env.USER_TYPE==="ant"){let I=new Date().toISOString().replace(/[-:]/g,"").replace("T","_").slice(0,15),x=`${process.env.SAFEUSER||process.env.USER||"unknown"}_insights_${I}.html`,C=`s3://anthropic-serve/atamkin/cc-user-reports/${x}`,T=`https://s3-frontend.infra.ant.dev/anthropic-serve/atamkin/cc-user-reports/${x}`;K=T;try{MQ("ff",["cp",L,C],{timeout:60000,stdio:"pipe"})}catch{K=`file://${L}`,Z=`
Automatic upload failed. Are you on the boron namespace? Try \`use-bo\` and ensure you've run \`sso\`.
To share, run: ff cp ${L} ${C}
Then access at: ${T}`}}let _=[Y.total_sessions_scanned&&Y.total_sessions_scanned>Y.total_sessions?`${Y.total_sessions_scanned.toLocaleString()} sessions total · ${Y.total_sessions} analyzed`:`${Y.total_sessions} sessions`,`${Y.total_messages.toLocaleString()} messages`,`${Math.round(Y.total_duration_hours)}h`,`${Y.git_commits} commits`].join(" · "),E="";if(process.env.USER_TYPE==="ant"){if(X&&X.totalCopied>0){let I=X.hosts.filter((U)=>U.sessionCount>0).map((U)=>U.name).join(", ");E=`
_Collected ${X.totalCopied} new sessions from: ${I}_
`}else if(!J&&q)E=`
_Tip: Run \`/insights --homespaces\` to include sessions from your ${$.length} running homespace(s)_
`}let v=V.at_a_glance,M=v?`## At a Glance

${v.whats_working?`**What's working:** ${v.whats_working} See _Impressive Things You Did_.`:""}

${v.whats_hindering?`**What's hindering you:** ${v.whats_hindering} See _Where Things Go Wrong_.`:""}

${v.quick_wins?`**Quick wins to try:** ${v.quick_wins} See _Features to Try_.`:""}

${v.ambitious_workflows?`**Ambitious workflows:** ${v.ambitious_workflows} See _On the Horizon_.`:""}`:"_No insights generated_",y=`${`# Claude Code Insights

${_}
${Y.date_range.start} to ${Y.date_range.end}
${E}
`}${M}

Your full shareable insights report is ready: ${K}${Z}`;return[{type:"text",text:`The user just ran /insights to generate a usage report analyzing their Claude Code sessions.

Here is the full insights data:
${f(V,null,2)}

Report URL: ${K}
HTML file: ${L}
Facets directory: ${d()}

Here is what the user sees:
${y}

Now output the following message exactly:

<message>
Your shareable insights report is ready:
${K}${Z}

Want to dig into any section or try one of the suggestions?
</message>`}]}};g0=G0});O0();export{U0 as generateUsageReport,$0 as detectMultiClauding,g0 as default,f0 as deduplicateSessionBranches,h0 as buildExportData};

//# debugId=16C52C4BEB980C3964756E2164756E21
