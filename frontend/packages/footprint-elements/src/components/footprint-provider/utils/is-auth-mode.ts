const isAuthMode = () => {
  const params = new URLSearchParams(document.location.search);
  const redirectUrl = params.get('redirect_url');
  return !!redirectUrl;
};

export default isAuthMode;
