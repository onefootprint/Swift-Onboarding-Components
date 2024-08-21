import { useServerInsertedHTML } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

const StyledComponentsRegistry = ({ children }: React.PropsWithChildren) => {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    // eslint-disable-next-line
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line
    return <>{children}</>;
  }

  return <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>{children}</StyleSheetManager>;
};

export default StyledComponentsRegistry;
