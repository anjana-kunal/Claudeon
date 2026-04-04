import{Io as I,Lo as W}from"./chunk-tzyj4bcp.js";import{Jba as H,Tba as V}from"./chunk-akrrkem2.js";V();W();var J=null,z=null,N=null;function Z(f){J=f}function $(f){z=f}function q(f){N=f}var G=!1,O="idle";function F(){return O}function K(f,B){if(O=f,J?.(f,B),f==="requires_action"&&B)G=!0,z?.({pending_action:B});else if(G)G=!1,z?.({pending_action:null});if(f==="idle")z?.({task_summary:null});if(H(process.env.CLAUDE_CODE_EMIT_SESSION_STATE_EVENTS))I({type:"system",subtype:"session_state_changed",state:f})}function Q(f){z?.(f)}function R(f){N?.(f)}
export{Z as Ja,$ as Ka,q as La,F as Ma,K as Na,Q as Oa,R as Pa};

//# debugId=77EDCFA94587593664756E2164756E21
