const axios = require('axios');
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')
const db  = require('../database/dbConfig.js')


const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const user = req.body;
  user.password = bcrypt.hashSync(user.password);
  db("users")
    .insert(user)
    .then(id => {
      res.status(201).send({ message: `id ${id} created`});
    })
    .catch(err => {
      res.status(500).send(err);
    });
}
function generateToken(user){
  const payload = {
    username: user.username,
  }
  const secret = process.env.JWT_SECRET
  const options ={
    expiresIn:'10m'
  }
  return jwt.sign(payload, secret, options)
}

function login(req, res) {
  // implement user login
  const creds = req.body;
  db("users")
    .where("username", creds.username).first()
    .then(user => { 
    if( user && bcrypt.compareSync(creds.password, user.password)){
      const token = generateToken(user);
      res.status(202).json({msg:"user logged in", token});
    }
    else{
      res.status(401).send("invalid username or password");
    }
    })
    .catch(err =>{
      res.status(500).send(err);
    })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
