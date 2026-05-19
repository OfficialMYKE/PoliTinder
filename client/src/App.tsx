import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { AuthProvider } from "./contexts/AuthContext";
import { createStorageServices } from "./services/storage";

const { tokenStorage, userStorage } = createStorageServices();

function App() {
  return (
    <AuthProvider tokenStorage={tokenStorage} userStorage={userStorage}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
