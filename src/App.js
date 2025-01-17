import React, { useState } from 'react';
import UploadResume from './components/UploadResume';
// import Results from './components/Results';
import axios from 'axios';
import { Container } from '@mui/material';

const App = () => {
  return (
    <Container>
      <UploadResume/>
    </Container>
  );
};

export default App;
