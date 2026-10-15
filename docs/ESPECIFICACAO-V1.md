# MC Content Studio v1: especificação de produto e arquitetura

Status: **rascunho para validação** (07/10/2026). Nada deste documento foi construído. Ele existe para ser validado seção por seção antes de virar PRD no BC Harness.

Base: v0 em produção local (0.1.0), `AI_CONTEXT.md`, `types.ts`, `constants.ts`, contrato `mc-studio/inbox@1`, `DIRECAO-CRIATIVA-INSTAGRAM.md`, `PLANO-PRODUCAO-INSTAGRAM.md`, `PADRAO-ARTES-MC.md`, `RADAR-SEMANAL.md`.

Legenda de decisões: **[D]** decidido por Leo · **[R]** recomendado, aguardando validação · **[?]** aberto.

---

## 1. Ponto de partida (o que o v0 já é)

- App React 18 + Vite + TypeScript + Tailwind v4 em arquivo único (`file://`), dados em IndexedDB (Dexie), sincronização opcional com pasta (`data/db.json`, `data/media/`, `inbox/`).
- Telas: Calendário (mês/semana, arrastar reagenda), Kanban (arrastar muda status), Ideias, Aprovação (filas), Configurações. Drawer de conteúdo com abas Briefing, Revisão, Versões e Histórico.
- Modelo: Channel, Format (specs como dado), Pillar, Source, Idea, ContentItem (com `body` estruturado), Version, Asset, Comment, Approval, ActivityLog, Setting.
- Ciclo: rascunho auto-salvo, "Enviar para revisão" congela uma versão, aprovar ou pedir ajustes grava `approval` ligada à versão. Status: briefing, producao, revisao, ajustes, aprovado, agendado, publicado, arquivado.
- Renderização das lâminas no Design System MC 2026 (layouts A a I, variantes escuro, amarelo e claro), exportação PNG 1080×1350 via html-to-image.
- Produção externa entra por `inbox@1` (Claude/Cowork, CarrosseIA, scripts `render.mjs`, `mccut.mjs`, `reel.mjs`). Radar semanal entra por inbox e para em "revisão".
- Conteúdo: 12 semanas, carrosséis (seg), Reels (qua), MC Cuts (sex), com regra de apresentador (Marcelo: BI e dados; Leonardo: IA e carreira com IA).

**Limitações que motivam a v1:** dados presos ao navegador e à pasta; sem autenticação; sem acesso simultâneo do sócio; sem publicação nem agendamento; sem IA interna; marca e design system fixos no código (`BRAND`, `SlideCanvas`).

## 2. Objetivo da v1

> Um sistema único, online e multi-tenant onde a equipe planeja, produz, revisa, aprova e **agenda** conteúdo de redes sociais, com IA assistindo a criação, mantendo o humano como quem decide o que vai ao ar.

**Objetivos mensuráveis (a validar):**
1. Tudo que hoje está no v0 migrado sem perda, com o v0 continuando utilizável até o corte.
2. Leo e Marcelo acessam o mesmo calendário por URL própria, com papéis.
3. Um post aprovado vira agendamento no Buffer em até 3 cliques, com confirmação explícita.
4. Zero publicação sem versão aprovada e sem confirmação humana.
5. Qualquer geração de IA registra modelo, tokens e custo, com teto mensal por workspace.
6. Um segundo workspace de teste fica completamente isolado do primeiro (verificado por teste automatizado).

**Princípios:**
- O Studio é a fonte da verdade do calendário. O Buffer só executa **[D]**.
- Humano decide: IA escreve rascunho, nunca aprova nem agenda **[D]** (regra 5 do Projeto).
- Estruturado em texto, não em imagem: a IA e a API editam o `body`, a arte é derivada.
- Marca e regras são dado por workspace, não código.
- Evoluir o que existe: nomes, status, contrato da inbox e regras de domínio do v0 são preservados.

**Fora de escopo agora (explícito):** cadastro self-service, cobrança, domínio customizado por cliente, white label, métricas/analytics de redes, geração de imagem por IA, edição de vídeo, publicação direta por Meta/LinkedIn API (sem Buffer), app mobile.

## 3. Personas e papéis

| Persona | Quem | Faz |
|---|---|---|
| Dono/Admin | Leo | Configura workspace, integrações, marca, IA, membros; faz tudo |
| Editor | Leo, Marcelo | Cria, edita, envia para revisão, usa IA |
| Aprovador | Leo, Marcelo | Aprova ou pede ajustes; confirma agendamento |
| Leitor | convidado | Só vê calendário e conteúdo |
| Produtor externo | Claude/Cowork, scripts | Entrega pacotes pela inbox (token de serviço) |

