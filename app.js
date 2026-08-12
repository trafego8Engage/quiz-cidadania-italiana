const CONFIG = {
  thresholds: { high: 60, medium: 35 },
  redirects: {
    grade1: 'https://lp.gioppoeconti.com.br/obrigado-grau-1/',
    grade2: 'https://lp.gioppoeconti.com.br/obrigado-grau-2/'
  },
  hubspot: { portalId: '', formGuid: '' },
  analysisDelayMs: 1600
};

/*
  Alta: 60+
  Média: 35–59
  Baixa: <35
  Alta + Média -> Grau 1
  Baixa -> Grau 2
  Sem pontos negativos
  P4 múltipla, até 5 seleções / máximo 5 pontos
  Score máximo: 95
*/

const questions = [
  {
    id:'origem',
    title:'Você tem algum antepassado italiano na família?',
    help:'Escolha a opção que melhor representa o que você sabe hoje.',
    property:'tem_antepassado_italiano',
    options:[
      ['Sim, tenho certeza',15],
      ['Acho que sim',10],
      ['Não tenho certeza',5]
    ]
  },
  {
    id:'parentesco',
    title:'Qual era o grau de parentesco desse antepassado italiano?',
    help:'Se você ainda não souber exatamente, pode marcar a última opção.',
    property:'n1_qual_o_grau_de_parentesco_entre_voce_e_o_italiano',
    options:[
      ['Pai ou mãe',15],
      ['Avô ou avó',15],
      ['Bisavô ou bisavó',15],
      ['Tataravô ou gerações anteriores',10],
      ['Não tenho certeza',5]
    ]
  },
  {
    id:'documentos',
    title:'Você possui algum documento da família que comprove essa origem?',
    help:'Não ter todos os documentos agora não impede a análise inicial.',
    property:'voce_possui_algum_documento_da_familia_que_comprove_essa_origem',
    options:[
      ['Sim, vários documentos',15],
      ['Tenho alguns documentos',10],
      ['Ainda não tenho os documentos',5],
      ['Não sei quais documentos são necessários',3]
    ]
  },
  {
    id:'objetivos',
    title:'O que você busca com a cidadania italiana?',
    help:'Você pode escolher até 5 opções.',
    property:'qual_e_o_seu_principal_interesse_com_a_cidadania_italiana',
    type:'multi',
    maxSelections:5,
    maxPoints:5,
    options:[
      ['Morar ou trabalhar na Europa',1],
      ['Estudar na Europa',1],
      ['Criar oportunidades para meus filhos ou família',1],
      ['Ter mais mobilidade internacional',1],
      ['Facilitar viagens',1],
      ['Planejamento patrimonial ou familiar',1],
      ['Ainda estou pesquisando os benefícios',1]
    ]
  },
  {
    id:'momento',
    title:'Em que momento você está em relação à cidadania italiana?',
    property:'n6em_que_momento_voce_esta_em_relacao_a_cidadania_italiana',
    options:[
      ['Já decidi e quero começar o quanto antes',20],
      ['Já decidi e pretendo começar nos próximos meses',15],
      ['Quero confirmar se tenho direito antes de decidir',10],
      ['Ainda estou pesquisando e entendendo o processo',5],
      ['Ainda não pretendo iniciar',0]
    ]
  },
  {
    id:'investimento',
    title:'Como você se encontra em relação ao investimento inicial?',
    help:'Considere um investimento inicial aproximado de R$ 3.000 para iniciar o processo.',
    property:'disponibilidade_investimento_cidadania',
    options:[
      ['Tenho disponibilidade para iniciar',15],
      ['Consigo me organizar para esse investimento',12],
      ['Pretendo dividir o investimento com familiares',8],
      ['Preciso de mais tempo para me organizar',3],
      ['Neste momento não consigo realizar esse investimento',0]
    ]
  },
  {
    id:'familiares',
    title:'Você pretende incluir outras pessoas da família no processo?',
    property:'n5voce_pretende_incluir_familiares_no_processo',
    options:[
      ['Sim',10],
      ['Talvez, ainda estou avaliando',5],
      ['Não',0]
    ]
  },
  {
    id:'idade',
    title:'Qual é a sua idade?',
    help:'Essa informação não altera sua pontuação.',
    property:'faixa_etaria_quiz_cidadania',
    score:false,
    options:[
      ['18 a 24 anos',0],
      ['25 a 34 anos',0],
      ['35 a 44 anos',0],
      ['45 a 54 anos',0],
      ['55 anos ou mais',0]
    ]
  }
];

let step = 0;
const answers = {};
const params = new URLSearchParams(location.search);
const $ = id => document.getElementById(id);

function render(){
  const q = questions[step];
  $('questionTitle').textContent = q.title;
  $('questionHelp').textContent = q.help || '';
  $('questionHelp').classList.toggle('hidden', !q.help);
  $('stepLabel').textContent = `Pergunta ${step+1} de ${questions.length}`;
  const pct = Math.round(((step+1)/questions.length)*100);
  $('progressPercent').textContent = `${pct}%`;
  $('progressFill').style.width = `${pct}%`;
  $('backButton').disabled = step === 0;
  $('options').innerHTML = '';
  $('multiControls').classList.toggle('hidden', q.type !== 'multi');
  q.type === 'multi' ? renderMulti(q) : renderSingle(q);
}

