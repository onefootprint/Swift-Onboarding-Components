const arePropsValid = (props: any) => {
  if (!props || typeof props !== 'object') {
    return false;
  }
  return true;
};

export default arePropsValid;
