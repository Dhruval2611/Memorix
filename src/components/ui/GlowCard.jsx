import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './GlowCard.css';

export default function GlowCard({
  children,
  className = '',
  glowColor = 'purple',
  hover = true,
  onClick,
  ...props
}) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const gradientX = useTransform(springX, [0, 1], ['0%', '100%']);
  const gradientY = useTransform(springY, [0, 1], ['0%', '100%']);

  function handleMouseMove(e) {
    if (!ref.current || !hover) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className={`glow-card glow-${glowColor} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={hover ? { y: -6, transition: { duration: 0.3 } } : {}}
      style={{
        '--glow-x': gradientX,
        '--glow-y': gradientY,
      }}
      {...props}
    >
      <div className="glow-card-border" />
      <div className="glow-card-content">
        {children}
      </div>
    </motion.div>
  );
}
