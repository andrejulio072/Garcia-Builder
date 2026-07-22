(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GB_STARTER_I18N = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const SUPPORTED = ['en', 'pt', 'es'];
  const UI = {
    en: {
      pageTitle: 'Free Fitness Assessment | Garcia Builder Fitness',
      resultPageTitle: 'Your Starter Fitness Plan | Garcia Builder Fitness',
      metaDescription: 'Complete a free 60-second fitness assessment and get a recommended starting plan from Garcia Builder Fitness.',
      skipAssessment: 'Skip to assessment', languageLabel: 'Language',
      heroEyebrow: 'FREE 60-SECOND FITNESS ASSESSMENT',
      heroTitle: 'Find the Right Starting Plan for Your Goal',
      heroCopy: 'Answer a few quick questions about your goal, training routine and biggest challenge. You’ll receive a recommended nutrition and workout starting point, with the option to discuss a fully tailored plan with Andre.',
      heroCta: 'Build My Starter Plan', heroNote: 'Free assessment. No commitment.',
      packagesCta: 'See Packages', contactAndreCta: 'Contact Andre',
      packagesChoiceTitle: 'Package information', packagesChoiceCopy: 'Compare coaching options before filling anything in.',
      contactChoiceTitle: 'Contact Andre directly', contactChoiceCopy: 'Use WhatsApp, Instagram, email or book a consultation.',
      heroTrust: 'Created by Andre Garcia, Personal Trainer & Online Coach',
      trustOne: '7 focused questions', trustTwo: 'Instant starter plan', trustThree: 'Workout + nutrition by email',
      disclaimer: 'This assessment provides general educational guidance and is not a medical assessment or an individually prescribed programme.',
      questionProgress: 'Question {current} of {total}', contactProgress: 'Contact details',
      contactTitle: 'Your Recommended Starting Plan Is Ready',
      contactCopy: 'Enter your details to view your result and receive your resources by email.',
      firstName: 'First name', email: 'Email', whatsapp: 'WhatsApp number', optional: 'optional',
      whatsappHelp: 'Add your WhatsApp number only if you would like Andre to contact you about your result.',
      ageConsent: 'I confirm I am 18 or older.',
      deliveryConsent: 'I agree to receive my assessment result and the resources I requested.',
      marketingEmail: 'I would like to receive occasional fitness guidance, coaching information and offers from Garcia Builder Fitness by email.',
      marketingWhatsapp: 'I would like to receive occasional coaching information and follow-up messages from Garcia Builder Fitness by WhatsApp.',
      legalBefore: 'By submitting, you can view your result and receive the resources you requested. See the',
      privacy: 'Privacy Policy', and: 'and', terms: 'Terms', back: 'Back', viewResult: 'View My Result',
      preparing: 'Preparing result…', chooseAnswer: 'Choose an answer to continue.',
      enterName: 'Enter your first name.', validEmail: 'Enter a valid email address.',
      validWhatsapp: 'Enter WhatsApp in international format, for example +353871234567.',
      confirmAge: 'Confirm you are 18 or older.', confirmDelivery: 'Confirm you want to receive your result and requested resources.',
      submitUnavailable: 'Unable to submit the assessment right now.',
      localApi: 'Local preview cannot reach the assessment API. Use Vercel dev or a deploy preview to submit the form.',
      resultTitleLoading: 'Loading your result…', resultSummaryLoading: 'Please wait while we open your recommended starting plan.', resultStillLoading: 'Still building your plan. This can take a few seconds after submission.',
      resultEyebrow: 'YOUR STARTER ASSESSMENT RESULT', skipResult: 'Skip to result',
      recommendedNextStep: 'Recommended next step',
      resultHelpTitle: 'Your answers suggest that structure and accountability may be more valuable than another generic plan.',
      resultHelpCopy: 'A tailored Garcia Builder coaching plan can be built around your schedule, training environment, experience, nutrition preferences and specific goal.',
      emailSent: 'Email sent. A copy of this workout and nutrition plan is on its way. Check your spam or promotions folder if it does not arrive within a few minutes.',
      emailNotSent: 'Your plan is ready on this page, but we could not confirm email delivery. Save or print this plan so you can keep it.',
      resultHeading: 'Your Best Starting Path: {title}', planDefault: 'Your Practical Starter Plan',
      planGoalDefault: 'Use this as your first-week structure before making advanced changes.',
      trainingWeek: 'Training this week: {title}', nutritionTargets: 'Macro targets: {title}',
      calculateMacros: 'Calculate exact macro targets', workoutLibrary: 'Open workout exercise library',
      eatingDay: 'Simple day of eating', shoppingList: 'Starter shopping list', nextDays: 'Next 7 days',
      included: 'Included in your starter plan above', openResource: 'Open Resource',
      downloadGuide: 'Download My 28-Day Kickstart', messageAndre: 'Message Andre on WhatsApp',
      bookConsultation: 'Book a Consultation', emailAndre: 'Email Andre', visitSite: 'Visit Garcia Builder Fitness',
      helpPlanTitle: 'Want help turning this into a real plan?',
      helpPlanCopy: 'Use the contact options below if you want Andre to review your goal, training schedule and nutrition starting point.',
      resultLoadErrorTitle: 'We could not open this result link', resultNotFound: 'Please complete the assessment again to generate a fresh result.'
    },
    pt: {
      pageTitle: 'Avaliação Fitness Gratuita | Garcia Builder Fitness',
      resultPageTitle: 'Seu Plano Fitness Inicial | Garcia Builder Fitness',
      metaDescription: 'Complete uma avaliação fitness gratuita de 60 segundos e receba um plano inicial recomendado pela Garcia Builder Fitness.',
      skipAssessment: 'Ir para a avaliação', languageLabel: 'Idioma',
      heroEyebrow: 'AVALIAÇÃO FITNESS GRATUITA DE 60 SEGUNDOS',
      heroTitle: 'Encontre o Plano Inicial Certo para o Seu Objetivo',
      heroCopy: 'Responda a algumas perguntas rápidas sobre o seu objetivo, rotina de treino e maior dificuldade. Você receberá um ponto de partida recomendado para treino e nutrição, com a opção de conversar com Andre sobre um plano totalmente personalizado.',
      heroCta: 'Criar Meu Plano Inicial', heroNote: 'Avaliação gratuita. Sem compromisso.',
      packagesCta: 'Ver Pacotes', contactAndreCta: 'Contactar Andre',
      packagesChoiceTitle: 'Informações dos pacotes', packagesChoiceCopy: 'Compare as opções de coaching antes de preencher qualquer coisa.',
      contactChoiceTitle: 'Contactar Andre diretamente', contactChoiceCopy: 'Use WhatsApp, Instagram, email ou agende uma consulta.',
      heroTrust: 'Criado por Andre Garcia, Personal Trainer e Coach Online',
      trustOne: '7 perguntas objetivas', trustTwo: 'Plano inicial imediato', trustThree: 'Treino + nutrição por email',
      disclaimer: 'Esta avaliação oferece orientação educativa geral e não é uma avaliação médica nem um programa prescrito individualmente.',
      questionProgress: 'Pergunta {current} de {total}', contactProgress: 'Dados de contacto',
      contactTitle: 'Seu Plano Inicial Recomendado Está Pronto',
      contactCopy: 'Informe os seus dados para ver o resultado e receber os recursos por email.',
      firstName: 'Primeiro nome', email: 'Email', whatsapp: 'Número de WhatsApp', optional: 'opcional',
      whatsappHelp: 'Adicione o WhatsApp apenas se quiser que Andre entre em contacto sobre o seu resultado.',
      ageConsent: 'Confirmo que tenho 18 anos ou mais.',
      deliveryConsent: 'Concordo em receber o resultado da avaliação e os recursos solicitados.',
      marketingEmail: 'Gostaria de receber ocasionalmente orientações fitness, informações sobre coaching e ofertas da Garcia Builder Fitness por email.',
      marketingWhatsapp: 'Gostaria de receber ocasionalmente informações sobre coaching e mensagens de acompanhamento por WhatsApp.',
      legalBefore: 'Ao enviar, você poderá ver o resultado e receber os recursos solicitados. Consulte a',
      privacy: 'Política de Privacidade', and: 'e os', terms: 'Termos', back: 'Voltar', viewResult: 'Ver Meu Resultado',
      preparing: 'Preparando resultado…', chooseAnswer: 'Escolha uma resposta para continuar.',
      enterName: 'Informe o seu primeiro nome.', validEmail: 'Informe um endereço de email válido.',
      validWhatsapp: 'Informe o WhatsApp no formato internacional, por exemplo +353871234567.',
      confirmAge: 'Confirme que você tem 18 anos ou mais.', confirmDelivery: 'Confirme que deseja receber o resultado e os recursos solicitados.',
      submitUnavailable: 'Não foi possível enviar a avaliação agora.',
      localApi: 'A pré-visualização local não consegue aceder à API da avaliação. Use o Vercel dev ou um preview publicado.',
      resultTitleLoading: 'Carregando seu resultado…', resultSummaryLoading: 'Aguarde enquanto abrimos o seu plano inicial recomendado.', resultStillLoading: 'Ainda estamos preparando o seu plano. Isto pode demorar alguns segundos após o envio.',
      resultEyebrow: 'RESULTADO DA SUA AVALIAÇÃO INICIAL', skipResult: 'Ir para o resultado',
      recommendedNextStep: 'Próximo passo recomendado',
      resultHelpTitle: 'As suas respostas indicam que estrutura e acompanhamento podem ser mais valiosos do que outro plano genérico.',
      resultHelpCopy: 'Um plano personalizado da Garcia Builder pode ser criado de acordo com a sua rotina, ambiente de treino, experiência, preferências alimentares e objetivo.',
      emailSent: 'Email enviado. Uma cópia deste plano de treino e nutrição está a caminho. Verifique o spam ou a aba de promoções se não chegar em alguns minutos.',
      emailNotSent: 'Seu plano está pronto nesta página, mas não conseguimos confirmar a entrega do email. Salve ou imprima o plano para guardá-lo.',
      resultHeading: 'Seu Melhor Caminho Inicial: {title}', planDefault: 'Seu Plano Inicial Prático',
      planGoalDefault: 'Use esta estrutura durante a primeira semana antes de fazer mudanças avançadas.',
      trainingWeek: 'Treino desta semana: {title}', nutritionTargets: 'Metas de macronutrientes: {title}',
      calculateMacros: 'Calcular metas exatas de macros', workoutLibrary: 'Abrir biblioteca de exercícios',
      eatingDay: 'Exemplo simples de alimentação diária', shoppingList: 'Lista inicial de compras', nextDays: 'Próximos 7 dias',
      included: 'Incluído no seu plano inicial acima', openResource: 'Abrir Recurso',
      downloadGuide: 'Baixar Meu Guia de 28 Dias', messageAndre: 'Falar com Andre no WhatsApp',
      bookConsultation: 'Agendar uma Consulta', emailAndre: 'Enviar Email para Andre', visitSite: 'Visitar Garcia Builder Fitness',
      helpPlanTitle: 'Quer ajuda para transformar isto num plano real?',
      helpPlanCopy: 'Use as opções abaixo se quiser que Andre analise o seu objetivo, rotina de treino e ponto de partida nutricional.',
      resultLoadErrorTitle: 'Não foi possível abrir este resultado', resultNotFound: 'Complete novamente a avaliação para gerar um novo resultado.'
    },
    es: {
      pageTitle: 'Evaluación Fitness Gratuita | Garcia Builder Fitness',
      resultPageTitle: 'Tu Plan Fitness Inicial | Garcia Builder Fitness',
      metaDescription: 'Completa una evaluación fitness gratuita de 60 segundos y recibe un plan inicial recomendado por Garcia Builder Fitness.',
      skipAssessment: 'Ir a la evaluación', languageLabel: 'Idioma',
      heroEyebrow: 'EVALUACIÓN FITNESS GRATUITA DE 60 SEGUNDOS',
      heroTitle: 'Encuentra el Plan Inicial Adecuado para Tu Objetivo',
      heroCopy: 'Responde unas preguntas rápidas sobre tu objetivo, rutina de entrenamiento y mayor dificultad. Recibirás un punto de partida recomendado para entrenamiento y nutrición, con la opción de hablar con Andre sobre un plan totalmente personalizado.',
      heroCta: 'Crear Mi Plan Inicial', heroNote: 'Evaluación gratuita. Sin compromiso.',
      packagesCta: 'Ver Paquetes', contactAndreCta: 'Contactar a Andre',
      packagesChoiceTitle: 'Información de paquetes', packagesChoiceCopy: 'Compara las opciones de coaching antes de completar nada.',
      contactChoiceTitle: 'Contactar a Andre directamente', contactChoiceCopy: 'Usa WhatsApp, Instagram, email o reserva una consulta.',
      heroTrust: 'Creado por Andre Garcia, Entrenador Personal y Coach Online',
      trustOne: '7 preguntas concretas', trustTwo: 'Plan inicial inmediato', trustThree: 'Entrenamiento + nutrición por email',
      disclaimer: 'Esta evaluación ofrece orientación educativa general y no es una evaluación médica ni un programa prescrito individualmente.',
      questionProgress: 'Pregunta {current} de {total}', contactProgress: 'Datos de contacto',
      contactTitle: 'Tu Plan Inicial Recomendado Está Listo',
      contactCopy: 'Introduce tus datos para ver el resultado y recibir los recursos por email.',
      firstName: 'Nombre', email: 'Email', whatsapp: 'Número de WhatsApp', optional: 'opcional',
      whatsappHelp: 'Añade WhatsApp solo si quieres que Andre contacte contigo sobre tu resultado.',
      ageConsent: 'Confirmo que tengo 18 años o más.',
      deliveryConsent: 'Acepto recibir el resultado de mi evaluación y los recursos solicitados.',
      marketingEmail: 'Me gustaría recibir ocasionalmente orientación fitness, información sobre coaching y ofertas de Garcia Builder Fitness por email.',
      marketingWhatsapp: 'Me gustaría recibir ocasionalmente información sobre coaching y mensajes de seguimiento por WhatsApp.',
      legalBefore: 'Al enviar, podrás ver el resultado y recibir los recursos solicitados. Consulta la',
      privacy: 'Política de Privacidad', and: 'y los', terms: 'Términos', back: 'Volver', viewResult: 'Ver Mi Resultado',
      preparing: 'Preparando resultado…', chooseAnswer: 'Elige una respuesta para continuar.',
      enterName: 'Introduce tu nombre.', validEmail: 'Introduce un email válido.',
      validWhatsapp: 'Introduce WhatsApp en formato internacional, por ejemplo +353871234567.',
      confirmAge: 'Confirma que tienes 18 años o más.', confirmDelivery: 'Confirma que quieres recibir el resultado y los recursos solicitados.',
      submitUnavailable: 'No se pudo enviar la evaluación en este momento.',
      localApi: 'La vista previa local no puede acceder a la API de la evaluación. Usa Vercel dev o una vista previa publicada.',
      resultTitleLoading: 'Cargando tu resultado…', resultSummaryLoading: 'Espera mientras abrimos tu plan inicial recomendado.', resultStillLoading: 'Seguimos preparando tu plan. Esto puede tardar unos segundos después del envío.',
      resultEyebrow: 'RESULTADO DE TU EVALUACIÓN INICIAL', skipResult: 'Ir al resultado',
      recommendedNextStep: 'Siguiente paso recomendado',
      resultHelpTitle: 'Tus respuestas indican que la estructura y el acompañamiento pueden ser más valiosos que otro plan genérico.',
      resultHelpCopy: 'Se puede crear un plan personalizado de Garcia Builder según tu horario, entorno de entrenamiento, experiencia, preferencias alimentarias y objetivo.',
      emailSent: 'Email enviado. Una copia de este plan de entrenamiento y nutrición está en camino. Revisa spam o promociones si no llega en unos minutos.',
      emailNotSent: 'Tu plan está listo en esta página, pero no pudimos confirmar la entrega del email. Guarda o imprime el plan para conservarlo.',
      resultHeading: 'Tu Mejor Camino Inicial: {title}', planDefault: 'Tu Plan Inicial Práctico',
      planGoalDefault: 'Usa esta estructura durante la primera semana antes de hacer cambios avanzados.',
      trainingWeek: 'Entrenamiento de esta semana: {title}', nutritionTargets: 'Objetivos de macronutrientes: {title}',
      calculateMacros: 'Calcular objetivos exactos de macros', workoutLibrary: 'Abrir biblioteca de ejercicios',
      eatingDay: 'Ejemplo sencillo de alimentación diaria', shoppingList: 'Lista inicial de compras', nextDays: 'Próximos 7 días',
      included: 'Incluido en tu plan inicial anterior', openResource: 'Abrir Recurso',
      downloadGuide: 'Descargar Mi Guía de 28 Días', messageAndre: 'Hablar con Andre por WhatsApp',
      bookConsultation: 'Reservar una Consulta', emailAndre: 'Enviar Email a Andre', visitSite: 'Visitar Garcia Builder Fitness',
      helpPlanTitle: '¿Quieres ayuda para convertir esto en un plan real?',
      helpPlanCopy: 'Usa las opciones siguientes si quieres que Andre revise tu objetivo, horario de entrenamiento y punto de partida nutricional.',
      resultLoadErrorTitle: 'No pudimos abrir este resultado', resultNotFound: 'Completa de nuevo la evaluación para generar un resultado nuevo.'
    }
  };

  const TEXT = {
    pt: {
      'What would you most like to achieve right now?': 'O que você mais gostaria de alcançar agora?',
      'Where are you most likely to train?': 'Onde você provavelmente irá treinar?',
      'How many days per week could you realistically train?': 'Quantos dias por semana você consegue treinar de forma realista?',
      'What is currently making progress most difficult?': 'O que mais está dificultando o seu progresso atualmente?',
      'What kind of nutrition guidance would help you most?': 'Que tipo de orientação nutricional mais ajudaria você?',
      'When would you ideally like to begin?': 'Quando você gostaria de começar?',
      'Which type of support are you looking for?': 'Que tipo de suporte você procura?',
      'Lose body fat': 'Perder gordura corporal', 'Build muscle': 'Ganhar massa muscular',
      'Improve body composition': 'Melhorar a composição corporal', 'Become fitter and more energetic': 'Melhorar o condicionamento e ter mais energia',
      'Rebuild consistency': 'Recuperar a consistência', 'Not sure yet': 'Ainda não tenho certeza',
      'Commercial gym': 'Academia comercial', 'Home with some equipment': 'Casa com alguns equipamentos',
      'Home with little or no equipment': 'Casa com pouco ou nenhum equipamento', 'A mixture of gym and home': 'Uma combinação de academia e casa',
      'I am not currently training': 'Não estou treinando atualmente', '2 days': '2 dias', '3 days': '3 dias', '4 days': '4 dias',
      '5 or more days': '5 dias ou mais', 'I am unsure': 'Não tenho certeza',
      'Nutrition and food choices': 'Nutrição e escolhas alimentares', 'Lack of consistency': 'Falta de consistência', 'Limited time': 'Pouco tempo',
      'I do not know what programme to follow': 'Não sei qual programa seguir', 'Motivation and accountability': 'Motivação e acompanhamento',
      'I have stopped seeing progress': 'Parei de ver progresso', 'I am overwhelmed by conflicting information': 'Estou sobrecarregado com informações contraditórias',
      'Simple meal structure': 'Estrutura simples de refeições', 'Calories and macro targets': 'Metas de calorias e macronutrientes',
      'High-protein food ideas': 'Ideias de alimentos ricos em proteína', 'Portion guidance without tracking everything': 'Orientação de porções sem registrar tudo',
      'Meal preparation and planning': 'Preparação e planejamento de refeições', 'Help controlling cravings and overeating': 'Ajuda para controlar desejos e excessos',
      'As soon as possible': 'O mais rápido possível', 'Within the next two weeks': 'Nas próximas duas semanas',
      'Within the next month': 'No próximo mês', 'I am researching my options': 'Estou pesquisando as opções',
      'I only want the free resources for now': 'Por enquanto quero apenas os recursos gratuitos',
      'A free guide to help me begin': 'Um guia gratuito para me ajudar a começar', 'A workout and nutrition template': 'Um modelo de treino e nutrição',
      'A structured programme I can follow': 'Um programa estruturado que eu possa seguir', 'A fully tailored coaching plan': 'Um plano de coaching totalmente personalizado',
      'I would like to speak with Andre first': 'Gostaria de falar primeiro com Andre',
      'Structured Coaching Support': 'Suporte de Coaching Estruturado', 'Structured Training and Nutrition Plan': 'Plano Estruturado de Treino e Nutrição',
      'Muscle-Building Foundation Plan': 'Plano Base para Ganho de Massa', 'Consistency Rebuild Plan': 'Plano para Recuperar a Consistência',
      'Fat-Loss and Body-Composition Starter Plan': 'Plano Inicial de Perda de Gordura e Composição Corporal',
      'Your Practical Starter Plan': 'Seu Plano Inicial Prático',
      '28-Day Fat Loss Kickstart': 'Guia Inicial de 28 Dias para Perda de Gordura',
      'Start with a small calorie surplus, stable protein and progressive training performance.': 'Comece com um pequeno superávit calórico, proteína consistente e progressão no treino.',
      'Start with consistent meals and repeatable sessions before pushing calories aggressively.': 'Comece com refeições consistentes e sessões repetíveis antes de alterar as calorias de forma agressiva.',
      'Start near maintenance calories, increase protein and build training consistency first.': 'Comece próximo das calorias de manutenção, aumente a proteína e construa consistência no treino primeiro.',
      'Start with a modest calorie deficit, high protein and enough carbs to train well.': 'Comece com um déficit calórico moderado, proteína alta e carboidratos suficientes para treinar bem.',
      'Follow this structure for the next 7 days before changing exercises or meals.': 'Siga esta estrutura durante os próximos 7 dias antes de mudar exercícios ou refeições.',
      'Track body weight trend, waist measurement, energy and training performance.': 'Acompanhe a tendência do peso, medida da cintura, energia e desempenho no treino.',
      'Use the macro calculator when you are ready to turn the ranges into exact targets.': 'Use a calculadora de macros quando estiver pronto para transformar as faixas em metas exatas.',
      'Contact Andre if you want this rebuilt around your exact schedule, food preferences and goal.': 'Fale com Andre se quiser adaptar isto à sua rotina, preferências alimentares e objetivo.',
      'Technique, confidence and repeatable effort.': 'Técnica, confiança e esforço que você consegue repetir.',
      'Repeatable work that supports fat loss without draining recovery.': 'Trabalho repetível que apoia a perda de gordura sem prejudicar a recuperação.',
      'Repeat the same patterns with slightly different movements.': 'Repita os mesmos padrões com movimentos ligeiramente diferentes.',
      'Pressing, rowing and shoulder stability.': 'Empurrar, remar e estabilizar os ombros.',
      'Squat pattern, hamstrings and core.': 'Padrão de agachamento, posteriores da coxa e core.',
      'Vertical pull, shoulders and upper-back volume.': 'Puxada vertical, ombros e volume para a parte superior das costas.',
      'Hips, single-leg control and finishers.': 'Quadril, controlo unilateral e finalizadores.',
      'Higher frequency while keeping recovery under control.': 'Maior frequência com a recuperação sob controlo.',
      'Make limited equipment productive with tempo and range of motion.': 'Aproveite equipamentos limitados usando cadência e amplitude de movimento.',
      'Build the habit without needing a gym setup.': 'Construa o hábito sem precisar de uma academia.',
      'Use the gym for movements that are harder to recreate at home.': 'Use a academia para movimentos mais difíceis de reproduzir em casa.',
      'Leave the session feeling better than when you started.': 'Termine a sessão sentindo-se melhor do que quando começou.',
      'Protein: include a clear protein source at 3-4 meals per day.': 'Proteína: inclua uma fonte clara de proteína em 3 a 4 refeições por dia.',
      'Calories: keep portions repeatable for 10-14 days, then adjust from progress.': 'Calorias: mantenha porções consistentes por 10 a 14 dias e ajuste de acordo com o progresso.',
      'Carbs: place most starches around training or your busiest part of the day.': 'Carboidratos: concentre a maior parte em torno do treino ou no período mais ativo do dia.',
      'Fats: use thumb-sized portions from oils, avocado, nuts, eggs or oily fish.': 'Gorduras: use porções do tamanho do polegar de azeite, abacate, frutos secos, ovos ou peixe gordo.',
      'Protein: start at 1.6-2.2 g per kg of target body weight per day.': 'Proteína: comece com 1,6 a 2,2 g por kg do peso corporal alvo por dia.',
      'Fat loss calories: start about 300-500 calories below maintenance.': 'Calorias para perda de gordura: comece cerca de 300 a 500 calorias abaixo da manutenção.',
      'Muscle gain calories: start about 150-250 calories above maintenance.': 'Calorias para ganho muscular: comece cerca de 150 a 250 calorias acima da manutenção.',
      'Fats: keep roughly 0.6-1.0 g per kg of body weight, then use carbs to support training.': 'Gorduras: mantenha aproximadamente 0,6 a 1,0 g por kg de peso corporal e use carboidratos para apoiar o treino.',
      'Use the calculator link for exact calorie and macro numbers.': 'Use a calculadora para obter valores exatos de calorias e macronutrientes.',
      'Protein: choose one protein anchor at every meal.': 'Proteína: escolha uma fonte principal de proteína em cada refeição.',
      'Calories: keep high-protein snacks available so takeaways become less likely.': 'Calorias: mantenha lanches ricos em proteína disponíveis para reduzir a necessidade de delivery.',
      'Fibre: pair protein with fruit, vegetables, beans or whole grains.': 'Fibra: combine proteína com fruta, vegetais, feijão ou cereais integrais.',
      'Preparation: keep two no-cook protein options ready at all times.': 'Preparação: tenha sempre duas opções de proteína que não exigem cozinha.',
      'Protein: 1-2 palm-sized portions per main meal.': 'Proteína: 1 a 2 porções do tamanho da palma em cada refeição principal.',
      'Carbs: 1 cupped-hand portion per meal, more around training if performance drops.': 'Carboidratos: 1 porção em mão em concha por refeição, aumentando perto do treino se o desempenho cair.',
      'Fats: 1 thumb-sized portion per meal.': 'Gorduras: 1 porção do tamanho do polegar por refeição.',
      'Vegetables or fruit: 1-2 fist-sized portions per meal.': 'Vegetais ou fruta: 1 a 2 porções do tamanho do punho por refeição.',
      'Adjust one portion at a time after 10-14 consistent days.': 'Ajuste uma porção de cada vez após 10 a 14 dias consistentes.',
      'Protein: prepare two cooked protein options every three days.': 'Proteína: prepare duas opções de proteína cozida a cada três dias.',
      'Calories: repeat the same lunch or dinner for three days before changing it.': 'Calorias: repita o mesmo almoço ou jantar por três dias antes de mudar.',
      'Carbs: cook one base such as rice, pasta, potatoes or wraps.': 'Carboidratos: prepare uma base como arroz, massa, batata ou wraps.',
      'Backup meal: keep one low-effort meal ready for busy evenings.': 'Refeição de emergência: tenha uma opção simples pronta para noites corridas.',
      'Protein: hit protein earlier in the day instead of saving most food for night.': 'Proteína: consuma proteína mais cedo em vez de deixar a maior parte da comida para a noite.',
      'Fibre: add fruit, vegetables or beans to the meals that usually leave you hungry.': 'Fibra: adicione fruta, vegetais ou feijão às refeições que normalmente não saciam.',
      'Fluids: drink water before assuming hunger is a need for snacks.': 'Líquidos: beba água antes de interpretar a fome como necessidade de lanchar.',
      'Planned snack: include one evening snack if cravings repeatedly break the plan.': 'Lanche planejado: inclua um lanche à noite se os desejos quebrarem o plano repetidamente.',
      'Protein: include protein at each meal before changing anything advanced.': 'Proteína: inclua proteína em cada refeição antes de fazer mudanças avançadas.',
      'Calories: keep meal timing and portions consistent for two weeks.': 'Calorias: mantenha horários e porções consistentes por duas semanas.',
      'Hydration: aim for regular water intake across the day.': 'Hidratação: beba água regularmente ao longo do dia.',
      'Progress: use scale trend, photos, measurements, energy and training performance.': 'Progresso: use tendência do peso, fotos, medidas, energia e desempenho no treino.'
    },
    es: {
      'What would you most like to achieve right now?': '¿Qué te gustaría conseguir principalmente ahora?',
      'Where are you most likely to train?': '¿Dónde es más probable que entrenes?',
      'How many days per week could you realistically train?': '¿Cuántos días por semana puedes entrenar de forma realista?',
      'What is currently making progress most difficult?': '¿Qué está dificultando más tu progreso actualmente?',
      'What kind of nutrition guidance would help you most?': '¿Qué tipo de orientación nutricional te ayudaría más?',
      'When would you ideally like to begin?': '¿Cuándo te gustaría empezar?',
      'Which type of support are you looking for?': '¿Qué tipo de apoyo buscas?',
      'Lose body fat': 'Perder grasa corporal', 'Build muscle': 'Ganar masa muscular',
      'Improve body composition': 'Mejorar la composición corporal', 'Become fitter and more energetic': 'Mejorar la condición física y tener más energía',
      'Rebuild consistency': 'Recuperar la constancia', 'Not sure yet': 'Todavía no estoy seguro',
      'Commercial gym': 'Gimnasio comercial', 'Home with some equipment': 'Casa con algo de equipamiento',
      'Home with little or no equipment': 'Casa con poco o ningún equipamiento', 'A mixture of gym and home': 'Una combinación de gimnasio y casa',
      'I am not currently training': 'Actualmente no estoy entrenando', '2 days': '2 días', '3 days': '3 días', '4 days': '4 días',
      '5 or more days': '5 días o más', 'I am unsure': 'No estoy seguro',
      'Nutrition and food choices': 'Nutrición y elección de alimentos', 'Lack of consistency': 'Falta de constancia', 'Limited time': 'Poco tiempo',
      'I do not know what programme to follow': 'No sé qué programa seguir', 'Motivation and accountability': 'Motivación y seguimiento',
      'I have stopped seeing progress': 'He dejado de ver progreso', 'I am overwhelmed by conflicting information': 'Me abruma la información contradictoria',
      'Simple meal structure': 'Estructura sencilla de comidas', 'Calories and macro targets': 'Objetivos de calorías y macronutrientes',
      'High-protein food ideas': 'Ideas de alimentos ricos en proteína', 'Portion guidance without tracking everything': 'Orientación de porciones sin registrar todo',
      'Meal preparation and planning': 'Preparación y planificación de comidas', 'Help controlling cravings and overeating': 'Ayuda para controlar antojos y excesos',
      'As soon as possible': 'Lo antes posible', 'Within the next two weeks': 'En las próximas dos semanas',
      'Within the next month': 'En el próximo mes', 'I am researching my options': 'Estoy investigando mis opciones',
      'I only want the free resources for now': 'Por ahora solo quiero los recursos gratuitos',
      'A free guide to help me begin': 'Una guía gratuita para ayudarme a empezar', 'A workout and nutrition template': 'Una plantilla de entrenamiento y nutrición',
      'A structured programme I can follow': 'Un programa estructurado que pueda seguir', 'A fully tailored coaching plan': 'Un plan de coaching totalmente personalizado',
      'I would like to speak with Andre first': 'Me gustaría hablar primero con Andre',
      'Structured Coaching Support': 'Apoyo de Coaching Estructurado', 'Structured Training and Nutrition Plan': 'Plan Estructurado de Entrenamiento y Nutrición',
      'Muscle-Building Foundation Plan': 'Plan Base para Ganar Masa Muscular', 'Consistency Rebuild Plan': 'Plan para Recuperar la Constancia',
      'Fat-Loss and Body-Composition Starter Plan': 'Plan Inicial de Pérdida de Grasa y Composición Corporal',
      'Your Practical Starter Plan': 'Tu Plan Inicial Práctico',
      '28-Day Fat Loss Kickstart': 'Guía Inicial de 28 Días para Pérdida de Grasa',
      'Start with a small calorie surplus, stable protein and progressive training performance.': 'Empieza con un pequeño superávit calórico, proteína constante y progresión en el entrenamiento.',
      'Start with consistent meals and repeatable sessions before pushing calories aggressively.': 'Empieza con comidas constantes y sesiones repetibles antes de cambiar las calorías de forma agresiva.',
      'Start near maintenance calories, increase protein and build training consistency first.': 'Empieza cerca de las calorías de mantenimiento, aumenta la proteína y construye constancia en el entrenamiento.',
      'Start with a modest calorie deficit, high protein and enough carbs to train well.': 'Empieza con un déficit calórico moderado, proteína alta y carbohidratos suficientes para entrenar bien.',
      'Follow this structure for the next 7 days before changing exercises or meals.': 'Sigue esta estructura durante los próximos 7 días antes de cambiar ejercicios o comidas.',
      'Track body weight trend, waist measurement, energy and training performance.': 'Controla la tendencia del peso, la medida de cintura, la energía y el rendimiento en el entrenamiento.',
      'Use the macro calculator when you are ready to turn the ranges into exact targets.': 'Usa la calculadora de macros cuando estés listo para convertir los rangos en objetivos exactos.',
      'Contact Andre if you want this rebuilt around your exact schedule, food preferences and goal.': 'Habla con Andre si quieres adaptar esto a tu horario, preferencias alimentarias y objetivo.',
      'Technique, confidence and repeatable effort.': 'Técnica, confianza y esfuerzo que puedas repetir.',
      'Repeatable work that supports fat loss without draining recovery.': 'Trabajo repetible que apoya la pérdida de grasa sin perjudicar la recuperación.',
      'Repeat the same patterns with slightly different movements.': 'Repite los mismos patrones con movimientos ligeramente diferentes.',
      'Pressing, rowing and shoulder stability.': 'Empuje, remo y estabilidad de hombros.',
      'Squat pattern, hamstrings and core.': 'Patrón de sentadilla, isquiotibiales y core.',
      'Vertical pull, shoulders and upper-back volume.': 'Tirón vertical, hombros y volumen para la espalda superior.',
      'Hips, single-leg control and finishers.': 'Cadera, control unilateral y finalizadores.',
      'Higher frequency while keeping recovery under control.': 'Mayor frecuencia manteniendo la recuperación bajo control.',
      'Make limited equipment productive with tempo and range of motion.': 'Aprovecha el equipamiento limitado con tempo y rango de movimiento.',
      'Build the habit without needing a gym setup.': 'Construye el hábito sin necesitar un gimnasio.',
      'Use the gym for movements that are harder to recreate at home.': 'Usa el gimnasio para movimientos más difíciles de reproducir en casa.',
      'Leave the session feeling better than when you started.': 'Termina la sesión sintiéndote mejor que al empezar.',
      'Protein: include a clear protein source at 3-4 meals per day.': 'Proteína: incluye una fuente clara de proteína en 3 o 4 comidas al día.',
      'Calories: keep portions repeatable for 10-14 days, then adjust from progress.': 'Calorías: mantén porciones constantes durante 10 a 14 días y ajusta según el progreso.',
      'Carbs: place most starches around training or your busiest part of the day.': 'Carbohidratos: concentra la mayor parte alrededor del entrenamiento o en el momento más activo del día.',
      'Fats: use thumb-sized portions from oils, avocado, nuts, eggs or oily fish.': 'Grasas: usa porciones del tamaño del pulgar de aceite, aguacate, frutos secos, huevos o pescado azul.',
      'Protein: start at 1.6-2.2 g per kg of target body weight per day.': 'Proteína: empieza con 1,6 a 2,2 g por kg de peso corporal objetivo al día.',
      'Fat loss calories: start about 300-500 calories below maintenance.': 'Calorías para perder grasa: empieza unas 300 a 500 calorías por debajo del mantenimiento.',
      'Muscle gain calories: start about 150-250 calories above maintenance.': 'Calorías para ganar músculo: empieza unas 150 a 250 calorías por encima del mantenimiento.',
      'Fats: keep roughly 0.6-1.0 g per kg of body weight, then use carbs to support training.': 'Grasas: mantén aproximadamente 0,6 a 1,0 g por kg de peso corporal y usa carbohidratos para apoyar el entrenamiento.',
      'Use the calculator link for exact calorie and macro numbers.': 'Usa la calculadora para obtener valores exactos de calorías y macronutrientes.',
      'Protein: choose one protein anchor at every meal.': 'Proteína: elige una fuente principal de proteína en cada comida.',
      'Calories: keep high-protein snacks available so takeaways become less likely.': 'Calorías: ten snacks ricos en proteína disponibles para depender menos de comida a domicilio.',
      'Fibre: pair protein with fruit, vegetables, beans or whole grains.': 'Fibra: combina proteína con fruta, verduras, legumbres o cereales integrales.',
      'Preparation: keep two no-cook protein options ready at all times.': 'Preparación: ten siempre listas dos opciones de proteína sin cocinar.',
      'Protein: 1-2 palm-sized portions per main meal.': 'Proteína: 1 o 2 porciones del tamaño de la palma en cada comida principal.',
      'Carbs: 1 cupped-hand portion per meal, more around training if performance drops.': 'Carbohidratos: 1 porción en mano ahuecada por comida, aumentando cerca del entrenamiento si baja el rendimiento.',
      'Fats: 1 thumb-sized portion per meal.': 'Grasas: 1 porción del tamaño del pulgar por comida.',
      'Vegetables or fruit: 1-2 fist-sized portions per meal.': 'Verduras o fruta: 1 o 2 porciones del tamaño del puño por comida.',
      'Adjust one portion at a time after 10-14 consistent days.': 'Ajusta una porción cada vez después de 10 a 14 días constantes.',
      'Protein: prepare two cooked protein options every three days.': 'Proteína: prepara dos opciones de proteína cocinada cada tres días.',
      'Calories: repeat the same lunch or dinner for three days before changing it.': 'Calorías: repite el mismo almuerzo o cena durante tres días antes de cambiar.',
      'Carbs: cook one base such as rice, pasta, potatoes or wraps.': 'Carbohidratos: prepara una base como arroz, pasta, patatas o wraps.',
      'Backup meal: keep one low-effort meal ready for busy evenings.': 'Comida de emergencia: ten una opción sencilla lista para noches ocupadas.',
      'Protein: hit protein earlier in the day instead of saving most food for night.': 'Proteína: consume proteína antes durante el día en vez de guardar la mayoría de la comida para la noche.',
      'Fibre: add fruit, vegetables or beans to the meals that usually leave you hungry.': 'Fibra: añade fruta, verduras o legumbres a las comidas que normalmente no te sacian.',
      'Fluids: drink water before assuming hunger is a need for snacks.': 'Líquidos: bebe agua antes de interpretar el hambre como necesidad de picar.',
      'Planned snack: include one evening snack if cravings repeatedly break the plan.': 'Snack planificado: incluye una merienda nocturna si los antojos rompen el plan repetidamente.',
      'Protein: include protein at each meal before changing anything advanced.': 'Proteína: incluye proteína en cada comida antes de hacer cambios avanzados.',
      'Calories: keep meal timing and portions consistent for two weeks.': 'Calorías: mantén horarios y porciones constantes durante dos semanas.',
      'Hydration: aim for regular water intake across the day.': 'Hidratación: bebe agua regularmente durante el día.',
      'Progress: use scale trend, photos, measurements, energy and training performance.': 'Progreso: usa la tendencia del peso, fotos, medidas, energía y rendimiento en el entrenamiento.'
    }
  };

  const REPLACEMENTS = {
    pt: [
      ['Five-Day Structured Gym Template', 'Modelo Estruturado de Academia de Cinco Dias'], ['Three-Day Full-Body Strength and Fat-Loss Template', 'Modelo de Corpo Inteiro de Três Dias para Força e Perda de Gordura'],
      ['Four-Day Upper/Lower Template', 'Modelo Superior/Inferior de Quatro Dias'], ['Two-Day Full-Body Starter', 'Plano Inicial de Corpo Inteiro de Dois Dias'],
      ['Home Dumbbell Training Template', 'Modelo de Treino com Halteres em Casa'], ['Bodyweight Consistency Starter', 'Plano Inicial de Consistência com Peso Corporal'],
      ['Hybrid Training Starter', 'Plano Inicial de Treino Híbrido'], ['Two-Day Rebuild Programme', 'Programa de Retomada de Dois Dias'],
      ['Starter Calorie and Macro Framework', 'Estrutura Inicial de Calorias e Macros'], ['High-Protein Plate Builder', 'Montagem de Prato Rico em Proteína'],
      ['High-Protein Food Library', 'Biblioteca de Alimentos Ricos em Proteína'], ['No-Tracking Portion Guide', 'Guia de Porções sem Registo'],
      ['Three-Day Meal-Preparation Template', 'Modelo de Preparação de Refeições para Três Dias'], ['Hunger and Cravings Management Guide', 'Guia para Controlar Fome e Desejos'],
      ['Nutrition Foundations Guide', 'Guia de Fundamentos da Nutrição'], ['Full Body', 'Corpo inteiro'], ['Upper', 'Parte superior'], ['Lower', 'Parte inferior'],
      ['Day ', 'Dia '], ['Monday', 'Segunda-feira'], ['Tuesday', 'Terça-feira'], ['Wednesday', 'Quarta-feira'], ['Thursday', 'Quinta-feira'], ['Friday or Saturday', 'Sexta-feira ou sábado'],
      ['Breakfast', 'Pequeno-almoço'], ['Lunch', 'Almoço'], ['Snack', 'Lanche'], ['Dinner', 'Jantar'],
      ['Protein', 'Proteína'], ['Calories', 'Calorias'], ['Carbs', 'Carboidratos'], ['Fats', 'Gorduras'], ['Fibre', 'Fibra'], ['Hydration', 'Hidratação'], ['Progress', 'Progresso'],
      ['sets of', 'séries de'], ['sets', 'séries'], ['reps', 'repetições'], ['each side', 'de cada lado'], ['per day', 'por dia'], ['per meal', 'por refeição'], ['per week', 'por semana'],
      ['Rest or walk', 'Descanso ou caminhada'], ['Optional', 'Opcional'], ['easy walks', 'caminhadas leves'], ['easy', 'leve'], ['controlled', 'controladas'],
      ['Greek yogurt', 'Iogurte grego'], ['yogurt', 'iogurte'], ['berries', 'frutos vermelhos'], ['oats', 'aveia'], ['fruit', 'fruta'], ['vegetables', 'vegetais'],
      ['Chicken', 'Frango'], ['chicken', 'frango'], ['Turkey mince', 'Carne moída de peru'], ['Lean protein', 'Proteína magra'], ['rice', 'arroz'], ['potatoes', 'batatas'], ['Eggs', 'Ovos'],
      ['shopping list', 'lista de compras'], ['training', 'treino'], ['meal', 'refeição'], ['weekly', 'semanal']
    ],
    es: [
      ['Five-Day Structured Gym Template', 'Plantilla Estructurada de Gimnasio de Cinco Días'], ['Three-Day Full-Body Strength and Fat-Loss Template', 'Plantilla de Cuerpo Completo de Tres Días para Fuerza y Pérdida de Grasa'],
      ['Four-Day Upper/Lower Template', 'Plantilla Superior/Inferior de Cuatro Días'], ['Two-Day Full-Body Starter', 'Plan Inicial de Cuerpo Completo de Dos Días'],
      ['Home Dumbbell Training Template', 'Plantilla de Entrenamiento con Mancuernas en Casa'], ['Bodyweight Consistency Starter', 'Plan Inicial de Constancia con Peso Corporal'],
      ['Hybrid Training Starter', 'Plan Inicial de Entrenamiento Híbrido'], ['Two-Day Rebuild Programme', 'Programa de Reinicio de Dos Días'],
      ['Starter Calorie and Macro Framework', 'Estructura Inicial de Calorías y Macros'], ['High-Protein Plate Builder', 'Constructor de Plato Rico en Proteína'],
      ['High-Protein Food Library', 'Biblioteca de Alimentos Ricos en Proteína'], ['No-Tracking Portion Guide', 'Guía de Porciones sin Registro'],
      ['Three-Day Meal-Preparation Template', 'Plantilla de Preparación de Comidas para Tres Días'], ['Hunger and Cravings Management Guide', 'Guía para Controlar Hambre y Antojos'],
      ['Nutrition Foundations Guide', 'Guía de Fundamentos de Nutrición'], ['Full Body', 'Cuerpo completo'], ['Upper', 'Parte superior'], ['Lower', 'Parte inferior'],
      ['Day ', 'Día '], ['Monday', 'Lunes'], ['Tuesday', 'Martes'], ['Wednesday', 'Miércoles'], ['Thursday', 'Jueves'], ['Friday or Saturday', 'Viernes o sábado'],
      ['Breakfast', 'Desayuno'], ['Lunch', 'Almuerzo'], ['Snack', 'Merienda'], ['Dinner', 'Cena'],
      ['Protein', 'Proteína'], ['Calories', 'Calorías'], ['Carbs', 'Carbohidratos'], ['Fats', 'Grasas'], ['Fibre', 'Fibra'], ['Hydration', 'Hidratación'], ['Progress', 'Progreso'],
      ['sets of', 'series de'], ['sets', 'series'], ['reps', 'repeticiones'], ['each side', 'por lado'], ['per day', 'al día'], ['per meal', 'por comida'], ['per week', 'por semana'],
      ['Rest or walk', 'Descanso o paseo'], ['Optional', 'Opcional'], ['easy walks', 'paseos suaves'], ['easy', 'suave'], ['controlled', 'controladas'],
      ['Greek yogurt', 'Yogur griego'], ['yogurt', 'yogur'], ['berries', 'frutos rojos'], ['oats', 'avena'], ['fruit', 'fruta'], ['vegetables', 'verduras'],
      ['Chicken', 'Pollo'], ['chicken', 'pollo'], ['Turkey mince', 'Pavo picado'], ['Lean protein', 'Proteína magra'], ['rice', 'arroz'], ['potatoes', 'patatas'], ['Eggs', 'Huevos'],
      ['shopping list', 'lista de compras'], ['training', 'entrenamiento'], ['meal', 'comida'], ['weekly', 'semanal']
    ]
  };

  const EMAIL = {
    en: { subject: 'Your Garcia Builder Starter Plan Is Ready', greeting: 'Hi', ready: 'Your Garcia Builder Starter Plan Is Ready', bestPath: 'Based on your assessment, your best starting path is', mainGoal: 'Main stated goal', startHere: 'Start here: your first 3 actions', actions: ['Choose your training days from the weekly structure below and put them in your calendar.', 'Complete your first workout using the session written in this email.', 'Set your nutrition baseline with the meal structure below, then calculate exact targets when you are ready.'], openPlan: 'Open My Full Plan', openWorkout: 'Open Workout Library', calculate: 'Calculate My Macros', helpful: 'Helpful resources', viewPlan: 'View Your Starter Plan', preheader: 'Your workout, nutrition structure and first three actions are ready.', training: 'Training this week', nutrition: 'Macro targets and simple diet', eating: 'Simple day of eating', shopping: 'Starter shopping list', educational: 'This assessment provides general educational guidance and is not a medical assessment or individually prescribed programme.', receiving: 'You are receiving this email because you requested your assessment result and resources. Read the', privacy: 'Privacy Policy', business: 'Personal training and online coaching.' },
    pt: { subject: 'Seu Plano Inicial Garcia Builder Está Pronto', greeting: 'Olá', ready: 'Seu Plano Inicial Garcia Builder Está Pronto', bestPath: 'Com base na sua avaliação, o melhor caminho inicial é', mainGoal: 'Objetivo principal informado', startHere: 'Comece aqui: suas primeiras 3 ações', actions: ['Escolha os dias de treino na estrutura semanal abaixo e coloque-os no calendário.', 'Complete o primeiro treino usando a sessão descrita neste email.', 'Defina a sua base nutricional com a estrutura de refeições abaixo e calcule metas exatas quando estiver pronto.'], openPlan: 'Abrir Meu Plano Completo', openWorkout: 'Abrir Biblioteca de Treinos', calculate: 'Calcular Meus Macros', helpful: 'Recursos úteis', viewPlan: 'Ver Meu Plano Inicial', preheader: 'Seu treino, estrutura nutricional e primeiras três ações estão prontos.', training: 'Treino desta semana', nutrition: 'Metas de macros e alimentação simples', eating: 'Exemplo simples de alimentação diária', shopping: 'Lista inicial de compras', educational: 'Esta avaliação oferece orientação educativa geral e não é uma avaliação médica nem um programa prescrito individualmente.', receiving: 'Você está recebendo este email porque solicitou o resultado da avaliação e os recursos. Consulte a', privacy: 'Política de Privacidade', business: 'Personal training e coaching online.' },
    es: { subject: 'Tu Plan Inicial Garcia Builder Está Listo', greeting: 'Hola', ready: 'Tu Plan Inicial Garcia Builder Está Listo', bestPath: 'Según tu evaluación, el mejor camino inicial es', mainGoal: 'Objetivo principal indicado', startHere: 'Empieza aquí: tus primeras 3 acciones', actions: ['Elige tus días de entrenamiento en la estructura semanal y añádelos al calendario.', 'Completa el primer entrenamiento usando la sesión descrita en este email.', 'Define tu base nutricional con la estructura de comidas y calcula objetivos exactos cuando estés listo.'], openPlan: 'Abrir Mi Plan Completo', openWorkout: 'Abrir Biblioteca de Entrenamientos', calculate: 'Calcular Mis Macros', helpful: 'Recursos útiles', viewPlan: 'Ver Mi Plan Inicial', preheader: 'Tu entrenamiento, estructura nutricional y primeras tres acciones están listos.', training: 'Entrenamiento de esta semana', nutrition: 'Objetivos de macros y alimentación sencilla', eating: 'Ejemplo sencillo de alimentación diaria', shopping: 'Lista inicial de compras', educational: 'Esta evaluación ofrece orientación educativa general y no es una evaluación médica ni un programa prescrito individualmente.', receiving: 'Recibes este email porque solicitaste el resultado de la evaluación y los recursos. Consulta la', privacy: 'Política de Privacidad', business: 'Entrenamiento personal y coaching online.' }
  };

  const RESOURCE_COPY = {
    pt: {
      guideDescription: 'Um guia prático com bases de treino, nutrição e consistência para começar hoje.',
      workoutDescription: 'Uma estrutura de treino prática e repetível, escolhida de acordo com as suas respostas.',
      nutritionDescription: 'Uma estrutura nutricional simples para melhorar proteína, porções e consistência.',
      guideAction: 'Abrir guia', workoutAction: 'Abrir plano de treino', nutritionAction: 'Abrir guia de nutrição',
      workoutDetails: ['Siga a estrutura semanal recomendada e mantenha os mesmos dias sempre que possível.', 'Comece com cargas controladas e termine a maioria das séries com 1 a 3 repetições em reserva.', 'Aumente primeiro as repetições e depois a carga quando a execução estiver consistente.'],
      nutritionDetails: ['Inclua uma fonte clara de proteína nas refeições principais.', 'Mantenha porções e horários consistentes durante 10 a 14 dias antes de ajustar.', 'Use o exemplo de refeições e a lista de compras como base, adaptando às suas preferências.']
    },
    es: {
      guideDescription: 'Una guía práctica con bases de entrenamiento, nutrición y constancia para empezar hoy.',
      workoutDescription: 'Una estructura de entrenamiento práctica y repetible, elegida según tus respuestas.',
      nutritionDescription: 'Una estructura nutricional sencilla para mejorar proteína, porciones y constancia.',
      guideAction: 'Abrir guía', workoutAction: 'Abrir plan de entrenamiento', nutritionAction: 'Abrir guía de nutrición',
      workoutDetails: ['Sigue la estructura semanal recomendada y mantén los mismos días siempre que sea posible.', 'Empieza con cargas controladas y termina la mayoría de las series con 1 a 3 repeticiones en reserva.', 'Aumenta primero las repeticiones y después la carga cuando la ejecución sea constante.'],
      nutritionDetails: ['Incluye una fuente clara de proteína en las comidas principales.', 'Mantén porciones y horarios constantes durante 10 a 14 días antes de ajustar.', 'Usa el ejemplo de comidas y la lista de compras como base, adaptándolos a tus preferencias.']
    }
  };

  const PLAN_COPY = {
    pt: {
      session: 'Sessão', focus: 'Treine com execução controlada e deixe 1 a 3 repetições em reserva.',
      weekly: {
        five: ['Dia 1: parte superior', 'Dia 2: parte inferior', 'Dia 3: empurrar', 'Dia 4: puxar', 'Dia 5: pernas ou condicionamento'],
        four: ['Segunda: parte superior A', 'Terça: parte inferior A', 'Quinta: parte superior B', 'Sexta ou sábado: parte inferior B'],
        three: ['Dia 1: corpo inteiro A', 'Dia 2: corpo inteiro B', 'Dia 3: corpo inteiro C'],
        two: ['Dia 1: corpo inteiro A', 'Dia 2: corpo inteiro B', 'Opcional: 2 a 3 caminhadas leves'],
        home: ['Três sessões curtas por semana', 'Caminhadas de 10 a 20 minutos quando possível', 'Mantenha os mesmos dias para criar consistência'],
        hybrid: ['Dia na academia: movimentos que exigem mais carga', 'Dia em casa: halteres ou peso corporal', 'Terceiro dia opcional: corpo inteiro']
      },
      work: {
        upper: ['Supino ou chest press: 3 séries de 6 a 10 repetições', 'Remada sentada: 3 séries de 8 a 12 repetições', 'Puxada na polia: 3 séries de 8 a 12 repetições', 'Elevação lateral: 2 séries de 12 a 15 repetições', 'Bíceps e tríceps: 2 séries de cada'],
        lower: ['Agachamento ou leg press: 3 séries de 6 a 10 repetições', 'Levantamento romeno: 3 séries de 8 a 10 repetições', 'Afundo ou passada: 2 séries de 8 a 10 repetições de cada lado', 'Flexão de pernas: 2 séries de 10 a 15 repetições', 'Prancha: 2 a 3 séries controladas'],
        home: ['Agachamento goblet: 3 séries de 10 a 15 repetições', 'Levantamento romeno com halteres: 3 séries de 8 a 12 repetições', 'Supino no chão com halteres: 3 séries de 8 a 12 repetições', 'Remada unilateral: 3 séries de 10 a 12 repetições de cada lado', 'Afundo e prancha: 2 a 3 séries de cada'],
        body: ['Agachamento até uma cadeira: 2 a 4 séries de 10 a 15 repetições', 'Flexão inclinada: 2 a 4 séries de 6 a 12 repetições', 'Ponte de glúteos: 2 a 4 séries de 10 a 15 repetições', 'Remada com toalha ou mochila: 2 a 4 séries de 8 a 12 repetições', 'Prancha ou dead bug: 2 a 3 séries controladas'],
        full: ['Agachamento ou leg press: 3 séries de 8 a 12 repetições', 'Levantamento romeno ou hip thrust: 3 séries de 8 a 12 repetições', 'Supino ou flexão: 3 séries de 8 a 12 repetições', 'Remada ou puxada: 3 séries de 8 a 12 repetições', 'Core ou caminhada inclinada: 2 a 3 séries']
      },
      meals: [
        { meal: 'Pequeno-almoço', example: 'Ovos ou iogurte grego com aveia e fruta', purpose: 'Comece o dia com proteína e fibra.' },
        { meal: 'Almoço', example: 'Frango, atum ou tofu com arroz, batatas e vegetais', purpose: 'Uma refeição completa e fácil de repetir.' },
        { meal: 'Lanche', example: 'Iogurte proteico, fruta ou batido de proteína', purpose: 'Evite intervalos longos e fome excessiva.' },
        { meal: 'Jantar', example: 'Proteína magra, vegetais e uma porção de carboidrato', purpose: 'Mantenha uma estrutura simples e consistente.' }
      ],
      shopping: ['Ovos', 'Iogurte grego', 'Frango, peixe ou tofu', 'Arroz ou batatas', 'Aveia', 'Vegetais', 'Fruta', 'Proteína em pó, se necessário']
    },
    es: {
      session: 'Sesión', focus: 'Entrena con ejecución controlada y deja de 1 a 3 repeticiones en reserva.',
      weekly: {
        five: ['Día 1: parte superior', 'Día 2: parte inferior', 'Día 3: empuje', 'Día 4: tirón', 'Día 5: piernas o acondicionamiento'],
        four: ['Lunes: parte superior A', 'Martes: parte inferior A', 'Jueves: parte superior B', 'Viernes o sábado: parte inferior B'],
        three: ['Día 1: cuerpo completo A', 'Día 2: cuerpo completo B', 'Día 3: cuerpo completo C'],
        two: ['Día 1: cuerpo completo A', 'Día 2: cuerpo completo B', 'Opcional: 2 o 3 paseos suaves'],
        home: ['Tres sesiones cortas por semana', 'Paseos de 10 a 20 minutos cuando sea posible', 'Mantén los mismos días para crear constancia'],
        hybrid: ['Día de gimnasio: movimientos que requieren más carga', 'Día en casa: mancuernas o peso corporal', 'Tercer día opcional: cuerpo completo']
      },
      work: {
        upper: ['Press de banca o de pecho: 3 series de 6 a 10 repeticiones', 'Remo sentado: 3 series de 8 a 12 repeticiones', 'Jalón al pecho: 3 series de 8 a 12 repeticiones', 'Elevación lateral: 2 series de 12 a 15 repeticiones', 'Bíceps y tríceps: 2 series de cada uno'],
        lower: ['Sentadilla o prensa: 3 series de 6 a 10 repeticiones', 'Peso muerto rumano: 3 series de 8 a 10 repeticiones', 'Zancada: 2 series de 8 a 10 repeticiones por lado', 'Curl femoral: 2 series de 10 a 15 repeticiones', 'Plancha: 2 o 3 series controladas'],
        home: ['Sentadilla goblet: 3 series de 10 a 15 repeticiones', 'Peso muerto rumano con mancuernas: 3 series de 8 a 12 repeticiones', 'Press en el suelo con mancuernas: 3 series de 8 a 12 repeticiones', 'Remo con un brazo: 3 series de 10 a 12 repeticiones por lado', 'Zancada y plancha: 2 o 3 series de cada una'],
        body: ['Sentadilla a una silla: 2 a 4 series de 10 a 15 repeticiones', 'Flexión inclinada: 2 a 4 series de 6 a 12 repeticiones', 'Puente de glúteos: 2 a 4 series de 10 a 15 repeticiones', 'Remo con toalla o mochila: 2 a 4 series de 8 a 12 repeticiones', 'Plancha o dead bug: 2 o 3 series controladas'],
        full: ['Sentadilla o prensa: 3 series de 8 a 12 repeticiones', 'Peso muerto rumano o hip thrust: 3 series de 8 a 12 repeticiones', 'Press de pecho o flexión: 3 series de 8 a 12 repeticiones', 'Remo o jalón: 3 series de 8 a 12 repeticiones', 'Core o caminata inclinada: 2 o 3 series']
      },
      meals: [
        { meal: 'Desayuno', example: 'Huevos o yogur griego con avena y fruta', purpose: 'Empieza el día con proteína y fibra.' },
        { meal: 'Almuerzo', example: 'Pollo, atún o tofu con arroz, patatas y verduras', purpose: 'Una comida completa y fácil de repetir.' },
        { meal: 'Merienda', example: 'Yogur proteico, fruta o batido de proteína', purpose: 'Evita intervalos largos y hambre excesiva.' },
        { meal: 'Cena', example: 'Proteína magra, verduras y una porción de carbohidrato', purpose: 'Mantén una estructura sencilla y constante.' }
      ],
      shopping: ['Huevos', 'Yogur griego', 'Pollo, pescado o tofu', 'Arroz o patatas', 'Avena', 'Verduras', 'Fruta', 'Proteína en polvo, si es necesaria']
    }
  };

  function normalizeLanguage(value) {
    const language = String(value || '').toLowerCase().split('-')[0];
    return SUPPORTED.includes(language) ? language : 'en';
  }

  function format(value, variables) {
    return String(value || '').replace(/\{(\w+)\}/g, (_, key) => String(variables?.[key] ?? ''));
  }

  function ui(key, language, variables) {
    const lang = normalizeLanguage(language);
    return format(UI[lang][key] || UI.en[key] || key, variables);
  }

  function translateText(value, language) {
    const lang = normalizeLanguage(language);
    const source = String(value == null ? '' : value);
    if (lang === 'en' || !source || /^(https?:|mailto:|\/)/.test(source)) return source;
    if (TEXT[lang][source]) return TEXT[lang][source];
    return REPLACEMENTS[lang].reduce((translated, pair) => {
      const escaped = pair[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const startsWithWord = /^\w/.test(pair[0]);
      const endsWithWord = /\w$/.test(pair[0]);
      const pattern = `${startsWithWord ? '\\b' : ''}${escaped}${endsWithWord ? '\\b' : ''}`;
      return translated.replace(new RegExp(pattern, 'g'), pair[1]);
    }, source);
  }

  function translateDeep(value, language) {
    if (Array.isArray(value)) return value.map((item) => translateDeep(item, language));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateDeep(item, language)]));
    }
    return typeof value === 'string' ? translateText(value, language) : value;
  }

  function localizeResource(resource, language) {
    const lang = normalizeLanguage(language);
    if (lang === 'en' || !resource) return resource;
    const copy = RESOURCE_COPY[lang];
    const type = resource.type === 'workout' || resource.type === 'nutrition' ? resource.type : 'guide';
    return {
      ...resource,
      requestedTitle: translateText(resource.requestedTitle, lang),
      unavailableTitle: resource.unavailableTitle ? translateText(resource.unavailableTitle, lang) : resource.unavailableTitle,
      title: translateText(resource.title, lang),
      description: copy[`${type}Description`],
      actionLabel: copy[`${type}Action`],
      details: type === 'guide' ? [] : copy[`${type}Details`]
    };
  }

  function localizeStarterPlan(plan, language) {
    const lang = normalizeLanguage(language);
    if (lang === 'en' || !plan) return plan;
    const copy = PLAN_COPY[lang];
    const rawTitle = String(plan.training?.title || '');
    const weeklyKey = rawTitle.includes('Five-Day') ? 'five' : rawTitle.includes('Four-Day') ? 'four' : rawTitle.includes('Hybrid') ? 'hybrid' : rawTitle.includes('Home') || rawTitle.includes('Bodyweight') ? 'home' : rawTitle.includes('Three-Day') ? 'three' : 'two';
    const sessions = (plan.training?.sessions || []).map((session, index) => {
      const rawName = String(session.name || '');
      const kind = /Upper/i.test(rawName) ? 'upper' : /Lower/i.test(rawName) ? 'lower' : /Home/i.test(rawName) ? 'home' : /Bodyweight/i.test(rawName) ? 'body' : 'full';
      return { name: `${copy.session} ${index + 1}`, focus: copy.focus, work: copy.work[kind] };
    });
    return {
      ...plan,
      title: translateText(plan.title, lang),
      goalTarget: translateText(plan.goalTarget, lang),
      training: { ...plan.training, title: translateText(plan.training?.title, lang), weeklyStructure: copy.weekly[weeklyKey], sessions },
      nutrition: { ...plan.nutrition, title: translateText(plan.nutrition?.title, lang), macroTargets: translateDeep(plan.nutrition?.macroTargets || [], lang), meals: copy.meals, shoppingList: copy.shopping },
      nextSteps: translateDeep(plan.nextSteps || [], lang)
    };
  }

  function getBrowserLanguage() {
    if (typeof window === 'undefined') return 'en';
    const query = new URLSearchParams(window.location.search).get('lang');
    if (query) return normalizeLanguage(query);
    try {
      const stored = localStorage.getItem('gb_lang');
      if (stored) return normalizeLanguage(stored);
    } catch (_) {}
    return normalizeLanguage(navigator.language);
  }

  function setBrowserLanguage(language) {
    const lang = normalizeLanguage(language);
    try { localStorage.setItem('gb_lang', lang); } catch (_) {}
    return lang;
  }

  function applyDocument(language) {
    if (typeof document === 'undefined') return;
    const lang = normalizeLanguage(language);
    document.documentElement.lang = lang;
    const titleKey = document.body?.classList.contains('result-page') ? 'resultPageTitle' : 'pageTitle';
    document.title = ui(titleKey, lang);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', ui('metaDescription', lang));
    document.querySelectorAll('[data-starter-copy]').forEach((element) => {
      element.textContent = ui(element.getAttribute('data-starter-copy'), lang);
    });
    document.querySelectorAll('[data-starter-placeholder]').forEach((element) => {
      element.setAttribute('placeholder', ui(element.getAttribute('data-starter-placeholder'), lang));
    });
    document.querySelectorAll('[data-starter-language]').forEach((element) => { element.value = lang; });
  }

  return {
    SUPPORTED,
    normalizeLanguage,
    ui,
    translateText,
    translateDeep,
    localizeResource,
    localizeStarterPlan,
    getBrowserLanguage,
    setBrowserLanguage,
    applyDocument,
    getEmailCopy: (language) => EMAIL[normalizeLanguage(language)]
  };
});
