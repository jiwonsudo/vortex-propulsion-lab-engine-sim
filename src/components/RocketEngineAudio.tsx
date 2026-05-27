import { useEffect, useRef } from 'react'
import { useSimulatorStore } from '../store/simulatorStore'

function createNoiseBuffer(audioContext: AudioContext, seconds: number) {
  const bufferSize = Math.floor(audioContext.sampleRate * seconds)
  const noiseBuffer = audioContext.createBuffer(
    1,
    bufferSize,
    audioContext.sampleRate,
  )
  const output = noiseBuffer.getChannelData(0)
  let previousSample = 0

  for (let index = 0; index < bufferSize; index += 1) {
    const white = Math.random() * 2 - 1
    previousSample = previousSample * 0.82 + white * 0.18
    output[index] = white * 0.72 + previousSample * 0.28
  }

  return noiseBuffer
}

function stopAudioNode(node: AudioScheduledSourceNode | null) {
  try {
    node?.stop()
  } catch {
    // Already stopped.
  }
}

export function RocketEngineAudio() {
  const engineRunning = useSimulatorStore((state) => state.engineRunning)
  const soundEnabled = useSimulatorStore((state) => state.soundEnabled)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourcesRef = useRef<AudioScheduledSourceNode[]>([])
  const masterGainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const stopCurrentSound = () => {
      const audioContext = audioContextRef.current
      masterGainRef.current?.gain.setTargetAtTime(
        0,
        audioContext?.currentTime ?? 0,
        0.06,
      )

      window.setTimeout(() => {
        sourcesRef.current.forEach((source) => {
          stopAudioNode(source)
        })
        sourcesRef.current = []
      }, 220)
    }

    if (!soundEnabled || !engineRunning) {
      stopCurrentSound()
      return
    }

    const AudioContextConstructor = window.AudioContext
    const audioContext =
      audioContextRef.current ?? new AudioContextConstructor()
    audioContextRef.current = audioContext
    void audioContext.resume()

    stopCurrentSound()

    const noiseBuffer = createNoiseBuffer(audioContext, 2.5)
    const mainRoar = audioContext.createBufferSource()
    const highHiss = audioContext.createBufferSource()
    const crackle = audioContext.createBufferSource()
    const subRumble = audioContext.createOscillator()
    const ignitionBurst = audioContext.createBufferSource()

    const mainBand = audioContext.createBiquadFilter()
    const mainGain = audioContext.createGain()
    const hissFilter = audioContext.createBiquadFilter()
    const hissGain = audioContext.createGain()
    const crackleFilter = audioContext.createBiquadFilter()
    const crackleGain = audioContext.createGain()
    const rumbleFilter = audioContext.createBiquadFilter()
    const rumbleGain = audioContext.createGain()
    const burstFilter = audioContext.createBiquadFilter()
    const burstGain = audioContext.createGain()
    const compressor = audioContext.createDynamicsCompressor()
    const masterGain = audioContext.createGain()

    mainRoar.buffer = noiseBuffer
    highHiss.buffer = noiseBuffer
    crackle.buffer = noiseBuffer
    ignitionBurst.buffer = createNoiseBuffer(audioContext, 0.32)
    mainRoar.loop = true
    highHiss.loop = true
    crackle.loop = true

    mainBand.type = 'bandpass'
    mainBand.frequency.value = 760
    mainBand.Q.value = 0.55
    mainGain.gain.value = 0.0

    hissFilter.type = 'highpass'
    hissFilter.frequency.value = 1_400
    hissFilter.Q.value = 0.55
    hissGain.gain.value = 0.0

    crackleFilter.type = 'bandpass'
    crackleFilter.frequency.value = 2_900
    crackleFilter.Q.value = 1.35
    crackleGain.gain.value = 0.0

    subRumble.type = 'triangle'
    subRumble.frequency.value = 72
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.value = 155
    rumbleFilter.Q.value = 0.65
    rumbleGain.gain.value = 0.0

    burstFilter.type = 'bandpass'
    burstFilter.frequency.value = 1_100
    burstFilter.Q.value = 0.8
    burstGain.gain.value = 0.0

    compressor.threshold.value = -18
    compressor.knee.value = 22
    compressor.ratio.value = 5
    compressor.attack.value = 0.004
    compressor.release.value = 0.18
    masterGain.gain.value = 0.0

    mainRoar.connect(mainBand)
    mainBand.connect(mainGain)
    mainGain.connect(compressor)

    highHiss.connect(hissFilter)
    hissFilter.connect(hissGain)
    hissGain.connect(compressor)

    crackle.connect(crackleFilter)
    crackleFilter.connect(crackleGain)
    crackleGain.connect(compressor)

    subRumble.connect(rumbleFilter)
    rumbleFilter.connect(rumbleGain)
    rumbleGain.connect(compressor)

    ignitionBurst.connect(burstFilter)
    burstFilter.connect(burstGain)
    burstGain.connect(compressor)

    compressor.connect(masterGain)
    masterGain.connect(audioContext.destination)

    const now = audioContext.currentTime
    mainRoar.start(now)
    highHiss.start(now)
    crackle.start(now)
    subRumble.start(now)
    ignitionBurst.start(now)

    mainGain.gain.setTargetAtTime(0.34, now, 0.24)
    hissGain.gain.setTargetAtTime(0.16, now, 0.18)
    crackleGain.gain.setTargetAtTime(0.055, now, 0.12)
    rumbleGain.gain.setTargetAtTime(0.045, now, 0.34)
    burstGain.gain.setValueAtTime(0.42, now)
    burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
    masterGain.gain.setTargetAtTime(0.72, now, 0.2)

    sourcesRef.current = [mainRoar, highHiss, crackle, subRumble, ignitionBurst]
    masterGainRef.current = masterGain

    return () => {
      masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.06)
      window.setTimeout(() => {
        sourcesRef.current.forEach((source) => {
          stopAudioNode(source)
        })
        sourcesRef.current = []
      }, 220)
    }
  }, [engineRunning, soundEnabled])

  return null
}
