// Mini-libreria — Settimana VII Giorno I
//
// Devi fare 4 cose:
// 1. Definire una classe Libro (titolo, autore, anno, letto)
// 2. Definire una classe LibroDigitale che estende Libro (aggiunge formato, dimensioneMb)
// 3. Aggiungere un listener al form che crea una nuova istanza e la aggiunge all'array
// 4. Renderizzare la lista nel <ul id="lista-libri"> via innerHTML
//
// Bonus: bottone "Segna come letto" su ogni elemento, gestito con event delegation.

const form = document.querySelector('#aggiungi-form');
const lista = document.querySelector('#lista-libri');
const contatore = document.querySelector('#contatore-libri');
const selectFormato = document.querySelector('#format');
const campoDimensione = document.querySelector('#campo-dimensione');
const inputDimensione = document.querySelector('#dimension');



// === Classi ===

class Libro {
    letto = false
    constructor(_title, _author, _year) {
        this.id = crypto.randomUUID();
        this.title = _title;
        this.author = _author;
        this.year = _year;
    }


// === Stato (array di libri) ===

segnaComeLetto() {
    this.letto = true;
};

formato() {
    return "cartaceo";
};

// Getter per ottenere l'id (essendo privato)
get id() {
    return this.id;
};

}
class LibroDigitale extends Libro {
    constructor(_title, _author, _year, _dimensioneMb) {
        super(_title, _author, _year);
        this.dimensioneMb = _dimensioneMb;
    }

    // Override del metodo formato()
    formato() {
        return `digitale (${this.dimensioneMb} MB)`;
    }
}


// === Render ===



// === Eventi ===
