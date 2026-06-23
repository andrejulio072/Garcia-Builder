/*! Garcia Builder – Safe i18n (no DOM wipe, no page freeze) */
(function () {
  'use strict';

  const DICTS = {
    en: {
      nav: {
        home: "Home",
        about: "About",
        workouts: "Workouts",
        trans: "Transformations",
        testi: "Testimonials",
        blog: "Blog",
        pricing: "Pricing",
        faq: "FAQ",
        contact: "Contact",
        programs: "Programs",
        login: "Login",
        register: "Register",
        logout: "Logout",
        profile: "My Profile",
        dashboard: "Dashboard",
        metrics: "Metrics",
        progress: "Progress",
        trainer: "Trainer",
        currency_label: "Select currency",
        currency_help: "Show plan prices in your currency.",
        back_to_site: "Back to Site",
        back_to_login: "Back to Login",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      dashboard: {
        title: "Client Dashboard · Garcia Builder",
        welcome_back: "Welcome back",
        subtitle: "Your personalized transformation hub keeps everything in one place.",
        last_login: "Last login",
        member_since: "Member since",
        edit_profile_cta: "Edit Profile",
        log_weight: "Log Weight",
        get_support: "Get Support",
        logout: "Logout",
        metrics_heading: "Performance Snapshot",
        metrics_subtitle: "Auto-generated insights from your latest check-ins.",
        current_weight: "Current Weight",
        not_set: "Not set",
        bmi_label: "BMI",
        bmi_calculate: "Calculate",
        body_fat: "Body Fat",
        auto_calculated: "Auto-calculated",
        daily_calories: "Daily Calories",
        recommended: "Recommended",
        daily_water: "Daily Water",
        target: "Target",
        progress_goal: "Progress to Goal",
        set_target: "Set target",
        workouts_completed: "Workouts Completed",
        getting_started: "Getting started",
        day_streak: "Day Streak",
        keep_going: "Keep going!",
        recent_activity: "Recent Activity",
        no_activity: "No recent activity yet. Complete your first check-in to unlock insights.",
        complete_profile: "Complete your profile",
        your_goals: "Your Goals",
        no_goals: "Set personalized goals to track your evolution.",
        set_goals: "Define goals",
        next_sessions: "Next Sessions",
        session_checkin: "Weekly check-in with coach",
        session_checkin_meta: "Tuesday · 09:00 (Online)",
        session_status_upcoming: "Upcoming",
        session_training: "Strength block · Phase 2",
        session_training_meta: "Thursday · Gym flow",
        session_status_scheduled: "Scheduled",
        session_recovery: "Recovery & mobility",
        session_recovery_meta: "Saturday · 20 min follow-along",
        session_status_selfguided: "Self-guided",
        resources: "Resources",
        resource_transformations: "Transformation spotlight",
        resource_transformations_meta: "See how athletes progressed in 12 weeks.",
        resource_macros: "Macro calculator cheat-sheet",
        resource_macros_meta: "Adjust nutrition targets with evidence-based ratios.",
        resource_mindset: "Mindset playbook",
        resource_mindset_meta: "Prime your focus for challenging training weeks.",
        highlight_streak: "Consistency",
        highlight_streak_meta: "Log three consecutive updates to unlock the elite badge.",
        highlight_nutrition: "Nutrition",
        highlight_nutrition_meta: "Daily targets adjust automatically from your latest intake.",
        highlight_training: "Training",
        highlight_training_meta: "Schedule workouts inside the app to keep streaks alive.",
        progress_summary: "Progress Summary",
        total_sessions: "Total Sessions",
        target_weight: "Target Weight",
        achievements: "Achievements",
        days_active: "Days Active",
        measured: "Measured",
        day_single: "day",
        day_plural: "days",
        session_single: "session",
        session_plural: "sessions",
        bmi_underweight: "Underweight",
        bmi_normal: "Normal",
        bmi_overweight: "Overweight",
        bmi_obese: "Obese",
        recorded: "Recorded",
        daily_target: "Daily target",
        direction_lose: "lose",
        direction_gain: "gain",
        progress_to_direction: "to {direction}",
        updated: "Updated",
        default_name: "Athlete",
        goal_default: "Goal",
        goal_completed: "Completed",
        goal_ontrack: "On track",
        goal_paused: "Paused",
        goal_active: "Active",
        activity_update: "Update",
        contact_whatsapp_label: "Open coach chat",
        contact_whatsapp_message: "Hi Andre! I came from your dashboard and want coaching.",
        user_avatar_alt: "User avatar"
      },
      home: {
        hero: {
          eyebrow: "Online coaching for busy professionals",
          headline: "Stronger, leaner, coached every week",
          trust1: "Home or gym",
          trust2: "Trainerize app",
          trust3: "EN/PT/ES"
        },
        why: {
          title: "Why Garcia Builder Works",
          subtitle: "Clarity, support, and systems designed to deliver visible results in real life."
        },
        finalcta: {
          title: "Ready to transform your body, health, and routine?",
          subtitle: "Secure your free consultation now and get a personalised roadmap within 24 hours."
        }
      },
      workouts: {
        hero: {
          eyebrow: "Workout library",
          title: "Training templates organized into real transformation projects.",
          copy: "Choose a focused workout template or follow a longer 12, 16, or 20 week project built around fat loss, glutes, strength, confidence and consistency.",
          browse: "Browse templates",
          customize: "Customize my plan",
          stat_templates: "Templates",
          stat_projects: "Projects",
          stat_weeks: "Week options"
        },
        intro: {
          eyebrow: "Built for action",
          title: "Start with a template. Progress with structure.",
          copy: "Each workout template includes a weekly split, training focus, equipment, session structure and progression cue. Projects group templates into longer roadmaps so users can start with structure and progress through 12, 16, or 20 week phases."
        },
        projects: {
          eyebrow: "Signature template projects",
          heading: "Choose the goal first. Then pick the template level.",
          view_templates: "View templates",
          summer: {
            title: "Summer Shred",
            duration: "12 weeks",
            desc: "Fat-loss, conditioning, shape and routine for people who want a clear summer-ready plan without guessing every week."
          },
          glutes: {
            title: "Glute Launch",
            duration: "16 weeks",
            desc: "Glute, legs, posture and lower-body progression with strength phases and shape-focused accessories."
          },
          dad: {
            title: "Fit Dad Blueprint",
            duration: "20 weeks",
            desc: "Strength, muscle and fat-loss structure for busy dads who need efficient training, confidence and visible progress."
          }
        },
        filters: {
          search_label: "Search workouts",
          search_placeholder: "Search project, goal, level, equipment or focus",
          project: "Project",
          all: "All",
          summer: "Summer",
          glutes: "Glutes",
          fit_dad: "Fit Dad"
        }
      },
      featured: {
        title: "Real People. Real Results.",
        subtitle: "Join 127+ clients who transformed their bodies and lives",
        result: "-20lbs · +6lbs lean mass",
        quote: "Andre rebuilt my training even with 60-hour work weeks. We dropped body fat, added lean muscle, and my shoulders no longer hurt.",
        author: "Conrad N., London",
        beforeLabel: "Before",
        afterLabel: "After",
        angleFront: "Front Angle",
        angleSide: "Alternate Angle",
        cta: "See More Transformations →"
      },
      howitworks: {
        title: "How It Works",
        subtitle: "Clarity from day one—here’s how we build momentum together",
        step1: { title: "Assessment Call", desc: "Book a free consult to map goals, lifestyle, injuries, and the exact support you need." },
        step2: { title: "Plan Built for You", desc: "Receive personalised training, nutrition, and habit systems inside the Trainerize app." },
        step3: { title: "Guided Execution", desc: "Weekly check-ins plus daily WhatsApp accountability keep you consistent and confident." },
        step4: { title: "Results That Last", desc: "Feel stronger, leaner, and in control with systems you can maintain long-term." },
        cta: "Start Your Journey Today →"
      },
      video: {
        title: "See The Garcia Builder Method In Action",
        subtitle: "Watch how our personalized approach delivers results that last",
        point1: "Evidence-based training protocols",
        point2: "Custom nutrition without restrictions",
        point3: "24/7 support via in-app chat",
        point4: "Weekly progress reviews and adjustments",
        cta: "Get Started Now →"
      },
      blog: {
        section: { title: "Expert Tips & Guides", subtitle: "Science-backed advice to accelerate your transformation" },
        category: { training: "TRAINING", nutrition: "NUTRITION", mindset: "MINDSET" },
        post1: { title: "5 Mistakes Killing Your Gym Progress", excerpt: "Stop spinning your wheels. Learn the most common training errors and how to fix them for faster results." },
        post2: { title: "The Truth About Fat Loss Nutrition", excerpt: "Cut through the noise and discover what actually works for sustainable, science-based fat loss." },
        post3: { title: "Why Consistency Beats Motivation", excerpt: "Build unbreakable habits and systems that keep you on track even when motivation fades." },
        readmore: "Read More →",
        viewall: "View All Articles →"
      },
      socialproof: {
        title: "Join Our Community",
        subtitle: "127+ people transformed their lives with Garcia Builder",
        cta: "See All Success Stories →"
      },
      social: {
        sectionTitle: "Real transformations from busy professionals",
        sectionSubtitle: "Strong results in 8–12 weeks with coaching that adapts to your lifestyle, injuries, and schedule.",
        metric1: "Body transformations",
        metric2: "Client success rate",
        metric3: "Countries coached",
        cta: "Start My Transformation →",
  quote1: { text: "Dropped 5kg in 8 weeks with simple habits that finally stuck.", author: "Jessica R., 33" },
  quote2: { text: "Leaned out by 6kg while adding 5% muscle during a 12-week block.", author: "Tom L., 31" },
  quote3: { text: "Lost 20kg across 24 months by rebuilding nutrition habits and confidence.", author: "Sofia L., 29" }
      },
      instagram: {
        title: "Follow the journey on Instagram",
        subtitle: "Daily motivation, client wins, and behind-the-scenes coaching tips.",
  tag1: "Strength Day",
  tag2: "Nutrition Guide",
        tag3: "Client Spotlight",
        tag4: "Success Story"
      },
      authority: {
        title: "Why athletes trust Garcia Builder",
        subtitle: "Credentials, experience, and systems built around real people—not fitness fads.",
        card1: { title: "ActiveIQ Level 3 PT", desc: "Certified personal trainer recognised in the UK and EU." },
        card2: { title: "12+ Years Coaching", desc: "Hundreds of clients guided through fat loss, recomposition, and performance goals." },
        card3: { title: "Coaching in EN • PT • ES", desc: "Communicate in the language that keeps you motivated and accountable." },
        card4: { title: "Trainerize Ecosystem", desc: "Clear app experience for workouts, nutrition targets, habits, and progress tracking." }
      },
      stats: {
        clients: "Clients Transformed",
        workouts: "Workouts Completed",
        success: "Success Rate",
        rating: "Average Rating"
      },
      guarantee: {
        certified: "Certified Professional",
        "certified.desc": "Qualified personal trainer with 12+ years experience",
        privacy: "100% Private",
        "privacy.desc": "Your data is secure and never shared",
        support: "24/7 Support",
        "support.desc": "In-app chat access for questions anytime",
        flexible: "Cancel Anytime",
        "flexible.desc": "No long-term contracts or commitments"
      },
      reviews: {
        google: "Rated 5.0 on Google",
        count: "(25 reviews)"
      },
      hero: {
        p: "Training, nutrition, and weekly accountability built around your schedule."
      },
      cta: {
        start: "Book Your Free Consultation",
        plans: "View Plans & Pricing",
        whatsapp: "Chat on WhatsApp",
        whatsapp_prefer: "Prefer WhatsApp? Chat Now",
        strip: {
          title: "Ready to start? Let's build your strongest body.",
          p: "Book a free consultation or DM me on Instagram. I coach in EN/PT/ES.",
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
        f1: { title: "Train Smarter, Not Harder", p: "Personalised programming so every session moves you closer to your goal." },
        f2: { title: "Eat Foods You Love", p: "Balanced nutrition targets that fit your culture, schedule, and social life." },
        f3: { title: "Progress You Can Track", p: "Weekly data reviews keep your training, nutrition, and recovery dialled in." },
        f4: { title: "Accountability That Sticks", p: "Daily WhatsApp touchpoints and feedback when you need it, not just on check-in day." },
        f5: { title: "Built for Real Bodies", p: "Form coaching, smart regressions, and pain-aware programming for longevity." },
        f6: { title: "Habits That Last", p: "Simple routines that stack discipline, confidence, and consistent wins." }
      },
      footer: {
        whatsapp: "Coach Chat",
        language_label: "Site language",
        language_help: "Change the language used across the site."
      },
      about: {
        title: "About Garcia Builder",
        subtitle: "We coach real people to build strong, athletic bodies — with simple nutrition, precise training and accountability that sticks.",
        mission: "Mission & Vision",
        mission_text: "Garcia Builder exists to turn discipline into results. Our mission is to coach busy people to build muscle, drop fat and move with confidence — without crash diets or gimmicks. Guided by the GB mark and its gold standard, we keep the process simple: clear training blocks, flexible nutrition and weekly check‑ins that drive consistency. The vision is a community known for strong bodies and stronger habits, where progress survives real life.",
        andre_title: "Andre Garcia — My Journey",
        andre_text: "I didn't grow up with perfect conditions. The Air Force was my first coach: 05:00 alarms, inspections, and standards that didn't care about excuses. There I learned that discipline beats mood and that progress is a decision repeated daily. When I moved to London, I carried that mindset into a city where I knew no one. I worked long hours, learned a new rhythm, and rebuilt my life one training session at a time. The gym became my compass; iron gave me structure when everything else was uncertain, and reps became a language I could trust.\n\nCoaching grew naturally from that path. I studied, earned credentials, and chose to serve on the gym floor—listening, teaching, and leading by example. As a personal trainer and coach, I've helped clients in English, Portuguese and Spanish get stronger, drop fat and move without pain. More than before-and-after pictures, I'm proud of the messages that say \"I'm a different person now.\" My method is simple and relentless: clear training blocks, simple nutrition you can follow, and accountability that respects real life. No hype, no judgment—just the truth and a plan.\n\nGarcia Builder is my mission: to build people who keep their results. If you're juggling work, family, or doubt, I'll meet you where you are, set a pace you can sustain, and hold a standard that improves both your body and your character. Your story isn't stuck; it's waiting for a coach. Let's start.",
        video: {
          title: "How we coach technique and tempo",
          subtitle: "Watch a quick breakdown of the cues, tempo work, and accountability clients get inside a Garcia Builder training block.",
          point1: "See how we stack tempos and cues to protect joints while progressing loads.",
          point2: "Understand the real-time feedback clients receive inside the coaching app.",
          point3: "Preview how weekly check-ins keep training, nutrition, and recovery aligned.",
          cta: "Book a strategy call →"
        },
        gallery: "Gallery",
        assess: { title: "Assess", p: "History, goals, schedule, equipment and injuries — we start where you are." },
        build: { title: "Build", p: "Training blocks and simple nutrition tailored to your reality." },
        execute: { title: "Execute", p: "Weekly reviews, progress tracking and smart adjustments." },
        credentials: { title: "Credentials", p: "Active IQ L2/L3 (UK) • 12+ years coaching." },
        specialties: { title: "Specialties", p: "Hypertrophy • Fat loss • Strength & Conditioning." },
        values: { title: "Values", p: "Clarity, discipline and humanity — results that last in real life." },
        accountability: { title: "Accountability", p: "Direct check-ins via the app chat to keep you consistent." },
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
        subtitle: "Real people. Real results. See what's possible with the right guidance.",
        loadMore: {
          cta: "Load More Transformations",
          remaining: "Load More ({remaining} remaining)",
          loaded: "All Transformations Loaded"
        },
        modal: {
          titleSuffix: "'s Transformation",
          before: "Before",
          after: "After",
          timeline: "Timeline",
          results: "Transformation Results",
          age: "Age",
          weightLost: "Weight Lost",
          bodyFat: "Body Fat",
          muscle: "Muscle",
          achievements: "Performance Achievements",
          squat: "Squat",
          deadlift: "Deadlift",
          bench: "Bench Press",
          marathon: "Marathon",
          runTime: "5K Time",
          miles: "Distance PR",
          pullUps: "Pull-ups",
          pushUps: "Push-ups"
        },
        cards: {
          conrad: {
            overlay: "9kg Lost + 3kg Lean",
            timeline: "12 Weeks",
            story: "Conrad balanced consulting travel with precision coaching – 9kg fat loss, stronger shoulders, and +3kg lean mass in 12 weeks."
          }
        }
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
      testimonial: {
        conrad: "Andre rebuilt my training around 60-hour workweeks. We dropped 9kg of fat, added lean muscle, and my shoulders are pain-free for the first time in years."
      },
      pricing: {
        title: "Coaching Programs",
        subtitle: "Choose the coaching structure that fits your goal: app access, training, nutrition guidance, shopping list support, check-ins and accountability.",
        value: {
          title: "What every plan includes",
          text: "Clear execution, not just a PDF: your training, nutrition and follow-up are organized so you know exactly what to do next.",
          items: [
            "Trainerize app access with structured workouts",
            "Nutrition targets, meal structure guidance and shopping list support",
            "Weekly check-ins, adjustments and accountability",
            "Secure checkout, onboarding email and consultation scheduling after purchase"
          ]
        },
        plans: {
          monthly: {
            badge: "Flexible coaching",
            name: "Monthly Online Coaching",
            price: "€150",
            period: "/month",
            meta: "Ongoing support",
            result: "Best for steady progress and maintenance",
            description: "Standard online coaching for clients who want structure every month without a fixed transformation block.",
            features: [
              "Personalized training plan inside the app",
              "Nutrition targets and habit guidance",
              "Weekly check-in and plan adjustments",
              "Message support and accountability",
              "Cancel before the next monthly renewal"
            ]
          },
          eight_week: {
            badge: "Entry program",
            name: "8 Week Fat Loss Kickstart",
            price: "€350",
            period: " one-time",
            meta: "8 weeks",
            result: "Realistic target: 5-8kg fat loss",
            description: "A focused reset for people who need a clear plan, nutrition structure and accountability fast.",
            features: [
              "8-week training block for home or gym",
              "Nutrition setup with simple meal structure",
              "Shopping list guidance and swaps",
              "Weekly accountability check-ins",
              "Best for restarting momentum"
            ]
          },
          twelve_week: {
            badge: "Flagship",
            name: "12 Week Transformation",
            price: "€600",
            period: " one-time",
            meta: "12 weeks",
            result: "Realistic target: 9-12kg fat loss",
            featured: true,
            description: "The main Garcia Builder transformation block: enough time to lose fat, build strength and lock in routines.",
            features: [
              "Full 12-week progressive training plan",
              "Calories, macros and nutrition guidance",
              "Shopping list support and eating-out strategy",
              "Weekly check-ins with plan adjustments",
              "App access, support and accountability"
            ]
          },
          eighteen_week: {
            badge: "Most complete",
            name: "18 Week Complete Transformation",
            price: "€750",
            period: " one-time",
            meta: "18 weeks",
            result: "Realistic target: 12-15kg fat loss + long-term habits",
            description: "A deeper coaching block for bigger goals, more habit work and a smoother transition into maintenance.",
            features: [
              "18-week training and nutrition roadmap",
              "Fat-loss phase plus habit-building phase",
              "Advanced accountability and progress reviews",
              "Shopping lists, travel strategy and social eating support",
              "Maintenance plan so results are easier to keep"
            ]
          }
        },
        cta: {
          choose: "Start Secure Checkout",
          popular: "Most Popular",
          contact: "Contact for Details"
        },
        group_coaching: {
          title: "Group & Corporate Coaching - Coming Soon!",
          subtitle: "We're preparing new programs for small groups and corporate teams.",
          prompt: "Want early access or to join the waitlist?",
          cta: "Join Waitlist",
          footer: "Be the first to know when these offers launch!"
        },
        post_purchase: {
          title: "After purchase:",
          schedule: "Schedule consult"
        }
      },
      contact: {
        title: "Contact",
  subtitle: "Tell me about your goal. I'll get back within 24–48h.",
        quick: {
          whatsapp: "Chat on WhatsApp",
          consult: "Book a free 15-min consult",
          instagram: "Message on Instagram",
          note: "Prefer the form? It goes directly to andre@garciabuilder.fitness."
        },
        form: {
          name: "Your name",
          email: "Your email",
          phone: "Phone (optional)",
          preferredContact: "Preferred contact",
          goal: "Primary goal",
          timeline: "Target timeline",
          experience: "Training experience",
          budget: "Monthly budget (optional)",
          message: "Tell me about your situation",
          submit: "Send",
          placeholders: {
            name: "Your name",
            email: "you@example.com",
            phone: "+353 87 123 4567",
            selectGoal: "Select your goal",
            selectTimeline: "Select",
            selectExperience: "Select",
            budget: "€200-300",
            message: "Current fitness level, schedule, any injuries or concerns..."
          },
          options: {
            contact: {
              email: "Email",
              whatsapp: "WhatsApp",
              instagram: "Instagram DM",
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
        },
        newsletter: {
          title: "Stay Informed While You Wait",
          description: "While I review your inquiry, join thousands getting weekly training tips, nutrition insights, and exclusive updates.",
          cta: "Join Newsletter"
        },
        trainer: {
          lead: "Join our growing network of certified trainers and help transform lives with evidence-based coaching.",
          qualification: "Professional qualifications required",
          remote: "Work remotely with global clients",
          cta: "Apply Now"
        }
      },
      auth: {
        login_title: "Entrar",
        login_subtitle: "Acesse sua conta Garcia Builder",
        register_title: "Criar conta",
        register_subtitle: "Junte-se à Garcia Builder",
        email: "Email",
        email_invalid: "Digite um email válido.",
        password: "Senha",
        name: "Nome completo",
        confirm_password: "Confirmar senha",
        phone_optional: "Telefone (opcional)",
        date_of_birth: "Data de nascimento",
        email_placeholder: "voce@email.com",
        password_placeholder: "Sua senha",
        password_min_placeholder: "Mínimo 6 caracteres",
        name_placeholder: "Seu nome completo",
        phone_placeholder: "+55 (11) 99999-9999",
        confirm_password_placeholder: "Confirme sua senha",
        remember_me: "Lembrar de mim",
        login_btn: "Entrar",
        register_btn: "Criar conta",
        no_account: "Ainda não tem conta?",
        create_account: "Criar conta",
        have_account: "Já tem uma conta?",
        login_link: "Fazer login",
        agree_terms: "Concordo com os",
        terms_link: "Termos de Uso",
        or_continue_with: "ou continue com",
        continue_google: "Continuar com Google",
        continue_facebook: "Continuar com Facebook",
        forgot_password: "Esqueceu sua senha?",
        forgot_password_title: "Esqueci minha senha",
        forgot_password_subtitle: "Digite seu email e enviaremos um link para redefinir sua senha.",
        send_reset_link: "Enviar link de redefinição",
        back_to_login: "Voltar ao login",
        sending: "Enviando...",
        forgot_email_required: "Informe seu email.",
        forgot_success: "✅ Link enviado! Verifique seu email ({email}) para redefinir sua senha.",
        forgot_error_user_not_found: "Nenhuma conta encontrada com este email.",
        forgot_error_rate_limit: "Muitas solicitações. Aguarde alguns minutos antes de tentar novamente.",
        forgot_error_generic: "Erro: {message}"
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
        workouts: "Treinos",
        trans: "Transformações",
        testi: "Depoimentos",
        blog: "Blog",
        pricing: "Planos",
        faq: "FAQ",
        contact: "Contato",
        programs: "Programas",
        login: "Login",
        register: "Cadastrar",
        logout: "Sair",
        profile: "Meu Perfil",
        dashboard: "Dashboard",
        metrics: "Métricas",
        progress: "Progresso",
        trainer: "Treinador",
        currency_label: "Selecionar moeda",
        currency_help: "Veja os planos na sua moeda preferida.",
        back_to_site: "Voltar ao Site",
        back_to_login: "Voltar ao Login",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      dashboard: {
        title: "Painel do Cliente · Garcia Builder",
        welcome_back: "Bem-vindo de volta",
        subtitle: "Seu hub personalizado de transformação mantém tudo em um só lugar.",
        last_login: "Último login",
        member_since: "Membro desde",
        edit_profile_cta: "Editar perfil",
        log_weight: "Registrar peso",
        get_support: "Obter suporte",
        logout: "Sair",
        metrics_heading: "Panorama de desempenho",
        metrics_subtitle: "Insights automáticos dos seus check-ins mais recentes.",
        current_weight: "Peso atual",
        not_set: "Não definido",
        bmi_label: "IMC",
        bmi_calculate: "Calcular",
        body_fat: "Gordura corporal",
        auto_calculated: "Calculado automaticamente",
        daily_calories: "Calorias diárias",
        recommended: "Recomendado",
        daily_water: "Água diária",
        target: "Meta",
        progress_goal: "Progresso para a meta",
        set_target: "Definir meta",
        workouts_completed: "Treinos concluídos",
        getting_started: "Começando",
        day_streak: "Sequência de dias",
        keep_going: "Continue!",
        recent_activity: "Atividade recente",
        no_activity: "Nenhuma atividade recente ainda. Complete seu primeiro check-in para liberar insights.",
        complete_profile: "Completar perfil",
        your_goals: "Suas metas",
        no_goals: "Defina metas personalizadas para acompanhar sua evolução.",
        set_goals: "Definir metas",
        next_sessions: "Próximas sessões",
        session_checkin: "Check-in semanal com o coach",
        session_checkin_meta: "Terça · 09:00 (Online)",
        session_status_upcoming: "Em breve",
        session_training: "Bloco de força · Fase 2",
        session_training_meta: "Quinta · Ritmo de academia",
        session_status_scheduled: "Agendado",
        session_recovery: "Recuperação e mobilidade",
        session_recovery_meta: "Sábado · 20 min guiados",
        session_status_selfguided: "Autoguiado",
        resources: "Recursos",
        resource_transformations: "Spotlight de transformação",
        resource_transformations_meta: "Veja como atletas evoluíram em 12 semanas.",
        resource_macros: "Guia de macros",
        resource_macros_meta: "Ajuste metas nutricionais com proporções baseadas em evidência.",
        resource_mindset: "Playbook de mindset",
        resource_mindset_meta: "Prepare o foco para semanas de treino desafiadoras.",
        highlight_streak: "Consistência",
        highlight_streak_meta: "Registre três atualizações seguidas para liberar o badge elite.",
        highlight_nutrition: "Nutrição",
        highlight_nutrition_meta: "Alvos diários ajustam automaticamente com sua ingestão mais recente.",
        highlight_training: "Treino",
        highlight_training_meta: "Agende treinos no app para manter a sequência ativa.",
        progress_summary: "Resumo de progresso",
        total_sessions: "Total de sessões",
        target_weight: "Peso alvo",
        achievements: "Conquistas",
        days_active: "Dias ativos",
        measured: "Medido",
        day_single: "dia",
        day_plural: "dias",
        session_single: "sessão",
        session_plural: "sessões",
        bmi_underweight: "Abaixo do peso",
        bmi_normal: "Normal",
        bmi_overweight: "Sobrepeso",
        bmi_obese: "Obesidade",
        recorded: "Registrado",
        daily_target: "Meta diária",
        direction_lose: "perder",
        direction_gain: "ganhar",
        progress_to_direction: "para {direction}",
        updated: "Atualizado",
        default_name: "Atleta",
        goal_default: "Meta",
        goal_completed: "Concluída",
        goal_ontrack: "No ritmo",
        goal_paused: "Pausada",
        goal_active: "Ativa",
        activity_update: "Atualização",
        contact_whatsapp_label: "Abrir chat com o coach",
        contact_whatsapp_message: "Oi Andre! Vim do dashboard e quero coaching.",
        user_avatar_alt: "Avatar do usuário"
      },
      home: {
        hero: {
          eyebrow: "Coaching online para profissionais ocupados",
          headline: "Mais forte, mais definido, acompanhado toda semana",
          trust1: "Casa ou academia",
          trust2: "App Trainerize",
          trust3: "EN/PT/ES"
        },
        why: {
          title: "Por que o Garcia Builder Funciona",
          subtitle: "Clareza, suporte e sistemas pensados para entregar resultados visíveis na vida real."
        },
        finalcta: {
          title: "Pronto para transformar seu corpo, saúde e rotina?",
          subtitle: "Garanta sua consulta gratuita agora e receba um plano personalizado em até 24 horas."
        }
      },
      featured: {
        title: "Pessoas Reais. Resultados Reais.",
        subtitle: "Junte-se a 127+ clientes que transformaram corpo e vida",
        result: "-9kg · +3kg massa magra",
        quote: "Andre reconstruiu meu treino mesmo com semanas de 60 horas. Perdemos gordura, ganhamos massa magra e meus ombros não doem mais.",
        author: "Conrad N., Londres",
        beforeLabel: "Antes",
        afterLabel: "Depois",
        angleFront: "Ângulo Frontal",
        angleSide: "Ângulo Alternativo",
        cta: "Ver Mais Transformações →"
      },
      howitworks: {
        title: "Como Funciona",
        subtitle: "Clareza desde o primeiro dia — é assim que criamos impulso juntos",
        step1: { title: "Chamada de Avaliação", desc: "Agende uma consultoria gratuita para mapear objetivos, rotina, lesões e o suporte exato que você precisa." },
        step2: { title: "Plano Feito para Você", desc: "Receba treino, nutrição e sistemas de hábitos personalizados dentro do app Trainerize." },
        step3: { title: "Execução Guiada", desc: "Check-ins semanais mais responsabilidade diária no WhatsApp mantêm você consistente e confiante." },
        step4: { title: "Resultados que Permanecem", desc: "Sinta-se mais forte, mais definido e no controle com sistemas que você consegue manter a longo prazo." },
        cta: "Comece Sua Jornada Hoje →"
      },
      video: {
        title: "Veja o Método Garcia Builder na Prática",
        subtitle: "Assista como nossa abordagem personalizada gera resultados que duram",
        point1: "Protocolos de treino baseados em evidência",
        point2: "Nutrição sob medida sem restrições",
        point3: "Suporte 24/7 pelo chat do app",
        point4: "Revisões semanais e ajustes contínuos",
        cta: "Começar Agora →"
      },
      blog: {
        section: { title: "Dicas & Guias de Especialistas", subtitle: "Orientação com base científica para acelerar sua transformação" },
        category: { training: "TREINO", nutrition: "NUTRIÇÃO", mindset: "MENTALIDADE" },
        post1: { title: "5 Erros que Travam seu Progresso na Academia", excerpt: "Pare de patinar. Aprenda os erros mais comuns e como corrigi-los para evoluir mais rápido." },
        post2: { title: "A Verdade sobre Nutrição para Perda de Gordura", excerpt: "Corte o ruído e descubra o que realmente funciona para um emagrecimento sustentável." },
        post3: { title: "Por que Consistência vence Motivação", excerpt: "Crie hábitos e sistemas que te mantêm no caminho mesmo sem motivação." },
        readmore: "Ler Mais →",
        viewall: "Ver Todos os Artigos →"
      },
      socialproof: {
        title: "Junte-se à Nossa Comunidade",
        subtitle: "127+ pessoas transformaram suas vidas com Garcia Builder",
        cta: "Ver Todas as Histórias de Sucesso →"
      },
      social: {
        sectionTitle: "Transformações reais de profissionais ocupados",
        sectionSubtitle: "Resultados sólidos em 8–12 semanas com coaching que se adapta à sua rotina, lesões e agenda.",
        metric1: "Corpos transformados",
        metric2: "Taxa de sucesso",
        metric3: "Países atendidos",
        cta: "Começar Minha Transformação →",
  quote1: { text: "Eliminei 5 kg em 8 semanas com hábitos simples que permaneceram.", author: "Jessica R., 33" },
  quote2: { text: "Reduzi 6 kg enquanto ganhei 5% de massa em um bloco de 12 semanas.", author: "Tom L., 31" },
  quote3: { text: "Perdi 20 kg em 24 meses reconstruindo hábitos de nutrição e confiança.", author: "Sofia L., 29" }
      },
      instagram: {
        title: "Acompanhe a jornada no Instagram",
        subtitle: "Motivação diária, vitórias dos clientes e bastidores do coaching.",
  tag1: "Dia de Força",
  tag2: "Guia de Nutrição",
        tag3: "Cliente em Destaque",
        tag4: "História de Sucesso"
      },
      authority: {
        title: "Por que atletas confiam no Garcia Builder",
        subtitle: "Credenciais, experiência e sistemas criados para pessoas reais — não modismos de academia.",
        card1: { title: "ActiveIQ Level 3 PT", desc: "Personal trainer certificado reconhecido no Reino Unido e na UE." },
        card2: { title: "12+ Anos de Coaching", desc: "Centenas de clientes guiados em perda de gordura, recomposição e performance." },
        card3: { title: "Coaching em EN • PT • ES", desc: "Fale no idioma que mantém você motivado e responsável." },
        card4: { title: "Ecossistema Trainerize", desc: "App claro para treinos, metas de nutrição, hábitos e acompanhamento de progresso." }
      },
      stats: {
        clients: "Clientes Transformados",
        workouts: "Treinos Completos",
        success: "Taxa de Sucesso",
        rating: "Avaliação Média"
      },
      guarantee: {
        certified: "Profissional Certificado",
        "certified.desc": "Personal trainer qualificado com 12+ anos de experiência",
        privacy: "100% Privado",
        "privacy.desc": "Seus dados são seguros e nunca compartilhados",
        support: "Suporte 24/7",
        "support.desc": "Acesso ao chat do app para duvidas a qualquer hora",
        flexible: "Cancele a Qualquer Momento",
        "flexible.desc": "Sem contratos de longo prazo"
      },
      reviews: {
        google: "Avaliado 5.0 no Google",
        count: "(25 avaliações)"
      },
      hero: {
        p: "Treino, nutricao e acompanhamento semanal criados para a sua rotina."
      },
      cta: {
        start: "Agende Sua Consultoria Gratuita",
        plans: "Ver Planos e Preços",
        whatsapp: "Conversar no WhatsApp",
        whatsapp_prefer: "Prefere WhatsApp? Converse Agora",
        strip: {
          title: "Pronto para começar? Vamos construir seu corpo mais forte.",
          p: "Agende uma consulta gratuita ou envie um DM no Instagram. Atendo em PT/EN/ES.",
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
        f1: { title: "Treine com Inteligência", p: "Programação personalizada para que cada sessão te aproxime da sua meta." },
        f2: { title: "Coma o que Você Ama", p: "Metas de nutrição equilibradas que cabem na sua cultura, agenda e vida social." },
        f3: { title: "Progresso que Você Vê", p: "Revisões semanais de dados mantêm treino, nutrição e recuperação alinhados." },
        f4: { title: "Responsabilidade que Fica", p: "Toques diários no WhatsApp e feedback quando você precisa, não só no check-in." },
        f5: { title: "Feito para Corpos Reais", p: "Correções de forma, regressões inteligentes e programação consciente da dor." },
        f6: { title: "Hábitos que Permanecem", p: "Rotinas simples que constroem disciplina, confiança e vitórias consistentes." }
      },
      footer: {
        whatsapp: "Chat do coach",
        language_label: "Idioma do site",
        language_help: "Altere o idioma utilizado em todo o site."
      },
      about: {
        title: "Sobre Garcia Builder",
        subtitle: "Treinamos pessoas reais para construir corpos fortes e atléticos — com nutrição simples, treino preciso e responsabilidade que funciona.",
        mission: "Missão e Visão",
        mission_text: "Garcia Builder existe para transformar disciplina em resultados. Nossa missão é treinar pessoas ocupadas para ganhar músculo, perder gordura e se mover com confiança — sem dietas radicais ou truques. Guiados pela marca GB e seu padrão ouro, mantemos o processo simples: blocos de treino claros, nutrição flexível e check-ins semanais que geram consistência. A visão é uma comunidade conhecida por corpos fortes e hábitos mais fortes, onde o progresso sobrevive à vida real.",
        andre_title: "Andre Garcia — Minha Jornada",
        andre_text: "Não cresci com condições perfeitas. A Força Aérea foi meu primeiro treinador: alarmes às 05:00, inspeções e padrões que não se importavam com desculpas. Lá aprendi que disciplina vence humor e que progresso é uma decisão repetida diariamente. Quando me mudei para Londres, carreguei essa mentalidade para uma cidade onde não conhecia ninguém. Trabalhei longas horas, aprendi um novo ritmo e reconstruí minha vida uma sessão de treino por vez. A academia se tornou minha bússola; o ferro me deu estrutura quando tudo mais era incerto, e as repetições se tornaram uma linguagem em que eu podia confiar.\n\nO coaching cresceu naturalmente desse caminho. Estudei, obtive credenciais e escolhi servir no chão da academia—ouvindo, ensinando e liderando pelo exemplo. Como personal trainer e coach, ajudei clientes em inglês, português e espanhol a ficarem mais fortes, perderem gordura e se moverem sem dor. Mais que fotos de antes e depois, me orgulho das mensagens que dizem \"sou uma pessoa diferente agora.\" Meu método é simples e implacável: blocos de treino claros, nutrição simples que você pode seguir e responsabilidade que respeita a vida real. Sem exageros, sem julgamentos—apenas a verdade e um plano.\n\nGarcia Builder é minha missão: construir pessoas que mantêm seus resultados. Se você está equilibrando trabalho, família ou dúvidas, vou te encontrar onde você está, estabelecer um ritmo que você pode sustentar e manter um padrão que melhora tanto seu corpo quanto seu caráter. Sua história não está presa; está esperando por um coach. Vamos começar.",
        video: {
          title: "Como treinamos técnica e tempo",
          subtitle: "Veja um resumo rápido dos comandos, tempos e acompanhamento que os alunos recebem dentro de um bloco Garcia Builder.",
          point1: "Veja como combinamos tempos e comandos para proteger as articulações enquanto evoluímos nas cargas.",
          point2: "Entenda o feedback em tempo real que os alunos recebem dentro do app de coaching.",
          point3: "Veja como os check-ins semanais mantêm treino, nutrição e recuperação alinhados.",
          cta: "Agende uma estratégia →"
        },
        gallery: "Galeria",
        assess: { title: "Avaliar", p: "Histórico, objetivos, rotina, equipamentos e lesões — começamos onde você está." },
        build: { title: "Construir", p: "Blocos de treino e nutrição simples adaptados à sua realidade." },
        execute: { title: "Executar", p: "Revisões semanais, acompanhamento de progresso e ajustes inteligentes." },
        credentials: { title: "Credenciais", p: "Active IQ L2/L3 (UK) • 12+ anos de coaching." },
        specialties: { title: "Especialidades", p: "Hipertrofia • Perda de gordura • Força e Condicionamento." },
        values: { title: "Valores", p: "Clareza, disciplina e humanidade — resultados que duram na vida real." },
        accountability: { title: "Responsabilidade", p: "Check-ins diretos pelo chat do app para te manter consistente." },
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
        subtitle: "Pessoas reais. Resultados reais. Veja o que é possível com a orientação certa.",
        loadMore: {
          cta: "Carregar mais transformações",
          remaining: "Carregar mais ({remaining} restantes)",
          loaded: "Todas as transformações carregadas"
        },
        modal: {
          titleSuffix: " — Transformação",
          before: "Antes",
          after: "Depois",
          timeline: "Linha do tempo",
          results: "Resultados da Transformação",
          age: "Idade",
          weightLost: "Peso perdido",
          bodyFat: "Gordura corporal",
          muscle: "Músculo",
          achievements: "Conquistas de Performance",
          squat: "Agachamento",
          deadlift: "Levantamento terra",
          bench: "Supino",
          marathon: "Maratona",
          runTime: "Tempo de 5K",
          miles: "Recorde de distância",
          pullUps: "Barra fixa",
          pushUps: "Flexões"
        },
        cards: {
          conrad: {
            overlay: "-9kg + 3kg massa magra",
            timeline: "12 Semanas",
            story: "Conrad equilibrava semanas de consultoria com 60h e coaching preciso – perdeu 9kg de gordura, ganhou +3kg de massa magra e eliminou a dor no ombro em 12 semanas."
          }
        }
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
      testimonial: {
        conrad: "Andre reconstruiu meu treino em meio a semanas de 60 horas. Perdemos 9kg de gordura, ganhamos massa magra e meus ombros não doem mais."
      },
      pricing: {
        title: "Programas de Coaching",
        subtitle: "Escolha a estrutura certa para o seu objetivo: acesso ao app, treino, nutrição, lista de compras, check-ins e accountability.",
        value: {
          title: "O que todos os planos incluem",
          text: "Execução clara, não apenas um PDF: treino, nutrição e acompanhamento organizados para você saber exatamente o próximo passo.",
          items: [
            "Acesso ao app Trainerize com treinos estruturados",
            "Metas nutricionais, orientação alimentar e suporte para lista de compras",
            "Check-ins semanais, ajustes e accountability",
            "Checkout seguro, email de onboarding e agendamento de consulta após a compra"
          ]
        },
        plans: {
          monthly: {
            badge: "Coaching flexível",
            name: "Coaching Online Mensal",
            price: "€150",
            period: "/mês",
            meta: "Suporte contínuo",
            result: "Melhor para progresso estável e manutenção",
            description: "Coaching online padrão para quem quer estrutura todos os meses sem um bloco fechado de transformação.",
            features: [
              "Plano de treino personalizado dentro do app",
              "Metas de nutrição e orientação de hábitos",
              "Check-in semanal e ajustes no plano",
              "Suporte por mensagem e accountability",
              "Cancele antes da próxima renovação mensal"
            ]
          },
          eight_week: {
            badge: "Programa de entrada",
            name: "8 Semanas Fat Loss Kickstart",
            price: "€350",
            period: " pagamento único",
            meta: "8 semanas",
            result: "Meta realista: 5-8kg de perda de gordura",
            description: "Um reset focado para quem precisa de plano claro, estrutura alimentar e accountability rapidamente.",
            features: [
              "Bloco de treino de 8 semanas para casa ou ginásio",
              "Configuração nutricional com estrutura simples de refeições",
              "Orientação de lista de compras e substituições",
              "Check-ins semanais de accountability",
              "Ideal para recuperar ritmo e consistência"
            ]
          },
          twelve_week: {
            badge: "Principal",
            name: "Transformação 12 Semanas",
            price: "€600",
            period: " pagamento único",
            meta: "12 semanas",
            result: "Meta realista: 9-12kg de perda de gordura",
            featured: true,
            description: "O bloco principal Garcia Builder: tempo suficiente para perder gordura, ganhar força e consolidar rotina.",
            features: [
              "Plano progressivo completo de 12 semanas",
              "Calorias, macros e orientação nutricional",
              "Suporte para lista de compras e estratégia para comer fora",
              "Check-ins semanais com ajustes do plano",
              "Acesso ao app, suporte e accountability"
            ]
          },
          eighteen_week: {
            badge: "Mais completo",
            name: "Transformação Completa 18 Semanas",
            price: "€750",
            period: " pagamento único",
            meta: "18 semanas",
            result: "Meta realista: 12-15kg de perda + hábitos de longo prazo",
            description: "Um bloco mais profundo para metas maiores, mais trabalho de hábitos e transição mais segura para manutenção.",
            features: [
              "Roadmap de treino e nutrição por 18 semanas",
              "Fase de perda de gordura + fase de construção de hábitos",
              "Accountability avançado e revisões de progresso",
              "Listas de compras, estratégia de viagem e suporte para eventos sociais",
              "Plano de manutenção para facilitar manter os resultados"
            ]
          }
        },
        cta: {
          choose: "Iniciar checkout seguro",
          popular: "Mais Popular",
          contact: "Contato para Detalhes"
        },
        group_coaching: {
          title: "Coaching em Grupo e Corporativo - Em breve!",
          subtitle: "Estamos preparando novos programas para pequenos grupos e equipes corporativas.",
          prompt: "Quer acesso antecipado ou entrar na lista de espera?",
          cta: "Entrar na lista de espera",
          footer: "Seja o primeiro a saber quando essas ofertas lançarem!"
        },
        post_purchase: {
          title: "Após a compra:",
          schedule: "Agendar consultoria",
          preview: "Ver o primeiro treino"
        }
      },
      contact: {
        title: "Contato",
        subtitle: "Conte-me sobre o seu objetivo. Respondo em até 24–48h.",
        quick: {
          whatsapp: "Conversar no WhatsApp",
          consult: "Agendar consulta gratuita de 15 min",
          instagram: "Mensagem no Instagram",
          note: "Prefere o formulário? Ele vai direto para andre@garciabuilder.fitness."
        },
        form: {
          name: "Seu nome",
          email: "Seu email",
          phone: "Telefone (opcional)",
          preferredContact: "Contato preferido",
          goal: "Objetivo principal",
          timeline: "Prazo desejado",
          experience: "Experiência em treino",
          budget: "Orçamento mensal (opcional)",
          message: "Conte sobre sua situação",
          submit: "Enviar",
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
              instagram: "Mensagem no Instagram",
              phone: "Ligação"
            },
            goals: {
              fatLoss: "Perda de gordura",
              muscleGain: "Ganho de massa",
              recomposition: "Recomposição corporal",
              performance: "Performance / Teste físico",
              rehab: "Dor e reabilitação (ex: ombro, lombar)",
              health: "Saúde geral e confiança"
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
            },
            budget: {
              notSay: "Prefiro não informar",
              low: "€100–€199",
              medium: "€200–€299",
              high: "€300–€499",
              premium: "€500+"
            }
          },
          consent: "Concordo em ser contatado sobre o coaching e entendo que meus dados serão usados apenas para responder a este contato.",
          footnote: "Tempo médio de resposta: 24–48h. Sem spam."
        },
        newsletter: {
          title: "Fique Informado Enquanto Aguarda",
          description: "Enquanto analiso sua mensagem, junte-se a milhares recebendo dicas semanais de treino, nutrição e atualizações exclusivas.",
          cta: "Assinar newsletter"
        },
        trainer: {
          lead: "Faça parte da nossa rede de treinadores certificados e transforme vidas com coaching baseado em evidências.",
          qualification: "Requer certificações profissionais",
          remote: "Trabalhe remotamente com clientes no mundo todo",
          cta: "Candidatar-se"
        }
      },
      auth: {
        login_title: "Login",
        login_subtitle: "Acesse sua conta Garcia Builder",
        register_title: "Criar Conta",
        register_subtitle: "Junte-se à Garcia Builder",
    email: "Email",
    email_invalid: "Informe um email válido.",
        password: "Senha",
        name: "Nome Completo",
        confirm_password: "Confirmar Senha",
        phone_optional: "Telefone (opcional)",
        date_of_birth: "Data de Nascimento",
        email_placeholder: "seu@email.com",
        password_placeholder: "Sua senha",
        password_min_placeholder: "Mínimo 6 caracteres",
        name_placeholder: "Seu nome completo",
        phone_placeholder: "+55 (11) 99999-9999",
        confirm_password_placeholder: "Confirme sua senha",
        remember_me: "Lembrar de mim",
        login_btn: "Entrar",
        register_btn: "Criar Conta",
        no_account: "Não tem uma conta?",
        create_account: "Criar conta",
        have_account: "Já tem uma conta?",
        login_link: "Fazer login",
        agree_terms: "Concordo com os",
        terms_link: "Termos de Uso",
        or_continue_with: "ou continue com",
        continue_google: "Continuar com Google",
        continue_facebook: "Continuar com Facebook",
        forgot_password: "Esqueceu sua senha?",
        forgot_password_title: "Esqueci a Senha",
        forgot_password_subtitle: "Digite seu endereço de email e enviaremos um link para redefinir sua senha.",
        send_reset_link: "Enviar Link de Redefinição",
        back_to_login: "Voltar ao Login",
        sending: "Enviando...",
        forgot_email_required: "Informe seu endereço de email.",
        forgot_success: "✅ Link enviado! Verifique seu email ({email}) para redefinir sua senha.",
        forgot_error_user_not_found: "Nenhuma conta encontrada com este email.",
        forgot_error_rate_limit: "Muitos pedidos de redefinição. Aguarde alguns minutos antes de tentar novamente.",
        forgot_error_generic: "Erro: {message}"
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
        workouts: "Entrenamientos",
        trans: "Transformaciones",
        testi: "Testimonios",
        blog: "Blog",
        pricing: "Precios",
        faq: "FAQ",
        contact: "Contacto",
        programs: "Programas",
        login: "Login",
        register: "Registrarse",
        logout: "Salir",
        profile: "Mi Perfil",
        dashboard: "Dashboard",
        metrics: "Métricas",
        progress: "Progreso",
        trainer: "Entrenador",
        currency_label: "Seleccionar moneda",
        currency_help: "Ver planes en tu moneda preferida.",
        back_to_site: "Volver al Sitio",
        back_to_login: "Volver al Login",
        lang: { en: "EN", pt: "PT", es: "ES" }
      },
      dashboard: {
        title: "Panel del Cliente · Garcia Builder",
        welcome_back: "Bienvenido de nuevo",
        subtitle: "Tu centro de transformación personalizado mantiene todo en un solo lugar.",
        last_login: "Último acceso",
        member_since: "Miembro desde",
        edit_profile_cta: "Editar perfil",
        log_weight: "Registrar peso",
        get_support: "Obtener soporte",
        logout: "Cerrar sesión",
        metrics_heading: "Instantánea de rendimiento",
        metrics_subtitle: "Información generada automáticamente a partir de tus últimos check-ins.",
        current_weight: "Peso actual",
        not_set: "Sin definir",
        bmi_label: "IMC",
        bmi_calculate: "Calcular",
        body_fat: "Grasa corporal",
        auto_calculated: "Calculado automáticamente",
        daily_calories: "Calorías diarias",
        recommended: "Recomendado",
        daily_water: "Agua diaria",
        target: "Objetivo",
        progress_goal: "Progreso hacia la meta",
        set_target: "Definir objetivo",
        workouts_completed: "Entrenamientos completados",
        getting_started: "Comenzando",
        day_streak: "Racha de días",
        keep_going: "¡Sigue así!",
        recent_activity: "Actividad reciente",
        no_activity: "Aún no hay actividad. Completa tu primer check-in para desbloquear información.",
        complete_profile: "Completar perfil",
        your_goals: "Tus metas",
        no_goals: "Define metas personalizadas para seguir tu evolución.",
        set_goals: "Definir metas",
        next_sessions: "Próximas sesiones",
        session_checkin: "Check-in semanal con el coach",
        session_checkin_meta: "Martes · 09:00 (Online)",
        session_status_upcoming: "Próximo",
        session_training: "Bloque de fuerza · Fase 2",
        session_training_meta: "Jueves · Ritmo de gimnasio",
        session_status_scheduled: "Programado",
        session_recovery: "Recuperación y movilidad",
        session_recovery_meta: "Sábado · 20 min guiados",
        session_status_selfguided: "Autoguiado",
        resources: "Recursos",
        resource_transformations: "Destacado de transformaciones",
        resource_transformations_meta: "Descubre cómo los atletas progresaron en 12 semanas.",
        resource_macros: "Hoja de macros",
        resource_macros_meta: "Ajusta objetivos de nutrición con proporciones basadas en evidencia.",
        resource_mindset: "Manual de mentalidad",
        resource_mindset_meta: "Prepara tu enfoque para semanas de entrenamiento exigentes.",
        highlight_streak: "Consistencia",
        highlight_streak_meta: "Registra tres actualizaciones seguidas para desbloquear la insignia élite.",
        highlight_nutrition: "Nutrición",
        highlight_nutrition_meta: "Los objetivos diarios se ajustan automáticamente según tu última ingesta.",
        highlight_training: "Entrenamiento",
        highlight_training_meta: "Programa entrenamientos en la app para mantener la racha activa.",
        progress_summary: "Resumen de progreso",
        total_sessions: "Sesiones totales",
        target_weight: "Peso objetivo",
        achievements: "Logros",
        days_active: "Días activos",
        measured: "Medido",
        day_single: "día",
        day_plural: "días",
        session_single: "sesión",
        session_plural: "sesiones",
        bmi_underweight: "Bajo peso",
        bmi_normal: "Normal",
        bmi_overweight: "Sobrepeso",
        bmi_obese: "Obesidad",
        recorded: "Registrado",
        daily_target: "Objetivo diario",
        direction_lose: "perder",
        direction_gain: "ganar",
        progress_to_direction: "para {direction}",
        updated: "Actualizado",
        default_name: "Atleta",
        goal_default: "Meta",
        goal_completed: "Completada",
        goal_ontrack: "En curso",
        goal_paused: "Pausada",
        goal_active: "Activa",
        activity_update: "Actualización",
        contact_whatsapp_label: "Abrir chat con el coach",
        contact_whatsapp_message: "Hola Andre. Vengo del dashboard y quiero coaching.",
        user_avatar_alt: "Avatar del usuario"
      },
      home: {
        hero: {
          eyebrow: "Coaching online para profesionales ocupados",
          headline: "Mas fuerte, mas definido, acompanado cada semana",
          trust1: "Casa o gym",
          trust2: "App Trainerize",
          trust3: "EN/PT/ES"
        },
        why: {
          title: "Por qué Garcia Builder Funciona",
          subtitle: "Claridad, apoyo y sistemas diseñados para entregar resultados visibles en la vida real."
        },
        finalcta: {
          title: "¿Listo para transformar tu cuerpo, salud y rutina?",
          subtitle: "Asegura tu consulta gratuita ahora y recibe un plan personalizado en menos de 24 horas."
        }
      },
      featured: {
        title: "Personas Reales. Resultados Reales.",
        subtitle: "Únete a 127+ clientes que transformaron sus cuerpos y vidas",
        result: "-9kg · +3kg masa magra",
        quote: "Andre reconstruyó mi entrenamiento aun con semanas de 60 horas. Perdimos grasa, ganamos masa magra y ya no tengo dolor en los hombros.",
        author: "Conrad N., Londres",
        beforeLabel: "Antes",
        afterLabel: "Después",
        angleFront: "Ángulo Frontal",
        angleSide: "Ángulo Alternativo",
        cta: "Ver Más Transformaciones →"
      },
      howitworks: {
        title: "Cómo Funciona",
        subtitle: "Claridad desde el día uno — así construimos impulso juntos",
        step1: { title: "Llamada de Evaluación", desc: "Reserva una consulta gratuita para mapear objetivos, estilo de vida, lesiones y el soporte exacto que necesitas." },
        step2: { title: "Plan Hecho para Ti", desc: "Recibe entrenamiento, nutrición y sistemas de hábitos personalizados dentro de la app Trainerize." },
        step3: { title: "Ejecución Guiada", desc: "Check-ins semanales más responsabilidad diaria por WhatsApp te mantienen consistente y seguro." },
        step4: { title: "Resultados que Permanecen", desc: "Siéntete más fuerte, más definido y en control con sistemas que puedes mantener a largo plazo." },
        cta: "Empieza Tu Viaje Hoy →"
      },
      video: {
        title: "Mira el Método Garcia Builder en Acción",
        subtitle: "Observa cómo nuestro enfoque personalizado entrega resultados duraderos",
        point1: "Protocolos de entrenamiento basados en evidencia",
        point2: "Nutrición personalizada sin restricciones",
        point3: "Soporte 24/7 por el chat de la app",
        point4: "Revisiones semanales y ajustes continuos",
        cta: "Empezar Ahora →"
      },
      blog: {
        section: { title: "Consejos & Guías de Expertos", subtitle: "Consejos basados en ciencia para acelerar tu transformación" },
        category: { training: "ENTRENAMIENTO", nutrition: "NUTRICIÓN", mindset: "MENTALIDAD" },
        post1: { title: "5 Errores que Destruyen tu Progreso en el Gym", excerpt: "Deja de dar vueltas. Aprende los errores más comunes y cómo corregirlos para avanzar más rápido." },
        post2: { title: "La Verdad sobre la Nutrición para Pérdida de Grasa", excerpt: "Corta el ruido y descubre lo que realmente funciona para perder grasa de manera sostenible." },
        post3: { title: "Por qué la Consistencia Supera a la Motivación", excerpt: "Construye hábitos y sistemas que te mantienen en camino incluso sin motivación." },
        readmore: "Leer Más →",
        viewall: "Ver Todos los Artículos →"
      },
      socialproof: {
        title: "Únete a Nuestra Comunidad",
        subtitle: "127+ personas transformaron sus vidas con Garcia Builder",
        cta: "Ver Todas las Historias de Éxito →"
      },
      social: {
        sectionTitle: "Transformaciones reales de profesionales ocupados",
        sectionSubtitle: "Resultados sólidos en 8–12 semanas con coaching que se adapta a tu estilo de vida, lesiones y agenda.",
        metric1: "Transformaciones corporales",
        metric2: "Tasa de éxito",
        metric3: "Países atendidos",
        cta: "Comenzar Mi Transformación →",
  quote1: { text: "Bajé 5 kg en 8 semanas con hábitos sencillos que se mantuvieron.", author: "Jessica R., 33" },
  quote2: { text: "Reduje 6 kg mientras gané un 5% de músculo en un bloque de 12 semanas.", author: "Tom L., 31" },
  quote3: { text: "Perdí 20 kg en 24 meses reconstruyendo hábitos de nutrición y confianza.", author: "Sofia L., 29" }
      },
      instagram: {
        title: "Sigue la jornada en Instagram",
        subtitle: "Motivación diaria, logros de clientes y consejos detrás de cámaras.",
  tag1: "Día de Fuerza",
  tag2: "Guía de Nutrición",
        tag3: "Cliente Destacado",
        tag4: "Historia de Éxito"
      },
      authority: {
        title: "Por qué los atletas confían en Garcia Builder",
        subtitle: "Credenciales, experiencia y sistemas creados para personas reales, no modas pasajeras.",
        card1: { title: "ActiveIQ Level 3 PT", desc: "Entrenador personal certificado reconocido en Reino Unido y la UE." },
        card2: { title: "12+ Años Entrenando", desc: "Cientos de clientes guiados en pérdida de grasa, recomposición y rendimiento." },
        card3: { title: "Coaching en EN • PT • ES", desc: "Comunícate en el idioma que te mantiene motivado y responsable." },
        card4: { title: "Ecosistema Trainerize", desc: "App claro para entrenos, objetivos de nutrición, hábitos y seguimiento del progreso." }
      },
      stats: {
        clients: "Clientes Transformados",
        workouts: "Entrenamientos Completados",
        success: "Tasa de Éxito",
        rating: "Calificación Promedio"
      },
      guarantee: {
        certified: "Profesional Certificado",
        "certified.desc": "Entrenador personal calificado con 12+ años de experiencia",
        privacy: "100% Privado",
        "privacy.desc": "Tus datos son seguros y nunca compartidos",
        support: "Soporte 24/7",
        "support.desc": "Acceso al chat de la app para preguntas en cualquier momento",
        flexible: "Cancela en Cualquier Momento",
        "flexible.desc": "Sin contratos a largo plazo"
      },
      reviews: {
        google: "Calificado 5.0 en Google",
        count: "(25 reseñas)"
      },
      hero: {
        p: "Entrenamiento, nutricion y seguimiento semanal creados para tu rutina."
      },
      cta: {
        start: "Reserva Tu Consulta Gratuita",
        plans: "Ver Planes y Precios",
        whatsapp: "Hablar por WhatsApp",
        whatsapp_prefer: "¿Prefieres WhatsApp? Chatea Ahora",
        strip: {
          title: "¿Listo para empezar? Construyamos tu cuerpo más fuerte.",
          p: "Reserva una consulta gratuita o envíame un DM en Instagram. Entreno en ES/EN/PT.",
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
        f1: { title: "Entrena con Inteligencia", p: "Programación personalizada para que cada sesión te acerque a tu meta." },
        f2: { title: "Come lo que Te Gusta", p: "Metas de nutrición equilibradas que encajan con tu cultura, agenda y vida social." },
        f3: { title: "Progreso que Puedes Ver", p: "Revisiones semanales de datos mantienen entrenamiento, nutrición y recuperación alineados." },
        f4: { title: "Responsabilidad que Perdura", p: "Toques diarios por WhatsApp y feedback cuando lo necesitas, no solo en el check-in." },
        f5: { title: "Hecho para Cuerpos Reales", p: "Correcciones de técnica, regresiones inteligentes y programación consciente del dolor." },
        f6: { title: "Hábitos que Permanecen", p: "Rutinas simples que construyen disciplina, confianza y victorias consistentes." }
      },
      footer: {
        whatsapp: "Chat del coach",
        language_label: "Idioma del sitio",
        language_help: "Cambia el idioma utilizado en todo el sitio."
      },
      about: {
        title: "Sobre Garcia Builder",
        subtitle: "Entrenamos a personas reales para construir cuerpos fuertes y atléticos — con nutrición simple, entrenamiento preciso y responsabilidad que funciona.",
        mission: "Misión y Visión",
        mission_text: "Garcia Builder existe para convertir disciplina en resultados. Nuestra misión es entrenar a personas ocupadas para ganar músculo, perder grasa y moverse con confianza — sin dietas extremas o trucos. Guiados por la marca GB y su estándar de oro, mantenemos el proceso simple: bloques de entrenamiento claros, nutrición flexible y check-ins semanales que generan consistencia. La visión es una comunidad conocida por cuerpos fuertes y hábitos más fuertes, donde el progreso sobrevive a la vida real.",
        andre_title: "Andre Garcia — Mi Viaje",
        andre_text: "No crecí con condiciones perfectas. La Fuerza Aérea fue mi primer entrenador: alarmas a las 05:00, inspecciones y estándares que no se preocupaban por excusas. Allí aprendí que la disciplina vence al estado de ánimo y que el progreso es una decisión repetida diariamente. Cuando me mudé a Londres, llevé esa mentalidad a una ciudad donde no conocía a nadie. Trabajé largas horas, aprendí un nuevo ritmo y reconstruí mi vida una sesión de entrenamiento a la vez. El gimnasio se convirtió en mi brújula; el hierro me dio estructura cuando todo lo demás era incierto, y las repeticiones se convirtieron en un lenguaje en el que podía confiar.\n\nEl coaching creció naturalmente de ese camino. Estudié, obtuve credenciales y elegí servir en el suelo del gimnasio—escuchando, enseñando y liderando con el ejemplo. Como entrenador personal y coach, he ayudado a clientes en inglés, portugués y español a volverse más fuertes, perder grasa y moverse sin dolor. Más que fotos de antes y después, me enorgullecen los mensajes que dicen \"ahora soy una persona diferente.\" Mi método es simple e implacable: bloques de entrenamiento claros, nutrición simple que puedes seguir y responsabilidad que respeta la vida real. Sin exageraciones, sin juicios—solo la verdad y un plan.\n\nGarcia Builder es mi misión: construir personas que mantengan sus resultados. Si estás haciendo malabarismos con trabajo, familia o dudas, te encontraré donde estés, estableceré un ritmo que puedas sostener y mantendré un estándar que mejore tanto tu cuerpo como tu carácter. Tu historia no está atascada; está esperando un coach. Empecemos.",
        video: {
          title: "Cómo trabajamos técnica y tempo",
          subtitle: "Mira un resumen rápido de las indicaciones, tempos y responsabilidad que reciben los clientes dentro de un bloque de entrenamiento Garcia Builder.",
          point1: "Descubre cómo combinamos tempos e indicaciones para proteger las articulaciones mientras progresamos con las cargas.",
          point2: "Entiende el feedback en tiempo real que reciben los clientes dentro de la app de coaching.",
          point3: "Conoce cómo los check-ins semanales alinean entrenamiento, nutrición y recuperación.",
          cta: "Reserva una sesión estratégica →"
        },
        gallery: "Galería",
        assess: { title: "Evaluar", p: "Historial, objetivos, horario, equipamiento y lesiones — empezamos donde estás." },
        build: { title: "Construir", p: "Bloques de entrenamiento y nutrición simple adaptados a tu realidad." },
        execute: { title: "Ejecutar", p: "Revisiones semanales, seguimiento de progreso y ajustes inteligentes." },
        credentials: { title: "Credenciales", p: "Active IQ L2/L3 (UK) • 12+ años de coaching." },
        specialties: { title: "Especialidades", p: "Hipertrofia • Pérdida de grasa • Fuerza y Acondicionamiento." },
        values: { title: "Valores", p: "Claridad, disciplina y humanidad — resultados que duran en la vida real." },
        accountability: { title: "Responsabilidad", p: "Check-ins directos por el chat de la app para mantenerte consistente." },
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
        subtitle: "Personas reales. Resultados reales. Ve lo que es posible con la orientación correcta.",
        loadMore: {
          cta: "Cargar más transformaciones",
          remaining: "Cargar más ({remaining} restantes)",
          loaded: "Todas las transformaciones cargadas"
        },
        modal: {
          titleSuffix: " — Transformación",
          before: "Antes",
          after: "Después",
          timeline: "Cronología",
          results: "Resultados de la Transformación",
          age: "Edad",
          weightLost: "Peso perdido",
          bodyFat: "Grasa corporal",
          muscle: "Músculo",
          achievements: "Logros de Rendimiento",
          squat: "Sentadilla",
          deadlift: "Peso muerto",
          bench: "Press de banca",
          marathon: "Maratón",
          runTime: "Tiempo de 5K",
          miles: "Récord de distancia",
          pullUps: "Dominadas",
          pushUps: "Flexiones"
        },
        cards: {
          conrad: {
            overlay: "-9kg + 3kg masa magra",
            timeline: "12 Semanas",
            story: "Conrad equilibró semanas de consultoría de 60 horas con coaching preciso – perdió 9kg de grasa, sumó +3kg de masa magra y quedó sin dolor de hombro en 12 semanas."
          }
        }
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
      testimonial: {
        conrad: "Andre reconstruyó mi entrenamiento alrededor de semanas laborales de 60 horas. Perdimos 9kg de grasa, ganamos masa magra y mis hombros dejaron de doler."
      },
      pricing: {
        title: "Programas de Coaching",
        subtitle: "Elige la estructura que encaja con tu objetivo: acceso a la app, entrenamiento, nutrición, lista de compra, check-ins y accountability.",
        value: {
          title: "Qué incluye cada plan",
          text: "Ejecución clara, no solo un PDF: entrenamiento, nutrición y seguimiento organizados para que sepas exactamente el siguiente paso.",
          items: [
            "Acceso a Trainerize con entrenamientos estructurados",
            "Objetivos de nutrición, guía de comidas y apoyo con lista de compra",
            "Check-ins semanales, ajustes y accountability",
            "Checkout seguro, email de onboarding y agenda de consulta después de comprar"
          ]
        },
        plans: {
          monthly: {
            badge: "Coaching flexible",
            name: "Coaching Online Mensual",
            price: "€150",
            period: "/mes",
            meta: "Soporte continuo",
            result: "Ideal para progreso estable y mantenimiento",
            description: "Coaching online estándar para clientes que quieren estructura mensual sin un bloque cerrado de transformación.",
            features: [
              "Plan de entrenamiento personalizado en la app",
              "Objetivos de nutrición y guía de hábitos",
              "Check-in semanal y ajustes del plan",
              "Soporte por mensaje y accountability",
              "Cancela antes de la siguiente renovación mensual"
            ]
          },
          eight_week: {
            badge: "Programa inicial",
            name: "8 Semanas Fat Loss Kickstart",
            price: "€350",
            period: " pago único",
            meta: "8 semanas",
            result: "Objetivo realista: 5-8kg de pérdida de grasa",
            description: "Un reset enfocado para quien necesita un plan claro, estructura nutricional y accountability rápido.",
            features: [
              "Bloque de entrenamiento de 8 semanas para casa o gimnasio",
              "Configuración nutricional con estructura simple de comidas",
              "Guía de lista de compra y sustituciones",
              "Check-ins semanales de accountability",
              "Ideal para recuperar ritmo y consistencia"
            ]
          },
          twelve_week: {
            badge: "Principal",
            name: "Transformación 12 Semanas",
            price: "€600",
            period: " pago único",
            meta: "12 semanas",
            result: "Objetivo realista: 9-12kg de pérdida de grasa",
            featured: true,
            description: "El bloque principal Garcia Builder: tiempo suficiente para perder grasa, ganar fuerza y consolidar rutinas.",
            features: [
              "Plan progresivo completo de 12 semanas",
              "Calorías, macros y orientación nutricional",
              "Apoyo con lista de compra y estrategia para comer fuera",
              "Check-ins semanales con ajustes del plan",
              "Acceso a la app, soporte y accountability"
            ]
          },
          eighteen_week: {
            badge: "Más completo",
            name: "Transformación Completa 18 Semanas",
            price: "€750",
            period: " pago único",
            meta: "18 semanas",
            result: "Objetivo realista: 12-15kg de pérdida + hábitos a largo plazo",
            description: "Un bloque más profundo para metas grandes, más trabajo de hábitos y una transición más segura a mantenimiento.",
            features: [
              "Roadmap de entrenamiento y nutrición por 18 semanas",
              "Fase de pérdida de grasa + fase de construcción de hábitos",
              "Accountability avanzado y revisiones de progreso",
              "Listas de compra, estrategia para viajes y apoyo social",
              "Plan de mantenimiento para conservar mejor los resultados"
            ]
          }
        },
        cta: {
          choose: "Iniciar checkout seguro",
          popular: "Más Popular",
          contact: "Contacto para Detalles"
        },
        group_coaching: {
          title: "Coaching grupal y corporativo - ¡Próximamente!",
          subtitle: "Estamos preparando nuevos programas para grupos pequeños y equipos corporativos.",
          prompt: "¿Quieres acceso anticipado o unirte a la lista de espera?",
          cta: "Unirme a la lista de espera",
          footer: "¡Sé el primero en enterarte cuando lancemos estas ofertas!"
        },
        post_purchase: {
          title: "Después de la compra:",
          schedule: "Agendar consulta",
          preview: "Ver el primer entrenamiento"
        }
      },
      contact: {
        title: "Contacto",
        subtitle: "Cuéntame tu objetivo. Respondo en 24–48h.",
        quick: {
          whatsapp: "Hablar por WhatsApp",
          consult: "Agendar consulta gratis de 15 min",
          instagram: "Enviar mensaje en Instagram",
          note: "¿Prefieres el formulario? Llega directo a andre@garciabuilder.fitness."
        },
        form: {
          name: "Tu nombre",
          email: "Tu email",
          phone: "Teléfono (opcional)",
          preferredContact: "Contacto preferido",
          goal: "Objetivo principal",
          timeline: "Plazo objetivo",
          experience: "Experiencia en entrenamiento",
          budget: "Presupuesto mensual (opcional)",
          message: "Cuéntame sobre tu situación",
          submit: "Enviar",
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
              instagram: "DM en Instagram",
              phone: "Llamada telefónica"
            },
            goals: {
              fatLoss: "Pérdida de grasa",
              muscleGain: "Ganancia muscular",
              recomposition: "Recomposición corporal",
              performance: "Rendimiento / Test físico",
              rehab: "Dolor y rehabilitación (ej: hombro, lumbar)",
              health: "Salud general y confianza"
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
            },
            budget: {
              notSay: "Prefiero no decir",
              low: "€100–€199",
              medium: "€200–€299",
              high: "€300–€499",
              premium: "€500+"
            }
          },
          consent: "Acepto ser contactado sobre el coaching y entiendo que mis datos se usarán solo para responder a esta consulta.",
          footnote: "Tiempo medio de respuesta: 24–48h. Sin spam."
        },
        newsletter: {
          title: "Mantente Informado Mientras Esperas",
          description: "Mientras reviso tu mensaje, únete a miles que reciben consejos semanales de entrenamiento, nutrición y novedades exclusivas.",
          cta: "Unirme al boletín"
        },
        trainer: {
          lead: "Únete a nuestra red de entrenadores certificados y ayuda a transformar vidas con coaching basado en evidencia.",
          qualification: "Se requieren certificaciones profesionales",
          remote: "Trabaja de manera remota con clientes globales",
          cta: "Postularse"
        }
      },
      auth: {
        login_title: "Iniciar sesión",
        login_subtitle: "Accede a tu cuenta Garcia Builder",
        register_title: "Crear cuenta",
        register_subtitle: "Únete a Garcia Builder",
        email: "Email",
        email_invalid: "Introduce un email válido.",
        password: "Contraseña",
        name: "Nombre completo",
        confirm_password: "Confirmar contraseña",
        phone_optional: "Teléfono (opcional)",
        date_of_birth: "Fecha de nacimiento",
        email_placeholder: "tu@email.com",
        password_placeholder: "Tu contraseña",
        password_min_placeholder: "Mínimo 6 caracteres",
        name_placeholder: "Tu nombre completo",
        phone_placeholder: "+34 666 123 456",
        confirm_password_placeholder: "Confirma tu contraseña",
        remember_me: "Recordarme",
        login_btn: "Entrar",
        register_btn: "Crear cuenta",
        no_account: "¿No tienes cuenta?",
        create_account: "Crear cuenta",
        have_account: "¿Ya tienes cuenta?",
        login_link: "Iniciar sesión",
        agree_terms: "Acepto los",
        terms_link: "Términos de uso",
        or_continue_with: "o continúa con",
        continue_google: "Continuar con Google",
        continue_facebook: "Continuar con Facebook",
        forgot_password: "¿Olvidaste tu contraseña?",
        forgot_password_title: "Olvidé mi contraseña",
        forgot_password_subtitle: "Introduce tu email y te enviaremos un enlace para restablecerla.",
        send_reset_link: "Enviar enlace de restablecimiento",
        back_to_login: "Volver al login",
        sending: "Enviando...",
        forgot_email_required: "Introduce tu email.",
        forgot_success: "✅ ¡Enlace enviado! Revisa tu email ({email}) para restablecer tu contraseña.",
        forgot_error_user_not_found: "No encontramos una cuenta con este email.",
        forgot_error_rate_limit: "Demasiadas solicitudes. Espera unos minutos antes de intentarlo de nuevo.",
        forgot_error_generic: "Error: {message}"
      },
      common: {
        ok: "OK",
        close: "Cerrar"
      }
    }
  };

  const readPath = (obj, path) => {
    if (!obj) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];

    const parts = path.split('.');
    let cursor = obj;
    for (let i = 0; i < parts.length; i += 1) {
      const remaining = parts.slice(i).join('.');
      if (cursor && Object.prototype.hasOwnProperty.call(cursor, remaining)) {
        return cursor[remaining];
      }
      if (!cursor || cursor[parts[i]] === undefined) return undefined;
      cursor = cursor[parts[i]];
    }
    return cursor;
  };
  const writePath = (obj, path, value) => {
    const parts = path.split('.');
    let cursor = obj;
    parts.slice(0, -1).forEach(part => {
      if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
      cursor = cursor[part];
    });
    cursor[parts[parts.length - 1]] = value;
  };

  const aliasPaths = [
    ['home.social', 'social'],
    ['home.featured', 'featured'],
    ['home.authority', 'authority'],
    ['home.instagram', 'instagram']
  ];

  Object.keys(DICTS).forEach(lang => {
    aliasPaths.forEach(([alias, source]) => {
      const value = readPath(DICTS[lang], source);
      if (value !== undefined && readPath(DICTS[lang], alias) === undefined) {
        writePath(DICTS[lang], alias, value);
      }
    });
  });

  Object.assign(DICTS.en, {
    leadmagnet: {
      title: "Download the 28 Days Fat Loss Quickstart",
      subtitle: "Start with a practical 4-week structure for training, nutrition, steps and accountability.",
      bullet1: "Daily structure that fits work, family, and travel",
      bullet2: "Nutrition cheat-sheet with flexible meal ideas",
      bullet3: "Step-by-step habit stack that locks in results",
      badge: "Free Download",
      name: "Full Name",
      name_placeholder: "Enter your name",
      email: "Email Address",
      email_placeholder: "you@email.com",
      submit: "Send Me the 28-Day Guide",
      privacy: "No spam. The guide arrives instantly and you can unsubscribe anytime."
    },
    leadform: {
      section_title: "Ready to Transform Your Body?",
      section_subtitle: "Get your personalized fitness plan and join 127+ successful transformations",
      badge: "FREE CONSULTATION",
      title: "Get Your Personalized Fitness Plan",
      subtitle: "Start your transformation journey today",
      name: "Full Name",
      name_placeholder: "Enter your name",
      email: "Email Address",
      email_placeholder: "your@email.com",
      phone: "Phone Number",
      phone_placeholder: "+1 (555) 123-4567",
      goal: "Primary Goal",
      goal_select: "Select your goal",
      goal_weight_loss: "Weight Loss",
      goal_muscle_gain: "Muscle Gain",
      goal_strength: "Strength Training",
      goal_endurance: "Endurance",
      goal_fitness: "General Fitness",
      goal_recomp: "Body Recomposition",
      submit: "Get My Free Consultation",
      benefit1: "Personalized workout plan",
      benefit2: "Nutrition guidelines",
      benefit3: "24/7 in-app chat support",
      benefit4: "Progress tracking"
    },
    explore: {
      title: "Explore Your Journey",
      transformations: "Transformations",
      "transformations.desc": "127+ client results",
      testimonials: "Testimonials",
      "testimonials.desc": "Client success stories",
      pricing: "Pricing",
      "pricing.desc": "Flexible coaching plans",
      blog: "Blog & Tips",
      "blog.desc": "Expert resources"
    },
    trust: {
      certified: "Certified Professional",
      insured: "Fully Insured",
      clients: "127+ Success Stories"
    },
    newsletter: {
      title: "Get Weekly Expert Tips",
      desc: "Training advice, nutrition tips, and exclusive content delivered to your inbox.",
      cta: "Subscribe",
      privacy: "We respect your privacy. Unsubscribe anytime."
    }
  });
  Object.assign(DICTS.en.faq, {
    subtitle: "Everything you need to know about our online coaching",
    viewall: "View All FAQs"
  });
  Object.assign(DICTS.en.footer, {
    bio_line1: "Online Coaching - Evidence-based fitness, nutrition & accountability.",
    bio_line2: "Transform your body, sustainably.",
    book_consultation: "Book a Free Consultation",
    dm_instagram: "DM on Instagram",
    links: "Links",
    results: "Results",
    apply_trainer: "Apply as Trainer",
    resources: "Resources",
    download_guide: "Download 28-Day Guide (PDF)",
    book_call: "Book a Call",
    follow_us: "Follow us",
    newsletter: "Newsletter",
    email_placeholder: "Email address",
    newsletter_consent: "I would like to receive updates and tips from Garcia Builder.",
    subscribe: "Subscribe",
    newsletter_privacy: "You can unsubscribe at any time and your information will be treated according to our Privacy Policy.",
    cookie_preferences: "Cookie Preferences",
    privacy_policy: "Privacy Policy",
    terms: "Terms & Conditions",
    client_login: "Client Login",
    create_account: "Create Account",
    disclaimer: "*DISCLAIMER: Results may vary. Results are based on individual circumstances. Timeframes for results are not guaranteed. Willpower is always required!"
  });

  Object.assign(DICTS.pt, {
    leadmagnet: {
      title: "Baixe o 28 Days Fat Loss Quickstart",
      subtitle: "Comece com uma estrutura pratica de 4 semanas para treino, nutricao, passos e accountability.",
      bullet1: "Estrutura diaria que cabe no trabalho, familia e viagens",
      bullet2: "Guia de nutricao com ideias de refeicoes flexiveis",
      bullet3: "Passo a passo de habitos para manter resultados",
      badge: "Download Gratis",
      name: "Nome Completo",
      name_placeholder: "Digite seu nome",
      email: "Email",
      email_placeholder: "voce@email.com",
      submit: "Enviar o Guia de 28 Dias",
      privacy: "Sem spam. O guia chega na hora e voce pode cancelar quando quiser."
    },
    leadform: {
      section_title: "Pronto para Transformar Seu Corpo?",
      section_subtitle: "Receba seu plano fitness personalizado e junte-se a 127+ transformacoes de sucesso",
      badge: "CONSULTA GRATIS",
      title: "Receba Seu Plano Fitness Personalizado",
      subtitle: "Comece sua transformacao hoje",
      name: "Nome Completo",
      name_placeholder: "Digite seu nome",
      email: "Email",
      email_placeholder: "seu@email.com",
      phone: "Telefone",
      phone_placeholder: "+55 11 99999-9999",
      goal: "Objetivo Principal",
      goal_select: "Selecione seu objetivo",
      goal_weight_loss: "Perda de Peso",
      goal_muscle_gain: "Ganho de Massa",
      goal_strength: "Treino de Forca",
      goal_endurance: "Resistencia",
      goal_fitness: "Condicionamento Geral",
      goal_recomp: "Recomposicao Corporal",
      submit: "Quero Minha Consulta Gratis",
      benefit1: "Plano de treino personalizado",
      benefit2: "Orientacoes de nutricao",
      benefit3: "Suporte no app 24/7",
      benefit4: "Acompanhamento de progresso"
    },
    explore: {
      title: "Explore Sua Jornada",
      transformations: "Transformacoes",
      "transformations.desc": "127+ resultados de clientes",
      testimonials: "Depoimentos",
      "testimonials.desc": "Historias de sucesso dos clientes",
      pricing: "Precos",
      "pricing.desc": "Planos flexiveis de coaching",
      blog: "Blog e Dicas",
      "blog.desc": "Recursos de especialistas"
    },
    trust: {
      certified: "Profissional Certificado",
      insured: "Totalmente Segurado",
      clients: "127+ Historias de Sucesso"
    },
    newsletter: {
      title: "Receba Dicas Semanais",
      desc: "Conselhos de treino, nutricao e conteudo exclusivo direto no seu email.",
      cta: "Assinar",
      privacy: "Respeitamos sua privacidade. Cancele quando quiser."
    }
  });
  Object.assign(DICTS.pt.faq, {
    subtitle: "Tudo que voce precisa saber sobre nosso coaching online",
    viewall: "Ver Todas as FAQs"
  });
  Object.assign(DICTS.pt.footer, {
    bio_line1: "Coaching Online - Fitness, nutricao e responsabilidade com base em evidencia.",
    bio_line2: "Transforme seu corpo de forma sustentavel.",
    book_consultation: "Agendar Consulta Gratis",
    dm_instagram: "Enviar DM no Instagram",
    links: "Links",
    results: "Resultados",
    apply_trainer: "Candidatar-se como Treinador",
    resources: "Recursos",
    download_guide: "Baixar Guia de 28 Dias (PDF)",
    book_call: "Agendar Chamada",
    follow_us: "Siga-nos",
    newsletter: "Newsletter",
    email_placeholder: "Endereco de email",
    newsletter_consent: "Quero receber novidades e dicas do Garcia Builder.",
    subscribe: "Assinar",
    newsletter_privacy: "Voce pode cancelar a qualquer momento e suas informacoes serao tratadas de acordo com nossa Politica de Privacidade.",
    cookie_preferences: "Preferencias de Cookies",
    privacy_policy: "Politica de Privacidade",
    terms: "Termos e Condicoes",
    client_login: "Login do Cliente",
    create_account: "Criar Conta",
    disclaimer: "*AVISO: Os resultados podem variar. Os resultados dependem das circunstancias individuais. Prazos de resultados nao sao garantidos. Forca de vontade sempre e necessaria!"
  });

  Object.assign(DICTS.es, {
    leadmagnet: {
      title: "Descarga el 28 Days Fat Loss Quickstart",
      subtitle: "Empieza con una estructura practica de 4 semanas para entrenamiento, nutricion, pasos y accountability.",
      bullet1: "Estructura diaria que encaja con trabajo, familia y viajes",
      bullet2: "Guia de nutricion con ideas flexibles de comidas",
      bullet3: "Sistema paso a paso de habitos para mantener resultados",
      badge: "Descarga Gratis",
      name: "Nombre Completo",
      name_placeholder: "Escribe tu nombre",
      email: "Email",
      email_placeholder: "tu@email.com",
      submit: "Enviame la Guia de 28 Dias",
      privacy: "Sin spam. La guia llega al instante y puedes cancelar cuando quieras."
    },
    leadform: {
      section_title: "Listo para Transformar Tu Cuerpo?",
      section_subtitle: "Recibe tu plan fitness personalizado y unete a 127+ transformaciones exitosas",
      badge: "CONSULTA GRATIS",
      title: "Recibe Tu Plan Fitness Personalizado",
      subtitle: "Empieza tu transformacion hoy",
      name: "Nombre Completo",
      name_placeholder: "Escribe tu nombre",
      email: "Email",
      email_placeholder: "tu@email.com",
      phone: "Telefono",
      phone_placeholder: "+34 666 123 456",
      goal: "Objetivo Principal",
      goal_select: "Selecciona tu objetivo",
      goal_weight_loss: "Perdida de Peso",
      goal_muscle_gain: "Ganar Musculo",
      goal_strength: "Entrenamiento de Fuerza",
      goal_endurance: "Resistencia",
      goal_fitness: "Fitness General",
      goal_recomp: "Recomposicion Corporal",
      submit: "Quiero Mi Consulta Gratis",
      benefit1: "Plan de entrenamiento personalizado",
      benefit2: "Guias de nutricion",
      benefit3: "Soporte 24/7 en la app",
      benefit4: "Seguimiento de progreso"
    },
    explore: {
      title: "Explora Tu Camino",
      transformations: "Transformaciones",
      "transformations.desc": "127+ resultados de clientes",
      testimonials: "Testimonios",
      "testimonials.desc": "Historias de exito de clientes",
      pricing: "Precios",
      "pricing.desc": "Planes flexibles de coaching",
      blog: "Blog y Consejos",
      "blog.desc": "Recursos expertos"
    },
    trust: {
      certified: "Profesional Certificado",
      insured: "Totalmente Asegurado",
      clients: "127+ Historias de Exito"
    },
    newsletter: {
      title: "Recibe Consejos Semanales",
      desc: "Consejos de entrenamiento, nutricion y contenido exclusivo en tu email.",
      cta: "Suscribirse",
      privacy: "Respetamos tu privacidad. Puedes cancelar cuando quieras."
    }
  });
  Object.assign(DICTS.es.faq, {
    subtitle: "Todo lo que necesitas saber sobre nuestro coaching online",
    viewall: "Ver Todas las FAQs"
  });
  Object.assign(DICTS.es.footer, {
    bio_line1: "Coaching Online - Fitness, nutricion y responsabilidad con base en evidencia.",
    bio_line2: "Transforma tu cuerpo de forma sostenible.",
    book_consultation: "Reservar Consulta Gratis",
    dm_instagram: "Enviar DM en Instagram",
    links: "Enlaces",
    results: "Resultados",
    apply_trainer: "Postularse como Entrenador",
    resources: "Recursos",
    download_guide: "Descargar Guia de 28 Dias (PDF)",
    book_call: "Reservar Llamada",
    follow_us: "Siguenos",
    newsletter: "Newsletter",
    email_placeholder: "Email",
    newsletter_consent: "Quiero recibir novedades y consejos de Garcia Builder.",
    subscribe: "Suscribirse",
    newsletter_privacy: "Puedes cancelar en cualquier momento y tu informacion sera tratada segun nuestra Politica de Privacidad.",
    cookie_preferences: "Preferencias de Cookies",
    privacy_policy: "Politica de Privacidad",
    terms: "Terminos y Condiciones",
    client_login: "Login de Cliente",
    create_account: "Crear Cuenta",
    disclaimer: "*AVISO: Los resultados pueden variar. Los resultados dependen de circunstancias individuales. Los plazos no estan garantizados. La fuerza de voluntad siempre es necesaria!"
  });

  const KEY = "gb_lang";
  const clamp = (l) => (l==="en"||l==="pt"||l==="es") ? l : "en";
  const LANGUAGE_SELECT_IDS = ['lang-select', 'lang-select-navbar', 'lang-select-footer'];
  const STATIC_TEXT_TRANSLATIONS = {
    pt: {
      "I didn't grow up with perfect conditions. The Air Force was my first coach: 05:00 alarms, inspections, and standards that didn't care about excuses. There I learned that discipline beats mood and that progress is a decision repeated daily. When I moved to London, I carried that mindset into a city where I knew no one. I worked long hours, learned a new rhythm, and rebuilt my life one training session at a time. The gym became my compass; iron gave me structure when everything else was uncertain, and reps became a language I could trust.": "Nao cresci com condicoes perfeitas. A Forca Aerea foi meu primeiro treinador: alarmes as 05:00, inspecoes e padroes que nao aceitavam desculpas. La aprendi que disciplina vence humor e que progresso e uma decisao repetida todos os dias. Quando me mudei para Londres, levei essa mentalidade para uma cidade onde nao conhecia ninguem. Trabalhei longas horas, aprendi um novo ritmo e reconstruí minha vida uma sessao de treino por vez. A academia virou minha bussola; o ferro me deu estrutura quando todo o resto era incerto, e as repeticoes viraram uma linguagem em que eu podia confiar.",
      "Coaching grew naturally from that path. I studied, earned credentials, and chose to serve on the gym floor - listening, teaching, and leading by example. As a personal trainer and coach, I've helped clients in English, Portuguese and Spanish get stronger, drop fat and move without pain. More than before-and-after pictures, I'm proud of the messages that say \"I'm a different person now.\" My method is simple and relentless: clear training blocks, simple nutrition you can follow, and accountability that respects real life. No hype, no judgment - just the truth and a plan.": "O coaching cresceu naturalmente desse caminho. Estudei, conquistei certificacoes e escolhi servir no chao da academia - ouvindo, ensinando e liderando pelo exemplo. Como personal trainer e coach, ajudei clientes em ingles, portugues e espanhol a ficarem mais fortes, perderem gordura e se moverem sem dor. Mais do que fotos de antes e depois, tenho orgulho das mensagens que dizem \"agora sou uma pessoa diferente\". Meu metodo e simples e firme: blocos de treino claros, nutricao simples que voce consegue seguir e responsabilidade que respeita a vida real. Sem exagero, sem julgamento - apenas verdade e um plano.",
      "Join Our Coaching Team": "Junte-se ao Nosso Time de Coaches",
      "Are you a certified trainer passionate about transforming lives? Garcia Builder is expanding our coaching network to help more people achieve their fitness goals with evidence-based methods and genuine accountability.": "Voce e um treinador certificado apaixonado por transformar vidas? O Garcia Builder esta expandindo sua rede de coaching para ajudar mais pessoas a alcancarem seus objetivos fitness com metodos baseados em evidencia e responsabilidade real.",
      "Professional Standards": "Padroes Profissionais",
      "Level 3+ qualifications and proven coaching experience required": "Qualificacao Level 3+ e experiencia comprovada em coaching sao necessarias",
      "Client-Focused": "Foco no Cliente",
      "Dedicated to real results through sustainable methods": "Dedicado a resultados reais por meio de metodos sustentaveis",
      "Remote Flexibility": "Flexibilidade Remota",
      "Work with clients worldwide through our platform": "Trabalhe com clientes no mundo todo pela nossa plataforma",
      "Apply to Become a Trainer": "Candidatar-se como Treinador",
      "Stay Connected with Garcia Builder": "Fique Conectado com o Garcia Builder",
      "Get weekly training tips, nutrition insights, and exclusive content delivered straight to your inbox. Join thousands of people transforming their bodies and building lasting habits.": "Receba dicas semanais de treino, insights de nutricao e conteudo exclusivo direto no seu email. Junte-se a milhares de pessoas transformando o corpo e construindo habitos duradouros.",
      "What would you like to receive?": "O que voce gostaria de receber?",
      "Training Tips": "Dicas de Treino",
      "Nutrition Advice": "Conselhos de Nutricao",
      "Success Stories": "Historias de Sucesso",
      "Special Offers": "Ofertas Especiais",
      "We respect your privacy. Unsubscribe at any time.": "Respeitamos sua privacidade. Cancele quando quiser.",
      "Book Free Consultation": "Agendar Consulta Gratis",
      "Book a Free Call": "Agendar Chamada Gratis",
      "Book a Free Consultation": "Agendar Consulta Gratis",
      "Book a Call": "Agendar Chamada",
      "Chat on WhatsApp": "Conversar no WhatsApp",
      "Programs": "Programas",
      "Hypertrophy": "Hipertrofia",
      "Periodized split focused on progressive overload.": "Divisao periodizada focada em sobrecarga progressiva.",
      "Fat Loss": "Perda de Gordura",
      "Higher frequency training + simple nutrition targets.": "Treino com maior frequencia + metas simples de nutricao.",
      "Strength & Conditioning": "Forca e Condicionamento",
      "Performance-driven cycles with conditioning support.": "Ciclos focados em performance com suporte de condicionamento.",
      "Frequently Asked Questions": "Perguntas Frequentes",
      "Get answers about online coaching, plans, nutrition, results, and methodology": "Tire suas duvidas sobre coaching online, planos, nutricao, resultados e metodologia",
      "Common Questions": "Perguntas Comuns",
      "Find answers to everything you need to know about Garcia Builder coaching": "Encontre respostas para tudo que voce precisa saber sobre o coaching Garcia Builder",
      "Real Results, Real People": "Resultados Reais, Pessoas Reais",
      "Transformations": "Transformacoes",
      "Success Rate": "Taxa de Sucesso",
      "Average Rating": "Avaliacao Media",
      "Countries Served": "Paises Atendidos",
      "Search testimonials": "Buscar depoimentos",
      "All Stories": "Todas as Historias",
      "Weight Loss": "Perda de Peso",
      "Muscle Gain": "Ganho de Massa",
      "Body Recomposition": "Recomposicao Corporal",
      "Health & Wellness": "Saude e Bem-estar",
      "Performance": "Performance",
      "Lifestyle": "Estilo de Vida",
      "Want to share your story?": "Quer compartilhar sua historia?",
      "We love to feature real client results!": "Adoramos mostrar resultados reais dos clientes!",
      "Your feedback inspires others and helps us grow. Thank you!": "Seu feedback inspira outras pessoas e nos ajuda a crescer. Obrigado!",
      "Fitness Blog": "Blog Fitness",
      "Expert insights on training, nutrition, and lifestyle optimization": "Insights de especialistas sobre treino, nutricao e otimizacao do estilo de vida",
      "Browse by Category": "Navegue por Categoria",
      "Find articles that match your fitness goals and interests": "Encontre artigos alinhados aos seus objetivos e interesses fitness",
      "All Articles": "Todos os Artigos",
      "Training": "Treino",
      "Nutrition": "Nutricao",
      "Rehabilitation": "Reabilitacao",
      "Mindset": "Mentalidade",
      "Health": "Saude",
      "Science": "Ciencia",
      "Technology": "Tecnologia",
      "Business": "Negocios",
      "Read Article": "Ler Artigo",
      "Privacy Policy": "Politica de Privacidade",
      "Terms of Service": "Termos de Servico",
      "Last updated:": "Ultima atualizacao:",
      "Information We Collect": "Informacoes que Coletamos",
      "How We Use Information": "Como Usamos as Informacoes",
      "Data Sharing": "Compartilhamento de Dados",
      "Your Rights": "Seus Direitos",
      "Contact": "Contato",
      "Back to Plans": "Voltar aos Planos",
      "Contact Support": "Falar com o Suporte",
      "Verification Error": "Erro de Verificacao",
      "There was a problem verifying your payment. Please contact us.": "Houve um problema ao verificar seu pagamento. Entre em contato conosco.",
      "Email Address": "Email",
      "Your Name": "Seu Nome",
      "Subscribe": "Assinar",
      "Apply now": "Candidatar-se agora",
      "Book an intro call": "Agendar chamada inicial"
    },
    es: {
      "I didn't grow up with perfect conditions. The Air Force was my first coach: 05:00 alarms, inspections, and standards that didn't care about excuses. There I learned that discipline beats mood and that progress is a decision repeated daily. When I moved to London, I carried that mindset into a city where I knew no one. I worked long hours, learned a new rhythm, and rebuilt my life one training session at a time. The gym became my compass; iron gave me structure when everything else was uncertain, and reps became a language I could trust.": "No creci con condiciones perfectas. La Fuerza Aerea fue mi primer entrenador: alarmas a las 05:00, inspecciones y estandares que no aceptaban excusas. Alli aprendi que la disciplina supera al estado de animo y que el progreso es una decision repetida cada dia. Cuando me mude a Londres, lleve esa mentalidad a una ciudad donde no conocia a nadie. Trabaje muchas horas, aprendi un nuevo ritmo y reconstruí mi vida una sesion de entrenamiento a la vez. El gimnasio se volvio mi brujula; el hierro me dio estructura cuando todo lo demas era incierto, y las repeticiones se volvieron un idioma en el que podia confiar.",
      "Coaching grew naturally from that path. I studied, earned credentials, and chose to serve on the gym floor - listening, teaching, and leading by example. As a personal trainer and coach, I've helped clients in English, Portuguese and Spanish get stronger, drop fat and move without pain. More than before-and-after pictures, I'm proud of the messages that say \"I'm a different person now.\" My method is simple and relentless: clear training blocks, simple nutrition you can follow, and accountability that respects real life. No hype, no judgment - just the truth and a plan.": "El coaching crecio naturalmente desde ese camino. Estudie, obtuve certificaciones y elegi servir en el gimnasio: escuchando, ensenando y liderando con el ejemplo. Como entrenador personal y coach, he ayudado a clientes en ingles, portugues y espanol a ser mas fuertes, perder grasa y moverse sin dolor. Mas que fotos de antes y despues, me enorgullecen los mensajes que dicen \"ahora soy una persona diferente\". Mi metodo es simple y firme: bloques de entrenamiento claros, nutricion sencilla que puedes seguir y responsabilidad que respeta la vida real. Sin exageraciones, sin juicio: solo verdad y un plan.",
      "Join Our Coaching Team": "Unete a Nuestro Equipo de Coaches",
      "Are you a certified trainer passionate about transforming lives? Garcia Builder is expanding our coaching network to help more people achieve their fitness goals with evidence-based methods and genuine accountability.": "Eres un entrenador certificado apasionado por transformar vidas? Garcia Builder esta expandiendo su red de coaching para ayudar a mas personas a alcanzar sus objetivos fitness con metodos basados en evidencia y responsabilidad real.",
      "Professional Standards": "Estandares Profesionales",
      "Level 3+ qualifications and proven coaching experience required": "Se requiere certificacion Level 3+ y experiencia comprobada en coaching",
      "Client-Focused": "Enfoque en el Cliente",
      "Dedicated to real results through sustainable methods": "Dedicado a resultados reales mediante metodos sostenibles",
      "Remote Flexibility": "Flexibilidad Remota",
      "Work with clients worldwide through our platform": "Trabaja con clientes de todo el mundo a traves de nuestra plataforma",
      "Apply to Become a Trainer": "Postularse como Entrenador",
      "Stay Connected with Garcia Builder": "Mantente Conectado con Garcia Builder",
      "Get weekly training tips, nutrition insights, and exclusive content delivered straight to your inbox. Join thousands of people transforming their bodies and building lasting habits.": "Recibe consejos semanales de entrenamiento, ideas de nutricion y contenido exclusivo directo en tu email. Unete a miles de personas transformando su cuerpo y creando habitos duraderos.",
      "What would you like to receive?": "Que te gustaria recibir?",
      "Training Tips": "Consejos de Entrenamiento",
      "Nutrition Advice": "Consejos de Nutricion",
      "Success Stories": "Historias de Exito",
      "Special Offers": "Ofertas Especiales",
      "We respect your privacy. Unsubscribe at any time.": "Respetamos tu privacidad. Puedes cancelar cuando quieras.",
      "Book Free Consultation": "Reservar Consulta Gratis",
      "Book a Free Call": "Reservar Llamada Gratis",
      "Book a Free Consultation": "Reservar Consulta Gratis",
      "Book a Call": "Reservar Llamada",
      "Chat on WhatsApp": "Hablar por WhatsApp",
      "Programs": "Programas",
      "Hypertrophy": "Hipertrofia",
      "Periodized split focused on progressive overload.": "Division periodizada enfocada en sobrecarga progresiva.",
      "Fat Loss": "Perdida de Grasa",
      "Higher frequency training + simple nutrition targets.": "Entrenamiento de mayor frecuencia + metas simples de nutricion.",
      "Strength & Conditioning": "Fuerza y Condicionamiento",
      "Performance-driven cycles with conditioning support.": "Ciclos enfocados en rendimiento con soporte de condicionamiento.",
      "Frequently Asked Questions": "Preguntas Frecuentes",
      "Get answers about online coaching, plans, nutrition, results, and methodology": "Encuentra respuestas sobre coaching online, planes, nutricion, resultados y metodologia",
      "Common Questions": "Preguntas Comunes",
      "Find answers to everything you need to know about Garcia Builder coaching": "Encuentra todo lo que necesitas saber sobre el coaching Garcia Builder",
      "Real Results, Real People": "Resultados Reales, Personas Reales",
      "Transformations": "Transformaciones",
      "Success Rate": "Tasa de Exito",
      "Average Rating": "Calificacion Media",
      "Countries Served": "Paises Atendidos",
      "Search testimonials": "Buscar testimonios",
      "All Stories": "Todas las Historias",
      "Weight Loss": "Perdida de Peso",
      "Muscle Gain": "Ganar Musculo",
      "Body Recomposition": "Recomposicion Corporal",
      "Health & Wellness": "Salud y Bienestar",
      "Performance": "Rendimiento",
      "Lifestyle": "Estilo de Vida",
      "Want to share your story?": "Quieres compartir tu historia?",
      "We love to feature real client results!": "Nos encanta mostrar resultados reales de clientes!",
      "Your feedback inspires others and helps us grow. Thank you!": "Tu feedback inspira a otros y nos ayuda a crecer. Gracias!",
      "Fitness Blog": "Blog Fitness",
      "Expert insights on training, nutrition, and lifestyle optimization": "Ideas de expertos sobre entrenamiento, nutricion y optimizacion del estilo de vida",
      "Browse by Category": "Explorar por Categoria",
      "Find articles that match your fitness goals and interests": "Encuentra articulos alineados con tus objetivos e intereses fitness",
      "All Articles": "Todos los Articulos",
      "Training": "Entrenamiento",
      "Nutrition": "Nutricion",
      "Rehabilitation": "Rehabilitacion",
      "Mindset": "Mentalidad",
      "Health": "Salud",
      "Science": "Ciencia",
      "Technology": "Tecnologia",
      "Business": "Negocios",
      "Read Article": "Leer Articulo",
      "Privacy Policy": "Politica de Privacidad",
      "Terms of Service": "Terminos de Servicio",
      "Last updated:": "Ultima actualizacion:",
      "Information We Collect": "Informacion que Recopilamos",
      "How We Use Information": "Como Usamos la Informacion",
      "Data Sharing": "Compartir Datos",
      "Your Rights": "Tus Derechos",
      "Contact": "Contacto",
      "Back to Plans": "Volver a Planes",
      "Contact Support": "Contactar Soporte",
      "Verification Error": "Error de Verificacion",
      "There was a problem verifying your payment. Please contact us.": "Hubo un problema al verificar tu pago. Contactanos.",
      "Email Address": "Email",
      "Your Name": "Tu Nombre",
      "Subscribe": "Suscribirse",
      "Apply now": "Postularse ahora",
      "Book an intro call": "Reservar llamada inicial"
    }
  };

  Object.assign(STATIC_TEXT_TRANSLATIONS.pt, {
    "Workout library": "Biblioteca de treinos",
    "Training templates organized into real transformation projects.": "Templates de treino organizados em projetos reais de transformacao.",
    "Choose a focused workout template or follow a longer 12, 16, or 20 week project built around fat loss, glutes, strength, confidence and consistency.": "Escolha um template focado ou siga um projeto mais longo de 12, 16 ou 20 semanas para perda de gordura, gluteos, forca, confianca e consistencia.",
    "Browse templates": "Ver templates",
    "Customize my plan": "Personalizar meu plano",
    "Projects": "Projetos",
    "Week options": "Opcoes em semanas",
    "Built for action": "Feito para acao",
    "Start with a template. Progress with structure.": "Comece com um template. Evolua com estrutura.",
    "Each workout template includes a weekly split, training focus, equipment, session structure and progression cue. Projects group templates into longer roadmaps so users can start with structure and progress through 12, 16, or 20 week phases.": "Cada template inclui divisao semanal, foco de treino, equipamento, estrutura da sessao e progressao. Os projetos agrupam templates em jornadas mais longas para o usuario evoluir por fases de 12, 16 ou 20 semanas.",
    "Signature template projects": "Projetos de templates",
    "Choose the goal first. Then pick the template level.": "Escolha o objetivo primeiro. Depois escolha o nivel do template.",
    "View templates": "Ver templates",
    "Summer Shred": "Projeto Verao Shred",
    "Glute Launch": "Gluteos em Orbita",
    "Fit Dad Blueprint": "Pai Sarado Blueprint",
    "Fat-loss, conditioning, shape and routine for people who want a clear summer-ready plan without guessing every week.": "Perda de gordura, condicionamento, forma e rotina para quem quer um plano claro para o verao sem adivinhar o que fazer toda semana.",
    "Glute, legs, posture and lower-body progression with strength phases and shape-focused accessories.": "Progressao de gluteos, pernas, postura e membros inferiores com fases de forca e acessorios focados em shape.",
    "Strength, muscle and fat-loss structure for busy dads who need efficient training, confidence and visible progress.": "Estrutura de forca, musculo e perda de gordura para pais ocupados que precisam de treinos eficientes, confianca e progresso visivel.",
    "Search workouts": "Buscar treinos",
    "Search project, goal, level, equipment or focus": "Buscar por projeto, objetivo, nivel, equipamento ou foco",
    "Project": "Projeto",
    "All": "Todos",
    "Summer": "Verao",
    "Glutes": "Gluteos",
    "Fit Dad": "Pai Sarado",
    "Transforming bodies and lives with science-based coaching, accountability, and real results. Online coaching for busy professionals.": "Transformando corpos e vidas com coaching baseado em ciência, responsabilidade e resultados reais. Coaching online para profissionais ocupados.",
    "Nutrition for Fat Loss": "Nutrição para Perda de Gordura",
    "Data Deletion": "Exclusão de Dados",
    "Apply": "Candidatar-se",
    "Privacy": "Privacidade",
    "Terms": "Termos",
    "Free Guide": "Guia Grátis",
    "Contact Form": "Formulário de Contato",
    "Online coaching for real transformation. Evidence-based training, custom nutrition, and 1:1 accountability. Results in 8–12 weeks.": "Coaching online para transformação real. Treino baseado em evidência, nutrição personalizada e acompanhamento 1:1. Resultados em 8-12 semanas.",
    "Online coaching for real transformation. Evidence-based training, custom nutrition, and 1:1 accountability. Results in 8â€“12 weeks.": "Coaching online para transformação real. Treino baseado em evidência, nutrição personalizada e acompanhamento 1:1. Resultados em 8-12 semanas.",
    "Get tips, recipes, and exclusive offers. No spam.": "Receba dicas, receitas e ofertas exclusivas. Sem spam.",
    "View All Articles on Trainerize": "Ver todos os artigos no Trainerize",
    "Join Newsletter": "Entrar na Newsletter",
    "Weekly Training Tips": "Dicas Semanais de Treino",
    "Nutrition Insights": "Insights de Nutrição",
    "Exclusive Offers": "Ofertas Exclusivas",
    "No spam, ever. Unsubscribe at any time with one click.": "Sem spam. Cancele a qualquer momento com um clique.",
    "Are You a Personal Trainer?": "Você é Personal Trainer?",
    "Client Transformations": "Transformações de Clientes",
    "Real people. Real results. See what's possible with evidence-based coaching.": "Pessoas reais. Resultados reais. Veja o que é possível com coaching baseado em evidência.",
    "Clients Transformed": "Clientes Transformados",
    "Average Weeks": "Média de Semanas",
    "Success Rate (%)": "Taxa de Sucesso (%)",
    "Avg Kg Lost": "Média de Kg Perdidos",
    "All Transformations": "Todas as Transformações",
    "Strength": "Força",
    "Endurance": "Resistência",
    "kg Lost": "kg Perdidos",
    "Years Old": "Anos",
    "Weeks": "Semanas",
    "Months": "Meses",
    "Days": "Dias",
    "Body Fat": "Gordura Corporal",
    "Muscle": "Músculo",
    "Mass": "Massa",
    "9kg Lost · +3kg Lean": "9kg Perdidos · +3kg Magros",
    "15kg Lost in 6m": "15kg Perdidos em 6m",
    "-20% Body Fat": "-20% Gordura Corporal",
    "20kg Lost": "20kg Perdidos",
    "-8% BF + Muscle": "-8% GC + Músculo",
    "13kg Lost": "13kg Perdidos",
    "8kg Lost": "8kg Perdidos",
    "8kg Lost + Muscle": "8kg Perdidos + Músculo",
    "6kg Lost +5% Muscle": "6kg Perdidos +5% Músculo",
    "5kg Lost in 8w": "5kg Perdidos em 8s",
    "10kg Lost at 55": "10kg Perdidos aos 55",
    "4kg Lost in 8w": "4kg Perdidos em 8s",
    "4kg Lost + Muscle": "4kg Perdidos + Músculo",
    "5kg in 20d": "5kg em 20d",
    "10kg Lost": "10kg Perdidos",
    "5.5kg in 20d": "5,5kg em 20d",
    "12 Weeks": "12 Semanas",
    "6 Months": "6 Meses",
    "14 Months": "14 Meses",
    "24 Months": "24 Meses",
    "16 Weeks": "16 Semanas",
    "18 Weeks": "18 Semanas",
    "8 Weeks": "8 Semanas",
    "1 Year": "1 Ano",
    "6 Weeks": "6 Semanas",
    "20 Days": "20 Dias",
    "\"Conrad balanced consulting travel with precision coaching — 9kg fat loss, stronger shoulders and visible definition in just 12 weeks.\"": "\"Conrad conciliou viagens de consultoria com coaching preciso: 9kg de gordura a menos, ombros mais fortes e definição visível em apenas 12 semanas.\"",
    "\"Corporate schedule, two kids, zero extremes. Paulo stayed consistent for six months and dropped 15kg while rebuilding energy.\"": "\"Rotina corporativa, dois filhos, zero extremos. Paulo manteve constância por seis meses e perdeu 15kg enquanto recuperava energia.\"",
    "\"University athlete who stayed in the program for 14 months, dropping 20% body fat and adding lean strength in the process.\"": "\"Atleta universitário que ficou 14 meses no programa, reduziu 20% de gordura corporal e ganhou força magra no processo.\"",
    "\"Sofia rebuilt habits across two years - steady fat loss, better sleep, and a confident return to strength training.\"": "\"Sofia reconstruiu hábitos ao longo de dois anos: perda de gordura constante, sono melhor e retorno confiante ao treino de força.\"",
    "\"A structured 16-week block sharpened Hugo's conditioning, reduced body fat and rebuilt confidence under the bar.\"": "\"Um bloco estruturado de 16 semanas melhorou o condicionamento de Hugo, reduziu gordura corporal e reconstruiu confiança na barra.\"",
    "\"Light strength work, daily walks and smart nutrition helped Maria feel mobile again while dropping 13kg.\"": "\"Treino leve de força, caminhadas diárias e nutrição inteligente ajudaram Maria a se mover melhor enquanto perdia 13kg.\"",
    "\"Travel-heavy consultant turned routines around in 12 weeks, cutting 8kg and restoring training consistency.\"": "\"Mesmo viajando muito, este consultor virou a rotina em 12 semanas, perdeu 8kg e recuperou consistência no treino.\"",
    "\"Body recomposition at its finest! Lost fat while building strength and muscle in just 18 weeks.\"": "\"Recomposição corporal no melhor estilo: perdeu gordura enquanto ganhava força e músculo em apenas 18 semanas.\"",
    "\"The perfect combination! Lost 6kg of fat while gaining 5% muscle mass in just 12 weeks.\"": "\"A combinação perfeita: perdeu 6kg de gordura e ganhou 5% de massa muscular em apenas 12 semanas.\"",
    "\"Short timeframe, amazing results! 5kg down in 8 weeks with a program that respected my busy mom life.\"": "\"Prazo curto, resultado incrível: 5kg a menos em 8 semanas com um programa que respeitou minha rotina de mãe ocupada.\"",
    "\"Slow and steady at 55! One year of consistent habits led to a 10kg transformation and renewed energy.\"": "\"Constância aos 55: um ano de hábitos consistentes levou a uma transformação de 10kg e energia renovada.\"",
    "\"Quick results that last! 5kg transformation in 8 weeks with sustainable habits that continue to work.\"": "\"Resultados rápidos que duram: transformação de 5kg em 8 semanas com hábitos sustentáveis que continuam funcionando.\"",
    "\"College student success! Managed studies and training to achieve 4kg fat loss in 8 weeks.\"": "\"Sucesso de estudante universitário: conciliou estudos e treino para perder 4kg de gordura em 8 semanas.\"",
    "\"Camila committed to dialed-in nutrition and short, purposeful sessions to shed 4kg in six weeks while staying strong.\"": "\"Camila se comprometeu com nutrição ajustada e sessões curtas e focadas para perder 4kg em seis semanas mantendo a força.\"",
    "\"With a tight 20-day timeline, Renan tightened macros, upped steps and kept strength work heavy to make weight while staying explosive.\"": "\"Com apenas 20 dias, Renan ajustou macros, aumentou passos e manteve o treino pesado para bater o peso sem perder explosão.\"",
    "\"Helena leaned on accountability for a full year - 8kg lost, muscle definition gained and energy levels way up.\"": "\"Helena contou com acompanhamento por um ano inteiro: 8kg a menos, mais definição muscular e energia muito maior.\"",
    "\"Bianca followed a tight 12-week schedule - protein targets, steps and weekly check-ins to remove 10kg and feel athletic again.\"": "\"Bianca seguiu um plano firme de 12 semanas: metas de proteína, passos e check-ins semanais para perder 10kg e voltar a se sentir atlética.\"",
    "\"Gabriel executed a precise 16-week cut - 10kg down while keeping strength numbers climbing each block.\"": "\"Gabriel executou um cutting preciso de 16 semanas: 10kg a menos enquanto os números de força continuavam subindo a cada bloco.\"",
    "\"Short deadline, big discipline - Aline followed a tight daily plan and dropped 5.5kg in 20 days to kickstart her journey.\"": "\"Prazo curto, muita disciplina: Aline seguiu um plano diário firme e perdeu 5,5kg em 20 dias para iniciar sua jornada.\"",
    "Load More Transformations": "Carregar Mais Transformações",
    "Client Transformation": "Transformação do Cliente",
    "Transformation Story": "História da Transformação",
    "Key Results": "Resultados Principais",
    "Start Your Transformation": "Comece Sua Transformação",
    "Close": "Fechar",
    "Get Your Own Transformation": "Comece Sua Própria Transformação",
    "Inspired by these results? Join our newsletter to get weekly training tips, nutrition insights, and the exact strategies that helped these clients achieve their transformations.": "Inspirado por esses resultados? Entre na newsletter para receber dicas semanais de treino, insights de nutrição e as estratégias que ajudaram esses clientes a conquistarem suas transformações.",
    "Start My Journey": "Começar Minha Jornada",
    "Weekly Training Plans": "Planos Semanais de Treino",
    "Progress Tracking Tips": "Dicas de Acompanhamento de Progresso",
    "Community Support": "Suporte da Comunidade",
    "Success Strategies": "Estratégias de Sucesso",
    "Join thousands transforming their bodies. No spam, unsubscribe anytime.": "Junte-se a milhares transformando seus corpos. Sem spam, cancele quando quiser.",
    "The Ultimate Guide to Achieving 100 Push-ups": "Guia Definitivo para Chegar a 100 Flexões",
    "A realistic 20-week plan to build strength progressively and reach the milestone of 100 consecutive push-ups.": "Um plano realista de 20 semanas para construir força progressivamente e chegar a 100 flexões consecutivas.",
    "Training and Nutrition in Diabetes Management": "Treino e Nutrição no Controle do Diabetes",
    "Evidence-based strategies for using exercise and proper nutrition to manage diabetes effectively.": "Estratégias baseadas em evidência para usar exercício e nutrição adequada no controle eficaz do diabetes.",
    "10 Myths and Facts About Nutrition and Healthy Eating": "10 Mitos e Verdades Sobre Nutrição e Alimentação Saudável",
    "Debunking common nutrition misconceptions and revealing the science-backed truth about healthy eating.": "Desmistificando equívocos comuns de nutrição e mostrando a verdade baseada em ciência sobre alimentação saudável.",
    "The Vital Role of Nutrition in Weight Loss": "O Papel Vital da Nutrição na Perda de Peso",
    "Understanding how proper nutrition forms the foundation of sustainable weight loss and body composition changes.": "Entenda como a nutrição adequada forma a base da perda de peso sustentável e das mudanças na composição corporal.",
    "Motivation for Your Weight Loss Journey": "Motivação para Sua Jornada de Perda de Peso",
    "Practical strategies to maintain motivation and overcome challenges during your transformation process.": "Estratégias práticas para manter a motivação e superar desafios durante o processo de transformação.",
    "The Link Between Exercise and Cognitive Function": "A Ligação Entre Exercício e Função Cognitiva",
    "Exploring the powerful connection between physical exercise and mental performance, focus, and brain health.": "Explore a conexão poderosa entre exercício físico, desempenho mental, foco e saúde cerebral.",
    "Achieving Body Strength and Health on a Vegan/Vegetarian Diet": "Força e Saúde com Dieta Vegana/Vegetariana",
    "Comprehensive guide to achieving optimal body strength and health while following plant-based nutrition principles.": "Guia completo para alcançar força e saúde seguindo princípios de nutrição baseada em plantas.",
    "Conquer Lower Back Pain": "Supere a Dor Lombar",
    "Proven strategies and evidence-based approaches for lasting relief from lower back pain through targeted exercises.": "Estratégias comprovadas e abordagens baseadas em evidência para aliviar a dor lombar com exercícios direcionados.",
    "Atomic Habits: Small Changes, Big Results": "Hábitos Atômicos: Pequenas Mudanças, Grandes Resultados",
    "Transform your health and fitness through the power of tiny habits that compound into extraordinary results.": "Transforme sua saúde e fitness com pequenos hábitos que se acumulam em resultados extraordinários.",
    "Achieving Fitness Goals on a Budget": "Alcançando Metas Fitness com Orçamento Limitado",
    "Smart strategies for eating healthy and building strength without breaking the bank. Affordable nutrition made simple.": "Estratégias inteligentes para comer bem e ganhar força sem gastar demais. Nutrição acessível e simples.",
    "The Power of Group Fitness": "O Poder do Treino em Grupo",
    "Discover how training with others can accelerate your results through motivation, accountability, and community support.": "Descubra como treinar com outras pessoas pode acelerar resultados com motivação, responsabilidade e suporte.",
    "Leveraging AI Technology in Fitness": "Usando Tecnologia de IA no Fitness",
    "Explore how artificial intelligence is revolutionizing personal training and transforming fitness experiences.": "Veja como a inteligência artificial está revolucionando o personal training e transformando experiências fitness.",
    "Exercise Essentials for Stroke Recovery": "Exercícios Essenciais para Recuperação Pós-AVC",
    "Evidence-based exercise protocols to support recovery and improve quality of life after stroke.": "Protocolos de exercício baseados em evidência para apoiar a recuperação e melhorar a qualidade de vida após AVC.",
    "Your First Bodybuilding Competition": "Sua Primeira Competição de Fisiculturismo",
    "Complete guide to preparing for your first bodybuilding competition, from training to posing to mindset.": "Guia completo para preparar sua primeira competição de fisiculturismo, do treino à pose e mentalidade.",
    "Creatine: The Ultimate Performance Supplement": "Creatina: O Suplemento Definitivo de Performance",
    "Science-backed insights on creatine supplementation for enhanced strength, power, and recovery.": "Insights científicos sobre creatina para melhorar força, potência e recuperação.",
    "Building Your Online Fitness Business": "Construindo Seu Negócio Fitness Online",
    "Essential strategies for personal trainers to build and scale a successful online fitness business.": "Estratégias essenciais para personal trainers criarem e escalarem um negócio fitness online de sucesso.",
    "Developing a David Goggins Mindset": "Desenvolvendo uma Mentalidade David Goggins",
    "Unlock your potential by adopting the mental toughness and resilience principles of David Goggins.": "Desbloqueie seu potencial adotando princípios de força mental e resiliência de David Goggins.",
    "Overcoming Shoulder Pain and Injury": "Superando Dor e Lesão no Ombro",
    "Comprehensive approach to preventing and treating shoulder pain through targeted exercises and proper form.": "Abordagem completa para prevenir e tratar dor no ombro com exercícios direcionados e técnica adequada.",
    "Your First Half Marathon Training Plan": "Seu Primeiro Plano de Treino para Meia Maratona",
    "Complete 12-week training plan to safely build endurance and successfully complete your first half marathon.": "Plano completo de 12 semanas para construir resistência com segurança e completar sua primeira meia maratona.",
    "HIIT: Maximum Results, Minimum Time": "HIIT: Máximo Resultado, Mínimo Tempo",
    "Efficient high-intensity interval training protocols for busy professionals who want maximum fitness results.": "Protocolos eficientes de treino intervalado de alta intensidade para profissionais ocupados que querem máximo resultado.",
    "Top 5 Mistakes Beginners Make in the Gym": "Top 5 Erros que Iniciantes Cometem na Academia",
    "Beginner’s Guide to Nutrition for Fat Loss": "Guia de Nutrição para Iniciantes na Perda de Gordura",
    "How to Stay Consistent With Fitness: Proven Strategies": "Como Manter Consistência no Fitness: Estratégias Comprovadas",
    "[Placeholder for introduction about common gym mistakes.]": "[Introdução sobre erros comuns de iniciantes na academia.]",
    "[Placeholder for content on warm-ups.]": "[Conteúdo sobre aquecimentos.]",
    "[Placeholder for content on form and technique.]": "[Conteúdo sobre forma e técnica.]",
    "[Placeholder for content on training volume and progression.]": "[Conteúdo sobre volume de treino e progressão.]",
    "[Placeholder for content on rest and recovery.]": "[Conteúdo sobre descanso e recuperação.]",
    "[Placeholder for content on nutrition basics.]": "[Conteúdo sobre princípios básicos de nutrição.]",
    "[Placeholder for conclusion and call to action.]": "[Conclusão e chamada para ação.]",
    "[Placeholder for introduction about nutrition basics for fat loss.]": "[Introdução sobre princípios de nutrição para perda de gordura.]",
    "[Placeholder for content on calorie deficit.]": "[Conteúdo sobre déficit calórico.]",
    "[Placeholder for content on protein intake.]": "[Conteúdo sobre ingestão de proteína.]",
    "[Placeholder for content on meal planning.]": "[Conteúdo sobre planejamento de refeições.]",
    "[Placeholder for content on common mistakes.]": "[Conteúdo sobre erros comuns.]",
    "[Placeholder for introduction about the importance of consistency in fitness.]": "[Introdução sobre a importância da consistência no fitness.]",
    "[Placeholder for content on goal setting.]": "[Conteúdo sobre definição de metas.]",
    "[Placeholder for content on habit building.]": "[Conteúdo sobre criação de hábitos.]",
    "[Placeholder for content on tracking progress.]": "[Conteúdo sobre acompanhamento de progresso.]",
    "[Placeholder for content on coaching and community support.]": "[Conteúdo sobre coaching e suporte da comunidade.]",
    "This Privacy Policy explains how Garcia Builder collects, uses, and protects your information.": "Esta Política de Privacidade explica como o Garcia Builder coleta, usa e protege suas informações.",
    "Account details such as email and name": "Detalhes da conta, como email e nome",
    "Subscription and payment metadata processed by Stripe": "Metadados de assinatura e pagamento processados pela Stripe",
    "Usage and analytics data to improve our services": "Dados de uso e análise para melhorar nossos serviços",
    "To provide coaching services and manage subscriptions": "Para fornecer serviços de coaching e gerenciar assinaturas",
    "To communicate updates and respond to support requests": "Para comunicar atualizações e responder solicitações de suporte",
    "To improve and secure our platform": "Para melhorar e proteger nossa plataforma",
    "We do not sell personal data. We share data with processors (e.g., Stripe, Supabase) only as necessary to provide our services.": "Não vendemos dados pessoais. Compartilhamos dados com processadores (ex.: Stripe, Supabase) apenas quando necessário para fornecer nossos serviços.",
    "You may request access, correction, or deletion of your data by contacting andre@garciabuilder.fitness.": "Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato com andre@garciabuilder.fitness.",
    "Welcome to Garcia Builder. By accessing or using our website and services, you agree to these Terms of Service.": "Bem-vindo ao Garcia Builder. Ao acessar ou usar nosso site e serviços, você concorda com estes Termos de Serviço.",
    "1. Services": "1. Serviços",
    "We provide online coaching programs, training plans, and related content. Some services require a paid subscription processed by Stripe.": "Fornecemos programas de coaching online, planos de treino e conteúdo relacionado. Alguns serviços exigem assinatura paga processada pela Stripe.",
    "2. Accounts": "2. Contas",
    "You are responsible for maintaining the confidentiality of your account and for all activities under your account.": "Você é responsável por manter a confidencialidade da sua conta e por todas as atividades realizadas nela.",
    "3. Subscriptions & Billing": "3. Assinaturas e Cobrança",
    "Subscriptions renew automatically each billing cycle unless cancelled. You can manage your subscription via the receipt email or by contacting support.": "As assinaturas renovam automaticamente a cada ciclo de cobrança, salvo cancelamento. Você pode gerenciar sua assinatura pelo email do recibo ou entrando em contato com o suporte.",
    "4. Refunds": "4. Reembolsos",
    "Refund eligibility is evaluated case-by-case. Contact support within 14 days for assistance.": "A elegibilidade para reembolso é avaliada caso a caso. Entre em contato com o suporte em até 14 dias para ajuda.",
    "5. Acceptable Use": "5. Uso Aceitável",
    "You agree not to misuse our services or attempt to access them using a method other than the interface we provide.": "Você concorda em não usar nossos serviços indevidamente nem tentar acessá-los por métodos diferentes da interface que fornecemos.",
    "6. Privacy": "6. Privacidade",
    "See our": "Veja nossa",
    "for how we handle your information.": "para entender como tratamos suas informações.",
    "7. Changes": "7. Alterações",
    "We may update these Terms. Material changes will be posted here with an updated date.": "Podemos atualizar estes Termos. Alterações importantes serão publicadas aqui com a data atualizada.",
    "8. Contact": "8. Contato",
    "Coach with Garcia Builder": "Coach no Garcia Builder",
    "Become a Garcia Builder Trainer": "Torne-se Treinador Garcia Builder",
    "Join a global roster of expert coaches who combine evidence-based programming, compassionate accountability and cinematic delivery to transform lives in 12 weeks or less.": "Entre para um time global de coaches especialistas que unem programação baseada em evidência, acompanhamento humano e entrega premium para transformar vidas em 12 semanas ou menos.",
    "Proven systems": "Sistemas comprovados",
    "Curated client leads": "Leads qualificados de clientes",
    "All-in-one platform": "Plataforma completa",
    "Active online coaching clients managed in one platform.": "Clientes ativos de coaching online gerenciados em uma só plataforma.",
    "Average client retention increase after 90 days with our check-in rhythm.": "Aumento médio de retenção de clientes após 90 dias com nosso ritmo de check-ins.",
    "Weekly admin time saved through automated reporting & onboarding flows.": "Tempo administrativo semanal economizado com relatórios e onboarding automatizados.",
    "Lead engine included": "Motor de leads incluído",
    "Receive qualified prospects from our campaigns plus templates to nurture your own audience.": "Receba prospects qualificados das nossas campanhas e templates para nutrir sua própria audiência.",
    "Coaching playbooks": "Playbooks de coaching",
    "Plug into proven check-in scripts, training blocks and behaviour frameworks that keep clients engaged.": "Use scripts de check-in, blocos de treino e frameworks comportamentais comprovados para manter clientes engajados.",
    "Global reach": "Alcance global",
    "Coach multilingual clients across Europe, the UK and Brazil with built-in localisation and translation support.": "Atenda clientes multilíngues na Europa, Reino Unido e Brasil com suporte integrado de localização e tradução.",
    "Operate like a modern coaching studio": "Opere como um estúdio moderno de coaching",
    "Your expertise paired with our infrastructure means clients experience world-class service from the first message to their final transformation photo.": "Sua experiência combinada com nossa infraestrutura entrega uma experiência de alto nível do primeiro contato à foto final de transformação.",
    "Client relationship OS": "Sistema de relacionamento com clientes",
    "Centralised client dashboards with macros, photos, check-ins and schedulingno more spreadsheets.": "Painéis centralizados com macros, fotos, check-ins e agenda; sem planilhas espalhadas.",
    "Live accountability": "Responsabilidade em tempo real",
    "In-app messaging, automated nudges and templated playbooks keep every client seen and supported.": "Mensagens no app, lembretes automáticos e playbooks prontos mantêm cada cliente acompanhado e apoiado.",
    "Strategic mentorship": "Mentoria estratégica",
    "Monthly coaching labs, business reviews and marketing support to scale sustainably.": "Labs mensais de coaching, revisões de negócio e suporte de marketing para escalar de forma sustentável.",
    "Tools youll plug into day one": "Ferramentas para usar desde o primeiro dia",
    "Every Garcia Builder trainer gains access to the same stack that powers our flagship transformation program.": "Todo treinador Garcia Builder acessa o mesmo stack que sustenta nosso programa principal de transformação.",
    "Program design suite": "Suite de design de programas",
    "Video exercise library and templated periodisation blocks.": "Biblioteca de exercícios em vídeo e blocos de periodização prontos.",
    "Automated macro calculators with cultural meal examples.": "Calculadoras automáticas de macros com exemplos de refeições culturais.",
    "Business cockpit": "Painel de negócios",
    "Revenue tracking, renewal prompts and churn predictions.": "Acompanhamento de receita, lembretes de renovação e previsões de churn.",
    "Marketing asset vault, sales scripts and launch calendars.": "Biblioteca de ativos de marketing, scripts de venda e calendários de lançamento.",
    "Four steps to start coaching": "Quatro passos para começar a treinar clientes",
    "We review every application within 48 hours and provide feedback whether youre approved or not.": "Revisamos cada candidatura em até 48 horas e enviamos feedback, seja ela aprovada ou não.",
    "Complete application": "Complete a candidatura",
    "Share your experience, coaching style and ideal client avatar.": "Compartilhe sua experiência, estilo de coaching e perfil de cliente ideal.",
    "Upload credentials": "Envie credenciais",
    "Attach certifications or proof of practical experience.": "Anexe certificações ou provas de experiência prática.",
    "Panel review": "Revisão do painel",
    "Our senior coaches evaluate fit, quality and availability.": "Nossos coaches seniores avaliam compatibilidade, qualidade e disponibilidade.",
    "Onboard & coach": "Integre-se e atenda",
    "Get access to the platform, mentorship and your first clients.": "Receba acesso à plataforma, mentoria e seus primeiros clientes.",
    "What we look for": "O que procuramos",
    "2+ years coaching experience (online or in-person).": "2+ anos de experiência em coaching (online ou presencial).",
    "Evidence-based approach with clear transformation outcomes.": "Abordagem baseada em evidência com resultados claros de transformação.",
    "Strong communication skills and client empathy.": "Boa comunicação e empatia com clientes.",
    "Availability for weekly check-ins and monthly team reviews.": "Disponibilidade para check-ins semanais e revisões mensais de equipe.",
    "Nice to have": "Diferenciais",
    "Certifications (NASM, ACE, ISSA, ACSM or equivalent).": "Certificações (NASM, ACE, ISSA, ACSM ou equivalente).",
    "Nutrition certifications or experience with meal planning.": "Certificações em nutrição ou experiência com planejamento alimentar.",
    "Ability to coach in English plus Portuguese or Spanish.": "Capacidade de atender em inglês e também português ou espanhol.",
    "Comfortable on camera for weekly Loom/video check-ins.": "Conforto em vídeo para check-ins semanais via Loom ou similar.",
    "Submit your profile": "Envie seu perfil",
    "Trainer application": "Candidatura de treinador",
    "Tell us about your coaching craft. Fields marked with * are required.": "Conte sobre sua prática de coaching. Campos com * são obrigatórios.",
    "Review within 2448 h": "Revisão em 24-48h",
    "Uploads optional but recommended": "Uploads opcionais, mas recomendados",
    "Basic information": "Informações básicas",
    "Full name *": "Nome completo *",
    "Email *": "Email *",
    "Phone *": "Telefone *",
    "Years of experience *": "Anos de experiência *",
    "Select experience": "Selecione a experiência",
    "Specialisations": "Especializações",
    "Select all the domains you actively coach.": "Selecione todas as áreas em que você atende ativamente.",
    "Weight loss & recomposition": "Perda de peso e recomposição",
    "Muscle building": "Ganho de massa",
    "Strength training": "Treino de força",
    "Cardio & conditioning": "Cardio e condicionamento",
    "Mobility / yoga / pilates": "Mobilidade / yoga / pilates",
    "Sport-specific prep": "Preparação esportiva específica",
    "Nutrition coaching": "Coaching de nutrição",
    "Rehab / corrective work": "Reabilitação / trabalho corretivo",
    "Senior fitness": "Fitness para idosos",
    "Certifications & philosophy": "Certificações e filosofia",
    "List your certifications *": "Liste suas certificações *",
    "Tell us about your approach *": "Conte sobre sua abordagem *",
    "Upload certifications": "Enviar certificações",
    "Upload certification documents": "Enviar documentos de certificação",
    "Click to select or drag & drop PDF, JPG, PNG Max 10MB each": "Clique para selecionar ou arraste PDF, JPG, PNG. Máx. 10MB cada",
    "I agree to the": "Concordo com os",
    "and": "e",
    "Trainer Agreement": "Acordo do Treinador",
    "Submit application": "Enviar candidatura",
    "Lets transform clients together": "Vamos transformar clientes juntos",
    "Submit your application and our coaching panel will reach out within two business days. The next Garcia Builder cohort launches soonsecure your spot on the roster.": "Envie sua candidatura e nosso painel de coaches entrará em contato em até dois dias úteis. A próxima turma Garcia Builder começa em breve; garanta seu lugar no time.",
    "Start application": "Iniciar candidatura",
    "Email the team": "Enviar email para a equipe",
    "Login required": "Login necessário",
    "Create a free account or login to submit your trainer application and track the status.": "Crie uma conta grátis ou faça login para enviar sua candidatura e acompanhar o status.",
    "Your First Workout": "Seu Primeiro Treino",
    "A simple, effective Day 1 full-body session to start today. No app required.": "Uma sessão simples e eficaz de corpo inteiro para começar hoje. Não precisa de app.",
    "Estimated time: 35–45 minutes • Equipment: bodyweight or light dumbbells": "Tempo estimado: 35-45 minutos • Equipamento: peso corporal ou halteres leves",
    "Warm-up (5–7 min)": "Aquecimento (5-7 min)",
    "2 min brisk walk in place or jump rope": "2 min de caminhada rápida no lugar ou corda",
    "10 Arm circles forward + 10 back": "10 círculos de braço para frente + 10 para trás",
    "10 Hip hinges + 10 Bodyweight squats": "10 dobradiças de quadril + 10 agachamentos livres",
    "30s Plank": "30s de prancha",
    "Main Circuit — 3 rounds": "Circuito Principal — 3 rodadas",
    "Squat or Goblet Squat — 12 reps": "Agachamento ou goblet squat — 12 reps",
    "Push-ups (knees ok) — 8–12 reps": "Flexões (joelhos ok) — 8-12 reps",
    "Hip bridge — 12–15 reps": "Ponte de quadril — 12-15 reps",
    "1-arm row (dumbbell/backpack) — 10 reps/side": "Remada unilateral (halter/mochila) — 10 reps/lado",
    "Dead bug — 8 reps/side": "Dead bug — 8 reps/lado",
    "Rest — 60–90s": "Descanso — 60-90s",
    "Finisher (optional)": "Finalizador (opcional)",
    "5 rounds: 20s fast march/jog + 40s easy pace": "5 rodadas: 20s marcha/corrida rápida + 40s ritmo leve",
    "Cool down (3–5 min)": "Desaceleração (3-5 min)",
    "Slow breathing + light stretching for hips, chest and upper back.": "Respiração lenta + alongamento leve para quadris, peito e parte superior das costas.",
    "Form Cues": "Dicas de Técnica",
    "Move with control; leave 2 reps “in the tank”.": "Mova com controle; deixe 2 repetições de reserva.",
    "Spine neutral, heels grounded on squats.": "Coluna neutra e calcanhares firmes nos agachamentos.",
    "Exhale on effort. Keep shoulders away from ears.": "Expire no esforço. Mantenha os ombros longe das orelhas.",
    "Next Up": "Próximo Passo",
    "Book your onboarding consult to personalize your plan and unlock the full Trainerize experience.": "Agende sua consulta inicial para personalizar o plano e liberar a experiência completa no Trainerize.",
    "Schedule Consult": "Agendar Consulta",
    "Back": "Voltar",
    "Log it in the dashboard": "Registrar no dashboard"
  });

  Object.assign(STATIC_TEXT_TRANSLATIONS.es, {
    "Workout library": "Biblioteca de entrenamientos",
    "Training templates organized into real transformation projects.": "Plantillas de entrenamiento organizadas en proyectos reales de transformacion.",
    "Choose a focused workout template or follow a longer 12, 16, or 20 week project built around fat loss, glutes, strength, confidence and consistency.": "Elige una plantilla enfocada o sigue un proyecto mas largo de 12, 16 o 20 semanas para perdida de grasa, gluteos, fuerza, confianza y constancia.",
    "Browse templates": "Ver plantillas",
    "Customize my plan": "Personalizar mi plan",
    "Projects": "Proyectos",
    "Week options": "Opciones en semanas",
    "Built for action": "Hecho para actuar",
    "Start with a template. Progress with structure.": "Empieza con una plantilla. Progresa con estructura.",
    "Each workout template includes a weekly split, training focus, equipment, session structure and progression cue. Projects group templates into longer roadmaps so users can start with structure and progress through 12, 16, or 20 week phases.": "Cada plantilla incluye division semanal, enfoque de entrenamiento, equipo, estructura de sesion y progresion. Los proyectos agrupan plantillas en rutas mas largas para progresar por fases de 12, 16 o 20 semanas.",
    "Signature template projects": "Proyectos de plantillas",
    "Choose the goal first. Then pick the template level.": "Elige primero el objetivo. Luego elige el nivel de la plantilla.",
    "View templates": "Ver plantillas",
    "Summer Shred": "Reto Verano Shred",
    "Glute Launch": "Gluteos en Orbita",
    "Fit Dad Blueprint": "Papa en Forma Blueprint",
    "Fat-loss, conditioning, shape and routine for people who want a clear summer-ready plan without guessing every week.": "Perdida de grasa, acondicionamiento, forma y rutina para quienes quieren un plan claro de verano sin improvisar cada semana.",
    "Glute, legs, posture and lower-body progression with strength phases and shape-focused accessories.": "Progresion de gluteos, piernas, postura y tren inferior con fases de fuerza y accesorios enfocados en forma.",
    "Strength, muscle and fat-loss structure for busy dads who need efficient training, confidence and visible progress.": "Estructura de fuerza, musculo y perdida de grasa para padres ocupados que necesitan entrenamiento eficiente, confianza y progreso visible.",
    "Search workouts": "Buscar entrenamientos",
    "Search project, goal, level, equipment or focus": "Buscar por proyecto, objetivo, nivel, equipo o enfoque",
    "Project": "Proyecto",
    "All": "Todos",
    "Summer": "Verano",
    "Glutes": "Gluteos",
    "Fit Dad": "Papa fit",
    "Transforming bodies and lives with science-based coaching, accountability, and real results. Online coaching for busy professionals.": "Transformando cuerpos y vidas con coaching basado en ciencia, responsabilidad y resultados reales. Coaching online para profesionales ocupados.",
    "Nutrition for Fat Loss": "Nutrición para Pérdida de Grasa",
    "Data Deletion": "Eliminación de Datos",
    "Apply": "Postularse",
    "Privacy": "Privacidad",
    "Terms": "Términos",
    "Free Guide": "Guía Gratis",
    "Contact Form": "Formulario de Contacto",
    "Online coaching for real transformation. Evidence-based training, custom nutrition, and 1:1 accountability. Results in 8–12 weeks.": "Coaching online para una transformación real. Entrenamiento basado en evidencia, nutrición personalizada y seguimiento 1:1. Resultados en 8-12 semanas.",
    "Online coaching for real transformation. Evidence-based training, custom nutrition, and 1:1 accountability. Results in 8â€“12 weeks.": "Coaching online para una transformación real. Entrenamiento basado en evidencia, nutrición personalizada y seguimiento 1:1. Resultados en 8-12 semanas.",
    "Get tips, recipes, and exclusive offers. No spam.": "Recibe consejos, recetas y ofertas exclusivas. Sin spam.",
    "View All Articles on Trainerize": "Ver todos los artículos en Trainerize",
    "Join Newsletter": "Unirse al Newsletter",
    "Weekly Training Tips": "Consejos Semanales de Entrenamiento",
    "Nutrition Insights": "Ideas de Nutrición",
    "Exclusive Offers": "Ofertas Exclusivas",
    "No spam, ever. Unsubscribe at any time with one click.": "Sin spam. Cancela cuando quieras con un clic.",
    "Are You a Personal Trainer?": "¿Eres Entrenador Personal?",
    "Client Transformations": "Transformaciones de Clientes",
    "Real people. Real results. See what's possible with evidence-based coaching.": "Personas reales. Resultados reales. Ve lo que es posible con coaching basado en evidencia.",
    "Clients Transformed": "Clientes Transformados",
    "Average Weeks": "Semanas Promedio",
    "Success Rate (%)": "Tasa de Éxito (%)",
    "Avg Kg Lost": "Kg Perdidos Promedio",
    "All Transformations": "Todas las Transformaciones",
    "Strength": "Fuerza",
    "Endurance": "Resistencia",
    "kg Lost": "kg Perdidos",
    "Years Old": "Años",
    "Weeks": "Semanas",
    "Months": "Meses",
    "Days": "Días",
    "Body Fat": "Grasa Corporal",
    "Muscle": "Músculo",
    "Mass": "Masa",
    "9kg Lost · +3kg Lean": "9kg Perdidos · +3kg Magros",
    "15kg Lost in 6m": "15kg Perdidos en 6m",
    "-20% Body Fat": "-20% Grasa Corporal",
    "20kg Lost": "20kg Perdidos",
    "-8% BF + Muscle": "-8% GC + Músculo",
    "13kg Lost": "13kg Perdidos",
    "8kg Lost": "8kg Perdidos",
    "8kg Lost + Muscle": "8kg Perdidos + Músculo",
    "6kg Lost +5% Muscle": "6kg Perdidos +5% Músculo",
    "5kg Lost in 8w": "5kg Perdidos en 8s",
    "10kg Lost at 55": "10kg Perdidos a los 55",
    "4kg Lost in 8w": "4kg Perdidos en 8s",
    "4kg Lost + Muscle": "4kg Perdidos + Músculo",
    "5kg in 20d": "5kg en 20d",
    "10kg Lost": "10kg Perdidos",
    "5.5kg in 20d": "5,5kg en 20d",
    "12 Weeks": "12 Semanas",
    "6 Months": "6 Meses",
    "14 Months": "14 Meses",
    "24 Months": "24 Meses",
    "16 Weeks": "16 Semanas",
    "18 Weeks": "18 Semanas",
    "8 Weeks": "8 Semanas",
    "1 Year": "1 Año",
    "6 Weeks": "6 Semanas",
    "20 Days": "20 Días",
    "\"Conrad balanced consulting travel with precision coaching — 9kg fat loss, stronger shoulders and visible definition in just 12 weeks.\"": "\"Conrad equilibró viajes de consultoría con coaching preciso: 9kg menos de grasa, hombros más fuertes y definición visible en solo 12 semanas.\"",
    "\"Corporate schedule, two kids, zero extremes. Paulo stayed consistent for six months and dropped 15kg while rebuilding energy.\"": "\"Agenda corporativa, dos hijos, cero extremos. Paulo mantuvo constancia seis meses y perdió 15kg mientras recuperaba energía.\"",
    "\"University athlete who stayed in the program for 14 months, dropping 20% body fat and adding lean strength in the process.\"": "\"Atleta universitario que permaneció 14 meses en el programa, redujo 20% de grasa corporal y ganó fuerza magra en el proceso.\"",
    "\"Sofia rebuilt habits across two years - steady fat loss, better sleep, and a confident return to strength training.\"": "\"Sofia reconstruyó hábitos durante dos años: pérdida de grasa constante, mejor sueño y regreso confiado al entrenamiento de fuerza.\"",
    "\"A structured 16-week block sharpened Hugo's conditioning, reduced body fat and rebuilt confidence under the bar.\"": "\"Un bloque estructurado de 16 semanas mejoró el acondicionamiento de Hugo, redujo grasa corporal y reconstruyó su confianza bajo la barra.\"",
    "\"Light strength work, daily walks and smart nutrition helped Maria feel mobile again while dropping 13kg.\"": "\"Trabajo ligero de fuerza, caminatas diarias y nutrición inteligente ayudaron a Maria a moverse mejor mientras perdía 13kg.\"",
    "\"Travel-heavy consultant turned routines around in 12 weeks, cutting 8kg and restoring training consistency.\"": "\"Con muchos viajes de trabajo, este consultor cambió su rutina en 12 semanas, perdió 8kg y recuperó constancia en el entrenamiento.\"",
    "\"Body recomposition at its finest! Lost fat while building strength and muscle in just 18 weeks.\"": "\"Recomposición corporal en su mejor versión: perdió grasa mientras ganaba fuerza y músculo en solo 18 semanas.\"",
    "\"The perfect combination! Lost 6kg of fat while gaining 5% muscle mass in just 12 weeks.\"": "\"La combinación perfecta: perdió 6kg de grasa y ganó 5% de masa muscular en solo 12 semanas.\"",
    "\"Short timeframe, amazing results! 5kg down in 8 weeks with a program that respected my busy mom life.\"": "\"Poco tiempo, resultados increíbles: 5kg menos en 8 semanas con un programa que respetó mi vida de madre ocupada.\"",
    "\"Slow and steady at 55! One year of consistent habits led to a 10kg transformation and renewed energy.\"": "\"Constancia a los 55: un año de hábitos sostenidos llevó a una transformación de 10kg y energía renovada.\"",
    "\"Quick results that last! 5kg transformation in 8 weeks with sustainable habits that continue to work.\"": "\"Resultados rápidos que duran: transformación de 5kg en 8 semanas con hábitos sostenibles que siguen funcionando.\"",
    "\"College student success! Managed studies and training to achieve 4kg fat loss in 8 weeks.\"": "\"Éxito universitario: combinó estudios y entrenamiento para perder 4kg de grasa en 8 semanas.\"",
    "\"Camila committed to dialed-in nutrition and short, purposeful sessions to shed 4kg in six weeks while staying strong.\"": "\"Camila se comprometió con nutrición ajustada y sesiones cortas y enfocadas para perder 4kg en seis semanas manteniendo la fuerza.\"",
    "\"With a tight 20-day timeline, Renan tightened macros, upped steps and kept strength work heavy to make weight while staying explosive.\"": "\"Con apenas 20 días, Renan ajustó macros, aumentó pasos y mantuvo el trabajo de fuerza pesado para dar el peso sin perder explosividad.\"",
    "\"Helena leaned on accountability for a full year - 8kg lost, muscle definition gained and energy levels way up.\"": "\"Helena se apoyó en el seguimiento durante un año completo: 8kg menos, más definición muscular y mucha más energía.\"",
    "\"Bianca followed a tight 12-week schedule - protein targets, steps and weekly check-ins to remove 10kg and feel athletic again.\"": "\"Bianca siguió un plan firme de 12 semanas: metas de proteína, pasos y check-ins semanales para perder 10kg y sentirse atlética otra vez.\"",
    "\"Gabriel executed a precise 16-week cut - 10kg down while keeping strength numbers climbing each block.\"": "\"Gabriel ejecutó una definición precisa de 16 semanas: 10kg menos mientras sus números de fuerza seguían subiendo cada bloque.\"",
    "\"Short deadline, big discipline - Aline followed a tight daily plan and dropped 5.5kg in 20 days to kickstart her journey.\"": "\"Plazo corto, mucha disciplina: Aline siguió un plan diario firme y perdió 5,5kg en 20 días para iniciar su camino.\"",
    "Load More Transformations": "Cargar Más Transformaciones",
    "Client Transformation": "Transformación del Cliente",
    "Transformation Story": "Historia de Transformación",
    "Key Results": "Resultados Clave",
    "Start Your Transformation": "Empieza Tu Transformación",
    "Close": "Cerrar",
    "Get Your Own Transformation": "Empieza Tu Propia Transformación",
    "Inspired by these results? Join our newsletter to get weekly training tips, nutrition insights, and the exact strategies that helped these clients achieve their transformations.": "¿Te inspiran estos resultados? Únete al newsletter para recibir consejos semanales de entrenamiento, ideas de nutrición y las estrategias que ayudaron a estos clientes a lograr sus transformaciones.",
    "Start My Journey": "Empezar Mi Camino",
    "Weekly Training Plans": "Planes Semanales de Entrenamiento",
    "Progress Tracking Tips": "Consejos para Seguir el Progreso",
    "Community Support": "Apoyo de la Comunidad",
    "Success Strategies": "Estrategias de Éxito",
    "Join thousands transforming their bodies. No spam, unsubscribe anytime.": "Únete a miles transformando sus cuerpos. Sin spam, cancela cuando quieras.",
    "The Ultimate Guide to Achieving 100 Push-ups": "Guía Definitiva para Lograr 100 Flexiones",
    "A realistic 20-week plan to build strength progressively and reach the milestone of 100 consecutive push-ups.": "Un plan realista de 20 semanas para construir fuerza progresivamente y llegar a 100 flexiones consecutivas.",
    "Training and Nutrition in Diabetes Management": "Entrenamiento y Nutrición en el Manejo de la Diabetes",
    "Evidence-based strategies for using exercise and proper nutrition to manage diabetes effectively.": "Estrategias basadas en evidencia para usar ejercicio y nutrición adecuada en el manejo eficaz de la diabetes.",
    "10 Myths and Facts About Nutrition and Healthy Eating": "10 Mitos y Verdades Sobre Nutrición y Alimentación Saludable",
    "Debunking common nutrition misconceptions and revealing the science-backed truth about healthy eating.": "Desmontando ideas equivocadas sobre nutrición y mostrando la verdad respaldada por ciencia sobre comer saludable.",
    "The Vital Role of Nutrition in Weight Loss": "El Papel Vital de la Nutrición en la Pérdida de Peso",
    "Understanding how proper nutrition forms the foundation of sustainable weight loss and body composition changes.": "Entiende cómo una nutrición adecuada forma la base de la pérdida de peso sostenible y los cambios de composición corporal.",
    "Motivation for Your Weight Loss Journey": "Motivación para Tu Camino de Pérdida de Peso",
    "Practical strategies to maintain motivation and overcome challenges during your transformation process.": "Estrategias prácticas para mantener la motivación y superar desafíos durante tu proceso de transformación.",
    "The Link Between Exercise and Cognitive Function": "La Relación Entre Ejercicio y Función Cognitiva",
    "Exploring the powerful connection between physical exercise and mental performance, focus, and brain health.": "Explora la poderosa conexión entre ejercicio físico, rendimiento mental, enfoque y salud cerebral.",
    "Achieving Body Strength and Health on a Vegan/Vegetarian Diet": "Fuerza y Salud con una Dieta Vegana/Vegetariana",
    "Comprehensive guide to achieving optimal body strength and health while following plant-based nutrition principles.": "Guía completa para lograr fuerza y salud siguiendo principios de nutrición basada en plantas.",
    "Conquer Lower Back Pain": "Supera el Dolor Lumbar",
    "Proven strategies and evidence-based approaches for lasting relief from lower back pain through targeted exercises.": "Estrategias comprobadas y enfoques basados en evidencia para aliviar el dolor lumbar con ejercicios específicos.",
    "Atomic Habits: Small Changes, Big Results": "Hábitos Atómicos: Pequeños Cambios, Grandes Resultados",
    "Transform your health and fitness through the power of tiny habits that compound into extraordinary results.": "Transforma tu salud y fitness con pequeños hábitos que se acumulan en resultados extraordinarios.",
    "Achieving Fitness Goals on a Budget": "Lograr Metas Fitness con Bajo Presupuesto",
    "Smart strategies for eating healthy and building strength without breaking the bank. Affordable nutrition made simple.": "Estrategias inteligentes para comer saludable y ganar fuerza sin gastar demasiado. Nutrición accesible y simple.",
    "The Power of Group Fitness": "El Poder del Entrenamiento en Grupo",
    "Discover how training with others can accelerate your results through motivation, accountability, and community support.": "Descubre cómo entrenar con otros puede acelerar resultados con motivación, responsabilidad y apoyo comunitario.",
    "Leveraging AI Technology in Fitness": "Usar Tecnología de IA en Fitness",
    "Explore how artificial intelligence is revolutionizing personal training and transforming fitness experiences.": "Explora cómo la inteligencia artificial está revolucionando el entrenamiento personal y transformando experiencias fitness.",
    "Exercise Essentials for Stroke Recovery": "Ejercicios Esenciales para Recuperación Tras un Ictus",
    "Evidence-based exercise protocols to support recovery and improve quality of life after stroke.": "Protocolos de ejercicio basados en evidencia para apoyar la recuperación y mejorar la calidad de vida después de un ictus.",
    "Your First Bodybuilding Competition": "Tu Primera Competición de Fisicoculturismo",
    "Complete guide to preparing for your first bodybuilding competition, from training to posing to mindset.": "Guía completa para preparar tu primera competición de fisicoculturismo, desde entrenamiento hasta poses y mentalidad.",
    "Creatine: The Ultimate Performance Supplement": "Creatina: El Suplemento Definitivo de Rendimiento",
    "Science-backed insights on creatine supplementation for enhanced strength, power, and recovery.": "Ideas respaldadas por ciencia sobre creatina para mejorar fuerza, potencia y recuperación.",
    "Building Your Online Fitness Business": "Construir Tu Negocio Fitness Online",
    "Essential strategies for personal trainers to build and scale a successful online fitness business.": "Estrategias esenciales para que entrenadores personales construyan y escalen un negocio fitness online exitoso.",
    "Developing a David Goggins Mindset": "Desarrollar una Mentalidad David Goggins",
    "Unlock your potential by adopting the mental toughness and resilience principles of David Goggins.": "Desbloquea tu potencial adoptando principios de fortaleza mental y resiliencia de David Goggins.",
    "Overcoming Shoulder Pain and Injury": "Superar Dolor y Lesión de Hombro",
    "Comprehensive approach to preventing and treating shoulder pain through targeted exercises and proper form.": "Enfoque completo para prevenir y tratar dolor de hombro con ejercicios específicos y técnica adecuada.",
    "Your First Half Marathon Training Plan": "Tu Primer Plan de Entrenamiento para Media Maratón",
    "Complete 12-week training plan to safely build endurance and successfully complete your first half marathon.": "Plan completo de 12 semanas para construir resistencia con seguridad y completar tu primera media maratón.",
    "HIIT: Maximum Results, Minimum Time": "HIIT: Máximos Resultados, Mínimo Tiempo",
    "Efficient high-intensity interval training protocols for busy professionals who want maximum fitness results.": "Protocolos eficientes de intervalos de alta intensidad para profesionales ocupados que quieren máximos resultados.",
    "Top 5 Mistakes Beginners Make in the Gym": "Top 5 Errores que Cometen los Principiantes en el Gimnasio",
    "Beginner’s Guide to Nutrition for Fat Loss": "Guía de Nutrición para Principiantes en Pérdida de Grasa",
    "How to Stay Consistent With Fitness: Proven Strategies": "Cómo Mantener la Constancia en Fitness: Estrategias Comprobadas",
    "[Placeholder for introduction about common gym mistakes.]": "[Introducción sobre errores comunes en el gimnasio.]",
    "[Placeholder for content on warm-ups.]": "[Contenido sobre calentamientos.]",
    "[Placeholder for content on form and technique.]": "[Contenido sobre forma y técnica.]",
    "[Placeholder for content on training volume and progression.]": "[Contenido sobre volumen de entrenamiento y progresión.]",
    "[Placeholder for content on rest and recovery.]": "[Contenido sobre descanso y recuperación.]",
    "[Placeholder for content on nutrition basics.]": "[Contenido sobre principios básicos de nutrición.]",
    "[Placeholder for conclusion and call to action.]": "[Conclusión y llamada a la acción.]",
    "[Placeholder for introduction about nutrition basics for fat loss.]": "[Introducción sobre principios de nutrición para perder grasa.]",
    "[Placeholder for content on calorie deficit.]": "[Contenido sobre déficit calórico.]",
    "[Placeholder for content on protein intake.]": "[Contenido sobre ingesta de proteína.]",
    "[Placeholder for content on meal planning.]": "[Contenido sobre planificación de comidas.]",
    "[Placeholder for content on common mistakes.]": "[Contenido sobre errores comunes.]",
    "[Placeholder for introduction about the importance of consistency in fitness.]": "[Introducción sobre la importancia de la constancia en fitness.]",
    "[Placeholder for content on goal setting.]": "[Contenido sobre definición de objetivos.]",
    "[Placeholder for content on habit building.]": "[Contenido sobre creación de hábitos.]",
    "[Placeholder for content on tracking progress.]": "[Contenido sobre seguimiento del progreso.]",
    "[Placeholder for content on coaching and community support.]": "[Contenido sobre coaching y apoyo de comunidad.]",
    "This Privacy Policy explains how Garcia Builder collects, uses, and protects your information.": "Esta Política de Privacidad explica cómo Garcia Builder recopila, usa y protege tu información.",
    "Account details such as email and name": "Datos de cuenta como email y nombre",
    "Subscription and payment metadata processed by Stripe": "Metadatos de suscripción y pago procesados por Stripe",
    "Usage and analytics data to improve our services": "Datos de uso y analítica para mejorar nuestros servicios",
    "To provide coaching services and manage subscriptions": "Para prestar servicios de coaching y gestionar suscripciones",
    "To communicate updates and respond to support requests": "Para comunicar actualizaciones y responder solicitudes de soporte",
    "To improve and secure our platform": "Para mejorar y proteger nuestra plataforma",
    "We do not sell personal data. We share data with processors (e.g., Stripe, Supabase) only as necessary to provide our services.": "No vendemos datos personales. Compartimos datos con procesadores (p. ej., Stripe, Supabase) solo cuando es necesario para prestar nuestros servicios.",
    "You may request access, correction, or deletion of your data by contacting andre@garciabuilder.fitness.": "Puedes solicitar acceso, corrección o eliminación de tus datos contactando a andre@garciabuilder.fitness.",
    "Welcome to Garcia Builder. By accessing or using our website and services, you agree to these Terms of Service.": "Bienvenido a Garcia Builder. Al acceder o usar nuestro sitio y servicios, aceptas estos Términos de Servicio.",
    "1. Services": "1. Servicios",
    "We provide online coaching programs, training plans, and related content. Some services require a paid subscription processed by Stripe.": "Ofrecemos programas de coaching online, planes de entrenamiento y contenido relacionado. Algunos servicios requieren una suscripción pagada procesada por Stripe.",
    "2. Accounts": "2. Cuentas",
    "You are responsible for maintaining the confidentiality of your account and for all activities under your account.": "Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades realizadas en ella.",
    "3. Subscriptions & Billing": "3. Suscripciones y Facturación",
    "Subscriptions renew automatically each billing cycle unless cancelled. You can manage your subscription via the receipt email or by contacting support.": "Las suscripciones se renuevan automáticamente en cada ciclo de facturación salvo cancelación. Puedes gestionarla desde el email del recibo o contactando soporte.",
    "4. Refunds": "4. Reembolsos",
    "Refund eligibility is evaluated case-by-case. Contact support within 14 days for assistance.": "La elegibilidad de reembolso se evalúa caso por caso. Contacta soporte dentro de 14 días para recibir ayuda.",
    "5. Acceptable Use": "5. Uso Aceptable",
    "You agree not to misuse our services or attempt to access them using a method other than the interface we provide.": "Aceptas no usar indebidamente nuestros servicios ni intentar acceder a ellos mediante métodos distintos a la interfaz que proporcionamos.",
    "6. Privacy": "6. Privacidad",
    "See our": "Consulta nuestra",
    "for how we handle your information.": "para ver cómo manejamos tu información.",
    "7. Changes": "7. Cambios",
    "We may update these Terms. Material changes will be posted here with an updated date.": "Podemos actualizar estos Términos. Los cambios importantes se publicarán aquí con una fecha actualizada.",
    "8. Contact": "8. Contacto",
    "Coach with Garcia Builder": "Coach en Garcia Builder",
    "Become a Garcia Builder Trainer": "Conviértete en Entrenador Garcia Builder",
    "Join a global roster of expert coaches who combine evidence-based programming, compassionate accountability and cinematic delivery to transform lives in 12 weeks or less.": "Únete a un equipo global de coaches expertos que combinan programación basada en evidencia, acompañamiento humano y entrega premium para transformar vidas en 12 semanas o menos.",
    "Proven systems": "Sistemas comprobados",
    "Curated client leads": "Leads cualificados de clientes",
    "All-in-one platform": "Plataforma todo en uno",
    "Active online coaching clients managed in one platform.": "Clientes activos de coaching online gestionados en una sola plataforma.",
    "Average client retention increase after 90 days with our check-in rhythm.": "Aumento promedio de retención de clientes después de 90 días con nuestro ritmo de check-ins.",
    "Weekly admin time saved through automated reporting & onboarding flows.": "Tiempo administrativo semanal ahorrado con reportes y onboarding automatizados.",
    "Lead engine included": "Motor de leads incluido",
    "Receive qualified prospects from our campaigns plus templates to nurture your own audience.": "Recibe prospectos cualificados de nuestras campañas y plantillas para nutrir tu propia audiencia.",
    "Coaching playbooks": "Playbooks de coaching",
    "Plug into proven check-in scripts, training blocks and behaviour frameworks that keep clients engaged.": "Usa scripts de check-in, bloques de entrenamiento y marcos conductuales comprobados para mantener clientes comprometidos.",
    "Global reach": "Alcance global",
    "Coach multilingual clients across Europe, the UK and Brazil with built-in localisation and translation support.": "Atiende clientes multilingües en Europa, Reino Unido y Brasil con soporte integrado de localización y traducción.",
    "Operate like a modern coaching studio": "Opera como un estudio moderno de coaching",
    "Your expertise paired with our infrastructure means clients experience world-class service from the first message to their final transformation photo.": "Tu experiencia combinada con nuestra infraestructura da a los clientes un servicio de alto nivel desde el primer mensaje hasta la foto final de transformación.",
    "Client relationship OS": "Sistema de relación con clientes",
    "Centralised client dashboards with macros, photos, check-ins and schedulingno more spreadsheets.": "Paneles centralizados con macros, fotos, check-ins y agenda; sin más hojas de cálculo dispersas.",
    "Live accountability": "Responsabilidad en tiempo real",
    "In-app messaging, automated nudges and templated playbooks keep every client seen and supported.": "Mensajes en la app, recordatorios automáticos y playbooks listos mantienen a cada cliente acompañado y apoyado.",
    "Strategic mentorship": "Mentoría estratégica",
    "Monthly coaching labs, business reviews and marketing support to scale sustainably.": "Labs mensuales de coaching, revisiones de negocio y soporte de marketing para escalar de forma sostenible.",
    "Tools youll plug into day one": "Herramientas para usar desde el primer día",
    "Every Garcia Builder trainer gains access to the same stack that powers our flagship transformation program.": "Todo entrenador Garcia Builder accede al mismo stack que impulsa nuestro programa principal de transformación.",
    "Program design suite": "Suite de diseño de programas",
    "Video exercise library and templated periodisation blocks.": "Biblioteca de ejercicios en video y bloques de periodización listos.",
    "Automated macro calculators with cultural meal examples.": "Calculadoras automáticas de macros con ejemplos de comidas culturales.",
    "Business cockpit": "Panel de negocio",
    "Revenue tracking, renewal prompts and churn predictions.": "Seguimiento de ingresos, avisos de renovación y predicciones de churn.",
    "Marketing asset vault, sales scripts and launch calendars.": "Biblioteca de activos de marketing, guiones de venta y calendarios de lanzamiento.",
    "Four steps to start coaching": "Cuatro pasos para empezar a entrenar clientes",
    "We review every application within 48 hours and provide feedback whether youre approved or not.": "Revisamos cada postulación en 48 horas y damos feedback, sea aprobada o no.",
    "Complete application": "Completa la postulación",
    "Share your experience, coaching style and ideal client avatar.": "Comparte tu experiencia, estilo de coaching y perfil de cliente ideal.",
    "Upload credentials": "Sube credenciales",
    "Attach certifications or proof of practical experience.": "Adjunta certificaciones o prueba de experiencia práctica.",
    "Panel review": "Revisión del panel",
    "Our senior coaches evaluate fit, quality and availability.": "Nuestros coaches senior evalúan encaje, calidad y disponibilidad.",
    "Onboard & coach": "Incorpórate y entrena",
    "Get access to the platform, mentorship and your first clients.": "Recibe acceso a la plataforma, mentoría y tus primeros clientes.",
    "What we look for": "Lo que buscamos",
    "2+ years coaching experience (online or in-person).": "2+ años de experiencia en coaching (online o presencial).",
    "Evidence-based approach with clear transformation outcomes.": "Enfoque basado en evidencia con resultados claros de transformación.",
    "Strong communication skills and client empathy.": "Buena comunicación y empatía con clientes.",
    "Availability for weekly check-ins and monthly team reviews.": "Disponibilidad para check-ins semanales y revisiones mensuales de equipo.",
    "Nice to have": "Deseable",
    "Certifications (NASM, ACE, ISSA, ACSM or equivalent).": "Certificaciones (NASM, ACE, ISSA, ACSM o equivalente).",
    "Nutrition certifications or experience with meal planning.": "Certificaciones en nutrición o experiencia con planificación de comidas.",
    "Ability to coach in English plus Portuguese or Spanish.": "Capacidad de entrenar en inglés además de portugués o español.",
    "Comfortable on camera for weekly Loom/video check-ins.": "Comodidad en cámara para check-ins semanales por Loom o video.",
    "Submit your profile": "Envía tu perfil",
    "Trainer application": "Postulación de entrenador",
    "Tell us about your coaching craft. Fields marked with * are required.": "Cuéntanos sobre tu práctica de coaching. Los campos con * son obligatorios.",
    "Review within 2448 h": "Revisión en 24-48h",
    "Uploads optional but recommended": "Subidas opcionales, pero recomendadas",
    "Basic information": "Información básica",
    "Full name *": "Nombre completo *",
    "Email *": "Email *",
    "Phone *": "Teléfono *",
    "Years of experience *": "Años de experiencia *",
    "Select experience": "Selecciona experiencia",
    "Specialisations": "Especializaciones",
    "Select all the domains you actively coach.": "Selecciona todas las áreas en las que entrenas activamente.",
    "Weight loss & recomposition": "Pérdida de peso y recomposición",
    "Muscle building": "Construcción muscular",
    "Strength training": "Entrenamiento de fuerza",
    "Cardio & conditioning": "Cardio y acondicionamiento",
    "Mobility / yoga / pilates": "Movilidad / yoga / pilates",
    "Sport-specific prep": "Preparación deportiva específica",
    "Nutrition coaching": "Coaching de nutrición",
    "Rehab / corrective work": "Rehabilitación / trabajo correctivo",
    "Senior fitness": "Fitness para mayores",
    "Certifications & philosophy": "Certificaciones y filosofía",
    "List your certifications *": "Lista tus certificaciones *",
    "Tell us about your approach *": "Cuéntanos sobre tu enfoque *",
    "Upload certifications": "Subir certificaciones",
    "Upload certification documents": "Subir documentos de certificación",
    "Click to select or drag & drop PDF, JPG, PNG Max 10MB each": "Haz clic para seleccionar o arrastra PDF, JPG, PNG. Máx. 10MB cada uno",
    "I agree to the": "Acepto los",
    "and": "y",
    "Trainer Agreement": "Acuerdo del Entrenador",
    "Submit application": "Enviar postulación",
    "Lets transform clients together": "Transformemos clientes juntos",
    "Submit your application and our coaching panel will reach out within two business days. The next Garcia Builder cohort launches soonsecure your spot on the roster.": "Envía tu postulación y nuestro panel de coaches te contactará en un máximo de dos días hábiles. La próxima cohorte Garcia Builder empieza pronto; asegura tu lugar en el equipo.",
    "Start application": "Iniciar postulación",
    "Email the team": "Enviar email al equipo",
    "Login required": "Login requerido",
    "Create a free account or login to submit your trainer application and track the status.": "Crea una cuenta gratis o inicia sesión para enviar tu postulación y seguir el estado.",
    "Your First Workout": "Tu Primer Entrenamiento",
    "A simple, effective Day 1 full-body session to start today. No app required.": "Una sesión simple y efectiva de cuerpo completo para empezar hoy. No requiere app.",
    "Estimated time: 35–45 minutes • Equipment: bodyweight or light dumbbells": "Tiempo estimado: 35-45 minutos • Equipo: peso corporal o mancuernas ligeras",
    "Warm-up (5–7 min)": "Calentamiento (5-7 min)",
    "2 min brisk walk in place or jump rope": "2 min de caminata rápida en el sitio o cuerda",
    "10 Arm circles forward + 10 back": "10 círculos de brazos adelante + 10 atrás",
    "10 Hip hinges + 10 Bodyweight squats": "10 bisagras de cadera + 10 sentadillas sin peso",
    "30s Plank": "30s de plancha",
    "Main Circuit — 3 rounds": "Circuito Principal — 3 rondas",
    "Squat or Goblet Squat — 12 reps": "Sentadilla o goblet squat — 12 reps",
    "Push-ups (knees ok) — 8–12 reps": "Flexiones (rodillas ok) — 8-12 reps",
    "Hip bridge — 12–15 reps": "Puente de cadera — 12-15 reps",
    "1-arm row (dumbbell/backpack) — 10 reps/side": "Remo a un brazo (mancuerna/mochila) — 10 reps/lado",
    "Dead bug — 8 reps/side": "Dead bug — 8 reps/lado",
    "Rest — 60–90s": "Descanso — 60-90s",
    "Finisher (optional)": "Finalizador (opcional)",
    "5 rounds: 20s fast march/jog + 40s easy pace": "5 rondas: 20s marcha/trote rápido + 40s ritmo suave",
    "Cool down (3–5 min)": "Vuelta a la calma (3-5 min)",
    "Slow breathing + light stretching for hips, chest and upper back.": "Respiración lenta + estiramientos suaves para caderas, pecho y espalda alta.",
    "Form Cues": "Consejos de Técnica",
    "Move with control; leave 2 reps “in the tank”.": "Muévete con control; deja 2 repeticiones en reserva.",
    "Spine neutral, heels grounded on squats.": "Columna neutra y talones firmes en las sentadillas.",
    "Exhale on effort. Keep shoulders away from ears.": "Exhala en el esfuerzo. Mantén los hombros lejos de las orejas.",
    "Next Up": "Siguiente Paso",
    "Book your onboarding consult to personalize your plan and unlock the full Trainerize experience.": "Agenda tu consulta inicial para personalizar el plan y desbloquear la experiencia completa en Trainerize.",
    "Schedule Consult": "Agendar Consulta",
    "Back": "Volver",
    "Log it in the dashboard": "Registrarlo en el dashboard"
  });

  Object.assign(STATIC_TEXT_TRANSLATIONS.pt, {
    "+Muscle": "+Músculo",
    "Showing": "Mostrando",
    "stories": "histórias",
    "or DM": "ou DM",
    "FALAR COM O COACH": "FALAR COM O TREINADOR"
  });

  Object.assign(STATIC_TEXT_TRANSLATIONS.es, {
    "+Muscle": "+Músculo",
    "Showing": "Mostrando",
    "stories": "historias",
    "or DM": "o DM",
    "FALAR COM O COACH": "HABLAR CON EL ENTRENADOR"
  });

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

  function syncLanguageSelectors(lang) {
    LANGUAGE_SELECT_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      if (lang && el.value !== lang) {
        el.value = lang;
      }

      if (el.dataset.gbLangBound === '1') {
        return;
      }

      el.addEventListener('change', () => {
        const newLang = clamp(el.value || '');
        if (newLang && newLang !== getLang()) {
          setLang(newLang);
        }
      });

      el.dataset.gbLangBound = '1';
    });
  }

  const getByPath = readPath;
  const t = (lang, key, fallback) => {
    const v1 = getByPath(DICTS[lang]||{}, key);
    if (v1 !== undefined) return v1;
    const v2 = getByPath(DICTS.en, key);
    if (v2 !== undefined) return v2;
    return fallback;
  };

  const textMapCache = {};
  const normalizeStaticText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const collectStaticTextPairs = (source, target, out, seen = new Set()) => {
    if (!source || !target || typeof source !== 'object' || typeof target !== 'object' || seen.has(source)) return;
    seen.add(source);

    Object.keys(source).forEach(key => {
      const sourceValue = source[key];
      const targetValue = target[key];
      if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
        const normalized = normalizeStaticText(sourceValue);
        if (normalized && normalized.length > 1) out[normalized] = targetValue;
      } else if (sourceValue && targetValue && typeof sourceValue === 'object' && typeof targetValue === 'object') {
        collectStaticTextPairs(sourceValue, targetValue, out, seen);
      }
    });
  };

  const getStaticTextMap = (lang) => {
    if (lang === 'en') return {};
    if (textMapCache[lang]) return textMapCache[lang];

    const map = {};
    collectStaticTextPairs(DICTS.en, DICTS[lang] || {}, map);
    Object.assign(map, STATIC_TEXT_TRANSLATIONS[lang] || {});
    textMapCache[lang] = map;
    return map;
  };

  const hasI18nAncestor = (node) => {
    let el = node && node.parentElement;
    while (el) {
      if (
        el.hasAttribute('data-i18n') ||
        el.hasAttribute('data-i18n-ph') ||
        el.hasAttribute('data-i18n-placeholder') ||
        el.hasAttribute('data-no-auto-i18n')
      ) return true;
      el = el.parentElement;
    }
    return false;
  };

  const translateStaticTextNodes = (lang) => {
    if (!document.body) return;
    const map = getStaticTextMap(lang);
    const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG']);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName) || hasI18nAncestor(node)) continue;

      const original = node.__gbI18nSourceText || normalizeStaticText(node.nodeValue);
      if (!original) continue;
      if (!node.__gbI18nSourceText) node.__gbI18nSourceText = original;

      const next = lang === 'en' ? original : map[original];
      if (!next) continue;

      const leading = (node.nodeValue.match(/^\s*/) || [''])[0];
      const trailing = (node.nodeValue.match(/\s*$/) || [''])[0];
      node.nodeValue = `${leading}${next}${trailing}`;
    }
  };

  const translateStaticAttributes = (lang) => {
    const map = getStaticTextMap(lang);
    document.querySelectorAll('[placeholder], [title], [aria-label]').forEach(el => {
      ['placeholder', 'title', 'aria-label'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        if (el.hasAttribute('data-i18n-ph') && attr === 'placeholder') return;

        const sourceAttr = `data-gb-i18n-source-${attr}`;
        const original = el.getAttribute(sourceAttr) || normalizeStaticText(el.getAttribute(attr));
        if (!original) return;
        if (!el.hasAttribute(sourceAttr)) el.setAttribute(sourceAttr, original);

        const next = lang === 'en' ? original : map[original];
        if (next && el.getAttribute(attr) !== next) el.setAttribute(attr, next);
      });
    });
  };

  const withStaticFallback = (lang, value, source) => {
    if (lang === 'en') return value;
    const map = getStaticTextMap(lang);
    const fromValue = map[normalizeStaticText(value)];
    if (fromValue) return fromValue;
    const fromSource = map[normalizeStaticText(source)];
    return fromSource || value;
  };

  let staticObserver = null;
  let staticObserverPending = false;
  const scheduleStaticTranslations = () => {
    if (staticObserverPending) return;
    staticObserverPending = true;
    setTimeout(() => {
      staticObserverPending = false;
      translateStaticTextNodes(getLang());
      translateStaticAttributes(getLang());
    }, 0);
  };

  const observeStaticTranslations = () => {
    if (!document.body || staticObserver || typeof MutationObserver === 'undefined') return;
    staticObserver = new MutationObserver(scheduleStaticTranslations);
    staticObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    });
  };

  function apply(lang) {
    // Apply text content translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n'); if (!key) return;
      const current = (el.textContent || '').trim();
      const sourceAttr = 'data-gb-i18n-source-text';
      const source = el.getAttribute(sourceAttr) || current;
      if (!el.hasAttribute(sourceAttr) && current) el.setAttribute(sourceAttr, current);
      const val = withStaticFallback(lang, t(lang, key, current), source);
      if (val !== undefined && val !== null) el.textContent = val;
    });

    // Apply placeholder translations
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph'); if (!key) return;
      const current = el.getAttribute('placeholder') || '';
      const sourceAttr = 'data-gb-i18n-source-placeholder';
      const source = el.getAttribute(sourceAttr) || current;
      if (!el.hasAttribute(sourceAttr) && current) el.setAttribute(sourceAttr, current);
      const val = withStaticFallback(lang, t(lang, key, current), source);
      if (val !== undefined && val !== null) el.setAttribute('placeholder', val);
    });

    syncLanguageSelectors(lang);
    translateStaticTextNodes(lang);
    translateStaticAttributes(lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const lang = getLang(); // EN by default
    apply(lang);
    syncLanguageSelectors(lang);
    observeStaticTranslations();
  });

  document.addEventListener('componentLoaded', () => {
    apply(getLang());
    observeStaticTranslations();
  });

  // Expose APIs and raw dictionaries for legacy consumers
  window.GB_I18N = { setLang, getLang, applyTranslations: apply };
  window.DICTS = DICTS;
})();
