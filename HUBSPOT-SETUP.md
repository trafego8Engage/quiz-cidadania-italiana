# Quiz de Cidadania Italiana — especificação final (perguntas, pontuação, fluxo e integração HubSpot)

Documento de referência do formulário/propriedades no HubSpot que recebem as respostas do quiz. Reflete o estado do código em `app.js` na sessão de 2026-08-17. Ver também [ARCHITECTURE.md](ARCHITECTURE.md) (estrutura técnica) e [PASSAGEM-DE-PLANTAO.md](PASSAGEM-DE-PLANTAO.md) (contexto de negócio).

**Status: ✅ integração com HubSpot criada e configurada** (2026-08-17) — formulário `Quiz Cidadania Italiana - Respostas (quiz02)` (Form GUID `44ad0787-1f00-4df5-9114-9a2624e36064`, Portal ID `51117535`), já preenchido em `CONFIG.hubspot` no `app.js`. Falta só um teste de ponta a ponta (submissão real) pra confirmar que os dados chegam certos no HubSpot — ver seção 8.

## 1. Visão geral do fluxo

```
Página de captura de lead (fora deste repo)
  → passa firstname / lastname / email / hs_whatsapp_phone_number via URL
  ↓
Quiz (8 perguntas, com 3 pausas de argumentação no meio)
  ↓
Tela de análise/loading (~2,6s)
  ↓
Envio das respostas pro HubSpot (submitHubSpot) — silencioso, não bloqueia a UI
  ↓
Tela de conclusão (Alta / Média / Baixa) — com botão manual + redirect automático em 15s
  ↓
Página de "obrigado" (Grau 1 ou Grau 2, fora deste repo)
```

- **Perguntas 1→3** (origem, parentesco, documentos)
- **Pausa de argumentação** ("Tudo certo.") — 4,5s
- **Pergunta 4** (objetivos, múltipla escolha)
- **Perguntas 5→7** (momento, investimento, familiares)
- **Pausa de argumentação** ("Interessante.") — 4,5s
- **Pergunta 8** (idade — não pontua)
- **Pausa de argumentação** ("Perfeito, já temos o que precisamos.") — 4,5s
- **Análise → conclusão → redirect**

## 2. Perguntas, propriedades e pontuação

`property` é o **internal name** que precisa existir como propriedade de contato no HubSpot antes do formulário funcionar — é exatamente o nome que `submitHubSpot()` usa como `name` de cada campo enviado.

| # | Pergunta | `property` (internal name) | Tipo | Opções → pontos |
|---|---|---|---|---|
| 1 | Você tem algum antepassado italiano na família? | `tem_antepassado_italiano` | única | Sim, tenho certeza (15) · Acho que sim (10) · Não tenho certeza (5) |
| 2 | Qual era o grau de parentesco desse antepassado italiano? | `quiz02_grau_parentesco` | única | Pai ou mãe (15) · Avô ou avó (15) · Bisavô ou bisavó (15) · Tataravô ou gerações anteriores (10) · Não tenho certeza (5) |
| 3 | Você possui algum documento da família que comprove essa origem? | `voce_possui_algum_documento_da_familia_que_comprove_essa_origem` | única | Sim, vários documentos (15) · Tenho alguns documentos (10) · Ainda não tenho os documentos (5) · Não sei quais documentos são necessários (3) |
| 4 | O que você busca com a cidadania italiana? *(até 5 opções)* | `quiz02_interesse_cidadania` | **múltipla** | Morar ou trabalhar na Europa (1) · Estudar na Europa (1) · Criar oportunidades para meus filhos ou família (1) · Ter mais mobilidade internacional (1) · Facilitar viagens (1) · Planejamento patrimonial ou familiar (1) · Ainda estou pesquisando os benefícios (1) — **soma é limitada a no máximo 5 pontos**, mesmo que todas as 7 sejam marcadas |
| 5 | Em que momento você está em relação à cidadania italiana? | `n6em_que_momento_voce_esta_em_relacao_a_cidadania_italiana` | única | Já decidi e quero começar o quanto antes (20) · Já decidi e pretendo começar nos próximos meses (15) · Quero confirmar se tenho direito antes de decidir (10) · Ainda estou pesquisando e entendendo o processo (5) · Ainda não pretendo iniciar (0) |
| 6 | Como você se encontra hoje em relação a esse investimento? | `disponibilidade_investimento_cidadania` | única | Tenho disponibilidade para iniciar (15) · Consigo me organizar (12) · Posso dividir com familiares (8) · Preciso de mais tempo (3) · Não tenho condições no momento (0) |
| 7 | Você pretende incluir outras pessoas da família no processo? | `n5voce_pretende_incluir_familiares_no_processo` | única | Sim (10) · Talvez, ainda estou avaliando (5) · Não (0) |
| 8 | Qual é a sua idade? | `faixa_etaria_quiz_cidadania` | única — **não pontua** | 18 a 24 anos · 25 a 34 anos · 35 a 44 anos · 45 a 54 anos · 55 anos ou mais (todas valem 0 ponto, é só qualificação demográfica) |

