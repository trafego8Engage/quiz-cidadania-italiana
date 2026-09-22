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

**Não é:**
- Não inclui as páginas de obrigado — essas são páginas WordPress/Elementor
  já existentes e publicadas, mantidas fora deste repositório, sem
  alteração nenhuma nesta fase.
- Não usa a página `/obrigado-dq/` — decisão explícita do usuário (por
  enquanto), ver abaixo.

**Passou a ser, a partir de 2026-08-17/18** (antes estava fora de escopo):
- As páginas de captura de lead (A/B/C) — inclui editá-las pra redirecionar
  pro quiz novo (`/quizdiagnostico-02/`) em vez do antigo.
- O envio das respostas do quiz pro HubSpot — formulário, propriedades e
  automações de roteamento de lead (dono + negócio) pro time comercial. Ver
  [HUBSPOT-SETUP.md](HUBSPOT-SETUP.md) pro detalhe técnico completo.

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

- **Decisão (revisada em 2026-08-20)**: removida por completo a contagem
  regressiva de 15s da tela de conclusão — agora o redirecionamento só
  acontece pelo clique no botão `#conclusionCtaButton`. **Isso substitui a
  decisão anterior** (linha acima, registrada em 2026-08-17), que tinha os
  dois mecanismos juntos.
  **Porquê**: pedido do usuário. Como a tela de conclusão é longa (card de
  diagnóstico, bloco de tensão, bloco extra) e não há mais redirecionamento
  automático, foi adicionado um **segundo botão de CTA no topo da página**
  (`#conclusionCtaButtonTop`, logo depois da subheadline, mesmo texto do
  botão de baixo por faixa de prioridade) — pra quem não quiser ler tudo
  poder agir na hora, sem precisar rolar até o fim. Segue um texto pequeno
  ("Ou continue lendo para ver o seu diagnóstico completo abaixo") que
  direciona quem quiser ler antes de decidir. O botão original no fim da
  página (`#conclusionCtaButton`) continua existindo do jeito que estava.

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

