import type { CSSObjectWithLabel, OptionProps } from 'react-select';
import { useTheme } from 'styled-components';

const useStyles = () => {
  const theme = useTheme();
  const customStyles: Record<
    string,
    (
      provided: CSSObjectWithLabel,
      state: OptionProps<string | number, false, any>,
    ) => any
  > = {
    control: () => ({
      display: 'flex',
      alignItems: 'center',
      borderBottom: `${theme.borderWidth[1]}px solid ${theme.borderColor.primary}`,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      outline: 0,
      position: 'relative',
      transition: 'all 100ms',
      borderRadius: `${theme.borderRadius.default}px ${theme.borderRadius.default}px 0 0`,
      background: '#fff',
      height: 40,
      '&:hover': {
        borderColor: theme.borderColor.primary,
      },
    }),
    menu: () => ({}),
  };
  return customStyles;
};

export default useStyles;
