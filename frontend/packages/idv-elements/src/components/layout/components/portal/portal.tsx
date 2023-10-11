import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type PortalProps = {
  children: React.ReactNode;
  selector: string;
};

const Portal = ({ children, selector }: PortalProps) => {
  const ref = useRef<Element | null>();
  const [mounted, setMounted] = useState<boolean>(false);

  useLayoutEffect(() => {
    const element = document.querySelector(selector);
    if (element) {
      while (element.firstChild) {
        element.firstChild.remove();
      }
    }
    ref.current = element;
    setMounted(true);
  }, [selector]);

  if (!ref.current || !mounted) {
    return null;
  }
  return createPortal(children, ref.current as Element);
};

export default Portal;
