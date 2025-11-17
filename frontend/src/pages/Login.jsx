import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Box,
  CircularProgress,
} from "@mui/material";
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Erro ao fazer login");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Box className="card-dark" sx={{ p: 4, width: "100%" }}>
        <Stack spacing={3}>
          {/* Logo */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
              }}
            >
              <span className="brand-badge">
                <QueryStatsIcon fontSize="small" sx={{ color: "hsl(var(--primary-foreground))" }} />
              </span>
              <Box>
                <Typography variant="h5" className="brand-title">
                  BizScan
                </Typography>
                <Typography variant="caption" className="brand-sub">
                  Business Scan
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: "hsl(var(--muted-foreground))" }}>
              Faça login para continuar
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
                autoFocus
                className="input-dark"
              />

              <TextField
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                className="input-dark"
              />

              {error && (
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{
                    bgcolor: 'hsl(var(--destructive))',
                    color: 'hsl(var(--destructive-foreground))',
                    '& .MuiAlert-icon': { color: 'hsl(var(--destructive-foreground))' },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                className="btn-gradient"
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "hsl(var(--muted-foreground))" }} /> : "Entrar"}
              </Button>
            </Stack>
          </form>

          {/* Credenciais de teste */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "hsl(var(--bg))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          >
            <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))", display: "block", mb: 0.5 }}>
              Usuários de teste:
            </Typography>
            <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))", display: "block" }}>
              • teste@example.com / senha123
            </Typography>
            <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))", display: "block" }}>
              • admin@example.com / teste456
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
