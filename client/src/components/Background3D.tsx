import { useEffect, useState, useRef } from 'react';

export default function Background3D() {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // حساب الإزاحة لكل موجة بسرعات مختلفة
  const wave1Offset = scrollY * 0.3;
  const wave2Offset = scrollY * 0.5;
  const wave3Offset = scrollY * 0.2;
  const circle1Offset = scrollY * 0.15;
  const circle2Offset = scrollY * 0.25;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* الخلفية الأساسية */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 35%, #fefce8 70%, #fff7ed 100%)'
        }}
      />
      
      {/* الموجة العلوية - سرعة بطيئة */}
      <svg 
        className="absolute left-0 w-full transition-transform duration-100 ease-out"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ 
          height: '200px',
          top: `${-wave1Offset * 0.5}px`,
          transform: `translateY(${wave1Offset * 0.3}px)`
        }}
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary, #0891b2)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#fdba74" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path 
          fill="url(#waveGradient1)"
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        >
          <animate 
            attributeName="d" 
            dur="15s" 
            repeatCount="indefinite"
            values="
              M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;
              M0,128L48,117.3C96,107,192,85,288,90.7C384,96,480,128,576,138.7C672,149,768,139,864,122.7C960,107,1056,85,1152,90.7C1248,96,1344,128,1392,144L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;
              M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z
            "
          />
        </path>
      </svg>

      {/* موجة وسطى خفيفة - سرعة متوسطة */}
      <svg 
        className="absolute left-0 w-full opacity-50 transition-transform duration-100 ease-out"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ 
          height: '150px',
          top: `${80 - wave2Offset * 0.3}px`,
          transform: `translateY(${wave2Offset * 0.5}px)`
        }}
      >
        <defs>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#16a34a" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path 
          fill="url(#waveGradient2)"
          d="M0,160L60,149.3C120,139,240,117,360,128C480,139,600,181,720,186.7C840,192,960,160,1080,144C1200,128,1320,128,1380,128L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        >
          <animate 
            attributeName="d" 
            dur="20s" 
            repeatCount="indefinite"
            values="
              M0,160L60,149.3C120,139,240,117,360,128C480,139,600,181,720,186.7C840,192,960,160,1080,144C1200,128,1320,128,1380,128L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z;
              M0,128L60,138.7C120,149,240,171,360,165.3C480,160,600,128,720,117.3C840,107,960,117,1080,133.3C1200,149,1320,171,1380,181.3L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z;
              M0,160L60,149.3C120,139,240,117,360,128C480,139,600,181,720,186.7C840,192,960,160,1080,144C1200,128,1320,128,1380,128L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z
            "
          />
        </path>
      </svg>

      {/* دوائر زخرفية خفيفة مع parallax */}
      <div 
        className="absolute w-96 h-96 rounded-full opacity-[0.03] transition-transform duration-200 ease-out"
        style={{ 
          background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)',
          top: `${25 - circle1Offset * 0.1}%`,
          right: '25%',
          transform: `translateY(${circle1Offset}px) scale(${1 + scrollY * 0.0002})`
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full opacity-[0.03] transition-transform duration-200 ease-out"
        style={{ 
          background: 'radial-gradient(circle, var(--primary, #0891b2) 0%, transparent 70%)',
          bottom: `${25 + circle2Offset * 0.05}%`,
          left: '25%',
          transform: `translateY(${-circle2Offset}px) scale(${1 + scrollY * 0.0001})`
        }}
      />

      {/* الموجة السفلية - سرعة بطيئة جداً */}
      <svg 
        className="absolute left-0 w-full transition-transform duration-100 ease-out"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ 
          height: '180px',
          bottom: `${-wave3Offset * 0.2}px`,
          transform: `translateY(${-wave3Offset * 0.2}px)`
        }}
      >
        <defs>
          <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path 
          fill="url(#waveGradient3)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animate 
            attributeName="d" 
            dur="18s" 
            repeatCount="indefinite"
            values="
              M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,181.3C672,171,768,181,864,197.3C960,213,1056,235,1152,240C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
            "
          />
        </path>
      </svg>

      {/* موجة إضافية في المنتصف - سرعة سريعة */}
      <svg 
        className="absolute left-0 w-full opacity-30 transition-transform duration-100 ease-out"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ 
          height: '120px',
          top: `${40 + wave2Offset * 0.1}%`,
          transform: `translateY(${wave2Offset * 0.7}px)`
        }}
      >
        <defs>
          <linearGradient id="waveGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path 
          fill="url(#waveGradient4)"
          d="M0,64L80,85.3C160,107,320,149,480,154.7C640,160,800,128,960,117.3C1120,107,1280,117,1360,122.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        >
          <animate 
            attributeName="d" 
            dur="12s" 
            repeatCount="indefinite"
            values="
              M0,64L80,85.3C160,107,320,149,480,154.7C640,160,800,128,960,117.3C1120,107,1280,117,1360,122.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z;
              M0,96L80,106.7C160,117,320,139,480,133.3C640,128,800,96,960,90.7C1120,85,1280,107,1360,117.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z;
              M0,64L80,85.3C160,107,320,149,480,154.7C640,160,800,128,960,117.3C1120,107,1280,117,1360,122.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z
            "
          />
        </path>
      </svg>
    </div>
  );
}
