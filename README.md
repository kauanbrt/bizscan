# BizScan – Consulta de CNPJ

Aplicação em **React (Vite)** para consultar empresas brasileiras pelo **CNPJ** usando a **API pública OpenCNPJ**.  
Trabalho da disciplina **Desenvolvimento Web Fullstack – UTFPR**.

**Disponível online em:** https://bizscan.fly.dev/

---

## O que faz
- Busca CNPJ (com ou sem pontuação)
- Mostra razão social, nome fantasia, situação, CNAE, endereço, contatos, capital social e QSA
- Mensagens de erro para CNPJ vazio, inválido e não encontrado

---

## Tecnologias
- React + Vite  
- Material UI (MUI)  
- Context API (`CnpjContext`)  
- `useMemo` para normalização/validação do CNPJ  
- Deploy no Fly.io

---

## Como rodar localmente

### Requisitos
- Node.js 18+

### Passos
```bash
git clone https://github.com/kauanbrt/bizscan.git
cd bizscan
npm install
npm run dev
```

Acesse: **http://localhost:5173**

---

## Estrutura (resumo)
```
src/
  components/   # Header, HeroCard, SearchBar, CompanyCard
  contexts/     # CnpjContext (estado global e busca)
  index.css
  App.jsx
  main.jsx
```

---

## Notas
- API usada: `https://api.opencnpj.org/{cnpj}`
- O campo CNPJ aceita “00.000.000/0000-00” **ou** “00000000000000”
