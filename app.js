const CONFIG = {
  thresholds: { high: 60, medium: 35 },
  redirects: {
    grade1: 'https://lp.gioppoeconti.com.br/obrigado-grau-1/',
    grade2: 'https://lp.gioppoeconti.com.br/obrigado-grau-2/'
  },
  hubspot: { portalId: '51117535', formGuid: '44ad0787-1f00-4df5-9114-9a2624e36064' },
  transitionMs: 220,
  feedbackMs: 5500,
  analysisMs: 4200,
  redirectSeconds: 15
};

const ICONS = {
  origem:'<svg viewBox="0 0 24 24"><path d="M6 3v18"/><path d="M6 4h11l-2.5 3.5L17 11H6"/></svg>',
  parentesco:'<svg viewBox="0 0 24 24"><circle cx="12" cy="5.5" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 7.5v4M12 11.5l-5 3.7M12 11.5l5 3.7"/></svg>',
  documentos:'<svg viewBox="0 0 24 24"><path d="M8 3h6l4 4v14H8z"/><path d="M14 3v4h4"/><path d="M10.5 12h5M10.5 15h5M10.5 9h2.5"/></svg>',
  objetivos:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2l-1.7 4.4-4.4 1.7 1.7-4.4z"/></svg>',
  momento:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/></svg>',
  investimento:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.2"/></svg>',
  familiares:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="2.6"/><circle cx="16" cy="9.5" r="2.2"/><path d="M4.5 18c0-2.9 2.1-4.7 4.5-4.7s4.5 1.8 4.5 4.7"/><path d="M13.8 14.2c1.9.3 3.2 1.8 3.2 3.8"/></svg>',
  idade:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.2"/><path d="M5.5 19c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/></svg>'
};

const CONCLUSION_ICONS = {
  alta:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M9 12.4l2.1 2.1L15.5 10"/></svg>',
  media:'<svg viewBox="0 0 24 24"><circle cx="10.3" cy="10.3" r="6.1"/><path d="M14.9 14.9l4.8 4.8"/></svg>',
  baixa:'<svg viewBox="0 0 24 24"><path d="M9 4.5L4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z"/><path d="M9 4.5v13M15 6.5v13"/></svg>'
};