Papéis por workspace: `owner`, `admin`, `editor`, `approver`, `viewer`. O par `editor`/`aprovador` do v0 vira permissões. Um usuário pode acumular editor e aprovador. Configuração do workspace `require_separate_approver` (padrão **desligado** enquanto Leo trabalha sozinho; ligável quando houver segundo aprovador) **[R]**.

## 4. Arquitetura

```
 Navegador: Studio v1 (SPA estática em studio.<dominio-MC>)
    │  supabase-js: chave anon + JWT do usuário + RLS
    ▼
 ┌─────────────────────────── Supabase (projeto da empresa) ────────────────────────────┐
 │ Auth      e-mail/senha + convite (cadastro público desligado)                        │
 │ Postgres  tabelas v0 + workspace_id em tudo; RLS por membership; pg_cron; pg_net      │
 │ Storage   media (privado)  |  publish (público, caminho opaco)                       │
 │ Vault     segredos por workspace (chave do Buffer)                                   │
 │ Realtime  progresso de IA, status de publicação                                      │
 │ Edge Functions (TypeScript/Deno, única camada com segredos)                          │
 │   ai-run ──────────► API da Anthropic                                                │
 │   publish-schedule ┐                                                                 │
 │   publish-cancel   ├► Adaptador de publicação ──► Buffer (GraphQL) ──► Instagram     │
 │   publish-sync ────┘      (interface, Buffer é o 1º adaptador)                       │
 │   inbox-import ◄── pacote mc-studio/inbox@1 (UI ou token de serviço)                 │
 │ pg_cron   publish-sync (janelas), rotinas (Radar), limpeza de mídia                  │
 └───────────────────────────────────────────────────────────────────────────────────────┘
```

**Papel de cada peça (resposta direta às dúvidas):**
- **Supabase** resolve auth, banco, backend (Edge Functions), conexões (segredos no Vault) e **mídia com URL pública** (bucket `publish`). Ele **não hospeda o front-end** e **não agenda a publicação**: quem dispara o post no horário é o Buffer (`dueAt`). O `pg_cron` do Supabase só reconcilia status e roda rotinas.
- **Front-end**: build estático servido em subdomínio da MC Inteligência (ex.: `studio.mcinteligencia.com`) por um host estático (Cloudflare Pages, Railway ou Vercel) **[?]**. O arquivo único `file://` deixa de ser a forma de entrega (login e links de convite exigem origem `https`).
- **Adaptador de publicação**: o Buffer fica atrás de uma interface (`schedule`, `cancel`, `status`). Trocar ou somar provedor (API Meta direta, LinkedIn) não muda o domínio **[R]**.

## 5. Multi-tenant

**Unidade de tenant: `workspace`.** MC Inteligência é o workspace nº 1. Um segundo workspace "Sandbox" existe desde a fase 1 só para provar isolamento.

**Regras [R]:**
1. Toda tabela de domínio tem `workspace_id NOT NULL`, indexado, e RLS ativa. Sem exceção.
2. Pertencimento via `memberships(workspace_id, user_id, role)`. Funções `is_member(ws)` e `has_role(ws, roles[])` (security definer) usadas nas policies, sem subconsulta repetida.
3. Storage: caminho `{workspace_id}/{content_id}/...` com policies em `storage.objects` pelo prefixo.
4. Edge Functions nunca confiam em `workspace_id` vindo do corpo: derivam do JWT e conferem membership.
5. Segredos por workspace no Vault; `service_role` só dentro das Edge Functions.
6. Nada global mutável: o `Setting` chave/valor do v0 passa a ser por workspace.
7. Catálogos globais (somente leitura): `channels` e `formats` do sistema (hoje `CHANNELS` e `FORMATS` em `constants.ts`). Workspace pode ter formatos próprios (`workspace_id` preenchido).
8. Cotas por workspace: orçamento mensal de IA, limite de armazenamento, limite de membros (campos desde já, aplicação simples).

**O que vira configuração (sai do código):**

| Hoje no código | Vai para |
|---|---|
| `BRAND` (cores, site, tagline, @handle) | `brand_kits` |
| Cores/fontes/layouts A a I no `SlideCanvas` | Layouts continuam código; recebem **tokens** do `brand_kits` |
| Pilares, fontes editoriais | `pillars`, `sources` por workspace |
| Direção criativa, tom de copy, regras de arte (`PADRAO-ARTES-MC`) | `ai_context` por workspace (texto versionado) |
| Regra de apresentador | `presenters` + regras no `ai_context` |
| Horário padrão de postagem, fuso | `workspaces.settings` |

