import { TextField, Button, Alert, CircularProgress, Stack } from "@mui/material";
import CompanyCard from "./CompanyCard";
import { useCnpj } from "../contexts/CnpjContext";

export default function SearchBar(){
    const { input, setInput, isInvalid, loading, err, data, search } = useCnpj();

    return (
        <Stack spacing={2}>
            <TextField
                label="CNPJ"
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                placeholder="00.000.000/0000-00"
                error={!!input && isInvalid}
                helperText={isInvalid ? "CNPJ inválido" : " "}
                fullWidth
                className="input-dark"
            />

            <Button variant="contained" className="btn-gradient" onClick={search}>
                {loading ? <CircularProgress color="var(--muted-foreground))" size={22}/> : "Buscar"}
            </Button>

            {err && <Alert severity="error">{err}</Alert>}
            {data && <CompanyCard data={data} />}
        </Stack>
    );
}