- **Decisão (2026-08-18)**: reaproveitar os workflows de roteamento de lead
  já existentes no HubSpot ("Funil diagnostico" e "Webhook — Enviar leads do
  quiz para dashboard") em vez de criar automações novas do zero, trocando
  só o gatilho deles pro formulário do quiz novo.
  **Porquê**: esses dois workflows já fazem exatamente o que o usuário
  precisa — "Funil diagnostico" atribui dono ao lead (rodízio entre os
  vendedores) e cria um Negócio no pipeline comercial; o webhook manda os
  dados pro dashboard externo que o usuário já usa pra acompanhar
  volume por prioridade. Criar algo novo duplicaria infraestrutura que já
  funciona e criaria um segundo lugar pro time comercial checar. O gatilho
  de "Funil diagnostico" ficou restrito a prioridade Alta/Média (Baixa só
  entra numa lista segmentada, sem virar negócio, por decisão do usuário);
  o webhook do dashboard não tem esse filtro, porque o usuário quer contar
  também os leads de Baixa prioridade por lá.

- **Decisão (2026-08-18)**: remover a etapa de "copiar empresa associada ao
  contato" da ação de criar Negócio no workflow "Funil diagnostico".
  **Porquê**: essa etapa fazia a criação do Negócio **falhar silenciosamente
  por completo** (sem negócio nenhum, mesmo com o dono atribuído
  normalmente) sempre que o contato não tinha nenhuma Empresa associada —
  o que é o caso da maioria dos leads desse negócio, já que são pessoas
  físicas buscando cidadania, não empresas. Essa falha **já existia antes**
  desta sessão (não foi introduzida pelas mudanças de hoje) e provavelmente
  vinha acontecendo silenciosamente com o quiz antigo também. Confirmado
  corrigido com um teste limpo (contato novo, negócio criado
  corretamente).

- **Decisão (2026-08-18)**: manter o usuário WordPress `claude-temp` com
  papel de **Administrador** (em vez de só Editor) e manter o app privado
  do HubSpot ativo por enquanto, salvando o token dele em `.env` (fora do
  git) em vez de excluir o app depois de cada uso.
  **Porquê**: o papel de Editor bloqueou o acesso à ferramenta de
  Exportação do WordPress durante a investigação de uma página; promover
  pra Administrador destravou isso. Pro HubSpot, o usuário decidiu manter
  o app privado ativo enquanto ainda está validando o funil (em vez do
  padrão anterior de token descartável, excluído a cada sessão), pra não
  precisar gerar um token novo a cada ajuste. **Revisar depois**: quando o
  funil estiver validado e estável, considerar rebaixar `claude-temp` pra
  Editor de novo e excluir o app privado do HubSpot, seguindo a prática de
  segurança original (credencial descartável).

- **Decisão (2026-08-18)**: remover André Vieira (`96664525`) do rodízio de
  donos ("Rotate owners") da ação inicial do workflow "Funil diagnostico" —
  ficou só Gisele Lima, Luiz Felipe Silva e Karolina Reis.
  **Porquê**: o usuário queria que os leads de Alta/Média prioridade do quiz
  caíssem na mesma fila de vendedores que já recebem leads dos outros funis
  de anúncio (Campanha Google, LinkedIn, Remarketing, Preço à vista etc.) —
  todos esses usam hoje o rodízio [Gisele, Luiz Felipe, Karolina], sem o
  André. O workflow do quiz tinha esse quarto nome a mais, então foi
  alinhado. Confirmado também que o comercial de fato trabalha pelo board do
  pipeline "Pipeline SDR - Nova" (estágio "Novo lead - Forms") — um contato
  sem Negócio não aparece na fila de ninguém, por isso criar o Negócio é o
  gatilho real que importa. A marcação de origem (`campanha_de_origem` =
  "Campanha diagnóstico", gravada no Negócio) e de prioridade (já embutida
  no nome do Negócio, ex. "João Silva — Alta") já existiam desde a sessão
  anterior — só o rodízio precisava de ajuste.
  **Nota à parte, não mexida**: o funil "Novo lead meta LP preço ads
  Cidadania italiana - Sky AI GROUP" ainda tem no rodízio dele a Anapaula
  Giani, cuja conta HubSpot está arquivada (ela não está mais na empresa) —
  não afeta o quiz, mas vale o usuário saber pra corrigir esse outro funil
  quando quiser.

- **Decisão (2026-08-18)**: desativar por completo o recurso "Atrasar
  execução de JavaScript" do plugin WP Rocket (em vez de só excluir o
  script do quiz dessa otimização).
  **Porquê**: esse recurso quebrava o carregamento inicial do quiz
  (`render()` não completava, ficava travado no Passo 1 sem nenhuma
  pergunta aparecendo). Tentamos soluções mais específicas primeiro
  (atributos `data-no-optimize` no `<script>`, depois uma exclusão por
  palavra-chave, depois o "Modo Seguro" do próprio recurso) — nenhuma
  propagou de forma confiável pelo cache do servidor. Desativar o recurso
  inteiro foi o que resolveu de forma consistente. Detalhe técnico
  completo em [ARCHITECTURE.md](ARCHITECTURE.md).

