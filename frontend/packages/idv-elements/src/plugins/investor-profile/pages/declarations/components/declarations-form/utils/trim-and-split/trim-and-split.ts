const trimAndSplit = (value?: string) => {
  if (!value) {
    return undefined;
  }
  return value.replaceAll(' ', '').split(',');
};

export default trimAndSplit;
