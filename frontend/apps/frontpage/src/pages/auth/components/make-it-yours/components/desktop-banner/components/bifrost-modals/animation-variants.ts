const animationVariants = {
  left: {
    initial: {
      transform: 'translate(75%, 20%) rotate(0deg)',
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transform: 'translate(25%, 20%) rotate(-12deg)',
      boxShadow: '0px 0px 4px rgba(100, 100, 100, 0.2)',
      transition: {
        duration: 0.5,
        delay: 0.5,
        ease: 'easeInOut',
      },
    },
  },
  center: {
    initial: {
      x: '75%',
      y: '14%',
      boxShadow: '0px 0px 8px rgba(100, 100, 100, 0.2)',
      opacity: 1,
      scale: 1,
    },
    animate: {
      x: '75%',
      y: '14%',
      opacity: 1,
      scale: [1, 1.05, 1],
      boxShadow: [
        '0px 0px 12px rgba(100, 100, 100, 0.2)',
        '0px 0px 20px rgba(100, 100, 100, 0.2)',
        '0px 0px 12px rgba(100, 100, 100, 0.2)',
      ],
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  },
  right: {
    initial: {
      transform: 'translate(100%, 20%) rotate(0deg)',
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transform: 'translate(125%, 20%) rotate(12deg)',
      boxShadow: '0px 0px 4px rgba(100, 100, 100, 0.2)',
      transition: {
        duration: 0.5,
        delay: 0.5,
        ease: 'easeInOut',
      },
    },
  },
};

export default animationVariants;
