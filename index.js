const express = require('express');
const mongoose = require('mongoose');

// Criação de uma instância do Express para a aplicação
const app = express();

// Configuração para permitir que o aplicativo analise dados codificados na URL e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importação do modelo 'Person' para interação com o banco de dados
const Person = require('./models/person');

// Rota para criação de uma nova pessoa (C do CRUD)
app.post('/person', async (req, res) => {
    const { name, salary, approved } = req.body;

    const person = {
        name,
        salary,
        approved,
    }

    // Tentativa de criação de uma nova pessoa no banco de dados
    try {
        await Person.create(person)
        res.status(201).json({ message: 'Pessoa cadastrada!!!' })
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// Rota para obter todas as pessoas (R do CRUD)
app.get('/person', async (req, res) => {
    try {
        const people = await Person.find();
        res.status(200).json(people)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// Rota para obter uma pessoa específica por ID (R do CRUD)
app.get('/person/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const person = await Person.findOne({ _id: id })
        if (!person) {
            res.status(422).json({ message: 'Usuário não encontrado' })
            return
        }
        res.status(200).json(person)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// Rota para atualizar uma pessoa por ID (U do CRUD)
app.patch('/person/:id', async (req, res) => {
    const { name, salary, approved } = req.body;
    const id = req.params.id;
    const person = {
        name,
        salary,
        approved
    }

    try {
        const updatedPerson = await Person.updateOne({ _id: id }, person)
        if (updatedPerson.matchedCount === 0) {
            res.status(422).json({ message: 'Usuário não encontrado' })
            return
        }
        res.status(200).json(person)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// Rota para excluir uma pessoa por ID (D do CRUD)
app.delete('/person/:id', async (req, res) => {
    const id = req.params.id
    const person = await Person.findOne({ _id: id });

    if (!person) {
        res.status(422).json({ message: 'Usuário não encontrado' })
        return
    }
    try {
        await Person.deleteOne({ _id: id })
        res.status(200).json({ message: 'Usuário removido com sucesso' })
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// Função para criptografar a senha do usuário
async function getCrypto(password) {
    // Implementação da lógica para criptografar a senha
}

// Rota para autenticar o usuário (Login)
app.post('/login', async (req, res) => {
    let { email, pass } = req.body;
    try {
        let encryptedPass = await getCrypto(pass);
        const person = await Person.findOne({ email, pass: encryptedPass });

        if (!person) {
            res.status(422).json({ message: 'Credenciais inválidas' });
            return;
        }

        res.status(200).json({ message: 'Usuário Logado', user: person });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor' })
    }
});

// Conexão com o banco de dados MongoDB
let url = "mongodb://localhost:27017";
mongoose.connect(url)
    .then(() => {
        console.log("Conexão bem-sucedida com o banco de dados MongoDB!")
        // Rota padrão
        app.get('/', (req, res) => {
            res.json({ message: "Olá, mundo" });
        })
    }).catch((error) => {
        console.log("Erro ao conectar ao banco de dados MongoDB:", error)
    })

// Tornar a API pública, escutando na porta 3000
app.listen(3000);