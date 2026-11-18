// Mini-libreria — Settimana VII Giorno I — Versione completa con persistenza e ricerca


// === Classi ===

class Libro {
  static contatore = 0;

  constructor(titolo, autore, anno) {
    this.id = ++Libro.contatore;
    this.titolo = titolo;
    this.autore = autore;
    this.anno = anno;
    this.letto = false;
  }

  segnaComeLetto() {
    this.letto = true;
  }

  formato() {
    return "cartaceo";
  }

  static fromJSON(d) {
    return Object.assign(new this(d.titolo, d.autore, d.anno), d);
  }
}

class LibroDigitale extends Libro {
  constructor(titolo, autore, anno, dimensioneMb) {
    super(titolo, autore, anno);
    this.dimensioneMb = dimensioneMb;
  }

  formato() {
    return `digitale (${this.dimensioneMb} MB)`;
  }

  static fromJSON(d) {
    return Object.assign(super.fromJSON(d), { dimensioneMb: d.dimensioneMb });
  }
}


// === Costante e Stato ===

const STORAGE_KEY = "libri";

let libri = caricaLibri();


// === Funzioni di persistenza ===

function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
  const datiSalvati = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  return datiSalvati.map(d =>
    d.dimensioneMb !== undefined
      ? LibroDigitale.fromJSON(d)
      : Libro.fromJSON(d)
  );
}


// === Render libreria personale ===

function renderLibri() {
  const html = libri.map(l => `
    <li class="${l.letto ? 'letto' : ''}" data-id="${l.id}">
      <div class="info">
        <span class="titolo">${l.titolo}</span>
        <span class="badge-formato">${l.formato()}</span>
        <div class="meta">${l.autore} — ${l.anno}</div>
      </div>
      <div class="azioni">
        ${l.letto
      ? '<span class="badge-letto">✓ letto</span>'
      : '<button data-azione="leggi">Segna come letto</button>'
    }
      <button data-azione="rimuovi" class="btn-rimuovi">Rimuovi</button>
      </div>
    </li>
  `).join("");

  document.getElementById("lista-libri").innerHTML = html;
  document.getElementById("contatore").textContent = libri.length;
}


// === Eventi libreria ===

document.getElementById("formato").addEventListener("change", (e) => {
  const campo = document.getElementById("campo-dimensione");
  if (e.target.value === "digitale") {
    campo.removeAttribute("hidden");
  } else {
    campo.setAttribute("hidden", "");
  }
});

document.getElementById("aggiungi-libro").addEventListener("submit", (e) => {
  e.preventDefault();

  const titolo = document.getElementById("titolo").value;
  const autore = document.getElementById("autore").value;
  const anno = parseInt(document.getElementById("anno").value);
  const formato = document.getElementById("formato").value;

  let nuovo;
  if (formato === "digitale") {
    const dim = parseFloat(document.getElementById("dimensione").value) || 0;
    nuovo = new LibroDigitale(titolo, autore, anno, dim);
  } else {
    nuovo = new Libro(titolo, autore, anno);
  }

  libri.push(nuovo);
  salvaLibri();
  renderLibri();
  e.target.reset();
  document.getElementById("campo-dimensione").setAttribute("hidden", "");
});

document.getElementById("lista-libri").addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]");
  if (!bottone) return;

  const azione = bottone.dataset.azione;
  const card = bottone.closest("li");
  const id = parseInt(card.dataset.id);

  if (azione === "leggi") {
    const libro = libri.find(l => l.id === id);
    if (libro) libro.segnaComeLetto();
  } else if (azione === "rimuovi") {
    libri = libri.filter(l => l.id !== id);
  }

  salvaLibri();
  renderLibri();
});


// === Render iniziale ===
renderLibri();


// === Bottone Svuota Tutto ===
document.getElementById('svuota-tutto').addEventListener('click', () => {
  if (confirm("Sei sicuro di voler cancellare tutti i libri?")) {
    libri = [];
    localStorage.removeItem(STORAGE_KEY);
    renderLibri();
  }
});


// API di operlibrary.org

const API_URL = "https://openlibrary.org/search.json";

let controller;

const inputCerca = document.getElementById("cerca");
const spinner = document.getElementById("spinner");
const erroreDiv = document.getElementById("errore");
const risultatiLista = document.getElementById("risultati");


// === Funzioni Helper ===

function mostraSpinner() {
  spinner.removeAttribute("hidden");
  erroreDiv.setAttribute("hidden", "");
}

function nascondiSpinner() {
  spinner.setAttribute("hidden", "");
}

function mostraErrore(msg) {
  erroreDiv.textContent = msg;
  erroreDiv.removeAttribute("hidden");
}


// === Funzione di ricerca ===

function cerca(query) {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  mostraSpinner();

  const url = new URL(API_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", 10);

  fetch(url, { signal })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((dati) => {
      renderRisultati(dati.docs);
    })
    .catch((err) => {
      if (err.name === "AbortError") return;
      mostraErrore(err.message);
    })
    .finally(() => {
      if (!signal.aborted) nascondiSpinner();
    });
}


// Render risultati

function renderRisultati(docs) {
  //Se non ci sono risultati, inserisco un solo <li> con replaceChildren
  if (docs.length === 0) {
    const liVuoto = document.createElement("li");
    liVuoto.textContent = "Nessun risultato trovato.";
    risultatiLista.replaceChildren(liVuoto);
    return;
  }

  // Altrimenti mappo i documenti
  const righe = docs.map((d) => {
    // Gestione dei dati mancanti con optional chaining e nullish coalescing
    const autore = d.author_name?.[0] ?? "Autore sconosciuto";
    const anno = d.first_publish_year ?? "?";

    // Creo la struttura <li>
    const li = document.createElement("li");

    // Contenitore per le info
    const divInfo = document.createElement("div");
    divInfo.className = "info";

    // Titolo
    const spanTitolo = document.createElement("span");
    spanTitolo.className = "titolo";
    spanTitolo.textContent = d.title;

    // Meta (autore - anno)
    const divMeta = document.createElement("div");
    divMeta.className = "meta";
    divMeta.textContent = `${autore} - ${anno}`;

    // Assemblo le info
    divInfo.appendChild(spanTitolo);
    divInfo.appendChild(divMeta);

    // Bottone "Aggiungi" con dataset
    const bottone = document.createElement("button");
    bottone.textContent = "Aggiungi";
    bottone.addEventListener('click', () => {
        const nuovoLibro = new Libro(d.title, autore, anno);

  // Aggiungo all'array, salvo e aggiorno la vista
  libri.push(nuovoLibro);
  salvaLibri();
  renderLibri();

  // Feedback visivo: disabilito il bottone e cambio il testo
  bottone.textContent = "✓ Aggiunto";
  bottone.disabled = true;
      
    });

    // Salvo i dati nel dataset per recuperarli al click
    bottone.dataset.titolo = d.title;
    bottone.dataset.autore = autore;
    bottone.dataset.anno = anno;

    // Assemblo il <li> completo
    li.appendChild(divInfo);
    li.appendChild(bottone);

    return li;
  });

  // Inserisco tutto nella lista con replaceChildren
  risultatiLista.replaceChildren(...righe);
}


// === Debounce sull'input ===

let timeoutId;

inputCerca.addEventListener("input", (e) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      cerca(query);
    } else {
      risultatiLista.replaceChildren();
      nascondiSpinner();
    }
  }, 400);
});