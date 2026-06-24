import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import VerificationPage from "./pages/verification/VerificationPage";
import VerificationDetails from "./pages/verificationDetails/VerificationDetailsPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/verification/:userId" element={<VerificationDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;