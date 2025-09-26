import { Container, Box } from "@mui/material";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import './App.css'

export default function App() {
  return (
    <>
      <Header/>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <SearchBar />
        </Box>
      </Container>
    </>
  );
}
