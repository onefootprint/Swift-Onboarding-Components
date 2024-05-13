const className = 'footprint-body-locked';

export const unlockBody = () => {
  document.body.classList.remove(className);
};

export const lockBody = () => {
  document.body.classList.add(className);
};
