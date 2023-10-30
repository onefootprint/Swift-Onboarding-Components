type GetStepProps = {
  value: string;
};

const getStep = ({ value }: GetStepProps) => {
  let step = 0;
  if (value === 'whoToOnboard') {
    step = 0;
  } else if (value === 'nameYourPlaybook') {
    step = 1;
  } else if (value === 'summary') {
    step = 2;
  } else if (value === 'authorizedScopes') {
    step = 3;
  } else if (value === 'aml') {
    step = 4;
  }
  return step;
};

export default getStep;
