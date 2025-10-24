// =============================================================
// "Dice Dungeon" – Ein sehr einfacher CLI-Lernprototyp (Basics)
// Start: node dice-dungeon.cjs
// =============================================================

/* const readline =require('node:readline');//document.getElementById("readLine-id").textContent; // 
const rl =readline.createInterface({ input: process.stdin, output: process.stdout }); */

// ------------ Zustand / Daten ------------
var spielerName =
  localStorage.getItem("spielerName") == null
    ? ""
    : localStorage.getItem("spielerName");

if (localStorage.getItem("spielerName") != null) {
  loadLocalStorage();
}
var inventarItem = { apfel: 0, trank: 0, gold: 0 };
var maxLebenspunkte = 20;
var lebenspunkte = maxLebenspunkte;
var lebenspunkteGegner = maxLebenspunkte;

var inventar = ["Apfel"];
var status = { gold: 0, level: 1 };
var statusNew = { gold: 0, level: 1 };
var runden = 0;
var kampf = {
  runden: 0,
  dealt: 0,
  taken: 0,
  lebenspunkte: 20,
  lebenspunkteGegner: 20,
};

// ------------ Hilfsfunktionen ------------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getInventar() {
  var text = "";
  inventarItem.apfel = inventar.filter((l) => l === "Apfel").length;
  inventarItem.trank = inventar.filter((l) => l === "Trank").length;
  inventarItem.gold = inventar.filter((l) => l === "Gold").length;

  text = ` ${inventarItem.apfel > 0 ? "🍎 " + inventarItem.apfel : ""}  ${
    inventarItem.trank > 0 ? "🧪 " + inventarItem.trank : ""
  }  ${inventarItem.gold > 0 ? "🪙 " + inventarItem.gold : ""}`;
  return text;
}

function nimm(item) {
  inventar.push(item);
  return inventar.length;
}

function erzeugeGegner(name, min, max) {
  return { name: name, min: min, max: max };
}

function gegnerSchaden(gegner) {
  var staerke = 1;
  var wurf = randInt(gegner.min, gegner.max);
  var base = wurf + staerke;
  return base;
}

function heldAngriff() {
  var staerke = 1;
  var wurf = randInt(1, 8);
  var base = wurf + staerke;
  return base;
}

// ------------ Kampf  ------------
function kampfHtml(gegner) {
  if (lebenspunkte > 0) {
    runden = runden + 1;
    var dealt = heldAngriff(); //Attach Held
    var taken = gegnerSchaden(gegner); //Attach gegner
    if (dealt > taken) {
      status.gold = status.gold + 1; // Mini-Belohnung
    }
    lebenspunkte = lebenspunkte - taken;
    lebenspunkteGegner = lebenspunkteGegner - dealt;

    if (lebenspunkte < 0) lebenspunkte = 0;
    if (lebenspunkteGegner < 0) lebenspunkteGegner = 0;

    kampf = {
      runden: 0,
      dealt: 0,
      taken: 0,
      lebenspunkte: 0,
      lebenspunkteGegner: 0,
    };
    kampf.runden = runden;
    kampf.dealt = dealt;
    kampf.taken = taken;
    kampf.lebenspunkte = lebenspunkte;
    kampf.lebenspunkteGegner = lebenspunkteGegner;
  }

  return kampf;
}

