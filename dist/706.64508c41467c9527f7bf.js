"use strict";(self.webpackChunkcomplex_react_app=self.webpackChunkcomplex_react_app||[]).push([[706],{6706:(e,a,t)=>{t.r(a),t.d(a,{default:()=>u});var s=t(7294),r=t(7564),c=t(3983),l=t(9711),n=t(195),m=t(3213);const u=function(){const e=(0,s.useRef)(null),a=(0,s.useRef)(null),t=(0,s.useRef)(null),u=(0,s.useContext)(r.Z),i=(0,s.useContext)(c.Z),[o,h]=(0,n.x)({fieldValue:"",chatMessages:[]});return(0,s.useEffect)((()=>{u.isChatOpen&&(a.current.focus(),i({type:"clearUnreadChatCount"}))}),[u.isChatOpen]),(0,s.useEffect)((()=>(e.current=(0,m.ZP)("http://localhost:8080"),e.current.on("chatFromServer",(e=>{h((a=>{a.chatMessages.push(e)}))})),()=>e.current.disconnect())),[]),(0,s.useEffect)((()=>{t.current.scrollTop=t.current.scrollHeight,o.chatMessages.length&&!u.isChatOpen&&i({type:"incrementUnreadChatCount"})}),[o.chatMessages]),s.createElement("div",{id:"chat-wrapper",className:"chat-wrapper shadow border-top border-left border-right "+(u.isChatOpen?"chat-wrapper--is-visible":"")},s.createElement("div",{className:"chat-title-bar bg-primary"},"Chat",s.createElement("span",{onClick:()=>i({type:"closeChat"}),className:"chat-title-bar-close"},s.createElement("i",{className:"fas fa-times-circle"}))),s.createElement("div",{id:"chat",className:"chat-log",ref:t},o.chatMessages.map(((e,a)=>e.username==u.user.username?s.createElement("div",{key:a,className:"chat-self"},s.createElement("div",{className:"chat-message"},s.createElement("div",{className:"chat-message-inner"},e.message)),s.createElement("img",{className:"chat-avatar avatar-tiny",src:e.avatar})):s.createElement("div",{key:a,className:"chat-other"},s.createElement(l.rU,{to:`/profile/${e.username}`},s.createElement("img",{className:"avatar-tiny",src:e.avatar})),s.createElement("div",{className:"chat-message"},s.createElement("div",{className:"chat-message-inner"},s.createElement(l.rU,{to:`/profile/${e.username}`},s.createElement("strong",null,e.username,": ")),e.message)))))),s.createElement("form",{onSubmit:function(a){a.preventDefault(),e.current.emit("chatFromBrowser",{message:o.fieldValue,token:u.user.token}),h((e=>{e.chatMessages.push({message:e.fieldValue,username:u.user.username,avatar:u.user.avatar}),e.fieldValue=""}))},id:"chatForm",className:"chat-form border-top"},s.createElement("input",{value:o.fieldValue,ref:a,onChange:function(e){const a=e.target.value;h((e=>{e.fieldValue=a}))},type:"text",className:"chat-field",id:"chatField",placeholder:"Type a message…",autoComplete:"off"})))}}}]);