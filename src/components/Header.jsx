import { AppBar, Toolbar, Box, Typography, Button } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import QueryStatsIcon from '@mui/icons-material/QueryStats';

export default function Header() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="header-dark"
      sx={{
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 64 }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box
                className="brand-wrap"
                aria-label="BizScan - Página inicial"
            >
                <span className="brand-badge">
                    <QueryStatsIcon fontSize="small" sx={{ color: "hsl(var(--primary-foreground))" }} />
                </span>

                <Box sx={{ display: "grid" }}>
                <Typography variant="h6" className="brand-title">BizScan</Typography>
                <Typography variant="caption" className="brand-sub">
                    Business Scan
                </Typography>
                </Box>
            </Box>
        </Box>

        {/* Github do Projeto */}
        <Button
          variant="contained"
          className="btn-gradient"
          startIcon={<GitHubIcon />}
          href="https://github.com/kauanbrt/bizscan"
          target="_blank"
          rel="noreferrer"
          sx={{ textTransform: "none" }}
        >
          GitHub
        </Button>
      </Toolbar>
    </AppBar>
  );
}
