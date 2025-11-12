async function parseMaybeJson(response){const text=await response.text();try{return JSON.parse(text)}catch{return text}}
function handleAuthFailure(){try{window.Auth?.clearToken?.();if(window.toast?.warning){toast.warning("Session expired or unauthorized. Redirecting to login.")}}catch(e){console.error(e)}finally{setTimeout(()=>{window.location.href="./login.html"},700)}}
async function apiGet(endpoint){try{const response=await fetch(getAuthorizedUrl(endpoint),{method:"GET"});if(!response.ok){if(response.status===401||response.status===403){handleAuthFailure();throw new Error(`Unauthorized (status ${response.status})`)}
throw new Error(`HTTP error! status: ${response.status}`)}
return await parseMaybeJson(response)}catch(error){console.error("Error in GET request:",error);throw error}}
async function apiPost(endpoint,data={}){try{const formData=new URLSearchParams();for(const key in data){formData.append(key,data[key])}
const response=await fetch(getAuthorizedUrl(endpoint),{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:formData,});if(!response.ok){if(response.status===401||response.status===403){handleAuthFailure();throw new Error(`Unauthorized (status ${response.status})`)}
throw new Error(`HTTP error! status: ${response.status}`)}
return await parseMaybeJson(response)}catch(error){console.error("Error in POST request:",error);throw error}}
window.refreshMjpegStream=function refreshMjpegStream(selectorOrEl="#mjpegStream"){try{const img=(typeof selectorOrEl==="string")?document.querySelector(selectorOrEl):selectorOrEl;if(!img||!img.tagName||img.tagName.toLowerCase()!=="img")return;let nextSrc="";try{const url=new URL(img.src,window.location.href);url.searchParams.set("_t",Date.now().toString());nextSrc=url.toString()}catch{const base=(img.src||"").split("?")[0];nextSrc=base+"?_t="+Date.now()}
img.src="";requestAnimationFrame(()=>{img.src=nextSrc})}catch(e){console.warn("[refreshMjpegStream] failed:",e)}}