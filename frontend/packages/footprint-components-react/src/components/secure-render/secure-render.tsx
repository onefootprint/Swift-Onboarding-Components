import footprintComponent, {
  FootprintComponentKind,
  SecureRenderProps,
} from '@onefootprint/footprint-components-js';
import React, { useEffect } from 'react';

import useStableContainerId from '../../hooks/use-stable-container-id';

const SecureRender = (props: SecureRenderProps) => {
  const containerId = useStableContainerId(FootprintComponentKind.SecureRender);

  useEffect(() => {
    if (!containerId) {
      return () => {};
    }

    footprintComponent.render({
      kind: FootprintComponentKind.SecureRender,
      props,
      containerId,
    });

    return () => {
      footprintComponent.destroy();
    };
  }, [containerId, props]);

  return containerId ? <div id={containerId} /> : null;
};

export default SecureRender;
