const fs = require('fs');
const path = require('path');

const refs = {
  whoActivity: ['World Health Organization. Guidelines on physical activity and sedentary behaviour.', 'https://www.who.int/publications/i/item/9789240015128'],
  whoDiet: ['World Health Organization. Healthy diet fact sheet.', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet'],
  cdcSleep: ['Centers for Disease Control and Prevention. About sleep.', 'https://www.cdc.gov/sleep/about/index.html'],
  acsmProgression: ['American College of Sports Medicine. Progression models in resistance training for healthy adults.', 'https://pubmed.ncbi.nlm.nih.gov/19204579/'],
  issnProtein: ['International Society of Sports Nutrition. Position stand: protein and exercise.', 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8'],
  issnCreatine: ['International Society of Sports Nutrition. Position stand: creatine supplementation and exercise.', 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z'],
  nhsC25K: ['NHS. Get running with Couch to 5K.', 'https://www.nhs.uk/live-well/exercise/get-running-with-couch-to-5k/'],
  acogExercise: ['ACOG. Physical activity and exercise during pregnancy and the postpartum period.', 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/04/physical-activity-and-exercise-during-pregnancy-and-the-postpartum-period'],
  lallyHabits: ['Lally P, et al. How are habits formed: modelling habit formation in the real world.', 'https://pubmed.ncbi.nlm.nih.gov/20538161/'],
  bctTaxonomy: ['Michie S, et al. The Behavior Change Technique Taxonomy.', 'https://pubmed.ncbi.nlm.nih.gov/23512568/'],
  proteinMeta: ['Morton RW, et al. Protein supplementation and resistance training meta-analysis.', 'https://pubmed.ncbi.nlm.nih.gov/28698222/']
};

const posts = [
  {
    file: 'blog-strength-beginners.html',
    title: 'Strength Training for Beginners - 12 Week Starter Plan',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-strength-beginners-photo.jpg',
    alt: 'Coach helping a beginner learn safe squat technique in a gym',
    description: 'A practical 12 week beginner strength plan covering technique, progression, recovery, and simple nutrition targets.',
    intro: 'Strength training is one of the highest return habits a beginner can build. It improves strength, muscle, confidence, bone loading, and long term physical independence, but only when the first phase is built around repeatable technique and recoverable progression.',
    sections: [
      ['Start with skill before load', 'The first month should feel almost too controlled. Choose exercises you can repeat with the same range of motion every set: squat or leg press, hip hinge or Romanian deadlift, push, pull, loaded carry, and trunk work. Leave two or three reps in reserve on most sets. The goal is not to prove toughness; it is to build a movement library that can be loaded for years. A simple full body plan three days per week beats a complicated split that you cannot recover from.'],
      ['Use progressive overload carefully', 'Progression means doing a little more useful work over time. For beginners, that can be one extra rep, a cleaner tempo, a slightly heavier dumbbell, or one more set on a key lift. Keep the increases small and track them in a notebook or app. If your form changes to finish the set, the load is no longer productive. The best beginner programs make progress visible without turning every workout into a max test.'],
      ['A practical weekly structure', 'Train full body on Monday, Wednesday, and Friday or any schedule with at least one rest day between sessions. Each session can include five movements: squat pattern, hinge pattern, upper push, upper pull, and core or carry. Start with two sets of eight to twelve reps, then move to three sets as recovery improves. Warm up with five minutes of easy cardio, then two lighter practice sets for the first two lifts.'],
      ['Recovery makes the plan work', 'Beginners often underestimate sleep, protein, and rest days because soreness feels like proof. Soreness is not the target. Performance, consistency, and confidence are better signals. Eat protein at each meal, hydrate, and keep steps moderate on rest days. If your reps drop for two sessions in a row, reduce volume for a week instead of forcing more work into a tired body.'],
      ['When to ask for coaching', 'Get coaching when a lift causes sharp pain, when you cannot tell whether your technique is stable, or when you are stuck for several weeks despite good sleep and nutrition. A coach can simplify exercise selection, correct setup, and make progression objective. That early correction saves months of guessing.']
    ],
    refs: ['whoActivity', 'acsmProgression', 'issnProtein', 'proteinMeta']
  },
  {
    file: 'blog-nutrition-fat-loss.html',
    title: 'Beginner Nutrition for Fat Loss - Evidence Based Guide',
    category: 'Nutrition',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-nutrition-fat-loss.svg',
    alt: 'Balanced meal prep containers and nutrition tracking notebook',
    description: 'A deeper beginner guide to fat loss nutrition, including calories, protein, meal structure, adherence, and references.',
    intro: 'Fat loss is simple in physiology and complex in real life. The body needs a sustained energy deficit, but the person needs a plan they can follow on busy days, weekends, social events, and stressful weeks. This guide turns the science into a repeatable system.',
    sections: [
      ['Build the deficit without extremes', 'A calorie deficit is required for fat loss, but bigger is not always better. A moderate reduction that still allows training performance, sleep, and normal mood is usually more sustainable than aggressive restriction. Start by tracking normal intake for one to two weeks, then reduce by a small amount. Watch the weekly weight trend, waist measurement, energy, and training performance before changing anything else.'],
      ['Protein protects the plan', 'Protein helps with satiety and supports lean mass retention during dieting, especially when paired with resistance training. A useful starting target is a protein serving at each meal, then adjust total intake by body size, preference, and training load. Lean meat, fish, eggs, dairy, tofu, tempeh, legumes, and protein powders can all work. The best protein source is the one you can repeat consistently.'],
      ['Design meals for adherence', 'Each meal should solve hunger, convenience, and nutrition at the same time. Use a simple plate structure: protein, high fibre carbohydrate or fruit, vegetables, and a measured fat source. Most people do better with repeated meals during the week and flexible meals at the weekend. Planning is not about perfection; it reduces decision fatigue so the calorie target does not rely on willpower.'],
      ['Do not ignore the environment', 'Your food environment can make the same goal easy or difficult. Keep high protein options visible, prepare two reliable lunches, and avoid storing trigger foods in large portions. If you eat out, decide the protein first and build around it. If progress stalls, audit liquid calories, sauces, oils, snacks, and weekend portions before cutting more from normal meals.'],
      ['How to measure progress', 'Use a seven day average body weight, waist measurement, progress photos, and gym performance. One scale reading is not a verdict because water, sodium, menstrual cycle, digestion, and sleep can move weight quickly. If the four week trend is flat and adherence is honest, reduce calories slightly or increase low intensity activity.']
    ],
    refs: ['whoDiet', 'issnProtein', 'proteinMeta', 'whoActivity']
  },
  {
    file: 'blog-fat-loss-nutrition.html',
    title: 'Fat Loss Nutrition - Calories, Protein, and Meal Timing',
    category: 'Nutrition',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-fat-loss-nutrition-photo.jpg',
    alt: 'Healthy meal prep for sustainable fat loss',
    description: 'A practical fat loss nutrition article covering the hierarchy of calories, protein, food quality, meal timing, and references.',
    intro: 'Most fat loss plans fail because they argue about details before fixing the basics. Meal timing, fasting windows, low carb plans, and supplements can all be tools, but the hierarchy starts with total energy intake, protein, food quality, and adherence.',
    sections: [
      ['The nutrition hierarchy', 'Start with weekly calorie balance. Then set protein high enough to support training and fullness. Then make most food choices minimally processed and high in fibre. Only after those pieces are in place should you worry about the exact timing of meals. This order matters because a perfect eating window cannot compensate for an inconsistent calorie target.'],
      ['Meal timing should fit your life', 'Some clients prefer breakfast because it controls hunger. Others prefer a later first meal because mornings are busy. Both can work. The useful question is whether your timing helps you hit calories and protein without evening overeating. If you train hard, place a protein rich meal within a few hours before or after training and include carbohydrates around demanding sessions.'],
      ['High volume foods help hunger', 'Vegetables, potatoes, oats, berries, soups, lean proteins, and legumes create more fullness per calorie than oils, pastries, alcohol, and snack foods. You do not need to ban enjoyable foods, but you need portions that match the goal. A flexible plan can include treats if the base diet is structured enough to keep hunger stable.'],
      ['Common fat loss mistakes', 'The most common mistakes are underestimating oils and sauces, drinking calories, skipping protein early in the day, and reacting emotionally to one high scale reading. Another mistake is changing the plan every week. Keep one clear target for at least two weeks before judging it. Consistency gives you data; constant changes only create noise.'],
      ['A useful weekly review', 'At the end of each week, ask four questions: Did I hit protein most days? Did I track the meals that mattered? Did my average weight move in the expected direction? Did training performance stay acceptable? The answers tell you whether to continue, adjust calories, improve meal prep, or address recovery.']
    ],
    refs: ['whoDiet', 'issnProtein', 'proteinMeta']
  },
  {
    file: 'blog-muscle-gain-plan.html',
    title: 'Muscle Gain - Progressive Overload Plan',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-muscle-gain-plan-photo.jpg',
    alt: 'Athlete training with dumbbells and a workout log for progressive overload',
    description: 'A practical hypertrophy plan for muscle gain covering training volume, progressive overload, protein, calories, and recovery.',
    intro: 'Muscle gain is built from repeated high quality training stress, enough food to recover, and enough patience to let small increases compound. The plan does not need to be extreme. It needs to be measurable, repeatable, and hard enough to create adaptation.',
    sections: [
      ['Train muscles more than once per week', 'Most lifters grow well when each major muscle group is trained at least twice weekly. That can be full body, upper lower, or push pull legs depending on schedule. Choose a split that lets you perform hard sets with stable technique. If a five day plan makes you miss sessions, a three or four day plan will produce better real world results.'],
      ['Use a double progression system', 'Pick a rep range such as eight to twelve. When you can complete all sets at the top of the range with controlled form, increase load slightly and return to the lower end. This gives a clear rule for progression while protecting technique. Add sets only when you are recovering well and performance is not improving with load or reps alone.'],
      ['Eat enough, not endlessly', 'A small calorie surplus supports muscle gain without unnecessary fat gain. Aim for steady performance increases, stable appetite, and a slow upward body weight trend if gaining size is the goal. Protein should be distributed across the day. Carbohydrates are useful around training because they support high volume work and recovery.'],
      ['Recovery is part of hypertrophy', 'Muscle grows between sessions, not during the set. Sleep, rest days, and lower stress weeks protect performance. If joints ache, pumps disappear, and loads drop, you may need less volume, not more discipline. Plan a lighter week every four to eight weeks or whenever performance trend and fatigue show that recovery is lagging.'],
      ['Track the right signals', 'Track exercises, sets, reps, load, body weight trend, photos, and how hard sets feel. Do not chase soreness as the main indicator. A productive muscle gain phase usually feels like consistent effort, gradual strength improvements, and a physique that changes slowly over months.']
    ],
    refs: ['acsmProgression', 'issnProtein', 'proteinMeta', 'whoActivity']
  },
  {
    file: 'blog-home-workouts-busy.html',
    title: 'Home Workouts for Busy People - 20 Minute Routines',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-home-workouts-busy-photo.jpg',
    alt: 'Person doing a home workout with dumbbells and a timer',
    description: 'Efficient home workouts for busy people, including equipment options, progression, weekly structure, and safety notes.',
    intro: 'A busy schedule does not remove the need for training; it changes the design. The best home workout is short enough to start, complete enough to matter, and repeatable enough to become normal. Twenty focused minutes can maintain momentum and build strength when programmed well.',
    sections: [
      ['Choose simple equipment', 'You can train with body weight only, but a pair of adjustable dumbbells, a resistance band, and a mat give far more options. The goal is to cover squat, hinge, push, pull, core, and conditioning patterns. If space is limited, keep equipment visible and ready. Removing setup friction can be the difference between doing the session and skipping it.'],
      ['Use density instead of chaos', 'A good short workout is not random intensity. Use timed blocks with clean movement. For example, perform three rounds of goblet squats, push ups, band rows, Romanian deadlifts, and dead bugs, resting only as needed to keep form stable. Track total reps or load so the workout can progress next week.'],
      ['A practical three day template', 'Day one can focus on lower body and push. Day two can focus on hinge and pull. Day three can be full body conditioning with lighter loads. Keep warm ups short: breathing, hip mobility, shoulder circles, and one easy set of each first movement. Finish with two minutes of easy walking or mobility to downshift.'],
      ['Progress without adding time', 'If the session must stay at twenty minutes, progress by improving range of motion, adding load, adding reps inside the same time, or reducing rest slightly. Do not sacrifice form just to beat the clock. Short sessions work best when they are repeatable and leave you ready for the next one.'],
      ['Protect consistency', 'Schedule home workouts like meetings. Put the phone on do not disturb, set a timer, and use the same training space. If the full session is not possible, complete one ten minute block. A shortened session keeps the identity of being consistent alive, and that matters over months.']
    ],
    refs: ['whoActivity', 'acsmProgression', 'lallyHabits']
  },
  {
    file: 'blog-mobility-injury-prevention.html',
    title: 'Mobility and Injury Prevention - Stay Pain Free',
    category: 'Rehabilitation',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-mobility-injury-prevention-photo.jpg',
    alt: 'Athlete performing a hip flexor mobility drill in a gym',
    description: 'A practical mobility and injury prevention guide covering warm ups, strength, range of motion, workload, and pain signals.',
    intro: 'Mobility is useful when it helps you access positions, train with control, and recover from daily stiffness. It is not a separate magic category from strength. The most resilient bodies combine adequate range of motion, gradual loading, stable technique, and sensible workload management.',
    sections: [
      ['Warm up for the work ahead', 'A warm up should prepare the joints and nervous system for the session you are about to do. Five to ten minutes is enough for most people: raise body temperature, rehearse the movement pattern, and gradually load the first exercise. Static stretching can be useful, but it should not replace practice sets for the lift itself.'],
      ['Strength through range matters', 'Mobility that cannot be controlled under light load may not transfer to training. Use split squats, Romanian deadlifts, rows, presses, carries, and controlled tempo work to build strength in the ranges you need. This approach turns flexibility into usable capacity.'],
      ['Manage spikes in workload', 'Many aches appear after sudden changes: more running volume, more sets, heavier loads, new shoes, new exercises, or less sleep. Reduce injury risk by changing one variable at a time. If you add running, keep lifting volume stable. If you add heavy squats, avoid adding intense conditioning in the same week.'],
      ['Respect pain signals', 'Normal training discomfort is different from sharp pain, numbness, instability, or symptoms that worsen each session. Pain that changes your movement deserves attention. Modify range, load, or exercise choice and seek a qualified clinician if symptoms persist or affect daily life. Training should build capacity, not force you through warning signs.'],
      ['Daily minimum routine', 'A simple daily routine can include ankle rocks, hip flexor stretch with glute squeeze, thoracic rotations, band pull aparts, and deep breathing. Keep it under eight minutes. The routine is not a cure-all; it is a way to maintain positions and notice stiffness before it becomes a training limiter.']
    ],
    refs: ['whoActivity', 'acsmProgression']
  },
  {
    file: 'blog-running-endurance.html',
    title: 'Running and Endurance - Beginner to Half Marathon',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/marathon.webp',
    alt: 'Runner training outdoors for endurance',
    description: 'A safe beginner running progression from walk-run intervals toward longer endurance goals, with strength and recovery guidance.',
    intro: 'Running rewards patience. The cardiovascular system can improve quickly, but muscles, tendons, and bones need time to adapt to impact. A beginner plan should therefore build frequency and easy volume before speed, distance targets, or hard intervals.',
    sections: [
      ['Start with walk-run intervals', 'If you are new or returning after a break, alternate easy jogging with walking. The walking portions are not failure; they keep effort controlled and let you accumulate quality minutes. Start with twenty to thirty minutes total, two or three days per week. You should finish feeling like you could have done a little more.'],
      ['Keep most runs easy', 'Easy running develops aerobic capacity and tissue tolerance with lower recovery cost. Use the talk test: you should be able to speak in short sentences. Hard efforts have a place later, but beginners often add them too early. Build the habit first, then add intensity when weekly running feels stable.'],
      ['Strength train to support running', 'Two short strength sessions per week can improve durability. Prioritize calves, hamstrings, glutes, quads, trunk, and single leg control. Exercises such as split squats, Romanian deadlifts, calf raises, rows, and side planks fit well. Keep strength work moderate during weeks when run volume increases.'],
      ['Progress toward longer goals', 'For a half marathon, extend one weekly long run gradually while keeping other runs comfortable. Every few weeks, hold distance steady or reduce volume to absorb the work. Shoes, sleep, hydration, and fueling matter more as duration rises. Practice race day breakfast and hydration before event day.'],
      ['Signs to slow down', 'Back off when pain changes your stride, soreness becomes sharper during the run, resting heart rate is unusually high, or motivation drops alongside poor sleep. Endurance improves from repeated recoverable stress. Missing one hard session is better than losing three weeks to an avoidable overload problem.']
    ],
    refs: ['nhsC25K', 'whoActivity', 'acsmProgression']
  },
  {
    file: 'blog-recovery-sleep-stress.html',
    title: 'Recovery, Sleep, and Stress - Performance Essentials',
    category: 'Health',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-recovery-sleep-stress-photo.jpg',
    alt: 'Recovery routine with sleep mask, book, foam roller, and training shoes',
    description: 'A recovery guide for people who train hard, covering sleep, stress, deloads, nutrition, and monitoring fatigue.',
    intro: 'Recovery is not passive laziness. It is the set of conditions that lets training become adaptation. If sleep is poor, stress is high, and food is inconsistent, the same workout produces less progress and more fatigue. A serious plan includes recovery as a programmed variable.',
    sections: [
      ['Sleep is the foundation', 'Most adults need a consistent sleep opportunity of around seven or more hours, and athletes often benefit from more when training load is high. Build a repeatable evening routine: dim lights, reduce late caffeine, keep the room cool, and stop intense work close to bedtime. The aim is not a perfect night; it is a stable pattern.'],
      ['Stress changes training tolerance', 'Work, family pressure, travel, and emotional stress all draw from the same recovery budget. On high stress weeks, keep the habit but reduce the dose. That might mean fewer sets, lower loads, or more easy cardio instead of intervals. Adjusting training to life is a strength, not a lack of discipline.'],
      ['Use deloads before burnout', 'A deload is a planned reduction in volume or intensity. It can be scheduled every four to eight weeks or used when performance drops, joints ache, sleep worsens, and motivation disappears. Most people do not need a week off; they need a week with lighter sets, cleaner movement, and more recovery.'],
      ['Nutrition supports recovery', 'Protein supports muscle repair, carbohydrates support hard training, and total calories determine whether the body has enough energy to adapt. During aggressive fat loss phases, recovery can suffer. If performance is a priority, avoid combining high training volume, low calories, low sleep, and high stress for long periods.'],
      ['Track simple recovery markers', 'Use a short checklist: sleep duration, energy, mood, soreness, resting heart rate if available, and training performance. One bad marker is normal. Several bad markers for multiple days suggest you should reduce load. The goal is to keep progress moving without waiting for the body to force a break.']
    ],
    refs: ['cdcSleep', 'whoActivity', 'issnProtein']
  },
  {
    file: 'blog-supplements-explained.html',
    title: 'Supplements Explained - What Actually Works',
    category: 'Nutrition',
    date: 'Updated June 2026',
    image: 'assets/images/blog/creatine.jpg',
    alt: 'Creatine supplement and shaker for performance nutrition',
    description: 'A practical supplement guide that separates useful basics from marketing, with references for creatine, protein, caffeine, and safety.',
    intro: 'Supplements can help, but they are the smallest part of the plan. Training, calories, protein, sleep, and consistency create most results. A supplement is worth considering only when it solves a specific gap, has evidence, is safe for you, and fits your budget.',
    sections: [
      ['Protein powder is convenience', 'Whey, casein, soy, pea, and blended plant proteins can all help you reach daily protein targets. They do not build muscle by themselves. Use powder when whole food is inconvenient, appetite is low, or you need a portable option. If you already hit protein through meals, powder is optional.'],
      ['Creatine is the strongest basic option', 'Creatine monohydrate is one of the most studied sports supplements. It can support high intensity performance, strength, power, and lean mass over time when paired with training. A common approach is three to five grams daily. Some people gain a little water weight inside the muscle, which is normal and not fat gain.'],
      ['Caffeine is useful but easy to misuse', 'Caffeine can improve alertness and training output, but timing and tolerance matter. Use it before sessions that need focus, avoid it late in the day, and do not use it to cover chronic sleep debt. If caffeine worsens anxiety, digestion, blood pressure, or sleep, the tradeoff may not be worth it.'],
      ['Be skeptical of fat burners', 'Most fat burners rely on stimulants, exaggerated claims, or tiny effects that do not outperform a consistent calorie deficit. If a product promises rapid fat loss without changes to food or activity, treat it as marketing. Spend money first on food quality, coaching, a gym membership, or equipment you will actually use.'],
      ['Safety and quality checks', 'Check medication interactions, pregnancy status, medical conditions, and sport drug testing requirements before using supplements. Choose third party tested products where possible, avoid proprietary blends with unclear doses, and stop anything that causes unusual symptoms. Supplements should make the plan easier, not riskier.']
    ],
    refs: ['issnCreatine', 'issnProtein', 'whoDiet']
  },
  {
    file: 'blog-womens-strength-hormones.html',
    title: "Women's Strength Training and Hormonal Considerations",
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-womens-strength-hormones-photo.jpg',
    alt: 'Woman performing a strong deadlift in a modern gym',
    description: 'Practical strength training guidance for women across menstrual cycle changes, pregnancy, postpartum, menopause, and busy life phases.',
    intro: 'Women do not need a completely different strength training system, but good coaching should respect individual physiology, symptoms, preferences, and life stage. The foundation remains progressive resistance training, enough food, good recovery, and intelligent adjustments when the body gives useful feedback.',
    sections: [
      ['Train the same patterns', 'Squat, hinge, push, pull, carry, rotate, and brace. These patterns build strength for sport, physique, bone health, and daily life. The exercises can be adapted to comfort and goals, but the principle is the same: gradually challenge muscles through quality range of motion and recover from the work.'],
      ['Use cycle awareness without fear', 'Some women feel strongest at certain points in the menstrual cycle and more fatigued, sore, or symptomatic at others. Use this information to adjust expectations, not to limit progress. If performance is high, push. If cramps, poor sleep, or low energy are present, keep the habit and reduce volume or intensity. Individual response matters more than generic cycle rules.'],
      ['Pregnancy and postpartum need qualified guidance', 'Many pregnant and postpartum clients can benefit from activity, but programming should be individualized and cleared when appropriate. Prioritize breathing, pelvic floor awareness, pressure management, walking, and strength work that feels stable. Avoid comparing timelines. Return to heavy lifting should be gradual and symptom led.'],
      ['Menopause changes priorities', 'During perimenopause and menopause, strength training, protein, impact as tolerated, sleep, and stress management become especially valuable. Muscle and bone are use it or lose it tissues. Training should include challenging resistance work, but recovery may need more attention when sleep and temperature regulation are disrupted.'],
      ['Measure more than scale weight', 'Track strength, measurements, energy, cycle symptoms, sleep, photos, and confidence. Scale weight can be affected by water shifts, digestion, and cycle phase. A good plan helps women feel capable and informed, not punished by normal biological variation.']
    ],
    refs: ['acogExercise', 'whoActivity', 'issnProtein', 'acsmProgression']
  },
  {
    file: 'blog-habits-mindset.html',
    title: 'Habit Formation and Mindset for Sustainable Fitness',
    category: 'Mindset',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-consistency.svg',
    alt: 'Fitness habit tracker with shoes and gym bag',
    description: 'A behavior-based approach to fitness consistency using small habits, tracking, accountability, identity, and environment design.',
    intro: 'Sustainable fitness is less about finding permanent motivation and more about building systems that make the desired action easier to repeat. Motivation rises and falls. Habits, environment, accountability, and identity carry the plan when motivation is ordinary.',
    sections: [
      ['Make the first step small', 'A habit should be easy enough to start on a bad day. Instead of promising six workouts per week, begin with a minimum standard: put on training clothes and complete ten minutes. Most days you will do more. On difficult days, the minimum keeps the chain alive and protects the identity of being someone who follows through.'],
      ['Attach habits to existing routines', "Habit stacking works because the old routine becomes the cue for the new behavior. After morning coffee, prepare your protein breakfast. After work, change into gym clothes before sitting down. After dinner, pack tomorrow's lunch. The cue should be specific and already reliable."],
      ['Track behaviors, not just outcomes', 'Scale weight and photos matter, but they are lagging indicators. Track the actions that create the outcome: workouts completed, protein servings, steps, sleep routine, and planned meals. This makes progress feel controllable and highlights the real bottleneck when results slow.'],
      ['Design the environment', 'Keep training shoes visible, place fruit and protein options at eye level, block workout time in the calendar, and remove friction from the first five minutes. Environment design is not weakness. It is engineering. The easier behavior usually wins, especially when you are busy or tired.'],
      ['Use accountability well', 'A coach, training partner, group, or simple weekly check in can turn vague intentions into specific commitments. Accountability should be honest and practical, not shame based. The best question is: what needs to be adjusted so the plan works next week?']
    ],
    refs: ['lallyHabits', 'bctTaxonomy', 'whoActivity']
  },
  {
    file: 'blog-consistency.html',
    title: 'How to Stay Consistent With Fitness',
    category: 'Mindset',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-habits-mindset-photo.jpg',
    alt: 'Planner, gym shoes, and habit tracker for consistent fitness routines',
    description: 'Practical strategies to stay consistent with workouts and nutrition when motivation drops, schedules change, and life gets busy.',
    intro: 'Consistency is not a personality trait. It is the result of realistic goals, a plan that fits your week, feedback that is easy to understand, and enough flexibility to recover from missed days. The people who succeed long term are not perfect; they restart quickly.',
    sections: [
      ['Set a realistic baseline', 'Start by defining the minimum week you can repeat during a normal busy period. For many people that is three workouts, a daily protein target, and a step range. If you build the plan around your best week, it will collapse during an average week. A baseline should feel achievable even when work and family are demanding.'],
      ['Plan for obstacles in advance', 'Write down the three situations that usually break consistency: late work, travel, low energy, social meals, or soreness. Then create a backup rule for each. For example, if you miss the gym, complete a twenty minute home session. If dinner is out, choose protein first. This reduces all-or-nothing thinking.'],
      ['Review without emotion', 'A weekly review should identify patterns, not assign blame. Which sessions happened? Which meals were easy? Where did the plan require too much effort? Adjust one or two variables. Consistency improves when the plan becomes more accurate to your life, not when you promise to be a different person next Monday.'],
      ['Keep visible proof of progress', 'Progress photos, strength logs, waist measurements, and energy notes help you see change before other people notice. This matters because body composition changes are slow. Visible proof keeps the process connected to results and reduces the temptation to quit during normal plateaus.'],
      ['Build identity through action', 'Confidence follows evidence. Every completed session, planned meal, and honest check in tells your brain that you are the type of person who trains. Do not wait to feel like an athlete before acting. Act in small repeatable ways, then let the identity catch up.']
    ],
    refs: ['lallyHabits', 'bctTaxonomy', 'whoActivity']
  },
  {
    file: 'blog-gym-mistakes.html',
    title: 'Top Beginner Gym Mistakes and How to Fix Them',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-gym-mistakes-photo.jpg',
    alt: 'Coach helping a beginner correct squat technique in the gym',
    description: 'A practical guide to the most common beginner gym mistakes: skipping warm ups, poor progression, bad technique, recovery errors, and unclear goals.',
    intro: 'Most beginner gym mistakes come from enthusiasm without structure. Wanting results quickly is normal, but the body adapts best to clear technique, gradual progression, enough recovery, and a plan that matches your current capacity.',
    sections: [
      ['Mistake 1: testing instead of training', 'Beginners often turn every set into a max effort. Hard work matters, but constant testing makes technique unstable and recovery unpredictable. Keep most sets one to three reps short of failure while learning. Save true max efforts for later phases when movement quality and training history are stronger.'],
      ['Mistake 2: changing exercises too often', 'Variety feels exciting, but too much variety prevents skill and progression. Keep main lifts stable for at least four to six weeks. You can rotate accessory work, but the core patterns need enough repetition for your body to learn and for your logbook to show whether you are actually improving.'],
      ['Mistake 3: skipping warm ups', 'A warm up does not need to be long, but it should prepare the session. Raise temperature, move the joints you will train, and use lighter practice sets. Walking into a heavy lift cold is unnecessary risk. A good warm up also gives you feedback about soreness, mobility, and readiness.'],
      ['Mistake 4: ignoring recovery', 'Training breaks tissue down and signals adaptation. Recovery allows the adaptation. If sleep is poor, protein is low, and stress is high, adding more volume may make results worse. Beginners grow from moderate work done consistently, not from copying advanced routines built for different recovery capacity.'],
      ['Mistake 5: having no measurable target', 'A vague goal like get fit is hard to execute. Set measurable targets such as three sessions per week, eight thousand steps, protein at three meals, or adding five reps across a lift in a month. Clear targets make decisions easier and coaching feedback more useful.']
    ],
    refs: ['acsmProgression', 'whoActivity', 'issnProtein']
  }
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function readingMinutes(post) {
  const words = [
    post.title,
    post.description,
    post.intro,
    ...post.sections.flat()
  ].join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.round(words / 190));
}

function renderValueStack(post) {
  const values = [
    ['What you will get', post.description],
    ['Coach focus', 'A practical system you can apply this week without chasing extremes or random motivation.'],
    ['Best for', `${post.category} clients who want structure, accountability, and clear next steps.`]
  ];

  return values.map(([label, text]) => `          <div class="blog-value-card">
            <span>${esc(label)}</span>
            <p>${esc(text)}</p>
          </div>`).join('\n');
}

function renderCoachNote(post) {
  const firstAction = post.sections[0]?.[0] || 'Start with the basics';
  return `        <aside class="blog-coach-note" aria-label="Coach note">
          <img src="assets/images/about/about5.jpg" alt="Andre Julio Garcia coaching avatar" loading="lazy" decoding="async">
          <div>
            <span>Coach André note</span>
            <p>I wrote this for real people with busy weeks, not perfect conditions. Start with “${esc(firstAction)}”, keep the plan measurable, and let consistency beat intensity.</p>
          </div>
        </aside>`;
}

function renderTakeaways(post) {
  return post.sections.slice(0, 3).map(([heading]) => `          <li>${esc(heading)}</li>`).join('\n');
}

function renderReferences(post) {
  return post.refs.map((key) => {
    const [label, url] = refs[key];
    return `        <li>${esc(label)} <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></li>`;
  }).join('\n');
}

function renderPost(post) {
  const sections = post.sections.map(([heading, text]) => `        <h2>${esc(heading)}</h2>\n        <p>${esc(text)}</p>`).join('\n\n');
  const minutes = readingMinutes(post);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(post.title)} | Garcia Builder Blog</title>
  <meta name="description" content="${esc(post.description)}">
  <meta name="author" content="Andre Julio Garcia">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://garciabuilder.fitness/${esc(post.file)}">
  <link rel="icon" href="Logo Files/For Web/logo-nobackground-500.png" type="image/png">
  <meta property="og:title" content="${esc(post.title)}">
  <meta property="og:description" content="${esc(post.description)}">
  <meta property="og:image" content="https://garciabuilder.fitness/${esc(post.image)}">
  <meta property="og:url" content="https://garciabuilder.fitness/${esc(post.file)}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(post.title)}">
  <meta name="twitter:description" content="${esc(post.description)}">
  <meta name="twitter:image" content="https://garciabuilder.fitness/${esc(post.image)}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/components/navbar-component.css?v=20251028">
  <link rel="stylesheet" href="css/global.css?v=20251025">
  <link rel="stylesheet" href="css/components/enhanced-navbar.css?v=20251025">
  <link rel="stylesheet" href="css/blog-article.css?v=20260624">
  <script src="js/utils/component-loader-v3-simplified.js?v=20251029"></script>
  <script src="js/tracking/conversion-tracking.js?v=20251025"></script>
  <script defer src="js/tracking/ads-loader.js?v=20251025"></script>
  <script defer src="js/tracking/ads-config.js?v=20251025"></script>
  <script defer src="js/tracking/cta-tracking.js?v=20251112"></script>
</head>
<body class="blog-article-page">
  <div data-component="navbar"></div>
  <main class="blog-article-shell">
    <article>
      <header class="blog-article-hero">
        <p class="blog-article-kicker">${esc(post.category)}</p>
        <h1>${esc(post.title)}</h1>
        <div class="blog-author-row">
          <img src="assets/images/about/about5.jpg" alt="Andre Julio Garcia" loading="lazy" decoding="async">
          <div>
            <p class="blog-article-meta">By Andre Julio Garcia | ${esc(post.date)} | ${minutes} min read</p>
            <p class="blog-author-role">Online coach, strength-focused fat loss, habits, and accountability.</p>
          </div>
        </div>
        <p class="blog-article-lede">${esc(post.intro)}</p>
        <div class="blog-value-grid">
${renderValueStack(post)}
        </div>
        <img class="blog-article-image" src="${esc(post.image)}" alt="${esc(post.alt)}" loading="eager" decoding="async">
      </header>
      <div class="blog-article-content">
        <div class="blog-quick-take">
          <span>Quick take</span>
          <ul>
${renderTakeaways(post)}
          </ul>
        </div>

${renderCoachNote(post)}

${sections}

        <div class="blog-article-callout">
          <strong>Garcia Builder value:</strong> simple structure, honest feedback, and weekly accountability. Use this article as education, not individual medical care. If you have pain, a diagnosed condition, pregnancy considerations, medication interactions, or a history of injury, get clearance from a qualified professional before changing training or nutrition.
        </div>

        <h2>References</h2>
        <ol>
${renderReferences(post)}
        </ol>

        <div class="blog-article-actions">
          <a class="blog-article-button" href="https://calendly.com/andrenjulio072/consultation" target="_blank" rel="noopener">Build My Plan With André</a>
          <a class="blog-article-button secondary" href="blog.html">Back to Blog</a>
        </div>
      </div>
    </article>
  </main>
  <div data-component="footer"></div>
  <a class="contact-float" href="https://calendly.com/andrenjulio072/consultation" target="_blank" rel="noopener" aria-label="Schedule a free consultation">
    <i class="fas fa-calendar-check" aria-hidden="true"></i>
    Book Free Consultation
  </a>
</body>
</html>
`;
}

for (const post of posts) {
  fs.writeFileSync(path.join(process.cwd(), post.file), renderPost(post));
}

console.log(`Rendered ${posts.length} local blog articles.`);
