import React, { useEffect, useState } from "react"
import Keyboard from "./components/Keyboard"
import ControlKnob from "./components/ControlKnob"
import WaveSelector from "./components/WaveSelector"
import * as audio from "./lib/audio-engine"
import * as ws from "./lib/websocket"
import "./App.scss"

export default function App() {
	const [settings, setSettings] = useState(audio.getSettings())
	const [activeNotes, setActiveNotes] = useState(audio.getActiveNotes())

	useEffect(() => {
		const unbindActiveNotes = audio.emitter.on("activeNotes", setActiveNotes)
		const unbindSettings = audio.emitter.on("settings", setSettings)

		return () => {
			unbindSettings()
			unbindActiveNotes()
		}
	}, [])

	return (
		<div className="App">
			<h1>SimpleSynth</h1>
			<WaveSelector
				value={settings.waveType}
				onChange={value => ws.updateSetting("waveType", value)}
			/>
			<div className="knobs">
				<ControlKnob
					label="Filter Freq"
					format={v => Math.round(v) + " Hz"}
					value={settings.filterFrequency}
					min={20}
					max={20000}
					defaultValue={audio.defaultSettings.filterFrequency}
					onChange={value => ws.updateSetting("filterFrequency", value)}
					logarithmic
				/>
				<ControlKnob
					label="Attack"
					format={v => Math.round(v) + " ms"}
					value={settings.attackTime}
					min={0}
					max={2000}
					defaultValue={audio.defaultSettings.attackTime}
					onChange={value => ws.updateSetting("attackTime", value)}
				/>
				<ControlKnob
					label="Release"
					format={v => Math.round(v) + " ms"}
					value={settings.releaseTime}
					min={0}
					max={5000}
					defaultValue={audio.defaultSettings.releaseTime}
					onChange={value => ws.updateSetting("releaseTime", value)}
				/>
				<ControlKnob
					label="Gain"
					format={v => v.toFixed(2)}
					value={settings.masterGain}
					min={0}
					max={1}
					defaultValue={audio.defaultSettings.masterGain}
					onChange={value => ws.updateSetting("masterGain", value)}
				/>
			</div>
			<Keyboard
				activeNotes={activeNotes}
				onNoteOn={ws.startNote}
				onNoteOff={ws.stopNote}
			/>
		</div>
	)
}
