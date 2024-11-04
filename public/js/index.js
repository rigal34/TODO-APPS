document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const inputPrenom = document.getElementById('prenom');
    const buttonTache = document.querySelector('.btn.btn-primary');
    const sayHello = document.getElementById("sayHello");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        verifierPrenom();
    });

    function verifierPrenom() {
        const Prenom = inputPrenom.value.trim();

        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]{2,}$/.test(Prenom)) {
            inputPrenom.style.borderColor = "red";
            buttonTache.disabled = true;
            sayHello.style.display = 'block';
            sayHello.innerHTML = `Bonjour à toi l'inconnu, merci de renseigner ton prénom`;
        } else {
            inputPrenom.style.borderColor = "";
            buttonTache.disabled = false;
            setData(Prenom);
            sayHello.innerHTML = `Bonjour ${Prenom}`;
            sayHello.style.display = 'block';

            setTimeout(() => {
                window.location.href = 'tasks.html';
            }, 2000);
        }
    }

    function setData(Prenom) {
        localStorage.setItem("nom", Prenom);
    }
});
