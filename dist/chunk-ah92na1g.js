import{n8 as z}from"./chunk-tv9gy9dh.js";import{Fia as w}from"./chunk-cs8pe1v7.js";function j(){if(!k)k=z();return k}function B(f,h){if(typeof Bun<"u")return Bun.semver.order(f,h)===1;return j().gt(f,h,{loose:!0})}function C(f,h){if(typeof Bun<"u")return Bun.semver.order(f,h)>=0;return j().gte(f,h,{loose:!0})}function D(f,h){if(typeof Bun<"u")return Bun.semver.order(f,h)===-1;return j().lt(f,h,{loose:!0})}function E(f,h){if(typeof Bun<"u")return Bun.semver.satisfies(f,h);return j().satisfies(f,h,{loose:!0})}var k;var A=()=>{};
export{B as AT,C as BT,D as CT,E as DT,A as ET};

//# debugId=CD410C02F64E77F164756E2164756E21
