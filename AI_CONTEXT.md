# AI_CONTEXT — MC Content Studio

Fotografia do estado atual. Não é um changelog.

## Objetivo
Organizar, editar, revisar, aprovar e pré-visualizar o conteúdo da MC Inteligência (Instagram agora; YouTube e LinkedIn já modelados).

- **v0 (atual):** a criação acontece fora do sistema (Claude/Cowork + CarrosseIA) e entra pela inbox.
- **v1 (planejada):** IA interna por plataforma, formato, direção de comunicação e design system.

## Estado
- v0 local, 0.1.0. Roda no navegador, sem backend e sem custo.
- **Usuários:** 2 papéis (editor e aprovador). A troca de usuário é feita no topo. Não há autenticação.
- **Carga inicial:** calendário editorial de 12 semanas (36 posts, de 28/09 a 18/12/2026), 4 pilares com peso e 14 fontes.
- **Conteúdo já preenchido:**
  - carrosséis de 28/09 a 26/10 com roteiro final (v1, `claude_external`, em revisão);
  - Reels das semanas 1 a 5 com roteiro;
  - os 12 MC Cuts com texto dos frames.

## Stack
- React 18, Vite 6, TypeScript e Tailwind v4.
- `vite-plugin-singlefile`: o build gera **um único HTML** (`dist/index.html`, ~0,5 MB) que abre direto no Chrome/Edge via `file://`.
- **Persistência:** IndexedDB via Dexie 4 (banco `mc-content-studio`).
- **Sincronização opcional com pasta** (File System Access API): `data/db.json` + `data/media/` (snapshot automático a cada alteração, com debounce de ~1,2 s) e `inbox/` (importação manual).
- **Fontes:** Geist e Inter variáveis (subset latin), embutidas no HTML.
- **Exportação PNG** das lâminas: html-to-image, em 1080×1350.

## Estrutura
- `src/db/types.ts` — modelo de dados (espelha as tabelas planejadas para o Supabase na v1).
- `src/db/db.ts` — schema Dexie. `repo.ts` concentra as operações de domínio (versões, aprovação, comentários, ideias).
- `src/db/seed*.ts` — carga inicial.
- `src/sync/folder.ts` — pasta, snapshot, backup e restauração. `inbox.ts` — contrato da inbox (docs/CONTRATO-INBOX.md).
- `src/lib/constants.ts` — canais, formatos (specs como dado), status, layouts e marca.
- `src/components/views/*` — Calendário (mês/semana, arrastar para reagendar), Kanban (arrastar muda status), Ideias (CRUD + virar conteúdo), Aprovação (filas) e Configurações.
- `src/components/ContentDrawer.tsx` — editor + prévia + abas Briefing, Revisão, Versões e Histórico.
- `src/components/preview/SlideCanvas.tsx` — renderizador das lâminas no Design System MC 2026 (layouts A–I, variantes escuro/amarelo/claro).

## Regras de domínio
- **Rascunho e versões:** o rascunho (`contents.body`) é salvo automaticamente. "Enviar para revisão" congela uma `version`. Aprovar ou pedir ajustes registra uma `approval` ligada à versão.
- **Origem da versão:** `source` = `human` | `claude_external` | `ai` (este último reservado para a v1). O campo `generationMeta` também fica reservado para a v1.
- **Corpo estruturado:** o `body` guarda texto (slides, roteiro, frames), não só imagem. A lâmina pode ter uma "arte final" (PNG) que substitui a renderização.

## Limitações conhecidas
- Os dados ficam no navegador e na pasta local. O aprovador só vê se usar a mesma máquina, ou se abrir o mesmo HTML com "Carregar da pasta" apontando para uma pasta sincronizada (OneDrive), com risco de sobrescrita. Isso só se resolve na v1 com Supabase.
- Não há autenticação nem publicação automática.

## Caminho para a v1
- Migrar para o Supabase, com as mesmas tabelas de `types.ts`. Importar `data/db.json` e `data/media/`.
- Trocar Dexie por supabase-js, adicionar Auth e RLS por papel.
- Adicionar a camada de IA, que grava versões com `source='ai'`.

## Radar semanal (28/09/2026)
- `scripts/render/render.mjs` aceita `EXTRA=<json>` para renderizar carrosséis fora do calendário (chave livre, ex.: `radar-2026-10-05`). A semente de arte passou a ignorar caracteres não numéricos da chave.
- `scripts/render/radar-fotos.json`: banco de fotos escuras por tema para o Radar.
- Especificação do quadro: `docs-projeto/RADAR-SEMANAL.md`. Os pacotes do Radar usam `match.id = "radar-<data>"` + `create`, então sempre criam um item novo.

- (03/10/2026) scripts/render/render.mjs: header dos carrosséis agora é logo MC (marca/logo-mc-inteligencia.png) à esquerda e MCINTELIGENCIA.COM à direita. Variável LOGO sobrescreve o caminho. Carrosséis da semana 05-11/10 em extra-semana-05-10.json.

- (03/10/2026) Previews.tsx: a prévia do MC Cut (FrameImg/McCutPreview) segue o padrão fixo (docs-projeto/PADRAO-ARTES-MC.md): Inter 600, 33 px na escala 1080, branca, texto como digitado (sem caixa alta e sem destaque amarelo), gradiente inferior, separador amarelo de 10 px e @mcinteligencia no frame 2. O campo `highlight` do Frame deixou de ser usado na prévia. `MC Content Studio.html` foi reconstruído (backup em _temporarios_pode_apagar/).

- 2026-10-03: scripts/render/mccut.mjs reescrito no padrão fixo do MC Cut (Inter 600 33px, frase normal, sem tag/destaque); saída mc-cut-padrao.png. MC_CUTS em seed-data.ts convertido para frase normal. Os 11 cortes do calendário têm arte padrão em criativos/<data original>/mc-cut-padrao.png.
