# Compte-rendu de TP — Accessibilité Numérique (Séance 2 : CinéScope)

**Binôme :** Travail réalisé en binôme (alternance pilote / observateur)  
**Projet :** CinéScope — Réparation de la fenêtre modale et accessibilité du parcours  
**Date :** Octobre 2026  

---

## 1. Note de synthèse : Problèmes rencontrés, impacts et vérifications

Conformément aux consignes du sujet, voici les trois problèmes majeurs identifiés dans l'application initiale, leur impact pour les utilisateurs, et les méthodes concrètes employées pour vérifier leur résolution.

### Problème 1 : Déclencheur de réservation inopérant au clavier (Faux bouton)
- **Constat technique :** Le déclencheur « Réserver [Film] » était codé sous forme de balise générique `<div className="booking-trigger fake-button">` avec un gestionnaire `onClick`.
- **Impact utilisateur :**
  - **Navigation clavier :** Une `<div>` n'est pas focalisable nativement. Lors du parcours séquentiel avec la touche `Tab`, le focus sautait directement par-dessus ce déclencheur. Un utilisateur naviguant exclusivement au clavier (personne handicapée motrice, personne sans souris) ne pouvait tout simplement pas ouvrir la réservation.
  - **Technologies d'assistance :** Le lecteur d'écran n'exposait aucun rôle sémantique de contrôle d'action (rôle `generic` ou absent), privant l'utilisateur de l'information qu'il s'agissait d'une action cliquable. De plus, les touches `Entrée` et `Espace` n'avaient aucun effet.
- **Correction apportée :** Remplacement par un élément natif `<button type="button" className="booking-trigger">`.
- **Méthode de vérification :**
  1. *Au clavier :* Navigation complète par `Tab` depuis le début de la page ; constatation de l'apparition de l'anneau de focus `:focus-visible` sur le bouton. Déclenchement de l'ouverture avec la touche `Entrée` et la touche `Espace`.
  2. *Dans les DevTools :* Inspection de l'élément dans l'onglet **Accessibility** : rôle calculé `button`, nom accessible `"Réserver Après l’aube"`, propriété `focusable: true`.

---

### Problème 2 : Fenêtre modale non déclarée, non nommée et arrière-plan interactif
- **Constat technique :** La boîte de dialogue était une simple superposition de conteneurs `div.backdrop > div.modal`, sans sémantique WAI-ARIA, sans nom calculé, et avec une croix de fermeture en balise `<span>`.
- **Impact utilisateur :**
  - **Perte de repères :** À l'ouverture, aucun événement n'indiquait à l'utilisateur de lecteur d'écran qu'un dialogue venait d'apparaître.
  - **Absence de contexte :** Sans nom accessible, le dialogue n'était pas contextualisé (impossible de savoir à quel film il se rapportait).
  - **Fuite du focus (perte de confinement) :** Le focus ne restait pas confiné dans la modale ; en appuyant sur `Tab`, l'utilisateur pouvait sortir de la fenêtre et interagir par accident avec les éléments de la page en arrière-plan.
  - **Croix inaccessible :** Le `<span>×</span>` n'était ni focalisable ni actionnable au clavier, et était vocalisé comme un signe mathématique de multiplication.
- **Correction apportée :**
  - Utilisation de l'élément HTML5 standard `<dialog className="modal" aria-labelledby="booking-title">`.
  - Affichage via l'API native `dialogRef.current.showModal()`, qui gère nativement le calque supérieur (*top layer*), l'inertie de l'arrière-plan (`inert`), et la touche `Escape`.
  - Remplacement de la croix par un bouton natif `<button type="button" className="close" aria-label="Fermer la boîte de dialogue">`.
- **Méthode de vérification :**
  1. *Dans les DevTools :* Sélection du `<dialog>` dans l'inspecteur : vérification du rôle calculé `dialog` et du nom calculé `"Réserver [Titre]"` provenant de l'association avec `h2#booking-title`.
  2. *Au clavier :* Parcours de la modale ouverte avec `Tab` et `Maj + Tab`. Constat que le focus cycle à l'intérieur de la fenêtre et ne peut plus atteindre le contenu en arrière-plan. Test de fermeture via la touche `Escape` et vérification du rôle `button` et du libellé vocal du bouton de fermeture dans l'arborescence d'accessibilité.

---

### Problème 3 : Rupture du cycle de focus à la fermeture (Focus égaré)
- **Constat technique :** Lors de la fermeture de la fenêtre, le composant était démonté sans que le focus ne soit réassigné. Le focus était alors réinitialisé sur le haut du document (`document.body`) ou renvoyé arbitrairement sur le premier élément de la page.
- **Impact utilisateur :**
  - **Désorientation complète :** L'utilisateur devait reparcourir l'intégralité de la page depuis le début pour retrouver l'endroit où il s'était arrêté dans la grille de films.
  - **Régression critique :** En testant sur le deuxième ou troisième film (ex: *Orbite 9*), l'utilisateur était renvoyé sur le premier film, induisant une erreur sur l'état de son action.
- **Correction apportée :**
  - Mémorisation de l'élément déclencheur actif (`event.currentTarget`) au moment du clic sur « Réserver » via une référence `triggerRef`.
  - Lors de la fermeture (que ce soit par `Escape`, la croix ou le bouton de retour/annulation), déclenchement d'un callback restaurant explicitement le focus sur `triggerRef.current.focus()`.
- **Méthode de vérification :**
  1. *Scénario multi-films au clavier :*
     - Atteindre le 1er film (*Après l’aube*), ouvrir, fermer avec `Escape` -> vérification que le focus revient sur « Réserver Après l’aube ».
     - Atteindre le 3e film (*Orbite 9*), ouvrir, fermer avec le bouton « Revenir aux films » -> vérification que le focus revient précisément sur « Réserver Orbite 9 » et **non** sur le premier film.
  2. *Suivi dans la console :* Utilisation de l'expression en direct `document.activeElement` dans les DevTools pour valider la transition immédiate et sans perte du focus.

