import footprint, {
  FootprintComponentKind,
  FootprintFormProps,
} from '@onefootprint/footprint-js';
import React, { useEffect } from 'react';

import useStableContainerId from '../../hooks/use-stable-container-id';

export type FootprintFootprintFormProps = Omit<
  FootprintFormProps,
  'kind' | 'variant'
> & {
  variant: 'modal' | 'drawer' | 'inline';
};

const FootprintForm = (props: FootprintFootprintFormProps) => {
  const containerId = useStableContainerId();

  useEffect(() => {
    if (!containerId) {
      return () => {};
    }

    const { variant: variantProp } = props;
    const variant = variantProp === 'inline' ? { containerId } : variantProp;

    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      ...props,
      variant,
    });
    component.render();

    return () => {
      component.destroy();
    };
  }, [props, containerId]);

  return containerId ? <div id={containerId} /> : null;
};

export default FootprintForm;
