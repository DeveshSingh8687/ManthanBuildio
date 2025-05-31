import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation from './navigation/Navigation';
import 'react-native-get-random-values';


export default function App() {
  return (
    <PaperProvider>
      <Navigation />
    </PaperProvider>
  );
}