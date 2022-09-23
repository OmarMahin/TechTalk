import React from 'react';
import ReactDOM from 'react-dom/client';
import firebaseConfig from './FirebaseConfig';
import store from './store'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>

);
