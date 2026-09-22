# CR8 — dashboard do Funil Diagnóstico (outra ponta deste funil)

Este documento é uma cópia de referência (2026-08-17) do que está documentado
no repositório **CR8** — o sistema onde os dados deste quiz acabam depois de
passarem pelo HubSpot. Fica aqui pra quem trabalha só nesta pasta (`FUNIL`)
não precisar abrir o outro repositório pra entender pra onde os dados vão.

**Fonte de verdade / documento vivo:** repositório CR8, arquivo
`ARQUITETURA-FUNIL-DIAGNOSTICO-GIOPPO.md` (`C:\dev\trafego8Engage\8engage-traffic-os\ARQUITETURA-FUNIL-DIAGNOSTICO-GIOPPO.md` — o `8engage-traffic-os` é a versão nova do CR8).
Se algo mudar no CR8, atualize lá primeiro — este arquivo pode ficar
desatualizado com o tempo.

Este repositório (`FUNIL`) cuida de: anúncio → captura de lead → quiz → envio
pro HubSpot (ver `ARCHITECTURE.md` e `HUBSPOT-SETUP.md` aqui do lado). A partir
do momento em que o HubSpot recebe as respostas, quem assume é o CR8.

## Link público do dashboard (o que o gestor de tráfego vê)

- **Nome no CR8:** "Dash Funil Diagnóstico"
- **URL pública:** `https://<domínio-de-produção-do-CR8>/d/d02af7b3d56a4b4087002738fab44743`
- **`portal_link_id`:** `bb778f1c-4a37-4376-a570-67b1fe5e54a4`
- Empresa vinculada no CR8: Gioppo e Conti (`company_id: 453aa35c-c94e-405f-bcbf-7f4a2728e82a`), conta de anúncios `act_750848079272203`

## Pipeline (a partir do HubSpot)

```
HubSpot (workflow dispara ao final do quiz, form guid 44ad0787-1f00-4df5-9114-9a2624e36064,
          portal 51117535 — ver HUBSPOT-SETUP.md)
  │  POST
  ▼
supabase/functions/hubspot-diagnostico-webhook  (repo CR8)
  · identifica o portal_link pelo portal_token na URL do webhook configurado no HubSpot
  · calcula score (0–100) e prioridade (alta/média/baixa) a partir das respostas
  · grava em diagnostico_leads + diagnostico_form_answers
  ▼
supabase/functions/portal-dashboard + _shared/clientPortalAnalytics.ts
  · RECALCULA score/prioridade de novo a partir do raw_payload (não confia
    cegamente no valor gravado) — ver Armadilha abaixo
  · agrega por pergunta (lista fixa de 8 perguntas, hardcoded no CR8)
  ▼
components/PublicDashboard.tsx → aba "Funil Diagnóstico"
  · cards de prioridade, donut de prioridade, donut de faixa de score,
    score médio, distribuição de respostas por pergunta
```

## Bugs encontrados e corrigidos em 2026-08-18 (validação do quiz02 → dashboard)

Ao validar se o webhook do quiz02 seria decodificado corretamente pelo CR8,
encontrei e corrigi 2 bugs reais (fonte de verdade completa, com o código
exato, está em `ARQUITETURA-FUNIL-DIAGNOSTICO-GIOPPO.md` no repo CR8,
Armadilhas 5–8 — resumo aqui):

1. **Payload do HubSpot vinha como `{value, versions}`, não como string
   direta** — a ação de Webhook do HubSpot Workflows manda cada propriedade
   nesse formato quando não tem "request body" customizado. O código do CR8
   pegava o objeto inteiro e tratava como string, virando `"[object Object]"`
   pra nome, e-mail, telefone, dono e todas as respostas. Corrigido com uma
   função de "desembrulhar" o valor, aplicada nos dois arquivos do CR8
   (ingestão do webhook + leitura/agregação do dashboard).
2. **Lista de perguntas do CR8 só reconhecia os nomes de propriedade do
   quiz antigo** — o quiz02 renomeou quase toda propriedade (ver
   `HUBSPOT-SETUP.md` deste repo). Corrigido acrescentando os nomes novos
   como aliases extras, sem remover os antigos (pra não quebrar os 200+
   leads históricos do quiz antigo).
3. **Decisão**: o score/prioridade exibidos no CR8 pro quiz02 agora vêm
   **direto** das propriedades `quiz_score`/`quiz_prioridade` que o
   `app.js` deste repo já calcula e manda — não são mais recalculados por
   uma tabela de pontos baseada no texto das respostas (que não batia com a
   redação nova do quiz02). O quiz antigo continua com o cálculo próprio do
   CR8, sem mudança.

Deploy das duas edge functions (`hubspot-diagnostico-webhook`,
`portal-dashboard`) já feito e testado com um lead real de teste (score 91,
Alta, 8/8 perguntas corretas no dashboard).

## Armadilha importante: dois scores diferentes para o "mesmo" lead

- **Score que o lead vê** (este repositório, `app.js`, `CONFIG.thresholds`):
  Alta ≥60, Média ≥35 — decide qual das 3 telas de conclusão aparece pro lead.
  Esse valor vai pro HubSpot como propriedade `quiz_score`.
- **Score que o gestor vê no CR8**: recalculado do zero a partir das respostas
  brutas, em escala 0–100 com Alta ≥100, Média ≥50 — **não é o mesmo cálculo**
  nem a mesma escala do item acima.

Se um lead aparecer com prioridade diferente na tela de conclusão dele e no
dashboard do CR8, **não é bug** — são duas fórmulas de score independentes.
Se algum dia decidir unificar os dois (usar o `quiz_score` calculado aqui como
única fonte de verdade em vez de recalcular no CR8), isso precisa ser
combinado nos dois repositórios.

## Onde mexer se precisar alterar o dashboard

Ver a tabela completa em `ARQUITETURA-FUNIL-DIAGNOSTICO-GIOPPO.md` no repo
CR8. Resumo rápido:

| Quero mudar... | Onde (repo CR8) |
|---|---|
| Pesos/fórmula do score exibido no dashboard | `supabase/functions/_shared/clientPortalAnalytics.ts` → `computeDiagnosticScoreFromAnswers` |
| Perguntas agregadas na aba do dashboard | mesmo arquivo → `DIAGNOSTIC_QUESTION_DEFS` (hardcoded, não configurável pela UI) |
| Layout da aba "Funil Diagnóstico" | `components/PublicDashboard.tsx` → `DiagnosticTab()` |
| Criar/editar o link público para outro cliente | UI do CR8, menu "Portal do Cliente" (`components/ClientPortalManager.tsx`) |

## Comandos úteis (rodar de dentro do repo CR8, não deste)

```bash
supabase db query --linked "select count(*), max(submitted_at) from diagnostico_leads where portal_link_id = 'bb778f1c-4a37-4376-a570-67b1fe5e54a4';"
supabase functions deploy hubspot-diagnostico-webhook
supabase functions deploy portal-dashboard
```
