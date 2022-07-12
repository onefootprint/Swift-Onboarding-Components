const createAddressLine = (address: Array<string | null>) =>
  address
    .map((value: string | null) => (value ? value.trim() : ''))
    .filter((value: string | null) => !!value)
    .join(', ');

export default createAddressLine;
