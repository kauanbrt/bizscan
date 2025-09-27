import { createContext, useContext, useState, useMemo } from "react";

const CnpjContext = createContext(null);

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
            ? [5,4,3,2,9,8,7,6,5,4,3,2]
            : [6,5,4,3,2,9,8,7,6,5,4,3,2];
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

export function CnpjProvider({ children }) {
    const [input, setInput] = useState("");
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    /* 
        Utilizaçao do Hook escolhido (useMemo) - "memoiza" o valor 
        normalizado e a validação do CNPJ, para evitar recalcular a 
        cada nova renderização.
    */
    const cnpj = useMemo(() => normalizeCnpj(input), [input]);
    const isInvalid = useMemo(() => cnpj && !isValidCnpj(cnpj), [cnpj]);

    /* Realiza a busca na API */
    async function search() {
        setErr(""); setData(null);
        if (!cnpj || isInvalid) { setErr("Informe um CNPJ válido."); return; }
        try {
            setLoading(true);
            const res = await fetch(`https://api.opencnpj.org/${cnpj}`);
            if (res.status === 404) throw new Error("CNPJ não encontrado.");
            if (!res.ok) throw new Error(`Erro ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (e) {
            setErr(e.message || "Erro ao buscar CNPJ.");
        } finally {
            setLoading(false);
        }
    }

    /* Reseta os dados para uma nova consulta */
    function resetSearch() {
        setData(null);
        setErr("");
        setInput("");
    }

    const value = { input, setInput, cnpj, isInvalid, data, err, setErr, loading, search, resetSearch };
    return <CnpjContext.Provider value={value}>{children}</CnpjContext.Provider>;
}

export function useCnpj() {
    const ctx = useContext(CnpjContext);
    if (!ctx) throw new Error("useCnpj must be used within CnpjProvider");
    return ctx;
}
