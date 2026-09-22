# Nutrição de e-mail — leads que não viraram Negócio (quiz de cidadania)

Referência pra quem for configurar os e-mails de nutrição no HubSpot.
Cobre os dois grupos de lead que preenchem a página de captura (A/B/C) mas
**não** chegam a virar Negócio pro time comercial: quem termina o quiz com
prioridade Baixa, e quem abandona o quiz no meio.

## Fluxo inicial — os 4 grupos que saem do quiz

- **Alta** e **Média** prioridade: viram Negócio automaticamente no
  comercial (workflow "Funil diagnostico" atribui dono e cria o Negócio no
  pipeline). Também caem em listas próprias no HubSpot — `Quiz -
  Prioridade Alta` (list ID `354`) e `Quiz - Prioridade Média` (list ID
  `355`) — mas essas duas são só pra registro/acompanhamento, não entram
  na nutrição por e-mail, porque o comercial já está cuidando desses leads.
- **Baixa** prioridade e quem **abandona o quiz** não recebem dono nem
  Negócio — é esse público que a nutrição por e-mail cobre, e é dele que
  trata o resto deste documento.

## As duas listas a procurar no HubSpot (Contacts → Lists)

Já existem, não precisa criar nada. Filtro de cada uma, pra caso precise
conferir ou editar:

### `Quiz - Prioridade Baixa` (list ID `356`)

- **Quem entra**: terminou as 8 perguntas do quiz, mas ficou com
  prioridade Baixa (score < 35).
- **Como é populada**: automática — o workflow "Funil diagnostico" adiciona
  o contato aqui quando ele termina o quiz e sai como Baixa. Não é uma
  lista com filtro próprio, é alimentada por esse workflow.

### `Quiz Cidadania — Não terminou o quiz` (list ID `360`)

- **Quem entra**: preencheu a página de captura A/B/C, entrou no quiz, mas
  abandonou antes da última pergunta.
- **Filtro** (lista dinâmica, se atualiza sozinha):
  - Preencheu o formulário do quiz (`Quiz Cidadania Italiana - Respostas
    (quiz02)`, form GUID `44ad0787-1f00-4df5-9114-9a2624e36064`)
  - **E** a propriedade de contato `quiz_prioridade` (rótulo "Prioridade do
    quiz") ainda está **vazia/desconhecida**.
- Sai sozinha da lista se a pessoa voltar depois e terminar o quiz (a
  propriedade deixa de estar vazia).

⚠️ **Cuidado se for editar esse filtro**: usar só "prioridade do quiz
vazia", sem exigir também "preencheu o formulário do quiz", pega **qualquer
contato do CRM inteiro** que nunca passou por esse quiz (uma primeira
tentativa assim, sem o filtro de formulário, chegou a pegar 10.637
contatos — foi apagada antes de qualquer automação usar). O filtro de
formulário é o que restringe corretamente só a quem de fato entrou nesse
quiz.

**Recomendação pra não pegar quem ainda está respondendo**: adicionar mais
uma condição ao filtro — "Data de criação do contato" → "está a mais de" →
2 horas atrás (ou o período que fizer sentido). Não é obrigatório, mas
evita mandar e-mail de "você não terminou" pra alguém que só está no meio
das perguntas.

## Propriedades de contato relevantes (Contacts → escolher um contato → ver propriedades)

| Propriedade | O que é | Preenchida quando |
|---|---|---|
| `quiz_prioridade` | Alta / Média / Baixa | Só quando termina o quiz |
| `quiz_score` | Pontuação (0-95) | Só quando termina o quiz |
| `quiz_classificacao` | Grau 1 / Grau 2 | Só quando termina o quiz |
| `firstname`, `email`, `phone` | Dados básicos | Assim que entra no quiz (mesmo sem terminar) |
| `tem_antepassado_italiano`, `quiz02_grau_parentesco`, `voce_possui_algum_documento_da_familia_que_comprove_essa_origem`, `quiz02_interesse_cidadania`, `n6em_que_momento_voce_esta_em_relacao_a_cidadania_italiana`, `disponibilidade_investimento_cidadania`, `n5voce_pretende_incluir_familiares_no_processo`, `faixa_etaria_quiz_cidadania` | Respostas das 8 perguntas | Só quando termina o quiz |

Ou seja: pra personalizar e-mail por resposta do quiz, só dá pra usar na
lista `Quiz - Prioridade Baixa` (356) — quem está na lista `Não terminou o
quiz` (360) não tem nenhuma dessas propriedades preenchida, só nome/e-mail.
