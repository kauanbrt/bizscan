import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function CompanyList({ onEdit }) {
  const { token, logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, company: null });

  async function loadCompanies(pageNum = 1) {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/companies?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao carregar empresas");
      }

      const data = await response.json();
      setCompanies(data.data);
      setTotalPages(data.pagination.totalPages);
      setPage(pageNum);
    } catch (err) {
      toast.error(err.message || "Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteDialog.company) return;

    try {
      const response = await fetch(`${API_URL}/companies/${deleteDialog.company.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        toast.error("Sessão expirada. Faça login novamente.");
        setDeleteDialog({ open: false, company: null });
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao deletar empresa");
      }

      toast.success("Empresa deletada com sucesso");
      setDeleteDialog({ open: false, company: null });
      loadCompanies(page);
    } catch (err) {
      toast.error(err.message || "Erro ao deletar empresa");
      setDeleteDialog({ open: false, company: null });
    }
  }

  useEffect(() => {
    loadCompanies(1);
  }, []);

  function handlePageChange(event, value) {
    loadCompanies(value);
  }

  function formatCnpj(cnpj) {
    if (!cnpj) return "";
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  if (loading && companies.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {companies.length === 0 ? (
        <Box
          className="card-dark"
          sx={{
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "hsl(var(--muted-foreground))" }}>
            Nenhuma empresa cadastrada
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            {companies.map((company) => (
              <Box
                key={company.id}
                className="card-dark"
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {company.razaoSocial}
                  </Typography>
                  {company.nomeFantasia && (
                    <Typography variant="body2" sx={{ color: "hsl(var(--muted-foreground))", mb: 1 }}>
                      {company.nomeFantasia}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: "hsl(var(--muted-foreground))" }}>
                    CNPJ: {formatCnpj(company.cnpj)}
                  </Typography>
                  {company.cidade && company.uf && (
                    <Typography variant="body2" sx={{ color: "hsl(var(--muted-foreground))" }}>
                      {company.cidade} - {company.uf}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={() => onEdit(company)}
                    sx={{
                      color: "hsl(var(--primary))",
                      "&:hover": {
                        bgcolor: "hsl(var(--primary) / 0.1)",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, company })}
                    sx={{
                      color: "hsl(var(--destructive))",
                      "&:hover": {
                        bgcolor: "hsl(var(--destructive) / 0.1)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "hsl(var(--foreground))",
                    borderColor: "hsl(var(--border))",
                  },
                  "& .Mui-selected": {
                    bgcolor: "hsl(var(--primary)) !important",
                    color: "hsl(var(--primary-foreground))",
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, company: null })}
        PaperProps={{
          sx: {
            bgcolor: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a empresa{" "}
            <strong>{deleteDialog.company?.razaoSocial}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, company: null })}
            sx={{ color: "hsl(var(--muted-foreground))" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              bgcolor: "hsl(var(--destructive))",
              color: "hsl(var(--destructive-foreground))",
              "&:hover": {
                bgcolor: "hsl(var(--destructive) / 0.9)",
              },
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
