# MC Content Studio: handoff do front end (v0 -> v1 online com Supabase)

Gerado em 15/10/2026 a partir do código real em `03_CONTEÚDOS_SOCIAL\MC Content Studio\codigo` (v0 0.1.0) e da especificação `ESPECIFICACAO-MC-CONTENT-STUDIO-V1.md` (rascunho de 07/10/2026).

Objetivo deste documento: permitir que outro Claude (outra conta) recrie o front end **idêntico ao de hoje** e já o ligue ao Supabase e às demais ferramentas, sem depender de conversa anterior.

---

## 0. Como usar (para quem vai colar no outro Claude)

Entregue ao outro Claude **três coisas**:

1. Este arquivo.
2. O zip `mc-content-studio-codigo.zip` (pasta `codigo/` sem `node_modules` e `dist`). É a referência literal: `src/` tem 2.750 linhas e este documento descreve o comportamento, mas o código é a verdade final em caso de dúvida visual.
3. Acesso ao projeto Supabase de destino (URL, chave anon, e uma forma de aplicar migrations).

Prompt sugerido:

> Você vai recriar o MC Content Studio. Leia o arquivo `MC-CONTENT-STUDIO-HANDOFF-FRONTEND.md` inteiro e abra o zip `codigo/` como referência. Regra principal: o front end deve ficar **visualmente e funcionalmente idêntico** ao v0 (mesmas telas, classes Tailwind, textos em português, comportamentos). A única mudança permitida na camada de dados: trocar Dexie/IndexedDB por Supabase (Postgres + Auth + Storage + Realtime), mantendo as assinaturas das funções de `repo.ts`. Siga a seção 12 (plano de recriação) na ordem e use os critérios de aceite da seção 13. Não invente telas novas, não troque a stack, não use travessão em nenhum texto da interface. Pergunte antes de qualquer ação que gaste crédito ou publique algo.

---

## 1. O que é o sistema

Ferramenta interna da MC Inteligência para **planejar, produzir, revisar, aprovar e pré-visualizar** conteúdo de redes sociais (Instagram hoje; YouTube e LinkedIn já modelados). Não publica sozinha.

Ciclo de status: `briefing -> producao -> revisao <-> ajustes -> aprovado -> agendado -> publicado`, com `arquivado` a qualquer momento.

Produção do conteúdo acontece **fora** (Claude/Cowork, CarrosseIA, scripts `render.mjs`, `mccut.mjs`, `reel.mjs`) e entra pela **inbox** (contrato `mc-studio/inbox@1`, seção 9). O sistema guarda texto estruturado (`body`), não só imagem.

Dois papéis no v0: **Editor** (Leo) e **Aprovador**. Não há autenticação: o usuário é trocado num `<select>` no topo.

---

## 2. Stack e build

| Item | Valor |
|---|---|
| UI | React 18.3, TypeScript 5.9 (strict), Vite 6 |
| Estilo | Tailwind CSS v4 via `@tailwindcss/vite` (tokens em `@theme`, sem `tailwind.config`) |
| Ícones | `lucide-react` |
| Fontes | `@fontsource-variable/geist` (títulos) e `@fontsource-variable/inter` (corpo), embutidas por `@font-face` apontando para `node_modules/.../files/*-latin-wght-normal.woff2` |
| Dados v0 | Dexie 4 + `dexie-react-hooks` (`useLiveQuery`), banco `mc-content-studio` |
| Exportar PNG | `html-to-image` (`toPng`) |
| Build v0 | `vite-plugin-singlefile` gera `dist/index.html` único (~0,5 MB) que abre por `file://` |
| Scripts | `dev`, `build` (`tsc -b && vite build`), `typecheck` |
| Idioma | pt-BR (`<html lang="pt-BR">`), título "MC Content Studio" |

`package.json` (versões exatas pedidas): `dexie ^4.4.6`, `dexie-react-hooks ^4.4.0`, `html-to-image ^1.11.13`, `lucide-react ^1.48.0`, `react ^18.3.1`, `react-dom ^18.3.1`, dev: `@tailwindcss/vite ^4.3.3`, `@vitejs/plugin-react ^4.7.0`, `tailwindcss ^4.3.3`, `typescript ^5.9.3`, `vite ^6.4.3`, `vite-plugin-singlefile ^2.3.3`, `playwright-core ^1.63.0`.

**Mudança obrigatória no v1:** o arquivo único por `file://` deixa de ser a entrega. Login e links de convite exigem origem `https`. Mantenha o Vite, **remova** `vite-plugin-singlefile` do build de produção (pode manter como script opcional `build:single`), e hospede o `dist/` como SPA estática (Cloudflare Pages, Railway ou Vercel). Adicionar `@supabase/supabase-js` e `@tanstack/react-query`.

---

## 3. Estrutura de arquivos

```
codigo/
  index.html            div#root + /src/main.tsx
  vite.config.ts  tsconfig.json  package.json
  CLAUDE.md  AI_CONTEXT.md  README.md
  docs/CONTRATO-INBOX.md  docs/ESPECIFICACAO-V1.md
  scripts/render/*.mjs *.json     (geração de artes por Playwright, fora do front)
  src/
    main.tsx                 boot: seed -> restaura pasta -> render <App/>
    App.tsx                  shell: header, nav, filtros, drawer, diálogo
    index.css                tokens @theme + classes de componente
    lib/constants.ts         CHANNELS, FORMATS, STATUSES, FORMAT_COLORS, LAYOUTS, BRAND, uid, emptyBody
    lib/date.ts              helpers de data (semana começa na segunda)
    lib/hooks.ts             useSync, useCurrentUser, useUsers, useAssetUrl, useSetting
    db/types.ts              modelo de dados (fonte do schema)
    db/db.ts                 schema Dexie (v1 do banco) e DATA_TABLES
    db/repo.ts               TODAS as operações de domínio
    db/seed.ts, seed-data.ts carga inicial (12 semanas, 36 posts, 4 pilares, 14 fontes)
    sync/folder.ts           File System Access API, snapshot, backup
    sync/inbox.ts            importador do contrato inbox@1
    components/
      Filters.tsx  NewContentDialog.tsx  ContentDrawer.tsx
      editors/BodyEditors.tsx
      preview/SlideCanvas.tsx  preview/Previews.tsx
      views/Calendar.tsx Kanban.tsx Ideas.tsx ReviewQueue.tsx Settings.tsx
```

Regra de arquitetura a preservar: **componentes nunca falam com o banco direto para escrever**. Toda escrita passa por `repo.ts`. Leituras são reativas (`useLiveQuery`). No v1, `repo.ts` e `hooks.ts` são as duas únicas peças que mudam de implementação.