function renderSingle(q){
  q.options.forEach(([label,points])=>{
    const b = document.createElement('button');
    b.type='button';
    b.className='option';
    b.textContent=label;
    if(answers[q.id]?.label===label) b.classList.add('selected');
    b.onclick=()=>{
      answers[q.id]={label,points:q.score===false?0:points,property:q.property||null};
      document.querySelectorAll('.option').forEach(el=>el.classList.remove('selected'));
      b.classList.add('selected');
      setTimeout(advance,170);
    };
    $('options').appendChild(b);
  });
}

function renderMulti(q){
  const selected = answers[q.id]?.values || [];
  $('multiHint').textContent = `Selecionadas: ${selected.length} de ${q.maxSelections}`;
  $('nextButton').disabled = selected.length===0;

  q.options.forEach(([label,points])=>{
    const b = document.createElement('button');
    b.type='button';
    b.className='option multi';
    b.textContent=label;
    if(selected.some(item=>item.label===label)) b.classList.add('selected');

    b.onclick=()=>{
      const current = answers[q.id]?.values ? [...answers[q.id].values] : [];
      const idx = current.findIndex(item=>item.label===label);
      if(idx>=0) current.splice(idx,1);
      else if(current.length<q.maxSelections) current.push({label,points});

      answers[q.id]={
        values:current,
        label:current.map(item=>item.label).join('; '),
        points:Math.min(q.maxPoints,current.reduce((sum,item)=>sum+item.points,0)),
        property:q.property||null
      };
      render();
    };
    $('options').appendChild(b);
  });
}

function advance(){
  if(step<questions.length-1){ step++; render(); }
  else finish();
}

$('nextButton').onclick=advance;
$('backButton').onclick=()=>{ if(step>0){ step--; render(); } };

function score(){
  return Object.values(answers).reduce((sum,a)=>sum+Number(a.points||0),0);
}

function priority(total){
  if(total>=CONFIG.thresholds.high) return 'Alta';
  if(total>=CONFIG.thresholds.medium) return 'Média';
  return 'Baixa';
}

function destination(priorityName){
  return priorityName==='Baixa' ? 'Grau 2' : 'Grau 1';
}

function contactFields(){
  return {
    firstname:params.get('firstname')||'',
    lastname:params.get('lastname')||'',
    email:params.get('email')||'',
    phone:params.get('hs_whatsapp_phone_number')||params.get('phone')||''
  };
}

function trackingContext(){
  const hutk = document.cookie.split('; ').find(x=>x.startsWith('hubspotutk='))?.split('=')[1];
  const context={pageUri:location.href,pageName:document.title};
  if(hutk) context.hutk=hutk;
  return context;
}

async function submitHubSpot(total,priorityName,grade){
  const {portalId,formGuid}=CONFIG.hubspot;
  if(!portalId||!formGuid){
    console.warn('HubSpot ainda não configurado; submissão ignorada.');
    return {skipped:true};
  }

  const fields=Object.entries(contactFields())
    .filter(([,value])=>value)
    .map(([name,value])=>({name,value}));

  Object.values(answers).forEach(a=>{
    if(a.property&&a.label) fields.push({name:a.property,value:a.label});
  });

  fields.push(
    {name:'quiz_score',value:String(total)},
    {name:'quiz_prioridade',value:priorityName},
    {name:'quiz_classificacao',value:grade}
  );

  const url=`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
  const res=await fetch(url,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({fields,context:trackingContext()})
  });

  if(!res.ok) throw new Error(`HubSpot respondeu ${res.status}`);
  return res.json().catch(()=>({ok:true}));
}

function preserveParams(target,total,priorityName,grade){
  const url=new URL(target);
  params.forEach((v,k)=>url.searchParams.set(k,v));
  url.searchParams.set('quiz_score',String(total));
  url.searchParams.set('quiz_prioridade',priorityName);
  url.searchParams.set('quiz_classificacao',grade);
  return url.toString();
}

async function finish(){
  const total=score();
  const priorityName=priority(total);
  const grade=destination(priorityName);

  $('quizView').classList.add('hidden');
  $('analysisView').classList.remove('hidden');

  sessionStorage.setItem('quiz_result',JSON.stringify({
    total,
    priority:priorityName,
    grade,
    answers
  }));

  try{
    await submitHubSpot(total,priorityName,grade);
  }catch(err){
    console.error(err);
    sessionStorage.setItem('quiz_hubspot_error',String(err));
  }

  const target=grade==='Grau 1'?CONFIG.redirects.grade1:CONFIG.redirects.grade2;
  setTimeout(()=>{
    location.assign(preserveParams(target,total,priorityName,grade));
  },CONFIG.analysisDelayMs);
}

render();
