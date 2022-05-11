import json2mq from 'json2mq';
import useMedia from 'react-use/lib/useMedia';
import { Breakpoint, useTheme } from 'styled';

const useMediaQuery = (query: {
  minWidth?: Breakpoint;
  maxWidth?: Breakpoint;
}) => {
  const theme = useTheme();
  return useMedia(
    json2mq({
      minWidth: query.minWidth ? theme.breakpoint[query.minWidth] : false,
      maxWidth: query.maxWidth ? theme.breakpoint[query.maxWidth] : false,
    }),
  );
};

export default useMediaQuery;
