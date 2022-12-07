import React from 'react';

export type WelcomeStepProps = {
  id: string;
  onComplete: () => void;
};

const WelcomeStep = ({ id, onComplete }: WelcomeStepProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <div>Welcome to Footprint!</div>
    </form>
  );
};

export default WelcomeStep;
