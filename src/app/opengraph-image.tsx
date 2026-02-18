import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AppForge - AI Mobile App Builder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)',
            opacity: 0.3,
          }}
        />
        
        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10,
            padding: '80px',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              fontSize: '48px',
            }}
          >
            🚀
          </div>

          {/* Main title */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              marginBottom: '20px',
              lineHeight: 1.1,
            }}
          >
            AppForge
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '32px',
              color: '#e5e7eb',
              margin: 0,
              marginBottom: '20px',
              fontWeight: 500,
            }}
          >
            AI Mobile App Builder
          </p>

          {/* Tagline */}
          <p
            style={{
              fontSize: '24px',
              color: '#9ca3af',
              margin: 0,
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Build stunning mobile apps with AI. Describe → Build → Download.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '40px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['No Code', 'AI Powered', '2 Minutes'].map((feature, index) => (
              <div
                key={feature}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  color: '#60a5fa',
                  fontSize: '18px',
                  fontWeight: 500,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, #ec4899, #f59e0b)',
            borderRadius: '50%',
            opacity: 0.6,
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #10b981, #3b82f6)',
            borderRadius: '50%',
            opacity: 0.6,
            filter: 'blur(30px)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}