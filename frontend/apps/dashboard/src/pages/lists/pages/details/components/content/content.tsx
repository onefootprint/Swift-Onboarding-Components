import ActivityLog from './components/activity-log';
import Breadcrumb from './components/breadcrumb';
import Entries from './components/entries';
// import Header from './components/header';
// import Playbooks from './components/playbooks';

const Content = () => (
  <section data-testid="list-content">
    <div className="mb-7">
      <Breadcrumb />
    </div>
    {/* <div className="mb-7">
      <Header />
    </div> */}
    <div className="flex flex-col gap-9">
      <Entries />
      {/* <Playbooks /> */}
      <ActivityLog />
    </div>
  </section>
);

export default Content;