// ------------ Loot  ------------
function lootAktionHtml() {
  var fund = ["Gold", "Trank"];
  if (Math.random() > 0.5) {
    fund.push("Gold");
  } else {
    fund.push("Apfel");
  }

  // Behalten: alles außer "Apfel"
  var behalten = [];
  var i;
  for (i = 0; i < fund.length; i++) {
    if (fund[i] !== "Apfel") {
      behalten.push(fund[i]);
    }
  }

  // Zum Inventar hinzufügen
  for (i = 0; i < behalten.length; i++) {
    nimm(behalten[i]);
  }

  // Gold zählen
  var addGold = 0;
  for (i = 0; i < behalten.length; i++) {
    if (behalten[i] === "Gold") {
      addGold = addGold + 1;
    }
  }
  status.gold = status.gold + addGold;

  // Ausgabe
  var ftxt = "Gefunden: ";
  for (i = 0; i < fund.length; i++) {
    ftxt += (i > 0 ? ", " : "") + fund[i];
  }
  var btxt = "Behalten: ";
  for (i = 0; i < behalten.length; i++) {
    btxt += (i > 0 ? ", " : "") + behalten[i];
  }

  return { fund, behalten };
}
// ------------Heilen---------------
function heilen(punkte) {
  if (typeof punkte !== "number") {
    punkte = 5;
  }
  lebenspunkte = lebenspunkte + punkte;
  if (lebenspunkte > maxLebenspunkte) lebenspunkte = maxLebenspunkte;
  return lebenspunkte;
}
function heilenHtml() {
  var idx = -1;
  var i;
  let point = 0;
  for (i = 0; i < inventar.length; i++) {
    if (inventar[i] === "Trank" && idx === -1) {
      idx = i;
    }
  }
  if (idx >= 0) {
    point = heilen(randInt(4, 8));
    kampf.lebenspunkte = point;
    // Trank entfernen
    inventar.splice(idx, 1);
  } else {
    console.log("Kein Trank im Inventar.");
  }
  return point;
}

// ------------ Start ------------
document
  .getElementById("name-input")
  .addEventListener("keydown", function (event) {
    console.log("sdf");
    if (event.key === "Enter") {
      login();
    }
  });

function login() {
  name = document.getElementById("name-input").value;
  if (name && name.trim() !== "") {
    spielerName = name.trim();
  } else {
    spielerName = "Unbekannt";
  }

  loadLocalStorage();
}

function loadLocalStorage() {
  const div = document.getElementById("div-name");
  div.classList.add("hidden");

  const divNameHeld = document.getElementById("div-name-held");
  divNameHeld.classList.remove("hidden");

  const divNav = document.getElementById("nav-id");
  divNav.classList.remove("hidden");

  const divNameLabel = document.getElementById("name-label");

  divNameLabel.innerText = `Held: ${spielerName}`;

  localStorage.setItem("spielerName", spielerName); //spreichert die Daten
  localStorage.getItem("spielerName"); //bekomen die gespeichert Daten
}
function clickStatus() {
  const box = document.getElementById("box");
  const boxStatus = document.getElementById("box-status");
  box.classList.remove("hidden");
  boxStatus.classList.remove("hidden");

  const boxFight = document.getElementById("box-fight");
  const divKampf = document.getElementById("box-loot");
  divKampf.classList.add("hidden");
  boxFight.classList.add("hidden");

  const hpInfo = document.getElementById("hp-info");
  hpInfo.innerText = lebenspunkte + "/" + maxLebenspunkte;

  const lvlInfo = document.getElementById("lvl-info");
  lvlInfo.innerText = statusNew.level;

  const goldInfo = document.getElementById("gold-info");
  goldInfo.innerText = statusNew.gold;

  const invetarInfo = document.getElementById("inventar-info");
  invetarInfo.innerText = getInventar();
}
function clickFight() {
  hidden();
  let divKampf = document.getElementById("box-fight");
  divKampf.classList.remove("hidden");
  divKampf.innerHTML = htmlKampf(kampf);
}
function hidden() {
  const box = document.getElementById("box");
  const divLoot = document.getElementById("box-loot");
  const divStatus = document.getElementById("box-status");
  box.classList.add("hidden");
  divLoot.classList.add("hidden");
  divStatus.classList.add("hidden");
}

function clickDuel() {
  hidden();

  const kampfData = kampfDiv();
  let divKampf = document.getElementById("box-fight");
  divKampf.classList.remove("hidden");
  divKampf.innerHTML = kampfData.value;

  if (kampfData.verloren) {
    switch (kampfData.verloren) {
      case 1: {
        showMessage("💀 You have been defeated! Try again...", function () {
          divKampf.innerHTML = htmlKampf(zurückzusetzen());
        });
        break;
      }
      case 2: {
        showMessage("🎉 Victory! You won the battle!", function () {
          divKampf.innerHTML = htmlKampf(zurückzusetzen());
        });
        break;
      }
      case 3: {
        showMessage("🤝 It’s a draw! Both players have fallen!", function () {
          divKampf.innerHTML = htmlKampf(zurückzusetzen());
        });
        break;
      }
    }
  }
}

