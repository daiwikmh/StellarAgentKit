import { Routes, Route } from 'react-router';
import ChatInterface from '@/components/Chat/ChatInterface';
import LandingPage from './components/landing-page/Landing';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<ChatInterface />} />
    </Routes>
  );
}

export default App;