---

## 4. Design system (tokens e classes)

Cores da marca (`@theme` em `index.css` e `BRAND` em `constants.ts`):

| Token | Hex | Uso |
|---|---|---|
| `mci-blue` | `#162456` | header, botão primário, títulos de seção |
| `mci-dark` | `#091134` | hover do primário, fundo escuro das lâminas |
| `mci-yellow` | `#FDC700` | acento, badge de contagem, botão de decisão |
| `mci-light` | `#155DFC` | foco de campos, links, hover de cards |
| `ink` | `#111827` | texto |
| fundo da página | `#F3F4F6` | `body` |

Tipografia: `--font-sans: Inter`, `--font-heading: Geist` (classe `.font-heading`). Títulos de tela usam `font-heading font-bold text-mci-blue`.

Classes de componente (`@layer components`), literais:

```css
.field        w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-mci-light focus:ring-2 focus:ring-mci-light/20
.label        mb-1 block text-xs font-medium text-gray-600
.btn          inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50
.btn-primary  .btn + bg-mci-blue text-white hover:bg-mci-dark
.btn-yellow   .btn + bg-mci-yellow text-mci-blue hover:brightness-95
.btn-ghost    .btn + text-gray-700 hover:bg-gray-100
.btn-danger   .btn + text-red-600 hover:bg-red-50
.card         rounded-xl border border-gray-200 bg-white
.chip         inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium
```
Obs.: `.btn-primary/-yellow/-ghost/-danger` repetem as utilidades do `.btn` (não usam `@apply btn`). Copie do `index.css` do zip.

Também: `html, body, #root { height: 100% }`, `input, textarea, select { outline: none }`.

Cores de status (`STATUSES`): briefing `#6B7280`, producao `#155DFC`, revisao `#A855F7`, ajustes `#F97316`, aprovado `#16A34A`, agendado `#0D9488`, publicado `#162456`, arquivado `#9CA3AF`. Rótulos: Briefing, Em produção, Em revisão, Ajustes, Aprovado, Agendado, Publicado, Arquivado.

Cores por formato (`FORMAT_COLORS`): ig_carrossel `#FDC700`, ig_estatico `#FCD34D`, ig_reel `#155DFC`, ig_mc_cut `#F97316`, yt_video `#DC2626`, yt_short `#F87171`, li_post `#0A66C2`, li_documento `#38BDF8`.

Regras de marca para qualquer texto/arte: fotos reais, base preta, amarelo com parcimônia, **sem travessão**, título de carrossel até ~12 palavras, até ~45 palavras por lâmina.

---

## 5. Shell e navegação (`App.tsx`)

Layout vertical `flex h-full flex-col`:

1. **Header** `bg-mci-blue text-white px-5 py-2.5`:
   - Logo em texto: `mc` + `<span text-mci-yellow>inteligência</span>` + ` · Content Studio` (`font-heading text-lg font-bold`, trecho final `text-white/60 font-normal`).
   - Nav com 5 botões (ícone lucide 16px + rótulo): Calendário (`CalendarDays`), Kanban (`Columns3`), Ideias (`Lightbulb`, badge = ideias não promovidas), Aprovação (`CheckCircle2`, badge = contagem de `status='revisao'`), Configurações (`Settings`). Ativo: `bg-white/15 font-semibold`; inativo `text-white/75 hover:bg-white/10`. Badge: `rounded-full bg-mci-yellow px-1.5 text-[11px] font-bold text-mci-blue`.
   - À direita: indicador de pasta (v0: "sem pasta", nome da pasta ou botão laranja "Reconectar pasta") e `<select>` de usuário, opções `"{name} ({role})"`.
2. **Barra de filtros** (só em Calendário e Kanban): `FilterBar` + botão primário "Novo conteúdo" (`Plus`) que abre `NewContentDialog` com a data de hoje.
3. **Main** `min-h-0 flex-1 overflow-auto p-5` renderiza a view atual.
4. Overlays: `ContentDrawer` (se `openId`) e `NewContentDialog` (se `newDate`). Ao criar, fecha o diálogo e abre o drawer do novo item.

Estado de UI é local em `App` (`view`, `openId`, `newDate`, `filters`). Não há router; **mantenha assim** (sem react-router) para ficar idêntico. No v1 acrescente apenas: tela de login antes do shell e, se houver mais de um workspace, um seletor discreto no header.

**v1 no header:** o `<select>` de "quem está usando" é substituído pelo usuário autenticado (nome + papel + botão sair). Não mostrar mais o indicador de pasta, e sim um indicador de conexão/sincronização (opcional).

### Filtros (`Filters.tsx`)
Estado: `{channel, format, status, pillar, q, showArchived}`. Busca `q` casa em `title + hook + tag` (minúsculas). Arquivados ficam ocultos, exceto se o filtro de status for `arquivado` ou `showArchived`. Controles: input "Buscar…" (w-48) e 4 selects ("Todos os canais/formatos/status/pilares"), todos `field w-auto py-1 text-xs`.

---

## 6. Telas

### 6.1 Calendário (`views/Calendar.tsx`)
- Modos **Mês** (grade de 42 dias começando na segunda da semana do dia 1) e **Semana** (7 dias). Alternador segmentado `Mês | Semana` (`rounded-lg border bg-white p-0.5`, ativo `bg-mci-blue text-white`).
- Cabeçalho: setas `ChevronLeft/Right`, título `font-heading text-lg font-bold text-mci-blue` ("Outubro 2026" ou "Semana de Seg, 12/10/2026"), botão "Hoje".
- Cursor inicial: `hoje`, mas se hoje < 28/09/2026 usa 28/09/2026 (início do plano). Mantenha essa regra.
- Linha de dias da semana: `Seg Ter Qua Qui Sex Sáb Dom`.
- Célula do dia: `min-h-[110px] p-1.5`, fora do mês `bg-gray-50` e número `text-gray-300`; hoje com círculo `bg-mci-yellow text-mci-blue font-bold`; botão `+` aparece no hover (`hidden group-hover:block`) e abre "Novo conteúdo" naquela data.
- **ContentChip**: arrastável, borda esquerda 4px na cor do formato, nome do formato em negrito, bolinha da cor do status à direita, título com `line-clamp-2`. Clique abre o drawer.
- **Arrastar para outro dia** chama `saveContent(id, { scheduledAt: 'YYYY-MM-DD' })` (usa `dataTransfer` com chave `text/content-id`).

