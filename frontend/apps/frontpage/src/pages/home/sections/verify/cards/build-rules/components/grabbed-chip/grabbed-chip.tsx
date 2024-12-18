import Image from 'next/image';

import RuleTag from '../rule-tag';

const GrabbedChip = ({ className }: { className?: string }) => (
  <div className={`${className} relative z-3 w-fit`}>
    <RuleTag signal="ip" op="is" list="@blocked_ips" className="shadow-md" />
    <Image
      className="absolute bottom-0 transform -translate-x-1/2 -translate-y-1/2 left-1/2"
      src="/home/verify-cards/hand.svg"
      height={42}
      width={42}
      alt="grab"
    />
  </div>
);

export default GrabbedChip;
