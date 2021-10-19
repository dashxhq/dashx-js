import React from 'react';
import ReactDOM from 'react-dom';
import DashX from '@dashx/web';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const dx = DashX({
  publicKey: process.env.REACT_APP_DASHX_PUBLIC_KEY,
  baseUri: 'https://api.dashx-staging.com/graphql',
  targetInstallation: "clay-5TBlv8"
});

dx.identify({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8910'
}).then(console.log);

dx.searchContent('page', { returnType: 'all', limit: 10 })
  .then(console.log);

dx.fetchContent('page/new').then(console.log);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();