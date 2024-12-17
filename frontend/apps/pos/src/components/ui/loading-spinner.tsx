import { cx } from 'class-variance-authority';

type LoadingSpinnerProps = {
  className?: string;
};

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <div
      className={cx('w-7 h-7 rounded-full', className)}
      style={{
        animation: 'spin 1s linear infinite',
        border: '4px solid #e5e7eb',
        borderTopColor: '#bf140a',
      }}
    />
  );
};

// Add keyframes for IE11
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default LoadingSpinner;
