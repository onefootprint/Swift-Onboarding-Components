export const createCSSClasses = () => {
  // TODO: Implement
  // https://linear.app/footprint/issue/FP-183/footprintjs-use-theme-variables
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
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

    @keyframes rotate {
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
      animation: rotate 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .footprint-modal {
      height: 100%;
      left: 0;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 50001;
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
