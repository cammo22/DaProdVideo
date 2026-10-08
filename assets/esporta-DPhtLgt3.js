const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./istantanea-CSZZmT7P.js","./motore-D0LSrwYq.js","./rolldown-runtime-Dd_uD5pT.js","./preload-helper-QY4cHmyq.js","./packet-DH7nnfar.js","./__vite-browser-external-5eBdwsFd.js","./mediabunny-aac-encoder-hkivC0Ui.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-Dd_uD5pT.js";import{At as t,B as n,Bn as r,C as i,Cn as a,D as o,Dn as s,Dt as c,E as l,En as u,Et as d,F as f,G as p,Ht as m,In as h,Jt as g,Kt as _,Ln as v,Lt as y,Mn as b,Mt as x,Nn as S,On as C,Pn as w,Pt as T,Qt as E,Rn as D,S as O,Sn as ee,Sr as te,T as k,Tn as A,U as ne,Un as re,V as ie,Vn as j,Wn as ae,Xn as oe,Xt as se,Yn as ce,Zn as le,Zt as ue,_ as de,_r as fe,a as pe,ar as me,b as he,br as ge,bt as _e,c as ve,cr as ye,ct as be,d as xe,er as Se,f as Ce,gr as we,gt as Te,h as Ee,i as De,ir as Oe,jt as ke,kn as Ae,kt as je,l as Me,m as Ne,mr as Pe,n as Fe,nr as Ie,o as Le,on as Re,or as ze,ot as Be,pn as Ve,pr as He,qn as Ue,qt as We,r as Ge,rn as Ke,s as qe,sr as Je,t as M,tn as Ye,u as Xe,ur as Ze,vn as Qe,vr as $e,w as et,wn as tt,wr as nt,wt as N,x as rt,xr as it,y as at,yr as ot,yt as st,z as ct,zn as lt}from"./motore-D0LSrwYq.js";import{_ as ut,d as dt,g as ft,t as pt}from"./preload-helper-QY4cHmyq.js";function P(e,t=null,...n){let r=document.createElement(e);if(t){for(let[e,n]of Object.entries(t))if(n!=null&&n!==!1){if(e===`on`)for(let[e,t]of Object.entries(n))r.addEventListener(e,t);else e===`class`?r.className=String(n):e===`style`?r.setAttribute(`style`,String(n)):e===`html`?r.innerHTML=String(n):e in r&&typeof n!=`string`?r[e]=n:r.setAttribute(e,n===!0?``:String(n))}}return mt(r,n),r}function mt(e,t){for(let n of t)n!=null&&n!==!1&&(Array.isArray(n)?mt(e,n):e.appendChild(typeof n==`object`?n:document.createTextNode(String(n))))}var ht={play:`<path d="M7 5l12 7-12 7z" fill="currentColor"/>`,stop:`<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>`,pausa:`<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>`,indietro:`<path d="M11 6l-8 6 8 6zM21 6l-8 6 8 6z" fill="currentColor"/>`,avanti:`<path d="M3 6l8 6-8 6zM13 6l8 6-8 6z" fill="currentColor"/>`,fotoPrec:`<path d="M16 6l-8 6 8 6z" fill="currentColor"/><rect x="5" y="6" width="2.4" height="12" fill="currentColor"/>`,fotoSucc:`<path d="M8 6l8 6-8 6z" fill="currentColor"/><rect x="16.6" y="6" width="2.4" height="12" fill="currentColor"/>`,inizio:`<path d="M18 6l-9 6 9 6z" fill="currentColor"/><rect x="5" y="5" width="2.4" height="14" fill="currentColor"/>`,fine:`<path d="M6 6l9 6-9 6z" fill="currentColor"/><rect x="16.6" y="5" width="2.4" height="14" fill="currentColor"/>`,loop:`<path d="M4 12a6 6 0 016-6h7l-2.5-2.5M20 12a6 6 0 01-6 6H7l2.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,segnaIn:`<path d="M8 4v16M8 4h8M8 20h8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,segnaOut:`<path d="M16 4v16M16 4H8M16 20H8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,forbici:`<circle cx="6" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 8.5L20 18M8.5 15.5L20 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,cestino:`<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,chiudi:`<path d="M4 12h6M14 12h6M10 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 6v12M21 6v12" stroke="currentColor" stroke-width="2"/>`,catena:`<path d="M10 14l4-4M8 11l-2 2a3 3 0 004 4l2-2M16 13l2-2a3 3 0 00-4-4l-2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,dissolvenza:`<path d="M3 19L21 5" stroke="currentColor" stroke-width="2"/><rect x="3" y="5" width="18" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 19V5h9z" fill="currentColor" opacity=".45"/>`,apri:`<path d="M3 7h6l2 2h10v10H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,salva:`<path d="M5 3h11l3 3v15H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="8" y="3" width="7" height="5" fill="currentColor"/><rect x="8" y="13" width="8" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>`,importa:`<path d="M12 3v12M7 10l5 5 5-5M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,esporta:`<path d="M12 15V3M7 8l5-5 5 5M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,annulla:`<path d="M9 5L4 10l5 5M4 10h10a6 6 0 010 12h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,ripeti:`<path d="M15 5l5 5-5 5M20 10H10a6 6 0 000 12h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,occhio:`<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>`,lucchetto:`<rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="2"/>`,altoparlante:`<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,calamita:`<path d="M6 4v8a6 6 0 0012 0V4h-4v8a2 2 0 01-4 0V4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,onda:`<path d="M2 12h3l2-6 3 12 3-15 3 18 2-9h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,zoomPiu:`<circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5M7 10h6M10 7v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,zoomMeno:`<circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,adatta:`<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,piu:`<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,marcatore:`<path d="M6 3h12v12l-6 6-6-6z" fill="currentColor"/>`,titolo:`<path d="M5 5h14M12 5v14M8 19h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,barre:`<rect x="3" y="4" width="3" height="16" fill="#c0c0c0"/><rect x="6" y="4" width="3" height="16" fill="#c0c000"/><rect x="9" y="4" width="3" height="16" fill="#00c0c0"/><rect x="12" y="4" width="3" height="16" fill="#00c000"/><rect x="15" y="4" width="3" height="16" fill="#c000c0"/><rect x="18" y="4" width="3" height="16" fill="#c00000"/>`,menu:`<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,ingranaggio:`<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,schermo:`<rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="2"/>`,elastico:`<path d="M3 17l5-6 5 3 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="11" r="2" fill="currentColor"/><circle cx="13" cy="14" r="2" fill="currentColor"/>`,ripple:`<path d="M3 12h7M14 12h7M10 8v8M14 8v8M17 9l3 3-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,cerchio:`<circle cx="12" cy="12" r="8" fill="currentColor"/>`,info:`<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,x:`<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,musica:`<path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.8" fill="currentColor"/><circle cx="17.5" cy="16" r="2.8" fill="currentColor"/>`,immagine:`<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9.5" r="1.8" fill="currentColor"/><path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,video:`<rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 10l5-3v10l-5-3z" fill="currentColor"/>`,transizione:`<rect x="3" y="5" width="9" height="14" rx="1.5" fill="currentColor" opacity=".45"/><rect x="12" y="5" width="9" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12h6M13 9.5l2.5 2.5-2.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,effetti:`<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z" fill="currentColor"/><path d="M18.5 14l.9 2.2 2.1.8-2.1.8-.9 2.2-.9-2.2-2.1-.8 2.1-.8z" fill="currentColor"/>`,punto:`<circle cx="12" cy="12" r="3.4" fill="currentColor"/>`,cartella:`<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2.2h7.4A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" fill="currentColor"/>`,cartellaPiu:`<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2.2h7.4A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.5v6M9 13.5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,freccia:`<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,griglia:`<rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor"/><rect x="14" y="4" width="6" height="6" rx="1" fill="currentColor"/><rect x="4" y="14" width="6" height="6" rx="1" fill="currentColor"/><rect x="14" y="14" width="6" height="6" rx="1" fill="currentColor"/>`,tutto:`<rect x="4" y="4" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="13" y="4" width="7" height="7" rx="1.5" fill="currentColor" opacity=".6"/><rect x="4" y="13" width="7" height="7" rx="1.5" fill="currentColor" opacity=".6"/><rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor"/>`,finale:`<path d="M4 9h16v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 9l2-5 3 1-1.5 4M9 5l4 1.2L11.5 9M13 6.2l4 1.2L16 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 12.5l4 2.5-4 2.5z" fill="currentColor"/>`,pieno:`<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,montaggio:`<path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".5"/><rect x="5" y="5" width="7" height="4" rx="1" fill="currentColor"/><rect x="10" y="10" width="9" height="4" rx="1" fill="currentColor"/><rect x="4" y="15" width="10" height="4" rx="1" fill="currentColor"/>`,mic:`<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,webcam:`<circle cx="12" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.6" fill="currentColor"/><path d="M7 21h10M12 17v4" stroke="currentColor" stroke-width="2"/>`,telecomando:`<rect x="7" y="2.5" width="10" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7.5" r="1.8" fill="#ff4d6d"/><path d="M10 12h4M10 15.5h4" stroke="currentColor" stroke-width="1.8"/>`,automatico:`<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" fill="currentColor"/><path d="M18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9zM5 3.5l.6 1.4 1.4.6-1.4.6L5 7.5l-.6-1.4L3 5.5l1.4-.6z" fill="currentColor" opacity=".7"/>`,live:`<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.5" fill="#ff4d6d"/>`,vista:`<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 4v16M3 13h12" stroke="currentColor" stroke-width="2"/><rect x="16.5" y="6" width="3" height="12" rx=".8" fill="currentColor" opacity=".6"/>`,aggiorna:`<path d="M20 12a8 8 0 11-2.34-5.66M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,sottotitoli:`<rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 10.2a2.2 2.2 0 100 3.6M17 10.2a2.2 2.2 0 100 3.6" fill="none" stroke="currentColor" stroke-width="1.8"/>`,logo:`<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>`,lingua:`<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>`,apertura:`<rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M7 5v4M12 5v4M17 5v4M10 12.5l4 2.5-4 2.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`,foto:`<path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="2"/>`};function gt(e,t=18){let n=document.createElement(`span`);return n.innerHTML=`<svg viewBox="0 0 24 24" width="${t}" height="${t}" aria-hidden="true">${ht[e]??ht.cerchio}</svg>`,n.firstChild}var _t=null;function F(e,t=`info`,n=2200){_t||(_t=P(`div`,{class:`avvisi`,"aria-live":`polite`}),document.body.appendChild(_t));let r=P(`div`,{class:`avviso `+t},e);for(_t.appendChild(r);_t.children.length>4;)_t.firstChild?.remove();setTimeout(()=>{r.classList.add(`via`),setTimeout(()=>r.remove(),300)},n)}function vt(e,t={}){let n=P(`div`,{class:`dlg-corpo`}),r=P(`div`,{class:`dlg-piede`}),i=!1,a=()=>{i||(i=!0,u.classList.add(`via`),setTimeout(()=>u.remove(),180),document.removeEventListener(`keydown`,c,!0),t.onChiudi?.())},o=()=>typeof t.chiudibile==`function`?t.chiudibile():t.chiudibile!==!1,s=()=>{o()&&a()},c=e=>{e.key===`Escape`&&t.chiudibile!==!1&&(e.stopPropagation(),s())},l=P(`div`,{class:`dialogo`+(t.largo?` largo`:``),role:`dialog`,"aria-label":e},P(`div`,{class:`dlg-testa`},P(`span`,{class:`led acceso`}),P(`b`,null,e),t.chiudibile===!1?null:P(`button`,{class:`btn-icona`,title:`Chiudi (Esc)`,on:{click:s}},gt(`x`,16))),n,r),u=P(`div`,{class:`velo`,on:{pointerdown:e=>{e.target===u&&t.chiudibile!==!1&&s()}}},l);return document.body.appendChild(u),document.addEventListener(`keydown`,c,!0),{el:l,chiudi:a,corpo:n,piede:r}}function yt(e,t,n=`Sì`,r=`Annulla`){return new Promise(i=>{let a=!1,o=vt(e,{onChiudi:()=>{a||i(!1)}});o.corpo.appendChild(P(`p`,null,t)),o.piede.append(P(`button`,{class:`btn`,on:{click:()=>{a=!0,i(!1),o.chiudi()}}},r),P(`button`,{class:`btn primario`,on:{click:()=>{a=!0,i(!0),o.chiudi()}}},n)),o.piede.lastChild.focus()})}function bt(e,t,n=``,r=!1){return new Promise(i=>{let a=!1,o=vt(e,{onChiudi:()=>{a||i(null)}}),s=r?P(`textarea`,{class:`campo-testo`,rows:5}):P(`input`,{class:`campo-testo`,type:`text`});s.value=n;let c=()=>{a=!0,i(s.value),o.chiudi()};s.addEventListener(`keydown`,e=>{let t=e;t.key===`Enter`&&(!r||t.ctrlKey)&&(t.preventDefault(),c())}),o.corpo.append(P(`label`,{class:`etichetta`},t),s),o.piede.append(P(`button`,{class:`btn`,on:{click:()=>o.chiudi()}},`Annulla`),P(`button`,{class:`btn primario`,on:{click:c}},`OK`)),setTimeout(()=>{s.focus(),s.select()},30)})}function xt(e,t,n,r){e.style.maxHeight=innerHeight-12+`px`;let i=e.getBoundingClientRect(),a=t;a+i.width>innerWidth-4&&(a=r===void 0?innerWidth-i.width-4:r-i.width),e.style.left=Math.max(4,a)+`px`,e.style.top=Math.max(6,Math.min(n,innerHeight-i.height-6))+`px`}var St=null;function Ct(){St?.remove(),St=null}function wt(e,t,n){Ct();let r=Tt(n);document.body.appendChild(r),xt(r,e,t),St=r,setTimeout(()=>{let e=t=>{r.contains(t.target)||(Ct(),document.removeEventListener(`pointerdown`,e,!0))};document.addEventListener(`pointerdown`,e,!0)})}function Tt(e){let t=P(`div`,{class:`menu-contesto`,role:`menu`});for(let n of e){if(n.sep){t.appendChild(P(`div`,{class:`sep`}));continue}let e=P(`button`,{class:`voce`+(n.disattiva?` spenta`:``)+(n.sotto?` ha-sotto`:``),role:`menuitem`,disabled:!!n.disattiva,on:{click:e=>{if(n.sotto){e.stopPropagation();return}Ct(),n.fn?.()}}},P(`span`,{class:`spunta`},n.spunta?`●`:``),P(`span`,{class:`nome`},n.nome??``),P(`span`,{class:`tasto`},n.tasto??(n.sotto?`▸`:``)));if(n.sotto){let t=Tt(n.sotto);t.classList.add(`sotto`),e.appendChild(t),e.addEventListener(`pointerenter`,()=>{let n=e.getBoundingClientRect();t.style.left=n.right-4+`px`,t.style.top=n.top-4+`px`,requestAnimationFrame(()=>xt(t,n.right-4,n.top-4,n.left+4))})}n.sopra&&e.addEventListener(`pointerenter`,n.sopra),t.appendChild(e)}return t}var Et=(e,t,n)=>Math.max(t,Math.min(n,e));function Dt(e,t=document){let n=performance.now(),r=()=>{let i=t.querySelector(e);if(!i||!i.offsetParent){performance.now()-n<2e3&&setTimeout(r,80);return}i.scrollIntoView({block:`center`,behavior:`smooth`}),i.classList.remove(`evidenziato`),i.offsetWidth,i.classList.add(`evidenziato`),setTimeout(()=>i.classList.remove(`evidenziato`),2600)};r()}var Ot=e=>e<=.5?2:+(e<.75),kt=[`Niente (i fotogrammi restano fermi)`,`Sfumato (mischia i fotogrammi vicini)`,`Mosso (ricostruisce il movimento in mezzo)`],At=`dpv-velocita`,jt=()=>{try{return{ripple:!0,...JSON.parse(localStorage.getItem(At)||`{}`)}}catch{return{ripple:!0}}},Mt=e=>{try{localStorage.setItem(At,JSON.stringify(e))}catch{}},Nt=e=>Math.abs(e-1)<.005?`normale`:`×`+(Math.round(e*100)/100).toString().replace(`.`,`,`);function Pt(e){let t=j.doc,n=e?k(t,e):j.sel.size?k(t,j.sel):new Set;return t.clips.filter(e=>n.has(e.id)&&Le(t,e))}function Ft(e,t,n={}){let r=jt(),i=k(j.doc,e),a=j.edit(t===1?`Velocità normale`:`Velocità ${Nt(t)}`,e=>{let a=e.clips.find(t=>i.has(t.id)&&Le(e,t)),o=n.fluido??(a?.fluido===void 0||a.fluido===0?Ot(t):a.fluido);return De(e,i,t,{ripple:n.ripple??r.ripple,nastro:n.nastro,fluido:t>=1?0:o})});return a?F(`⏩ Velocità ${Nt(t)} · ${a} clip`,`tasto`):F(`Sulle immagini e sui titoli la velocità non c'è: scegli una ripresa o un audio`,`info`,2600),a}function It(e){let t=Pt(e);if(!t.length){F(`Seleziona una ripresa o un audio (o metti il cursore su una clip)`,`info`,2600);return}let n=j.doc,r=t[0],i=jt(),a=vt(`Velocità della clip`),o=r.speed||1,s=r.fluido!==void 0,c=P(`input`,{type:`number`,class:`num`,min:Ge*100,max:3200,step:5,value:String(Math.round(o*1e3)/10)}),l=P(`input`,{type:`range`,min:`-1000`,max:`1000`,step:`1`,class:`cursore-vel`}),u=e=>Math.round(Math.log(e)/Math.log(32)*1e3),d=e=>Math.exp(e/1e3*Math.log(32)),f=P(`select`,{class:`mini-select`},P(`option`,{value:`tieni`},`Tieni il tono (la voce resta naturale)`),P(`option`,{value:`nastro`},`Come un nastro (cambia anche il tono)`));f.value=r.nastro?`nastro`:`tieni`;let p=P(`select`,{class:`mini-select`},kt.map((e,t)=>P(`option`,{value:String(t)},e)));p.value=String(r.fluido??Ot(o));let m=P(`input`,{type:`checkbox`,checked:i.ripple}),h=P(`span`,{class:`nota`}),g=t.every(e=>n.tracks.find(t=>t.id===e.track)?.kind===`audio`),_=()=>{o=Math.max(Ge,Math.min(32,o));let e=r,t=Math.max(1,Math.round(e.len*(e.speed||1)/o));h.textContent=`Dura ${ot(ge(e.len,n.rate))} → ${ot(ge(t,n.rate))}`,l.value=String(u(o)),document.activeElement!==c&&(c.value=String(Math.round(o*1e3)/10)),s||(p.value=String(o>=1?0:Ot(o))),p.disabled=o>=1||g},v=P(`div`,{class:`vel-preset`},[.1,.25,.5,.75,1,1.5,2,4,8].map(e=>P(`button`,{class:`btn`,title:`Velocità ${e*100}%`,on:{click:()=>{o=e,_()}}},e===1?`1×`:e<1?`÷`+Math.round(1/e*100)/100:`×`+e)));c.addEventListener(`input`,()=>{let e=Number(c.value)/100;e>0&&(o=e,_())}),l.addEventListener(`input`,()=>{o=d(Number(l.value)),_()}),p.addEventListener(`change`,()=>{s=!0}),a.corpo.append(P(`div`,{class:`form`},P(`label`,null,`Velocità (%)`),P(`div`,{class:`vel-riga`},c,l),P(`label`,null,`Subito`),v,P(`label`,null,`Durata`),h,P(`label`,null,`Audio`),f,P(`label`,null,`Movimento`),p,P(`label`,null,`Dopo la clip`),P(`label`,{class:`spunta-riga`},m,` sposta le clip che vengono dopo`)),P(`p`,{class:`nota`},`Sopra il 100% la clip va più svelta e si accorcia, sotto va più piano e si allunga. Il movimento fluido ricostruisce i fotogrammi in mezzo quando rallenti molto (nel monitor e nell'export). Alt+E riapre questa finestra.`));let y=()=>{Mt({ripple:m.checked});let e=t.map(e=>e.id);a.chiudi(),Ft(e,o,{ripple:m.checked,nastro:f.value===`nastro`,fluido:o>=1?0:Number(p.value)}),j.select(e.filter(e=>le(j.doc,e)))};a.piede.append(P(`button`,{class:`btn`,on:{click:a.chiudi}},`Annulla`),P(`button`,{class:`btn primario`,on:{click:y}},`Applica`)),c.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),y())}),_(),setTimeout(()=>{c.focus(),c.select()},30)}var Lt=e({STILI_CONTO:()=>Zt,disegnaCountdown:()=>$t,motoTitolo:()=>Jt,numeroConto:()=>Qt,nuovaTela:()=>Rt,specAlTempo:()=>Gt,telaTitolo:()=>Wt});function Rt(e,t){if(typeof OffscreenCanvas<`u`)return new OffscreenCanvas(e,t);let n=document.createElement(`canvas`);return n.width=e,n.height=t,n}var zt=e=>{let t=Math.max(0,Math.min(1,e));return t*t*(3-2*t)},Bt=e=>{let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)},Vt=e=>e<1/2.75?7.5625*e*e:e<2/2.75?(e-=1.5/2.75,7.5625*e*e+.75):e<2.5/2.75?(e-=2.25/2.75,7.5625*e*e+.9375):(e-=2.625/2.75,7.5625*e*e+.984375);function Ht(e,t,n){let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)||0),i=r(e),a=r(t);return`rgb(${i.map((e,t)=>Math.round(e+(a[t]-e)*n)).join(`,`)})`}var Ut=new Map;function Wt(e,t,n){let r=JSON.stringify(e)+t+`x`+n,i=Ut.get(r);if(i)return i;Ut.size>40&&Ut.delete(Ut.keys().next().value);let a=Math.max(8,e.size*(n/1080)),o=e.style,s=o===`cinema`||o===`grande`||o===`etichetta`||o===`glitch`?e.text.toUpperCase():e.text,c=(e.sotto??``).trim(),l=s.split(`
`),u=a*(o===`citazione`?1.35:o===`grande`?1:1.2),d=e.peso??(o===`cinema`?500:o===`grande`?900:o===`social`||o===`rimbalzo`||o===`etichetta`||o===`glitch`||o===`estruso`||o===`ombraLunga`?800:700),f=o===`macchina`?`"Share Tech Mono", "Courier New", monospace`:o===`citazione`?`Georgia, "Times New Roman", serif`:`"${e.font}", "Rajdhani", "Segoe UI", sans-serif`,p=`${o===`citazione`?`italic `:``}${d} ${a}px ${f}`,m=(o===`cinema`?a*.32:0)+a*(e.spaziatura??0),h=Rt(8,8).getContext(`2d`);h.font=p;let g=e=>h.measureText(e).width+m*Math.max(0,e.length-1),_=o===`macchina`&&e.intero?e.intero.split(`
`):l,v=Math.max(..._.map(g),1),y=l.length*u,b=t,x=n;e.style===`rullo`&&(x=Math.ceil(y+n*.2)),e.style===`crawl`&&(b=Math.ceil(v+a));let S=Rt(b,x),C=S.getContext(`2d`);C.font=p,m&&`letterSpacing`in C&&(C.letterSpacing=m+`px`),C.textBaseline=`middle`,C.lineJoin=`round`;let w=a*.35,T,E;E=e.style===`rullo`?n*.1+u/2:e.style===`crawl`?x*e.y:e.style===`sottopancia`||o===`notiziario`?n*.82-y/2+u/2:n*e.y-(y+(c?a*.62:0))/2+u/2;let D=e.style===`crawl`||o===`macchina`||(e.style===`sottopancia`||o===`social`||o===`notiziario`)&&e.align===`center`?`left`:e.align;if(C.textAlign=D,T=e.style===`crawl`?a/2:o===`macchina`&&e.align===`center`?(t-v)/2:D===`left`?e.style===`sottopancia`||o===`social`||o===`notiziario`?t*.08:t*.1:D===`right`?t*.9:t/2,e.style===`sottopancia`){let t=v+w*4,n=y+w*1.6,r=E-u/2-w*.8,i=C.createLinearGradient(T-w*2,0,T-w*2+t,0);i.addColorStop(0,e.boxColor.length>7?e.boxColor:e.boxColor+`dd`),i.addColorStop(1,`#00000000`),C.fillStyle=i,C.fillRect(T-w*2,r,t,n),C.fillStyle=`#ffd54a`,C.fillRect(T-w*2,r,a*.12,n)}else if(o===`social`){let t=v+w*3,n=y+w*1.4,r=E-u/2-w*.7;C.fillStyle=e.boxColor.length===7?e.boxColor:e.boxColor.slice(0,7),C.beginPath(),C.roundRect(T-w*1.5,r,t,n,a*.18),C.fill()}else if(o===`citazione`)C.save(),C.fillStyle=e.color,C.globalAlpha=.35,C.font=`700 ${a*3}px Georgia, serif`,C.textAlign=`center`,C.fillText(`“`,D===`center`?T-v/2-a*.4:T-a*.6,E-a*.2),C.globalAlpha=.6,C.fillRect(D===`center`?T-v*.2:T,E+y-u/2+a*.35,v*.4,Math.max(1,a*.04)),C.restore();else if(o===`etichetta`){let t=v+w*3.4,n=y+w*1.2,r=D===`left`?T-w*2.2:D===`right`?T-v-w*1.2:T-v/2-w*2.2,i=E-u/2-w*.6;C.fillStyle=e.boxColor.slice(0,7),C.beginPath(),C.roundRect(r,i,t,n,n/2),C.fill(),C.fillStyle=`#ff3df2`,C.beginPath(),C.arc(r+w*1.1,i+n/2,a*.16,0,Math.PI*2),C.fill(),(D===`left`||D===`center`)&&(T+=w*.6)}else if(o===`grande`){C.fillStyle=e.color;let t=D===`left`?T:D===`right`?T-v:T-v/2,n=Math.max(1,a*.03);C.fillRect(t,E-u/2-a*.12,v,n),C.fillRect(t,E+y-u/2+a*.1,v,n)}else if(e.box){C.fillStyle=e.boxColor;let t=D===`left`?T-w:D===`right`?T-v-w:T-v/2-w;C.fillRect(t,E-u/2-w/2,v+w*2,y+w)}let O=Math.max(0,Math.min(1,e.rivela??1)),ee=e.boxColor.slice(0,7),te=D===`left`?T:D===`right`?T-v:T-v/2;o===`evidenzia`&&(C.fillStyle=ee,C.globalAlpha=.9,l.forEach((e,t)=>C.fillRect(te-a*.15,E+t*u-u*.42,(g(e)+a*.3)*O,u*.8)),C.globalAlpha=1),o===`notiziario`&&l.forEach((e,t)=>{let n=g(e)+w*2.4,r=E+t*u-u/2-w*.2;C.fillStyle=t===0?ee:`#101218ee`,C.fillRect(te-w*1.2,r,n,u+w*.4),t===0&&(C.fillStyle=`#ffffff`,C.fillRect(te-w*1.2,r+u+w*.4,n,Math.max(2,a*.05)))});let k=D===`left`?T:D===`right`?T-v:T-v/2;if(o===`rivela`){let t=Math.max(0,Math.min(1,e.rivela??1));C.save(),C.beginPath(),C.rect(k-a,E-u,(v+a)*t+a*.2,y+u),C.clip()}if(l.forEach((r,i)=>{let s=E+i*u;if(o===`cascata`||o===`assembla`||o===`onda`){C.textAlign=`left`;let c=r.length;for(let l=0;l<c;l++){let u=te+h.measureText(r.slice(0,l)).width+m*l,d=0,f=0,p=1,g=0;if(o===`cascata`){let e=Math.max(0,Math.min(1,(O*(c+3)-l)/3));f=-(1-Vt(e))*a*1.7,p=Math.min(1,e*4)}else if(o===`assembla`){let e=Bt(l*3.1+i),r=Bt(l*7.7+i+1),a=Bt(l*1.3+5),o=zt(O*1.5-a*.5);d=(e-.5)*t*.6*(1-o),f=(r-.5)*n*.7*(1-o),g=(e-.5)*3*(1-o),p=Math.min(1,o*2)}else f=Math.sin((e.rivela??0)*4.2+l*.55)*a*.14;if(p<=.01)continue;let _=h.measureText(r[l]).width;C.save(),C.globalAlpha=p,C.translate(u+_/2+d,s+f),C.rotate(g),e.shadow&&(C.shadowColor=`rgba(0,0,0,.7)`,C.shadowBlur=a*.1,C.shadowOffsetY=a*.05),e.outline&&e.outline!==`none`&&(C.strokeStyle=e.outline,C.lineWidth=Math.max(1,a*.07),C.strokeText(r[l],-_/2,0)),C.fillStyle=e.color,C.fillText(r[l],-_/2,0),C.restore()}C.textAlign=D;return}if(o===`estruso`){let t=Math.max(4,Math.round(a*.16));for(let e=t;e>=1;e--)C.fillStyle=Ht(ee,`#000000`,.15+e/t*.55),C.fillText(r,T+e*a*.008,s+e*a*.01);C.fillStyle=e.color,C.fillText(r,T,s);return}if(o===`ombraLunga`){let t=Math.round(a*.7);for(let e=t;e>=1;e--)C.fillStyle=ee,C.globalAlpha=.85*(1-e/(t+4)),C.fillText(r,T+e*.72,s+e*.72);C.globalAlpha=1,C.fillStyle=e.color,C.fillText(r,T,s);return}if(o===`contorno`){C.strokeStyle=e.color,C.lineWidth=Math.max(2,a*.035),C.strokeText(r,T,s),C.globalAlpha=.18+.4*O,C.fillStyle=e.color,C.fillText(r,T,s),C.globalAlpha=1;return}if(o===`karaoke`){C.globalAlpha=.4,C.fillStyle=e.color,C.fillText(r,T,s),C.globalAlpha=1,C.save(),C.beginPath(),C.rect(te-a,s-u,(g(r)+a*.3)*O+a,u*2),C.clip(),C.shadowColor=ee,C.shadowBlur=a*.25,C.fillStyle=ee,C.fillText(r,T,s),C.restore();return}if(o===`notiziario`){C.fillStyle=`#ffffff`,C.fillText(r,T,s);return}if(o===`gradiente`){let t=C.createLinearGradient(k,s-a/2,k+v,s+a/2);t.addColorStop(0,e.color),t.addColorStop(1,e.boxColor.slice(0,7)),C.save(),C.shadowColor=e.boxColor.slice(0,7),C.shadowBlur=a*.35,C.fillStyle=t,C.fillText(r,T,s),C.restore(),C.fillStyle=t,C.fillText(r,T,s);return}if(o===`glitch`){let t=a*.045;C.save(),C.globalCompositeOperation=`lighter`,C.fillStyle=`#ff2050`,C.fillText(r,T-t,s+t*.3),C.fillStyle=`#20e0ff`,C.fillText(r,T+t,s-t*.3),C.restore(),C.fillStyle=e.color,C.globalAlpha=.9,C.fillText(r,T,s),C.globalAlpha=1;let n=s-a*.1;C.save(),C.beginPath(),C.rect(k-a,n,v+a*2,a*.12),C.clip(),C.clearRect(k-a,n,v+a*2,a*.12),C.fillStyle=e.color,C.fillText(r,T+a*.12,s),C.restore();return}if(o===`neon`){C.save(),C.shadowColor=e.color;for(let t of[a*.6,a*.3,a*.12])C.shadowBlur=t,C.fillStyle=e.color,C.fillText(r,T,s);C.restore(),C.fillStyle=`#ffffff`,C.globalAlpha=.85,C.fillText(r,T,s),C.globalAlpha=1;return}o===`macchina`&&i===l.length-1&&e.intero&&e.intero!==e.text&&(C.fillStyle=e.color,C.fillRect(T+g(r)+a*.08,s-a*.42,a*.5,a*.84)),e.shadow&&(C.save(),C.shadowColor=`rgba(0,0,0,.75)`,C.shadowBlur=a*.12,C.shadowOffsetX=a*.05,C.shadowOffsetY=a*.06,C.fillStyle=e.color,C.fillText(r,T,s),C.restore()),e.outline&&e.outline!==`none`&&(C.strokeStyle=e.outline,C.lineWidth=Math.max(1,a*.07),C.strokeText(r,T,s)),C.fillStyle=e.color,C.fillText(r,T,s)}),c){let t=a*.42;C.save(),C.font=`500 ${t}px ${f}`,`letterSpacing`in C&&(C.letterSpacing=a*.04+`px`),C.textAlign=D,C.fillStyle=e.color,C.globalAlpha=.85,e.shadow&&(C.shadowColor=`rgba(0,0,0,.7)`,C.shadowBlur=a*.08,C.shadowOffsetY=a*.03),c.split(`
`).forEach((e,n)=>C.fillText(e,T,E+l.length*u-u/2+t*.9+n*t*1.25)),C.restore()}if(o===`rivela`){C.restore();let t=Math.max(0,Math.min(1,e.rivela??1));t<1&&(C.fillStyle=e.boxColor.slice(0,7),C.fillRect(k-a*.2+(v+a*.4)*t,E-u/2-a*.1,a*.28,y+a*.2))}let A={tela:S,w:b,h:x};return Ut.set(r,A),A}function Gt(e,t){let n=e.text.replace(/\n/g,``).length,r=e=>Math.min(1,Math.round(t/e*30)/30);switch(e.style){case`rivela`:{let t=r(.8);return t>=1?e:{...e,rivela:t}}case`evidenzia`:{let t=r(.7);return t>=1?e:{...e,rivela:t}}case`contorno`:{let t=r(1.2);return t>=1?e:{...e,rivela:t}}case`cascata`:{let t=r(.05*n+.7);return t>=1?e:{...e,rivela:t}}case`assembla`:{let t=r(1.3);return t>=1?e:{...e,rivela:t}}case`karaoke`:{let t=r(Math.max(1,.09*n+.5));return{...e,rivela:t}}case`onda`:return{...e,rivela:Math.round(t*30)/30}}if(e.style!==`macchina`)return e;let i=Math.max(0,Math.floor(t*18));return i>=e.text.length?e:{...e,text:e.text.slice(0,i),intero:e.text}}var Kt=e=>{let t=Math.max(0,Math.min(1,e));return t*t*(3-2*t)},qt=e=>{let t=Math.max(0,Math.min(1,e))-1;return 1+2.7*t*t*t+1.7*t*t};function Jt(e,t,n,r,i,a,o){let s=Yt(e,t,n,r,i,a,o);if(!e.ingresso&&!e.uscita)return s;let{dx:c,dy:l}=s,u=s.scala??1,d=s.alfa??1,f=(e,t,n)=>{let a=Kt(t),o=1-a;switch(e){case`dissolve`:d*=a;break;case`sale`:l+=i*.12*o*(n?1:-1),d*=a;break;case`scende`:l-=i*.12*o*(n?1:-1),d*=a;break;case`sinistra`:c-=r*.5*o,d*=Math.min(1,a*2);break;case`destra`:c+=r*.5*o,d*=Math.min(1,a*2);break;case`zoom`:u*=n?.55+.45*a:1+.5*o,d*=a;break;case`rimbalza`:u*=Math.max(.001,qt(t))}};return e.ingresso&&a<.7&&f(e.ingresso,a/.7,!0),e.uscita&&o-a<.7&&f(e.uscita,Math.max(0,(o-a)/.7),!1),{dx:c,dy:l,scala:u,alfa:d}}function Yt(e,t,n,r,i,a,o){let s=o>0?Math.min(1,Math.max(0,a/o)):0,c=o-a,l=e=>Kt(a/e),u=e=>Kt(c/e);switch(e.style){case`neon`:{let e=a<.7&&[.08,.16,.3,.38,.55].filter(e=>a>e).length%2?.25:1;return{dx:0,dy:0,alfa:Math.min(a<.7?e:1,u(.35))}}case`cinema`:return{dx:0,dy:0,scala:1+.08*s,alfa:Math.min(l(.9),u(.9))};case`rimbalzo`:return{dx:0,dy:0,scala:Math.max(.001,Math.min(qt(a/.45),c<.3?Kt(c/.3):1))};case`social`:return{dx:-r*.7*(1-Math.min(l(.35),u(.3))),dy:0};case`notiziario`:return{dx:-r*.6*(1-Math.min(l(.45),u(.35))),dy:0};case`ombraLunga`:return{dx:0,dy:i*.02*(1-l(.6)),alfa:Math.min(l(.6),u(.5))};case`estruso`:return{dx:0,dy:0,scala:.8+.2*l(.5),alfa:Math.min(l(.35),u(.4))};case`contorno`:return{dx:0,dy:0,alfa:Math.min(l(.4),u(.5))};case`karaoke`:return{dx:0,dy:0,alfa:Math.min(l(.3),u(.4))};case`citazione`:return{dx:0,dy:i*.03*(1-l(.8)),alfa:Math.min(l(.8),u(.7))};case`gradiente`:return{dx:0,dy:i*.04*(1-l(.7)),alfa:Math.min(l(.7),u(.6))};case`etichetta`:return{dx:-r*.03*(1-l(.3)),dy:0,scala:Math.max(.001,Math.min(qt(a/.35),c<.25?Kt(c/.25):1))};case`rivela`:return{dx:0,dy:0,alfa:u(.5)};case`grande`:return{dx:0,dy:0,scala:1.12-.12*Kt(a/1.1),alfa:Math.min(l(.5),u(.6))};case`glitch`:{let e=Math.floor(a*14),t=e=>{let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)},n=a<.6||t(e)>.86;return{dx:n?(t(e+3)-.5)*r*.03:0,dy:n?(t(e+7)-.5)*i*.01:0,alfa:Math.min(a<.5&&e%3==1?.3:1,u(.3))}}}if(e.style===`rullo`){let e=i/2+n/2;return{dx:0,dy:e+(-i/2-n/2-e)*s}}if(e.style===`crawl`){let e=r/2+t/2;return{dx:e+(-r/2-t/2-e)*s,dy:0}}return{dx:0,dy:0}}var Xt=null,Zt=[{id:`pellicola`,nome:`Pellicola`,secondi:5},{id:`moderno`,nome:`Moderno`,secondi:5},{id:`neon`,nome:`Neon`,secondi:3},{id:`minimal`,nome:`Minimal`,secondi:10}],Qt=(e,t)=>Math.max(1,Math.ceil(Math.max(.001,t-e)-1e-6));function $t(e,t,n,r,i=`pellicola`){let a=Math.min(e,1280),o=Math.round(a*t/e);(!Xt||Xt.width!==a||Xt.height!==o)&&(Xt=Rt(a,o));let s=Xt.getContext(`2d`),c=Math.max(.001,r-n),l=Qt(n,r),u=Math.max(0,Math.min(1,c-(l-1))),d=1-u,f=a/2,p=o/2;if(s.save(),s.textAlign=`center`,s.textBaseline=`middle`,i===`pellicola`){let e=Math.hypot(a,o);s.fillStyle=`#1a1a1a`,s.fillRect(0,0,a,o),s.fillStyle=`#6b6b6b`,s.beginPath(),s.moveTo(f,p);let t=-Math.PI/2;s.arc(f,p,e,t,t+d*Math.PI*2),s.closePath(),s.fill(),s.strokeStyle=`#f2f2f2`,s.lineWidth=Math.max(2,o/180),s.beginPath(),s.moveTo(0,p),s.lineTo(a,p),s.moveTo(f,0),s.lineTo(f,o),s.stroke();for(let e of[o*.36,o*.43])s.beginPath(),s.arc(f,p,e,0,Math.PI*2),s.stroke();s.fillStyle=`#f2f2f2`,s.font=`700 ${o*.5}px "Orbitron", "Rajdhani", sans-serif`,s.fillText(String(l),f,p+o*.02);let r=Math.floor(n*24);s.fillStyle=`rgba(255,255,255,.35)`;for(let e=0;e<6;e++){let t=(Math.sin(r*12.9898+e*78.233)*43758.5453%1+1)%1*a,n=(Math.sin(r*93.9898+e*11.233)*23421.631%1+1)%1*o;s.fillRect(t,n,2,2+e%3*3)}}else if(i===`moderno`){let e=s.createRadialGradient(f,p,0,f,p,Math.hypot(f,p));e.addColorStop(0,`#1d2433`),e.addColorStop(1,`#07080c`),s.fillStyle=e,s.fillRect(0,0,a,o);let t=o*.3;s.lineWidth=o*.018,s.strokeStyle=`rgba(255,255,255,.12)`,s.beginPath(),s.arc(f,p,t,0,Math.PI*2),s.stroke(),s.strokeStyle=`#ffd54a`,s.lineCap=`round`,s.beginPath(),s.arc(f,p,t,-Math.PI/2,-Math.PI/2+u*Math.PI*2),s.stroke();let n=1+.25*(1-Math.min(1,d*4))**3;s.globalAlpha=Math.min(1,d*6),s.fillStyle=`#ffffff`,s.font=`200 ${o*.34*n}px "Rajdhani", "Segoe UI", sans-serif`,s.fillText(String(l),f,p+o*.015)}else if(i===`neon`){s.fillStyle=`#05030a`,s.fillRect(0,0,a,o);let e=o*.32*(1+.04*Math.sin(d*Math.PI)),t=[`#35e8ff`,`#ff3df2`,`#ffd54a`][l%3];s.shadowColor=t,s.shadowBlur=o*.06,s.lineWidth=o*.012,s.strokeStyle=t,s.beginPath(),s.arc(f,p,e,0,Math.PI*2),s.stroke(),s.lineWidth=o*.006,s.beginPath(),s.arc(f,p,e*.86,-Math.PI/2,-Math.PI/2+d*Math.PI*2),s.stroke(),s.globalAlpha=d<.12?Math.sin(n*90)>0?1:.35:1,s.fillStyle=`#ffffff`,s.shadowBlur=o*.08,s.font=`800 ${o*.38}px "Orbitron", "Rajdhani", sans-serif`,s.fillText(String(l),f,p+o*.02)}else{s.fillStyle=`#f4f1ea`,s.fillRect(0,0,a,o);let e=1.15-.15*Math.min(1,d*3);s.globalAlpha=Math.min(1,d*5)*Math.min(1,u*5),s.fillStyle=`#111111`,s.font=`300 ${o*.42*e}px "Rajdhani", "Segoe UI", sans-serif`,s.fillText(String(l),f,p+o*.02),s.globalAlpha=1,s.fillStyle=`#111111`,s.fillRect(a*.3,o*.8,a*.4*u,Math.max(2,o*.006))}return s.restore(),Xt}var en=[{id:`fisso`,nome:`Titolo`,gruppo:`titoli`,spec:{}},{id:`cinema`,nome:`Cinema`,gruppo:`titoli`,spec:{style:`cinema`,text:`Napoli, 1994`,size:72,shadow:!0,outline:`none`}},{id:`neon`,nome:`Neon`,gruppo:`titoli`,spec:{style:`neon`,text:`OPEN`,color:`#ff3df2`,size:130,shadow:!1,outline:`none`,font:`Orbitron`}},{id:`rimbalzo`,nome:`Rimbalzo`,gruppo:`titoli`,spec:{style:`rimbalzo`,text:`WOW!`,size:150,color:`#ffd54a`,outline:`#000000`}},{id:`macchina`,nome:`Macchina da scrivere`,gruppo:`titoli`,spec:{style:`macchina`,text:`C'era una volta…`,size:64,outline:`none`,color:`#f2efe6`}},{id:`citazione`,nome:`Citazione`,gruppo:`titoli`,spec:{style:`citazione`,text:`Il montaggio è scrivere
con le immagini.`,size:60,outline:`none`}},{id:`sfumato`,nome:`Sfumato`,gruppo:`titoli`,spec:{style:`gradiente`,text:`Estate 2026`,size:120,color:`#ffd54a`,boxColor:`#ff3df2`,shadow:!1,outline:`none`,font:`Orbitron`}},{id:`rivela`,nome:`Rivela`,gruppo:`titoli`,spec:{style:`rivela`,text:`Capitolo uno`,size:96,color:`#ffffff`,boxColor:`#ff3df2`,shadow:!0,outline:`none`}},{id:`glitch`,nome:`Glitch`,gruppo:`titoli`,spec:{style:`glitch`,text:`Error 404`,size:124,color:`#ffffff`,shadow:!1,outline:`none`,font:`Orbitron`}},{id:`grande`,nome:`Grande`,gruppo:`titoli`,spec:{style:`grande`,text:`DaProd`,size:230,color:`#ffffff`,shadow:!0,outline:`none`}},{id:`cascata`,nome:`Cascata`,gruppo:`titoli`,spec:{style:`cascata`,text:`Buongiorno!`,size:130,color:`#ffffff`,outline:`none`,shadow:!0}},{id:`assembla`,nome:`Si compone`,gruppo:`titoli`,spec:{style:`assembla`,text:`Insieme`,size:150,color:`#ffd54a`,outline:`none`,shadow:!0}},{id:`onda`,nome:`Onda`,gruppo:`titoli`,spec:{style:`onda`,text:`Mare mosso`,size:120,color:`#35e8ff`,outline:`none`,shadow:!0,font:`Orbitron`}},{id:`evidenzia`,nome:`Evidenziatore`,gruppo:`titoli`,spec:{style:`evidenzia`,text:`La parte importante`,size:84,color:`#111111`,boxColor:`#ffd54a`,outline:`none`,shadow:!1}},{id:`karaoke`,nome:`Karaoke`,gruppo:`titoli`,spec:{style:`karaoke`,text:`Canta con me`,size:100,color:`#ffffff`,boxColor:`#ff3df2`,outline:`none`,shadow:!1,ingresso:`dissolve`}},{id:`estruso`,nome:`3D`,gruppo:`titoli`,spec:{style:`estruso`,text:`DaProd`,size:200,color:`#ffffff`,boxColor:`#ff3df2`,outline:`none`,shadow:!1}},{id:`ombraLunga`,nome:`Ombra lunga`,gruppo:`titoli`,spec:{style:`ombraLunga`,text:`Long shadow`,size:150,color:`#ffffff`,boxColor:`#1b3a8f`,outline:`none`,shadow:!1}},{id:`contorno`,nome:`Contorno`,gruppo:`titoli`,spec:{style:`contorno`,text:`OUTLINE`,size:190,color:`#35e8ff`,outline:`none`,shadow:!1,font:`Orbitron`}},{id:`zoomCinema`,nome:`Cinema con sottotitolo`,gruppo:`titoli`,spec:{style:`cinema`,text:`La città`,sotto:`un film di DaProd · 2026`,size:96,shadow:!0,outline:`none`,ingresso:`zoom`,uscita:`dissolve`}},{id:`dedica`,nome:`Dedica`,gruppo:`titoli`,spec:{style:`citazione`,text:`Per Nonna Maria`,sotto:`1938 – sempre con noi`,size:80,outline:`none`,ingresso:`sale`,uscita:`dissolve`}},{id:`capitolo`,nome:`Capitolo`,gruppo:`titoli`,spec:{style:`fisso`,text:`CAPITOLO 2`,sotto:`Il viaggio comincia`,size:110,font:`Orbitron`,spaziatura:.12,outline:`none`,shadow:!0,ingresso:`sinistra`,uscita:`destra`}},{id:`notiziario`,nome:`Notiziario`,gruppo:`tv`,spec:{style:`notiziario`,text:`ULTIM'ORA
DaProd Video 1.1.2, il big update`,size:46,boxColor:`#d2202a`,y:.82,align:`left`}},{id:`sottopancia`,nome:`Sottopancia`,gruppo:`tv`,spec:{style:`sottopancia`,text:`Mario Rossi
regista`,size:56,align:`left`}},{id:`etichetta`,nome:`Etichetta`,gruppo:`tv`,spec:{style:`etichetta`,text:`Nuovo video`,size:50,color:`#1a1206`,boxColor:`#ffd54a`,outline:`none`,shadow:!1,y:.16,align:`left`}},{id:`social`,nome:`Social`,gruppo:`tv`,spec:{style:`social`,text:`Seguici per la parte 2 👉`,size:58,color:`#111111`,boxColor:`#ffd54a`,outline:`none`,shadow:!1,y:.78}},{id:`crawl`,nome:`Crawl`,gruppo:`tv`,spec:{style:`crawl`,text:`ULTIM'ORA · DaProd Video: il montaggio vecchio stile, moderno dentro · `,size:50,y:.9,box:!0},volte:2},{id:`rullo`,nome:`Rullo titoli`,gruppo:`tv`,spec:{style:`rullo`,text:`DaProd Video

Montaggio
DaProd

Musica
DaProd

Grazie per la visione`,size:64},volte:3}],tn=e=>en.find(t=>t.id===e);function nn(e,t){let n=tn(t);n&&e.gen?.title&&(Object.assign(e.gen.title,n.spec),e.name=n.nome===`Titolo`?`Titolo`:`Titolo ${n.nome}`)}function rn(e){let[,t,n,r]=e.split(`:`);return t===`title`?{kind:t,titolo:n}:t===`anim`?{kind:t,anim:n}:t===`countdown`?{kind:t,conto:{stile:n||`pellicola`,secondi:Number(r)||5}}:{kind:t}}var an=e({ANIMAZIONI:()=>mn,GRUPPI_ANIM:()=>on,animazione:()=>hn,animazioniDi:()=>gn,nuovaAnim:()=>vn,valoriDi:()=>yn,valoriDiPartenza:()=>_n}),on=[{id:`sottopancia`,nome:`Sottopancia`,info:`nome e ruolo, in dieci modi`},{id:`testo`,nome:`Testi che si muovono`,info:`parole che salgono, si decodificano, cambiano`},{id:`dati`,nome:`Numeri e grafici`,info:`contatori, anelli, barre`},{id:`social`,nome:`Social e chiusure`,info:`segui, iscriviti, post, notifiche, chat`},{id:`fondi`,nome:`Fondi e luci`,info:`aurora, stelle, neve, bokeh, perdite di luce, HUD`},{id:`cerimonia`,nome:`Cerimonie e feste`,info:`monogramma, cornici, cuori, petali, palloncini`}],I=(e,t,n)=>({id:e,nome:t,tipo:`testo`,def:n}),sn=(e,t,n)=>({id:e,nome:t,tipo:`lungo`,def:n}),cn=(e,t,n,r,i,a=1)=>({id:e,nome:t,tipo:`numero`,def:n,min:r,max:i,step:a}),L=(e,t,n)=>({id:e,nome:t,tipo:`colore`,def:n}),ln=(e,t,n,r)=>({id:e,nome:t,tipo:`scelta`,def:n,scelte:r}),un=ln(`pos`,`Dove sta`,`sinistra`,[[`sinistra`,`A sinistra`],[`centro`,`Al centro`],[`destra`,`A destra`]]),R=cn(`dim`,`Grandezza`,100,50,200,5),dn=[[`montserrat`,`Montserrat (pulito)`],[`oswald`,`Oswald (stretto)`],[`archivo`,`Archivo Black (pesante)`],[`bebas`,`Bebas Neue (titoli)`],[`playfair`,`Playfair (elegante)`],[`cormorant`,`Cormorant (raffinato)`],[`vibes`,`Great Vibes (corsivo)`],[`caveat`,`Caveat (a mano)`],[`mono`,`Space Mono (macchina)`],[`rajdhani`,`Rajdhani`],[`orbitron`,`Orbitron (digitale)`]],fn=(e=`montserrat`)=>({id:`font`,nome:`Carattere`,tipo:`scelta`,def:e,scelte:dn}),pn=(e,t,n,r,i=I(`ruolo`,`Ruolo`,`Conduttrice · Neuroscienziata`))=>({id:e,nome:t,gruppo:`sottopancia`,info:n,durata:5,campi:[I(`nome`,`Nome`,`Maya Chen`),i,L(`colore`,`Colore`,r),un,R]}),mn=[pn(`lt-barra`,`Barra pulita`,`scheda bianca con linguetta colorata`,`#ff5a36`),pn(`lt-sottolinea`,`Sottolineatura`,`nome grande con la riga che si allunga`,`#46e5b7`),pn(`lt-blocco`,`Blocco con etichetta`,`blocco scuro che si scopre, etichetta gialla`,`#ffd23f`,I(`etichetta`,`Etichetta`,`Ospite`)),pn(`lt-colore`,`Blocco colore`,`un blocco di colore che entra di lato`,`#2756ff`),pn(`lt-scheda`,`Scheda scura`,`scheda scura con la riga sotto il nome`,`#f5b942`),pn(`lt-kicker`,`Etichetta e nome`,`la targhetta cade, poi il nome`,`#46e5b7`,I(`etichetta`,`Etichetta`,`In studio`)),pn(`lt-maschera`,`Scoperta a barra`,`una barra scopre il nome da sinistra`,`#ffd23f`),pn(`lt-neon`,`Bordo neon`,`una cornice al neon si disegna attorno`,`#35e8ff`),pn(`lt-linea`,`Linea laterale`,`una riga verticale e il testo che scivola`,`#46e5b7`),pn(`lt-pillola`,`Pillola`,`pillola bianca con il pallino colorato`,`#ff5a36`),pn(`lt-barre`,`Barre impilate`,`due barre, nome e ruolo, si aprono in senso opposto`,`#ffd23f`),{id:`tx-parole`,nome:`Parole che salgono`,gruppo:`testo`,info:`ogni parola sale da sfocata a nitida`,durata:5,campi:[sn(`testo`,`Testo`,`Un giorno speciale, insieme`),L(`colore`,`Colore`,`#ffffff`),ln(`unita`,`Sale`,`parola`,[[`parola`,`Una parola alla volta`],[`lettera`,`Una lettera alla volta`]]),fn(`montserrat`),R]},{id:`tx-decodifica`,nome:`Decodifica`,gruppo:`testo`,info:`le lettere girano e si fermano una a una`,durata:4,campi:[I(`testo`,`Testo`,`DA PROD VIDEO`),L(`colore`,`Colore`,`#46e5b7`),ln(`stile`,`Stile`,`terminale`,[[`terminale`,`Terminale (con cornice)`],[`pulito`,`Pulito`]]),R]},{id:`tx-cambia`,nome:`Parola che cambia`,gruppo:`testo`,info:`una parola gira fra le alternative e si ferma sull'ultima`,durata:5,campi:[I(`prima`,`Prima`,`Montaggio`),I(`opzioni`,`Alternative (virgole)`,`più veloce,più bello,davvero tuo`),I(`dopo`,`Dopo`,``),L(`colore`,`Colore della parola`,`#ffd23f`),fn(`montserrat`),R]},{id:`tx-colpo`,nome:`Parole a colpo`,gruppo:`testo`,info:`ogni parola arriva sbattendo, come un titolo da trailer`,durata:4,campi:[I(`testo`,`Testo`,`È ARRIVATO IL MOMENTO`),L(`colore`,`Colore`,`#ffffff`),L(`evidenzia`,`Parola in evidenza`,`#ffd23f`),fn(`archivo`),R]},{id:`tx-penna`,nome:`Evidenziatore a mano`,gruppo:`testo`,info:`il pennarello passa sulla parola importante`,durata:4,campi:[I(`testo`,`Frase`,`La cosa più importante è esserci`),I(`parola`,`Parola evidenziata`,`importante`),L(`colore`,`Colore del testo`,`#ffffff`),L(`pennarello`,`Colore del pennarello`,`#ffd23f`),fn(`montserrat`),R]},{id:`tx-titolo`,nome:`Titolo con riga`,gruppo:`testo`,info:`titolo, riga che si apre e sottotitolo`,durata:5,campi:[I(`titolo`,`Titolo`,`Una storia lunga un giorno`),I(`sottotitolo`,`Sottotitolo`,`Napoli · 12 giugno 2026`),L(`colore`,`Colore`,`#ffffff`),L(`accento`,`Colore della riga`,`#ffd23f`),fn(`playfair`),R]},{id:`tx-scrivi`,nome:`Scritta a mano`,gruppo:`testo`,info:`si scrive da sola, da sinistra a destra, con la sottolineatura`,durata:4,campi:[I(`testo`,`Testo`,`Grazie di cuore`),L(`colore`,`Colore`,`#ffffff`),L(`accento`,`Sottolineatura`,`#ff4d6d`),fn(`caveat`),R]},{id:`dt-contatore`,nome:`Contatore`,gruppo:`dati`,info:`un numero che sale fino al valore e si ferma con un colpo`,durata:5,campi:[cn(`valore`,`Valore`,1250,0,1e9,1),I(`prefisso`,`Prima del numero`,``),I(`suffisso`,`Dopo il numero`,`+`),I(`etichetta`,`Etichetta`,`invitati`),L(`colore`,`Colore`,`#ffd23f`),fn(`montserrat`),R]},{id:`dt-anello`,nome:`Anello di avanzamento`,gruppo:`dati`,info:`un anello che si riempie fino alla percentuale`,durata:5,campi:[cn(`percento`,`Percentuale`,75,0,100,1),I(`etichetta`,`Etichetta`,`completato`),L(`colore`,`Colore`,`#46e5b7`),fn(`montserrat`),R]},{id:`dt-barre`,nome:`Grafico a barre`,gruppo:`dati`,info:`le barre crescono una dopo l'altra`,durata:6,campi:[I(`titolo`,`Titolo`,`Dove andiamo in vacanza`),sn(`voci`,`Voci (nome:valore, una per riga)`,`Mare:80
Montagna:55
Città:35
Campagna:20`),L(`colore`,`Colore`,`#35e8ff`),fn(`montserrat`),R]},{id:`dt-linea`,nome:`Grafico a linea`,gruppo:`dati`,info:`la linea si disegna e i punti si accendono`,durata:6,campi:[I(`titolo`,`Titolo`,`Una bella crescita`),I(`punti`,`Valori (virgole)`,`10,25,18,40,35,60,80`),L(`colore`,`Colore`,`#ff4d6d`),fn(`montserrat`),R]},{id:`dt-progresso`,nome:`Barra di avanzamento`,gruppo:`dati`,info:`una barra che si riempie con la percentuale sopra`,durata:5,campi:[I(`etichetta`,`Etichetta`,`Obiettivo raggiunto`),cn(`percento`,`Percentuale`,68,0,100,1),L(`colore`,`Colore`,`#ffd23f`),fn(`montserrat`),R]},{id:`sc-segui`,nome:`Segui`,gruppo:`social`,info:`scheda con il pulsante che si preme e diventa "Segui già"`,durata:5,campi:[I(`nome`,`Nome`,`@daprod`),I(`etichetta`,`Pulsante`,`Segui`),L(`colore`,`Colore`,`#ff2d6f`),un,R]},{id:`sc-iscriviti`,nome:`Iscriviti`,gruppo:`social`,info:`il pulsante rosso, il clic e la campanella che suona`,durata:5,campi:[I(`etichetta`,`Pulsante`,`ISCRIVITI`),L(`colore`,`Colore`,`#ff0033`),un,R]},{id:`sc-chiusura`,nome:`Chiusura con invito`,gruppo:`social`,info:`grazie, un invito e il pulsante: per finire il video`,durata:6,campi:[I(`titolo`,`Titolo`,`Grazie per la visione`),I(`sotto`,`Riga sotto`,`Ci vediamo al prossimo video`),I(`bottone`,`Pulsante`,`Iscriviti`),L(`colore`,`Colore`,`#ffd23f`),fn(`montserrat`),R]},{id:`sc-post`,nome:`Post social`,gruppo:`social`,info:`una scheda stile post con avatar, testo e mi piace`,durata:6,campi:[I(`nome`,`Nome`,`DaProd Video`),I(`utente`,`Utente`,`@daprod`),sn(`testo`,`Testo`,`Il montaggio vecchio stile, moderno dentro.`),cn(`mipiace`,`Mi piace`,12840,0,1e8,1),L(`colore`,`Colore`,`#1d9bf0`),un,R]},{id:`sc-notifica`,nome:`Notifica del telefono`,gruppo:`social`,info:`un banner che scende dall'alto come sul telefono`,durata:5,campi:[I(`app`,`App`,`Messaggi`),I(`titolo`,`Titolo`,`Anna`),I(`testo`,`Testo`,`Sei pronto? Tra poco si parte!`),L(`colore`,`Colore dell'icona`,`#34c759`),R]},{id:`sc-chat`,nome:`Chat`,gruppo:`social`,info:`le bolle di una conversazione che arrivano una dopo l'altra`,durata:7,campi:[sn(`righe`,`Messaggi (uno per riga; con ">" sono i tuoi)`,`Ciao! Ci sei domani?
>Certo, a che ora?
Alle 18, ti aspetto ❤
>A presto!`),L(`colore`,`Colore dei tuoi`,`#0a84ff`),R]},{id:`bg-aurora`,nome:`Aurora`,gruppo:`fondi`,info:`macchie di luce che si spostano piano`,durata:8,fondo:!0,campi:[L(`colore`,`Colore`,`#46e5b7`),L(`colore2`,`Secondo colore`,`#7c5cff`),L(`base`,`Fondo`,`#0b0c12`)]},{id:`bg-stelle`,nome:`Stelle`,gruppo:`fondi`,info:`un cielo di stelle che scorre`,durata:8,fondo:!0,campi:[L(`colore`,`Colore`,`#cfe3ff`),L(`base`,`Fondo`,`#05060f`),cn(`quante`,`Quante`,180,20,600,10)]},{id:`bg-neve`,nome:`Neve`,gruppo:`fondi`,info:`fiocchi che cadono sopra la ripresa`,durata:8,campi:[L(`colore`,`Colore`,`#ffffff`),cn(`quante`,`Quanti`,120,10,400,10),cn(`vento`,`Vento`,30,-100,100,5)]},{id:`bg-bokeh`,nome:`Bokeh`,gruppo:`fondi`,info:`cerchi di luce morbidi che galleggiano`,durata:8,campi:[L(`colore`,`Colore`,`#ffb347`),L(`colore2`,`Secondo colore`,`#ff7ab8`),cn(`quanti`,`Quanti`,22,4,80,1)]},{id:`bg-onde`,nome:`Onde`,gruppo:`fondi`,info:`onde colorate che ondeggiano`,durata:8,fondo:!0,campi:[L(`colore`,`Colore`,`#35e8ff`),L(`colore2`,`Secondo colore`,`#7c5cff`),L(`base`,`Fondo`,`#08101f`)]},{id:`bg-impulso`,nome:`Impulso a tempo`,gruppo:`fondi`,info:`cerchi che pulsano a tempo di musica`,durata:8,fondo:!0,campi:[L(`colore`,`Colore`,`#ff3df2`),L(`base`,`Fondo`,`#0a0612`),cn(`bpm`,`Battiti al minuto`,120,60,200,1)]},{id:`bg-luce`,nome:`Perdita di luce`,gruppo:`fondi`,info:`bagliori caldi come da una pellicola`,durata:4,campi:[L(`colore`,`Colore`,`#ff9a3d`),L(`colore2`,`Secondo colore`,`#ff4d6d`)]},{id:`hd-rec`,nome:`Videocamera REC`,gruppo:`fondi`,info:`il mirino di una videocamera: REC, batteria, data e tempo`,durata:8,campi:[I(`data`,`Data`,`12 GIU 2026`),I(`modo`,`Modo`,`SP`),L(`colore`,`Colore del REC`,`#f12c2c`)]},{id:`hd-notizie`,nome:`Notiziario`,gruppo:`fondi`,info:`la fascia delle ultime notizie con il testo che scorre`,durata:8,campi:[I(`marca`,`Sigla`,`DAPROD NEWS`),sn(`testo`,`Testo`,`Ultim'ora: il montaggio è tutto un'altra cosa · Nuove animazioni in arrivo · Ora anche senza sfondo`),L(`colore`,`Colore`,`#d2202a`)]},{id:`hd-mirino`,nome:`Mirino HUD`,gruppo:`fondi`,info:`angoli che si disegnano e numeri che scorrono`,durata:6,campi:[I(`etichetta`,`Etichetta`,`SOGGETTO 01`),L(`colore`,`Colore`,`#35e8ff`)]},{id:`cr-monogramma`,nome:`Monogramma`,gruppo:`cerimonia`,info:`le iniziali dentro un cerchio dorato, i nomi e la data`,durata:7,campi:[I(`iniziali`,`Iniziali`,`A & M`),I(`nomi`,`Nomi`,`Anna e Marco`),I(`data`,`Data`,`12 giugno 2026`),L(`colore`,`Colore`,`#d4af37`),L(`testo`,`Colore del testo`,`#ffffff`),fn(`playfair`)]},{id:`cr-cornice`,nome:`Cornice dorata`,gruppo:`cerimonia`,info:`una cornice ornamentale che si disegna e il testo dentro`,durata:7,campi:[I(`titolo`,`Titolo`,`Anna & Marco`),I(`sotto`,`Riga sotto`,`si sposano · 12 giugno 2026`),L(`colore`,`Colore`,`#d4af37`),L(`testo`,`Colore del testo`,`#ffffff`)]},{id:`cr-dedica`,nome:`Dedica`,gruppo:`cerimonia`,info:`una frase elegante con due filetti e la firma`,durata:7,campi:[sn(`testo`,`Frase`,`Il giorno più bello
è quello in cui
siamo stati insieme`),I(`firma`,`Firma`,`— Anna e Marco`),L(`colore`,`Colore`,`#ffffff`),L(`accento`,`Filetti`,`#d4af37`),fn(`cormorant`)]},{id:`cr-data`,nome:`Data grande`,gruppo:`cerimonia`,info:`giorno, mese e anno grandi, i nomi sotto`,durata:6,campi:[I(`giorno`,`Giorno`,`12`),I(`mese`,`Mese`,`GIUGNO`),I(`anno`,`Anno`,`2026`),I(`nomi`,`Nomi`,`Anna e Marco`),L(`colore`,`Colore`,`#ffffff`),L(`accento`,`Accento`,`#d4af37`),fn(`playfair`)]},{id:`cr-auguri`,nome:`Auguri con bandierine`,gruppo:`cerimonia`,info:`una ghirlanda di bandierine e la scritta di auguri`,durata:6,campi:[I(`testo`,`Scritta`,`Buon Compleanno`),I(`sotto`,`Riga sotto`,`Sofia · 18 anni`),L(`colore`,`Colore`,`#ffd23f`),L(`colore2`,`Secondo colore`,`#ff4d6d`),fn(`vibes`)]},{id:`cr-cuori`,nome:`Cuori che salgono`,gruppo:`cerimonia`,info:`cuori che salgono e ondeggiano sopra la ripresa`,durata:8,campi:[L(`colore`,`Colore`,`#ff4d6d`),L(`colore2`,`Secondo colore`,`#ffb3c6`),cn(`quanti`,`Quanti`,26,4,80,1)]},{id:`cr-petali`,nome:`Petali`,gruppo:`cerimonia`,info:`petali che cadono girando, come il riso e i fiori al matrimonio`,durata:8,campi:[L(`colore`,`Colore`,`#ffc2d1`),L(`colore2`,`Secondo colore`,`#ffffff`),cn(`quanti`,`Quanti`,40,5,150,1)]},{id:`cr-scintille`,nome:`Scintille dorate`,gruppo:`cerimonia`,info:`brillantini che cadono e scintillano`,durata:8,campi:[L(`colore`,`Colore`,`#ffd54a`),cn(`quante`,`Quante`,90,10,300,5)]},{id:`cr-palloncini`,nome:`Palloncini`,gruppo:`cerimonia`,info:`palloncini colorati che salgono`,durata:8,campi:[L(`colore`,`Colore`,`#ff4d6d`),L(`colore2`,`Secondo colore`,`#35e8ff`),L(`colore3`,`Terzo colore`,`#ffd23f`),cn(`quanti`,`Quanti`,14,3,40,1)]},{id:`cr-coriandoli`,nome:`Coriandoli`,gruppo:`cerimonia`,info:`uno scoppio di coriandoli colorati`,durata:5,campi:[L(`colore`,`Colore`,`#ff4d6d`),L(`colore2`,`Secondo colore`,`#ffd23f`),L(`colore3`,`Terzo colore`,`#35e8ff`),cn(`quanti`,`Quanti`,140,20,400,10)]}],hn=e=>mn.find(t=>t.id===e),gn=e=>mn.filter(t=>t.gruppo===e);function _n(e){return Object.fromEntries(e.campi.map(e=>[e.id,e.def]))}function vn(e,t={}){let n=hn(e)??mn[0];return{id:n.id,v:{..._n(n),...t}}}function yn(e){let t=hn(e.id);return{...t?_n(t):{},...e.v}}var bn=e({applicaTransizione:()=>Pn,azioni:()=>xn,bersagli:()=>zn,bloccoNuovo:()=>wn,cursore:()=>On,eliminaLato:()=>jn,esegui:()=>Cn,inserisciGeneratore:()=>Un,mettiBlocco:()=>Nn,modi:()=>B,montaDalPlayer:()=>Bn,registra:()=>Sn,tracceAttive:()=>Tn}),xn=new Map,z=e=>xn.set(e.id,e),Sn=z,Cn=e=>xn.get(e)?.fn(),B={inserisci:!1,ripple:!1,snap:!0,elastico:!1,zoneSicure:!1,attive:new Set,durataFx:0,suonoFx:!1,forzaFx:1};function wn(e,t){let n=g(e,t);return n.forza=B.forzaFx,n.suono&&B.suonoFx&&(n.audio=!0),n}function Tn(){let e=new Set(j.doc.tracks.filter(e=>B.attive.has(e.id)).map(e=>e.id));return e.size?e:null}function En(e,t=`any`){let n=Tn(),r=j.doc,i=r.clips.filter(i=>{let a=fe(r,i.track);return i.start<=e&&Se(i)>e&&!a.lock&&(!n||n.has(a.id))&&(t===`any`||a.kind===t)}),a=e=>(Ie(e)?e.kind===`media`?0:1e3:e.kind===`fx`?3e3:2e3)+r.tracks.findIndex(t=>t.id===e.track);return i.sort((e,t)=>a(e)-a(t))[0]}var Dn=()=>it(j.doc.rate),On=()=>Math.round(j.head);function kn(){if(j.sel.size)return k(j.doc,j.sel);let e=En(On());return e?k(j.doc,[e.id]):new Set}function An(e,t,n){let r=j.doc,i=r.clips.filter(e=>t.has(e.id)),a=e=>r.tracks.findIndex(t=>t.id===e.track),o=i.slice().sort((e,t)=>a(e)-a(t)||e.start-t.start)[0],s=j.edit(e,e=>qe(e,t,n)),c=o?pe(j.doc,o.track,o.start):void 0;return j.select(c?k(j.doc,[c.id]):[]),s}z({id:`taglia`,nome:`Taglia al cursore`,gruppo:`Montaggio`,tasti:[`1`,`C`],info:`Taglia sotto il cursore le tracce accese (tutte, se non ne hai accesa nessuna). Poi seleziona il pezzo più corto: premi 2 e sparisce.`,fn:()=>{let e=On(),t=Tn(),n=j.edit(`Taglia`,n=>he(n,e,t));if(!n.length){F(t?`Sulle tracce accese non c'è niente sotto il cursore`:`Nessuna clip sotto il cursore da tagliare`,`info`,1400);return}let r=j.doc,i=e=>(Ie(e)?e.kind===`media`?0:1e3:2e3)+r.tracks.findIndex(t=>t.id===e.track),a=n.map(e=>le(r,e)).filter(Boolean).sort((e,t)=>i(e)-i(t))[0],o=r.clips.find(t=>t.track===a.track&&Se(t)===e&&t.id!==a.id&&at(t)),s=o&&e-o.start<a.len?o:a;j.select(k(r,[s.id])),F(`✂ Taglio a ${te(e,r.rate,r.drop)} · selezionato il pezzo ${s===a?`di destra`:`di sinistra`} (più corto): 2 per toglierlo`,`tasto`,1800)}}),z({id:`elimina`,nome:`Elimina clip`,gruppo:`Montaggio`,tasti:[`2`,`Delete`,`Backspace`],info:`Toglie le clip selezionate lasciando il buco, poi seleziona quella dopo. Senza selezione toglie la clip più in alto sotto il cursore.`,fn:()=>{let e=kn();if(!e.size){F(`Seleziona una clip (clic) e premi 2`,`info`);return}F(`🗑 ${An(`Elimina`,e,B.ripple)} clip ${B.ripple?`eliminate e buco chiuso`:`eliminate`}`,`tasto`,1200)}}),z({id:`eliminaChiudi`,nome:`Elimina e chiudi il buco`,gruppo:`Montaggio`,tasti:[`3`,`Shift+Delete`,`Alt+Delete`],info:`Toglie le clip e fa scorrere indietro quelle dopo (ripple delete), poi seleziona quella dopo.`,fn:()=>{let e=kn();if(!e.size){F(`Seleziona una clip e premi 3`,`info`);return}F(`⇤ ${An(`Elimina e chiudi`,e,!0)} clip eliminate, buco chiuso`,`tasto`,1200)}}),z({id:`separa`,nome:`Separa / unisci (gruppi di clip)`,gruppo:`Montaggio`,tasti:[`S`,`4`,`Alt+Y`],info:`Un gruppo selezionato si separa (audio e video vanno ognuno per conto suo). Più clip o più gruppi selezionati diventano un gruppo solo che si muove insieme.`,fn:()=>{if(!j.sel.size){F(`Seleziona le clip: una per separarla, più d'una (Shift+clic o riquadro) per unirle`,`info`,2600);return}let e=j.sel.size,t=j.doc.clips.filter(e=>j.sel.has(e.id));if(!(new Set(t.map(e=>e.link??`∅`+e.id)).size===1&&t[0]?.link)&&t.length<2){F(`Per unire seleziona almeno due clip (Shift+clic o riquadro)`,`info`,2200);return}F(j.edit(`Separa / unisci`,e=>rt(e,j.sel))===`separati`?`⛓ Separate: ora ogni clip si muove da sola`:`⛓ Unite: ${e} clip si muovono insieme`,`tasto`)}});function jn(e,t=On(),n){let r=j.doc,i;if(n)i=k(r,[n.id]);else if([...j.sel].some(e=>{let n=le(r,e);return n&&n.start<t&&Se(n)>t}))i=k(r,j.sel);else{let e=En(t);i=e?k(r,[e.id]):new Set}if(!i.size){F(`Metti il cursore dentro una clip`,`info`);return}if(!j.edit(e===`sinistra`?`Elimina a sinistra`:`Elimina a destra`,n=>Me(n,i,t,e,B.ripple))){F(`Il cursore deve stare dentro la clip`,`info`);return}if(j.select([...i].filter(e=>le(j.doc,e))),e===`sinistra`&&B.ripple){let e=le(j.doc,[...i][0]);e&&j.setHead(e.start)}F(e===`sinistra`?`⇤ Tolto lo scarto a sinistra`:`⇥ Tolto lo scarto a destra`,`tasto`,1200)}z({id:`eliminaSinistra`,nome:`Elimina lo scarto a sinistra del cursore`,gruppo:`Montaggio`,tasti:[`Q`],info:`La clip sotto il cursore (o quella selezionata) perde la parte prima del cursore. Col ripple il buco si chiude.`,fn:()=>jn(`sinistra`)}),z({id:`eliminaDestra`,nome:`Elimina lo scarto a destra del cursore`,gruppo:`Montaggio`,tasti:[`W`],info:`La clip sotto il cursore (o quella selezionata) perde la parte dopo il cursore.`,fn:()=>jn(`destra`)}),z({id:`dissolvenza`,nome:`Dissolvenza sul taglio`,gruppo:`Montaggio`,tasti:[`5`,`Ctrl+P`],info:`Un blocchetto di dissolvenza sopra il taglio più vicino al cursore. Premi di nuovo per toglierla.`,fn:()=>Pn(`mix`)}),z({id:`tendina`,nome:`Tendina sul taglio`,gruppo:`Montaggio`,tasti:[`6`],fn:()=>Pn(`wipe`,1)}),z({id:`passaggioNero`,nome:`Passaggio al nero sul taglio`,gruppo:`Montaggio`,tasti:[`7`],fn:()=>Pn(`dip`)}),z({id:`dissolviInOut`,nome:`Dissolvenza in apertura e chiusura`,gruppo:`Montaggio`,tasti:[`8`],info:`Entra dal nero e esce nel nero (video) o dal silenzio (audio), un secondo per parte.`,fn:()=>{let e=kn();if(!e.size)return;let t=Math.round(Dn());j.edit(`Dissolvenza in/out`,n=>{for(let r of n.clips)if(e.has(r.id)){let e=r.fadeIn>0||r.fadeOut>0;r.fadeIn=e?0:Math.min(t,Math.floor(r.len/2)),r.fadeOut=e?0:Math.min(t,Math.floor(r.len/2))}})}});var Mn=e=>(e/Dn()).toFixed(1).replace(`.`,`,`).replace(`,0`,``)+` s`;function Nn(e,t,n=On(),r,i){let a=j.doc,o=m(a,e,t,B.durataFx),s=n,c=a.clips.find(e=>j.sel.has(e.id)&&Ie(e));e===`transizione`&&c&&r===void 0&&(s=Math.abs(n-c.start)<=Math.abs(n-Se(c))?c.start:Se(c));let l=e===`transizione`?Math.round(Dn()*5):Math.max(2,Math.round(Dn()*.2)),u=r??c?.track??(e===`transizione`?Ye(a,s,l)?.track:void 0)??Ke(a,s),d=Ye(a,s,l,u);if(e===`transizione`){if(!d)return F(`Non c'è un taglio vicino al cursore: portalo su un taglio (↑ ↓) o trascina la transizione sopra`,`info`,2600),null;let n=Re(a,d),r=n.find(e=>e.fxb.id===t);if(r)return j.edit(`Togli transizione`,e=>{e.clips=e.clips.filter(e=>e.id!==r.id)}),F(`${We(r.fxb)} tolta`,`tasto`,1200),null;if(n.length){let r=n[0],i=j.edit(`Somma transizione`,n=>se(n,wn(e,t),r.start,r.len,r.track));return j.select([i.id]),F(`✦ ${We(i.fxb)} si somma a ${n.map(e=>We(e.fxb)).join(` + `)}`,`tasto`,1600),i.id}}let f=ue(a,e,s,o,l,u,e===`effetto`),p=i??f.start,h=i===void 0?f.dove:`libero`,g=j.edit(e===`effetto`?`Effetto a tempo`:`Transizione`,n=>se(n,wn(e,t),p,o,u));j.select([g.id]);let _=h===`taglio`?` sul taglio`:h===`inizio`?` all'inizio della clip`:h===`fine`?` alla fine della clip`:``;return F(`${e===`effetto`?`⚡`:`✦`} ${We(g.fxb)} · ${Mn(o)}${_}`,`tasto`,1400),g.id}function Pn(e,t=1){return Nn(`transizione`,e===`mix`||e===`dip`?e:`${e}:${t}`)}z({id:`istantanea`,nome:`Istantanea del fotogramma (nel contenitore)`,gruppo:`Montaggio`,tasti:[`P`],info:`Fotografa il fotogramma sotto il cursore (Recorder) o della sorgente (Player): finisce nel contenitore come immagine da allungare.`,fn:()=>{pt(()=>import(`./istantanea-CSZZmT7P.js`).then(e=>e.istantanea()),__vite__mapDeps([0,1,2,3,4,5]),import.meta.url)}}),z({id:`fermoImmagine`,nome:`Fermo immagine al cursore`,gruppo:`Montaggio`,tasti:[`Shift+P`],info:`Istantanea del Recorder inserita al cursore per due secondi: il resto scorre avanti.`,fn:()=>{pt(()=>import(`./istantanea-CSZZmT7P.js`).then(e=>e.istantanea({fermo:!0})),__vite__mapDeps([0,1,2,3,4,5]),import.meta.url)}}),z({id:`annulla`,nome:`Annulla`,gruppo:`Modifica`,tasti:[`Ctrl+Z`],fn:()=>{let e=j.doUndo();F(e?`↶ Annullato: ${e}`:`Niente da annullare`,`info`,1200)}}),z({id:`ripeti`,nome:`Ripeti`,gruppo:`Modifica`,tasti:[`Ctrl+Y`,`Ctrl+Shift+Z`],fn:()=>{let e=j.doRedo();F(e?`↷ Ripetuto: ${e}`:`Niente da ripetere`,`info`,1200)}});var Fn=[],In=new Map;z({id:`copia`,nome:`Copia clip`,gruppo:`Modifica`,tasti:[`Ctrl+C`],fn:()=>{let e=j.doc,t=k(e,j.sel);In=new Map;for(let n of e.clips)if(t.has(n.id)&&at(n))for(let r of y(e,n))t.add(r.id),In.set(r.id,n.id);Fn=structuredClone(e.clips.filter(e=>t.has(e.id)));let n=Fn.filter(at).length||Fn.length;Fn.length&&F(`${n} clip copiat${n===1?`a`:`e`}`,`info`,1e3)}}),z({id:`tagliaAppunti`,nome:`Taglia clip negli appunti`,gruppo:`Modifica`,tasti:[`Ctrl+X`],fn:()=>{Cn(`copia`),Fn.length&&j.edit(`Taglia negli appunti`,e=>qe(e,new Set(Fn.map(e=>e.id)),B.ripple))}}),z({id:`incolla`,nome:`Incolla al cursore`,gruppo:`Modifica`,tasti:[`Ctrl+V`],fn:()=>{if(!Fn.length)return;let e=On(),t=Math.min(...Fn.map(e=>e.start)),n=j.edit(`Incolla`,n=>{let r=new Map,a=new Map,o=Fn.map(i=>{let o=structuredClone(i);return o.id=$e(`c`),o.start=i.start-t+e,i.link&&(r.has(i.link)||r.set(i.link,$e(`l`)),o.link=r.get(i.link)),n.tracks.some(e=>e.id===o.track)||(o.track=n.tracks.find(e=>e.kind===(i.kind===`fx`||Ie(i)?`video`:`audio`)).id),a.set(i.id,o),o}),s=new Set(o.map(e=>e.id));if(B.inserisci){n.clips.push(...o);let e=Math.min(...o.map(e=>e.start)),t=Math.max(...o.map(e=>Se(e)));xe(n,e,t-e,new Set(n.tracks.filter(e=>!e.lock).map(e=>e.id)),s)}else{for(let e of o.filter(at))e.track=i(n,fe(n,e.track).kind,e.track,e.start,Se(e)),n.clips.push(e);for(let[e,t]of a){if(at(t))continue;let r=a.get(In.get(e)??``);r&&(t.track=r.track),n.clips.push(t)}}return[...s]});j.select(n),j.setHead(e+Math.max(...Fn.map(e=>Se(e)))-t)}}),z({id:`tutto`,nome:`Seleziona tutto`,gruppo:`Modifica`,tasti:[`Ctrl+A`],fn:()=>j.select(j.doc.clips.map(e=>e.id))}),z({id:`deseleziona`,nome:`Deseleziona`,gruppo:`Modifica`,tasti:[`Escape`],fn:()=>j.select([])}),z({id:`selezionaDopo`,nome:`Seleziona tutto dopo il cursore`,gruppo:`Modifica`,tasti:[`Ctrl+Shift+A`],fn:()=>j.select(j.doc.clips.filter(e=>e.start>=On()).map(e=>e.id))}),z({id:`play`,nome:`Play / Stop`,gruppo:`Trasporto`,tasti:[`Space`],fn:()=>M.toggle()}),z({id:`shuttleAvanti`,nome:`Shuttle avanti (ripeti per accelerare)`,gruppo:`Trasporto`,tasti:[`L`],fn:()=>M.shuttle(1)}),z({id:`shuttleIndietro`,nome:`Shuttle indietro (ripeti per accelerare)`,gruppo:`Trasporto`,tasti:[`J`],fn:()=>M.shuttle(-1)}),z({id:`fermo`,nome:`Fermo`,gruppo:`Trasporto`,tasti:[`K`],fn:()=>M.stop()}),z({id:`fotoPrec`,nome:`Fotogramma precedente`,gruppo:`Trasporto`,tasti:[`ArrowLeft`],fn:()=>M.passo(-1)}),z({id:`fotoSucc`,nome:`Fotogramma successivo`,gruppo:`Trasporto`,tasti:[`ArrowRight`],fn:()=>M.passo(1)}),z({id:`secPrec`,nome:`Indietro di 1 secondo`,gruppo:`Trasporto`,tasti:[`Shift+ArrowLeft`],fn:()=>M.passo(-Math.round(Dn()))}),z({id:`secSucc`,nome:`Avanti di 1 secondo`,gruppo:`Trasporto`,tasti:[`Shift+ArrowRight`],fn:()=>M.passo(Math.round(Dn()))});var Ln=e=>{M.attivo!==`recorder`&&M.setMonitor(`recorder`);let t=ve(j.doc),n=On(),r=e>0?t.find(e=>e>n):[...t].reverse().find(e=>e<n);r!==void 0&&M.vaiA(r)};z({id:`tagloPrec`,nome:`Taglio precedente`,gruppo:`Trasporto`,tasti:[`ArrowUp`,`PageUp`],fn:()=>Ln(-1)}),z({id:`taglioSucc`,nome:`Taglio successivo`,gruppo:`Trasporto`,tasti:[`ArrowDown`,`PageDown`],fn:()=>Ln(1)}),z({id:`inizio`,nome:`All'inizio`,gruppo:`Trasporto`,tasti:[`Home`],fn:()=>{if(M.attivo===`recorder`)M.vaiA(0);else{let e=j.doc.media.find(e=>e.id===M.playerMedia);M.playerVaiA(e?.t0??0)}}}),z({id:`fine`,nome:`Alla fine`,gruppo:`Trasporto`,tasti:[`End`],fn:()=>{if(M.attivo===`recorder`)M.vaiA(He(j.doc));else{let e=j.doc.media.find(e=>e.id===M.playerMedia);e&&M.playerVaiA(e.duration)}}}),z({id:`loop`,nome:`Riproduzione in loop (attacco-stacco, o tutto il montaggio)`,gruppo:`Trasporto`,tasti:[`Ctrl+L`],fn:()=>{M.loop=!M.loop,F(M.loop?`⟳ Loop acceso`:`Loop spento`,`info`,1e3),j.emit(`status`)}}),z({id:`monitor`,nome:`Monitor: sorgente ↔ montaggio`,gruppo:`Trasporto`,tasti:[`Tab`],info:`Il monitor mostra il montaggio; con doppio clic su un file del contenitore mostra la sorgente. Tab passa dall'uno all'altro.`,fn:()=>{if(M.attivo===`recorder`&&!M.playerMedia){F(`Doppio clic su un file del contenitore per vederlo nel monitor`,`info`);return}M.setMonitor(M.attivo===`player`?`recorder`:`player`)}});function Rn(e){if(M.attivo===`player`){let t=j.doc.media.find(e=>e.id===M.playerMedia);if(!t)return;j.edit(e===`in`?`Attacco sorgente`:`Stacco sorgente`,()=>{e===`in`?(t.markIn=M.playerT,t.markOut!=null&&t.markOut<=t.markIn&&(t.markOut=null)):(t.markOut=M.playerT,t.markIn!=null&&t.markIn>=t.markOut&&(t.markIn=null))});return}let t=On();j.edit(e===`in`?`Attacco`:`Stacco`,n=>{e===`in`?(n.inF=t,n.outF!==null&&n.outF<=t&&(n.outF=null)):(n.outF=t,n.inF!==null&&n.inF>=t&&(n.inF=null))})}z({id:`segnaIn`,nome:`Segna attacco (IN)`,gruppo:`Attacco e stacco`,tasti:[`I`],fn:()=>Rn(`in`)}),z({id:`segnaOut`,nome:`Segna stacco (OUT)`,gruppo:`Attacco e stacco`,tasti:[`O`],fn:()=>Rn(`out`)}),z({id:`segnaClip`,nome:`Attacco e stacco sulla clip sotto il cursore`,gruppo:`Attacco e stacco`,tasti:[`Shift+Q`],fn:()=>{let e=O(j.doc,On(),`video`)??O(j.doc,On());e&&j.edit(`Segna clip`,t=>{t.inF=e.start,t.outF=Se(e)})}}),z({id:`togliInOut`,nome:`Togli attacco e stacco`,gruppo:`Attacco e stacco`,tasti:[`Alt+X`,`Ctrl+Shift+X`],fn:()=>{if(M.attivo===`player`){let e=j.doc.media.find(e=>e.id===M.playerMedia);e&&j.edit(`Togli segni sorgente`,()=>{e.markIn=null,e.markOut=null})}else j.edit(`Togli attacco e stacco`,e=>{e.inF=null,e.outF=null})}}),z({id:`vaiIn`,nome:`Vai all'attacco`,gruppo:`Attacco e stacco`,tasti:[`Shift+I`],fn:()=>{if(M.attivo===`player`){let e=j.doc.media.find(e=>e.id===M.playerMedia);e?.markIn!=null&&M.playerVaiA(e.markIn)}else j.doc.inF!==null&&M.vaiA(j.doc.inF)}}),z({id:`vaiOut`,nome:`Vai allo stacco`,gruppo:`Attacco e stacco`,tasti:[`Shift+O`],fn:()=>{if(M.attivo===`player`){let e=j.doc.media.find(e=>e.id===M.playerMedia);e?.markOut!=null&&M.playerVaiA(e.markOut)}else j.doc.outF!==null&&M.vaiA(j.doc.outF)}});function zn(){let e=j.doc,t=e.tracks.filter(e=>e.kind===`video`&&!e.lock),n=e.tracks.filter(e=>e.kind===`audio`&&!e.lock),r=Tn();if(r){let e=t.filter(e=>r.has(e.id)),i=n.filter(e=>r.has(e.id));return{video:e[e.length-1]?.id??null,audio:i.slice(0,2).map(e=>e.id)}}return{video:t[t.length-1]?.id??null,audio:n.slice(0,2).map(e=>e.id)}}function Bn(e){let t=j.doc,n=t.media.find(e=>e.id===M.playerMedia);if(!n){F(`Doppio clic su un file del contenitore per aprirlo nel monitor`,`info`);return}let r=n.markIn??(M.attivo===`player`&&n.type!==`image`?M.playerT:n.t0||0),i=n.markOut??(n.type===`image`?r+5:n.duration);i<=r&&(i=n.type===`image`?r+5:n.duration);let a=t.inF??On(),o=t.inF===null?null:t.outF;if(t.inF===null&&t.outF!==null){let e=nt(i-r,t.rate);a=Math.max(0,t.outF-e)}let s=zn();if(!(n.hasVideo&&s.video)&&!(n.hasAudio&&s.audio.length)){F(`Accendi una traccia del tipo giusto (clic sul nome della traccia)`,`errore`);return}let c=j.edit(e===`insert`?`Inserisci`:`Sovrascrivi`,t=>{let c=Ee(t,{mediaId:n.id,srcIn:r,srcOut:i},a,o,s,e);return c.length&&(t.inF=null,t.outF=null),c});if(!c.length)return;let l=c.map(e=>le(j.doc,e)).filter(Boolean),u=Math.max(...l.map(e=>Se(e)));j.select(c),Vn={a,b:u},M.setMonitor(`recorder`),j.setHead(u),F(`${e===`insert`?`⤵ Inserito`:`⬇ Sovrascritto`} ${n.name} · ${te(u-a,t.rate,t.drop)}`,`tasto`)}var Vn=null;z({id:`inserisci`,nome:`Inserisci dalla sorgente`,gruppo:`Centralina`,tasti:[`,`,`[`],info:`Montaggio a tre punti: la sorgente entra al cursore e sposta avanti il resto.`,fn:()=>Bn(`insert`)}),z({id:`sovrascrivi`,nome:`Sovrascrivi dalla sorgente`,gruppo:`Centralina`,tasti:[`.`,`]`],info:`Montaggio a tre punti: la sorgente copre quello che c'è sotto (l'unico comando che copre).`,fn:()=>Bn(`overwrite`)}),z({id:`velocita`,nome:`Velocità della clip…`,gruppo:`Montaggio`,tasti:[`Alt+E`],info:`Velocizza o rallenta la clip selezionata (o quella sotto il cursore): la voce resta naturale e, se rallenti molto, il movimento si ricostruisce fluido.`,fn:()=>It(kn())}),z({id:`edit`,nome:`EDIT (nel modo attivo)`,gruppo:`Centralina`,tasti:[`E`,`Enter`],fn:()=>Bn(B.inserisci?`insert`:`overwrite`)}),z({id:`rivedi`,nome:`Rivedi l'ultimo montaggio (preroll)`,gruppo:`Centralina`,tasti:[`Shift+R`],fn:()=>{Vn?M.rivedi(Vn.a,Vn.b):j.doc.inF!==null&&M.rivedi(j.doc.inF,j.doc.outF??j.doc.inF)}}),z({id:`solleva`,nome:`Solleva (lift) attacco-stacco`,gruppo:`Centralina`,tasti:[`Z`],fn:()=>{let e=j.doc;if(e.inF===null||e.outF===null){F(`Segna attacco (I) e stacco (O) sulla timeline`,`info`);return}j.edit(`Solleva`,t=>Ce(t,e.inF,e.outF)),F(`⇡ Sollevato: resta il buco`,`tasto`)}}),z({id:`estrai`,nome:`Estrai (extract) attacco-stacco`,gruppo:`Centralina`,tasti:[`X`],fn:()=>{let e=j.doc;if(e.inF===null||e.outF===null){F(`Segna attacco (I) e stacco (O) sulla timeline`,`info`);return}let t=e.inF,n=e.outF;j.edit(`Estrai`,e=>{Xe(e,t,n),e.outF=null}),j.setHead(t),F(`⇤ Estratto: il buco si è chiuso su tutte le tracce`,`tasto`)}}),z({id:`modoInserisci`,nome:`Modo libero / inserisci`,gruppo:`Centralina`,tasti:[`Insert`,`Alt+I`],fn:()=>{B.inserisci=!B.inserisci,F(B.inserisci?`Modo INSERISCI: la clip che lasci fa spazio spostando avanti il resto`:`Modo LIBERO: la clip che sposti o lasci non copre niente`,`info`,2200),j.emit(`status`)}}),z({id:`ripple`,nome:`Ripple (elimina e trim chiudono i buchi)`,gruppo:`Centralina`,tasti:[`R`],fn:()=>{B.ripple=!B.ripple,F(B.ripple?`Ripple ACCESO`:`Ripple spento`,`info`,1e3),j.emit(`status`)}}),z({id:`snap`,nome:`Calamita (aggancio)`,gruppo:`Centralina`,tasti:[`N`],fn:()=>{B.snap=!B.snap,F(B.snap?`Calamita accesa`:`Calamita spenta`,`info`,1e3),j.emit(`status`)}}),z({id:`elastico`,nome:`Linea della trasparenza sui video`,gruppo:`Centralina`,tasti:[`B`],fn:()=>{B.elastico=!B.elastico,F(B.elastico?`Trasparenza: clic sul video per un punto, tiralo giù per sfumare (Alt+clic lo toglie)`:`Linea della trasparenza nascosta`,`info`,2400),j.emit(`status`,`view`)}}),z({id:`abbina`,nome:`Abbina fotogramma (match frame)`,gruppo:`Centralina`,tasti:[`F`],fn:()=>{let e=O(j.doc,On(),`video`)??O(j.doc,On());if(!e?.media){F(`Sotto il cursore non c'è una sorgente`,`info`);return}let t=Pe(j.doc,e,On());M.caricaPlayer(e.media,t),M.setMonitor(`player`),F(`La sorgente nel monitor allo stesso fotogramma (Tab per tornare al montaggio)`,`info`)}}),z({id:`marcatore`,nome:`Marcatore al cursore`,gruppo:`Centralina`,tasti:[`M`],fn:()=>{let e=On(),t=j.doc.markers.find(t=>t.f===e);j.edit(t?`Togli marcatore`:`Marcatore`,n=>{t?n.markers=n.markers.filter(e=>e!==t):n.markers.push({id:$e(`k`),f:e,name:`Marcatore `+(n.markers.length+1),color:`#ffd54a`})})}}),z({id:`estendi`,nome:`Estendi il taglio al cursore (extend)`,gruppo:`Centralina`,tasti:[`Ctrl+E`],info:`Porta il bordo più vicino della clip selezionata fino al cursore.`,fn:()=>{let e=j.doc.clips.find(e=>j.sel.has(e.id));if(!e)return;let t=On(),n=Math.abs(t-e.start)<Math.abs(t-Se(e))?`in`:`out`,r=n===`in`?t-e.start:t-Se(e);j.edit(`Estendi`,t=>et(t,e.id,n,r,{ripple:B.ripple,linked:!0}))}}),z({id:`slipSx`,nome:`Slip di un fotogramma indietro`,gruppo:`Centralina`,tasti:[`Alt+ArrowLeft`],fn:()=>{j.sel.size&&j.edit(`Slip`,e=>de(e,k(e,j.sel),-1))}}),z({id:`slipDx`,nome:`Slip di un fotogramma avanti`,gruppo:`Centralina`,tasti:[`Alt+ArrowRight`],fn:()=>{j.sel.size&&j.edit(`Slip`,e=>de(e,k(e,j.sel),1))}}),z({id:`nudgeSx`,nome:`Sposta la clip di un fotogramma a sinistra`,gruppo:`Centralina`,tasti:[`Ctrl+ArrowLeft`],fn:()=>{j.sel.size&&j.edit(`Sposta`,e=>Ne(e,k(e,j.sel),-1,0,`video`,`libero`))}}),z({id:`nudgeDx`,nome:`Sposta la clip di un fotogramma a destra`,gruppo:`Centralina`,tasti:[`Ctrl+ArrowRight`],fn:()=>{j.sel.size&&j.edit(`Sposta`,e=>Ne(e,k(e,j.sel),1,0,`video`,`libero`))}});function Hn(e){let t=[...j.sel].filter(e=>{let t=le(j.doc,e);return t&&Ie(t)});if(!t.length){F(`Seleziona una clip video`,`info`,1e3);return}j.edit(`Trasparenza`,n=>{for(let r of n.clips)t.includes(r.id)&&(r.opacity=Math.max(0,Math.min(1,Math.round((r.opacity+e)*20)/20)),r.opKeys=[])});let n=le(j.doc,t[0]);F(`Opacità ${Math.round(n.opacity*100)}%`,`tasto`,800)}z({id:`opacitaMeno`,nome:`Trasparenza: meno opaca (−10%)`,gruppo:`Livelli`,tasti:[`Alt+ArrowDown`],fn:()=>Hn(-.1)}),z({id:`opacitaPiu`,nome:`Trasparenza: più opaca (+10%)`,gruppo:`Livelli`,tasti:[`Alt+ArrowUp`],fn:()=>Hn(.1)}),z({id:`tracciaV`,nome:`Aggiungi traccia video`,gruppo:`Livelli`,tasti:[`Ctrl+Alt+V`],fn:()=>j.edit(`Traccia video`,e=>{e.tracks.unshift(ye(`video`,Ze(e,`video`)))})}),z({id:`tracciaA`,nome:`Aggiungi traccia audio`,gruppo:`Livelli`,tasti:[`Ctrl+Alt+A`],fn:()=>j.edit(`Traccia audio`,e=>{e.tracks.push(ye(`audio`,Ze(e,`audio`)))})});function Un(e,t=On(),n,r={}){let a=r.conto??{stile:`pellicola`,secondi:5},o=j.doc,s=Dn(),c=o.tracks.filter(e=>e.kind===`video`&&!e.lock).slice(-1)[0]?.id??null,l=o.tracks.find(e=>e.kind===`audio`&&!e.lock)?.id??null,u=j.edit(`Generatore`,o=>{let u=[],d=(e,r=n??c)=>i(o,`video`,r,t,t+e),f=e=>i(o,`audio`,l,t,t+e);if(e===`bars`){let e=Math.round(s*10),n=$e(`l`),r=ze(`bars`,d(e),t,e,{name:`Barre colore SMPTE`,gen:{bars:`smpte`},link:n});o.clips.push(r),u.push(r.id);let i=ze(`tone`,f(e),t,e,{name:`Tono 1 kHz −18 dBFS`,gen:{freq:1e3,level:-18},link:n});o.clips.push(i),u.push(i.id)}else if(e===`countdown`){let e=Math.round(s*a.secondi),n=Zt.find(e=>e.id===a.stile)?.nome??`Countdown`,r=ze(`countdown`,d(e),t,e,{name:`Countdown ${n} ${a.secondi}…1`,gen:{conto:a.stile},sfx:{suono:`bip`,audio:!0,volume:-8}});o.clips.push(r),u.push(r.id)}else if(e===`anim`){let e=hn(r.anim??`lt-barra`)??mn[0],i=Math.max(1,Math.round(s*e.durata)),a=n??(e.fondo?c:o.tracks.find(e=>e.kind===`video`&&!e.lock)?.id??null),l=o.tracks.length,f=d(i,a);if(e.fondo&&!n&&o.tracks.length>l){let[e]=o.tracks.splice(o.tracks.findIndex(e=>e.id===f),1),t=o.tracks.reduce((e,t,n)=>t.kind===`video`?n:e,-1);o.tracks.splice(t+1,0,e)}let p=ze(`title`,f,t,i,{name:e.nome,gen:{anim:vn(e.id)}});o.clips.push(p),u.push(p.id)}else if(e===`title`){let e=Math.round(s*5*(r.titolo?tn(r.titolo)?.volte??1:1)),i=ze(`title`,d(e,n??o.tracks.find(e=>e.kind===`video`&&!e.lock)?.id??null),t,e,{name:`Titolo`,gen:{title:{...ce}}});r.titolo&&nn(i,r.titolo),i.sfx={suono:Ve(i.gen?.title?.style),audio:!1},o.clips.push(i),u.push(i.id)}else{let n=Math.round(s*5),r=ze(`color`,d(n),t,n,{name:e===`nero`?`Nero`:`Colore`,gen:{color:e===`nero`?`#000000`:`#1b3a8f`}});o.clips.push(r),u.push(r.id)}return u});return j.select(u),u}z({id:`genBarre`,nome:`Barre colore e tono`,gruppo:`Generatori`,tasti:[`Ctrl+Alt+B`],fn:()=>Un(`bars`)}),z({id:`genNero`,nome:`Nero`,gruppo:`Generatori`,fn:()=>Un(`nero`)}),z({id:`genColore`,nome:`Colore pieno`,gruppo:`Generatori`,fn:()=>Un(`color`)}),z({id:`genCountdown`,nome:`Countdown da pellicola`,gruppo:`Generatori`,tasti:[`Ctrl+Alt+C`],fn:()=>Un(`countdown`)}),z({id:`genTitolo`,nome:`Titolo`,gruppo:`Generatori`,tasti:[`T`,`Ctrl+T`],fn:()=>Un(`title`)}),z({id:`genAnimazione`,nome:`Animazione (sottopancia, testo che si muove…)`,gruppo:`Generatori`,tasti:[`Ctrl+Alt+N`],fn:()=>Un(`anim`)});var Wn=7,Gn=`#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_a, u_b;
uniform vec2 u_cell;
uniform float u_lod;
out vec4 o;
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
void main() {
  float pa[9];
  for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++)
    pa[j * 3 + i] = lum(textureLod(u_a, v_uv + vec2(float(i) - 1.0, float(j) - 1.0) * u_cell * 0.33, u_lod).rgb);
  float best = 1e9;
  vec2 bd = vec2(0.0);
  for (int dy = -${Wn}; dy <= ${Wn}; dy++) for (int dx = -${Wn}; dx <= ${Wn}; dx++) {
    vec2 d = vec2(float(dx), float(dy));
    float sad = 0.0;
    for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++)
      sad += abs(pa[j * 3 + i] - lum(textureLod(u_b, v_uv + (vec2(float(i) - 1.0, float(j) - 1.0) * 0.33 + d) * u_cell, u_lod).rgb));
    sad = sad / 9.0 + 0.0015 * length(d);
    if (sad < best) { best = sad; bd = d; }
  }
  float fid = 1.0 - smoothstep(0.035, 0.13, best);
  o = vec4(bd / ${14 .toFixed(1)} + 0.5, fid, 1.0);
}`,Kn=`#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_a, u_b, u_mv;
uniform float u_w;
uniform vec2 u_cell;
uniform bool u_mosso;
out vec4 o;
void main() {
  vec4 plain = mix(texture(u_a, v_uv), texture(u_b, v_uv), u_w);
  if (!u_mosso) { o = plain; return; }
  vec4 m = texture(u_mv, v_uv);
  vec2 d = (m.rg - 0.5) * ${14 .toFixed(1)} * u_cell;
  vec4 wa = texture(u_a, v_uv - d * u_w);
  vec4 wb = texture(u_b, v_uv + d * (1.0 - u_w));
  o = mix(plain, mix(wa, wb, u_w), m.b);
}`,qn=class{gl;pMoto;pMezzo;uMoto={};uMezzo={};stati=new Map;usati=new Set;constructor(e){this.gl=e,this.pMoto=Ma(e,Ea,Gn),this.pMezzo=Ma(e,Ea,Kn);for(let t of[`u_a`,`u_b`,`u_cell`,`u_lod`])this.uMoto[t]=e.getUniformLocation(this.pMoto,t);for(let t of[`u_a`,`u_b`,`u_mv`,`u_w`,`u_cell`,`u_mosso`])this.uMezzo[t]=e.getUniformLocation(this.pMezzo,t)}bersaglio(e,t,n){let r=this.gl,i=r.createTexture();r.bindTexture(r.TEXTURE_2D,i),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,n),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,n),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,e,t,0,r.RGBA,r.UNSIGNED_BYTE,null);let a=r.createFramebuffer();return r.bindFramebuffer(r.FRAMEBUFFER,a),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,i,0),{fb:a,tex:i,w:e,h:t}}libera(e){e&&(this.gl.deleteFramebuffer(e.fb),this.gl.deleteTexture(e.tex))}inizia(){this.usati.clear()}finisce(){for(let[e,t]of this.stati)this.usati.has(e)||(this.libera(t.out),this.libera(t.mv),this.stati.delete(e))}mezzo(e,t,n,r,i,a,o,s){let c=this.gl;this.usati.add(e);let l=this.stati.get(e);if((!l||l.out.w!==a||l.out.h!==o)&&(l&&(this.libera(l.out),this.libera(l.mv)),l={out:this.bersaglio(a,o,c.LINEAR)},this.stati.set(e,l)),c.disable(c.BLEND),s){let e=Math.max(8,Math.min(240,Math.ceil(a/4))),i=Math.max(8,Math.round(e*o/a));if((!l.mv||l.mv.w!==e||l.mv.h!==i)&&(this.libera(l.mv),l.mv=this.bersaglio(e,i,c.LINEAR),l.coppia=void 0),l.coppia!==r){for(let e of[t,n])c.bindTexture(c.TEXTURE_2D,e.tex),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,c.LINEAR_MIPMAP_LINEAR),c.generateMipmap(c.TEXTURE_2D);let o=a/e;c.bindFramebuffer(c.FRAMEBUFFER,l.mv.fb),c.viewport(0,0,e,i),c.useProgram(this.pMoto),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,t.tex),c.uniform1i(this.uMoto.u_a,0),c.activeTexture(c.TEXTURE1),c.bindTexture(c.TEXTURE_2D,n.tex),c.uniform1i(this.uMoto.u_b,1),c.uniform2f(this.uMoto.u_cell,1/e,1/i),c.uniform1f(this.uMoto.u_lod,Math.max(0,Math.log2(o/2.5))),c.drawArrays(c.TRIANGLE_STRIP,0,4);for(let e of[t,n])c.bindTexture(c.TEXTURE_2D,e.tex),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,c.LINEAR);l.coppia=r}}return c.bindFramebuffer(c.FRAMEBUFFER,l.out.fb),c.viewport(0,0,a,o),c.useProgram(this.pMezzo),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,t.tex),c.uniform1i(this.uMezzo.u_a,0),c.activeTexture(c.TEXTURE1),c.bindTexture(c.TEXTURE_2D,n.tex),c.uniform1i(this.uMezzo.u_b,1),c.activeTexture(c.TEXTURE2),c.bindTexture(c.TEXTURE_2D,s&&l.mv?l.mv.tex:t.tex),c.uniform1i(this.uMezzo.u_mv,2),c.uniform1f(this.uMezzo.u_w,i),c.uniform1i(this.uMezzo.u_mosso,+!!s),c.uniform2f(this.uMezzo.u_cell,1/(l.mv?.w??1),1/(l.mv?.h??1)),c.drawArrays(c.TRIANGLE_STRIP,0,4),c.activeTexture(c.TEXTURE0),l.out.tex}distruggi(){for(let e of this.stati.values())this.libera(e.out),this.libera(e.mv);this.stati.clear()}},Jn={lift:[0,0,0],gamma:[1,1,1],gain:[1,1,1],sat:1,contrast:1,shadow:[0,0,0],high:[0,0,0],vignette:0,grain:0},Yn=[{id:`nessuno`,nome:`Naturale`,info:`come è stato girato`,g:{},colori:[`#6b7a8f`,`#c9b18a`,`#e9e4da`]},{id:`cinema`,nome:`Cinema`,info:`ombre ottanio, pelle calda`,g:{contrast:1.12,sat:.92,shadow:[-.03,.02,.06],high:[.06,.02,-.04],vignette:.25},colori:[`#12343f`,`#d98b4e`,`#f3d2a8`]},{id:`caldo`,nome:`Caldo`,info:`luce del tramonto`,g:{gain:[1.08,1,.88],sat:1.05},colori:[`#5a2d12`,`#e0913a`,`#ffe0a8`]},{id:`freddo`,nome:`Freddo`,info:`mattina d'inverno`,g:{gain:[.9,.99,1.1],sat:.94},colori:[`#132c4a`,`#6fa0c9`,`#dff0ff`]},{id:`vivace`,nome:`Vivace`,info:`colori pieni, da spot`,g:{sat:1.35,contrast:1.08,gamma:[1.04,1.04,1.04]},colori:[`#c2185b`,`#00b0ff`,`#ffd600`]},{id:`vintage`,nome:`Vintage`,info:`foto di famiglia anni '70`,g:{lift:[.06,.05,.03],gain:[.97,.94,.84],sat:.75,contrast:.9,vignette:.35,grain:.04},colori:[`#6b5a40`,`#c8a97a`,`#efe0c0`]},{id:`bn`,nome:`Bianco e nero`,info:`contrastato, da reportage`,g:{sat:0,contrast:1.15,vignette:.2},colori:[`#111111`,`#777777`,`#eeeeee`]},{id:`pellicola`,nome:`Pellicola`,info:`curva morbida e grana`,g:{contrast:1.06,sat:.9,shadow:[0,.02,.03],high:[.04,.02,0],grain:.05,vignette:.2},colori:[`#2b2e2a`,`#a38a64`,`#f2e6cc`]},{id:`notte`,nome:`Notte`,info:`blu da notte americana`,g:{gain:[.78,.9,1.15],gamma:[.9,.9,.9],sat:.8,lift:[0,.01,.03]},colori:[`#050b1f`,`#1f3f7a`,`#8fb3ff`]}],Xn=(e,t,n)=>e+(t-e)*n,Zn=(e,t,n)=>[Xn(e[0],t[0],n),Xn(e[1],t[1],n),Xn(e[2],t[2],n)];function Qn(e){let t=Yn.find(t=>t.id===e.look)??Yn[0],n=e.look===`nessuno`?0:Math.max(0,Math.min(1,e.intensita)),r={...Jn,...t.g},i={lift:Zn(Jn.lift,r.lift,n),gamma:Zn(Jn.gamma,r.gamma,n),gain:Zn(Jn.gain,r.gain,n),sat:Xn(1,r.sat,n),contrast:Xn(1,r.contrast,n),shadow:Zn(Jn.shadow,r.shadow,n),high:Zn(Jn.high,r.high,n),vignette:Xn(0,r.vignette,n),grain:Xn(0,r.grain,n)},a=e.bright*.25;i.lift=i.lift.map(e=>e+a*.5),i.gain=i.gain.map(e=>e*(1+a)),i.contrast*=e.contrast,i.sat*=e.sat;let o=e.temp,s=e.tint;return i.gain=[i.gain[0]*(1+o*.12),i.gain[1]*(1-s*.08),i.gain[2]*(1-o*.14)],i.vignette=Math.max(i.vignette,e.vignette),i.grain=Math.max(i.grain,e.grain*.12),i}function $n(e){let t=(e,t)=>Math.abs(e[0]-t[0])+Math.abs(e[1]-t[1])+Math.abs(e[2]-t[2])<1e-4;return t(e.lift,Jn.lift)&&t(e.gamma,Jn.gamma)&&t(e.gain,Jn.gain)&&Math.abs(e.sat-1)<1e-4&&Math.abs(e.contrast-1)<1e-4&&t(e.shadow,Jn.shadow)&&t(e.high,Jn.high)&&e.vignette<1e-4&&e.grain<1e-4}var er=e({BIT_LOOK:()=>nr,RITOCCHI:()=>tr,fxEffettivo:()=>rr}),tr={vivace:{sat:1.35,contrast:.06},luminoso:{bright:.1,contrast:.05},caldo:{temp:.4},freddo:{temp:-.4},vignetta:{vignette:.55},zoom:{zoom:.15},specchia:{mirror:!0},bn:{look:`bn`},seppia:{look:`seppia`},pellicola:{look:`film`},vhs:{look:`vhs`},crt:{look:`crt`},pop:{sat:1.5,contrast:.14},contrasto:{contrast:.24,bright:-.02},notte:{bright:-.09,temp:-.55,sat:.8,vignette:.25},sbiadito:{contrast:-.18,bright:.06,sat:.7},tramonto:{temp:.8,sat:1.12,hue:-5},cinema:{contrast:.12,sat:.88,temp:.12,vignette:.3},sogno:{bright:.07,contrast:-.12,sat:1.15,vignette:.2},gelo:{temp:-.8,sat:.75,bright:.04}},nr={none:0,vhs:1,film:2,bn:4,seppia:8,crt:16};function rr(e){let t={bright:e.bright,contrast:e.contrast,sat:e.sat,hue:e.hue,temp:e.temp??0,vignette:e.vignette??0,zoom:e.zoom??0,mirror:!!e.mirror,looks:nr[e.look]??0};for(let n of e.effetti??[]){let e=tr[n];e&&(t.bright+=e.bright??0,t.contrast+=e.contrast??0,t.sat*=e.sat??1,t.hue+=e.hue??0,t.temp+=e.temp??0,t.vignette+=e.vignette??0,t.zoom+=e.zoom??0,e.mirror&&(t.mirror=!t.mirror),e.look&&(t.looks|=nr[e.look]??0))}return t.temp=Math.max(-1.5,Math.min(1.5,t.temp)),t.vignette=Math.min(1,t.vignette),t.contrast=Math.max(.2,t.contrast),t}var ir=e({BUDGET_MASCHERE:()=>sr,CHIAVI:()=>cr,QUALITA_RITAGLIO:()=>or,RITAGLIO0:()=>ar,SPILL0:()=>lr,campioneAl:()=>hr,coloreDominante:()=>gr,coloriChiave:()=>ur,firmaRitaglio:()=>pr,hexRgb:()=>dr,istantiCampioni:()=>mr,levigaMaschere:()=>vr,puoRitagliare:()=>xr,rgbHex:()=>fr,ridimensionaMaschera:()=>yr,riquadroMaschera:()=>_r,trattoSorgente:()=>br}),ar={modo:`soggetto`,modello:`ben2`,bordo:0,morbido:.3,qualita:1},or=[{nome:`Veloce`,hz:4,lato:384},{nome:`Buona`,hz:8,lato:512},{nome:`Alta`,hz:12,lato:768}],sr=125829120,cr=[{id:`verde`,nome:`Green screen`,colore:`#00b140`},{id:`verdeVivo`,nome:`Verde vivo`,colore:`#00ff2a`},{id:`blu`,nome:`Blue screen`,colore:`#0047bb`},{id:`magenta`,nome:`Magenta`,colore:`#ff00cc`}],lr=.5,ur=e=>[e.keyColor,...e.keyColori??[]].slice(0,3);function dr(e){let t=/^#?([0-9a-f]{6})/i.exec(e??``);if(!t)return[0,0,0];let n=parseInt(t[1],16);return[n>>16&255,n>>8&255,n&255]}var fr=(e,t,n)=>`#`+[e,t,n].map(e=>Math.max(0,Math.min(255,Math.round(e))).toString(16).padStart(2,`0`)).join(``);function pr(e,t){let n=t.modo===`oggetti`?(t.punti??[]).map(e=>`${e.x.toFixed(3)},${e.y.toFixed(3)},${+!!e.dentro}`).join(`;`):``;return[e,t.modo,t.modello,t.qualita,n,t.modo===`oggetti`?(t.da??0).toFixed(2):``,t.segui?`s`:``].join(`|`)}function mr(e,t,n,r,i,a=sr){let o=Math.max(.001,t-e),s=Math.max(1,n),c=Math.max(1,r*i);for(;s>2&&Math.ceil(o*s)+1>a/c;)s=Math.max(2,s-1);let l=Math.max(1,Math.ceil(o*s)+1);return{t0:e,dt:l>1?o/(l-1):o,n:l,hz:s}}function hr(e,t,n,r){if(r<=1||n<=0)return{i:0,j:0,k:0};let i=Math.max(0,Math.min(r-1,(e-t)/n)),a=Math.min(r-2,Math.floor(i));return{i:a,j:a+1,k:i-a}}function gr(e,t,n){let r=Array(24).fill(0),i=Array(24).fill(0),a=Array(24).fill(0),o=Array(24).fill(0),s=Math.max(2,Math.round(Math.min(t,n)*.08)),c=0,l=0,u=0,d=0,f=Math.max(1,Math.floor(Math.max(t,n)/160));for(let p=0;p<n;p+=f)for(let m=0;m<t;m+=f){if(m>=s&&m<t-s&&p>=s&&p<n-s){m=Math.max(m,t-s-1);continue}let f=(p*t+m)*4,h=e[f],g=e[f+1],_=e[f+2];c++,l+=h,u+=g,d+=_;let v=Math.max(h,g,_),y=Math.min(h,g,_);if((v?(v-y)/v:0)<.25||v<40)continue;let b,x=v-y;b=v===h?((g-_)/x+6)%6:v===g?(_-h)/x+2:(h-g)/x+4;let S=Math.min(23,Math.floor(b/6*24));r[S]++,i[S]+=h,a[S]+=g,o[S]+=_}if(!c)return{colore:`#00b140`,saturazione:0,quota:0};let p=0,m=-1;for(let e=0;e<24;e++){let t=r[e]+r[(e+1)%24]+r[(e+24-1)%24];t>p&&(p=t,m=e)}if(m>=0&&p>=c*.25){let e=0,t=0,n=0,s=0;for(let c of[m,(m+1)%24,(m+24-1)%24])e+=r[c],t+=i[c],n+=a[c],s+=o[c];let l=t/e,u=n/e,d=s/e,f=Math.max(l,u,d),h=Math.min(l,u,d);return{colore:fr(l,u,d),saturazione:f?(f-h)/f:0,quota:p/c}}return{colore:fr(l/c,u/c,d/c),saturazione:0,quota:0}}function _r(e,t,n,r=128){let i=t,a=n,o=-1,s=-1,c=0,l=0,u=0;for(let d=0;d<n;d++)for(let n=0;n<t;n++)e[d*t+n]<r||(c++,l+=n,u+=d,n<i&&(i=n),n>o&&(o=n),d<a&&(a=d),d>s&&(s=d));return c?{x0:i/t,y0:a/n,x1:(o+1)/t,y1:(s+1)/n,cx:l/c/t,cy:u/c/n,area:c/(t*n)}:null}function vr(e){if(e.length<3)return;let t=Uint8Array.from(e[0]);for(let n=1;n<e.length-1;n++){let r=e[n],i=e[n+1],a=Uint8Array.from(r);for(let e=0;e<r.length;e++){let n=t[e],o=i[e],s=a[e],c=s*2,l=2;Math.abs(n-s)<48&&(c+=n,l++),Math.abs(o-s)<48&&(c+=o,l++),r[e]=Math.round(c/l)}t=a}}function yr(e,t,n,r,i){if(t===r&&n===i)return e;let a=new Uint8Array(r*i);for(let o=0;o<i;o++){let s=Math.max(0,Math.min(n-1,(o+.5)*n/i-.5)),c=Math.floor(s),l=Math.min(n-1,c+1),u=s-c;for(let n=0;n<r;n++){let i=Math.max(0,Math.min(t-1,(n+.5)*t/r-.5)),s=Math.floor(i),d=Math.min(t-1,s+1),f=i-s,p=e[c*t+s]*(1-f)+e[c*t+d]*f,m=e[l*t+s]*(1-f)+e[l*t+d]*f;a[o*r+n]=Math.round(p*(1-u)+m*u)}}return a}function br(e,t){return{da:e.srcIn,a:e.srcIn+e.len/t*e.speed}}var xr=e=>!!e&&(e.type===`image`||e.type===`video`)&&e.width>0,Sr=e({impostaMaschere:()=>Er,leggiCache:()=>Ir,maschereAl:()=>Or,maschereDi:()=>Tr,potaMaschere:()=>kr,ripristinaMaschere:()=>Rr,salvaCache:()=>Fr,svuotaCache:()=>Lr,togliMaschere:()=>Dr}),Cr=new Map,wr=()=>{typeof document<`u`&&document.dispatchEvent(new CustomEvent(`dpv:maschere`))},Tr=e=>e?Cr.get(e):void 0;function Er(e,t=!0){Cr.set(e.firma,e),t&&Fr(e),wr()}function Dr(e){Cr.delete(e)&&wr()}function Or(e,t){let n=Tr(e);if(!n||!n.n)return null;let r=hr(t,n.t0,n.dt,n.n);return{a:n.dati[r.i],b:n.dati[r.j],k:r.k,i:r.i,w:n.w,h:n.h,m:n}}function kr(e,t=[]){let n=new Set(t),r=[...e.clips,...(e.sequenze??[]).flatMap(e=>e.clips??[])];for(let e of r)e.ritaglio?.firma&&n.add(e.ritaglio.firma);for(let e of[...Cr.keys()])n.has(e)||Cr.delete(e)}var Ar=`dpv-maschere`,jr=`m`,Mr=8;function Nr(){return new Promise(e=>{try{if(typeof indexedDB>`u`){e(null);return}let t=indexedDB.open(Ar,1);t.onupgradeneeded=()=>{t.result.createObjectStore(jr,{keyPath:`firma`})},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}catch{e(null)}})}var Pr=e=>new Promise(t=>{e.onsuccess=()=>t(e.result),e.onerror=()=>t(null)});async function Fr(e){let t=await Nr();if(t)try{let n=new Uint8Array(e.w*e.h*e.n);e.dati.forEach((t,r)=>n.set(t,r*e.w*e.h));let r=t.transaction(jr,`readwrite`),i=r.objectStore(jr);i.put({firma:e.firma,w:e.w,h:e.h,t0:e.t0,dt:e.dt,n:e.n,hz:e.hz,buf:n.buffer,quando:Date.now()});let a=await Pr(i.getAll());if(a&&a.length>Mr){a.sort((e,t)=>e.quando-t.quando);for(let e of a.slice(0,a.length-Mr))i.delete(e.firma)}await new Promise(e=>{r.oncomplete=()=>e(),r.onerror=()=>e(),r.onabort=()=>e()})}catch{}finally{t.close()}}async function Ir(e){let t=await Nr();if(!t)return null;try{let n=await Pr(t.transaction(jr,`readonly`).objectStore(jr).get(e));if(!n)return null;let r=n.w*n.h,i=new Uint8Array(n.buf);return i.length===r*n.n?{firma:n.firma,w:n.w,h:n.h,t0:n.t0,dt:n.dt,n:n.n,hz:n.hz,dati:Array.from({length:n.n},(e,t)=>i.slice(t*r,(t+1)*r))}:null}catch{return null}finally{t.close()}}async function Lr(){let e=await Nr();if(e)try{e.transaction(jr,`readwrite`).objectStore(jr).clear()}catch{}finally{e.close()}}async function Rr(e){let t=[...e.clips,...(e.sequenze??[]).flatMap(e=>e.clips??[])],n=new Set;for(let e of t)e.ritaglio?.firma&&!Cr.has(e.ritaglio.firma)&&n.add(e.ritaglio.firma);for(let e of n){let t=await Ir(e);t&&!Cr.has(e)&&Er(t,!1)}}function zr(e,t){let n=e.sottotitoli;if(n?.nelVideo)return n.righe.find(e=>e.da<=t&&t<e.a&&e.testo.trim())}function Br(e,t,n,r){let i=Oe(e),a=i.logo&&ne(i.logo.media)?.image?i.logo:null,o=zr(e,t);if(!a&&!o)return null;let s=e.sottotitoli;return JSON.stringify([n,r,a,o?.testo??null,s?[s.dimensione,s.fascia,s.alto]:null])}function Vr(e,t,n){let r=[];for(let i of t.split(`
`)){let t=``;for(let a of i.split(/\s+/)){let i=t?t+` `+a:a;e.measureText(i).width>n&&t?(r.push(t),t=a):t=i}t&&r.push(t)}return r.slice(0,4)}function Hr(e,t,n,r,i){e.clearRect(0,0,r,i);let a=Oe(t),o=a.logo?ne(a.logo.media)?.image:void 0;if(a.logo&&o){let t=r*Math.max(.03,Math.min(.5,a.logo.scala)),n=t*(o.height/Math.max(1,o.width)),s=Math.round(Math.min(r,i)*.04),c=a.logo.pos.endsWith(`dx`)?r-s-t:s,l=a.logo.pos.startsWith(`alto`)?s:i-s-n;e.globalAlpha=Math.max(0,Math.min(1,a.logo.opacita)),e.drawImage(o,c,l,t,n),e.globalAlpha=1}let s=zr(t,n),c=t.sottotitoli;if(s&&c){let t=Math.max(10,(c.dimensione||46)*(i/1080));e.font=`700 ${t}px "Rajdhani", "Segoe UI", system-ui, sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.lineJoin=`round`;let n=Vr(e,s.testo,r*.84),a=t*1.22,o=n.length*a,l=c.alto?i*.07+a/2:i*.93-o+a/2;if(c.fascia){let i=Math.max(...n.map(t=>e.measureText(t).width)),s=t*.35;e.fillStyle=`rgba(0,0,0,.58)`,e.beginPath(),e.roundRect(r/2-i/2-s,l-a/2-s*.5,i+s*2,o+s,t*.2),e.fill()}n.forEach((n,i)=>{let o=l+i*a;e.lineWidth=t*.14,e.strokeStyle=`rgba(0,0,0,.85)`,e.strokeText(n,r/2,o),e.fillStyle=`#ffffff`,e.fillText(n,r/2,o)})}}var Ur=e=>Math.max(0,Math.min(1,e)),Wr=(e,t,n)=>e+(t-e)*n,V={lineare:(e=>e),p2in:(e=>e*e),p2out:(e=>1-(1-e)*(1-e)),p2io:(e=>e<.5?2*e*e:1-(-2*e+2)**2/2),p3in:(e=>e*e*e),p3out:(e=>1-(1-e)**3),p3io:(e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2),p4out:(e=>1-(1-e)**4),p4io:(e=>e<.5?8*e*e*e*e:1-(-2*e+2)**4/2),back:(e=1.7)=>t=>1+(e+1)*(t-1)**3+e*(t-1)**2,elastica:(e=>e===0||e===1?e:2**(-10*e)*Math.sin((e*10-.75)*(2*Math.PI/3))+1),rimbalzo:(e=>{let t=7.5625,n=2.75;return e<1/n?t*e*e:e<2/n?(e-=1.5/n,t*e*e+.75):e<2.5/n?(e-=2.25/n,t*e*e+.9375):(e-=2.625/n,t*e*e+.984375)}),expo:(e=>e===1?1:1-2**(-10*e)),seno:(e=>-(Math.cos(Math.PI*e)-1)/2)},H=(e,t,n,r=V.p3out)=>r(Ur((e-t)/Math.max(1e-6,n))),U=(e,t=.4,n=V.p2in)=>1-n(Ur((e.t-(e.d-t))/Math.max(1e-6,t))),W=(e,t=0)=>{let n=Math.sin(e*127.1+t*311.7+17.3)*43758.5453;return n-Math.floor(n)},Gr=e=>{let t=/^#?([0-9a-f]{6})/i.exec(e||``);if(!t)return[255,255,255];let n=parseInt(t[1],16);return[n>>16&255,n>>8&255,n&255]},G=(e,t)=>{let[n,r,i]=Gr(e);return`rgba(${n},${r},${i},${Ur(t)})`},Kr=(e,t,n)=>{let r=Gr(e),i=Gr(t);return`rgb(${r.map((e,t)=>Math.round(Wr(e,i[t],n))).join(`,`)})`},qr=(e,t=.35)=>Kr(e,`#000000`,t),Jr=(e,t=.35)=>Kr(e,`#ffffff`,t),Yr=e=>{let[t,n,r]=Gr(e);return .299*t+.587*n+.114*r>150?`#141518`:`#ffffff`},K={montserrat:`"Montserrat", "Segoe UI", system-ui, sans-serif`,oswald:`"Oswald", "Arial Narrow", sans-serif`,archivo:`"Archivo Black", "Arial Black", sans-serif`,mono:`"Space Mono", "Courier New", monospace`,bebas:`"Bebas Neue", "Oswald", Impact, sans-serif`,playfair:`"Playfair Display", Georgia, serif`,vibes:`"Great Vibes", "Brush Script MT", cursive`,cormorant:`"Cormorant Garamond", Georgia, serif`,caveat:`"Caveat", "Segoe Print", cursive`,rajdhani:`"Rajdhani", "Segoe UI", sans-serif`,orbitron:`"Orbitron", "Rajdhani", sans-serif`},Xr=(e,t=`font`,n=`montserrat`)=>K[e[t]in K?e[t]:n];function q(e,t,n,r=0){return e.font=n,e.measureText(t).width+r*Math.max(0,[...t].length-1)}function J(e,t,n,r,i){let a=i.maiuscolo?t.toUpperCase():t;e.save(),e.font=i.font,e.textBaseline=i.base??`alphabetic`,e.globalAlpha*=i.alfa??1,i.ombra&&(e.shadowBlur=i.ombra.blur,e.shadowColor=i.ombra.colore??`rgba(0,0,0,.45)`,e.shadowOffsetY=i.ombra.y??2);let o=q(e,a,i.font,i.spazio??0),s=n,c=i.align??`left`;if(c===`center`?s=n-o/2:c===`right`&&(s=n-o),e.textAlign=`left`,e.fillStyle=i.colore??`#fff`,i.contorno&&(e.lineWidth=i.contorno.px,e.strokeStyle=i.contorno.colore,e.lineJoin=`round`),!i.spazio)i.contorno&&e.strokeText(a,s,r),e.fillText(a,s,r);else{let t=s;for(let n of a)i.contorno&&e.strokeText(n,t,r),e.fillText(n,t,r),t+=e.measureText(n).width+i.spazio}return e.restore(),o}function Zr(e,t,n,r,i,a=0){let o=q(e,t,n(r),a);return o>i?Math.max(14,i/o*r):r}function Qr(e,t,n,r,i=0){let a=[];for(let o of t.split(`
`)){let t=``;for(let s of o.split(/\s+/).filter(Boolean)){let o=t?t+` `+s:s;t&&q(e,o,n,i)>r?(a.push(t),t=s):t=o}a.push(t)}return a}function Y(e,t,n,r,i,a){let o=Math.max(0,Math.min(a,r/2,i/2));e.beginPath(),e.moveTo(t+o,n),e.arcTo(t+r,n,t+r,n+i,o),e.arcTo(t+r,n+i,t,n+i,o),e.arcTo(t,n+i,t,n,o),e.arcTo(t,n,t+r,n,o),e.closePath()}function $r(e,t,n=120){let r=String(e.v.pos??`sinistra`);return r===`centro`?(e.w-t)/2:r===`destra`?e.w-n-t:n}var X=(e,t,n=``)=>{let r=String(e.v[t]??n);return r.trim()?r:n},ei=(e,t,n=0)=>{let r=Number(e.v[t]);return Number.isFinite(r)?r:n},Z=(e,t,n=`#ffffff`)=>{let r=String(e.v[t]??n);return/^#[0-9a-f]{6}/i.test(r)?r:n};function ti(e,t,n,r,i=5,a=.45,o=-Math.PI/2){e.beginPath();for(let s=0;s<i*2;s++){let c=o+s*Math.PI/i,l=s%2?r*a:r;s?e.lineTo(t+Math.cos(c)*l,n+Math.sin(c)*l):e.moveTo(t+Math.cos(c)*l,n+Math.sin(c)*l)}e.closePath()}function ni(e,t,n,r){e.beginPath(),e.moveTo(t,n+r*.35),e.bezierCurveTo(t-r*.75,n-r*.05,t-r*.5,n-r*.62,t,n-r*.25),e.bezierCurveTo(t+r*.5,n-r*.62,t+r*.75,n-r*.05,t,n+r*.35),e.closePath()}function ri(e,t,n,r,i,a){if(a<.4){J(e,t,n,r,i);return}let o=e.getTransform().a||1,s=2e4;e.save(),e.shadowColor=i.colore??`#fff`,e.shadowBlur=a*o,e.shadowOffsetX=s,e.shadowOffsetY=0,J(e,t,n-s/o,r,{...i,ombra:void 0,colore:i.colore??`#fff`}),e.restore()}var ii=e=>Math.round(e).toLocaleString(`it-IT`),ai=112;function oi(e){return{k:ei(e,`dim`,100)/100,nome:X(e,`nome`,`Nome Cognome`),ruolo:X(e,`ruolo`,``),colore:Z(e,`colore`,`#ff5a36`)}}var Q=(e,t=.45,n=V.p3in)=>H(e.t,e.d-t,t,n);function si(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`700 ${52*n}px ${K.montserrat}`,s=`400 ${27*n}px ${K.montserrat}`,c=q(t,r,o),l=i?q(t,i,s):0,u=12*n,d=30*n,f=40*n,p=22*n,m=52*n*1.06,h=i?27*n*1.2:0,g=i?7*n:0,_=u+d+Math.max(c,l)+f,v=p+m+g+h+24*n,y=$r(e,_),b=e.h-ai-v;t.save();let x=H(e.t,.1,.55,V.p4out),S=Q(e);t.beginPath(),t.rect(y-40+(_+80)*S,b-40,(_+80)*(x-S)+.01,v+80),t.clip(),t.shadowColor=`rgba(15,17,21,.22)`,t.shadowBlur=44*n,t.shadowOffsetY=14*n,Y(t,y,b,_,v,16*n),t.fillStyle=`#ffffff`,t.fill(),t.shadowColor=`transparent`,t.save(),Y(t,y,b,_,v,16*n),t.clip(),t.fillStyle=a,t.fillRect(y,b,u,v),t.restore();let C=H(e.t,.3,.4,V.p2out)*(1-S);J(t,r,y+u+d,b+p,{font:o,colore:`#0f1115`,base:`top`,alfa:C}),i&&J(t,i,y+u+d,b+p+m+g,{font:s,colore:`#5a6170`,base:`top`,alfa:C}),t.restore()}function ci(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`700 ${76*n}px ${K.oswald}`,s=`400 ${28*n}px ${K.mono}`,c=r.toUpperCase(),l=q(t,c,o,.4*n),u=i?q(t,i,s,1.1*n):0,d=Math.max(l,u),f=$r(e,d,130),p=76*n*.96,m=28*n*1.2,h=e.h-120-(p+14*n+6*n+(i?14*n+m:0)),g=H(e.t,.1,.55,V.p3out),_=H(e.t,.46,.5,V.p3out),v=H(e.t,.3,.5,V.p4out),y=Q(e,.32,V.p2in),b=Q(e,.3,V.p2in),x=Q(e,.3,V.p2in);J(e.c,c,f,h-16*n*y+28*n*(1-g),{font:o,colore:`#fff`,base:`top`,spazio:.4*n,alfa:g*(1-y),ombra:{blur:22,colore:`rgba(0,0,0,.45)`}});let S=h+p+14*n;t.fillStyle=a,Y(t,f,S,Math.max(0,d*v*(1-x)),6*n,3*n),t.fill(),i&&J(t,i,f,S+6*n+14*n+16*n*(1-_),{font:s,colore:`#e7eaf0`,base:`top`,spazio:1.1*n,alfa:_*(1-b),ombra:{blur:16,colore:`rgba(0,0,0,.45)`}})}function li(e){let{c:t}=e,{k:n,nome:r,colore:i}=oi(e),a=X(e,`etichetta`,`Ospite`),o=`400 ${58*n}px ${K.archivo}`,s=`700 ${24*n}px ${K.mono}`,c=r.toUpperCase(),l=a.toUpperCase(),u=q(t,c,o),d=q(t,l,s,1.4*n)+32*n,f=30*n,p=34*n,m=18*n,h=22*n,g=58*n*.98,_=24*n*1.2+14*n,v=12*n,y=f+Math.max(u,d)+p,b=m+g+v+_+h,x=$r(e,y,120),S=e.h-116-b,C=H(e.t,.1,.5,V.p4out),w=Q(e,.4);t.save(),t.beginPath(),t.rect(x-4+(y+8)*w,S-4,(y+8)*(C-w)+.01,b+8),t.clip(),t.fillStyle=`#141518`,t.fillRect(x,S,y,b);let T=H(e.t,.26,.42,V.back(1.6));J(t,c,x+f,S+m+30*n*(1-T),{font:o,colore:`#fff`,base:`top`,alfa:H(e.t,.26,.3,V.p2out)});let E=S+m+g+v;t.save(),t.beginPath(),t.rect(x+f,E,d,_),t.clip();let D=H(e.t,.5,.45,V.back(2));t.fillStyle=i,t.fillRect(x+f,E+40*n*(1-D),d,_),J(t,l,x+f+16*n,E+7*n+40*n*(1-D),{font:s,colore:Yr(i),base:`top`,spazio:1.4*n}),t.restore(),t.restore()}function ui(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`400 ${84*n}px ${K.bebas}`,s=`400 ${24*n}px ${K.mono}`,c=r.toUpperCase(),l=q(t,c,o,.8*n),u=i?q(t,i,s,1.2*n):0,d=32*n,f=36*n,p=20*n,m=24*n,h=84*n*.86,g=i?24*n*1.2:0,_=i?8*n:0,v=d+Math.max(l,u)+f,y=p+h+_+g+m,b=$r(e,v),x=e.h-116-y,S=H(e.t,.1,.5,V.back(1.4)),C=Q(e,.35,V.p2in),w=H(e.t,.1,.25,V.lineare)*(1-C),T=-80*(1-S)-60*C;t.save(),t.translate(T,0),t.globalAlpha=w,t.shadowColor=G(a,.34),t.shadowBlur=44*n,t.shadowOffsetY=16*n,t.fillStyle=a,t.fillRect(b,x,v,y),t.shadowColor=`transparent`;let E=Yr(a);J(t,c,b+d,x+p+24*n*(1-H(e.t,.3,.42,V.p3out)),{font:o,colore:E,base:`top`,spazio:.8*n,alfa:H(e.t,.3,.3,V.p2out)}),i&&J(t,i,b+d,x+p+h+_+18*n*(1-H(e.t,.4,.42,V.p3out)),{font:s,colore:E===`#ffffff`?`rgba(255,255,255,.86)`:`rgba(20,21,24,.8)`,base:`top`,spazio:1.2*n,alfa:H(e.t,.4,.3,V.p2out)}),t.restore()}function di(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`700 ${48*n}px ${K.montserrat}`,s=`400 ${25*n}px ${K.montserrat}`,c=q(t,r,o),l=i?q(t,i,s,.5*n):0,u=32*n,d=38*n,f=24*n,p=26*n,m=48*n*1.02,h=i?25*n*1.2:0,g=12*n,_=u+Math.max(c,l)+d,v=f+m+g+4*n+(i?g+h:0)+p,y=$r(e,_,120),b=e.h-110-v,x=H(e.t,.1,.5,V.p3out),S=Q(e,.35,V.p2in);t.save(),t.translate(0,60*(1-x)+24*S),t.globalAlpha=x*(1-S),t.shadowColor=`rgba(0,0,0,.4)`,t.shadowBlur=50*n,t.shadowOffsetY=18*n,Y(t,y,b,_,v,14*n),t.fillStyle=`#16181d`,t.fill(),t.shadowColor=`transparent`,J(t,r,y+u,b+f+14*(1-H(e.t,.26,.45,V.p3out)),{font:o,colore:`#fff`,base:`top`,alfa:H(e.t,.26,.3,V.p2out)});let C=b+f+m+g;t.fillStyle=a,Y(t,y+u,C,(_-u-d)*H(e.t,.42,.5,V.p4out),4*n,2*n),t.fill(),i&&J(t,i,y+u,C+4*n+g,{font:s,colore:`#aeb6c2`,base:`top`,spazio:.5*n,alfa:H(e.t,.56,.45,V.p2out)}),t.restore()}function fi(e){let{c:t}=e,{k:n,nome:r,colore:i}=oi(e),a=X(e,`etichetta`,`In studio`).toUpperCase(),o=`700 ${22*n}px ${K.mono}`,s=`400 ${70*n}px ${K.archivo}`,c=r.toUpperCase(),l=q(t,a,o,2.2*n)+28*n,u=22*n*1.2+12*n,d=q(t,c,s,-1*n),f=Math.max(l,d),p=70*n*.98,m=$r(e,f,130),h=e.h-122-5*n,g=h-14*n-p,_=g-14*n-u,v=H(e.t,.1,.42,V.back(2)),y=H(e.t,.32,.45,V.back(1.5)),b=H(e.t,.5,.5,V.p4out),x=Q(e,.3,V.p2in),S=Q(e,.32,V.p2in),C=Q(e,.3,V.p2in);t.save(),t.beginPath(),t.rect(m-4,_-4,l+8,u+8),t.clip(),t.fillStyle=i,t.fillRect(m,_-40*n*(1-v)-40*n*x,l,u),J(t,a,m+14*n,_+6*n-40*n*(1-v)-40*n*x,{font:o,colore:Yr(i),base:`top`,spazio:2.2*n}),t.restore(),J(t,c,m,g+34*n*(1-y)-16*n*S,{font:s,colore:`#fff`,base:`top`,spazio:-1*n,alfa:Math.min(1,y*1.4)*(1-S),ombra:{blur:22,colore:`rgba(0,0,0,.5)`}}),t.fillStyle=i,Y(t,m,h,f*b*(1-C),5*n,3*n),t.fill()}function pi(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`900 ${72*n}px ${K.montserrat}`,s=`500 ${28*n}px ${K.montserrat}`,c=q(t,r,o,-1.4*n),l=i?q(t,i,s,.5*n):0,u=$r(e,Math.max(c,l),130),d=72*n*1.06,f=28*n*1.2,p=e.h-122-(d+(i?14*n+f:0)),m=H(e.t,.16,.5,V.p2io),h=H(e.t,.12,.55,V.p2io),g=Q(e,.4,V.p2in);t.save(),t.beginPath(),t.rect(u-6+(c+12)*g,p-4,(c+12)*(m-g)+.01,d+8),t.clip(),J(t,r,u,p,{font:o,colore:`#fff`,base:`top`,spazio:-1.4*n,ombra:{blur:22,colore:`rgba(0,0,0,.45)`}}),t.restore();let _=u+c*h,v=(1-H(e.t,.6,.15,V.lineare))*H(e.t,.1,.12,V.lineare);v>.01&&g===0&&(t.fillStyle=G(a,v),t.fillRect(_,p-2,8*n,d+4)),i&&J(t,i,u,p+d+14*n+14*n*(1-H(e.t,.55,.5,V.p3out)),{font:s,colore:`#e7eaf0`,base:`top`,spazio:.5*n,alfa:H(e.t,.55,.4,V.p2out)*(1-Q(e,.3,V.p2in)),ombra:{blur:16,colore:`rgba(0,0,0,.45)`}})}function mi(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`700 ${46*n}px ${K.montserrat}`,s=`500 ${25*n}px ${K.montserrat}`,c=q(t,r,o),l=i?q(t,i,s,.8*n):0,u=38*n,d=26*n,f=46*n*1.05,p=i?25*n*1.2:0,m=i?8*n:0,h=u*2+Math.max(c,l),g=d*2+f+m+p,_=$r(e,h,120),v=e.h-120-g,y=Q(e,.36,V.p2in),b=H(e.t,.08,.55,V.p3out),x=H(e.t,.08,.8,V.p3io);t.save(),t.globalAlpha=b*(1-y),t.translate(_,v+g),t.scale(.965+.035*b,.965+.035*b),t.translate(-_,-(v+g)),Y(t,_,v,h,g,18*n),t.fillStyle=`rgba(8,10,20,.72)`,t.fill();let S=2*(h+g);t.setLineDash([S*x,S]),t.lineDashOffset=0,t.lineWidth=3*n,t.strokeStyle=a,t.shadowColor=a,t.shadowBlur=26*n,Y(t,_,v,h,g,18*n),t.stroke(),t.stroke(),t.setLineDash([]),t.shadowColor=`transparent`,J(t,r,_+u,v+d+18*(1-H(e.t,.3,.5,V.p3out)),{font:o,colore:`#fff`,base:`top`,alfa:H(e.t,.3,.35,V.p2out)}),i&&J(t,i,_+u,v+d+f+m+12*(1-H(e.t,.44,.5,V.p3out)),{font:s,colore:Jr(a,.2),base:`top`,spazio:.8*n,alfa:H(e.t,.44,.35,V.p2out),ombra:{blur:14*n,colore:G(a,.8),y:0}}),t.restore()}function hi(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`400 ${92*n}px ${K.bebas}`,s=`400 ${26*n}px ${K.mono}`,c=r.toUpperCase(),l=q(t,c,o,.9*n),u=i?q(t,i,s,1*n):0,d=92*n*.86,f=i?26*n*1.2:0,p=i?12*n:0,m=d+p+f,h=$r(e,8*n+26*n+Math.max(l,u),130),g=e.h-120-m,_=H(e.t,.1,.5,V.p3out),v=Q(e,.32,V.p2in);t.fillStyle=a,Y(t,h,g,8*n,m*_*(1-v),4*n),t.fill();let y=H(e.t,.26,.5,V.p3out),b=H(e.t,.38,.5,V.p3out);J(t,c,h+34*n-24*(1-y),g-4*n-14*Q(e,.32,V.p2in),{font:o,colore:`#fff`,base:`top`,spazio:.9*n,alfa:y*(1-Q(e,.32,V.p2in)),ombra:{blur:22,colore:`rgba(0,0,0,.5)`}}),i&&J(t,i,h+34*n-24*(1-b),g+d+p,{font:s,colore:`#e7eaf0`,base:`top`,spazio:1*n,alfa:b*(1-Q(e,.3,V.p2in)),ombra:{blur:16,colore:`rgba(0,0,0,.5)`}})}function gi(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`700 ${46*n}px ${K.montserrat}`,s=`400 ${25*n}px ${K.montserrat}`,c=q(t,r,o),l=i?q(t,i,s):0,u=46*n*1.04,d=i?25*n*1.2:0,f=i?4*n:0,p=26*n,m=40*n,h=20*n,g=18*n,_=22*n,v=p+g+_+Math.max(c,l)+m,y=h*2+u+f+d,b=$r(e,v),x=e.h-120-y,S=H(e.t,.1,.55,V.back(1.7)),C=Q(e,.35,V.p2in);t.save();let w=(.88+.12*S)*(1-.06*C);t.translate(b,x+y),t.scale(w,w),t.translate(-b,-(x+y)),t.globalAlpha=Math.min(1,S*1.5)*(1-C),t.translate(0,18*(1-S)+14*C),t.shadowColor=`rgba(15,17,21,.24)`,t.shadowBlur=46*n,t.shadowOffsetY=16*n,Y(t,b,x,v,y,y/2),t.fillStyle=`#fff`,t.fill(),t.shadowColor=`transparent`;let T=H(e.t,.4,.4,V.back(3));t.fillStyle=a,t.beginPath(),t.arc(b+p+g/2,x+y/2,g/2*T,0,Math.PI*2),t.fill();let E=b+p+g+_;J(t,r,E-10*(1-H(e.t,.42,.45,V.p3out)),x+h,{font:o,colore:`#0f1115`,base:`top`,alfa:H(e.t,.42,.3,V.p2out)}),i&&J(t,i,E-10*(1-H(e.t,.5,.45,V.p3out)),x+h+u+f,{font:s,colore:`#5a6170`,base:`top`,alfa:H(e.t,.5,.3,V.p2out)}),t.restore()}function _i(e){let{c:t}=e,{k:n,nome:r,ruolo:i,colore:a}=oi(e),o=`400 ${52*n}px ${K.archivo}`,s=`700 ${23*n}px ${K.mono}`,c=r.toUpperCase(),l=i.toUpperCase(),u=q(t,c,o,-.8*n)+60*n,d=i?q(t,l,s,1.4*n)+44*n:0,f=52*n+28*n,p=23*n+18*n,m=8*n,h=14*n,g=$r(e,Math.max(u,d+h),120),_=e.h-116-(f+(i?m+p:0)),v=H(e.t,.1,.5,V.p4out),y=H(e.t,.34,.5,V.p4out),b=Q(e,.36,V.p3in),x=Q(e,.32,V.p3in);if(t.save(),t.beginPath(),t.rect(g+u*b,_-2,u*(v-b)+.01,f+4),t.clip(),t.fillStyle=`#141518`,t.fillRect(g,_,u,f),J(t,c,g+30*n,_+14*n,{font:o,colore:`#fff`,base:`top`,spazio:-.8*n}),t.restore(),i){let e=g+h;t.save(),t.beginPath(),t.rect(e+d*(1-y),_+f+m-2,d*(y-x)+.01,p+4),t.clip(),t.fillStyle=a,t.fillRect(e,_+f+m,d,p),J(t,l,e+22*n,_+f+m+9*n,{font:s,colore:Yr(a),base:`top`,spazio:1.4*n}),t.restore()}}var vi={"lt-barra":si,"lt-sottolinea":ci,"lt-blocco":li,"lt-colore":ui,"lt-scheda":di,"lt-kicker":fi,"lt-maschera":pi,"lt-neon":mi,"lt-linea":hi,"lt-pillola":gi,"lt-barre":_i},yi=(e,t)=>t*(ei(e,`dim`,100)/100);function bi(e){let{c:t}=e,n=X(e,`testo`,`Un giorno speciale`),r=yi(e,100),i=`700 ${r}px ${Xr(e.v,`font`)}`,a=e.v.unita===`lettera`,o=Qr(t,n,i,e.w*.82),s=r*1.18,c=(e.h-o.length*s)/2,l=[];o.forEach((n,r)=>{let o=a?[...n]:n.split(` `),u=q(t,` `,i),d=a?q(t,n,i):o.reduce((e,n)=>e+q(t,n,i),0)+u*(o.length-1),f=(e.w-d)/2;for(let e of o)l.push({s:e,x:f,y:c+r*s}),f+=q(t,e,i)+(a?0:u)});let u=l.length,d=Math.min(.16,1.9/Math.max(1,u)),f=U(e,.45);l.forEach((n,r)=>{let a=H(e.t,.2+r*d,.7,V.p3out);if(a<=0)return;let o=n.y+46*(1-a)-20*(1-f);ri(t,n.s,n.x,o,{font:i,colore:Z(e,`colore`,`#ffffff`),base:`top`,alfa:Math.min(1,a*1.6)*f,ombra:{blur:24,colore:`rgba(0,0,0,.45)`}},16*(1-a))})}var xi=`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$<>/\\=+*`;function Si(e){let{c:t}=e,n=X(e,`testo`,`DA PROD VIDEO`),r=Z(e,`colore`,`#46e5b7`),i=e.v.stile!==`pulito`,a=e=>`700 ${e}px "Space Mono", "Courier New", monospace`,o=Zr(e.c,(i?`> `:``)+n,a,yi(e,120),e.w*.8),s=a(o),c=i?`> `:``,l=q(t,c+n,s),u=(e.w-l)/2,d=e.h/2+o*.34,f=U(e,.4);t.save(),t.globalAlpha=f,i&&(Y(t,u-60,d-o*.86-46,l+120,o+92,18),t.fillStyle=`rgba(6,10,14,.82)`,t.fill(),t.lineWidth=3,t.strokeStyle=G(r,.85),t.stroke());let p=.35+n.length*.09+.6,m=Ur((e.t-.35)/Math.max(.1,p-.35-.6))*n.length,h=q(t,c,s);J(t,c,u,d,{font:s,colore:G(r,.7)});let g=u+h;[...n].forEach((n,i)=>{let a=q(t,n,s),o=n,c=i<Math.floor(m)||n===` `;c||(o=xi[Math.floor(W(i,Math.floor(e.t*24))*48)]);let l=i===Math.floor(m);J(t,o,g,d,{font:s,colore:c?Jr(r,.55):r,alfa:c?1:e.t<.35?0:.55+(l?.45:0),ombra:{blur:c?0:18,colore:r,y:0}}),g+=a}),(Math.floor(e.t*2.4)%2==0||m<n.length)&&(t.fillStyle=r,t.fillRect(g+6,d-o*.78,o*.5,o*.9)),t.restore()}function Ci(e){let{c:t}=e,n=X(e,`prima`,``),r=X(e,`dopo`,``),i=String(e.v.opzioni??``).split(`,`).map(e=>e.trim()).filter(Boolean);i.length||i.push(`…`);let a=Xr(e.v,`font`),o=Zr(t,[n,...i,r].filter(Boolean).join(` `),e=>`700 ${e}px ${a}`,yi(e,100),e.w*.84),s=`700 ${o}px ${a}`,c=Z(e,`colore`,`#ffd23f`),l=q(t,` `,s),u=Math.max(...i.map(e=>q(t,e,s))),d=n?q(t,n,s)+l:0,f=r?l+q(t,r,s):0,p=d+u+f,m=(e.w-p)/2,h=e.h/2+o*.34,g=o*1.25,_=U(e,.4),v=Math.max(.55,Math.min(.9,3.2/i.length));t.save(),t.globalAlpha=_;let y=H(e.t,.1,.6,V.p3out);t.globalAlpha*=y,n&&J(t,n,m,h,{font:s,colore:`#fff`,ombra:{blur:22,colore:`rgba(0,0,0,.45)`}}),r&&J(t,r,m+d+u+l,h,{font:s,colore:`#fff`,ombra:{blur:22,colore:`rgba(0,0,0,.45)`}}),t.save(),t.beginPath(),t.rect(m+d-20,h-o*1,u+40,g),t.clip();let b=(e.t-.7)/v,x=Math.max(0,Math.min(i.length-1,Math.floor(b))),S=b<0?0:x>=i.length-1?1:H(b-x,0,.5,V.p3io)*1,C=b<0?0:x,w=Math.min(i.length-1,C+1),T=b<0||C>=i.length-1?0:S,E=m+d;J(t,i[C],E,h-g*T,{font:s,colore:c,alfa:1-T*.6,ombra:{blur:22,colore:`rgba(0,0,0,.4)`}}),C!==w&&J(t,i[w],E,h+g*(1-T),{font:s,colore:c,alfa:.4+T*.6,ombra:{blur:22,colore:`rgba(0,0,0,.4)`}}),t.restore(),t.restore()}function wi(e){let{c:t}=e,n=X(e,`testo`,`È ARRIVATO IL MOMENTO`),r=yi(e,150),i=`900 ${r}px ${Xr(e.v,`font`,`archivo`)}`,a=n.split(/\s+/).filter(Boolean),o=r*1.1,s=q(t,` `,i),c=e.w*.86,l=[[]],u=0;a.forEach((e,n)=>{let r=q(t,e,i);u&&u+s+r>c&&(l.push([]),u=0),l[l.length-1].push({s:e,w:r,i:n}),u+=(u?s:0)+r});let d=(e.h-l.length*o)/2,f=U(e,.4);l.forEach((n,r)=>{let c=n.reduce((e,t)=>e+t.w,0)+s*(n.length-1),l=(e.w-c)/2;n.forEach(n=>{let c=.15+n.i*.32,u=H(e.t,c,.2,V.p4out);if(u>0){let s=n.i===a.length-1,p=e.t-c,m=Wr(2.6,1,u),h=p>.08?Math.sin(p*60)*Math.exp(-p*12)*10:0;t.save(),t.translate(l+n.w/2+h,d+r*o+o*.5),t.rotate((W(n.i,3)-.5)*.06*(1-u)),t.scale(m,m),J(t,n.s,-n.w/2,0,{font:i,colore:s?Z(e,`evidenzia`,`#ffd23f`):Z(e,`colore`,`#fff`),base:`middle`,alfa:Math.min(1,u*3)*f,ombra:{blur:26,colore:`rgba(0,0,0,.6)`,y:6},contorno:{colore:`rgba(0,0,0,.55)`,px:8}}),t.restore()}l+=n.w+s})})}function Ti(e){let{c:t}=e,n=X(e,`testo`,`La cosa più importante è esserci`),r=X(e,`parola`,``),i=yi(e,92),a=`700 ${i}px ${Xr(e.v,`font`)}`,o=Qr(t,n,a,e.w*.82),s=i*1.3,c=(e.h-o.length*s)/2,l=U(e,.4),u=H(e.t,.1,.6,V.p3out),d=Z(e,`pennarello`,`#ffd23f`),f=Z(e,`colore`,`#ffffff`),p=Yr(d);o.forEach((n,i)=>{let o=q(t,n,a),m=(e.w-o)/2,h=c+i*s+14*(1-u),g=r?n.toLowerCase().indexOf(r.toLowerCase()):-1;t.save(),t.globalAlpha=l;let _={font:a,base:`top`,alfa:u,ombra:{blur:20,colore:`rgba(0,0,0,.4)`}};if(g<0){J(t,n,m,h,{..._,colore:f}),t.restore();return}let v=m+q(t,n.slice(0,g),a),y=q(t,n.slice(g,g+r.length),a),b=H(e.t,.9,.6,V.p3io);t.save(),t.beginPath(),t.rect(v-24,h-10,(y+48)*b,s),t.clip(),t.fillStyle=G(d,.92),t.beginPath(),t.moveTo(v-14,h+s*.1),t.lineTo(v+y+10,h+s*.05),t.lineTo(v+y+16,h+s*.82),t.lineTo(v-8,h+s*.86),t.closePath(),t.fill(),t.restore(),J(t,n,m,h,{..._,colore:f}),t.save(),t.beginPath(),t.rect(v-24,h-10,(y+24)*b,s),t.clip(),J(t,n.slice(g,g+r.length),v,h,{font:a,base:`top`,colore:p,alfa:u}),t.restore(),t.restore()})}function Ei(e){let{c:t}=e,n=X(e,`titolo`,`Una storia lunga un giorno`),r=X(e,`sottotitolo`,``),i=yi(e,120),a=`700 ${i}px ${Xr(e.v,`font`,`playfair`)}`,o=`500 ${i*.34}px "Montserrat", sans-serif`,s=Qr(t,n,a,e.w*.8),c=i*1.12,l=s.length*c,u=e.h/2-l/2-(r?i*.3:0),d=U(e,.45);s.forEach((n,r)=>{let i=H(e.t,.15+r*.12,.8,V.p4out),o=q(t,n,a),s=(e.w-o)/2,l=u+r*c;t.save(),t.beginPath(),t.rect(s-20,l,o+40,c),t.clip(),J(t,n,s,l+c*.9*(1-i)+(1-d)*-20,{font:a,colore:Z(e,`colore`,`#fff`),base:`top`,alfa:d,ombra:{blur:24,colore:`rgba(0,0,0,.5)`}}),t.restore()});let f=u+l+i*.16,p=Math.min(e.w*.5,620)*H(e.t,.7,.8,V.p4out);t.fillStyle=G(Z(e,`accento`,`#ffd23f`),d),t.fillRect(e.w/2-p/2,f,p,5),r&&J(t,r.toUpperCase(),e.w/2,f+34+18*(1-H(e.t,1.1,.7,V.p3out)),{font:o,colore:`#fff`,align:`center`,base:`top`,spazio:i*.06,alfa:H(e.t,1.1,.6,V.p2out)*d,ombra:{blur:18,colore:`rgba(0,0,0,.5)`}})}function Di(e){let{c:t}=e,n=X(e,`testo`,`Grazie di cuore`),r=Xr(e.v,`font`,`caveat`),i=Zr(t,n,e=>`700 ${e}px ${r}`,yi(e,190),e.w*.8),a=`700 ${i}px ${r}`,o=q(t,n,a),s=(e.w-o)/2,c=e.h/2+i*.2,l=U(e,.45),u=H(e.t,.25,Math.min(2.4,.5+n.length*.11),V.p2io);t.save(),t.globalAlpha=l,t.beginPath(),t.rect(s-30,c-i*1.2,(o+60)*u,i*1.9),t.clip(),J(t,n,s,c,{font:a,colore:Z(e,`colore`,`#fff`),ombra:{blur:22,colore:`rgba(0,0,0,.5)`}}),t.restore();let d=H(e.t,.25+Math.min(2.4,.5+n.length*.11),.7,V.p3out);if(d>0){t.save(),t.globalAlpha=l,t.strokeStyle=Z(e,`accento`,`#ff4d6d`),t.lineWidth=Math.max(5,i*.04),t.lineCap=`round`;let n=c+i*.2,r=o*1.1;t.setLineDash([r*d,r]),t.beginPath(),t.moveTo(s,n+6),t.bezierCurveTo(s+o*.25,n-14,s+o*.55,n+20,s+o,n-4),t.stroke(),t.restore()}}var Oi={"tx-parole":bi,"tx-decodifica":Si,"tx-cambia":Ci,"tx-colpo":wi,"tx-penna":Ti,"tx-titolo":Ei,"tx-scrivi":Di},ki=(e,t)=>t*(ei(e,`dim`,100)/100);function Ai(e){let{c:t}=e,n=ei(e,`valore`,1250),r=String(e.v.prefisso??``),i=String(e.v.suffisso??``),a=Z(e,`colore`,`#ffd23f`),o=Xr(e.v,`font`),s=Zr(t,r+ii(n)+i,e=>`700 ${e}px ${o}`,ki(e,240),e.w*.8),c=`700 ${s}px ${o}`,l=`700 ${s*.5}px ${o}`,u=ii(n*H(e.t,.3,2.2,V.p3out)),d=r?q(t,r,l)+8:0,f=i?q(t,i,l)+8:0,p=q(t,u,c),m=e.t-2.5,h=m>0?1+.07*Math.exp(-m*7)*Math.cos(m*14):1,g=U(e,.45),_=H(e.t,.05,.4,V.p3out),v=d+p+f;t.save(),t.globalAlpha=g*_,t.translate(e.w/2,e.h/2-s*.08),t.scale(h,h);let y=-v/2,b=s*.34;r&&J(t,r,y,b-s*.02,{font:l,colore:Jr(a,.2),ombra:{blur:24,colore:`rgba(0,0,0,.45)`}}),J(t,u,y+d,b,{font:c,colore:a,ombra:{blur:30,colore:`rgba(0,0,0,.5)`,y:4}}),i&&J(t,i,y+d+p+8,b-s*.02,{font:l,colore:Jr(a,.2),ombra:{blur:24,colore:`rgba(0,0,0,.45)`}}),t.restore();let x=X(e,`etichetta`,``);x&&J(t,x.toUpperCase(),e.w/2,e.h/2+s*.38+10*(1-H(e.t,.6,.5,V.p3out)),{font:`500 ${s*.16}px "Montserrat", sans-serif`,colore:`#fff`,align:`center`,base:`top`,spazio:s*.025,alfa:H(e.t,.6,.5,V.p2out)*g*.9,ombra:{blur:16,colore:`rgba(0,0,0,.5)`}})}function ji(e){let{c:t}=e,n=Math.max(0,Math.min(100,ei(e,`percento`,75))),r=Z(e,`colore`,`#46e5b7`),i=ki(e,210),a=i*.16,o=Xr(e.v,`font`),s=H(e.t,.3,2,V.p3out),c=U(e,.45),l=H(e.t,.05,.5,V.p3out),u=e.w/2,d=e.h/2-i*.05;t.save(),t.globalAlpha=c*l,t.lineWidth=a,t.lineCap=`round`,t.strokeStyle=`rgba(255,255,255,.16)`,t.beginPath(),t.arc(u,d,i,0,Math.PI*2),t.stroke(),t.strokeStyle=r,t.shadowColor=r,t.shadowBlur=30,t.beginPath(),t.arc(u,d,i,-Math.PI/2,-Math.PI/2+Math.PI*2*(n/100)*s),t.stroke(),t.shadowColor=`transparent`,J(t,Math.round(n*s)+`%`,u,d+i*.03,{font:`700 ${i*.62}px ${o}`,colore:`#fff`,align:`center`,base:`middle`,ombra:{blur:24,colore:`rgba(0,0,0,.5)`}});let f=X(e,`etichetta`,``);f&&J(t,f.toUpperCase(),u,d+i*.5,{font:`500 ${i*.14}px "Montserrat", sans-serif`,colore:`rgba(255,255,255,.85)`,align:`center`,base:`middle`,spazio:i*.02}),t.restore()}function Mi(e){let{c:t}=e,n=Z(e,`colore`,`#35e8ff`),r=String(e.v.voci??``).split(`
`).map(e=>{let[t,n]=e.split(`:`);return{n:(t??``).trim(),v:Math.max(0,Number((n??`0`).replace(`,`,`.`))||0)}}).filter(e=>e.n).slice(0,8);if(!r.length)return;let i=Math.max(...r.map(e=>e.v),1),a=ki(e,100),o=Xr(e.v,`font`),s=Math.min(e.w*.7,1300)*(a/100),c=(e.w-s)/2,l=Math.min(96,560/r.length)*(a/100),u=l*.28,d=X(e,`titolo`,``),f=r.length*l+(r.length-1)*u+(d?a*.9:0),p=(e.h-f)/2,m=U(e,.45);t.save(),t.globalAlpha=m,d&&(J(t,d,c,p,{font:`700 ${a*.5}px ${o}`,colore:`#fff`,base:`top`,alfa:H(e.t,.05,.5,V.p2out),ombra:{blur:20,colore:`rgba(0,0,0,.5)`}}),p+=a*.9);let h=`600 ${l*.42}px ${o}`,g=Math.max(...r.map(e=>q(t,e.n,h)))+26;r.forEach((r,a)=>{let d=H(e.t,.4+a*.28,.9,V.p4out),f=p+a*(l+u);J(t,r.n,c,f+l/2,{font:h,colore:`#fff`,base:`middle`,alfa:H(e.t,.3+a*.28,.4,V.p2out),ombra:{blur:14,colore:`rgba(0,0,0,.5)`}});let m=(s-g-130)*(r.v/i)*d;if(Y(t,c+g,f+l*.16,s-g-110,l*.68,l*.34),t.fillStyle=`rgba(255,255,255,.12)`,t.fill(),m>1){Y(t,c+g,f+l*.16,Math.max(l*.68,m),l*.68,l*.34);let e=t.createLinearGradient(c+g,0,c+g+m,0);e.addColorStop(0,G(n,.75)),e.addColorStop(1,n),t.fillStyle=e,t.fill()}J(t,ii(r.v*d),c+s,f+l/2,{font:`700 ${l*.46}px ${o}`,colore:`#fff`,align:`right`,base:`middle`,alfa:Math.min(1,d*2),ombra:{blur:14,colore:`rgba(0,0,0,.5)`}})}),t.restore()}function Ni(e){let{c:t}=e,n=Z(e,`colore`,`#ff4d6d`),r=String(e.v.punti??``).split(`,`).map(e=>Number(e.trim().replace(`,`,`.`))).filter(e=>Number.isFinite(e)).slice(0,24);if(r.length<2)return;let i=ki(e,100),a=Xr(e.v,`font`),o=Math.min(e.w*.7,1400)*(i/100),s=i/100*480,c=(e.w-o)/2,l=(e.h-s)/2+40,u=Math.min(...r,0),d=Math.max(...r),f=e=>c+e/(r.length-1)*o,p=e=>l+s-(e-u)/Math.max(1e-6,d-u)*s,m=U(e,.45);t.save(),t.globalAlpha=m;let h=X(e,`titolo`,``);h&&J(t,h,c,l-64,{font:`700 ${i*.5}px ${a}`,colore:`#fff`,base:`top`,alfa:H(e.t,.05,.5,V.p2out),ombra:{blur:20,colore:`rgba(0,0,0,.5)`}}),t.strokeStyle=`rgba(255,255,255,.14)`,t.lineWidth=2;for(let e=0;e<=4;e++){let n=l+s*e/4;t.beginPath(),t.moveTo(c,n),t.lineTo(c+o,n),t.stroke()}let g=H(e.t,.4,2.4,V.p3io),_=(r.length-1)*g,v=r.map((e,t)=>[f(t),p(e)]);t.save(),t.beginPath(),t.moveTo(v[0][0],v[0][1]);for(let e=1;e<r.length;e++)if(e<=Math.floor(_))t.lineTo(v[e][0],v[e][1]);else if(e-1<=_){let n=_-(e-1);t.lineTo(Wr(v[e-1][0],v[e][0],n),Wr(v[e-1][1],v[e][1],n))}t.lineWidth=8,t.lineJoin=`round`,t.lineCap=`round`,t.strokeStyle=n,t.shadowColor=n,t.shadowBlur=24,t.stroke(),t.restore(),v.forEach(([e,r],i)=>{let a=Ur(_-i+.2);a<=0||(t.beginPath(),t.arc(e,r,12*a,0,Math.PI*2),t.fillStyle=`#fff`,t.fill(),t.lineWidth=6,t.strokeStyle=n,t.stroke())}),t.restore()}function Pi(e){let{c:t}=e,n=Z(e,`colore`,`#ffd23f`),r=Math.max(0,Math.min(100,ei(e,`percento`,68))),i=ki(e,100),a=Xr(e.v,`font`),o=Math.min(e.w*.62,1200)*(i/100),s=i/100*36,c=(e.w-o)/2,l=e.h/2,u=H(e.t,.4,2,V.p3out),d=U(e,.45),f=H(e.t,.05,.5,V.p3out);t.save(),t.globalAlpha=d*f,J(t,X(e,`etichetta`,``),c,l-28,{font:`600 ${i*.42}px ${a}`,colore:`#fff`,base:`bottom`,ombra:{blur:18,colore:`rgba(0,0,0,.5)`}}),J(t,Math.round(r*u)+`%`,c+o,l-28,{font:`700 ${i*.62}px ${a}`,colore:n,align:`right`,base:`bottom`,ombra:{blur:18,colore:`rgba(0,0,0,.5)`}}),Y(t,c,l,o,s,s/2),t.fillStyle=`rgba(255,255,255,.16)`,t.fill();let p=r/100*o*u;if(p>1){Y(t,c,l,Math.max(s,p),s,s/2);let e=t.createLinearGradient(c,0,c+p,0);e.addColorStop(0,Jr(n,0)),e.addColorStop(1,Jr(n,.35)),t.fillStyle=e,t.shadowColor=n,t.shadowBlur=24,t.fill()}t.restore()}var Fi={"dt-contatore":Ai,"dt-anello":ji,"dt-barre":Mi,"dt-linea":Ni,"dt-progresso":Pi},Ii=e=>ei(e,`dim`,100)/100;function Li(e,t,n,r,i=1){e.save(),e.translate(t,n),e.scale(r,r),e.globalAlpha*=i,e.beginPath(),e.moveTo(0,0),e.lineTo(0,34),e.lineTo(8,27),e.lineTo(14,40),e.lineTo(20,37),e.lineTo(14,25),e.lineTo(25,25),e.closePath(),e.fillStyle=`#fff`,e.lineWidth=3,e.strokeStyle=`#000`,e.lineJoin=`round`,e.shadowColor=`rgba(0,0,0,.4)`,e.shadowBlur=8,e.shadowOffsetY=3,e.stroke(),e.fill(),e.restore()}function Ri(e,t,n,r,i,a,o){let s=H(e.t,r,i-r,V.p3io),c=t+360*o,l=n+300*o,u=Ur(1-Math.abs(e.t-a)/.14),d=H(e.t,a+.5,.5,V.p2in);Li(e.c,Wr(c,t,s)+60*o*d,Wr(l,n,s)+50*o*d,o*(1-.1*u),(1-d)*Math.min(1,s*3))}function zi(e){let{c:t}=e,n=Ii(e),r=Z(e,`colore`,`#ff2d6f`),i=X(e,`nome`,`@daprod`),a=X(e,`etichetta`,`Segui`),o=960*n,s=176*n,c=String(e.v.pos??`sinistra`),l=c===`centro`?(e.w-o)/2:c===`destra`?e.w-120-o:120,u=e.h-130-s-(c===`centro`?380:0),d=H(e.t,.1,.6,V.back(1.5)),f=U(e,.45),p=2.05,m=e.t>p,h=Ur(1-Math.abs(e.t-p)/.12);t.save(),t.globalAlpha=Math.min(1,d*1.6)*f,t.translate(l+o/2,u+s/2),t.scale(.9+.1*d,.9+.1*d),t.translate(-(l+o/2),-(u+s/2)),t.shadowColor=`rgba(0,0,0,.5)`,t.shadowBlur=50,t.shadowOffsetY=18,Y(t,l,u,o,s,36*n),t.fillStyle=`#14151b`,t.fill(),t.shadowColor=`transparent`;let g=62*n,_=l+40*n+g,v=u+s/2,y=t.createLinearGradient(_-g,v-g,_+g,v+g);y.addColorStop(0,Jr(r,.2)),y.addColorStop(1,qr(r,.2)),t.beginPath(),t.arc(_,v,g,0,Math.PI*2),t.fillStyle=y,t.fill(),t.lineWidth=5*n,t.strokeStyle=`#14151b`,t.stroke(),J(t,(i.replace(`@`,``)[0]||`D`).toUpperCase(),_,v+2*n,{font:`800 ${68*n}px "Montserrat", sans-serif`,colore:`#fff`,align:`center`,base:`middle`}),J(t,i,_+g+28*n,v-18*n,{font:`700 ${44*n}px "Montserrat", sans-serif`,colore:`#fff`,base:`middle`}),J(t,m?`Ora lo segui`:`Consigliato per te`,_+g+28*n,v+26*n,{font:`500 ${26*n}px "Montserrat", sans-serif`,colore:`#9aa0ad`,base:`middle`});let b=240*n,x=78*n,S=l+o-40*n-b,C=u+(s-x)/2,w=1-.07*h;t.save(),t.translate(S+b/2,C+x/2),t.scale(w,w),t.translate(-b/2,-x/2),Y(t,0,0,b,x,x/2),m?(t.fillStyle=`rgba(255,255,255,.08)`,t.fill(),t.lineWidth=3*n,t.strokeStyle=`rgba(255,255,255,.35)`,t.stroke()):(t.fillStyle=r,t.fill()),J(t,m?`✓ Segui già`:a,b/2,x/2+2*n,{font:`700 ${32*n}px "Montserrat", sans-serif`,colore:m?`#fff`:Yr(r),align:`center`,base:`middle`}),t.restore();let T=H(e.t,p,.7,V.p3out);T>0&&T<1&&(t.beginPath(),t.arc(S+b/2,C+x/2,x*.5+T*120*n,0,Math.PI*2),t.lineWidth=5*n,t.strokeStyle=G(r,1-T),t.stroke()),t.restore(),Ri(e,S+b*.55,C+x*.62,1.1,1.95,p,n)}function Bi(e){let{c:t}=e,n=Ii(e),r=Z(e,`colore`,`#ff0033`),i=X(e,`etichetta`,`ISCRIVITI`),a=460*n,o=112*n,s=String(e.v.pos??`sinistra`),c=a+24*n+o,l=s===`centro`?(e.w-c)/2:s===`destra`?e.w-120-c:120,u=e.h-150-o-(s===`centro`?300:0),d=H(e.t,.1,.6,V.back(1.6)),f=U(e,.45),p=1.9,m=e.t>p,h=Ur(1-Math.abs(e.t-p)/.12);t.save(),t.globalAlpha=Math.min(1,d*1.6)*f,t.translate(l,u+o),t.scale(.85+.15*d,.85+.15*d),t.translate(-l,-(u+o));let g=1-.06*h;t.save(),t.translate(l+a/2,u+o/2),t.scale(g,g),t.translate(-a/2,-o/2),Y(t,0,0,a,o,18*n),t.fillStyle=m?`rgba(60,60,66,.95)`:r,t.shadowColor=`rgba(0,0,0,.45)`,t.shadowBlur=30,t.shadowOffsetY=10,t.fill(),t.shadowColor=`transparent`,J(t,m?`ISCRITTO`:i.toUpperCase(),a/2,o/2+2*n,{font:`800 ${46*n}px "Montserrat", sans-serif`,colore:`#fff`,align:`center`,base:`middle`,spazio:2*n}),t.restore();let _=l+a+24*n+o/2,v=u+o/2;t.beginPath(),t.arc(_,v,o/2,0,Math.PI*2),t.fillStyle=`rgba(60,60,66,.95)`,t.shadowColor=`rgba(0,0,0,.45)`,t.shadowBlur=30,t.shadowOffsetY=10,t.fill(),t.shadowColor=`transparent`;let y=e.t>2.25?Math.sin((e.t-p-.35)*26)*Math.exp(-(e.t-p-.35)*2.4)*.5:0;t.save(),t.translate(_,v-10*n),t.rotate(y),t.fillStyle=m?`#fff`:`rgba(255,255,255,.85)`;let b=22*n;t.beginPath(),t.moveTo(-b,b*.9),t.quadraticCurveTo(-b*.9,-b*.2,-b*.55,-b*.7),t.quadraticCurveTo(0,-b*1.5,b*.55,-b*.7),t.quadraticCurveTo(b*.9,-b*.2,b,b*.9),t.closePath(),t.fill(),t.beginPath(),t.arc(0,b*1.28,b*.32,0,Math.PI),t.fill(),t.restore(),t.restore(),Ri(e,l+a*.6,u+o*.68,1,1.85,p,n)}function Vi(e){let{c:t}=e,n=Ii(e),r=Z(e,`colore`,`#ffd23f`),i=Xr(e.v,`font`),a=X(e,`titolo`,`Grazie per la visione`),o=X(e,`sotto`,``),s=X(e,`bottone`,`Iscriviti`),c=`800 ${112*n}px ${i}`,l=`500 ${42*n}px ${i}`,u=`800 ${40*n}px ${i}`,d=Qr(t,a,c,e.w*.8),f=112*n*1.1,p=d.length*f,m=q(t,s,u,1.2*n)+90*n,h=92*n,g=p+(o?34*n+42*n*1.3:0)+56*n+h,_=(e.h-g)/2,v=U(e,.5);if(d.forEach((n,r)=>{let i=H(e.t,.1+r*.12,.7,V.p3out);J(t,n,e.w/2,_+r*f+40*(1-i),{font:c,colore:`#fff`,align:`center`,base:`top`,alfa:Math.min(1,i*1.5)*v,ombra:{blur:26,colore:`rgba(0,0,0,.5)`}})}),_+=p,o){let r=H(e.t,.6,.6,V.p3out);J(t,o,e.w/2,_+34*n+18*(1-r),{font:l,colore:`rgba(255,255,255,.9)`,align:`center`,base:`top`,alfa:r*v,ombra:{blur:18,colore:`rgba(0,0,0,.5)`}}),_+=34*n+42*n*1.3}_+=56*n;let y=H(e.t,1,.6,V.back(1.8)),b=(e.w-m)/2;t.save(),t.globalAlpha=Math.min(1,y*2)*v,t.translate(e.w/2,_+h/2),t.scale(.7+.3*y,.7+.3*y),t.translate(-e.w/2,-(_+h/2));let x=(e.t-1.4)%1.4/1.4;e.t>1.4&&(Y(t,b-20*x*n*2,_-20*x*n*2,m+40*x*n*2,h+40*x*n*2,h/2+20*x*n*2),t.lineWidth=5*n,t.strokeStyle=G(r,(1-x)*.8),t.stroke()),Y(t,b,_,m,h,h/2),t.fillStyle=r,t.shadowColor=G(r,.55),t.shadowBlur=36,t.shadowOffsetY=8,t.fill(),t.shadowColor=`transparent`,J(t,s,e.w/2,_+h/2+2*n,{font:u,colore:Yr(r),align:`center`,base:`middle`,spazio:1.2*n}),t.restore()}function Hi(e){let{c:t}=e,n=Ii(e),r=Z(e,`colore`,`#1d9bf0`),i=X(e,`nome`,`DaProd Video`),a=X(e,`utente`,`@daprod`),o=X(e,`testo`,``),s=940*n,c=40*n,l=`500 ${40*n}px "Montserrat", sans-serif`,u=Qr(t,o,l,s-c*2),d=u.length*40*n*1.35,f=c+92*n+26*n+d+30*n+2+62*n+c*.6,p=String(e.v.pos??`centro`),m=p===`sinistra`?120:p===`destra`?e.w-120-s:(e.w-s)/2,h=(e.h-f)/2,g=H(e.t,.1,.65,V.back(1.4)),_=U(e,.45);t.save(),t.globalAlpha=Math.min(1,g*1.6)*_,t.translate(m+s/2,h+f/2),t.scale(.9+.1*g,.9+.1*g),t.translate(-(m+s/2),-(h+f/2)),t.shadowColor=`rgba(0,0,0,.45)`,t.shadowBlur=56,t.shadowOffsetY=20,Y(t,m,h,s,f,34*n),t.fillStyle=`#ffffff`,t.fill(),t.shadowColor=`transparent`;let v=h+c+46*n;t.beginPath(),t.arc(m+c+46*n,v,46*n,0,Math.PI*2);let y=t.createLinearGradient(m,h,m+100*n,h+100*n);y.addColorStop(0,Jr(r,.2)),y.addColorStop(1,qr(r,.2)),t.fillStyle=y,t.fill(),J(t,(i[0]||`D`).toUpperCase(),m+c+46*n,v+2*n,{font:`800 ${50*n}px "Montserrat", sans-serif`,colore:`#fff`,align:`center`,base:`middle`});let b=m+c+110*n,x=J(t,i,b,v-16*n,{font:`700 ${38*n}px "Montserrat", sans-serif`,colore:`#0f1419`,base:`middle`});t.beginPath(),t.arc(b+x+26*n,v-16*n,15*n,0,Math.PI*2),t.fillStyle=r,t.fill(),J(t,`✓`,b+x+26*n,v-14*n,{font:`800 ${20*n}px "Montserrat", sans-serif`,colore:`#fff`,align:`center`,base:`middle`}),J(t,a,b,v+26*n,{font:`500 ${30*n}px "Montserrat", sans-serif`,colore:`#667785`,base:`middle`});let S=h+c+92*n+26*n;u.forEach((r,i)=>J(t,r,m+c,S+i*40*n*1.35,{font:l,colore:`#0f1419`,base:`top`,alfa:H(e.t,.45+i*.12,.4,V.p2out)}));let C=S+d+30*n;t.fillStyle=`#eff3f4`,t.fillRect(m+c,C,s-c*2,2);let w=ei(e,`mipiace`,12840),T=Ur((e.t-1.9)/.5),E=e.t>1.9?1+.5*Math.exp(-(e.t-1.9)*9)*Math.cos((e.t-1.9)*16):1,D=C+31*n+20*n;t.save(),t.translate(m+c+22*n,D),t.scale(E,E),t.beginPath();let O=22*n;t.moveTo(0,O*.6),t.bezierCurveTo(-O*1.3,-O*.1,-O*.8,-O*1.1,0,-O*.45),t.bezierCurveTo(O*.8,-O*1.1,O*1.3,-O*.1,0,O*.6),t.fillStyle=T>0?`#f91880`:`#a0aab3`,t.fill(),t.restore(),J(t,ii(w*H(e.t,.6,1.4,V.p3out)+ +(T>0)),m+c+64*n,D,{font:`600 ${32*n}px "Montserrat", sans-serif`,colore:T>0?`#f91880`:`#536471`,base:`middle`}),J(t,`💬  ↻  ⇪`,m+s-c,D,{font:`500 ${30*n}px "Montserrat", sans-serif`,colore:`#8b98a5`,align:`right`,base:`middle`,spazio:10*n}),t.restore()}function Ui(e){let{c:t}=e,n=Ii(e),r=Z(e,`colore`,`#34c759`),i=X(e,`app`,`Messaggi`),a=X(e,`titolo`,`Anna`),o=X(e,`testo`,``),s=1e3*n,c=`500 ${32*n}px "Montserrat", sans-serif`,l=Qr(t,o,c,s-190*n).slice(0,3),u=Math.max(150*n,60*n+34*n*1.25+24*n+l.length*32*n*1.3+30*n),d=(e.w-s)/2,f=H(e.t,.1,.7,V.back(1.3)),p=H(e.t,e.d-.45,.45,V.p2in),m=Wr(-u-40,70,f)-(u+100)*p;t.save(),t.shadowColor=`rgba(0,0,0,.4)`,t.shadowBlur=44,t.shadowOffsetY=14,Y(t,d,m,s,u,44*n),t.fillStyle=`rgba(247,247,250,.94)`,t.fill(),t.shadowColor=`transparent`;let h=96*n,g=d+30*n,_=m+30*n;Y(t,g,_,h,h,24*n),t.fillStyle=r,t.fill(),t.fillStyle=`#fff`,Y(t,g+h*.2,_+h*.24,h*.6,h*.42,h*.16),t.fill(),t.beginPath(),t.moveTo(g+h*.34,_+h*.62),t.lineTo(g+h*.28,_+h*.78),t.lineTo(g+h*.5,_+h*.64),t.closePath(),t.fill();let v=g+h+28*n;J(t,i.toUpperCase(),v,m+34*n,{font:`600 ${22*n}px "Montserrat", sans-serif`,colore:`#6d6d72`,base:`top`,spazio:1.2*n}),J(t,`ora`,d+s-32*n,m+34*n,{font:`500 ${22*n}px "Montserrat", sans-serif`,colore:`#8e8e93`,align:`right`,base:`top`}),J(t,a,v,m+34*n+22*n*1.3+4*n,{font:`700 ${34*n}px "Montserrat", sans-serif`,colore:`#111`,base:`top`}),l.forEach((e,r)=>J(t,e,v,m+34*n+22*n*1.3+4*n+34*n*1.25+8*n+r*32*n*1.3,{font:c,colore:`#2b2b2f`,base:`top`})),t.restore()}function Wi(e){let{c:t}=e,n=Ii(e),r=Z(e,`colore`,`#0a84ff`),i=String(e.v.righe??``).split(`
`).map(e=>e.trim()).filter(Boolean).slice(0,8).map(e=>({mine:e.startsWith(`>`),t:e.replace(/^>\s*/,``)}));if(!i.length)return;let a=`500 ${40*n}px "Montserrat", sans-serif`,o=820*n,s=30*n,c=40*n*1.3,l=e.w/2,u=1e3*n,d=i.map(e=>{let n=Qr(t,e.t,a,o-s*2),r=Math.max(...n.map(e=>q(t,e,a)))+s*2;return{...e,rr:n,w:r,h:n.length*c+s*1.5}}),f=Math.min(1.25,5.5/i.length),p=.5,m=U(e,.5),h=18*n,g=(e.h+Math.min(900,d.reduce((e,t)=>e+t.h+h,0)))/2,_=d.map((t,n)=>H(e.t,p+n*f,.5,V.back(1.6))),v=g,y=Array(d.length);for(let e=d.length-1;e>=0;e--)v-=(d[e].h+h)*Ur(_[e]),y[e]=v;t.save(),t.globalAlpha=m,d.forEach((e,i)=>{if(_[i]<=0)return;let o=e.mine?l+u/2-e.w:l-u/2;t.save(),t.translate(o+(e.mine?e.w:0),y[i]+e.h);let d=.6+.4*Math.min(1,_[i]);t.scale(d,d),t.globalAlpha*=Ur(_[i]*2),t.translate(-(e.mine?e.w:0),-e.h),Y(t,0,0,e.w,e.h,38*n),t.fillStyle=e.mine?r:`#e9e9eb`,t.fill(),e.rr.forEach((n,r)=>J(t,n,s,s*.75+r*c,{font:a,colore:e.mine?`#fff`:`#111`,base:`top`})),t.restore()}),d.forEach((r,i)=>{if(r.mine)return;let a=p+i*f;if(!(e.t>a-f*.7&&e.t<a+.05))return;let o=v-74*n+0;Y(t,l-u/2,Math.min(g,o+74*n)-74*n,130*n,74*n,37*n),t.fillStyle=`#e9e9eb`,t.fill();for(let r=0;r<3;r++)t.beginPath(),t.arc(l-u/2+(36+r*29)*n,Math.min(g,o+74*n)-37*n-Math.sin(e.t*9+r)*5*n,8*n,0,Math.PI*2),t.fillStyle=`#8e8e93`,t.fill()}),t.restore()}var Gi={"sc-segui":zi,"sc-iscriviti":Bi,"sc-chiusura":Vi,"sc-post":Hi,"sc-notifica":Ui,"sc-chat":Wi},Ki=(e,t)=>(e%t+t)%t;function qi(e){let{c:t}=e,n=Z(e,`base`,`#0b0c12`),r=Z(e,`colore`,`#46e5b7`),i=Z(e,`colore2`,`#7c5cff`),a=t.createRadialGradient(e.w/2,e.h*.42,0,e.w/2,e.h*.42,e.w*.7);a.addColorStop(0,Kr(n,r,.08)),a.addColorStop(1,n),t.fillStyle=a,t.fillRect(0,0,e.w,e.h),t.globalCompositeOperation=`lighter`;for(let n=0;n<5;n++){let a=e.w*(.5+.38*Math.sin(e.t*.22+n*1.9)),o=e.h*(.46+.3*Math.cos(e.t*.18+n*2.3)),s=e.h*(.55+.12*Math.sin(e.t*.3+n)),c=n%2?i:r,l=t.createRadialGradient(a,o,0,a,o,s);l.addColorStop(0,G(c,.5)),l.addColorStop(.45,G(c,.2)),l.addColorStop(1,G(c,0)),t.fillStyle=l,t.fillRect(0,0,e.w,e.h)}t.globalCompositeOperation=`source-over`;let o=t.createRadialGradient(e.w/2,e.h/2,e.h*.4,e.w/2,e.h/2,e.w*.65);o.addColorStop(0,`rgba(0,0,0,0)`),o.addColorStop(1,`rgba(0,0,0,.45)`),t.fillStyle=o,t.fillRect(0,0,e.w,e.h)}function Ji(e){let{c:t}=e,n=Z(e,`base`,`#05060f`),r=Z(e,`colore`,`#cfe3ff`),i=t.createLinearGradient(0,0,0,e.h);i.addColorStop(0,Kr(n,`#1b2a55`,.35)),i.addColorStop(1,n),t.fillStyle=i,t.fillRect(0,0,e.w,e.h);let a=ei(e,`quante`,180),o=e.w*1.1;for(let n=0;n<a;n++){let i=.2+W(n,2)*.8,a=Ki(W(n,0)*o-e.t*i*34,o)-(o-e.w)/2,s=W(n,1)*e.h,c=.55+.45*Math.sin(e.t*(1.2+W(n,3)*2.4)+n),l=1.2+i*3.4;t.fillStyle=G(r,(.35+.65*i)*c),t.beginPath(),t.arc(a,s,l,0,Math.PI*2),t.fill(),i>.93&&(t.strokeStyle=G(r,.5*c),t.lineWidth=1.5,t.beginPath(),t.moveTo(a-l*5,s),t.lineTo(a+l*5,s),t.moveTo(a,s-l*5),t.lineTo(a,s+l*5),t.stroke())}}function Yi(e){let{c:t}=e,n=Z(e,`colore`,`#ffffff`),r=ei(e,`quanti`,120),i=ei(e,`vento`,30),a=H(e.t,0,.8,V.p2out)*U(e,.8);for(let o=0;o<r;o++){let r=W(o,0),s=2.5+r*9,c=55+r*130,l=Ki(W(o,1)*(e.h+80)+e.t*c,e.h+80)-40,u=Ki(W(o,2)*e.w+Math.sin(e.t*(.6+W(o,3))+o)*(20+r*50)+e.t*i*(.4+r),e.w+40)-20,d=(.35+.55*r)*a;if(s>7){let e=t.createRadialGradient(u,l,0,u,l,s);e.addColorStop(0,G(n,d)),e.addColorStop(1,G(n,0)),t.fillStyle=e,t.beginPath(),t.arc(u,l,s,0,Math.PI*2),t.fill()}else t.fillStyle=G(n,d),t.beginPath(),t.arc(u,l,s,0,Math.PI*2),t.fill()}}function Xi(e){let{c:t}=e,n=Z(e,`colore`,`#ffb347`),r=Z(e,`colore2`,`#ff7ab8`),i=ei(e,`quanti`,22),a=H(e.t,0,1,V.p2out)*U(e,.8);for(let o=0;o<i;o++){let i=W(o,0),s=e.w*W(o,1)+Math.sin(e.t*(.15+W(o,4)*.2)+o*3)*(40+i*80),c=e.h*W(o,2)+Math.cos(e.t*(.12+W(o,5)*.2)+o*2)*(30+i*60),l=36+i*120,u=o%2?r:n,d=(.12+.2*(.5+.5*Math.sin(e.t*.8+o*1.7)))*a,f=t.createRadialGradient(s,c,l*.2,s,c,l);f.addColorStop(0,G(u,d*.7)),f.addColorStop(.82,G(u,d)),f.addColorStop(1,G(u,0)),t.fillStyle=f,t.beginPath(),t.arc(s,c,l,0,Math.PI*2),t.fill(),t.strokeStyle=G(Jr(u,.3),d*.9),t.lineWidth=2,t.beginPath(),t.arc(s,c,l*.84,0,Math.PI*2),t.stroke()}}function Zi(e){let{c:t}=e,n=Z(e,`base`,`#08101f`),r=Z(e,`colore`,`#35e8ff`),i=Z(e,`colore2`,`#7c5cff`),a=t.createLinearGradient(0,0,0,e.h);a.addColorStop(0,n),a.addColorStop(1,Kr(n,i,.3)),t.fillStyle=a,t.fillRect(0,0,e.w,e.h);for(let n=0;n<6;n++){let a=e.h*(.46+n*.09),o=22+n*9,s=.0035-n*25e-5,c=.7+n*.18;t.beginPath(),t.moveTo(0,e.h);for(let r=0;r<=e.w+20;r+=20)t.lineTo(r,a+Math.sin(r*s+e.t*c+n*1.3)*o+Math.sin(r*s*2.3-e.t*c*.8)*o*.4);t.lineTo(e.w,e.h),t.closePath();let l=t.createLinearGradient(0,a-o,0,e.h);l.addColorStop(0,G(n%2?i:r,.5-n*.04)),l.addColorStop(1,G(n%2?i:r,.08)),t.fillStyle=l,t.fill()}}function Qi(e){let{c:t}=e,n=Z(e,`base`,`#0a0612`),r=Z(e,`colore`,`#ff3df2`),i=60/Math.max(30,ei(e,`bpm`,120)),a=e.t%i/i;Math.floor(e.t/i);let o=Math.exp(-a*5);t.fillStyle=n,t.fillRect(0,0,e.w,e.h);let s=e.w/2,c=e.h/2,l=t.createRadialGradient(s,c,0,s,c,e.h*(.55+.1*o));l.addColorStop(0,G(r,.35+.3*o)),l.addColorStop(1,G(r,0)),t.fillStyle=l,t.fillRect(0,0,e.w,e.h);for(let e=0;e<4;e++){let n=120+(e+a)*i*380;t.lineWidth=6-e,t.strokeStyle=G(r,Math.max(0,.7-e*.2)*(e===0?1-a*.3:1)),t.beginPath(),t.arc(s,c,n,0,Math.PI*2),t.stroke()}t.shadowColor=r,t.shadowBlur=50,t.fillStyle=G(Jr(r,.3),.9),t.beginPath(),t.arc(s,c,90*(1+.2*o),0,Math.PI*2),t.fill(),t.shadowColor=`transparent`}function $i(e){let{c:t}=e,n=Z(e,`colore`,`#ff9a3d`),r=Z(e,`colore2`,`#ff4d6d`),i=Ur(e.t/e.d),a=Math.sin(Math.PI*i);t.globalCompositeOperation=`lighter`;for(let o=0;o<3;o++){let s=e.w*Wr(-.1,1.1,Ur(i*1.1+o*.12-.1)),c=e.h*(.2+.25*o+.1*Math.sin(e.t*1.2+o)),l=e.h*(.7+.25*o),u=o===1?r:n,d=t.createRadialGradient(s,c,0,s,c,l);d.addColorStop(0,G(u,.75*a)),d.addColorStop(.5,G(u,.25*a)),d.addColorStop(1,G(u,0)),t.fillStyle=d,t.fillRect(0,0,e.w,e.h)}let o=e.w*Wr(-.3,1.3,i),s=t.createLinearGradient(o-200,0,o+200,0);s.addColorStop(0,G(n,0)),s.addColorStop(.5,G(Jr(n,.5),.4*a)),s.addColorStop(1,G(n,0)),t.fillStyle=s,t.fillRect(o-200,0,400,e.h),t.globalCompositeOperation=`source-over`}function ea(e){let{c:t}=e,n=Z(e,`colore`,`#f12c2c`),r=Math.min(e.w,e.h)*.05,i=Math.min(e.w,e.h)*.037,a={font:`700 ${i}px "Space Mono", "Courier New", monospace`,colore:`#fff`,contorno:{colore:`rgba(0,0,0,.92)`,px:i*.12},ombra:{blur:6,colore:`rgba(0,0,0,.9)`}},o=H(e.t,0,.3,V.lineare)*U(e,.3);t.save(),t.globalAlpha=o,Math.floor(e.t*1.2)%2==0&&(t.fillStyle=n,t.shadowColor=G(n,.6),t.shadowBlur=14,t.beginPath(),t.arc(r+i*.55,r+i*.7,i*.55,0,Math.PI*2),t.fill(),t.shadowColor=`transparent`),J(t,`REC`,r+i*1.6,r+i*.2,{...a,base:`top`});let s=i*2.4,c=i*1.2,l=e.w-r-s-i*.4,u=r+i*.1;t.lineWidth=i*.12,t.strokeStyle=`#fff`,t.strokeRect(l,u,s,c),t.fillStyle=`#fff`,t.fillRect(l+s,u+c*.3,i*.25,c*.4);for(let e=0;e<3;e++)t.fillRect(l+i*.2+e*i*.7,u+i*.2,i*.55,c-i*.4);J(t,X(e,`data`,`12 GIU 2026`),r,e.h-r-i,{...a,base:`top`}),J(t,X(e,`modo`,`SP`),r,e.h-r-i*2.4,{...a,base:`top`,font:`700 ${i*.72}px "Space Mono", monospace`});let d=Math.floor(e.t),f=e=>String(e).padStart(2,`0`);J(t,`0:${f(Math.floor(d/60))}:${f(d%60)}`,e.w-r,e.h-r-i,{...a,base:`top`,align:`right`}),t.restore()}function ta(e){let{c:t}=e,n=Z(e,`colore`,`#d2202a`),r=X(e,`marca`,`NEWS`).toUpperCase(),i=X(e,`testo`,``),a=e.h-60-132,o=H(e.t,0,.6,V.p4out),s=H(e.t,e.d-.5,.5,V.p2in),c=(1-o+s)*252;t.save(),t.translate(0,c),t.shadowColor=`rgba(0,0,0,.45)`,t.shadowBlur=30,t.shadowOffsetY=-4,t.fillStyle=`rgba(14,16,22,.94)`,t.fillRect(80,a,e.w-160,132),t.shadowColor=`transparent`,t.fillStyle=n,t.fillRect(80,a-8,e.w-160,8);let l=`700 56px "Oswald", sans-serif`,u=q(t,r,l,3)+90;t.beginPath(),t.moveTo(80,a),t.lineTo(80+u,a),t.lineTo(80+u-34,a+132),t.lineTo(80,a+132),t.closePath(),t.fillStyle=n,t.fill(),J(t,r,116,a+66+2,{font:l,colore:`#fff`,base:`middle`,spazio:3}),t.save(),t.beginPath(),t.rect(80+u,a,e.w-160-u,132),t.clip();let d=`600 46px "Montserrat", sans-serif`,f=`${i}    •    `,p=q(t,f,d),m=80+u+40-e.t*150%p;for(let n=0;n<4;n++){let r=m+n*p;if(r>e.w)break;J(t,f,r,a+66+2,{font:d,colore:`#fff`,base:`middle`})}t.restore(),t.restore()}function na(e){let{c:t}=e,n=Z(e,`colore`,`#35e8ff`),r=H(e.t,.1,.8,V.p3out),i=U(e,.4);t.save(),t.globalAlpha=i,t.strokeStyle=n,t.lineWidth=6,t.lineCap=`square`,t.shadowColor=n,t.shadowBlur=14;let a=(e,n,i,a)=>{t.beginPath(),t.moveTo(e,n+a*110*r),t.lineTo(e,n),t.lineTo(e+i*110*r,n),t.stroke()};a(90,90,1,1),a(e.w-90,90,-1,1),a(90,e.h-90,1,-1),a(e.w-90,e.h-90,-1,-1);let o=e.w/2,s=e.h/2;t.lineWidth=3,t.globalAlpha=i*r,t.beginPath(),t.arc(o,s,70,0,Math.PI*2),t.stroke(),t.save(),t.translate(o,s),t.rotate(e.t*.5);for(let e=0;e<4;e++)t.rotate(Math.PI/2),t.beginPath(),t.moveTo(70,0),t.lineTo(110,0),t.stroke();t.restore(),t.shadowColor=`transparent`;let c=`700 28px "Space Mono", monospace`;J(t,X(e,`etichetta`,`SOGGETTO 01`),98,173,{font:c,colore:n,base:`top`,alfa:r,spazio:3});let l=t=>(W(t,Math.floor(e.t*6))*99).toFixed(2).padStart(5,`0`);J(t,`X ${l(1)}`,e.w-90-8,173,{font:c,colore:n,base:`top`,align:`right`,alfa:r}),J(t,`Y ${l(2)}`,e.w-90-8,211,{font:c,colore:n,base:`top`,align:`right`,alfa:r}),J(t,`T ${e.t.toFixed(2)}s`,98,e.h-90-55-34,{font:c,colore:n,base:`top`,alfa:r});let u=90+(e.h-180)*(.5+.5*Math.sin(e.t*1.1)),d=t.createLinearGradient(0,u-40,0,u+4);d.addColorStop(0,G(n,0)),d.addColorStop(1,G(n,.28)),t.fillStyle=d,t.fillRect(90,u-40,e.w-180,44),t.restore()}var ra={"bg-aurora":qi,"bg-stelle":Ji,"bg-neve":Yi,"bg-bokeh":Xi,"bg-onde":Zi,"bg-impulso":Qi,"bg-luce":$i,"hd-rec":ea,"hd-notizie":ta,"hd-mirino":na},ia=(e,t)=>(e%t+t)%t;function aa(e,t,n,r,i){let a=e.createRadialGradient(t,n,0,t,n,r);a.addColorStop(0,`rgba(0,0,0,${.5*i})`),a.addColorStop(1,`rgba(0,0,0,0)`),e.fillStyle=a,e.fillRect(t-r,n-r,r*2,r*2)}function oa(e,t,n,r,i,a){let o=r*a;e.strokeStyle=i,e.lineWidth=2.5,e.lineCap=`round`,e.beginPath(),e.moveTo(t-o/2,n),e.lineTo(t-18,n),e.moveTo(t+18,n),e.lineTo(t+o/2,n),e.stroke(),e.fillStyle=i,e.beginPath(),e.moveTo(t,n-9*a),e.lineTo(t+9*a,n),e.lineTo(t,n+9*a),e.lineTo(t-9*a,n),e.closePath(),e.fill()}function sa(e){let{c:t}=e,n=Z(e,`colore`,`#d4af37`),r=Z(e,`testo`,`#ffffff`),i=Xr(e.v,`font`,`playfair`),a=U(e,.6),o=e.w/2,s=e.h/2-90;t.save(),t.globalAlpha=a,aa(t,o,e.h/2,e.h*.62,H(e.t,0,.8,V.p2out));let c=H(e.t,.1,1.3,V.p3io);t.lineWidth=5,t.strokeStyle=n,t.lineCap=`round`,t.shadowColor=G(n,.6),t.shadowBlur=16,t.beginPath(),t.arc(o,s,190,-Math.PI/2,-Math.PI/2+Math.PI*2*c),t.stroke(),t.lineWidth=2,t.beginPath(),t.arc(o,s,172,-Math.PI/2,-Math.PI/2-Math.PI*2*c,!0),t.stroke(),t.shadowColor=`transparent`;let l=H(e.t,.9,.8,V.back(1.4)),u=X(e,`iniziali`,`A & M`),d=Zr(t,u,e=>`400 ${e}px ${K.vibes}`,170,272);t.save(),t.translate(o,s+8),t.scale(.8+.2*l,.8+.2*l),J(t,u,0,0,{font:`400 ${d}px ${K.vibes}`,colore:n,align:`center`,base:`middle`,alfa:Ur(l*1.5),ombra:{blur:22,colore:`rgba(0,0,0,.55)`}}),t.restore();let f=H(e.t,1.4,.8,V.p3out),p=H(e.t,1.8,.8,V.p3out),m=X(e,`nomi`,`Anna e Marco`),h=Zr(t,m,e=>`700 ${e}px ${i}`,78,e.w*.8,5);J(t,m,o,s+190+70+16*(1-f),{font:`700 ${h}px ${i}`,colore:r,align:`center`,base:`middle`,alfa:f,spazio:5,ombra:{blur:24,colore:`rgba(0,0,0,.6)`}}),oa(t,o,s+190+134,360,n,p),J(t,X(e,`data`,``).toUpperCase(),o,s+190+190+12*(1-p),{font:`500 40px ${K.cormorant}`,colore:n,align:`center`,base:`middle`,alfa:p,spazio:10,ombra:{blur:16,colore:`rgba(0,0,0,.6)`}}),t.restore()}function ca(e){let{c:t}=e,n=Z(e,`colore`,`#d4af37`),r=Z(e,`testo`,`#ffffff`),i=U(e,.6),a=e.w-260,o=e.h-182;t.save(),t.globalAlpha=i,aa(t,e.w/2,e.h/2,e.h*.7,H(e.t,0,.8,V.p2out));let s=H(e.t,.1,1.8,V.p3io);t.strokeStyle=n,t.lineCap=`round`,t.lineJoin=`round`,t.shadowColor=G(n,.5),t.shadowBlur=12;let c=2*(a+o);for(let[e,n]of[[0,4],[22,2]])t.lineWidth=n,t.setLineDash([c*s,c]),t.beginPath(),t.rect(130+e,91+e,a-e*2,o-e*2),t.stroke();t.setLineDash([]),t.shadowColor=`transparent`;let l=H(e.t,1.2,.8,V.p3out);if(l>0){t.lineWidth=3,t.strokeStyle=G(n,l);for(let[e,r,i,s]of[[130,91,1,1],[130+a,91,-1,1],[130,91+o,1,-1],[130+a,91+o,-1,-1]])t.save(),t.translate(e,r),t.scale(i,s),t.beginPath(),t.moveTo(46,46),t.bezierCurveTo(46,88,88,88,88,46),t.bezierCurveTo(88,20,62,12,56,34),t.stroke(),t.beginPath(),t.arc(46,46,7,0,Math.PI*2),t.fillStyle=G(n,l),t.fill(),t.restore()}let u=H(e.t,1,.9,V.p3out),d=H(e.t,1.5,.9,V.p3out),f=X(e,`titolo`,`Anna & Marco`),p=`italic 400 ${Zr(t,f,e=>`italic 400 ${e}px ${K.playfair}`,150,a-280)}px ${K.playfair}`;J(t,f,e.w/2,e.h/2-20+20*(1-u),{font:p,colore:r,align:`center`,base:`middle`,alfa:u,ombra:{blur:26,colore:`rgba(0,0,0,.65)`}}),oa(t,e.w/2,e.h/2+76,420,n,d),J(t,X(e,`sotto`,``).toUpperCase(),e.w/2,e.h/2+140+12*(1-d),{font:`500 46px ${K.cormorant}`,colore:n,align:`center`,base:`middle`,spazio:9,alfa:d,ombra:{blur:18,colore:`rgba(0,0,0,.65)`}}),t.restore()}function la(e){let{c:t}=e,n=Z(e,`colore`,`#ffffff`),r=Z(e,`accento`,`#d4af37`),i=Xr(e.v,`font`,`cormorant`),a=X(e,`testo`,``).split(`
`).map(e=>e.trim()).filter(Boolean);if(!a.length)return;let o=i===K.montserrat?K.cormorant:i,s=Math.min(a.length>3?84:100,...a.map(n=>Zr(t,n,e=>`italic 500 ${e}px ${o}`,100,e.w*.82))),c=s*1.3,l=`italic 500 ${s}px ${o}`,u=X(e,`firma`,``),d=a.length*c,f=e.h/2-d/2-(u?40:0),p=U(e,.6);t.save(),t.globalAlpha=p,aa(t,e.w/2,e.h/2,e.h*.7,H(e.t,0,.8,V.p2out));let m=H(e.t,.1,1,V.p4out);if(oa(t,e.w/2,f-52,520,r,m),a.forEach((r,i)=>{let a=H(e.t,.5+i*.55,.9,V.p3out);J(t,r,e.w/2,f+i*c+14*(1-a),{font:l,colore:n,align:`center`,base:`top`,alfa:a,ombra:{blur:22,colore:`rgba(0,0,0,.65)`}})}),oa(t,e.w/2,f+d+36,520,r,H(e.t,.5+a.length*.55,.8,V.p4out)),u){let n=H(e.t,.9+a.length*.55,.9,V.p3out);J(t,u,e.w/2,f+d+90+12*(1-n),{font:`400 84px ${K.vibes}`,colore:r,align:`center`,base:`top`,alfa:n,ombra:{blur:18,colore:`rgba(0,0,0,.6)`}})}t.restore()}function ua(e){let{c:t}=e,n=Z(e,`colore`,`#ffffff`),r=Z(e,`accento`,`#d4af37`),i=Xr(e.v,`font`,`playfair`),a=X(e,`giorno`,`12`),o=X(e,`mese`,`GIUGNO`).toUpperCase(),s=X(e,`anno`,`2026`),c=U(e,.6),l=e.w/2,u=e.h/2-40;t.save(),t.globalAlpha=c,aa(t,l,e.h/2,e.h*.7,H(e.t,0,.8,V.p2out));let d=H(e.t,.2,1,V.back(1.3)),f=`400 330px ${i}`,p=q(t,a,f);t.save(),t.translate(l,u),t.scale(.85+.15*d,.85+.15*d),J(t,a,0,20,{font:f,colore:n,align:`center`,base:`middle`,alfa:Ur(d*1.4),ombra:{blur:30,colore:`rgba(0,0,0,.6)`}}),t.restore();let m=H(e.t,.7,.9,V.p4out),h=p/2+70;t.fillStyle=r,t.fillRect(l-h-3,u-150*m,4,300*m),t.fillRect(l+h-1,u-150*m,4,300*m);let g=H(e.t,1,.8,V.p3out);J(t,o,l-h-50+30*(1-g),u+12,{font:`500 66px ${K.cormorant}`,colore:r,align:`right`,base:`middle`,spazio:12,alfa:g,ombra:{blur:16,colore:`rgba(0,0,0,.6)`}}),J(t,s,l+h+50-30*(1-g),u+12,{font:`500 66px ${K.cormorant}`,colore:r,align:`left`,base:`middle`,spazio:12,alfa:g,ombra:{blur:16,colore:`rgba(0,0,0,.6)`}});let _=H(e.t,1.5,.9,V.p3out);J(t,X(e,`nomi`,``),l,u+230+14*(1-_),{font:`400 110px ${K.vibes}`,colore:n,align:`center`,base:`middle`,alfa:_,ombra:{blur:22,colore:`rgba(0,0,0,.6)`}}),t.restore()}function da(e){let{c:t}=e,n=Z(e,`colore`,`#ffd23f`),r=Z(e,`colore2`,`#ff4d6d`),i=Xr(e.v,`font`,`vibes`),a=U(e,.6),o=H(e.t,.05,.9,V.rimbalzo);t.save(),t.globalAlpha=a;let s=-20+90*o-90,c=t=>s+70+150*(1-((t-e.w/2)/(e.w/2))**2);t.strokeStyle=`rgba(255,255,255,.85)`,t.lineWidth=4,t.beginPath();for(let n=-10;n<=e.w+10;n+=20){let e=c(n);n===-10?t.moveTo(n,e):t.lineTo(n,e)}t.stroke();let l=Math.round(e.w/120),u=[n,r,`#ffffff`,Jr(n,.3)];for(let n=0;n<=l;n++){let r=(n+.5)*(e.w/(l+1))+20,i=c(r),a=Math.sin(e.t*2+n*.8)*.07;t.save(),t.translate(r,i),t.rotate(a),t.beginPath(),t.moveTo(-34,0),t.lineTo(34,0),t.lineTo(0,88),t.closePath(),t.fillStyle=u[n%u.length],t.shadowColor=`rgba(0,0,0,.35)`,t.shadowBlur=12,t.shadowOffsetY=5,t.fill(),t.restore()}t.shadowColor=`transparent`;let d=H(e.t,.7,1,V.back(1.5)),f=X(e,`testo`,`Buon Compleanno`);t.save(),t.translate(e.w/2,e.h/2+30),t.scale(.7+.3*d,.7+.3*d),J(t,f,0,0,{font:`400 ${Zr(t,f,e=>`400 ${e}px ${i}`,230,e.w*.86)}px ${i}`,colore:`#fff`,align:`center`,base:`middle`,alfa:Ur(d*1.5),ombra:{blur:30,colore:`rgba(0,0,0,.6)`,y:6},contorno:{colore:G(r,.9),px:8}}),t.restore();let p=H(e.t,1.4,.9,V.p3out);J(t,X(e,`sotto`,``).toUpperCase(),e.w/2,e.h/2+230+14*(1-p),{font:`700 60px ${K.montserrat}`,colore:`#fff`,align:`center`,base:`middle`,spazio:10,alfa:p,ombra:{blur:20,colore:`rgba(0,0,0,.6)`}}),t.restore()}function fa(e){let{c:t}=e,n=Z(e,`colore`,`#ff4d6d`),r=Z(e,`colore2`,`#ffb3c6`),i=ei(e,`quanti`,26),a=H(e.t,0,.8,V.p2out)*U(e,.8);for(let o=0;o<i;o++){let i=W(o,0),s=26+i*70,c=80+(1-i)*140+W(o,5)*40,l=e.h+260,u=e.h+130-ia(e.t*c+W(o,1)*l,l),d=e.w*(.04+.92*W(o,2))+Math.sin(e.t*(.8+W(o,3))+o*2)*(24+i*50),f=Ur(u/(e.h*.25)),p=(.55+.4*i)*a*Math.min(1,f+.05);if(t.save(),t.translate(d,u),t.rotate(Math.sin(e.t*1.2+o)*.25),t.globalAlpha=p,ni(t,0,0,s),o%4==0)t.lineWidth=4,t.strokeStyle=o%2?n:r,t.shadowColor=t.strokeStyle,t.shadowBlur=14,t.stroke();else{let e=t.createLinearGradient(-s/2,-s/2,s/2,s/2);e.addColorStop(0,Jr(o%2?n:r,.25)),e.addColorStop(1,o%2?n:r),t.fillStyle=e,t.fill()}t.restore()}}function pa(e,t){e.beginPath(),e.moveTo(0,-t),e.bezierCurveTo(t*.9,-t*.5,t*.8,t*.55,0,t),e.bezierCurveTo(-t*.8,t*.55,-t*.9,-t*.5,0,-t),e.closePath()}function ma(e){let{c:t}=e,n=Z(e,`colore`,`#ffc2d1`),r=Z(e,`colore2`,`#ffffff`),i=ei(e,`quanti`,40),a=H(e.t,0,.8,V.p2out)*U(e,.8);for(let o=0;o<i;o++){let i=W(o,0),s=14+i*26,c=70+i*90,l=e.h+200,u=ia(e.t*c+W(o,1)*l,l)-100,d=e.w*W(o,2)+Math.sin(e.t*(.5+W(o,3)*.7)+o*3)*(90+i*120)+Math.sin(e.t*.3+o)*40,f=Math.cos(e.t*(1.2+W(o,4))+o);t.save(),t.translate(d,u),t.rotate(e.t*(.4+W(o,5))*(o%2?1:-1)+o),t.scale(.35+.65*Math.abs(f),1),t.globalAlpha=(.65+.3*i)*a,pa(t,s);let p=o%3==0?r:n,m=t.createLinearGradient(0,-s,0,s);m.addColorStop(0,Jr(p,.25)),m.addColorStop(1,qr(p,.1)),t.fillStyle=m,t.fill(),t.restore()}}function ha(e){let{c:t}=e,n=Z(e,`colore`,`#ffd54a`),r=ei(e,`quante`,90),i=H(e.t,0,.8,V.p2out)*U(e,.8);for(let a=0;a<r;a++){let r=W(a,0),o=7+r*24,s=e.h+120,c=ia(e.t*(22+r*60)+W(a,1)*s,s)-60,l=e.w*W(a,2)+Math.sin(e.t*.6+a*2.1)*36,u=Math.abs(Math.sin(e.t*(1.4+W(a,3)*2.5)+a*1.3))**3;t.save(),t.globalAlpha=(.15+.85*u)*i,t.shadowColor=n,t.shadowBlur=12+o,ti(t,l,c,o,4,.16,Math.PI/4+e.t*.4),t.fillStyle=a%5==0?`#fff`:n,t.fill(),t.restore()}}function ga(e){let{c:t}=e,n=[Z(e,`colore`,`#ff4d6d`),Z(e,`colore2`,`#35e8ff`),Z(e,`colore3`,`#ffd23f`)],r=ei(e,`quanti`,14),i=U(e,.8),a=e.h+700,o=Array.from({length:r},(e,t)=>t).sort((e,t)=>W(e,0)-W(t,0));for(let r of o){let o=W(r,0),s=40+o*36,c=s*1.26,l=90+(1-o)*110,u=e.h+250-ia(e.t*l+W(r,1)*a,a)+100,d=e.w*(.06+.88*W(r,2))+Math.sin(e.t*.9+r*2)*36,f=n[r%3];t.save(),t.translate(d,u),t.rotate(Math.sin(e.t*.9+r*2+.6)*.08),t.globalAlpha=i,t.strokeStyle=`rgba(255,255,255,.7)`,t.lineWidth=2,t.beginPath(),t.moveTo(0,c+10);for(let n=1;n<=8;n++)t.lineTo(Math.sin(e.t*2+n*.7+r)*7*(n/8),c+10+n*22);t.stroke(),t.beginPath(),t.ellipse(0,0,s,c,0,0,Math.PI*2);let p=t.createRadialGradient(-s*.35,-c*.4,s*.1,0,0,c*1.1);p.addColorStop(0,Jr(f,.55)),p.addColorStop(.5,f),p.addColorStop(1,qr(f,.35)),t.fillStyle=p,t.shadowColor=`rgba(0,0,0,.25)`,t.shadowBlur=16,t.shadowOffsetY=6,t.fill(),t.shadowColor=`transparent`,t.fillStyle=`rgba(255,255,255,.55)`,t.beginPath(),t.ellipse(-s*.42,-c*.45,s*.14,c*.2,-.5,0,Math.PI*2),t.fill(),t.fillStyle=qr(f,.2),t.beginPath(),t.moveTo(0,c-2),t.lineTo(-9,c+14),t.lineTo(9,c+14),t.closePath(),t.fill(),t.restore()}}function _a(e){let{c:t}=e,n=[Z(e,`colore`,`#ff4d6d`),Z(e,`colore2`,`#ffd23f`),Z(e,`colore3`,`#35e8ff`),`#ffffff`],r=ei(e,`quanti`,140),i=U(e,.9,V.lineare);for(let a=0;a<r;a++){let r=a%3!=2,o=r?.12+W(a,9)*.12:.9+W(a,9)*1.4,s=e.t-o;if(s<0)continue;let c,l;if(r){let t=a%2?1:-1,n=t>0?e.w*.03:e.w*.97,r=e.h+20,i=(18+W(a,1)*37)*Math.PI/180,o=1100+W(a,2)*1100,u=Math.sin(i)*o*t*-1,d=-Math.cos(i)*o,f=(1-Math.exp(-1.5*s))/1.5;c=n+u*f+Math.sin(s*4+a)*26*Math.min(1,s),l=r+(d+300)*f-300*s}else c=e.w*W(a,1)+Math.sin(s*2.2+a)*60,l=-40+165*s;if(l>e.h+40||c<-40||c>e.w+40||l<-80)continue;let u=12+W(a,3)*20,d=7+W(a,4)*12,f=Math.abs(Math.cos(s*(5+W(a,5)*8)+a));t.save(),t.translate(c,l),t.rotate(s*(2+W(a,6)*5)*(a%2?1:-1)+a),t.scale(1,.2+.8*f),t.globalAlpha=i*Math.min(1,s*6),t.fillStyle=n[a%n.length],a%5==0?(t.beginPath(),t.arc(0,0,u*.35,0,Math.PI*2),t.fill()):t.fillRect(-u/2,-d/2,u,d),t.restore()}}var va={"cr-monogramma":sa,"cr-cornice":ca,"cr-dedica":la,"cr-data":ua,"cr-auguri":da,"cr-cuori":fa,"cr-petali":ma,"cr-scintille":ha,"cr-palloncini":ga,"cr-coriandoli":_a},ya=e({DISEGNA:()=>ba,disegnaAnimazione:()=>Ca,firmaAnim:()=>Sa}),ba={...vi,...Oi,...Fi,...Gi,...ra,...va},xa=new Map,Sa=e=>e.id+JSON.stringify(e.v);function Ca(e,t,n,r,i,a){let o=t+`x`+n,s=a??xa.get(o);s||(s=Rt(t,n),a||xa.set(o,s),xa.size>6&&xa.delete(xa.keys().next().value));let c=s.getContext(`2d`);c.setTransform(1,0,0,1,0,0),c.globalAlpha=1,c.shadowColor=`transparent`,c.clearRect(0,0,t,n);let l=n/1080;c.setTransform(l,0,0,l,0,0);let u=ba[e.id];if(u&&hn(e.id)){c.save();try{u({c,w:t/l,h:1080,t:Math.max(0,r),d:Math.max(.1,i),v:yn(e)})}catch{}c.restore()}return c.setTransform(1,0,0,1,0,0),s}var wa=`#version 300 es
in vec2 a_pos;
uniform vec2 u_res;        // dimensione del progetto in pixel
uniform vec2 u_size;       // dimensione mostrata della sorgente intera (dopo l'adattamento)
uniform vec4 u_crop;       // l, t, r, b in uv
uniform vec2 u_off;        // spostamento in pixel dal centro
uniform float u_scale, u_rot;
out vec2 v_uv;
void main() {
  vec2 uv = mix(u_crop.xy, vec2(1.0) - u_crop.zw, a_pos);
  vec2 p = (uv - 0.5) * u_size * u_scale;
  float c = cos(u_rot), s = sin(u_rot);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + u_off;
  vec2 clip = p / (u_res * 0.5);
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_uv = uv;
}`,Ta=`#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform int u_src;          // 0 texture, 1 barre SMPTE, 2 barre EBU, 3 colore pieno
uniform int u_orient;       // rotazione dei metadati: 0, 90, 180, 270
uniform vec3 u_color;
uniform float u_bright, u_contrast, u_sat, u_hue;
uniform int u_look;         // bit: 1 vhs, 2 pellicola, 4 b/n, 8 seppia, 16 crt (si sommano)
uniform float u_time;
uniform vec2 u_texel;
uniform int u_key;          // 0 no, 1 luma, 2 colori (green screen), 3 maschera dell'AI
uniform vec3 u_keyColor;    // il colore principale della chiave
uniform vec3 u_keyExtra[2]; // gli altri colori da togliere
uniform int u_keyN;         // quanti altri
uniform float u_keyLevel, u_keySoft;
uniform bool u_keyInv;
uniform float u_keySpill;   // quanto colore del fondale si toglie dai bordi
uniform float u_keyBordo;   // restringe (−) o allarga (+) il soggetto
uniform float u_keySfuma;   // sfuma il bordo
uniform float u_keyPulisci; // toglie puntini e buchi
uniform sampler2D u_matte, u_matte2;  // le maschere dell'AI (prima e dopo l'istante) e quanto verso la seconda
uniform float u_matteK;
uniform int u_vista;        // 0 normale, 1 si vede la maschera, 2 il soggetto sugli scacchi
uniform bool u_mirror;
uniform float u_temp, u_vignette;
uniform bool u_auto;          // colore automatico: livelli, bianco e luce misurati sulla ripresa
uniform vec3 u_autoLo, u_autoHi, u_autoWb;
uniform float u_autoK, u_autoGamma;
uniform float u_alpha;        // i titoli animati che compaiono e spariscono
uniform vec3 u_color2;        // colore pieno sfumato: il secondo colore
uniform bool u_grad;
uniform vec4 u_box;           // il rettangolo che si vede (l, t, r, b in uv): per gli angoli tondi e l'ombra
uniform vec2 u_boxPx;         // quanti pixel del progetto fa la sorgente intera
uniform float u_round, u_feather;
out vec4 o;

vec2 orient(vec2 uv) {
  if (u_orient == 90) return vec2(uv.y, 1.0 - uv.x);
  if (u_orient == 180) return vec2(1.0 - uv.x, 1.0 - uv.y);
  if (u_orient == 270) return vec2(1.0 - uv.y, uv.x);
  return uv;
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 smpte(vec2 uv) {
  vec3 bars[7] = vec3[7](vec3(.75), vec3(.75,.75,0.), vec3(0.,.75,.75), vec3(0.,.75,0.), vec3(.75,0.,.75), vec3(.75,0.,0.), vec3(0.,0.,.75));
  int i = int(clamp(floor(uv.x * 7.0), 0.0, 6.0));
  if (uv.y < 0.67) return bars[i];
  if (uv.y < 0.75) {
    vec3 rev[7] = vec3[7](vec3(0.,0.,.75), vec3(.075), vec3(.75,0.,.75), vec3(.075), vec3(0.,.75,.75), vec3(.075), vec3(.75));
    return rev[i];
  }
  float x = uv.x * 7.0;
  if (x < 1.25) return vec3(0.0, 0.129, 0.298);       // -I
  if (x < 2.5) return vec3(1.0);                      // bianco 100%
  if (x < 3.75) return vec3(0.196, 0.0, 0.416);       // +Q
  if (x < 5.0) return vec3(0.075);
  if (x < 5.333) return vec3(0.035);                  // PLUGE: sotto il nero
  if (x < 5.666) return vec3(0.075);
  if (x < 6.0) return vec3(0.115);                    //        sopra il nero
  return vec3(0.075);
}
vec3 ebu(vec2 uv) {
  vec3 b[8] = vec3[8](vec3(1.), vec3(.75,.75,0.), vec3(0.,.75,.75), vec3(0.,.75,0.), vec3(.75,0.,.75), vec3(.75,0.,0.), vec3(0.,0.,.75), vec3(0.));
  return b[int(clamp(floor(uv.x * 8.0), 0.0, 7.0))];
}

vec4 src(vec2 uv) {
  if (u_src == 1) return vec4(smpte(uv), 1.0);
  if (u_src == 2) return vec4(ebu(uv), 1.0);
  if (u_src == 3) return vec4(u_grad ? mix(u_color, u_color2, clamp(uv.y * 0.75 + uv.x * 0.25, 0.0, 1.0)) : u_color, 1.0);
  return texture(u_tex, orient(uv));
}

// colore → (luce, blu-giallo, rosso-verde): la distanza dalla chiave si misura sul colore, poco sulla luce
vec3 yuv(vec3 c) { return vec3(dot(c, vec3(0.299, 0.587, 0.114)), dot(c, vec3(-0.169, -0.331, 0.5)), dot(c, vec3(0.5, -0.419, -0.081))); }
float distChiave(vec3 rgb, vec3 kc) {
  vec3 a = yuv(rgb), k = yuv(kc);
  return distance(a.yz, k.yz) * 2.2 + abs(a.x - k.x) * 0.15;
}
// quanto un colore è "soggetto" (1) o "fondale" (0): il più vicino fra i colori scelti
float matteColori(vec3 rgb) {
  float d = distChiave(rgb, u_keyColor);
  if (u_keyN > 0) d = min(d, distChiave(rgb, u_keyExtra[0]));
  if (u_keyN > 1) d = min(d, distChiave(rgb, u_keyExtra[1]));
  float lo = max(0.0, u_keyLevel * 0.5 - u_keyBordo * 0.25);
  return smoothstep(lo, lo + u_keySoft + 0.001, d);
}
vec3 senzaRiflesso(vec3 rgb) {
  // toglie dai bordi il colore del fondale che rimbalza sul soggetto: la parte di colore che punta verso la chiave
  vec3 y = yuv(rgb), k = yuv(u_keyColor);
  vec2 kd = normalize(k.yz + vec2(1e-5));
  float len = length(y.yz);
  float ang = len > 1e-4 ? dot(y.yz / len, kd) : 0.0;
  float sp = max(0.0, dot(y.yz, kd));
  vec2 q = y.yz - kd * sp * smoothstep(0.35, 0.95, ang) * u_keySpill;
  return vec3(y.x + 1.402 * q.y, y.x - 0.344 * q.x - 0.714 * q.y, y.x + 1.772 * q.x);
}

void main() {
  vec2 uv0 = u_mirror ? vec2(1.0 - v_uv.x, v_uv.y) : v_uv;
  vec4 c = src(uv0);
  vec3 rgb = c.a > 0.0 ? c.rgb / c.a : vec3(0.0);
  vec3 rgbGrezzo = rgb;      // il colore com'è nella ripresa, prima di ogni ritocco: la chiave guarda questo
  float a = c.a;
  float aChiave = 1.0;
  if (u_auto) {
    vec3 lv = clamp((rgb - u_autoLo) / max(u_autoHi - u_autoLo, vec3(0.05)), 0.0, 1.0);
    lv = pow(lv * u_autoWb, vec3(u_autoGamma));
    rgb = mix(rgb, clamp(lv, 0.0, 1.0), u_autoK);
  }
  if ((u_look & 1) != 0) {
    // VHS: il colore scappa di lato, righe di tracking, rumore
    float wob = sin(v_uv.y * 180.0 + u_time * 3.0) * 0.0009 + (hash(vec2(floor(v_uv.y * 240.0), u_time)) - 0.5) * 0.0012;
    vec2 uvw = uv0 + vec2(wob, 0.0);
    vec3 cr = src(uvw + vec2(u_texel.x * 3.5, 0.0)).rgb;
    vec3 cb = src(uvw - vec2(u_texel.x * 3.5, 0.0)).rgb;
    vec3 cm = src(uvw).rgb;
    rgb = vec3(cr.r, cm.g, cb.b);
    float band = smoothstep(0.02, 0.0, abs(fract(v_uv.y * 0.6 - u_time * 0.07) - 0.95));
    rgb += band * 0.25 * hash(v_uv * 400.0 + u_time);
    rgb = mix(rgb, vec3(dot(rgb, vec3(.299,.587,.114))), -0.25);
    rgb += (hash(v_uv * vec2(640.0, 480.0) + u_time) - 0.5) * 0.07;
    rgb *= 0.94 + 0.06 * sin(v_uv.y * 900.0);
  }
  if ((u_look & 2) != 0) {
    // pellicola: grana, vignetta, tinta calda, sfarfallio
    float g = (hash(v_uv * 900.0 + fract(u_time * 7.13)) - 0.5) * 0.09;
    rgb = rgb * vec3(1.06, 1.0, 0.9) + g;
    vec2 d = v_uv - 0.5;
    rgb *= 1.0 - dot(d, d) * 0.9;
    rgb *= 0.97 + 0.03 * hash(vec2(u_time, 1.0));
  }
  if ((u_look & 4) != 0) {
    rgb = vec3(dot(rgb, vec3(.299, .587, .114)));
  }
  if ((u_look & 8) != 0) {
    float y = dot(rgb, vec3(.299, .587, .114));
    rgb = vec3(y * 1.07 + 0.05, y * 0.95 + 0.02, y * 0.75);
  }
  if ((u_look & 16) != 0) {
    // tubo catodico: righe, maschera RGB, bordi scuri
    float sl = 0.78 + 0.22 * sin(v_uv.y / u_texel.y * 3.14159);
    int m = int(mod(gl_FragCoord.x, 3.0));
    vec3 mask = m == 0 ? vec3(1.0, 0.8, 0.8) : m == 1 ? vec3(0.8, 1.0, 0.8) : vec3(0.8, 0.8, 1.0);
    rgb *= sl * mask * 1.15;
    vec2 d = v_uv - 0.5;
    rgb *= smoothstep(0.75, 0.35, length(d * vec2(1.0, 1.2)));
  }
  // proc amp (il TBC): nero, guadagno, croma, fase
  rgb = (rgb - 0.5) * u_contrast + 0.5 + u_bright;
  float Y = dot(rgb, vec3(0.299, 0.587, 0.114));
  float I = dot(rgb, vec3(0.596, -0.274, -0.322));
  float Q = dot(rgb, vec3(0.211, -0.523, 0.312));
  float h = radians(u_hue), ch = cos(h), sh = sin(h);
  vec2 iq = vec2(ch * I - sh * Q, sh * I + ch * Q) * u_sat;
  rgb = vec3(Y + 0.956 * iq.x + 0.621 * iq.y, Y - 0.272 * iq.x - 0.647 * iq.y, Y - 1.106 * iq.x + 1.703 * iq.y);
  if (u_temp != 0.0) rgb *= vec3(1.0 + u_temp * 0.18, 1.0 + u_temp * 0.02, 1.0 - u_temp * 0.2);
  if (u_vignette > 0.0) { vec2 dv = v_uv - 0.5; rgb *= 1.0 - u_vignette * smoothstep(0.15, 0.6, dot(dv, dv) * 2.2); }
  rgb = clamp(rgb, 0.0, 1.0);
  // chiave
  if (u_key == 1) {
    float k = smoothstep(u_keyLevel - u_keySoft, u_keyLevel + u_keySoft, Y);
    aChiave = u_keyInv ? 1.0 - k : k;
  } else if (u_key == 2) {
    float k = matteColori(rgbGrezzo);
    if (u_keySfuma > 0.0) {
      // sfuma il bordo: la media della maschera su un anello attorno al punto
      float r = 1.0 + u_keySfuma * 5.0;
      float somma = k;
      for (int i = 0; i < 8; i++) {
        float an = float(i) * 0.785398;
        vec4 s = src(uv0 + vec2(cos(an), sin(an)) * u_texel * r);
        somma += matteColori(s.a > 0.0 ? s.rgb / s.a : vec3(0.0));
      }
      k = somma / 9.0;
    }
    if (u_keyPulisci > 0.0) k = clamp((k - u_keyPulisci * 0.4) / (1.0 - u_keyPulisci * 0.8), 0.0, 1.0);
    aChiave = u_keyInv ? 1.0 - k : k;
    if (u_keySpill > 0.0 && !u_keyInv) rgb = clamp(senzaRiflesso(rgb), 0.0, 1.0);
  } else if (u_key == 3) {
    float m = mix(texture(u_matte, uv0).r, texture(u_matte2, uv0).r, u_matteK);
    float soglia = 0.5 - u_keyBordo * 0.35;
    float mor = 0.03 + u_keySoft * 0.45;
    float k = smoothstep(soglia - mor, soglia + mor, m);
    aChiave = u_keyInv ? 1.0 - k : k;
  }
  a *= aChiave;
  // angoli tondi (e l'ombra, che è lo stesso rettangolo sfumato): distanza dal rettangolo arrotondato, in pixel
  if (u_round > 0.0 || u_feather > 0.0) {
    vec2 lo = u_box.xy * u_boxPx, hi = (vec2(1.0) - u_box.zw) * u_boxPx;
    vec2 q = abs(v_uv * u_boxPx - (lo + hi) * 0.5) - (hi - lo) * 0.5 + vec2(u_round);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - u_round;
    a *= 1.0 - smoothstep(-u_feather, u_feather, d);
  }
  a *= u_alpha;
  if (u_vista == 1 && u_key != 0) { o = vec4(vec3(aChiave), 1.0); return; }
  if (u_vista == 2 && u_key != 0) {
    vec2 g = floor(gl_FragCoord.xy / 14.0);
    vec3 fondo = mix(vec3(0.16), vec3(0.30), mod(g.x + g.y, 2.0));
    o = vec4(rgb * a + fondo * (1.0 - a), 1.0);
    return;
  }
  o = vec4(rgb * a, a);
}`,Ea=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() { v_uv = a_pos; gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Da=`#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_src;
uniform vec3 u_lift, u_gamma, u_gain, u_shadow, u_high;
uniform float u_sat, u_contrast, u_vignette, u_grain, u_time, u_split;
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 c = texture(u_src, v_uv).rgb;
  vec3 r = c;
  if (v_uv.x >= u_split) {
    r = c * u_gain + u_lift * (1.0 - c);
    r = pow(max(r, 0.0), 1.0 / max(u_gamma, vec3(0.1)));
    r = (r - 0.5) * u_contrast + 0.5;
    float y = dot(r, vec3(0.2126, 0.7152, 0.0722));
    r = mix(vec3(y), r, u_sat);
    r += u_shadow * (1.0 - smoothstep(0.0, 0.55, y)) + u_high * smoothstep(0.45, 1.0, y);
    vec2 d = v_uv - 0.5;
    r *= 1.0 - u_vignette * smoothstep(0.12, 0.62, dot(d, d) * 2.0);
    if (u_grain > 0.0) r += (hash(v_uv * vec2(1280.0, 720.0) + fract(u_time * 7.13)) - 0.5) * u_grain;
  }
  if (u_split > 0.0 && abs(v_uv.x - u_split) < 0.0015) r = vec3(1.0, 0.84, 0.29);
  o = vec4(clamp(r, 0.0, 1.0), 1.0);
}`,Oa=`#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_src;
uniform vec2 u_res, u_off;
uniform float u_zoom, u_rot, u_blur, u_pixel, u_rgb, u_glitch, u_seme, u_desat, u_invert, u_flash, u_fade, u_luce, u_lucePh, u_bande, u_vhs, u_time;
uniform float u_bagliore, u_flare, u_flarePh, u_arco, u_arcoPh, u_espo, u_neon, u_onda, u_bolla, u_vortice, u_caleido, u_calore, u_zblur;
uniform float u_eco, u_duo, u_poster, u_solar, u_termico, u_visore, u_retino, u_muto, u_gocce, u_specchio, u_quadri, u_rullo, u_pesce;
uniform float u_raggi, u_bokeh, u_scint, u_anam, u_neve, u_pioggia, u_polvere, u_coriandoli;
uniform float u_olo, u_prisma, u_matita, u_tunnel, u_nebbia, u_braci, u_vetro, u_nosegn, u_iride, u_mini, u_esa, u_scan;
uniform vec3 u_flashCol, u_fadeCol, u_tinta;
uniform vec2 u_centro;   // il centro di zoom e distorsioni (lo sceglie chi posa l'effetto)
uniform vec2 u_sole;     // il sole del riflesso d'obiettivo (x < -1 = passa da solo)
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 campione(vec2 uv) { return texture(u_src, clamp(uv, vec2(0.0005), vec2(0.9995))).rgb; }
vec3 tinta(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
// i colori sdoppiati (rosso e blu che scappano) valgono per ogni campione: così si sommano con sfocatura, neon e bagliore
float g_sp = 0.0;
vec3 camp(vec2 uv) {
  vec3 s = campione(uv);
  if (g_sp > 0.0) { s.r = campione(uv + vec2(g_sp, 0.0)).r; s.b = campione(uv - vec2(g_sp, 0.0)).b; }
  return s;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3 caldo(float y) {
  vec3 c = mix(vec3(0.02, 0.0, 0.16), vec3(0.42, 0.0, 0.62), smoothstep(0.0, 0.25, y));
  c = mix(c, vec3(0.92, 0.1, 0.1), smoothstep(0.25, 0.5, y));
  c = mix(c, vec3(1.0, 0.76, 0.05), smoothstep(0.5, 0.75, y));
  return mix(c, vec3(1.0), smoothstep(0.78, 1.0, y));
}
// le particelle: strati di celle, ognuna con il suo granello che cade o fluttua
float fiocchi(vec2 st, float scala, float vel, float raggio) {
  vec2 g = st * scala;
  g.y += u_time * vel;
  vec2 id = floor(g), f = fract(g);
  float h1 = hash(id), h2 = hash(id + 17.3);
  vec2 ctr = vec2(0.5 + sin(u_time * (0.7 + h1) + h2 * 6.28) * 0.28, 0.2 + 0.6 * h2);
  return step(0.4, h1) * smoothstep(raggio, raggio * 0.3, length(f - ctr));
}
float goccia(vec2 st, float scala, float vel) {
  vec2 s = vec2(st.x + st.y * 0.2, st.y);
  float colonna = floor(s.x * scala);
  float h = hash(vec2(colonna, 3.1));
  float yy = s.y * 1.4 + u_time * vel * (0.8 + 0.6 * h) + h * 9.0;
  float ciclo = floor(yy), ph = fract(yy);
  float c = step(0.55, hash(vec2(colonna, ciclo)));
  float fx = abs(fract(s.x * scala) - 0.5);
  return c * smoothstep(0.1, 0.0, fx) * pow(1.0 - ph, 5.0) * smoothstep(0.0, 0.04, ph);
}
float granello(vec2 st, float scala, float raggio, float seme) {
  vec2 g = st * scala + vec2(sin(u_time * 0.13 + seme), u_time * 0.06 + cos(u_time * 0.1 + seme));
  vec2 id = floor(g), f = fract(g);
  float h1 = hash(id + seme), h2 = hash(id + seme + 3.3), h3 = hash(id + seme + 8.1);
  vec2 ctr = 0.5 + (vec2(h1, h2) - 0.5) * 0.6 + 0.08 * vec2(sin(u_time * 0.7 + h3 * 6.0), cos(u_time * 0.6 + h1 * 6.0));
  float tw = 0.45 + 0.55 * sin(u_time * (0.8 + h2) + h3 * 6.28);
  return step(0.35, h3) * tw * smoothstep(raggio, raggio * 0.2, length(f - ctr));
}
vec3 bokehStrato(vec2 st, float scala, float vel, float raggio, float seme) {
  vec2 g = st * scala + vec2(u_time * vel * 0.4, u_time * vel);
  vec2 id = floor(g), f = fract(g);
  float h1 = hash(id + seme), h2 = hash(id + seme + 11.7), h3 = hash(id + seme + 5.3);
  vec2 ctr = 0.5 + (vec2(h1, h2) - 0.5) * 0.35;
  float d = length(f - ctr), r = raggio * (0.6 + 0.8 * h3);
  float disco = smoothstep(r, r * 0.88, d) * (0.4 + 0.6 * smoothstep(r * 0.55, r * 0.95, d));
  float tw = 0.5 + 0.5 * sin(u_time * (0.5 + h1) + h2 * 6.28);
  return u_tinta * disco * tw * step(0.5, h3);
}
vec3 scintStrato(vec2 st, float scala, float seme) {
  vec2 g = st * scala;
  vec2 id = floor(g), f = fract(g);
  float h1 = hash(id + seme), h2 = hash(id + seme + 3.7), h3 = hash(id + seme + 9.1);
  vec2 p = f - (0.5 + (vec2(h1, h2) - 0.5) * 0.6);
  float s = 0.05 + 0.05 * h2;
  float ph = fract(u_time * (0.25 + 0.4 * h3) + h1 * 3.0);
  float lampo = pow(sin(ph * 3.14159), 5.0);
  float core = exp(-dot(p, p) / (s * s * 0.06));
  float croce = exp(-abs(p.x) / (s * 0.05)) * exp(-abs(p.y) / (s * 1.8)) + exp(-abs(p.y) / (s * 0.05)) * exp(-abs(p.x) / (s * 1.8));
  return u_tinta * (core + croce * 0.55) * lampo * step(0.45, h3);
}
vec4 coriStrato(vec2 st, float scala, float vel, float seme) {
  vec2 g = st * scala;
  g.y += u_time * vel;
  vec2 id = floor(g), f = fract(g);
  float h1 = hash(id + seme), h2 = hash(id + seme + 7.7), h3 = hash(id + seme + 2.3);
  vec2 ctr = vec2(0.2 + 0.6 * h1 + 0.1 * sin(u_time * (1.0 + h2) * 2.0 + h3 * 6.0), 0.2 + 0.6 * h2);
  float a = u_time * (1.5 + 3.0 * h3) + h1 * 6.28;
  vec2 p = f - ctr;
  p = vec2(cos(a) * p.x - sin(a) * p.y, sin(a) * p.x + cos(a) * p.y);
  float w = 0.06 * abs(cos(u_time * (2.0 + 3.0 * h2) + h1 * 9.0)) + 0.008;
  float m = step(abs(p.x), 0.085) * step(abs(p.y), w) * step(0.3, h3);
  return vec4(tinta(h1) * (0.75 + 0.25 * h2) + 0.15, m);
}
float rum(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// le braci: puntini caldi che salgono e brillano
float brace(vec2 st, float scala, float vel, float seme) {
  vec2 g = st * scala;
  g.y -= u_time * vel;
  vec2 id = floor(g), f = fract(g);
  float h1 = hash(id + seme), h2 = hash(id + seme + 5.3), h3 = hash(id + seme + 9.7);
  vec2 ctr = vec2(0.5 + 0.3 * sin(u_time * (1.0 + h1) * 1.5 + h2 * 6.28), 0.3 + 0.4 * h2);
  float tw = 0.4 + 0.6 * sin(u_time * (3.0 + 4.0 * h2) + h3 * 6.28);
  return step(0.5, h3) * max(tw, 0.0) * smoothstep(0.12, 0.0, length(f - ctr));
}
void main() {
  float asp = u_res.x / u_res.y;
  // zoom e rotazione attorno al centro, poi lo spostamento (scossa, camera a mano)
  vec2 c = (v_uv - u_centro) * vec2(asp, 1.0);
  float cr = cos(u_rot), sr = sin(u_rot);
  c = vec2(cr * c.x - sr * c.y, sr * c.x + cr * c.y) / u_zoom;
  // le distorsioni: tutte sulle coordinate, così si sommano fra loro e con lo zoom
  float rr = length(c);
  if (u_pesce > 0.0) c *= (1.0 + u_pesce * 0.55 * rr * rr) / (1.0 + u_pesce * 0.3);
  if (u_gocce > 0.0) c += c / max(rr, 1e-4) * sin(rr * 42.0 - u_time * 8.0) * 0.011 * u_gocce * exp(-rr * 1.6);
  rr = length(c);
  if (u_caleido > 0.0) {
    float seg = 6.2831853 / 6.0;
    float a = mod(atan(c.y, c.x) + u_time * 0.2, seg);
    a = abs(a - seg * 0.5);
    c = mix(c, vec2(cos(a), sin(a)) * rr, u_caleido);
  }
  if (u_vortice > 0.0) {
    float ang = u_vortice * 2.6 * max(0.0, 1.0 - rr * 1.4);
    c = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y);
  }
  // bolla (positiva) e pizzico (negativa): la stessa lente, un verso o l'altro
  if (u_bolla != 0.0) c *= 1.0 - u_bolla * 0.45 * (1.0 - smoothstep(0.0, 0.55, rr));
  vec2 uv = c / vec2(asp, 1.0) + u_centro + u_off;
  if (u_tunnel > 0.0) {
    // il tunnel: l'immagine dentro l'immagine, in una zoomata senza fine (le copie rientrano nella cornice)
    float sc = mix(1.0, 2.4, min(1.0, u_tunnel));
    vec2 tq = (uv - u_centro) * pow(sc, fract(u_time * 0.35));
    float tm = max(abs(tq.x), abs(tq.y));
    for (int i = 0; i < 8; i++) {
      if (tm > 0.5) { tq /= sc; tm /= sc; } else if (tm < 0.5 / sc) { tq *= sc; tm *= sc; }
    }
    uv = mix(uv, u_centro + tq, min(1.0, u_tunnel));
  }
  if (u_prisma > 0.0) {
    // schegge oblique che spostano ognuna un po' l'immagine
    vec2 pg = uv * vec2(asp, 1.0) * 6.0;
    pg = vec2(pg.x + pg.y * 0.5, pg.y);
    uv += (vec2(hash(floor(pg) + 1.7), hash(floor(pg) + 4.1)) - 0.5) * 0.07 * u_prisma;
  }
  if (u_vetro > 0.0) {
    vec2 cella = floor(uv * u_res / 4.0);
    uv += (vec2(hash(cella), hash(cella + 9.1)) - 0.5) * 0.02 * u_vetro + vec2(sin(uv.y * 90.0), sin(uv.x * 70.0)) * 0.003 * u_vetro;
  }
  if (u_quadri > 0.0) { vec2 m = uv * (1.0 + u_quadri); uv = 1.0 - abs(1.0 - mod(m, 2.0)); }
  if (u_specchio > 0.0) uv.x = mix(uv.x, min(uv.x, 1.0 - uv.x), min(1.0, u_specchio));
  float roll = 0.0;
  if (u_rullo > 0.0) { roll = fract(u_time * 0.8) * min(1.0, u_rullo); uv.y = mod(uv.y + roll, 1.0); }
  if (u_onda > 0.0) uv += vec2(sin(uv.y * 22.0 + u_time * 7.0) * 0.018, sin(uv.x * 16.0 + u_time * 5.0) * 0.01) * u_onda;
  if (u_calore > 0.0) uv += vec2(sin(uv.y * 70.0 + u_time * 13.0) + sin(uv.y * 31.0 - u_time * 9.0), cos(uv.x * 55.0 + u_time * 11.0)) * 0.0022 * u_calore;
  if (u_glitch > 0.0) {
    float riga = floor(uv.y * 28.0);
    if (hash(vec2(riga, u_seme)) > 1.0 - u_glitch * 0.55) uv.x += (hash(vec2(riga * 3.1, u_seme + 1.0)) - 0.5) * 0.18 * u_glitch;
  }
  if (u_vhs > 0.0) uv.x += sin(uv.y * 120.0 + u_time * 9.0) * 0.0025 * u_vhs + (hash(vec2(floor(uv.y * 200.0), u_time)) - 0.5) * 0.004 * u_vhs;
  if (u_pixel > 0.0) {
    float lato = mix(1.0, 80.0, u_pixel * u_pixel) / u_res.y;
    vec2 cella = vec2(lato / asp, lato);
    uv = (floor(uv / cella) + 0.5) * cella;
  }
  if (u_esa > 0.0) {
    // mosaico di esagoni
    float nn = mix(160.0, 14.0, min(1.0, u_esa));
    vec2 pe = uv * vec2(asp, 1.0) * nn;
    const vec2 szh = vec2(1.0, 1.7320508);
    vec4 hc = floor(vec4(pe, pe - vec2(1.0, 1.5)) / szh.xyxy) + 0.5;
    vec4 hh = vec4(pe - hc.xy * szh, pe - (hc.zw + 0.5) * szh);
    vec2 idc = dot(hh.xy, hh.xy) < dot(hh.zw, hh.zw) ? hc.xy : hc.zw + 0.5;
    uv = mix(uv, idc * szh / nn / vec2(asp, 1.0), min(1.0, u_esa * 4.0));
  }
  g_sp = u_rgb * 0.014 + u_glitch * 0.012 + u_vhs * 0.004 + u_prisma * 0.012 + u_olo * 0.003;
  vec3 col;
  if (u_blur > 0.0 || u_zblur > 0.0) {
    // sfocatura a disco (spirale d'oro) e scia verso il centro nello stesso giro: sfoca e zoom sfocato si sommano
    float r = u_blur * 0.035;
    col = vec3(0.0);
    for (int i = 0; i < 24; i++) {
      float fi = float(i);
      float a = fi * 2.39996;
      vec2 pos = mix(uv, u_centro, fi / 23.0 * u_zblur * 0.22);
      col += camp(pos + vec2(cos(a), sin(a)) * sqrt((fi + 0.5) / 24.0) * r * vec2(1.0 / asp, 1.0));
    }
    col /= 24.0;
  } else col = camp(uv);
  if (u_eco > 0.0) {
    // l'eco: due copie sfasate che rincorrono l'immagine
    vec3 g1 = camp(uv - vec2(0.02, 0.012) * u_eco), g2 = camp(uv - vec2(0.045, 0.026) * u_eco);
    col = mix(col, col * 0.55 + g1 * 0.3 + g2 * 0.15, min(1.0, u_eco));
  }
  if (u_neon > 0.0) {
    // i contorni: dove la luce cambia di colpo si accende il tubo, il resto si spegne
    vec2 px = 1.5 / u_res;
    float l = dot(camp(uv + vec2(px.x, 0.0)) - camp(uv - vec2(px.x, 0.0)), vec3(0.33));
    float m = dot(camp(uv + vec2(0.0, px.y)) - camp(uv - vec2(0.0, px.y)), vec3(0.33));
    float bordo = clamp(length(vec2(l, m)) * 5.0, 0.0, 1.0);
    vec3 luceNeon = tinta(fract(uv.x * 0.6 + uv.y * 0.3 + u_time * 0.15)) * bordo * 2.2;
    col = mix(col, col * 0.18 + luceNeon, u_neon);
  }
  if (u_bagliore > 0.0) {
    // le parti chiare si allargano (il bloom delle lenti)
    vec3 g = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 0.5236;
      vec3 s = camp(uv + vec2(cos(a), sin(a)) * 0.022 * vec2(1.0 / asp, 1.0));
      g += max(s - 0.5, 0.0);
    }
    col += g / 12.0 * 2.2 * u_bagliore + col * 0.08 * u_bagliore;
  }
  if (u_anam > 0.0) {
    // le luci forti si allungano di lato in strisce azzurre (la lente anamorfica)
    vec3 st = vec3(0.0);
    for (int i = -10; i <= 10; i++) {
      float w = 1.0 - abs(float(i)) / 11.0;
      st += max(camp(uv + vec2(float(i) * 0.011, 0.0)) - 0.55, 0.0) * w;
    }
    col += st / 5.0 * vec3(0.3, 0.55, 1.0) * u_anam * 3.0;
  }
  if (u_raggi > 0.0) {
    // i raggi di luce: le parti chiare si stirano verso fuori dal punto scelto
    vec3 g = vec3(0.0);
    for (int i = 0; i < 20; i++) {
      float t = float(i) / 19.0;
      g += max(camp(mix(uv, u_centro, t * 0.55)) - 0.72, 0.0) * (1.0 - t);
    }
    col += g / 8.0 * vec3(1.0, 0.86, 0.6) * u_raggi * 2.4;
  }
  col *= 1.0 + u_espo;
  float y = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(y), u_desat);
  col = mix(col, 1.0 - col, u_invert);
  // il colore: ognuno rifà i colori a modo suo, e si sommano l'uno sull'altro nell'ordine in cui sono scritti
  if (u_solar > 0.0) col = mix(col, mix(col, 1.0 - col, smoothstep(0.42, 0.58, col)), min(1.0, u_solar));
  if (u_termico > 0.0) col = mix(col, caldo(luma(col)), min(1.0, u_termico));
  if (u_duo > 0.0) {
    float yy = luma(col);
    vec3 d = mix(u_tinta * 0.12, mix(u_tinta, vec3(1.0), 0.8), smoothstep(0.05, 0.95, yy));
    col = mix(col, d, min(1.0, u_duo));
  }
  if (u_poster > 0.0) {
    float n = mix(24.0, 4.0, min(1.0, u_poster));
    col = mix(col, floor(col * n + 0.5) / n, min(1.0, u_poster));
  }
  if (u_visore > 0.0) {
    float yy = pow(clamp(luma(col) * 1.5, 0.0, 1.0), 0.8);
    float n = (hash(v_uv * vec2(900.0, 600.0) + fract(u_time * 13.7)) - 0.5) * 0.28;
    float sl = 0.86 + 0.14 * sin(v_uv.y * u_res.y * 1.4);
    vec3 g = vec3(0.1, 1.0, 0.28) * (yy + n) * sl;
    g *= smoothstep(1.0, 0.4, length((v_uv - 0.5) * vec2(asp * 0.75, 1.0)));
    col = mix(col, g, min(1.0, u_visore));
  }
  if (u_retino > 0.0) {
    // il retino: puntini più grossi dove è scuro, su carta chiara
    vec2 gp = v_uv * vec2(asp, 1.0) * 80.0;
    vec2 cella = fract(gp) - 0.5;
    float yy = luma(col);
    float r = sqrt(clamp(1.0 - yy, 0.0, 1.0)) * 0.7;
    float punto = smoothstep(r, r - 0.14, length(cella));
    vec3 pop = mix(vec3(0.98, 0.95, 0.88), clamp(col * 1.15, 0.0, 1.0) * 0.85, punto);
    col = mix(col, pop, min(1.0, u_retino));
  }
  if (u_muto > 0.0) {
    // il film muto: bianco e nero caldo, sfarfallio, graffi verticali, polvere, bordi scuri
    float yy = luma(col);
    vec3 s = vec3(yy * 1.05 + 0.04, yy * 0.96 + 0.02, yy * 0.8);
    float fotogramma = floor(u_time * 12.0);
    s *= 0.9 + 0.1 * hash(vec2(fotogramma, 1.0));
    s += step(0.996, hash(vec2(floor(v_uv.x * 260.0), fotogramma))) * 0.35;
    s += step(0.9985, hash(floor(v_uv * vec2(160.0, 90.0)) + fotogramma)) * 0.5;
    s += (hash(v_uv * vec2(700.0, 500.0) + fract(u_time * 9.0)) - 0.5) * 0.08;
    s *= smoothstep(0.95, 0.35, length((v_uv - 0.5) * vec2(1.2, 1.0)));
    col = mix(col, s, min(1.0, u_muto));
  }
  if (u_olo > 0.0) {
    // l'ologramma: azzurro, righe che scorrono, sfarfallio e una banda luminosa
    float yy = luma(col);
    float righe = 0.72 + 0.28 * sin(v_uv.y * u_res.y * 0.8 - u_time * 5.0);
    float trem = 0.88 + 0.12 * hash(vec2(floor(u_time * 20.0), 3.0));
    vec3 hol = vec3(0.25, 0.85, 1.0) * (yy * 1.25 + 0.06) * righe * trem;
    hol += vec3(0.4, 0.9, 1.0) * smoothstep(0.03, 0.0, abs(fract(v_uv.y * 0.5 - u_time * 0.2) - 0.5)) * 0.25;
    col = mix(col, hol, min(1.0, u_olo));
  }
  if (u_matita > 0.0) {
    // lo schizzo: contorni scuri, tratteggio nelle ombre, carta con la grana
    vec2 px = 1.3 / u_res;
    float gx = luma(camp(uv + vec2(px.x, 0.0))) - luma(camp(uv - vec2(px.x, 0.0)));
    float gy = luma(camp(uv + vec2(0.0, px.y))) - luma(camp(uv - vec2(0.0, px.y)));
    float bordo = clamp(length(vec2(gx, gy)) * 7.0, 0.0, 1.0);
    float yy = luma(col);
    float tratti = step(0.5, fract((v_uv.x * asp + v_uv.y) * u_res.y * 0.06 + hash(floor(v_uv * u_res / 6.0)) * 0.3)) * smoothstep(0.55, 0.15, yy) * 0.55;
    vec3 carta = vec3(0.96, 0.94, 0.88) + (hash(v_uv * u_res) - 0.5) * 0.06;
    vec3 sk = carta * (1.0 - clamp(bordo + tratti, 0.0, 1.0) * 0.82);
    col = mix(col, sk * mix(vec3(1.0), col * 1.5, 0.18), min(1.0, u_matita));
  }
  if (u_mini > 0.0) {
    // la miniatura: fuoco solo in una fascia (attorno al centro), fuori sfocato, e colori più pieni
    float dist = abs(v_uv.y - u_centro.y);
    float r = smoothstep(0.08, 0.34, dist) * 0.03 * u_mini;
    vec3 bl = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 0.5236;
      bl += camp(uv + vec2(cos(a), sin(a)) * r * vec2(1.0 / asp, 1.0));
    }
    col = mix(col, bl / 12.0, smoothstep(0.0, 0.004, r));
    col = mix(vec3(luma(col)), col, 1.0 + 0.5 * min(1.0, u_mini));
  }
  if (u_rullo > 0.0) col *= 1.0 - 0.85 * smoothstep(0.045, 0.0, abs(v_uv.y - (1.0 - roll))) * min(1.0, u_rullo);
  if (u_vhs > 0.0) {
    col += (hash(v_uv * vec2(640.0, 480.0) + u_time) - 0.5) * 0.12 * u_vhs;
    col += smoothstep(0.03, 0.0, abs(fract(v_uv.y * 0.7 - u_time * 0.35) - 0.9)) * 0.35 * u_vhs;
  }
  if (u_luce > 0.0) {
    // la lama di luce calda che attraversa il quadro
    float x = v_uv.x + (v_uv.y - 0.5) * 0.35;
    float lama = exp(-pow((x - mix(-0.2, 1.2, u_lucePh)) * 3.2, 2.0));
    col += vec3(1.0, 0.55, 0.2) * lama * u_luce * 0.9 + vec3(1.0, 0.85, 0.6) * pow(lama, 3.0) * u_luce * 0.5;
  }
  if (u_arco > 0.0) {
    // la scia di colori che attraversa in diagonale (come la luce che entra dalla pellicola)
    float d = v_uv.x * 0.8 + (1.0 - v_uv.y) * 0.45 - mix(-0.3, 1.5, u_arcoPh);
    float banda = exp(-d * d * 7.0);
    vec3 arco = tinta(fract(d * 1.3 + 0.1));
    col = 1.0 - (1.0 - col) * (1.0 - arco * banda * u_arco * 0.75);
  }
  if (u_flare > 0.0) {
    // il riflesso d'obiettivo: la sorgente che passa in alto, la striscia orizzontale e gli aloni verso il centro
    vec2 sole = u_sole.x < -1.0 ? vec2(mix(-0.1, 1.1, u_flarePh), 0.28) : u_sole;
    vec2 d = (v_uv - vec2(sole.x, 1.0 - sole.y)) * vec2(asp, 1.0);
    vec3 fl = vec3(1.0, 0.92, 0.75) * exp(-dot(d, d) * 60.0) * 1.4 + vec3(1.0, 0.8, 0.55) * exp(-abs(d.y) * 90.0) * exp(-abs(d.x) * 1.8) * 0.55;
    for (int i = 1; i <= 3; i++) {
      vec2 g = mix(vec2(sole.x, 1.0 - sole.y), vec2(0.5), 0.5 + float(i) * 0.45);
      vec2 dg = (v_uv - g) * vec2(asp, 1.0);
      float an = smoothstep(0.08 * float(i), 0.07 * float(i), length(dg)) * 0.12;
      fl += tinta(0.08 * float(i) + 0.5) * an;
    }
    col += fl * u_flare;
  }
  // le particelle e le luci che fluttuano stanno sopra l'immagine (e sotto i lampi e le dissolvenze)
  vec2 st = v_uv * vec2(asp, 1.0);
  if (u_bokeh > 0.0) col += (bokehStrato(st, 2.0, 0.04, 0.3, 0.0) + bokehStrato(st, 3.2, 0.06, 0.26, 4.0) + bokehStrato(st, 5.0, 0.09, 0.22, 9.0)) * 0.55 * min(1.5, u_bokeh);
  if (u_scint > 0.0) col += (scintStrato(st, 4.0, 0.0) + scintStrato(st, 7.0, 5.0) + scintStrato(st, 11.0, 12.0)) * min(1.5, u_scint);
  if (u_polvere > 0.0) col += vec3(1.0, 0.95, 0.8) * (granello(st, 10.0, 0.07, 0.0) + granello(st, 17.0, 0.055, 3.0) + granello(st, 26.0, 0.04, 7.0)) * 1.6 * min(1.5, u_polvere);
  if (u_neve > 0.0) {
    float fl = fiocchi(st, 7.0, 0.35, 0.22) + fiocchi(st + 3.1, 13.0, 0.55, 0.17) + fiocchi(st + 7.7, 22.0, 0.8, 0.12);
    col = mix(col, vec3(1.0), clamp(fl, 0.0, 1.0) * min(1.0, u_neve) * 0.95);
  }
  if (u_pioggia > 0.0) {
    float pi = goccia(st, 55.0, 1.6) + goccia(st + 2.3, 85.0, 2.1) + goccia(st + 5.1, 120.0, 2.7);
    col *= 1.0 - 0.14 * min(1.0, u_pioggia);
    col = mix(col, vec3(0.85, 0.9, 1.0), clamp(pi * 2.2, 0.0, 1.0) * min(1.0, u_pioggia) * 0.8);
  }
  if (u_coriandoli > 0.0) {
    for (int i = 0; i < 3; i++) {
      vec4 k = coriStrato(st + float(i) * 3.7, 6.0 + float(i) * 4.0, 0.5 + float(i) * 0.25, float(i) * 5.0);
      col = mix(col, k.rgb, k.a * min(1.0, u_coriandoli));
    }
  }
  if (u_nebbia > 0.0) {
    float nn = 0.0, am = 0.5;
    vec2 z = st * 2.2 + vec2(u_time * 0.04, 0.0);
    for (int i = 0; i < 5; i++) { nn += am * rum(z); z *= 2.0; am *= 0.5; }
    float dens = clamp((nn - 0.28) * 1.7, 0.0, 1.0) * min(1.0, u_nebbia) * (1.0 - v_uv.y * 0.4);
    col = mix(col, vec3(0.8, 0.84, 0.88), dens * 0.8);
  }
  if (u_braci > 0.0) {
    float br = brace(st, 9.0, 0.5, 0.0) + brace(st + 3.7, 15.0, 0.75, 4.0) + brace(st + 8.1, 24.0, 1.0, 9.0);
    col += (vec3(1.0, 0.5, 0.1) * br * 1.6 + vec3(1.0, 0.35, 0.05) * pow(1.0 - v_uv.y, 4.0) * 0.3) * min(1.5, u_braci);
  }
  if (u_scan > 0.0) {
    float d = v_uv.y - fract(u_time * 0.5);
    col += vec3(0.4, 1.0, 0.85) * (exp(-abs(d) * 55.0) * 0.9 + step(d, 0.0) * exp(d * 5.0) * 0.12) * min(1.0, u_scan);
  }
  if (u_nosegn > 0.0) {
    // il segnale che non prende: barre e neve, a scatti
    float fase = floor(u_time * 15.0);
    float bb = floor(v_uv.x * 7.0);
    vec3 barre = vec3(step(0.5, float(bb == 0.0 || bb == 1.0 || bb == 4.0 || bb == 5.0)), step(0.5, float(bb < 4.0)), step(0.5, float(bb == 0.0 || bb == 2.0 || bb == 4.0 || bb == 6.0)));
    float nv = hash(floor(v_uv * vec2(320.0, 180.0)) + fase);
    vec3 sig = mix(barre * 0.8, vec3(nv), 0.45);
    col = mix(col, sig, smoothstep(0.3, 0.7, min(1.0, u_nosegn) * (0.55 + 0.45 * hash(vec2(fase, 1.0)))));
  }
  col = mix(col, u_flashCol, u_flash);
  col = mix(col, u_fadeCol, u_fade);
  if (u_iride > 0.0) {
    // l'iride: fuori dal cerchio è nero
    float rd = length((v_uv - u_centro) * vec2(asp, 1.0));
    float ir = (1.0 - min(1.0, u_iride)) * length(vec2(asp, 1.0) * 0.5 + abs(u_centro - 0.5) * vec2(asp, 1.0)) * 1.05;
    col *= 1.0 - smoothstep(ir - 0.01, ir, rd);
  }
  if (u_bande > 0.0) {
    float b = u_bande * max(0.0, (1.0 - asp / 2.39) * 0.5);
    if (v_uv.y < b || v_uv.y > 1.0 - b) col = vec3(0.0);
  }
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`,ka=`#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_a, u_b;
uniform bool u_hasA;
uniform int u_mode;        // 0 solo B, 1 mix, 2 tendina, 3 passaggio a colore, 4 effetto digitale
uniform float u_p, u_opacity, u_soft, u_border, u_aspect;
uniform int u_pattern;
uniform bool u_reverse;
uniform vec3 u_borderColor, u_dipColor;
uniform int u_dir;         // effetti digitali: la direzione, in quarti di giro
uniform float u_forza;     // effetti digitali: quanto è forte (scia, onda, sfocatura…)
uniform int u_curva;       // come corre: 0 come vuole l'effetto, 1 dolce, 2 parte piano, 3 arriva piano
out vec4 o;
float asp = 1.0;           // il rapporto del quadro (girato con la direzione)
float P = 0.0;             // l'avanzamento, dopo la curva

// q: coordinate dello schermo, 0..1 con y verso il basso. Fuori dal quadro = trasparente.
bool fuori(vec2 q) { return q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0; }
// la direzione: l'effetto gira di quarti di giro attorno al centro, le immagini restano dritte
vec2 gira(vec2 q, int d) {
  vec2 v = q - 0.5;
  if (d == 1) v = vec2(-v.y, v.x); else if (d == 2) v = -v; else if (d == 3) v = vec2(v.y, -v.x);
  return v + 0.5;
}
vec4 tA(vec2 q) { vec2 r = gira(q, u_dir); return (!u_hasA || fuori(r)) ? vec4(0.0) : texture(u_a, vec2(r.x, 1.0 - r.y)); }
vec4 tB(vec2 q) { vec2 r = gira(q, u_dir); return fuori(r) ? vec4(0.0) : texture(u_b, vec2(r.x, 1.0 - r.y)); }
vec4 sopra(vec4 b, vec4 a) { return b + a * (1.0 - b.a); }
float caso(float x) { return fract(sin(x * 91.3458) * 47453.5453); }
float dolce(float t) { return t * t * (3.0 - 2.0 * t); }
// il rumore morbido (per l'inchiostro): valori a caso sulla griglia, sfumati in mezzo
float rumoreV(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float a = caso(i.x + i.y * 57.0), b = caso(i.x + 1.0 + i.y * 57.0);
  float c = caso(i.x + (i.y + 1.0) * 57.0), d = caso(i.x + 1.0 + (i.y + 1.0) * 57.0);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
// la palla che cade e rimbalza (0 in alto, 1 a terra)
float rimbalzo(float x) {
  float n1 = 7.5625, d1 = 2.75;
  if (x < 1.0 / d1) return n1 * x * x;
  if (x < 2.0 / d1) { x -= 1.5 / d1; return n1 * x * x + 0.75; }
  if (x < 2.5 / d1) { x -= 2.25 / d1; return n1 * x * x + 0.9375; }
  x -= 2.625 / d1;
  return n1 * x * x + 0.984375;
}

float campo(vec2 uv) {
  vec2 c = uv - 0.5;
  if (u_pattern == 1) return uv.x;
  if (u_pattern == 2) return uv.y;
  if (u_pattern == 3) return max(uv.x, uv.y);
  if (u_pattern == 4) return max(1.0 - uv.x, uv.y);
  if (u_pattern == 21) return abs(c.x) * 2.0;
  if (u_pattern == 22) return abs(c.y) * 2.0;
  if (u_pattern == 41) return (uv.x + uv.y) * 0.5;
  if (u_pattern == 42) return (uv.x + 1.0 - uv.y) * 0.5;
  if (u_pattern == 61) return uv.x * 0.7 + abs(uv.y - 0.5) * 0.6;
  if (u_pattern == 62) return uv.x * 0.7 + (0.5 - abs(uv.y - 0.5)) * 0.6;
  if (u_pattern == 103) return min(abs(c.x), abs(c.y)) * 2.0;
  if (u_pattern == 122) return uv.x * 0.88 + (sin(uv.y * 12.0) * 0.5 + 0.5) * 0.12;
  if (u_pattern == 123) return uv.x * 0.85 + abs(fract(uv.y * 8.0) - 0.5) * 0.3;
  if (u_pattern == 202) return fract(fract(atan(c.x, -c.y) / 6.2831853 + 1.0) * 3.0);
  if (u_pattern == 101) return max(abs(c.x), abs(c.y)) * 2.0;
  if (u_pattern == 102) return abs(c.x) + abs(c.y);
  if (u_pattern == 119) return length(c * vec2(asp, 1.0)) / length(vec2(asp, 1.0) * 0.5);
  if (u_pattern == 201) return fract(atan(c.x, -c.y) / 6.2831853 + 1.0);
  if (u_pattern == 7) return fract((uv.x * 8.0)) ; // veneziana
  return uv.x;
}

// forme per le tendine a sagoma: distanza con segno (negativa dentro), di Inigo Quilez
float sdStella(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}
float d2(vec2 v) { return dot(v, v); }
float sdCuore(vec2 p) {
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(d2(p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  return sqrt(min(d2(p - vec2(0.0, 1.0)), d2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

vec4 tendina(vec2 q, vec4 A, vec4 B) {
  float s = max(u_soft, 0.0005);
  if (u_pattern == 120 || u_pattern == 121) {
    // la sagoma cresce dal centro fino a coprire tutto il quadro
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    c.y = -c.y;
    float mezzaDiag = length(vec2(asp, 1.0) * 0.5);
    float k = u_reverse ? 1.0 - P : P;
    float d;
    if (u_pattern == 120) { float r = k * mezzaDiag * 3.4 + 0.0001; d = sdStella(c, r, 0.45); }
    else { float sc = k * mezzaDiag * 4.2 + 0.0001; d = sdCuore(c / sc + vec2(0.0, 0.5)) * sc; }
    float m = 1.0 - smoothstep(-s * 0.5, s * 0.5, d);
    if (u_reverse) m = 1.0 - m;
    vec4 r = mix(A, B, m);
    if (u_border > 0.0) {
      float bm = smoothstep(-s * 0.5, s * 0.5, d) * (1.0 - smoothstep(u_border * 0.6 - s * 0.5, u_border * 0.6 + s * 0.5, d));
      r = mix(r, vec4(u_borderColor, 1.0), bm * step(0.001, P) * step(P, 0.999));
    }
    return r;
  }
  float f = campo(q);
  if (u_reverse) f = 1.0 - f;
  float e = P * (1.0 + 2.0 * s + u_border) - s - u_border;
  float m = 1.0 - smoothstep(e - s, e, f);
  vec4 r = mix(A, B, m);
  if (u_border > 0.0) {
    float bm = smoothstep(e - s, e, f) * (1.0 - smoothstep(e + u_border - s, e + u_border, f));
    r = mix(r, vec4(u_borderColor, 1.0), bm);
  }
  return r;
}

// un piano (la faccia di un cubo o una cartolina) visto da un occhio davanti allo schermo
vec2 ruotaY(vec2 xz, float a) { float c = cos(a), s = sin(a); return vec2(c * xz.x - s * xz.y, s * xz.x + c * xz.y); }

// celle a caso (Voronoi): ritorna il centro del pezzo più vicino (in coordinate della griglia) e il suo numero
vec4 pezzo(vec2 g) {
  vec2 id = floor(g), f = fract(g);
  float best = 9.0;
  vec4 r = vec4(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 nb = vec2(float(i), float(j));
    vec2 pt = nb + vec2(caso(dot(id + nb, vec2(3.1, 7.3))), caso(dot(id + nb, vec2(5.7, 2.9))));
    float d = length(pt - f);
    if (d < best) { best = d; r = vec4(id + pt, id + nb); }
  }
  return r;
}

vec4 effetto(vec2 q, float p) {
  float e = dolce(p);
  float arco = sin(p * 3.14159265) * min(u_forza, 1.6);
  if (u_pattern == 301) return q.x < 1.0 - e ? tA(q + vec2(e, 0.0)) : tB(q - vec2(1.0 - e, 0.0));
  if (u_pattern == 302) return q.x > e ? tA(q - vec2(e, 0.0)) : tB(q + vec2(1.0 - e, 0.0));
  if (u_pattern == 303) return q.y < 1.0 - e ? tA(q + vec2(0.0, e)) : tB(q - vec2(0.0, 1.0 - e));
  if (u_pattern == 304) return q.y > e ? tA(q - vec2(0.0, e)) : tB(q + vec2(0.0, 1.0 - e));
  if (u_pattern == 311) return q.x >= 1.0 - e ? sopra(tB(q - vec2(1.0 - e, 0.0)), tA(q)) : tA(q);
  if (u_pattern == 321) {
    vec2 c = q - 0.5;
    float sa = 1.0 + e * 1.6, sb = 1.0 + (1.0 - e) * 1.6;
    vec4 a = vec4(0.0), b = vec4(0.0);
    for (int i = 0; i < 10; i++) {
      float k = float(i) / 9.0 * arco * 0.35;
      a += tA(0.5 + c / (sa + k));
      b += tB(0.5 + c / (sb + k));
    }
    return mix(a / 10.0, b / 10.0, smoothstep(0.4, 0.6, p));
  }
  if (u_pattern == 331) {
    float lato = mix(0.0015, 0.075, 1.0 - abs(2.0 * p - 1.0));
    vec2 cella = vec2(lato / asp, lato);
    vec2 qq = (floor(q / cella) + 0.5) * cella;
    return mix(tA(qq), tB(qq), smoothstep(0.45, 0.55, p));
  }
  if (u_pattern == 341) {
    vec2 d = q - 0.5;
    float r = length(d * vec2(asp, 1.0));
    vec2 w = d / max(r, 1e-4) * sin(r * 42.0 - p * 32.0) * arco * 0.028;
    return mix(tA(q + w), tB(q + w), smoothstep(0.3, 0.7, p));
  }
  if (u_pattern == 351) {
    vec4 m = mix(tA(q), tB(q), smoothstep(0.45, 0.55, p));
    return mix(m, vec4(1.0), pow(arco, 3.0));
  }
  if (u_pattern == 361) {
    vec4 m = mix(tA(q), tB(q), smoothstep(0.35, 0.65, p));
    float n = sin(q.x * 6.0 + p * 9.0) * 0.5 + sin(q.y * 9.0 - p * 7.0 + q.x * 3.0) * 0.5;
    float fronte = smoothstep(0.0, 1.0, (q.x * 0.9 + n * 0.22 + 0.25 - (1.0 - p) * 1.3) * 2.2);
    float l = arco * fronte * 1.5;
    vec3 luce = vec3(1.0, 0.55, 0.18) * l + vec3(1.0, 0.92, 0.7) * pow(l, 4.0);
    return vec4(min(vec3(1.0), m.rgb + luce), max(m.a, min(1.0, l)));
  }
  if (u_pattern == 371) {
    float fase = floor(p * 18.0);
    float riga = floor(q.y * 26.0);
    float h = caso(riga * 13.7 + fase * 7.3);
    float sh = (h - 0.5) * 0.25 * arco * step(0.55, caso(riga + fase * 1.7));
    vec2 qq = q + vec2(sh, 0.0);
    float sw = step(caso(fase * 3.1 + riga * 0.7), p);
    float rs = 0.014 * arco;
    vec4 base = mix(tA(qq), tB(qq), sw);
    vec4 r1 = mix(tA(qq + vec2(rs, 0.0)), tB(qq + vec2(rs, 0.0)), sw);
    vec4 b1 = mix(tA(qq - vec2(rs, 0.0)), tB(qq - vec2(rs, 0.0)), sw);
    return vec4(r1.r, base.g, b1.b, base.a);
  }
  if (u_pattern == 381) {
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float ang = arco * 3.0 * max(0.0, 1.0 - length(c) * 1.2);
    vec2 r = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y) / vec2(asp, 1.0) + 0.5;
    return mix(tA(r), tB(r), smoothstep(0.35, 0.65, p));
  }
  if (u_pattern == 391) {
    float rad = arco * 0.028;
    vec4 a = vec4(0.0), b = vec4(0.0);
    for (int i = -3; i <= 3; i++) for (int j = -3; j <= 3; j++) {
      vec2 d = vec2(float(i), float(j)) * rad / 3.0 * vec2(1.0 / asp, 1.0);
      a += tA(q + d);
      b += tB(q + d);
    }
    return mix(a / 49.0, b / 49.0, smoothstep(0.3, 0.7, p));
  }
  if (u_pattern == 421) {
    // zoom sfocato: si entra nella vecchia con la scia, si esce dalla nuova
    vec2 c = q - 0.5;
    vec4 a = vec4(0.0), b = vec4(0.0);
    float sa = 1.0 + e * 2.0, sb = 1.0 + (1.0 - e) * 0.6;
    for (int i = 0; i < 14; i++) {
      float k = float(i) / 13.0 * arco * 0.5;
      a += tA(0.5 + c / (sa + k));
      b += tB(0.5 + c / (sb + k));
    }
    return mix(a / 14.0, b / 14.0, smoothstep(0.42, 0.58, p));
  }
  if (u_pattern == 431) {
    // frusta: la camera gira di scatto, tutto striscia di lato
    float sh = e;
    vec4 a = vec4(0.0), b = vec4(0.0);
    for (int i = 0; i < 16; i++) {
      float k = (float(i) / 15.0 - 0.5) * arco * 0.35;
      a += tA(q + vec2(sh + k, 0.0));
      b += tB(q - vec2(1.0 - sh - k, 0.0));
    }
    return q.x < 1.0 - sh ? a / 16.0 : b / 16.0;
  }
  if (u_pattern == 441) {
    // rotazione: la vecchia gira e si rimpicciolisce, la nuova arriva girando
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float ang = e * 6.2831853;
    float s1 = mix(1.0, 3.0, e), s2 = mix(3.0, 1.0, e);
    vec2 ra = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y);
    vec2 qa = ra * s1 / vec2(asp, 1.0) + 0.5, qb = ra * s2 / vec2(asp, 1.0) + 0.5;
    return mix(tA(qa), tB(qb), smoothstep(0.4, 0.6, p));
  }
  if (u_pattern == 451) {
    // lama di luce: una striscia bianca in diagonale spazza via la vecchia
    float x = q.x * 0.8 + q.y * 0.4;
    float fronte = mix(-0.25, 1.45, p);
    vec4 m = x < fronte ? tB(q) : tA(q);
    float l = exp(-pow((x - fronte) * 9.0, 2.0));
    return vec4(min(vec3(1.0), m.rgb + vec3(1.0, 0.97, 0.9) * l * 1.3), max(m.a, l));
  }
  if (u_pattern == 461) {
    // caleidoscopio: l'immagine si piega a spicchi, cambia, si riapre
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float r = length(c), seg = 6.2831853 / 8.0;
    float a0 = mod(atan(c.y, c.x) + p * 3.0, seg);
    a0 = abs(a0 - seg * 0.5);
    vec2 k = mix(c, vec2(cos(a0), sin(a0)) * r, arco);
    vec2 qq = k / vec2(asp, 1.0) + 0.5;
    return mix(tA(qq), tB(qq), smoothstep(0.4, 0.6, p));
  }
  if (u_pattern == 471) {
    // aria calda: tutto trema come sopra l'asfalto e si scioglie nella nuova
    vec2 w = vec2(sin(q.y * 60.0 + p * 40.0) + sin(q.y * 23.0 - p * 30.0), cos(q.x * 45.0 + p * 35.0)) * 0.012 * arco;
    float n = caso(floor(q.x * 90.0) + floor(q.y * 50.0) * 91.0);
    return mix(tA(q + w), tB(q + w), smoothstep(n * 0.5, n * 0.5 + 0.5, p));
  }
  if (u_pattern == 481) {
    // tenda: la vecchia si apre dal centro in due metà, con l'ombra
    float h = e * 0.5;
    vec4 b = tB(q) * (0.6 + 0.4 * e);
    if (q.x < 0.5 - h) return tA(q + vec2(h, 0.0)) * (1.0 - 0.25 * smoothstep(0.5 - h - 0.05, 0.5 - h, q.x));
    if (q.x > 0.5 + h) return tA(q - vec2(h, 0.0)) * (1.0 - 0.25 * smoothstep(0.5 + h + 0.05, 0.5 + h, q.x));
    return b;
  }
  if (u_pattern == 491) {
    // sovraesposta: la vecchia si brucia di luce, dalla luce esce la nuova
    vec4 m = mix(tA(q), tB(q), smoothstep(0.45, 0.55, p));
    float l = pow(arco, 1.5);
    return vec4(min(vec3(1.0), m.rgb * (1.0 + l * 3.5) + l * 0.25), m.a);
  }
  if (u_pattern == 521) {
    // polvere: la vecchia si sgretola in granelli e sotto c'è la nuova
    float n = caso(floor(q.x * 320.0) * 1.37 + floor(q.y * 180.0) * 91.7);
    float soglia = q.y * 0.35 + n * 0.65;
    return p > soglia ? tB(q) : tA(q + vec2(0.0, -max(0.0, p - soglia + 0.25) * 0.15));
  }
  if (u_pattern == 531) {
    // persiane: le stecche girano una dopo l'altra, dall'alto in basso
    float n = 10.0;
    float riga = floor(q.y * n);
    float yl = fract(q.y * n);
    float t = clamp(p * 1.6 - riga / n * 0.6, 0.0, 1.0);
    float ang = dolce(t) * 3.14159265;
    float hh = abs(cos(ang));
    float d = (yl - 0.5) / max(hh, 0.001);
    if (abs(d) > 0.5) return vec4(0.0);
    vec2 qq = vec2(q.x, (riga + d + 0.5) / n);
    float luce = 0.55 + 0.45 * hh;
    return (ang < 1.5707963 ? tA(qq) : tB(qq)) * vec4(vec3(luce), 1.0);
  }
  if (u_pattern == 541) {
    // scacchiera: le caselle si girano a caso, una alla volta
    vec2 n = vec2(12.0, 7.0);
    vec2 cella = floor(q * n);
    float r0 = caso(cella.x * 7.13 + cella.y * 31.7);
    float t = clamp((p - r0 * 0.6) / 0.4, 0.0, 1.0);
    float ang = dolce(t) * 3.14159265;
    float w = abs(cos(ang));
    vec2 l = fract(q * n) - 0.5;
    if (abs(l.x) > w * 0.5) return vec4(0.0);
    vec2 qq = (cella + 0.5 + vec2(l.x / max(w, 0.001), l.y)) / n;
    float luce = 0.6 + 0.4 * w;
    return (ang < 1.5707963 ? tA(qq) : tB(qq)) * vec4(vec3(luce), 1.0);
  }
  if (u_pattern == 551) {
    // tuffo: la vecchia si allontana girando, la nuova si avvicina da dietro
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float s = 1.0 - e;
    float ang = e * 1.2;
    vec2 rr = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y) / max(s, 0.001);
    vec2 qa = rr / vec2(asp, 1.0) + 0.5;
    float zb = mix(1.3, 1.0, e);
    vec4 b = tB(0.5 + (q - 0.5) / zb) * vec4(vec3(0.45 + 0.55 * e), 1.0);
    if (s > 0.002 && qa.x >= 0.0 && qa.y >= 0.0 && qa.x <= 1.0 && qa.y <= 1.0) return tA(qa);
    return b;
  }
  if (u_pattern == 561) {
    // inchiostro: la nuova si spande come una goccia d'inchiostro nell'acqua
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float n = 0.0, amp = 0.5;
    vec2 z = q * vec2(asp, 1.0) * 4.0;
    for (int i = 0; i < 4; i++) { n += amp * rumoreV(z); z *= 2.1; amp *= 0.5; }
    float campo = length(c) * 0.9 + (n - 0.5) * 0.55;
    float fronte = mix(-0.2, 1.3, p);
    float m = 1.0 - smoothstep(fronte - 0.06, fronte, campo);
    vec4 r = mix(tA(q), tB(q), m);
    float bordo = (1.0 - smoothstep(0.0, 0.05, abs(campo - fronte))) * 0.35;
    return vec4(r.rgb * (1.0 - bordo), r.a);
  }
  if (u_pattern == 571) {
    // colori sdoppiati: la nuova entra di lato col rosso e il blu che scappano
    float sp = 0.07 * arco;
    vec2 qa = q + vec2(e, 0.0), qb = q - vec2(1.0 - e, 0.0);
    if (q.x < 1.0 - e) return vec4(tA(qa + vec2(sp, 0.0)).r, tA(qa).g, tA(qa - vec2(sp, 0.0)).b, tA(qa).a);
    return vec4(tB(qb + vec2(sp, 0.0)).r, tB(qb).g, tB(qb - vec2(sp, 0.0)).b, tB(qb).a);
  }
  if (u_pattern == 581) {
    // bolle: tanti cerchi si aprono qua e là e si uniscono
    vec2 n = vec2(9.0 * asp, 9.0);
    vec2 cella = floor(q * n);
    float best = 0.0;
    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
      vec2 cc = cella + vec2(float(dx), float(dy));
      float r0 = caso(cc.x * 3.7 + cc.y * 17.3);
      vec2 centro = (cc + 0.5 + (vec2(caso(cc.x + cc.y * 5.1), caso(cc.y + cc.x * 2.3)) - 0.5) * 0.6) / n;
      float t = clamp((p - r0 * 0.5) / 0.5, 0.0, 1.0);
      float raggio = dolce(t) * 1.6 / n.y;
      float d = length((q - centro) * vec2(asp, 1.0));
      best = max(best, 1.0 - smoothstep(raggio - 0.004, raggio, d));
    }
    return mix(tA(q), tB(q), best);
  }
  if (u_pattern == 591) {
    // rimbalzo: la nuova cade dall'alto e rimbalza, la vecchia sotto si scurisce
    float off = 1.0 - rimbalzo(clamp(p, 0.0, 1.0));
    if (q.y + off <= 1.0) return tB(q + vec2(0.0, off));
    return tA(q) * vec4(vec3(1.0 - 0.35 * (1.0 - off)), 1.0);
  }
  if (u_pattern == 601) {
    // pagina: la pagina si solleva da destra e si rovescia, sotto c'è la nuova
    float f = 1.0 - e;
    if (q.x > f) return tB(q) * vec4(vec3(0.5 + 0.5 * smoothstep(0.0, 0.2, q.x - f)), 1.0);
    float xm = 2.0 * f - q.x;
    if (xm <= 1.0 && xm >= f) {
      // il retro della pagina: piano, più scuro verso il bordo, con un riflesso lungo la piega
      float t = clamp((f - q.x) / max(0.001, 1.0 - f), 0.0, 1.0);
      vec4 r = tA(vec2(xm, q.y));
      float riflesso = exp(-pow((f - q.x) * 10.0, 2.0)) * 0.35;
      return vec4(r.rgb * (0.9 - 0.3 * t) * 0.85 + riflesso, max(r.a, 0.0));
    }
    float ombra = 1.0 - 0.3 * smoothstep(0.12, 0.0, (2.0 * f - 1.0) - q.x) * step(0.0, 2.0 * f - 1.0);
    return tA(q) * vec4(vec3(ombra), 1.0);
  }
  if (u_pattern == 611) {
    // frantumi: le piastrelle si girano e si rimpiccioliscono, una dopo l'altra, e sotto c'è la nuova
    vec2 n = vec2(10.0 * asp, 10.0);
    vec2 cella = floor(q * n);
    float r0 = caso(cella.x * 5.3 + cella.y * 19.7);
    float t = clamp((p - r0 * 0.55) / 0.45, 0.0, 1.0);
    vec2 l = fract(q * n) - 0.5;
    float ang = dolce(t) * (r0 - 0.5) * 6.0 * min(u_forza, 1.6);
    float sc = 1.0 - dolce(t);
    vec4 b = tB(q);
    if (sc < 0.02) return b;
    vec2 loc = vec2(cos(ang) * l.x - sin(ang) * l.y, sin(ang) * l.x + cos(ang) * l.y) / sc;
    if (abs(loc.x) > 0.5 || abs(loc.y) > 0.5) return b;
    return tA((cella + 0.5 + loc) / n) * vec4(vec3(1.0 - 0.3 * t), 1.0);
  }
  if (u_pattern == 621) {
    // spinta veloce: la nuova spinge via la vecchia, con la scia del movimento
    vec4 a = vec4(0.0);
    float amt = arco * 0.2;
    for (int i = 0; i < 14; i++) {
      float k = (float(i) / 13.0 - 0.5) * amt;
      vec2 qq = q + vec2(k, 0.0);
      a += qq.x < 1.0 - e ? tA(qq + vec2(e, 0.0)) : tB(qq - vec2(1.0 - e, 0.0));
    }
    return a / 14.0;
  }
  if (u_pattern == 631) {
    // fette: strisce orizzontali che scorrono una a destra e una a sinistra, con un filo di ritardo
    float n = 8.0;
    float riga = floor(q.y * n);
    float t = dolce(clamp((p - riga / (n - 1.0) * 0.4) / 0.6, 0.0, 1.0));
    float verso = mod(riga, 2.0) < 0.5 ? 1.0 : -1.0;
    vec2 qa = q - vec2(t * verso, 0.0), qb = q - vec2(t * verso - verso, 0.0);
    return (qa.x >= 0.0 && qa.x <= 1.0) ? tA(qa) : tB(qb);
  }
  if (u_pattern == 641) {
    // alveare: esagoni che si chiudono su se stessi e scoprono la nuova
    const vec2 sz = vec2(1.0, 1.7320508);
    float N = 8.0;
    vec2 pp = (q - 0.5) * vec2(asp, 1.0) * N;
    vec4 hc = floor(vec4(pp, pp - vec2(1.0, 1.5)) / sz.xyxy) + 0.5;
    vec4 hh = vec4(pp - hc.xy * sz, pp - (hc.zw + 0.5) * sz);
    vec2 l, id;
    if (dot(hh.xy, hh.xy) < dot(hh.zw, hh.zw)) { l = hh.xy; id = hc.xy; } else { l = hh.zw; id = hc.zw + 0.5; }
    vec2 ctr = (id * sz) / N / vec2(asp, 1.0) + 0.5;
    float r0 = caso(dot(id, vec2(7.13, 31.7)));
    float t = clamp((p * 1.6 - length(ctr - 0.5) * 0.7 - r0 * 0.3) / 0.5, 0.0, 1.0);
    float sc = 1.0 - dolce(t);
    vec4 b = tB(q);
    if (sc < 0.02) return b;
    vec2 loc = l / sc;
    float hd = max(dot(abs(loc), vec2(0.5, 0.8660254)), abs(loc.x));
    if (hd > 0.5) return b;
    return tA(ctr + loc / N / vec2(asp, 1.0));
  }
  if (u_pattern == 651) {
    // onda d'urto: un anello si allarga dal centro e piega l'immagine; dentro c'è la nuova
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float r = length(c), R = length(vec2(asp, 1.0) * 0.5);
    float d = r - p * (R + 0.25);
    vec2 dir = c / max(r, 1e-4);
    vec2 off = dir * exp(-d * d * 220.0) * sin(d * 55.0) * 0.05 * min(u_forza, 1.6) / vec2(asp, 1.0);
    float m = 1.0 - smoothstep(-0.02, 0.02, d);
    vec4 res = mix(tA(q + off), tB(q + off), m);
    return vec4(min(vec3(1.0), res.rgb + exp(-d * d * 800.0) * 0.4), res.a);
  }
  if (u_pattern == 661) {
    // nuvole: un fumo denso dissolve la vecchia nella nuova, a chiazze morbide
    float n = 0.0, amp = 0.5;
    vec2 z = q * vec2(asp, 1.0) * 3.0;
    for (int i = 0; i < 5; i++) { n += amp * rumoreV(z + vec2(p * 0.8, 0.0)); z *= 2.0; amp *= 0.5; }
    float m = smoothstep(n - 0.12, n + 0.12, p * 1.5 - 0.25);
    vec4 res = mix(tA(q), tB(q), m);
    float fumo = (1.0 - abs(2.0 * m - 1.0)) * 0.2 * arco;
    return vec4(res.rgb + fumo, res.a);
  }
  if (u_pattern == 671) {
    // fuoco: la vecchia brucia dai punti scelti dal caso, i bordi diventano brace, sotto c'è la nuova
    float n = 0.0, amp = 0.5;
    vec2 z = q * vec2(asp, 1.0) * 3.5;
    for (int i = 0; i < 5; i++) { n += amp * rumoreV(z); z *= 2.1; amp *= 0.5; }
    float d = (p * 1.5 - 0.25) - n;
    vec4 a = tA(q), b = tB(q);
    if (d < 0.0) {
      float pre = smoothstep(-0.3, 0.0, d);
      return vec4(a.rgb * (1.0 - 0.75 * pre) + vec3(1.0, 0.45, 0.08) * smoothstep(-0.07, 0.0, d) * 1.2, a.a);
    }
    float k = smoothstep(0.0, 0.07, d);
    vec3 brace = mix(vec3(1.0, 0.75, 0.2), vec3(0.15, 0.03, 0.0), k);
    return vec4(mix(brace, b.rgb, smoothstep(0.03, 0.1, d)), 1.0);
  }
  if (u_pattern == 681) {
    // rullino: la pellicola scorre verso l'alto, coi fori ai lati e lo spazio fra un fotogramma e l'altro
    float bordoFilm = smoothstep(0.0, 0.14, p) * smoothstep(1.0, 0.86, p);
    float sx0 = 0.085 * bordoFilm, gap = 0.05 * bordoFilm;
    float hh = 1.0 + gap;
    float off = e * hh;
    if (q.x < sx0 || q.x > 1.0 - sx0) {
      float y = q.y + off;
      float foro = step(0.5, fract(y * 9.0)) * step(0.08, fract(y * 9.0)) * step(abs(abs(q.x - 0.5) - (0.5 - sx0 * 0.5)), sx0 * 0.28);
      return vec4(vec3(0.03) + foro * vec3(0.9, 0.85, 0.7), 1.0);
    }
    float x2 = (q.x - sx0) / max(1e-3, 1.0 - 2.0 * sx0);
    vec2 qa = vec2(x2, q.y + off), qb = vec2(x2, q.y + off - hh);
    if (qa.y >= 0.0 && qa.y <= 1.0) return tA(qa);
    if (qb.y >= 0.0 && qb.y <= 1.0) return tB(qb);
    return vec4(vec3(0.02), 1.0);
  }
  if (u_pattern == 691) {
    // diaframma: le lamelle si chiudono sulla vecchia e si riaprono sulla nuova
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float R = length(vec2(asp, 1.0) * 0.5);
    float sc = p < 0.5 ? 1.0 - dolce(p * 2.0) : dolce(p * 2.0 - 1.0);
    float ang = p * 2.0 * min(u_forza, 1.6);
    vec2 r = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y);
    float hd = max(abs(r.y), abs(r.x) * 0.8660254 + abs(r.y) * 0.5);
    float m = 1.0 - smoothstep(sc * R * 0.86 - 0.01, sc * R * 0.86 + 0.01, hd);
    return mix(vec4(0.0, 0.0, 0.0, 1.0), p < 0.5 ? tA(q) : tB(q), m);
  }
  if (u_pattern == 701) {
    // punti: tanti cerchi crescono da un angolo e si uniscono (il retino)
    vec2 g = q * vec2(asp, 1.0) * 20.0;
    vec2 id = floor(g);
    float rit = id.x / (20.0 * asp) * 0.25 + id.y / 20.0 * 0.25;
    float r = clamp(p * 1.5 - rit, 0.0, 1.0) * 0.76;
    float m = 1.0 - smoothstep(r - 0.07, r, length(fract(g) - 0.5));
    return mix(tA(q), tB(q), m);
  }
  if (u_pattern == 711) {
    // spirale: il braccio di una spirale spazza via la vecchia
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float r = length(c) / length(vec2(asp, 1.0) * 0.5);
    float a = fract(atan(c.y, c.x) / 6.2831853 + 1.0);
    float f = fract(a + r * 1.6);
    float t = p * 1.12;
    return mix(tA(q), tB(q), 1.0 - smoothstep(t - 0.06, t, f));
  }
  if (u_pattern == 721) {
    // doppia esposizione: le due immagini si sovrappongono come due pose sulla stessa pellicola
    vec4 a = tA(q), b = tB(q);
    vec3 sc = 1.0 - (1.0 - a.rgb) * (1.0 - b.rgb);
    return vec4(mix(mix(a.rgb, b.rgb, dolce(p)), sc, arco * 0.85), mix(a.a, b.a, e));
  }
  if (u_pattern == 731) {
    // TV che si spegne: la vecchia si schiaccia in una riga e in un puntino, la nuova si apre da lì
    vec2 c = q - 0.5;
    bool prima = p < 0.5;
    float u = prima ? p * 2.0 : 1.0 - (p - 0.5) * 2.0;
    float sy = max(1.0 - dolce(clamp(u * 1.5, 0.0, 1.0)), 0.004);
    float sx = max(1.0 - dolce(clamp((u - 0.6) / 0.4, 0.0, 1.0)), 0.001);
    vec2 cc = c / vec2(sx, sy);
    vec4 img = (abs(cc.x) <= 0.5 && abs(cc.y) <= 0.5) ? (prima ? tA(cc + 0.5) : tB(cc + 0.5)) : vec4(0.0);
    vec3 col = img.rgb * (1.0 + 1.6 * smoothstep(0.3, 1.0, u));
    float riga = exp(-pow(c.y / (0.003 + 0.012 * (1.0 - u)), 2.0)) * smoothstep(0.55 * sx + 0.03, 0.55 * sx - 0.02, abs(c.x));
    col += vec3(0.85, 0.95, 1.0) * riga * smoothstep(0.35, 1.0, u);
    return vec4(col, 1.0);
  }
  if (u_pattern == 741) {
    // pioggia digitale: colonne di luce verde cadono a velocità diverse e lasciano dietro la nuova
    float col = floor(q.x * 48.0 * asp);
    float fronte = clamp(p * 1.55 - caso(col * 1.7) * 0.45, 0.0, 1.0) * 1.15;
    float dist = fronte - q.y;
    float dentro = step(q.y, fronte);
    float cella = step(0.45, caso(col + floor(q.y * 70.0) * 3.1));
    float scia = dentro * exp(-dist * 7.0) * step(0.001, fronte) * step(fronte, 1.14) * (0.35 + 0.65 * cella);
    float testa = smoothstep(0.02, 0.0, abs(dist)) * step(0.001, fronte) * step(fronte, 1.14);
    vec4 r = mix(tA(q), tB(q), dentro);
    return vec4(r.rgb + vec3(0.15, 1.0, 0.4) * scia * 0.9 + vec3(0.8, 1.0, 0.85) * testa, r.a);
  }
  if (u_pattern == 751) {
    // strappo: la carta si rompe lungo una linea irregolare e sotto c'è la nuova
    float pos = q.x * 0.82 + (1.0 - q.y) * 0.18 + (rumoreV(vec2(q.y * 11.0, 1.0)) - 0.5) * 0.14 + (rumoreV(vec2(q.y * 47.0, 3.0)) - 0.5) * 0.03;
    float d = (p * 1.42 - 0.2) - pos;
    vec4 a = tA(q + vec2(0.012, 0.0) * smoothstep(0.0, -0.12, d) * arco), b = tB(q);
    vec3 rgb = mix(a.rgb, b.rgb * (1.0 - 0.55 * smoothstep(0.07, 0.0, d)), smoothstep(0.0, 0.004, d));
    float bordo = smoothstep(-0.03, -0.022, d) * (1.0 - smoothstep(-0.005, 0.0, d));
    rgb = mix(rgb, vec3(0.96, 0.94, 0.88), bordo * 0.95 * step(0.001, p) * step(p, 0.999));
    return vec4(rgb, mix(a.a, b.a, smoothstep(0.0, 0.004, d)));
  }
  if (u_pattern == 761) {
    // vetro rotto: crepe, poi i pezzi cadono uno dopo l'altro dal punto dell'urto e scoprono la nuova
    vec2 sc = vec2(7.0 * asp, 7.0);
    vec4 v1 = pezzo(q * sc);
    vec2 ctr1 = v1.xy / sc;
    float r1 = caso(dot(v1.zw, vec2(12.9, 78.2)));
    float t1 = clamp((p * 1.6 - 0.25 - length((ctr1 - 0.5) * vec2(asp, 1.0)) * 0.55 - r1 * 0.3) / 0.5, 0.0, 1.0);
    vec2 spos = vec2((r1 - 0.5) * 0.12, t1 * t1 * 1.4) * step(0.0001, t1);
    vec2 q2 = q - spos;
    vec4 v2 = pezzo(q2 * sc);
    bool stesso = distance(v2.zw, v1.zw) < 0.5;
    vec4 b = tB(q);
    vec4 a = tA(q2);
    vec3 rgb = (stesso && !fuori(q2)) ? a.rgb : b.rgb;
    // le crepe: dove si toccano due pezzi, prima che cadano
    vec2 gq = q * sc;
    vec2 idq = floor(gq), fq = fract(gq);
    float d1 = 9.0, d2 = 9.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 nb = vec2(float(i), float(j));
      vec2 pt = nb + vec2(caso(dot(idq + nb, vec2(3.1, 7.3))), caso(dot(idq + nb, vec2(5.7, 2.9))));
      float dd = length(pt - fq);
      if (dd < d1) { d2 = d1; d1 = dd; } else if (dd < d2) d2 = dd;
    }
    float crepa = smoothstep(0.05, 0.0, d2 - d1) * smoothstep(0.02, 0.2, p) * (1.0 - t1);
    rgb = mix(rgb, vec3(0.9, 0.95, 1.0), crepa * 0.55);
    return vec4(rgb, 1.0);
  }
  if (u_pattern == 771) {
    // sipario: la vecchia si apre come una tenda, con le pieghe, e mostra la nuova
    float w = 0.5 * (1.0 - e);
    float piega = 0.5 + 0.5 * sin(q.x * asp * 48.0);
    if (w > 0.002 && q.x < w) {
      float u = q.x / w;
      return tA(vec2(u * 0.5, q.y)) * vec4(vec3(0.62 + 0.38 * piega * (1.0 - 0.4 * e) - 0.2 * u), 1.0);
    }
    if (w > 0.002 && q.x > 1.0 - w) {
      float u = (1.0 - q.x) / w;
      return tA(vec2(1.0 - u * 0.5, q.y)) * vec4(vec3(0.62 + 0.38 * piega * (1.0 - 0.4 * e) - 0.2 * u), 1.0);
    }
    float ombra = w > 0.002 ? smoothstep(0.0, 0.08, min(q.x - w, 1.0 - w - q.x)) : 1.0;
    return tB(q) * vec4(vec3(0.55 + 0.45 * ombra), 1.0);
  }
  if (u_pattern == 781) {
    // anelli: cerchi concentrici girano uno dopo l'altro, e girando cambiano l'immagine
    vec2 c = (q - 0.5) * vec2(asp, 1.0);
    float r = length(c) / length(vec2(asp, 1.0) * 0.5);
    float anello = floor(r * 7.0);
    float t = clamp((p * 1.4 - anello / 7.0 * 0.4) / 0.3, 0.0, 1.0);
    float ang = (mod(anello, 2.0) * 2.0 - 1.0) * t * 0.9 * min(u_forza, 1.6);
    vec2 rc = vec2(cos(ang) * c.x - sin(ang) * c.y, sin(ang) * c.x + cos(ang) * c.y) / vec2(asp, 1.0) + 0.5;
    rc = 1.0 - abs(1.0 - mod(rc, 2.0));
    vec4 m = mix(tA(rc), tB(rc), step(0.5, t));
    float bordo = smoothstep(0.0, 0.05, fract(r * 7.0)) * smoothstep(1.0, 0.95, fract(r * 7.0));
    return m * vec4(vec3(mix(1.0, bordo, sin(t * 3.14159) * 0.8)), 1.0);
  }
  if (u_pattern == 791) {
    // segnale perso: l'immagine si strappa a righe, poi barre e neve, e ritorna quella nuova
    float pk = 1.0 - abs(2.0 * p - 1.0);
    float riga = floor(q.y * 40.0), fase = floor(p * 25.0);
    vec2 qq = q + vec2((caso(riga + fase) - 0.5) * 0.22 * pk * min(u_forza, 1.6) * step(0.4, caso(riga * 1.3 + fase)), 0.0);
    vec4 img = p < 0.5 ? tA(qq) : tB(qq);
    float b = floor(q.x * 7.0);
    vec3 barre = vec3(step(0.5, float(b == 0.0 || b == 1.0 || b == 4.0 || b == 5.0)), step(0.5, float(b < 4.0)), step(0.5, float(b == 0.0 || b == 2.0 || b == 4.0 || b == 6.0)));
    float neve = caso(dot(floor(q * vec2(320.0, 180.0)), vec2(12.9898, 78.233)) + fase);
    vec3 sig = mix(barre * 0.8, vec3(neve), 0.5);
    return vec4(mix(img.rgb, sig, smoothstep(0.55, 0.85, pk)), 1.0);
  }
  if (u_pattern == 811) {
    // cola: la vecchia si scioglie e cola verso il basso, a strisce diverse, e scopre la nuova
    float n = rumoreV(vec2(q.x * asp * 14.0, 0.0)) * 0.5 + caso(floor(q.x * asp * 40.0)) * 0.2;
    float f = (p * 1.5 - n) * 1.25;
    vec4 b = tB(q);
    if (q.y < f) return b;
    vec4 a = tA(vec2(q.x + sin(q.y * 30.0) * 0.004 * smoothstep(0.2, 0.0, q.y - f), q.y - f * 0.85));
    return vec4(a.rgb * (0.75 + 0.25 * smoothstep(0.0, 0.1, q.y - f)), a.a);
  }
  if (u_pattern == 831) {
    // lente: una lente d'ingrandimento cresce e attraversa il quadro: dentro c'è la nuova, ingrandita
    vec2 ctr = vec2(mix(0.2, 0.5, e), 0.5 + sin(p * 6.2832) * 0.08 * (1.0 - e));
    float rad = 0.1 + e * 1.15;
    float r = length((q - ctr) * vec2(asp, 1.0));
    float m = smoothstep(rad, rad - 0.012, r);
    vec4 dentro = tB(ctr + (q - ctr) / (1.0 + 0.8 * (1.0 - e)));
    vec4 fuoriL = tA(q);
    vec4 res = mix(fuoriL, dentro, m);
    float anello = smoothstep(0.014, 0.0, abs(r - rad)) * step(0.001, p) * step(p, 0.999);
    return vec4(res.rgb + vec3(0.9, 0.95, 1.0) * anello * 0.7, res.a);
  }
  if (u_pattern == 841) {
    // spettro: i tre colori se ne vanno uno dopo l'altro, prima il rosso e per ultimo il blu
    vec4 a = tA(q), b = tB(q);
    float mR = smoothstep(q.x - 0.07, q.x + 0.07, p * 1.5 - 0.1);
    float mG = smoothstep(q.x - 0.07, q.x + 0.07, p * 1.5 - 0.1 - 0.16);
    float mB = smoothstep(q.x - 0.07, q.x + 0.07, p * 1.5 - 0.1 - 0.32);
    return vec4(mix(a.r, b.r, mR), mix(a.g, b.g, mG), mix(a.b, b.b, mB), mix(a.a, b.a, mG));
  }
  if (u_pattern == 861) {
    // cerniera: si apre dall'alto verso il basso e mostra la nuova, coi dentini sui bordi
    float zp = p * 1.25;
    float aperto = clamp(zp - q.y, 0.0, 1.0);
    float w = dolce(aperto) * 0.62;
    float dx = abs(q.x - 0.5);
    vec4 a = tA(q), b = tB(q);
    vec3 rgb = dx < w ? b.rgb * (0.6 + 0.4 * smoothstep(0.0, 0.06, w - dx)) : a.rgb;
    if (aperto > 0.0 && dx >= w && dx < w + 0.02) {
      float dente = step(0.5, fract(q.y * 46.0 + (q.x < 0.5 ? 0.0 : 0.5)));
      rgb = mix(vec3(0.85, 0.85, 0.88), vec3(0.32, 0.32, 0.36), dente);
    }
    float cursore = smoothstep(0.02, 0.0, abs(q.y - zp)) * smoothstep(0.045, 0.0, dx) * step(0.001, p) * step(p, 0.999);
    rgb = mix(rgb, vec3(0.95, 0.85, 0.3), cursore);
    return vec4(rgb, mix(a.a, b.a, step(dx, w)));
  }
  if (u_pattern == 801) {
    // portoni 3D: due battenti si aprono come porte e rivelano la nuova
    float w = 1.0 - e;
    float mezzo = 0.5 * w;
    vec4 b = tB(q);
    if (mezzo > 0.002 && (q.x < mezzo || q.x > 1.0 - mezzo)) {
      float u = (q.x < mezzo ? q.x : 1.0 - q.x) / mezzo;
      float ys = 1.0 - 0.28 * e * u * min(u_forza, 1.6);
      float yy = 0.5 + (q.y - 0.5) / ys;
      if (yy >= 0.0 && yy <= 1.0) {
        vec4 r = tA(vec2(q.x < mezzo ? u * 0.5 : 1.0 - u * 0.5, yy));
        return r * vec4(vec3(1.0 - 0.45 * e * u), 1.0);
      }
    }
    return b * vec4(vec3(0.7 + 0.3 * e), 1.0);
  }
  if (u_pattern == 401 || u_pattern == 411) {
    // raggio dall'occhio (0,0,-D) attraverso il punto dello schermo; lo schermo è il piano z = 0
    float a = asp;
    vec3 s3 = vec3((q.x - 0.5) * a, 0.5 - q.y, 0.0);
    float D = 2.4;
    vec3 O = vec3(0.0, 0.0, -D);
    vec3 dir = normalize(s3 - O);
    bool cubo = u_pattern == 401;
    float ang = cubo ? e * 1.5707963 : e * 3.14159265;
    float lontano = arco * (cubo ? 0.45 : 0.6);
    vec3 C = vec3(0.0, 0.0, (cubo ? a * 0.5 : 0.0) + lontano);
    // si porta il raggio nel riferimento dell'oggetto: l'oggetto ruota verso sinistra (la faccia di destra viene davanti),
    // qui si applica la rotazione inversa
    vec2 oxz = ruotaY((O - C).xz, ang), dxz = ruotaY(dir.xz, ang);
    vec3 ol = vec3(oxz.x, O.y - C.y, oxz.y), dl = vec3(dxz.x, dir.y, dxz.y);
    vec4 col = vec4(0.0);
    float tMin = 1e9;
    if (cubo) {
      // faccia A davanti (z = -a/2), faccia B a destra (x = +a/2)
      float t = (-a * 0.5 - ol.z) / dl.z;
      vec3 h = ol + t * dl;
      if (t > 0.0 && abs(h.x) <= a * 0.5 && abs(h.y) <= 0.5) { tMin = t; col = tA(vec2((h.x + a * 0.5) / a, 0.5 - h.y)) * (0.55 + 0.45 * cos(ang)); }
      t = (a * 0.5 - ol.x) / dl.x;
      h = ol + t * dl;
      if (t > 0.0 && t < tMin && abs(h.z) <= a * 0.5 && abs(h.y) <= 0.5) { col = tB(vec2((h.z + a * 0.5) / a, 0.5 - h.y)) * (0.55 + 0.45 * sin(ang)); }
    } else {
      float t = -ol.z / dl.z;
      vec3 h = ol + t * dl;
      if (t > 0.0 && abs(h.x) <= a * 0.5 && abs(h.y) <= 0.5) {
        float u = (h.x + a * 0.5) / a;
        float luce = 0.6 + 0.4 * abs(cos(ang));
        col = (ang < 1.5707963 ? tA(vec2(u, 0.5 - h.y)) : tB(vec2(1.0 - u, 0.5 - h.y))) * luce;
      }
    }
    return col;
  }
  return mix(tA(q), tB(q), p);
}

void main() {
  vec2 q = vec2(v_uv.x, 1.0 - v_uv.y);
  vec4 B = texture(u_b, v_uv);
  vec4 A = u_hasA ? texture(u_a, v_uv) : vec4(0.0);
  // la curva dell'avanzamento e il rapporto del quadro (con la direzione gira: 90° scambia larghezza e altezza)
  P = clamp(u_p, 0.0, 1.0);
  if (u_curva == 1) P = dolce(P); else if (u_curva == 2) P = P * P; else if (u_curva == 3) P = 1.0 - (1.0 - P) * (1.0 - P);
  asp = (u_mode == 4 && (u_dir == 1 || u_dir == 3)) ? 1.0 / u_aspect : u_aspect;
  vec4 r = B;
  if (u_mode == 1) r = mix(A, B, P);
  else if (u_mode == 3) {
    vec4 d = vec4(u_dipColor, 1.0);
    r = P < 0.5 ? mix(A, d, P * 2.0) : mix(d, B, (P - 0.5) * 2.0);
  } else if (u_mode == 2) r = tendina(q, A, B);
  else if (u_mode == 4) r = effetto(u_dir == 0 ? q : gira(q, (4 - u_dir) % 4), P);
  o = r * u_opacity;
}`,Aa=[`u_a`,`u_b`,`u_hasA`,`u_mode`,`u_p`,`u_opacity`,`u_soft`,`u_border`,`u_aspect`,`u_pattern`,`u_reverse`,`u_borderColor`,`u_dipColor`,`u_dir`,`u_forza`,`u_curva`];function ja(e,t,n,r,i,a,o){e.uniform1i(t.u_a,0),e.uniform1i(t.u_b,1),e.uniform1i(t.u_hasA,+!!a);let s=n?n.type===`mix`?1:n.type===`wipe`?2:n.type===`dve`?4:3:0;e.uniform1i(t.u_mode,s),e.uniform1f(t.u_p,Math.max(0,Math.min(1,r))),e.uniform1f(t.u_opacity,i),e.uniform1f(t.u_soft,n?.soft??0),e.uniform1f(t.u_border,n?.border??0),e.uniform1f(t.u_aspect,o),e.uniform1i(t.u_pattern,n?.pattern??1),e.uniform1i(t.u_reverse,+!!n?.reverse);let c=Na(n?.borderColor??`#ffffff`),l=Na(n?.color??`#000000`);e.uniform3f(t.u_borderColor,c[0],c[1],c[2]),e.uniform3f(t.u_dipColor,l[0],l[1],l[2]),e.uniform1i(t.u_dir,n?.type===`dve`?((n.dir??0)%4+4)%4:0),e.uniform1f(t.u_forza,Math.max(.1,n?.forza??1)),e.uniform1i(t.u_curva,n?.curva===`dolce`?1:n?.curva===`entra`?2:n?.curva===`esce`?3:0)}function Ma(e,t,n){let r=(t,n)=>{let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw Error(`shader: `+e.getShaderInfoLog(r));return r},i=e.createProgram();if(e.attachShader(i,r(e.VERTEX_SHADER,t)),e.attachShader(i,r(e.FRAGMENT_SHADER,n)),e.bindAttribLocation(i,0,`a_pos`),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS))throw Error(`programma: `+e.getProgramInfoLog(i));return i}function Na(e){let t=e.replace(`#`,``),n=parseInt(t.length===3?t.split(``).map(e=>e+e).join(``):t.slice(0,6),16)||0;return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}var Pa=class{canvas;gl;pLayer;pComb;pMaster;pFx;uM={};uF={};prima=0;uL={};uC={};vao;fbo=[];fbW=0;fbH=0;texs=new Map;used=new Set;blank;fornitore;successivo;interp=null;uscita=2;perso=!1;vistaChiave=0;constructor(e,t=!1){this.canvas=e;let n=e.getContext(`webgl2`,{alpha:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:t,desynchronized:!1,powerPreference:`high-performance`});if(!n)throw Error(`WebGL2 non disponibile`);this.gl=n,this.pLayer=this.prog(wa,Ta),this.pComb=this.prog(Ea,ka),this.pMaster=this.prog(Ea,Da),this.pFx=this.prog(Ea,Oa);for(let e of[`u_src`,`u_res`,`u_off`,`u_zoom`,`u_rot`,`u_blur`,`u_pixel`,`u_rgb`,`u_glitch`,`u_seme`,`u_desat`,`u_invert`,`u_flash`,`u_fade`,`u_luce`,`u_lucePh`,`u_bande`,`u_vhs`,`u_time`,`u_flashCol`,`u_fadeCol`,`u_bagliore`,`u_flare`,`u_flarePh`,`u_arco`,`u_arcoPh`,`u_espo`,`u_neon`,`u_onda`,`u_bolla`,`u_vortice`,`u_caleido`,`u_calore`,`u_zblur`,`u_centro`,`u_sole`,`u_tinta`,...T.map(e=>`u_`+e)])this.uF[e]=n.getUniformLocation(this.pFx,e);for(let e of`u_res.u_size.u_crop.u_off.u_scale.u_rot.u_tex.u_src.u_orient.u_color.u_bright.u_contrast.u_sat.u_hue.u_look.u_time.u_texel.u_key.u_keyColor.u_keyExtra.u_keyN.u_keyLevel.u_keySoft.u_keyInv.u_keySpill.u_keyBordo.u_keySfuma.u_keyPulisci.u_matte.u_matte2.u_matteK.u_vista.u_mirror.u_temp.u_vignette.u_alpha.u_color2.u_grad.u_box.u_boxPx.u_round.u_feather.u_auto.u_autoLo.u_autoHi.u_autoWb.u_autoK.u_autoGamma`.split(`.`))this.uL[e]=n.getUniformLocation(this.pLayer,e);for(let e of[`u_src`,`u_lift`,`u_gamma`,`u_gain`,`u_shadow`,`u_high`,`u_sat`,`u_contrast`,`u_vignette`,`u_grain`,`u_time`,`u_split`])this.uM[e]=n.getUniformLocation(this.pMaster,e);for(let e of Aa)this.uC[e]=n.getUniformLocation(this.pComb,e);this.vao=n.createVertexArray(),n.bindVertexArray(this.vao);let r=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,r),n.bufferData(n.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),n.STATIC_DRAW);for(let e of[this.pLayer,this.pComb,this.pMaster,this.pFx]){let t=n.getAttribLocation(e,`a_pos`);n.enableVertexAttribArray(t),n.vertexAttribPointer(t,2,n.FLOAT,!1,0,0)}this.blank=this.newTex(),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),`addEventListener`in e&&e.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),this.perso=!0},!1)}prog(e,t){return Ma(this.gl,e,t)}newTex(){let e=this.gl,t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),t}ensureFbo(e,t){let n=this.gl;if(!(this.fbW===e&&this.fbH===t&&this.fbo.length)){for(let e of this.fbo)n.deleteFramebuffer(e.fb),n.deleteTexture(e.tex);this.fbo=[];for(let r=0;r<7;r++){let r=this.newTex();n.texImage2D(n.TEXTURE_2D,0,n.RGBA8,e,t,0,n.RGBA,n.UNSIGNED_BYTE,null);let i=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,i),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,r,0),this.fbo.push({fb:i,tex:r})}this.fbW=e,this.fbH=t}}matte(e,t,n,r){let i=this.gl,a=this.texs.get(e);return a||(a={tex:this.newTex(),src:null,w:0,h:0},this.texs.set(e,a)),this.used.add(e),a.src!==r&&(i.bindTexture(i.TEXTURE_2D,a.tex),i.pixelStorei(i.UNPACK_ALIGNMENT,1),i.texImage2D(i.TEXTURE_2D,0,i.R8,t,n,0,i.RED,i.UNSIGNED_BYTE,r),i.pixelStorei(i.UNPACK_ALIGNMENT,4),a.src=r,a.w=t,a.h=n),a.tex}upload(e,t,n,r,i){let a=this.gl,o=this.texs.get(e);return o||(o={tex:this.newTex(),src:null,w:0,h:0},this.texs.set(e,o)),this.used.add(e),o.src!==i&&(a.bindTexture(a.TEXTURE_2D,o.tex),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,t),o.src=i,o.w=n,o.h=r),o}render(e,t,n,r,i,a){this.fornitore=i,this.successivo=a,this.interp?.inizia();let o=this.gl;if(this.perso||o.isContextLost())return;let s=this.canvas.width,c=this.canvas.height;this.ensureFbo(s,c),this.used.clear(),o.bindVertexArray(this.vao),o.bindFramebuffer(o.FRAMEBUFFER,this.fbo[2].fb),o.viewport(0,0,s,c),o.disable(o.BLEND),o.clearColor(0,0,0,1),o.clear(o.COLOR_BUFFER_BIT);let l=e.tracks.filter(e=>e.kind===`video`);for(let i=l.length-1;i>=0;i--){let a=l[i].id;for(let i of t){if(i.trackId!==a)continue;let t=!!i.a&&!!i.tr,s=i.b?this.layer(e,i.b,1,n,r):!1,c=t?this.layer(e,i.a,0,n,r):!1;if(s||c){if(s||(o.bindFramebuffer(o.FRAMEBUFFER,this.fbo[1].fb),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT)),i.altre?.length&&c&&s){let e=1,t=[{tr:i.tr,prog:i.prog,sopra:!1},...i.altre];for(let n=0;n<t.length;n++){let r=n===t.length-1,a=r?2:n%2?6:5;this.combine(t[n].tr,t[n].prog,r?i.opacity:1,!0,e,a,t[n].sopra&&n>0?e:0),e=a}}else this.combine(i.tr,i.prog,i.opacity,c)}}let u=E(e,r,a);u&&(this.effetti(u,r,s,c),o.bindFramebuffer(o.READ_FRAMEBUFFER,this.fbo[4].fb),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,this.fbo[2].fb),o.blitFramebuffer(0,0,s,c,0,0,s,c,o.COLOR_BUFFER_BIT,o.NEAREST),o.bindFramebuffer(o.FRAMEBUFFER,this.fbo[2].fb))}let u=Qn(Oe(e)),d=$n(u)&&this.prima<=0?2:3;if(d===3){o.bindFramebuffer(o.FRAMEBUFFER,this.fbo[3].fb),o.viewport(0,0,s,c),o.disable(o.BLEND),o.useProgram(this.pMaster);let e=this.uM;o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,this.fbo[2].tex),o.uniform1i(e.u_src,0),o.uniform3f(e.u_lift,...u.lift),o.uniform3f(e.u_gamma,...u.gamma),o.uniform3f(e.u_gain,...u.gain),o.uniform3f(e.u_shadow,...u.shadow),o.uniform3f(e.u_high,...u.high),o.uniform1f(e.u_sat,u.sat),o.uniform1f(e.u_contrast,u.contrast),o.uniform1f(e.u_vignette,u.vignette),o.uniform1f(e.u_grain,u.grain),o.uniform1f(e.u_time,r%1e4/25),o.uniform1f(e.u_split,this.prima),o.drawArrays(o.TRIANGLE_STRIP,0,4)}this.uscita=d;let f=Br(e,r,s,c);f&&this.sovrimpressione(e,r,s,c,f,d),o.bindFramebuffer(o.READ_FRAMEBUFFER,this.fbo[d].fb),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),o.blitFramebuffer(0,0,s,c,0,0,s,c,o.COLOR_BUFFER_BIT,o.NEAREST),o.bindFramebuffer(o.FRAMEBUFFER,null);for(let[e,t]of this.texs)!this.used.has(e)&&!e.startsWith(`img:`)&&(o.deleteTexture(t.tex),this.texs.delete(e));this.interp?.finisce()}sovr=null;sovrimpressione(e,t,n,r,i,a){let o=this.gl;if(!this.sovr||this.sovr.firma!==i){let a=this.sovr&&this.sovr.tela.width===n&&this.sovr.tela.height===r?this.sovr.tela:Rt(n,r);Hr(a.getContext(`2d`),e,t,n,r),this.sovr={firma:i,tela:a}}let s=this.upload(`img:sovr`,this.sovr.tela,n,r,i);o.bindFramebuffer(o.FRAMEBUFFER,this.fbo[a].fb),o.viewport(0,0,n,r),o.enable(o.BLEND),o.blendFunc(o.ONE,o.ONE_MINUS_SRC_ALPHA),o.useProgram(this.pLayer);let c=this.uL;o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,s.tex),o.uniform1i(c.u_tex,0),o.uniform2f(c.u_res,n,r),o.uniform2f(c.u_size,n,r),o.uniform4f(c.u_crop,0,0,0,0),o.uniform2f(c.u_off,0,0),o.uniform1f(c.u_scale,1),o.uniform1f(c.u_rot,0),o.uniform1i(c.u_src,0),o.uniform1i(c.u_orient,0),o.uniform1f(c.u_bright,0),o.uniform1f(c.u_contrast,1),o.uniform1f(c.u_sat,1),o.uniform1f(c.u_hue,0),o.uniform1i(c.u_look,0),o.uniform1i(c.u_key,0),o.uniform1i(c.u_mirror,0),o.uniform1f(c.u_temp,0),o.uniform1f(c.u_vignette,0),o.uniform1f(c.u_alpha,1),o.uniform1i(c.u_auto,0),o.uniform1f(c.u_round,0),o.uniform1f(c.u_feather,0),o.drawArrays(o.TRIANGLE_STRIP,0,4),o.disable(o.BLEND)}effetti(e,t,n,r){let i=this.gl;i.bindFramebuffer(i.FRAMEBUFFER,this.fbo[4].fb),i.viewport(0,0,n,r),i.disable(i.BLEND),i.useProgram(this.pFx);let a=this.uF;i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.fbo[2].tex),i.uniform1i(a.u_src,0),i.uniform2f(a.u_res,n,r),i.uniform2f(a.u_off,e.dx,e.dy),i.uniform1f(a.u_zoom,e.zoom),i.uniform1f(a.u_rot,e.rot),i.uniform1f(a.u_blur,e.blur),i.uniform1f(a.u_pixel,e.pixel),i.uniform1f(a.u_rgb,e.rgb),i.uniform1f(a.u_glitch,e.glitch),i.uniform1f(a.u_seme,e.seme%1e3),i.uniform1f(a.u_desat,e.desat),i.uniform1f(a.u_invert,e.invert),i.uniform1f(a.u_flash,e.flash),i.uniform1f(a.u_fade,e.fade),i.uniform1f(a.u_luce,e.luce),i.uniform1f(a.u_lucePh,e.lucePh),i.uniform1f(a.u_bande,e.bande),i.uniform1f(a.u_vhs,e.vhs),i.uniform1f(a.u_bagliore,e.bagliore),i.uniform1f(a.u_flare,e.flare),i.uniform1f(a.u_flarePh,e.flarePh),i.uniform1f(a.u_arco,e.arco),i.uniform1f(a.u_arcoPh,e.arcoPh),i.uniform1f(a.u_espo,e.espo),i.uniform1f(a.u_neon,e.neon),i.uniform1f(a.u_onda,e.onda),i.uniform1f(a.u_bolla,e.bolla),i.uniform1f(a.u_vortice,e.vortice),i.uniform1f(a.u_caleido,e.caleido),i.uniform1f(a.u_calore,e.calore),i.uniform1f(a.u_zblur,e.zblur),i.uniform1f(a.u_time,t%1e4/25),i.uniform3f(a.u_flashCol,...e.flashCol),i.uniform3f(a.u_fadeCol,...e.fadeCol),i.uniform3f(a.u_tinta,...e.tinta);for(let t of T)i.uniform1f(a[`u_`+t],e[t]);i.uniform2f(a.u_centro,e.cx??.5,1-(e.cy??.5)),i.uniform2f(a.u_sole,Number.isFinite(e.soleX)?e.soleX:-9,Number.isFinite(e.soleY)?e.soleY:0),i.drawArrays(i.TRIANGLE_STRIP,0,4)}fluido(e,t,n,r,i,a){let s=t.clip,c=me(e,s);if(!c||!s.media)return null;let l=this.successivo?this.successivo(t):o(s.id+`~`,s.media,i.timestamp+1.05/Math.max(1,c.fps||25),r,this.canvas.width*Math.min(1,s.tf.scale));if(!l||l instanceof ImageBitmap||l===i)return null;let u=l.timestamp-i.timestamp,d=1/Math.max(1,c.fps||25);if(u<d*.3||u>d*1.9)return null;let f=(t.t-i.timestamp)/u;if(f<.02||f>.98)return null;let p=this.upload(`v:`+s.id+`:`+n+`b`,l.toCanvasImageSource(),l.displayWidth,l.displayHeight,l);return this.interp??=new qn(this.gl),this.interp.mezzo(`f:`+s.id+`:`+n,a,p,i,f,i.displayWidth,i.displayHeight,s.fluido===2)}layer(e,t,n,r,i){let a=this.gl,s=t.clip,c=e.w,l=e.h,u=0,d=this.blank,f=c,p=l,m=0,h={dx:0,dy:0},g=!0;if(s.kind===`media`&&s.media){if(!me(e,s))return!1;let i=this.fornitore?this.fornitore(t):o(s.id,s.media,t.t,r,this.canvas.width*Math.min(1,s.tf.scale));if(!i)return!1;if(i instanceof ImageBitmap)d=this.upload(`img:`+s.media,i,i.width,i.height,i).tex,f=i.width,p=i.height;else{let a=i.toCanvasImageSource(),o=this.upload(`v:`+s.id+`:`+n,a,i.displayWidth,i.displayHeight,i);d=o.tex,s.fluido&&s.speed<.98&&(d=this.fluido(e,t,n,r,i,o)??d),m=i.rotation,f=m%180?i.displayHeight:i.displayWidth,p=m%180?i.displayWidth:i.displayHeight,i.squarePixelWidth&&i.squarePixelHeight&&!(m%180)&&(f=i.squarePixelWidth,p=i.squarePixelHeight)}}else if(s.kind===`bars`)u=s.gen?.bars===`ebu`?2:1;else if(s.kind===`color`)u=3;else if(s.kind===`countdown`){let r=$t(c,l,t.local,s.len*e.rate.den/e.rate.num,s.gen?.conto??`pellicola`);d=this.upload(`cd:`+s.id+`:`+n,r,r.width,r.height,i+`:`+t.lf).tex,f=c,p=l}else if(s.kind===`title`&&s.gen?.anim){let r=Ca(s.gen.anim,c,l,t.local,s.len*e.rate.den/e.rate.num);d=this.upload(`an:`+s.id+`:`+n,r,c,l,i+`:`+t.lf+`:`+Sa(s.gen.anim)).tex,f=c,p=l,g=!1}else if(s.kind===`title`){let n=Gt(s.gen?.title??ce,t.local),r=Wt(n,c,l);d=this.upload(`img:t:`+s.id,r.tela,r.w,r.h,r.tela).tex,f=r.w,p=r.h,g=!1,h=Jt(n,r.w,r.h,c,l,t.local,s.len*e.rate.den/e.rate.num)}else return!1;let _=f,v=p;if(g){let e=Math.min(c/f,l/p);_=f*e,v=p*e}let y=we(s,t.lf),b=s.fx,x=Qe(e,s,s.start+t.lf),S=y.sx??1,C=rr(b);a.bindFramebuffer(a.FRAMEBUFFER,this.fbo[n].fb),a.viewport(0,0,this.fbW,this.fbH),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.disable(a.BLEND),a.useProgram(this.pLayer);let w=this.uL;a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,d),a.uniform1i(w.u_tex,0),a.uniform2f(w.u_res,c,l),a.uniform2f(w.u_size,_*S,v);let T=C.zoom?1+C.zoom*Math.min(1,t.lf/Math.max(1,s.len)):1,E=y.scale*T*(h.scala??1);a.uniform1f(w.u_scale,E),a.uniform1f(w.u_rot,y.rot*Math.PI/180),a.uniform1i(w.u_orient,m);let D=_*S*E,O=v*E,ee=Math.max(0,Math.min(1,y.angoli??0))*.5*Math.min(D*(1-y.cropL-y.cropR),O*(1-y.cropT-y.cropB));if(a.uniform2f(w.u_boxPx,D,O),a.uniform4f(w.u_box,y.cropL,y.cropT,y.cropR,y.cropB),a.uniform1i(w.u_grad,0),(y.ombra??0)>0){let e=Math.max(4,(y.ombra??0)*Math.min(c,l)*.045),t=e*2/Math.max(1,D),n=e*2/Math.max(1,O);a.uniform4f(w.u_crop,y.cropL-t,y.cropT-n,y.cropR-t,y.cropB-n),a.uniform2f(w.u_off,y.x+h.dx+x.dx,y.y+h.dy+x.dy+e*.45),a.uniform1i(w.u_src,3),a.uniform3f(w.u_color,0,0,0),a.uniform1f(w.u_bright,0),a.uniform1f(w.u_contrast,1),a.uniform1f(w.u_sat,1),a.uniform1f(w.u_hue,0),a.uniform1i(w.u_look,0),a.uniform1i(w.u_key,0),a.uniform1i(w.u_mirror,0),a.uniform1f(w.u_temp,0),a.uniform1f(w.u_vignette,0),a.uniform1i(w.u_auto,0),a.uniform1f(w.u_alpha,(h.alfa??1)*Math.min(.7,.3+(y.ombra??0)*.45)),a.uniform1f(w.u_round,ee+e*.5),a.uniform1f(w.u_feather,e),a.drawArrays(a.TRIANGLE_STRIP,0,4),a.enable(a.BLEND),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA)}a.uniform4f(w.u_crop,y.cropL,y.cropT,y.cropR,y.cropB),a.uniform2f(w.u_off,y.x+h.dx+x.dx,y.y+h.dy+x.dy),a.uniform1f(w.u_alpha,h.alfa??1),a.uniform1f(w.u_round,ee),a.uniform1f(w.u_feather,ee>0?Math.max(.6,c/Math.max(1,this.fbW)):0),a.uniform1i(w.u_src,u);let te=Na(s.gen?.color??`#000000`);if(a.uniform3f(w.u_color,te[0],te[1],te[2]),u===3&&s.gen?.color2){let e=Na(s.gen.color2);a.uniform1i(w.u_grad,1),a.uniform3f(w.u_color2,e[0],e[1],e[2])}a.uniform1f(w.u_bright,C.bright),a.uniform1f(w.u_contrast,C.contrast),a.uniform1f(w.u_sat,C.sat),a.uniform1f(w.u_hue,C.hue),a.uniform1i(w.u_look,C.looks),a.uniform1f(w.u_time,i%1e4/25),a.uniform2f(w.u_texel,1/Math.max(1,_),1/Math.max(1,v));let k=s.ritaglio,A=k&&s.media?Or(k.firma,t.t):null,re=ur(b);a.uniform1i(w.u_key,A?3:b.key===`luma`?1:b.key===`chroma`?2:0);let ie=Na(re[0]);a.uniform3f(w.u_keyColor,ie[0],ie[1],ie[2]);let j=new Float32Array(6);for(let e=1;e<re.length;e++)j.set(Na(re[e]),(e-1)*3);a.uniform3fv(w.u_keyExtra,j),a.uniform1i(w.u_keyN,Math.max(0,re.length-1)),a.uniform1i(w.u_vista,this.vistaChiave),a.uniform1i(w.u_matte,2),a.uniform1i(w.u_matte2,3),a.activeTexture(a.TEXTURE2),a.bindTexture(a.TEXTURE_2D,A?this.matte(`mk:${k.firma}:${A.i}`,A.w,A.h,A.a):this.blank),a.activeTexture(a.TEXTURE3),a.bindTexture(a.TEXTURE_2D,A?this.matte(`mk:${k.firma}:${A.i+(A.b===A.a?0:1)}`,A.w,A.h,A.b):this.blank),a.activeTexture(a.TEXTURE0),a.uniform1f(w.u_matteK,A?.k??0),A&&k?(a.uniform1f(w.u_keyLevel,0),a.uniform1f(w.u_keySoft,k.morbido),a.uniform1f(w.u_keyBordo,k.bordo),a.uniform1i(w.u_keyInv,+!!k.inverti),a.uniform1f(w.u_keySpill,0),a.uniform1f(w.u_keySfuma,0),a.uniform1f(w.u_keyPulisci,0)):(a.uniform1f(w.u_keyLevel,b.keyLevel),a.uniform1f(w.u_keySoft,b.keySoft),a.uniform1i(w.u_keyInv,+!!b.keyInvert),a.uniform1f(w.u_keySpill,b.keySpill??.5),a.uniform1f(w.u_keyBordo,b.keyBordo??0),a.uniform1f(w.u_keySfuma,b.keySfuma??0),a.uniform1f(w.u_keyPulisci,b.keyPulisci??0)),a.uniform1i(w.u_mirror,+!!C.mirror),a.uniform1f(w.u_temp,C.temp),a.uniform1f(w.u_vignette,C.vignette);let ae=s.media&&oe(e,s)?ne(s.media)?.colore:void 0;return a.uniform1i(w.u_auto,+!!ae),ae&&(a.uniform3f(w.u_autoLo,...ae.lo),a.uniform3f(w.u_autoHi,...ae.hi),a.uniform3f(w.u_autoWb,...ae.wb),a.uniform1f(w.u_autoGamma,ae.gamma),a.uniform1f(w.u_autoK,Oe(e).autoK)),a.drawArrays(a.TRIANGLE_STRIP,0,4),a.disable(a.BLEND),!0}combine(e,t,n,r,i=1,a=2,o=0){let s=this.gl;s.bindFramebuffer(s.FRAMEBUFFER,this.fbo[a].fb),s.viewport(0,0,this.canvas.width,this.canvas.height),a===2?(s.enable(s.BLEND),s.blendFunc(s.ONE,s.ONE_MINUS_SRC_ALPHA)):(s.disable(s.BLEND),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT)),s.useProgram(this.pComb);let c=this.uC;s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,this.fbo[o].tex),s.activeTexture(s.TEXTURE1),s.bindTexture(s.TEXTURE_2D,this.fbo[i].tex),ja(s,c,e,t,n,r,this.canvas.width/this.canvas.height),s.drawArrays(s.TRIANGLE_STRIP,0,4),s.activeTexture(s.TEXTURE0)}leggiPiccolo(e,t,n){let r=this.gl;if(r.bindFramebuffer(r.READ_FRAMEBUFFER,null),!this.small||this.smallW!==e||this.smallH!==t){this.small&&(r.deleteFramebuffer(this.small.fb),r.deleteRenderbuffer(this.small.rb));let n=r.createRenderbuffer();r.bindRenderbuffer(r.RENDERBUFFER,n),r.renderbufferStorage(r.RENDERBUFFER,r.RGBA8,e,t);let i=r.createFramebuffer();r.bindFramebuffer(r.FRAMEBUFFER,i),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,n),this.small={fb:i,rb:n},this.smallW=e,this.smallH=t}if(!this.fbo.length){n.fill(0);return}r.bindFramebuffer(r.READ_FRAMEBUFFER,this.fbo[this.uscita].fb),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,this.small.fb),r.blitFramebuffer(0,0,this.fbW,this.fbH,0,0,e,t,r.COLOR_BUFFER_BIT,r.LINEAR),r.bindFramebuffer(r.READ_FRAMEBUFFER,this.small.fb),r.readPixels(0,0,e,t,r.RGBA,r.UNSIGNED_BYTE,n),r.bindFramebuffer(r.FRAMEBUFFER,null)}small=null;smallW=0;smallH=0;dimentica(e){for(let[t,n]of this.texs)t.startsWith(e)&&(this.gl.deleteTexture(n.tex),this.texs.delete(t))}distruggi(){let e=this.gl;for(let t of this.texs.values())e.deleteTexture(t.tex);this.texs.clear();for(let t of this.fbo)e.deleteFramebuffer(t.fb),e.deleteTexture(t.tex);this.fbo=[],this.interp?.distruggi(),e.getExtension(`WEBGL_lose_context`)?.loseContext()}},Fa=e({converti:()=>Ga,esamina:()=>Va,fpsPulito:()=>Ra,normalizzaAttivo:()=>Ia,variazione:()=>za}),Ia=()=>{try{return localStorage.getItem(`dpv-normalizza`)!==`no`}catch{return!0}},La=[23.976,24,25,29.97,30,48,50,59.94,60];function Ra(e){return La.find(t=>Math.abs(t-e)/t<.02)??Math.round(e*100)/100}function za(e){if(e.length<8)return{cv:0,rapporto:1};let t=e.reduce((e,t)=>e+t,0)/e.length,n=Math.sqrt(e.reduce((e,n)=>e+(n-t)**2,0)/e.length),r=Math.min(...e),i=Math.max(...e);return{cv:t?n/t:0,rapporto:r>0?i/r:99}}function Ba(e){if(e.file)return new lt(e.file,{maxCacheSize:33554432});let t=e.path;return new r({getSize:()=>N(`media_dimensione`,{path:t}),read:async(e,n)=>new Uint8Array(await N(`media_leggi`,{path:t,start:e,end:n})),maxCacheSize:33554432,prefetchProfile:`fileSystem`})}async function Va(e){if(!e.file&&!(e.path&&d))return null;let t=new w({source:Ba(e),formats:D});try{let e=await t.getPrimaryVideoTrack(),n=await t.getPrimaryAudioTrack();if(e){let t=await e.computeFrameRateMetrics({targetPacketCount:400}).catch(()=>null);return t&&!t.frameRateIsConstant&&t.probedPacketCount>=30&&t.maxFrameRate/Math.max(1e-6,t.minFrameRate)>1.25?{vfr:!0,fps:Ra(t.medianFrameRate||t.averageFrameRate),vbr:!1,motivo:`frame rate variabile → costante`}:null}if(n){let e=String(await n.getCodec()??``);if(!/^(mp3|opus|vorbis)$/.test(e))return null;let t=new h(n),r=[];for await(let e of t.packets(void 0,void 0,{metadataOnly:!0}))if(r.push(e.byteLength),r.length>=400)break;let{cv:i,rapporto:a}=za(r);if(i>.08&&a>1.25)return{vfr:!1,fps:0,vbr:!0,motivo:`bitrate variabile → costante`}}return null}catch{return null}finally{t.dispose()}}async function Ha(e){if(d){let t=await N(`registrazione_percorso`,{name:e}),n=await N(`export_apri`,{path:t}),r=new WritableStream({write:async e=>{await N(`export_scrivi`,e.data,{headers:{"x-id":String(n),"x-pos":String(e.position)}})}});return{target:new S(r,{chunked:!0,chunkSize:4194304}),fine:async()=>(await N(`export_chiudi`,{id:n}),{path:t}),annulla:async()=>{await N(`export_chiudi`,{id:n}).catch(()=>{})}}}let t=new b;return{target:t,fine:async()=>({blob:new Blob([t.buffer])}),annulla:async()=>{}}}var Ua=null,Wa=()=>Ua??=pt(()=>import(`./mediabunny-aac-encoder-hkivC0Ui.js`).then(e=>{e.registerAacEncoder()}),__vite__mapDeps([6,2,3,4]),import.meta.url).catch(()=>{});async function Ga(e,t,n,r){let i=new w({source:Ba(e),formats:D}),o=e.name.replace(/\.[^.]+$/,``);await Wa();try{let e,c=null;if(t.vfr){if(c=await ut([`avc`,`vp9`,`vp8`,`av1`]),!c)throw Error(`nessun codificatore video`);e=c===`avc`}else e=await ft([`aac`,`opus`])===`aac`;let l=await ft(e?[`aac`,`opus`]:[`opus`,`vorbis`]),u=t.vfr?e?`mp4`:`webm`:e?`m4a`:`webm`,f=`${o}.${u}`,p=await Ha(f),m=new a({format:e?new A({fastStart:!d&&`in-memory`}):new s,target:p.target});try{let e=await ee.init({input:i,output:m,...t.vfr?{video:{frameRate:t.fps,...c?{codec:c}:{},bitrate:new dt(`high`)}}:{video:{discard:!0}},audio:{...l?{codec:l}:{},bitrate:new dt({quality:`high`,preferBitrate:!0,bitrateMode:`constant`}),...t.vbr?{forceTranscode:!0}:{}}});if(!e.isValid)throw Error(`questo file non si riesce a convertire`);if(e.onProgress=t=>{n(t),r?.aborted&&e.cancel()},await e.execute(),r?.aborted)throw Error(`fermato`)}catch(e){throw await p.annulla(),e}let h=await p.fine();return h.path?{name:f,path:h.path}:{name:f,file:new File([h.blob],f,{type:u===`mp4`?`video/mp4`:u===`m4a`?`audio/mp4`:`video/webm`,lastModified:Date.now()})}}finally{i.dispose()}}var Ka=e({crc32:()=>Ja,indicePacchetto:()=>oo,leggiPacchetto:()=>so,pianoPacchetto:()=>to,scriviPacchetto:()=>io}),qa=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t++){let n=t;for(let e=0;e<8;e++)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})();function Ja(e,t=0){let n=~t>>>0;for(let t=0;t<e.length;t++)n=qa[(n^e[t])&255]^n>>>8;return~n>>>0}var $=4294967295,Ya=new TextEncoder;function Xa(e=new Date){return[e.getHours()<<11|e.getMinutes()<<5|e.getSeconds()>>1,Math.max(1980,e.getFullYear())-1980<<9|e.getMonth()+1<<5|e.getDate()]}function Za(e,t,n,r){let i=r?20:0,a=new Uint8Array(30+e.length+i),o=new DataView(a.buffer),[s,c]=Xa();if(o.setUint32(0,67324752,!0),o.setUint16(4,r?45:20,!0),o.setUint16(6,2048,!0),o.setUint16(8,0,!0),o.setUint16(10,s,!0),o.setUint16(12,c,!0),o.setUint32(14,n,!0),o.setUint32(18,r?$:t,!0),o.setUint32(22,r?$:t,!0),o.setUint16(26,e.length,!0),o.setUint16(28,i,!0),a.set(e,30),r){let n=30+e.length;o.setUint16(n,1,!0),o.setUint16(n+2,16,!0),o.setBigUint64(n+4,BigInt(t),!0),o.setBigUint64(n+12,BigInt(t),!0)}return a}function Qa(e,t){let n=[],[r,i]=Xa();for(let t of e){let e=t.len>=$,a=t.off>=$,o=(e?16:0)+(a?8:0),s=new Uint8Array(46+t.nome.length+(o?4+o:0)),c=new DataView(s.buffer);if(c.setUint32(0,33639248,!0),c.setUint16(4,45,!0),c.setUint16(6,e||a?45:20,!0),c.setUint16(8,2048,!0),c.setUint16(10,0,!0),c.setUint16(12,r,!0),c.setUint16(14,i,!0),c.setUint32(16,t.crc,!0),c.setUint32(20,e?$:t.len,!0),c.setUint32(24,e?$:t.len,!0),c.setUint16(28,t.nome.length,!0),c.setUint16(30,o?4+o:0,!0),c.setUint32(42,a?$:t.off,!0),s.set(t.nome,46),o){let n=46+t.nome.length;c.setUint16(n,1,!0),c.setUint16(n+2,o,!0),n+=4,e&&(c.setBigUint64(n,BigInt(t.len),!0),c.setBigUint64(n+8,BigInt(t.len),!0),n+=16),a&&c.setBigUint64(n,BigInt(t.off),!0)}n.push(s)}let a=n.reduce((e,t)=>e+t.length,0),o=t>=$||a>=$||e.length>=65535||e.some(e=>e.off>=$||e.len>=$);if(o){let r=new Uint8Array(76),i=new DataView(r.buffer);i.setUint32(0,101075792,!0),i.setBigUint64(4,44n,!0),i.setUint16(12,45,!0),i.setUint16(14,45,!0),i.setBigUint64(24,BigInt(e.length),!0),i.setBigUint64(32,BigInt(e.length),!0),i.setBigUint64(40,BigInt(a),!0),i.setBigUint64(48,BigInt(t),!0),i.setUint32(56,117853008,!0),i.setBigUint64(64,BigInt(t+a),!0),i.setUint32(72,1,!0),n.push(r)}let s=new Uint8Array(22),c=new DataView(s.buffer);c.setUint32(0,101010256,!0),c.setUint16(8,Math.min(65535,e.length),!0),c.setUint16(10,Math.min(65535,e.length),!0),c.setUint32(12,Math.min($,a),!0),c.setUint32(16,o?$:t,!0),n.push(s);let l=new Uint8Array(n.reduce((e,t)=>e+t.length,0)),u=0;for(let e of n)l.set(e,u),u+=e.length;return l}function $a(e){let t=ne(e.id);return!t||t.stato!==`ok`?null:t.file?{file:t.file,off:0,len:t.file.size}:t.path?{path:t.path,off:t.off??0,len:t.len??e.size}:null}var eo=(e,t)=>`media/${String(e+1).padStart(3,`0`)}-${t.name.replace(/[\\/:*?"<>|]/g,`_`)}`;async function to(e){let t=j.doc,n=new Set;for(let e of t.clips)e.media&&n.add(e.media);for(let e of t.sequenze??[])for(let t of e.clips??[])t.media&&n.add(t.media);t.master?.logo?.media&&n.add(t.master.logo.media);let r=[],i=[],a=0;for(let o of t.media){if(e&&!n.has(o.id))continue;let t=$a(o);if(!t){i.push(o);continue}t.path&&!t.len&&(t.len=await N(`media_dimensione`,{path:t.path})),r.push({m:o,f:t,nome:eo(a++,o)})}return{voci:r,mancano:i,byte:r.reduce((e,t)=>e+t.f.len,0)}}var no=`DaProd Video · pacchetto del progetto

Questo file è un progetto di DaProd Video con dentro tutti i suoi file: aprilo con
DaProd Video (File → Apri, o doppio clic) e ritrovi il montaggio identico, anche su
un altro computer. Non serve scompattarlo.

Dentro: progetto.json (il montaggio) e la cartella media/ (i video, le musiche, le immagini).
https://github.com/cammo22/DaProdVideo
`;function ro(e,t){let n=structuredClone(j.doc),r=new Map(e.voci.map(e=>[e.m.id,e.nome]));t&&(n.media=n.media.filter(e=>r.has(e.id)));for(let e of n.media){delete e.path,delete e.dentro;let t=r.get(e.id);t?e.pacchetto=t:delete e.pacchetto}return n.saved=Date.now(),JSON.stringify(n)}async function io(e,n,r,i,a){let o=Ya.encode(ro(n,r)),s=Ya.encode(no),c=n.byte+o.length,l=0,u=[];if(d){let t=await _e(e,`daprod`,`application/zip`);if(!t)return null;if(n.voci.some(e=>e.f.path===t))throw Error(`scegli un nome diverso dal pacchetto aperto (i file si leggono da lì)`);let r=await N(`export_apri`,{path:t}),d=(e,t)=>N(`export_scrivi`,e,{headers:{"x-id":String(r),"x-pos":String(t)}}),f=0;try{let e=async(e,t)=>{let n=Ya.encode(e),r=Ja(t),i=Za(n,t.length,r,!1);await d(i,f),await d(t,f+i.length),u.push({nome:n,off:f,len:t.length,crc:r}),f+=i.length+t.length};await e(`LEGGIMI.txt`,s),await e(`progetto.json`,o),l+=o.length;for(let e of n.voci){if(a())throw Error(`annullato`);let t=Ya.encode(e.nome),n=e.f.len>=$,o=Za(t,e.f.len,0,n);await d(o,f);let s=f+o.length,p=0,m=64<<20;for(let t=0;t<e.f.len;t+=m){if(a())throw Error(`annullato`);let n=Math.min(e.f.len,t+m);p=await N(`pacchetto_copia`,{path:e.f.path,start:e.f.off+t,end:e.f.off+n,id:r,pos:s+t,crc:p}),l+=n-t,i(l,c,e.m.name)}let h=new Uint8Array(4);new DataView(h.buffer).setUint32(0,p,!0),await d(h,f+14),u.push({nome:t,off:f,len:e.f.len,crc:p}),f=s+e.f.len}await d(Qa(u,f),f)}finally{await N(`export_chiudi`,{id:r})}return t}let f=[],p=0,m=(e,t)=>{let n=Ya.encode(e),r=Ja(t),i=Za(n,t.length,r,!1);f.push(i,t),u.push({nome:n,off:p,len:t.length,crc:r}),p+=i.length+t.length};m(`LEGGIMI.txt`,s),m(`progetto.json`,o),l+=o.length;for(let e of n.voci){if(a())return null;let t=e.f.file.slice(e.f.off,e.f.off+e.f.len),n=0,r=t.stream().getReader();for(;;){let{done:t,value:o}=await r.read();if(t)break;if(n=Ja(o,n),l+=o.length,i(l,c,e.m.name),a())return await r.cancel(),null}let o=Ya.encode(e.nome),s=Za(o,e.f.len,n,e.f.len>=$);f.push(s,t),u.push({nome:o,off:p,len:e.f.len,crc:n}),p+=s.length+e.f.len}f.push(Qa(u,p));let h=new Blob(f,{type:`application/zip`}),g=window;if(g.showSaveFilePicker)try{let t=await(await g.showSaveFilePicker({suggestedName:e,types:[{description:`Progetto DaProd Video`,accept:{"application/zip":[`.daprod`]}}]})).createWritable();return await h.stream().pipeTo(t),e}catch(e){if(e.name===`AbortError`)return null}return t(h,e),e}async function ao(e,t,n){return e.file?new Uint8Array(await e.file.slice(t,n).arrayBuffer()):new Uint8Array(await N(`media_leggi`,{path:e.path,start:t,end:n}))}async function oo(e){let t=e.file?e.file.size:await N(`media_dimensione`,{path:e.path}),n=await ao(e,Math.max(0,t-66e3),t),r=-1;for(let e=n.length-22;e>=0;e--)if(n[e]===80&&n[e+1]===75&&n[e+2]===5&&n[e+3]===6){r=e;break}if(r<0)throw Error(`non è un pacchetto (manca la fine dello zip)`);let i=new DataView(n.buffer,n.byteOffset),a=i.getUint16(r+10,!0),o=i.getUint32(r+12,!0),s=i.getUint32(r+16,!0);if(a===65535||o===$||s===$){let t=r-20;if(t<0||i.getUint32(t,!0)!==117853008)throw Error(`zip64 senza il suo indice`);let n=Number(i.getBigUint64(t+8,!0)),c=await ao(e,n,n+56),l=new DataView(c.buffer,c.byteOffset);if(l.getUint32(0,!0)!==101075792)throw Error(`zip64 rovinato`);a=Number(l.getBigUint64(32,!0)),o=Number(l.getBigUint64(40,!0)),s=Number(l.getBigUint64(48,!0))}let c=await ao(e,s,s+o),l=new DataView(c.buffer,c.byteOffset),u=new TextDecoder,d=new Map,f=0;for(let e=0;e<a&&f+46<=c.length&&l.getUint32(f,!0)===33639248;e++){let e=l.getUint16(f+10,!0),t=l.getUint32(f+20,!0),n=l.getUint32(f+24,!0),r=l.getUint16(f+28,!0),i=l.getUint16(f+30,!0),a=l.getUint16(f+32,!0),o=l.getUint32(f+42,!0),s=u.decode(c.subarray(f+46,f+46+r)),p=f+46+r,m=p+i;for(;p+4<=m;){let e=l.getUint16(p,!0),r=l.getUint16(p+2,!0);if(e===1){let e=p+4;n===$&&(n=Number(l.getBigUint64(e,!0)),e+=8),t===$&&(t=Number(l.getBigUint64(e,!0)),e+=8),o===$&&(o=Number(l.getBigUint64(e,!0)))}p+=4+r}d.set(s,{nome:s,off:o,len:t,stored:e===0&&t===n}),f+=46+r+i+a}for(let t of d.values()){let n=await ao(e,t.off,t.off+30),r=new DataView(n.buffer,n.byteOffset);if(r.getUint32(0,!0)!==67324752)throw Error(`voce rovinata: `+t.nome);t.off=t.off+30+r.getUint16(26,!0)+r.getUint16(28,!0)}return d}async function so(e){let t=await oo(e),n=t.get(`progetto.json`);if(!n)throw Error(`nel pacchetto manca progetto.json`);if(!n.stored)throw Error(`progetto.json compresso: questo pacchetto non l'ha fatto DaProd Video`);return{testo:new TextDecoder().decode(await ao(e,n.off,n.off+n.len)),voci:t}}var co=e({apri:()=>Io,apriFile:()=>Lo,apriRecente:()=>Ao,autosalva:()=>Po,avvisoLungo:()=>Jo,carica:()=>Ho,dimenticaRecente:()=>Eo,importaDaDrop:()=>So,importaDialogo:()=>xo,importaFile:()=>_o,nuovo:()=>Vo,percorsoProgetto:()=>lo,recenti:()=>wo,registraRecente:()=>Oo,riapriMedia:()=>Wo,ricollega:()=>Go,riprendi:()=>Ko,s2f:()=>nt,salva:()=>Mo,salvaPacchetto:()=>zo,togliMedia:()=>qo}),lo=null,uo=314572800;function fo(){return new Promise((e,t)=>{let n=indexedDB.open(`daprod-video`,2);n.onupgradeneeded=()=>{for(let e of[`kv`,`maniglie`,`file`])n.result.objectStoreNames.contains(e)||n.result.createObjectStore(e)},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function po(e,t,n,r){try{let i=await fo();return await new Promise((a,o)=>{let s=i.transaction(e,t===`get`?`readonly`:`readwrite`).objectStore(e),c=t===`get`?s.get(n):t===`put`?s.put(r,n):s.delete(n);c.onsuccess=()=>a(c.result),c.onerror=()=>o(c.error)})}catch{return}}async function mo(e){try{let t=await fo();return await new Promise((n,r)=>{let i=t.transaction(e,`readonly`).objectStore(e).getAllKeys();i.onsuccess=()=>n(i.result.map(String)),i.onerror=()=>r(i.error)})}catch{return[]}}async function ho(){if(d)return;let e=wo(),t=new Set(e.map(e=>`rec:`+e.chiave)),n=new Set(j.doc.media.map(e=>e.id));for(let e of await mo(`kv`))if(e.startsWith(`rec:`)){if(!t.has(e)){po(`kv`,`delete`,e);continue}try{let t=JSON.parse(await po(`kv`,`get`,e)??`null`);for(let e of t?.media??[])n.add(e.id);for(let e of t?.sequenze??[])for(let t of e.clips??[])t.media&&n.add(t.media)}catch{}}for(let e of[`file`,`maniglie`])for(let t of await mo(e))n.has(t)||po(e,`delete`,t)}var go=/\.(jpe?g|png|webp|gif|bmp|avif)$/i;async function _o(e,t={}){if(!e.length)return[];let n=[],r=[],i=be({titolo:e.length===1?`Importo un file`:`Importo ${e.length} file`,categoria:`file`}),a=0;for(let o of e){if(i.fermato)break;i.imposta(a/e.length,`${++a} di ${e.length} · ${o.name}`);let s=await ie(o);if(`errore`in s){r.push(`${s.nome}: ${s.errore}`);continue}t.cartella&&(s.item.cartella=t.cartella),n.push(s.item),o.maniglia?po(`maniglie`,`put`,s.item.id,o.maniglia):!d&&o.file&&o.file.size<=uo&&po(`file`,`put`,s.item.id,o.file),vo(s.item,o)}if(i.fine(n.length===1?`1 file`:`${n.length} file`),n.length){j.edit(`Importa ${n.length} file`,e=>{e.media.push(...n)});let e=n.find(e=>e.type===`video`&&e.width);e&&t.chiediFormato!==!1&&!j.doc.clips.length&&j.doc.media.length===n.length&&bo(e),F(`${n.length} file nel contenitore`,`ok`),M.playerMedia||M.caricaPlayer(n[0].id)}if(r.length){let e=vt(`Alcuni file non si aprono`);e.corpo.append(P(`p`,null,`Questi file non sono stati importati:`),P(`ul`,{class:`lista-errori`},r.map(e=>P(`li`,null,e))),P(`p`,{class:`nota`},`Formati che vanno: MP4, MOV, MKV, WebM, MTS/M2TS (AVCHD), MP3, WAV, AAC, FLAC, OGG, immagini. I codec dipendono dal sistema: H.264, H.265/HEVC (se il sistema lo decodifica), VP8/VP9, AV1, ProRes no.`)),e.piede.append(P(`button`,{class:`btn primario`,on:{click:e.chiudi}},`OK`))}return n}function vo(e,t){if(!Ia()||e.type===`image`||go.test(t.name))return;let n=p(e.id);Be({corsia:`leggero`,titolo:`Controllo la velocità dei file`,categoria:`analisi`,gruppo:`esame`,priorita:n},async r=>{r.imposta(0,e.name);let i=await Va(t);i&&Be({corsia:`pesante`,titolo:`Conversione a velocità costante`,categoria:`conversione`,gruppo:`converti`,priorita:n},async n=>{n.imposta(0,`${e.name} · ${i.motivo}`);let r=await Ga(t,i,e=>n.imposta(e),n.segnale);n.imposta(1,`${e.name} · metto la copia al suo posto`),await yo(e.id,r)&&F(`🔧 ${e.name}: ${i.motivo} (l'originale non è stato toccato)`,`info`,3600)})})}async function yo(e,t){if(!j.doc.media.some(t=>t.id===e))return!1;let n=await ie(t,{soloDescrizione:!0});if(`errore`in n)throw Error(n.errore);for(;M.playing;)await new Promise(e=>setTimeout(e,400));let r=j.doc.media.find(t=>t.id===e);if(!r)return!1;let i=n.item;return j.aggiornaMedia(e,{duration:i.duration,t0:i.t0,width:i.width,height:i.height,fps:i.fps,rotation:i.rotation,hasVideo:i.hasVideo,hasAudio:i.hasAudio,channels:i.channels,sampleRate:i.sampleRate,vcodec:i.vcodec,acodec:i.acodec,container:i.container,size:i.size,lastModified:i.lastModified,path:t.path},(i.t0||0)-(r.t0||0)),l(e),await ct(j.doc.media.find(t=>t.id===e),{file:t.file,path:t.path}),!d&&t.file&&(po(`maniglie`,`delete`,e),t.file.size<=uo&&po(`file`,`put`,e,t.file)),j.emit(`doc`),M.ridisegna(),!0}async function bo(e){let t=j.doc,n=e.rotation%180?e.height:e.width,r=e.rotation%180?e.width:e.height,i=Math.round(e.fps*100)/100,a=Math.abs(i-29.97)<.02?{num:3e4,den:1001}:Math.abs(i-59.94)<.02?{num:6e4,den:1001}:Math.abs(i-23.976)<.02?{num:24e3,den:1001}:{num:Math.round(i)||25,den:1};(n!==t.w||r!==t.h||a.num/a.den!==t.rate.num/t.rate.den)&&await yt(`Formato del progetto`,`Il primo video è ${n}×${r} a ${i} fps. Imposto il progetto uguale?`,`Sì, uguale al video`,`Tengo `+t.w+`×`+t.h)&&j.edit(`Formato dal video`,e=>{e.w=n,e.h=r,e.rate=a,e.drop=a.den===1001&&Math.round(a.num/a.den)===30})}async function xo(e,t){let n=window;if(!d&&n.showOpenFilePicker)try{let r={"video/*":Te.video.map(e=>`.`+e),"audio/*":Te.audio.map(e=>`.`+e),"image/*":Te.image.map(e=>`.`+e)},i=t?{[`${t}/*`]:r[`${t}/*`]}:r,a=await n.showOpenFilePicker({multiple:!0,types:[{description:t?{video:`Video`,audio:`Musica e audio`,image:`Immagini`}[t]:`Video, audio e immagini`,accept:i}],excludeAcceptAllOption:!1});return _o(await Promise.all(a.map(async e=>{let t=await e.getFile();return{name:t.name,file:t,maniglia:e}})),{cartella:e})}catch(e){if(e.name===`AbortError`)return[]}return _o(await x(t),{cartella:e})}async function So(e,t){let n=[],r=[...e.items].filter(e=>e.kind===`file`);for(let e of r){let t=e.getAsFile();if(!t)continue;let r,i=e.getAsFileSystemHandle;if(i)try{r=await i.call(e)??void 0}catch{}n.push({name:t.name,file:t,maniglia:r})}return _o(n,{cartella:t})}var Co=12;function wo(){try{let e=JSON.parse(localStorage.getItem(`dpv-recenti`)??`[]`);return Array.isArray(e)?e:[]}catch{return[]}}function To(e){try{localStorage.setItem(`dpv-recenti`,JSON.stringify(e.slice(0,Co)))}catch{}}function Eo(e){To(wo().filter(t=>t.chiave!==e)),po(`kv`,`delete`,`rec:`+e).catch(()=>{})}function Do(e){try{let t=e.clips.filter(e=>e.kind===`media`&&e.media).sort((e,t)=>e.start-t.start).find(e=>!!ne(e.media)?.poster),n=t?ne(t.media)?.poster:void 0;if(!n||!n.width)return;let r=document.createElement(`canvas`);r.width=192,r.height=108;let i=r.getContext(`2d`);i.fillStyle=`#111`,i.fillRect(0,0,192,108);let a=Math.min(192/n.width,108/n.height);return i.drawImage(n,(192-n.width*a)/2,(108-n.height*a)/2,n.width*a,n.height*a),r.toDataURL(`image/jpeg`,.7)}catch{return}}function Oo(e,t,n){let r=t??`b:`+(e.name||`montaggio`),i=ko(e);To([{chiave:r,nome:e.name||`Montaggio senza nome`,path:t,data:Date.now(),clip:e.clips.filter(e=>e.kind!==`fx`).length,durata:Math.max(0,...e.clips.map(e=>e.start+e.len))/i,formato:`${e.w}×${e.h} · ${Math.round(i*100)/100} fps`,miniatura:Do(e)},...wo().filter(e=>e.chiave!==r)]),!d&&n&&po(`kv`,`put`,`rec:`+r,n).catch(()=>{})}var ko=e=>e.rate.num/e.rate.den;async function Ao(e){if(j.dirty&&j.doc.clips.length&&!await yt(`Apri progetto`,`Il montaggio attuale ha modifiche non salvate. Aprire un altro progetto?`,`Apri`,`Annulla`))return!1;if(e.path&&d){try{await N(`progetto_leggi`,{path:e.path})}catch{return F(`Questo progetto non c'è più dove l'avevi salvato`,`errore`,4e3),Eo(e.chiave),!1}return await Lo({path:e.path}),!0}let t=await po(`kv`,`get`,`rec:`+e.chiave),n=null;try{n=t?Fo(JSON.parse(t)):null}catch{n=null}return n?(lo=null,await Ho(n),F(`📂 ${n.name}`,`ok`),!0):(F(`Di questo progetto non ho più la copia: aprilo dal file (Apri progetto…)`,`info`,4500),!1)}function jo(){let e=j.doc;return e.saved=Date.now(),JSON.stringify(e)}async function Mo(e=!1){let t=(j.doc.name||`montaggio`).replace(/[\\/:*?"<>|]/g,`_`)+`.dpv`,n;try{n=await je(t,jo(),`dpv`,e?void 0:lo??void 0)}catch(e){F(`⚠ Il progetto NON è stato salvato: `+(e instanceof Error?e.message:String(e))+` · prova Salva come…`,`errore`,7e3);return}n&&(d&&(lo=n),j.dirty=!1,Oo(j.doc,d?n:void 0,d?void 0:jo()),F(`💾 Salvato: ${c(n)}`,`ok`),j.emit(`status`))}var No=-1;async function Po(){if(!j.dirty&&j.doc.saved)return;let e=j.revisione;if(e===No)return;let t=jo();try{d?await N(`autosalva`,{text:t}):await po(`kv`,`put`,`autosalvataggio`,t),No=e}catch{}}function Fo(e){let t=e;if(!t||t.format!==`daprod-video`||!Array.isArray(t.tracks)||!Array.isArray(t.clips))return null;for(let e of t.media)e.t0??=0,e.markIn??=null,e.markOut??=null;for(let e of t.clips)e.opKeys??=[],e.gainKeys??=[],e.speed??=1;for(let e of t.tracks)e.kind===`audio`&&e.height===46&&(e.height=ae.audio),e.kind===`video`&&e.height===58&&(e.height=ae.video);return t.master={...Ue,...t.master??{}},_(t),t}async function Io(){if(j.dirty&&j.doc.clips.length&&!await yt(`Apri progetto`,`Il montaggio attuale ha modifiche. Aprire un altro progetto?`,`Apri`,`Annulla`))return;if(d){let[e]=await st({multiple:!1,title:`Progetto DaProd Video`,estensioni:[`daprod`,`dpv`,`json`],mime:[]});e&&await Lo({path:e});return}let[e]=await ke(`.daprod,.dpv,.json,application/json,application/zip`,!1);e&&await Lo({file:e})}async function Lo(e){let t=e.file?.name??c(e.path??``);if(/\.daprod$/i.test(t)){await Ro(e);return}let n=null;try{let t=e.file?await e.file.text():await N(`progetto_leggi`,{path:e.path});n=Fo(JSON.parse(t))}catch{n=null}if(!n){F(`Questo file non è un progetto DaProd Video`,`errore`);return}lo=e.path??null,await Ho(n),Oo(n,e.path,e.path?void 0:JSON.stringify(n)),F(`📂 ${n.name}`,`ok`)}async function Ro(e){let t=Jo(`Apro il pacchetto…`);try{let{testo:r,voci:i}=await so(e),a=Fo(JSON.parse(r));if(!a)throw Error(`dentro non c'è un progetto DaProd Video`);for(let t of a.media){let n=t.pacchetto?i.get(t.pacchetto):void 0;n&&(t.dentro={off:n.off,len:n.len},e.path&&(t.path=e.path))}lo=null;for(let e of j.doc.media)n(e.id),l(e.id);M.caricaPlayer(null),j.load(a);let o=0,s=0;for(let n of a.media){if(t.testo(`Apro il pacchetto: ${++s}/${a.media.length} ${n.name}`,(s-1)/a.media.length),!n.dentro){o++;continue}if(e.path){(await ct(n,{path:e.path})).stato!==`ok`&&o++;continue}let r=new File([e.file.slice(n.dentro.off,n.dentro.off+n.dentro.len)],n.name,{lastModified:n.lastModified||Date.now()});if((await ct(n,{file:r})).stato!==`ok`){o++;continue}r.size<=uo&&po(`file`,`put`,n.id,r)}j.dirty=!1,j.emit(`doc`),M.ridisegna(),F(`📦 ${a.name}: aperto dal pacchetto${o?` (${o} file mancano)`:`, con tutti i suoi file`}`,o?`info`:`ok`,3500)}catch(e){F(`Il pacchetto non si apre: `+(e instanceof Error?e.message:String(e)),`errore`,5e3)}finally{t.chiudi()}}async function zo(){let e=j.doc,t=vt(`Salva il pacchetto .daprod`),n=P(`input`,{type:`checkbox`}),r=P(`b`,null,`…`),i=P(`span`,null,``),a=P(`p`,{class:`nota`}),o=async()=>{let e=await to(n.checked);return r.textContent=Bo(e.byte),i.textContent=`${e.voci.length} file`,a.textContent=e.mancano.length?`⚠ ${e.mancano.length} file non collegati restano fuori: ${e.mancano.map(e=>e.name).slice(0,4).join(`, `)}${e.mancano.length>4?`…`:``}`:``,e};n.addEventListener(`change`,()=>void o()),t.corpo.append(P(`p`,null,`Il progetto e tutti i suoi file (video, musiche, immagini) in un file solo. Portalo su un altro computer e aprilo con DaProd Video: ritrovi il montaggio identico. È uno zip: i file dentro restano uguali (niente perdita di qualità) e si aprono direttamente da lì.`),P(`p`,null,i,` · `,r),P(`label`,{class:`riga-spunta`},n,` Solo i file usati nel montaggio (il contenitore si alleggerisce)`),a),o();let s=P(`button`,{class:`btn`,on:{click:()=>t.chiudi()}},`Annulla`),l=P(`button`,{class:`btn primario`,on:{click:async()=>{let r=await o();t.chiudi();let i=(e.name||`montaggio`).replace(/[\\/:*?"<>|]/g,`_`)+`.daprod`,a=!1,s=Jo(`Preparo il pacchetto…`,()=>{a=!0});try{let e=await io(i,r,n.checked,(e,t,n)=>s.testo(`📦 ${Math.floor(e/Math.max(1,t)*100)}% · ${n}`),()=>a);e&&F(`📦 Pacchetto salvato: ${c(e)} (${Bo(r.byte)})`,`ok`,4e3)}catch(e){F(a?`Pacchetto annullato`:`Il pacchetto non si salva: `+(e instanceof Error?e.message:String(e)),a?`info`:`errore`,5e3)}finally{s.chiudi()}}}},`📦 Salva il pacchetto`);t.piede.append(s,l)}var Bo=e=>e>=1<<30?(e/(1<<30)).toFixed(2).replace(`.`,`,`)+` GB`:Math.max(.1,e/(1<<20)).toFixed(1).replace(`.`,`,`)+` MB`;async function Vo(e=re[0]){if(!(j.dirty&&j.doc.clips.length&&!await yt(`Nuovo progetto`,`Il montaggio attuale ha modifiche non salvate. Ricominciare?`,`Nuovo`,`Annulla`))){for(let e of j.doc.media)n(e.id),l(e.id);lo=null,M.caricaPlayer(null),j.load(Je(e)),j.doc.saved=0,ho()}}async function Ho(e){for(let e of j.doc.media)n(e.id),l(e.id);M.caricaPlayer(null),j.load(e),await Wo(!1),ho()}async function Uo(e,t){if(ne(e.id)?.stato===`ok`)return!0;if(d&&e.path)return(await ct(e,{path:e.path})).stato===`ok`;let n=await po(`maniglie`,`get`,e.id);if(n)try{let r=await n.queryPermission?.({mode:`read`})??`granted`;if(r!==`granted`&&t&&(r=await n.requestPermission?.({mode:`read`})??`denied`),r===`granted`){let t=await n.getFile();if((await ct(e,{file:t})).stato===`ok`)return!0}}catch{}let r=await po(`file`,`get`,e.id);if(r){let t=r instanceof File?r:new File([r],e.name,{type:r.type});if((await ct(e,{file:t})).stato===`ok`)return!0}return!1}async function Wo(e){let t=j.doc,n=t.media.filter(e=>ne(e.id)?.stato!==`ok`);if(!n.length)return j.emit(`doc`),M.ridisegna(),0;let r=new Map;for(let e of t.clips)e.media&&r.set(e.media,(r.get(e.media)??0)+1);n.sort((e,t)=>(r.get(t.id)??0)-(r.get(e.id)??0));let i=be({titolo:`Riapro i file del progetto`,categoria:`file`}),a=0,o=0,s=0,c=!1,l=0,u=()=>{l=0,c&&(c=!1,j.emit(`doc`),M.ridisegna())};return await Promise.all(Array.from({length:e?1:Math.min(4,n.length)},async()=>{for(;;){if(i.fermato)return;let t=n[s++];if(!t)return;i.imposta(a/n.length,`${a+1} di ${n.length} · ${t.name}`);let r=!1;try{r=await Uo(t,e)}catch{r=!1}r||o++,a++,i.imposta(a/n.length,`${a} di ${n.length}`),c=!0,l||=window.setTimeout(u,600)}})),clearTimeout(l),c=!0,u(),i.fermato?(i.annullata(),o+(n.length-a)):(i.fine(o?`${n.length-o} file aperti, ${o} mancano`:`${n.length} file`),o)}async function Go(){if(!j.doc.media.filter(e=>ne(e.id)?.stato!==`ok`).length){F(`Tutti i file sono collegati`,`ok`);return}if(!await Wo(!0)){F(`File ricollegati`,`ok`);return}let e=await x(),t=0;for(let n of j.doc.media){if(ne(n.id)?.stato===`ok`)continue;let r=e.find(e=>e.name===n.name&&(!e.file||!n.size||e.file.size===n.size))??e.find(e=>e.name===n.name);r&&(await ct(n,{file:r.file,path:r.path})).stato===`ok`&&(t++,r.path&&r.path!==n.path&&j.aggiornaMedia(n.id,{path:r.path}))}j.emit(`doc`),M.ridisegna(),F(`${t} file ricollegati${j.doc.media.some(e=>ne(e.id)?.stato!==`ok`)?`, altri ancora mancanti`:``}`,t?`ok`:`info`)}async function Ko(){let e;try{e=d?await N(`autosalvataggio_leggi`):await po(`kv`,`get`,`autosalvataggio`)}catch{e=void 0}if(!e)return!1;let t=null;try{t=Fo(JSON.parse(e))}catch{t=null}if(!t||!t.clips.length&&!t.media.length)return!1;j.load(t),j.dirty=!1;let n=await Wo(!1);return n?(F(`Montaggio ripreso. ${n} file da ricollegare: File → Ricollega media`,`info`,6e3),document.dispatchEvent(new CustomEvent(`dpv:mancano`,{detail:n}))):F(`Montaggio ripreso da dove eri rimasto`,`ok`,2500),!0}async function qo(e){let t=j.doc.clips.filter(t=>t.media===e).length;(!t||await yt(`Togli dal contenitore`,`Il file è usato da ${t} clip nella timeline. Togliere anche quelle?`,`Togli tutto`,`Annulla`))&&(j.edit(`Togli media`,t=>{t.media=t.media.filter(t=>t.id!==e),t.clips=t.clips.filter(t=>t.media!==e)}),M.playerMedia===e&&M.caricaPlayer(null))}function Jo(e,t){let n=be({titolo:e,categoria:`file`,alAnnulla:t,annullabile:!!t});return{testo:(e,t)=>{let r=/(\d{1,3})\s*%/.exec(e);n.imposta(t??(r?Number(r[1])/100:n.k),e)},chiudi:()=>{n.attivo&&n.fine()}}}var Yo=[`400 40px "Montserrat"`,`500 40px "Montserrat"`,`700 40px "Montserrat"`,`900 40px "Montserrat"`,`400 40px "Oswald"`,`500 40px "Oswald"`,`700 40px "Oswald"`,`400 40px "Archivo Black"`,`400 40px "Bebas Neue"`,`400 40px "Space Mono"`,`700 40px "Space Mono"`,`400 40px "Playfair Display"`,`700 40px "Playfair Display"`,`italic 400 40px "Playfair Display"`,`400 40px "Cormorant Garamond"`,`500 40px "Cormorant Garamond"`,`italic 500 40px "Cormorant Garamond"`,`400 40px "Great Vibes"`,`700 40px "Caveat"`,`500 40px "Rajdhani"`,`700 40px "Rajdhani"`,`700 40px "Orbitron"`],Xo=null;function Zo(){return typeof document>`u`||!document.fonts?.load?Promise.resolve():(Xo??=Promise.all(Yo.map(e=>document.fonts.load(e,`AaÈèÀà&0123`).catch(()=>[]))).then(()=>void 0),Xo)}var Qo={bassa:new dt(`low`),media:new dt(`medium`),alta:new dt(`high`),altissima:new dt(`very-high`)},$o=null;async function es(e,t,n){if(e===`wav`)return{v:null,a:`pcm-s16`};let r=e===`webm`?[`vp9`,`av1`,`vp8`]:e===`mov`?[`avc`,`hevc`]:[`avc`,`hevc`,`vp9`,`av1`],i=e===`webm`?[`opus`,`vorbis`]:[`aac`,`opus`,`mp3`],a=await ut(r,{width:t,height:n}),o=await ft(i,{numberOfChannels:2,sampleRate:48e3});if(e!==`webm`&&o!==`aac`)try{$o||=pt(()=>import(`./mediabunny-aac-encoder-hkivC0Ui.js`).then(e=>{e.registerAacEncoder()}),__vite__mapDeps([6,2,3,4]),import.meta.url),await $o,o=await ft([`aac`],{numberOfChannels:2,sampleRate:48e3})??o}catch{}return{v:a,a:o}}async function ts(e,n,r){if(d){let t=await _e(e,r,n);if(!t)return null;let i=await N(`export_apri`,{path:t}),a=new WritableStream({write:async e=>{await N(`export_scrivi`,e.data,{headers:{"x-id":String(i),"x-pos":String(e.position)}})}});return{target:new S(a,{chunked:!0,chunkSize:4194304}),chiudi:async()=>(await N(`export_chiudi`,{id:i}),c(t)),annulla:async()=>{await N(`export_chiudi`,{id:i}).catch(()=>{})}}}let i=window;if(i.showSaveFilePicker)try{let t=await i.showSaveFilePicker({suggestedName:e,types:[{description:r.toUpperCase(),accept:{[n]:[`.`+r]}}]}),a=await t.createWritable(),o=new WritableStream({write:e=>a.write({type:`write`,position:e.position,data:e.data})});return{target:new S(o,{chunked:!0,chunkSize:4194304}),chiudi:async()=>(await a.close(),t.name),annulla:async()=>{await a.abort().catch(()=>{})}}}catch(e){if(e.name===`AbortError`)return null}let a=new b;return{target:a,chiudi:async()=>(t(new Blob([a.buffer],{type:n}),e),e),annulla:async()=>{}}}var ns=class{l=new Map;sinks=new Map;async prendi(e,t,n){let r=e.media?ne(e.media):void 0;if(!r)return null;if(r.image)return r.image;if(!r.v||!r.vDecodable)return null;let i=this.l.get(e.id);if(!i||i.cur&&t<i.cur.timestamp-1e-4){i&&this.chiudi(e.id);let a=this.sinks.get(e.media);a||(a=new v(r.v),this.sinks.set(e.media,a)),i={it:a.samples(t),cur:null,next:null,fine:!1,usato:n},this.l.set(e.id,i)}for(i.usato=n;!i.fine;){if(!i.next){let e=await i.it.next();if(e.done){i.fine=!0;break}i.next=e.value}if(i.next.timestamp<=t+1e-4)i.cur?.close(),i.cur=i.next,i.next=null;else break}return i.cur??i.next}dopo(e){return this.l.get(e.id)?.next??null}pulisci(e){for(let[t,n]of this.l)e-n.usato>2&&this.chiudi(t)}chiudi(e){let t=this.l.get(e);t&&(t.cur?.close(),t.next?.close(),t.it.return(void 0).catch(()=>{}),this.l.delete(e))}tutto(){for(let e of[...this.l.keys()])this.chiudi(e)}};async function rs(e,t,n,r){let i=structuredClone(e);await Zo();let o=it(i.rate),c=t.soloInOut&&i.inF!==null?i.inF:0,l=t.soloInOut&&i.outF!==null?i.outF:He(i);if(l<=c)throw Error(`Il montaggio è vuoto`);let d=Math.round(t.w/2)*2,p=Math.round(t.h/2)*2,{v:m,a:h}=await es(t.formato,d,p);if(t.formato!==`wav`&&!m)throw Error(`Questo sistema non sa codificare video in ${t.formato.toUpperCase()}. Prova WebM o MP4.`);let g=t.formato===`webm`?`video/webm`:t.formato===`mov`?`video/quicktime`:t.formato===`wav`?`audio/wav`:`video/mp4`,_=await ts(t.nome,g,t.formato);if(!_)return null;let v=t.formato===`webm`?new s:t.formato===`mov`?new tt:t.formato===`wav`?new u:new A({fastStart:_.target instanceof b&&`in-memory`}),y=new a({format:v,target:_.target}),x=null,S=null,w=null;t.formato!==`wav`&&m&&(x=new OffscreenCanvas(d,p),S=new Pa(x,!0),w=new Ae(x,{codec:m,bitrate:Qo[t.qualita],keyFrameInterval:2,latencyMode:`quality`}),y.addVideoTrack(w,{frameRate:o}));let T=null;h&&(T=new C({codec:h,bitrate:t.formato===`wav`?void 0:Qo[t.qualita]}),y.addAudioTrack(T)),y.setMetadataTags({title:i.name,comment:`Montato con DaProd Video`});let E=new ns,D=performance.now();try{await y.start();let e=ge(c,i.rate),t=ge(l,i.rate),a=T?f(i,e,t):null,s=e,u=async()=>{if(!a||!T)return!1;let e=await a.next();return e.done?(s=1/0,!1):(await T.add(e.value),s+=e.value.duration,!0)},d=l-c;if(S&&w){let e={...i,w:i.w,h:i.h};for(let t=c;t<l;t++){if(r())throw Error(`annullato`);let l=ge(t,i.rate);for(;a&&s<l+2&&s!==1/0;)await u();let f=Fe(e,t),p=new Map;for(let e of f)for(let n of[e.b,e.a])n&&n.clip.kind===`media`&&p.set(n,await E.prendi(n.clip,n.t,t));S.render(e,f,!1,t,e=>p.get(e)??null,e=>E.dopo(e.clip)),await w.add((t-c)/o,1/o),E.pulisci(t),(t-c)%5==0&&n({fatti:t-c,totale:d,fase:`video`,fpsResa:(t-c)/((performance.now()-D)/1e3)})}}for(;a&&await u();){if(r())throw Error(`annullato`);n({fatti:Math.min(d,(s-e)*o),totale:d,fase:`audio`,fpsResa:0})}return n({fatti:d,totale:d,fase:`chiusura`,fpsResa:0}),await y.finalize(),E.tutto(),S?.distruggi(),await _.chiudi()}catch(e){if(E.tutto(),S?.distruggi(),await y.cancel().catch(()=>{}),await _.annulla(),e.message===`annullato`)return null;throw e}}var is=null;async function as(e,t){if(is?.comp.perso&&(is=null),!is){let t=new OffscreenCanvas(e.w,e.h);is={canvas:t,comp:new Pa(t,!0)}}let{canvas:n,comp:r}=is;(n.width!==e.w||n.height!==e.h)&&(n.width=e.w,n.height=e.h);let i=new ns;try{let a=Fe(e,t),o=new Map;for(let e of a)for(let t of[e.b,e.a])t&&t.clip.kind===`media`&&o.set(t,await i.prendi(t.clip,t.t,0));return r.render(e,a,!1,t,e=>o.get(e)??null,e=>i.dopo(e.clip)),await n.convertToBlob({type:`image/png`})}finally{i.tutto()}}export{Yn as $,ja as A,It as At,ar as B,P as Bt,Ka as C,Zt as Ct,Aa as D,Gt as Dt,ka as E,Jt as Et,Sr as F,Et as Ft,mr as G,gr as H,wt as Ht,kr as I,yt as It,fr as J,vr as K,Rr as L,Tt as Lt,Ca as M,F as Mt,Er as N,bt as Nt,Ea as O,Wt as Ot,Tr as P,Ct as Pt,er as Q,cr as R,vt as Rt,qo as S,tn as St,Pa as T,Lt as Tt,ur as U,lr as V,gt as Vt,pr as W,ir as X,_r as Y,br as Z,wo as _,vn as _t,Zo as a,jn as at,Mo as b,nn as bt,Ao as c,Nn as ct,Eo as d,Sn as dt,Pn as et,So as f,mn as ft,co as g,an as gt,Vo as h,gn as ht,es as i,wn as it,ya as j,Ft as jt,Ma as k,Nt as kt,Po as l,B as lt,_o as m,hn as mt,rs as n,bn as nt,Io as o,Cn as ot,xo as p,on as pt,xr as q,as as r,zn as rt,Lo as s,Un as st,ns as t,xn as tt,Jo as u,Bn as ut,Go as v,yn as vt,Fa as w,$t as wt,zo as x,rn as xt,Ko as y,en as yt,or as z,Dt as zt};