**Honestidade sobre o custo:** multi-tenant "pronto para" custa `workspace_id` + RLS + testes agora e barato. Multi-tenant "produto" (onboarding, cobrança, limites, suporte) é outro projeto. Este documento entrega o primeiro e deixa o segundo possível.

## 6. Modelo de dados

Convenção: `id uuid`, `workspace_id uuid`, `created_at`, `updated_at`. Os ids UUID do v0 são **preservados** na migração.

**Identidade e tenant**
- `profiles(id = auth.users.id, name, avatar_asset)`
- `workspaces(id, name, slug, timezone, settings jsonb, plan)`
- `memberships(workspace_id, user_id, role)` · `invitations(workspace_id, email, role, token_hash, expires_at, accepted_at)`

**Marca e catálogo**
- `brand_kits(workspace_id, tokens jsonb, logo_asset_id, site, tagline, handle)`
- `channels` (global) · `workspace_channels(workspace_id, channel_id, handle, provider, provider_channel_id, enabled)`
- `formats` (global + por workspace; mesma forma do `Format` do v0)
- `pillars`, `sources`, `presenters(workspace_id, name, topics, avatar_asset)`

**Conteúdo (espelha o v0)**
- `ideas`
- `contents` = `ContentItem`; acrescenta `presenter_id`, `publish_at timestamptz` (data planejada `scheduled_at date` permanece), `current_version_id`, `published_url`
- `content_versions` = `Version` (`source`, `body jsonb`, `note`, `author_id`, `generation_meta jsonb`, `ai_run_id`)
- `approvals`, `comments`, `activity_log`
- `assets(workspace_id, content_id, bucket, path, mime, bytes, width, height, sha256, kind)` com `kind`: `raw` (foto, frame), `final_art`, `cover`, `video`, `logo`
- `version_assets(version_id, asset_id, position)`: **artes congeladas da versão aprovada**

**Publicação**
- `integrations(workspace_id, provider, status, vault_secret_id, meta jsonb)`
- `publications(id, workspace_id, content_id, version_id, workspace_channel_id, provider, provider_post_id, publish_at, status, error, attempts, published_url, requested_by, confirmed_at)`; status: `pending`, `scheduled`, `published`, `failed`, `canceled`; único ativo por (content, canal)
- `publication_events(publication_id, at, type, payload)`

**IA**
- `ai_context(workspace_id, key, content, version, active)`
- `ai_runs(workspace_id, content_id, user_id, kind, model, input_tokens, output_tokens, cost_usd, status, result jsonb, created_at)`
- `ai_budgets(workspace_id, month, limit_usd, spent_usd)`

**Inbox**
- `inbox_imports(workspace_id, package_hash, schema, result jsonb, imported_by)` (idempotência)

**Regras de integridade-chave**
- `publications` só aceita `version_id` cuja última `approval` é `aprovado` e que seja a `current_version_id` (trigger/função, não só interface).
- `contents.status` muda por função de transição (`transition_content`) que valida papel e origem; Kanban e botões chamam a mesma função.
- Conteúdo em `agendado` não aceita edição de `body`. "Reabrir" cancela a publicação (com confirmação) e volta a `ajustes`.

## 7. Fluxos

### 7.1 Ciclo de vida do conteúdo
`briefing → producao → revisao ⇄ ajustes → aprovado → agendado → publicado` · `arquivado` a qualquer momento.
Falha de publicação **não** é status do conteúdo: aparece como alerta vindo de `publications.status = failed`; o conteúdo permanece `agendado` até decisão humana (reagendar, cancelar ou reabrir).

### 7.2 Aprovação
1. Editor clica "Enviar para revisão": cria `content_version` (congela o `body`) e **gera as artes finais** no navegador (html-to-image 1080×1350), enviando ao bucket privado e ligando em `version_assets` **[R]**. O revisor vê exatamente o que será publicado.
2. Aprovador aprova ou pede ajustes (nota obrigatória em ajustes). Grava `approval`.
3. Aprovado: habilita "Agendar".

