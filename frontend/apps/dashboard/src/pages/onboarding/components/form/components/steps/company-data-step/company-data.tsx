import React from 'react';

export type CompanyDataStepProps = {
  id: string;
  onComplete: () => void;
};

const CompanyDataStep = ({ id, onComplete }: CompanyDataStepProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <div>Tell us about your company</div>
    </form>
  );
};

export default CompanyDataStep;
