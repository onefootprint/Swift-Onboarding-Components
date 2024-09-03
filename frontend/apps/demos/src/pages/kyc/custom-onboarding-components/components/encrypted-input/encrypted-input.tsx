import { IcoLock16 } from '@onefootprint/icons';
import { Stack } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type EncryptedInputProps = {
  label: string;
  valueToEncrypt: string;
};

const specialChars = new Set(['@', '(', ')', '-']);
const finalChar = ' ✴ ';

export const EncryptedInput = ({ label, valueToEncrypt }: EncryptedInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < valueToEncrypt.length) {
      const timeoutId = setTimeout(() => {
        const char = valueToEncrypt[index];
        const encryptedChar = specialChars.has(char) ? char : finalChar;
        setDisplayValue(prev => prev + encryptedChar);
        setIndex(prev => prev + 1);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [index, valueToEncrypt]);

  return (
    <Stack className="fp-field" direction="column">
      <label className="fp-label">{label}</label>
      {valueToEncrypt && (
        <Stack justifyContent="space-between" className="fp-input" alignItems="center">
          <Stack flex={1} color="secondary" overflow="hidden">
            {displayValue}
          </Stack>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1, duration: 0.5, ease: 'easeInOut' } }}
            style={{ width: 16, height: 16 }}
          >
            <IcoLock16 color="success" />
          </motion.div>
        </Stack>
      )}
    </Stack>
  );
};

export default EncryptedInput;
