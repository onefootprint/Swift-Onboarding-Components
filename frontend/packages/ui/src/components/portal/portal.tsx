'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type PortalProps = {
  children: React.ReactNode;
  selector: string;
  removeContent?: boolean;
};

const Portal = ({ children, selector, removeContent }: PortalProps) => {
  const ref = useRef<Element | null>();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const element = document.querySelector(selector);
    if (removeContent && element) {
      while (element.firstChild) {
        element.firstChild.remove();
      }
    }
    ref.current = element;
    setMounted(true);
  }, [selector, removeContent]);

  if (!ref.current || !mounted) {
    return null;
  }
  return createPortal(children, ref.current as Element);
};

export default Portal;