### 6.2 Kanban (`views/Kanban.tsx`)
- Uma coluna por status (largura `w-64`), `arquivado` só se `filters.showArchived`. Cabeçalho com bolinha de cor, rótulo e contagem. Fundo `bg-gray-200/60`; ao arrastar por cima: `bg-blue-50 ring-2 ring-mci-light`.
- Cartão: chip do formato (fundo `cor+40`), data `DD/MM` em mono à direita, título `text-[13px] font-medium`, nome do pilar em `text-[10px]`.
- Soltar um cartão numa coluna chama `setStatus(id, status)`. O filtro de status é ignorado nesta tela (`status: ''`).
- Ordenado por `scheduledAt`.

### 6.3 Ideias (`views/Ideas.tsx`)
- Grid `380px | 1fr`, máx. `max-w-6xl`.
- Esquerda: formulário "Nova ideia"/"Editar ideia" (título, hook, formato opcional, pilar opcional, notas). Botões Adicionar/Salvar e Cancelar.
- Direita: "Banco de ideias (N)" com cartões (título, hook, notas, chips de formato e pilar, autor + data). Ações: editar (`Pencil`), excluir (`Trash2`, com `confirm`), **"Virar conteúdo"** (amarelo) que abre um bloco inline (`bg-yellow-50`) com formato e data e botão "Criar no cronograma" -> `promoteIdea` e abre o drawer do novo conteúdo.
- Bloco `<details>` "Ideias já transformadas em conteúdo (N)" com links `→ título` que abrem o conteúdo.

### 6.4 Aprovação (`views/ReviewQueue.tsx`)
Quatro seções empilhadas (`max-w-4xl`), cada uma com título `font-heading text-base font-bold text-mci-blue`, subtítulo e contagem:
1. **Aguardando aprovação** (`status='revisao'`).
2. **Ajustes pedidos** (`status='ajustes'`).
3. **Próximos 10 dias sem aprovação**: `scheduledAt` entre hoje e hoje+10 e status em `briefing|producao|ajustes|revisao`.
4. **Com comentários abertos**: conteúdos com comentário `resolved=false`.
Linha (`Row`): barra vertical na cor do formato, título, "Formato · data longa · N comentário(s) aberto(s)", chip do status. Vazio: "Nada aqui."

### 6.5 Configurações (`views/Settings.tsx`)
Seções em cards (`max-w-4xl`):
1. **Pasta de dados** (v0): conectar/trocar/desconectar pasta, Importar inbox, Salvar agora, Carregar da pasta, Baixar backup (.json), Restaurar backup. Mensagem de feedback no topo em faixa `bg-mci-blue`.
2. **Usuários**: edita nome e papel (Editor/Aprovador) e **avatar das lâminas** (foto do especialista) via `ImagePick`, guardado em `settings.avatarAssetId`.
3. **Pilares editoriais**: grid 2 colunas, borda esquerda na cor do pilar, nome, peso %, papel, temas (somente leitura).
4. **Fontes (fact-check)**: lista de `<details>` com 6 inputs editáveis (`name, edition, evidence, usage, url, note`), botão "+ Fonte" e Excluir.

**No v1:** a seção "Pasta de dados" é substituída por "Importar pacote" (arrasta JSON + imagens, ou cola JSON) e "Exportar workspace". "Usuários" vira "Membros" (convites, papéis). Os demais blocos ficam iguais, agora lendo/gravando no Supabase.

### 6.6 Novo conteúdo (`NewContentDialog.tsx`)
Modal central `w-[480px]`: título, select de formato (rótulo `Instagram · Carrossel` etc.), data, pilar opcional, hook. "Criar" desabilitado sem título/data. Cria com `status='briefing'` e `body=emptyBody()`.

---

## 7. Drawer de conteúdo (`ContentDrawer.tsx`)

Painel lateral direito `max-w-[1280px]` sobre overlay `bg-black/40`; fecha com Esc ou clique fora.

**Topo:** chip do formato, título editável (salva a cada tecla via `saveContent`), botão fechar. Linha de controles: data (`input[type=date]` + data longa), status (select colorido), pilar, formato (troca `format` e `channel` juntos; rótulos `IG · Carrossel`), ação contextual e lixeira (confirm "Excluir este conteúdo e todo o histórico?").

**Ação contextual (`Actions`) por status e papel:**
- `revisao` + papel aprovador: botão amarelo "Revisar e decidir" (leva à aba Revisão).
- `briefing | producao | ajustes`: "Enviar para revisão" (pede nota opcional) -> `submitForReview`.
- `aprovado`: "Marcar agendado".
- `agendado`: campo "Link do post publicado" + botão "Publicado" (grava `publishedUrl`, status `publicado`).
- `publicado` com link: "Ver post".

**Corpo em duas colunas** `grid-cols-[1fr_420px]`:
- Esquerda: abas **Conteúdo | Briefing | Revisão (N abertos) | Versões | Histórico**.
- Direita: "Prévia · {aspect} · {w}×{h}" com `ContentPreview` e, se existir, caixa "Spec:" com `format.notes`.

**Autosave do rascunho:** estado local `body`; ao editar marca `dirty` e grava `saveBody` após 500 ms sem digitar. Quando `c.updatedAt` muda e não há edição pendente, recarrega o `body` do banco (isso cobre inbox e restauração). **Preserve esse comportamento**, e no v1 o `updatedAt` deve vir do servidor/Realtime.

**Aba Briefing:** hook, objetivo, tag (recorte), base/fonte (texto livre), checklist de fontes vinculadas (expande evidência, nota em laranja e link quando marcada), notas internas. Tudo grava direto em `saveContent`.

**Aba Revisão:** 
- Se `status='revisao'`, cartão roxo "Decisão sobre a versão vN" com textarea e botões **Aprovar** (verde) e **Pedir ajustes** (amarelo, exige nota). Se o usuário é editor, mostra aviso para trocar de usuário.
- Lista de comentários (autor, data, chip da versão, Resolver/Reabrir, lixeira), campo para novo comentário (vincula à versão atual).
- Lista de decisões ("✅ Aprovado por X em dd/mm hh:mm (vN)" / "↩️ Ajustes pedidos...").

**Aba Versões:** botão "Salvar rascunho atual como versão"; cada versão mostra `vN`, nota, autor, data, origem (`manual`, `Claude (fora do sistema)`, `IA interna`), marca "atual" e botão **Restaurar** (confirm), que copia o `body` da versão para o rascunho.

**Aba Histórico:** log de atividade do conteúdo (data, autor, ação).

