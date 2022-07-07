const createAddressLine = (address: Array<string | undefined>) =>
  address
    .map((val?: string) => val?.trim())
    .filter((val?: string) => !!val)
    .join(', ');

export default createAddressLine;
