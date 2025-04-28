import { Routes, Route } from "react-router";
import Navbar from "./components/landing/navbar";
import StellarChat from "./pages/StellarChat";
import StakingImpl from "./components/StakingImpl";
import Hero from "./components/landing-page/Landing";
import LandingPage from "./components/landing-page/Landing";

function App() {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<StellarChat />} />
      </Routes>
    </>
  );
}

export default App;
