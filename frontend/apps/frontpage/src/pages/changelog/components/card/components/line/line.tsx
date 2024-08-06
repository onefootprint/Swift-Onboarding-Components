import { useTheme } from 'styled-components';

const Line = () => {
  const theme = useTheme();

  return (
    <svg height="100%" width="1px">
      <line x1="0" y1="0" x2="0" y2="100%" stroke={theme.borderColor.tertiary} strokeWidth="1" />
    </svg>
  );
};

export default Line;
