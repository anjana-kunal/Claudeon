import{R7 as n,S7 as e}from"./chunk-c3ntnkm9.js";import{Fia as i}from"./chunk-cs8pe1v7.js";function s(t){return{command:"",args:[],env:{}}}function p(t){return r.parse(t)}var r;var o=i(()=>{e();r=n.object({name:n.string(),version:n.string(),description:n.string().optional(),command:n.string().optional(),args:n.array(n.string()).optional(),env:n.record(n.string()).optional()})});o();export{p as validateManifest,s as getMcpConfigForManifest,r as McpbManifestSchema};

//# debugId=D9E870FB9A5CA9DB64756E2164756E21
