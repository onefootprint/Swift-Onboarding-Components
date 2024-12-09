import { motion } from 'framer-motion';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { duration: 0.8, delay: i * 0.1 },
  }),
};

const penguinAppearVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.4, duration: 0.5 },
  },
};

const Illustration = () => (
  <motion.div
    className="relative h-[320px] w-full overflow-hidden"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <motion.div
      className="absolute top-0 -translate-x-1/2 left-1/2"
      variants={itemVariants}
      custom={1}
      initial="hidden"
      animate="visible"
    >
      <Image src="/customers/section/cloud.svg" alt="Cloud" width={200} height={200} className="h-auto w-[200px]" />
    </motion.div>

    <motion.div
      className="absolute top-0 left-[10%] -translate-x-1/2 md:left-[30%]"
      variants={itemVariants}
      custom={2}
      initial="hidden"
      animate="visible"
    >
      <Image src="/customers/section/sun.svg" alt="Sun" width={56} height={56} className="h-auto w-[56px]" />
    </motion.div>

    <motion.div
      className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2"
      variants={itemVariants}
      custom={3}
      initial="hidden"
      animate="visible"
    >
      <Image
        src="/customers/section/cloud-group.svg"
        alt="Cloud2"
        width={150}
        height={150}
        className="h-auto w-[150px]"
      />
    </motion.div>

    <motion.div
      className="absolute bottom-0 translate-x right-[52%]"
      variants={itemVariants}
      custom={4}
      initial="hidden"
      animate="visible"
    >
      <Image src="/customers/section/smoke.svg" alt="Smoke" width={300} height={300} className="h-auto w-[300px]" />
    </motion.div>
    <motion.div
      className="absolute bottom-0 translate-x-1/2 left-[52%]"
      variants={penguinAppearVariants}
      custom={4}
      initial="hidden"
      animate="visible"
    >
      <Image src="/customers/section/penguin.svg" alt="Penguin" width={200} height={200} className="h-auto w-[200px]" />
    </motion.div>
  </motion.div>
);

export default Illustration;
