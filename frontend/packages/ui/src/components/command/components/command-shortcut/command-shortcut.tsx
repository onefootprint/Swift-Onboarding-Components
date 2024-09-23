import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useCallback, useEffect } from 'react';

type CommandShortcutProps = {
  baseKey?: 'Meta' | 'Control' | 'Alt' | 'Shift';
  ctrlKey: string;
  onShortcut: () => void;
  onClose: () => void;
};

const CommandShortcut = ({ baseKey = 'Meta', ctrlKey, onShortcut, onClose }: CommandShortcutProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const keyMap: { [key: string]: keyof KeyboardEvent } = {
        Meta: 'metaKey',
        Control: 'ctrlKey',
        Alt: 'altKey',
        Shift: 'shiftKey',
      };

      const isBaseKeyPressed = event[keyMap[baseKey] as keyof KeyboardEvent] || false;
      const isCtrlKeyPressed = event.key.toLowerCase() === ctrlKey.toLowerCase();

      if (isBaseKeyPressed && isCtrlKeyPressed) {
        event.preventDefault();
        onShortcut();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [baseKey, ctrlKey, onShortcut, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <VisuallyHidden>{`${baseKey}+${ctrlKey}`}</VisuallyHidden>;
};

export default CommandShortcut;
