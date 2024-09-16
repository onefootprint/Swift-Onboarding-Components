import isEqual from 'lodash/isEqual';
import { useEffect, useRef } from 'react';
import type { ProviderProps } from '../../provider';

type Props = Omit<ProviderProps, 'children'>;

const usePropsUpdated = ({
  props,
  onUpdate,
}: {
  props: Props;
  onUpdate: (updatedProps: Partial<Props>) => void;
}) => {
  const prevData = useRef<Props | null>(props);
  const keysSortedInOrder = Object.keys(props).sort();
  const depList = keysSortedInOrder.map(key => props[key as keyof Props]);

  useEffect(() => {
    if (prevData.current) {
      const updatedProps = Object.entries(props).reduce(
        (acc, [key, value]) => {
          if (prevData.current && !isEqual(prevData.current[key as keyof Props], value)) {
            // @ts-ignore-next-line
            acc[key] = value;
          }
          return acc;
        },
        {} as Partial<Props>,
      );
      if (Object.keys(updatedProps).length > 0) {
        onUpdate(updatedProps);
      }
    }
    prevData.current = props;
  }, depList);
};

export default usePropsUpdated;
