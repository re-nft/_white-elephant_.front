import React, { useState, useEffect } from 'react';
import { Steal } from './steal';
import './style.css';
import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import { MainFrame } from './MainFrame';
import { Intro } from './Intro';
import { Navigation } from './Navigation';

function App() {


  return (
    <div>

      <Navigation />

      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <Intro />
        <MainFrame />

        <Steal />
      </div>

    </div>
  );
}

export default App;