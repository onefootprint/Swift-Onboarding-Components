import type { Entity } from '@onefootprint/types';
import type React from 'react';

import useCurrentEntity from '../../hooks/use-current-entity';

export type WithEntityProps = {
  entity: Entity;
};

const withEntity = <P extends WithEntityProps>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<Omit<P, keyof WithEntityProps>> => {
  const WithEntityHOC = (props: Omit<P, keyof WithEntityProps>) => {
    const { data } = useCurrentEntity();
    // eslint-disable-next-line react/jsx-props-no-spreading
    return data ? <WrappedComponent {...(props as P)} entity={data} /> : null;
  };
  return WithEntityHOC;
};

export default withEntity;
