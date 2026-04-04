import{Fia as x}from"./chunk-cs8pe1v7.js";class w{peer;closed=!1;onclose;onerror;onmessage;_setPeer(j){this.peer=j}async start(){}async send(j){if(this.closed)throw Error("Transport is closed");queueMicrotask(()=>{this.peer?.onmessage?.(j)})}async close(){if(this.closed)return;if(this.closed=!0,this.onclose?.(),this.peer&&!this.peer.closed)this.peer.closed=!0,this.peer.onclose?.()}}function z(){let j=new w,q=new w;return j._setPeer(q),q._setPeer(j),[j,q]}var y=()=>{};y();export{z as createLinkedTransportPair};

//# debugId=B05672E94E33D50464756E2164756E21
