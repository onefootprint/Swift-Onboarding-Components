import { IcoLaptop16, IcoSmartphone216 } from '@onefootprint/icons';
import { cx } from 'class-variance-authority';

type DeviceSelectProps = {
  icon: 'phone' | 'computer';
  id: string;
  isActive: boolean;
  onClick: (id: string) => void;
  position: {
    x: string;
    y: string;
  };
};

const DeviceSelect = ({ icon = 'phone', id, isActive, onClick, position }: DeviceSelectProps) => {
  const Icon = icon === 'phone' ? IcoSmartphone216 : IcoLaptop16;
  const IconColor = isActive ? 'quinary' : 'primary';
  const activeClasses = {
    'bg-accent shadow-lg': isActive,
    'bg-primary shadow-md hover:bg-secondary hover:shadow-lg': !isActive,
  };
  return (
    <button
      type="button"
      className={cx(
        'absolute flex items-center justify-center w-8 h-8 rounded-t-full rounded-br-full cursor-pointer transition-all duration-100 ease-in-out',
        activeClasses,
      )}
      style={{
        top: position.y,
        left: position.x,
        transform: 'rotate(-45deg)',
      }}
      onClick={() => onClick(id)}
      tabIndex={-1}
    >
      <div className="absolute transform rotate-45">
        <Icon color={IconColor} />
      </div>
    </button>
  );
};

export default DeviceSelect;
