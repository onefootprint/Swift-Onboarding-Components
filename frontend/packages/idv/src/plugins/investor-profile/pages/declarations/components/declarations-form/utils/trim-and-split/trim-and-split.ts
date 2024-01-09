const trimAndSplit = (value?: string) => {
  if (!value) {
    return undefined;
  }
  return value.split(',').map(item => item.trim());
};

export default trimAndSplit;
