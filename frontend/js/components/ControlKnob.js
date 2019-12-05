import React, { useState, useEffect } from "react"
import "./ControlKnob.scss"

export default function ControlKnob({
  value,
  min,
  max,
  defaultValue,
  onChange,
  logarithmic,
  label,
  format,
}) {
  // Store initial values when starting to drag control knob
  const [dragInfo, setDragInfo] = useState(null)

  // Rotation limits in degrees
  const minRotation = -160
  const maxRotation = 160

  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  const logScale = (maxLog - minLog) / (maxRotation - minRotation)

  const rotation = logarithmic
    ? (Math.log(value) - minLog) / logScale + minRotation
    : minRotation + (value / (max - min)) * (maxRotation - minRotation)

  function setRotation(newRotation) {
    let newValue = logarithmic
      ? Math.exp(minLog + logScale * (newRotation - minRotation))
      : ((newRotation - minRotation) * (max - min)) /
        (maxRotation - minRotation)

    if (newValue > max) {
      newValue = max
    } else if (newValue < min) {
      newValue = min
    }

    onChange(newValue)
  }

  // When knob is double clicked reset to its default value
  function onDoubleClick() {
    if (defaultValue != null) {
      onChange(defaultValue)
    }
  }

  // Update value when scroll wheel is used
  function onWheel(ev) {
    setRotation(rotation + ev.deltaY)
  }

  function onMouseDown(ev) {
    setDragInfo({ startX: ev.pageX, startY: ev.pageY, startRotation: rotation })
    ev.preventDefault()
  }

  function onMouseMove(ev) {
    if (!dragInfo) {
      return
    }
    const delta = dragInfo.startY - ev.pageY
    setRotation(dragInfo.startRotation + delta)
  }

  function onMouseUp(ev) {
    setDragInfo(null)
  }

  // If mouse goes down while over the knob, continue to respond to mouse movement
  // outside of knob until mouse goes up
  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("mousemove", onMouseMove)
    return () => {
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("mousemove", onMouseMove)
    }
  }, [dragInfo])

  return (
    <div className="ControlKnob">
      <div className="label">{label}</div>
      <div
        className="knob"
        style={{ transform: "rotate(" + rotation + "deg)" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        <div className="pointer"></div>
      </div>
      <div className="value">{format ? format(value) : value}</div>
    </div>
  )
}