const CONCLUSIONS = {
  alta:{
    headline:name=>`${name}, seu cenário indica um bom momento para avançar.`,
    headlineGeneric:'Seu cenário indica um bom momento para avançar.',
    subheadline:'Pelas suas respostas, você reúne importantes sinais de potencial para seguir para uma análise mais detalhada da sua cidadania italiana. Agora, o próximo passo é confirmar os detalhes do seu caso e entender qual caminho faz mais sentido para você e sua família.',
    diagnosis:[
      {mark:'check',text:'Existe vínculo familiar informado'},
      {mark:'check',text:'Há intenção de avançar no processo'},
      {mark:'check',text:'Seu momento indica boa possibilidade de continuidade'},
      {mark:'check',text:'Você demonstrou condições para dar os próximos passos'}
    ],
    result:'Resultado: seu perfil está entre os que merecem uma análise prioritária.',
    tensionTitle:'Você está em um bom ponto. Agora os detalhes fazem diferença.',
    tensionText:'Mesmo em casos aparentemente favoráveis, detalhes como linha de descendência, datas, documentos, registros e estratégia do processo podem alterar o caminho necessário. Por isso, antes de iniciar ou investir no processo, vale confirmar tecnicamente essas informações.',
    ctaTitle:'Converse com um especialista da Gioppo & Conti',
    ctaText:'Nossa equipe vai analisar as informações iniciais do seu caso, esclarecer os próximos passos e indicar o caminho mais adequado.',
    ctaButtonLabel:'Quero confirmar meu caso agora',
    finalMessage:'Você já deu o primeiro passo. Agora é hora de transformar informações iniciais em uma análise concreta do seu caso.'
  },
  media:{
    headline:name=>`${name}, você está no caminho — mas alguns pontos ainda precisam ser esclarecidos.`,
    headlineGeneric:'Você está no caminho — mas alguns pontos ainda precisam ser esclarecidos.',
    subheadline:'Suas respostas mostram que há elementos importantes para continuar investigando sua cidadania italiana, mas alguns detalhes ainda precisam ser confirmados antes de definir o melhor caminho. E é justamente nessa etapa que uma análise especializada pode evitar decisões baseadas em informações incompletas.',
    diagnosis:[
      {mark:'check',text:'Existem sinais que justificam continuar a análise'},
      {mark:'check',text:'Seu caso ainda pode apresentar boas possibilidades'},
      {mark:'warn',text:'Há informações que precisam ser confirmadas'},
      {mark:'warn',text:'O próximo passo depende de entender melhor alguns detalhes'}
    ],
    result:'Resultado: o que separa um caso possível de uma dúvida costuma ser pouca coisa a esclarecer.',
    tensionTitle:'Um detalhe pode mudar o caminho do processo.',
    tensionText:'Não ter todos os documentos, não conhecer exatamente a linha familiar ou ainda estar organizando o investimento não significa que você não possa avançar. Por outro lado, seguir sem entender esses pontos pode gerar busca desnecessária de documentos, escolha de um caminho inadequado, atrasos, custos que poderiam ser evitados e expectativas incorretas sobre o processo.',
    extra:{
      title:'Talvez falte menos do que parece.',
      text:'Em muitos casos, o que separa uma dúvida de um processo possível é simplesmente descobrir qual informação precisa ser encontrada primeiro. A Gioppo & Conti pode ajudar a identificar isso.'
    },
    ctaTitle:'Descubra o que ainda falta no seu caso',
    ctaText:'Nossa equipe vai te ajudar a entender quais pontos precisam ser esclarecidos e quais podem ser os próximos passos.',
    ctaButtonLabel:'Quero esclarecer meu caso agora',
    finalMessage:'Seu diagnóstico não terminou em um "sim" ou "não". Ele mostrou onde precisamos olhar com mais atenção.'
  },
  baixa:{
    headline:name=>`${name}, neste momento ainda faltam informações para indicar um caminho claro.`,
    headlineGeneric:'Neste momento, ainda faltam informações para indicar um caminho claro.',
    subheadline:'Pelas respostas do seu diagnóstico, ainda existem pontos importantes que precisam ser esclarecidos ou desenvolvidos antes de pensar nos próximos passos da cidadania italiana. Isso não significa necessariamente que todas as possibilidades estejam encerradas — significa que, neste momento, precisamos começar por uma etapa anterior.',
    diagnosis:[
      {mark:'warn',text:'Existem informações fundamentais ainda não confirmadas'},
      {mark:'warn',text:'Seu momento atual pode exigir preparação antes de avançar'},
      {mark:'warn',text:'É importante entender primeiro quais possibilidades realmente existem'}
    ],
    result:'Resultado: o primeiro passo pode ser simplesmente entender melhor o seu cenário.',
    tensionTitle:'O primeiro passo pode ser simplesmente entender melhor o seu cenário.',
    tensionText:'Talvez seja necessário investigar a origem familiar, localizar informações, compreender os requisitos ou se preparar melhor antes de iniciar qualquer processo. O importante é não tomar uma decisão baseada apenas em suposições.',
    ctaTitle:'Quer entender melhor por onde começar?',
    ctaText:'Preparamos informações para ajudar você a compreender os primeiros passos e identificar o que precisa descobrir antes de avançar.',
    ctaButtonLabel:'Quero entender meus próximos passos',
    finalMessage:'Nem todo processo começa com documentos prontos ou todas as respostas. Às vezes, o primeiro passo é descobrir quais perguntas precisam ser respondidas.'
  }
};

