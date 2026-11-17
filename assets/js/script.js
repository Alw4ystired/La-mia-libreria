// Mini-libreria — Settimana VII Giorno I — Versione completa con persistenza


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

// Carica i dati all'avvio
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


// === Render ===

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


// === Eventi ===

// Mostra/nasconde il campo "dimensione" in base al formato selezionato
document.getElementById("formato").addEventListener("change", (e) => {
  const campo = document.getElementById("campo-dimensione");
  if (e.target.value === "digitale") {
    campo.removeAttribute("hidden");
  } else {
    campo.setAttribute("hidden", "");
  }
});

// Submit del form: crea l'istanza giusta e la aggiunge all'array
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

// Event listener per i bottoni leggi/rimuovi
document.getElementById("lista-libri").addEventListener("click", (e) => {
  // Selezionatore generico: cattura qualsiasi elemento con l'attributo data-azione
  const bottone = e.target.closest("[data-azione]");
  if (!bottone) return; // Se non è un bottone con data-azione, esci

  const azione = bottone.dataset.azione; // "leggi" o "rimuovi"
  const card = bottone.closest("li");
  const id = parseInt(card.dataset.id);

  if (azione === "leggi") {
    // Trova il libro e segnalo come letto
    const libro = libri.find(l => l.id === id);
    if (libro) libro.segnaComeLetto();
  } else if (azione === "rimuovi") {
    // Filtra l'array per escludere il libro con questo id
    libri = libri.filter(l => l.id !== id);
  }

  // Salva e ri-renderizza
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