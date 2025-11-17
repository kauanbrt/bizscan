import { Container, Stack, Box, Button, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import Header from "../components/Header";
import HeroCard from "../components/HeroCard";
import SearchBar from "../components/SearchBar";
import CompanyCard from "../components/CompanyCard";
import InsertForm from "../components/InsertForm";
import CompanyList from "../components/CompanyList";
import EditForm from "../components/EditForm";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { useCnpj } from "../contexts/CnpjContext";

export default function Home() {
  const { data, resetSearch } = useCnpj();
  const [tab, setTab] = useState(0); // 0 = busca, 1 = inserção, 2 = listagem
  const [editingCompany, setEditingCompany] = useState(null);

  function handleTabChange(event, newValue) {
    setTab(newValue);
    resetSearch();
    setEditingCompany(null);
  }

  function handleEdit(company) {
    setEditingCompany(company);
  }

  function handleCancelEdit() {
    setEditingCompany(null);
  }

  function handleEditSuccess() {
    setEditingCompany(null); // Volta para a listagem
  }

  function handleInsertSuccess() {
    setTab(2); // Muda para a tab de listagem
  }

  return (
    <>
      <Header />
      <Container
        maxWidth="sm"
        sx={{
          minHeight: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)" },
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        {data ? (
          <Stack spacing={2} sx={{ width: "100%" }}>
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
                Nova operação
              </Button>
            </Box>
            <CompanyCard data={data} />
          </Stack>
        ) : (
          <Stack spacing={4} sx={{ width: "100%" }}>
            <HeroCard />

            <Box sx={{ borderBottom: 1, borderColor: "hsl(var(--border))" }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                centered
                sx={{
                  '& .MuiTab-root': {
                    color: 'hsl(var(--muted-foreground))',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      color: 'hsl(var(--primary))',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'hsl(var(--primary))',
                  },
                }}
              >
                <Tab label="Buscar" />
                <Tab label="Inserir" />
                <Tab label="Listar" />
              </Tabs>
            </Box>

            {tab === 0 && <SearchBar />}
            {tab === 1 && <InsertForm onSuccess={handleInsertSuccess} />}
            {tab === 2 && (
              editingCompany ? (
                <EditForm company={editingCompany} onCancel={handleCancelEdit} onSuccess={handleEditSuccess} />
              ) : (
                <CompanyList onEdit={handleEdit} />
              )
            )}
          </Stack>
        )}
      </Container>
    </>
  );
}
