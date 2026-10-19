import { useEffect, useRef } from "react";

export interface Film {
  id: number;
  title: string;
  genre: string;
  time: string;
  available: boolean;
  poster: string;
}

interface BookingDialogProps {
  film: Film | null;
  onClose: () => void;
  onConfirm: (film: Film) => void;
}

export function BookingDialog({ film, onClose, onConfirm }: BookingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (film) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [film]);

  if (!film) return null;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="booking-title"
      onClose={onClose}
    >
      <div className="dialog-heading">
        <h2 id="booking-title">Réserver {film.title}</h2>
        <button
          type="button"
          className="close"
          aria-label="Fermer la boîte de dialogue"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p>{film.genre} · Séance de {film.time}</p>
      <p className={"availability " + (film.available ? "available" : "unavailable")}>
        {film.available ? "Places disponibles" : "Séance complète"}
      </p>
      <p>Consultez la séance et sa disponibilité avant de revenir au programme.</p>
      <div className="actions">
        {film.available && (
          <button
            className="dialog-action"
            type="button"
            onClick={() => onConfirm(film)}
          >
            Confirmer la réservation
          </button>
        )}
        <button
          className="dialog-action"
          type="button"
          onClick={onClose}
        >
          {film.available ? "Annuler" : "Revenir aux films"}
        </button>
      </div>
    </dialog>
  );
}

