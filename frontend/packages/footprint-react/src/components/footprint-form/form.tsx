import type { FootprintFormProps } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useEffect } from 'react';

import useStableContainerId from '../../hooks/use-stable-container-id';

export type FootprintFootprintFormProps = Omit<FootprintFormProps, 'kind' | 'containerId'>;

const FootprintForm = (props: FootprintFootprintFormProps) => {
  const containerId = useStableContainerId();
  const { variant = 'inline' } = props;

  useEffect(() => {
    if (!containerId) {
      return () => undefined;
    }

    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      ...props,
      containerId,
    });
    component.render();

    return () => {
      component.destroy();
    };
  }, [props, containerId]);

  return variant === 'inline' && containerId ? (
    <div style={{ width: '100%', height: '100%' }} id={containerId} />
  ) : null;
};

export default FootprintForm;
