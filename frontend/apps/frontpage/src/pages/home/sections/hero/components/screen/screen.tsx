import { motion } from 'framer-motion';
import Image from 'next/image';

const illustrationAppear = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const Screen = () => (
  <div className="relative z-0">
    <div className="hidden md:block w-[1000px] h-auto rounded aspect-[16/10] bg-primary border border-solid border-tertiary overflow-hidden z-[3] relative">
      <Image src="/home/hero/manual-review.png" alt="ID Capture Desktop" width={1000} height={625} priority />
    </div>
    <div className="sm:block md:hidden h-auto rounded-md aspect-[3/6] shadow-elevation-1 overflow-hidden z-[3] relative shadow-sm mx-auto">
      <Image src="/home/hero/id-capture-phone.png" alt="ID Capture Mobile" width={290} height={475} priority />
    </div>

    <motion.div initial="hidden" animate="visible" variants={illustrationAppear}>
      <div className="absolute top-0 transform -translate-x-full -translate-y-full left-10 z-[1]">
        <Image src="/home/hero/wire-03.svg" alt="Wire 03" width={100} height={100} loading="lazy" />
      </div>
      <div className="absolute top-[-60px] left-[-50px] transform -translate-x-full -translate-y-full z-[2]">
        <Image src="/home/hero/device-02.svg" alt="Device 02" width={100} height={100} loading="lazy" />
      </div>
      <div className="absolute top-[15px] left-[-75px] transform -translate-x-full -translate-y-full z-[1]">
        <Image src="/home/hero/wire-02.svg" alt="Wire 02" width={140} height={140} loading="lazy" />
      </div>
      <div className="absolute top-[104px] left-[-148px] transform -translate-x-full -translate-y-full z-[2]">
        <Image src="/home/hero/device-03.svg" alt="Device 03" width={120} height={120} loading="lazy" />
      </div>
      <div className="absolute top-[300px] left-[-162px] transform -translate-x-full -translate-y-full z-[1]">
        <Image src="/home/hero/wire-05.svg" alt="Wire 05" width={70} height={200} loading="lazy" />
      </div>
      <div className="absolute top-[454px] left-[-96px] transform -translate-x-full -translate-y-full z-[2]">
        <Image src="/home/hero/device-04.svg" alt="Device 04" width={190} height={160} loading="lazy" />
      </div>
      <div className="absolute top-[148px] left-[-42px] transform -translate-x-full -translate-y-full z-[1]">
        <Image src="/home/hero/wire-04.svg" alt="Wire 04" width={110} height={113} loading="lazy" />
      </div>
      <div className="absolute top-[306px] left-[-11px] transform -translate-x-full -translate-y-full z-[2]">
        <Image src="/home/hero/device-05.svg" alt="Device 05" width={70} height={140} loading="lazy" />
      </div>
      <div className="absolute top-[423px] left-[-36px] transform -translate-x-full -translate-y-full z-[1]">
        <Image src="/home/hero/wire-06.svg" alt="Wire 06" width={16} height={145} loading="lazy" />
      </div>
      <div className="absolute top-[544px] left-[15px] transform -translate-x-full -translate-y-full z-[2]">
        <Image src="/home/hero/device-06.svg" alt="Device 06" width={120} height={120} loading="lazy" />
      </div>
      <div className="absolute top-[-36px] right-[-50px] z-[1]">
        <Image src="/home/hero/wire-07.svg" alt="Wire 07" width={100} height={160} loading="lazy" />
      </div>
      <div className="absolute top-[60px] right-[-145px] z-[2]">
        <Image src="/home/hero/device-09.svg" alt="Device 09" width={120} height={170} loading="lazy" />
      </div>
      <div className="absolute top-[140px] right-[-44px] z-[2]">
        <Image src="/home/hero/wire-11.svg" alt="Wire 11" width={36} height={195} loading="lazy" />
      </div>
      <div className="absolute top-[288px] right-[-104px] z-[2]">
        <Image src="/home/hero/device-10.svg" alt="Device 10" width={72} height={190} loading="lazy" />
      </div>
      <div className="absolute top-[52px] right-[-194px] z-[1]">
        <Image src="/home/hero/wire-10.svg" alt="Wire 10" width={67} height={62} loading="lazy" />
      </div>
      <div className="absolute top-[9px] right-[-304px] z-[2]">
        <Image src="/home/hero/device-08.svg" alt="Device 08" width={120} height={92} loading="lazy" />
      </div>
      <div className="absolute top-[-50px] right-[-244px] z-[1]">
        <Image src="/home/hero/wire-08.svg" alt="Wire 08" width={97} height={62} loading="lazy" />
      </div>
      <div className="absolute top-[-158px] right-[-180px] z-[2]">
        <Image src="/home/hero/device-07.svg" alt="Device 07" width={62} height={130} loading="lazy" />
      </div>
      <div className="absolute top-[-158px] right-[-300px] z-[3]">
        <Image src="/home/hero/bird.svg" alt="Bird" width={80} height={75} loading="lazy" />
      </div>
      <div className="absolute top-[400px] right-[-300px] z-[3]">
        <Image src="/home/hero/penguin.svg" alt="Penguin" width={125} height={250} loading="lazy" />
      </div>
      <div className="absolute top-[250px] right-[-250px] z-[3]">
        <Image src="/home/hero/sparkles-05.svg" alt="Sparkles 05" width={40} height={102} loading="lazy" />
      </div>
      <div className="absolute top-[-200px] right-[-250px] z-[3]">
        <Image src="/home/hero/sparkles-04.svg" alt="Sparkles 04" width={33} height={58} loading="lazy" />
      </div>
    </motion.div>
  </div>
);

export default Screen;