function zurückzusetzen() {
  lebenspunkte = maxLebenspunkte;
  lebenspunkteGegner = maxLebenspunkte;
  runden = 0;
  kampf = {
    runden: 0,
    dealt: 0,
    taken: 0,
    lebenspunkte: maxLebenspunkte,
    lebenspunkteGegner: maxLebenspunkte,
  };
  return kampf;
}
function updateDivKampf(value, delay = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const divKampf = document.getElementById("box-fight");
      divKampf.innerHTML = value;
      divKampf.classList.remove("hidden");
      resolve();
    }, delay);
  });
}

function kampfDiv() {
  var boss = erzeugeGegner("Rattenkönig", 1, 8);
  var kampfDaten = kampfHtml(boss);

  let divFight = htmlKampf(kampfDaten);

  const verloren =
    kampfDaten.lebenspunkte === 0 &&
    kampfDaten.lebenspunkte === kampfDaten.lebenspunkteGegner
      ? 3
      : kampfDaten.lebenspunkte === 0
      ? 1
      : kampfDaten.lebenspunkteGegner === 0
      ? 2
      : 0;

  return { value: divFight, verloren };
}

function htmlKampf(kampfDaten) {
  let porcent = Math.round((kampfDaten.lebenspunkte / maxLebenspunkte) * 100);
  let porcentGegner = Math.round(
    (kampfDaten.lebenspunkteGegner / maxLebenspunkte) * 100
  );
  spielerName = localStorage.getItem("spielerName");
  return `
      <div class="character-container">

        <div>
            <p class="title-vs"> ${spielerName} </p>
           
            <img class="character" src="heal.png" alt="heal">
            <div>
                <div class="shaden-div">
                    <p class="shaden"> Schaden: </p>
                    <p class="shaden shaden-plus"> + ${kampfDaten.dealt}</p>
                </div>
                <div class="progress-container">
                    <p class="shaden"> HP: </p>
                    <div class="progress-bar btn">
                        <div class="progress-background">
                            <div class="w3-container w3-center progress-info" style="width:${porcent}%" >${porcent}%</div>
                        </div>
                    </div>

                </div>

                <div class="shaden-div">
                    <p class="shaden"> Schaden: </p>
                    <p class="shaden shaden-minus">- ${kampfDaten.taken}</p>
                </div>
            </div>
        </div>
       
         <div class="vs">
            <p> VS. </p>
            <button class="btn " onclick="clickDuel()">🗡️ Duel</button>
            <p> Rounde ${kampfDaten.runden} </p>

             <button class="heal-btn ${
               inventar.some((l) => l == "Trank") ? "" : "hidden"
             }" onclick="clickHeal()">🧪 x ${inventarItem.trank} </button>
        </div>
        <div>
            <p class="title-vs"> Rattenkönig </p>
            <img class="character" src="rata.png" alt="heal">
            <div>
                <div class="shaden-div">
                    <p class="shaden"> Schaden: </p>
                    <p class="shaden shaden-plus">+ ${kampfDaten.taken}</p>
                </div>
                <div class="progress-container">
                    <p class="shaden"> HP: </p>
                    <div class="progress-bar btn">
                        <div class="progress-background">
                            <div class="w3-container w3-center progress-info " style="width:${porcentGegner}%" >${porcentGegner}%</div>
                        </div>
                    </div>

                </div>

                <div class="shaden-div">
                    <p class="shaden"> Schaden: </p>
                    <p class="shaden shaden-minus">  - ${kampfDaten.dealt}</p>
                </div>
            </div>
        </div>
    </div>
    <div class="rounde">
         
    </div>
  
  `;
}

function clickQuit() {
  showConfirm(
    "Willst du das Spiel wirklich beenden?",
    () => {
      localStorage.clear();
      window.location.reload();
    },
    () => {}
  );
}

