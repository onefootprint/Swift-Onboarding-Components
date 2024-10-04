import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEventListener } from 'usehooks-ts';

type CommandShortcutProps = {
  baseKey?: 'Meta' | 'Control' | 'Alt' | 'Shift';
  ctrlKey: string;
  onShortcut: () => void;
  onClose: () => void;
};

const CommandShortcut = ({ baseKey = 'Meta', ctrlKey, onShortcut, onClose }: CommandShortcutProps) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const keyMap: Record<string, keyof KeyboardEvent> = {
      Meta: 'metaKey',
      Control: 'ctrlKey',
      Alt: 'altKey',
      Shift: 'shiftKey',
    };

    const isBaseKeyPressed = event[keyMap[baseKey] as keyof KeyboardEvent];
    const isCtrlKeyPressed = event.key?.toLowerCase() === ctrlKey.toLowerCase();

    if (isBaseKeyPressed && isCtrlKeyPressed) {
      event.preventDefault();
      onShortcut();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  useEventListener('keydown', handleKeyDown);

  return <VisuallyHidden>{`${baseKey}+${ctrlKey}`}</VisuallyHidden>;
};

export default CommandShortcut;
