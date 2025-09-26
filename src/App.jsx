import { Container, Stack } from "@mui/material";
import Header from "./components/Header";
import HeroCard from "./components/HeroCard";
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
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        <Stack spacing={7} sx={{ width: "100%" }}>
          <HeroCard />
          <SearchBar />
        </Stack>
      </Container>
    </>
  );
}