const FEEDBACK = {
  documentos: {
    title: 'Tudo certo.',
    text: 'Mesmo que você ainda não tenha todos os documentos, existem formas de localizar os registros necessários.'
  },
  familiares: {
    title: 'Interessante.',
    text: 'Em alguns casos, realizar o processo em família pode ajudar a compartilhar parte dos custos.'
  },
  idade: {
    title: 'Perfeito, já temos o que precisamos.',
    text: 'Com base em tudo que você respondeu, vamos preparar agora o seu diagnóstico personalizado.'
  }
};

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
    property:'quiz02_grau_parentesco',
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
    property:'quiz02_interesse_cidadania',
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
    title:'Como você se encontra hoje em relação a esse investimento?',
    property:'disponibilidade_investimento_cidadania',
    options:[
      ['Tenho disponibilidade para iniciar',15],
      ['Consigo me organizar',12],
      ['Posso dividir com familiares',8],
      ['Preciso de mais tempo',3],
      ['Não tenho condições no momento',0]
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
  $('stepLabel').textContent = `Passo ${step+1} de ${questions.length}`;
  const pct = Math.round(((step+1)/questions.length)*100);
  $('progressFill').style.width = `${pct}%`;
  $('iconBox').innerHTML = ICONS[q.id] || '';
  $('questionTitle').textContent = q.title;
  $('questionHelp').textContent = q.help || '';
  $('questionHelp').classList.toggle('hidden', !q.help);
  $('investHighlight').classList.toggle('hidden', q.id !== 'investimento');
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
    b.innerHTML = `<span class="check">✓</span><span>${label}</span>`;
    if(answers[q.id]?.label===label) b.classList.add('selected');
    b.onclick=()=>{
      answers[q.id]={label,points:q.score===false?0:points,property:q.property||null};
      document.querySelectorAll('.option').forEach(el=>el.classList.remove('selected'));
      b.classList.add('selected');
      setTimeout(advance,300);
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

function goToStep(newStep,direction){
  const wrap = $('questionWrap');
  wrap.classList.remove('is-visible');
  wrap.classList.add(direction==='forward' ? 'is-exit' : 'is-exit-reverse');
  setTimeout(()=>{
    step = newStep;
    render();
    wrap.classList.remove('is-exit','is-exit-reverse');
    wrap.classList.add(direction==='forward' ? 'is-enter' : 'is-enter-reverse');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      wrap.classList.remove('is-enter','is-enter-reverse');
      wrap.classList.add('is-visible');
    }));
  },CONFIG.transitionMs);
}

function showFeedback(afterId,nextStepIndex){
  const content = FEEDBACK[afterId];
  $('feedbackTitle').textContent = content.title;
  $('feedbackText').textContent = content.text;
  $('quizView').classList.add('hidden');
  $('feedbackView').classList.remove('hidden');
  setTimeout(()=>{
    $('feedbackView').classList.add('hidden');
    $('quizView').classList.remove('hidden');
    if(nextStepIndex>=questions.length){ finish(); return; }
    step = nextStepIndex;
    const wrap = $('questionWrap');
    wrap.classList.remove('is-visible');
    wrap.classList.add('is-enter');
    render();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      wrap.classList.remove('is-enter');
      wrap.classList.add('is-visible');
    }));
  },CONFIG.feedbackMs);
}

function advance(){
  const currentId = questions[step].id;
  const isLast = step === questions.length-1;
  if(FEEDBACK[currentId]){ showFeedback(currentId,step+1); return; }
  if(isLast){ finish(); return; }
  goToStep(step+1,'forward');
}

$('nextButton').onclick=advance;
$('backButton').onclick=()=>{ if(step>0) goToStep(step-1,'back'); };

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

function conclusionKey(priorityName){
  if(priorityName==='Alta') return 'alta';
  if(priorityName==='Média') return 'media';
  return 'baixa';
}

function dynamicInsights(){
  const insights=[];
  const doc=answers.documentos?.label;
  if(doc==='Ainda não tenho os documentos'||doc==='Não sei quais documentos são necessários'){
    insights.push({mark:'warn',text:'Documentação ainda não localizada — isso não encerra a possibilidade de avançar. A localização de documentos pode fazer parte das próximas etapas.'});
  }
  const fam=answers.familiares?.label;
  if(fam==='Sim'||fam==='Talvez, ainda estou avaliando'){
    insights.push({mark:'check',text:'Processo em família — você informou que outras pessoas podem participar. Isso é importante para a análise da estratégia e dos custos envolvidos.'});
  }
  const momento=answers.momento?.label;
  if(momento==='Já decidi e quero começar o quanto antes'){
    insights.push({mark:'check',text:'Momento de decisão próximo — como você pretende avançar em breve, vale esclarecer os pontos técnicos antes de tomar decisões.'});
  }
  return insights.slice(0,2);
}

let redirectInterval = null;
let conclusionContext = null;

function redirectToDestination(total,priorityName,grade){
  const target = grade==='Grau 1' ? CONFIG.redirects.grade1 : CONFIG.redirects.grade2;
  location.assign(preserveParams(target,total,priorityName,grade));
}

function startRedirectCountdown(total,priorityName,grade){
  let remaining = CONFIG.redirectSeconds;
  $('countdownSeconds').textContent = remaining;
  $('redirectProgressFill').style.width = '0%';
  requestAnimationFrame(()=>{
    $('redirectProgressFill').style.transition = `width ${CONFIG.redirectSeconds*1000}ms linear`;
    $('redirectProgressFill').style.width = '100%';
  });
  redirectInterval = setInterval(()=>{
    remaining -= 1;
    $('countdownSeconds').textContent = Math.max(remaining,0);
    if(remaining<=0){
      clearInterval(redirectInterval);
      redirectToDestination(total,priorityName,grade);
    }
  },1000);
}

