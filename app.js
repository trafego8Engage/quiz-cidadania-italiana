const CONFIG = {
  grade1Min: 70,
  grade2Min: 30,
  redirects: {
    grade1: 'https://lp.gioppoeconti.com.br/obrigado-grau-1/',
    grade2: 'https://lp.gioppoeconti.com.br/obrigado-grau-2/'
  },
  // Preencha portalId e formGuid após criarmos/selecionarmos o formulário de integração no HubSpot.
  hubspot: { portalId: '', formGuid: '' },
  analysisDelayMs: 1800
};

const questions = [
  {id:'parentesco', title:'Qual é a sua relação com o italiano da sua família?', help:'Escolha a opção que melhor representa sua situação.', property:'n1_qual_o_grau_de_parentesco_entre_voce_e_o_italiano', options:[
    ['Pai ou mãe',20],['Avô ou avó',20],['Bisavô ou bisavó',20],['Trisavô ou gerações anteriores',15],['Cônjuge de cidadão italiano',15],['Sei que tenho ascendência italiana, mas não sei o grau',10],['Não tenho nenhum antepassado ou vínculo com italiano',-70]
  ]},
  {id:'documentos', title:'Você já possui documentos que comprovem sua origem italiana?', help:'Não ter os documentos ainda não impede o processo.', property:'voce_possui_algum_documento_da_familia_que_comprove_essa_origem', options:[
    ['Sim, já tenho vários documentos',15],['Tenho alguns documentos',12],['Ainda não tenho documentos',10],['Não sei quais documentos são necessários',8]
  ]},
  {id:'momento', title:'Em que momento você está em relação à cidadania italiana?', property:'n6em_que_momento_voce_esta_em_relacao_a_cidadania_italiana', options:[
    ['Já decidi e quero começar o quanto antes',20],['Já decidi e pretendo começar nos próximos meses',15],['Quero confirmar se tenho direito antes de decidir',10],['Ainda estou pesquisando e entendendo o processo',5],['Não tenho intenção de iniciar o processo',-50]
  ]},
  {id:'prazo', title:'Quando você pretende iniciar?', options:[
    ['Nos próximos 30 dias',15],['Entre 30 e 60 dias',12],['Entre 2 e 6 meses',8],['Ainda não tenho previsão',0]
  ]},
  {id:'investimento', title:'Como você se encontra em relação ao investimento inicial?', help:'Para começar o processo, considere um investimento inicial estimado em R$ 3.000.', options:[
    ['Tenho disponibilidade para iniciar',20],['Consigo me organizar para esse investimento',15],['Precisaria dividir o investimento com familiares',10],['Preciso de mais tempo para me organizar',0],['Não tenho condições de realizar esse investimento',-40]
  ]},
  {id:'familiares', title:'Você pretende incluir outras pessoas da família no processo?', property:'n5voce_pretende_incluir_familiares_no_processo', options:[
    ['Sim',15],['Talvez, ainda estou avaliando',8],['Não',0]
  ]},
  {id:'objetivo', title:'Qual é o seu principal objetivo com a cidadania italiana?', help:'Esta resposta nos ajuda a entender melhor o que você busca.', property:'qual_e_o_seu_principal_interesse_com_a_cidadania_italiana', score:false, options:[
    ['Morar ou trabalhar na Europa',0],['Estudar na Europa',0],['Criar oportunidades para meus filhos/família',0],['Ter mais mobilidade internacional',0],['Facilitar viagens',0],['Ainda estou pesquisando os benefícios',0]
  ]},
  {id:'idade', title:'Qual é a sua idade?', help:'Essa informação não altera sua pontuação.', score:false, options:[
    ['18 a 24 anos',0],['25 a 34 anos',0],['35 a 44 anos',0],['45 a 54 anos',0],['55 anos ou mais',0]
  ]}
];

let step = 0;
const answers = {};
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);

function render(){
  const q=questions[step];
  $('questionTitle').textContent=q.title;
  $('questionHelp').textContent=q.help||'';
  $('questionHelp').classList.toggle('hidden',!q.help);
  $('stepLabel').textContent=`Pergunta ${step+1} de ${questions.length}`;
  const pct=Math.round(((step+1)/questions.length)*100);
  $('progressPercent').textContent=`${pct}%`;
  $('progressFill').style.width=`${pct}%`;
  $('backButton').disabled=step===0;
  $('options').innerHTML='';
  q.options.forEach(([label,points])=>{
    const b=document.createElement('button');
    b.type='button'; b.className='option'; b.textContent=label;
    if(answers[q.id]?.label===label)b.classList.add('selected');
    b.onclick=()=>selectAnswer(q,label,points,b);
    $('options').appendChild(b);
  });
}

function selectAnswer(q,label,points,button){
  answers[q.id]={label,points:q.score===false?0:points,property:q.property||null};
  document.querySelectorAll('.option').forEach(el=>el.classList.remove('selected'));
  button.classList.add('selected');
  setTimeout(()=>{ if(step<questions.length-1){step++;render()}else finish(); },180);
}

$('backButton').onclick=()=>{if(step>0){step--;render()}};

function score(){return Object.values(answers).reduce((sum,a)=>sum+(a.points||0),0)}
function classification(total){return total>=CONFIG.grade1Min?'Grau 1':total>=CONFIG.grade2Min?'Grau 2':'Grau 3'}

function contactFields(){
  return {
    firstname: params.get('firstname')||'',
    email: params.get('email')||'',
    hs_whatsapp_phone_number: params.get('hs_whatsapp_phone_number')||params.get('phone')||''
  };
}

function trackingContext(){
  const hutk=document.cookie.split('; ').find(x=>x.startsWith('hubspotutk='))?.split('=')[1];
  return {hutk,pageUri:location.href,pageName:document.title};
}

async function submitHubSpot(total,grade){
  const {portalId,formGuid}=CONFIG.hubspot;
  if(!portalId||!formGuid){ console.warn('HubSpot ainda não configurado; submissão ignorada.'); return {skipped:true}; }
  const base={...contactFields()};
  const fields=Object.entries(base).filter(([,value])=>value).map(([name,value])=>({name,value}));
  Object.values(answers).forEach(a=>{if(a.property)fields.push({name:a.property,value:a.label})});
  // Propriedades abaixo devem existir e estar no formulário HubSpot antes de ativar a integração.
  fields.push({name:'quiz_score',value:String(total)},{name:'quiz_classificacao',value:grade});
  const payload={fields,context:trackingContext()};
  const url=`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!res.ok)throw new Error(`HubSpot respondeu ${res.status}`);
  return res.json().catch(()=>({ok:true}));
}

function preserveParams(target,total,grade){
  const url=new URL(target);
  params.forEach((v,k)=>url.searchParams.set(k,v));
  url.searchParams.set('quiz_score',String(total));
  url.searchParams.set('quiz_classificacao',grade);
  return url.toString();
}

async function finish(){
  const total=score(), grade=classification(total);
  $('quizView').classList.add('hidden'); $('analysisView').classList.remove('hidden');
  try{await submitHubSpot(total,grade)}catch(err){console.error(err);sessionStorage.setItem('quiz_hubspot_error',String(err));}
  sessionStorage.setItem('quiz_result',JSON.stringify({total,grade,answers}));
  const target=grade==='Grau 1'?CONFIG.redirects.grade1:CONFIG.redirects.grade2;
  setTimeout(()=>location.assign(preserveParams(target,total,grade)),CONFIG.analysisDelayMs);
}

render();