### 7.3 Agendamento e publicação (Buffer)
1. **Agendar** (conteúdo `aprovado`): escolhe conta(s) de destino, data e hora (padrão vem do plano e do horário do workspace). Mostra a prévia do que vai (artes, legenda, hashtags, primeiro comentário).
2. **Pré-checagem automática:** formato respeita specs (`maxSlides`, `captionMax`, dimensões); todas as artes existem; mídia copiada para o bucket `publish` e acessível por URL; horário no futuro; versão = versão aprovada vigente; conta Buffer ativa.
3. **Confirmação humana obrigatória** (modal com a prévia final, conta e horário em fuso do workspace).
4. `publish-schedule` cria `publication` (`pending`), chama o Buffer com `dueAt` em UTC e guarda o id do post. Status `scheduled`, conteúdo vai a `agendado`. Chave de idempotência = id da publicação; em timeout, reconciliar antes de repetir.
5. `publish-sync` consulta o Buffer **só em janelas** (de 5 min antes do horário até 60 min depois, a cada 5 min) mais uma reconciliação diária. Ao publicar: grava `published_url`, `publication = published`, conteúdo `publicado`. Em falha: `failed`, alerta na tela.
6. Reagendar ou cancelar no Studio altera ou remove o post no Buffer (capacidade da API a confirmar, ver riscos).
7. Mídia do bucket `publish` é removida N dias após `published` (a cópia privada permanece).

> **Cota do Buffer:** o plano Free permite 3.000 requisições por 30 dias. Polling a cada 15 min consumiria quase tudo. Por isso o sync é por janela (estimativa: ~9 chamadas por publicação, ~400 por mês com 45 posts).

### 7.4 IA
1. Em um conteúdo, o editor escolhe uma ação (ver 8.3) e clica gerar. A tela chama `ai-run`, que verifica papel, orçamento e monta o prompt com formato, pilar, apresentador, fontes e `ai_context` ativo.
2. Execução **assíncrona**: `ai_runs` entra como `running`, o front acompanha por Realtime (evita limite de tempo da função).
3. Resultado em JSON validado contra o schema do `ContentBody` (campos permitidos por ação). Se inválido, falha explícita, sem salvar.
4. A tela mostra **diff** entre rascunho atual e sugestão. O editor aplica tudo, parte, ou descarta. Aplicar integralmente cria versão com `source = 'ai'` e `generation_meta` (modelo, run, custo); aplicação parcial entra no rascunho e a versão sai como `human`.
5. IA nunca muda status além de popular rascunho. Nunca agenda.

### 7.5 Inbox (compatibilidade)
`mc-studio/inbox@1` continua válido, sem mudança **[D por CLAUDE.md]**. Duas portas de entrada: (a) tela "Importar pacote" (arrasta JSON + pasta de imagens), (b) endpoint `inbox-import` com token de serviço por workspace, para scripts. Importação é idempotente (`package_hash`), registra em `inbox_imports` e cria versões `claude_external`. Mudança de formato exige `@2` com os dois aceitos.

### 7.6 Migração v0 → v1
1. Congelar edições no v0. Exportar `data/db.json` + `data/media/` pela sincronização de pasta existente.
2. Script de importação (Edge Function ou CLI) cria o workspace MC, `brand_kits` a partir de `BRAND`, catálogos, pilares, fontes, e importa ideias, conteúdos, versões, aprovações, comentários, logs e assets, preservando UUIDs.
3. Blobs vão ao Storage (`media`), com `sha256` conferido.
4. Verificação: contagens por tabela, por status e por formato; amostra visual de 10 conteúdos; conferência de checksums.
5. Corte: v0 vira somente leitura/backup. Rollback = voltar a usar o v0 com o export.

## 8. Integrações

### 8.1 Supabase (da empresa)
Projeto na **organização da empresa** em plano Pro, região São Paulo. Migrations versionadas no repositório (`supabase/migrations`), aplicadas pela CLI no terminal/harness. E-mail de convite exige SMTP próprio (o padrão do Supabase tem limite baixo). Backups diários do plano + botão "Exportar workspace" (JSON + mídia) preservando a portabilidade que o v0 já tem.

### 8.2 Buffer
- API GraphQL (`api.buffer.com`), chave pessoal por Bearer, **criada apenas pelo owner da organização no Buffer**. Cada workspace guarda a sua no Vault (campo mascarado na tela).
- Mídia só por **URL pública** (sem upload) e precisa permanecer acessível até a publicação.
- Instagram: posts, stories e Reels listados; primeiro comentário suportado.
- A confirmar em teste real antes de qualquer outra coisa (spike da fase 3): carrossel com várias imagens, Reel com vídeo, editar/excluir post, disponibilidade de webhook, limite de posts agendados por canal no plano.

### 8.3 IA (Anthropic API)
Chave da API em Console, na conta da empresa, com **limite de gasto** definido; é cobrança separada da assinatura do Claude. Chamada só nas Edge Functions. Modelo por tarefa (configurável): modelo menor para legenda/hashtag/CTA, modelo maior para roteiro e carrossel completo. Contexto fixo (direção criativa, tom, regras) enviado com cache de prompt para reduzir custo. Registro em `ai_runs` e teto em `ai_budgets`.