function clickLoot() {
  const box = document.getElementById("box");

  const divStatus = document.getElementById("box-status");
  const divFight = document.getElementById("box-fight");
  divStatus.classList.add("hidden");
  divFight.classList.add("hidden");

  let divKampf = document.getElementById("box-loot");
  divKampf.classList.remove("hidden");

  box.classList.remove("hidden");

  const lootData = lootDiv();
  divKampf.innerHTML = lootData;

  getInventar();
}
function lootDiv() {
  var { fund, behalten } = lootAktionHtml();
  let divLoot = "";
  let fundLiHtlm = "";
  let behaltenHtlm = "";

  for (const item of fund) {
    fundLiHtlm = fundLiHtlm + getLootElementLi(item);
  }
  for (const item of behalten) {
    behaltenHtlm = behaltenHtlm + getLootElementLi(item);
  }

  divLoot =
    divLoot +
    `  <div class="row">
                 <div class="stat">
                    <span class="stat-label">🔎 Gefunden:</span>
                    <ul>
                        ${fundLiHtlm}
                    </ul>
                </div>
                <div class="stat">
                    <span class="stat-label">💼 Behalten:</span>
                    <ul>
                       ${behaltenHtlm}
                    </ul>
                </div>
            </div>
  
  `;
  divLoot =
    divLoot +
    `<div class="stat">
                        <span class="stat-label">🎒 Inventar:</span>
                        <span class="stat-value" id="inventar-info">${getInventar()}</span>
                    </div>`;

  var value = `<div>
 <div class="title-name">🎁 Loot</div>
 ${divLoot}
 </div>`;

  return value;
}
function getLootElementLi(item) {
  let fundHtlm = "";
  if (item === "Gold") {
    fundHtlm = ` <li class="stat-value">🪙 Gold</li>`;
  }
  if (item === "Trank") {
    fundHtlm = `<li class="stat-value">🧪 Trank</li>`;
  }
  if (item === "Apfel") {
    fundHtlm = `<li class="stat-value">🍎 Apfel</li>`;
  }
  return fundHtlm;
}

function clickHeal() {
  let point = heilenHtml();
  if (point > 0) {
    showAlert(`🧪 + ${point}  HP! You feel healed!`);
    getInventar();
    let divKampf = document.getElementById("box-fight");
    divKampf.classList.remove("hidden");
    divKampf.innerHTML = htmlKampf(kampf);
  } else {
    showAlert(`⚠️🧪 You need a potion to heal!`);
  }
  setTimeout(() => {
    document.getElementById("customMessage").style.display = "none";
  }, 2000);

  /*   const modal = document.getElementById("customMessage");
    modal.style.display = "flex" */
}

function showMessage(text, onConfirm) {
  const modal = document.getElementById("customModal");
  const msg = document.getElementById("modal-message");
  const btns = document.getElementById("modal-buttons");

  msg.textContent = text;
  btns.innerHTML = `<button class="btn" onclick="handleConfirm()">OK</button>`;

  modal.style.display = "flex";

  window.handleConfirm = () => {
    modal.style.display = "none";
    if (typeof onConfirm === "function") onConfirm();
  };
}

function showAlert(text) {
  const modal = document.getElementById("customMessage");
  const msg = document.getElementById("alert-message");
  const btns = document.getElementById("modal-buttons");

  msg.textContent = text;
  modal.style.display = "flex";
}
function showConfirm(text, onConfirm, onCancel) {
  const modal = document.getElementById("customModal");
  const msg = document.getElementById("modal-message");
  const btns = document.getElementById("modal-buttons");

  msg.textContent = text;
  btns.innerHTML = `
      <button class="btn" onclick="handleConfirm(true)">Yes</button>
      <button class="btn" onclick="handleConfirm(false)">Cancel</button>
    `;

  modal.style.display = "flex";

  window.handleConfirm = (result) => {
    modal.style.display = "none";
    if (result && typeof onConfirm === "function") onConfirm();
    if (!result && typeof onCancel === "function") onCancel();
  };
}

function closeModal() {
  document.getElementById("customModal").style.display = "none";
}
