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
    image: 'assets/images/blog/preview-fat-loss-nutrition-photo.jpg',
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
    alt: 'Prepared balanced meals for sustainable fat loss nutrition',
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
    image: 'assets/images/blog/preview-habits-mindset-photo.jpg',
    alt: 'Workout mat, laptop, and light dumbbells for building sustainable fitness habits',
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
  },
  {
    file: 'blog-body-recomposition.html',
    title: 'Body Recomposition - Lose Fat and Build Muscle',
    category: 'Nutrition',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-muscle-gain-plan-photo.jpg',
    alt: 'Strength training setup with dumbbells and workout tracking for body recomposition',
    description: 'A practical guide to body recomposition: training, protein, calories, progress tracking, and realistic expectations.',
    intro: 'Body recomposition means improving the ratio of muscle to fat rather than chasing scale weight alone. It works best for beginners, returning lifters, clients with inconsistent training history, and people willing to measure progress with more than one number.',
    sections: [
      ['Choose the right calorie target', 'Recomposition usually works best at maintenance calories or a small deficit. Aggressive dieting can reduce training quality, while a large surplus may add fat faster than muscle. Start with a stable calorie range, high protein, and progressive strength training. If waist measurement drops while gym performance improves, the plan is working even when the scale moves slowly.'],
      ['Train like muscle gain still matters', 'The training stimulus must tell the body to keep or build muscle. Prioritize compound lifts, controlled accessory work, and progressive overload. Do not turn every session into calorie burning. Lifting should be measured by performance quality, not sweat alone. Cardio can support health and calorie balance, but resistance training drives the muscle side of recomposition.'],
      ['Protein anchors the process', 'A protein serving at each meal improves satiety, recovery, and lean mass retention. Most clients do better with repeatable meals than with constant novelty. Build each day around three or four protein feedings, vegetables or fruit, a useful carbohydrate source, and enough dietary fat for taste and adherence.'],
      ['Track more than body weight', 'Use waist measurement, progress photos, strength logs, energy, and clothing fit. Recomposition can hide on the scale because muscle gain, water, and glycogen can offset fat loss. A four to eight week trend is more useful than daily judgment. If every marker is flat, adjust calories or training volume slightly rather than changing everything.'],
      ['Set realistic timeframes', 'Recomposition is slower than a dedicated fat loss phase or a dedicated muscle gain phase. That is the tradeoff. The benefit is sustainability and a better relationship with training. Give the plan at least twelve weeks of honest execution before deciding whether to shift into a clearer fat loss or muscle gain block.']
    ],
    refs: ['issnProtein', 'proteinMeta', 'acsmProgression', 'whoActivity']
  },
  {
    file: 'blog-steps-neat-fat-loss.html',
    title: 'Steps and NEAT - The Underrated Fat Loss Lever',
    category: 'Health',
    date: 'Updated June 2026',
    image: 'assets/images/blog/marathon.webp',
    alt: 'Runner outdoors representing daily movement and endurance habits',
    description: 'How daily steps and non-exercise activity support fat loss, health, appetite control, and long-term adherence.',
    intro: 'Fat loss is not only about gym sessions. Non-exercise activity thermogenesis, often called NEAT, includes walking, chores, commuting, standing, and general movement. For busy clients, increasing daily movement is often easier to recover from than adding more intense workouts.',
    sections: [
      ['Why steps matter', 'Steps create a low-stress way to increase total energy expenditure. Unlike hard intervals, walking is easy to repeat, does not usually increase soreness, and can improve mood and recovery. A realistic step target also gives structure to days when training is not scheduled.'],
      ['Start from your baseline', 'Do not copy a random ten thousand step target if your current average is four thousand. Track normal steps for a week, then add one to two thousand per day. The body responds better to gradual change, and adherence improves when the target fits your work, family, weather, and commute.'],
      ['Use steps to protect nutrition', 'Walking can reduce the pressure to cut calories aggressively. A moderate calorie deficit combined with higher daily movement often feels better than very low food intake. If hunger becomes difficult, increase high-volume foods and keep walking easy rather than turning every walk into a workout.'],
      ['Make movement automatic', 'Anchor steps to existing routines: ten minutes after lunch, a call while walking, parking farther away, or an evening loop after dinner. Small repeated walking blocks are easier than waiting for one perfect long walk. Consistency matters more than the exact format.'],
      ['Know when to adjust', 'If fatigue rises, sleep drops, or legs feel heavy for strength sessions, reduce steps temporarily. Movement should support the program, not compete with it. The right target is the highest level you can repeat while still training well and recovering.']
    ],
    refs: ['whoActivity', 'cdcSleep', 'lallyHabits']
  },
  {
    file: 'blog-strength-after-40.html',
    title: 'Strength Training After 40 - Build Muscle Safely',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-strength-beginners-photo.jpg',
    alt: 'Coach supporting safe strength training technique in a gym',
    description: 'A mature lifter guide to strength after 40: joint-friendly loading, recovery, protein, mobility, and progression.',
    intro: 'Strength training after 40 is not about training timidly. It is about training intelligently. The goal is to keep building muscle, strength, bone loading, and confidence while respecting recovery, joint history, and the reality that warm-ups and sleep matter more than they did at twenty.',
    sections: [
      ['Keep the main patterns', 'You still need squats, hinges, pushes, pulls, carries, and trunk work. The exercise variation can change. A trap bar deadlift, goblet squat, cable row, machine press, or split squat may be a better tool than forcing a lift that irritates old injuries. The pattern matters more than the ego attached to one exercise.'],
      ['Use slower progression', 'Progress can still be steady, but jumps should be smaller. Add reps before load, use controlled tempo, and keep one or two reps in reserve on most sets. The best program is one you can repeat without needing a recovery crisis every few weeks.'],
      ['Warm up with purpose', 'A mature warm-up should raise temperature, rehearse the first lift, and check readiness. Five to ten minutes is enough for most clients. Include light cardio, joint-specific movement, and ramp-up sets. If the warm-up reveals stiffness or pain, modify the session instead of forcing the original plan.'],
      ['Prioritize protein and sleep', 'Muscle protein synthesis, recovery, and appetite control all benefit from consistent protein intake. Sleep protects training quality and decision making. If results stall, audit recovery before adding more volume. More sets on poor sleep often create more fatigue, not more progress.'],
      ['Measure capacity, not just maxes', 'Track strength, pain-free range of motion, resting energy, steps, waist, and photos. A stronger body after 40 should feel more capable outside the gym. Personal records can still happen, but the bigger win is building a body that tolerates life better.']
    ],
    refs: ['whoActivity', 'acsmProgression', 'issnProtein', 'proteinMeta']
  },
  {
    file: 'blog-gym-confidence-beginners.html',
    title: 'Gym Confidence for Beginners - Stop Feeling Lost',
    category: 'Mindset',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-gym-mistakes-photo.jpg',
    alt: 'Personal trainer guiding a beginner through a gym exercise',
    description: 'A practical confidence guide for beginners who feel intimidated in the gym and need a clear first-month system.',
    intro: 'Gym confidence does not appear before action. It is built by having a simple plan, knowing what to do first, and repeating small wins until the room feels familiar. Most people are paying less attention to you than you think.',
    sections: [
      ['Use a written plan', 'Anxiety rises when every decision happens in public. Walk in with the exercises, sets, reps, and backup options already decided. A plan turns the gym from a room full of choices into a checklist. Start with machines and dumbbells if they help you feel safer while learning movement patterns.'],
      ['Learn the layout first', 'Your first session does not need to be intense. Find the changing area, water, toilets, dumbbells, machines, cables, and stretching space. Knowing where things are reduces friction. If possible, visit at a quieter time for the first week so you can learn without pressure.'],
      ['Use simple etiquette rules', 'Put weights back, wipe equipment, do not block racks while texting, and ask politely if someone is using a station. These basics cover most gym situations. You do not need to know every unwritten rule before starting. Respect and awareness go a long way.'],
      ['Track confidence behaviors', 'Instead of only tracking weight or calories, track confidence actions: completed first session, asked a staff member a question, used a new machine, recorded a lift, or trained during a busier hour. Confidence grows when you can see evidence that you handled discomfort.'],
      ['Get help early if needed', 'A coach can shorten the learning curve by giving you exercise selection, technique cues, and structure. One good session can remove months of guessing. Asking for help is not weakness; it is efficient.']
    ],
    refs: ['lallyHabits', 'bctTaxonomy', 'whoActivity']
  },
  {
    file: 'blog-protein-meal-prep.html',
    title: 'Protein Meal Prep - Simple Systems for Busy Weeks',
    category: 'Nutrition',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-fat-loss-nutrition-photo.jpg',
    alt: 'Prepared balanced meals with vegetables and lean protein',
    description: 'A premium meal prep guide for hitting protein targets without boring food, decision fatigue, or weekend overwhelm.',
    intro: 'Protein meal prep is not about eating the same dry chicken every day. It is about removing the hardest decision from busy weeks: what am I eating that supports my goal and actually keeps me full?',
    sections: [
      ['Prep components, not prison meals', 'Cook two proteins, two carbohydrates, and two vegetables, then mix them with different sauces or seasonings. This keeps structure without monotony. For example, chicken and tofu, rice and potatoes, broccoli and peppers can become several meals without starting from zero each time.'],
      ['Set a protein anchor', 'Decide the protein first for each meal. Once the anchor is clear, calories and food quality become easier to manage. Greek yogurt, eggs, lean meat, fish, legumes, tofu, cottage cheese, protein powder, and tempeh all work. The best choices are the ones you can repeat.'],
      ['Control portions with containers', 'Containers help remove guesswork. You do not need perfection, but you do need consistency. If fat loss is the goal, measure calorie-dense ingredients like oils, nuts, cheese, and sauces. If muscle gain is the goal, add carbohydrates around training and keep protein steady.'],
      ['Plan for the danger meals', 'Most people do not fail because every meal is chaotic. They fail at the same two or three moments: lunch at work, evening snacks, or weekends. Prep for those first. A reliable lunch and a high-protein evening option can change the whole week.'],
      ['Keep food enjoyable', 'Seasoning, texture, and variety matter. Use herbs, citrus, spices, salsa, yogurt-based sauces, pickled vegetables, and different cooking methods. Enjoyable food improves adherence, and adherence beats the theoretically perfect plan that nobody wants to eat.']
    ],
    refs: ['issnProtein', 'proteinMeta', 'whoDiet']
  },
  {
    file: 'blog-deload-recovery.html',
    title: 'Deload Weeks - Recover Without Losing Progress',
    category: 'Health',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-recovery-sleep-stress-photo.jpg',
    alt: 'Recovery routine with sleep and training equipment',
    description: 'How to use deload weeks to manage fatigue, protect joints, and keep strength progress moving.',
    intro: 'A deload is not quitting. It is a planned reduction in training stress so your body can absorb previous work. Lifters who never deload often end up taking unplanned breaks through pain, burnout, or performance crashes.',
    sections: [
      ['Understand the purpose', 'Training creates stress and signals adaptation. Recovery turns that signal into progress. When stress accumulates faster than recovery, performance drops. A deload reduces volume, intensity, or both so fatigue falls while the training habit stays alive.'],
      ['Use performance signals', 'You may need a deload when loads feel unusually heavy, joints ache, motivation drops, sleep worsens, and multiple sessions underperform. One bad workout is normal. A pattern across several sessions suggests the program needs adjustment.'],
      ['Choose the right deload style', 'Some clients reduce sets by half while keeping technique crisp. Others keep the same exercises but lower load. Some switch to machines, mobility, walking, and easy conditioning for a week. The best deload keeps you moving without adding more fatigue.'],
      ['Do not panic about losing gains', 'You do not lose meaningful muscle or strength from one lighter week. Many clients return stronger because fatigue stops masking fitness. A deload is especially useful after high-volume blocks, travel stress, poor sleep, or hard dieting phases.'],
      ['Return gradually', 'After a deload, do not immediately double the workload. Resume normal training with clean technique and realistic loads. If the same fatigue pattern returns quickly, the main program may have too much volume or too little recovery for your current life.']
    ],
    refs: ['acsmProgression', 'cdcSleep', 'whoActivity']
  },
  {
    file: 'blog-lower-back-resilience.html',
    title: 'Lower Back Resilience - Train Around Pain Wisely',
    category: 'Rehabilitation',
    date: 'Updated June 2026',
    image: 'assets/images/blog/Woman-holding-lower-back.jpg',
    alt: 'Person holding lower back while considering pain management',
    description: 'A practical lower back resilience guide covering movement, strength, load management, and when to seek help.',
    intro: 'Lower back discomfort is common, but fear and complete rest often make people feel more fragile. The goal is not to ignore pain. The goal is to find tolerable movement, rebuild capacity, and know when professional assessment is needed.',
    sections: [
      ['Separate pain from damage', 'Pain is a signal, not always a precise damage report. Sharp, radiating, worsening, or neurological symptoms deserve medical attention. But mild stiffness or discomfort often improves with graded movement. Avoid catastrophizing and focus on what movements are currently tolerable.'],
      ['Keep moving within tolerance', 'Walking, gentle hip hinges, breathing drills, and modified strength work can maintain confidence. Use pain as feedback. If symptoms rise significantly during or after a movement, reduce range, load, speed, or choose another option. The target is tolerable progress.'],
      ['Strengthen the surrounding system', 'The lower back is influenced by hips, trunk, hamstrings, glutes, and overall workload. Split squats, carries, rows, dead bugs, side planks, hip thrusts, and controlled hinges can all help when appropriately scaled. There is no single magic exercise.'],
      ['Manage workload spikes', 'Back flare-ups often follow sudden increases in lifting, sitting, running, stress, poor sleep, or unfamiliar tasks. Review the week before symptoms appeared. The answer is often not one bad rep but too much total stress too quickly.'],
      ['Know when to get assessed', 'Seek qualified care if pain follows trauma, includes numbness or weakness, affects bladder or bowel control, worsens at night, or does not improve with sensible modification. Coaching and clinical care can work together when symptoms need more support.']
    ],
    refs: ['whoActivity', 'acsmProgression']
  },
  {
    file: 'blog-shoulder-mobility-strength.html',
    title: 'Shoulder Mobility and Strength - Press Without Pain',
    category: 'Rehabilitation',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-mobility-injury-prevention-photo.jpg',
    alt: 'Athlete using mobility tools for joint preparation',
    description: 'A shoulder guide for improving pressing, rows, warm-ups, scapular control, and workload decisions.',
    intro: 'Shoulder pain often leads people to either stop upper-body training completely or push through every warning sign. A better approach is to adjust range, load, exercise selection, and weekly volume while rebuilding control.',
    sections: [
      ['Check the pattern first', 'Pain during pressing can come from load, range, grip, elbow position, fatigue, or exercise choice. Before blaming your shoulder, test simpler variations: push-up handles, landmine press, neutral-grip dumbbell press, cable press, or machine press. The right variation can keep training productive.'],
      ['Train pulling quality', 'Rows, pulldowns, face pulls, carries, and rear delt work support shoulder capacity when performed with control. Pulling is not a cure-all, but many programs are press-heavy and underdose upper-back work. Balance matters.'],
      ['Use warm-ups that transfer', 'Band pull-aparts, scapular push-ups, wall slides, light rows, and ramp-up pressing sets prepare the joint better than random stretching. A warm-up should make the first working set feel smoother, not exhaust the shoulder before training starts.'],
      ['Respect volume limits', 'Shoulders often react to total weekly pressing volume, not one set. Bench press, overhead press, dips, push-ups, and even some machine work all count. If symptoms rise, reduce total pressing exposure and rebuild gradually.'],
      ['Escalate when needed', 'If pain is sharp, persistent, affects sleep, causes weakness, or limits daily tasks, get assessed. Training modifications are useful, but they are not a substitute for clinical evaluation when symptoms are significant.']
    ],
    refs: ['acsmProgression', 'whoActivity']
  },
  {
    file: 'blog-travel-fitness.html',
    title: 'Travel Fitness - Stay Consistent Without a Gym',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-home-workouts-busy-photo.jpg',
    alt: 'Home workout setup with dumbbells and exercise mat',
    description: 'A travel fitness system for hotel rooms, busy schedules, restaurant meals, steps, and flexible expectations.',
    intro: 'Travel does not need to erase progress. The goal is not to train perfectly on the road. The goal is to preserve the identity of being consistent while adapting to equipment, sleep, food, and schedule changes.',
    sections: [
      ['Define the travel minimum', 'Before leaving, decide the minimum that counts: two bodyweight sessions, a step target, protein at breakfast, and water with meals. A realistic minimum prevents the all-or-nothing pattern that turns one missed gym session into a week off.'],
      ['Pack simple tools', 'Resistance bands, a skipping rope, or a suspension trainer can expand options, but bodyweight is enough. Squats, split squats, push-ups, hip hinges, rows with bands, planks, and carries with luggage can maintain momentum. Keep sessions short and repeatable.'],
      ['Use steps as the foundation', 'Travel often includes walking opportunities. Airport walks, city exploring, hotel stairs, and short post-meal walks can support energy balance and digestion. Steps are usually easier to recover from than hard workouts after poor sleep.'],
      ['Handle restaurant meals simply', 'Choose protein first, add vegetables or fruit, then pick the carbohydrate or fat source you actually want. Avoid trying to make every meal perfect. The win is reducing damage while enjoying the trip.'],
      ['Restart fast when home', 'Plan the first normal workout before you return. Do not punish yourself for travel. Resume the program at slightly reduced loads if sleep was poor, then build back over the week.']
    ],
    refs: ['whoActivity', 'whoDiet', 'lallyHabits']
  },
  {
    file: 'blog-vegetarian-muscle.html',
    title: 'Vegetarian Muscle Gain - Protein Without Guesswork',
    category: 'Nutrition',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-fat-loss-nutrition-photo.jpg',
    alt: 'Meal prep containers with vegetables and balanced nutrition',
    description: 'A vegetarian muscle gain guide covering protein quality, meal planning, calories, supplements, and training support.',
    intro: 'Vegetarian muscle gain is absolutely possible, but it rewards planning. The main challenges are total protein, protein quality, calories, convenience, and digestion. Solve those and training can progress normally.',
    sections: [
      ['Hit total protein first', 'Vegetarian clients should build meals around protein sources: Greek yogurt, eggs if included, cottage cheese, tofu, tempeh, seitan, lentils, beans, soy milk, edamame, and protein powder. Do not rely on small incidental protein from grains alone if muscle gain is the goal.'],
      ['Use complementary foods', 'Different plant proteins have different amino acid profiles. Variety across the day helps. Soy foods are especially useful because they are protein-dense. Combining legumes, grains, dairy, eggs, or protein powder makes targets easier without overloading one food.'],
      ['Eat enough calories', 'High-fibre diets can be filling, which is helpful for health but sometimes challenging for muscle gain. Add calorie-dense foods such as olive oil, avocado, nuts, dried fruit, granola, rice, pasta, and smoothies when body weight and performance are not moving.'],
      ['Support hard training', 'Muscle gain still requires progressive overload. Track lifts, sets, reps, and body weight trend. If training performance is flat and soreness is high, review sleep and total calories before blaming vegetarian eating.'],
      ['Consider practical supplements', 'Creatine monohydrate and protein powder can be useful for vegetarian lifters. B12, vitamin D, iron, omega-3, and iodine may also matter depending on food choices and bloodwork. Supplement decisions should match individual needs, not marketing.']
    ],
    refs: ['issnProtein', 'proteinMeta', 'issnCreatine', 'whoDiet']
  },
  {
    file: 'blog-alcohol-fat-loss.html',
    title: 'Alcohol and Fat Loss - How to Stay in Control',
    category: 'Nutrition',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-fat-loss-nutrition-photo.jpg',
    alt: 'Prepared meals representing planned nutrition choices',
    description: 'A realistic guide to alcohol, calories, sleep, appetite, training recovery, and social flexibility during fat loss.',
    intro: 'Alcohol does not make fat loss impossible, but it makes the system harder. It adds calories, can reduce sleep quality, lowers inhibition around food, and often affects the next day of movement and training.',
    sections: [
      ['Count the real cost', 'The drink itself is only part of the equation. Mixers, late-night food, skipped workouts, poor sleep, and next-day cravings can matter more than the alcohol calories alone. Track the whole pattern honestly before deciding what needs to change.'],
      ['Plan the social meal', 'If you know drinks are part of the evening, build the day around protein, vegetables, hydration, and a realistic calorie buffer. Avoid starving all day, because that usually backfires. Arrive fed enough to make choices, not desperate.'],
      ['Set drink rules before drinking', 'Decision quality drops as alcohol increases. Decide your limit, drink type, and food plan before the event. Alternate with water, avoid high-calorie mixers when possible, and choose a stopping point that protects tomorrow.'],
      ['Protect sleep and training', 'If sleep is disrupted, adjust the next workout. Do not force a max-effort session to compensate. Walk, hydrate, eat protein, and return to normal. The fastest recovery is returning to the plan, not punishing yourself.'],
      ['Know your non-negotiables', 'Some goals require stricter alcohol boundaries, especially aggressive fat loss, competition prep, or health concerns. Other phases can allow moderate flexibility. The right rule is the one that matches the goal and your honest behavior pattern.']
    ],
    refs: ['whoDiet', 'cdcSleep', 'lallyHabits']
  },
  {
    file: 'blog-stress-eating-control.html',
    title: 'Stress Eating - Build Control Without Shame',
    category: 'Mindset',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-habits-mindset-photo.jpg',
    alt: 'Workout planning setup for building better habits',
    description: 'A compassionate system for stress eating: triggers, environment, protein anchors, emotional regulation, and recovery.',
    intro: 'Stress eating is not a character flaw. It is a coping pattern. The solution is not more shame; it is building better defaults before stress peaks and having a restart process after difficult moments.',
    sections: [
      ['Find the trigger pattern', 'Look for timing, emotion, environment, and food type. Is it late work? Conflict? Boredom? Restriction during the day? Once the pattern is visible, you can design a specific solution instead of relying on vague willpower.'],
      ['Eat enough earlier', 'Many evening binges begin with under-eating, low protein, or chaotic meals during the day. A protein-rich breakfast or lunch, planned snack, and enough carbohydrates can reduce the intensity of night cravings. Structure beats white-knuckling hunger.'],
      ['Change the environment', 'Keep trigger foods in smaller portions or outside the house during high-stress periods. Put easier choices in sight. This is not about banning foods forever. It is about not asking a tired brain to make heroic decisions every night.'],
      ['Build a pause routine', 'Before eating from stress, use a two-minute interruption: water, breathing, short walk, shower, journaling, or texting accountability. If you still choose the food, portion it intentionally. The pause creates space for choice.'],
      ['Restart quickly', 'One overeating episode does not ruin progress. The damage usually comes from the shame spiral afterward. Return to normal meals, hydration, steps, and training. Do not compensate with extreme restriction, because that often recreates the same cycle.']
    ],
    refs: ['lallyHabits', 'bctTaxonomy', 'cdcSleep']
  },
  {
    file: 'blog-workout-tracking.html',
    title: 'Workout Tracking - The Logbook System That Works',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-habits-mindset-photo.jpg',
    alt: 'Fitness planning setup with notebook and training equipment',
    description: 'How to track workouts without overcomplication: exercises, sets, reps, load, effort, recovery, and decisions.',
    intro: 'A training log turns effort into information. Without tracking, it is easy to confuse feeling tired with making progress. The logbook does not need to be complex; it needs to show what to do next.',
    sections: [
      ['Track the basics', 'Record exercise, sets, reps, load, and a simple effort rating. Add notes only when they change future decisions: pain, form issue, poor sleep, or equipment change. Too much detail can make tracking harder to sustain.'],
      ['Use progression rules', 'Decide what earns a load increase before the session starts. For example, when all sets hit the top of the rep range with stable technique, increase weight next time. Clear rules reduce emotional decisions and ego lifting.'],
      ['Review trends weekly', 'Look for patterns across weeks. Are key lifts improving? Is soreness manageable? Are you missing the same session? Is one exercise always painful? A weekly review turns the log into coaching information.'],
      ['Track recovery context', 'Sleep, stress, nutrition, and steps explain performance. If a lift drops after poor sleep and low food, the program may not be broken. Context prevents unnecessary changes and helps you identify the real limiter.'],
      ['Keep it simple enough to repeat', 'The best tracking system is the one you use. Notes app, spreadsheet, training app, or paper notebook can all work. The goal is better decisions, not a perfect archive.']
    ],
    refs: ['acsmProgression', 'lallyHabits', 'whoActivity']
  },
  {
    file: 'blog-warm-up-guide.html',
    title: 'The 10 Minute Warm-Up Guide for Better Training',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-mobility-injury-prevention-photo.jpg',
    alt: 'Mobility tools and warm-up setup before training',
    description: 'A simple warm-up system for strength training: temperature, mobility, activation, ramp-up sets, and readiness checks.',
    intro: 'A good warm-up is not random stretching. It prepares the specific workout ahead, improves confidence in the first working sets, and helps you notice whether the plan needs adjusting.',
    sections: [
      ['Raise temperature first', 'Start with three to five minutes of easy cardio, walking, cycling, rowing, or dynamic movement. The goal is to feel warmer, not tired. This prepares the body without stealing energy from the session.'],
      ['Mobilize what you need', 'Choose mobility based on the first lift. Squats may need ankles, hips, and trunk. Pressing may need shoulders and upper back. Hinges may need hamstrings and hip control. Avoid turning the warm-up into a separate workout.'],
      ['Activate with purpose', 'Activation drills should improve the lift, not create fatigue. Glute bridges, band rows, dead bugs, lateral walks, and scapular push-ups can be useful when matched to the session. If a drill does not change movement quality, remove it.'],
      ['Use ramp-up sets', 'The best warm-up for a lift is often lighter versions of the lift. Gradually increase load while keeping reps low. Ramp-up sets build skill and reveal readiness. If the ramp-up feels unusually bad, adjust the work sets.'],
      ['Keep it repeatable', 'Most lifters need a reliable ten-minute template, not thirty minutes of complexity. A warm-up should make training better and easier to start. If it becomes a barrier, simplify it.']
    ],
    refs: ['acsmProgression', 'whoActivity']
  },
  {
    file: 'blog-cardio-strength-balance.html',
    title: 'Cardio and Strength - How to Balance Both',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/marathon-training-plans.jpg',
    alt: 'Runner training plan representing cardio and strength balance',
    description: 'A guide to combining cardio and strength training without losing muscle, performance, or recovery.',
    intro: 'You do not need to choose between strength and cardio. Most clients need both. The challenge is arranging them so endurance supports health without interfering with lifting progress and recovery.',
    sections: [
      ['Decide the priority', 'If muscle gain is the priority, strength sessions should get the freshest energy. If a race is the priority, key runs come first. When everything is treated as equally important, recovery often becomes the limiting factor.'],
      ['Use mostly easy cardio', 'Easy cardio improves aerobic fitness with lower recovery cost. Walking, cycling, incline treadmill, and easy runs can support heart health and fat loss without crushing legs. Keep hard intervals limited and intentional.'],
      ['Separate hard sessions when possible', 'Heavy lower body lifting and intense running intervals compete for recovery. Separate them by a day when possible, or put the priority session first. If scheduling forces same-day work, keep the second session easier.'],
      ['Fuel the work', 'Carbohydrates support high-intensity training, protein supports recovery, and total calories determine whether the body has enough resources. Low calories plus high cardio plus hard lifting is a common recipe for fatigue.'],
      ['Watch performance markers', 'If lifts drop, resting fatigue rises, soreness lingers, and motivation falls, reduce either cardio intensity or lifting volume. The best balance is the one that improves health while preserving the main goal.']
    ],
    refs: ['whoActivity', 'acsmProgression', 'issnProtein']
  },
  {
    file: 'blog-client-check-ins.html',
    title: 'Weekly Check-Ins - The Accountability System That Changes Results',
    category: 'Mindset',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-habits-mindset-photo.jpg',
    alt: 'Laptop and workout planning setup for weekly fitness check-ins',
    description: 'How weekly coaching check-ins turn data, honesty, and adjustments into better training and nutrition outcomes.',
    intro: 'A weekly check-in is where coaching becomes specific. It turns body weight, photos, training logs, hunger, energy, stress, and adherence into the next best decision. Without check-ins, people often change plans based on emotion.',
    sections: [
      ['Review the right data', 'A useful check-in includes weekly weight average, waist, photos, training performance, steps, sleep, hunger, and adherence. No single metric tells the whole story. The pattern across metrics tells the coach what to adjust.'],
      ['Separate effort from outcome', 'Sometimes effort is high and the outcome needs more time. Sometimes the outcome is flat because the plan was not followed. Honest check-ins separate these situations without blame. That clarity protects motivation and improves decisions.'],
      ['Make one or two changes', 'Changing calories, training, cardio, sleep, and supplements all at once makes it impossible to know what worked. A good check-in usually produces one or two precise changes. Small adjustments compound when reviewed consistently.'],
      ['Use check-ins for obstacles', 'Travel, stress, pain, social events, and low motivation should be discussed before they become excuses. The point of coaching is not to judge obstacles; it is to design around them.'],
      ['Build trust through consistency', 'The check-in habit teaches clients to report honestly and restart quickly. That skill matters after coaching too. Accountability is not dependency when it teaches better self-coaching.']
    ],
    refs: ['bctTaxonomy', 'lallyHabits', 'whoActivity']
  },
  {
    file: 'blog-menopause-strength.html',
    title: 'Menopause Strength Training - Muscle, Bone, and Confidence',
    category: 'Training',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-womens-strength-hormones-photo.jpg',
    alt: 'Woman strength training with a barbell in a gym',
    description: 'A menopause-focused strength guide covering resistance training, protein, recovery, bone loading, and symptom-aware programming.',
    intro: 'Menopause changes the conversation around training, but it does not remove the ability to get stronger. Strength work, protein, sleep support, and smart recovery become even more valuable when body composition, energy, and symptoms feel less predictable.',
    sections: [
      ['Lift with intent', 'Resistance training should be challenging enough to maintain or build muscle. Machines, dumbbells, cables, kettlebells, and barbells can all work. The exercise choice should fit joints, confidence, and access. The effort still needs to be real.'],
      ['Include bone-loading patterns', 'Squats, hinges, carries, step-ups, and impact as tolerated can support bone and physical capacity. The right level depends on history and symptoms. Start where movement feels safe, then progress gradually.'],
      ['Protein becomes non-negotiable', 'Consistent protein supports muscle retention, recovery, and satiety. Many women under-eat protein while trying to control weight. Build meals around protein first, then adjust calories based on the goal.'],
      ['Respect recovery and sleep', 'Hot flushes, stress, and sleep disruption can reduce training tolerance. This does not mean avoiding hard work; it means adjusting volume during poor recovery periods. A sustainable plan flexes without disappearing.'],
      ['Measure strength and function', 'Track lifts, energy, waist, photos, sleep, symptoms, and daily confidence. Scale weight alone can be misleading. The goal is a body that feels capable, strong, and resilient.']
    ],
    refs: ['whoActivity', 'issnProtein', 'acogExercise', 'acsmProgression']
  },
  {
    file: 'blog-busy-parent-fitness.html',
    title: 'Busy Parent Fitness - Build Results Around Real Life',
    category: 'Mindset',
    date: 'Updated June 2026',
    image: 'assets/images/blog/preview-home-workouts-busy-photo.jpg',
    alt: 'Home workout setup for busy schedules',
    description: 'A realistic fitness system for parents balancing training, nutrition, sleep disruption, work, and family routines.',
    intro: 'Busy parents do not need a perfect fitness plan. They need a plan that survives interruptions. The winning system is shorter, clearer, more flexible, and built around the parts of the week that actually exist.',
    sections: [
      ['Use minimum effective training', 'Three focused sessions of thirty to forty-five minutes can work. If that is not possible, use two strength sessions plus short home workouts. The goal is enough stimulus to progress without creating stress that the family schedule cannot absorb.'],
      ['Prep the default meals', 'Parents often eat leftovers, snacks, or whatever is available. Create two default breakfasts, two lunches, and one emergency dinner that hit protein and vegetables. Defaults reduce decision fatigue when the day becomes chaotic.'],
      ['Train around sleep reality', 'Poor sleep changes recovery and hunger. On rough nights, keep the habit but reduce intensity. Walk, lift lighter, or complete a shorter session. Consistency during imperfect weeks is the skill that protects long-term progress.'],
      ['Make family movement count', 'Walks, playground time, bike rides, and active chores all support health and energy expenditure. They may not replace strength training, but they reduce the pressure to solve everything in the gym.'],
      ['Drop guilt-based standards', 'A parent plan must be flexible. Missing a session because a child is sick is not failure. The plan should include restart rules, not shame. Progress comes from returning quickly.']
    ],
    refs: ['whoActivity', 'lallyHabits', 'cdcSleep', 'whoDiet']
  }
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const playbooks = {
  Training: {
    summary: 'Training advice is built around progressive overload, stable technique, recovery, and a plan that fits real weekly schedules.',
    plan: [
      'Choose the smallest weekly schedule you can repeat for four weeks.',
      'Track sets, reps, load, effort, and one recovery marker after each session.',
      'Increase only one variable at a time: reps, load, sets, or session density.',
      'Review progress every Sunday and adjust the next week before motivation becomes the plan.'
    ],
    checklist: [
      'Warm up the exact movement patterns you will train.',
      'Keep most working sets one to three reps away from technical failure.',
      'Stop or regress any movement that creates sharp, radiating, or worsening pain.',
      'Use photos, measurements, and performance logs instead of relying on feelings alone.'
    ],
    faqs: [
      ['How many days per week should I train?', 'Most people progress well with three to four focused sessions per week when the plan is consistent and recoverable.'],
      ['Should I change exercises often?', 'Keep the main patterns stable for four to six weeks so technique and progression can be measured.'],
      ['What if I miss a session?', 'Do the next planned session and keep the week moving. One missed workout should not become a full reset.']
    ]
  },
  Nutrition: {
    summary: 'Nutrition guidance prioritizes energy balance, protein, food quality, adherence, and simple systems that survive busy weeks.',
    plan: [
      'Pick two repeatable breakfasts or lunches that include protein and fibre.',
      'Track normal intake for a few days before making aggressive changes.',
      'Create one planned flexible meal so social life does not break the plan.',
      'Review weekly averages instead of reacting to one scale reading.'
    ],
    checklist: [
      'Include a protein source at most meals.',
      'Use vegetables, fruit, potatoes, oats, legumes, and lean proteins to manage hunger.',
      'Audit oils, sauces, drinks, and snacks before cutting full meals.',
      'Keep nutrition changes compatible with training performance and sleep.'
    ],
    faqs: [
      ['Do I need to cut carbs?', 'No. Fat loss depends on a sustainable calorie deficit. Carbohydrates can support training when portions fit the goal.'],
      ['Is meal timing important?', 'Timing matters less than total intake, protein, and consistency, but it should help hunger and training performance.'],
      ['Should I use supplements?', 'Use supplements only to solve a specific gap. Food quality, calories, protein, sleep, and training come first.']
    ]
  },
  Rehabilitation: {
    summary: 'Mobility and injury-prevention content is educational and should support, not replace, qualified assessment when pain or symptoms persist.',
    plan: [
      'Identify the movement or workload that usually triggers symptoms.',
      'Reduce range, load, or volume while keeping pain-free activity in the week.',
      'Add controlled strength through the range you can own.',
      'Seek professional guidance when symptoms change gait, daily life, or keep returning.'
    ],
    checklist: [
      'Warm up gradually instead of jumping into heavy or fast work cold.',
      'Avoid changing exercise, volume, intensity, and equipment all in the same week.',
      'Use discomfort as information, not as a test of toughness.',
      'Build capacity with consistent submaximal work before chasing intensity.'
    ],
    faqs: [
      ['Is soreness the same as injury?', 'No. Normal soreness usually fades and does not change movement. Sharp, worsening, or radiating pain deserves caution.'],
      ['Should I stretch every day?', 'Stretching can help, but strength and workload management usually matter more for long-term capacity.'],
      ['When should I see a clinician?', 'Get assessed if pain affects daily life, changes movement, includes numbness, or keeps returning.']
    ]
  },
  Health: {
    summary: 'Recovery content connects sleep, stress, nutrition, and training load so progress is built instead of forced.',
    plan: [
      'Set a realistic sleep window before adding more training volume.',
      'Use one low-stress recovery habit after evening meals.',
      'Reduce training dose during unusually stressful weeks instead of quitting entirely.',
      'Review energy, mood, soreness, and performance together.'
    ],
    checklist: [
      'Protect a consistent sleep opportunity most nights.',
      'Avoid using caffeine to cover chronic sleep debt.',
      'Fuel hard training with enough protein and total energy.',
      'Schedule lighter weeks before performance and motivation crash.'
    ],
    faqs: [
      ['How do I know I need more recovery?', 'Look for several signals at once: worse sleep, low mood, persistent soreness, falling performance, and unusual fatigue.'],
      ['Is a deload the same as stopping?', 'No. A deload keeps the habit while reducing volume or intensity so the body can absorb the work.'],
      ['Can stress affect fat loss or muscle gain?', 'Yes. Stress can reduce sleep, increase hunger, and lower training quality, which indirectly affects results.']
    ]
  },
  Mindset: {
    summary: 'Mindset content focuses on behavior design: small actions, environment, tracking, accountability, and quick restarts.',
    plan: [
      'Define the minimum version of your week before adding ambition.',
      'Attach one new habit to a routine that already happens daily.',
      'Track controllable behaviors before judging body composition outcomes.',
      'Build a restart rule for travel, work stress, low energy, and missed sessions.'
    ],
    checklist: [
      'Make the first five minutes of the habit almost frictionless.',
      'Keep proof of progress visible: logs, photos, measurements, or check-ins.',
      'Use accountability to adjust the plan, not to create shame.',
      'Treat missed days as data, not identity.'
    ],
    faqs: [
      ['What if I lose motivation?', 'Expect motivation to fluctuate. Use a minimum action and a planned schedule so the habit does not depend on mood.'],
      ['How long does habit change take?', 'It varies by person and behavior. Repetition, context, and low friction matter more than a magic number of days.'],
      ['Should I track everything?', 'Track the few behaviors that drive your goal. Too much tracking can become noise if it does not change decisions.']
    ]
  }
};

