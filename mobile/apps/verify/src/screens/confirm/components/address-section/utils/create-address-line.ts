const createAddressLine = (address: Array<string | undefined | null>) =>
  address
    .map((value: string | undefined | null) => (value ? value.trim() : ''))
    .filter((value: string | undefined | null) => !!value)
    .join(', ');

export default createAddressLine;