---

## 2. Restitutions détaillées des 4 Ateliers pédagogiques

### Atelier 1 — Comparer trois commandes (`atelier-1-controles.html`)
- **Question :** *Une différence observable entre la div, la div avec rôle bouton et le bouton natif, puis son effet sur une réservation.*
- **Restitution :**
  - La **`<div>` simple** ne possède aucun rôle sémantique (rôle générique), n'apparaît pas dans le flux de tabulation (`Tab`), et ignore les événements clavier (`Entrée`, `Espace`). Elle bloque complètement l'accès à la réservation pour tout utilisateur au clavier.
  - La **`<div>` avec `role="button"` et `tabindex="0"`** corrige l'annonce vocale (annoncée comme bouton) et reçoit l'anneau de focus au clavier. Cependant, elle ne s'active pas avec les touches `Entrée` ou `Espace` sans écouteurs JavaScript manuels `keydown`.
  - Le **`<button>` natif** résout tous les aspects sans aucun code supplémentaire : focus naturel, rôle implicite d'accessibilité, déclenchement natif du clic lors de la pression sur `Entrée` ou `Espace`.

### Atelier 2 — Prévoir l'ordre de Tab (`atelier-2-tabulation.html`)
- **Question :** *Ce qui a changé dans l’ordre, et pourquoi ajouter un tabindex positif peut affecter les autres commandes de la page.*
- **Restitution :**
  - Lorsque des `tabindex` positifs (`1`, `2`) sont introduits, le navigateur extrait ces éléments de l'ordre séquentiel du DOM et les place en priorité absolue par ordre numérique croissant (`tabindex="1"`, puis `tabindex="2"`), avant tous les autres éléments interactifs (`tabindex="0"` ou natifs).
  - Cela détruit la logique de navigation : l'ordre visuel de lecture de gauche à droite / haut en bas est brisé, désorientant l'utilisateur. En retirant les `tabindex` positifs, le parcours suit de nouveau l'ordre logique naturel du document.
  - **Règle retenue :** Aucun `tabindex > 0` dans le code ; utiliser uniquement l'ordre naturel du DOM, `tabindex="0"` (focalisable) ou `tabindex="-1"` (focus programmatique ciblé).

### Atelier 3 — Lire et corriger le nom du dialogue (`atelier-3-nom.html`)
- **Question :** *Quel rôle vient de la balise, et quel nom vient du titre référencé.*
- **Restitution :**
  - La balise `<dialog>` (ou l'attribut `role="dialog"`) fournit le **rôle sémantique** dans l'arbre d'accessibilité, permettant aux technologies d'assistance d'annoncer qu'il s'agit d'une boîte de dialogue modale.
  - En revanche, la balise seule ne fournit aucun nom calculé (*accessible name*). L'attribut `aria-labelledby="[id-titre]"` extrait le contenu textuel de l'en-tête (ici `<h2>Réserver [Film]</h2>`) pour lui attribuer son **nom accessible**. Le lecteur d'écran peut alors vocaliser : « Réserver Après l'aube, dialogue ».

### Atelier 4 — Diagnostiquer un retour au mauvais film (`atelier-4-retour.html`)
- **Question :** *L’élément à mémoriser à l’ouverture et la preuve du bon retour.*
- **Restitution :**
  - Il faut impérativement mémoriser le bouton précis qui a servi de déclencheur à l'ouverture (`event.currentTarget` ou `document.activeElement`).
  - La preuve du bon fonctionnement exige de tester la modale sur **au moins deux films différents**. Dans le code défectueux de l'atelier, la fermeture forçait arbitrairement le focus sur le premier film (`#film-a`), ce qui restait invisible si on ne testait que le premier élément. Avec la correction dynamique, la fermeture du dialogue d'*Orbite 9* réassigne bien le focus sur le bouton d'*Orbite 9*.

---

## 3. Travail bonus réalisé

En complément des critères obligatoires, nous avons complété les bonus prévus par le sujet :

1. **Extraction d'un composant typé `BookingDialog` (`src/BookingDialog.tsx`) :**
   - Encapsulation propre de la modale dans un composant React dédié, typé en TypeScript (`Film`, `BookingDialogProps`).
   - Le composant conserve strictement le confinement du focus, l'écoute d'événement `onClose` et le nommage `aria-labelledby`.
2. **Confirmation explicite et séances disponibles :**
   - Présence d'un bouton d'action principal « Confirmer la réservation » lorsque la séance est disponible (`film.available === true`).
   - Gestion du cas « Séance complète » où seul le bouton d'annulation / retour est proposé.
3. **Restitution via zone live `role="status"` :**
   - Mise en place d'une région dynamique `.selection` dotée de `role="status"` et `aria-live="polite"`.
   - À la confirmation d'une réservation, le message est mis à jour et vocalisé poliment par le lecteur d'écran, **sans détourner ni déplacer le focus**, qui retourne correctement sur le déclencheur d'origine.
   - Testé avec succès sur deux confirmations successives du même film et sur annulation.

---

## 4. Vérification des contraintes globales du projet

- [x] Aucun `tabindex` positif présent dans le code.
- [x] Privilégier les éléments HTML natifs (`<button>`, `<dialog>`).
- [x] Indicateurs de focus `:focus-visible` scrupuleusement préservés (liseré orange `#ffbf47`).
- [x] Lisibilité et cohérence testées à 200 % de zoom sans perte d'information.
- [x] Compilation TypeScript et build Vite validés sans avertissement (`npm run build`).

