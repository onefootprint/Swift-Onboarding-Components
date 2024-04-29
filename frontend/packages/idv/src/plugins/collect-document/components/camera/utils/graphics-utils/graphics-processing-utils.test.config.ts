export const images = {
  'img-1': {
    path: `${__dirname}/test-images/img-1.jpeg`,
    capturable: false,
  },
  'img-2': {
    path: `${__dirname}/test-images/img-2.png`,
    capturable: false,
  },
};

export const getTestImageEntries = () => Object.entries(images);
