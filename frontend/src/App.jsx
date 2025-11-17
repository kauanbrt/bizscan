import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CnpjProvider } from "./contexts/CnpjContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { CircularProgress, Box } from "@mui/material";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Home /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <CnpjProvider>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </CnpjProvider>
    </AuthProvider>
  );
}
