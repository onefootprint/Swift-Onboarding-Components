type ScrollElement = {
  getBoundingClientRect: () => DOMRect;
};

// Returns the index of the element first element that is fully visible
// If no element is fully visible, it returns the index of the first that is partially visible
const findVisibleElement = (containerRect: DOMRect, elements: (ScrollElement | null)[]): number => {
  let partiallyVisibleIndex = -1;

  const fullyVisibleIndex = elements.findIndex((element, index) => {
    if (!element) return false;

    const { top, bottom, height } = element.getBoundingClientRect();

    if (top >= containerRect.top && bottom <= containerRect.bottom) return true;
    const center = top + height / 2;
    const containerCenter = containerRect.top + containerRect.height / 2;
    if (Math.abs(center - containerCenter) < height) partiallyVisibleIndex = index;
  });

  if (fullyVisibleIndex !== -1) return fullyVisibleIndex;
  return partiallyVisibleIndex;
};

export default findVisibleElement;