**Ações de IA (escopo gradual):**
| Fase | Ação | Entrada | Saída |
|---|---|---|---|
| 4a | Legenda, hashtags, CTA | `body` + formato + pilar | `caption`, `hashtags`, `cta` |
| 4a | Reescrever/ajustar com instrução | trecho + instrução | texto novo (diff) |
| 4b | Roteiro de Reel com timecodes | briefing + apresentador | `script[]` |
| 4b | Carrossel completo (7 lâminas) | briefing + fontes | `slides[]` (layout, título ≤12 palavras, corpo ≤45 palavras, `sourceNote`) |
| 4c | Revisão automática | versão | lista de achados contra a direção criativa (sem travessão, fonte presente, limites) |
| 5 | Radar semanal | notícias das 5 fontes | rascunho em `revisao`, nunca publica |

### 8.4 Produção externa
CarrosseIA, Claude/Cowork e scripts de render seguem funcionando como produtores via inbox. Não são dependência da v1.

### 8.5 Hospedagem e domínio
SPA estática em subdomínio da MC, HTTPS, deploy automático a partir do repositório. Requer acesso ao DNS do domínio e um repositório (GitHub da empresa) **[?]**. URLs de redirecionamento do Auth configuradas para o domínio.

## 9. Telas

**Navegação:** Login → Seletor de workspace → Shell (menu lateral).

```
Shell
├─ Calendário        (home) mês/semana, filtros, arrastar para reagendar, ação em lote
├─ Quadro (Kanban)   arrastar muda status via transição validada
├─ Ideias            CRUD, "virar conteúdo"
├─ Aprovação         filas: aguardando minha aprovação · com ajustes · aprovados sem agendar
├─ Publicações       fila de agendados, publicados, falhas; reagendar/cancelar
├─ Biblioteca        fotos, frames (banco do Leonardo e do Marcelo), logos; filtro por apresentador/tag
├─ Importar pacote   inbox@1
├─ Conteúdo (drawer/página)
│    Briefing · Editor · Prévia · Revisão · Versões · Histórico · Publicação · painel IA
└─ Configurações
     Workspace · Marca · Pilares e fontes · Apresentadores · Formatos · Canais e integrações
     IA (contexto, modelos, orçamento, uso) · Membros e convites · Auditoria · Exportar
```

**Telas novas em relação ao v0:** Login/convite, seletor de workspace, Publicações, Biblioteca, Importar pacote (hoje está em Configurações), painel IA, abas Publicação, e as páginas de Marca, Apresentadores, Integrações, IA, Membros, Auditoria.

**Telas que evoluem:** Calendário (horário de publicação, indicador de agendado/falha, deslocar lote), Aprovação (mostra as artes congeladas), Drawer (aba Publicação e botão de IA).

**Telas-chave (resumo de conteúdo):**
- *Agendar:* conta, data/hora, prévia fiel, pré-checagem em lista (verde/vermelho), botão "Confirmar e agendar".
- *Publicações:* tabela por status com horário em fuso do workspace, link do post, erro legível e ação.
- *Painel IA:* ação, instrução opcional, custo estimado, diff, "aplicar tudo / aplicar parte / descartar", histórico de execuções do conteúdo.
- *Integrações:* estado do Buffer (conectado, última verificação), troca de chave, lista de canais mapeados.

## 10. User stories

Formato: **US-xx** · Como `<papel>`, quero `<capacidade>`, para `<benefício>`. **CA:** critérios de aceite.

### E1. Acesso e workspaces
- **US-01** Como dono, quero convidar o Marcelo por e-mail com um papel, para ele acessar sem criar conta aberta. **CA:** convite expira; cadastro público desligado; papel aplicado no primeiro acesso.
- **US-02** Como usuário, quero entrar com e-mail e senha e manter a sessão, para usar o Studio por URL. **CA:** sessão expira de forma segura; recuperação de senha por e-mail.
- **US-03** Como usuário de mais de um workspace, quero trocar de workspace, para separar contextos. **CA:** nenhum dado do outro workspace aparece em tela, busca ou cache.
- **US-04** Como admin, quero gerenciar membros e papéis, para controlar quem aprova e quem edita. **CA:** não é possível remover o último owner.
- **US-05** Como dono, quero prova automatizada de isolamento entre workspaces, para confiar no multi-tenant. **CA:** suíte que tenta ler/escrever/listar entre workspaces (tabelas, storage, funções) e falha em qualquer vazamento.

