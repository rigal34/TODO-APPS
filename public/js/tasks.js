//! Cette fonction se déclenche lorsque la page html est complètement chargée

document.addEventListener('DOMContentLoaded', () => {
    // Je récupère tous mes éléments
    const tasksContainer = document.getElementById('tasks-container');
    const addTaskForm = document.getElementById('add-task-form');
    const newTaskInput = document.getElementById('new-task');
    const newTagInput = document.getElementById('new-tag');
    const formMessage = document.getElementById('form-message');
    const greeting = document.getElementById('greeting');

    let tasks = []; // mémoire de stockage accessible pour les autres fonctions

    //! Salue l'utilisateur avec le prénom saisi sur la page d'accueil
    const prenom = localStorage.getItem('nom');
    greeting.textContent = prenom ? `Bonjour ${prenom}, voici ta liste de tâches.` : 'Voici ta liste de tâches.';

    //! Cette fonction va chercher les tâches dans l'API
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/todos`);
            if (!response.ok) { // vérifie si la réponse est un succès
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // transforme la réponse HTTP en objet JavaScript

            // data doit être un tableau dont le premier élément contient le tableau todolist
            if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].todolist)) {
                tasks = data[0].todolist;
                displayTasks(tasks);
            } else {
                showListMessage("La structure des données n'est pas celle attendue.");
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            showListMessage('Impossible de charger les tâches. Vérifie que le serveur tourne (node app.js).');
        }
    };

    //! Affiche un message à la place des cartes (liste vide ou erreur)
    const showListMessage = (texte) => {
        tasksContainer.textContent = '';
        const message = document.createElement('p');
        message.classList.add('empty-message', 'col-12');
        message.textContent = texte;
        tasksContainer.appendChild(message);
    };

    //! Affiche un message sous le formulaire (succès ou erreur)
    const showFormMessage = (texte, type) => {
        formMessage.textContent = texte;
        formMessage.className = `app-message mt-3 ${type}`;
    };

    //! Affiche toutes les tâches dans le DOM
    const displayTasks = (tasks) => {
        tasksContainer.textContent = ''; // évite les doublons
        if (tasks.length === 0) {
            showListMessage('Aucune tâche pour le moment : ajoute la première avec le formulaire.');
            return;
        }
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
    };

    //! Envoie la nouvelle tâche au serveur, puis l'affiche
    const addTask = async (event) => {
        event.preventDefault(); // empêche le rechargement de la page

        const taskText = newTaskInput.value.trim();
        // Plusieurs tags possibles : "JavaScript, Web" donne ["JavaScript", "Web"]
        const tags = newTagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        if (taskText === '' || tags.length === 0) {
            showFormMessage('Écris une tâche et au moins un tag.', 'error');
            return;
        }

        const newTask = {
            text: taskText,
            Tags: tags,
            is_complete: false
        };

        try {
            const response = await fetch(`${API_URL}/todos`, {
                method: 'POST', // envoie des données pour créer une nouvelle tâche
                headers: {
                    'Content-Type': 'application/json' // les données envoyées sont du JSON
                },
                body: JSON.stringify(newTask) // l'objet est converti en texte JSON
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const addedTask = await response.json();
            if (tasks.length === 0) {
                tasksContainer.textContent = ''; // enlève le message "Aucune tâche"
            }
            tasks.push(addedTask);

            const card = addTaskToDOM(addedTask);
            card.classList.add('is-new'); // la carte s'illumine un instant
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });

            newTaskInput.value = '';
            newTagInput.value = ''; // réinitialise les champs
            showFormMessage(`Tâche « ${addedTask.text} » ajoutée.`, 'success');
        } catch (error) {
            console.error("Erreur lors de l'ajout de la tâche:", error);
            showFormMessage("La tâche n'a pas pu être ajoutée. Vérifie que le serveur tourne.", 'error');
        }
    };

    //! Crée la carte d'une tâche et l'ajoute à la page
    const addTaskToDOM = (task) => {
        const col = document.createElement('div');
        col.classList.add('col-lg-4', 'col-md-6', 'col-sm-12', 'mb-4');

        // La couleur de la carte dépend du statut : orange "en cours", vert "terminée"
        const card = document.createElement('article');
        card.classList.add('card', 'task-card', 'h-100', task.is_complete ? 'is-done' : 'is-pending');
        card.setAttribute('data-id', task.id);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'd-flex', 'flex-column');

        const taskStatus = createStatusBadge(task.is_complete);

        const taskText = document.createElement('h5');
        taskText.classList.add('card-title', 'mt-3');
        taskText.textContent = task.text;

        const taskDate = document.createElement('p');
        taskDate.classList.add('task-date');
        taskDate.textContent = `Créée le ${formatDate(task.created_at)}`;

        const taskTags = document.createElement('div');
        taskTags.classList.add('task-tags', 'mb-3');
        (task.Tags || []).forEach(tag => {
            taskTags.appendChild(createTagBadge(tag));
        });

        const detailButton = document.createElement('a');
        detailButton.href = `item.html?id=${task.id}`;
        detailButton.classList.add('btn', 'btn-secondary', 'btn-sm', 'mt-auto', 'align-self-start');
        detailButton.textContent = 'Voir les détails';

        cardBody.appendChild(taskStatus);
        cardBody.appendChild(taskText);
        cardBody.appendChild(taskDate);
        cardBody.appendChild(taskTags);
        cardBody.appendChild(detailButton);
        card.appendChild(cardBody);
        col.appendChild(card);

        tasksContainer.appendChild(col);
        return card;
    };

    addTaskForm.addEventListener('submit', addTask);
    fetchTasks();
});
