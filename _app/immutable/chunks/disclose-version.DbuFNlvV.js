import{w as c,x as i,y as m,T as p,z as T,q as f,v as d,A as w,B as y}from"./runtime.9m-lsYQL.js";function h(r){var t=document.createElement("template");return t.innerHTML=r,t.content}function a(r,t){var e=m;e.nodes_start===null&&(e.nodes_start=r,e.nodes_end=t)}function C(r,t){var e=(t&p)!==0,l=(t&T)!==0,s,_=!r.startsWith("<!>");return()=>{if(f)return a(d,null),d;s===void 0&&(s=h(_?r:"<!>"+r),e||(s=i(s)));var n=l?document.importNode(s,!0):s.cloneNode(!0);if(e){var v=i(n),o=n.lastChild;a(v,o)}else a(n,n);return n}}function M(r,t,e="svg"){var l=!r.startsWith("<!>"),s=(t&p)!==0,_=`<${e}>${l?r:"<!>"+r}</${e}>`,n;return()=>{if(f)return a(d,null),d;if(!n){var v=h(_),o=i(v);if(s)for(n=document.createDocumentFragment();i(o);)n.appendChild(i(o));else n=i(o)}var u=n.cloneNode(!0);if(s){var g=i(u),E=u.lastChild;a(g,E)}else a(u,u);return u}}function A(r=""){if(!f){var t=c(r+"");return a(t,t),t}var e=d;return e.nodeType!==3&&(e.before(e=c()),w(e)),a(e,e),e}function L(){if(f)return a(d,null),d;var r=document.createDocumentFragment(),t=document.createComment(""),e=c();return r.append(t,e),a(t,e),r}function P(r,t){if(f){m.nodes_end=d,y();return}r!==null&&r.before(t)}const N="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(N);export{P as a,a as b,L as c,A as d,M as n,C as t};
