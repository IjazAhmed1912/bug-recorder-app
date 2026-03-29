let events: Array<{
  type: string
  x: number
  y: number
  time: number
}> = []

export const startRecording = () => {
  events = []

  window.addEventListener("click", (e) => {
    events.push({
      type: "click",
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    })
  })
}

export const stopRecording = () => {
  return events
}