- **Decisão (2026-08-20)**: capturar no HubSpot quem preenche a página de
  captura (A/B/C) mas abandona o quiz no meio, em vez de só criar
  contato quando o quiz é finalizado (comportamento de sempre).
  **Porquê**: o time pediu uma lista de nutrição pra esse público, e sem
  captura antecipada esse grupo simplesmente não existia como contato no
  HubSpot — não tinha o que nutrir. Implementado um envio inicial pro
  HubSpot (`submitHubSpotStart()`) assim que o quiz carrega, só com
  nome/e-mail/telefone (sem nenhuma resposta ainda). Se a pessoa termina o
  quiz, o envio final de sempre atualiza esse mesmo contato com as
  respostas; se abandona, o contato fica com `quiz_prioridade` em branco —
  esse é o sinal usado pra identificar quem não terminou. Detalhe técnico
  completo em [HUBSPOT-SETUP.md](HUBSPOT-SETUP.md#9-captura-de-quem-abandona-o-quiz-2026-08-20).
  **Lista criada no HubSpot**: `Quiz Cidadania — Não terminou o quiz`
  (list ID `360`), dinâmica. **Armadilha evitada**: a primeira versão do
  filtro (só "prioridade do quiz vazia", sem exigir que a pessoa tenha de
  fato submetido o formulário do quiz) pegou 10.637 contatos — qualquer
  contato do CRM inteiro que nunca passou pelo quiz. Apagada antes de
  qualquer automação usar; a versão certa exige também "preencheu o
  formulário do quiz" (filtro por Form GUID), o que trouxe o número pra 0
  contatos no momento da criação (nenhum abandono registrado ainda —
  a captura acabou de entrar no ar).
  **Publicado em produção**: página `/quizdiagnostico-02/` (post 3373)
  atualizada com o código novo, via `wp.editPost` (XML-RPC do WordPress,
  sem precisar de navegador — `xmlrpc.php` está habilitado no site e o
  conteúdo dessa página é um bloco HTML puro do Gutenberg, não Elementor).
  Confirmado em produção que o bundle novo está no ar.
  **Pendência pra próxima sessão**: adicionar filtro de "criado há mais de
  X horas" na lista 360 (pela interface do HubSpot, não pela API — ver
  motivo em HUBSPOT-SETUP.md), pra não pegar quem ainda está no meio das
  perguntas.

## Roadmap / fases

**Feito:**
- Quiz completo com lead score, 3 conclusões automáticas, redirecionamento
  por contagem regressiva **e** botão manual de CTA (2026-08-17).
- Tempos de leitura ajustados nos interstícios e na tela de análise —
  `feedbackMs: 4500`, `analysisMs: 4600` (2026-08-17/18, depois de mais de
  uma rodada de feedback do usuário de que estava passando rápido demais,
  especialmente na transição final antes do diagnóstico).
- Rodapé do tema removido da página do quiz publicada no WordPress, via
  painel "Opções do Neve" (2026-08-18).
