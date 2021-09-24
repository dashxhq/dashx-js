import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Check console for logs
        </p>
        <a
          className="App-link"
          href="https://github.com/dashxhq/dashx-js/tree/master/packages/web#readme"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Docs
        </a>
      </header>
    </div>
  );
}

export default App;
