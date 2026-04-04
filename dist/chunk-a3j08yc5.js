import{R3 as p,b4 as x,bX as s}from"./chunk-n3383yqa.js";import{qha as r}from"./chunk-cn83pdqq.js";import{Fia as n}from"./chunk-cs8pe1v7.js";var c="ToolSearch";var T=()=>{};function N(){return process.env.USER_TYPE==="ant"||p("tengu_glacier_2xr",!1)?"Deferred tools appear by name in <system-reminder> messages.":"Deferred tools appear by name in <available-deferred-tools> messages."}function v(O){if(O.alwaysLoad===!0)return!1;if(O.isMcp===!0)return!0;if(O.name===c)return!1;return O.shouldDefer===!0}function w(O){return O.name}function y(){return L+N()+R}var L=`Fetches full schema definitions for deferred tools so they can be called.

`,R=` Until fetched, only the name is known — there is no parameter schema, so the tool cannot be invoked. This tool takes a query, matches it against the deferred tool list, and returns the matched tools' complete JSONSchema definitions inside a <functions> block. Once a tool's schema appears in that result, it is callable exactly like any tool defined at the top of the prompt.

Result format: each matched tool appears as one <function>{"description": "...", "name": "...", "parameters": {...}}</function> line inside the <functions> block — the same encoding as the tool list at the top of this prompt.

Query forms:
- "select:Read,Edit,Grep" — fetch these exact tools by name
- "notebook jupyter" — keyword search, up to max_results best matches
- "+slack send" — require "slack" in the name, rank by remaining terms`;var S=n(()=>{r();x();s();T();T()});
export{c as HT,v as IT,w as JT,y as KT,S as LT};

//# debugId=2C92C5746561E15A64756E2164756E21
