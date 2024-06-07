import type { FootprintRenderProps } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import React, { useEffect } from 'react';

import useStableContainerId from '../../hooks/use-stable-container-id';

export type FootprintFootprintRenderProps = Omit<FootprintRenderProps, 'kind' | 'variant' | 'containerId'>;

const FootprintRender = (props: FootprintFootprintRenderProps) => {
  const containerId = useStableContainerId();

  useEffect(() => {
    if (!containerId) {
      return () => undefined;
    }

    const component = footprint.init({
      kind: FootprintComponentKind.Render,
      variant: 'inline',
      ...props,
      containerId,
    });
    component.render();

    return () => {
      component.destroy();
    };
  }, [props, containerId]);

  return containerId ? <div id={containerId} /> : null;
};

export default FootprintRender;
