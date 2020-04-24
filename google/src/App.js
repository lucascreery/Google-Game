import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route} from "react-router-dom";
import HomeScreen from './home-screen';
import HostScreen from './host-screen.js';
import GameScreen from './game-screen.js';

function App() {
  return (
    <Router>
      <Route path="/" exact component={HomeScreen} />
      <Route path="/game/:game" exact component={GameScreen} />
      <Route path="/host" exact component={HostScreen} />
    </Router>
  );
}

export default App;
