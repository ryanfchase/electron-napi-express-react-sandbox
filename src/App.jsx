import React, { useState } from "react";
import axios from './api';

function App() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState('');

  const handleNameChange = (event) => {
    setName(event.target.value);
  }

  const handleSendHelloWorld = () => {
    axios.get('/')
    .then(response => {
      console.log('response from server: ' + response.data);
      setResponse(response.data);
    })
    .catch(error => {
      console.error("Error: ", error);
      setResponse(error);
    })

  };

  const handleGreetUser = () => {
    axios.get('/greet', {
      params: {
        name: name,
      }
    })
    .then(response => {
      console.log('response from server: ' + response.data);
      setResponse(response.data);
    })
    .catch(error => {
      console.error("Error: ", error);
      setResponse(error);
    })
  };

  const handleGetInfo = () => {
    axios.get('/info')
    .then(response => {
      console.log('response from server: ' + response.data);
      setResponse(response.data);
    })
    .catch(error => {
      console.error("Error: ", error);
      setResponse(error);
    })
  }

  return (
    <div>
      <h1>Hello Celestron World!</h1>
      <p>Welcome to your Electron application.</p>
      <button onClick={handleSendHelloWorld}>Send Hello World</button>
      <p/>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={handleNameChange}
      >
      </input>
      <button onClick={handleGreetUser}>Greet Celestron User</button>
      <p/>
      <button onClick={handleGetInfo}>Get System Info</button>
      <p>Server Response:</p>
      <pre>
        {response}
      </pre>
    </div>
  );
}

export default App;