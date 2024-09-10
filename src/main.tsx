import React, {  } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App';
import './index.css';
import store from './store/store';

const rootElement = document.getElementById('root');

const AppWrapper = () => {
  return <App />;
};

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <AppWrapper />
      </Provider>
    </React.StrictMode>,
  );
}
