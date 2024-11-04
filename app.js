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
    apis: ['./app.js'],
};

const openapiSpecification = swaggerJsdoc(options);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ajoutez ceci pour servir les fichiers statiques dans le dossier 'public'
app.use(express.static('public'));

const todos = [
    {
        "todolist": [
            {
                "id": 1,
                "text": "Learn about Polymer",
                "created_at": "Mon Apr 26 06:01:55 +0000 2015",
                "Tags": ["Web Development", "Web Components"],
                "is_complete": true
            },
            {
                "id": 2,
                "text": "Watch Pluralsight course on Docker",
                "created_at": "Tue Mar 02 07:01:55 +0000 2015",
                "Tags": ["Devops", "Docker"],
                "is_complete": true
            },
            {
                "id": 3,
                "text": "Complete presentation prep for Aurelia presentation",
                "created_at": "Wed Mar 05 10:01:55 +0000 2015",
                "Tags": ["Presentation", "Aurelia"],
                "is_complete": false
            },
            {
                "id": 4,
                "text": "Instrument creation of development environment with Puppet",
                "created_at": "Fri June 30 13:00:00 +0000 2015",
                "Tags": ["Devops", "Puppet"],
                "is_complete": false
            },
            {
                "id": 5,
                "text": "Transition code base to ES6",
                "created_at": "Mon Aug 01 10:00:00 +0000 2015",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 6,
                "text": "Daploy website",
                "created_at": "Mon Aug 01 10:00:00 +0000 2015",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 7,
                "text": "Make all testing",
                "created_at": "Mon Aug 01 10:00:00 +0000 2015",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 8,
                "text": "Send messages to run Team",
                "created_at": "Mon Aug 01 10:00:00 +0000 2015",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            },
            {
                "id": 9,
                "text": "Close Project",
                "created_at": "Mon Aug 01 10:00:00 +0000 2015",
                "Tags": ["ES6", "Web Development"],
                "is_complete": false
            }
        ]
    }
];

app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});

app.get('/stats', (req, res) => {
    const totalTasks = todos[0].todolist.length;
    const completedTasks = todos[0].todolist.filter(task => task.is_complete).length;
    const pendingTasks = totalTasks - completedTasks;

    const stats = {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks
    };

    res.status(200).json(stats);
});

app.post('/todos', (req, res) => {
    const newTodo = {
        id: todos[0].todolist.length + 1,
        text: req.body.text,
        created_at: new Date().toISOString(),
        Tags: req.body.Tags,
        is_complete: req.body.is_complete || false
    };
    todos[0].todolist.push(newTodo);
    res.status(201).json(newTodo);
});

app.get('/todos/:id', (req, res) => {
    const { id } = req.params;
    const todo = todos[0].todolist.find(t => t.id === parseInt(id));
    if (!todo) {
        return res.status(404).send('Todo not found');
    }
    res.status(200).json(todo);
});

app.put('/todos/:id', (req, res) => {
    const index = todos[0].todolist.findIndex(t => t.id == req.params.id);
    if (index >= 0) {
        todos[0].todolist[index] = {
            ...todos[0].todolist[index],
            ...req.body
        };
        res.status(200).json(todos[0].todolist[index]);
    } else {
        res.status(404).send("Todo not found");
    }
});

app.delete('/todos/:id', (req, res) => {
    const index = todos[0].todolist.findIndex(t => t.id == req.params.id);
    if (index >= 0) {
        todos[0].todolist.splice(index, 1);
        res.status(200).send("Todo deleted successfully");
    } else {
        res.status(404).send("Todo not found");
    }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
