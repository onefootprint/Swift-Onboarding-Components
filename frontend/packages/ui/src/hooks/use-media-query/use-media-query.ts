import json2mq from 'json2mq';
import useMedia from 'react-use/lib/useMedia';
import { useTheme } from 'styled-components';
import type { Breakpoint } from 'themes';

const useMediaQuery = (
  query: {
    minWidth?: Breakpoint;
    maxWidth?: Breakpoint;
  },
  defaultValue = false,
) => {
  const theme = useTheme();
  return useMedia(
    json2mq({
      minWidth: query.minWidth ? theme.breakpoint[query.minWidth] : false,
      maxWidth: query.maxWidth ? theme.breakpoint[query.maxWidth] : false,
    }),
    defaultValue,
  );
};

export default useMediaQuery;