$('conclusionCtaButton').onclick=()=>{
  if(redirectInterval) clearInterval(redirectInterval);
  if(conclusionContext) redirectToDestination(conclusionContext.total,conclusionContext.priorityName,conclusionContext.grade);
};

function showConclusion(total,priorityName,grade,options={}){
  const key = conclusionKey(priorityName);
  const data = CONCLUSIONS[key];
  const firstname = params.get('firstname')||'';
  conclusionContext = {total,priorityName,grade};

  $('stepLabel').textContent = 'Diagnóstico concluído';
  $('analysisView').classList.add('hidden');
  $('conclusionView').classList.remove('hidden');

  $('conclusionIcon').innerHTML = CONCLUSION_ICONS[key];
  $('conclusionHeadline').textContent = firstname ? data.headline(firstname) : data.headlineGeneric;
  $('conclusionSubheadline').textContent = data.subheadline;

  const list = $('diagnosisList');
  list.innerHTML='';
  [...data.diagnosis, ...dynamicInsights()].forEach(item=>{
    const li = document.createElement('li');
    li.className='diagnosis-item';
    li.innerHTML = `<span class="mark">${item.mark==='warn'?'!':'✓'}</span><span>${item.text}</span>`;
    list.appendChild(li);
  });
  $('diagnosisResult').textContent = data.result;

  $('tensionTitle').textContent = data.tensionTitle;
  $('tensionText').textContent = data.tensionText;

  if(data.extra){
    $('extraBlock').classList.remove('hidden');
    $('extraTitle').textContent = data.extra.title;
    $('extraText').textContent = data.extra.text;
  }else{
    $('extraBlock').classList.add('hidden');
  }

  $('ctaTitle').textContent = data.ctaTitle;
  $('ctaText').textContent = data.ctaText;
  $('conclusionCtaButton').textContent = data.ctaButtonLabel;

  $('conclusionFinal').textContent = data.finalMessage;

  $('redirectCountdown').classList.toggle('hidden', !!options.preview);
  if(!options.preview){
    startRedirectCountdown(total,priorityName,grade);
  }
}

function runAnalysisSequence(){
  const items = document.querySelectorAll('#analysisChecklist .check-item');
  const stepDelay = CONFIG.analysisMs/(items.length+1);
  items.forEach((item,i)=>{
    setTimeout(()=>item.classList.add('visible'),stepDelay*(i+1));
  });
  $('analysisProgressFill').style.width='0%';
  requestAnimationFrame(()=>{
    $('analysisProgressFill').style.transition=`width ${CONFIG.analysisMs}ms linear`;
    $('analysisProgressFill').style.width='100%';
  });
}

async function finish(){
  const total=score();
  const priorityName=priority(total);
  const grade=destination(priorityName);

  $('quizView').classList.add('hidden');
  $('feedbackView').classList.add('hidden');
  $('analysisView').classList.remove('hidden');
  runAnalysisSequence();

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

  setTimeout(()=>{
    showConclusion(total,priorityName,grade);
  },CONFIG.analysisMs);
}

// Modo preview: URLs provisórias pra o time de copy revisar as 3 telas de
// conclusão direto, sem precisar responder o quiz inteiro. Detecta via
// ?preview=alta|media|baixa (funciona em qualquer host) ou via path
// /diagnostico-alta|media|baixa (funciona no Vercel, ver vercel.json).
function getPreviewKey(){
  const fromQuery = params.get('preview');
  if(fromQuery && CONCLUSIONS[fromQuery]) return fromQuery;
  const path = location.pathname.toLowerCase();
  if(path.includes('diagnostico-alta')) return 'alta';
  if(path.includes('diagnostico-media')) return 'media';
  if(path.includes('diagnostico-baixa')) return 'baixa';
  return null;
}

function startPreview(key){
  const priorityName = key==='alta' ? 'Alta' : key==='media' ? 'Média' : 'Baixa';
  const grade = destination(priorityName);
  const fakeTotal = key==='alta' ? 70 : key==='media' ? 45 : 20;
  $('quizView').classList.add('hidden');
  $('progressFill').style.width = '100%';
  showConclusion(fakeTotal,priorityName,grade,{preview:true});
}

const previewKey = getPreviewKey();
if(previewKey){
  startPreview(previewKey);
}else{
  render();
}