function readingMinutes(post) {
  const words = [
    post.title,
    post.description,
    post.intro,
    ...post.sections.flat(),
    ...(playbooks[post.category]?.plan || []),
    ...(playbooks[post.category]?.checklist || [])
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
            <span>Coach Andre note</span>
            <p>I wrote this for real people with busy weeks, not perfect conditions. Start with &quot;${esc(firstAction)}&quot;, keep the plan measurable, and let consistency beat intensity.</p>
          </div>
        </aside>`;
}

function renderTakeaways(post) {
  return post.sections.slice(0, 3).map(([heading]) => `          <li>${esc(heading)}</li>`).join('\n');
}

function renderTableOfContents(post) {
  const items = post.sections.map(([heading]) => `          <li><a href="#${esc(slugify(heading))}">${esc(heading)}</a></li>`).join('\n');
  return `        <nav class="blog-toc" aria-label="Article sections">
          <span>In this guide</span>
          <ol>
${items}
            <li><a href="#weekly-implementation">7-day implementation plan</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#references">References</a></li>
          </ol>
        </nav>`;
}

function renderEvidenceSnapshot(post) {
  const playbook = playbooks[post.category] || playbooks.Training;
  const citationCards = post.refs.slice(0, 3).map((key) => {
    const [label, url] = refs[key];
    return `          <a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
  }).join('\n');

  return `        <section class="blog-evidence-panel" aria-label="Evidence and coaching context">
          <div>
            <span>Evidence snapshot</span>
            <p>${esc(playbook.summary)}</p>
          </div>
          <div class="blog-evidence-links">
${citationCards}
          </div>
        </section>`;
}

