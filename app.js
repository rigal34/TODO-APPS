const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo List API',
            version: '1.0.0',
        },
    },
    // Chemin complet : la documentation marche même si on lance le serveur depuis un autre dossier
    apis: [path.join(__dirname, 'app.js')],
};

const openapiSpecification = swaggerJsdoc(options);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Sert les pages du dossier 'public' (chemin complet, pour la même raison)
app.use(express.static(path.join(__dirname, 'public')));

const todos = [
    {
        "todolist": [
            {
                "id": 1,
                "text": "Learn about Polymer",
                "created_at": "2015-04-26T06:01:55.000Z",
                "Tags": ["Web Development", "Web Components"],
                "is_complete": true
            },
            {
                "id": 2,
                "text": "Watch Pluralsight course on Docker",
                "created_at": "2015-03-02T07:01:55.000Z",
                "Tags": ["Devops", "Docker"],
                "is_complete": true
            },
            {
                "id": 3,
                "text": "Complete presentation prep for Aurelia presentation",
                "created_at": "2015-03-05T10:01:55.000Z",
                "Tags": ["Presentation", "Aurelia"],
                "is_complete": false
            },
            {
                "id": 4,
                "text": "Instrument creation of development environment with Puppet",
                "created_at": "2015-06-30T13:00:00.000Z",
                "Tags": ["Devops", "Puppet"],
                "is_complete": false
            },
            {
                "id": 5,
                "text": "Transition code base to ES6",
                "created_at": "2015-08-01T10:00:00.000Z",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 6,
                "text": "Deploy website",
                "created_at": "2015-08-01T10:00:00.000Z",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 7,
                "text": "Make all testing",
                "created_at": "2015-08-01T10:00:00.000Z",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 8,
                "text": "Send messages to run Team",
                "created_at": "2015-08-01T10:00:00.000Z",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 9,
                "text": "Close Project",
                "created_at": "2015-08-01T10:00:00.000Z",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            }
        ]
    }
];

// La liste des tâches, rangée dans le premier objet du tableau todos
const getTodoList = () => todos[0].todolist;

// Prochain numéro libre : le plus grand id + 1
// (avec "longueur + 1", une suppression faisait réutiliser un id déjà pris)
const getNextId = () => getTodoList().reduce((max, todo) => Math.max(max, todo.id), 0) + 1;

// Garde seulement les tags non vides, sans espaces autour
const cleanTags = (tags) => {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags.map(tag => String(tag).trim()).filter(tag => tag !== '');
};

/**
 * @openapi
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         text: { type: string, example: Learn about Polymer }
 *         created_at: { type: string, format: date-time, example: '2015-04-26T06:01:55.000Z' }
 *         Tags: { type: array, items: { type: string }, example: [Web Development, Web Components] }
 *         is_complete: { type: boolean, example: false }
 */

/**
 * @openapi
 * /todos:
 *   get:
 *     summary: Liste toutes les tâches
 *     responses:
 *       200:
 *         description: Un tableau qui contient un objet todolist (la liste des tâches)
 *   post:
 *     summary: Ajoute une tâche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string, example: Tester la to-do list }
 *               Tags: { type: array, items: { type: string }, example: [JavaScript] }
 *               is_complete: { type: boolean, example: false }
 *     responses:
 *       201:
 *         description: La tâche créée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Todo' }
 *       400:
 *         description: Le texte de la tâche est vide
 */
app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});

/**
 * @openapi
 * /stats:
 *   get:
 *     summary: Compte les tâches (total, terminées, en cours)
 *     responses:
 *       200:
 *         description: Les trois compteurs
 */
app.get('/stats', (req, res) => {
    const totalTasks = getTodoList().length;
    const completedTasks = getTodoList().filter(task => task.is_complete).length;
    const pendingTasks = totalTasks - completedTasks;

    const stats = {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks
    };

    res.status(200).json(stats);
});

app.post('/todos', (req, res) => {
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (text === '') {
        return res.status(400).json({ message: 'Le texte de la tâche est obligatoire' });
    }

    const newTodo = {
        id: getNextId(),
        text: text,
        created_at: new Date().toISOString(),
        Tags: cleanTags(req.body.Tags),
        is_complete: req.body.is_complete === true
    };
    getTodoList().push(newTodo);
    res.status(201).json(newTodo);
});

/**
 * @openapi
 * /todos/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema: { type: integer }
 *   get:
 *     summary: Renvoie une tâche
 *     responses:
 *       200:
 *         description: La tâche demandée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Todo' }
 *       404:
 *         description: Tâche introuvable
 *   put:
 *     summary: Modifie une tâche (texte, tags ou statut)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text: { type: string }
 *               Tags: { type: array, items: { type: string } }
 *               is_complete: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: La tâche modifiée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Todo' }
 *       404:
 *         description: Tâche introuvable
 *   delete:
 *     summary: Supprime une tâche
 *     responses:
 *       200:
 *         description: Tâche supprimée
 *       404:
 *         description: Tâche introuvable
 */
app.get('/todos/:id', (req, res) => {
    const todo = getTodoList().find(t => t.id === Number(req.params.id));
    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json(todo);
});

app.put('/todos/:id', (req, res) => {
    const index = getTodoList().findIndex(t => t.id === Number(req.params.id));
    if (index < 0) {
        return res.status(404).json({ message: 'Todo not found' });
    }

    // On n'accepte que ces trois champs : l'id et la date de création ne bougent jamais
    const changes = {};
    if (typeof req.body.text === 'string' && req.body.text.trim() !== '') {
        changes.text = req.body.text.trim();
    }
    if (Array.isArray(req.body.Tags)) {
        changes.Tags = cleanTags(req.body.Tags);
    }
    if (typeof req.body.is_complete === 'boolean') {
        changes.is_complete = req.body.is_complete;
    }

    getTodoList()[index] = {
        ...getTodoList()[index],
        ...changes
    };
    res.status(200).json(getTodoList()[index]);
});

app.delete('/todos/:id', (req, res) => {
    const index = getTodoList().findIndex(t => t.id === Number(req.params.id));
    if (index < 0) {
        return res.status(404).json({ message: 'Todo not found' });
    }
    getTodoList().splice(index, 1);
    res.status(200).json({ message: 'Todo deleted successfully' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
