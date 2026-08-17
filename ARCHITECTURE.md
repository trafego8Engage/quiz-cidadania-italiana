# Quiz de Cidadania Italiana (Gioppo & Conti) — arquitetura e estado do projeto

Quiz de diagnóstico/qualificação de leads (8 perguntas) para o funil de cidadania
italiana da Gioppo & Conti. Calcula um lead score, mostra uma tela de conclusão
personalizada por faixa de pontuação e redireciona automaticamente para a página
de obrigado correspondente. Este repositório é **apenas o quiz** — ele é uma peça
dentro de um funil maior que vive no WordPress da Gioppo & Conti (captura de lead
→ quiz → página de obrigado). Ver [Onde as coisas estão](#onde-as-coisas-estão)
para o mapa completo do funil.

Contexto de negócio/decisões de produto: ver [PASSAGEM-DE-PLANTAO.md](PASSAGEM-DE-PLANTAO.md)
— os dois documentos se referenciam.

## Onde as coisas estão

- **Este repositório** = o quiz em si (`index.html` + `styles.css` + `app.js`,
  sem build, sem dependências). Publicado de duas formas diferentes, a partir do
  mesmo código-fonte:
  - **Vercel** (ambiente de teste/preview): https://quiz-cidadania-italiana-rtwk.vercel.app/
    — projeto conectado via integração GitHub → Vercel; todo push em `main` faz
    deploy automático. Não temos o project ID Vercel mapeado nos MCPs configurados
    nesta máquina (provavelmente está noutra conta/team Vercel).
  - **WordPress da Gioppo & Conti** (produção real, pra onde os anúncios apontam):
    `wordpress-embed/quiz-embed.html`, gerado por `wordpress-embed/build.js` a
    partir do mesmo `index.html`/`styles.css`/`app.js`, pronto pra colar num bloco
    de HTML do WordPress. Ver seção [Deploy / publicação](#deploy--publicação).

- **O funil completo** (fora deste repositório) vive em `lp.gioppoeconti.com.br`
  — WordPress + Elementor, tema Neve, hospedagem Hostinger. Esse domínio é
  diferente do site institucional principal (`gioppoeconti.com.br`), que é outra
  instalação WordPress separada.

- **HubSpot** — Portal ID da conta: `51117535`. Existe um form HubSpot V4 já em
  produção (`d6f6e854-2226-494b-986c-ca6f1054aa4c`) usado pela **captura de lead**
  (nome/e-mail/WhatsApp) — não é o form das respostas do quiz. O envio das
  respostas do quiz pro HubSpot ainda não tem form próprio (ver estado da feature
  abaixo).

## Funil no WordPress: como está hoje (antigo) vs. proposta pós-atualização (quiz02)

### Hoje (antigo, em produção — o que os anúncios usam agora)

```
Anúncio
  ↓
/diagnostico-a/ , /diagnostico-b/ , /diagnostico-c/   (captura de lead — form HubSpot V4)
  ↓  JS pega firstname/email/hs_whatsapp_phone_number e redireciona
/quizdiagnostico/                                      ← SPA estático antigo (bundle Vite/React)
  · sem telas de conclusão
  · redireciona direto pro obrigado, sem contagem regressiva nem diagnóstico visível
  ↓
/obrigado-grau-1/   ou   /obrigado-grau-2/
```

### Depois (proposta — publicar o quiz deste repositório como "quiz02")

```
Anúncio
  ↓
/diagnostico-a/ , /diagnostico-b/ , /diagnostico-c/   (sem alteração — já compatíveis,
                                                         mesmos nomes de parâmetro)
  ↓
/quizdiagnostico-02/                                   ← NOVA página WordPress, com o bloco
                                                          HTML de wordpress-embed/quiz-embed.html
  · novo design (dark + vinho)
  · 3 telas de conclusão automáticas (Alta/Média/Baixa) com insights dinâmicos
  · redireciona sozinho após contagem regressiva de 15s, sem nenhum botão
  ↓
/obrigado-grau-1/   ou   /obrigado-grau-2/    ← as mesmas páginas de sempre, sem alteração
                                                 (/obrigado-dq/ não será usada por enquanto)
```

**O que muda de fato, e onde:**

| Onde | Muda? | O quê |
|---|---|---|
| `/diagnostico-a/`, `/diagnostico-b/`, `/diagnostico-c/` | Só o link de destino | Hoje apontam pra `/quizdiagnostico/`; precisam passar a apontar pra `/quizdiagnostico-02/` (ou o slug final escolhido) quando a nova versão for publicada — é uma edição nessas 3 páginas Elementor, fora deste repositório |
| O quiz em si | Página nova | `/quizdiagnostico-02/` (slug ainda não confirmado com o usuário) substitui `/quizdiagnostico/` — o antigo pode continuar publicado até a troca ser confirmada, sem risco, já que nada aponta pra ele automaticamente |
| `/obrigado-grau-1/`, `/obrigado-grau-2/` | Nada | Continuam sendo os destinos finais, sem alteração nenhuma |
| `/obrigado-dq/` | Nada, por decisão | Existe em produção, mas **decidido não usar por enquanto** (2026-08-16) — ver [Armadilhas conhecidas](#armadilhas-conhecidas) |

## Estrutura de código

```
index.html              # markup único: header/progresso + 4 "views" (quiz,
                         # feedback intermediário, análise/loading, conclusão)
styles.css               # design system (dark + vinho): tokens em :root,
                         # sem framework, mobile-first via 1 media query
app.js                    # tudo: perguntas, cálculo de score, render, HubSpot,
                         # conclusões, contagem regressiva, botão de CTA,
                         # modo preview e redirect final
logo.png                  # logo Gioppo & Conti (também embutida em base64
                         # dentro do bundle do WordPress)
vercel.json                # rewrites das 3 URLs de preview (ver seção
                         # "Preview das telas de conclusão pro time de copy")
wordpress-embed/
  build.js                 # gera quiz-embed.html a partir dos 3 arquivos acima
  quiz-embed.html           # ARTEFATO GERADO — não editar a mão, sempre
                         # regenerar com `node wordpress-embed/build.js`
paginas_conclusao_quiz_cidadania_gioppo_conti.md
                         # doc de referência/spec das 3 conclusões — NUNCA
                         # entra no git (fica sempre untracked, por pedido
                         # explícito do usuário), é só apoio local
```

## Preview das telas de conclusão pro time de copy

Necessidade (2026-08-17): o time de copy precisa ler as 3 telas de conclusão
(Alta/Média/Baixa) isoladamente, sem precisar responder o quiz inteiro toda
vez. Solução implementada, **provisória por natureza** (não é parte do funil
real, só uma ferramenta de revisão):

- `app.js` detecta modo preview via `getPreviewKey()` — por querystring
  (`?preview=alta|media|baixa`, funciona em qualquer host, inclusive local)
  ou por path (`/diagnostico-alta`, `/diagnostico-media`, `/diagnostico-baixa`,
  via os rewrites do `vercel.json`, que preservam a URL na barra de endereço
  sem redirecionar de fato).
- Em modo preview, `startPreview()` pula direto pra `showConclusion()` com
  valores de score fictícios, esconde a contagem regressiva de redirect
  (`#redirectCountdown`) e mantém o botão de CTA visível/funcional — se
  clicado, redireciona de verdade pra `/obrigado-grau-1/` ou `/obrigado-grau-2/`
  (comportamento igual ao de produção, útil pra revisar o botão também).
- No ambiente Vercel (preview): `https://quiz-cidadania-italiana-rtwk.vercel.app/diagnostico-alta`,
  `/diagnostico-media`, `/diagnostico-baixa`.
- **Não precisa regenerar nada pro WordPress** — o bundle usa a mesma
  `app.js`, mas como o path do WordPress nunca bate com `diagnostico-alta|media|baixa`,
  o modo preview fica inerte lá.

Por que `wordpress-embed/` existe como bundle separado (e não só o
`index.html` direto): o WordPress da Gioppo & Conti tem **Application
Passwords desativado** a nível de hospedagem (Hostinger bloqueia a rota
`wp-json/.../application-passwords`, retorna 501 — não é algo que dá pra
religar via `wp-admin`, nem tem plugin de segurança instalado que explique
o bloqueio) e o usuário não tem acesso FTP/hPanel, só login no `wp-admin`.
Sem API nem FTP, a única via é colar HTML direto num bloco do editor. Por
isso o bundle:
- injeta todo o CSS escopado sob `#gc-quiz-app` (senão `*{box-sizing:...}`,
  `html,body{...}`, `button{...}` etc. vazam pro tema WordPress inteiro);
- embute a logo em base64 (evita depender da Biblioteca de Mídia);
- inclui `app.js` inline no fim do bloco.

## Estado por feature/módulo

| Feature | Status | Nota |
|---|---|---|
| Quiz (8 perguntas + lead score) | ✅ feito | thresholds em `CONFIG.thresholds` (Alta ≥60, Média ≥35, senão Baixa) |
| 3 telas de conclusão (Alta/Média/Baixa) | ✅ feito | sessão de 2026-08, com insights dinâmicos por resposta (`dynamicInsights()`) |
| Interstícios de argumentação entre perguntas | ✅ feito | 3 telas de `FEEDBACK` (`documentos`→pergunta 4, `familiares`→pergunta 8, `idade`→diagnóstico), `CONFIG.feedbackMs` = 4500ms (2026-08-17, aumentado de 1800ms — estava passando rápido demais pra ler) |
| Redirecionamento automático + botão manual | ✅ feito | contagem regressiva de 15s (`CONFIG.redirectSeconds`) **e** botão `#conclusionCtaButton` que redireciona na hora — ver decisão revisada em [PASSAGEM-DE-PLANTAO.md](PASSAGEM-DE-PLANTAO.md) |
| Preview das 3 conclusões pro time de copy | ✅ feito | provisório, ver seção acima — `?preview=` ou `/diagnostico-alta|media|baixa` |
| Compatibilidade com a captura de lead do funil real | ✅ confirmado | `contactFields()` já lê `firstname`/`email`/`hs_whatsapp_phone_number`, exatamente os params que `/diagnostico-a/` e `/diagnostico-c/` mandam via JS após o form HubSpot |
| Envio das respostas do quiz pro HubSpot | ✅ feito (2026-08-17) | `CONFIG.hubspot` preenchido (`portalId: '51117535'`, `formGuid: '44ad0787-1f00-4df5-9114-9a2624e36064'`). Formulário e 11 propriedades de contato criados via API — detalhe completo em [HUBSPOT-SETUP.md](HUBSPOT-SETUP.md). Falta só um teste de ponta a ponta (submissão real) pra confirmar |
| Publicação no domínio real da Gioppo & Conti | ⚠️ parcial | bundle pronto (`wordpress-embed/quiz-embed.html`), mas ainda **não colado** em nenhuma página do WordPress — próximo passo é criar a página e colar o bloco |
| Destino "Lead Desqualificado" (`/obrigado-dq/`) | 🚫 decidido não usar por enquanto | página existe em produção, mas `app.js` não redireciona pra ela — decisão explícita do usuário (2026-08-16), não é bug. Ver [Armadilhas conhecidas](#armadilhas-conhecidas) |
| Senha de Aplicativo / acesso via API ao WordPress | ❌ bloqueado | bloqueio de hospedagem (Hostinger), não é algo resolvível via `wp-admin`; ver armadilha correspondente |

## Armadilhas conhecidas

### CSS vazando pro tema WordPress se colado sem escopo
- **Sintoma**: se você pegar `styles.css` e colar puro num bloco HTML do
  WordPress, títulos, botões e background do **site inteiro** mudam de cor/estilo,
  não só o quiz.
- **Causa raiz**: `styles.css` original tem regras globais (`*`, `html,body`,
  `button`, `h1,h2`) pensadas pra uma página própria, sem concorrência de CSS de
  tema. Além disso, `h1,h2` (e o `h3` de `.conclusion-cta-block`) **não
  declaravam `color` explicitamente** — dependiam de herança do `body`. Um tema
  WordPress com uma regra tipo `h1,h2{color:...}` (comum em quase todo tema)
  ganha da herança, mesmo sem ter mais especificidade, porque uma regra que
  casa diretamente com o elemento sempre vence um valor herdado.
- **Fix**: `wordpress-embed/build.js` escopa toda regra sob `#gc-quiz-app` (ver
  função `processRuleBlock`), renomeia a `@keyframes spin` pra `gcQuizSpin`
  (nome genérico demais, risco de colisão), e `styles.css` agora declara
  `color` explicitamente em `h1,h2` e em `.conclusion-cta-block h3` — corrigido
  na fonte, então vale tanto pro site solo quanto pro embed.
- **Como aplicar**: se adicionar uma regra CSS nova que estilize um elemento
  genérico (`h1`-`h6`, `p`, `a`, `span`, `button`, `li`) sem classe, **sempre
  declare `color` (e qualquer propriedade visual relevante) explicitamente** —
  nunca confie em herança quando o destino final é um embed dentro de outro
  site. Testado simulando um "tema hostil" com CSS conflitante via Playwright
  (ver `wordpress-embed/build.js` + teste ad-hoc, não versionado).

### Application Passwords desativado sem explicação óbvia
- **Sintoma**: a seção "Senhas de Aplicativo" não aparece no perfil do usuário
  no `wp-admin` de `lp.gioppoeconti.com.br`, mesmo em contas Administrador.
- **Causa raiz**: `GET /wp-json/wp/v2/users/me/application-passwords` retorna
  `501` com `{"code":"application_passwords_disabled"}`, e o índice da REST API
  (`/wp-json/`) mostra `"authentication":[]` (vazio — normalmente listaria
  `application-passwords` aqui se estivesse disponível). Não é nenhum plugin de
  segurança instalado (Wordfence/iThemes/Shield não estão na lista de 21
  plugins ativos) nem nenhum Snippet do Code Snippets faz isso (os 5 snippets
  existentes são só os de exemplo padrão do plugin). Conclusão: é hardening da
  própria hospedagem gerenciada Hostinger, fora do alcance do `wp-admin`.
- **Fix**: não tem fix via `wp-admin`. Caminho encontrado: publicar via login
  normal no `wp-admin` (usuário WordPress dedicado, papel Editor, descartável)
  e colar o bundle HTML manualmente/via automação de navegador — não depende de
  REST API nem FTP.
- **Como aplicar**: se precisar de acesso programático ao WordPress de novo no
  futuro, não perca tempo procurando toggle de segurança no `wp-admin` — ou
  peça pro usuário abrir chamado com a Hostinger, ou siga o caminho de login
  normal.

### `/obrigado-dq/` existe em produção mas não está no funil do quiz
- **Sintoma**: nenhum — não é um bug, é uma decisão de produto registrada aqui
  pra não ser redescoberta como se fosse pendência solta.
- **Contexto**: ao investigar o funil de produção em `lp.gioppoeconti.com.br`
  (sessão de 2026-08-16), encontrei 3 páginas de obrigado publicadas —
  `/obrigado-grau-1/`, `/obrigado-grau-2/` e `/obrigado-dq/` ("LEAD
  DESQUALIFICADO") — mas `CONFIG.redirects` em `app.js` só conhece `grade1` e
  `grade2`; `destination()` nunca retorna nada equivalente a "desqualificado".
- **Decisão**: o usuário confirmou (2026-08-16) que **não vamos usar
  `/obrigado-dq/` por enquanto**. `destination()` continua só com dois
  destinos possíveis (Grau 1 / Grau 2).
- **Como aplicar**: não implementar um terceiro destino baseado em
  `/obrigado-dq/` sem antes confirmar de novo com o usuário — o "por enquanto"
  indica que pode voltar a ser considerado no futuro, mas não é uma tarefa em
  aberto hoje.

## Comandos úteis

```bash
# rodar o quiz localmente (site estático, sem build)
python -m http.server 8000   # depois abrir http://localhost:8000

# regenerar o bundle de embed do WordPress após mudar index.html/styles.css/app.js
node wordpress-embed/build.js

# checar sintaxe do app.js
node --check app.js
```

Não há testes automatizados, linter nem processo de build configurado neste
projeto — é HTML/CSS/JS puro servido como arquivos estáticos.

## Deploy / publicação

**Vercel** (ambiente de preview): `git push origin main` → deploy automático
via integração GitHub já configurada no projeto Vercel. Não precisa de nenhum
comando manual.

**WordPress (produção real)**:
1. `node wordpress-embed/build.js` (gera `wordpress-embed/quiz-embed.html`
   atualizado).
2. Copiar o conteúdo inteiro do arquivo gerado.
3. No `wp-admin` → Páginas → Adicionar nova → definir Modelo como
   "Elementor Canvas" (ou equivalente sem header/footer do tema) → adicionar
   um bloco "HTML personalizado" (Gutenberg) ou widget "HTML" (Elementor) →
   colar o conteúdo → Publicar.
4. Repetir sempre que o quiz mudar (o WordPress não sincroniza automaticamente
   com este repositório — é um passo manual de copiar/colar).

### Artefatos publicados

| O quê | Onde | Confirmado ao vivo em |
|---|---|---|
| Quiz (preview/staging) | https://quiz-cidadania-italiana-rtwk.vercel.app/ | 2026-08-16 (via WebFetch, já refletindo a tela de conclusão) |
| Quiz (produção, WordPress) | ainda não publicado | — |
| Página de captura de lead A | https://lp.gioppoeconti.com.br/diagnostico-a/ | 2026-08-16 |
| Página de captura de lead C | https://lp.gioppoeconti.com.br/diagnostico-c/ | 2026-08-16 |
| Obrigado — Grau 1 | https://lp.gioppoeconti.com.br/obrigado-grau-1/ | 2026-08-16 |
| Obrigado — Grau 2 | https://lp.gioppoeconti.com.br/obrigado-grau-2/ | 2026-08-16 |
| Obrigado — Desqualificado | https://lp.gioppoeconti.com.br/obrigado-dq/ | 2026-08-16 (existe, não usado pelo quiz) |
