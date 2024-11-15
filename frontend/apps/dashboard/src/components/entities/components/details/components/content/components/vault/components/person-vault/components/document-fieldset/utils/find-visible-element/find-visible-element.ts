type ScrollElement = {
  getBoundingClientRect: () => DOMRect;
};

// Returns the index of the element first element that is fully visible
// If no element is fully visible, it returns the index of the first that is partially visible
const findVisibleElement = (containerRect: DOMRect, elements: (ScrollElement | null)[]): number => {
  let partiallyVisibleIndex = -1;

  const fullyVisibleIndex = elements.findIndex((element, index) => {
    if (!element) return false;

    const { top: elementTop, bottom: elementBottom } = element.getBoundingClientRect();
    const { top: containerTop, bottom: containerBottom } = containerRect;
    if (elementTop >= containerTop && elementBottom <= containerBottom) return true;

    // Element is partially visible if:
    // - its top is between container top and bottom OR
    // - its bottom is between container top and bottom OR
    // - it completely encompasses the container
    const isPartiallyVisible =
      (elementTop >= containerTop && elementTop <= containerBottom) ||
      (elementBottom >= containerTop && elementBottom <= containerBottom) ||
      (elementTop <= containerTop && elementBottom >= containerBottom);
    if (isPartiallyVisible) {
      partiallyVisibleIndex = index;
    }

    return false;
  });

  return fullyVisibleIndex === -1 ? partiallyVisibleIndex : fullyVisibleIndex;
};

export default findVisibleElement;
