document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.getElementById('stats-container');

    const fetchTasks = async () => {
        try {
            console.log('Fetching tasks from API...');
            const response = await fetch("http://localhost:3000/todos");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Données brutes récupérées de l\'API:', data);

            if (Array.isArray(data) && data.length > 0 && data[0].todolist && Array.isArray(data[0].todolist)) {
                const tasks = data[0].todolist;
                console.log('Tâches récupérées :', tasks);
                displayStats(tasks);
                renderChart(tasks);
            } else {
                console.log('La structure des données n\'est pas celle attendue.');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
        }
    };

    const displayStats = (tasks) => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.is_complete).length;
        const incompleteTasks = totalTasks - completedTasks;

        const statsHtml = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card text-white bg-primary mb-3">
                        <div class="card-header">Total des Tâches</div>
                        <div class="card-body">
                            <h5 class="card-title">${totalTasks}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-success mb-3">
                        <div class="card-header">Tâches Complètes</div>
                        <div class="card-body">
                            <h5 class="card-title">${completedTasks}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-danger mb-3">
                        <div class="card-header">Tâches Incomplètes</div>
                        <div class="card-body">
                            <h5 class="card-title">${incompleteTasks}</h5>
                        </div>
                    </div>
                </div>
            </div>
        `;

        statsContainer.innerHTML = statsHtml;
    };

    const renderChart = (tasks) => {
        const ctx = document.getElementById('tasksChart').getContext('2d');

        const completedTasks = tasks.filter(task => task.is_complete).length;
        const incompleteTasks = tasks.length - completedTasks;

        const data = {
            labels: ['Complètes', 'Incomplètes'],
            datasets: [{
                label: 'Tâches',
                data: [completedTasks, incompleteTasks],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        };

        const config = {
            type: 'pie',
            data: data
        };

        new Chart(ctx, config);
    };

    fetchTasks();
});
