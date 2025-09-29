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
        back_to_site: "Back to Site",
        login: "Login",
        register: "Register",
        logout: "Logout",
        profile: "My Profile",
        dashboard: "Dashboard",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      dashboard: {
        welcome: "Welcome back to your dashboard",
        loading: "Loading...",
        active_days: "Active Days",
        current_streak: "Current Streak",
        total_workouts: "Total Workouts",
        progress_photos: "Progress Photos",
        recent_activity: "Recent Activity",
        no_activity: "No recent activity to show",
        timeline: {
          workout_completed: "Workout completed",
          progress_photo: "Progress photo uploaded",
          weight_logged: "Weight logged",
          measurements: "Measurements updated"
        }
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
        },
        footer: {
          leadmagnet: "Download free workout guide"
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
        search: "Search questions…",
        q1: { q: "How does online coaching work?", a: "We start with an intake form and a brief call. Your plan is delivered in Trainerize (training + habits, optional nutrition guidance). Weekly check-ins, in-app chat support, and adjustments based on your data." },
        q2: { q: "Do I need a gym membership?", a: "No. I can program full home training. If you have only bands or a couple of dumbbells, we still progress effectively." },
        q3: { q: "Is nutrition included?", a: "Yes. You get calories/macros and flexible meal frameworks. We align with your culture, budget, and schedule—no rigid templates." },
        q4: { q: "I'm a beginner—is this for me?", a: "Absolutely. We focus on safe form, progressions, and habit building. Every exercise has demo videos and cues." },
        q5: { q: "What if I have injuries or pain?", a: "We adapt exercises, tempo, and range of motion. I can coordinate with physio/GP guidance when needed." },
        q6: { q: "How fast will I see results?", a: "Most feel better in 2–3 weeks, notice visible changes by 6–8 weeks, and strong transformations from 12+ weeks with consistency." },
        q7: { q: "How do weekly check-ins work?", a: "Short form in the app + optional photos/measurements. I review adherence and trends, then update your plan." },
        q8: { q: "Which app do you use?", a: "Trainerize—plans, videos, habits, messages, and progress tracking in one place (iOS/Android)." },
        q9: { q: "What equipment do I need?", a: "None to start. For home, adjustable dumbbells + bands cover almost everything. We scale up as you progress." },
        q10: { q: "I travel or work shifts. Can this fit?", a: "Yes. Flexible splits (3–4 days/week), travel swaps, and short sessions keep momentum during busy weeks." },
        q11: { q: "Will I lose muscle while cutting fat?", a: "The plan prioritizes muscle retention: resistance training, adequate protein, progressive overload, and a sensible deficit." },
        q12: { q: "What if I hit a plateau?", a: "We systematically adjust volume, intensity, steps, calories, or exercise selection—guided by your data." },
        q13: { q: "Do you recommend supplements?", a: "Optional. Evidence-based basics only (e.g., whey, creatine, vitamin D, omega-3) if useful for your goals." },
        q14: { q: "How long are sessions?", a: "Typically 35–50 minutes. Longer options are available if your schedule allows." },
        q15: { q: "How many days per week will I train?", a: "Commonly 3–4 days/week. We can go 2–6 depending on your time, recovery, and goals." },
        q16: { q: "What happens on Day 1?", a: "You get app access, a starter plan, quick tutorials, and a simple setup checklist. We schedule your first check-in right away." },
        q17: { q: "Will you review my form?", a: "Yes. Upload short clips inside the app and I'll provide cues and corrections in your feedback." },
        q18: { q: "Do you offer meal plans or just targets?", a: "I provide macro targets and practical meal frameworks/recipes. If you need a stricter template, we can discuss options that fit your lifestyle." },
        q19: { q: "How are payments handled?", a: "Monthly subscription via secure card billing (Stripe)." },
        q20: { q: "Is there a contract? Can I pause or cancel?", a: "No long-term lock-ins. Cancel anytime before your next billing date. Pauses are available for travel/illness—just message me." },
        q21: { q: "Do you offer refunds?", a: "Because coaching is a time/service product, fees are generally non-refundable. You can cancel before the next cycle to avoid renewal." },
        q22: { q: "How is my data handled? What about privacy?", a: "Only you and I see your data. Photos are optional. With explicit consent I may use anonymized results for marketing." },
        q23: { q: "Are progress photos required?", a: "No. They help track visual changes, but you can progress using measurements, strength logs, and how clothes fit." },
        q24: { q: "Do you coach in English only?", a: "Primary language is English. I can also coach in Portuguese and Spanish." },
        q25: { q: "Can you guarantee results?", a: "No coach can guarantee outcomes. I guarantee a personalized plan, clarity, accountability, and weekly adjustments—your consistency drives the results." }
      },
      transformations: {
        title: "Transformations",
        subtitle: "Real people. Real results. See what's possible with the right guidance."
      },
      testimonials: {
        title: "Testimonials",
        subtitle: "What clients say about their Garcia Builder experience.",
        t1: "I tried every plan on my own and kept quitting after two weeks. Andre gave me structure, habits I could actually follow and honest feedback. I lost inches from my waist and, more importantly, I feel capable again.",
        t2: "As a busy dad I didn't think I had time. Andre simplified training to four sessions and taught me how to hit protein without overthinking. My energy is up, posture improved and I finally enjoy training.",
        t3: "I used to hide in baggy clothes. Twelve weeks later my friends keep asking what I changed. The check‑ins and tiny weekly goals kept me on track even during travel. Best investment I've made in myself.",
        t4: "Nutrition was always my struggle. Andre's flexible approach removed guilt and taught me how to eat out without losing progress. I'm stronger, lighter and my relationship with food is healthy.",
        t5: "Came in with knee pain and fear of squats. We rebuilt technique from the ground up and used smart progressions. Zero pain, new PRs and a body I'm proud of. I wish I had started sooner.",
        t6: "I never imagined online coaching could feel this personal. The weekly video reviews are gold — I fix mistakes quickly and stay confident. I'm leaner, stronger and far more consistent.",
        t7: "Work stress used to derail me. Now training is the anchor of my week. The plan adapts to my travel and Andre's messages keep me accountable. Down 9 kg and sleeping better than ever.",
        t8: "I wanted definition without giving up dinners with friends. We focused on steps, protein and progressive overload. I kept my social life and still transformed — including visible abs for the first time.",
        t9: "I'm in my 40s and thought results would be slow. With Andre the changes were steady and realistic. Clothes fit better, my confidence is back and my daughter now asks to train with me.",
        t10: "What surprised me is the simplicity. No magic foods, just systems that fit my business schedule. My lower back pain is gone and I'm deadlifting with good form for the first time.",
        t11: "I joined for weight loss and stayed for the mindset. Andre celebrates small wins and reminds me to be patient. I've lost 7 kg and, more importantly, built habits I can keep forever.",
        t12: "The plan meets you where you are. We started with three short workouts and daily walks. I now love strength training and feel athletic again. My friends noticed before I did.",
        t13: "I used to binge after restrictive diets. Andre's approach removed the all‑or‑nothing thinking. I learned balance and still hit my targets. The scale went down and my confidence went up.",
        t14: "From zero to consistent. I look forward to check‑ins because they keep me honest and motivated. My blood work improved and I have energy for my kids after work.",
        t15: "I'm a student with a tight budget and time. Andre made every session count and taught me how to eat well in the cafeteria. I built muscle and finally see a clear path forward.",
        t16: "I was afraid to start after years off. Andre's positive coaching style made it safe to learn again. I'm stronger, my posture changed and I'm proud to see my progress photos.",
        t17: "English isn't my first language but coaching in Portuguese/English made everything easy. Clear videos, simple targets and a lot of encouragement. I feel in control of my health.",
        t18: "I've trained for years but never achieved the look I wanted. Periodized blocks and nutrition tweaks made the difference. My lifts are up and I finally look like I lift."
      },
      pricing: {
        title: "Pricing",
        subtitle: "Choose the coaching level that matches your goals today — and scale up as your results grow.",
        plans: {
          starter: {
            badge: "Quick Start",
            name: "Starter",
            price: "£75",
            period: "/mo",
            description: "Kick-start momentum with clarity and structure.",
            features: [
              "Personalized training plan",
              "Simple nutrition targets",
              "Weekly check-in",
              "Email support"
            ]
          },
          beginner: {
            badge: "New – Beginners",
            name: "Beginner Progression",
            price: "£95",
            period: "/mo",
            description: "For new lifters who want consistency and guidance.",
            features: [
              "Custom training built for beginners",
              "Habit & step targets",
              "Video form tips library",
              "Monthly progress review",
              "Access to Starter resources"
            ]
          },
          essentials: {
            badge: "Popular",
            name: "Essentials",
            price: "£115",
            period: "/mo",
            description: "Everything you need to look and feel athletic — without extremes.",
            features: [
              "Fully custom training + nutrition",
              "Deeper habit coaching & lifestyle balance",
              "Bi-weekly check-ins (2×/month)",
              "Coach form feedback via video",
              "Macro targets with adjustments",
              "Messaging support (48h response)"
            ]
          },
          full: {
            badge: "The Best",
            name: "Full Coaching",
            price: "£155",
            period: "/mo",
            description: "Built for consistent lifters who want visible changes, fast.",
            features: [
              "Periodized blocks, deloads & testing",
              "Weekly check-ins + accountability tasks",
              "Macros with ongoing adjustments",
              "Priority feedback (≤48h) with video notes",
              "Mobility & prehab plan",
              "Technique reviews (2× per month)",
              "Goal-driven mini-phases (cut/recomp/build)",
              "Progress dashboards & benchmarks"
            ]
          },
          elite: {
            badge: "Advanced – Competition",
            name: "Elite",
            price: "£230",
            period: "/mo",
            description: "For ambitious transformations with premium accountability.",
            features: [
              "High-touch coaching: weekly deep-dives",
              "WhatsApp priority & voice notes",
              "Custom cut/build phases + peaking",
              "Unlimited form reviews (fair use)",
              "Nutrition audits & meal structure redesign",
              "Lifestyle optimisation (sleep/stress routines)",
              "Travel & event strategies (on-the-go plans)",
              "Advanced testing blocks & performance prep",
              "Same-day feedback on business days",
              "Quarterly transformation report (PDF)"
            ]
          }
        },
        cta: {
          choose: "Choose Plan",
          popular: "Most Popular",
          contact: "Contact for Details"
        },
        member_discount: {
          title: "Exclusive Member Discount",
          discount: "discount",
          features: [
            "Valid on 3+ month plans",
            "Code: MEMBER15",
            "Valid until 31/12/2025"
          ],
          description: "As a registered user, you have access to special discount on all long-term plans!",
          cta: "Use Discount"
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
              recomposition: "Recomposition",
              performance: "Performance / Bleep test",
              rehab: "Pain & Rehab (e.g., shoulder, lower back)",
              health: "General health & confidence"
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
            },
            budget: {
              notSay: "Prefer not to say",
              low: "€100–€199",
              medium: "€200–€299",
              high: "€300–€499",
              premium: "€500+"
            }
          },
          consent: "I agree to be contacted about coaching and understand my data will be used only to respond to this inquiry.",
          footnote: "Average reply time: 24–48h. No spam, ever."
        }
      },
      auth: {
        login_title: "Login",
        login_subtitle: "Access your Garcia Builder account",
        register_title: "Create Account",
        register_subtitle: "Join Garcia Builder",
        email: "Email",
        password: "Password",
        name: "Full Name",
        confirm_password: "Confirm Password",
        email_placeholder: "your@email.com",
        password_placeholder: "Your password",
        name_placeholder: "Your full name",
        confirm_password_placeholder: "Confirm your password",
        remember_me: "Remember me",
        login_btn: "Sign In",
        register_btn: "Create Account",
        no_account: "Don't have an account?",
        create_account: "Create account",
        have_account: "Already have an account?",
        login_link: "Sign in",
        agree_terms: "I agree to the",
        terms_link: "Terms of Use"
      },
      common: {
        ok: "OK",
        close: "Close"
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
        back_to_site: "Voltar ao Site",
        login: "Login",
        register: "Cadastrar",
        logout: "Sair",
        profile: "Meu Perfil",
        dashboard: "Dashboard",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      dashboard: {
        welcome: "Bem-vindo de volta ao seu painel de controle",
        loading: "Carregando...",
        active_days: "Dias Ativo",
        current_streak: "Sequência Atual",
        total_workouts: "Total de Treinos",
        progress_photos: "Fotos de Progresso",
        recent_activity: "Atividade Recente",
        no_activity: "Nenhuma atividade recente para mostrar",
        timeline: {
          workout_completed: "Treino concluído",
          progress_photo: "Foto de progresso enviada",
          weight_logged: "Peso registrado",
          measurements: "Medidas atualizadas"
        }
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
        },
        footer: {
          leadmagnet: "Baixar guia de treino"
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
        search: "Buscar perguntas…",
        q1: { q: "Como funciona o coaching online?", a: "Começamos com um formulário de entrada e uma breve chamada. Seu plano é entregue no Trainerize (treino + hábitos, orientação nutricional opcional). Check-ins semanais, suporte via chat no app e ajustes baseados nos seus dados." },
        q2: { q: "Preciso de academia?", a: "Não. Posso programar treino completo em casa. Se você tem apenas elásticos ou alguns halteres, ainda progredimos efetivamente." },
        q3: { q: "Nutrição está incluída?", a: "Sim. Você recebe calorias/macros e estruturas flexíveis de refeições. Alinhamos com sua cultura, orçamento e rotina—sem modelos rígidos." },
        q4: { q: "Sou iniciante—isso é para mim?", a: "Absolutamente. Focamos em forma segura, progressões e construção de hábitos. Todo exercício tem vídeos demonstrativos e dicas." },
        q5: { q: "E se eu tiver lesões ou dor?", a: "Adaptamos exercícios, tempo e amplitude de movimento. Posso coordenar com orientação de fisioterapeuta/médico quando necessário." },
        q6: { q: "Quão rápido verei resultados?", a: "A maioria se sente melhor em 2–3 semanas, nota mudanças visíveis em 6–8 semanas, e transformações fortes a partir de 12+ semanas com consistência." },
        q7: { q: "Como funcionam os check-ins semanais?", a: "Formulário curto no app + fotos/medidas opcionais. Reviso aderência e tendências, depois atualizo seu plano." },
        q8: { q: "Qual app você usa?", a: "Trainerize—planos, vídeos, hábitos, mensagens e acompanhamento de progresso em um lugar (iOS/Android)." },
        q9: { q: "Que equipamentos preciso?", a: "Nenhum para começar. Para casa, halteres ajustáveis + elásticos cobrem quase tudo. Escalamos conforme você progride." },
        q10: { q: "Viajo ou trabalho em turnos. Isso se encaixa?", a: "Sim. Divisões flexíveis (3–4 dias/semana), trocas para viagem e sessões curtas mantêm o ritmo durante semanas ocupadas." },
        q11: { q: "Perderei músculo enquanto corto gordura?", a: "O plano prioriza retenção muscular: treino resistido, proteína adequada, sobrecarga progressiva e déficit sensato." },
        q12: { q: "E se eu atingir um platô?", a: "Ajustamos sistematicamente volume, intensidade, passos, calorias ou seleção de exercícios—guiados pelos seus dados." },
        q13: { q: "Você recomenda suplementos?", a: "Opcional. Apenas básicos baseados em evidência (ex: whey, creatina, vitamina D, ômega-3) se úteis para seus objetivos." },
        q14: { q: "Quanto tempo duram as sessões?", a: "Tipicamente 35–50 minutos. Opções mais longas estão disponíveis se sua agenda permitir." },
        q15: { q: "Quantos dias por semana treinarei?", a: "Comumente 3–4 dias/semana. Podemos ir de 2–6 dependendo do seu tempo, recuperação e objetivos." },
        q16: { q: "O que acontece no Dia 1?", a: "Você recebe acesso ao app, um plano inicial, tutoriais rápidos e uma lista simples de configuração. Agendamos seu primeiro check-in imediatamente." },
        q17: { q: "Você revisará minha forma?", a: "Sim. Faça upload de clipes curtos dentro do app e fornecerei dicas e correções no seu feedback." },
        q18: { q: "Você oferece planos alimentares ou apenas metas?", a: "Forneço metas de macros e estruturas práticas de refeições/receitas. Se precisar de um modelo mais rígido, podemos discutir opções que se encaixem no seu estilo de vida." },
        q19: { q: "Como são feitos os pagamentos?", a: "Assinatura mensal via cobrança segura no cartão (Stripe)." },
        q20: { q: "Há contrato? Posso pausar ou cancelar?", a: "Sem compromissos de longo prazo. Cancele a qualquer momento antes da próxima data de cobrança. Pausas estão disponíveis para viagem/doença—apenas me mande mensagem." },
        q21: { q: "Vocês oferecem reembolsos?", a: "Como coaching é um produto de tempo/serviço, as taxas geralmente não são reembolsáveis. Você pode cancelar antes do próximo ciclo para evitar renovação." },
        q22: { q: "Como meus dados são tratados? E a privacidade?", a: "Apenas você e eu vemos seus dados. Fotos são opcionais. Com consentimento explícito posso usar resultados anônimos para marketing." },
        q23: { q: "Fotos de progresso são obrigatórias?", a: "Não. Elas ajudam a acompanhar mudanças visuais, mas você pode progredir usando medidas, logs de força e como as roupas ficam." },
        q24: { q: "Você atende apenas em inglês?", a: "Idioma principal é inglês. Também posso atender em português e espanhol." },
        q25: { q: "Você pode garantir resultados?", a: "Nenhum coach pode garantir resultados. Garanto um plano personalizado, clareza, responsabilidade e ajustes semanais—sua consistência dirige os resultados." }
      },
      transformations: {
        title: "Transformações",
        subtitle: "Pessoas reais. Resultados reais. Veja o que é possível com a orientação certa."
      },
      testimonials: {
        title: "Depoimentos",
        subtitle: "O que os clientes dizem sobre sua experiência com Garcia Builder.",
        t1: "Tentei todos os planos sozinha e sempre desistia após duas semanas. Andre me deu estrutura, hábitos que eu conseguia seguir e feedback honesto. Perdi centímetros da cintura e, mais importante, me sinto capaz novamente.",
        t2: "Como pai ocupado, não achava que tivesse tempo. Andre simplificou o treino para quatro sessões e me ensinou como atingir proteína sem complicar. Minha energia aumentou, postura melhorou e finalmente gosto de treinar.",
        t3: "Costumava me esconder em roupas largas. Doze semanas depois meus amigos perguntam o que mudei. Os check-ins e pequenas metas semanais me mantiveram no caminho mesmo durante viagens. Melhor investimento que fiz em mim mesma.",
        t4: "Nutrição sempre foi minha dificuldade. A abordagem flexível do Andre removeu a culpa e me ensinou como comer fora sem perder progresso. Estou mais forte, mais leve e minha relação com comida é saudável.",
        t5: "Cheguei com dor no joelho e medo de agachamentos. Reconstruímos a técnica do zero e usamos progressões inteligentes. Zero dor, novos recordes e um corpo do qual me orgulho. Queria ter começado antes.",
        t6: "Nunca imaginei que coaching online pudesse ser tão pessoal. As revisões semanais em vídeo são ouro — corrijo erros rapidamente e mantenho confiança. Estou mais magra, mais forte e muito mais consistente.",
        t7: "O estresse do trabalho costumava me atrapalhar. Agora o treino é a âncora da minha semana. O plano se adapta às minhas viagens e as mensagens do Andre me mantêm responsável. Perdi 9 kg e durmo melhor que nunca.",
        t8: "Queria definição sem abrir mão de jantares com amigos. Focamos em passos, proteína e sobrecarga progressiva. Mantive minha vida social e ainda me transformei — incluindo abs visíveis pela primeira vez.",
        t9: "Tenho 40 e poucos anos e achava que os resultados seriam lentos. Com Andre as mudanças foram constantes e realistas. As roupas ficam melhor, minha confiança voltou e minha filha agora pede para treinar comigo.",
        t10: "O que me surpreendeu foi a simplicidade. Sem alimentos mágicos, apenas sistemas que se encaixam na minha agenda de negócios. Minha dor nas costas sumiu e estou fazendo levantamento terra com boa forma pela primeira vez.",
        t11: "Entrei para perder peso e fiquei pela mentalidade. Andre celebra pequenas vitórias e me lembra de ter paciência. Perdi 7 kg e, mais importante, construí hábitos que posso manter para sempre.",
        t12: "O plano te encontra onde você está. Começamos com três treinos curtos e caminhadas diárias. Agora amo musculação e me sinto atlética novamente. Meus amigos notaram antes de mim.",
        t13: "Costumava comer compulsivamente após dietas restritivas. A abordagem do Andre removeu o pensamento tudo-ou-nada. Aprendi equilíbrio e ainda atingi meus objetivos. A balança desceu e minha confiança subiu.",
        t14: "Do zero à consistência. Espero pelos check-ins porque me mantêm honesta e motivada. Meus exames de sangue melhoraram e tenho energia para meus filhos após o trabalho.",
        t15: "Sou estudante com orçamento e tempo apertados. Andre fez cada sessão valer a pena e me ensinou como comer bem no refeitório. Ganhei músculo e finalmente vejo um caminho claro à frente.",
        t16: "Tinha medo de começar após anos parada. O estilo positivo de coaching do Andre tornou seguro aprender novamente. Estou mais forte, minha postura mudou e me orgulho de ver minhas fotos de progresso.",
        t17: "Inglês não é minha primeira língua, mas o coaching em português/inglês tornou tudo fácil. Vídeos claros, objetivos simples e muito encorajamento. Me sinto no controle da minha saúde.",
        t18: "Treino há anos mas nunca consegui o visual que queria. Blocos periodizados e ajustes nutricionais fizeram a diferença. Meus levantamentos subiram e finalmente pareço que treino."
      },
      pricing: {
        title: "Planos",
        subtitle: "Escolha o nível de coaching que combina com seus objetivos hoje — e evolua conforme seus resultados crescem.",
        plans: {
          starter: {
            badge: "Começo Rápido",
            name: "Starter",
            price: "€75",
            period: "/mês",
            description: "Gere tração com clareza e estrutura.",
            features: [
              "Plano de treino personalizado",
              "Metas simples de nutrição",
              "Check-in semanal",
              "Suporte por email"
            ]
          },
          beginner: {
            badge: "Novo – Iniciantes",
            name: "Progressão para Iniciantes",
            price: "€95",
            period: "/mês",
            description: "Para iniciantes que querem consistência e orientação.",
            features: [
              "Treino customizado para iniciantes",
              "Metas de passos e hábitos",
              "Biblioteca de dicas de técnica em vídeo",
              "Revisão mensal de progresso",
              "Acesso a recursos do Starter"
            ]
          },
          essentials: {
            badge: "Popular",
            name: "Essentials",
            price: "€115",
            period: "/mês",
            description: "Tudo que você precisa para parecer e se sentir atlético — sem extremos.",
            features: [
              "Treino + nutrição totalmente personalizados",
              "Coaching de hábitos e equilíbrio de estilo de vida",
              "Check-ins quinzenais (2×/mês)",
              "Feedback de técnica por vídeo",
              "Metas de macros com ajustes",
              "Suporte por mensagens (até 48h)"
            ]
          },
          full: {
            badge: "O Melhor",
            name: "Full Coaching",
            price: "€155",
            period: "/mês",
            description: "Para quem treina com consistência e quer mudanças visíveis, rápido.",
            features: [
              "Blocos periodizados, deloads e testes",
              "Check-ins semanais + tarefas de responsabilidade",
              "Macros com ajustes contínuos",
              "Feedback prioritário (≤48h) com notas em vídeo",
              "Plano de mobilidade e prehab",
              "Revisões de técnica (2× por mês)",
              "Mini-fases por objetivo (cut/recomp/build)",
              "Dashboards e benchmarks de progresso"
            ]
          },
          elite: {
            badge: "Avançado – Competição",
            name: "Elite",
            price: "€230",
            period: "/mês",
            description: "Para transformações ambiciosas com responsabilidade premium.",
            features: [
              "Coaching de alta proximidade: mergulhos semanais",
              "Prioridade no WhatsApp e áudios",
              "Fases de cut/build + peak personalizadas",
              "Revisões de técnica ilimitadas (uso justo)",
              "Auditorias nutricionais e reestruturação de refeições",
              "Otimização de estilo de vida (sono/estresse)",
              "Estratégias para viagens e eventos",
              "Blocos de teste avançados & preparação de performance",
              "Feedback no mesmo dia útil",
              "Relatório trimestral de transformação (PDF)"
            ]
          }
        },
        cta: {
          choose: "Escolher Plano",
          popular: "Mais Popular",
          contact: "Contato para Detalhes"
        },
        member_discount: {
          title: "Desconto Exclusivo para Membros",
          discount: "desconto",
          features: [
            "Válido em planos de 3+ meses",
            "Código: MEMBER15",
            "Válido até 31/12/2025"
          ],
          description: "Como usuário registrado, você tem acesso a desconto especial em todos os planos de longa duração!",
          cta: "Usar Desconto"
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
      },
      auth: {
        login_title: "Login",
        login_subtitle: "Acesse sua conta Garcia Builder",
        register_title: "Criar Conta",
        register_subtitle: "Junte-se à Garcia Builder",
        email: "Email",
        password: "Senha",
        name: "Nome Completo",
        confirm_password: "Confirmar Senha",
        email_placeholder: "seu@email.com",
        password_placeholder: "Sua senha",
        name_placeholder: "Seu nome completo",
        confirm_password_placeholder: "Confirme sua senha",
        remember_me: "Lembrar de mim",
        login_btn: "Entrar",
        register_btn: "Criar Conta",
        no_account: "Não tem uma conta?",
        create_account: "Criar conta",
        have_account: "Já tem uma conta?",
        login_link: "Fazer login",
        agree_terms: "Concordo com os",
        terms_link: "Termos de Uso"
      },
      common: {
        ok: "OK",
        close: "Fechar"
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
        back_to_site: "Volver al Sitio",
        login: "Login",
        register: "Registrarse",
        logout: "Salir",
        profile: "Mi Perfil",
        dashboard: "Dashboard",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      dashboard: {
        welcome: "Bienvenido de vuelta a tu panel de control",
        loading: "Cargando...",
        active_days: "Días Activo",
        current_streak: "Racha Actual",
        total_workouts: "Total de Entrenamientos",
        progress_photos: "Fotos de Progreso",
        recent_activity: "Actividad Reciente",
        no_activity: "No hay actividad reciente para mostrar",
        timeline: {
          workout_completed: "Entrenamiento completado",
          progress_photo: "Foto de progreso subida",
          weight_logged: "Peso registrado",
          measurements: "Medidas actualizadas"
        }
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
        },
        footer: {
          leadmagnet: "Descargar guía de entrenamiento gratis"
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
        search: "Buscar preguntas…",
        q1: { q: "¿Cómo funciona el coaching online?", a: "Empezamos con un formulario de ingreso y una breve llamada. Tu plan se entrega en Trainerize (entrenamiento + hábitos, orientación nutricional opcional). Check-ins semanales, soporte de chat en la app y ajustes basados en tus datos." },
        q2: { q: "¿Necesito membresía de gimnasio?", a: "No. Puedo programar entrenamiento completo en casa. Si solo tienes bandas o un par de mancuernas, aún progresamos efectivamente." },
        q3: { q: "¿Está incluida la nutrición?", a: "Sí. Obtienes calorías/macros y marcos flexibles de comidas. Nos alineamos con tu cultura, presupuesto y horario—sin plantillas rígidas." },
        q4: { q: "Soy principiante—¿esto es para mí?", a: "Absolutamente. Nos enfocamos en forma segura, progresiones y construcción de hábitos. Cada ejercicio tiene videos demostrativos y consejos." },
        q5: { q: "¿Qué pasa si tengo lesiones o dolor?", a: "Adaptamos ejercicios, tempo y rango de movimiento. Puedo coordinar con orientación de fisioterapeuta/médico cuando sea necesario." },
        q6: { q: "¿Qué tan rápido veré resultados?", a: "La mayoría se siente mejor en 2–3 semanas, nota cambios visibles en 6–8 semanas, y transformaciones fuertes desde 12+ semanas con consistencia." },
        q7: { q: "¿Cómo funcionan los check-ins semanales?", a: "Formulario corto en la app + fotos/medidas opcionales. Reviso adherencia y tendencias, luego actualizo tu plan." },
        q8: { q: "¿Qué app usas?", a: "Trainerize—planes, videos, hábitos, mensajes y seguimiento de progreso en un lugar (iOS/Android)." },
        q9: { q: "¿Qué equipamiento necesito?", a: "Ninguno para empezar. Para casa, mancuernas ajustables + bandas cubren casi todo. Escalamos mientras progresas." },
        q10: { q: "Viajo o trabajo por turnos. ¿Esto puede funcionar?", a: "Sí. Divisiones flexibles (3–4 días/semana), intercambios para viajes y sesiones cortas mantienen el impulso durante semanas ocupadas." },
        q11: { q: "¿Perderé músculo mientras corto grasa?", a: "El plan prioriza retención muscular: entrenamiento de resistencia, proteína adecuada, sobrecarga progresiva y déficit sensato." },
        q12: { q: "¿Qué pasa si llego a una meseta?", a: "Ajustamos sistemáticamente volumen, intensidad, pasos, calorías o selección de ejercicios—guiados por tus datos." },
        q13: { q: "¿Recomiendas suplementos?", a: "Opcional. Solo básicos basados en evidencia (ej: whey, creatina, vitamina D, omega-3) si son útiles para tus objetivos." },
        q14: { q: "¿Cuánto duran las sesiones?", a: "Típicamente 35–50 minutos. Opciones más largas están disponibles si tu horario lo permite." },
        q15: { q: "¿Cuántos días por semana entrenaré?", a: "Comúnmente 3–4 días/semana. Podemos ir de 2–6 dependiendo de tu tiempo, recuperación y objetivos." },
        q16: { q: "¿Qué pasa en el Día 1?", a: "Obtienes acceso a la app, un plan inicial, tutoriales rápidos y una lista simple de configuración. Programamos tu primer check-in inmediatamente." },
        q17: { q: "¿Revisarás mi forma?", a: "Sí. Sube clips cortos dentro de la app y proporcionaré consejos y correcciones en tu feedback." },
        q18: { q: "¿Ofreces planes de comidas o solo objetivos?", a: "Proporciono objetivos de macros y marcos prácticos de comidas/recetas. Si necesitas una plantilla más estricta, podemos discutir opciones que se adapten a tu estilo de vida." },
        q19: { q: "¿Cómo se manejan los pagos?", a: "Suscripción mensual vía facturación segura con tarjeta (Stripe)." },
        q20: { q: "¿Hay contrato? ¿Puedo pausar o cancelar?", a: "Sin compromisos a largo plazo. Cancela en cualquier momento antes de tu próxima fecha de facturación. Pausas están disponibles para viajes/enfermedad—solo envíame mensaje." },
        q21: { q: "¿Ofrecen reembolsos?", a: "Como el coaching es un producto de tiempo/servicio, las tarifas generalmente no son reembolsables. Puedes cancelar antes del próximo ciclo para evitar renovación." },
        q22: { q: "¿Cómo se manejan mis datos? ¿Qué hay de la privacidad?", a: "Solo tú y yo vemos tus datos. Las fotos son opcionales. Con consentimiento explícito puedo usar resultados anónimos para marketing." },
        q23: { q: "¿Las fotos de progreso son requeridas?", a: "No. Ayudan a rastrear cambios visuales, pero puedes progresar usando medidas, registros de fuerza y cómo te queda la ropa." },
        q24: { q: "¿Entrenas solo en inglés?", a: "El idioma principal es inglés. También puedo entrenar en portugués y español." },
        q25: { q: "¿Puedes garantizar resultados?", a: "Ningún coach puede garantizar resultados. Garantizo un plan personalizado, claridad, responsabilidad y ajustes semanales—tu consistencia impulsa los resultados." }
      },
      transformations: {
        title: "Transformaciones",
        subtitle: "Personas reales. Resultados reales. Ve lo que es posible con la orientación correcta."
      },
      testimonials: {
        title: "Testimonios",
        subtitle: "Lo que dicen los clientes sobre su experiencia con Garcia Builder.",
        t1: "Probé todos los planes por mi cuenta y siempre dejaba después de dos semanas. Andre me dio estructura, hábitos que realmente podía seguir y feedback honesto. Perdí centímetros de mi cintura y, más importante, me siento capaz otra vez.",
        t2: "Como padre ocupado no pensé que tuviera tiempo. Andre simplificó el entrenamiento a cuatro sesiones y me enseñó cómo conseguir proteína sin complicar. Mi energía subió, postura mejoró y finalmente disfruto entrenar.",
        t3: "Solía esconderme en ropa holgada. Doce semanas después mis amigos siguen preguntando qué cambié. Los check-ins y pequeñas metas semanales me mantuvieron en curso incluso durante viajes. Mejor inversión que he hecho en mí misma.",
        t4: "La nutrición siempre fue mi problema. El enfoque flexible de Andre eliminó la culpa y me enseñó cómo comer fuera sin perder progreso. Estoy más fuerte, más liviana y mi relación con la comida es saludable.",
        t5: "Llegué con dolor de rodilla y miedo a las sentadillas. Reconstruimos la técnica desde cero y usamos progresiones inteligentes. Cero dolor, nuevos récords y un cuerpo del que me enorgullezco. Ojalá hubiera empezado antes.",
        t6: "Nunca imaginé que el coaching online pudiera sentirse tan personal. Las revisiones semanales en video son oro — corrijo errores rápidamente y mantengo confianza. Estoy más delgada, más fuerte y mucho más consistente.",
        t7: "El estrés del trabajo solía descarrilarme. Ahora el entrenamiento es el ancla de mi semana. El plan se adapta a mis viajes y los mensajes de Andre me mantienen responsable. Bajé 9 kg y duermo mejor que nunca.",
        t8: "Quería definición sin renunciar a cenas con amigos. Nos enfocamos en pasos, proteína y sobrecarga progresiva. Mantuve mi vida social y aún me transformé — incluyendo abdominales visibles por primera vez.",
        t9: "Tengo 40 y tantos años y pensé que los resultados serían lentos. Con Andre los cambios fueron constantes y realistas. La ropa me queda mejor, mi confianza regresó y mi hija ahora pide entrenar conmigo.",
        t10: "Lo que me sorprendió fue la simplicidad. Sin alimentos mágicos, solo sistemas que encajan en mi horario de negocios. Mi dolor de espalda baja desapareció y estoy haciendo peso muerto con buena forma por primera vez.",
        t11: "Entré para perder peso y me quedé por la mentalidad. Andre celebra pequeñas victorias y me recuerda ser paciente. He perdido 7 kg y, más importante, construí hábitos que puedo mantener para siempre.",
        t12: "El plan te encuentra donde estás. Empezamos con tres entrenamientos cortos y caminatas diarias. Ahora amo el entrenamiento de fuerza y me siento atlética otra vez. Mis amigos lo notaron antes que yo.",
        t13: "Solía comer compulsivamente después de dietas restrictivas. El enfoque de Andre eliminó el pensamiento de todo o nada. Aprendí equilibrio y aún alcancé mis objetivos. La balanza bajó y mi confianza subió.",
        t14: "De cero a consistente. Espero los check-ins porque me mantienen honesta y motivada. Mis análisis de sangre mejoraron y tengo energía para mis hijos después del trabajo.",
        t15: "Soy estudiante con presupuesto y tiempo ajustados. Andre hizo que cada sesión valiera la pena y me enseñó cómo comer bien en la cafetería. Gané músculo y finalmente veo un camino claro adelante.",
        t16: "Tenía miedo de empezar después de años sin actividad. El estilo positivo de coaching de Andre hizo seguro aprender otra vez. Estoy más fuerte, mi postura cambió y me enorgullezco de ver mis fotos de progreso.",
        t17: "El inglés no es mi primer idioma pero el coaching en portugués/inglés hizo todo fácil. Videos claros, objetivos simples y mucho aliento. Me siento en control de mi salud.",
        t18: "He entrenado por años pero nunca logré el aspecto que quería. Los bloques periodizados y ajustes nutricionales hicieron la diferencia. Mis levantamientos subieron y finalmente parezco que entreno."
      },
      pricing: {
        title: "Precios",
        subtitle: "Elige el nivel de coaching que se ajuste a tus objetivos hoy — y escala a medida que crecen tus resultados.",
        plans: {
          starter: {
            badge: "Inicio Rápido",
            name: "Starter",
            price: "€75",
            period: "/mes",
            description: "Impulsa el progreso con claridad y estructura.",
            features: [
              "Plan de entrenamiento personalizado",
              "Metas simples de nutrición",
              "Check-in semanal",
              "Soporte por email"
            ]
          },
          beginner: {
            badge: "Nuevo – Principiantes",
            name: "Progresión Principiantes",
            price: "€95",
            period: "/mes",
            description: "Para nuevos levantadores que quieren consistencia y guía.",
            features: [
              "Entrenamiento a medida para principiantes",
              "Metas de pasos y hábitos",
              "Biblioteca de consejos de técnica en video",
              "Revisión mensual de progreso",
              "Acceso a recursos de Starter"
            ]
          },
          essentials: {
            badge: "Popular",
            name: "Essentials",
            price: "€115",
            period: "/mes",
            description: "Todo lo que necesitas para verte y sentirte atlético — sin extremos.",
            features: [
              "Entrenamiento + nutrición totalmente personalizados",
              "Coaching de hábitos y equilibrio de estilo de vida",
              "Check-ins quincenales (2×/mes)",
              "Feedback de técnica por video",
              "Metas de macros con ajustes",
              "Soporte por mensajes (48h)"
            ]
          },
          full: {
            badge: "Lo Mejor",
            name: "Full Coaching",
            price: "€155",
            period: "/mes",
            description: "Para quienes entrenan con consistencia y quieren cambios visibles, rápido.",
            features: [
              "Bloques periodizados, deloads y pruebas",
              "Check-ins semanales + tareas de responsabilidad",
              "Macros con ajustes continuos",
              "Feedback prioritario (≤48h) con notas en video",
              "Plan de movilidad y prehab",
              "Revisiones de técnica (2× por mes)",
              "Mini-fases por objetivo (cut/recomp/build)",
              "Paneles y métricas de progreso"
            ]
          },
          elite: {
            badge: "Avanzado – Competición",
            name: "Elite",
            price: "€230",
            period: "/mes",
            description: "Para transformaciones ambiciosas con responsabilidad premium.",
            features: [
              "Coaching de alta dedicación: análisis semanales",
              "Prioridad WhatsApp y notas de voz",
              "Fases de cut/build + peak personalizadas",
              "Revisiones de técnica ilimitadas (uso justo)",
              "Auditorías de nutrición y rediseño de comidas",
              "Optimización de estilo de vida (sueño/estrés)",
              "Estrategias para viajes y eventos",
              "Bloques de prueba avanzados y preparación de desempeño",
              "Feedback el mismo día hábil",
              "Informe trimestral de transformación (PDF)"
            ]
          }
        },
        cta: {
          choose: "Elegir Plan",
          popular: "Más Popular",
          contact: "Contacto para Detalles"
        },
        member_discount: {
          title: "Descuento Exclusivo para Miembros",
          discount: "descuento",
          features: [
            "Válido en planes de 3+ meses",
            "Código: MEMBER15",
            "Válido hasta 31/12/2025"
          ],
          description: "Como usuario registrado, tienes acceso a descuento especial en todos los planes de larga duración!",
          cta: "Usar Descuento"
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
      },
      auth: {
        login_title: "Iniciar Sesión",
        login_subtitle: "Accede a tu cuenta Garcia Builder",
        register_title: "Crear Cuenta",
        register_subtitle: "Únete a Garcia Builder",
        email: "Email",
        password: "Contraseña",
        name: "Nombre Completo",
        confirm_password: "Confirmar Contraseña",
        email_placeholder: "tu@email.com",
        password_placeholder: "Tu contraseña",
        name_placeholder: "Tu nombre completo",
        confirm_password_placeholder: "Confirma tu contraseña",
        remember_me: "Recordarme",
        login_btn: "Iniciar Sesión",
        register_btn: "Crear Cuenta",
        no_account: "¿No tienes una cuenta?",
        create_account: "Crear cuenta",
        have_account: "¿Ya tienes una cuenta?",
        login_link: "Iniciar sesión",
        agree_terms: "Acepto los",
        terms_link: "Términos de Uso"
      },
      common: {
        ok: "OK",
        close: "Cerrar"
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
    // Notify listeners (e.g., FAQ page) that language changed
    try { document.dispatchEvent(new Event('languageChanged')); } catch {}
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

  // Expose APIs and raw dictionaries for legacy consumers
  window.GB_I18N = { setLang, getLang, applyTranslations: apply };
  window.DICTS = DICTS;
})();
