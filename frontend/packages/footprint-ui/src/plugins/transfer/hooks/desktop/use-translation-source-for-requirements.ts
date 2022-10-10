import useDesktopMachine from './use-desktop-machine';

const useTranslationSourceForRequirements = () => {
  const [state] = useDesktopMachine();
  const { missingRequirements } = state.context;
  const { liveness, idScan } = missingRequirements;

  let translationSource = '';
  if (liveness && idScan) {
    translationSource = 'liveness-with-id-scan';
  } else if (liveness) {
    translationSource = 'liveness';
  } else {
    translationSource = 'id-scan';
  }

  return translationSource;
};

export default useTranslationSourceForRequirements;
