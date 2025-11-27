import React, { useState, useRef, useEffect } from 'react';
import { 
  CloseOutlined, 
  CarFilled, 
  DollarCircleFilled, 
  SmileFilled, 
  TagsFilled 
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import '../style/LuckyWheel.css';

// Simple Confetti Component
const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffa500'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fireworks-canvas" />;
};

const prizes = [
  { id: 1, text: "Freeship 0đ", color: "#FF6B6B", probability: 0.1, icon: <CarFilled style={{ color: '#FFD700' }} />, type: 'coupon', value: 'Freeship' },
  { id: 2, text: "Giảm 20%", color: "#4ECDC4", probability: 0.05, icon: <TagsFilled style={{ color: '#33ffffff' }} />, type: 'coupon', value: '20%' },
  { id: 3, text: "+ 300 xu", color: "#FFE66D", probability: 0.2, icon: <DollarCircleFilled style={{ color: '#FFEB3B' }} />, type: 'coin', value: 300 },
  { id: 4, text: "+ 1000 xu", color: "#FF9F43", probability: 0.05, icon: <DollarCircleFilled style={{ color: '#FFEB3B' }} />, type: 'coin', value: 1000 },
  { id: 5, text: "Chúc may mắn", color: "#A8D8EA", probability: 0.3, icon: <SmileFilled style={{ color: '#FF9800' }} />, type: 'luck', value: 0 },
  { id: 6, text: "+ 100 xu", color: "#AA96DA", probability: 0.15, icon: <DollarCircleFilled style={{ color: '#FFEB3B' }} />, type: 'coin', value: 100 },
  { id: 7, text: "Giảm 5%", color: "#FCBAD3", probability: 0.1, icon: <TagsFilled style={{ color: '#33ffffff' }} />, type: 'coupon', value: '5%' },
  { id: 8, text: "+ 500 xu", color: "#FFFFD2", probability: 0.05, icon: <DollarCircleFilled style={{ color: '#FFEB3B' }} />, type: 'coin', value: 500 },
];

