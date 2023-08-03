import footprint, {
  FootprintComponentKind,
  FootprintRenderProps,
} from '@onefootprint/footprint-js';
import React, { useEffect } from 'react';

import useStableContainerId from '../../hooks/use-stable-container-id';

export type FootprintFootprintRenderProps = Omit<
  FootprintRenderProps,
  'kind' | 'variant'
>;

const FootprintRender = (props: FootprintFootprintRenderProps) => {
  const containerId = useStableContainerId();

  useEffect(() => {
    if (!containerId) {
      return () => {};
    }

    const component = footprint.init({
      kind: FootprintComponentKind.Render,
      variant: {
        containerId,
      },
      ...props,
    });
    component.render();

    return () => {
      component.destroy();
    };
  }, [props, containerId]);

  return containerId ? <div id={containerId} /> : null;
};

export default FootprintRender;
