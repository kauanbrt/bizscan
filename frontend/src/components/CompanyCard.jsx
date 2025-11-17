import { Card, CardContent, Typography, Chip, Stack, Grid, Divider, Box, Link } from "@mui/material";

/* Formata CNPJ */
function formatCnpj(c) {
    const v = (c || "").replace(/\D/g, "");
    return v.length === 14 ? v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5") : c;
}

/* Formata data */
function formatDate(d) {
    if (!d) return "—";
    const [y,m,day] = (d || "").split("-").map(Number);
    if (!y || !m || !day) return d;
    return new Date(y, m - 1, day).toLocaleDateString("pt-BR");
}

/* Formata CEP */
function formatCep(cep) {
    const v = (cep || "").replace(/\D/g, "");
    return v.length === 8 ? v.replace(/^(\d{5})(\d{3})$/, "$1-$2") : cep || "—";
}

/* Formata telefone */
function formatPhone(ddd, numero) {
    const n = String(numero || "").replace(/\D/g, "");
    if (!ddd && !n) return "—";
    if (n.length === 8) return `(${ddd}) ${n.replace(/^(\d{4})(\d{4})$/, "$1-$2")}`;
    if (n.length === 9) return `(${ddd}) ${n.replace(/^(\d)(\d{4})(\d{4})$/, "$1 $2-$3")}`;
    if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
    if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,3)} ${n.slice(3,7)}-${n.slice(7)}`;
    return `(${ddd || "—"}) ${numero || ""}`;
}

/* Formata dinheiro */
function formatMoney(v) {
    if (v == null || v === "") return "—";
    const num = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    if (Number.isNaN(num)) return String(v);
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

/* Máscara do CNAE */
function maskCnae(code) {
    const c = (code || "").replace(/\D/g, "");
    // 7 dígitos → NNNN-N/NN
    return c.length === 7 ? c.replace(/^(\d{4})(\d)(\d{2})$/, "$1-$2/$3") : code || "—";
}

/* Formata endereço */
function joinAddress(d) {
    const arr = [
    d.logradouro, d.numero, d.complemento, d.bairro,
    d.municipio && `${d.municipio}/${d.uf}`, formatCep(d.cep)
    ].filter(Boolean);
    return arr.join(", ");
}

export default function CompanyCard({ data }) {
    const address = joinAddress(data);
    const cnaesSecCount = data.cnaes_secundarios_count ?? (Array.isArray(data.cnaes_secundarios) ? data.cnaes_secundarios.length : 0);

    return (
        <Card
            variant="outlined"
            className="card-dark"
            sx={{
                borderColor: "hsl(var(--border))",
                bgcolor: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                borderRadius: "var(--radius)"
            }}
        >
            <CardContent>
                {/* Razão Social / CNPJ */}
                <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {data.razao_social || "Razão Social não informada"}
                    </Typography>
                    {data.nome_fantasia && (
                        <Typography variant="body2" sx={{ color: "hsl(var(--muted-foreground))" }}>
                            {data.nome_fantasia}
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: "hsl(var(--muted-foreground))" }}>
                        CNPJ: {formatCnpj(data.cnpj)}
                    </Typography>
                </Stack>

                {/* Status / CNAE */}
                <Stack direction="row" spacing={1} sx={{ my: 1.5, flexWrap: "wrap" }}>
                    {data.situacao_cadastral && (
                        <Chip
                            label={`Situação: ${data.situacao_cadastral}`}
                            sx={{
                                bgcolor: "hsl(var(--secondary))",
                                color: "hsl(var(--secondary-foreground))",
                                borderRadius: "var(--radius)"
                            }}
                            size="small"
                        />
                    )}
                    {data.matriz_filial && (
                        <Chip
                            label={data.matriz_filial}
                            sx={{ bgcolor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))", borderRadius: "var(--radius)" }}
                            size="small"
                        />
                    )}
                    {(data.cnae_principal || data.cnae_principal_descricao) && (
                        <Chip
                            label={`CNAE: ${maskCnae(data.cnae_principal)}${cnaesSecCount ? ` (+${cnaesSecCount} secundários)` : ""}`}
                            sx={{ borderColor: "hsl(var(--ring))", color: "var(--muted-foreground)", borderWidth: 1, borderStyle: "solid", borderRadius: "var(--radius)" }}
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Stack>
                {data.cnae_principal_descricao && (
                    <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>
                        {data.cnae_principal_descricao}
                    </Typography>
                )}

                <Divider sx={{ borderColor: "hsl(var(--border))", my: 1.5 }} />

                {/* Outros dados */}
                <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Início da atividade</Typography>
                        <Typography variant="body2">{formatDate(data.data_inicio_atividade)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Situação desde</Typography>
                        <Typography variant="body2">{formatDate(data.data_situacao_cadastral)}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Natureza jurídica</Typography>
                        <Typography variant="body2">{data.natureza_juridica || "—"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Porte</Typography>
                        <Typography variant="body2">{data.porte_empresa || "—"}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Endereço</Typography>
                        <Typography variant="body2">{address || "—"}</Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: "hsl(var(--border))", my: 1.5 }} />

                {/* Regimes / Capital */}
                <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Simples</Typography>
                        <Typography variant="body2">
                            {data.opcao_simples === true ? `Sim (${formatDate(data.data_opcao_simples)})`
                            : data.opcao_simples === false ? "Não" : "—"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>MEI</Typography>
                        <Typography variant="body2">
                            {data.opcao_mei === true ? `Sim (${formatDate(data.data_opcao_mei)})`
                            : data.opcao_mei === false ? "Não" : "—"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Capital social</Typography>
                        <Typography variant="body2">{formatMoney(data.capital_social)}</Typography>
                    </Grid>
                </Grid>

                {/* Contatos */}
                {(data.email || (Array.isArray(data.telefones) && data.telefones.length)) && (
                    <>
                        <Divider sx={{ borderColor: "hsl(var(--border))", my: 1.5 }} />
                        <Grid container spacing={1.5}>
                            {data.email && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Email</Typography>
                                <Typography variant="body2">
                                <Link href={`mailto:${String(data.email).toLowerCase()}`} underline="hover" color="inherit">
                                    {String(data.email).toLowerCase()}
                                </Link>
                                </Typography>
                            </Grid>
                            )}
                            {Array.isArray(data.telefones) && data.telefones.length > 0 && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{ color: "hsl(var(--muted-foreground))" }}>Telefones</Typography>
                                <Box>
                                {data.telefones.map((t, i) => (
                                    <Typography key={i} variant="body2">
                                    {formatPhone(t.ddd, t.numero)}{t.is_fax ? " • Fax" : ""}
                                    </Typography>
                                ))}
                                </Box>
                            </Grid>
                            )}
                        </Grid>
                    </>
                )}

                {/* QSA */}
                {Array.isArray(data.QSA) && data.QSA.length > 0 && (
                    <>
                        <Divider sx={{ borderColor: "hsl(var(--border))", my: 1.5 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>QSA (Sócios/Administradores)</Typography>
                        <Stack spacing={0.5}>
                            {data.QSA.map((s, i) => (
                            <Typography key={i} variant="body2">
                                • {s.nome_socio}{s.qualificacao_socio ? ` — ${s.qualificacao_socio}` : ""}
                            </Typography>
                            ))}
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
