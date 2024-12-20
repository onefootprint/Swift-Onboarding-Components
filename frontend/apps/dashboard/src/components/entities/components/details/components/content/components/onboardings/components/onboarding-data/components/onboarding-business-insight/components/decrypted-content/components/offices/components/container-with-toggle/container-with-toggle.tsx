import { IcoChevronLeft16 } from '@onefootprint/icons';
import { cx } from 'class-variance-authority';
import type React from 'react';

type ContainerWithToggleProps = {
  isHidden: boolean;
  onChangeHidden: (hidden: boolean) => void;
  children: React.ReactNode;
};

const ContainerWithToggle = ({ isHidden, onChangeHidden, children }: ContainerWithToggleProps) => (
  <div
    className={cx(
      'absolute top-0 left-0 w-[309px] h-full z-50 rounded-l transition-transform duration-300 ease-in-out',
      { '-translate-x-full': isHidden, 'border-r border-solid border-tertiary shadow-sm': !isHidden },
    )}
  >
    <div className="w-full h-full bg-primary px-3 pt-3 overflow-hidden -mr-[35px] flex flex-col rounded-l-sm">
      {children}
      <button
        className="w-[26px] h-8 px-1 py-2 absolute top-3 right-[-26px] flex justify-center items-center rounded-r bg-primary border border-solid border-tertiary shadow-sm cursor-pointer"
        onClick={() => onChangeHidden(!isHidden)}
        type="button"
      >
        <IcoChevronLeft16 className={cx({ 'rotate-180': isHidden })} />
      </button>
    </div>
  </div>
);

export default ContainerWithToggle;
