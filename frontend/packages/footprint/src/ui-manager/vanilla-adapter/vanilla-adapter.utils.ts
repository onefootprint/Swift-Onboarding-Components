const createCSSClasses = () => {
  // TODO: Implement
  // https://linear.app/footprint/issue/FP-183/footprintjs-use-theme-variables
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    .footprint-modal {
      position: absolute;
      left: calc(50% - 250px);
      top: 40px;
      width: 500px;
      height: 373px;
      border-radius: 6px;
      background: #FFF;
      box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.14);
    }
    
    .footprint-overlay {
      overflow-y: hidden;
      background: rgba(0,0,0, 0.3);
    }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);
};

export default createCSSClasses;
