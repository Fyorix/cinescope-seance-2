import { useMemo, useRef, useState } from "react";
import posterAube from "./assets/aube.svg";
import posterMemoire from "./assets/memoire.svg";
import posterOrbite from "./assets/orbite.svg";
import { BookingDialog, type Film } from "./BookingDialog";

const films: Film[] = [
  { id: 1, title: "Après l’aube", genre: "Drame", time: "18 h 10", available: true, poster: posterAube },
  { id: 2, title: "La mémoire des murs", genre: "Documentaire", time: "19 h 30", available: false, poster: posterMemoire },
  { id: 3, title: "Orbite 9", genre: "Science-fiction", time: "21 h 00", available: true, poster: posterOrbite },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<{ title: string; time: string } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const filteredFilms = useMemo(
    () => films.filter((film) => film.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const toggleFavorite = (id: number) => {
    setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  const openBooking = (film: Film, triggerElement: HTMLButtonElement) => {
    triggerRef.current = triggerElement;
    setSelectedFilm(film);
  };

  const closeBooking = () => {
    setSelectedFilm(null);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const handleConfirm = (film: Film) => {
    setConfirmedBooking({ title: film.title, time: film.time });
    closeBooking();
  };

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#programme" onClick={() => setQuery("")}>CinéScope</a>
        <nav aria-label="Navigation principale">
          <ul className="menu">
            <li><a href="#programme">Programme</a></li>
            <li><a href="#infos">Informations</a></li>
          </ul>
        </nav>
      </header>
      <main className="page">
        <h1>Films à l’affiche</h1>
        <p className="intro">Découvrez la programmation de cette semaine.</p>
        <div className="search-field">
          <label htmlFor="film-search">Rechercher un film</label>
          <input
            id="film-search"
            className="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <section id="programme" aria-labelledby="programme-title">
          <h2 id="programme-title">Programme</h2>
          <div className="film-grid">
            {filteredFilms.map((film) => {
              const isFavorite = favorites.includes(film.id);
              return (
                <article className="film-card" key={film.id}>
                  <img src={film.poster} alt="" />
                  <div className="film-content">
                    <p className={"availability " + (film.available ? "available" : "unavailable")}>
                      {film.available ? "Places disponibles" : "Séance complète"}
                    </p>
                    <h3>{film.title}</h3>
                    <p>{film.genre} · {film.time}</p>
                    <div className="actions">
                      <button
                        type="button"
                        className="booking-trigger"
                        onClick={(event) => openBooking(film, event.currentTarget)}
                      >
                        Réserver {film.title}
                      </button>
                      <button
                        type="button"
                        className="favorite"
                        aria-pressed={isFavorite}
                        aria-label={"Favori : " + film.title}
                        onClick={() => toggleFavorite(film.id)}
                      >
                        <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {filteredFilms.length === 0 && <p>Aucun film ne correspond à votre recherche.</p>}
        </section>
        <div className="selection" role="status" aria-live="polite">
          {confirmedBooking ? (
            <p>
              Réservation confirmée : <strong>{confirmedBooking.title}</strong> (séance de {confirmedBooking.time}).
            </p>
          ) : (
            <p>Aucune réservation en cours.</p>
          )}
        </div>
        <section id="infos" className="infos" aria-labelledby="infos-title">
          <h2 id="infos-title">Informations pratiques</h2>
          <p>Le cinéma ouvre trente minutes avant la première séance.</p>
        </section>
        <BookingDialog
          film={selectedFilm}
          onClose={closeBooking}
          onConfirm={handleConfirm}
        />
      </main>
    </>
  );
}
