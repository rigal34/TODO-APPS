document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // L'ancienne version gardait ici une copie de chaque tâche cliquée : on efface ce reste
    localStorage.removeItem('selectedTasks');

    // Le numéro de la tâche vient de l'adresse : item.html?id=3
    const taskId = Number(new URLSearchParams(window.location.search).get('id'));

    //! Affiche un message seul sur la page, avec un bouton de retour à la liste
    const showPageMessage = (texte) => {
        app.textContent = '';
        const message = document.createElement('p');
        message.classList.add('empty-message');
        message.textContent = texte;

        const backLink = document.createElement('a');
        backLink.href = 'tasks.html';
        backLink.classList.add('btn', 'btn-secondary', 'd-block', 'mx-auto');
        backLink.style.maxWidth = '260px';
        backLink.textContent = 'Retour à la liste';

        app.appendChild(message);
        app.appendChild(backLink);
    };

    //! Va chercher la tâche sur le serveur (toujours la version à jour)
    const fetchTask = async () => {
        if (!Number.isInteger(taskId) || taskId <= 0) {
            showPageMessage("Aucune tâche n'est sélectionnée.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/todos/${taskId}`);
            if (response.status === 404) {
                showPageMessage(`La tâche n° ${taskId} n'existe pas, ou elle a été supprimée.`);
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const task = await response.json();
            displayTaskDetails(task);
        } catch (error) {
            console.error('Erreur lors de la récupération de la tâche:', error);
            showPageMessage('Impossible de charger la tâche. Vérifie que le serveur tourne (node app.js).');
        }
    };

    //! Affiche la carte de la tâche, avec un message éventuel ({ texte, type })
    const displayTaskDetails = (task, message) => {
        app.textContent = '';

        const card = document.createElement('article');
        card.classList.add('card', 'task-card', 'task-detail', task.is_complete ? 'is-done' : 'is-pending');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'd-flex', 'flex-column', 'p-4');

        const taskStatus = createStatusBadge(task.is_complete);

        const taskText = document.createElement('h2');
        taskText.classList.add('card-title', 'mt-3');
        taskText.textContent = task.text;

        const taskDate = document.createElement('p');
        taskDate.classList.add('task-date');
        taskDate.textContent = `Créée le ${formatDate(task.created_at)}`;

        const taskTags = document.createElement('div');
        taskTags.classList.add('task-tags');
        (task.Tags || []).forEach(tag => {
            taskTags.appendChild(createTagBadge(tag));
        });

        const messageElement = document.createElement('div');
        messageElement.setAttribute('role', 'status');
        messageElement.classList.add('app-message', 'mt-3');
        if (message) {
            messageElement.textContent = message.texte;
            messageElement.classList.add(message.type);
        }

        const actions = document.createElement('div');
        actions.classList.add('task-actions');

        // Un seul bouton de statut, qui change selon l'état de la tâche
        const statusButton = document.createElement('button');
        statusButton.type = 'button';
        if (task.is_complete) {
            statusButton.classList.add('btn', 'btn-warning');
            statusButton.textContent = 'Rouvrir la tâche';
        } else {
            statusButton.classList.add('btn', 'btn-success');
            statusButton.textContent = 'Marquer comme terminée';
        }
        statusButton.addEventListener('click', () => {
            updateTaskStatus(task, !task.is_complete);
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.classList.add('btn', 'btn-outline-danger');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', () => {
            const confirmation = confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');
            if (confirmation) {
                deleteTask(task, card, messageElement);
            }
        });

        const backLink = document.createElement('a');
        backLink.href = 'tasks.html';
        backLink.classList.add('btn', 'btn-secondary', 'ms-sm-auto');
        backLink.textContent = 'Retour à la liste';

        actions.appendChild(statusButton);
        actions.appendChild(deleteButton);
        actions.appendChild(backLink);

        cardBody.appendChild(taskStatus);
        cardBody.appendChild(taskText);
        cardBody.appendChild(taskDate);
        cardBody.appendChild(taskTags);
        cardBody.appendChild(messageElement);
        cardBody.appendChild(actions);
        card.appendChild(cardBody);
        app.appendChild(card);
    };

    //! Marque la tâche comme terminée (true) ou la rouvre (false)
    const updateTaskStatus = async (task, isComplete) => {
        try {
            const response = await fetch(`${API_URL}/todos/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_complete: isComplete })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedTask = await response.json();
            displayTaskDetails(updatedTask, {
                texte: `La tâche a été ${isComplete ? 'marquée comme terminée' : 'rouverte'}.`,
                type: isComplete ? 'success' : 'info'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la tâche:', error);
            displayTaskDetails(task, {
                texte: "La tâche n'a pas pu être modifiée. Vérifie que le serveur tourne.",
                type: 'error'
            });
        }
    };

    //! Supprime la tâche, puis revient à la liste
    const deleteTask = async (task, card, messageElement) => {
        try {
            const response = await fetch(`${API_URL}/todos/${task.id}`, {
                method: 'DELETE'
            });

            if (response.status === 404) {
                showPageMessage(`La tâche n° ${task.id} n'existe plus.`);
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Les boutons sont désactivés : la tâche n'existe plus
            card.querySelectorAll('button').forEach(button => {
                button.disabled = true;
            });
            messageElement.textContent = 'Tâche supprimée. Retour à la liste…';
            messageElement.className = 'app-message mt-3 success';

            setTimeout(() => {
                window.location.href = 'tasks.html';
            }, 1500);
        } catch (error) {
            console.error('Erreur lors de la suppression de la tâche:', error);
            messageElement.textContent = "La tâche n'a pas pu être supprimée. Vérifie que le serveur tourne.";
            messageElement.className = 'app-message mt-3 error';
        }
    };

    fetchTask();
});
