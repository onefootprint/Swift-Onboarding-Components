import { cx } from 'class-variance-authority';

type LoadingSpinnerProps = {
  className?: string;
};

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <div className={cx('w-7 h-7 border-4 border-gray-200 border-t-[#bf140a] rounded-full animate-spin', className)} />
  );
};

export default LoadingSpinner;
