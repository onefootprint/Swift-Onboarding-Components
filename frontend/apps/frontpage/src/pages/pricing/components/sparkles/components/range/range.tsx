const range = (start: number, end: number | undefined, step = 1) => {
  const output = [];
  if (typeof end === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    end = start;
    // eslint-disable-next-line no-param-reassign
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};

export default range;
