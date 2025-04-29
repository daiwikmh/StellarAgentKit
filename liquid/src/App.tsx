import { Routes, Route } from "react-router";
import Navbar from "./components/landing/navbar";
import StellarChat from "./pages/StellarChat";
import StakingImpl from "./components/StakingImpl";
import Hero from "./components/landing-page/Landing";
import LandingPage from "./components/landing-page/Landing";
import LiquidationPoolApp from "./components/Liquidation";
import PriceOracleApp from "./components/oracle";

function App() {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LiquidationPoolApp />} />

      </Routes>
    </>
  );
}

export default App;
