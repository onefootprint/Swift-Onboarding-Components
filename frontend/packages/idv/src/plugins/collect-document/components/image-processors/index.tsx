import type React from 'react';
import { createContext, useContext, useMemo } from 'react';

import useImportHeic2Any from '../../hooks/use-import-heic2any';
import type { Heic2AnyModule } from '../../types';

export type ImgProcessorsContextProviderProps = { children: React.ReactNode };
type ImageProcessors = {
  heic: Heic2AnyModule | undefined;
  heicLoading: boolean;
};

export const ImgProcessorsContext = createContext<ImageProcessors>({
  heic: undefined,
  heicLoading: true,
});
export const useImgProcessorsContext = () => useContext(ImgProcessorsContext);
export const ImgProcessorsContextProvider = ({ children }: ImgProcessorsContextProviderProps): JSX.Element => {
  const [heicLoading, heic] = useImportHeic2Any();
  const contextValue = useMemo(() => ({ heic, heicLoading }), [heic, heicLoading]);

  return <ImgProcessorsContext.Provider value={contextValue}>{children}</ImgProcessorsContext.Provider>;
};