function renderImplementationPlan(post) {
  const playbook = playbooks[post.category] || playbooks.Training;
  return `        <section class="blog-implementation" id="weekly-implementation">
          <h2>How to apply this in the next 7 days</h2>
          <div class="blog-step-grid">
${playbook.plan.map((step, index) => `            <div class="blog-step-card">
              <span>Day ${index + 1}${index === 3 ? '-7' : ''}</span>
              <p>${esc(step)}</p>
            </div>`).join('\n')}
          </div>
        </section>`;
}

function renderCoachChecklist(post) {
  const playbook = playbooks[post.category] || playbooks.Training;
  return `        <section class="blog-checklist" aria-label="Coach checklist">
          <h2>Coach checklist</h2>
          <ul>
${playbook.checklist.map((item) => `            <li>${esc(item)}</li>`).join('\n')}
          </ul>
        </section>`;
}

function renderFaqSection(post) {
  const playbook = playbooks[post.category] || playbooks.Training;
  return `        <section class="blog-faq" id="faq">
          <h2>FAQ</h2>
${playbook.faqs.map(([question, answer]) => `          <details>
            <summary>${esc(question)}</summary>
            <p>${esc(answer)}</p>
          </details>`).join('\n')}
        </section>`;
}

function relatedPosts(post) {
  const sameCategory = posts.filter((candidate) => candidate.file !== post.file && candidate.category === post.category);
  const otherCategory = posts.filter((candidate) => candidate.file !== post.file && candidate.category !== post.category);
  return [...sameCategory, ...otherCategory].slice(0, 3);
}

