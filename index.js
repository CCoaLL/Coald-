const express = require("express")
const WebSocketServer = require("ws")
const app = express()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/app/index.html')
})

app.listen(8000, () => {
  console.log(`Example app listening on port 8000`)
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

  wss.clients.forEach(client => {
    client.send(`새로운 유저가 접속했습니다. 현재 유저 ${wss.clients.size} 명`)
  })
  
  console.log(`새로운 유저 접속: ${request.socket.remoteAddress}`)
})