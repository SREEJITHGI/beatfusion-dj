import { DJMixerProvider } from './context/DJMixerContext';
import { MainStudioLayout } from './components/MainStudioLayout';
import './App.css';

function App() {
  return (
    <DJMixerProvider>
      <MainStudioLayout />
    </DJMixerProvider>
  );
}

export default App;
