// Carga inicial: Calendário Editorial Instagram MC Inteligência (Google Sheets, 23/09/2026)
// + roteiros V1 (Google Docs). Carrosséis de 28/09 a 26/10 já com roteiro final (fonte: claude_external).
import type { Pillar, Source, Slide, ScriptTake } from './types'

export const PILLARS: Pillar[] = [
  { id: 'p_ia', name: 'IA aplicada', weight: 35, role: 'Conectar IA a produtividade, ROI e trabalho real', themes: 'ChatGPT, Claude, prompts, agentes, automações, construção de soluções, segurança', color: '#FDC700' },
  { id: 'p_dados', name: 'Dados / BI / Analytics', weight: 30, role: 'Reforçar a autoridade da MC como consultoria de dados', themes: 'Power BI, Fabric, modelos semânticos, dashboards, qualidade de dados, decisão', color: '#155DFC' },
  { id: 'p_carreira', name: 'Carreira + Inglês', weight: 20, role: 'Conectar capacitação técnica a crescimento profissional', themes: 'Skills, analista ampliado, comunicação, inglês profissional, júnior/pleno, empregabilidade', color: '#A855F7' },
  { id: 'p_consult', name: 'Consultoria + ROI', weight: 15, role: 'Mostrar maturidade de negócio e gerar demanda para serviços', themes: 'ROI, maturidade de dados/IA, processos, governança, cases, decisão executiva', color: '#16A34A' },
]

