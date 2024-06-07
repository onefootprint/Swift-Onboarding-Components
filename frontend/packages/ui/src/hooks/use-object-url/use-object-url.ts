'use client';

import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';

import detectMimeType from '../../utils/detect-mime-type';

const useObjectUrl = (initialBase64Data: string | null) => {
  const [base64Data, setBase64Data] = useState<string | null>(initialBase64Data);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  useEffect((): (() => void) => {
    if (!base64Data) {
      return () => undefined;
    }

    const buff = Buffer.from(base64Data, 'base64');
    const mime = detectMimeType(buff);
    setMimeType(mime);
    const blob = new Blob([buff], { type: mime });
    const newUrl = window.URL.createObjectURL(blob);
    setObjectUrl(newUrl);

    return () => {
      // Cleanup.
      window.URL.revokeObjectURL(newUrl);
      setObjectUrl(null);
      setMimeType(null);
    };
  }, [base64Data]);

  return {
    objectUrl,
    mimeType,
    setBase64Data,
  };
};

export default useObjectUrl;