function renderRelatedArticles(post) {
  return `        <section class="blog-related" aria-label="Related articles">
          <h2>Read next</h2>
          <div class="blog-related-grid">
${relatedPosts(post).map((item) => `            <a class="blog-related-card" href="${esc(item.file)}">
              <span>${esc(item.category)}</span>
              <strong>${esc(item.title)}</strong>
              <small>${esc(item.description)}</small>
            </a>`).join('\n')}
          </div>
        </section>`;
}

function renderReferences(post) {
  return post.refs.map((key) => {
    const [label, url] = refs[key];
    return `        <li>${esc(label)} <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></li>`;
  }).join('\n');
}

function renderJsonLd(post, minutes) {
  const playbook = playbooks[post.category] || playbooks.Training;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: `https://garciabuilder.fitness/${post.image}`,
    author: {
      '@type': 'Person',
      name: 'Andre Julio Garcia',
      url: 'https://garciabuilder.fitness/about.html'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Garcia Builder',
      logo: {
        '@type': 'ImageObject',
        url: 'https://garciabuilder.fitness/Logo%20Files/For%20Web/logo-nobackground-500.png'
      }
    },
    mainEntityOfPage: `https://garciabuilder.fitness/${post.file}`,
    dateModified: '2026-06-25',
    timeRequired: `PT${minutes}M`,
    citation: post.refs.map((key) => refs[key][1])
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: playbook.faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };

  return JSON.stringify([articleSchema, faqSchema], null, 2);
}

