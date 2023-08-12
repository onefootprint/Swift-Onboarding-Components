import useURL from './use-url';

const useShouldOpenIdv = () => {
  const linkingUrl = useURL();
  const shouldOpen = linkingUrl?.includes('https://handoff');
  return { shouldOpen, linkingUrl };
};

export default useShouldOpenIdv;
