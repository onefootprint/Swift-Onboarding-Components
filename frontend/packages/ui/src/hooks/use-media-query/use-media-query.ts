import type { Breakpoint } from '@onefootprint/design-tokens';
import json2mq from 'json2mq';
import { useTheme } from 'styled-components';
import { useMediaQuery as useMediaQueryTs } from 'usehooks-ts';

/** @deprecated: import from 'usehooks-ts'  */
const useMediaQuery = (query: {
  minWidth?: Breakpoint;
  maxWidth?: Breakpoint;
}) => {
  const theme = useTheme();
  return useMediaQueryTs(
    json2mq({
      minWidth: query.minWidth ? theme.breakpoint[query.minWidth] : false,
      maxWidth: query.maxWidth ? theme.breakpoint[query.maxWidth] : false,
    }),
  );
};

export default useMediaQuery;
