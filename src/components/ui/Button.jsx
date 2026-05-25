import { motion } from 'framer-motion';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  disabled,
  className = '',
  ...props
}) {
  return (
    <motion.button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
      {variant === 'primary' && <span className="btn-glow" />}
    </motion.button>
  );
}
