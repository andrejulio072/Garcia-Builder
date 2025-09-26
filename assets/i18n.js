/*! Garcia Builder – Safe i18n (no DOM wipe, no page freeze) */
(function () {
  'use strict';

  const DICTS = {
    en: {
      nav: {
        home: "Home",
        about: "About",
        trans: "Transformations",
        testi: "Testimonials",
        pricing: "Pricing",
        faq: "FAQ",
        contact: "Contact",
        programs: "Programs",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      home: {
        hero: {
          headline: "Online Coaching. Real Results."
        },
        why: {
          title: "Why Garcia Builder"
        }
      },
      hero: {
        p: "Precision training, simple nutrition and relentless accountability — 100% online via Trainerize and WhatsApp."
      },
      cta: {
        start: "Start Today",
        plans: "See Plans",
        strip: {
          title: "Ready to start? Let's build your strongest body.",
          p: "Book a free consultation or message me on WhatsApp. I coach in EN/PT/ES.",
          book: "Book a Free Consultation",
          ig: "Follow on Instagram"
        }
      },
      kpi: {
        transforms: "Transformations",
        years: "Years Coaching",
        langs: "Languages"
      },
      why: {
        f1: { title: "Personalized Plans", p: "Designed for your schedule, equipment and goal." },
        f2: { title: "Simple Nutrition", p: "Flexible guidelines. No extremes. Sustainable." },
        f3: { title: "Data‑Driven", p: "Progress checks & smart adjustments weekly." },
        f4: { title: "Accountability", p: "WhatsApp support + weekly reviews." },
        f5: { title: "Injury‑Smart", p: "Technique cues and safe progressions." },
        f6: { title: "Mindset & Habits", p: "Systems that keep you consistent." }
      },
      footer: {
        whatsapp: "WhatsApp"
      },
      about: {
        title: "About Garcia Builder",
        subtitle: "We coach real people to build strong, athletic bodies — with simple nutrition, precise training and accountability that sticks.",
        mission: "Mission & Vision",
        mission_text: "Garcia Builder exists to turn discipline into results. Our mission is to coach busy people to build muscle, drop fat and move with confidence — without crash diets or gimmicks. Guided by the GB mark and its gold standard, we keep the process simple: clear training blocks, flexible nutrition and weekly check‑ins that drive consistency. The vision is a community known for strong bodies and stronger habits, where progress survives real life.",
        andre_title: "Andre Garcia — My Journey",
        andre_text: "I didn't grow up with perfect conditions. The Air Force was my first coach: 05:00 alarms, inspections, and standards that didn't care about excuses. There I learned that discipline beats mood and that progress is a decision repeated daily. When I moved to London, I carried that mindset into a city where I knew no one. I worked long hours, learned a new rhythm, and rebuilt my life one training session at a time. The gym became my compass; iron gave me structure when everything else was uncertain, and reps became a language I could trust.\n\nCoaching grew naturally from that path. I studied, earned credentials, and chose to serve on the gym floor—listening, teaching, and leading by example. As a personal trainer and coach, I've helped clients in English, Portuguese and Spanish get stronger, drop fat and move without pain. More than before-and-after pictures, I'm proud of the messages that say \"I'm a different person now.\" My method is simple and relentless: clear training blocks, simple nutrition you can follow, and accountability that respects real life. No hype, no judgment—just the truth and a plan.\n\nGarcia Builder is my mission: to build people who keep their results. If you're juggling work, family, or doubt, I'll meet you where you are, set a pace you can sustain, and hold a standard that improves both your body and your character. Your story isn't stuck; it's waiting for a coach. Let's start.",
        gallery: "Gallery",
        assess: { title: "Assess", p: "History, goals, schedule, equipment and injuries — we start where you are." },
        build: { title: "Build", p: "Training blocks and simple nutrition tailored to your reality." },
        execute: { title: "Execute", p: "Weekly reviews, progress tracking and smart adjustments." },
        credentials: { title: "Credentials", p: "Active IQ L2/L3 (UK) • 12+ years coaching." },
        specialties: { title: "Specialties", p: "Hypertrophy • Fat loss • Strength & Conditioning." },
        values: { title: "Values", p: "Clarity, discipline and humanity — results that last in real life." },
        accountability: { title: "Accountability", p: "Direct check-ins via WhatsApp to keep you consistent." },
        evidence: { title: "Evidence-Based", p: "Clear metrics, progressive overload and habit tracking." },
        injury: { title: "Injury-Smart", p: "Technique cues and safe progressions for long-term results." }
      },
      faq: {
        title: "FAQ",
        search: "Search questions…"
      },
      transformations: {
        title: "Transformations",
        subtitle: "Real people. Real results. See what's possible with the right guidance."
      },
      testimonials: {
        title: "Testimonials",
        subtitle: "What clients say about their Garcia Builder experience."
      },
      pricing: {
        title: "Pricing",
        subtitle: "Choose your path to transformation. All plans include Trainerize app, WhatsApp support, and weekly check-ins.",
        plans: {
          starter: {
            name: "Starter",
            price: "£120",
            period: "/month",
            description: "Perfect for beginners ready to build consistent habits",
            features: ["Custom training plan", "Basic nutrition guidelines", "Monthly check-ins", "Email support", "Trainerize app access"]
          },
          standard: {
            name: "Standard",
            price: "£180",
            period: "/month",
            description: "Most popular - complete coaching with regular support",
            features: ["Everything in Starter", "Weekly check-ins", "WhatsApp support", "Progress tracking", "Plan adjustments", "Habit coaching"]
          },
          premium: {
            name: "Premium",
            price: "£240",
            period: "/month",
            description: "Maximum support with priority access and faster results",
            features: ["Everything in Standard", "Bi-weekly video calls", "Priority WhatsApp support", "Supplement guidance", "Injury prevention", "24/7 question access"]
          },
          elite: {
            name: "Elite",
            price: "£320",
            period: "/month",
            description: "Ultimate transformation package for serious results",
            features: ["Everything in Premium", "Weekly video calls", "Custom meal plans", "Competition prep", "24/7 coach availability", "VIP support"]
          }
        },
        cta: {
          choose: "Choose Plan",
          popular: "Most Popular",
          contact: "Contact for Details"
        }
      },
      contact: {
        title: "Contact",
        subtitle: "Ready to transform? Let's talk. I coach in EN/PT/ES.",
        form: {
          name: "Your name",
          email: "Your email",
          phone: "Phone / WhatsApp (optional)",
          preferredContact: "Preferred contact",
          goal: "Primary goal",
          timeline: "Target timeline",
          experience: "Training experience",
          budget: "Monthly budget (optional)",
          message: "Tell me about your situation",
          submit: "Send Message",
          placeholders: {
            name: "Your name",
            email: "you@example.com",
            phone: "+353 87 123 4567",
            selectGoal: "Select your goal",
            selectTimeline: "Select",
            selectExperience: "Select",
            budget: "£200-300 or $250-375",
            message: "Current fitness level, schedule, any injuries or concerns..."
          },
          options: {
            contact: {
              email: "Email",
              whatsapp: "WhatsApp",
              phone: "Phone call"
            },
            goals: {
              fatLoss: "Fat loss",
              muscleGain: "Muscle gain",
              recomp: "Recomposition",
              performance: "Performance / Bleep test",
              rehab: "Pain & Rehab (e.g., shoulder, lower back)",
              general: "General health & confidence"
            },
            timeline: {
              short: "4–8 weeks",
              medium: "8–12 weeks",
              long: "3–6 months",
              extended: "6+ months"
            },
            experience: {
              beginner: "Beginner",
              intermediate: "Intermediate",
              advanced: "Advanced"
            }
          }
        }
      }
    },
    pt: {
      nav: {
        home: "Início",
        about: "Sobre",
        trans: "Transformações",
        testi: "Depoimentos",
        pricing: "Planos",
        faq: "FAQ",
        contact: "Contato",
        programs: "Programas",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      home: {
        hero: {
          headline: "Coaching Online. Resultados Reais."
        },
        why: {
          title: "Por que Garcia Builder"
        }
      },
      hero: {
        p: "Treino preciso, nutrição simples e responsabilidade implacável — 100% online via Trainerize e WhatsApp."
      },
      cta: {
        start: "Começar Hoje",
        plans: "Ver Planos",
        strip: {
          title: "Pronto para começar? Vamos construir seu corpo mais forte.",
          p: "Agende uma consulta gratuita ou me mande mensagem no WhatsApp. Atendo em PT/EN/ES.",
          book: "Agendar Consulta Gratuita",
          ig: "Seguir no Instagram"
        }
      },
      kpi: {
        transforms: "Transformações",
        years: "Anos de Coaching",
        langs: "Idiomas"
      },
      why: {
        f1: { title: "Planos Personalizados", p: "Projetados para sua rotina, equipamentos e objetivo." },
        f2: { title: "Nutrição Simples", p: "Diretrizes flexíveis. Sem extremos. Sustentável." },
        f3: { title: "Baseado em Dados", p: "Análise de progresso e ajustes inteligentes semanais." },
        f4: { title: "Responsabilidade", p: "Suporte via WhatsApp + revisões semanais." },
        f5: { title: "Inteligente contra Lesões", p: "Dicas de técnica e progressões seguras." },
        f6: { title: "Mentalidade e Hábitos", p: "Sistemas que mantêm você consistente." }
      },
      footer: {
        whatsapp: "WhatsApp"
      },
      about: {
        title: "Sobre Garcia Builder",
        subtitle: "Treinamos pessoas reais para construir corpos fortes e atléticos — com nutrição simples, treino preciso e responsabilidade que funciona.",
        mission: "Missão e Visão",
        mission_text: "Garcia Builder existe para transformar disciplina em resultados. Nossa missão é treinar pessoas ocupadas para ganhar músculo, perder gordura e se mover com confiança — sem dietas radicais ou truques. Guiados pela marca GB e seu padrão ouro, mantemos o processo simples: blocos de treino claros, nutrição flexível e check-ins semanais que geram consistência. A visão é uma comunidade conhecida por corpos fortes e hábitos mais fortes, onde o progresso sobrevive à vida real.",
        andre_title: "Andre Garcia — Minha Jornada",
        andre_text: "Não cresci com condições perfeitas. A Força Aérea foi meu primeiro treinador: alarmes às 05:00, inspeções e padrões que não se importavam com desculpas. Lá aprendi que disciplina vence humor e que progresso é uma decisão repetida diariamente. Quando me mudei para Londres, carreguei essa mentalidade para uma cidade onde não conhecia ninguém. Trabalhei longas horas, aprendi um novo ritmo e reconstruí minha vida uma sessão de treino por vez. A academia se tornou minha bússola; o ferro me deu estrutura quando tudo mais era incerto, e as repetições se tornaram uma linguagem em que eu podia confiar.\n\nO coaching cresceu naturalmente desse caminho. Estudei, obtive credenciais e escolhi servir no chão da academia—ouvindo, ensinando e liderando pelo exemplo. Como personal trainer e coach, ajudei clientes em inglês, português e espanhol a ficarem mais fortes, perderem gordura e se moverem sem dor. Mais que fotos de antes e depois, me orgulho das mensagens que dizem \"sou uma pessoa diferente agora.\" Meu método é simples e implacável: blocos de treino claros, nutrição simples que você pode seguir e responsabilidade que respeita a vida real. Sem exageros, sem julgamentos—apenas a verdade e um plano.\n\nGarcia Builder é minha missão: construir pessoas que mantêm seus resultados. Se você está equilibrando trabalho, família ou dúvidas, vou te encontrar onde você está, estabelecer um ritmo que você pode sustentar e manter um padrão que melhora tanto seu corpo quanto seu caráter. Sua história não está presa; está esperando por um coach. Vamos começar.",
        gallery: "Galeria",
        assess: { title: "Avaliar", p: "Histórico, objetivos, rotina, equipamentos e lesões — começamos onde você está." },
        build: { title: "Construir", p: "Blocos de treino e nutrição simples adaptados à sua realidade." },
        execute: { title: "Executar", p: "Revisões semanais, acompanhamento de progresso e ajustes inteligentes." },
        credentials: { title: "Credenciais", p: "Active IQ L2/L3 (UK) • 12+ anos de coaching." },
        specialties: { title: "Especialidades", p: "Hipertrofia • Perda de gordura • Força e Condicionamento." },
        values: { title: "Valores", p: "Clareza, disciplina e humanidade — resultados que duram na vida real." },
        accountability: { title: "Responsabilidade", p: "Check-ins diretos via WhatsApp para te manter consistente." },
        evidence: { title: "Baseado em Evidências", p: "Métricas claras, sobrecarga progressiva e acompanhamento de hábitos." },
        injury: { title: "Inteligente contra Lesões", p: "Dicas de técnica e progressões seguras para resultados a longo prazo." }
      },
      faq: {
        title: "FAQ",
        search: "Buscar perguntas…"
      },
      transformations: {
        title: "Transformações",
        subtitle: "Pessoas reais. Resultados reais. Veja o que é possível com a orientação certa."
      },
      testimonials: {
        title: "Depoimentos",
        subtitle: "O que os clientes dizem sobre sua experiência com Garcia Builder."
      },
      pricing: {
        title: "Planos",
        subtitle: "Escolha seu caminho para a transformação. Todos os planos incluem app Trainerize, suporte WhatsApp e check-ins semanais.",
        plans: {
          starter: {
            name: "Iniciante",
            price: "€120",
            period: "/mês",
            description: "Perfeito para iniciantes prontos para criar hábitos consistentes",
            features: ["Plano de treino personalizado", "Diretrizes nutricionais básicas", "Check-ins mensais", "Suporte por email", "Acesso ao app Trainerize"]
          },
          standard: {
            name: "Padrão",
            price: "€180",
            period: "/mês",
            description: "Mais popular - coaching completo com suporte regular",
            features: ["Tudo do Iniciante", "Check-ins semanais", "Suporte WhatsApp", "Acompanhamento de progresso", "Ajustes no plano", "Coaching de hábitos"]
          },
          premium: {
            name: "Premium",
            price: "€240",
            period: "/mês",
            description: "Suporte máximo com acesso prioritário e resultados mais rápidos",
            features: ["Tudo do Padrão", "Chamadas de vídeo quinzenais", "Suporte WhatsApp prioritário", "Orientação sobre suplementos", "Prevenção de lesões", "Acesso 24/7 para dúvidas"]
          },
          elite: {
            name: "Elite",
            price: "€320",
            period: "/mês",
            description: "Pacote de transformação definitivo para resultados sérios",
            features: ["Tudo do Premium", "Chamadas de vídeo semanais", "Planos alimentares personalizados", "Preparação para competição", "Disponibilidade 24/7 do coach", "Suporte VIP"]
          }
        },
        cta: {
          choose: "Escolher Plano",
          popular: "Mais Popular",
          contact: "Contato para Detalhes"
        }
      },
      contact: {
        title: "Contato",
        subtitle: "Pronto para se transformar? Vamos conversar. Atendo em PT/EN/ES.",
        form: {
          name: "Seu nome",
          email: "Seu email",
          phone: "Telefone / WhatsApp (opcional)",
          preferredContact: "Contato preferido",
          goal: "Objetivo principal",
          timeline: "Prazo desejado",
          experience: "Experiência em treino",
          budget: "Orçamento mensal (opcional)",
          message: "Conte sobre sua situação",
          submit: "Enviar Mensagem",
          placeholders: {
            name: "Seu nome",
            email: "voce@exemplo.com",
            phone: "+351 91 123 4567",
            selectGoal: "Selecione seu objetivo",
            selectTimeline: "Selecionar",
            selectExperience: "Selecionar",
            budget: "€200-300 ou R$1200-1800",
            message: "Nível fitness atual, rotina, lesões ou preocupações..."
          },
          options: {
            contact: {
              email: "Email",
              whatsapp: "WhatsApp",
              phone: "Ligação"
            },
            goals: {
              fatLoss: "Perda de gordura",
              muscleGain: "Ganho de massa",
              recomp: "Recomposição corporal",
              performance: "Performance / Teste físico",
              rehab: "Dor e Reabilitação (ex: ombro, lombar)",
              general: "Saúde geral e confiança"
            },
            timeline: {
              short: "4–8 semanas",
              medium: "8–12 semanas",
              long: "3–6 meses",
              extended: "6+ meses"
            },
            experience: {
              beginner: "Iniciante",
              intermediate: "Intermediário",
              advanced: "Avançado"
            }
          }
        }
      }
    },
    es: {
      nav: {
        home: "Inicio",
        about: "Sobre mí",
        trans: "Transformaciones",
        testi: "Testimonios",
        pricing: "Precios",
        faq: "FAQ",
        contact: "Contacto",
        programs: "Programas",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      home: {
        hero: {
          headline: "Coaching Online. Resultados Reales."
        },
        why: {
          title: "Por qué Garcia Builder"
        }
      },
      hero: {
        p: "Entrenamiento preciso, nutrición simple y responsabilidad implacable — 100% online vía Trainerize y WhatsApp."
      },
      cta: {
        start: "Empezar Hoy",
        plans: "Ver Planes",
        strip: {
          title: "¿Listo para empezar? Construyamos tu cuerpo más fuerte.",
          p: "Reserva una consulta gratuita o envíame un mensaje por WhatsApp. Entreno en ES/EN/PT.",
          book: "Reservar Consulta Gratuita",
          ig: "Seguir en Instagram"
        }
      },
      kpi: {
        transforms: "Transformaciones",
        years: "Años de Coaching",
        langs: "Idiomas"
      },
      why: {
        f1: { title: "Planes Personalizados", p: "Diseñados para tu horario, equipamiento y objetivo." },
        f2: { title: "Nutrición Simple", p: "Pautas flexibles. Sin extremos. Sostenible." },
        f3: { title: "Basado en Datos", p: "Revisiones de progreso y ajustes inteligentes semanales." },
        f4: { title: "Responsabilidad", p: "Soporte vía WhatsApp + revisiones semanales." },
        f5: { title: "Inteligente contra Lesiones", p: "Consejos de técnica y progresiones seguras." },
        f6: { title: "Mentalidad y Hábitos", p: "Sistemas que te mantienen consistente." }
      },
      footer: {
        whatsapp: "WhatsApp"
      },
      about: {
        title: "Sobre Garcia Builder",
        subtitle: "Entrenamos a personas reales para construir cuerpos fuertes y atléticos — con nutrición simple, entrenamiento preciso y responsabilidad que funciona.",
        mission: "Misión y Visión",
        mission_text: "Garcia Builder existe para convertir disciplina en resultados. Nuestra misión es entrenar a personas ocupadas para ganar músculo, perder grasa y moverse con confianza — sin dietas extremas o trucos. Guiados por la marca GB y su estándar de oro, mantenemos el proceso simple: bloques de entrenamiento claros, nutrición flexible y check-ins semanales que generan consistencia. La visión es una comunidad conocida por cuerpos fuertes y hábitos más fuertes, donde el progreso sobrevive a la vida real.",
        andre_title: "Andre Garcia — Mi Viaje",
        andre_text: "No crecí con condiciones perfectas. La Fuerza Aérea fue mi primer entrenador: alarmas a las 05:00, inspecciones y estándares que no se preocupaban por excusas. Allí aprendí que la disciplina vence al estado de ánimo y que el progreso es una decisión repetida diariamente. Cuando me mudé a Londres, llevé esa mentalidad a una ciudad donde no conocía a nadie. Trabajé largas horas, aprendí un nuevo ritmo y reconstruí mi vida una sesión de entrenamiento a la vez. El gimnasio se convirtió en mi brújula; el hierro me dio estructura cuando todo lo demás era incierto, y las repeticiones se convirtieron en un lenguaje en el que podía confiar.\n\nEl coaching creció naturalmente de ese camino. Estudié, obtuve credenciales y elegí servir en el suelo del gimnasio—escuchando, enseñando y liderando con el ejemplo. Como entrenador personal y coach, he ayudado a clientes en inglés, portugués y español a volverse más fuertes, perder grasa y moverse sin dolor. Más que fotos de antes y después, me enorgullecen los mensajes que dicen \"ahora soy una persona diferente.\" Mi método es simple e implacable: bloques de entrenamiento claros, nutrición simple que puedes seguir y responsabilidad que respeta la vida real. Sin exageraciones, sin juicios—solo la verdad y un plan.\n\nGarcia Builder es mi misión: construir personas que mantengan sus resultados. Si estás haciendo malabarismos con trabajo, familia o dudas, te encontraré donde estés, estableceré un ritmo que puedas sostener y mantendré un estándar que mejore tanto tu cuerpo como tu carácter. Tu historia no está atascada; está esperando un coach. Empecemos.",
        gallery: "Galería",
        assess: { title: "Evaluar", p: "Historial, objetivos, horario, equipamiento y lesiones — empezamos donde estás." },
        build: { title: "Construir", p: "Bloques de entrenamiento y nutrición simple adaptados a tu realidad." },
        execute: { title: "Ejecutar", p: "Revisiones semanales, seguimiento de progreso y ajustes inteligentes." },
        credentials: { title: "Credenciales", p: "Active IQ L2/L3 (UK) • 12+ años de coaching." },
        specialties: { title: "Especialidades", p: "Hipertrofia • Pérdida de grasa • Fuerza y Acondicionamiento." },
        values: { title: "Valores", p: "Claridad, disciplina y humanidad — resultados que duran en la vida real." },
        accountability: { title: "Responsabilidad", p: "Check-ins directos vía WhatsApp para mantenerte consistente." },
        evidence: { title: "Basado en Evidencias", p: "Métricas claras, sobrecarga progresiva y seguimiento de hábitos." },
        injury: { title: "Inteligente contra Lesiones", p: "Consejos de técnica y progresiones seguras para resultados a largo plazo." }
      },
      faq: {
        title: "FAQ",
        search: "Buscar preguntas…"
      },
      transformations: {
        title: "Transformaciones",
        subtitle: "Personas reales. Resultados reales. Ve lo que es posible con la orientación correcta."
      },
      testimonials: {
        title: "Testimonios",
        subtitle: "Lo que dicen los clientes sobre su experiencia con Garcia Builder."
      },
      pricing: {
        title: "Precios",
        subtitle: "Elige tu camino hacia la transformación. Todos los planes incluyen app Trainerize, soporte WhatsApp y check-ins semanales.",
        plans: {
          starter: {
            name: "Principiante",
            price: "€120",
            period: "/mes",
            description: "Perfecto para principiantes listos para crear hábitos consistentes",
            features: ["Plan de entrenamiento personalizado", "Pautas nutricionales básicas", "Check-ins mensuales", "Soporte por email", "Acceso a app Trainerize"]
          },
          standard: {
            name: "Estándar",
            price: "€180",
            period: "/mes",
            description: "Más popular - coaching completo con soporte regular",
            features: ["Todo del Principiante", "Check-ins semanales", "Soporte WhatsApp", "Seguimiento de progreso", "Ajustes del plan", "Coaching de hábitos"]
          },
          premium: {
            name: "Premium",
            price: "€240",
            period: "/mes",
            description: "Soporte máximo con acceso prioritario y resultados más rápidos",
            features: ["Todo del Estándar", "Llamadas de video quincenales", "Soporte WhatsApp prioritario", "Orientación sobre suplementos", "Prevención de lesiones", "Acceso 24/7 para dudas"]
          },
          elite: {
            name: "Elite",
            price: "€320",
            period: "/mes",
            description: "Paquete de transformación definitivo para resultados serios",
            features: ["Todo del Premium", "Llamadas de video semanales", "Planes alimentarios personalizados", "Preparación para competición", "Disponibilidad 24/7 del coach", "Soporte VIP"]
          }
        },
        cta: {
          choose: "Elegir Plan",
          popular: "Más Popular",
          contact: "Contacto para Detalles"
        }
      },
      contact: {
        title: "Contacto",
        subtitle: "¿Listo para transformarte? Hablemos. Entreno en ES/EN/PT.",
        form: {
          name: "Tu nombre",
          email: "Tu email",
          phone: "Teléfono / WhatsApp (opcional)",
          preferredContact: "Contacto preferido",
          goal: "Objetivo principal",
          timeline: "Plazo objetivo",
          experience: "Experiencia en entrenamiento",
          budget: "Presupuesto mensual (opcional)",
          message: "Cuéntame sobre tu situación",
          submit: "Enviar Mensaje",
          placeholders: {
            name: "Tu nombre",
            email: "tu@ejemplo.com",
            phone: "+34 600 123 456",
            selectGoal: "Selecciona tu objetivo",
            selectTimeline: "Seleccionar",
            selectExperience: "Seleccionar",
            budget: "€200-300 o $250-375",
            message: "Nivel fitness actual, horario, lesiones o preocupaciones..."
          },
          options: {
            contact: {
              email: "Email",
              whatsapp: "WhatsApp",
              phone: "Llamada telefónica"
            },
            goals: {
              fatLoss: "Pérdida de grasa",
              muscleGain: "Ganancia muscular",
              recomp: "Recomposición corporal",
              performance: "Rendimiento / Test físico",
              rehab: "Dolor y Rehabilitación (ej: hombro, lumbar)",
              general: "Salud general y confianza"
            },
            timeline: {
              short: "4–8 semanas",
              medium: "8–12 semanas",
              long: "3–6 meses",
              extended: "6+ meses"
            },
            experience: {
              beginner: "Principiante",
              intermediate: "Intermedio",
              advanced: "Avanzado"
            }
          }
        }
      }
    }
  };

  const KEY = "gb_lang";
  const clamp = (l) => (l==="en"||l==="pt"||l==="es") ? l : "en";

  function getLang() {
    try { return clamp(localStorage.getItem(KEY) || "en"); } catch { return "en"; }
  }
  function setLang(l) {
    const lang = clamp(l);
    try { localStorage.setItem(KEY, lang); } catch {}
    apply(lang);
  }

  const getByPath = (obj, path) => path.split('.').reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : undefined, obj);
  const t = (lang, key, fallback) => {
    const v1 = getByPath(DICTS[lang]||{}, key);
    if (v1 !== undefined) return v1;
    const v2 = getByPath(DICTS.en, key);
    if (v2 !== undefined) return v2;
    return fallback;
  };

  function apply(lang) {
    // Apply text content translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n'); if (!key) return;
      const current = (el.textContent || '').trim();
      const val = t(lang, key, current);
      if (val !== undefined && val !== null) el.textContent = val;
    });

    // Apply placeholder translations
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph'); if (!key) return;
      const current = el.getAttribute('placeholder') || '';
      const val = t(lang, key, current);
      if (val !== undefined && val !== null) el.setAttribute('placeholder', val);
    });

    const sel = document.getElementById('lang-select');
    if (sel && sel.value !== lang) sel.value = lang;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const lang = getLang(); // EN by default
    apply(lang);
    const sel = document.getElementById('lang-select');
    if (sel) sel.addEventListener('change', () => setLang(sel.value));
  });

  window.GB_I18N = { setLang, getLang, applyTranslations: apply };
})();
