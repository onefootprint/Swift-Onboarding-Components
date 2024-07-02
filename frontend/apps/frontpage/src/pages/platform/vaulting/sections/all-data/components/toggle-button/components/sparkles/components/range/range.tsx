const range = (start: number, end: number | undefined, step = 1) => {
  const output = [];
  if (typeof end === 'undefined') {
    // biome-ignore lint/style/noParameterAssign: <explanation>
    end = start;
    // biome-ignore lint/style/noParameterAssign: <explanation>
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};

export default range;