const LuckyWheel = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [wrapperStyle, setWrapperStyle] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const wheelRef = useRef(null);
  const wrapperRef = useRef(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset when opening
      setResult(null);
      setRotation(0);
      setWrapperStyle({});
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;

    // 1. Capture current wrapper rotation from CSS animation
    let currentWrapperAngle = 0;
    if (wrapperRef.current) {
      const style = window.getComputedStyle(wrapperRef.current);
      const matrix = new DOMMatrix(style.transform);
      // Calculate angle from matrix (a, b)
      // angle = atan2(b, a)
      currentWrapperAngle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    }

    // 2. Fix the wrapper at this angle to stop animation smoothly
    setWrapperStyle({
      transform: `rotate(${currentWrapperAngle}deg)`,
      animation: 'none'
    });

    setIsSpinning(true);
    setResult(null);

    // Logic to determine prize based on probability
    const random = Math.random();
    let accumulatedProbability = 0;
    let selectedPrizeIndex = 0;

    for (let i = 0; i < prizes.length; i++) {
      accumulatedProbability += prizes[i].probability;
      if (random <= accumulatedProbability) {
        selectedPrizeIndex = i;
        break;
      }
    }

    // Calculate rotation
    const segmentAngle = 360 / prizes.length;
    const randomOffset = Math.floor(Math.random() * (segmentAngle - 10)) - (segmentAngle / 2 - 5); 
    
    // Target angle relative to the viewport (0deg is top)
    const centerAngle = selectedPrizeIndex * segmentAngle + segmentAngle / 2;
    const targetAngleGlobal = 360 - centerAngle + randomOffset;
    
    // We want: (currentWrapperAngle + finalInnerRotation) % 360 = targetAngleGlobal
    // finalInnerRotation = targetAngleGlobal - currentWrapperAngle + k * 360
    
    const currentInnerRotation = rotation;
    const minSpins = 5 * 360;
    
    let targetInner = targetAngleGlobal - currentWrapperAngle;
    
    // Ensure targetInner is greater than currentInnerRotation + minSpins
    // We add 360 until it is.
    // First, normalize targetInner to be close to currentInnerRotation
    // Actually, just keep adding 360.
    
    // Start from a base that is definitely larger
    while (targetInner < currentInnerRotation + minSpins) {
      targetInner += 360;
    }

    setRotation(targetInner);

    setTimeout(() => {
      setIsSpinning(false);
      const wonPrize = prizes[selectedPrizeIndex];
      setResult(wonPrize);

      // Save to localStorage
      try {
        if (wonPrize.type !== 'luck') {
            const storageKey = currentUser ? `lucky_wheel_rewards_${currentUser.id || currentUser.email}` : 'lucky_wheel_rewards_guest';
            const savedRewards = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const newReward = {
              id: wonPrize.id,
              label: wonPrize.text, // Map text to label
              type: wonPrize.type,
              value: wonPrize.value,
              color: wonPrize.color,
              date: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify([newReward, ...savedRewards]));
        }
      } catch (error) {
        console.error("Failed to save lucky wheel reward", error);
      }
    }, 5000); // Match CSS transition time
  };

  // Generate conic gradient
  const gradientParts = prizes.map((prize, index) => {
    const start = (index * 100) / prizes.length;
    const end = ((index + 1) * 100) / prizes.length;
    return `${prize.color} ${start}% ${end}%`;
  });
  const backgroundStyle = {
    background: `conic-gradient(${gradientParts.join(', ')})`
  };

  return (
    <>
      {/* Bubble Button */}
      <div className="lucky-wheel-bubble" onClick={toggleOpen} title="Vòng quay may mắn">
        {/* Icon is now handled by CSS pseudo-elements to look like a wheel */}
      </div>

      {/* Overlay & Wheel */}
      <div className={`lucky-wheel-overlay ${isOpen ? 'open' : ''}`}>
        <div className="lucky-wheel-container">
          <button className="close-wheel-btn" onClick={toggleOpen}>
            <CloseOutlined />
          </button>

          <div className="wheel-pointer"></div>
          
          <div 
            className={`wheel-wrapper ${!isSpinning && !result ? 'idle-spin' : ''}`} 
            ref={wrapperRef} 
            style={wrapperStyle}
          >
            <div 
              className="the-wheel" 
              ref={wheelRef}
              style={{ 
                ...backgroundStyle,
                transform: `rotate(${rotation}deg)`
              }}
            >
              {prizes.map((prize, index) => (
                <div 
                  key={prize.id} 
                  className="wheel-segment"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ 
                    transform: `rotate(${index * (360 / prizes.length)}deg) skewY(-${90 - (360 / prizes.length)}deg)` 
                  }}
                >
                </div>
              ))}
              
              {/* Text Layer */}
              {prizes.map((prize, index) => {
                 const angle = index * (360 / prizes.length) + (360 / prizes.length) / 2;
                 const isHovered = hoveredIndex === index;
                 return (
                   <div
                      key={`text-${prize.id}`}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${isHovered ? '-135px' : '-130px'}) scale(${isHovered ? 1.1 : 1})`,
                        textAlign: 'center',
                        width: '100px',
                        color: '#fff',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        fontSize: '14px',
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s ease'
                      }}
                   >
                     <div style={{ fontSize: '24px', marginBottom: '2px', filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))' }}>
                       {prize.icon}
                     </div>
                     {prize.text}
                   </div>
                 );
              })}
            </div>
          </div>

          <button 
            className="spin-button" 
            onClick={spinWheel} 
            disabled={isSpinning}
          >
            {isSpinning ? '...' : 'QUAY'}
          </button>

          {result && !isSpinning && (
            <>
              <Confetti />
              <div className="result-popup">
                <h3>Chúc mừng!</h3>
                <div className="result-icon">
                  {result.icon}
                </div>
                <p>Bạn đã nhận được:</p>
                <div className="result-text">
                  {result.text}
                </div>
                <button onClick={() => setResult(null)}>Quay tiếp</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LuckyWheel;
