/* =====================
 Toast Notification System
 แทน alert() ของเบราว์เซอร์
===================== */

(function(){
    // สร้าง container
    const container = document.createElement("div");
    container.id = "toast-container";
    document.addEventListener("DOMContentLoaded", ()=> document.body.appendChild(container));
    if(document.body) document.body.appendChild(container);

    const style = document.createElement("style");
    style.textContent = `
    #toast-container{
        position:fixed;
        bottom:20px;
        right:20px;
        z-index:999999;
        display:flex;
        flex-direction:column-reverse;
        gap:10px;
        max-width:340px;
    }

    .toast{
        display:flex;
        align-items:flex-start;
        gap:10px;
        padding:14px 18px;
        border-radius:14px;
        background:rgba(18,18,38,.95);
        backdrop-filter:blur(15px);
        border:1px solid rgba(255,255,255,.12);
        color:#fff;
        font-family:"Segoe UI",Tahoma,sans-serif;
        font-size:14px;
        line-height:1.5;
        box-shadow:0 15px 40px rgba(0,0,0,.5);
        animation:toastIn .35s cubic-bezier(.2,.8,.3,1);
        position:relative;
        overflow:hidden;
    }

    .toast::after{
        content:"";
        position:absolute;
        bottom:0;left:0;
        height:3px;
        width:100%;
        background:currentColor;
        opacity:.6;
        transform-origin:left;
        animation:toastBar linear forwards;
        animation-duration:var(--toast-dur, 4000ms);
    }

    .toast.out{
        animation:toastOut .35s cubic-bezier(.4,0,1,1) forwards!important;
    }

    .toast .t-icon{font-size:18px;flex-shrink:0;}

    .toast.success{border-color:rgba(74,222,128,.5);}
    .toast.success .t-icon{color:#4ade80;}
    .toast.error{border-color:rgba(248,113,113,.5);}
    .toast.error .t-icon{color:#f87171;}
    .toast.info{border-color:rgba(139,92,246,.5);}
    .toast.info .t-icon{color:#c084fc;}
    .toast.warn{border-color:rgba(251,191,36,.5);}
    .toast.warn .t-icon{color:#fbbf24;}

    @keyframes toastIn{
        from{opacity:0;transform:translateX(60px);}
        to{opacity:1;transform:none;}
    }

    @keyframes toastOut{
        from{opacity:1;transform:translateX(0);}
        to{opacity:0;transform:translateX(120%);}
    }

    @keyframes toastBar{
        from{width:100%;}
        to{width:0;}
    }

    body.light-mode .toast{
        background:rgba(255,255,255,.97);
        color:#222;
        border-color:rgba(0,0,0,.1);
    }
    `;
    document.head.appendChild(style);

    // แทนที่ alert เดิม
    window.alert = function(msg){
        // จำแนกประเภทจากเนื้อหา
        let type = "info", icon = "💬";
        const m = String(msg);
        // เช็ค "ไม่" ก่อนเสมอ (เช่น "ล็อกอินไม่สำเร็จ" ต้องเป็น error)
        if(/ไม่สำเร็จ|ไม่ถูกต้อง|ไม่พบ|ไม่ได้|ผิด|ล้มเหลว|ล้มเหลว|auth\/|กรุณา|กรอก|หมดอายุ|ไม่สำเร็จ/.test(m)){ type="error"; icon="❌"; }
        else if(/สำเร็จ|แล้ว$|ขอบคุณ|เสร็จ|เคลียร์/.test(m)){ type="success"; icon="✅"; }
        else if(/ล็อกอิน|โหวต|เตือน|ยังไม่มี|ยกเลิก/.test(m)){ type="warn"; icon="⚠️"; }

        showToast(m, type, icon, 4000);
    };

    window.showToast = function(msg, type="info", icon="💬", duration=4000){
        const c = document.getElementById("toast-container");
        if(!c) return;

        const t = document.createElement("div");
        t.className = "toast " + type;
        t.style.setProperty("--toast-dur", duration + "ms");
        t.innerHTML = `<span class="t-icon">${icon}</span><span>${msg}</span>`;

        t.onclick = ()=> dismiss();
        c.appendChild(t);

        function dismiss(){
            if(t.classList.contains("out")) return;
            t.classList.add("out");
            setTimeout(()=> t.remove(), 400);
        }

        setTimeout(dismiss, duration);
    };
})();
