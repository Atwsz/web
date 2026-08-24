const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const logoutBtn = document.getElementById("logoutBtn");
let allCategories = []; // รายชื่อแนวทั้งหมดในระบบ

// ================= MANGA PICKER =================

let pickerData = []; // [{id, title, cover, category}]

function openPicker(pickerId){
    const picker = document.getElementById(pickerId);
    const menu = document.getElementById(pickerId + "Menu");
    const isOpen = !menu.classList.contains("hidden");

    closeAllPickers();
    if(isOpen) return;

    picker.classList.add("open");
    menu.classList.remove("hidden");
    renderPickerMenu(pickerId);
}

function closeAllPickers(){
    document.querySelectorAll(".manga-picker").forEach(p=> p.classList.remove("open"));
    document.querySelectorAll(".picker-dropdown").forEach(m=> m.classList.add("hidden"));
}

document.addEventListener("click", e=>{
    if(!e.target.closest(".manga-picker")) closeAllPickers();
});

function renderPickerMenu(pickerId){
    const menu = document.getElementById(pickerId + "Menu");
    const select = pickerId === "chapterPicker"
        ? document.getElementById("mangaSelect")
        : document.getElementById("manageMangaSelect");
    const current = select.value;

    menu.innerHTML = "";

    if(!pickerData.length){
        menu.innerHTML = `<div class="picker-empty">ยังไม่มีมังงะในระบบ</div>`;
        return;
    }

    pickerData.forEach(m=>{
        const item = document.createElement("div");
        item.className = "picker-item" + (m.id === current ? " selected" : "");
        item.innerHTML = `
            <img src="${m.cover || 'https://via.placeholder.com/80x108'}" alt="">
            <div style="min-width:0;">
                <div class="pi-title">${m.title}</div>
                <div class="pi-sub">🏷️ ${m.category || "ไม่ระบุแนว"}</div>
            </div>
        `;
        item.onclick = (e)=>{
            e.stopPropagation();
            select.value = m.id;
            updatePickerLabel(pickerId);
            closeAllPickers();
            if(pickerId === "managePicker") loadChaptersManage();
        };
        menu.appendChild(item);
    });
}

function updatePickerLabel(pickerId){
    const select = pickerId === "chapterPicker"
        ? document.getElementById("mangaSelect")
        : document.getElementById("manageMangaSelect");
    const label = document.getElementById(pickerId + "Label");
    const found = pickerData.find(m=> m.id === select.value);

    label.innerHTML = found
        ? `<img src="${found.cover || 'https://via.placeholder.com/80x108'}" style="width:28px;height:38px;object-fit:cover;border-radius:5px;" alt=""> <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${found.title}</span>`
        : "— เลือกเรื่อง —";
}

// ================= TABS & HELPERS =================