### E2. Planejamento e calendário
- **US-06** Como editor, quero ver o calendário por mês e semana com formato, status e apresentador, para enxergar o plano. **CA:** cores por formato/status como no v0; filtros por canal, formato, pilar, apresentador.
- **US-07** Como editor, quero arrastar um conteúdo para outra data, para reagendar. **CA:** se há publicação agendada, o sistema pede confirmação e atualiza o Buffer; se falhar, não muda a data.
- **US-08** Como editor, quero deslocar uma semana ou lote inteiro (ex.: +7 dias), para reorganizar o plano sem script. **CA:** pré-visualização do efeito; itens agendados listados; confirmação única.
- **US-09** Como editor, quero definir horário de publicação por conteúdo com padrão por formato, para respeitar o plano (ex.: Radar 12h, carrossel 18h). **CA:** padrão configurável no workspace; fuso do workspace.
- **US-10** Como editor, quero marcar o apresentador do conteúdo, para aplicar a regra Marcelo (BI/dados) e Leonardo (IA). **CA:** campo visível no calendário e usado como entrada da IA.

### E3. Ideias
- **US-11** Como editor, quero registrar ideias com gancho, formato e pilar, para não perder pauta. **CA:** igual ao v0.
- **US-12** Como editor, quero transformar ideia em conteúdo, para iniciar o briefing. **CA:** liga `promoted_content_id`; ideia mostra o destino.
- **US-13** Como editor, quero pedir à IA variações de uma ideia, para ampliar opções. **CA:** vira ideia nova, nunca conteúdo direto.

### E4. Produção
- **US-14** Como editor, quero editar o `body` estruturado (lâminas, roteiro, frames, legenda) com prévia no design system, para produzir sem sair do Studio. **CA:** prévia idêntica à exportação.
- **US-15** Como editor, quero subir e reutilizar fotos e frames numa biblioteca com tags e apresentador, para montar MC Cuts e carrosséis rápido. **CA:** busca por tag; uso rastreado por conteúdo.
- **US-16** Como editor, quero aplicar a marca do workspace (logo, site, @) automaticamente em toda lâmina, para cumprir o padrão fixo. **CA:** valores vêm do `brand_kit`, não do código.
- **US-17** Como editor, quero validação em tempo real contra as specs do formato (máx. lâminas, limite de legenda, palavras por lâmina, sem travessão), para evitar retrabalho. **CA:** avisos não bloqueiam rascunho, bloqueiam envio para revisão quando são regras duras.
- **US-18** Como editor, quero gerar e baixar as artes finais em PNG, para uso fora do sistema. **CA:** 1080×1350 (ou do formato), ordem correta.

### E5. Revisão e aprovação
- **US-19** Como editor, quero enviar para revisão e congelar uma versão com as artes, para o revisor ver o que será publicado. **CA:** versão numerada, imutável, com artes ligadas.
- **US-20** Como aprovador, quero comentar por lâmina e resolver comentários, para pedir ajustes precisos. **CA:** comentário com `slide_ref`; resolvido/aberto.
- **US-21** Como aprovador, quero aprovar ou pedir ajustes com nota, para registrar a decisão. **CA:** ajustes exigem nota; decisão ligada à versão.
- **US-22** Como aprovador, quero uma fila do que aguarda minha decisão, para não esquecer. **CA:** ordenada por data de publicação.
- **US-23** Como dono, quero ver o histórico completo (quem, quando, o quê), para auditoria. **CA:** `activity_log` filtrável por conteúdo e usuário.

### E6. Agendamento e publicação
- **US-24** Como dono, quero conectar o Buffer informando a chave e escolhendo o canal do Instagram, para habilitar agendamento. **CA:** chave guardada cifrada e nunca exibida; teste de conexão; canal mapeado a `workspace_channels`.
- **US-25** Como aprovador, quero agendar um conteúdo aprovado em data e hora, para publicar automaticamente. **CA:** só aparece em `aprovado`; pré-checagem; **confirmação com prévia**; cria `publication` e envia ao Buffer.
- **US-26** Como aprovador, quero ver o status real de cada publicação (agendado, publicado, falha) e o link do post, para acompanhar. **CA:** atualiza sozinho; falha mostra causa em português.
- **US-27** Como aprovador, quero reagendar ou cancelar uma publicação, para ajustar o plano. **CA:** reflete no Buffer; histórico registrado.
- **US-28** Como editor, quero ser impedido de editar o corpo de um conteúdo agendado, para não divergir do que foi aprovado. **CA:** botão "Reabrir" cancela a publicação com confirmação e volta a `ajustes`.
- **US-29** Como dono, quero que o sistema nunca publique versão não aprovada, para cumprir a regra 5. **CA:** bloqueio no banco, testado.
- **US-30** Como editor, quero definir primeiro comentário (ex.: hashtags) por publicação, para seguir a prática do perfil. **CA:** enviado ao Buffer quando suportado.
- **US-31** Como dono, quero ser avisado em caso de falha de publicação, para agir a tempo. **CA:** alerta na interface na fase 3; e-mail na evolução.

