import { cx } from 'class-variance-authority';
import { motion } from 'framer-motion';

type CardContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const CardContainer = ({ children, className }: CardContainerProps) => {
  const defaultClassName =
    'flex flex-col w-full gap-3 px-5 py-5 border border-solid rounded border-tertiary bg-primary relative';

  return <motion.div className={cx(defaultClassName, className)}>{children}</motion.div>;
};

export default CardContainer;
