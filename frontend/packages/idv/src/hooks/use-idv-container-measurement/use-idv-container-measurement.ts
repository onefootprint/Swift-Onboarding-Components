import { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { LAYOUT_CONTAINER_ID } from '../../components/layout/constants';

type MeasurementProps = {
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/** @deprecated: It seems not to be used */
const useIdvContainerMeasurement = () => {
  const [measurement, setMeasurement] = useState<MeasurementProps>({
    width: 0,
    height: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffectOnce(() => {
    const container = document.querySelector(`#${LAYOUT_CONTAINER_ID}`);
    const boundingRect = container?.getBoundingClientRect();
    const updateDimensions = () => {
      const width = container?.clientWidth || 0;
      const height = container?.clientHeight || 0;
      const left = boundingRect?.left || 0;
      const top = boundingRect?.top || 0;
      const bottom = top + height;
      const right = left + width;

      setMeasurement({
        width,
        height,
        top,
        bottom,
        left,
        right,
      });
    };

    const resizeObserver = new ResizeObserver(updateDimensions);

    const startResizeObserve = () => {
      if (container) {
        resizeObserver.observe(container);
      }
    };

    const stopResizeObserve = () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };

    startResizeObserve();

    return stopResizeObserve;
  });

  return measurement;
};

export default useIdvContainerMeasurement;
