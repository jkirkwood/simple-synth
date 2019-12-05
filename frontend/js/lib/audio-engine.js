import NanoEvents from "nanoevents"

// Fire events when active notes or settings are changed
// "activeNotes" event fires when activeNotes array changes
// "settings" event fires when any setting is updated
export const emitter = new NanoEvents()

export const defaultSettings = Object.freeze({
  waveType: "sawtooth",
  filterType: "lowpass",
  filterFrequency: 2000,
  masterGain: 1.0,
  attackTime: 0,
  releaseTime: 500,
})

// Settings that will be applied to oscillators when a note starts
const oscSettings = {
  type: defaultSettings.waveType,
  attackTime: defaultSettings.attackTime,
  releaseTime: defaultSettings.releaseTime,
}

// Array of note numbers that are currently active
const activeNotes = []
// Map of note numbers to active oscillator objects
const activeOscillators = []

const ctx = new (window.AudioContext || window.webkitAudioContext)()

// Master gain node
const masterGain = ctx.createGain()
masterGain.connect(ctx.destination)
masterGain.gain.value = defaultSettings.masterGain

// Filter node
const filter = ctx.createBiquadFilter()
filter.connect(masterGain)
filter.type = defaultSettings.filterType
filter.frequency.value = defaultSettings.filterFrequency

// Update the specified setting to the given value
export function updateSetting(name, value) {
  switch (name) {
    case "waveType":
      oscSettings.type = value
      break
    case "attackTime":
      oscSettings.attackTime = value
      break
    case "releaseTime":
      oscSettings.releaseTime = value
      break
    case "filterType":
      filter.type = value
      break
    case "filterFrequency":
      filter.frequency.value = value
      break
    case "masterGain":
      masterGain.gain.value = value
      break
    default:
      throw new Error(`Setting ${name} is not recognized`)
  }

  emitter.emit("settings", getSettings())
}

// Get object containing all current settings
export function getSettings() {
  return {
    waveType: oscSettings.type,
    attackTime: oscSettings.attackTime,
    releaseTime: oscSettings.releaseTime,
    filterType: filter.type,
    filterFrequency: filter.frequency.value,
    masterGain: masterGain.gain.value,
  }
}

// Get array containing all active note numbers
export function getActiveNotes() {
  return [...activeNotes]
}

// Start playing a note
export function startNote(note) {
  // Don't start note again if it is already active
  if (activeNotes.includes(note)) {
    return
  }

  // Kill oscillator that is active to note. This could happen if the note has
  // been released (is not being pressed) but the release envelope is still
  // active
  const active = activeOscillators[note]
  if (active) {
    const [, osc] = active
    osc.stop()
    activeOscillators[note] = null
  }

  // Create gain node to control note's attack and release volume envelope
  const envGain = ctx.createGain()
  envGain.connect(filter)
  envGain.gain.setValueAtTime(0, ctx.currentTime)
  envGain.gain.linearRampToValueAtTime(
    1.0,
    ctx.currentTime + oscSettings.attackTime / 1000
  )

  const osc = ctx.createOscillator()
  osc.type = oscSettings.type
  osc.frequency.value = Math.pow(2, (note - 69) / 12) * 440
  osc.connect(envGain)
  osc.start()

  activeOscillators[note] = [envGain, osc]
  activeNotes.push(note)
  emitter.emit("activeNotes", getActiveNotes())
}

// Stop playing a note
export function stopNote(note) {
  const active = activeOscillators[note]
  if (active) {
    const [envGain, osc] = active
    const stopTime = ctx.currentTime + oscSettings.releaseTime / 1000
    envGain.gain.linearRampToValueAtTime(0, stopTime)
    osc.stop(stopTime)
    activeOscillators[note] = null
  }

  const index = activeNotes.indexOf(note)
  if (index >= 0) {
    activeNotes.splice(index, 1)
    emitter.emit("activeNotes", getActiveNotes())
  }
}