- 3 links provisórios pro time de copy revisar as telas de conclusão
  isoladamente, sem precisar responder o quiz (`/diagnostico-alta`,
  `/diagnostico-media`, `/diagnostico-baixa` no ambiente Vercel) — ver
  detalhe técnico em [ARCHITECTURE.md](ARCHITECTURE.md#preview-das-telas-de-conclusão-pro-time-de-copy).
- **Integração completa com HubSpot** (2026-08-17/18): formulário quiz02 e
  11 propriedades de contato criados via API, `app.js` configurado com
  `portalId`/`formGuid`. Ver [HUBSPOT-SETUP.md](HUBSPOT-SETUP.md) pro
  detalhe completo.
- **Roteamento de lead pro comercial reconfigurado** (2026-08-18): os
  workflows "Funil diagnostico" (dono + negócio) e "Webhook — dashboard"
  agora disparam a partir do quiz novo — ver decisão acima. Bug crítico
  de criação de Negócio (falha silenciosa por associação de empresa
  ausente) encontrado e corrigido, confirmado com teste limpo.
- **Quiz novo publicado em produção**: página `/quizdiagnostico-02/`
  publicada no WordPress (2026-08-18), substituindo o quiz antigo. As 3
  páginas de captura de lead (A, B e C) já redirecionam pra ela.
- Bug crítico do WP Rocket (plugin de cache/performance) encontrado e
  corrigido — travava o carregamento do quiz publicado no WordPress. Ver
  decisão acima e detalhe técnico em `ARCHITECTURE.md`.
- Investigação (só leitura, nada alterado) do funil de produção real no
  WordPress — mapeado captura de lead (A/B/C), quiz antigo, e as 3 páginas
  de obrigado existentes.

- **Removido o seletor de DDI do formulário de captura, e corrigido o "+55"
  faltante na página B** (2026-08-18): as páginas `/diagnostico-a/` e
  `/diagnostico-c/` usavam o formulário HubSpot V4 embutido, cujo campo de
  telefone (`hs_whatsapp_phone_number`) sempre mostra um seletor de
  bandeira/código de país (padrão `+1` EUA) — confirmado que **não dá pra
  remover isso pela interface do HubSpot nem pela API** (campo travado por
  ser propriedade padrão do tipo Telefone; a opção "mostrar seletor de
  código de país" não existe mais no editor de formulários novo/V4; a API
  de forms bloqueia escrita em formulários V4: `"client is not allowlisted
  to perform an operation to v4 forms"`). A página `/diagnostico-b/`, em
  contraste, já usa um **formulário nativo do Elementor Pro** (campo de
  telefone simples, sem seletor de país) — só que o redirect dela mandava o
  telefone **sem o "+55"** pro quiz (`hs_whatsapp_phone_number=[field
  id="whatsapp"]`, sem prefixo). Corrigido o `redirect_to` do formulário da
  B pra `hs_whatsapp_phone_number=%2B55[field id="whatsapp"]` — confirmado
  em produção que agora sai `+5511987654321` completo.
  **Como foi publicado**: login como `claude-temp` (credenciais em `.env`),
  editor do Elementor da página (`post.php?post=3262&action=elementor`),
  troca do `settings.redirect_to` do widget de formulário via API JS interna
  (`window.elementor`, mesma técnica já documentada em ARCHITECTURE.md).
  **Achado técnico novo**: o botão "Publicar/Atualizar" do painel do
  Elementor às vezes fica com dimensão 0 (não clicável nem pelo Playwright
  nem via `.click()` direto) quando o painel está na rota
  `panel/elements/categories` — nenhuma tentativa de voltar de rota
  resolveu. O que funcionou de verdade foi publicar programaticamente via
  `await window.$e.run('document/save/publish')` (API de comandos do
  Elementor), sem depender de clicar em botão nenhum.
  **Concluído nas 3 páginas** (2026-08-18): o mesmo formulário nativo do
  Elementor (clonado a partir do da B, settings idênticos, `redirect_to` já
  com `%2B55`) substituiu o widget HTML do form HubSpot nas páginas
  `/diagnostico-a/` (era o widget `c8d4186`, dentro do container `791a2d2`)
  e `/diagnostico-c/` (era o widget `9286529`, mesmo container `791a2d2`).
  Confirmado em produção nas 3 páginas, via submissão real (Playwright,
  contexto limpo): nenhuma mostra mais seletor de bandeira/país, e as 3
  mandam `hs_whatsapp_phone_number` completo com `+55` pro quiz. **Como foi
  feito** (útil se precisar repetir em outra página): no editor Elementor,
  achar o container pai e o widget antigo via `window.elementor.getContainer(id)`,
  guardar o índice dele (`parentContainer.children.indexOf(oldContainer)`),
  criar o novo widget na mesma posição com
  `await $e.run('document/elements/create', { container: parentContainer, model: {elType:'widget', widgetType:'form', settings: {...} }, options: { at: index } })`,
  remover o antigo com `await $e.run('document/elements/delete', { container: oldContainer })`,
  conferir visualmente inspecionando o DOM de `#elementor-preview-iframe`
  antes de publicar, e publicar com `await $e.run('document/save/publish')`
  (não com clique no botão — ver achado técnico abaixo).
  **Limpeza feita** (2026-08-18): a propriedade de contato
  `numero_whatsapp_sem_ddi` ("Número de WhatsApp sem DDI") — criada como
  parte de um plano alternativo que acabou não sendo usado (a solução final
  foi trocar o formulário inteiro pelo modelo da B, não usar propriedade
  customizada) — foi arquivada no HubSpot. Os 4 contatos de teste gerados
  durante os testes de DDI (`teste-fix-ddi-a/b/c@exemplo.com`,
  `teste-pagina-b-inspecao@exemplo.com`) foram apagados — nenhum tinha
  Negócio associado. O contato de teste do teste ponta a ponta anterior
  (`teste-e2e-quiz02-20260818@exemplo.com`, id `242845620066`, com Negócio
  `64138266010`) **continua intacto**, por pedido explícito do usuário.

- **Teste 100% limpo de ponta a ponta confirmado** (2026-08-18): rodado via
  navegador automatizado (Playwright, contexto novo sem cookies) pelo
  caminho real — `/diagnostico-a/` → preencheu nome/e-mail/telefone → quiz
  completo (respostas de perfil forte, score 91) → `/quizdiagnostico-02/`
  mostrou a conclusão "Alta" corretamente. Confirmado na API do HubSpot:
  contato criado (`teste-e2e-quiz02-20260818@exemplo.com`, id
  `242845620066`) com `quiz_score=91`, `quiz_prioridade=Alta`,
  `quiz_classificacao=Grau 1`, dono atribuído (`hubspot_owner_id=93361168`,
  Gisele Lima — dentro do pool já alinhado); Negócio criado (id
  `64138266010`) no pipeline/estágio certo (`Pipeline SDR - Nova` →
  `Novo lead - Forms`), com `campanha_de_origem=Campanha diagnóstico` e
  `dealname="Teste E2E Claude  — Alta"`. Único detalhe cosmético: espaço
  duplo antes do "—" no nome do negócio, porque o form de captura só tem
  campo de nome completo, sem sobrenome — `lastname` fica vazio (não é bug
  introduzido por este teste, é assim que o form de captura sempre
  funcionou). **Contato/negócio de teste ainda não apagados** — decidir com
  o usuário se apaga ou deixa (claramente identificável pelo e-mail
  `teste-e2e-*@exemplo.com`).

**Pendências abertas pra próxima sessão:**
- **Reinscrição quebrada no workflow "Funil diagnostico"**: o campo
  `reEnrollmentTriggersFilterBranches` ficou vazio como efeito colateral
  de uma correção de erro 400 da API do HubSpot durante a sessão, e uma
  tentativa de repopular esse campo corretamente também retornou 400 (sem
  detalhe do motivo). Efeito prático: se o **mesmo contato** (mesmo
  e-mail já conhecido) responder o quiz de novo, o workflow não dispara
  uma segunda vez — dono/negócio não são reatribuídos numa segunda
  resposta. Não deve afetar leads novos reais (cada um é um contato
  novo), só re-testes ou alguém retomando o quiz. Precisa investigar o
  formato exato que a API espera, ou ajustar isso manualmente pela
  interface do HubSpot.
- **Contato de teste sem Negócio**: o contato "Claudio Pereira"
  (`claudiopereira@gmail.com`, HubSpot id `227825403013`) foi enrolado no
  workflow **antes** do fix da associação de empresa, e não conseguiu
  reenrolar por causa do problema acima — ficou sem Negócio criado.
  Decidir: criar o negócio manualmente pra ele, ou deixar como está (é só
  um contato de teste, sem impacto em lead real).
- **Falta um teste 100% limpo de ponta a ponta**: usando aba anônima (ou
  navegador diferente) pra garantir um contato realmente novo — preencher
  a página A, B ou C → responder o quiz → confirmar no HubSpot que o
  contato chega com dono atribuído e Negócio criado com o nome incluindo a
  prioridade. Os testes feitos nesta sessão (Claudio Pereira e Claudio
  Goiabeira) colapsaram no mesmo contato por terem sido feitos no mesmo
  navegador (ver nota abaixo) — o teste pós-fix mais confiável até agora
  foi um contato criado via API diretamente (`teste-fix-deal-claude`), que
  funcionou como esperado, mas ainda vale confirmar pelo caminho real
  (formulário → quiz → HubSpot).
- **Nota pra evitar confusão em testes manuais futuros**: testar "vários
  leads diferentes" digitando e-mails diferentes no **mesmo navegador**
  faz o HubSpot colapsar tudo num único contato já conhecido daquele
  navegador (via cookie `hubspotutk`) — o e-mail novo entra como "e-mail
  adicional" em vez de criar um contato separado. Isso não deve acontecer
  com tráfego real de anúncio (cada lead vem de um dispositivo/navegador
  diferente), mas confunde testes manuais. Pra testar como leads
  separados: usar aba anônima ou limpar cookies entre um teste e outro.
- **Reativar a campanha de anúncios**: decisão do usuário, não é tarefa
  técnica — só depois de validar o teste limpo do item acima.
- **Revisar depois**: rebaixar `claude-temp` de Administrador pra Editor
  de novo, e excluir o app privado do HubSpot, quando o funil estiver
  validado e estável (ver decisão acima).

## Ver também

[ARCHITECTURE.md](ARCHITECTURE.md) — estrutura de código, comandos, e as
armadilhas técnicas já resolvidas (CSS vazando pro tema WordPress, bloqueio
de Application Passwords, etc.).
