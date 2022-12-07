import React from 'react';

export type UserDataStepProps = {
  id: string;
  onComplete: () => void;
};

const UserDataStep = ({ id, onComplete }: UserDataStepProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <div>Tell us about you</div>
    </form>
  );
};

export default UserDataStep;
