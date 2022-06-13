const createCSSClasses = () => {
  // TODO: Implement
  // https://linear.app/footprint/issue/FP-183/footprintjs-use-theme-variables
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    .footprint-overlay {
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      height: 100%;
      justify-content: center;
      left: 0;
      overflow-y: hidden;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 50000;
    }

    .footprint-modal {
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 50001;
    }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);
};

export default createCSSClasses;