### Editores do `body` (`editors/BodyEditors.tsx`)
Escolha por formato: `ig_mc_cut` -> FramesEditor; `kind='video'` -> VideoEditor; demais -> SlidesEditor (`li_post` troca o rótulo da legenda para "Texto do post").

- **SlidesEditor:** card por lâmina com número, select de layout (A..I com nomes de `LAYOUTS`), select de variante (Escuro/Amarelo/Claro), contador de palavras (laranja se > 45), subir/descer/excluir. Campos: tag (só layout A), título, texto (placeholder muda: C "Um item por linha", D "valor | rótulo (um por linha)"), fonte de rodapé, `ImagePick` de **Imagem de apoio** e **Arte final (PNG)**. Botão "Adicionar lâmina (n/max)" desabilita no limite do formato; primeira lâmina nasce layout A, as seguintes B.
- **VideoEditor:** cartão de capa/thumbnail (título, palavra em amarelo, imagem), no YouTube também título (≤70) e descrição, e tabela de roteiro (tempo mono, fala, texto na tela) com adicionar/remover take.
- **FramesEditor (MC Cut):** 2 frames (1 = tensão, 2 = conclusão) com texto, palavra em amarelo e imagem do frame do podcast.
- **Common** (todos): legenda com contador de caracteres, CTA, hashtags, link externo (CarrosseIA/Drive/Canva) com botão Abrir.
- **ImagePick:** miniatura 48px com botão remover e botão tracejado de upload (`accept=image/*`); sobe via `addAsset` e devolve o id.

---

## 8. Prévias e renderização de arte (o coração visual)

### 8.1 `SlideCanvas.tsx`
Renderiza uma lâmina em **coordenadas reais 1080×1350** e escala por `transform: scale(width/1080)`. A mesma função serve a prévia (largura 340) e a exportação (largura 1080, `exportMode`).

- Variantes: `dark` (fundo `#050814`, texto branco, acento amarelo), `yellow` (fundo `#FDC700`, texto `#162456`), `light` (fundo `#F3F4F6`, texto `#162456`).
- Se a lâmina tem `assetId` (arte final), mostra só a imagem em `cover`.
- Escuro sem foto: gradiente radial `radial-gradient(120% 80% at 80% 0%, #162456 0%, #091134 45%, #03050d 100%)`. Layouts A, F, G escuros **com** `imageAssetId`: foto de fundo + gradiente vertical `rgba(5,8,20,.15) -> .55 (45%) -> .97 (78%)`.
- Cabeçalho micro (top 40): `MCINTELIGENCIA.COM` à esquerda e `CONSULTORIA | TREINAMENTO DE BI` à direita (20px, tracking .08em, opacidade .55). Contador `i/n` em pílula (top 86, direita) quando há mais de 1 lâmina.
- Área de conteúdo: `left/right 64`, `top/bottom 150`. Fonte/rodapé em `bottom 118` (22px, opacidade .6).
- Rodapé fixo (bottom 40): avatar circular 64px com borda amarela 3px (foto de `settings.avatarAssetId`) e `@mcinteligencia` (22px, opacidade .5).
- Títulos: Geist 800, caixa alta, `letter-spacing -0.01em`.
- Destaque de palavra (`Highlight`): troca a cor da primeira ocorrência (case-insensitive).

Layouts (tamanhos em px da arte 1080):

| Layout | Nome | Composição |
|---|---|---|
| A | Hero/Capa | Alinhado embaixo. Tag em pílula amarela (24px) + título 96px cor de acento + texto de apoio em caixa amarela (34px, bold) |
| B | Texto + imagem | Título 66px, texto 36px (entrelinha 1.45), imagem opcional 420px de altura com raio 16 |
| C | Lista | Seta amarela quadrada 56px, título 64px, itens 38px com marcador quadrado amarelo 18px (um item por linha, remove `-`/`•` inicial) |
| D | KPIs | Título 60px e grade 2 colunas de cartões `rgba(255,255,255,.08)`; cada linha `valor | rótulo` com valor 72px em `#155DFC` |
| E e I | CTA / Agradecimento | Centralizado: título 50px, frase em itálico 46px entre aspas na cor de acento, depois site (30px) e tagline (24px) |
| F | Dado/frase | Título 100px (76px se > 60 caracteres), texto 40px; vai para baixo se houver foto |
| G | Citação | Aspas gigantes Geist 200px amarelas, título 70px, texto 42px na cor de acento |
| H | Mosaico | Título 60px, imagem 700px de altura, texto 32px |

Para fidelidade total, **copie `SlideCanvas.tsx` do zip** em vez de reescrever.

### 8.2 `Previews.tsx` (moldura por formato)
- `IgFrame`: aparelho 360px com borda preta 10px e raio 28, cabeçalho com avatar "MC" e `mcinteligencia`, ícones coração/comentário/enviar/salvar, legenda truncada em 120 caracteres com "… mais" que expande e mostra hashtags em `#00376b`.
- **Carrossel/estático:** `CarouselPreview` com setas laterais, pontos de paginação, botão **"Baixar lâminas (PNG 1080×1350)"** (exporta cada lâmina com `html-to-image`, nomes `YYYY-MM-DD_01.png`...) e nós de tamanho real renderizados fora da tela (`position: fixed; left: -99999`). Vazio: "Nenhuma lâmina ainda. Adicione na aba Conteúdo."
- **MC Cut (padrão fixo `PADRAO-ARTES-MC`):** duas imagens empilhadas num fundo amarelo com 10px (na escala) entre elas; texto Inter 600, 33px na arte, branco, como digitado (sem caixa alta, sem destaque amarelo, sem tag), centralizado, balanceado, com sombra forte, gradiente inferior `rgba(0,0,0,0) 45% -> rgba(0,0,0,.5)`, e `@mcinteligencia` no canto inferior direito do **frame 2**. Sem imagem: gradiente azul e texto "frame do podcast pendente".
- **Reel:** moldura 9:16 (250px) com capa (imagem ou gradiente `160deg #162456 -> #091134`), título da capa com palavra em amarelo, linha de gráfico decorativa em SVG e tabela de roteiro abaixo (`time | fala + texto na tela em selo azul/amarelo`).
- **YouTube vídeo:** thumbnail 16:9, título, canal, descrição, roteiro.
- **LinkedIn:** cartão com avatar, legenda e primeira lâmina.

---

## 9. Modelo de dados e regras de domínio

Fonte: `db/types.ts`. Cada interface é uma tabela. Datas em ISO; `scheduledAt` é `YYYY-MM-DD` (sem fuso).

