import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation from './navigation/Navigation';

export default function App() {
  return (
    <PaperProvider>
      <Navigation />
    </PaperProvider>
  );
}