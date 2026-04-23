# Backend (Node.js + Express)

## 1) Configurar variáveis de ambiente

Na pasta `backend/`, crie o arquivo `.env` com base no exemplo:

```bash
cp .env.example .env
```

## 2) Subir e criar o banco MySQL

O erro `Unknown database 'techrent_db'` significa que o MySQL está rodando, mas o banco definido em `DB_NAME` ainda não existe.

Crie a estrutura do banco com os scripts da pasta `bd/` (na raiz do projeto):

```bash
mysql -u root -p < ../bd/schema.sql
mysql -u root -p < ../bd/views.sql
```

> Se você usa outro usuário/senha/porta, ajuste no `.env` e no comando `mysql`.

## 3) Rodar a API

```bash
npm install
npm run dev
```

A API sobe em `http://localhost:8080` por padrão.

## Observação para XAMPP (Windows)

- Você **não precisa** do MySQL Tools do VSCode para funcionar.
- Com o MySQL do XAMPP iniciado, crie o banco e a estrutura com `bd/schema.sql` e `bd/views.sql` antes de subir a API.


## Comandos rápidos (Windows + XAMPP)

No terminal, a partir da **raiz do projeto** (`atv-paivs-techrent`):

```bat
mysql -u root -e "SHOW DATABASES LIKE 'techrent_db';"
mysql -u root < bd\schema.sql
mysql -u root < bd\views.sql
mysql -u root -D techrent_db -e "SHOW TABLES;"
```

Depois disso, suba o backend:

```bat
cd backend
npm install
npm run dev
```

