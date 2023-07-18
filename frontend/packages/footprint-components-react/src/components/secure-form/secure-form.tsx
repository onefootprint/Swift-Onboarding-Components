import footprintComponent, {
  FootprintComponentKind,
  SecureFormProps,
} from '@onefootprint/footprint-components-js';
import React, { useEffect } from 'react';

import useStableContainerId from '../../hooks/use-stable-container-id';

const SecureForm = (props: SecureFormProps) => {
  const containerId = useStableContainerId(FootprintComponentKind.SecureForm);

  useEffect(() => {
    if (!containerId) {
      return () => {};
    }

    footprintComponent.render({
      kind: FootprintComponentKind.SecureForm,
      props,
      containerId,
    });

    return () => {
      footprintComponent.destroy();
    };
  }, [containerId, props]);

  return containerId ? <div id={containerId} /> : null;
};

export default SecureForm;