function switchTab(tabId, btn){
    document.querySelectorAll(".tab-panel").forEach(p=> p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b=> b.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");
}

function previewCoverUpdate(){
    const img = document.getElementById("previewCover");
    const url = coverUrl.value.trim();
    if(url && /^https?:\/\//i.test(url)){
        img.src = url;
        img.style.display = "block";
        img.onerror = ()=> img.style.display = "none";
    } else {
        img.style.display = "none";
    }
}

function updateImgCount(){
    const n = parseImageLinks(chapterImages.value).length;
    document.getElementById("imgCount").textContent = n ? `(${n} รูป)` : "";
}

function clearChapterForm(){
    chapterNumber.value = "";
    chapterImages.value = "";
    updateImgCount();
}

// ================= LOGIN =================

async function login(){
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if(!username || !password){
        alert("กรอกข้อมูลให้ครบ");
        return;
    }

    let email = username + "@manga.com";

    try {
        let userCredential = await auth.signInWithEmailAndPassword(email, password);
        let user = userCredential.user;

        if(user){
            localStorage.setItem("admin", user.email);
            showAdmin();
        }

    } catch(e) {
        console.error("Login failed", e);

        const msg = {
            "auth/invalid-login-credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
            "auth/user-not-found": "ไม่พบบัญชีผู้ใช้นี้",
            "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
            "auth/too-many-requests": "พยายามหลายครั้งเกินไป ลองอีกครั้งภายหลัง",
            "auth/network-request-failed": "เชื่อมต่ออินเทอร์เน็ตไม่ได้",
            "auth/operation-not-allowed": "ยังไม่ได้เปิดใช้ Email/Password ใน Firebase Console",
            "auth/configuration-not-found": "ยังไม่ได้เปิดใช้ Email/Password ใน Firebase Console"
        };

        alert(msg[e?.code] || `เข้าสู่ระบบไม่สำเร็จ (${e?.code || "unknown"})`);
    }
}

// กด Enter เพื่อล็อกอิน
window.addEventListener("DOMContentLoaded", ()=>{
    const pw = document.getElementById("password");
    const un = document.getElementById("username");
    if(pw) pw.addEventListener("keydown", e=>{ if(e.key==="Enter") login(); });
    if(un) un.addEventListener("keydown", e=>{ if(e.key==="Enter") document.getElementById("password").focus(); });
});

function checkLogin(){
    if(auth.currentUser || localStorage.getItem("admin")){
        showAdmin();
    }
}

function showAdmin(){
    loginBox.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");

    loadCategory();
    loadMangas();
}

async function logout(){
    try {
        await auth.signOut();
    } catch(e) {
        console.error("Logout failed", e);
    }

    localStorage.removeItem("admin");
    location.reload();
}

// ================= CATEGORY =================

let selectedCategories = []; // แนวที่เลือกในฟอร์ม (รองรับหลายแนว)

async function saveCategory(){
    let name = categoryName.value.trim();

    if(!name) return;

    await db.collection("categories").add({
        name: name
    });

    categoryName.value = "";
    loadCategory();
}

// ---------- ชิปเลือกหลายแนวในฟอร์มมังงะ ----------

function renderCategoryChips(){
    const box = document.getElementById("categoryChips");
    box.innerHTML = "";

    if(!allCategories.length){
        box.innerHTML = `<span style="color:#9ca3b8; font-size:13px;">ยังไม่มีแนว — เพิ่มแนวในแท็บ 🏷️ แนวมังงะ</span>`;
        return;
    }

    allCategories.forEach(name=>{
        const chip = document.createElement("button");
        const on = selectedCategories.includes(name);
        chip.type = "button";
        chip.className = "cat-chip" + (on ? " on" : "");
        chip.textContent = name;
        chip.onclick = ()=>{
            if(on) selectedCategories = selectedCategories.filter(c=> c!==name);
            else selectedCategories.push(name);
            renderCategoryChips();
        };
        box.appendChild(chip);
    });
}

async function loadCategory(){
    let select = document.getElementById("mangaCategory");
    let list = document.getElementById("categoryList");

    allCategories = [];

    let snap = await db.collection("categories").get();

    snap.forEach(doc=>{
        let data = doc.data();
        if(data.name) allCategories.push(data.name);

        list.innerHTML += `
        <span class="category-chip">
        ${data.name}
        <button onclick="deleteCategory('${doc.id}')" title="ลบ">✕</button>
        </span>
        `;
    });

    renderCategoryChips();
}

async function deleteCategory(id){
    await db.collection("categories").doc(id).delete();
    loadCategory();
}

// ================= MANGA =================

async function saveManga(){
    let title = mangaTitle.value.trim();
    let cover = coverUrl.value.trim();
    let category = selectedCategories; // array หลายแนว
    let id = mangaId.value.trim();

    if(!title || !cover || !category.length){
        alert("กรอกข้อมูลให้ครบ (เลือกแนวอย่างน้อย 1 แนว)");
        return;
    }

    try {
        if(id){
            await db.collection("mangas").doc(id).update({
                title: title,
                coverUrl: cover,
                category: category[0],      // แนวหลัก (ใช้กรองเดิม)
                categories: category        // ทุกแนว
            });
            alert("แก้ไขมังงะแล้ว");
        } else {
            await db.collection("mangas").add({
                title: title,
                coverUrl: cover,
                category: category[0],
                categories: category,
                viewCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("เพิ่มมังงะแล้ว");
        }

        clearForm();
        loadMangas();
    } catch(e) {
        console.error("Save manga failed", e);
        alert("บันทึกไม่สำเร็จ");
    }
}

async function loadMangas(){
    let list = document.getElementById("adminList");
    let select = document.getElementById("mangaSelect");
    let manageSelect = document.getElementById("manageMangaSelect");

    list.innerHTML = "";
    select.innerHTML = `
    <option>
    เลือกเรื่อง
    </option>
    `;
    manageSelect.innerHTML = `
    <option value="">
    เลือกเรื่อง
    </option>
    `;

    let snap = await db.collection("mangas").get();
    mangaCount.innerHTML = snap.size;

    pickerData = [];

    let chapters = 0;

    for(let doc of snap.docs){
        let data = doc.data();

        pickerData.push({
            id: doc.id,
            title: data.title,
            cover: data.coverUrl,
            category: data.category
        });

        select.innerHTML += `
        <option value="${doc.id}">
        ${data.title}
        </option>
        `;

        manageSelect.innerHTML += `
        <option value="${doc.id}">
        ${data.title}
        </option>
        `;

        let ch = await db.collection("mangas")
            .doc(doc.id)
            .collection("chapters")
            .get();

        chapters += ch.size;

        list.innerHTML += `
        <div class="admin-item">
            <img src="${data.coverUrl}" alt="">
            <div style="flex:1; min-width:0;">
                <h4>${data.title}</h4>
                <p>🏷️ ${(data.categories || [data.category]).filter(Boolean).join(", ")} · 👁️ ${Number(data.viewCount || data.views || 0).toLocaleString("th-TH")} ยอดอ่าน · 📖 ${ch.size} ตอน</p>
            </div>
            <button onclick="editManga('${doc.id}')">✏️ แก้ไข</button>
            <button onclick="quickAddChapter('${doc.id}')">➕ ตอน</button>
            <button class="danger" onclick="deleteManga('${doc.id}')">🗑️ ลบ</button>
        </div>
        `;
    }

    chapterCount.innerHTML = chapters;

    updatePickerLabel("chapterPicker");
    updatePickerLabel("managePicker");
}

async function editManga(id){
    try {
        let doc = await db.collection("mangas").doc(id).get();

        if(!doc.exists){
            alert("ไม่พบมังงะนี้");
            return;
        }

        let data = doc.data();

        mangaId.value = doc.id;
        mangaTitle.value = data.title || "";
        coverUrl.value = data.coverUrl || "";
        selectedCategories = data.categories || (data.category ? [data.category] : []);
        renderCategoryChips();
        document.getElementById("saveMangaBtn").textContent = "✏️ บันทึกการแก้ไข";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch(e) {
        console.error("Edit manga failed", e);
        alert("เปิดข้อมูลเพื่อแก้ไขไม่สำเร็จ");
    }
}

async function deleteManga(id){
    if(!confirm("ลบเรื่องนี้?")) return;

    await db.collection("mangas").doc(id).delete();
    loadMangas();
}

// ================= CHAPTER =================

function parseImageLinks(input){
    return input
        .split(/\r?\n|,/)
        .map(x => x.trim().replace(/^["']|["']$/g, ''))
        .filter(x => x && /^https?:\/\//i.test(x));
}

async function saveChapter(){
    let manga = mangaSelect.value;
    let chapterNum = parseFloat(chapterNumber.value);
    let images = parseImageLinks(chapterImages.value);

    if(!manga || isNaN(chapterNum) || !images.length){
        alert("กรอกข้อมูลให้ครบ");
        return;
    }

    // Firestore doc id ห้ามมีจุด — เปลี่ยน 1.1 -> ch_1_1
    const chapterId = "ch_" + String(chapterNum).replace(".", "_");

    await db.collection("mangas")
        .doc(manga)
        .collection("chapters")
        .doc(chapterId)
        .set({
            chapter: chapterNum,
            images: images
        });

    alert(`เพิ่มตอนที่ ${chapterNum} แล้ว`);
    clearChapterForm();
}

// ================= BULK ADD CHAPTERS (JSON) =================

function parseBulkJson(input){
    // ตัด trailing comma ที่ JS object ชอบมี แล้วแปลงเป็น JSON จริง
    let text = input.trim();

    // ลบ [ หรือ { นำหน้าที่เกินมา (กรณีลากมาจากกลางไฟล์)
    // รองรับทั้ง JSON จริงและ JS object (key ไม่มี quote, trailing comma)
    try {
        return JSON.parse(text);
    } catch(e){
        // แปลง JS object -> JSON: ครอบ key ด้วย quote + ลบ trailing comma
        const fixed = text
            .replace(/([{,]\s*)([A-Za-z0-9_.\-]+)\s*:/g, '$1"$2":')
            .replace(/,(\s*[}\]])/g, '$1');
        return JSON.parse(fixed);
    }
}

async function saveBulkChapters(){
    const manga = mangaSelect.value;
    const raw = document.getElementById("bulkJson").value;

    if(!manga){
        alert("เลือกมังงะก่อน");
        return;
    }
    if(!raw.trim()){
        alert("วาง JSON ก่อน");
        return;
    }

    let data;
    try {
        data = parseBulkJson(raw);
    } catch(e){
        alert("JSON ไม่ถูกต้อง ลองตรวจสอบอีกครั้ง");
        console.error(e);
        return;
    }

    // แปลงเป็นรายการ {chapter, images}
    const entries = Object.entries(data)
        .map(([ch, imgs])=>({
            chapter: parseFloat(ch),
            images: (Array.isArray(imgs) ? imgs : String(imgs).split(/[\n,]/))
                .map(x=> x.trim().replace(/^["']|["']$/g, ''))
                .filter(x=> x && /^https?:\/\//i.test(x))
        }))
        .filter(e=> !isNaN(e.chapter) && e.images.length);

    if(!entries.length){
        alert("ไม่พบตอนที่มีรูปถูกต้องใน JSON");
        return;
    }

    if(!confirm(`พบ ${entries.length} ตอน — เพิ่มทั้งหมดเลย?`)) return;

    let done = 0, failed = 0;

    for(const entry of entries){
        try {
            const chapterId = "ch_" + String(entry.chapter).replace(".", "_");
            await db.collection("mangas")
                .doc(manga)
                .collection("chapters")
                .doc(chapterId)
                .set({
                    chapter: entry.chapter,
                    images: entry.images
                });
            done++;
        } catch(e){
            console.error("Bulk chapter failed", entry.chapter, e);
            failed++;
        }
    }

    alert(`เสร็จ! เพิ่มสำเร็จ ${done} ตอน` + (failed ? ` (ล้มเหลว ${failed} ตอน)` : ""));
    document.getElementById("bulkJson").value = "";
    loadMangas();
}

// ================= CLEAR VOTES (ADMIN) =================

async function adminClearVotes(){
    const mangaId = document.getElementById("manageMangaSelect").value;

    if(!mangaId){
        alert("เลือกเรื่องก่อน");
        return;
    }

    if(!confirm("เคลียร์โหวตทั้งหมดของเรื่องนี้? (ลบแล้วกลับไม่ได้)")) return;

    try {
        const snap = await db.collection("mangas").doc(mangaId)
            .collection("votes").get();

        const batch = db.batch();
        snap.forEach(doc=> batch.delete(doc.ref));
        batch.set(db.collection("mangas").doc(mangaId), {
            ratingTotal: 0,
            ratingCount: 0
        }, { merge: true });
        await batch.commit();

        alert(`เคลียร์โหวตทั้งหมดแล้ว (${snap.size} โหวต)`);
    } catch(e){
        console.error("Clear votes failed", e);
        alert("เคลียร์ไม่สำเร็จ");
    }
}

// ================= CHAPTER MANAGE =================

function quickAddChapter(mangaId){
    mangaSelect.value = mangaId;
    updatePickerLabel("chapterPicker");
    switchTab("tab-chapter", document.querySelectorAll(".tab-btn")[1]);
    chapterNumber.focus();
    chapterNumber.scrollIntoView({behavior:"smooth", block:"center"});
}

async function loadChaptersManage(){
    const mangaId = document.getElementById("manageMangaSelect").value;
    const box = document.getElementById("chapterManageList");

    if(!mangaId){
        box.innerHTML = `<p style="color:#9ca3b8;">เลือกเรื่องก่อนเพื่อดูรายการตอน</p>`;
        return;
    }

    box.innerHTML = `<p style="color:#9ca3b8;">กำลังโหลด...</p>`;

    const snap = await db.collection("mangas")
        .doc(mangaId)
        .collection("chapters")
        .orderBy("chapter","asc")
        .get();

    if(snap.empty){
        box.innerHTML = `<p style="color:#9ca3b8;">ยังไม่มีตอนในเรื่องนี้</p>`;
        return;
    }

    box.innerHTML = "";

    snap.forEach(doc=>{
        const data = doc.data();
        const item = document.createElement("div");
        item.className = "admin-item";

        item.innerHTML = `
            <div style="flex:1;">
                <h4>ตอนที่ ${data.chapter}</h4>
                <p>${(data.images || []).length} หน้า</p>
            </div>
            <button class="danger" onclick="deleteChapter('${mangaId}', '${doc.id}')">🗑️ ลบตอน</button>
        `;
        box.appendChild(item);
    });
}

async function deleteChapter(mangaId, chapterId){
    if(!confirm(`ลบตอนที่ ${chapterId}?`)) return;

    try {
        await db.collection("mangas")
            .doc(mangaId)
            .collection("chapters")
            .doc(chapterId)
            .delete();

        alert("ลบตอนแล้ว");
        loadChaptersManage();
        loadMangas();
    } catch(e) {
        console.error("Delete chapter failed", e);
        alert("ลบตอนไม่สำเร็จ");
    }
}

function clearForm(){
    mangaId.value = "";
    mangaTitle.value = "";
    coverUrl.value = "";
    selectedCategories = [];
    renderCategoryChips();
    document.getElementById("saveMangaBtn").textContent = "💾 บันทึกมังงะ";
}

window.onload = () => {
    checkLogin();
};