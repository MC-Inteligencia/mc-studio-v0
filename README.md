# MC Content Studio (v0)

Sistema local para organizar, editar, revisar, aprovar e pré-visualizar o conteúdo da MC Inteligência.

## Usar
1. Dê duplo clique em **`MC Content Studio.html`**. Use o Chrome ou o Edge.
2. Em **Configurações → Conectar pasta**, escolha a pasta **`dados`**, que fica ao lado do HTML. Isso liga o backup automático e a inbox.
3. Troque o usuário no topo: **Leo (editor)** ou **Aprovador**.

Os dados ficam no navegador. A pasta `dados/` recebe uma cópia automática (`data/db.json` + `data/media/`) e é por ela que o conteúdo produzido pelo Claude entra (`inbox/`).

## Desenvolver
Veja `codigo/`: `npm install && npm run build`.
