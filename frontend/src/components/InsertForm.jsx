import { TextField, Button, CircularProgress, Stack, Box } from "@mui/material";
import { useState } from "react";
import { useCnpj } from "../contexts/CnpjContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* Normaliza o input do CNPJ */
function normalizeCnpj(v = "") {
  return v.replace(/\D/g, "");
}

/* Verifica se o CNPJ é válido */
function isValidCnpj(raw = "") {
  const cnpj = (raw || "").replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (baseDigits) => {
    const weights = baseDigits.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = baseDigits.reduce((acc, d, i) => acc + d * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const digits = cnpj.split("").map(Number);
  const d1 = calcDigit(digits.slice(0, 12));
  if (digits[12] !== d1) return false;
  const d2 = calcDigit(digits.slice(0, 13));
  return digits[13] === d2;
}

export default function InsertForm({ onSuccess }) {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    situacao: "",
    cnaePrincipal: "",
    cidade: "",
    uf: "",
  });
  const [touched, setTouched] = useState({});
  const [cnpjError, setCnpjError] = useState("");

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Limpa erro do CNPJ ao digitar
    if (field === "cnpj") {
      setCnpjError("");
    }
  }

  function handleCnpjBlur() {
    setTouched((prev) => ({ ...prev, cnpj: true }));
    const cleaned = normalizeCnpj(formData.cnpj);

    if (!cleaned) {
      setCnpjError("Campo obrigatório");
    } else if (!isValidCnpj(cleaned)) {
      setCnpjError("CNPJ inválido");
    } else {
      setCnpjError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Valida CNPJ antes de submeter
    const cleaned = normalizeCnpj(formData.cnpj);
    if (!cleaned) {
      setCnpjError("Campo obrigatório");
      toast.error("CNPJ é obrigatório");
      return;
    }
    if (!isValidCnpj(cleaned)) {
      setCnpjError("CNPJ inválido");
      toast.error("CNPJ inválido");
      return;
    }

    if (!formData.razaoSocial) {
      toast.error("Razão Social é obrigatória");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        logout();
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao inserir empresa");
      }

      setFormData({
        cnpj: "",
        razaoSocial: "",
        nomeFantasia: "",
        situacao: "",
        cnaePrincipal: "",
        cidade: "",
        uf: "",
      });
      toast.success("Empresa inserida com sucesso");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || "Erro ao inserir empresa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {/* Linha 1: CNPJ e Razão Social */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            label="CNPJ *"
            value={formData.cnpj}
            onChange={(e) => handleChange("cnpj", e.target.value)}
            onBlur={handleCnpjBlur}
            placeholder="00.000.000/0000-00"
            error={touched.cnpj && !!cnpjError}
            helperText={touched.cnpj && cnpjError ? cnpjError : " "}
            fullWidth
            required
            className="input-dark"
          />
          <TextField
            label="Razão Social *"
            value={formData.razaoSocial}
            onChange={(e) => handleChange("razaoSocial", e.target.value)}
            fullWidth
            required
            className="input-dark"
          />
        </Box>

        {/* Linha 2: Nome Fantasia */}
        <TextField
          label="Nome Fantasia"
          value={formData.nomeFantasia}
          onChange={(e) => handleChange("nomeFantasia", e.target.value)}
          fullWidth
          className="input-dark"
        />

        {/* Linha 3: Situação e CNAE */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            label="Situação"
            value={formData.situacao}
            onChange={(e) => handleChange("situacao", e.target.value)}
            fullWidth
            className="input-dark"
          />
          <TextField
            label="CNAE Principal"
            value={formData.cnaePrincipal}
            onChange={(e) => handleChange("cnaePrincipal", e.target.value)}
            fullWidth
            className="input-dark"
          />
        </Box>

        {/* Linha 4: Cidade e UF */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            label="Cidade"
            value={formData.cidade}
            onChange={(e) => handleChange("cidade", e.target.value)}
            fullWidth
            sx={{ flex: { xs: 1, sm: 2 } }}
            className="input-dark"
          />
          <TextField
            label="UF"
            value={formData.uf}
            onChange={(e) => handleChange("uf", e.target.value.toUpperCase())}
            inputProps={{ maxLength: 2 }}
            fullWidth
            sx={{ flex: { xs: 1, sm: 1 } }}
            className="input-dark"
          />
        </Box>

        {/* Botão de submit */}
        <Button
          type="submit"
          variant="contained"
          className="btn-gradient"
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={22} sx={{ color: "hsl(var(--muted-foreground))" }} /> : "Inserir Empresa"}
        </Button>
      </Stack>
    </form>
  );
}
