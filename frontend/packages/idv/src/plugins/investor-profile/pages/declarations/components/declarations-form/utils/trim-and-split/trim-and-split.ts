const trimAndSplit = (value?: string | null | undefined) => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export default trimAndSplit;
