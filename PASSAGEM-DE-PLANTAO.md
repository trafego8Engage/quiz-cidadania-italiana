# Quiz de Cidadania Italiana (Gioppo & Conti) — passagem de plantão

Ver também: [ARCHITECTURE.md](ARCHITECTURE.md) (referência técnica — código,
estrutura, comandos, armadilhas já resolvidas).

## Contexto

A Gioppo & Conti (assessoria em cidadania italiana) capta leads por anúncio,
manda pra um formulário de captura (nome/e-mail/WhatsApp), e em seguida pra um
quiz de diagnóstico de 8 perguntas que qualifica o lead (Alta / Média / Baixa
prioridade) antes de encaminhar pra uma página de "obrigado" — que hoje
funciona como o convite pra falar com um especialista. Este repositório é o
quiz. O resto do funil (captura de lead, páginas de obrigado) já existe em
produção no WordPress da empresa (`lp.gioppoeconti.com.br`) e não faz parte
deste código — ver [Escopo](#escopo).

## Escopo

**É:** o quiz de 8 perguntas, o cálculo de lead score, as 3 telas de
conclusão personalizadas por faixa de prioridade, e o redirecionamento final
pra fora do quiz.

**Não é (por enquanto):**
- Não inclui as páginas de captura de lead nem as páginas de obrigado —
  essas são páginas WordPress/Elementor já existentes e publicadas,
  mantidas fora deste repositório.
- Não inclui o envio das respostas do quiz pro HubSpot ainda — o código já
  está pronto pra isso (`submitHubSpot()`), mas está desligado de propósito
  até o usuário criar o formulário HubSpot correspondente.
- Não usa a página `/obrigado-dq/` — decisão explícita do usuário (por
  enquanto), ver abaixo.

## Decisões e o porquê

- **Decisão**: adicionar 3 telas de conclusão (uma por faixa de prioridade —
  Alta/Média/Baixa) entre o fim do quiz e o redirecionamento pra página de
  obrigado.
  **Porquê**: sem isso, o quiz terminava direto no redirect, sem entregar
  nenhuma sensação de "diagnóstico" — o usuário queria que a pessoa sinta
  que recebeu uma resposta sobre o próprio caso antes de ser levada pra
  outro lugar. A separação em 3 (em vez de só 2, uma por destino) existe
  porque Média e Alta vão pro mesmo destino técnico (Grau 1), mas merecem
  tom de mensagem diferente — Alta é "confirme os detalhes", Média é "quase
  lá, falta esclarecer alguns pontos". O usuário trouxe um documento próprio
  de referência com a copy/spec de cada uma
  (`paginas_conclusao_quiz_cidadania_gioppo_conti.md`, nunca commitado,
  fica só como apoio local — pedido explícito do usuário pra nunca entrar
  no git).

- **Decisão (revisada em 2026-08-17)**: as telas de conclusão voltaram a ter
  um botão de CTA (`#conclusionCtaButton`, texto varia por faixa — ex.
  "Quero confirmar meu caso agora") que redireciona na hora, **junto com**
  a contagem regressiva automática de 15 segundos (que continua existindo).
  **Isso substitui a decisão anterior** (registrada abaixo, de não ter
  nenhum botão) — o usuário pediu de volta um botão pra quem não quiser
  esperar os 15 segundos. Não é uma reversão total: o redirecionamento
  automático continua sendo o comportamento padrão pra quem não interage;
  o botão é só um atalho.
  **Decisão anterior (histórico, não vale mais)**: as telas de conclusão
  não tinham nenhum botão/CTA clicável — 100% automático. Foi assim porque
  o usuário queria a experiência direta, sem depender de o lead precisar
  clicar em algo — mas essa preferência mudou nesta sessão.

- **Decisão**: publicar o quiz também dentro do WordPress da Gioppo & Conti
  (`lp.gioppoeconti.com.br`), colando um bundle HTML auto-contido num bloco
  de HTML, em vez de usar FTP ou a API REST do WordPress.
  **Porquê**: o usuário só tem login do WordPress, não tem acesso FTP nem ao
  painel da Hostinger. Tentamos usar Application Passwords (API REST) como
  alternativa mais segura a passar a senha de login — mas está bloqueado a
  nível de hospedagem nesse site específico (não é algo que dá pra ligar
  pelo `wp-admin`). Sem essas duas vias, colar HTML manualmente (ou via
  automação de navegador logada) foi o único caminho viável. Detalhe técnico
  completo em `ARCHITECTURE.md`.

- **Decisão**: para a automação de publicação no WordPress, o usuário criou
  um usuário WordPress **temporário e descartável** (`claude-temp`, papel
  Editor) em vez de compartilhar o login pessoal dele.
  **Porquê**: Editor já tem permissão suficiente pra criar/publicar páginas,
  e um usuário descartável pode ser excluído depois sem afetar a conta real
  do usuário — prática de segurança acordada durante a sessão.

- **Decisão**: não usar a página `/obrigado-dq/` ("LEAD DESQUALIFICADO") por
  enquanto — o quiz continua só com dois destinos possíveis (Grau 1 / Grau 2).
  **Porquê**: essa terceira página já existe em produção no WordPress, mas
  nunca esteve conectada ao quiz. O usuário confirmou que não é pra usá-la
  agora — fica registrada (ver [ARCHITECTURE.md](ARCHITECTURE.md), seção de
  armadilhas) pra não ser redescoberta do zero numa sessão futura, mas não é
  uma tarefa pendente: é uma decisão já tomada, só reversível se o usuário
  pedir explicitamente.

## Roadmap / fases

**Feito:**
- Quiz completo com lead score, 3 conclusões automáticas, redirecionamento
  por contagem regressiva **e** botão manual de CTA (2026-08-17).
- Tempo de leitura dos 3 interstícios de argumentação entre perguntas
  aumentado de 1,8s para 4,5s (2026-08-17) — feedback do usuário de que
  estava passando rápido demais pra ler.
- 3 links provisórios pro time de copy revisar as telas de conclusão
  isoladamente, sem precisar responder o quiz (`/diagnostico-alta`,
  `/diagnostico-media`, `/diagnostico-baixa` no ambiente Vercel) — ver
  detalhe técnico em [ARCHITECTURE.md](ARCHITECTURE.md#preview-das-telas-de-conclusão-pro-time-de-copy).
- Integração com HubSpot pras respostas do quiz (2026-08-17): formulário e
  11 propriedades de contato criados via API, `app.js` já configurado. Ver
  [HUBSPOT-SETUP.md](HUBSPOT-SETUP.md) pro detalhe completo (inclui uma
  decisão de criar 2 propriedades novas em vez de reaproveitar 2 do quiz
  antigo, pra não arriscar quebrar a coleta de dados dele).
- Publicado em ambiente de preview (Vercel).
- Bundle pronto pra colar no WordPress (`wordpress-embed/quiz-embed.html`).
- Investigação (só leitura, nada alterado) do funil de produção real no
  WordPress — mapeado captura de lead (A/B/C), quiz antigo, e as 3 páginas
  de obrigado existentes.

**Em andamento / próximo passo imediato:**
- Publicar de fato o bundle numa página nova do WordPress (usando o usuário
  temporário `claude-temp`) — falta confirmar com o usuário o slug final da
  página (proposta em `ARCHITECTURE.md`: `/quizdiagnostico-02/`) e se ele
  quer que a publicação seja feita via automação de navegador ou se prefere
  colar manualmente. Ver o comparativo completo "antes (antigo) vs. depois
  (quiz02)" em [ARCHITECTURE.md](ARCHITECTURE.md#funil-no-wordpress-como-está-hoje-antigo-vs-proposta-pós-atualização-quiz02).
- Depois de publicar e confirmar que o quiz02 está funcionando, atualizar o
  link de destino em `/diagnostico-a/`, `/diagnostico-b/` e `/diagnostico-c/`
  (hoje apontam pra `/quizdiagnostico/`, o antigo) — isso é uma edição nessas
  3 páginas Elementor, fora deste repositório.

**Pendências abertas:**
- **Teste de ponta a ponta do envio pro HubSpot**: o formulário e as
  propriedades já foram criados via API (2026-08-17, ver
  [HUBSPOT-SETUP.md](HUBSPOT-SETUP.md)) e `app.js` já está configurado, mas
  ainda falta uma submissão real (rodando o quiz até o fim) pra confirmar
  que os dados chegam certos no HubSpot.
- **Excluir o app privado temporário no HubSpot**: usado só pra criar o
  formulário/propriedades via API nesta sessão — não precisa continuar
  existindo (Configurações → Integrações → Apps privados).

## Ver também

[ARCHITECTURE.md](ARCHITECTURE.md) — estrutura de código, comandos, e as
armadilhas técnicas já resolvidas (CSS vazando pro tema WordPress, bloqueio
de Application Passwords, etc.).