export const SOURCES: Source[] = [
  { id: 's_linkedin', name: 'LinkedIn — Skills on the Rise', edition: '2026', evidence: 'Brasil 2026 (fev/2026): 1 Estratégia de IA, plataformas e sistemas inteligentes; 2 Marketing, comunicação e storytelling estratégico. Brasil 2025: Inteligência artificial em 1º. Global 2025: AI literacy em 1º.', usage: 'Carreira, IA literacy, stack profissional do analista', url: 'https://www.linkedin.com/business/talent/blog/learning-and-development/skills-on-the-rise', note: 'Dados do LinkedIn; usar com recorte temporal explícito.' },
  { id: 's_wef', name: 'World Economic Forum — Future of Jobs', edition: '2025', evidence: 'AI e big data lideram as skills tecnológicas em crescimento; pensamento analítico, criatividade e liderança permanecem relevantes.', usage: 'Carreira, trilhas de aprendizagem, combinação humano + IA', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/', note: 'Relatório global; não tratar como retrato específico do Brasil.' },
  { id: 's_anthropic', name: 'Anthropic Economic Index — Cadences', edition: '26/06/2026', evidence: 'Uso de Claude mostra avanço de tarefas agentivas; survey reporta ganhos percebidos de velocidade, escopo, qualidade e aprendizagem.', usage: 'Produtividade, automação x augmentação, futuro do trabalho', url: 'https://www.anthropic.com/research/economic-index-june-2026-report', note: 'A própria Anthropic informa que a amostra não representa a população geral.' },
  { id: 's_openai', name: 'OpenAI — State of Enterprise AI', edition: 'dez/2025', evidence: 'Pesquisa com 9 mil funcionários de quase 100 empresas clientes + dados de uso: usuários do ChatGPT Enterprise relatam economizar 40 a 60 min por dia ativo (até 80 min em algumas funções) e ampliar o conjunto de tarefas que conseguem realizar.', usage: 'Analista ampliado, escopo profissional, produtividade', url: 'https://openai.com/business/guides-and-resources/the-state-of-enterprise-ai-2025-report/', note: 'Fonte do fornecedor; usar dados com população e contexto explícitos.' },
  { id: 's_wti', name: 'Microsoft — Work Trend Index', edition: 'mai/2026', evidence: 'Edição 2026: o maior fator de impacto da IA é organizacional, não individual; trabalhadores estão prontos, organizações não (paradoxo da transformação). Edição 2025 trouxe o conceito de frontier firm e agent boss.', usage: 'Agentes, delegação, redesenho do trabalho', url: 'https://news.microsoft.com/annual-work-trend-index-2026/', note: 'Usar como tendência atribuída à Microsoft, não como consenso.' },
  { id: 's_fabric', name: 'Microsoft Fabric Blog', edition: '29/06/2026', evidence: 'Microsoft destaca times de dados como líderes na adoção de agentes confiáveis, com workflows estruturados, contexto e inteligência em tempo real.', usage: 'Dados como fundação para agentes, papel dos times de BI/data', url: 'https://www.microsoft.com/en-us/microsoft-fabric/blog/', note: 'Fonte de fornecedor; ótima para tendências de produto/ecossistema.' },
  { id: 's_learn_copilot', name: 'Microsoft Learn — Copilot + Semantic Models', edition: 'Atualizado em 2026', evidence: 'Copilot pode apoiar desenvolvimento e consumo de modelos semânticos, mas dados/modelo/usuários precisam ser preparados para evitar respostas ruins.', usage: 'Power BI + IA, preparação de dados para IA', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-semantic-models', note: 'Documentação oficial.' },
  { id: 's_learn_verified', name: 'Microsoft Learn — Verified Answers', edition: 'set/2026 (preview)', evidence: 'Respostas verificadas permitem curar respostas humanas aprovadas no modelo semântico para perguntas críticas. Prep data for AI segue em preview (Microsoft Learn, atualizado em 2026).', usage: 'Governança e confiança no Copilot do Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai-verified-answers', note: 'Recurso em evolução; verificar status de preview antes de publicar.' },
  { id: 's_learn_instr', name: 'Microsoft Learn — AI Instructions', edition: '2026', evidence: 'Autores de modelos podem fornecer contexto de negócio, terminologia e regras de análise para o Copilot.', usage: 'Ensinar contexto e semântica para IA aplicada a BI', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai-instructions', note: 'Documentação oficial.' },
  { id: 's_ets', name: 'ETS — TOEIC Global English Skills Report', edition: '09/03/2026', evidence: 'Pesquisa com mais de 1.300 líderes de RH em 17 países: 81% dizem que IA está aumentando a necessidade de inglês.', usage: 'Inglês + IA + carreira global', url: 'https://www.ets.org/newsroom/toeic-global-english-skills-report-launch.html', note: 'Pesquisa patrocinada pelo ETS; apresentar metodologia e atribuição.' },
  { id: 's_ef', name: 'EF English Proficiency Index', edition: '2025', evidence: 'Base de 2,2 milhões de adultos em 123 países/regiões. Brasil em 75º (482 pontos, subiu 6 posições); fala é a maior dificuldade global.', usage: 'Inglês profissional, carreira e comunicação', url: 'https://www.ef.com/wwen/epi/', note: 'Índice próprio da EF; usar como referência, não como única medida nacional.' },
  { id: 's_nist', name: 'NIST — Generative AI Profile', edition: 'jul/2024 (vigente; AI RMF 1.0 em revisão em 2026)', evidence: 'Framework para incorporar confiabilidade, segurança, privacidade, transparência e avaliação de risco ao uso de IA generativa.', usage: 'Segurança, governança, políticas de uso de IA', url: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', note: 'Referência independente e transversal.' },
  { id: 's_openai_priv', name: 'OpenAI — Privacidade empresarial', edition: 'Atualizado em 2026', evidence: 'Dados de produtos empresariais e API não são usados para treinar modelos por padrão; controles variam por produto/plano.', usage: 'Segurança e escolha correta de ambiente empresarial', url: 'https://openai.com/pt-BR/enterprise-privacy/', note: 'Checar produto/plano antes de generalizar para contas pessoais.' },
  { id: 's_snowflake', name: 'Snowflake — Trusted AI foundation', edition: '02/06/2026', evidence: 'Reforça que IA em produção depende de dados governados, segurança e infraestrutura conectada.', usage: 'Data readiness, agentes empresariais e governança', url: 'https://www.snowflake.com/en/blog/trusted-data-trusted-ai/', note: 'Fonte de fornecedor; usar para tendência, não como benchmark neutro.' },
]

const TAG_TO_PILLAR: Record<string, string> = {
  'IA + Carreira': 'p_carreira', 'Carreira': 'p_carreira', 'Carreira + IA': 'p_carreira', 'Inglês + Carreira': 'p_carreira',
  'Inglês + IA': 'p_carreira', 'Produtividade + Carreira': 'p_carreira', 'Construção + Carreira': 'p_carreira',
  'IA + Produtividade': 'p_ia', 'IA aplicada': 'p_ia', 'Produtividade': 'p_ia', 'Agentes + Automação': 'p_ia', 'Agentes': 'p_ia',
  'Construção com IA': 'p_ia', 'Segurança + IA': 'p_ia',
  'Dados + IA': 'p_dados', 'Power BI + IA': 'p_dados', 'Dados + Negócio': 'p_dados',
  'Governança': 'p_consult', 'Consultoria + IA': 'p_consult', 'ROI': 'p_consult', 'Automação': 'p_consult',
}
export const pillarForTag = (t: string) => TAG_TO_PILLAR[t]

type Fmt = 'Carrossel' | 'Reel' | 'MC Cut'
// [semana, data, formato, tag, título, hook, base]
export const CALENDAR: [number, string, Fmt, string, string, string, string][] = [
  [1, '2026-09-28', 'Carrossel', 'IA + Carreira', 'AI literacy virou skill de carreira: mas o que isso significa na prática?', 'No Brasil, estratégia de IA lidera as habilidades em alta do LinkedIn em 2026; o diferencial é transformar ferramenta em resultado.', 'LinkedIn Skills on the Rise 2026'],
  [1, '2026-09-30', 'Reel', 'Carreira', '3 habilidades para combinar com IA em 2026', 'IA sem comunicação, pensamento estratégico e capacidade analítica vira só velocidade.', 'LinkedIn + WEF Future of Jobs'],
  [1, '2026-10-02', 'MC Cut', 'IA + Carreira', 'Saber usar ChatGPT não é o destino', 'Saber usar ChatGPT tende a virar básico. Saber aplicar IA ao negócio é a competência.', 'Editorial derivado da semana'],
  [2, '2026-10-05', 'Carrossel', 'IA + Produtividade', 'Você ganhou tempo com IA. Mas ficou mais produtivo?', 'Economizar minutos é só o começo; produtividade exige reinvestir capacidade em resultado.', 'OpenAI Enterprise 2025 + Anthropic Economic Index 2026'],
  [2, '2026-10-07', 'Reel', 'IA aplicada', '3 níveis de uso de IA: perguntar, delegar, redesenhar', 'O salto de ROI acontece quando a IA deixa de ser só resposta e entra no processo.', 'OpenAI + Anthropic; framing MC'],
  [2, '2026-10-09', 'MC Cut', 'Produtividade', 'A IA te devolveu 2 horas. E agora?', 'A pergunta não é só quanto tempo você economizou. É onde reinvestiu esse tempo.', 'Editorial MC'],
  [3, '2026-10-12', 'Carrossel', 'Dados + IA', 'O problema dos agentes não é só o modelo: é contexto, dados e governança', 'Agentes confiáveis dependem de dados estruturados, contexto compartilhado e controles.', 'Microsoft Fabric 2026 + Snowflake 2026'],
  [3, '2026-10-14', 'Reel', 'Dados + IA', 'Por que um agente com dados ruins continua sendo um problema', 'Mais autonomia não compensa dado incompleto, contexto errado ou permissão mal definida.', 'Microsoft Fabric + Snowflake'],
  [3, '2026-10-16', 'MC Cut', 'Governança', 'Antes de dar autonomia à IA', 'Antes de dar autonomia à IA, dê contexto, dados confiáveis e limites.', 'Editorial derivado da semana'],
  [4, '2026-10-19', 'Carrossel', 'Power BI + IA', 'Power BI + IA: o novo trabalho começa antes do prompt', 'Copilot depende de modelo semântico preparado: contexto, estrutura, instruções e respostas verificadas.', 'Microsoft Learn — Copilot com modelos semânticos'],
  [4, '2026-10-21', 'Reel', 'Power BI + IA', '3 coisas para preparar antes de usar Copilot no Power BI', 'Simplifique o schema, adicione contexto e teste respostas críticas.', 'Microsoft Learn — Prep data for AI'],
  [4, '2026-10-23', 'MC Cut', 'Power BI + IA', 'IA não conserta modelo semântico ruim', 'Se a base não entende o negócio, o Copilot também não vai entender por mágica.', 'Editorial + Microsoft Learn'],
  [5, '2026-10-26', 'Carrossel', 'Agentes + Automação', 'Prompt, automação ou agente? Como escolher a arquitetura mínima', 'Nem todo problema pede autonomia; escolha a menor solução que resolve bem.', 'Microsoft Work Trend Index + framing MC'],
  [5, '2026-10-28', 'Reel', 'Agentes', 'Você provavelmente não precisa de um agente', 'Se um prompt ou automação determinística resolve, agente pode ser complexidade sem ROI.', 'Microsoft + Snowflake; análise MC'],
  [5, '2026-10-30', 'MC Cut', 'Agentes', 'Agente não é chatbot com nome bonito', 'Autonomia, ferramentas, contexto e controle mudam o jogo — e o risco.', 'Editorial MC'],
  [6, '2026-11-02', 'Carrossel', 'Carreira', 'A stack profissional do analista em 2026', 'Dados + IA + negócio + comunicação + inglês: a combinação que amplia o profissional.', 'WEF + LinkedIn + EF/ETS'],
  [6, '2026-11-04', 'Reel', 'Carreira + IA', 'O que um júnior NÃO deveria delegar à IA', 'Use IA para acelerar aprendizado, não para pular fundamentos que você ainda precisa construir.', 'Framing MC + Anthropic (learning/automation)'],
  [6, '2026-11-06', 'MC Cut', 'Carreira', 'IA acelera entrega. Não substitui fundamento.', 'Se você não entende o que está validando, velocidade pode só acelerar o erro.', 'Editorial MC'],
  [7, '2026-11-09', 'Carrossel', 'Inglês + Carreira', 'A IA matou a necessidade de inglês? Os dados apontam outra direção', 'Tradução evoluiu, mas empregadores seguem valorizando comunicação em inglês, especialmente em colaboração global.', 'ETS Global English Skills Report 2026 + EF EPI 2025'],
  [7, '2026-11-11', 'Reel', 'Inglês + IA', 'Como usar IA para treinar inglês de reunião de dados', 'Simule stakeholder, apresentação de KPI, objeções e follow-up em inglês.', 'Aplicação prática MC'],
  [7, '2026-11-13', 'MC Cut', 'Inglês + Carreira', 'Tradução automática não entra na reunião por você', 'IA ajuda no idioma; comunicação ao vivo continua sendo uma competência profissional.', 'Editorial + EF/ETS'],
  [8, '2026-11-16', 'Carrossel', 'Consultoria + IA', 'Usar IA não é implementar IA: 5 níveis de maturidade', 'Do uso individual ao workflow integrado e governado: cada nível exige decisões diferentes.', 'Microsoft + OpenAI + framework MC'],
  [8, '2026-11-18', 'Reel', 'ROI', 'Como encontrar um caso de uso de IA com ROI em 60 segundos', 'Procure frequência, tempo, custo, erro, impacto e facilidade de validação.', 'Framework MC'],
  [8, '2026-11-20', 'MC Cut', 'Automação', 'Automatizar processo ruim só faz o erro rodar mais rápido', 'Antes de automatizar, elimine etapas inúteis e defina o que sucesso significa.', 'Editorial MC'],
  [9, '2026-11-23', 'Carrossel', 'Dados + Negócio', 'Seu dashboard informa ou muda uma decisão?', 'Dashboard bonito não é resultado; conecte métrica, contexto, decisão e ação.', 'Pilar consultoria MC'],
  [9, '2026-11-25', 'Reel', 'Dados + IA', 'Use IA para atacar seu próprio dashboard', 'Peça para a IA agir como diretor, levantar objeções e apontar decisões que o painel não suporta.', 'Demonstração prática MC'],
  [9, '2026-11-27', 'MC Cut', 'Dados + Negócio', 'Seu trabalho não termina quando o dashboard fica pronto', 'O valor aparece quando alguém entende melhor e decide melhor.', 'Editorial MC'],
  [10, '2026-11-30', 'Carrossel', 'Segurança + IA', 'IA com dados da empresa: 7 perguntas antes de colar qualquer coisa', 'Dados sensíveis, autorização, retenção, acesso, finalidade, validação e governança precisam vir antes da conveniência.', 'Tema da trilha de segurança MC; pesquisa adicional no roteiro'],
  [10, '2026-12-02', 'Reel', 'Segurança + IA', 'A regra simples para não fazer besteira com dados e IA', 'Se você não colocaria aquele dado em uma ferramenta externa sem autorização, não cole em IA por impulso.', 'Boas práticas MC; validar por política de cada ferramenta'],
  [10, '2026-12-04', 'MC Cut', 'Governança', 'Produtividade sem governança vira risco', 'Velocidade não compensa falta de controle quando os dados importam.', 'Editorial MC'],
  [11, '2026-12-07', 'Carrossel', 'Construção com IA', 'Do problema ao app: como um analista pode construir soluções sem virar dev', 'Problema → requisitos → arquitetura → construção → validação → deploy.', 'Trilha MC — Claude/Cowork / DemandFlow'],
  [11, '2026-12-09', 'Reel', 'Construção com IA', 'Construí uma solução simples com IA sem escrever tudo linha por linha', 'O papel do analista: definir problema, regras, restrições e testar a entrega.', 'Trilha prática MC'],
  [11, '2026-12-11', 'MC Cut', 'Construção + Carreira', 'Você não precisa escrever cada linha', 'Você precisa saber o que construir, por que construir e como validar.', 'Editorial/trilha MC'],
  [12, '2026-12-14', 'Carrossel', 'Carreira', 'Seu plano profissional para 2027: o que aprender, praticar e parar', 'Construa uma stack de competências, não uma coleção de ferramentas.', 'WEF + LinkedIn + visão MC'],
  [12, '2026-12-16', 'Reel', 'Produtividade + Carreira', 'Mapa do trabalho: fazer, delegar, automatizar ou eliminar', 'Use quatro destinos para revisar suas tarefas antes de entrar em 2027.', 'Framework MC / trilha de IA'],
  [12, '2026-12-18', 'MC Cut', 'Carreira', 'Não colecione ferramentas. Construa capacidade.', 'Ferramentas mudam. A capacidade de resolver problemas fica.', 'Editorial MC'],
]

// ---------- MC Cuts (roteiros V1) ----------
export const MC_CUTS: Record<string, { f1: [string, string]; f2: [string, string]; caption: string }> = {
  '2026-10-02': { f1: ['Saber usar ChatGPT vai virar básico.', 'BÁSICO'], f2: ['Saber transformar IA em resultado é a competência.', 'RESULTADO'], caption: 'Ferramenta é meio. Resultado é o fim.' },
  '2026-10-09': { f1: ['A IA TE DEVOLVEU 2 HORAS.', '2 HORAS'], f2: ['ONDE VOCÊ INVESTIU ESSAS 2 HORAS?', 'INVESTIU'], caption: 'Economizar tempo é só metade da conta.' },
  '2026-10-16': { f1: ['Antes de dar autonomia à IA…', 'AUTONOMIA'], f2: ['Dê contexto, dados confiáveis e limites.', 'LIMITES'], caption: 'Autonomia sem governança não é maturidade.' },
  '2026-10-23': { f1: ['IA não conserta modelo semântico ruim.', 'RUIM'], f2: ['Ela só passa a depender dele.', 'DEPENDER'], caption: 'A camada de IA torna a semântica mais estratégica.' },
  '2026-10-30': { f1: ['Agente não é…', 'AGENTE'], f2: ['Um chatbot com nome bonito.', 'NOME BONITO'], caption: 'O que muda é autonomia, ferramentas, contexto, memória operacional e controle, dependendo da arquitetura.' },
  '2026-11-06': { f1: ['IA acelera entrega.', 'ACELERA'], f2: ['Não substitui fundamento.', 'FUNDAMENTO'], caption: 'Velocidade sem capacidade de validar é um atalho perigoso.' },
  '2026-11-13': { f1: ['Tradução automática ajuda muito.', 'AJUDA'], f2: ['Mas ela não entra na reunião por você.', 'REUNIÃO'], caption: 'Use IA para reduzir atrito. Use prática para construir competência.' },
  '2026-11-20': { f1: ['Automatizar um processo ruim…', 'RUIM'], f2: ['Só faz o erro rodar mais rápido.', 'ERRO'], caption: 'Antes de automatizar: simplifique, elimine, meça.' },
  '2026-11-27': { f1: ['Seu trabalho não termina…', 'NÃO TERMINA'], f2: ['Quando o dashboard fica pronto.', 'DASHBOARD'], caption: 'Ele começa a gerar valor quando melhora uma decisão.' },
  '2026-12-04': { f1: ['Produtividade sem governança…', 'GOVERNANÇA'], f2: ['Pode virar risco em escala.', 'RISCO'], caption: 'Quanto mais capacidade damos à IA, mais importante fica saber onde estão os limites.' },
  '2026-12-11': { f1: ['Você não precisa escrever cada linha.', 'CADA LINHA'], f2: ['Precisa saber o que construir, por quê e como validar.', 'VALIDAR'], caption: 'Execução técnica está ficando mais acessível. Julgamento de produto fica mais importante.' },
  '2026-12-18': { f1: ['Não colecione ferramentas.', 'FERRAMENTAS'], f2: ['Construa capacidade.', 'CAPACIDADE'], caption: 'Ferramentas mudam. A capacidade de entender problemas, escolher abordagens e gerar resultado é mais durável.' },
}

// ---------- Reels semanas 1–5 (roteiros V1) ----------
type T = [string, string, string]
export const REELS: Record<string, { cover: [string, string]; takes: T[]; caption: string; cta: string }> = {
  '2026-09-30': {
    cover: ['3 habilidades para combinar com IA', 'IA'],
    takes: [
      ['0–5s', 'Se eu tivesse que escolher só três habilidades para combinar com IA hoje, seriam estas.', '3 HABILIDADES + IA'],
      ['5–17s', 'Primeira: capacidade analítica. IA produz respostas rápido. Você precisa separar resposta de evidência, correlação de conclusão e insight de ruído.', '01 ANALISAR'],
      ['17–30s', 'Segunda: comunicação. Quanto melhor você explica objetivo, contexto e decisão, melhor você usa IA e melhor apresenta o que ela ajudou a produzir.', '02 COMUNICAR'],
      ['30–43s', 'Terceira: pensamento estratégico. Não basta fazer mais rápido. Você precisa decidir o que vale fazer, para quem e com qual impacto.', '03 DECIDIR'],
      ['43–55s', 'O WEF coloca IA e big data entre as skills de crescimento mais rápido, e aponta pensamento analítico como a habilidade central, ao lado de pensamento criativo, resiliência e liderança. A combinação é o ponto.', 'IA + JULGAMENTO + COMUNICAÇÃO + NEGÓCIO'],
    ],
    caption: 'IA acelera. Julgamento, comunicação e estratégia decidem o que vale acelerar. Fonte: WEF Future of Jobs 2025.',
    cta: 'Qual dessas está mais fraca hoje?',
  },
  '2026-10-07': {
    cover: ['3 níveis de uso de IA', 'redesenhar'],
    takes: [
      ['0–5s', 'A maioria das pessoas para no primeiro nível de uso da IA.', 'EM QUE NÍVEL VOCÊ ESTÁ?'],
      ['5–18s', 'Nível 1: perguntar. Você pede uma resposta, um resumo, uma fórmula. Útil, mas pontual.', '1 PERGUNTAR'],
      ['18–32s', 'Nível 2: delegar. Você entrega objetivo, contexto, restrições e critério de sucesso. A IA executa uma parte maior da tarefa.', '2 DELEGAR'],
      ['32–47s', 'Nível 3: redesenhar. Você olha o processo inteiro: o que continua humano, o que pode ser delegado, automatizado ou eliminado?', '3 REDESENHAR'],
      ['47–55s', 'O maior salto não é um prompt melhor. É um processo melhor.', 'PROCESSO > PROMPT'],
    ],
    caption: 'Perguntar, delegar, redesenhar. O ROI grande mora no terceiro nível.',
    cta: 'Em qual nível você mais trabalha hoje?',
  },
  '2026-10-14': {
    cover: ['Agente com dados ruins continua sendo um problema', 'dados ruins'],
    takes: [
      ['0–5s', 'Dar autonomia para uma IA não corrige dado ruim. Só aumenta o alcance do problema.', 'AUTONOMIA ≠ CORREÇÃO'],
      ['5–17s', 'Se a métrica "cliente ativo" tem três definições na empresa, o agente não inventa a definição correta.', 'DADOS'],
      ['17–27s', 'Se a permissão está errada, autonomia vira risco.', 'PERMISSÃO'],
      ['27–38s', 'Se a fonte está desatualizada, a resposta pode chegar rápido e continuar errada.', 'CONTEXTO'],
      ['38–50s', 'Agente bom depende de modelo, sim. Mas também de dados, contexto, permissões e avaliação.', 'AVALIAÇÃO'],
    ],
    caption: 'Agentes são uma camada em cima da sua fundação de dados.',
    cta: 'Sua base de dados aguenta um agente hoje?',
  },
  '2026-10-21': {
    cover: ['Antes de usar Copilot no Power BI', 'Copilot'],
    takes: [
      ['0–5s', 'Quer melhorar o Copilot no Power BI? Comece antes de escrever o prompt.', 'ANTES DO PROMPT'],
      ['5–18s', 'Um: simplifique o schema para a IA. Esconda o que não ajuda e reduza ruído.', '1 SIMPLIFIQUE O SCHEMA'],
      ['18–31s', 'Dois: adicione AI Instructions. Explique termos, regras e prioridades do negócio.', '2 AI INSTRUCTIONS'],
      ['31–45s', 'Três: para perguntas críticas, configure Verified Answers. O recurso ainda está em preview, então teste antes de confiar.', '3 VERIFIED ANSWERS'],
      ['45–52s', 'Boa IA começa com bom contexto semântico.', 'CONTEXTO SEMÂNTICO'],
    ],
    caption: 'Copilot bom começa no modelo semântico. Fonte: Microsoft Learn (Prep data for AI).',
    cta: 'Quer que eu mostre isso em tela em outro Reel?',
  },
  '2026-10-28': {
    cover: ['Você provavelmente não precisa de um agente', 'agente'],
    takes: [
      ['0–5s', 'Vou economizar sua arquitetura: talvez você não precise de um agente.', 'TALVEZ NÃO PRECISE'],
      ['5–15s', 'Se um bom prompt resolve uma tarefa eventual, pare aí.', 'PROMPT'],
      ['15–26s', 'Se o processo é previsível, talvez uma automação simples seja melhor.', 'AUTOMAÇÃO'],
      ['26–40s', 'Agente começa a fazer sentido quando a tarefa exige decidir próximos passos, usar ferramentas e lidar com variação.', 'AGENTE'],
      ['40–47s', 'Não use autonomia como decoração tecnológica.', 'COMPLEXIDADE TEM CUSTO'],
    ],
    caption: 'A arquitetura madura não é a mais sofisticada. É a adequada.',
    cta: 'Complexidade também tem custo.',
  },
}
export const reelTakes = (d: string): ScriptTake[] =>
  (REELS[d]?.takes ?? []).map(([time, speech, screenText], i) => ({ id: `t${i}`, time, speech, screenText }))

// ---------- Carrosséis com roteiro final (prontos para CarrosseIA) ----------
// Regras CarrosseIA: 2–10 slides; título ≤ ~12 palavras; uma ideia por slide; sem travessão.
type S = [Slide['layout'], string, string, string?, string?] // layout, título, corpo, tag, fonte
export const CAROUSELS: Record<string, { slides: S[]; caption: string; hashtags: string; cta: string; sources: string[] }> = {
  '2026-09-28': {
    slides: [
      ['A', 'AI literacy virou skill de carreira', 'Mas isso é muito maior do que saber abrir o ChatGPT.', 'CARREIRA + IA'],
      ['F', 'Em 2026, estratégia de IA lidera as habilidades em alta no Brasil', 'Comunicação e storytelling vêm logo depois. Saber usar a ferramenta virou o ponto de partida.', undefined, 'Fonte: LinkedIn, Habilidades em Alta 2026 (Brasil)'],
      ['G', 'Ser alfabetizado em IA não é conhecer todos os botões', 'É saber quando usar, como direcionar e como validar.'],
      ['C', 'Na prática, significa saber:', 'Formular um problema\nDar contexto\nEscolher a ferramenta\nValidar a resposta\nProteger dados\nTransformar saída em resultado'],
      ['B', 'Para um analista, isso muda o trabalho', 'IA apoia pesquisa, análise, documentação, storytelling, automação e prototipação. O julgamento continua seu.'],
      ['F', 'Ferramenta muda. Capacidade profissional fica.', ''],
      ['E', 'Você está aprendendo IA ou só colecionando ferramentas?', 'Salve e use como checklist de desenvolvimento.'],
    ],
    caption: 'AI literacy não é um curso de botão. É uma camada nova do trabalho.\n\nEm 2026, o LinkedIn colocou estratégia de IA no topo das habilidades em alta no Brasil, com comunicação e storytelling logo atrás. Saber usar a ferramenta virou o ponto de partida. O diferencial está em saber formular o problema, dar contexto, validar a resposta e transformar a saída em resultado.\n\nSalve este post e use como checklist de desenvolvimento.',
    hashtags: '#ailiteracy #inteligenciaartificial #carreira #analistadedados #powerbi #mcinteligencia',
    cta: 'Salve e use como checklist de desenvolvimento.',
    sources: ['s_linkedin'],
  },
  '2026-10-05': {
    slides: [
      ['A', 'Você ganhou tempo com IA', 'Isso não significa, automaticamente, que ficou mais produtivo.', 'IA + PRODUTIVIDADE'],
      ['F', 'Usuários Enterprise relatam economizar 40 a 60 minutos por dia ativo', 'Pesquisa com 9 mil funcionários de quase 100 empresas clientes. Não representa toda a força de trabalho.', undefined, 'Fonte: OpenAI, State of Enterprise AI (dez/2025)'],
      ['G', 'Tempo economizado é capacidade', 'Valor aparece no que você faz com ela.'],
      ['C', 'O tempo recuperado pode virar:', 'Análise mais profunda\nMelhor atendimento\nAprendizado\nProjetos antes inviáveis\nMenos retrabalho\nDecisões mais rápidas'],
      ['B', 'O erro comum', 'Economizar 90 minutos e preencher esses 90 minutos com mais tarefas de baixo valor.'],
      ['F', 'Onde você reinvestiu o tempo?', 'Essa é a métrica que falta.'],
      ['E', 'Antes da próxima tarefa com IA, defina onde o tempo vai ser reinvestido', 'Salve e teste por uma semana.'],
    ],
    caption: 'Produtividade não é só velocidade. É capacidade convertida em resultado.\n\nMedir quantos minutos a IA economizou é o começo da conta. A pergunta que fecha a conta é: onde esse tempo foi reinvestido?\n\nSalve e teste por uma semana.',
    hashtags: '#produtividade #inteligenciaartificial #ia #gestao #dados #mcinteligencia',
    cta: 'Salve e teste por uma semana.',
    sources: ['s_openai', 's_anthropic'],
  },
  '2026-10-12': {
    slides: [
      ['A', 'Seu agente pode ser ótimo e ainda responder mal', 'Porque agente sem contexto, dados e governança continua sendo um risco.', 'DADOS + IA'],
      ['B', 'Modelo não conhece sua empresa por mágica', 'Ele precisa saber o que pode acessar, o que os termos significam e quais regras orientam a resposta.'],
      ['C', '1. Dados', 'Fonte correta\nSchema compreensível\nQualidade\nAtualização\nAcesso permitido'],
      ['C', '2. Contexto', 'Definição de métricas\nRegras de negócio\nPrioridades\nExemplos de perguntas\nInstruções de interpretação'],
      ['C', '3. Governança', 'Permissões\nPolíticas\nLimites\nRastreabilidade\nAvaliação'],
      ['B', 'Não é por acaso que as plataformas tratam agente junto com governança', 'O Microsoft Fabric configura agentes de dados com instruções, permissões e políticas.', undefined, 'Fonte: Microsoft Learn, Fabric Data Agent'],
      ['E', 'Antes de escolher o modelo, defina o contexto e os limites do agente', 'Envie para quem está montando agente antes de organizar os dados.'],
    ],
    caption: 'Antes de perguntar "qual modelo usar?", pergunte: "qual contexto esse agente vai receber e quais limites precisa respeitar?"\n\nAgente confiável é modelo + dados + contexto + governança. Tirando qualquer um desses, a resposta pode chegar rápida e errada.',
    hashtags: '#agentesdeia #dados #governancadedados #microsoftfabric #ia #mcinteligencia',
    cta: 'Envie para quem está montando agente antes de organizar os dados.',
    sources: ['s_fabric', 's_snowflake'],
  },
  '2026-10-19': {
    slides: [
      ['A', 'Power BI + IA: o trabalho começa antes do prompt', 'O que o Copilot precisa encontrar no seu modelo semântico.', 'POWER BI + IA'],
      ['G', 'Copilot não lê a cabeça do negócio', 'Ele lê o que você preparou para ele.'],
      ['C', 'Prepare o modelo para IA', 'Remova campos irrelevantes da experiência de IA\nTorne nomes e relações compreensíveis\nReduza ambiguidade', undefined, 'Fonte: Microsoft Learn, Prep data for AI (recurso em preview)'],
      ['B', 'Adicione AI Instructions', 'Linguagem do negócio, regras e orientação analítica para o Copilot interpretar perguntas.', undefined, 'Fonte: Microsoft Learn, AI Instructions (recurso em preview)'],
      ['B', 'Defina Verified Answers', 'Perguntas críticas ligadas a respostas curadas no modelo semântico, para mais consistência.', undefined, 'Fonte: Microsoft Learn, Verified Answers (recurso em preview)'],
      ['F', 'Modelagem semântica ficou mais importante, não menos', ''],
      ['E', 'Seu próximo trabalho no Power BI pode ser ensinar a IA a entender o negócio', 'Salve para revisar seu próximo modelo.'],
    ],
    caption: 'Copilot bom começa no modelo semântico.\n\nSchema limpo, AI Instructions com a linguagem do negócio e Verified Answers nas perguntas críticas. É esse preparo que separa resposta útil de resposta bonita.\n\nSalve para revisar seu próximo modelo.',
    hashtags: '#powerbi #copilot #modelosemantico #bi #dados #mcinteligencia',
    cta: 'Salve para revisar seu próximo modelo.',
    sources: ['s_learn_copilot', 's_learn_instr', 's_learn_verified'],
  },
  '2026-10-26': {
    slides: [
      ['A', 'Prompt, automação ou agente?', 'Escolha a menor solução que resolve bem.', 'AGENTES + AUTOMAÇÃO'],
      ['B', 'Use prompt quando a tarefa é pontual e muda muito', 'Revisar uma análise, resumir um documento, gerar hipóteses. Humano no loop.'],
      ['B', 'Use automação quando gatilhos e passos são previsíveis', 'Receber arquivo, tratar, registrar e avisar.'],
      ['B', 'Considere agente quando há objetivo, várias etapas e ferramentas', 'E necessidade real de adaptação e autonomia.'],
      ['C', 'Pergunte antes:', 'Qual a frequência?\nQuanta variação existe?\nQual o risco?\nQuais ferramentas entram?\nPrecisa de aprovação humana?\nQual o custo da complexidade?'],
      ['F', 'Mais autonomia, mais necessidade de controle', ''],
      ['E', 'Arquitetura madura não é a mais sofisticada. É a adequada.', 'Salve como árvore de decisão.'],
    ],
    caption: 'Nem todo problema pede um agente.\n\nPrompt para o que é pontual, automação para o que é previsível, agente para o que exige decidir próximos passos com ferramentas. As fronteiras podem se sobrepor: é um framework prático, não uma definição universal.\n\nSalve como árvore de decisão.',
    hashtags: '#agentesdeia #automacao #arquitetura #inteligenciaartificial #processos #mcinteligencia',
    cta: 'Salve como árvore de decisão.',
    sources: ['s_wti'],
  },
  '2026-11-02': {
    slides: [
      ['A', 'A stack do analista não é mais só ferramenta de dados', 'O que compõe o profissional ampliado em 2026.', 'CARREIRA'],
      ['C', '1. Dados', 'Excel\nPower BI\nSQL\nModelagem e análise'],
      ['C', '2. IA', 'Pesquisa e análise\nDocumentação\nAutomação e agentes\nPrototipação'],
      ['C', '3. Negócio', 'Processos\nKPIs e ROI\nDecisão e prioridade'],
      ['C', '4. Comunicação', 'Storytelling\nStakeholders\nApresentação\nEscrita'],
      ['C', '5. Inglês', 'Documentação\nAprendizado\nReuniões\nColaboração global', undefined, 'Contexto: WEF Future of Jobs 2025, LinkedIn 2026, ETS 2026'],
      ['E', 'Não tente ser especialista em tudo. Construa a combinação que multiplica seu valor.', 'Qual camada está atrasando sua evolução?'],
    ],
    caption: 'A stack do analista em 2026 não cabe mais numa lista de ferramentas.\n\nDados, IA, negócio, comunicação e inglês: é a combinação que multiplica o valor do profissional.\n\nQual camada está atrasando a sua evolução?',
    hashtags: '#analistadedados #carreira #powerbi #inteligenciaartificial #ingles #mcinteligencia',
    cta: 'Qual camada está atrasando sua evolução?',
    sources: ['s_wef', 's_linkedin', 's_ets'],
  },
  '2026-11-09': {
    slides: [
      ['A', 'A IA matou a necessidade de inglês?', 'Os dados de 2026 apontam outra direção.', 'INGLÊS + CARREIRA'],
      ['F', '81% dos líderes de RH dizem que a IA aumenta a necessidade de inglês', 'Pesquisa com mais de 1.300 decisores de RH em 17 países.', undefined, 'Fonte: ETS, TOEIC Global English Skills Report 2026'],
      ['B', 'O que a IA reduziu', 'Atrito para traduzir, revisar, preparar texto e entender conteúdo.'],
      ['B', 'O que ela não elimina', 'Reunião ao vivo, negociação, espontaneidade, networking e colaboração.'],
      ['G', 'Tradução é capacidade da ferramenta', 'Comunicação é capacidade profissional.'],
      ['B', 'A boa notícia', 'A própria IA vira parceira de prática: simulações, feedback, role-play e vocabulário técnico.'],
      ['E', 'Não aprenda inglês apesar da IA. Use IA para aprender inglês melhor.', 'Salve e teste no próximo treino.'],
    ],
    caption: 'A tradução automática evoluiu muito. Mas 81% dos líderes de RH ouvidos pelo ETS em 2026 dizem que a IA está aumentando a necessidade de inglês.\n\nA IA reduz atrito. Comunicação ao vivo continua sendo competência sua.',
    hashtags: '#ingles #carreira #inteligenciaartificial #analistadedados #mcinteligencia',
    cta: 'Salve e teste no próximo treino.',
    sources: ['s_ets', 's_ef'],
  },
  '2026-11-16': {
    slides: [
      ['A', 'Usar IA não é implementar IA', 'Cinco níveis para entender a diferença.', 'CONSULTORIA + IA'],
      ['F', 'Uso individual', 'Chat, pesquisa, escrita e análise pontual.'],
      ['F', 'Workflow repetível', 'Projeto, contexto fixo, templates, skills e biblioteca de prompts.'],
      ['F', 'Automação', 'Gatilhos, integrações e execução repetível e monitorada.'],
      ['F', 'Fluxos agênticos', 'Objetivos, ferramentas, múltiplos passos e mais autonomia.'],
      ['F', 'Operação governada', 'Dados, segurança, métricas, custos, permissões, avaliação e responsáveis.', undefined, 'Framework MC'],
      ['E', 'Não pule níveis porque o mercado está falando de agentes.', 'Em qual nível sua equipe realmente está?'],
    ],
    caption: 'Usar IA e implementar IA são coisas diferentes.\n\nDo uso individual à operação governada, cada nível exige decisões diferentes de dados, processo e controle. Framework MC.\n\nEm qual nível sua equipe realmente está?',
    hashtags: '#inteligenciaartificial #maturidade #consultoria #automacao #agentesdeia #mcinteligencia',
    cta: 'Em qual nível sua equipe realmente está?',
    sources: ['s_wti', 's_openai'],
  },
  '2026-11-23': {
    slides: [
      ['A', 'Seu dashboard informa ou muda uma decisão?', 'A pergunta que separa painel de ferramenta de gestão.', 'DADOS + NEGÓCIO'],
      ['C', 'Um painel útil conecta:', 'Métrica\nContexto\nPergunta\nDecisão\nAção'],
      ['B', 'Exemplo fraco x exemplo melhor', 'Fraco: churn = 7,2%.\nMelhor: churn subiu em qual segmento, por quê e qual decisão precisamos tomar?', undefined, 'Exemplo ilustrativo'],
      ['C', 'Antes de publicar, pergunte:', 'Quem decide com isso?\nQual pergunta ele responde?\nO que muda se o indicador piorar?\nQual ação é esperada?'],
      ['F', 'Dado sem decisão é só informação organizada', ''],
      ['E', 'Construa o dashboard de trás para frente: comece pela decisão.', 'Envie para quem ainda começa pelo gráfico.'],
    ],
    caption: 'Dashboard bonito não é resultado.\n\nUm painel útil conecta métrica, contexto, pergunta, decisão e ação. Comece pela decisão e construa de trás para frente.\n\nEnvie para quem ainda começa pelo gráfico.',
    hashtags: '#powerbi #dashboard #bi #dados #gestao #mcinteligencia',
    cta: 'Envie para quem ainda começa pelo gráfico.',
    sources: [],
  },
  '2026-11-30': {
    slides: [
      ['A', 'Antes de colar dados da empresa em uma IA, pergunte isso', '7 perguntas que evitam dor de cabeça.', 'SEGURANÇA + IA'],
      ['F', 'Que tipo de dado é?', 'Público, interno, confidencial, pessoal ou sensível?'],
      ['F', 'Tenho autorização para usá-lo aqui?', 'Política interna e contrato importam.'],
      ['F', 'Qual produto e plano estou usando?', 'Treinamento, retenção e controles variam por fornecedor, plano e configuração.'],
      ['F', 'Quem pode acessar?', 'Usuário, workspace, conector e agente precisam respeitar permissões.'],
      ['C', '5 a 7. Antes de enviar:', 'Preciso de todo o dado?\nComo vou validar a resposta?\nExiste alternativa mais segura?', undefined, 'Referência: NIST AI RMF, Generative AI Profile'],
      ['E', 'Conveniência não substitui governança.', 'Use como checklist, não como substituto da política da empresa.'],
    ],
    caption: 'Antes de colar qualquer dado da empresa em uma IA, pare e responda 7 perguntas.\n\nTipo de dado, autorização, produto e plano, acesso, necessidade, validação e alternativa. Conveniência não substitui governança.\n\nEste post não substitui a política da sua empresa.',
    hashtags: '#segurancadainformacao #lgpd #inteligenciaartificial #governanca #dados #mcinteligencia',
    cta: 'Use como checklist, não como substituto da política da empresa.',
    sources: ['s_nist', 's_openai_priv'],
  },
  '2026-12-07': {
    slides: [
      ['A', 'Você não precisa começar pelo código', 'Comece pelo problema.', 'CONSTRUÇÃO COM IA'],
      ['F', 'Problema', 'Quem sofre? O que acontece hoje? Quanto custa em tempo, erro ou oportunidade?'],
      ['F', 'Requisitos', 'O que a V1 realmente precisa fazer e o que pode esperar?'],
      ['F', 'Arquitetura mínima', 'Não adicione backend, banco ou agente só porque parecem profissionais.'],
      ['F', 'Construir e testar', 'A IA executa. Você valida cálculo, fluxo, dados, segurança e critério de sucesso.'],
      ['F', 'Publicar e medir', 'Deploy é meio. ROI aparece quando a solução melhora algo que importa.'],
      ['E', 'Seu papel muda de escrever tudo para definir, direcionar e validar.', 'Esse é o Analista Ampliado.'],
    ],
    caption: 'Do problema ao app, sem virar dev.\n\nProblema, requisitos, arquitetura mínima, construção com teste e publicação com medida. A IA reduziu a barreira de execução. Especificar e validar continua sendo seu trabalho.',
    hashtags: '#inteligenciaartificial #nocode #analistadedados #produto #claude #mcinteligencia',
    cta: 'Esse é o Analista Ampliado.',
    sources: [],
  },
  '2026-12-14': {
    slides: [
      ['A', 'Não entre em 2027 com uma lista de ferramentas', 'Entre com uma stack de capacidades.', 'CARREIRA'],
      ['C', '1. Fundamento de dados', 'Excel\nPower BI\nSQL\nModelagem e análise'],
      ['C', '2. IA aplicada', 'Prompting e contexto\nValidação\nAutomação e agentes\nConstrução assistida'],
      ['C', '3. Negócio e comunicação', 'KPIs e ROI\nProcessos\nStorytelling\nStakeholders'],
      ['C', '4. Inglês', 'Consumo de conteúdo\nReuniões\nApresentações\nColaboração'],
      ['B', 'Agora escolha uma evidência por trimestre', 'Projeto publicado, automação rodando, apresentação em inglês ou case de impacto.'],
      ['E', 'Aprendizado sem entrega vira acúmulo.', 'Escolha uma capacidade e uma evidência para o 1º trimestre.'],
    ],
    caption: 'Seu plano profissional para 2027: o que aprender, praticar e parar.\n\nQuatro camadas de capacidade e uma regra: uma evidência entregue por trimestre. Ferramentas mudam, capacidade fica.',
    hashtags: '#carreira #planejamento #analistadedados #inteligenciaartificial #powerbi #mcinteligencia',
    cta: 'Escolha uma capacidade e uma evidência para o 1º trimestre.',
    sources: ['s_wef', 's_linkedin'],
  },
}
