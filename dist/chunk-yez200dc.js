import{B2 as X,C2 as J,D2 as Y,K2 as K,M2 as Z,MY as B,RY as W,b2 as D,g2 as F,h2 as G}from"./chunk-qa912cm8.js";import{O7 as z,P7 as V}from"./chunk-bwprhd4t.js";import{_ha as y,pia as Q}from"./chunk-rwxy4pne.js";import{Fia as N}from"./chunk-cs8pe1v7.js";async function P(){if(!F()||!G())return{};let w=D();if(w&&B(w.expiresAt))return null;let q=K();if(q.error)throw Error(`Auth error: ${q.error}`);let L={"Content-Type":"application/json","User-Agent":J(),...q.headers},M=`${z().BASE_API_URL}/api/oauth/usage`;return(await y.get(M,{headers:L,timeout:5000})).data}var _=N(()=>{Q();V();X();Z();Y();W()});
export{P as rg,_ as sg};

//# debugId=3C4777EBD39DF1CA64756E2164756E21
