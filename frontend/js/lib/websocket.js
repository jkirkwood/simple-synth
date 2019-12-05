import * as audio from "./audio-engine"

let socket

function connect() {
  const ws = new WebSocket("ws://" + location.host + location.pathname)

  ws.addEventListener("open", function() {
    console.log("socket connection opened")
    socket = ws
  })

  ws.addEventListener("error", function(err) {
    console.log("websocket error:", err)
  })

  // If connection is closed attempt to reopen after a delay
  ws.addEventListener("close", function() {
    socket = null
    console.log("socket connection closed")
    setTimeout(connect, 100 + Math.random(1000))
  })

  // Forward incoming messages to the audio engine
  ws.addEventListener("message", function(message) {
    const [fn, ...args] = JSON.parse(message.data)

    // If sync request was received, broadcast all setting values
    if (fn === "sync") {
      const settings = audio.getSettings()
      for (let name in settings) {
        if (socket) {
          socket.send(JSON.stringify(["updateSetting", name, settings[name]]))
        }
      }
    } else {
      audio[fn](...args)
    }
  })
}

// Send setting changes and notes over the websocket, and then pass to audio engine
export function updateSetting(name, value) {
  audio.updateSetting(name, value)

  if (socket) {
    socket.send(JSON.stringify(["updateSetting", name, value]))
  }
}

export function startNote(note) {
  audio.startNote(note)

  if (socket) {
    socket.send(JSON.stringify(["startNote", note]))
  }
}

export function stopNote(note) {
  audio.stopNote(note)

  if (socket) {
    socket.send(JSON.stringify(["stopNote", note]))
  }
}

connect()
