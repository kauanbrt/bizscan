import { TextField, Button, Alert, CircularProgress, Stack } from "@mui/material";
import { useCnpj } from "../contexts/CnpjContext";
import { useState } from "react";

export default function SearchBar(){
    const { input, setInput, cnpj, isInvalid, loading, err, setErr, search } = useCnpj();
    const [touched, setTouched] = useState(false);

    const showError = touched && (!cnpj || isInvalid);
    const helper = !touched ? " " : (!cnpj ? "Campo obrigatório" : (isInvalid ? "CNPJ inválido" : " "));

    /* Valida se o campo foi preenchido e é um CNPJ válido  */
    const validate = () => {
        const value = (cnpj ?? "").trim();

        if (!value) {
            setErr("Campo obrigatório não preenchido!");
            return;
        }
        if (isInvalid) {
            setErr("Informe um CNPJ válido.");
            return;
        }

        setErr("");
        search();
    };

    return (
        <Stack spacing={2}>
            <TextField
                label="Digite o CNPJ"
                value={input}
                onBlur={()=>setTouched(true)}
                onChange={(e)=>setInput(e.target.value)}
                placeholder="00.000.000/0000-00"
                error={showError}
                helperText={helper}
                fullWidth
                className="input-dark"
            />

            <Button variant="contained" className="btn-gradient" onClick={validate}>
                {loading ? <CircularProgress color="var(--muted-foreground))" size={22}/> : "Buscar"}
            </Button>

            {err && <Alert
                        severity="error"
                        variant="filled"
                        sx={{
                            bgcolor: 'hsl(var(--destructive))',
                            color: 'hsl(var(--destructive-foreground))',
                            '& .MuiAlert-icon': { color: 'hsl(var(--destructive-foreground))' },
                            '& .MuiAlert-action': { color: 'hsl(var(--destructive-foreground))' },
                        }}
                    >
                        {err}
                    </Alert>
            }
        </Stack>
    );
}