import { useCallback, useState } from 'react';

const timeout = 1000;

const useClipboard = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => {
        setCopiedText(null);
      }, timeout);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, []);

  return {
    copy,
    hasCopied: Boolean(copiedText),
    copiedText,
  };
};

export default useClipboard;