**Pontuação máxima possível: 95 pontos** (15+15+15+5+20+15+10, idade não conta).

### Nota sobre a pergunta 4 (múltipla escolha) e o HubSpot

O valor enviado pra `quiz02_interesse_cidadania` é o **texto das opções marcadas, separadas por `"; "`** (ex.: `"Estudar na Europa; Facilitar viagens"`), não uma lista JSON. A propriedade foi criada como **texto de linha única** (não como checkbox/enum), exatamente por causa disso — evita qualquer risco de submissão rejeitada por valor fora de uma lista fixa de opções.

### Por que `quiz02_grau_parentesco` e `quiz02_interesse_cidadania` têm nomes diferentes das perguntas correspondentes

As perguntas 2 (parentesco) e 4 (objetivos) originalmente reaproveitariam as propriedades já existentes no HubSpot (`n1_qual_o_grau_de_parentesco_entre_voce_e_o_italiano` e `qual_e_o_seu_principal_interesse_com_a_cidadania_italiana`), criadas pro **quiz antigo** (o SPA que ainda está em produção recebendo tráfego real dos anúncios — ver [ARCHITECTURE.md](ARCHITECTURE.md)). Na hora de criar a integração (2026-08-17), descobrimos que essas 2 propriedades antigas são do tipo **lista fixa (enumeration)** com opções cujo texto não bate com as opções do quiz novo (nenhuma das 5 opções de parentesco nem das 7 de objetivos coincide exatamente). Editar a lista de opções delas quebraria a coleta de dados do quiz antigo, que continua ativo. Por isso criamos 2 propriedades novas, de texto livre, só pro quiz novo, e apontamos o `app.js` pra elas — as outras 6 perguntas reaproveitam propriedades já existentes sem esse problema (são texto livre, sem lista fixa).

### Recomendação de tipo de propriedade no HubSpot

Pra todas as propriedades da tabela acima (única ou múltipla), o tipo usado foi **"Texto de linha única"**, não dropdown/radio/checkbox nativos — assim qualquer diferença futura de texto entre o quiz e a propriedade não quebra a submissão (o HubSpot rejeita valores que não batem exatamente com as opções cadastradas em propriedades do tipo enum).

## 3. Cálculo de prioridade e destino

```js
score = soma dos pontos de todas as respostas (idade não entra)

prioridade:
  score >= 60           → "Alta"
  35 <= score < 60       → "Média"
  score < 35             → "Baixa"

destino:
  prioridade "Baixa"     → Grau 2  (obrigado-grau-2)
  prioridade "Alta"/"Média" → Grau 1  (obrigado-grau-1)
```

