import json2mq from 'json2mq';
import useMedia from 'react-use/lib/useMedia';
import { useTheme } from 'styled-components';
import type { Breakpoint } from 'themes';

const FALLBACK_BREAKPOINT = 'xs';

const useBreakpoints = (): Breakpoint => {
  const theme = useTheme();
  const { breakpoint } = theme;
  const xs = useMedia(
    json2mq({
      minWidth: 0,
      maxWidth: breakpoint.sm - 1,
    }),
  );
  const sm = useMedia(
    json2mq({
      minWidth: breakpoint.sm,
      maxWidth: breakpoint.md - 1,
    }),
  );
  const md = useMedia(
    json2mq({
      minWidth: breakpoint.md,
      maxWidth: breakpoint.lg - 1,
    }),
  );
  const lg = useMedia(
    json2mq({
      minWidth: breakpoint.lg,
      maxWidth: breakpoint.xl - 1,
    }),
  );
  const xl = useMedia(
    json2mq({
      minWidth: breakpoint.xl,
    }),
  );

  const breakpointsResults: { value: boolean; key: Breakpoint }[] = [
    { value: xs, key: 'xs' },
    { value: sm, key: 'sm' },
    { value: md, key: 'md' },
    { value: lg, key: 'lg' },
    { value: xl, key: 'xl' },
  ];

  const possibleBreakpoint = breakpointsResults.find(
    breakpointsResult => breakpointsResult.value,
  );
  return possibleBreakpoint ? possibleBreakpoint.key : FALLBACK_BREAKPOINT;
};

export default useBreakpoints;
