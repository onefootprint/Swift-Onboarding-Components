const defer = (callback: () => void) => {
  window.setTimeout(callback, 0);
};

export default defer;
