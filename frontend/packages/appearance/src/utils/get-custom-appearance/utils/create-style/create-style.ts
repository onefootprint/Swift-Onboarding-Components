const createStyle = (styleId: string, styles: string) => {
  const prevStyle = document.getElementById(styleId);
  if (prevStyle) {
    prevStyle.remove();
  }
  const style = document.createElement('style');
  style.type = 'text/css';
  style.setAttribute('id', styleId);
  style.textContent = styles;
  document.head.append(style);
};

export default createStyle;