### E7. IA
- **US-32** Como editor, quero gerar legenda, hashtags e CTA a partir do `body`, para ganhar tempo. **CA:** sugestão em diff; nada é aplicado sem ação do editor.
- **US-33** Como editor, quero gerar roteiro de Reel com timecodes por apresentador, para gravar. **CA:** respeita duração do formato e regra de apresentador.
- **US-34** Como editor, quero gerar um carrossel de 7 lâminas a partir de briefing e fontes, para acelerar a semana. **CA:** layout A/E nas pontas, título ≤12 palavras, ≤45 palavras por lâmina, fonte quando houver número, sem travessão.
- **US-35** Como editor, quero pedir revisão automática contra a direção criativa, para pegar erros antes do aprovador. **CA:** lista de achados com lâmina e regra.
- **US-36** Como dono, quero definir o contexto da IA (direção criativa, tom, regras) editável e versionado, para controlar o resultado. **CA:** mudança gera nova versão; execuções registram qual versão usaram.
- **US-37** Como dono, quero limite mensal de gasto e relatório de uso por usuário e ação, para não ter surpresa de custo. **CA:** bloqueio ao atingir o teto; aviso em 80%.
- **US-38** Como dono, quero agendar uma rotina (Radar semanal) que gera rascunho em revisão, para manter o post fixo de segunda. **CA:** nunca publica; entra como `revisao`; registra fontes e descartes.

### E8. Inbox
- **US-39** Como produtor externo, quero entregar um pacote `inbox@1` por token, para continuar usando Claude/Cowork. **CA:** idempotente; mesmo comportamento de `match`/`create`/`set`/`body`.
- **US-40** Como editor, quero importar um pacote pela interface, para quando não houver automação. **CA:** relatório do que foi aplicado, criado e ignorado.

### E9. Migração e portabilidade
- **US-41** Como dono, quero migrar todo o v0 sem perder nada, para continuar de onde parei. **CA:** contagens e checksums conferidos; amostra visual aprovada.
- **US-42** Como dono, quero exportar o workspace (JSON + mídia), para backup e saída. **CA:** formato compatível com o import da migração.

### E10. Administração do workspace
- **US-43** Como admin, quero editar marca, pilares, fontes, apresentadores e formatos, para adaptar sem código. **CA:** alterações refletem no calendário, na prévia e na IA.
- **US-44** Como admin, quero ver custos de IA e uso de armazenamento, para gestão.

## 11. Requisitos não funcionais

- **Segurança:** RLS em 100% das tabelas e do storage; `service_role` fora do navegador; Vault para segredos; buckets `publish` com caminho não adivinhável e sem listagem; JWT validado nas funções; limites de taxa por usuário; segredos nunca em log.
- **Privacidade (LGPD):** dados pessoais limitados a nome e e-mail de membros; ação de exclusão de conta e de workspace; região São Paulo.
- **Confiabilidade:** operações de publicação idempotentes; reconciliação diária; nenhum estado "agendado" sem `publication` correspondente (verificação periódica).
- **Desempenho:** calendário com 200+ conteúdos fluido; artes geradas no cliente, com fila para lote.
- **Observabilidade:** logs das funções, `publication_events`, painel de falhas, métrica de custo de IA.
- **Qualidade:** testes de RLS entre dois workspaces; testes de transição de status; testes de contrato da inbox; teste ponta a ponta de agendamento em canal de teste.
- **Custo (estimativa a validar):** Supabase Pro a partir de US$ 25/mês (compute Micro coberto pelo crédito do plano); host estático gratuito ou baixo; Anthropic por uso, com teto; Buffer conforme plano existente.

## 12. Fases (cada uma vira um PRD no BC Harness, com porta de validação)

| Fase | Entrega | Porta (validação do Leo) |
|---|---|---|
| 0. Fundação | Contas e acessos (Supabase da empresa, Buffer, Anthropic, domínio, repositório); decisões D1 a D12 fechadas; **spike do Buffer** (carrossel, Reel, editar/excluir, limites) em canal de teste | Resultado do spike muda ou confirma 7.3 |
| 1. Base multi-tenant | Schema, Auth, RLS, 2 workspaces, front hospedado no domínio, migração do v0, telas existentes funcionando online | Contagens batem; Marcelo entra; teste de isolamento verde |
| 2. Mídia e artes | Storage, artes finais congeladas por versão, biblioteca, brand kit | Revisor vê exatamente a arte publicada |
| 3. Publicação | Integração Buffer, Agendar, Publicações, sync por janela, falhas | 1 post real agendado e publicado com confirmação |
| 4. IA | 4a legenda/CTA, 4b roteiro e carrossel, 4c revisão automática; orçamento | Custo por ação aceitável; qualidade aprovada em 5 amostras |
| 5. Rotinas e expansão | Radar semanal, Reel com vídeo, LinkedIn e YouTube | Radar chega em `revisao` sozinho |
| 6. Produto (futuro) | Onboarding self-service, cobrança, planos | Só se houver demanda |

