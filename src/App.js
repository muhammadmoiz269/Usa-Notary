import { createTheme, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { Route, Routes } from "react-router-dom";
import io from "socket.io-client";
import HomePage from "./pages/HomePage";
import NotaryAndSigner from "./pages/NotaryAndSigner";
import SignerCreation from "./pages/SignerCreation";
import TemplateCreation from "./pages/TemplateCreation";
export const skt = io("http://localhost:3000");

function App() {
  const theme = createTheme();
  return (
    <>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signer/:id" element={<SignerCreation />} />
            <Route path="/templatecreation/:id" element={<TemplateCreation />} />
            <Route path="/notarization/:id" element={<NotaryAndSigner />} />
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
