import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import { getToken } from './utils';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import "gestalt/dist/gestalt.css";

import Signin from './components/Signin';
import Signup from './components/Signup';
import Checkout from './components/Checkout';
import Navbar from './components/Navbar';
import Toys from './components/Toys';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    getToken() !== null ?
      <Component {...props}></Component> : <Redirect to={{
        pathname: '/signin',
        state: { from: props.location }
      }}></Redirect>
  )}>
  </Route>
)

const Root = () => (
  <Router>
    <React.Fragment>
      <Navbar></Navbar>
        <Switch>
          <Route component={App} exact path="/" ></Route>
          <Route component={Signin} path="/signin" ></Route>
          <Route component={Signup} path="/signup" ></Route>
          <PrivateRoute component={Checkout} path="/checkout" ></PrivateRoute>
          <Route component={Toys} path="/:brandId"></Route>
        </Switch>
    </React.Fragment>
  </Router>
)

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
