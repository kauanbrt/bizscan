import { Container, Stack, Box, Button } from "@mui/material";
import Header from "./components/Header";
import HeroCard from "./components/HeroCard";
import SearchBar from "./components/SearchBar";
import CompanyCard from "./components/CompanyCard";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { useCnpj } from "./contexts/CnpjContext";
import './App.css'

export default function App() {
  const { data, resetSearch } = useCnpj();

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
        { data
          ? <Stack spacing={2} sx={{ width: "100%" }}>
            <Box sx={{ width: "100%", display: "flex", mb: 1 }}>
              <Button
                onClick={resetSearch}
                startIcon={<ReplayRoundedIcon />}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: "var(--radius)",
                  borderColor: "hsl(var(--ring))",
                  color: "hsl(var(--foreground))",
                  "&:hover": {
                    borderColor: "hsl(var(--ring))",
                    background: "hsl(var(--secondary))",
                  },
                }}
              >
                Fazer outra consulta
              </Button>
            </Box>
            <CompanyCard data={data} />
          </Stack>
          : <Stack spacing={7} sx={{ width: "100%" }}>
            <HeroCard />
            <SearchBar />
          </Stack>
        }
      </Container>
    </>
  );
}
