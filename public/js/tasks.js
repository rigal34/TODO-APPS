

//! Cette fonction se déclenche lorsque la page html est complétement chargé sans attendre que les feuilles  styles,éléments soient analysé

document.addEventListener('DOMContentLoaded', () => {
    //JE récupere tout mes Id
    const tasksContainer = document.getElementById('tasks-container');
    const addTaskForm = document.getElementById('add-task-form');
    const newTaskInput = document.getElementById('new-task');
    const newTagInput = document.getElementById('new-tag');

    let tasks = [];//mémoire de stockage en globale accéssible pour les autres fonctions


    //! Cette fonction va chercher dans l'API
    const fetchTasks = async () => {
        try {
            const response = await fetch("http://localhost:3000/todos");
            if (!response.ok) {//verifie si false! ou true ok
                throw new Error(`HTTP error! status: ${response.status}`);//interpolation plus affiche le numero du serveur
            }
            const data = await response.json();// transforme la réponse HTTP en un objet JSON.

            //verifie si data est un tableau
            //verifie la longueur du tableau s'il n est pas vide
            //
            if (Array.isArray(data) && data.length > 0 && data[0].todolist && Array.isArray(data[0].todolist)) {
                tasks = data[0].todolist;
                //Cette expression vérifie si la propriété todolist du premier élément de data est un tableau.
                //premier élément du tableau data. Nous avons déjà vérifié que cet élément possède bien cette propriété.
                //Cette variable tasks est ensuite utilisée pour passer les données à la fonction displayTasks
               //Vérifie que le premier élément de data a une propriété todolist
              //vérifie si la propriété  todolist du premier élément data est un tableau.
                displayTasks(tasks);//appelle de la fonction
            } else {
                console.log('La structure des données n\'est pas celle attendue.');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
        }
    };






     //! cette fonction affiche les tâches dans le dôme 
      //(tasks)= parametre tableau
      //Réinitialisation du conteneur de tâches
      //tasksContainer = <div>
      //évite les doublons et garantit que l'affichage est à jour
      //appelle de la fonction  addTaskToDOM
    const displayTasks = (tasks) => {
        tasksContainer.textContent = "";
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
    };





//! cette fonction est appelée lorsqu'un événement se produit comme un clic sur un bouton permet de creer liste de tache et de tag

    const addTask = async (event) => {
        event.preventDefault();//Empêche le comportement par défaut de l'événement.
        const taskText = newTaskInput.value.trim();//Récupération et nettoyage des entrées utilisateur
        const tagText = newTagInput.value.trim();//Récupération et nettoyage des entrées utilisateur
        if (taskText === "" || tagText === "") return;//Variables qui stockent les valeurs nettoyées de newTaskInput et newTagInput
        //Vérifie si taskText ou tagText est une chaîne vide après nettoyage.
        const newTask = {
            text: taskText,
            Tags: [tagText],//tableau qui permet de stocker plusieurs tags
            is_complete: false
        };

        try {
            const response = await fetch("http://localhost:3000/todos", {
                method: "POST",//utilisé pour envoyer des données au serveur pour créer une nouvelle ressource.
                headers: {//Spécifie des informations supplémentaires envoyées avec la requête.
                    "Content-Type": "application/json"// indique le format des données qui sont envoyées ou reçues au serveur
                },  
                body: JSON.stringify(newTask)// cet objet sera converti en une chaîne JSON
            });

            if (response.ok) {//vérifie si la réponse HTTP est réussie
                const addedTask = await response.json();//await response.json() transforme la réponse HTTP en un objet JavaScript
               //'on attend que les données soient complètement reçues et converties avant de passer à l'instruction suivante.
                addTaskToDOM(addedTask);//La fonction addTaskToDOM est appelée avec addedTask
                newTaskInput.value = '';
                newTagInput.value = '';//réinitialisent les champs de saisie de la tâche et du tag
            } else {
                console.error('Erreur lors de l\'ajout de la tâche:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la tâche:', error);
        }
    };

    const addTaskToDOM = (task) => {//task représente un objet avec des propriétés comme title, description, etc., qui décrivent la tâche. 
        const col = document.createElement('div');
        col.classList.add('col-lg-4', 'col-md-6', 'col-sm-12');

        const card = document.createElement('div');
        card.classList.add('card', 'mb-4', 'shadow-sm');
        card.setAttribute('data-id', task.id);//modifie des attributs

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const taskText = document.createElement('h5');
        taskText.classList.add('card-title');
        taskText.textContent = task.text;

        const taskDate = document.createElement('small');
        const formattedDate = new Date(task.created_at).toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        taskDate.textContent = `Date de création : ${formattedDate}`;

        const taskComplete = document.createElement('span');
        taskComplete.textContent = `Complet : ${task.is_complete ? 'Oui' : 'Non'}`;

        const taskTags = document.createElement('div');
        taskTags.classList.add('task-tags');
        taskTags.textContent = 'Tags : ';
        task.Tags.forEach(tag => {
            const tagLink = document.createElement('span');
            tagLink.textContent = tag;
            tagLink.classList.add('badge', 'badge-primary', 'mr-1');
            taskTags.appendChild(tagLink);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mt-2');

        const detailButton = document.createElement('a');
        detailButton.href = `item.html?id=${task.id}`;
        detailButton.classList.add('btn', 'btn-primary', 'btn-sm');
        detailButton.textContent = 'Voir les détails';
        detailButton.addEventListener('click', (event) => {
            event.preventDefault();
            addTaskToLocalStorage(task);
            window.location.href = detailButton.href;
        });

        buttonContainer.appendChild(detailButton);

        cardBody.appendChild(taskText);
        cardBody.appendChild(taskDate);
        cardBody.appendChild(taskComplete);
        cardBody.appendChild(taskTags);
        cardBody.appendChild(buttonContainer);
        card.appendChild(cardBody);
        col.appendChild(card);

        tasksContainer.appendChild(col);
    };

    const addTaskToLocalStorage = (task) => {
        let storedTasks = JSON.parse(localStorage.getItem('selectedTasks')) || [];
        storedTasks.push(task);
        localStorage.setItem('selectedTasks', JSON.stringify(storedTasks));
    };

    addTaskForm.addEventListener('submit', addTask);
    fetchTasks();
});
