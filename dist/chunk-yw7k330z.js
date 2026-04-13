import{Bu as y,Cu as w,Du as N,Eu as c,Gu as U,Hu as s,Pu as C,Su as V,Vu as l,ht as Q,it as T,pu as I,qu as v,su as S,xu as _}from"./chunk-sx42anxf.js";import"./chunk-ybehr8ss.js";import"./chunk-9ck449fb.js";import"./chunk-vrb1jw0t.js";import"./chunk-yhjpbht2.js";import"./chunk-q6h03w0j.js";import"./chunk-595m1jnw.js";import"./chunk-4j4mzhry.js";import"./chunk-ypae4nye.js";import"./chunk-4d93kjay.js";import"./chunk-yg92ah7w.js";import"./chunk-fyerceam.js";import"./chunk-tvv9be8x.js";import"./chunk-5ypgrsdr.js";import"./chunk-906farf8.js";import{jQ as j,kQ as d}from"./chunk-cgfakgev.js";import"./chunk-grc1a5d0.js";import"./chunk-g88r12hn.js";import"./chunk-28qnxhyw.js";import"./chunk-5hdk4rq8.js";import{BT as O,ET as h}from"./chunk-ah92na1g.js";import"./chunk-kk7hxh65.js";import"./chunk-anqkwm0v.js";import"./chunk-hswr9yec.js";import"./chunk-4ks0c5f1.js";import"./chunk-npr1tgwk.js";import"./chunk-6574rjk4.js";import"./chunk-qnvdtd85.js";import{MU as K,NU as f,R4 as p,WX as G,bY as k,v4 as R,y4 as E}from"./chunk-mpyxhv23.js";import"./chunk-ecxjperv.js";import"./chunk-ccs0fecd.js";import"./chunk-yjgms4ep.js";import"./chunk-6kr4cjqv.js";import"./chunk-pmk2m932.js";import"./chunk-d0tcr1pa.js";import"./chunk-vebf0sqn.js";import"./chunk-0xkapbpg.js";import"./chunk-xgb99t69.js";import"./chunk-6nv052qa.js";import"./chunk-ky8vfv6q.js";import"./chunk-wqqzqd5r.js";import"./chunk-bwprhd4t.js";import"./chunk-aqv78bm4.js";import"./chunk-c3ntnkm9.js";import"./chunk-7tv0hsgs.js";import"./chunk-gxtbrqng.js";import"./chunk-jz8356y4.js";import"./chunk-tv9gy9dh.js";import"./chunk-rfd5sckp.js";import"./chunk-kd48tng1.js";import"./chunk-vqfs5exq.js";import"./chunk-s624r7t4.js";import"./chunk-asavmsds.js";import"./chunk-yn2frn84.js";import{B9 as x,C9 as m}from"./chunk-c13kxgct.js";import"./chunk-cd3zgh8n.js";import"./chunk-yfk5e454.js";import"./chunk-wk2ksw1t.js";import"./chunk-5q1yqgkp.js";import"./chunk-md1fnd8q.js";import"./chunk-6ytmrnqq.js";import"./chunk-ksz63da1.js";import"./chunk-c4511512.js";import"./chunk-7b1vyv7e.js";import"./chunk-tyqzht40.js";import{wba as J,zba as b}from"./chunk-qr0xq9ye.js";import{Bba as q,Fba as D}from"./chunk-2chyymxq.js";import"./chunk-akrrkem2.js";import"./chunk-cn83pdqq.js";import"./chunk-4rteakec.js";import"./chunk-awpswmwp.js";import"./chunk-nfma275k.js";import"./chunk-rwxy4pne.js";import"./chunk-kdy5gw6d.js";import"./chunk-pam4fwbt.js";import"./chunk-cs8pe1v7.js";f();m();w();d();p();b();s();T();S();l();c();D();h();k();async function Qq(){x("tengu_update_check",{}),q(`Current version: ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION}
`);let W=G()?.autoUpdatesChannel??"latest";q(`Checking for updates to ${W} version...
`),J("update: Starting update check"),J("update: Running diagnostic");let H=await U();if(J(`update: Installation type: ${H.installationType}`),J(`update: Config install method: ${H.configInstallMethod}`),H.multipleInstallations.length>1){q(`
`),q(K.yellow("Warning: Multiple installations found")+`
`);for(let A of H.multipleInstallations){let B=H.installationType===A.type?" (currently running)":"";q(`- ${A.type} at ${A.path}${B}
`)}}if(H.warnings.length>0){q(`
`);for(let A of H.warnings)J(`update: Warning detected: ${A.issue}`),J(`update: Showing warning: ${A.issue}`),q(K.yellow(`Warning: ${A.issue}
`)),q(K.bold(`Fix: ${A.fix}
`))}let z=E();if(!z.installMethod&&H.installationType!=="package-manager"){q(`
`),q(`Updating configuration to track installation method...
`);let A="unknown";switch(H.installationType){case"npm-local":A="local";break;case"native":A="native";break;case"npm-global":A="global";break;default:A="unknown"}R((B)=>({...B,installMethod:A})),q(`Installation method set to: ${A}
`)}if(H.installationType==="development")q(`
`),q(K.yellow("Warning: Cannot update development build")+`
`),await Q(1);if(H.installationType==="package-manager"){let A=await N();if(q(`
`),A==="homebrew"){q(`Claude is managed by Homebrew.
`);let B=await _(W);if(B&&!O({VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION,B))q(`Update available: ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION} → ${B}
`),q(`
`),q(`To update, run:
`),q(K.bold("  brew upgrade claude-code")+`
`);else q(`Claude is up to date!
`)}else if(A==="winget"){q(`Claude is managed by winget.
`);let B=await _(W);if(B&&!O({VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION,B))q(`Update available: ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION} → ${B}
`),q(`
`),q(`To update, run:
`),q(K.bold("  winget upgrade Anthropic.ClaudeCode")+`
`);else q(`Claude is up to date!
`)}else if(A==="apk"){q(`Claude is managed by apk.
`);let B=await _(W);if(B&&!O({VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION,B))q(`Update available: ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION} → ${B}
`),q(`
`),q(`To update, run:
`),q(K.bold("  apk upgrade claude-code")+`
`);else q(`Claude is up to date!
`)}else q(`Claude is managed by a package manager.
`),q(`Please use your package manager to update.
`);await Q(0)}if(z.installMethod&&H.configInstallMethod!=="not set"&&H.installationType!=="package-manager"){let{installationType:A,configInstallMethod:B}=H,P={"npm-local":"local","npm-global":"global",native:"native",development:"development",unknown:"unknown"}[A]||A;if(P!==B&&B!=="unknown")q(`
`),q(K.yellow("Warning: Configuration mismatch")+`
`),q(`Config expects: ${B} installation
`),q(`Currently running: ${A}
`),q(K.yellow(`Updating the ${A} installation you are currently using`)+`
`),R((M)=>({...M,installMethod:P})),q(`Config updated to reflect current installation method: ${P}
`)}if(H.installationType==="native"){J("update: Detected native installation, using native updater");try{let A=await C(W,!0);if(A.lockFailed){let B=A.lockHolderPid?` (PID ${A.lockHolderPid})`:"";q(K.yellow(`Another Claude process${B} is currently running. Please try again in a moment.`)+`
`),await Q(0)}if(!A.latestVersion)process.stderr.write(`Failed to check for updates
`),await Q(1);if(A.latestVersion==={VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION)q(K.green(`Claude Code is up to date (${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION})`)+`
`);else q(K.green(`Successfully updated from ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION} to version ${A.latestVersion}`)+`
`),await j();await Q(0)}catch(A){process.stderr.write(`Error: Failed to install native update
`),process.stderr.write(String(A)+`
`),process.stderr.write(`Try running "claude doctor" for diagnostics
`),await Q(1)}}if(z.installMethod!=="native")await V();J("update: Checking npm registry for latest version"),J(`update: Package URL: ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.PACKAGE_URL}`);let L=W==="stable"?"stable":"latest",F=`npm view ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.PACKAGE_URL}@${L} version`;J(`update: Running: ${F}`);let Z=await _(W);if(J(`update: Latest version from npm: ${Z||"FAILED"}`),!Z){if(J("update: Failed to get latest version from npm registry"),process.stderr.write(K.red("Failed to check for updates")+`
`),process.stderr.write(`Unable to fetch latest version from npm registry
`),process.stderr.write(`
`),process.stderr.write(`Possible causes:
`),process.stderr.write(`  • Network connectivity issues
`),process.stderr.write(`  • npm registry is unreachable
`),process.stderr.write(`  • Corporate proxy/firewall blocking npm
`),{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.PACKAGE_URL&&!{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.PACKAGE_URL.startsWith("@anthropic"))process.stderr.write(`  • Internal/development build not published to npm
`);process.stderr.write(`
`),process.stderr.write(`Try:
`),process.stderr.write(`  • Check your internet connection
`),process.stderr.write(`  • Run with --debug flag for more details
`);let A={VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.PACKAGE_URL||(process.env.USER_TYPE==="ant"?"@anthropic-ai/claude-cli":"@anthropic-ai/claude-code");process.stderr.write(`  • Manually check: npm view ${A} version
`),process.stderr.write(`  • Check if you need to login: npm whoami
`),await Q(1)}if(Z==={VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION)q(K.green(`Claude Code is up to date (${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION})`)+`
`),await Q(0);q(`New version available: ${Z} (current: ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION})
`),q(`Installing update...
`);let X=!1,Y="";switch(H.installationType){case"npm-local":X=!0,Y="local";break;case"npm-global":X=!1,Y="global";break;case"unknown":{let A=await v();X=A,Y=A?"local":"global",q(K.yellow("Warning: Could not determine installation type")+`
`),q(`Attempting ${Y} update based on file detection...
`);break}default:process.stderr.write(`Error: Cannot update ${H.installationType} installation
`),await Q(1)}q(`Using ${Y} installation update method...
`),J(`update: Update method determined: ${Y}`),J(`update: useLocalUpdate: ${X}`);let $;if(X)J("update: Calling installOrUpdateClaudePackage() for local update"),$=await I(W);else J("update: Calling installGlobalPackage() for global update"),$=await y();switch(J(`update: Installation status: ${$}`),$){case"success":q(K.green(`Successfully updated from ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.VERSION} to version ${Z}`)+`
`),await j();break;case"no_permissions":if(process.stderr.write(`Error: Insufficient permissions to install update
`),X)process.stderr.write(`Try manually updating with:
`),process.stderr.write(`  cd ~/.claude/local && npm update ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.PACKAGE_URL}
`);else process.stderr.write(`Try running with sudo or fix npm permissions
`),process.stderr.write(`Or consider using native installation with: claude install
`);await Q(1);break;case"install_failed":if(process.stderr.write(`Error: Failed to install update
`),X)process.stderr.write(`Try manually updating with:
`),process.stderr.write(`  cd ~/.claude/local && npm update ${{VERSION:"1.0.0-local",BUILD_TIME:"2026-04-13T10:28:01.924Z",PACKAGE_URL:"@anthropic-ai/claude-code",NATIVE_PACKAGE_URL:"@anthropic-ai/claude-code-native",ISSUES_EXPLAINER:"open an issue at https://github.com/anthropics/claude-code/issues",FEEDBACK_CHANNEL:"#claude-code-feedback",VERSION_CHANGELOG:""}.PACKAGE_URL}
`);else process.stderr.write(`Or consider using native installation with: claude install
`);await Q(1);break;case"in_progress":process.stderr.write(`Error: Another instance is currently performing an update
`),process.stderr.write(`Please wait and try again later
`),await Q(1);break}await Q(0)}export{Qq as update};

//# debugId=A84E37280396356664756E2164756E21
