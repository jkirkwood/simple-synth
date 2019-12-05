import React, { useEffect, useState } from "react"
import "./Keyboard.scss"

// Map keyboard keys to MIDI note numbers which are used to represent musical notes
const keyMap = [
  { key: "a", note: 0 },
  { key: "w", note: 1 },
  { key: "s", note: 2 },
  { key: "e", note: 3 },
  { key: "d", note: 4 },
  { key: "f", note: 5 },
  { key: "t", note: 6 },
  { key: "g", note: 7 },
  { key: "y", note: 8 },
  { key: "h", note: 9 },
  { key: "u", note: 10 },
  { key: "j", note: 11 },
  { key: "k", note: 12 },
  { key: "o", note: 13 },
  { key: "l", note: 14 },
  { key: "p", note: 15 },
  { key: ";", note: 16 },
  { key: "'", note: 17 },
]

// Returns true if note is piano "black" key
function isBlackKey(note) {
  note = note % 12
  return [1, 3, 6, 8, 10].includes(note)
}

export default function Keyboard({ activeNotes, onNoteOn, onNoteOff }) {
  const [transpose] = useState(60)

  function startNote(note) {
    onNoteOn(note + transpose)
  }

  function stopNote(note) {
    onNoteOff(note + transpose)
  }

  function onWindowKeyDown(ev) {
    // Ignore keypress if modifier key is active
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
      return
    }

    // Check if key is mapped to note
    const mapping = keyMap.find(k => k.key === ev.key)
    if (mapping) {
      ev.preventDefault()
      startNote(mapping.note)
    }
  }

  function onWindowKeyUp(ev) {
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
      return
    }

    const mapping = keyMap.find(k => k.key === ev.key)
    if (mapping) {
      ev.preventDefault()
      stopNote(mapping.note)
    }
  }

  // Capture keyboard events in window to trigger notes
  useEffect(() => {
    document.addEventListener("keyup", onWindowKeyUp)
    document.addEventListener("keydown", onWindowKeyDown)
    return () => {
      document.removeEventListener("keyup", onWindowKeyUp)
      document.removeEventListener("keydown", onWindowKeyDown)
    }
  }, [transpose])

  return (
    <div className="Keyboard">
      {keyMap.map(({ key, note }) => (
        <button
          key={note}
          className={
            "key" +
            (isBlackKey(note) ? " black" : " white") +
            (activeNotes.includes(note + transpose) ? " active" : "")
          }
          onMouseDown={ev => {
            startNote(note)
            ev.preventDefault()
          }}
          onMouseUp={() => stopNote(note)}
          onMouseLeave={() => stopNote(note)}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
