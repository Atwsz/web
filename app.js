// ================= FIREBASE =================

const firebaseConfig = {
    apiKey: "AIzaSyDKODSRBydM2-0vdmcnoK5qYeW5oAiMRq4",
  authDomain: "manga-sasemi.firebaseapp.com",
  projectId: "manga-sasemi",
  storageBucket: "manga-sasemi.firebasestorage.app",
  messagingSenderId: "779216977959",
  appId: "1:779216977959:web:51622864b05a780e6f4e02",
  measurementId: "G-7D213KEZYN"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// ================= ELEMENT =================

const mangaList =
document.getElementById("manga-list");


const loading =
document.getElementById("loading");


// ================= DATA =================

let allMangas=[];



// ================= LOADING =================


function loadingShow(status){

    if(!loading) return;

    if(status){

        loading.classList.remove("hidden");

    }else{

        loading.classList.add("hidden");

    }

}



// ================= LOAD MANGA =================


function loadMangaList(){


loadingShow(true);



db.collection("mangas")
.orderBy("createdAt","desc")
.onSnapshot(snapshot=>{


allMangas=[];


snapshot.forEach(doc=>{


allMangas.push({

id:doc.id,

...doc.data()

});


});



renderMangas(allMangas);



loadingShow(false);



},error=>{


console.error(error);


loadingShow(false);


});



}



// ================= SEARCH =================


function searchManga(){


let text =
document.getElementById("searchInput")
.value
.toLowerCase();



let result =
allMangas.filter(manga=>{


return manga.title
?.toLowerCase()
.includes(text);



});



renderMangas(result);



}





// ================= CARD =================



function renderMangas(list){


if(!mangaList) return;



mangaList.innerHTML="";



if(list.length===0){


mangaList.innerHTML=

`
<div class="empty">

ไม่พบมังงะ

</div>

`;

return;


}



list.forEach(manga=>{



const card =
document.createElement("div");



card.className="manga-card";



// ⭐ จุดแก้สำคัญ
card.onclick=()=>{


window.location.href =

"read.html?id="
+
manga.id
+
"&ep=1";



};



card.innerHTML=`

<img src="${
manga.coverUrl ||
'https://via.placeholder.com/300x400'
}">


<div class="manga-info">

<h3>

${manga.title}

</h3>


</div>


`;



mangaList.appendChild(card);



});



}





// ================= START =================


loadMangaList();