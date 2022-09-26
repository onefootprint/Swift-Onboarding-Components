export const createCSSClasses = () => {
  // TODO: Implement
  // https://linear.app/footprint/issue/FP-183/footprintjs-use-theme-variables
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500&display=swap');
  
    .footprint-body-locked {
      overflow: hidden;
    }

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

    @keyframes footprint-rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .footprint-loading-indicator {
      background: rgba(0, 0, 0, 0.6);
      border-radius: 4px;
      padding: 16px;
    }

    .footprint-loading-spin {
      animation: footprint-rotate 0.8s linear infinite;
    }

    .footprint-modal {
      height: 100%;
      left: 0;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 50001;
    }

    .footprint-button {
      -webkit-box-align: center;
      align-items: center;
      background-color: rgb(14, 20, 56);
      border-radius: 6px;
      border: 0px;
      box-shadow: rgb(0 0 0 / 0%) 0px 1px 1px, transparent 0px 0px 0px 1px;
      color: rgb(255, 255, 255);
      cursor: pointer;
      display: flex;
      -webkit-box-pack: center;
      justify-content: center;
      text-decoration: none;
      user-select: none;
      font-family: "DM Sans";
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      padding: 12px 24px;
    }

    .footprint-button:hover {
      background: linear-gradient(rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.14)), linear-gradient(rgb(14, 20, 56), rgb(14, 20, 56));
    }

    .footprint-button:active {
      background: linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.18)), linear-gradient(rgb(14, 20, 56), rgb(14, 20, 56));
    }

    .footprint-button svg {
      margin-right: 8px;
    }
  `;
  document.head.appendChild(style);
};

export const createLoadingIndicator = (loaderId: string) => {
  const container = document.createElement('div');
  container.setAttribute('id', loaderId);
  container.classList.add('footprint-loading-indicator');
  const inner = document.createElement('div');
  inner.classList.add('footprint-loading-spin');
  const loader = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  loader.setAttribute('width', '24px');
  loader.setAttribute('height', '24px');
  loader.setAttribute('fill', 'none');
  loader.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 2a10 10 0 0 1 10 10h-2a7.999 7.999 0 0 0-8-8V2Z');
  path.setAttribute('fill', '#FFFFFF');
  loader.appendChild(path);
  inner.appendChild(loader);
  container.appendChild(inner);
  return container;
};

export const createFootprintLogoIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24px');
  svg.setAttribute('height', '24px');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M14.66 14h2.666v-2.36a2.666 2.666 0 1 1 0-4.614V4H6.66v16h4.666v-2.666A3.333 3.333 0 0 1 14.66 14Z',
  );
  path.setAttribute('fill', '#76fb8f');
  svg.appendChild(path);
  return svg;
};

export const createFootprintButton = () => {
  const icon = createFootprintLogoIcon();
  const button = document.createElement('button');
  button.appendChild(icon);
  const text = document.createElement('span');
  text.innerText = 'Verify with Footprint';
  button.appendChild(text);
  button.classList.add('footprint-button');
  return button;
};
