import React from "react"
import "./WaveSelector.scss"

const waveTypes = ["sine", "square", "sawtooth", "triangle"]

export default function WaveSelector({ value, onChange }) {
  return (
    <div className="WaveSelector">
      <div className="label">Wave Type</div>
      {waveTypes.map(t => (
        <button
          key={t}
          className={value === t ? "active" : ""}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
