// ==UserScript==
// @name bumble-next
// @description The **Bumble Next** userscript automatically processes contacts and messages, providing a dynamic UI modal to show status and control on Bumble.
// @version 1.0.0
// @author 
// @match *://*/*
// ==/UserScript==

!function(){"use strict";GM_addStyle("\n        #bumbleNextModal {\n            position: fixed;\n            top: 20px;\n            left: 20px;\n            background-color: #ffcc00;\n            padding: 10px 20px; /* Updated padding for better spacing */\n            border-radius: 30px;\n            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n            z-index: 10000;\n            display: flex;\n            align-items: center;\n            font-family: Arial, sans-serif;\n            color: #444;\n            font-size: 16px;\n            font-weight: bold;\n            text-align: center;\n        }\n        #bumbleNextTitle {\n            font-size: 20px; /* Larger font size for the title */\n            font-weight: bold;\n            margin-right: 10px;\n        }\n        #bumbleNextModal button {\n            margin-left: 10px;\n            background-color: #333;\n            color: #fff;\n            border: none;\n            cursor: pointer;\n            padding: 8px 12px;\n            border-radius: 18px;\n            font-size: 14px;\n            min-width: 120px;\n        }\n        #nextConversationBtn i {\n            font-style: italic; /* Italicized 'Next' text */\n        }\n        #bumbleNextModal .stats-container {\n            padding: 8px 12px;\n            background-color: rgba(0, 0, 0, 0.2); /* Slightly darker background for contrast */\n            border-radius: 18px;\n            display: flex;\n            align-items: center;\n            margin-right: 10px;\n        }\n        #bumbleNextModal .toggle-container {\n            padding: 8px 12px;\n            display: flex;\n            align-items: center;\n        }\n        #bumbleNextModal .toggle-button {\n            background-color: #555;\n            color: #fff;\n            font-size: 14px;\n            border-radius: 12px;\n            padding: 5px 10px;\n            cursor: pointer;\n            text-align: center;\n        }\n    "),document.body.insertAdjacentHTML("beforeend",'\n        <div id="bumbleNextModal">\n            <div id="bumbleNextTitle">Bumble Next</div>\n            <div class="stats-container">\n                <span id="highPriorityCount"><span class="emoji-icon">🌟</span>High: 0</span>\n                <span id="lowPriorityCount"><span class="emoji-icon">📥</span>Low: 0</span>\n            </div>\n            <button id="nextConversationBtn"><i>Next</i> 🐝</button>\n            <div class="toggle-container">\n                <button id="enterKeyToggle" class="toggle-button">Disable Enter Key</button>\n            </div>\n        </div>\n    ');let e=[],n=0,t=!1,o=!0,i=/(\+?\d{1,3}[-.\s]?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/,r=e=>null!==e.offsetParent;function l(){console.log("Loading more messages...");var e=document.querySelector(".scroll__inner");e.scrollTop=e.scrollHeight}window.setInterval(l,5e3);let s=()=>[...document.querySelectorAll(".has-notifications"),...document.querySelectorAll(".contact__move-label")].filter(r),c=()=>[...document.querySelectorAll(".contact")].reverse().filter(r),a=()=>{let e=s(),n=c();document.getElementById("highPriorityCount").textContent="🌟 High: "+e.length,document.getElementById("lowPriorityCount").textContent="📥 Low: "+n.length},d=e=>{let n=e?.parentElement?.parentElement?.parentElement?.querySelector(".contact__message")?.textContent;return console.log({contact:e,messageElement:n}),!!n&&i.test(n)},g=e=>!(!e||"function"!=typeof e.click||(console.log("Processing item:",e,"phoneNumber",d(e)),e.click(),a(),0)),p=()=>{let o=s().filter((e=>!d(e))),i=c().filter((e=>!d(e)));if(a(),o.length>0)return t=!1,g(o[0]);if(t||(e=i,n=0,t=!0),n<e.length){const t=e[n];return n++,console.log("contact",{contact:t}),t&&d(t)?(console.log("Skipping contact with phone number:",t),p()):g(t)}return t=!1,console.log("No more items to process. Restarting the cycle."),!1},u=()=>{l(),p()||setTimeout(u,1e3)};document.getElementById("nextConversationBtn").addEventListener("click",p),document.getElementById("enterKeyToggle").addEventListener("click",(()=>{o=!o,document.getElementById("enterKeyToggle").textContent=o?"Disable Enter Key":"Enable Enter Key"})),document.addEventListener("keypress",(({key:e})=>{"Enter"===e&&o?(l(),console.log("Enter pressed - processing next item"),u()):"Escape"===e&&(console.log("Escape pressed - skipping current item"),p())})),a()}();