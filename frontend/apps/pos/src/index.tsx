import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';
import Providers from './components/providers';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <Providers>
      <App />
    </Providers>,
  );
}
