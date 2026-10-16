# Gestão Escolar - Questionário de Salas & Turmas

Sistema escolar completo e autônomo para diretores cadastrarem perguntas sobre salas e turmas e professores responderem, com visual moderno, banco de dados local (IndexedDB) e compatibilidade total com o **GitHub Pages**.

---

## 🚀 Como Rodar no GitHub / GitHub Pages (Sem Tela Branca)

### Por que dava tela branca antes?
1. O GitHub Pages serve por padrão arquivos estáticos diretamente da raiz do repositório (`/`).
2. Se o arquivo `index.html` tiver `<script type="module" src="/src/main.tsx">`, os navegadores não conseguem interpretar o arquivo TypeScript `.tsx` puro sem compilação prévia, gerando um erro de script e a tela ficava totalmente branca.
3. Se um projeto compilado com Vite não tiver `base: './'`, ele tenta buscar arquivos em `usuario.github.io/assets/` em vez de `usuario.github.io/nome-do-repositorio/assets/`, resultando em erro 404 e tela branca.

### Como foi resolvido agora:
- **`index.html` Autônomo na Raiz**: O arquivo `index.html` principal do projeto foi transformado em um arquivo único e autônomo com Tailwind CSS, ícones SVG e banco de dados local resiliente.
- **Arquivo `.nojekyll`**: Adicionado na raiz para que o GitHub Pages não processe o site com o Jekyll e sirva todos os arquivos estáticos perfeitamente.
- **Configuração `base: './'` no Vite**: Caso queira compilar via `npm run build`, os caminhos de assets agora são relativos e compatíveis com qualquer subpasta do GitHub.
- **Banco Resiliente**: O sistema tenta usar o IndexedDB; se o navegador bloquear (navegação anônima ou iframe restrito), ele chaveia automaticamente para o `localStorage` sem travar a tela.

---

## 📌 Passo a Passo para Ativar no GitHub Pages

1. Envie (commit & push) os arquivos para o seu repositório no GitHub.
2. No seu repositório do GitHub, vá na aba **Settings** (Configurações).
3. No menu lateral esquerdo, clique em **Pages**.
4. Em **Build and deployment** > **Source**, selecione:
   - **Branch**: `main` (ou `master`)
   - **Folder**: `/ (root)`
5. Clique em **Save**.
6. Aguarde cerca de 1 a 2 minutos e acesse o link gerado: `https://seu-usuario.github.io/seu-repositorio/`.
7. O sistema abrirá diretamente, sem tela branca!

---

## 🖥️ Como Rodar Localmente no seu Computador

Você tem 2 opções super fáceis:

### Opção 1: Sem instalar nada (2 cliques)
- Basta dar um duplo clique diretamente no arquivo `index.html` (ou no `public/questionario.html`). Ele abrirá no Chrome, Edge, Safari ou Firefox e funcionará 100% offline!

### Opção 2: Com Vite e Node.js
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000`.

---

## 📋 Funcionalidades Incluídas

1. **Aba de Login**:
   - **Diretor**: Senha padrão `admin123`.
   - **Professor**: Informa nome, disciplina, sala de aula e turma.
2. **Área do Diretor**:
   - Cadastrar perguntas com formato em caixas, sim/não, múltipla escolha ou texto.
   - Excluir perguntas existentes com 1 clique.
   - Gerenciar salas de aula e turmas.
   - Visualizar respostas enviadas pelos professores.
   - Exportação completa para planilha CSV e backup em JSON.
3. **Área do Professor**:
   - **Responder**: Formulário com caixas interativas coloridas: `[ Ótimo ]`, `[ Bom ]`, `[ Regular ]`, `[ Ruim ]`.
   - **Perguntas Detalhadas sobre os Alunos**: Foco/disciplina, tarefas e materiais, ocorrências disciplinares, ritmo de compreensão, celulares/conversas paralelas e reforço pedagógico.
   - **Desempenho da Turma**: Média geral, notas por aula, ocorrências e observações descritivas.
   - **Panorama Geral das Turmas**: Cartões com status de todas as turmas da escola.