```ts
ChannelId = 'instagram' | 'youtube' | 'linkedin'
FormatId  = 'ig_carrossel' | 'ig_estatico' | 'ig_reel' | 'ig_mc_cut' | 'yt_video' | 'yt_short' | 'li_post' | 'li_documento'
BodyKind  = 'slides' | 'video' | 'frames' | 'text'
Status    = 'briefing' | 'producao' | 'revisao' | 'ajustes' | 'aprovado' | 'agendado' | 'publicado' | 'arquivado'
Role      = 'editor' | 'aprovador'
VersionSource = 'human' | 'claude_external' | 'ai'
SlideLayout = 'A'..'I'

User{id,name,role}  Pillar{id,name,weight,role,themes,color}  Source{id,name,edition,evidence,usage,url,note}
Idea{id,title,hook,channel?,format?,pillarId?,notes,createdBy,createdAt,promotedContentId?}
Slide{id,layout,tag?,title,body,sourceNote?,variant?,assetId?,imageAssetId?}
ScriptTake{id,time,speech,screenText}   Frame{id,text,highlight,assetId?}
ContentBody{caption,hashtags,cta,slides[],cover{title,highlight,assetId?},script[],frames[],videoTitle,description,externalLink?}
ContentItem{id,title,channel,format,pillarId?,tag,status,scheduledAt,hook,objective,notes,sourceIds[],sourceText,body,currentVersionId?,publishedUrl?,weekNumber?,createdAt,updatedAt}
Version{id,contentId,number,source,body,note,authorId,createdAt,generationMeta?}
Asset{id,contentId?,name,mime,blob,createdAt}     Comment{id,contentId,versionId?,slideRef?,authorId,text,resolved,createdAt}
Approval{id,contentId,versionId,decision:'aprovado'|'ajustes',authorId,note,createdAt}
ActivityLog{id,contentId?,authorId,action,createdAt}    Setting{key,value}
Format{id,channel,name,kind,aspect,width,height,maxSlides?,captionMax?,durationSec?,notes?}   (dado, não código)
```

`CHANNELS` e `FORMATS` ficam em `constants.ts` com as specs (copie literalmente; resumo): carrossel 4:5 1080×1350 até 10 lâminas; estático 1 lâmina; Reel 9:16 1080×1920, 30-60 s; MC Cut 4:5 com frames; YouTube vídeo 16:9 1920×1080 (título ≤70, thumb 1280×720); Short 9:16 15-60 s; post LinkedIn 1:1 1200×1200, legenda 3000; documento LinkedIn 4:5 até 20 lâminas.

`emptyBody()`: legenda, hashtags, CTA e textos vazios; `slides: []`; `script: []`; `frames` com 2 frames vazios (ids novos); `cover {title:'',highlight:''}`.

### Regras de domínio (em `repo.ts`)
- **Rascunho vs versão:** `contents.body` é o rascunho (autosave). `snapshotVersion` copia o rascunho para `versions` com `number = último + 1`, `source`, `note`, e aponta `currentVersionId`.
- **Enviar para revisão:** `snapshotVersion(note || 'Enviado para revisão')` + status `revisao`.
- **Decidir:** usa a versão atual (cria uma "Versão criada na decisão" se não houver), grava `approval`, cria comentário com prefixo `✅ ` ou `↩️ ` se houver nota, e muda o status para `aprovado` ou `ajustes`.
- **Restaurar versão:** copia `version.body` para o rascunho e loga.
- **Excluir conteúdo:** apaga também versões, comentários, aprovações, assets e atividade do conteúdo.
- **Promover ideia:** cria conteúdo (briefing) herdando título, pilar e hook, copia notas e grava `promotedContentId`.
- **Log de atividade:** quase toda escrita relevante chama `log()` (criou, mudou status para "x", salvou a versão vN, restaurou a vN). Autor = usuário atual ou `'sistema'`.
- **No v0 não há validação de transição:** qualquer pessoa muda qualquer status (Kanban e select). Recomendação v1: manter livre, **exceto** que `aprovado` só seja alcançado por `decide_content` por um aprovador (veja seção 10). Decisão do Leo pendente; implemente a versão permissiva se não houver resposta.

### Contrato da inbox `mc-studio/inbox@1` (não pode mudar)
Pacote JSON `{ schema, items[], ideas[] }`. Cada item: `match {id | scheduledAt+format}`, `create {title, format, scheduledAt, pillar(nome), tag}`, `set {title,hook,objective,notes,publishedUrl,tag,sourceText,status}`, `body` (merge raso; `slides/script/frames` substituídos por inteiro e cada elemento ganha `id` novo), `versionNote`, `source` (padrão `claude_external`), `comment`. Imagens: `assetFile`/`imageAssetFile` são caminhos relativos a `inbox/` e viram `assetId`/`imageAssetId`. Regra: se há `body` ou `versionNote`, cria versão. Busca: `match.id` > `scheduledAt+format`; sem achado e com `create`, cria. `ideas[]` viram ideias (pilar por nome). Texto completo em `docs/CONTRATO-INBOX.md` (no zip).

---

## 10. Supabase: como ligar (substitui Dexie, mantendo a UI)

### 10.1 Princípios
- Mesmas tabelas de `types.ts`, com `workspace_id` em tudo e RLS por membership (multi-tenant desde o início, decisão D4 do Leo). Workspace nº 1 = MC Inteligência.
- Chave `anon` no navegador. `service_role` nunca no front. Segredos (Buffer, Anthropic) só em Edge Functions.
- Datas de agendamento: manter `scheduled_at date` (como `scheduledAt` string) e acrescentar `publish_at timestamptz` só na fase de publicação.
- Preserve UUIDs na migração do v0 (ids dos contents, versions, comments, etc. já são UUID; ids de usuário/pilar/fonte do seed (`u_leo`, `p_ia`, `s_wef`) são texto: troque por UUID e mapeie, ou use `text` nessas 3 tabelas).

### 10.2 Migration inicial (SQL)

