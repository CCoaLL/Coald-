const express = require("express")
const { WebSocketServer } = require("ws")
const app = express()
const session = require('express-session')
const fileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const fs = require("fs")

app.use(
  session({
    secret: 'i6a43ah4cwxxpiibt4ws2snkran7i8augj4g6z3079f3fvpb0uxb02',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 6 * 60 * 10000,
    },
    store: new fileStore(),
  }),
  bodyParser.urlencoded({
    extended: true
  })
);

app.get('/', (req, res) => {
  if(req.session.logged_in != true) {
    return res.redirect('/login')
  }
    
  return res.sendFile(__dirname + '/templates/app/index.html')
})

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/')
})

app.get('/login', (req, res) => {
  return res.sendFile(__dirname + '/templates/login/index.html')
})

app.post('/login', (req, res) => {
  var email = req.body.email
  var pw = req.body.pw
  var db = JSON.parse(fs.readFileSync(__dirname + '/db/db.json'))
  var user = null

  for(item in db) {
    if(db[item].email == email && db[item].pw == pw) {
      user = item
    }
  }

  if(user != null) {
    req.session.logged_in=true
    return res.redirect('/')
  } else
    return res.redirect('/login')
})

app.get('/register', (req, res) => {
  return res.sendFile(__dirname + '/templates/register/index.html')
})

app.post('/register', (req, res) => {
  var username = req.body.username
  var email = req.body.email
  var pw = req.body.pw
  var role = 'human'
  var id = Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)+Math.random().toString(36).substring(2, 11)
  var db = JSON.parse(fs.readFileSync(__dirname + '/db/db.json'))
  db[username] = {
    "role": role,
    "id": id,
    "username": username,
    "pw": pw,
    "email": email
  }

  var du = JSON.stringify(db, null, 4);
  fs.writeFileSync(__dirname + '/db/db.json', du)

  return res.redirect('/')
})

app.listen(8000, () => {
  console.log(`lop8000`)
})

const wss = new WebSocketServer({ port: 8001 })

wss.on("connection", (ws, request) => {
  ws.on("close", () => {
    wss.clients.forEach((client) => {
      client.send(`유저 한명이 떠났습니다. 현재 유저 ${wss.clients.size} 명`);
    });
  });

  ws.on("message", data => {
    wss.clients.forEach(client => {
      client.send(data.toString())
    })
  })

  wss.clients.forEach((client => {
    client.send(`새로운 유저가 접속했습니다. 현재 유저 ${wss.clients.size} 명`)
  }))
})