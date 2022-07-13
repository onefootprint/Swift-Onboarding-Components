import times from 'lodash/times';

const getSelected = (currentIndex: number, slideIndex: number) => {
  if (currentIndex === slideIndex) {
    return 0;
  }
  if (slideIndex > currentIndex) {
    return -slideIndex + currentIndex;
  }
  return currentIndex - slideIndex;
};

const getScale = (currentIndex: number, slideIndex: number) => {
  const max = 1;
  if (currentIndex === slideIndex) {
    return max;
  }
  return max - Math.abs(slideIndex - currentIndex) / 10;
};

const getZIndex = (currentIndex: number, slideIndex: number) => {
  const max = 10;
  if (currentIndex === slideIndex) {
    return max;
  }
  return max - Math.abs(currentIndex - slideIndex);
};

const useCarouselStyle = (slidesCount: number, currentIndex: number) =>
  times(slidesCount, (slideIndex: number) => ({
    selected: getSelected(currentIndex, slideIndex),
    scale: getScale(currentIndex, slideIndex),
    zIndex: getZIndex(currentIndex, slideIndex),
  }));

export default useCarouselStyle;