```sql
create extension if not exists pgcrypto;

create type member_role   as enum ('owner','admin','editor','approver','viewer');
create type content_status as enum ('briefing','producao','revisao','ajustes','aprovado','agendado','publicado','arquivado');
create type version_source as enum ('human','claude_external','ai');

-- identidade e tenant
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text unique not null,
  timezone text not null default 'America/Sao_Paulo',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '', created_at timestamptz not null default now()
);
create table memberships (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role member_role not null default 'editor',
  primary key (workspace_id, user_id)
);

create or replace function is_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships m where m.workspace_id = ws and m.user_id = auth.uid())
$$;
create or replace function has_role(ws uuid, roles member_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships m where m.workspace_id = ws and m.user_id = auth.uid() and m.role = any(roles))
$$;

-- marca e catálogo editorial (por workspace)
create table brand_kits (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  tokens jsonb not null default '{"blue":"#162456","darkBlue":"#091134","yellow":"#FDC700","lightBlue":"#155DFC"}',
  site text not null default 'MCINTELIGENCIA.COM',
  tagline text not null default 'CONSULTORIA | TREINAMENTO DE BI',
  handle text not null default '@mcinteligencia',
  avatar_asset_id uuid
);
create table pillars (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null, weight int not null default 0, role text not null default '',
  themes text not null default '', color text not null default '#155DFC'
);
create table sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null, edition text not null default '', evidence text not null default '',
  usage text not null default '', url text not null default '', note text not null default ''
);

-- conteúdo
create table ideas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null, hook text not null default '', notes text not null default '',
  channel text, format text, pillar_id uuid references pillars(id) on delete set null,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(),
  promoted_content_id uuid
);
create table contents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null, channel text not null, format text not null,
  pillar_id uuid references pillars(id) on delete set null,
  tag text not null default '', status content_status not null default 'briefing',
  scheduled_at date not null, hook text not null default '', objective text not null default '',
  notes text not null default '', source_ids uuid[] not null default '{}', source_text text not null default '',
  body jsonb not null default '{}'::jsonb,
  current_version_id uuid, published_url text, week_number int,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on contents (workspace_id, scheduled_at);
create index on contents (workspace_id, status);

create table content_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  content_id uuid not null references contents(id) on delete cascade,
  number int not null, source version_source not null default 'human',
  body jsonb not null, note text not null default '',
  author_id uuid references auth.users(id), generation_meta jsonb,
  created_at timestamptz not null default now(),
  unique (content_id, number)
);
alter table contents add constraint contents_current_version_fk
  foreign key (current_version_id) references content_versions(id) on delete set null;

create table assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  content_id uuid references contents(id) on delete cascade,
  name text not null, mime text not null, bytes bigint, path text not null, -- caminho no bucket 'media'
  created_at timestamptz not null default now()
);
create table comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  content_id uuid not null references contents(id) on delete cascade,
  version_id uuid references content_versions(id) on delete set null,
  slide_ref text, author_id uuid references auth.users(id), text text not null,
  resolved boolean not null default false, created_at timestamptz not null default now()
);
create table approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  content_id uuid not null references contents(id) on delete cascade,
  version_id uuid not null references content_versions(id) on delete cascade,
  decision text not null check (decision in ('aprovado','ajustes')),
  author_id uuid references auth.users(id), note text not null default '',
  created_at timestamptz not null default now()
);
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  content_id uuid references contents(id) on delete cascade,
  author_id uuid references auth.users(id), action text not null,
  created_at timestamptz not null default now()
);
create table inbox_imports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  package_hash text not null, result jsonb, imported_by uuid references auth.users(id),
  created_at timestamptz not null default now(), unique (workspace_id, package_hash)
);

-- updated_at automático
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger contents_touch before update on contents for each row execute function touch_updated_at();

-- versões são imutáveis
create or replace function block_version_mutation() returns trigger language plpgsql as $$
begin raise exception 'content_versions é imutável'; end $$;
create trigger versions_immutable before update on content_versions for each row execute function block_version_mutation();
```

**RLS** (aplique a todas as tabelas com `workspace_id`; padrão abaixo, repita por tabela):

```sql
alter table contents enable row level security;
create policy contents_select on contents for select using (is_member(workspace_id));
create policy contents_write  on contents for all
  using (has_role(workspace_id, array['owner','admin','editor','approver']::member_role[]))
  with check (has_role(workspace_id, array['owner','admin','editor','approver']::member_role[]));
-- viewer só lê. Repita select/write para: ideas, pillars, sources, content_versions (sem update),
-- assets, comments, activity_log, brand_kits, inbox_imports.
-- approvals: insert só com has_role(..., array['owner','admin','approver']).
-- workspaces/memberships/profiles: select para membros; escrita só owner/admin (profiles: o próprio usuário).
```

**RPCs** (transações atômicas, espelham `repo.ts`):

```sql
create or replace function submit_for_review(p_content uuid, p_note text default '') returns uuid
language plpgsql security definer set search_path = public as $$
declare c contents; n int; vid uuid;
begin
  select * into c from contents where id = p_content;
  if c.id is null or not has_role(c.workspace_id, array['owner','admin','editor','approver']::member_role[]) then
    raise exception 'sem permissão'; end if;
  select coalesce(max(number),0)+1 into n from content_versions where content_id = p_content;
  insert into content_versions (workspace_id, content_id, number, source, body, note, author_id)
    values (c.workspace_id, p_content, n, 'human', c.body, coalesce(nullif(p_note,''),'Enviado para revisão'), auth.uid())
    returning id into vid;
  update contents set current_version_id = vid, status = 'revisao' where id = p_content;
  insert into activity_log (workspace_id, content_id, author_id, action)
    values (c.workspace_id, p_content, auth.uid(), 'salvou a versão v'||n), (c.workspace_id, p_content, auth.uid(), 'mudou status para "revisao"');
  return vid;
end $$;

create or replace function decide_content(p_content uuid, p_decision text, p_note text default '') returns void
language plpgsql security definer set search_path = public as $$
declare c contents; vid uuid; n int;
begin
  select * into c from contents where id = p_content;
  if c.id is null or not has_role(c.workspace_id, array['owner','admin','approver']::member_role[]) then
    raise exception 'apenas aprovador'; end if;
  if p_decision not in ('aprovado','ajustes') then raise exception 'decisão inválida'; end if;
  if p_decision = 'ajustes' and btrim(coalesce(p_note,'')) = '' then raise exception 'nota obrigatória'; end if;
  vid := c.current_version_id;
  if vid is null then
    select coalesce(max(number),0)+1 into n from content_versions where content_id = p_content;
    insert into content_versions (workspace_id, content_id, number, body, note, author_id)
      values (c.workspace_id, p_content, n, c.body, 'Versão criada na decisão', auth.uid()) returning id into vid;
    update contents set current_version_id = vid where id = p_content;
  end if;
  insert into approvals (workspace_id, content_id, version_id, decision, note, author_id)
    values (c.workspace_id, p_content, vid, p_decision, coalesce(p_note,''), auth.uid());
  if btrim(coalesce(p_note,'')) <> '' then
    insert into comments (workspace_id, content_id, version_id, text, author_id)
      values (c.workspace_id, p_content, vid, case when p_decision='aprovado' then '✅ ' else '↩️ ' end || p_note, auth.uid());
  end if;
  update contents set status = p_decision::content_status where id = p_content;
  insert into activity_log (workspace_id, content_id, author_id, action)
    values (c.workspace_id, p_content, auth.uid(), 'mudou status para "'||p_decision||'"');
end $$;
```
Crie também `snapshot_version(p_content, p_note, p_source)` (mesma lógica de numeração, sem mudar status), `promote_idea(p_idea, p_format, p_date)` e `delete_content` (o `on delete cascade` já cobre as filhas; apague também os arquivos do Storage). Para `setStatus` livre, um `update contents set status` com RLS basta, acompanhado de insert em `activity_log` feito pelo `repo.ts`.

