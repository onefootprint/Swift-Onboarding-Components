import AdditionalDocumentsCard from './cards/additional-documents-card';
import AmlCard from './cards/aml-card';
import EditingAdditionalDocsCard from './cards/editing-additional-docs-card';
import GovernmentIdCard from './cards/government-id-card';
import InvestorQuestionsCard from './cards/investor-questions-card';
import KycCard from './cards/kyc-card';
import PersonalInformationCard from './cards/personal-information-card';

const IllustrationGrid = () => {
  return (
    <div
      className="relative items-start self-start flex flex-col gap-2 md:grid md:grid-cols-[520px_520px_520px] mx-auto md:w-fit w-[95%]"
      style={{ maskImage: 'radial-gradient(200% 100% at 50% 0%, white 0%, white 75%, transparent 100%)' }}
    >
      <div className="flex flex-col h-full gap-2">
        <KycCard />
        <InvestorQuestionsCard className="hidden md:block" />
        <EditingAdditionalDocsCard />
        <span className="hidden w-full h-full border border-dashed rounded bg-secondary border-tertiary md:block" />
      </div>
      <div className="flex flex-col h-full gap-2">
        <AdditionalDocumentsCard className="hidden md:block" />
        <GovernmentIdCard />
        <AmlCard />
        <span className="hidden w-full h-full border border-dashed rounded bg-secondary border-tertiary md:block" />
      </div>
      <div className="flex flex-col h-full gap-2">
        <PersonalInformationCard className="hidden md:block" />
      </div>
    </div>
  );
};

export default IllustrationGrid;
