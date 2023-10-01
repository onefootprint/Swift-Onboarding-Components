import Haptic from 'react-native-haptic-feedback';

const haptic = {
  trigger: (
    level: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'rigid' | 'soft',
  ) => {
    Haptic.trigger(level);
  },
};

export default haptic;
