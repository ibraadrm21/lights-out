import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/**
 * ReactBits: SpotlightCard
 * Creates a cursor-following ambient highlight with luxury dark border glow
 */
export function SpotlightCard({ children, className = '', spotlightColor = 'rgba(225, 6, 0, 0.22)', ...props }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Hook called unconditionally at top level adhering to React rules of hooks
  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(circle 350px at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`
  );

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`spotlight-card ${className}`}
      {...props}
    >
      {/* Interactive cursor gradient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * ReactBits: DecryptedText
 * Scrambles and decrypts characters in real time for authentic racing telemetry feel
 */
export function DecryptedText({ text, speed = 40, maxIterations = 8, className = '' }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@*';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / maxIterations;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, maxIterations]);

  return <span className={className}>{displayText}</span>;
}

/**
 * ReactBits & Motion.dev: MagneticButton
 * Interactive button with spring attraction to cursor
 */
export function MagneticButton({ children, onClick, className = '', ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2);
    y.set(middleY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Bklit.com & F1: SpeedCounter
 * Counts numbers up with easing
 */
export function AnimatedNumber({ value, duration = 1 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) {
      setCurrent(end);
      return;
    }
    const range = end - start;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCurrent(Math.floor(progress * range + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{current.toLocaleString()}</span>;
}
