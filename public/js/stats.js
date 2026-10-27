document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.getElementById('stats-container');
    const chartBox = document.getElementById('chart-box');

    //! Va chercher les tâches dans l'API
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/todos`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].todolist)) {
                const tasks = data[0].todolist;
                displayStats(tasks);
                renderChart(tasks);
            } else {
                showMessage("La structure des données n'est pas celle attendue.");
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            showMessage('Impossible de charger les statistiques. Vérifie que le serveur tourne (node app.js).');
        }
    };

    //! Affiche un message à la place des statistiques
    const showMessage = (texte) => {
        statsContainer.textContent = '';
        const message = document.createElement('p');
        message.classList.add('empty-message');
        message.textContent = texte;
        statsContainer.appendChild(message);
        chartBox.style.display = 'none';
    };

    //! Les trois compteurs, plus une phrase de résumé
    const displayStats = (tasks) => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.is_complete).length;
        const incompleteTasks = totalTasks - completedTasks;
        const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        const statsHtml = `
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="stat-card total">
                        <div class="stat-number">${totalTasks}</div>
                        <div class="stat-label">Total des tâches</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card done">
                        <div class="stat-number">${completedTasks}</div>
                        <div class="stat-label">Terminées</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card pending">
                        <div class="stat-number">${incompleteTasks}</div>
                        <div class="stat-label">En cours</div>
                    </div>
                </div>
            </div>
            <p class="stats-summary">${percent} % des tâches sont terminées.</p>
        `;

        statsContainer.innerHTML = statsHtml;
    };

    //! Le camembert (bibliothèque Chart.js)
    const renderChart = (tasks) => {
        // Sans Internet, Chart.js ne se charge pas : les compteurs restent affichés
        if (typeof Chart === 'undefined' || tasks.length === 0) {
            chartBox.style.display = 'none';
            return;
        }

        const ctx = document.getElementById('tasksChart').getContext('2d');

        const completedTasks = tasks.filter(task => task.is_complete).length;
        const incompleteTasks = tasks.length - completedTasks;

        const data = {
            labels: ['Terminées', 'En cours'],
            datasets: [{
                label: 'Tâches',
                data: [completedTasks, incompleteTasks],
                backgroundColor: ['#1abc9c', '#e67e22'],
                borderColor: '#ffffff',
                borderWidth: 3
            }]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        };

        new Chart(ctx, config);
    };

    fetchTasks();
});
