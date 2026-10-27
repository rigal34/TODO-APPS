document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const inputPrenom = document.getElementById('prenom');
    const buttonTache = form.querySelector('button[type="submit"]');
    const sayHello = document.getElementById('sayHello');

    // Des lettres (accents compris), avec un trait d'union, une apostrophe ou un espace
    // entre deux parties : "Bruno", "Jean-Pierre", "Marie Claire", "N'Golo"
    const prenomValide = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '’-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        verifierPrenom();
    });

    // Dès que l'utilisateur corrige sa saisie, on efface l'erreur
    // (avant, le bouton restait bloqué après une première erreur)
    inputPrenom.addEventListener('input', () => {
        inputPrenom.classList.remove('is-invalid');
        afficherMessage('', '');
    });

    function verifierPrenom() {
        const prenom = inputPrenom.value.trim();

        if (prenom.length < 2 || !prenomValide.test(prenom)) {
            inputPrenom.classList.add('is-invalid');
            afficherMessage("Bonjour à toi l'inconnu, merci de renseigner ton prénom", 'error');
            inputPrenom.focus();
            return;
        }

        inputPrenom.classList.remove('is-invalid');
        setData(prenom);
        afficherMessage(`Bonjour ${prenom} !`, 'success');
        buttonTache.disabled = true; // évite un double clic pendant le changement de page

        setTimeout(() => {
            window.location.href = 'tasks.html';
        }, 1500);
    }

    function afficherMessage(texte, type) {
        sayHello.textContent = texte;
        sayHello.className = `app-message mt-3 ${type}`;
    }

    function setData(prenom) {
        localStorage.setItem('nom', prenom);
    }
});
