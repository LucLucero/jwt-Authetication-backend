const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const secretKey = crypto.randomBytes(32).toString('hex');

// Configurações do banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'login',
  password: 'luciano',
  port: 5432 // porta padrão do PostgreSQL
});

app.use(bodyParser.json());
app.use(cors());

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Gera um hash da senha fornecida
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // Consulta o banco de dados para verificar as credenciais do usuário
  pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, hashedPassword], (error, results) => {
    if (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      return res.status(500).json({ message: 'Erro no servidor' });
    }

    const user = results.rows[0];

    if (user) {
      // Cria um token de autenticação
      const token = jwt.sign({ email: user.email, id: user.id }, secretKey, { expiresIn: '1m' });

      res.json({ token });
    } else {
      // Credenciais inválidas
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  });
});


app.post('/register', (req, res) => {
    const { email, password } = req.body;
  
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
    // Insere o novo usuário no banco de dados, armazenando o email e o hash da senha
    pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword], (error, result) => {
      if (error) {
        console.error('Erro ao inserir o usuário no banco de dados:', error);
        return res.status(500).json({ message: 'Erro no servidor' });
      }
  
      // Envie uma resposta de sucesso ou qualquer outra lógica necessária
      res.json({ message: 'Conta de usuário criada com sucesso' });
    });
  });
  

// Restante do código...

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