Essas 3 telas de conclusão diferentes (Alta/Média/Baixa) existem só pra dar um tom de mensagem diferente — tecnicamente só há 2 destinos finais (Grau 1 e Grau 2).

## 4. Parâmetros de URL esperados na entrada do quiz

O quiz lê estes parâmetros da URL (vindos da página de captura de lead):

| Parâmetro na URL | Vai pro HubSpot como |
|---|---|
| `firstname` | `firstname` |
| `lastname` | `lastname` |
| `email` | `email` |
| `hs_whatsapp_phone_number` (ou `phone` como fallback) | `phone` |

Esses 4 são propriedades padrão do HubSpot (já existem, não precisa criar).

## 5. Propriedades extras enviadas (precisam existir no HubSpot)

Além das 8 perguntas, cada submissão manda:

| `property` (internal name) | Tipo sugerido | Exemplo de valor |
|---|---|---|
| `quiz_score` | Número | `72` |
| `quiz_prioridade` | Texto de linha única (ou dropdown: Alta / Média / Baixa) | `Alta` |
| `quiz_classificacao` | Texto de linha única (ou dropdown: Grau 1 / Grau 2) | `Grau 1` |

## 6. O que foi criado no HubSpot (2026-08-17)

Feito via API, usando um Private App Access Token temporário (revogado depois de usado — ver seção 7):

1. **Grupo de propriedades** `quiz_cidadania_italiana` (label "Quiz - Cidadania Italiana"), pra organizar tudo junto no HubSpot.
2. **6 propriedades novas** (não existiam antes): `tem_antepassado_italiano`, `disponibilidade_investimento_cidadania`, `faixa_etaria_quiz_cidadania`, `quiz_score` (número), `quiz_prioridade`, `quiz_classificacao`.
3. **2 propriedades novas por conflito de nome** (ver nota acima): `quiz02_grau_parentesco`, `quiz02_interesse_cidadania`.
4. **3 propriedades reaproveitadas** do quiz antigo, sem alteração: `voce_possui_algum_documento_da_familia_que_comprove_essa_origem`, `n6em_que_momento_voce_esta_em_relacao_a_cidadania_italiana`, `n5voce_pretende_incluir_familiares_no_processo`.
5. **Formulário** `Quiz Cidadania Italiana - Respostas (quiz02)` (Form GUID `44ad0787-1f00-4df5-9114-9a2624e36064`), com todos os campos acima (incluindo `firstname`/`lastname`/`email`/`phone`, propriedades padrão do HubSpot).
6. **`app.js` atualizado**: `CONFIG.hubspot = { portalId: '51117535', formGuid: '44ad0787-1f00-4df5-9114-9a2624e36064' }` — `submitHubSpot()` já estava pronto, só faltava essa config.
7. `node wordpress-embed/build.js` rodado de novo — bundle do WordPress já reflete a config nova.

## 7. Segurança do token usado

O Private App Access Token usado pra criar tudo acima foi apagado do disco (não fica salvo em nenhum arquivo do projeto nem em log). Ele tinha só os escopos `crm.schemas.contacts.write` e `forms` — não conseguia ler nem criar contatos de verdade, só schema/propriedades e formulários. Recomendo **excluir o app privado no HubSpot** (Configurações → Integrações → Apps privados → o app criado nesta sessão), já que ele não precisa continuar existindo depois do setup.

## 8. Teste de ponta a ponta (pendente)

Ainda não foi feita uma submissão real de teste — isso criaria um contato de verdade no HubSpot de produção, então não fiz sem confirmar antes. Pra validar que tudo está batendo certo (nomes de propriedade, tipos, etc.), duas opções:
- **Rodar o quiz de verdade** (local ou no preview da Vercel) até o fim e conferir se o contato aparece no HubSpot com todas as respostas certas.
- **Eu faço uma submissão de teste** com um e-mail claramente identificável (ex. `teste-quiz-claude@exemplo.com`) — nesse caso, você precisaria apagar esse contato de teste depois no HubSpot.
