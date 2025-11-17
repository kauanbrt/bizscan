import { Box, Typography } from "@mui/material";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

export default function HeroCard() {
  return (
    <Box className="hero">
      <div className="hero-head">
        <span className="hero-badge">
          <QueryStatsIcon sx={{ color: "hsl(var(--primary-foreground))" }} />
        </span>

        <div>
          <Typography variant="h6" className="hero-title">BizScan</Typography>
          <Typography variant="body2" className="hero-sub">
            Business Scan · Consulta de empresas via CNPJ
          </Typography>
        </div>
      </div>

      <hr className="hero-sep" />

      <Typography variant="body2" className="hero-desc">
        Consulte os dados públicos cadastrais, CNAEs e contatos de empresas apenas com o CNPJ!
      </Typography>
      <Typography variant="body2" className="hero-desc">
        Projeto da disciplina de <strong>Desenvolvimento Web Fullstack</strong> (UTFPR).
      </Typography>
      <Typography variant="body2" className="hero-desc">
        Desenvolvido por <strong>Kauan Borotto</strong> e utiliza a API pública do <a href="https://opencnpj.org/" target="_blank">OpenCNPJ</a>.
      </Typography>
    </Box>
  );
}
