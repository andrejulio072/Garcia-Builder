(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.GB_STARTER_PLAN_TRANSLATIONS = data;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const trainingKeys = [
    'Two-Day Full-Body Starter',
    'Three-Day Full-Body Strength and Fat-Loss Template',
    'Four-Day Upper/Lower Template',
    'Five-Day Structured Gym Template',
    'Home Dumbbell Training Template',
    'Bodyweight Consistency Starter',
    'Hybrid Training Starter',
    'Two-Day Rebuild Programme'
  ];
  const nutritionKeys = [
    'High-Protein Plate Builder',
    'Starter Calorie and Macro Framework',
    'High-Protein Food Library',
    'No-Tracking Portion Guide',
    'Three-Day Meal-Preparation Template',
    'Hunger and Cravings Management Guide',
    'Nutrition Foundations Guide'
  ];
  const resultKeys = [
    'Structured Coaching Support',
    'Structured Training and Nutrition Plan',
    'Muscle-Building Foundation Plan',
    'Consistency Rebuild Plan',
    'Fat-Loss and Body-Composition Starter Plan'
  ];
  const goalTargetKeys = [
    'Start with a small calorie surplus, stable protein and progressive training performance.',
    'Start with consistent meals and repeatable sessions before pushing calories aggressively.',
    'Start near maintenance calories, increase protein and build training consistency first.',
    'Start with a modest calorie deficit, high protein and enough carbs to train well.'
  ];
  const resourceKeys = ['28-Day Fat Loss Kickstart', ...trainingKeys, ...nutritionKeys];
  const mapValues = (keys, values, label) => {
    if (keys.length !== values.length) throw new Error(`${label} translation count mismatch`);
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  };
  const meal = (mealName, example, purpose) => ({ meal: mealName, example, purpose });
  const define = (language, copy) => ({
    ...copy,
    resultTitles: mapValues(resultKeys, copy.resultTitles, `${language} result titles`),
    resourceCopy: {
      ...copy.resourceCopy,
      titles: mapValues(resourceKeys, copy.resourceCopy.titles, `${language} resource titles`)
    },
    planCopy: {
      ...copy.planCopy,
      goalTargets: mapValues(goalTargetKeys, copy.planCopy.goalTargets, `${language} goal targets`),
      trainingTitles: mapValues(trainingKeys, copy.planCopy.trainingTitles, `${language} training titles`),
      nutritionTitles: mapValues(nutritionKeys, copy.planCopy.nutritionTitles, `${language} nutrition titles`)
    }
  });

  const locales = {
    fr: define('fr', {
      summary: {
        goals: {
          'Lose body fat': 'réduire la graisse corporelle',
          'Build muscle': 'développer les muscles',
          'Improve body composition': 'améliorer la composition corporelle',
          'Become fitter and more energetic': 'améliorer la forme et l’énergie',
          'Rebuild consistency': 'retrouver de la régularité',
          'Not sure yet': 'trouver un point de départ clair'
        },
        unsureDays: 'une routine hebdomadaire réaliste',
        trainingDays: 'vous entraîner {days} par semaine',
        template: 'Compte tenu de votre objectif de {goal}, de votre capacité à {days} et de la difficulté liée à {barrier}, votre meilleur point de départ est une structure d’entraînement répétable associée à des habitudes nutritionnelles gérables.'
      },
      resultTitles: [
        'Accompagnement de Coaching Structuré',
        'Plan Structuré d’Entraînement et de Nutrition',
        'Plan de Base pour Développer les Muscles',
        'Plan pour Retrouver de la Régularité',
        'Plan Initial pour la Perte de Graisse et la Composition Corporelle'
      ],
      supportCta: {
        warm: 'Discuter d’un Plan Personnalisé avec Andre',
        interested: 'Voir Mes Modèles Recommandés',
        cold: 'Télécharger Mon Guide de 28 Jours'
      },
      email: {
        subject: 'Votre Plan Initial Garcia Builder Est Prêt',
        greeting: 'Bonjour',
        ready: 'Votre Plan Initial Garcia Builder Est Prêt',
        bestPath: 'Selon votre évaluation, le meilleur point de départ est',
        mainGoal: 'Objectif principal indiqué',
        startHere: 'Commencez ici : vos 3 premières actions',
        actions: [
          'Choisissez vos jours d’entraînement dans la structure ci-dessous et ajoutez-les à votre calendrier.',
          'Effectuez votre première séance en suivant le programme indiqué dans cet email.',
          'Mettez en place votre base nutritionnelle avec les repas ci-dessous, puis calculez vos objectifs précis lorsque vous êtes prêt.'
        ],
        openPlan: 'Ouvrir Mon Plan Complet',
        openWorkout: 'Ouvrir la Bibliothèque d’Entraînements',
        calculate: 'Calculer Mes Macros',
        helpful: 'Ressources utiles',
        viewPlan: 'Voir Votre Plan Initial',
        preheader: 'Votre entraînement, votre structure nutritionnelle et vos trois premières actions sont prêts.',
        training: 'Entraînement de cette semaine',
        nutrition: 'Objectifs de macros et alimentation simple',
        eating: 'Exemple simple d’une journée alimentaire',
        shopping: 'Liste de courses initiale',
        educational: 'Cette évaluation fournit des conseils éducatifs généraux et ne constitue ni une évaluation médicale ni un programme prescrit individuellement.',
        receiving: 'Vous recevez cet email parce que vous avez demandé le résultat de votre évaluation et les ressources. Consultez la',
        privacy: 'Politique de confidentialité',
        business: 'Coaching personnel et coaching en ligne.',
        exactTargets: 'Calculer les objectifs précis de calories et de macros',
        whatsappAndre: 'Contacter Andre sur WhatsApp',
        bookConsultation: 'Réserver une consultation',
        emailAndre: 'Envoyer un email à Andre',
        visitSite: 'Visiter Garcia Builder Fitness'
      },
      resourceCopy: {
        titles: [
          'Guide de Démarrage Perte de Graisse sur 28 Jours',
          'Programme Corps Entier sur Deux Jours',
          'Modèle Corps Entier sur Trois Jours pour la Force et la Perte de Graisse',
          'Modèle Haut/Bas du Corps sur Quatre Jours',
          'Programme Structuré en Salle sur Cinq Jours',
          'Programme d’Entraînement à Domicile avec Haltères',
          'Programme de Régularité au Poids du Corps',
          'Programme d’Entraînement Hybride',
          'Programme de Reprise sur Deux Jours',
          'Assiette Riche en Protéines',
          'Cadre Initial de Calories et de Macros',
          'Bibliothèque d’Aliments Riches en Protéines',
          'Guide des Portions Sans Suivi',
          'Modèle de Préparation des Repas sur Trois Jours',
          'Guide de Gestion de la Faim et des Envies',
          'Guide des Bases de la Nutrition'
        ],
        guideDescription: 'Un guide pratique avec les bases de l’entraînement, de la nutrition et de la régularité à appliquer dès aujourd’hui.',
        workoutDescription: 'Une structure d’entraînement pratique et répétable, choisie selon vos réponses.',
        nutritionDescription: 'Une structure nutritionnelle simple pour améliorer les protéines, les portions et la régularité.',
        guideAction: 'Ouvrir le guide',
        workoutAction: 'Ouvrir le programme d’entraînement',
        nutritionAction: 'Ouvrir le guide nutritionnel',
        workoutDetails: [
          'Suivez la structure hebdomadaire recommandée et conservez les mêmes jours autant que possible.',
          'Commencez avec des charges maîtrisées et terminez la plupart des séries avec 1 à 3 répétitions en réserve.',
          'Augmentez d’abord les répétitions, puis la charge lorsque l’exécution est régulière.'
        ],
        nutritionDetails: [
          'Ajoutez une source claire de protéines aux repas principaux.',
          'Gardez des portions et des horaires réguliers pendant 10 à 14 jours avant d’ajuster.',
          'Utilisez l’exemple de repas et la liste de courses comme base en les adaptant à vos préférences.'
        ]
      },
      planCopy: {
        title: 'Votre Plan Initial Pratique',
        goalTargets: [
          'Commencez avec un léger surplus calorique, un apport stable en protéines et une progression régulière à l’entraînement.',
          'Commencez par des repas réguliers et des séances répétables avant de modifier fortement les calories.',
          'Commencez près des calories de maintien, augmentez les protéines et construisez d’abord votre régularité.',
          'Commencez avec un déficit calorique modéré, beaucoup de protéines et assez de glucides pour bien vous entraîner.'
        ],
        trainingTitles: [
          'Programme Corps Entier sur Deux Jours',
          'Modèle Corps Entier sur Trois Jours pour la Force et la Perte de Graisse',
          'Modèle Haut/Bas du Corps sur Quatre Jours',
          'Programme Structuré en Salle sur Cinq Jours',
          'Programme à Domicile avec Haltères',
          'Programme de Régularité au Poids du Corps',
          'Programme d’Entraînement Hybride',
          'Programme de Reprise sur Deux Jours'
        ],
        nutritionTitles: [
          'Assiette Riche en Protéines',
          'Cadre Initial de Calories et de Macros',
          'Bibliothèque d’Aliments Riches en Protéines',
          'Guide des Portions Sans Suivi',
          'Préparation des Repas sur Trois Jours',
          'Gestion de la Faim et des Envies',
          'Bases de la Nutrition'
        ],
        session: 'Séance',
        focus: 'Travaillez avec une exécution maîtrisée et gardez 1 à 3 répétitions en réserve.',
        weekly: {
          five: ['Jour 1 : haut du corps', 'Jour 2 : bas du corps', 'Jour 3 : poussée', 'Jour 4 : tirage', 'Jour 5 : jambes ou conditionnement'],
          four: ['Lundi : haut du corps A', 'Mardi : bas du corps A', 'Jeudi : haut du corps B', 'Vendredi ou samedi : bas du corps B'],
          three: ['Jour 1 : corps entier A', 'Jour 2 : corps entier B', 'Jour 3 : corps entier C'],
          two: ['Jour 1 : corps entier A', 'Jour 2 : corps entier B', 'Option : 2 à 3 marches légères'],
          home: ['Trois séances courtes par semaine', 'Marches de 10 à 20 minutes lorsque possible', 'Gardez les mêmes jours pour créer une routine'],
          hybrid: ['Jour en salle : mouvements nécessitant plus de charge', 'Jour à domicile : haltères ou poids du corps', 'Troisième jour facultatif : corps entier']
        },
        work: {
          upper: ['Développé couché ou presse poitrine : 3 séries de 6 à 10 répétitions', 'Rowing assis : 3 séries de 8 à 12 répétitions', 'Tirage vertical : 3 séries de 8 à 12 répétitions', 'Élévations latérales : 2 séries de 12 à 15 répétitions', 'Biceps et triceps : 2 séries chacun'],
          lower: ['Squat ou presse à cuisses : 3 séries de 6 à 10 répétitions', 'Soulevé de terre roumain : 3 séries de 8 à 10 répétitions', 'Fentes : 2 séries de 8 à 10 répétitions de chaque côté', 'Leg curl : 2 séries de 10 à 15 répétitions', 'Planche : 2 à 3 séries maîtrisées'],
          home: ['Goblet squat : 3 séries de 10 à 15 répétitions', 'Soulevé de terre roumain avec haltères : 3 séries de 8 à 12 répétitions', 'Développé au sol avec haltères : 3 séries de 8 à 12 répétitions', 'Rowing à un bras : 3 séries de 10 à 12 répétitions de chaque côté', 'Fentes et planche : 2 à 3 séries chacun'],
          body: ['Squat sur chaise : 2 à 4 séries de 10 à 15 répétitions', 'Pompes inclinées : 2 à 4 séries de 6 à 12 répétitions', 'Pont fessier : 2 à 4 séries de 10 à 15 répétitions', 'Rowing avec serviette ou sac : 2 à 4 séries de 8 à 12 répétitions', 'Planche ou dead bug : 2 à 3 séries maîtrisées'],
          full: ['Squat ou presse à cuisses : 3 séries de 8 à 12 répétitions', 'Soulevé de terre roumain ou hip thrust : 3 séries de 8 à 12 répétitions', 'Développé poitrine ou pompes : 3 séries de 8 à 12 répétitions', 'Rowing ou tirage vertical : 3 séries de 8 à 12 répétitions', 'Gainage ou marche inclinée : 2 à 3 séries']
        },
        macros: ['Protéines : incluez une source de protéines à chaque repas principal.', 'Portions : gardez des portions régulières pendant 10 à 14 jours.', 'Glucides : placez-les autour de l’entraînement et des périodes les plus actives.', 'Hydratation : buvez régulièrement tout au long de la journée.'],
        meals: [
          meal('Petit-déjeuner', 'Œufs ou yaourt grec avec avoine et fruits', 'Commencez la journée avec des protéines et des fibres.'),
          meal('Déjeuner', 'Poulet, thon ou tofu avec riz, pommes de terre et légumes', 'Un repas complet facile à répéter.'),
          meal('Collation', 'Yaourt protéiné, fruit ou shake protéiné', 'Évitez les longues périodes sans manger.'),
          meal('Dîner', 'Protéine maigre, légumes et une portion de glucides', 'Gardez une structure simple et régulière.')
        ],
        shopping: ['Œufs', 'Yaourt grec', 'Poulet, poisson ou tofu', 'Riz ou pommes de terre', 'Avoine', 'Légumes', 'Fruits', 'Protéine en poudre si nécessaire'],
        nextSteps: [
          'Suivez cette structure pendant 7 jours avant de changer les exercices ou les repas.',
          'Suivez la tendance du poids, le tour de taille, l’énergie et les performances.',
          'Utilisez le calculateur de macros lorsque vous souhaitez obtenir des objectifs précis.',
          'Contactez Andre pour adapter ce plan à votre emploi du temps, vos préférences et votre objectif.'
        ]
      }
    }),

    it: define('it', {
      summary: {
        goals: {
          'Lose body fat': 'ridurre il grasso corporeo',
          'Build muscle': 'aumentare la massa muscolare',
          'Improve body composition': 'migliorare la composizione corporea',
          'Become fitter and more energetic': 'migliorare forma fisica ed energia',
          'Rebuild consistency': 'ritrovare la costanza',
          'Not sure yet': 'trovare un punto di partenza chiaro'
        },
        unsureDays: 'una routine settimanale realistica',
        trainingDays: 'allenarti {days} a settimana',
        template: 'In base al tuo obiettivo di {goal}, alla possibilità di {days} e alla necessità di superare {barrier}, il punto di partenza migliore è una struttura di allenamento ripetibile abbinata ad abitudini alimentari gestibili.'
      },
      resultTitles: ['Supporto di Coaching Strutturato', 'Piano Strutturato di Allenamento e Nutrizione', 'Piano Base per Aumentare la Massa Muscolare', 'Piano per Ritrovare la Costanza', 'Piano Iniziale per Perdita di Grasso e Composizione Corporea'],
      supportCta: { warm: 'Parla con Andre di un Piano Personalizzato', interested: 'Vedi i Modelli Consigliati', cold: 'Scarica la Guida di 28 Giorni' },
      email: {
        subject: 'Il Tuo Piano Iniziale Garcia Builder È Pronto', greeting: 'Ciao', ready: 'Il Tuo Piano Iniziale Garcia Builder È Pronto',
        bestPath: 'In base alla valutazione, il punto di partenza migliore è', mainGoal: 'Obiettivo principale indicato',
        startHere: 'Inizia qui: le prime 3 azioni',
        actions: ['Scegli i giorni di allenamento dalla struttura qui sotto e inseriscili nel calendario.', 'Completa il primo allenamento usando la sessione descritta in questa email.', 'Imposta la base nutrizionale con la struttura dei pasti e calcola i valori esatti quando sei pronto.'],
        openPlan: 'Apri il Mio Piano Completo', openWorkout: 'Apri la Libreria di Allenamenti', calculate: 'Calcola i Miei Macro',
        helpful: 'Risorse utili', viewPlan: 'Visualizza il Tuo Piano Iniziale', preheader: 'Allenamento, struttura nutrizionale e prime tre azioni sono pronti.',
        training: 'Allenamento di questa settimana', nutrition: 'Obiettivi macro e alimentazione semplice', eating: 'Esempio di giornata alimentare', shopping: 'Lista della spesa iniziale',
        educational: 'Questa valutazione offre indicazioni educative generali e non è una valutazione medica né un programma prescritto individualmente.',
        receiving: 'Ricevi questa email perché hai richiesto il risultato della valutazione e le risorse. Consulta la', privacy: 'Informativa sulla privacy',
        business: 'Personal training e coaching online.', exactTargets: 'Calcola obiettivi esatti di calorie e macro', whatsappAndre: 'Scrivi ad Andre su WhatsApp',
        bookConsultation: 'Prenota una consulenza', emailAndre: 'Invia un’email ad Andre', visitSite: 'Visita Garcia Builder Fitness'
      },
      resourceCopy: {
        titles: ['Guida Iniziale di 28 Giorni per la Perdita di Grasso', 'Programma Full Body di Due Giorni', 'Modello Full Body di Tre Giorni per Forza e Perdita di Grasso', 'Modello Upper/Lower di Quattro Giorni', 'Programma Strutturato in Palestra di Cinque Giorni', 'Allenamento a Casa con Manubri', 'Programma di Costanza a Corpo Libero', 'Programma di Allenamento Ibrido', 'Programma di Ripresa di Due Giorni', 'Piatto Ricco di Proteine', 'Schema Iniziale di Calorie e Macro', 'Libreria di Alimenti Ricchi di Proteine', 'Guida alle Porzioni Senza Monitoraggio', 'Modello di Preparazione Pasti per Tre Giorni', 'Guida alla Gestione di Fame e Voglie', 'Guida ai Fondamenti della Nutrizione'],
        guideDescription: 'Una guida pratica con basi di allenamento, nutrizione e costanza da iniziare oggi.',
        workoutDescription: 'Una struttura di allenamento pratica e ripetibile scelta in base alle tue risposte.',
        nutritionDescription: 'Una struttura alimentare semplice per migliorare proteine, porzioni e costanza.',
        guideAction: 'Apri la guida', workoutAction: 'Apri il piano di allenamento', nutritionAction: 'Apri la guida nutrizionale',
        workoutDetails: ['Segui la struttura settimanale consigliata e mantieni gli stessi giorni quando possibile.', 'Inizia con carichi controllati e termina la maggior parte delle serie con 1-3 ripetizioni in riserva.', 'Aumenta prima le ripetizioni e poi il carico quando l’esecuzione è costante.'],
        nutritionDetails: ['Inserisci una fonte proteica chiara nei pasti principali.', 'Mantieni porzioni e orari costanti per 10-14 giorni prima di modificare.', 'Usa l’esempio dei pasti e la lista della spesa come base, adattandoli alle preferenze.']
      },
      planCopy: {
        title: 'Il Tuo Piano Iniziale Pratico',
        goalTargets: ['Inizia con un piccolo surplus calorico, proteine stabili e progressione nell’allenamento.', 'Inizia con pasti regolari e sessioni ripetibili prima di modificare molto le calorie.', 'Inizia vicino alle calorie di mantenimento, aumenta le proteine e costruisci prima la costanza.', 'Inizia con un deficit calorico moderato, molte proteine e carboidrati sufficienti per allenarti bene.'],
        trainingTitles: ['Programma Full Body di Due Giorni', 'Modello Full Body di Tre Giorni per Forza e Perdita di Grasso', 'Modello Upper/Lower di Quattro Giorni', 'Programma Strutturato in Palestra di Cinque Giorni', 'Programma a Casa con Manubri', 'Programma di Costanza a Corpo Libero', 'Programma di Allenamento Ibrido', 'Programma di Ripresa di Due Giorni'],
        nutritionTitles: ['Piatto Ricco di Proteine', 'Schema Iniziale di Calorie e Macro', 'Libreria di Alimenti Ricchi di Proteine', 'Guida alle Porzioni Senza Monitoraggio', 'Preparazione Pasti per Tre Giorni', 'Gestione di Fame e Voglie', 'Fondamenti della Nutrizione'],
        session: 'Sessione', focus: 'Allenati con esecuzione controllata e lascia 1-3 ripetizioni in riserva.',
        weekly: {
          five: ['Giorno 1: parte superiore', 'Giorno 2: parte inferiore', 'Giorno 3: spinta', 'Giorno 4: tirata', 'Giorno 5: gambe o condizionamento'],
          four: ['Lunedì: parte superiore A', 'Martedì: parte inferiore A', 'Giovedì: parte superiore B', 'Venerdì o sabato: parte inferiore B'],
          three: ['Giorno 1: full body A', 'Giorno 2: full body B', 'Giorno 3: full body C'],
          two: ['Giorno 1: full body A', 'Giorno 2: full body B', 'Opzionale: 2-3 camminate leggere'],
          home: ['Tre sessioni brevi a settimana', 'Camminate di 10-20 minuti quando possibile', 'Mantieni gli stessi giorni per creare costanza'],
          hybrid: ['Giorno in palestra: movimenti che richiedono più carico', 'Giorno a casa: manubri o corpo libero', 'Terzo giorno opzionale: full body']
        },
        work: {
          upper: ['Panca o chest press: 3 serie da 6-10 ripetizioni', 'Rematore seduto: 3 serie da 8-12 ripetizioni', 'Lat machine: 3 serie da 8-12 ripetizioni', 'Alzate laterali: 2 serie da 12-15 ripetizioni', 'Bicipiti e tricipiti: 2 serie ciascuno'],
          lower: ['Squat o leg press: 3 serie da 6-10 ripetizioni', 'Stacco rumeno: 3 serie da 8-10 ripetizioni', 'Affondi: 2 serie da 8-10 ripetizioni per lato', 'Leg curl: 2 serie da 10-15 ripetizioni', 'Plank: 2-3 serie controllate'],
          home: ['Goblet squat: 3 serie da 10-15 ripetizioni', 'Stacco rumeno con manubri: 3 serie da 8-12 ripetizioni', 'Floor press con manubri: 3 serie da 8-12 ripetizioni', 'Rematore a un braccio: 3 serie da 10-12 ripetizioni per lato', 'Affondi e plank: 2-3 serie ciascuno'],
          body: ['Squat su sedia: 2-4 serie da 10-15 ripetizioni', 'Piegamenti inclinati: 2-4 serie da 6-12 ripetizioni', 'Ponte glutei: 2-4 serie da 10-15 ripetizioni', 'Rematore con asciugamano o zaino: 2-4 serie da 8-12 ripetizioni', 'Plank o dead bug: 2-3 serie controllate'],
          full: ['Squat o leg press: 3 serie da 8-12 ripetizioni', 'Stacco rumeno o hip thrust: 3 serie da 8-12 ripetizioni', 'Chest press o piegamenti: 3 serie da 8-12 ripetizioni', 'Rematore o lat machine: 3 serie da 8-12 ripetizioni', 'Core o camminata inclinata: 2-3 serie']
        },
        macros: ['Proteine: inserisci una fonte proteica in ogni pasto principale.', 'Porzioni: mantieni porzioni costanti per 10-14 giorni.', 'Carboidrati: concentrali intorno all’allenamento e ai momenti più attivi.', 'Idratazione: bevi regolarmente durante la giornata.'],
        meals: [meal('Colazione', 'Uova o yogurt greco con avena e frutta', 'Inizia la giornata con proteine e fibre.'), meal('Pranzo', 'Pollo, tonno o tofu con riso, patate e verdure', 'Un pasto completo facile da ripetere.'), meal('Spuntino', 'Yogurt proteico, frutta o frullato proteico', 'Evita intervalli troppo lunghi tra i pasti.'), meal('Cena', 'Proteine magre, verdure e una porzione di carboidrati', 'Mantieni una struttura semplice e costante.')],
        shopping: ['Uova', 'Yogurt greco', 'Pollo, pesce o tofu', 'Riso o patate', 'Avena', 'Verdure', 'Frutta', 'Proteine in polvere se necessarie'],
        nextSteps: ['Segui questa struttura per 7 giorni prima di cambiare esercizi o pasti.', 'Monitora andamento del peso, girovita, energia e prestazioni.', 'Usa il calcolatore macro quando vuoi trasformare le indicazioni in obiettivi precisi.', 'Contatta Andre per adattare il piano ai tuoi orari, preferenze e obiettivo.']
      }
    }),

    de: define('de', {
      summary: {
        goals: { 'Lose body fat': 'Körperfett zu reduzieren', 'Build muscle': 'Muskeln aufzubauen', 'Improve body composition': 'die Körperzusammensetzung zu verbessern', 'Become fitter and more energetic': 'Fitness und Energie zu steigern', 'Rebuild consistency': 'wieder Beständigkeit aufzubauen', 'Not sure yet': 'einen klaren Startpunkt zu finden' },
        unsureDays: 'eine realistische Wochenroutine', trainingDays: '{days} pro Woche zu trainieren',
        template: 'Ausgehend von deinem Ziel, {goal}, deiner Möglichkeit, {days}, und der Herausforderung {barrier} ist dein bester Startpunkt eine wiederholbare Trainingsstruktur in Kombination mit umsetzbaren Ernährungsgewohnheiten.'
      },
      resultTitles: ['Strukturierte Coaching-Unterstützung', 'Strukturierter Trainings- und Ernährungsplan', 'Grundlagenplan für Muskelaufbau', 'Plan für Neue Beständigkeit', 'Startplan für Fettverlust und Körperzusammensetzung'],
      supportCta: { warm: 'Einen Individuellen Plan mit Andre Besprechen', interested: 'Meine Empfohlenen Vorlagen Ansehen', cold: 'Meinen 28-Tage-Guide Herunterladen' },
      email: {
        subject: 'Dein Garcia Builder Startplan Ist Bereit', greeting: 'Hallo', ready: 'Dein Garcia Builder Startplan Ist Bereit', bestPath: 'Basierend auf deiner Einschätzung ist dein bester Startpunkt', mainGoal: 'Angegebenes Hauptziel',
        startHere: 'Starte hier: deine ersten 3 Schritte', actions: ['Wähle deine Trainingstage aus der Wochenstruktur und trage sie in deinen Kalender ein.', 'Absolviere dein erstes Training mit der in dieser E-Mail beschriebenen Einheit.', 'Lege mit der Mahlzeitenstruktur deine Ernährungsbasis fest und berechne genaue Ziele, sobald du bereit bist.'],
        openPlan: 'Meinen Vollständigen Plan Öffnen', openWorkout: 'Trainingsbibliothek Öffnen', calculate: 'Meine Makros Berechnen', helpful: 'Hilfreiche Ressourcen', viewPlan: 'Deinen Startplan Ansehen',
        preheader: 'Training, Ernährungsstruktur und deine ersten drei Schritte sind bereit.', training: 'Training in dieser Woche', nutrition: 'Makroziele und einfache Ernährung', eating: 'Einfacher Beispieltag', shopping: 'Einkaufsliste für den Start',
        educational: 'Diese Einschätzung bietet allgemeine Bildungsinformationen und ist weder eine medizinische Beurteilung noch ein individuell verschriebenes Programm.',
        receiving: 'Du erhältst diese E-Mail, weil du dein Ergebnis und die Ressourcen angefordert hast. Lies die', privacy: 'Datenschutzerklärung', business: 'Personal Training und Online Coaching.',
        exactTargets: 'Genaue Kalorien- und Makroziele berechnen', whatsappAndre: 'Andre über WhatsApp schreiben', bookConsultation: 'Beratung buchen', emailAndre: 'Andre eine E-Mail senden', visitSite: 'Garcia Builder Fitness besuchen'
      },
      resourceCopy: {
        titles: ['28-Tage-Startguide für Fettverlust', 'Zwei-Tage-Ganzkörper-Startplan', 'Drei-Tage-Ganzkörperplan für Kraft und Fettverlust', 'Vier-Tage-Oberkörper-/Unterkörperplan', 'Strukturierter Fünf-Tage-Fitnessstudio-Plan', 'Kurzhanteltraining für zu Hause', 'Startplan für Beständigkeit mit Körpergewicht', 'Hybrid-Trainingsplan', 'Zwei-Tage-Wiedereinstiegsprogramm', 'Proteinreicher Teller-Baukasten', 'Startmodell für Kalorien und Makros', 'Bibliothek Proteinreicher Lebensmittel', 'Portionsguide Ohne Tracking', 'Drei-Tage-Meal-Prep-Vorlage', 'Guide für Hunger und Heißhunger', 'Grundlagen der Ernährung'],
        guideDescription: 'Ein praktischer Guide mit Grundlagen für Training, Ernährung und Beständigkeit, den du heute beginnen kannst.',
        workoutDescription: 'Eine praktische, wiederholbare Trainingsstruktur, ausgewählt anhand deiner Antworten.',
        nutritionDescription: 'Eine einfache Ernährungsstruktur für bessere Proteinversorgung, Portionen und Beständigkeit.',
        guideAction: 'Guide öffnen', workoutAction: 'Trainingsplan öffnen', nutritionAction: 'Ernährungsguide öffnen',
        workoutDetails: ['Folge der empfohlenen Wochenstruktur und halte möglichst dieselben Trainingstage ein.', 'Beginne mit kontrollierten Gewichten und beende die meisten Sätze mit 1-3 Wiederholungen in Reserve.', 'Steigere zuerst die Wiederholungen und danach das Gewicht, wenn die Ausführung stabil ist.'],
        nutritionDetails: ['Nimm zu jeder Hauptmahlzeit eine klare Proteinquelle.', 'Halte Portionen und Essenszeiten 10-14 Tage konstant, bevor du etwas anpasst.', 'Nutze die Beispielmahlzeiten und Einkaufsliste als Basis und passe sie an deine Vorlieben an.']
      },
      planCopy: {
        title: 'Dein Praktischer Startplan',
        goalTargets: ['Starte mit einem kleinen Kalorienüberschuss, stabiler Proteinzufuhr und progressiver Trainingsleistung.', 'Starte mit regelmäßigen Mahlzeiten und wiederholbaren Einheiten, bevor du Kalorien stark veränderst.', 'Starte nahe an den Erhaltungskalorien, erhöhe Protein und baue zuerst Trainingsbeständigkeit auf.', 'Starte mit einem moderaten Kaloriendefizit, viel Protein und genügend Kohlenhydraten für gutes Training.'],
        trainingTitles: ['Zwei-Tage-Ganzkörper-Startplan', 'Drei-Tage-Ganzkörperplan für Kraft und Fettverlust', 'Vier-Tage-Oberkörper-/Unterkörperplan', 'Strukturierter Fünf-Tage-Fitnessstudio-Plan', 'Kurzhanteltraining für zu Hause', 'Startplan für Beständigkeit mit Körpergewicht', 'Hybrid-Trainingsplan', 'Zwei-Tage-Wiedereinstiegsprogramm'],
        nutritionTitles: ['Proteinreicher Teller-Baukasten', 'Startmodell für Kalorien und Makros', 'Bibliothek Proteinreicher Lebensmittel', 'Portionsguide Ohne Tracking', 'Drei-Tage-Meal-Prep', 'Hunger- und Heißhunger-Management', 'Grundlagen der Ernährung'],
        session: 'Einheit', focus: 'Trainiere mit kontrollierter Ausführung und lasse 1-3 Wiederholungen in Reserve.',
        weekly: {
          five: ['Tag 1: Oberkörper', 'Tag 2: Unterkörper', 'Tag 3: Drücken', 'Tag 4: Ziehen', 'Tag 5: Beine oder Kondition'],
          four: ['Montag: Oberkörper A', 'Dienstag: Unterkörper A', 'Donnerstag: Oberkörper B', 'Freitag oder Samstag: Unterkörper B'],
          three: ['Tag 1: Ganzkörper A', 'Tag 2: Ganzkörper B', 'Tag 3: Ganzkörper C'],
          two: ['Tag 1: Ganzkörper A', 'Tag 2: Ganzkörper B', 'Optional: 2-3 lockere Spaziergänge'],
          home: ['Drei kurze Einheiten pro Woche', 'Wenn möglich 10-20 Minuten spazieren', 'Halte dieselben Tage ein, um Beständigkeit aufzubauen'],
          hybrid: ['Fitnessstudio: Bewegungen mit höherer Last', 'Zu Hause: Kurzhanteln oder Körpergewicht', 'Optionaler dritter Tag: Ganzkörper']
        },
        work: {
          upper: ['Bankdrücken oder Brustpresse: 3 Sätze mit 6-10 Wiederholungen', 'Sitzendes Rudern: 3 Sätze mit 8-12 Wiederholungen', 'Latzug: 3 Sätze mit 8-12 Wiederholungen', 'Seitheben: 2 Sätze mit 12-15 Wiederholungen', 'Bizeps und Trizeps: jeweils 2 Sätze'],
          lower: ['Kniebeuge oder Beinpresse: 3 Sätze mit 6-10 Wiederholungen', 'Rumänisches Kreuzheben: 3 Sätze mit 8-10 Wiederholungen', 'Ausfallschritte: 2 Sätze mit 8-10 Wiederholungen je Seite', 'Beinbeuger: 2 Sätze mit 10-15 Wiederholungen', 'Plank: 2-3 kontrollierte Sätze'],
          home: ['Goblet Squat: 3 Sätze mit 10-15 Wiederholungen', 'Rumänisches Kreuzheben mit Kurzhanteln: 3 Sätze mit 8-12 Wiederholungen', 'Kurzhantel-Bodendrücken: 3 Sätze mit 8-12 Wiederholungen', 'Einarmiges Rudern: 3 Sätze mit 10-12 Wiederholungen je Seite', 'Ausfallschritte und Plank: jeweils 2-3 Sätze'],
          body: ['Kniebeuge zum Stuhl: 2-4 Sätze mit 10-15 Wiederholungen', 'Erhöhte Liegestütze: 2-4 Sätze mit 6-12 Wiederholungen', 'Glute Bridge: 2-4 Sätze mit 10-15 Wiederholungen', 'Rudern mit Handtuch oder Rucksack: 2-4 Sätze mit 8-12 Wiederholungen', 'Plank oder Dead Bug: 2-3 kontrollierte Sätze'],
          full: ['Kniebeuge oder Beinpresse: 3 Sätze mit 8-12 Wiederholungen', 'Rumänisches Kreuzheben oder Hip Thrust: 3 Sätze mit 8-12 Wiederholungen', 'Brustpresse oder Liegestütze: 3 Sätze mit 8-12 Wiederholungen', 'Rudern oder Latzug: 3 Sätze mit 8-12 Wiederholungen', 'Core oder Steigungslauf: 2-3 Sätze']
        },
        macros: ['Protein: Baue in jede Hauptmahlzeit eine Proteinquelle ein.', 'Portionen: Halte deine Portionen 10-14 Tage konstant.', 'Kohlenhydrate: Nutze sie rund ums Training und in aktiven Tagesphasen.', 'Flüssigkeit: Trinke regelmäßig über den Tag verteilt.'],
        meals: [meal('Frühstück', 'Eier oder griechischer Joghurt mit Haferflocken und Obst', 'Starte mit Protein und Ballaststoffen.'), meal('Mittagessen', 'Hähnchen, Thunfisch oder Tofu mit Reis, Kartoffeln und Gemüse', 'Eine vollständige, leicht wiederholbare Mahlzeit.'), meal('Snack', 'Proteinjoghurt, Obst oder Proteinshake', 'Vermeidet lange Pausen und starken Hunger.'), meal('Abendessen', 'Mageres Protein, Gemüse und eine Portion Kohlenhydrate', 'Halte die Struktur einfach und konstant.')],
        shopping: ['Eier', 'Griechischer Joghurt', 'Hähnchen, Fisch oder Tofu', 'Reis oder Kartoffeln', 'Haferflocken', 'Gemüse', 'Obst', 'Proteinpulver bei Bedarf'],
        nextSteps: ['Folge dieser Struktur 7 Tage, bevor du Übungen oder Mahlzeiten änderst.', 'Beobachte Gewichtstrend, Taillenumfang, Energie und Trainingsleistung.', 'Nutze den Makro-Rechner, wenn du genaue Zielwerte möchtest.', 'Kontaktiere Andre, um den Plan an Zeitplan, Vorlieben und Ziel anzupassen.']
      }
    }),

    pl: define('pl', {
      summary: {
        goals: { 'Lose body fat': 'zmniejszyć poziom tkanki tłuszczowej', 'Build muscle': 'zbudować mięśnie', 'Improve body composition': 'poprawić skład ciała', 'Become fitter and more energetic': 'poprawić kondycję i energię', 'Rebuild consistency': 'odzyskać regularność', 'Not sure yet': 'znaleźć jasny punkt startowy' },
        unsureDays: 'realistyczny tygodniowy rytm', trainingDays: 'trenować {days} w tygodniu',
        template: 'Biorąc pod uwagę cel, aby {goal}, możliwość, by {days}, oraz przeszkodę związaną z {barrier}, najlepszym początkiem będzie powtarzalna struktura treningu połączona z prostymi nawykami żywieniowymi.'
      },
      resultTitles: ['Ustrukturyzowane Wsparcie Trenerskie', 'Ustrukturyzowany Plan Treningu i Żywienia', 'Plan Podstaw Budowy Mięśni', 'Plan Odbudowy Regularności', 'Plan Startowy Redukcji Tkanki Tłuszczowej i Poprawy Sylwetki'],
      supportCta: { warm: 'Omów Indywidualny Plan z Andre', interested: 'Zobacz Polecane Szablony', cold: 'Pobierz 28-Dniowy Przewodnik' },
      email: {
        subject: 'Twój Plan Startowy Garcia Builder Jest Gotowy', greeting: 'Cześć', ready: 'Twój Plan Startowy Garcia Builder Jest Gotowy', bestPath: 'Na podstawie oceny najlepszym punktem startowym jest', mainGoal: 'Główny podany cel',
        startHere: 'Zacznij tutaj: pierwsze 3 działania', actions: ['Wybierz dni treningowe z poniższej struktury i wpisz je do kalendarza.', 'Wykonaj pierwszy trening według sesji opisanej w tej wiadomości.', 'Ustal podstawy żywienia według poniższego schematu posiłków, a dokładne cele oblicz, gdy będziesz gotowy.'],
        openPlan: 'Otwórz Pełny Plan', openWorkout: 'Otwórz Bibliotekę Treningów', calculate: 'Oblicz Moje Makro', helpful: 'Przydatne materiały', viewPlan: 'Zobacz Swój Plan Startowy',
        preheader: 'Trening, struktura żywienia i pierwsze trzy działania są gotowe.', training: 'Trening na ten tydzień', nutrition: 'Cele makro i proste żywienie', eating: 'Przykładowy prosty dzień jedzenia', shopping: 'Startowa lista zakupów',
        educational: 'Ta ocena zawiera ogólne informacje edukacyjne i nie jest oceną medyczną ani indywidualnie zaleconym programem.',
        receiving: 'Otrzymujesz tę wiadomość, ponieważ poprosiłeś o wynik oceny i materiały. Przeczytaj', privacy: 'Politykę prywatności', business: 'Trening personalny i coaching online.',
        exactTargets: 'Oblicz dokładne cele kalorii i makro', whatsappAndre: 'Napisz do Andre na WhatsAppie', bookConsultation: 'Umów konsultację', emailAndre: 'Wyślij email do Andre', visitSite: 'Odwiedź Garcia Builder Fitness'
      },
      resourceCopy: {
        titles: ['28-Dniowy Przewodnik Startowy Redukcji', 'Dwudniowy Plan Całego Ciała', 'Trzydniowy Plan Całego Ciała dla Siły i Redukcji', 'Czterodniowy Plan Góra/Dół', 'Pięciodniowy Plan Treningu na Siłowni', 'Plan Domowy z Hantlami', 'Plan Regularności z Masą Ciała', 'Hybrydowy Plan Treningowy', 'Dwudniowy Program Powrotu', 'Kreator Talerza Wysokobiałkowego', 'Startowe Ramy Kalorii i Makro', 'Biblioteka Produktów Wysokobiałkowych', 'Przewodnik Porcji Bez Liczenia', 'Trzydniowy Szablon Przygotowania Posiłków', 'Przewodnik Kontroli Głodu i Zachcianek', 'Podstawy Żywienia'],
        guideDescription: 'Praktyczny przewodnik z podstawami treningu, żywienia i regularności, który możesz zacząć dziś.',
        workoutDescription: 'Praktyczna, powtarzalna struktura treningu dobrana na podstawie Twoich odpowiedzi.',
        nutritionDescription: 'Prosta struktura żywienia poprawiająca białko, porcje i regularność.',
        guideAction: 'Otwórz przewodnik', workoutAction: 'Otwórz plan treningowy', nutritionAction: 'Otwórz przewodnik żywieniowy',
        workoutDetails: ['Stosuj polecaną strukturę tygodnia i utrzymuj te same dni, gdy to możliwe.', 'Zacznij od kontrolowanych obciążeń i kończ większość serii z zapasem 1-3 powtórzeń.', 'Najpierw zwiększaj powtórzenia, a potem ciężar, gdy technika jest stabilna.'],
        nutritionDetails: ['Dodaj wyraźne źródło białka do głównych posiłków.', 'Utrzymuj porcje i pory posiłków przez 10-14 dni przed zmianami.', 'Użyj przykładowych posiłków i listy zakupów jako bazy dopasowanej do preferencji.']
      },
      planCopy: {
        title: 'Twój Praktyczny Plan Startowy',
        goalTargets: ['Zacznij od małej nadwyżki kalorii, stabilnej podaży białka i progresji treningowej.', 'Zacznij od regularnych posiłków i powtarzalnych sesji, zanim mocno zmienisz kalorie.', 'Zacznij w pobliżu kalorii utrzymania, zwiększ białko i najpierw zbuduj regularność.', 'Zacznij od umiarkowanego deficytu kalorii, wysokiego białka i wystarczającej ilości węglowodanów do treningu.'],
        trainingTitles: ['Dwudniowy Plan Całego Ciała', 'Trzydniowy Plan Całego Ciała dla Siły i Redukcji', 'Czterodniowy Plan Góra/Dół', 'Pięciodniowy Plan Treningu na Siłowni', 'Plan Domowy z Hantlami', 'Plan Regularności z Masą Ciała', 'Hybrydowy Plan Treningowy', 'Dwudniowy Program Powrotu'],
        nutritionTitles: ['Kreator Talerza Wysokobiałkowego', 'Startowe Ramy Kalorii i Makro', 'Biblioteka Produktów Wysokobiałkowych', 'Przewodnik Porcji Bez Liczenia', 'Trzydniowe Przygotowanie Posiłków', 'Kontrola Głodu i Zachcianek', 'Podstawy Żywienia'],
        session: 'Sesja', focus: 'Ćwicz z kontrolowaną techniką i zostaw 1-3 powtórzenia w zapasie.',
        weekly: {
          five: ['Dzień 1: góra ciała', 'Dzień 2: dół ciała', 'Dzień 3: pchanie', 'Dzień 4: przyciąganie', 'Dzień 5: nogi lub kondycja'],
          four: ['Poniedziałek: góra A', 'Wtorek: dół A', 'Czwartek: góra B', 'Piątek lub sobota: dół B'],
          three: ['Dzień 1: całe ciało A', 'Dzień 2: całe ciało B', 'Dzień 3: całe ciało C'],
          two: ['Dzień 1: całe ciało A', 'Dzień 2: całe ciało B', 'Opcjonalnie: 2-3 lekkie spacery'],
          home: ['Trzy krótkie sesje w tygodniu', 'Spacery 10-20 minut, gdy to możliwe', 'Utrzymuj te same dni, aby budować regularność'],
          hybrid: ['Siłownia: ruchy wymagające większego obciążenia', 'Dom: hantle lub masa ciała', 'Opcjonalny trzeci dzień: całe ciało']
        },
        work: {
          upper: ['Wyciskanie na ławce lub maszynie: 3 serie po 6-10 powtórzeń', 'Wiosłowanie siedząc: 3 serie po 8-12 powtórzeń', 'Ściąganie drążka: 3 serie po 8-12 powtórzeń', 'Unoszenie bokiem: 2 serie po 12-15 powtórzeń', 'Biceps i triceps: po 2 serie'],
          lower: ['Przysiad lub suwnica: 3 serie po 6-10 powtórzeń', 'Martwy ciąg rumuński: 3 serie po 8-10 powtórzeń', 'Wykroki: 2 serie po 8-10 powtórzeń na stronę', 'Uginanie nóg: 2 serie po 10-15 powtórzeń', 'Deska: 2-3 kontrolowane serie'],
          home: ['Goblet squat: 3 serie po 10-15 powtórzeń', 'Martwy ciąg rumuński z hantlami: 3 serie po 8-12 powtórzeń', 'Wyciskanie hantli na podłodze: 3 serie po 8-12 powtórzeń', 'Wiosłowanie jednorącz: 3 serie po 10-12 powtórzeń na stronę', 'Wykroki i deska: po 2-3 serie'],
          body: ['Przysiad do krzesła: 2-4 serie po 10-15 powtórzeń', 'Pompki na podwyższeniu: 2-4 serie po 6-12 powtórzeń', 'Most biodrowy: 2-4 serie po 10-15 powtórzeń', 'Wiosłowanie ręcznikiem lub plecakiem: 2-4 serie po 8-12 powtórzeń', 'Deska lub dead bug: 2-3 kontrolowane serie'],
          full: ['Przysiad lub suwnica: 3 serie po 8-12 powtórzeń', 'Martwy ciąg rumuński lub hip thrust: 3 serie po 8-12 powtórzeń', 'Wyciskanie lub pompki: 3 serie po 8-12 powtórzeń', 'Wiosłowanie lub ściąganie drążka: 3 serie po 8-12 powtórzeń', 'Core lub marsz pod górę: 2-3 serie']
        },
        macros: ['Białko: dodaj źródło białka do każdego głównego posiłku.', 'Porcje: utrzymuj regularne porcje przez 10-14 dni.', 'Węglowodany: umieszczaj je wokół treningu i najbardziej aktywnych pór dnia.', 'Nawodnienie: pij regularnie przez cały dzień.'],
        meals: [meal('Śniadanie', 'Jajka lub jogurt grecki z płatkami owsianymi i owocami', 'Zacznij dzień od białka i błonnika.'), meal('Obiad', 'Kurczak, tuńczyk lub tofu z ryżem, ziemniakami i warzywami', 'Pełny posiłek łatwy do powtarzania.'), meal('Przekąska', 'Jogurt proteinowy, owoc lub shake białkowy', 'Unikaj długich przerw i nadmiernego głodu.'), meal('Kolacja', 'Chude białko, warzywa i porcja węglowodanów', 'Utrzymuj prostą, regularną strukturę.')],
        shopping: ['Jajka', 'Jogurt grecki', 'Kurczak, ryba lub tofu', 'Ryż lub ziemniaki', 'Płatki owsiane', 'Warzywa', 'Owoce', 'Odżywka białkowa w razie potrzeby'],
        nextSteps: ['Stosuj tę strukturę przez 7 dni przed zmianą ćwiczeń lub posiłków.', 'Śledź trend masy ciała, obwód talii, energię i wyniki treningowe.', 'Użyj kalkulatora makro, gdy chcesz uzyskać dokładne cele.', 'Skontaktuj się z Andre, aby dopasować plan do grafiku, preferencji i celu.']
      }
    }),

    ro: define('ro', {
      summary: {
        goals: { 'Lose body fat': 'a reduce grăsimea corporală', 'Build muscle': 'a dezvolta masa musculară', 'Improve body composition': 'a îmbunătăți compoziția corporală', 'Become fitter and more energetic': 'a îmbunătăți condiția fizică și energia', 'Rebuild consistency': 'a recâștiga consecvența', 'Not sure yet': 'a găsi un punct de pornire clar' },
        unsureDays: 'o rutină săptămânală realistă', trainingDays: 'a te antrena {days} pe săptămână',
        template: 'Pe baza obiectivului tău de {goal}, a posibilității de {days} și a dificultății legate de {barrier}, cel mai bun punct de pornire este o structură de antrenament repetabilă, combinată cu obiceiuri alimentare ușor de gestionat.'
      },
      resultTitles: ['Sprijin Structurat de Coaching', 'Plan Structurat de Antrenament și Nutriție', 'Plan de Bază pentru Dezvoltarea Musculară', 'Plan pentru Refacerea Consecvenței', 'Plan Inițial pentru Pierderea Grăsimii și Compoziție Corporală'],
      supportCta: { warm: 'Discută un Plan Personalizat cu Andre', interested: 'Vezi Șabloanele Recomandate', cold: 'Descarcă Ghidul de 28 de Zile' },
      email: {
        subject: 'Planul Tău Inițial Garcia Builder Este Gata', greeting: 'Salut', ready: 'Planul Tău Inițial Garcia Builder Este Gata', bestPath: 'Pe baza evaluării, cel mai bun punct de pornire este', mainGoal: 'Obiectiv principal declarat',
        startHere: 'Începe aici: primele 3 acțiuni', actions: ['Alege zilele de antrenament din structura de mai jos și adaugă-le în calendar.', 'Finalizează primul antrenament folosind sesiunea descrisă în acest email.', 'Stabilește baza nutrițională cu structura meselor de mai jos, apoi calculează țintele exacte când ești pregătit.'],
        openPlan: 'Deschide Planul Meu Complet', openWorkout: 'Deschide Biblioteca de Antrenamente', calculate: 'Calculează Macronutrienții', helpful: 'Resurse utile', viewPlan: 'Vezi Planul Tău Inițial',
        preheader: 'Antrenamentul, structura nutrițională și primele trei acțiuni sunt gata.', training: 'Antrenamentul din această săptămână', nutrition: 'Ținte de macronutrienți și alimentație simplă', eating: 'Exemplu simplu de meniu zilnic', shopping: 'Listă inițială de cumpărături',
        educational: 'Această evaluare oferă informații educaționale generale și nu reprezintă o evaluare medicală sau un program prescris individual.',
        receiving: 'Primești acest email deoarece ai solicitat rezultatul evaluării și resursele. Consultă', privacy: 'Politica de confidențialitate', business: 'Antrenament personal și coaching online.',
        exactTargets: 'Calculează țintele exacte de calorii și macronutrienți', whatsappAndre: 'Scrie-i lui Andre pe WhatsApp', bookConsultation: 'Programează o consultație', emailAndre: 'Trimite-i un email lui Andre', visitSite: 'Vizitează Garcia Builder Fitness'
      },
      resourceCopy: {
        titles: ['Ghid de 28 de Zile pentru Pierderea Grăsimii', 'Plan Full-Body de Două Zile', 'Plan Full-Body de Trei Zile pentru Forță și Pierderea Grăsimii', 'Plan Superior/Inferior de Patru Zile', 'Plan Structurat de Sală pe Cinci Zile', 'Antrenament Acasă cu Gantere', 'Plan de Consecvență cu Greutatea Corpului', 'Plan de Antrenament Hibrid', 'Program de Revenire de Două Zile', 'Constructor de Farfurie Bogată în Proteine', 'Cadru Inițial de Calorii și Macronutrienți', 'Bibliotecă de Alimente Bogate în Proteine', 'Ghid de Porții Fără Monitorizare', 'Plan de Pregătire a Meselor pentru Trei Zile', 'Ghid pentru Gestionarea Foamei și Poftelor', 'Fundamentele Nutriției'],
        guideDescription: 'Un ghid practic cu bazele antrenamentului, nutriției și consecvenței, pe care îl poți începe astăzi.',
        workoutDescription: 'O structură de antrenament practică și repetabilă, aleasă pe baza răspunsurilor tale.',
        nutritionDescription: 'O structură alimentară simplă pentru proteine, porții și consecvență mai bune.',
        guideAction: 'Deschide ghidul', workoutAction: 'Deschide planul de antrenament', nutritionAction: 'Deschide ghidul de nutriție',
        workoutDetails: ['Urmează structura săptămânală recomandată și păstrează aceleași zile când este posibil.', 'Începe cu greutăți controlate și încheie majoritatea seturilor cu 1-3 repetări în rezervă.', 'Crește mai întâi repetările și apoi greutatea când execuția este stabilă.'],
        nutritionDetails: ['Include o sursă clară de proteine la mesele principale.', 'Păstrează porțiile și orele meselor constante timp de 10-14 zile înainte de ajustări.', 'Folosește exemplele de mese și lista de cumpărături ca bază, adaptate preferințelor tale.']
      },
      planCopy: {
        title: 'Planul Tău Inițial Practic',
        goalTargets: ['Începe cu un mic surplus caloric, aport stabil de proteine și progres la antrenament.', 'Începe cu mese constante și sesiuni repetabile înainte de schimbări mari ale caloriilor.', 'Începe aproape de caloriile de menținere, crește proteinele și construiește mai întâi consecvența.', 'Începe cu un deficit caloric moderat, multe proteine și suficienți carbohidrați pentru antrenament.'],
        trainingTitles: ['Plan Full-Body de Două Zile', 'Plan Full-Body de Trei Zile pentru Forță și Pierderea Grăsimii', 'Plan Superior/Inferior de Patru Zile', 'Plan Structurat de Sală pe Cinci Zile', 'Antrenament Acasă cu Gantere', 'Plan de Consecvență cu Greutatea Corpului', 'Plan de Antrenament Hibrid', 'Program de Revenire de Două Zile'],
        nutritionTitles: ['Farfurie Bogată în Proteine', 'Cadru Inițial de Calorii și Macronutrienți', 'Bibliotecă de Alimente Bogate în Proteine', 'Ghid de Porții Fără Monitorizare', 'Pregătirea Meselor pentru Trei Zile', 'Gestionarea Foamei și Poftelor', 'Fundamentele Nutriției'],
        session: 'Sesiunea', focus: 'Antrenează-te cu execuție controlată și păstrează 1-3 repetări în rezervă.',
        weekly: {
          five: ['Ziua 1: partea superioară', 'Ziua 2: partea inferioară', 'Ziua 3: împins', 'Ziua 4: tras', 'Ziua 5: picioare sau condiționare'],
          four: ['Luni: superior A', 'Marți: inferior A', 'Joi: superior B', 'Vineri sau sâmbătă: inferior B'],
          three: ['Ziua 1: full-body A', 'Ziua 2: full-body B', 'Ziua 3: full-body C'],
          two: ['Ziua 1: full-body A', 'Ziua 2: full-body B', 'Opțional: 2-3 plimbări ușoare'],
          home: ['Trei sesiuni scurte pe săptămână', 'Plimbări de 10-20 de minute când este posibil', 'Păstrează aceleași zile pentru consecvență'],
          hybrid: ['Zi la sală: mișcări care cer greutăți mai mari', 'Zi acasă: gantere sau greutatea corpului', 'A treia zi opțională: full-body']
        },
        work: {
          upper: ['Împins la bancă sau presă pentru piept: 3 seturi x 6-10 repetări', 'Ramat din șezut: 3 seturi x 8-12 repetări', 'Tracțiuni la helcometru: 3 seturi x 8-12 repetări', 'Ridicări laterale: 2 seturi x 12-15 repetări', 'Biceps și triceps: câte 2 seturi'],
          lower: ['Genuflexiuni sau presă: 3 seturi x 6-10 repetări', 'Îndreptări românești: 3 seturi x 8-10 repetări', 'Fandări: 2 seturi x 8-10 repetări pe parte', 'Flexii pentru femurali: 2 seturi x 10-15 repetări', 'Planșă: 2-3 seturi controlate'],
          home: ['Goblet squat: 3 seturi x 10-15 repetări', 'Îndreptări românești cu gantere: 3 seturi x 8-12 repetări', 'Împins cu gantere din culcat pe podea: 3 seturi x 8-12 repetări', 'Ramat cu un braț: 3 seturi x 10-12 repetări pe parte', 'Fandări și planșă: câte 2-3 seturi'],
          body: ['Genuflexiuni la scaun: 2-4 seturi x 10-15 repetări', 'Flotări înclinate: 2-4 seturi x 6-12 repetări', 'Pod pentru fesieri: 2-4 seturi x 10-15 repetări', 'Ramat cu prosop sau rucsac: 2-4 seturi x 8-12 repetări', 'Planșă sau dead bug: 2-3 seturi controlate'],
          full: ['Genuflexiuni sau presă: 3 seturi x 8-12 repetări', 'Îndreptări românești sau hip thrust: 3 seturi x 8-12 repetări', 'Presă pentru piept sau flotări: 3 seturi x 8-12 repetări', 'Ramat sau tracțiuni la helcometru: 3 seturi x 8-12 repetări', 'Core sau mers înclinat: 2-3 seturi']
        },
        macros: ['Proteine: include o sursă de proteine la fiecare masă principală.', 'Porții: păstrează porțiile constante timp de 10-14 zile.', 'Carbohidrați: consumă-i în jurul antrenamentului și în perioadele active.', 'Hidratare: bea apă regulat pe parcursul zilei.'],
        meals: [meal('Mic dejun', 'Ouă sau iaurt grecesc cu ovăz și fructe', 'Începe ziua cu proteine și fibre.'), meal('Prânz', 'Pui, ton sau tofu cu orez, cartofi și legume', 'O masă completă și ușor de repetat.'), meal('Gustare', 'Iaurt proteic, fruct sau shake proteic', 'Evită pauzele lungi și foamea excesivă.'), meal('Cină', 'Proteină slabă, legume și o porție de carbohidrați', 'Păstrează o structură simplă și constantă.')],
        shopping: ['Ouă', 'Iaurt grecesc', 'Pui, pește sau tofu', 'Orez sau cartofi', 'Ovăz', 'Legume', 'Fructe', 'Pudră proteică dacă este necesar'],
        nextSteps: ['Urmează această structură timp de 7 zile înainte de a schimba exercițiile sau mesele.', 'Urmărește tendința greutății, talia, energia și performanța.', 'Folosește calculatorul de macronutrienți când dorești ținte exacte.', 'Contactează-l pe Andre pentru adaptarea planului la program, preferințe și obiectiv.']
      }
    }),

    ar: define('ar', {
      summary: {
        goals: { 'Lose body fat': 'خفض دهون الجسم', 'Build muscle': 'بناء العضلات', 'Improve body composition': 'تحسين تكوين الجسم', 'Become fitter and more energetic': 'تحسين اللياقة والطاقة', 'Rebuild consistency': 'استعادة الانتظام', 'Not sure yet': 'إيجاد نقطة بداية واضحة' },
        unsureDays: 'روتين أسبوعي واقعي', trainingDays: 'التدرب {days} أسبوعياً',
        template: 'بناءً على هدفك في {goal}، وقدرتك على {days}، والعمل على تجاوز {barrier}، فإن أفضل نقطة بداية هي خطة تدريب قابلة للتكرار مع عادات غذائية سهلة التطبيق.'
      },
      resultTitles: ['دعم تدريبي منظم', 'خطة تدريب وتغذية منظمة', 'خطة تأسيس لبناء العضلات', 'خطة استعادة الانتظام', 'خطة بداية لخسارة الدهون وتحسين تكوين الجسم'],
      supportCta: { warm: 'ناقش خطة مخصصة مع Andre', interested: 'اعرض القوالب الموصى بها', cold: 'حمّل دليل الـ 28 يوماً' },
      email: {
        subject: 'خطة Garcia Builder المبدئية جاهزة', greeting: 'مرحباً', ready: 'خطة Garcia Builder المبدئية جاهزة', bestPath: 'بناءً على تقييمك، أفضل نقطة بداية هي', mainGoal: 'الهدف الرئيسي المذكور',
        startHere: 'ابدأ هنا: أول 3 خطوات', actions: ['اختر أيام التدريب من الجدول أدناه وأضفها إلى تقويمك.', 'أكمل أول تمرين باستخدام الجلسة الموضحة في هذا البريد.', 'ضع أساس التغذية باستخدام نموذج الوجبات أدناه، ثم احسب أهدافك الدقيقة عندما تكون جاهزاً.'],
        openPlan: 'افتح خطتي الكاملة', openWorkout: 'افتح مكتبة التمارين', calculate: 'احسب المغذيات الكبرى', helpful: 'موارد مفيدة', viewPlan: 'اعرض خطتك المبدئية',
        preheader: 'تم إعداد التدريب ونظام التغذية وأول ثلاث خطوات لك.', training: 'تدريب هذا الأسبوع', nutrition: 'أهداف المغذيات الكبرى ونظام غذائي بسيط', eating: 'مثال بسيط ليوم غذائي', shopping: 'قائمة مشتريات البداية',
        educational: 'يقدم هذا التقييم إرشادات تعليمية عامة ولا يُعد تقييماً طبياً أو برنامجاً موصوفاً بشكل فردي.',
        receiving: 'تصلك هذه الرسالة لأنك طلبت نتيجة التقييم والموارد. اقرأ', privacy: 'سياسة الخصوصية', business: 'تدريب شخصي وتدريب عبر الإنترنت.',
        exactTargets: 'احسب أهداف السعرات والمغذيات الدقيقة', whatsappAndre: 'راسل Andre على WhatsApp', bookConsultation: 'احجز استشارة', emailAndre: 'أرسل بريداً إلى Andre', visitSite: 'زر Garcia Builder Fitness'
      },
      resourceCopy: {
        titles: ['دليل بداية خسارة الدهون لمدة 28 يوماً', 'خطة جسم كامل ليومين', 'خطة جسم كامل لثلاثة أيام للقوة وخسارة الدهون', 'خطة علوي/سفلي لأربعة أيام', 'خطة نادي منظمة لخمسة أيام', 'تدريب منزلي بالدمبل', 'خطة انتظام بوزن الجسم', 'خطة تدريب هجينة', 'برنامج عودة ليومين', 'بناء طبق عالي البروتين', 'إطار أولي للسعرات والمغذيات', 'مكتبة أطعمة عالية البروتين', 'دليل الحصص دون تتبع', 'نموذج تحضير وجبات لثلاثة أيام', 'دليل التحكم بالجوع والرغبة الشديدة', 'دليل أساسيات التغذية'],
        guideDescription: 'دليل عملي لأساسيات التدريب والتغذية والانتظام يمكنك البدء به اليوم.',
        workoutDescription: 'خطة تدريب عملية وقابلة للتكرار تم اختيارها وفق إجاباتك.',
        nutritionDescription: 'نظام غذائي بسيط لتحسين البروتين والحصص والانتظام.',
        guideAction: 'افتح الدليل', workoutAction: 'افتح خطة التدريب', nutritionAction: 'افتح دليل التغذية',
        workoutDetails: ['اتبع الجدول الأسبوعي المقترح وحافظ على الأيام نفسها قدر الإمكان.', 'ابدأ بأوزان يمكنك التحكم بها وأنهِ معظم المجموعات مع بقاء 1-3 تكرارات.', 'زد التكرارات أولاً ثم الوزن عندما يصبح الأداء ثابتاً.'],
        nutritionDetails: ['أضف مصدراً واضحاً للبروتين إلى الوجبات الرئيسية.', 'حافظ على الحصص ومواعيد الوجبات لمدة 10-14 يوماً قبل التعديل.', 'استخدم أمثلة الوجبات وقائمة المشتريات كأساس وعدّلها حسب تفضيلاتك.']
      },
      planCopy: {
        title: 'خطة البداية العملية الخاصة بك',
        goalTargets: ['ابدأ بفائض بسيط من السعرات وبروتين ثابت وتقدم تدريجي في التدريب.', 'ابدأ بوجبات منتظمة وجلسات قابلة للتكرار قبل تغيير السعرات بشكل كبير.', 'ابدأ قريباً من سعرات الثبات وزد البروتين وابنِ الانتظام أولاً.', 'ابدأ بعجز معتدل في السعرات وبروتين مرتفع وكربوهيدرات كافية للتدريب الجيد.'],
        trainingTitles: ['خطة جسم كامل ليومين', 'خطة جسم كامل لثلاثة أيام للقوة وخسارة الدهون', 'خطة علوي/سفلي لأربعة أيام', 'خطة نادي منظمة لخمسة أيام', 'تدريب منزلي بالدمبل', 'خطة انتظام بوزن الجسم', 'خطة تدريب هجينة', 'برنامج عودة ليومين'],
        nutritionTitles: ['بناء طبق عالي البروتين', 'إطار أولي للسعرات والمغذيات', 'مكتبة أطعمة عالية البروتين', 'دليل الحصص دون تتبع', 'تحضير وجبات لثلاثة أيام', 'التحكم بالجوع والرغبة الشديدة', 'أساسيات التغذية'],
        session: 'الجلسة', focus: 'تدرب بأداء متحكم به واترك 1-3 تكرارات احتياطية.',
        weekly: {
          five: ['اليوم 1: الجزء العلوي', 'اليوم 2: الجزء السفلي', 'اليوم 3: دفع', 'اليوم 4: سحب', 'اليوم 5: أرجل أو لياقة'],
          four: ['الاثنين: علوي A', 'الثلاثاء: سفلي A', 'الخميس: علوي B', 'الجمعة أو السبت: سفلي B'],
          three: ['اليوم 1: جسم كامل A', 'اليوم 2: جسم كامل B', 'اليوم 3: جسم كامل C'],
          two: ['اليوم 1: جسم كامل A', 'اليوم 2: جسم كامل B', 'اختياري: 2-3 مرات مشي خفيف'],
          home: ['ثلاث جلسات قصيرة أسبوعياً', 'المشي 10-20 دقيقة عند الإمكان', 'حافظ على الأيام نفسها لبناء الانتظام'],
          hybrid: ['يوم النادي: الحركات التي تحتاج وزناً أكبر', 'يوم المنزل: دمبل أو وزن الجسم', 'يوم ثالث اختياري: جسم كامل']
        },
        work: {
          upper: ['ضغط صدر بالبار أو الجهاز: 3 مجموعات من 6-10 تكرارات', 'تجديف جالس: 3 مجموعات من 8-12 تكراراً', 'سحب علوي: 3 مجموعات من 8-12 تكراراً', 'رفع جانبي: مجموعتان من 12-15 تكراراً', 'بايسبس وترايسبس: مجموعتان لكل منهما'],
          lower: ['سكوات أو ضغط أرجل: 3 مجموعات من 6-10 تكرارات', 'رفعة رومانية: 3 مجموعات من 8-10 تكرارات', 'اندفاع: مجموعتان من 8-10 تكرارات لكل جانب', 'ثني الأرجل: مجموعتان من 10-15 تكراراً', 'بلانك: 2-3 مجموعات متحكم بها'],
          home: ['Goblet squat: 3 مجموعات من 10-15 تكراراً', 'رفعة رومانية بالدمبل: 3 مجموعات من 8-12 تكراراً', 'ضغط دمبل أرضي: 3 مجموعات من 8-12 تكراراً', 'تجديف بذراع واحدة: 3 مجموعات من 10-12 تكراراً لكل جانب', 'اندفاع وبلانك: 2-3 مجموعات لكل منهما'],
          body: ['سكوات إلى كرسي: 2-4 مجموعات من 10-15 تكراراً', 'ضغط مائل: 2-4 مجموعات من 6-12 تكراراً', 'جسر الأرداف: 2-4 مجموعات من 10-15 تكراراً', 'تجديف بمنشفة أو حقيبة: 2-4 مجموعات من 8-12 تكراراً', 'بلانك أو dead bug: 2-3 مجموعات متحكم بها'],
          full: ['سكوات أو ضغط أرجل: 3 مجموعات من 8-12 تكراراً', 'رفعة رومانية أو hip thrust: 3 مجموعات من 8-12 تكراراً', 'ضغط صدر أو ضغط أرضي: 3 مجموعات من 8-12 تكراراً', 'تجديف أو سحب علوي: 3 مجموعات من 8-12 تكراراً', 'تمارين الجذع أو مشي مائل: 2-3 مجموعات']
        },
        macros: ['البروتين: أضف مصدراً للبروتين إلى كل وجبة رئيسية.', 'الحصص: حافظ على حصص ثابتة لمدة 10-14 يوماً.', 'الكربوهيدرات: تناولها حول التدريب وخلال الأوقات الأكثر نشاطاً.', 'الترطيب: اشرب الماء بانتظام طوال اليوم.'],
        meals: [meal('الفطور', 'بيض أو زبادي يوناني مع الشوفان والفاكهة', 'ابدأ اليوم بالبروتين والألياف.'), meal('الغداء', 'دجاج أو تونة أو توفو مع الأرز والبطاطس والخضار', 'وجبة متكاملة سهلة التكرار.'), meal('وجبة خفيفة', 'زبادي بروتين أو فاكهة أو مخفوق بروتين', 'تجنب الفترات الطويلة والجوع الشديد.'), meal('العشاء', 'بروتين قليل الدهون وخضار وحصة كربوهيدرات', 'حافظ على نظام بسيط ومنتظم.')],
        shopping: ['بيض', 'زبادي يوناني', 'دجاج أو سمك أو توفو', 'أرز أو بطاطس', 'شوفان', 'خضار', 'فاكهة', 'مسحوق بروتين عند الحاجة'],
        nextSteps: ['اتبع هذا النظام لمدة 7 أيام قبل تغيير التمارين أو الوجبات.', 'راقب اتجاه الوزن ومحيط الخصر والطاقة والأداء.', 'استخدم حاسبة المغذيات عندما تريد أهدافاً دقيقة.', 'تواصل مع Andre لتعديل الخطة حسب جدولك وتفضيلاتك وهدفك.']
      }
    }),

    ru: define('ru', {
      summary: {
        goals: { 'Lose body fat': 'снизить процент жира', 'Build muscle': 'набрать мышечную массу', 'Improve body composition': 'улучшить композицию тела', 'Become fitter and more energetic': 'повысить выносливость и энергию', 'Rebuild consistency': 'вернуть регулярность', 'Not sure yet': 'найти понятную точку старта' },
        unsureDays: 'реалистичный недельный режим', trainingDays: 'тренироваться {days} в неделю',
        template: 'С учётом цели — {goal}, возможности {days} и необходимости преодолеть {barrier}, лучшая отправная точка — повторяемая структура тренировок в сочетании с выполнимыми пищевыми привычками.'
      },
      resultTitles: ['Структурированная Поддержка Тренера', 'Структурированный План Тренировок и Питания', 'Базовый План Набора Мышц', 'План Возвращения Регулярности', 'Стартовый План Снижения Жира и Улучшения Композиции Тела'],
      supportCta: { warm: 'Обсудить Индивидуальный План с Andre', interested: 'Посмотреть Рекомендованные Шаблоны', cold: 'Скачать 28-Дневное Руководство' },
      email: {
        subject: 'Ваш Стартовый План Garcia Builder Готов', greeting: 'Здравствуйте', ready: 'Ваш Стартовый План Garcia Builder Готов', bestPath: 'По результатам оценки лучшая отправная точка —', mainGoal: 'Указанная основная цель',
        startHere: 'Начните здесь: первые 3 действия', actions: ['Выберите тренировочные дни из расписания ниже и внесите их в календарь.', 'Выполните первую тренировку по плану из этого письма.', 'Создайте основу питания по структуре приёмов пищи ниже, а точные цели рассчитайте, когда будете готовы.'],
        openPlan: 'Открыть Полный План', openWorkout: 'Открыть Библиотеку Тренировок', calculate: 'Рассчитать Макросы', helpful: 'Полезные материалы', viewPlan: 'Посмотреть Стартовый План',
        preheader: 'Тренировки, структура питания и первые три действия готовы.', training: 'Тренировки на эту неделю', nutrition: 'Цели по макросам и простое питание', eating: 'Пример простого рациона на день', shopping: 'Стартовый список покупок',
        educational: 'Эта оценка содержит общую образовательную информацию и не является медицинской оценкой или индивидуально назначенной программой.',
        receiving: 'Вы получили это письмо, потому что запросили результат оценки и материалы. Ознакомьтесь с', privacy: 'Политикой конфиденциальности', business: 'Персональные и онлайн-тренировки.',
        exactTargets: 'Рассчитать точные калории и макросы', whatsappAndre: 'Написать Andre в WhatsApp', bookConsultation: 'Записаться на консультацию', emailAndre: 'Отправить письмо Andre', visitSite: 'Посетить Garcia Builder Fitness'
      },
      resourceCopy: {
        titles: ['28-Дневное Руководство по Снижению Жира', 'Двухдневный План на Всё Тело', 'Трёхдневный План на Всё Тело для Силы и Снижения Жира', 'Четырёхдневный План Верх/Низ', 'Пятидневный Структурированный План для Зала', 'Домашние Тренировки с Гантелями', 'План Регулярности с Весом Тела', 'Гибридный План Тренировок', 'Двухдневная Программа Возвращения', 'Конструктор Тарелки с Высоким Содержанием Белка', 'Стартовая Система Калорий и Макросов', 'Библиотека Высокобелковых Продуктов', 'Руководство по Порциям Без Подсчёта', 'Трёхдневный Шаблон Подготовки Еды', 'Руководство по Контролю Голода и Тяги', 'Основы Питания'],
        guideDescription: 'Практическое руководство по основам тренировок, питания и регулярности, которое можно начать сегодня.',
        workoutDescription: 'Практичная повторяемая структура тренировок, выбранная по вашим ответам.',
        nutritionDescription: 'Простая структура питания для улучшения белка, порций и регулярности.',
        guideAction: 'Открыть руководство', workoutAction: 'Открыть план тренировок', nutritionAction: 'Открыть руководство по питанию',
        workoutDetails: ['Следуйте рекомендованной недельной структуре и по возможности сохраняйте одни и те же дни.', 'Начинайте с контролируемых весов и заканчивайте большинство подходов с запасом 1-3 повторения.', 'Сначала увеличивайте повторения, затем вес, когда техника станет стабильной.'],
        nutritionDetails: ['Добавьте явный источник белка в основные приёмы пищи.', 'Сохраняйте порции и время еды 10-14 дней до корректировок.', 'Используйте примеры блюд и список покупок как основу, адаптируя под свои предпочтения.']
      },
      planCopy: {
        title: 'Ваш Практический Стартовый План',
        goalTargets: ['Начните с небольшого профицита калорий, стабильного белка и постепенного роста тренировочных показателей.', 'Начните с регулярных приёмов пищи и повторяемых тренировок до серьёзного изменения калорий.', 'Начните около уровня поддержания, увеличьте белок и сначала выстройте регулярность.', 'Начните с умеренного дефицита калорий, высокого белка и достаточного количества углеводов для тренировок.'],
        trainingTitles: ['Двухдневный План на Всё Тело', 'Трёхдневный План на Всё Тело для Силы и Снижения Жира', 'Четырёхдневный План Верх/Низ', 'Пятидневный Структурированный План для Зала', 'Домашние Тренировки с Гантелями', 'План Регулярности с Весом Тела', 'Гибридный План Тренировок', 'Двухдневная Программа Возвращения'],
        nutritionTitles: ['Тарелка с Высоким Содержанием Белка', 'Стартовая Система Калорий и Макросов', 'Библиотека Высокобелковых Продуктов', 'Порции Без Подсчёта', 'Подготовка Еды на Три Дня', 'Контроль Голода и Тяги', 'Основы Питания'],
        session: 'Тренировка', focus: 'Выполняйте движения под контролем и оставляйте 1-3 повторения в запасе.',
        weekly: {
          five: ['День 1: верх тела', 'День 2: низ тела', 'День 3: жимы', 'День 4: тяги', 'День 5: ноги или кардио'],
          four: ['Понедельник: верх A', 'Вторник: низ A', 'Четверг: верх B', 'Пятница или суббота: низ B'],
          three: ['День 1: всё тело A', 'День 2: всё тело B', 'День 3: всё тело C'],
          two: ['День 1: всё тело A', 'День 2: всё тело B', 'Дополнительно: 2-3 лёгкие прогулки'],
          home: ['Три короткие тренировки в неделю', 'Прогулки 10-20 минут, когда возможно', 'Сохраняйте одни и те же дни для регулярности'],
          hybrid: ['Зал: движения, требующие большего веса', 'Дом: гантели или вес тела', 'Дополнительный третий день: всё тело']
        },
        work: {
          upper: ['Жим лёжа или в тренажёре: 3 подхода по 6-10 повторений', 'Тяга сидя: 3 подхода по 8-12 повторений', 'Вертикальная тяга: 3 подхода по 8-12 повторений', 'Разведения в стороны: 2 подхода по 12-15 повторений', 'Бицепс и трицепс: по 2 подхода'],
          lower: ['Присед или жим ногами: 3 подхода по 6-10 повторений', 'Румынская тяга: 3 подхода по 8-10 повторений', 'Выпады: 2 подхода по 8-10 повторений на сторону', 'Сгибание ног: 2 подхода по 10-15 повторений', 'Планка: 2-3 контролируемых подхода'],
          home: ['Гоблет-присед: 3 подхода по 10-15 повторений', 'Румынская тяга с гантелями: 3 подхода по 8-12 повторений', 'Жим гантелей на полу: 3 подхода по 8-12 повторений', 'Тяга одной рукой: 3 подхода по 10-12 повторений на сторону', 'Выпады и планка: по 2-3 подхода'],
          body: ['Присед до стула: 2-4 подхода по 10-15 повторений', 'Отжимания от опоры: 2-4 подхода по 6-12 повторений', 'Ягодичный мост: 2-4 подхода по 10-15 повторений', 'Тяга с полотенцем или рюкзаком: 2-4 подхода по 8-12 повторений', 'Планка или dead bug: 2-3 контролируемых подхода'],
          full: ['Присед или жим ногами: 3 подхода по 8-12 повторений', 'Румынская тяга или hip thrust: 3 подхода по 8-12 повторений', 'Жим или отжимания: 3 подхода по 8-12 повторений', 'Горизонтальная или вертикальная тяга: 3 подхода по 8-12 повторений', 'Кор или ходьба под наклоном: 2-3 подхода']
        },
        macros: ['Белок: добавляйте источник белка в каждый основной приём пищи.', 'Порции: сохраняйте стабильные порции 10-14 дней.', 'Углеводы: размещайте их около тренировок и активной части дня.', 'Вода: пейте регулярно в течение дня.'],
        meals: [meal('Завтрак', 'Яйца или греческий йогурт с овсянкой и фруктами', 'Начните день с белка и клетчатки.'), meal('Обед', 'Курица, тунец или тофу с рисом, картофелем и овощами', 'Полноценный приём пищи, который легко повторять.'), meal('Перекус', 'Протеиновый йогурт, фрукт или протеиновый коктейль', 'Избегайте долгих перерывов и сильного голода.'), meal('Ужин', 'Постный белок, овощи и порция углеводов', 'Сохраняйте простую и стабильную структуру.')],
        shopping: ['Яйца', 'Греческий йогурт', 'Курица, рыба или тофу', 'Рис или картофель', 'Овсянка', 'Овощи', 'Фрукты', 'Протеиновый порошок при необходимости'],
        nextSteps: ['Следуйте этой структуре 7 дней до изменения упражнений или питания.', 'Отслеживайте тренд веса, талию, энергию и тренировочные показатели.', 'Используйте калькулятор макросов, когда захотите точные цели.', 'Свяжитесь с Andre, чтобы адаптировать план под график, предпочтения и цель.']
      }
    })
  };

  const text = {};
  Object.entries(locales).forEach(([language, copy]) => {
    text[language] = {
      ...copy.resultTitles,
      ...copy.resourceCopy.titles,
      ...copy.planCopy.goalTargets,
      'Your Practical Starter Plan': copy.planCopy.title
    };
  });

  return {
    supported: Object.keys(locales),
    rtl: ['ar'],
    locales,
    text,
    email: Object.fromEntries(Object.entries(locales).map(([language, copy]) => [language, copy.email])),
    resourceCopy: Object.fromEntries(Object.entries(locales).map(([language, copy]) => [language, copy.resourceCopy])),
    planCopy: Object.fromEntries(Object.entries(locales).map(([language, copy]) => [language, copy.planCopy])),
    summary: Object.fromEntries(Object.entries(locales).map(([language, copy]) => [language, copy.summary])),
    supportCta: Object.fromEntries(Object.entries(locales).map(([language, copy]) => [language, copy.supportCta]))
  };
});
