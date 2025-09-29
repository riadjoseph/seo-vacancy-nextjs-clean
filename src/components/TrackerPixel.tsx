'use client'

interface TrackerPixelProps {
  trackerUrl?: string
}

const defaultTrackerUrl = 'https://wiki.booksparis.com/gpt/tracker.php'

export default function TrackerPixel({ trackerUrl = defaultTrackerUrl }: TrackerPixelProps) {
  return (
    <img
      alt=""
      aria-hidden="true"
      loading="lazy"
      width="1"
      height="1"
      decoding="async"
      data-nimg="1"
      src={trackerUrl}
      style={{
        color: 'transparent',
        position: 'absolute',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        left: '-9999px',
        top: '-9999px'
      }}
    />
  )
}