const filterNonTruthy = (data: Record<string, boolean>) =>
  Object.entries(data)
    .filter(([, value]) => !!value)
    .map(([key]) => key);

export default filterNonTruthy;
