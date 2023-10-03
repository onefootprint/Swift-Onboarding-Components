const isValidObject = (props: any) => {
  if (!props || typeof props !== 'object') {
    return false;
  }
  return true;
};

export default isValidObject;
