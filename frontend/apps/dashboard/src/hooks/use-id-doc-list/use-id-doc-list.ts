import type { SupportedIdDocTypes } from '@onefootprint/types';
import useIdDocText from '../use-id-doc-text';

const useIdDocList = () => {
  const getText = useIdDocText();
  return (docs: SupportedIdDocTypes[]) => {
    return [...docs].map(getText).sort((a, b) => a.localeCompare(b));
  };
};

export default useIdDocList;
