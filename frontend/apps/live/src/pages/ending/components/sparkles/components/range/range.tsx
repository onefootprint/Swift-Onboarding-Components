const range = (start: number, step = 1) => {
  const output = [];
  for (let i = start; i < 0; i += step) {
    output.push(i);
  }
  return output;
};

export default range;
