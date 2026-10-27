//! Fonctions partagées par toutes les pages (chargé avant le script de la page)

// Adresse du serveur : un seul endroit à changer si le port change
const API_URL = 'http://localhost:3000';

//! Transforme une date en texte français : "dimanche 26 avril 2015 à 08:01"
const formatDate = (dateText) => {
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) {
        return 'date inconnue';
    }
    return date.toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

//! Donne toujours la même couleur au même tag (8 couleurs possibles, voir app.css)
const getTagColor = (tag) => {
    let total = 0;
    for (const letter of tag.toLowerCase()) {
        total += letter.charCodeAt(0);
    }
    return total % 8;
};

//! Crée la pastille colorée d'un tag
const createTagBadge = (tag) => {
    const badge = document.createElement('span');
    badge.classList.add('tag-badge', `tag-${getTagColor(tag)}`);
    badge.textContent = tag;
    return badge;
};

//! Crée la pastille de statut : "Terminée" ou "En cours"
const createStatusBadge = (isComplete) => {
    const badge = document.createElement('span');
    badge.classList.add('status-badge', isComplete ? 'is-done' : 'is-pending');
    badge.textContent = isComplete ? '✓ Terminée' : 'En cours';
    return badge;
};

//! Ouvre et ferme le menu sur téléphone (bouton "Menu")
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.navbar-toggler');
    const menu = document.getElementById('navbarResponsive');
    if (!menuButton || !menu) {
        return;
    }
    menuButton.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('show');
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });
});
