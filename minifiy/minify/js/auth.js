(function(){const TOKEN_COOKIE_NAME="auth.token";const DEV_TTL_MS=30*60*1000;const PROD_TTL_MS=5*60*1000;const TOKEN_TTL_MS=PROD_TTL_MS;function shouldUseLocalStorage(){if(location.protocol==="file:")return!0;try{document.cookie="ck.test=1; Max-Age=1; Path=/; SameSite=Lax";const ok=document.cookie.includes("ck.test=1");document.cookie="ck.test=; Max-Age=0; Path=/; SameSite=Lax";return!ok}catch{return!0}}
const cookieStore={set(name,value,maxAgeSeconds,path="/"){document.cookie=`${encodeURIComponent(name)}=${encodeURIComponent(value)}; `+`Max-Age=${maxAgeSeconds}; Path=${path}; SameSite=Lax`},get(name){const cookies=document.cookie?document.cookie.split("; "):[];for(let i=0;i<cookies.length;i++){const parts=cookies[i].split("=");const k=decodeURIComponent(parts.shift());const v=parts.join("=");if(k===name)return decodeURIComponent(v);}
return null},remove(name,path="/"){document.cookie=`${encodeURIComponent(name)}=; Max-Age=0; Path=${path}; SameSite=Lax`},};const lsStore={set(name,value,maxAgeSeconds){const e=Date.now()+maxAgeSeconds*1000;localStorage.setItem(name,JSON.stringify({v:value,e}))},get(name){const raw=localStorage.getItem(name);if(!raw)return null;try{const{v,e}=JSON.parse(raw);if(e&&Date.now()>e){localStorage.removeItem(name);return null}
return v??null}catch{localStorage.removeItem(name);return null}},remove(name){localStorage.removeItem(name)},};const store=shouldUseLocalStorage()?lsStore:cookieStore;function setToken(token,ttlMs=TOKEN_TTL_MS){const maxAgeSeconds=Math.floor(ttlMs/1000);store.set(TOKEN_COOKIE_NAME,token,maxAgeSeconds);setupExpiryTimeout(ttlMs)}
function getToken(){return store.get(TOKEN_COOKIE_NAME)}
function clearToken(){store.remove(TOKEN_COOKIE_NAME);clearExpiryTimeout()}
let expiryTimeoutId=null;function setupExpiryTimeout(ttlMs){clearExpiryTimeout();expiryTimeoutId=setTimeout(()=>{clearToken();if(window.toast?.warning){toast.warning("Session expired. Please log in again.")}
window.location.replace("./login.html")},ttlMs)}
function clearExpiryTimeout(){if(expiryTimeoutId){clearTimeout(expiryTimeoutId);expiryTimeoutId=null}}
function requireAuth(redirectLogin="./login.html"){const token=getToken();if(!token){if(window.toast?.warning){toast.warning("Authentication required. Redirecting to login.")}
window.location.replace(redirectLogin);return!1}
setupExpiryTimeout(TOKEN_TTL_MS);return!0}
async function clearTokenAfter(apiCallPromise,{redirectToLogin=!0}={}){const result=await apiCallPromise;try{clearToken()}finally{if(redirectToLogin){window.location.replace("./login.html")}}
return result}
async function logout(){try{if(window.API_ENDPOINTS?.logout){await apiPost(API_ENDPOINTS.logout)}}catch(e){console.warn("logout endpoint failed:",e)}finally{clearToken();window.location.replace("./login.html")}}
window.Auth={setToken,getToken,clearToken,requireAuth,TOKEN_TTL_MS,clearTokenAfter,logout,}})()