# Contrato da inbox — `mc-studio/inbox@1`

A inbox é a ponte da v0 entre a produção feita **fora do sistema** (Claude/Cowork) e o MC Content Studio.

**Fluxo:**

1. O produtor grava um arquivo `.json` em `<pasta conectada>/inbox/`. Imagens podem ir em `inbox/imagens/`.
2. No sistema, clique em **Configurações → Importar inbox**.
3. Cada item é aplicado e o arquivo vai para `inbox/processados/`.

```json
{
  "schema": "mc-studio/inbox@1",
  "items": [
    {
      "match": { "scheduledAt": "2026-09-28", "format": "ig_carrossel" },
      "create": { "title": "…", "format": "ig_carrossel", "scheduledAt": "2026-09-28", "pillar": "IA aplicada", "tag": "IA + Carreira" },
      "set": { "status": "revisao", "hook": "…", "publishedUrl": "…" },
      "body": {
        "caption": "…", "hashtags": "…", "cta": "…", "externalLink": "https://carrosseia.com.br/…",
        "slides": [{ "layout": "A", "tag": "…", "title": "…", "body": "…", "sourceNote": "…", "assetFile": "imagens/28-09_01.png" }],
        "script": [{ "time": "0–5s", "speech": "…", "screenText": "…" }],
        "frames": [{ "text": "…", "highlight": "…", "assetFile": "imagens/frame1.jpg" }],
        "cover": { "title": "…", "highlight": "…" }
      },
      "versionNote": "Roteiro v2 após comentário do aprovador",
      "source": "claude_external",
      "comment": "texto opcional que vira comentário"
    }
  ],
  "ideas": [{ "title": "…", "hook": "…", "notes": "…", "format": "ig_reel", "pillar": "Dados / BI / Analytics" }]
}
```

**Regras de aplicação:**

- **Busca do conteúdo:** `match.id` tem prioridade; na falta dele, vale `scheduledAt` + `format`. Se nada for encontrado e existir `create`, o conteúdo é criado.
- **`body`:** substitui as chaves enviadas (merge raso). `slides`, `script` e `frames` são substituídos por inteiro.
- **Imagens:** `assetFile` / `imageAssetFile` são caminhos relativos a `inbox/`. O arquivo é importado para o sistema.
- **Versões:** sempre que houver `body` ou `versionNote`, é criada uma nova versão com `source`, que por padrão é `claude_external`.
- **Formatos:** `ig_carrossel`, `ig_estatico`, `ig_reel`, `ig_mc_cut`, `yt_video`, `yt_short`, `li_post`, `li_documento`.
- **Status:** `briefing`, `producao`, `revisao`, `ajustes`, `aprovado`, `agendado`, `publicado`, `arquivado`.