**Storage:** bucket privado `media`, caminho `{workspace_id}/{content_id|brand}/{asset_id}.{ext}`; policies em `storage.objects` pelo prefixo `(storage.foldername(name))[1]::uuid` com `is_member`. O front gera **URL assinada** (1 h) e cacheia por `asset.id` (substitui o `URL.createObjectURL` de `useAssetUrl`).

**Realtime:** habilitar publicação em `contents, comments, approvals, content_versions, ideas, activity_log, assets`. Use para invalidar queries (substitui o comportamento reativo do `useLiveQuery`).

**Auth:** e-mail e senha + convite (cadastro público desligado). Trigger em `auth.users` cria `profiles`. Trigger/função de convite cria `memberships`. SMTP próprio no domínio da MC (o padrão do Supabase tem limite baixo).

**Seed:** repetir a carga de `seed.ts`/`seed-data.ts` como script de migração do workspace 1: 4 pilares, 14 fontes, 36 conteúdos (28/09 a 18/12/2026), 12 MC Cuts, carrosséis de 28/09 a 26/10 em `revisao` com versão v1 `claude_external`, Reels das semanas 1 a 5 em `producao`. **Reaproveite os dados do zip** (`src/db/seed-data.ts`); o jeito mais seguro de migrar o que já existe é importar `dados/data/db.json` + `dados/data/media/` (snapshot `mc-studio/snapshot@1`).

### 10.3 Camada de dados no front (como trocar sem mexer na UI)

| v0 | v1 |
|---|---|
| `db/db.ts` (Dexie) | `lib/supabase.ts` com `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` |
| `useLiveQuery(() => db.X...)` | hooks em `lib/hooks.ts`/`lib/queries.ts` com `useQuery` + assinatura Realtime que faz `invalidateQueries`. Mantenha nomes (`useContents`, `usePillars`, `useSources`, `useIdeas`, etc.) e retorno `undefined` -> `?? []` como nos componentes atuais |
| `repo.ts` | mesmas funções e assinaturas (`saveContent, saveBody, createContent, deleteContent, setStatus, snapshotVersion, submitForReview, decide, restoreVersion, addComment, toggleComment, deleteComment, addAsset, saveIdea, deleteIdea, promoteIdea, setCurrentUser`) implementadas com supabase-js/RPC. `setCurrentUser` some (usuário vem da sessão) |
| `useCurrentUser/useUsers` | `useSession()` + join `memberships`/`profiles`; `Role` mapeia: `editor` (editor, admin, owner) e `aprovador` (approver, admin, owner) |
| `useSetting('avatarAssetId')` | `brand_kits.avatar_asset_id` |
| `BRAND` em `constants.ts` | lido de `brand_kits` (fallback para os valores atuais) |
| `CHANNELS/FORMATS` | continuam em `constants.ts` no início (catálogo global). Migrar para tabela só se for pedido |
| `sync/folder.ts` | **removido**. Backup = botão "Exportar workspace" (JSON `snapshot@1` + mídia) |
| `sync/inbox.ts` | vira Edge Function `inbox-import` + tela "Importar pacote" (mesmas regras do contrato; idempotência por hash em `inbox_imports`) |

Detalhes que o `useLiveQuery` escondia e o v1 precisa tratar:
1. **Autosave do drawer:** continua com debounce de 500 ms. Para não sobrescrever edição em andamento quando chegar evento Realtime do próprio usuário, só recarregue o `body` se `!dirty` (comportamento atual).
2. **Resolução de conflito simples:** `updated_at` no `update ... where updated_at = :lido` ou aceitar "última escrita vence" (v0 é assim) e avisar quando outro usuário alterou o mesmo conteúdo.
3. **Ordenação:** `contents` por `scheduled_at`, `versions` por `number`, `comments` por `created_at`, `activity` descendente.
4. **Contadores do header** (ideias abertas e pendentes de revisão) viram queries `count` (head) com Realtime.
5. Performance: calendário carrega todos os `contents` do workspace (poucas centenas); sem paginação por enquanto.

---

## 11. Demais ferramentas e integrações

Escopo por fase (da especificação v1, tudo ainda **não construído**; só implemente o que for pedido):

