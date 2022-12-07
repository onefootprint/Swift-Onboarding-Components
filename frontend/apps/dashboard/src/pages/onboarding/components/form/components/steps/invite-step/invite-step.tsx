import React from 'react';

export type InviteStepProps = {
  id: string;
  onComplete: () => void;
};

const InviteStep = ({ id, onComplete }: InviteStepProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <div>Invite teammates</div>
    </form>
  );
};

export default InviteStep;
