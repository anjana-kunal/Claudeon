import{Fia as H}from"./chunk-cs8pe1v7.js";function F(){if(!A)A=new Intl.Segmenter(void 0,{granularity:"grapheme"});return A}function K(b){if(!b)return"";return F().segment(b)[Symbol.iterator]().next().value?.segment??""}function M(b){if(!b)return"";let j="";for(let{segment:q}of F().segment(b))j=q;return j}function N(){if(!B)B=new Intl.Segmenter(void 0,{granularity:"word"});return B}function O(b,j){let q=`${b}:${j}`,z=E.get(q);if(!z)z=new Intl.RelativeTimeFormat("en",{style:b,numeric:j}),E.set(q,z);return z}function P(){if(!D)D=Intl.DateTimeFormat().resolvedOptions().timeZone;return D}var A=null,B=null,E,D=null;var J=H(()=>{E=new Map});
export{F as s9,K as t9,M as u9,N as v9,O as w9,P as x9,J as y9};

//# debugId=FAC20FA849CCAE5564756E2164756E21
