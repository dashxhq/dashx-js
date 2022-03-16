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
dx.fetchStoredPreferences("0111c6f9-e8c8-492e-aa94-678b76bd3dc5").then((res) => {
  dx.saveStoredPreferences("0111c6f9-e8c8-492e-aa94-678b76bd3dc5", res).then(console.log)
})
dx.saveContacts("6ca763ab-4f21-4c97-bbdd-9b1223762846", [{kind: 'PHONE',tag: '', value:'+91 9876543210'}]).then(console.log).catch(console.log)


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
