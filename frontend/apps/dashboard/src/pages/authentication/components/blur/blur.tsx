import { useTheme } from 'styled-components';

type BlurProps = {
  className?: string;
};
const Blur = ({ className }: BlurProps) => {
  const theme = useTheme();
  const isLightMode = theme.backgroundColor.primary === '#ffffff';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="932"
      height="718"
      viewBox="0 0 932 718"
      fill="none"
      className={className}
    >
      <path
        d="M293.732 425.631C227.722 357.689 169.847 280.222 217.461 199.359C269.355 111.23 380.105 162.27 485.529 166.728C552.224 169.548 600.596 153.721 654.52 191.47C728.21 243.056 752.005 328.364 714.34 408.06C682.575 475.274 625.23 497.324 549.836 512.051C445.944 532.345 366.012 500.027 293.732 425.631Z"
        fill={isLightMode ? '#4B26DA' : '#E9E9E9'}
      />
    </svg>
  );
};

export default Blur;