O v0 permanece utilizável até o fim da fase 1. Regras do `CLAUDE.md` seguem valendo: atualizar `AI_CONTEXT.md` a cada mudança, não quebrar schema sem migração, branch isolada, nunca commitar `.env`.

## 13. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Buffer não aceitar carrossel/Reel como esperado ou não permitir editar/excluir | Quebra o fluxo central | Spike na fase 0 antes de construir; adaptador permite plano B (API Meta direta) |
| Cota de 3.000 req/30 dias | Sync falha no fim do mês | Sync por janela; contador de uso; alerta em 70% |
| Chave do Buffer é pessoal e só do owner | Dependência de uma pessoa; modelo difícil num produto | Aceitar no início; para produto, avaliar contato com o suporte de desenvolvedores do Buffer ou provedor próprio |
| Mídia pública | Vazamento de arte antes de postar | Caminho opaco, expiração após publicar, só arte final |
| Custo de IA solto | Gasto surpresa | Orçamento por workspace, teto bloqueante, registro por execução |
| Diferença entre arte aprovada e arte renderizada | Publicar algo diferente do revisado | Artes congeladas por versão |
| Multi-tenant mal testado | Vazamento entre clientes | Suíte de isolamento na fase 1, em CI |
| Escopo crescer (produto antes de uso real) | Atraso | Fase 6 explicitamente fora; fases com porta |
| E-mail de convite caindo em spam / limite do SMTP padrão | Marcelo não consegue entrar | SMTP próprio no domínio |

## 14. Decisões e pendências

| # | Decisão | Estado |
|---|---|---|
| D1 | Buffer só executa; Studio manda | [D] |
| D2 | Supabase = auth, banco, backend, conexões, storage de mídia pública | [D] |
| D3 | Studio hospedado no domínio da MC Inteligência | [D] |
| D4 | Multi-tenant desde o início (`workspace_id` + RLS) | [D] |
| D5 | v0 é a referência; evolução por demanda e com validação | [D] |
| D6 | IA nunca aprova nem agenda; confirmação humana sempre | [D] (regra 5) |
| D7 | Inbox `@1` mantida | [D] (CLAUDE.md) |
| D8 | Artes congeladas por versão no envio para revisão | [R] |
| D9 | Adaptador de publicação (Buffer é o primeiro) | [R] |
| D10 | Sync do Buffer por janela, não por intervalo fixo | [R] |
| D11 | IA assíncrona com diff e aplicação manual | [R] |
| D12 | Aprovador separado opcional por workspace (desligado hoje) | [R] |
| P1 | Quem é owner da organização Supabase da empresa e o plano está em Pro? | [?] |
| P2 | Quem é owner da conta Buffer; Instagram já conectado; plano e limite de agendados | [?] |
| P3 | Host do front (Cloudflare Pages, Railway ou Vercel) e quem controla o DNS | [?] |
| P4 | Repositório (GitHub da empresa) | [?] |
| P5 | IA só texto ou também montar lâminas nos layouts A a I | [?] (recomendação: texto e estrutura de lâmina, a arte continua do renderizador) |
| P6 | Reel com vídeo na v1 ou só roteiro e capa (recomendação: fase 5) | [?] |
| P7 | Nome do subdomínio | [?] |
| P8 | O produto futuro atenderia clientes do Social Media (agência) ou venda de software? Muda a fase 6, não a fase 1 | [?] |

## 15. Pré-requisitos para a fase 0 (checklist)

- [ ] Acesso Owner/Admin na organização Supabase da empresa; organização em Pro.
- [ ] Personal Access Token do Supabase para a CLI; senha do banco em gerenciador de senhas.
- [ ] Chave de API do Buffer gerada pelo owner; Instagram conectado.
- [ ] Chave da Anthropic no workspace da empresa com limite de gasto.
- [ ] Acesso ao DNS do domínio e escolha do host estático.
- [ ] Repositório criado; v0 versionado.
- [ ] SMTP definido para convites e recuperação de senha.