| Ferramenta | Papel | Como conectar |
|---|---|---|
| **Supabase** (projeto da empresa, plano Pro, região São Paulo) | Auth, Postgres, Storage, Realtime, Edge Functions, Vault, pg_cron | Migrations versionadas em `supabase/migrations`; secrets no Vault |
| **Hospedagem estática** | Serve o SPA em subdomínio da MC (ex.: `studio.mcinteligencia.com`) | Cloudflare Pages, Railway ou Vercel; deploy a partir do GitHub; configurar URLs de redirecionamento do Auth |
| **Buffer** (fase 3) | Só **executa** o agendamento. O Studio é a fonte da verdade | API GraphQL `api.buffer.com`, chave pessoal do owner da conta, guardada no Vault; mídia só por URL pública (bucket `publish`, caminho opaco); sync por janela de horário (cota Free 3.000 req/30 dias); tudo atrás de um adaptador (`schedule`, `cancel`, `status`) |
| **Anthropic API** (fase 4) | IA que escreve rascunho, nunca aprova nem agenda | Só em Edge Function `ai-run`, assíncrona, resultado validado contra o schema do `ContentBody`, gravada em `ai_runs`; aplicar cria versão `source='ai'`; teto mensal por workspace |
| **CarrosseIA** | Produção externa de carrossel | Fora do sistema; entrega por inbox. Custa créditos (criar = 1, capa por IA = 10): **só com confirmação** |
| **Claude/Cowork e scripts** (`render.mjs`, `mccut.mjs`, `reel.mjs`) | Produtores externos | Entregam pacote `inbox@1` e artes em `criativos\<data>\`; no v1 usam o endpoint `inbox-import` com token de serviço por workspace |
| **Google Drive** | Cronograma, roteiros, referências | Fora do app |
| **Make** | Disponível na conta, sem uso previsto no Studio | Não ligar sem pedido |

Regras invioláveis (Projeto): nada vai ao ar sem **versão aprovada** e **confirmação humana**; publicar, enviar mensagem ou gastar crédito só com confirmação explícita.

Variáveis de ambiente do front: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. **Nunca** commitar `.env` nem expor `service_role`.

---

## 12. Plano de recriação (ordem de execução)

1. **Scaffold:** `npm create vite` (React + TS), instalar as dependências da seção 2 (menos Dexie), copiar `index.html`, `tsconfig.json`, `vite.config.ts` (sem singlefile em produção).
2. **Tokens e CSS:** copiar `src/index.css` inteiro; conferir que as fontes carregam (`@font-face` com caminho do `node_modules`).
3. **Tipos e constantes:** copiar `db/types.ts`, `lib/constants.ts`, `lib/date.ts` sem alterações.
4. **Supabase:** criar migrations da seção 10.2, buckets, policies, Realtime, Auth. Rodar o advisor de segurança do Supabase e corrigir o que apontar.
5. **Camada de dados:** implementar `lib/supabase.ts`, `repo.ts` (mesmas assinaturas) e `hooks.ts` conforme 10.3.
6. **Componentes de visão:** copiar `SlideCanvas.tsx`, `Previews.tsx`, `BodyEditors.tsx`, `Filters.tsx`, `NewContentDialog.tsx`, `ContentDrawer.tsx` e as 5 views. Trocar apenas imports de dados (Dexie -> hooks novos).
7. **Shell:** `App.tsx` com login (tela simples, mesmo estilo `card` + `field` + `btn-primary`), sessão, e o header descrito em 5.
8. **Importar dados:** rodar o seed/migração (snapshot `db.json` + mídia) para o workspace da MC. Conferir contagens: 36 conteúdos, 4 pilares, 14 fontes, versões e comentários existentes.
9. **Tela "Importar pacote" + Edge Function `inbox-import`** respeitando `inbox@1`.
10. **Convites:** convidar o Marcelo como `editor` + `approver`; testar o fluxo de duas pessoas.
11. **Teste de isolamento:** criar workspace "Sandbox" e provar que nada vaza (tabelas e storage).
12. **Hospedar** e configurar domínio. Só depois, fases 3 (Buffer) e 4 (IA), cada uma com validação do Leo.

---

## 13. Critérios de aceite

1. Comparação lado a lado com o v0: header, calendário (mês e semana), Kanban, Ideias, Aprovação, Configurações e Drawer idênticos em layout, cores, textos e ícones.
2. Lâminas: os 9 layouts (A-I) e as 3 variantes renderizam iguais; exportar PNG gera 1080×1350 na ordem correta, com nomes `YYYY-MM-DD_NN.png`.
3. Arrastar no calendário reagenda; arrastar no Kanban muda status; ambos persistem e aparecem para o outro usuário em segundos (Realtime).
4. Fluxo completo: Briefing -> Enviar para revisão (cria vN) -> aprovador vê a fila -> Aprovar/Pedir ajustes (nota obrigatória) -> Agendado -> Publicado com link. Comentários, decisões e histórico registrados.
5. Autosave 500 ms sem perder digitação quando chega atualização remota.
6. Importar um pacote `inbox@1` de exemplo (do `CONTRATO-INBOX.md`) cria/atualiza conteúdos, gera versão `claude_external` e importa as imagens; reimportar o mesmo pacote não duplica.
7. Dados migrados batem em contagem por tabela, por status e por formato, e uma amostra de 10 conteúdos confere visualmente.
8. RLS: usuário de outro workspace não lê nem escreve nada; `viewer` não escreve; só aprovador decide.
9. `npm run typecheck` e `npm run build` limpos; nenhum segredo no bundle.
10. Nenhum texto de interface com travessão.

---

## 14. Armadilhas e detalhes que costumam escapar

- O calendário abre em **28/09/2026** quando a data atual é anterior; depois vira "hoje".
- A semana começa na **segunda**; o grid do mês tem sempre 42 células.
- `scheduledAt` é string de data **sem fuso**. Não converter para `Date` UTC (use `fromKey/toKey`).
- No MC Cut o texto **não** é caixa alta nem tem destaque amarelo na prévia (o campo `highlight` existe no modelo mas a prévia de MC Cut não o usa, conforme `PADRAO-ARTES-MC`). O editor mostra o texto em caixa alta apenas por estilo do input.
- O número de palavras por lâmina conta `título + texto` e avisa acima de 45 (não bloqueia).
- O limite de lâminas vem do dado do formato (`maxSlides`), nunca fixo no componente.
- `decide()` cria a versão se não existir; `submitForReview()` **sempre** cria nova versão.
- O avatar das lâminas é global do workspace (não por conteúdo).
- Excluir fonte/pilar não limpa referências em `source_ids`/`pillar_id` no v0; no v1 use `on delete set null` para pilar e limpe `source_ids` em RPC se necessário.
- Troca de formato no drawer **não migra** o `body` (só troca `format` e `channel`); o editor muda conforme o novo formato.
- O `Settings` do v0 permite editar nome/papel de usuários direto na tabela. No v1 isso vira gestão de membros, com a regra "não remover o último owner".

---

## 15. Pendências em aberto (da especificação v1; decidir antes de construir)

P1 owner e plano da organização Supabase; P2 owner do Buffer e limite de agendados; P3 host do front e DNS; P4 repositório GitHub; P5 IA só texto ou também estrutura de lâmina; P6 Reel com vídeo na v1; P7 nome do subdomínio; P8 produto futuro (agência ou software). Decisões já tomadas: D1 a D7 (Buffer só executa, Supabase como backend, domínio da MC, multi-tenant, v0 como referência, IA nunca aprova nem agenda, inbox@1 mantida) e recomendadas D8 a D12 (artes congeladas por versão, adaptador de publicação, sync por janela, IA assíncrona com diff, aprovador separado opcional).

---

## 16. Anexos (no zip, não duplicados aqui)

`src/**` completo, `docs/CONTRATO-INBOX.md`, `docs/ESPECIFICACAO-V1.md`, `CLAUDE.md`, `AI_CONTEXT.md`, `scripts/render/*`. Documentos do Projeto relacionados: `DIRECAO-CRIATIVA-INSTAGRAM.md`, `claude/PADRAO-ARTES-MC.md`, `PLANO-PRODUCAO-INSTAGRAM.md`, `claude/RADAR-SEMANAL.md`, `claude/ESPECIFICACAO-MC-CONTENT-STUDIO-V1.md`.
