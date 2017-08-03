import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker';

import App from './App';
import './styles/general.css';
import './styles/index.css';
import './styles/style.css';

render((

  <BrowserRouter>
    <Route path='/' component={App} />
  </BrowserRouter>
), document.getElementById('root'));

registerServiceWorker();
