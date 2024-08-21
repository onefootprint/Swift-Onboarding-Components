import type { SupportedIdDocTypes } from '@onefootprint/types';
import useIdDocText from '../use-id-doc-text';

const useIdDocList = (docs: SupportedIdDocTypes[]) => {
  const getText = useIdDocText();
  return [...docs].map(getText).sort((a, b) => a.localeCompare(b));
};

export default useIdDocList;
