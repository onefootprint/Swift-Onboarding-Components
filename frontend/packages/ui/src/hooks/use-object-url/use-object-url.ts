'use client';

import { Buffer } from 'buffer';
import { useMemo, useState } from 'react';

import detectMimeType from '../../utils/detect-mime-type';

const useObjectUrl = (initialBase64Data: string | null) => {
  const [base64Data, setBase64Data] = useState<string | null>(initialBase64Data);

  const { objectUrl, mimeType } = useMemo(() => {
    if (!base64Data) {
      return { objectUrl: null, mimeType: null };
    }
    const buff = Buffer.from(base64Data, 'base64');
    const mime = detectMimeType(buff);
    const blob = new Blob([buff], { type: mime });
    const newUrl = window.URL.createObjectURL(blob);
    return { objectUrl: newUrl, mimeType: mime };
  }, [base64Data]);

  return {
    objectUrl,
    mimeType,
    setBase64Data,
  };
};

export default useObjectUrl;
