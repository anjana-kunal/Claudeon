import{VP as B,WP as P_}from"./chunk-5ypgrsdr.js";import{PQ as x,RQ as q_,SQ as F,UQ as K_,aR as Q,bR as O_}from"./chunk-g88r12hn.js";import{NS as g,PS as A,cR as r,dR as a,sT as i,vS as n,wS as f_}from"./chunk-28qnxhyw.js";import{FT as p}from"./chunk-kk7hxh65.js";import{GT as e}from"./chunk-anqkwm0v.js";import{B9 as G,C9 as __}from"./chunk-c13kxgct.js";import{Bia as j,Fia as W}from"./chunk-cs8pe1v7.js";function b(O,_,f){let q=x(),z=q?.getDisplayText(O,_),K=z===void 0,w=q?"action_not_found":"no_context",$=V.useRef(!1);return V.useEffect(()=>{if(K&&!$.current)$.current=!0,G("tengu_keybinding_fallback_used",{action:O,context:_,fallback:f,reason:w})},[K,O,_,f,w]),K?f:z}var V;var l=W(()=>{__();q_();V=j(e(),1)});function d(O){let _=r(9),{shortcut:f,action:q,parens:z,bold:K}=O,w=z===void 0?!1:z,$=K===void 0?!1:K,v;if(_[0]!==$||_[1]!==f)v=$?L.jsxDEV(n,{bold:!0,children:f},void 0,!1,void 0,this):f,_[0]=$,_[1]=f,_[2]=v;else v=_[2];let P=v;if(w){let H;if(_[3]!==q||_[4]!==P)H=L.jsxDEV(n,{children:["(",P," to ",q,")"]},void 0,!0,void 0,this),_[3]=q,_[4]=P,_[5]=H;else H=_[5];return H}let Y;if(_[6]!==q||_[7]!==P)Y=L.jsxDEV(n,{children:[P," to ",q]},void 0,!0,void 0,this),_[6]=q,_[7]=P,_[8]=Y;else Y=_[8];return Y}var L;var E=W(()=>{a();f_();L=j(p(),1)});function c(O){let _=r(5),{action:f,context:q,fallback:z,description:K,parens:w,bold:$}=O,v=b(f,q,z),P;if(_[0]!==$||_[1]!==K||_[2]!==w||_[3]!==v)P=s.jsxDEV(d,{shortcut:v,action:K,parens:w,bold:$},void 0,!1,void 0,this),_[0]=$,_[1]=K,_[2]=w,_[3]=v,_[4]=P;else P=_[4];return P}var s;var I=W(()=>{a();l();E();s=j(p(),1)});function t(O){let _=r(5),{children:f}=O,q,z;if(_[0]!==f){z=Symbol.for("react.early_return_sentinel");_:{let w=X.Children.toArray(f);if(w.length===0){z=null;break _}q=w.map(z_)}_[0]=f,_[1]=q,_[2]=z}else q=_[1],z=_[2];if(z!==Symbol.for("react.early_return_sentinel"))return z;let K;if(_[3]!==q)K=y.jsxDEV(y.Fragment,{children:q},void 0,!1,void 0,this),_[3]=q,_[4]=K;else K=_[4];return K}function z_(O,_){return y.jsxDEV(X.default.Fragment,{children:[_>0&&y.jsxDEV(A,{dimColor:!0,children:" · "},void 0,!1,void 0,this),O]},X.isValidElement(O)?O.key??_:_,!0,void 0,this)}var X,y;var U=W(()=>{a();i();X=j(e(),1),y=j(p(),1)});function u_(O){let _=r(27),{title:f,subtitle:q,children:z,onCancel:K,color:w,hideInputGuide:$,hideBorder:v,inputGuide:P,isCancelActive:Y}=O,H=w===void 0?"permission":w,N=Y===void 0?!0:Y,k=B(void 0,void 0,N),S;if(_[0]!==N)S={context:"Confirmation",isActive:N},_[0]=N,_[1]=S;else S=_[1];F("confirm:no",K,S);let Z;if(_[2]!==k.keyName||_[3]!==k.pending)Z=k.pending?M.jsxDEV(A,{children:["Press ",k.keyName," again to exit"]},void 0,!0,void 0,this):M.jsxDEV(t,{children:[M.jsxDEV(d,{shortcut:"Enter",action:"confirm"},void 0,!1,void 0,this),M.jsxDEV(c,{action:"confirm:no",context:"Confirmation",fallback:"Esc",description:"cancel"},void 0,!1,void 0,this)]},void 0,!0,void 0,this),_[2]=k.keyName,_[3]=k.pending,_[4]=Z;else Z=_[4];let C=Z,T;if(_[5]!==H||_[6]!==f)T=M.jsxDEV(A,{bold:!0,color:H,children:f},void 0,!1,void 0,this),_[5]=H,_[6]=f,_[7]=T;else T=_[7];let m;if(_[8]!==q)m=q&&M.jsxDEV(A,{dimColor:!0,children:q},void 0,!1,void 0,this),_[8]=q,_[9]=m;else m=_[9];let D;if(_[10]!==T||_[11]!==m)D=M.jsxDEV(g,{flexDirection:"column",children:[T,m]},void 0,!0,void 0,this),_[10]=T,_[11]=m,_[12]=D;else D=_[12];let J;if(_[13]!==z||_[14]!==D)J=M.jsxDEV(g,{flexDirection:"column",gap:1,children:[D,z]},void 0,!0,void 0,this),_[13]=z,_[14]=D,_[15]=J;else J=_[15];let h;if(_[16]!==C||_[17]!==k||_[18]!==$||_[19]!==P)h=!$&&M.jsxDEV(g,{marginTop:1,children:M.jsxDEV(A,{dimColor:!0,italic:!0,children:P?P(k):C},void 0,!1,void 0,this)},void 0,!1,void 0,this),_[16]=C,_[17]=k,_[18]=$,_[19]=P,_[20]=h;else h=_[20];let o;if(_[21]!==J||_[22]!==h)o=M.jsxDEV(M.Fragment,{children:[J,h]},void 0,!0,void 0,this),_[21]=J,_[22]=h,_[23]=o;else o=_[23];let u=o;if(v)return u;let R;if(_[24]!==H||_[25]!==u)R=M.jsxDEV(Q,{color:H,children:u},void 0,!1,void 0,this),_[24]=H,_[25]=u,_[26]=R;else R=_[26];return R}var M;var M_=W(()=>{a();P_();i();K_();I();U();E();O_();M=j(p(),1)});function L_(){return`# Claude in Chrome browser automation

You have access to browser automation tools (mcp__claude-in-chrome__*) for interacting with web pages in Chrome. Follow these guidelines for effective browser automation.

## GIF recording

When performing multi-step browser interactions that the user may want to review or share, use mcp__claude-in-chrome__gif_creator to record them.

You must ALWAYS:
* Capture extra frames before and after taking actions to ensure smooth playback
* Name the file meaningfully to help the user identify it later (e.g., "login_process.gif")

## Console log debugging

You can use mcp__claude-in-chrome__read_console_messages to read console output. Console output may be verbose. If you are looking for specific log entries, use the 'pattern' parameter with a regex-compatible pattern. This filters results efficiently and avoids overwhelming output. For example, use pattern: "[MyApp]" to filter for application-specific logs rather than reading all console output.

## Alerts and dialogs

IMPORTANT: Do not trigger JavaScript alerts, confirms, prompts, or browser modal dialogs through your actions. These browser dialogs block all further browser events and will prevent the extension from receiving any subsequent commands. Instead, when possible, use console.log for debugging and then use the mcp__claude-in-chrome__read_console_messages tool to read those log messages. If a page has dialog-triggering elements:
1. Avoid clicking buttons or links that may trigger alerts (e.g., "Delete" buttons with confirmation dialogs)
2. If you must interact with such elements, warn the user first that this may interrupt the session
3. Use mcp__claude-in-chrome__javascript_tool to check for and dismiss any existing dialogs before proceeding

If you accidentally trigger a dialog and lose responsiveness, inform the user they need to manually dismiss it in the browser.

## Avoid rabbit holes and loops

When using browser automation tools, stay focused on the specific task. If you encounter any of the following, stop and ask the user for guidance:
- Unexpected complexity or tangential browser exploration
- Browser tool calls failing or returning errors after 2-3 attempts
- No response from the browser extension
- Page elements not responding to clicks or input
- Pages not loading or timing out
- Unable to complete the browser task despite multiple approaches

Explain what you attempted, what went wrong, and ask how the user would like to proceed. Do not keep retrying the same failing browser action or explore unrelated pages without checking in first.

## Tab context and session startup

IMPORTANT: At the start of each browser automation session, call mcp__claude-in-chrome__tabs_context_mcp first to get information about the user's current browser tabs. Use this context to understand what the user might want to work with before creating new tabs.

Never reuse tab IDs from a previous/other session. Follow these guidelines:
1. Only reuse an existing tab if the user explicitly asks to work with it
2. Otherwise, create a new tab with mcp__claude-in-chrome__tabs_create_mcp
3. If a tool returns an error indicating the tab doesn't exist or is invalid, call tabs_context_mcp to get fresh tab IDs
4. When a tab is closed by the user or a navigation error occurs, call tabs_context_mcp to see what tabs are available`}var V_=`# Claude in Chrome browser automation

You have access to browser automation tools (mcp__claude-in-chrome__*) for interacting with web pages in Chrome. Follow these guidelines for effective browser automation.

## GIF recording

When performing multi-step browser interactions that the user may want to review or share, use mcp__claude-in-chrome__gif_creator to record them.

You must ALWAYS:
* Capture extra frames before and after taking actions to ensure smooth playback
* Name the file meaningfully to help the user identify it later (e.g., "login_process.gif")

## Console log debugging

You can use mcp__claude-in-chrome__read_console_messages to read console output. Console output may be verbose. If you are looking for specific log entries, use the 'pattern' parameter with a regex-compatible pattern. This filters results efficiently and avoids overwhelming output. For example, use pattern: "[MyApp]" to filter for application-specific logs rather than reading all console output.

## Alerts and dialogs

IMPORTANT: Do not trigger JavaScript alerts, confirms, prompts, or browser modal dialogs through your actions. These browser dialogs block all further browser events and will prevent the extension from receiving any subsequent commands. Instead, when possible, use console.log for debugging and then use the mcp__claude-in-chrome__read_console_messages tool to read those log messages. If a page has dialog-triggering elements:
1. Avoid clicking buttons or links that may trigger alerts (e.g., "Delete" buttons with confirmation dialogs)
2. If you must interact with such elements, warn the user first that this may interrupt the session
3. Use mcp__claude-in-chrome__javascript_tool to check for and dismiss any existing dialogs before proceeding

If you accidentally trigger a dialog and lose responsiveness, inform the user they need to manually dismiss it in the browser.

## Avoid rabbit holes and loops

When using browser automation tools, stay focused on the specific task. If you encounter any of the following, stop and ask the user for guidance:
- Unexpected complexity or tangential browser exploration
- Browser tool calls failing or returning errors after 2-3 attempts
- No response from the browser extension
- Page elements not responding to clicks or input
- Pages not loading or timing out
- Unable to complete the browser task despite multiple approaches

Explain what you attempted, what went wrong, and ask how the user would like to proceed. Do not keep retrying the same failing browser action or explore unrelated pages without checking in first.

## Tab context and session startup

IMPORTANT: At the start of each browser automation session, call mcp__claude-in-chrome__tabs_context_mcp first to get information about the user's current browser tabs. Use this context to understand what the user might want to work with before creating new tabs.

Never reuse tab IDs from a previous/other session. Follow these guidelines:
1. Only reuse an existing tab if the user explicitly asks to work with it
2. Otherwise, create a new tab with mcp__claude-in-chrome__tabs_create_mcp
3. If a tool returns an error indicating the tab doesn't exist or is invalid, call tabs_context_mcp to get fresh tab IDs
4. When a tab is closed by the user or a navigation error occurs, call tabs_context_mcp to see what tabs are available`,n_=`**IMPORTANT: Before using any chrome browser tools, you MUST first load them using ToolSearch.**

Chrome browser tools are MCP tools that require loading before use. Before calling any mcp__claude-in-chrome__* tool:
1. Use ToolSearch with \`select:mcp__claude-in-chrome__<tool_name>\` to load the specific tool
2. Then call the tool

For example, to get tab context:
1. First: ToolSearch with query "select:mcp__claude-in-chrome__tabs_context_mcp"
2. Then: Call mcp__claude-in-chrome__tabs_context_mcp`,a_='**Browser Automation**: Chrome browser tools are available via the "claude-in-chrome" skill. CRITICAL: Before using any mcp__claude-in-chrome__* tools, invoke the skill by calling the Skill tool with skill: "claude-in-chrome". The skill provides browser automation instructions and enables the tools.';var w_=()=>{};
export{b as qO,l as rO,d as sO,E as tO,c as uO,I as vO,t as wO,U as xO,u_ as yO,M_ as zO,V_ as AO,n_ as BO,L_ as CO,a_ as DO,w_ as EO};

//# debugId=91B334D83937BE3064756E2164756E21
