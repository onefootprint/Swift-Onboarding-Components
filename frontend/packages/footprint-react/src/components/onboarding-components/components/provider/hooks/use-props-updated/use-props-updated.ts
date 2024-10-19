import isEqual from 'lodash/isEqual';
import { useEffect, useRef } from 'react';
import type { PropsUpdated } from '../../provider.types';

const usePropsUpdated = ({
  props,
  onUpdate,
}: {
  props: PropsUpdated;
  onUpdate: (updatedProps: Partial<PropsUpdated>) => void;
}) => {
  const prevData = useRef<PropsUpdated | null>(props);
  const keysSortedInOrder = Object.keys(props).sort();
  const depList = keysSortedInOrder.map(key => props[key as keyof PropsUpdated]);

  useEffect(() => {
    if (prevData.current) {
      const updatedProps = Object.entries(props).reduce(
        (acc, [key, value]) => {
          if (prevData.current && !isEqual(prevData.current[key as keyof PropsUpdated], value)) {
            // @ts-ignore-next-line
            acc[key] = value;
          }
          return acc;
        },
        {} as Partial<PropsUpdated>,
      );
      if (Object.keys(updatedProps).length > 0) {
        onUpdate(updatedProps);
      }
    }
    prevData.current = props;
  }, depList);
};

export default usePropsUpdated;
