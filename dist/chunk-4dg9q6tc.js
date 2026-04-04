function t(s){if(s===null||typeof s!=="object")return s;let e=s;if("requestId"in e&&!("request_id"in e))e.request_id=e.requestId,delete e.requestId;if("response"in e&&e.response!==null&&typeof e.response==="object"){let n=e.response;if("requestId"in n&&!("request_id"in n))n.request_id=n.requestId,delete n.requestId}return s}
export{t as ya};

//# debugId=464D68DABBE3E2DE64756E2164756E21
