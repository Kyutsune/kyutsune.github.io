let bouton_recup_mot = document.querySelector("#applique_fct_recup_mot");
let affichage_un_mot=document.querySelector("#affichage__un_mot");
let input_joueur = document.querySelector("#input_joueur");
let champ_reponse_joueur = document.querySelector("#reponse_joueur");
let champ_score = document.querySelector("#Score");
let champ_temps_moyen=document.querySelector("#temps_moyen_ecriture");


let bouton_test_var_globale=document.querySelector("#var_globale");
let champ_variable_globale=document.querySelector("#affichage_variable_globale");

let mot_actuel;
let compteur=0;
// Déclaration des variables pour compter le temps écoulé
let tempsDebut = Date.now(); 
let intervalle;
let Temps_ecoule=0; 
let temps_pour_une_frappe=[];
let nombre_de_mot_frappé=0;
let nombre_de_mot_eronnes=0;


let bouton_stop=document.querySelector("#stop_jeu");
let champ_reponse_ms= document.querySelector("#calcul_ms");
let jeu_relance=false;



let jeu_en_cours=false;

let Token_github='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';
function enlever_un_mot()
{
    affichage_un_mot.textContent=""
 
}


function fun_affichage_un_mot(data)
{
    let crea_div = document.createElement("div");
    crea_div.classList.add("a_la_ligne"); 
    crea_div.textContent=data;
    affichage_un_mot.append(crea_div);
}



async function fct_recup_un_mot() {
    enlever_un_mot();
    Clear_champs_ms();
    if(jeu_relance===true)
    {
       temps_pour_une_frappe=[];
       nombre_de_mot_eronnes=0;
       jeu_relance=false; 
    }
    try{
        const reponse = await fetch("https://random-word-api.herokuapp.com/word?lang=fr");
        const data = await reponse.json();
        mot_actuel=data[0];
        fun_affichage_un_mot(data);
    } 
    catch(err){
        console.log("fetch failed: ", err);
    }
    demarrerCompteur()
    jeu_en_cours===false?jeu_en_cours=true:null;
    input_joueur.focus();
}

bouton_recup_mot.addEventListener("click", fct_recup_un_mot);


/*
Même fonction qu'au dessus mais version réecrite en utilisant les promesses et la syntaxe .then
Aucun intéret suppplémentaire,juste pour voir comment le faire.

function fct_recup_un_mot() {
    fetch("https://random-word-api.herokuapp.com/word?lang=fr")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const mot_actuel = data[0];
        console.log(mot_actuel);
    })
    .catch(error => {
        console.log('fetch failed:', error);
    });
}
fct_recup_un_mot();
*/


function function_verify_mot()
{   
    mot_actuel===undefined?function_mot_juste_ou_faux("mot_pas_def"):
    input_joueur.value===mot_actuel?function_mot_juste_ou_faux("juste"):function_mot_juste_ou_faux("faux");
}

function function_mot_juste_ou_faux(reponse)
{
    let crea_reponse=document.createElement("div");
    if(reponse==="mot_pas_def")
        crea_reponse.textContent="Tu vas trop vite en besogne,ne nous chie pas dans la colle et tire un mot avant";
    
    else
        crea_reponse.textContent=reponse+" le mot était: "+mot_actuel+" et tu as taper "+input_joueur.value;
    champ_reponse_joueur.append(crea_reponse);

    if(reponse==="juste")
        compteur++;
    else
        compteur--
}

function clear_champ_reponse_mot()
{
    champ_reponse_joueur.textContent="";
}


// Fonction pour mettre à jour le temps écoulé
function mettreAJourTempsEcoule() {
    // Calcul du temps écoulé depuis le début
    var tempsActuel = Date.now();
    Temps_ecoule = tempsActuel - tempsDebut;

    // Conversion en secondes
    // Temps_ecoule = Math.floor(tempsEcoule / 1000);

}

// Démarrer le compteur
function demarrerCompteur() {
    mettreAJourTempsEcoule(); 
    intervalle = setInterval(mettreAJourTempsEcoule, 1); 
}


//On rajoute le paramètre car si on arrete le jeu avec le bouton stop on ne veutr pas enregistrer le dernier temps de frappe
function arreterCompteur(bouton_stop=false) {
    clearInterval(intervalle); 
    bouton_stop===false?enregistre_temps_frappe():null;
    clear_temps_ecoule();
}

function afficher_temps_ecoule()
{
    console.log("Temps écoulé : " + Temps_ecoule + " ms");
}

function clear_temps_ecoule()
{
    Temps_ecoule=0;
    tempsDebut=Date.now();
}

function enregistre_temps_frappe()
{
    temps_pour_une_frappe.push(Temps_ecoule)
    nombre_de_mot_frappé++;
    console.log(temps_pour_une_frappe)
    
    if(input_joueur.value!==mot_actuel)
        nombre_de_mot_eronnes++;
}



document.addEventListener('keydown', function(event) {
    const key = event.key;
    const code = event.code;
    // console.log("key=",key," code=",code)
    if(key==="Enter"&& code==="Enter")
    {
        champ_reponse_joueur.textContent="" 
        function_verify_mot();
        champ_score.textContent="Score:"+compteur        
        arreterCompteur();
        fct_recup_un_mot();
        input_joueur.value=""

    }
    if(key==="s" && code==="KeyS" && jeu_en_cours===false)
    {
        fct_recup_un_mot();
    }
});





function fonction_calcul_moyenne_temps()
{
    clear_temps_ecoule(true)
    enlever_un_mot()
    clear_champ_reponse_mot()
    jeu_relance=true;jeu_en_cours=false;
    const temps_total_ms=calcul_total_ms();
    let temps_moyen_frappe=(temps_total_ms/nombre_de_mot_frappé).toFixed(2);
    Creation_champs_ms(temps_moyen_frappe);

}


function calcul_total_ms()
{
    let total_retour=0;
    for(item of temps_pour_une_frappe)
    {
        total_retour+=item;
    }
    return total_retour;
}

function Creation_champs_ms(temps_moyen_frappe)
{
    if(temps_pour_une_frappe.length!==0)
        champ_reponse_ms.innerHTML = "Ton temps moyen pour taper un mot est de : " + temps_moyen_frappe + " ms <br> Ton nombre de mot éronnés est de " + nombre_de_mot_eronnes;
    else
        champ_reponse_ms.textContent="Tu n'as pas encore taper de mot,le calcul est impossible"
}

function Clear_champs_ms()
{
    champ_reponse_ms.textContent=""
}





bouton_stop.addEventListener("click",fonction_calcul_moyenne_temps)


document.addEventListener('DOMContentLoaded', fonction_increment_var_test);

async function fonction_increment_var_test() {
    fetch('https://api.github.com/repos/kyutsune/kyutsune.github.io/contents/database/test_database.json', {
        method: 'GET',
        headers: {
            'Authorization': `token ${Token_github}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du contenu du fichier');
        }
        return response.json();
    })
    .then(data => {
        // Le contenu du fichier sera encodé en base64, vous devez le décoder
        let content = atob(data.content);
        console.log(content);
    })
    .catch(error => {
        console.error('Erreur:', error);
    });
}
