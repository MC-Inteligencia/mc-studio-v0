# CLAUDE.md — MC Content Studio

- **Comandos:** `npm install`, `npm run dev` (desenvolvimento), `npm run build` (gera `dist/index.html` único) e `npm run typecheck`.
- **Entrega da v0:** copie `dist/index.html` para a pasta do usuário como `MC Content Studio.html`.
- **Evolução:** a partir daqui segue o fluxo BC Harness (`/bc-harness:plan`, `ralph.sh`) em branch isolada. Nunca commitar `.env`.
- **Contexto antes de mudar:** leia `AI_CONTEXT.md` e atualize-o depois de cada mudança.
- **Schema:** não quebre o schema sem migração. Se mudar `types.ts`, suba `db.version(n)` no Dexie com upgrade.
- **Inbox:** o contrato `mc-studio/inbox@1` é público, porque é por ele que o Claude entrega conteúdo. Mudanças exigem versão nova (`@2`) e compatibilidade.
- **Design:** seguir o Design System MC 2026 (Geist/Inter, #162456, #091134, #FDC700, #155DFC). A direção criativa está no Project doc `claude/DIRECAO-CRIATIVA-INSTAGRAM.md`.
- **Textos de carrossel para o CarrosseIA:** sem travessão; título com até ~12 palavras.
