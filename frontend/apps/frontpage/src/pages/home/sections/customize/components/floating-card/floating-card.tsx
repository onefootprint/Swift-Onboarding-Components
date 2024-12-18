import { cx } from 'class-variance-authority';
import { motion } from 'framer-motion';

type FloatingCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

const FloatingCard = ({ children, className, delay = 0 }: FloatingCardProps) => (
  <motion.div
    className={cx(
      'flex flex-col z-2 gap-2 w-64 rounded shadow-lg p-3 bg-primary absolute border border-tertiary border-solid',
      className,
    )}
    initial={{
      x: 0,
      y: 0,
      rotate: 0,
    }}
    animate={{
      x: ['0%', '4%', '-2%', '2%', '0%'],
      y: ['0%', '4%', '-5%', '5%', '0%'],
      rotate: [0, 3, -3, 2, -2, 0],
    }}
    transition={{
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'loop',
      duration: 25,
      ease: 'easeInOut',
      delay,
    }}
  >
    {children}
  </motion.div>
);

export default FloatingCard;