function renderPost(post) {
  const sections = post.sections.map(([heading, text]) => `        <h2 id="${esc(slugify(heading))}">${esc(heading)}</h2>\n        <p>${esc(text)}</p>`).join('\n\n');
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
  <link rel="stylesheet" href="css/components/navbar-component.css?v=20260626">
  <link rel="stylesheet" href="css/global.css?v=20251025">
  <link rel="stylesheet" href="css/components/enhanced-navbar.css?v=20251025">
  <link rel="stylesheet" href="css/blog-article.css?v=20260626">
  <script src="js/utils/component-loader-v3-simplified.js?v=20251029"></script>
  <script src="js/tracking/conversion-tracking.js?v=20251025"></script>
  <script defer src="js/tracking/ads-loader.js?v=20251025"></script>
  <script defer src="js/tracking/ads-config.js?v=20251025"></script>
  <script defer src="js/tracking/cta-tracking.js?v=20251112"></script>
  <script type="application/ld+json">
${renderJsonLd(post, minutes)}
  </script>
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
        <figure class="blog-article-figure">
          <img class="blog-article-image" src="${esc(post.image)}" alt="${esc(post.alt)}" loading="eager" decoding="async">
          <figcaption>${esc(post.alt)}. Editorial image selected for Garcia Builder education.</figcaption>
        </figure>
      </header>
      <div class="blog-article-content">
        <div class="blog-quick-take">
          <span>Quick take</span>
          <ul>
${renderTakeaways(post)}
          </ul>
        </div>

${renderTableOfContents(post)}

${renderCoachNote(post)}

${renderEvidenceSnapshot(post)}

${sections}

${renderImplementationPlan(post)}

${renderCoachChecklist(post)}

        <div class="blog-article-callout">
          <strong>Garcia Builder value:</strong> simple structure, honest feedback, and weekly accountability. Use this article as education, not individual medical care. If you have pain, a diagnosed condition, pregnancy considerations, medication interactions, or a history of injury, get clearance from a qualified professional before changing training or nutrition.
        </div>

${renderFaqSection(post)}

        <h2 id="references">References</h2>
        <ol>
${renderReferences(post)}
        </ol>

${renderRelatedArticles(post)}

        <div class="blog-article-actions">
          <a class="blog-article-button" href="https://calendly.com/andrenjulio072/consultation" target="_blank" rel="noopener"><i class="fas fa-dumbbell" aria-hidden="true"></i> Build My Plan With Andre</a>
          <a class="blog-article-button secondary" href="blog.html"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to Blog</a>
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
