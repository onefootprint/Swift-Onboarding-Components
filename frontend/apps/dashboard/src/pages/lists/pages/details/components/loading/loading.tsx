import { Divider, Shimmer } from '@onefootprint/ui';

const Loading = () => (
  <section aria-label="entity-loading" className="pt-7">
    <div className="mb-7">
      <Breadcrumb />
    </div>
    <div className="mb-5">
      <Header />
    </div>
    <div className="mb-5">
      <Divider />
    </div>
    <div className="mb-9">
      <Vault />
    </div>
  </section>
);

const Breadcrumb = () => (
  <div className="flex gap-3">
    <Shimmer height="20px" width="76px" />
    <Shimmer height="20px" width="6px" />
    <Shimmer height="20px" width="48px" />
  </div>
);

const Header = () => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-row items-center gap-3">
      <div id="entity-kind">
        <Shimmer height="28px" width="105px" />
      </div>
      <div id="entity-status">
        <Shimmer height="24px" width="64px" borderRadius="xl" />
      </div>
    </div>
    <div id="subheader" className="flex flex-row justify-between h-8 gap-3">
      <div className="flex flex-row items-center gap-3">
        <div id="entity-timestamp">
          <Shimmer height="20px" width="105px" />
        </div>
        <div>
          <Shimmer height="3px" width="3px" />
        </div>
        <div id="entity-id">
          <Shimmer height="26px" width="253px" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Shimmer height="32px" width="114px" />
        <Shimmer height="32px" width="114px" />
      </div>
    </div>
  </div>
);

const Vault = () => (
  <div className="grid grid-cols-2 gap-5">
    <div>
      <Shimmer height="317px" minWidth="264px" />
    </div>
    <div>
      <Shimmer height="317px" minWidth="264px" />
    </div>
    <div>
      <Shimmer height="235px" minWidth="264px" />
    </div>
    <div>
      <Shimmer height="235px" minWidth="264px" />
    </div>
  </div>
);

export default Loading;
