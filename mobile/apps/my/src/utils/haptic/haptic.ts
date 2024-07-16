import { Platform } from 'react-native';
import Haptic from 'react-native-haptic-feedback';

const haptic = {
  trigger: (level: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'rigid' | 'soft') => {
    if (Platform.OS === 'ios') {
      Haptic.trigger(level);
    }
  },
};

export default haptic;
