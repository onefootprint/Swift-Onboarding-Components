import useDesktopMachine from './use-desktop-machine';

const useTranslationSourceForRequirements = () => {
  const [state] = useDesktopMachine();
  const { missingRequirements } = state.context;
  const { liveness, idDoc } = missingRequirements;

  let translationSource = '';
  if (liveness && idDoc) {
    translationSource = 'liveness-with-id-doc';
  } else if (liveness) {
    translationSource = 'liveness';
  } else {
    translationSource = 'id-doc';
  }

  return translationSource;
};

export default useTranslationSourceForRequirements;
