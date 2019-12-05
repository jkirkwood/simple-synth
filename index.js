const util = require("util")
const crypto = require("crypto")
const http = require("http")

const Koa = require("koa")
const logger = require("koa-logger")
const serve = require("koa-static")
const send = require("koa-send")
const WebSocket = require("ws")

// Valid room is url with 32 hex digit path
function isValidRoom(path) {
  return /^\/[a-f0-9]{32}$/.test(path)
}

const app = new Koa()

app.use(logger())

// Serve static file at path if it exists
app.use(serve(__dirname + "/dist", { index: false }))

// If user goes to a url that is not a valid room, redirect to a valid room
app.use(async (ctx, next) => {
  await next()

  if (!isValidRoom(ctx.path)) {
    const buf = await util.promisify(crypto.randomBytes)(16)
    ctx.redirect("/" + buf.toString("hex"))
  }
})

// Always serve index.html file, regardless of path
app.use(async (ctx, next) => {
  await next()
  await send(ctx, "index.html", { root: __dirname + "/dist" })
})

const server = http.createServer(app.callback()).listen(3000)

console.log("server listening on port", 3000)

const wss = new WebSocket.Server({ server })

// rooms is a Map of arrays where each array contains each socket connected to a room
const rooms = new Map()

wss.on("connection", function connection(ws, req) {
  const room = req.url

  if (!isValidRoom(room)) {
    ws.close()
    return
  }

  if (!rooms.has(room)) {
    rooms.set(room, [])
  }

  const members = rooms.get(room)
  members.push(ws)

  // Request settings sync from first member in room
  if (members.length > 1) {
    members[0].send(JSON.stringify(["sync"]))
  }

  console.log(`new socket connection in room ${room} (${members.length})`)

  // Broadcast messages to all other sockets in the same room
  ws.on("message", function incoming(message) {
    for (let member of members) {
      if (member !== ws) {
        member.send(message)
      }
    }
  })

  ws.on("close", function close() {
    const index = members.indexOf(ws)
    members.splice(index, 1)
    if (members.length === 0) {
      rooms.delete(room)
    }
    console.log(`socket disconnect from room ${room} (${members.length})`)
  })
})
