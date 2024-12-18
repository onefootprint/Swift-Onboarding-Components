import { motion } from 'framer-motion';
import Image from 'next/image';

type IllustrationProps = {
  backgroundColor: string;
};

const rightFootVariants = {
  initial: {
    bottom: '50%',
    right: '52px',
    zIndex: 2,
  },
  rotate: {
    rotate: [0, 8, -8, 0, 8, -8, 0],
    y: [0, 5, -5, 0, 5, -5, 0],
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 0.5,
      repeatDelay: 5,
      ease: 'easeInOut',
    },
  },
};

const Illustration = ({ backgroundColor }: IllustrationProps) => (
  <div className="relative grid grid-rows-2 overflow-hidden border border-t-0 rounded-b-lg pointer-events-none select-none border-tertiary min-h-[400px]">
    <div className="relative z-0 h-full overflow-hidden" style={{ backgroundColor: `${backgroundColor}4D` }}>
      <Image
        className="absolute top-4 left-4 z-2"
        src="/home/customize-illustration/logo.svg"
        alt="Logo"
        width={140}
        height={65}
      />
      <Image
        className="absolute bottom-[-2px] left-0 z-0 transform-translate-y-[100%]"
        src="/home/customize-illustration/mountain-left.svg"
        alt="Mountain"
        width={240}
        height={140}
      />
      <Image
        className="absolute bottom-[-2px] right-[-12px] z-0 transform-translate-y-[100%]"
        src="/home/customize-illustration/mountain-right.svg"
        alt="Mountain"
        width={240}
        height={140}
      />
      <Image
        className="absolute right-[-2px] z-0 top-2"
        src="/home/customize-illustration/cloud-right.svg"
        alt="Cloud"
        width={100}
        height={100}
      />
      <Image
        className="absolute top-[80px] left-[-2px] z-0"
        src="/home/customize-illustration/cloud-left.svg"
        alt="Cloud"
        width={100}
        height={100}
      />
    </div>
    <div className="relative z-10 h-full">
      <span className="absolute top-[-20%] z-0 transform -translate-x-1/2 left-1/2 isolate">
        <Image
          className="relative z-10"
          src="/home/customize-illustration/characters.svg"
          alt="Characters"
          width={300}
          height={300}
        />
        <span className="absolute top-[30px] right-[18px] z-0 transform -translate-x-1">
          <Image src="/home/customize-illustration/right-foot.svg" alt="Left Foot" width={35} height={35} />
          <motion.div variants={rightFootVariants} initial="initial" animate="rotate">
            <Image src="/home/customize-illustration/right-foot.svg" alt="Right Foot" width={35} height={35} />
          </motion.div>
        </span>
      </span>
    </div>
  </div>
);

export default Illustration;
