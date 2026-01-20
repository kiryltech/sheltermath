import { ImageResponse } from 'next/og'

// Image metadata
export function generateImageMetadata() {
  return [
    {
      contentType: 'image/png',
      size: { width: 48, height: 48 },
      id: 'small',
    },
    {
      contentType: 'image/png',
      size: { width: 192, height: 192 },
      id: 'medium',
    },
  ]
}

// Image generation
export default function Icon({ id }: { id: string }) {
  const isSmall = id === 'small'
  const size = isSmall ? { width: 48, height: 48 } : { width: 192, height: 192 }

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#18181b',
          borderRadius: '25%',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M256 112L448 256V400H256V112Z" fill="#22d3ee"/>
          <path d="M256 112L64 256V400H256V112Z" fill="#f97316"/>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
