import { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const SPEEDS = [0.5, 1, 1.25, 1.5, 2]

export default function VideoPlayer({ src, poster, className = '' }) {
  const wrapRef  = useRef(null)
  const videoRef = useRef(null)
  const [playing, setPlaying]   = useState(false)
  const [muted, setMuted]       = useState(false)
  const [volume, setVolume]     = useState(1)
  const [cur, setCur]           = useState(0)
  const [dur, setDur]           = useState(0)
  const [rate, setRate]         = useState(1)
  const [fs, setFs]             = useState(false)

  // Reset when the source changes
  useEffect(() => { setPlaying(false); setCur(0); setDur(0) }, [src])

  const skip = useCallback((delta) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration || 0)
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play(); else v.pause()
  }, [])

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const onVolume = (e) => {
    const val = parseFloat(e.target.value)
    const v = videoRef.current
    if (v) { v.volume = val; v.muted = val === 0 }
    setVolume(val); setMuted(val === 0)
  }

  const onSeek = (e) => {
    const val = parseFloat(e.target.value)
    const v = videoRef.current
    if (v) v.currentTime = val
    setCur(val)
  }

  const cycleRate = () => {
    const next = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length]
    if (videoRef.current) videoRef.current.playbackRate = next
    setRate(next)
  }

  const toggleFs = () => {
    const el = wrapRef.current
    if (!document.fullscreenElement) el?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  useEffect(() => {
    const onFsChange = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Keyboard shortcuts when the player is focused/hovered
  const onKeyDown = (e) => {
    switch (e.key) {
      case ' ': case 'k': e.preventDefault(); togglePlay(); break
      case 'ArrowLeft':  e.preventDefault(); skip(-10); break
      case 'ArrowRight': e.preventDefault(); skip(10); break
      case 'm': toggleMute(); break
      case 'f': toggleFs(); break
      default: break
    }
  }

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`group relative bg-black rounded-xl overflow-hidden outline-none select-none ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain bg-black"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCur(e.target.currentTime)}
        onLoadedMetadata={(e) => { setDur(e.target.duration); setVolume(e.target.volume) }}
      />

      {/* Center play overlay when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          aria-label="Play"
        >
          <span className="w-16 h-16 rounded-full bg-a-500/90 flex items-center justify-center shadow-lg">
            <Play className="w-7 h-7 text-white ml-1" />
          </span>
        </button>
      )}

      {/* Control bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-2.5 pt-8 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {/* Seek bar */}
        <input
          type="range" min={0} max={dur || 0} step="0.1" value={cur}
          onChange={onSeek}
          className="w-full h-1 accent-a-500 cursor-pointer mb-2"
          aria-label="Seek"
        />
        <div className="flex items-center gap-2 text-white">
          <button onClick={togglePlay} className="hover:text-a-400 transition-colors" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button onClick={() => skip(-10)} className="hover:text-a-400 transition-colors relative" aria-label="Rewind 10 seconds" title="Rewind 10s">
            <RotateCcw className="w-5 h-5" />
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold pointer-events-none">10</span>
          </button>
          <button onClick={() => skip(10)} className="hover:text-a-400 transition-colors relative" aria-label="Forward 10 seconds" title="Forward 10s">
            <RotateCw className="w-5 h-5" />
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold pointer-events-none">10</span>
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5 group/vol">
            <button onClick={toggleMute} className="hover:text-a-400 transition-colors" aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range" min={0} max={1} step="0.05" value={muted ? 0 : volume}
              onChange={onVolume}
              className="w-0 group-hover/vol:w-16 focus:w-16 transition-all h-1 accent-a-500 cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <span className="text-xs font-mono tabular-nums text-g-sub">{fmt(cur)} / {fmt(dur)}</span>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={cycleRate} className="text-xs font-mono px-1.5 py-0.5 rounded hover:text-a-400 transition-colors" title="Playback speed">
              {rate}×
            </button>
            <button onClick={toggleFs} className="hover:text-a-400 transition-colors" aria-label="Fullscreen">
              {fs ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
