import { ServerStyleSheet, StyleSheetManager } from '@onefootprint/styled';
import { useServerInsertedHTML } from 'next/navigation';
import React, { useState } from 'react';

const StyledComponentsRegistry = ({ children }: React.PropsWithChildren) => {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    // @ts-ignore remove once we update to styled-components v6
    styledComponentsStyleSheet.instance.clearTag();
    // eslint-disable-next-line
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
};

export default StyledComponentsRegistry;
