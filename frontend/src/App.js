// frontend/src/App.js
import React from 'react';
import './index.css';
import Header from './components/Header';
import LandingPage from './components/LandingPage';

function App() {
    return (
        <div className="container">
            <Header />
            <LandingPage />
        </div>
    );
}

export default App;