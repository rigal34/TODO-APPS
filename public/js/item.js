document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // Fonction pour supprimer une tâche du Local Storage
    const removeTaskFromLocalStorage = (taskId) => {
        let storedTasks = JSON.parse(localStorage.getItem('selectedTasks')) || [];
        storedTasks = storedTasks.filter(task => task.id !== taskId);
        localStorage.setItem('selectedTasks', JSON.stringify(storedTasks));
    };

    // Fonction pour mettre à jour l'état de la tâche
    const updateTaskStatus = async (taskId, isComplete, taskElement) => {
        try {
            const response = await fetch(`http://localhost:3000/todos/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_complete: isComplete })
            });

            if (response.ok) {
                const task = await response.json();
                taskElement.querySelector('.card-text.complete-status').textContent = `Complet : ${isComplete ? 'Oui' : 'Non'}`;
                const messageElement = taskElement.querySelector('.task-message');
                messageElement.textContent = `La tâche a été ${isComplete ? 'marquée comme terminée' : 'rouverte'}.`;
                messageElement.style.color = isComplete ? 'green' : 'orange';
            } else {
                console.error('Erreur lors de la mise à jour de la tâche:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la tâche:', error);
        }
    };

    // Fonction pour afficher les détails d'une tâche
    const displayTaskDetails = (task) => {
        const taskDetails = document.createElement('div');
        taskDetails.classList.add('card', 'mb-3');
        taskDetails.id = `task-${task.id}`;
        taskDetails.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.text}</h5>
                <p class="card-text">Date de création : ${new Date(task.created_at).toLocaleString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}</p>
                <p class="card-text complete-status">Complet : ${task.is_complete ? 'Oui' : 'Non'}</p>
                <div>Tags : ${task.Tags.map(tag => {
                    const tagClass = (tag === 'Devops' || tag === 'Docker') ? 'red-text' : '';
                    return `<span class="badge badge-primary mr-1 ${tagClass}">${tag}</span>`;
                }).join('')}</div>
                <div class="task-message mt-2"></div>
                <button id="delete-task-${task.id}" class="btn btn-danger btn-sm mt-2">Supprimer</button>
                <button id="complete-task-${task.id}" class="btn btn-success btn-sm mt-2">Marquer comme terminé</button>
                <button id="reopen-task-${task.id}" class="btn btn-warning btn-sm mt-2">Rouvrir la tâche</button>
            </div>
        `;

        app.appendChild(taskDetails);

        const deleteButton = document.getElementById(`delete-task-${task.id}`);
        deleteButton.addEventListener('click', () => {
            const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?");
            if (confirmation) {
                deleteTask(task.id, taskDetails);
            }
        });

        const completeButton = document.getElementById(`complete-task-${task.id}`);
        completeButton.addEventListener('click', () => {
            updateTaskStatus(task.id, true, taskDetails);
        });

        const reopenButton = document.getElementById(`reopen-task-${task.id}`);
        reopenButton.addEventListener('click', () => {
            updateTaskStatus(task.id, false, taskDetails);
        });
    };

    // Fonction pour supprimer une tâche
    const deleteTask = async (taskId, cardElement) => {
        try {
            const response = await fetch(`http://localhost:3000/todos/${taskId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                removeTaskFromLocalStorage(taskId);
                cardElement.remove();
                alert(`Tâche ${taskId} supprimée avec succès`);
            } else if (response.status === 404) {
                alert(`Erreur : Tâche avec ID ${taskId} non trouvée.`);
            } else {
                console.error('Erreur lors de la suppression de la tâche:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la tâche:', error);
        }
    };

    // Fonction pour afficher toutes les tâches
    const displayAllTasks = () => {
        const storedTasks = JSON.parse(localStorage.getItem('selectedTasks')) || [];
        storedTasks.forEach(task => {
            displayTaskDetails(task);
        });
    };

    displayAllTasks();
});
