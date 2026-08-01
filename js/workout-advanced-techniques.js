(function (root, factory) {
  const templates = factory();
  if (typeof module === 'object' && module.exports) module.exports = templates;
  if (root) root.GB_ADVANCED_WORKOUT_TEMPLATES = templates;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  return [
    {
      name: 'Cluster Strength System',
      project: 'strength-reset',
      keywords: 'cluster sets intra set rest velocity squat bench deadlift power clean advanced strength',
      goal: 'strength muscle',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A high-quality strength block using intra-set rest to preserve bar speed and technique under heavy loads.',
      bestFor: 'experienced lifters building force without repeated grinders',
      equipment: 'rack, barbell, plates, pull-up bar and sled',
      split: 'Lower cluster, upper cluster, hinge and pull cluster, then total-body power.',
      focus: 'Clustered compound sets, low velocity loss, crisp Olympic-lift derivatives and heavy carries.',
      progression: 'Add load only when every mini-set stays fast; deload after three loading weeks.',
      note: 'Cluster notation such as 2+2+2 means short intra-set rests between mini-sets. End the set if bar path or speed deteriorates.',
      sessions: [
        {
          title: 'Day 1 - Lower Cluster Strength',
          meta: '70 minutes. Complete two to four progressive warm-up sets before the clusters.',
          exercises: [
            ['Back squat cluster', '4', '2+2+2', '20 sec intra / 3 min between', 'Use about a 5-6RM load; every double must stay technically identical.'],
            ['Paused front squat', '3', '4', '2 min', 'Pause for 2 seconds without relaxing the brace.'],
            ['Barbell Romanian deadlift', '3', '6-8', '2 min', 'Control the eccentric and keep the bar close.'],
            ['Heavy sled push', '6', '20 m', '75 sec', 'Powerful steps; stop before speed falls sharply.']
          ]
        },
        {
          title: 'Day 2 - Upper Cluster Strength',
          meta: '65-75 minutes. Preserve shoulder position and bar speed.',
          exercises: [
            ['Bench press cluster', '4', '2+2+2', '20 sec intra / 3 min between', 'Use a strong setup and pause the first rep of each mini-set.'],
            ['Weighted pull-up cluster', '4', '2+2+2', '20 sec intra / 2 min between', 'Start every rep from a controlled hang.'],
            ['Half-kneeling landmine press', '3', '8/side', '75 sec', 'Resist trunk rotation while pressing forward.'],
            ['Seal row', '3', '8-10', '90 sec', 'Pull explosively and lower under control.']
          ]
        },
        {
          title: 'Day 3 - Hinge and Pull Cluster',
          meta: '70 minutes. Keep deadlift volume low enough that every repetition is decisive.',
          exercises: [
            ['Deadlift cluster', '5', '1+1+1', '20 sec intra / 3 min between', 'Reset completely; do not touch-and-go.'],
            ['Pendlay row', '4', '5-6', '2 min', 'Each rep begins motionless on the floor.'],
            ['Deficit reverse lunge', '3', '7/side', '90 sec', 'Use a controlled depth and stable pelvis.'],
            ['Suitcase carry', '4', '35 m/side', '60 sec', 'Walk tall without leaning toward the load.']
          ]
        },
        {
          title: 'Day 4 - Total-Body Power',
          meta: '60-70 minutes. Use qualified coaching for the clean variation.',
          exercises: [
            ['Hang power clean', '6', '2', '2 min', 'Fast turnover; use a clean high pull if catch skill is limited.'],
            ['Push press cluster', '4', '2+2', '20 sec intra / 2 min between', 'Dip vertically and finish with a stable lockout.'],
            ['Trap-bar jump', '5', '3', '75 sec', 'Use a light load and land quietly with full control.'],
            ['Backward sled drag', '6', '25 m', '60 sec', 'Continuous steps and upright posture.']
          ]
        }
      ]
    },
    {
      name: 'Rest-Pause Hypertrophy Lab',
      project: 'muscle-build-pro',
      keywords: 'rest pause hypertrophy intensification advanced bodybuilding upper lower machines',
      goal: 'muscle strength',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'Upper/lower hypertrophy with controlled rest-pause finishers on stable exercises.',
      bestFor: 'experienced lifters needing more effective reps without longer sessions',
      equipment: 'full gym with cables and selectorized machines',
      split: 'Upper push, lower quad, upper pull and lower posterior-chain sessions.',
      focus: 'Straight-set compounds followed by one carefully selected rest-pause exercise per muscle group.',
      progression: 'Progress activation-set reps first, then mini-set reps, before adding a small load.',
      note: 'Rest-pause work is reserved for stable machine or isolation exercises. Keep compound barbell lifts as straight sets and stop mini-sets when technique changes.',
      sessions: [
        {
          title: 'Day 1 - Upper Push Rest-Pause',
          meta: '65 minutes. RP = activation set, 20 seconds rest, then three mini-sets.',
          exercises: [
            ['Incline barbell press', '4', '6-8', '2 min', 'Finish with 1-2 reps in reserve.'],
            ['Machine chest press RP', '1', '12-15 + 4+4+4', '20 sec mini-rests', 'Use the same load and stop before range shortens.'],
            ['Cable lateral raise RP', '1', '15-20 + 5+5+5', '20 sec mini-rests', 'Keep traps quiet and motion controlled.'],
            ['Overhead cable triceps extension', '3', '10-14', '60 sec', 'Keep upper arms fixed.']
          ]
        },
        {
          title: 'Day 2 - Quad Intensification',
          meta: '70 minutes. Do not use rest-pause on the free-weight squat.',
          exercises: [
            ['High-bar back squat', '4', '5-7', '2-3 min', 'Repeat the same depth on every rep.'],
            ['Hack squat', '3', '8-10', '2 min', 'Controlled bottom position.'],
            ['Leg extension RP', '1', '15-20 + 5+5+5', '20 sec mini-rests', 'Squeeze the top without swinging.'],
            ['Standing calf raise RP', '1', '12-15 + 4+4+4', '20 sec mini-rests', 'Use a complete stretch and pause.']
          ]
        },
        {
          title: 'Day 3 - Upper Pull Rest-Pause',
          meta: '65 minutes. Lead with heavy vertical pulling, then intensify stable rows.',
          exercises: [
            ['Weighted neutral-grip pull-up', '4', '5-7', '2 min', 'No kipping or shortened bottom position.'],
            ['Chest-supported row RP', '1', '12-15 + 4+4+4', '20 sec mini-rests', 'Keep chest connected to the pad.'],
            ['Reverse pec deck RP', '1', '15-20 + 5+5+5', '20 sec mini-rests', 'Move from the rear delts, not the lower back.'],
            ['Bayesian cable curl', '3', '10-14/side', '60 sec', 'Keep the shoulder behind the torso.']
          ]
        },
        {
          title: 'Day 4 - Posterior Chain Rest-Pause',
          meta: '70 minutes. Hinge work stays conventional; machines carry the intensification.',
          exercises: [
            ['Romanian deadlift', '4', '6-8', '2-3 min', 'Maintain lat tension and a controlled eccentric.'],
            ['Front-foot elevated split squat', '3', '8/side', '90 sec', 'Use a long stride and stable front foot.'],
            ['Seated leg curl RP', '1', '12-15 + 4+4+4', '20 sec mini-rests', 'Keep hips pinned to the pad.'],
            ['Hip extension machine RP', '1', '12-15 + 4+4+4', '20 sec mini-rests', 'Finish with glutes, not lumbar extension.']
          ]
        }
      ]
    },
    {
      name: 'Myo-Rep Specialization Cycle',
      project: 'muscle-build-pro',
      keywords: 'myo reps activation mini sets hypertrophy specialization advanced bodybuilding',
      goal: 'muscle',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '8 weeks',
      summary: 'A five-day specialization block using myo-rep activation sets and short mini-sets on isolation work.',
      bestFor: 'advanced physique trainees who understand proximity to failure',
      equipment: 'full gym, cables and machines',
      split: 'Upper base, lower base, back and delts, legs, then chest and arms.',
      focus: 'Moderate compound volume with targeted myo-rep work for high-quality local fatigue.',
      progression: 'Add one mini-set up to five, then increase load and return to three mini-sets.',
      note: 'Myo-reps use one near-failure activation set followed by 3-5 rep mini-sets with 15-20 seconds rest. Stop when the target mini-set cannot be completed cleanly.',
      sessions: [
        {
          title: 'Day 1 - Upper Base',
          meta: '60-70 minutes. Compounds establish tension before myo-rep accessories.',
          exercises: [
            ['Flat dumbbell press', '4', '6-9', '2 min', 'Keep 1-2 reps in reserve.'],
            ['Weighted chin-up', '4', '5-8', '2 min', 'Use full controlled range.'],
            ['Cable fly myo-reps', '1', '15-20 + 4x4', '20 sec', 'Keep the same arc on every mini-set.'],
            ['Cable lateral raise myo-reps', '1', '18-25 + 5x4', '15 sec', 'Stop if traps dominate.']
          ]
        },
        {
          title: 'Day 2 - Lower Base',
          meta: '65-75 minutes. Stable lower-body work with hamstring myo-reps.',
          exercises: [
            ['Safety-bar squat', '4', '6-8', '2-3 min', 'Brace before each descent.'],
            ['Barbell hip thrust', '4', '8-10', '2 min', 'Pause at full hip extension.'],
            ['Seated leg curl myo-reps', '1', '15-20 + 4x4', '20 sec', 'Keep hips down.'],
            ['Calf press myo-reps', '1', '15-20 + 5x5', '15 sec', 'Use full ankle range.']
          ]
        },
        {
          title: 'Day 3 - Back and Delts',
          meta: '55-65 minutes. Use straps if grip limits target-muscle work.',
          exercises: [
            ['Chest-supported T-bar row', '4', '8-10', '90 sec', 'Pause at peak contraction.'],
            ['One-arm lat pulldown myo-reps', '1', '14-18/side + 4x4', '20 sec', 'Drive elbow toward the hip.'],
            ['Reverse cable fly myo-reps', '1', '18-25 + 5x5', '15 sec', 'Keep shoulder blades controlled.'],
            ['Lean-away lateral raise myo-reps', '1', '15-20 + 5x4', '15 sec', 'Lead with the elbow.']
          ]
        },
        {
          title: 'Day 4 - Legs Specialization',
          meta: '65 minutes. Quad and adductor focus with stable equipment.',
          exercises: [
            ['Pendulum squat', '4', '8-10', '2 min', 'Use a deep controlled range.'],
            ['Deficit Bulgarian split squat', '3', '8/side', '90 sec', 'Keep pelvis level.'],
            ['Leg extension myo-reps', '1', '18-25 + 5x5', '15 sec', 'Do not swing through fatigue.'],
            ['Adductor machine myo-reps', '1', '15-20 + 4x5', '20 sec', 'Control the return.']
          ]
        },
        {
          title: 'Day 5 - Chest and Arms',
          meta: '55-65 minutes. Keep joint position strict across mini-sets.',
          exercises: [
            ['Incline machine press', '4', '8-10', '90 sec', 'Use a full pain-free range.'],
            ['Pec deck myo-reps', '1', '15-20 + 4x4', '20 sec', 'Maintain the same elbow angle.'],
            ['Bayesian curl myo-reps', '1', '15-20 + 4x4', '20 sec', 'No shoulder drift.'],
            ['Rope pressdown myo-reps', '1', '15-20 + 4x4', '20 sec', 'Reach full elbow extension cleanly.']
          ]
        }
      ]
    },
    {
      name: 'Eccentric Overload Builder',
      project: 'muscle-build-pro',
      keywords: 'eccentric overload flywheel slow negative tempo two up one down advanced hypertrophy',
      goal: 'muscle strength',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'An advanced upper/lower block emphasizing controlled eccentrics, long-length strength and optional flywheel work.',
      bestFor: 'experienced lifters with excellent positional control',
      equipment: 'full gym; flywheel optional',
      split: 'Upper eccentric, lower eccentric, upper long-length and lower long-length sessions.',
      focus: 'Three-to-five-second negatives, two-up-one-down machines and controlled flywheel deceleration.',
      progression: 'Increase load only when eccentric duration and range remain exact; reduce volume during week four.',
      note: 'Eccentric overload can create substantial soreness. Begin conservatively, avoid forced negatives without expert spotting and use a conventional alternative if no flywheel is available.',
      sessions: [
        {
          title: 'Day 1 - Upper Eccentric Strength',
          meta: '65 minutes. Use a 4-second lowering phase on the first three movements.',
          exercises: [
            ['Bench press 4-0-X tempo', '4', '5', '2-3 min', 'Lower for 4 seconds and press with intent.'],
            ['Weighted pull-up 4-1-X tempo', '4', '5', '2 min', 'Own the bottom position.'],
            ['One-arm eccentric machine press', '3', '6/side', '90 sec', 'Press with two arms, lower with one if equipment permits.'],
            ['Incline dumbbell curl 4-second negative', '3', '8-10', '75 sec', 'Keep the shoulder extended.']
          ]
        },
        {
          title: 'Day 2 - Lower Eccentric Strength',
          meta: '70 minutes. Maintain normal breathing and brace through the slow descent.',
          exercises: [
            ['Front squat 4-1-X tempo', '4', '5', '2-3 min', 'Keep elbows high throughout.'],
            ['Romanian deadlift 5-second negative', '4', '6', '2 min', 'Stop before spinal position changes.'],
            ['Two-up one-down leg press', '3', '6/side', '90 sec', 'Use both legs to press, one leg to lower slowly.'],
            ['Nordic hamstring eccentric', '4', '4-6', '90 sec', 'Use band assistance to control the full descent.']
          ]
        },
        {
          title: 'Day 3 - Upper Flywheel and Length',
          meta: '60-70 minutes. Substitute cables or machines if flywheel coaching is unavailable.',
          exercises: [
            ['Flywheel row or cable row eccentric', '4', '7-9', '90 sec', 'Decelerate smoothly in the final third.'],
            ['Incline dumbbell press 3-second negative', '4', '8', '90 sec', 'Keep tension in the stretched position.'],
            ['Lat prayer 4-second eccentric', '3', '10-12', '60 sec', 'Reach long without losing rib position.'],
            ['Overhead cable triceps extension', '3', '10-12', '60 sec', 'Control the lengthened position.']
          ]
        },
        {
          title: 'Day 4 - Lower Flywheel and Length',
          meta: '65-75 minutes. Expect high local fatigue with modest external load.',
          exercises: [
            ['Flywheel squat or tempo hack squat', '4', '7-9', '2 min', 'Accelerate up, then resist the return.'],
            ['Front-foot elevated split squat 4-second negative', '3', '7/side', '90 sec', 'Keep the front heel planted.'],
            ['Seated leg curl 2-up-1-down', '3', '7/side', '75 sec', 'Lower for 4 seconds.'],
            ['Long-length calf raise', '4', '8-12', '60 sec', 'Pause for 2 seconds in the stretch.']
          ]
        }
      ]
    },
    {
      name: 'Contrast Power Performance',
      project: 'athletic-performance',
      keywords: 'contrast training PAPE heavy light jump throw sprint advanced power',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'Heavy strength paired with biomechanically similar jumps, throws and sprints for advanced power development.',
      bestFor: 'trained athletes with established strength and landing skill',
      equipment: 'rack, barbell, medicine balls, boxes, sled and open space',
      split: 'Lower contrast, upper contrast, acceleration contrast and total-body power.',
      focus: 'Low-fatigue heavy lifts paired with explosive movements after complete recovery.',
      progression: 'Improve explosive quality before load; stop contrast pairs when jump, throw or sprint output drops.',
      note: 'Contrast work is not conditioning. Rest fully between heavy and explosive exercises, use low repetition counts and choose jumps or throws already mastered.',
      sessions: [
        {
          title: 'Day 1 - Squat and Jump Contrast',
          meta: '70 minutes. Rest 3-5 minutes after the heavy lift before the jump.',
          exercises: [
            ['Back squat', '5', '3', '3 min', 'Use a strong triple with no grinding.'],
            ['Box jump', '5', '3', '2 min', 'Land quietly and step down.'],
            ['Rear-foot elevated split squat', '3', '6/side', '90 sec', 'Drive up with intent.'],
            ['Pogo jump', '4', '10', '60 sec', 'Short ground contact and stiff ankles.']
          ]
        },
        {
          title: 'Day 2 - Press and Throw Contrast',
          meta: '65 minutes. Pair each press set with a maximal-quality throw.',
          exercises: [
            ['Bench press', '5', '3', '3 min', 'Fast concentric without losing position.'],
            ['Supine medicine-ball chest throw', '5', '4', '90 sec', 'Release explosively to a partner or wall.'],
            ['Weighted chin-up', '4', '4-6', '2 min', 'Full controlled range.'],
            ['Rotational medicine-ball scoop throw', '4', '4/side', '75 sec', 'Rotate through hips and trunk together.']
          ]
        },
        {
          title: 'Day 3 - Hinge and Acceleration Contrast',
          meta: '70 minutes. Use complete recovery so sprint mechanics stay sharp.',
          exercises: [
            ['Trap-bar deadlift', '5', '2-3', '3 min', 'Terminate the set if speed slows.'],
            ['Broad jump', '5', '3', '2 min', 'Stick each landing before resetting.'],
            ['Resisted sled sprint', '6', '15 m', '90 sec', 'Maintain projection and aggressive steps.'],
            ['Unresisted acceleration', '6', '20 m', '2 min', 'Fast but relaxed through the shoulders.']
          ]
        },
        {
          title: 'Day 4 - Total-Body Contrast',
          meta: '60-70 minutes. Technical Olympic-lift derivatives require coaching.',
          exercises: [
            ['Hang high pull', '5', '3', '2 min', 'Extend violently and keep the bar close.'],
            ['Countermovement jump', '5', '3', '90 sec', 'Use the same setup every rep.'],
            ['Push press', '4', '3-5', '2 min', 'Transfer force from legs through the bar.'],
            ['Overhead medicine-ball throw', '4', '4', '75 sec', 'Brace before the explosive release.']
          ]
        }
      ]
    },
    {
      name: 'Olympic Lift Complex Academy',
      project: 'athletic-performance',
      keywords: 'olympic lifting complex clean jerk snatch high pull front squat advanced technique',
      goal: 'strength muscle',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A coached technical block built around clean, jerk and snatch derivatives plus foundational strength.',
      bestFor: 'experienced lifters learning advanced weightlifting derivatives with coaching',
      equipment: 'weightlifting platform, bumper plates, rack and blocks',
      split: 'Clean complex, snatch derivative, jerk and squat, then pull and power.',
      focus: 'Low-rep technical complexes, front-squat strength, overhead stability and explosive pulls.',
      progression: 'Add load only after positions are repeatable; use video feedback and keep technical misses at zero.',
      note: 'Olympic-lift derivatives require qualified coaching and appropriate mobility. Substitute clean pulls, high pulls or landmine presses when the catch or overhead position is not established.',
      sessions: [
        {
          title: 'Day 1 - Clean Complex',
          meta: '70 minutes. Perform every complex as one continuous technical sequence.',
          exercises: [
            ['Clean complex: pull + hang clean + front squat', '5', '1+1+1', '2-3 min', 'Keep the bar close and receive with a braced trunk.'],
            ['Front squat', '4', '3-5', '2-3 min', 'Elbows high and full foot pressure.'],
            ['Clean-grip Romanian deadlift', '3', '6', '2 min', 'Match the first-pull posture.'],
            ['Tall-kneeling Pallof press', '3', '10/side', '45 sec', 'Resist rotation.']
          ]
        },
        {
          title: 'Day 2 - Snatch Derivative',
          meta: '65 minutes. Use a high pull if the overhead catch is not coached.',
          exercises: [
            ['Snatch complex: muscle snatch + overhead squat', '5', '2+2', '2 min', 'Use an empty bar until positions are stable.'],
            ['Snatch-grip high pull', '5', '3', '2 min', 'Finish tall and guide elbows high.'],
            ['Overhead squat', '4', '3-5', '2 min', 'Use a controlled depth you can own.'],
            ['Chest-supported row', '3', '8-10', '75 sec', 'Build upper-back control.']
          ]
        },
        {
          title: 'Day 3 - Jerk and Squat',
          meta: '70 minutes. Stable footwork matters more than load.',
          exercises: [
            ['Jerk footwork drill', '5', '3', '60 sec', 'Land in the same split position every rep.'],
            ['Push jerk from rack', '6', '2', '2 min', 'Dip straight and lock out before recovery.'],
            ['Back squat', '5', '3-5', '2-3 min', 'Strong concentric intent.'],
            ['Copenhagen plank', '3', '20-30 sec/side', '45 sec', 'Keep hips stacked.']
          ]
        },
        {
          title: 'Day 4 - Pull and Power',
          meta: '65 minutes. No missed pulls or ugly catches.',
          exercises: [
            ['Clean pull from blocks', '5', '3', '2 min', 'Push through the floor before extension.'],
            ['Hang power clean', '6', '2', '2 min', 'Receive above parallel with stable feet.'],
            ['Push press', '4', '5', '90 sec', 'Drive vertically and finish stacked.'],
            ['Front-rack carry', '4', '25 m', '75 sec', 'Maintain ribs down and elbows forward.']
          ]
        }
      ]
    },
    {
      name: 'Daily Undulating Powerbuilding',
      project: 'strength-reset',
      keywords: 'daily undulating periodization powerbuilding heavy volume speed squat bench deadlift advanced',
      goal: 'strength muscle',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '10 weeks',
      summary: 'A five-day powerbuilding split rotating heavy, speed and hypertrophy exposures across the week.',
      bestFor: 'advanced lifters balancing one-rep strength with visible muscle',
      equipment: 'full barbell gym and cable stations',
      split: 'Heavy squat, bench volume, deadlift speed, upper hypertrophy and lower volume.',
      focus: 'Undulating intensity, competition-lift practice and bodybuilding accessories.',
      progression: 'Use RPE caps for primary lifts and double progression for accessories; deload every fourth week.',
      note: 'Primary lifts should finish at the prescribed effort without failure. Adjust the day load to match readiness rather than forcing a percentage.',
      sessions: [
        {
          title: 'Day 1 - Heavy Squat',
          meta: '75 minutes. Work to a controlled top set, then complete back-off volume.',
          exercises: [
            ['Competition back squat', '1+4', '3 @ RPE 8 + 4x4', '3 min', 'Back-off sets use about 90% of the top-set load.'],
            ['Paused bench press', '4', '5', '2 min', 'Pause for 1-2 seconds.'],
            ['Barbell Romanian deadlift', '3', '7', '2 min', 'Keep lats locked.'],
            ['Weighted decline sit-up', '3', '10-12', '60 sec', 'Control the descent.']
          ]
        },
        {
          title: 'Day 2 - Bench Volume',
          meta: '65-75 minutes. Chest and triceps volume without missed reps.',
          exercises: [
            ['Competition bench press', '5', '6', '2 min', 'Use a load around RPE 7.'],
            ['Weighted pull-up', '4', '6-8', '2 min', 'Full range.'],
            ['Close-grip bench press', '3', '8', '90 sec', 'Keep elbows controlled.'],
            ['Cable lateral raise', '4', '12-18', '45 sec', 'Smooth reps.']
          ]
        },
        {
          title: 'Day 3 - Deadlift Speed',
          meta: '65 minutes. Every deadlift repetition starts from a complete reset.',
          exercises: [
            ['Speed deadlift', '8', '2', '60-75 sec', 'Use 60-70% and accelerate from the floor.'],
            ['Front squat', '4', '5', '2 min', 'Upright torso and stable depth.'],
            ['Barbell hip thrust', '3', '8-10', '90 sec', 'Pause at lockout.'],
            ['Hanging leg raise', '3', '10-15', '60 sec', 'Control pelvic position.']
          ]
        },
        {
          title: 'Day 4 - Upper Hypertrophy',
          meta: '60-70 minutes. Use controlled bodybuilding ranges.',
          exercises: [
            ['Incline dumbbell press', '4', '8-12', '90 sec', 'Deep pain-free range.'],
            ['Chest-supported row', '4', '8-12', '90 sec', 'Pause at the top.'],
            ['Machine shoulder press', '3', '10-12', '75 sec', 'No shortened reps.'],
            ['Cable curl and pressdown superset', '3', '12-15 each', '45 sec', 'Keep both movements strict.']
          ]
        },
        {
          title: 'Day 5 - Lower Hypertrophy',
          meta: '65-75 minutes. Moderate loads and high positional consistency.',
          exercises: [
            ['Hack squat', '4', '8-12', '2 min', 'Control the bottom.'],
            ['Deficit Romanian deadlift', '3', '8-10', '2 min', 'Use only a range you can brace.'],
            ['Walking lunge', '3', '10/side', '75 sec', 'Long stable stride.'],
            ['Seated leg curl drop set', '3', '10-12 + 8', '60 sec', 'Reduce load once on the final set only.']
          ]
        }
      ]
    },
    {
      name: 'Mechanical Drop-Set Hypertrophy',
      project: 'muscle-build-pro',
      keywords: 'mechanical drop sets hypertrophy lever angle advanced bodybuilding',
      goal: 'muscle',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A four-day hypertrophy split extending selected sets by moving from harder to easier leverage.',
      bestFor: 'advanced lifters seeking high stimulus with moderate loads',
      equipment: 'dumbbells, cables, machines, bench and pull-up bar',
      split: 'Push, pull, quads and posterior-chain sessions.',
      focus: 'Mechanical drop sequences, stable compounds and strict execution through changing leverage.',
      progression: 'Add reps to the hardest variation before extending the easier variations or increasing load.',
      note: 'Mechanical drops change leverage rather than chasing unsafe load reductions. Use one sequence per target muscle and stop when technique or range becomes inconsistent.',
      sessions: [
        {
          title: 'Day 1 - Push Mechanical Drops',
          meta: '60-70 minutes. Complete each three-part sequence without changing load.',
          exercises: [
            ['Incline-to-flat dumbbell press sequence', '3', '8 incline + 6 low incline + 6 flat', '2 min', 'Adjust the bench quickly while retaining shoulder position.'],
            ['Seated dumbbell press', '3', '8-10', '90 sec', 'Use straight sets.'],
            ['Lean-away to standing lateral raise', '3', '10 + 8/side', '60 sec', 'Move from harder to easier leverage.'],
            ['Overhead-to-pressdown triceps sequence', '3', '10 + 10', '60 sec', 'Keep elbows controlled.']
          ]
        },
        {
          title: 'Day 2 - Pull Mechanical Drops',
          meta: '60-70 minutes. Use straps if grip fails before the back.',
          exercises: [
            ['Wide-to-neutral pulldown sequence', '3', '8 + 8', '90 sec', 'Change grip while keeping the torso stable.'],
            ['Chest-supported row', '4', '8-10', '90 sec', 'Pause at peak contraction.'],
            ['Incline-to-standing dumbbell curl', '3', '8 + 8', '60 sec', 'Keep the same load and avoid swinging.'],
            ['Rear-delt fly long-to-short lever', '3', '10 + 10', '60 sec', 'Bend elbows only after strict reps finish.']
          ]
        },
        {
          title: 'Day 3 - Quad Mechanical Drops',
          meta: '65-75 minutes. Compounds remain controlled before the leverage sequence.',
          exercises: [
            ['Front squat', '4', '5-7', '2-3 min', 'Straight sets with 1-2 reps in reserve.'],
            ['Heel-elevated to standard goblet squat', '3', '10 + 8', '90 sec', 'Remove heel elevation for the easier variation.'],
            ['Walking to reverse lunge sequence', '3', '8 + 6/side', '75 sec', 'Keep stride length consistent.'],
            ['Leg extension partial-length sequence', '2', '12 full + 8 lengthened partials', '60 sec', 'Use controlled partials only after full reps.']
          ]
        },
        {
          title: 'Day 4 - Posterior Mechanical Drops',
          meta: '65 minutes. Keep spinal position unchanged as leverage changes.',
          exercises: [
            ['Romanian deadlift', '4', '6-8', '2 min', 'Straight sets.'],
            ['Long-lever to short-lever hip bridge', '3', '10 + 12', '75 sec', 'Bring heels closer for the easier variation.'],
            ['Slider leg curl to bridge curl', '3', '8 + 8', '75 sec', 'Keep hips extended.'],
            ['Single-leg to bilateral calf raise', '3', '10/side + 12', '60 sec', 'Maintain full range.']
          ]
        }
      ]
    },
    {
      name: 'Wave Loading Strength Cycle',
      project: 'strength-reset',
      keywords: 'wave loading 6 4 2 advanced squat bench deadlift overhead press',
      goal: 'strength',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A four-day strength cycle using ascending 6-4-2 waves on the competition patterns.',
      bestFor: 'experienced lifters who autoregulate load accurately',
      equipment: 'rack, barbell, plates and cable station',
      split: 'Squat wave, bench wave, deadlift wave and overhead plus secondary wave.',
      focus: 'Two submaximal load waves, precise effort targets and low-fatigue accessories.',
      progression: 'Add a small amount to the second wave only when the first wave stays below RPE 8.',
      note: 'A wave is not a max-out sequence. Keep all repetitions clean and repeat the first-wave load if readiness is poor.',
      sessions: [
        {
          title: 'Day 1 - Squat 6-4-2 Waves',
          meta: '70 minutes. Complete two waves with 2-3 minutes between sets.',
          exercises: [
            ['Back squat wave', '2 waves', '6, 4, 2', '2-3 min', 'Increase load each set while staying submaximal.'],
            ['Paused front squat', '3', '4', '2 min', 'Two-second pause.'],
            ['Reverse Nordic', '3', '8-10', '75 sec', 'Maintain a straight hip line.'],
            ['Ab wheel rollout', '3', '8-12', '60 sec', 'Keep ribs down.']
          ]
        },
        {
          title: 'Day 2 - Bench 6-4-2 Waves',
          meta: '65 minutes. Maintain the same touch point across both waves.',
          exercises: [
            ['Bench press wave', '2 waves', '6, 4, 2', '2-3 min', 'No missed reps.'],
            ['Weighted chin-up', '4', '5-7', '2 min', 'Full range.'],
            ['Spoto press', '3', '6', '90 sec', 'Pause just above the chest.'],
            ['Face pull', '3', '15-20', '45 sec', 'Control external rotation.']
          ]
        },
        {
          title: 'Day 3 - Deadlift 5-3-1 Waves',
          meta: '70 minutes. Use one or two waves depending on recovery.',
          exercises: [
            ['Deadlift wave', '2 waves', '5, 3, 1', '3 min', 'The single remains fast and submaximal.'],
            ['Paused deadlift below knee', '3', '3', '2 min', 'Hold position for 2 seconds.'],
            ['Barbell row', '4', '6-8', '90 sec', 'Brace without torso movement.'],
            ['Farmer carry', '4', '40 m', '75 sec', 'Heavy and controlled.']
          ]
        },
        {
          title: 'Day 4 - Press and Secondary Wave',
          meta: '60-70 minutes. Use lower-body volume that does not compromise the next squat day.',
          exercises: [
            ['Overhead press wave', '2 waves', '6, 4, 2', '2 min', 'No layback.'],
            ['Safety-bar squat wave', '1 wave', '8, 6, 4', '2 min', 'Moderate effort only.'],
            ['One-arm dumbbell row', '3', '10/side', '75 sec', 'Reach and pull without rotation.'],
            ['Copenhagen plank', '3', '25 sec/side', '45 sec', 'Keep hips high.']
          ]
        }
      ]
    },
    {
      name: 'Unilateral Performance Matrix',
      project: 'athletic-performance',
      keywords: 'unilateral strength single leg copenhagen landmine cossack advanced athlete',
      goal: 'strength mobility',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'Advanced single-limb strength, frontal-plane control and anti-rotation work for athletic resilience.',
      bestFor: 'trained athletes addressing side-to-side force and control',
      equipment: 'dumbbells, cables, landmine, bench and open space',
      split: 'Unilateral lower strength, upper anti-rotation, lateral power and integrated athletic strength.',
      focus: 'Deficit split squats, single-leg hinges, offset presses, Cossack squats and Copenhagen work.',
      progression: 'Earn load through stable pelvis, knee and rib position; compare quality rather than forcing equal loads.',
      note: 'Complex unilateral work should be scaled to the athlete. Use support where balance hides the target strength stimulus.',
      sessions: [
        {
          title: 'Day 1 - Single-Leg Force',
          meta: '65 minutes. Use support if it improves force production and alignment.',
          exercises: [
            ['Deficit rear-foot elevated split squat', '4', '6/side', '2 min', 'Maintain full foot pressure.'],
            ['Contralateral single-leg Romanian deadlift', '4', '7/side', '90 sec', 'Keep hips square.'],
            ['High step-up with knee drive', '3', '6/side', '75 sec', 'Finish tall without pushing off the back foot.'],
            ['Copenhagen plank', '3', '20-30 sec/side', '45 sec', 'Use short lever if needed.']
          ]
        },
        {
          title: 'Day 2 - Upper Anti-Rotation',
          meta: '60 minutes. Every press and pull challenges trunk control.',
          exercises: [
            ['Half-kneeling one-arm landmine press', '4', '6/side', '90 sec', 'Resist side bend and rotation.'],
            ['Three-point one-arm row', '4', '8/side', '90 sec', 'Keep pelvis level.'],
            ['Offset dumbbell floor press', '3', '8/side', '75 sec', 'Do not rotate toward the load.'],
            ['Suitcase carry', '5', '30 m/side', '60 sec', 'Walk with level shoulders.']
          ]
        },
        {
          title: 'Day 3 - Lateral Power',
          meta: '55-65 minutes. Land each repetition before starting the next.',
          exercises: [
            ['Lateral bound to stick', '5', '3/side', '75 sec', 'Control hip and knee on landing.'],
            ['Crossover step-up', '3', '7/side', '75 sec', 'Drive through the outside hip.'],
            ['Cossack squat', '4', '6/side', '75 sec', 'Use a range that keeps the heel down.'],
            ['Cable lift with step', '3', '8/side', '60 sec', 'Coordinate foot, hip and trunk rotation.']
          ]
        },
        {
          title: 'Day 4 - Integrated Athletic Strength',
          meta: '65 minutes. Combine split-stance force with controlled locomotion.',
          exercises: [
            ['Kickstand trap-bar deadlift', '4', '6/side', '2 min', 'Front leg supplies most of the force.'],
            ['Split-stance push press', '4', '5/side', '90 sec', 'Stay balanced through lockout.'],
            ['Single-arm farmer march', '4', '30 sec/side', '60 sec', 'Lift knees without leaning.'],
            ['Backward sled drag', '6', '25 m', '60 sec', 'Continuous controlled steps.']
          ]
        }
      ]
    },
    {
      name: 'Strongman Hybrid Builder',
      project: 'athletic-performance',
      keywords: 'strongman log press yoke farmer sandbag sled advanced conditioning strength',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '10 weeks',
      summary: 'A strongman-inspired strength and work-capacity block using carries, loads, presses and sleds.',
      bestFor: 'experienced lifters with access to strongman equipment',
      equipment: 'log or axle, trap bar, farmer handles, sandbag, yoke and sled',
      split: 'Overhead event, deadlift and carry, loading event, then medley conditioning.',
      focus: 'Odd-object bracing, clean-to-press skill, heavy locomotion and event-specific density.',
      progression: 'Progress event distance or load separately and taper medley volume before testing.',
      note: 'Odd-object events require clear lanes, secure equipment and competent coaching. Use barbell, dumbbell or sled substitutions when specialist equipment is unavailable.',
      sessions: [
        {
          title: 'Day 1 - Log and Overhead',
          meta: '70 minutes. Practice the clean separately before combining it with the press.',
          exercises: [
            ['Log clean and push press', '6', '2', '2-3 min', 'Use an axle clean and press as an alternative.'],
            ['Strict overhead press', '4', '5', '2 min', 'Finish stacked over mid-foot.'],
            ['Chest-supported row', '4', '8', '90 sec', 'Build upper-back support.'],
            ['Front-rack sandbag carry', '5', '25 m', '75 sec', 'Brace and take short steps.']
          ]
        },
        {
          title: 'Day 2 - Deadlift and Carry',
          meta: '75 minutes. Heavy work remains submaximal.',
          exercises: [
            ['Axle or trap-bar deadlift', '5', '3', '3 min', 'Use straps only if allowed for the goal.'],
            ['Farmer carry', '6', '30 m', '90 sec', 'Fast controlled pick and tall posture.'],
            ['Yoke walk', '5', '20 m', '90 sec', 'Brace before the pick and use quick feet.'],
            ['Sled drag', '4', '40 m', '75 sec', 'Maintain constant tension.']
          ]
        },
        {
          title: 'Day 3 - Sandbag Loading',
          meta: '65 minutes. Use progressive bag heights and safe receiving surfaces.',
          exercises: [
            ['Sandbag to platform', '6', '3', '90 sec', 'Lap the bag securely before extension.'],
            ['Front squat', '4', '5', '2 min', 'Build upright strength.'],
            ['Bear-hug sandbag carry', '5', '30 m', '75 sec', 'Keep steps smooth.'],
            ['Rope pull or hand-over-hand sled pull', '5', '20 m', '75 sec', 'Stay braced and use full pulls.']
          ]
        },
        {
          title: 'Day 4 - Event Medley',
          meta: '55-65 minutes. Stop each medley before technique becomes unsafe.',
          exercises: [
            ['Farmer carry to sled push', '5', '20 m + 20 m', '2 min', 'Transition under control.'],
            ['Sandbag load to burpee', '5', '3 + 5', '90 sec', 'Keep breathing rhythmic.'],
            ['Axle clean and press', '5', '4', '90 sec', 'Use a repeatable clean.'],
            ['Easy row or bike cooldown', '1', '15 min', 'None', 'Zone 2 recovery.']
          ]
        }
      ]
    },
    {
      name: 'Sprint Strength Integration',
      project: 'athletic-performance',
      keywords: 'sprint acceleration max velocity plyometric strength integration advanced athlete',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '8 weeks',
      summary: 'A five-day field-and-gym plan integrating acceleration, max velocity, plyometrics and strength.',
      bestFor: 'trained field athletes with established sprint mechanics',
      equipment: 'track or field, timing marks, sled and full gym',
      split: 'Acceleration, upper strength, max velocity, lower strength and tempo recovery.',
      focus: 'High-quality sprint exposure, elastic contacts, posterior-chain strength and fatigue management.',
      progression: 'Add sprint metres only while times remain stable; never turn speed work into conditioning.',
      note: 'Sprint and plyometric work should be coached and performed on a safe surface after a complete warm-up. Stop if mechanics or speed deteriorate.',
      sessions: [
        {
          title: 'Day 1 - Acceleration',
          meta: '55-65 minutes. Full recovery between sprints.',
          exercises: [
            ['Wall-switch acceleration drill', '3', '5/side', '45 sec', 'Project hips forward while keeping ribs down.'],
            ['Sled acceleration', '6', '15 m', '2 min', 'Use resistance that preserves projection.'],
            ['Unresisted sprint', '6', '20 m', '2-3 min', 'Fast first steps and relaxed shoulders.'],
            ['Broad jump', '4', '3', '75 sec', 'Stick the landing.']
          ]
        },
        {
          title: 'Day 2 - Upper Strength',
          meta: '60-70 minutes. Keep lower-body fatigue minimal.',
          exercises: [
            ['Bench press', '5', '4', '2 min', 'Fast concentric intent.'],
            ['Weighted pull-up', '5', '4-6', '2 min', 'Full range.'],
            ['Half-kneeling landmine press', '3', '8/side', '75 sec', 'Resist rotation.'],
            ['Rope climb or towel-grip pulldown', '4', '1 climb or 8 reps', '90 sec', 'Strong grip and scapular control.']
          ]
        },
        {
          title: 'Day 3 - Max Velocity',
          meta: '55 minutes. Use a long runway and full recovery.',
          exercises: [
            ['A-skip and dribble series', '3', '20 m each', '45 sec', 'Tall posture and rhythm.'],
            ['Build-up sprint', '4', '40 m', '2 min', 'Gradually reach high speed.'],
            ['Flying sprint', '6', '20 m fly zone', '3 min', 'Stay upright and relaxed.'],
            ['Straight-leg bound', '4', '20 m', '75 sec', 'Strike beneath the hips.']
          ]
        },
        {
          title: 'Day 4 - Lower Strength',
          meta: '70 minutes. Strength supports speed rather than exhausting it.',
          exercises: [
            ['Trap-bar deadlift', '5', '3', '3 min', 'No grinders.'],
            ['Rear-foot elevated split squat', '4', '6/side', '90 sec', 'Stable front leg.'],
            ['Nordic hamstring curl', '4', '4-6', '90 sec', 'Use assistance for controlled reps.'],
            ['Seated calf raise', '4', '8-12', '60 sec', 'Pause in the stretch.']
          ]
        },
        {
          title: 'Day 5 - Tempo and Recovery',
          meta: '35-45 minutes. Keep the running rhythm easy.',
          exercises: [
            ['Tempo run', '10', '100 m @ 65-70%', '45 sec', 'Relaxed stride; walk the recovery.'],
            ['Reverse sled drag', '5', '30 m', '60 sec', 'Continuous steps.'],
            ['Copenhagen plank', '3', '20 sec/side', '45 sec', 'Level hips.'],
            ['Hip and ankle mobility flow', '1', '10 min', 'None', 'Stay within comfortable ranges.']
          ]
        }
      ]
    },
    {
      name: 'Kettlebell Complex Pro',
      project: 'athletic-performance',
      keywords: 'kettlebell complex clean press snatch turkish get up advanced conditioning',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'home gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'An advanced kettlebell block combining double-bell strength, complexes, snatches and get-ups.',
      bestFor: 'experienced kettlebell users with reliable clean and snatch technique',
      equipment: 'matched kettlebell pair plus one lighter bell',
      split: 'Double-bell strength, complex density, snatch power and get-up plus carries.',
      focus: 'Clean-front squat-press chains, ballistic hip power, overhead control and grip endurance.',
      progression: 'Add rounds before bell weight and keep every clean quiet in the rack.',
      note: 'Ballistic kettlebell exercises require established hinge, clean and overhead mechanics. Use swings, dead cleans or floor presses as regressions.',
      sessions: [
        {
          title: 'Day 1 - Double-Bell Strength',
          meta: '55-65 minutes. Reset the rack position between repetitions.',
          exercises: [
            ['Double kettlebell clean', '5', '5', '90 sec', 'Keep bells close and receive quietly.'],
            ['Double front squat', '5', '5', '2 min', 'Brace behind the bells.'],
            ['Double strict press', '5', '4-6', '2 min', 'Finish stacked.'],
            ['Double suitcase carry', '5', '40 m', '75 sec', 'Walk tall.']
          ]
        },
        {
          title: 'Day 2 - Armor Complex Density',
          meta: '40-55 minutes. One round = 2 cleans, 1 press, 3 front squats.',
          exercises: [
            ['Double-bell armor complex', '8', '1 round', '75 sec', 'Use identical clean positions every round.'],
            ['Renegade row', '4', '6/side', '75 sec', 'Keep hips square.'],
            ['Front-rack reverse lunge', '3', '6/side', '75 sec', 'Maintain rack tension.'],
            ['Hollow-body pullover', '3', '8-10', '60 sec', 'Keep low back controlled.']
          ]
        },
        {
          title: 'Day 3 - Snatch Power',
          meta: '45-55 minutes. Use a bell you can decelerate safely.',
          exercises: [
            ['One-arm kettlebell snatch EMOM', '10', '5/side per minute', 'Remainder of minute', 'Punch through softly at lockout.'],
            ['Double kettlebell swing', '5', '10', '75 sec', 'Explosive hips and relaxed arms.'],
            ['Kettlebell push press', '4', '6/side', '75 sec', 'Use a vertical dip.'],
            ['Bottoms-up carry', '4', '20 m/side', '60 sec', 'Stack wrist and elbow.']
          ]
        },
        {
          title: 'Day 4 - Get-Up and Carry',
          meta: '50-60 minutes. Move slowly through every transition.',
          exercises: [
            ['Turkish get-up', '5', '1/side', '75 sec', 'Own each checkpoint before moving.'],
            ['Kettlebell windmill', '4', '5/side', '60 sec', 'Rotate through the upper back and hips.'],
            ['Single-leg kettlebell deadlift', '4', '7/side', '75 sec', 'Keep pelvis square.'],
            ['Waiter carry', '5', '25 m/side', '60 sec', 'Keep the bell stacked overhead.']
          ]
        }
      ]
    },
    {
      name: 'Calisthenics Strength Skills',
      project: 'athletic-performance',
      keywords: 'calisthenics weighted pull up dip muscle up handstand front lever pistol advanced',
      goal: 'strength muscle mobility',
      level: 'advanced',
      place: 'home gym',
      schedule: '5 days/week',
      block: '10 weeks',
      summary: 'A five-day advanced calisthenics split balancing weighted strength with controlled skill practice.',
      bestFor: 'experienced bodyweight athletes with solid pull-ups, dips and handstands',
      equipment: 'pull-up bar, rings, parallettes, bands and weight belt',
      split: 'Weighted pull, handstand push, lower body, muscle-up transition and lever strength.',
      focus: 'Low-fatigue skill practice, weighted basics, isometrics and advanced body-line control.',
      progression: 'Add hold time or cleaner range before harder leverage; never practice skills to technical failure.',
      note: 'Advanced skills stress wrists, elbows and shoulders. Use regressions, spotters and low-fatigue practice; remove any variation that causes joint pain.',
      sessions: [
        {
          title: 'Day 1 - Weighted Pull',
          meta: '60 minutes. Complete skill work before weighted strength.',
          exercises: [
            ['Chest-to-bar pull-up', '5', '3', '2 min', 'Pull high without kipping.'],
            ['Weighted pull-up', '5', '4-6', '2-3 min', 'Full hang and controlled descent.'],
            ['Archer ring row', '4', '6/side', '90 sec', 'Keep body rigid.'],
            ['Towel hang', '4', '30-40 sec', '60 sec', 'Shoulders remain active.']
          ]
        },
        {
          title: 'Day 2 - Handstand Push',
          meta: '55-65 minutes. Keep skill sets far from failure.',
          exercises: [
            ['Wall handstand line drill', '6', '25 sec', '60 sec', 'Stack wrists, shoulders, ribs and hips.'],
            ['Deficit pike or handstand push-up', '5', '3-6', '2 min', 'Use a controlled depth.'],
            ['Weighted ring dip', '4', '5-7', '2 min', 'Stable rings and shoulders.'],
            ['Pseudo-planche push-up', '4', '6-8', '90 sec', 'Lean only as far as wrists tolerate.']
          ]
        },
        {
          title: 'Day 3 - Advanced Lower Body',
          meta: '55 minutes. Use assistance to preserve full range.',
          exercises: [
            ['Pistol squat', '5', '4-6/side', '90 sec', 'Control the bottom without collapsing.'],
            ['Shrimp squat', '4', '6/side', '75 sec', 'Keep pelvis level.'],
            ['Nordic hamstring curl', '4', '4-6', '90 sec', 'Band-assist as needed.'],
            ['Single-leg calf raise', '4', '12-15/side', '60 sec', 'Full range.']
          ]
        },
        {
          title: 'Day 4 - Muscle-Up Transition',
          meta: '50-60 minutes. Use a low bar or rings to rehearse the transition.',
          exercises: [
            ['False-grip hang', '5', '20 sec', '60 sec', 'Maintain wrist position.'],
            ['Low-ring muscle-up transition', '6', '3', '75 sec', 'Keep rings close to the body.'],
            ['Band-assisted strict muscle-up', '5', '2-4', '2 min', 'No kip or chicken-wing transition.'],
            ['Straight-bar dip', '4', '6-8', '90 sec', 'Control the bottom.']
          ]
        },
        {
          title: 'Day 5 - Lever and Trunk',
          meta: '45-55 minutes. Quality isometrics with complete rest.',
          exercises: [
            ['Tuck front-lever hold', '6', '8-12 sec', '75 sec', 'Depress shoulder blades and keep hips level.'],
            ['Front-lever row regression', '4', '5-7', '90 sec', 'Use a leverage you can control.'],
            ['Dragon flag eccentric', '4', '3-5', '90 sec', 'Lower as one unit.'],
            ['Ring support hold', '5', '20-30 sec', '60 sec', 'Turn rings slightly out.']
          ]
        }
      ]
    },
    {
      name: 'Glute Specialization Intensifier',
      project: 'glute-launch',
      keywords: 'glute specialization hip thrust lengthened partial rest pause abduction advanced women men',
      goal: 'muscle strength',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '10 weeks',
      summary: 'A five-day advanced glute block combining heavy hip extension, long-length work and targeted intensification.',
      bestFor: 'experienced lifters prioritizing glute strength and shape',
      equipment: 'barbell, rack, cables, hip-thrust setup and machines',
      split: 'Glute strength, upper, lengthened glute, upper, then glute pump and conditioning.',
      focus: 'Hip thrusts, deep split squats, long-stride hinges, abduction myo-reps and sled work.',
      progression: 'Progress the two priority lifts while rotating only one intensification method per session.',
      note: 'Keep lumbar extension out of hip-extension work. Intensification belongs on stable accessories, not on heavy barbell sets.',
      sessions: [
        {
          title: 'Day 1 - Glute Strength',
          meta: '70 minutes. Heavy hip extension with complete lockout control.',
          exercises: [
            ['Barbell hip thrust', '5', '5-7', '2-3 min', 'Finish with glutes and neutral ribs.'],
            ['Low-bar back squat', '4', '6-8', '2 min', 'Use a stable depth.'],
            ['Cable hip abduction myo-reps', '1', '20 + 5x5/side', '15 sec', 'Keep pelvis level.'],
            ['Backward sled drag', '5', '30 m', '60 sec', 'Continuous steps.']
          ]
        },
        {
          title: 'Day 2 - Upper Strength',
          meta: '55-65 minutes. Maintain upper-body strength without excessive lower fatigue.',
          exercises: [
            ['Incline bench press', '4', '6-8', '2 min', 'Stable setup.'],
            ['Weighted pull-up', '4', '5-7', '2 min', 'Full range.'],
            ['Chest-supported row', '3', '8-10', '90 sec', 'Pause at the top.'],
            ['Cable lateral raise', '3', '12-18', '45 sec', 'Strict reps.']
          ]
        },
        {
          title: 'Day 3 - Lengthened Glute',
          meta: '70 minutes. Prioritize controlled depth and long muscle lengths.',
          exercises: [
            ['Deficit Bulgarian split squat', '4', '7/side', '2 min', 'Long stride and stable pelvis.'],
            ['Romanian deadlift', '4', '7-9', '2 min', 'Hips back with strong lat tension.'],
            ['High step-up', '3', '8/side', '90 sec', 'Minimal push from the back foot.'],
            ['45-degree hip extension rest-pause', '1', '15 + 5+5+5', '20 sec', 'Round upper back slightly and drive hips into the pad.']
          ]
        },
        {
          title: 'Day 4 - Upper Hypertrophy',
          meta: '55 minutes. Keep this session systemically moderate.',
          exercises: [
            ['Machine chest press', '3', '10-12', '75 sec', 'Controlled range.'],
            ['One-arm lat pulldown', '3', '10/side', '75 sec', 'Drive elbow down.'],
            ['Cable row', '3', '12', '60 sec', 'Keep torso quiet.'],
            ['Curl and pressdown superset', '3', '12-15 each', '45 sec', 'Full range.']
          ]
        },
        {
          title: 'Day 5 - Glute Pump and Carry',
          meta: '50-60 minutes. High local stimulus with low spinal fatigue.',
          exercises: [
            ['B-stance hip thrust', '4', '10/side', '75 sec', 'Front foot performs most of the work.'],
            ['Cable reverse lunge', '3', '12/side', '60 sec', 'Long stride.'],
            ['Abduction machine drop set', '3', '15 + 12', '45 sec', 'Reduce load once and keep range.'],
            ['Heavy farmer carry', '5', '35 m', '60 sec', 'Tall posture and controlled steps.']
          ]
        }
      ]
    },
    {
      name: 'Back Specialization Elite',
      project: 'muscle-build-pro',
      keywords: 'back specialization weighted pull up pendlay row pullover myo reps advanced hypertrophy',
      goal: 'muscle strength',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '10 weeks',
      summary: 'A five-day back specialization phase balancing vertical pull strength, row volume and long-length lat work.',
      bestFor: 'advanced physique athletes prioritizing lat width and upper-back density',
      equipment: 'pull-up station, barbell, cables, chest-supported machines and straps',
      split: 'Vertical pull, lower, horizontal pull, push, then back density.',
      focus: 'Weighted pulls, Pendlay rows, one-arm lat work, pullovers and controlled myo-reps.',
      progression: 'Progress one heavy pull and one volume pull; keep weekly elbow-flexor fatigue monitored.',
      note: 'Use straps when grip prevents back loading, but retain separate grip work. Keep spinal loading modest on high-row-volume weeks.',
      sessions: [
        {
          title: 'Day 1 - Vertical Pull Strength',
          meta: '65 minutes. Full range and no kipping.',
          exercises: [
            ['Weighted pull-up', '5', '4-6', '2-3 min', 'Begin from a controlled hang.'],
            ['One-arm kneeling pulldown', '4', '8/side', '90 sec', 'Drive elbow to the hip.'],
            ['Cable pullover', '3', '12-15', '60 sec', 'Reach into a long lat position.'],
            ['Incline dumbbell curl', '3', '8-10', '75 sec', 'Keep shoulder extended.']
          ]
        },
        {
          title: 'Day 2 - Lower Support',
          meta: '60 minutes. Lower-body strength without high back fatigue.',
          exercises: [
            ['Safety-bar squat', '4', '6-8', '2 min', 'Brace and keep depth consistent.'],
            ['Barbell hip thrust', '4', '8-10', '90 sec', 'Pause at lockout.'],
            ['Leg curl', '3', '10-12', '60 sec', 'Control the eccentric.'],
            ['Reverse sled drag', '5', '25 m', '60 sec', 'Continuous steps.']
          ]
        },
        {
          title: 'Day 3 - Horizontal Pull Strength',
          meta: '70 minutes. Brace heavy free rows, then move to supported volume.',
          exercises: [
            ['Pendlay row', '5', '5', '2 min', 'Each rep begins on the floor.'],
            ['Chest-supported T-bar row', '4', '8-10', '90 sec', 'Pause at the top.'],
            ['Seal-row mechanical drop', '3', '8 strict + 6 shortened', '75 sec', 'Shortened reps only after full-range reps.'],
            ['Reverse pec deck myo-reps', '1', '20 + 5x5', '15 sec', 'Keep traps quiet.']
          ]
        },
        {
          title: 'Day 4 - Push Maintenance',
          meta: '55 minutes. Enough pressing to maintain balance without stealing recovery.',
          exercises: [
            ['Incline dumbbell press', '4', '8-10', '90 sec', 'Controlled range.'],
            ['Machine shoulder press', '3', '10', '75 sec', 'Stop before range shortens.'],
            ['Cable lateral raise', '4', '12-18', '45 sec', 'Lead with elbow.'],
            ['Rope pressdown', '3', '12-15', '45 sec', 'Full extension.']
          ]
        },
        {
          title: 'Day 5 - Back Density',
          meta: '55-65 minutes. Fixed work blocks with strict movement quality.',
          exercises: [
            ['Neutral-grip pulldown density block', '1', '40 reps in 8 min', 'As needed', 'Use sets of 6-10 without grinding.'],
            ['Machine row density block', '1', '40 reps in 8 min', 'As needed', 'Keep chest supported.'],
            ['Straight-arm pulldown rest-pause', '1', '15 + 5+5+5', '20 sec', 'Maintain long-arm tension.'],
            ['Farmer carry', '5', '40 m', '60 sec', 'Heavy grip and tall posture.']
          ]
        }
      ]
    },
    {
      name: 'Pressing Specialization Elite',
      project: 'muscle-build-pro',
      keywords: 'chest shoulder triceps specialization bench press cluster rest pause advanced hypertrophy',
      goal: 'muscle strength',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '10 weeks',
      summary: 'A five-day chest, shoulder and triceps specialization block with high-frequency technical pressing.',
      bestFor: 'advanced lifters prioritizing pressing strength and upper-body size',
      equipment: 'rack, bench, dumbbells, cables and machines',
      split: 'Bench strength, lower, shoulder strength, pull support and pressing density.',
      focus: 'Cluster benching, paused overhead work, long-length chest work and stable rest-pause accessories.',
      progression: 'Progress only one heavy press each week and reduce accessory volume if elbows or shoulders become irritated.',
      note: 'Maintain at least as much pulling as needed for comfortable shoulder mechanics. Rest-pause is limited to stable machine and cable work.',
      sessions: [
        {
          title: 'Day 1 - Bench Cluster Strength',
          meta: '70 minutes. Preserve bar speed through every mini-set.',
          exercises: [
            ['Bench press cluster', '5', '2+2', '20 sec intra / 2 min between', 'Use a crisp 5RM load.'],
            ['Spoto press', '3', '6', '90 sec', 'Pause above the chest.'],
            ['Weighted chin-up', '4', '6', '2 min', 'Full range.'],
            ['Cable fly', '3', '12-15', '60 sec', 'Controlled stretch.']
          ]
        },
        {
          title: 'Day 2 - Lower Maintenance',
          meta: '60 minutes. Maintain lower-body strength with modest volume.',
          exercises: [
            ['Front squat', '4', '5-7', '2 min', 'Upright torso.'],
            ['Romanian deadlift', '4', '7-9', '2 min', 'Controlled eccentric.'],
            ['Walking lunge', '3', '8/side', '75 sec', 'Stable stride.'],
            ['Ab wheel rollout', '3', '10', '60 sec', 'Ribs down.']
          ]
        },
        {
          title: 'Day 3 - Shoulder Strength',
          meta: '65 minutes. Vertical pressing with scapular control.',
          exercises: [
            ['Paused overhead press', '5', '4', '2 min', 'Pause at the collarbone.'],
            ['Half-kneeling landmine press', '4', '8/side', '75 sec', 'Resist rotation.'],
            ['Lean-away lateral raise myo-reps', '1', '18 + 5x4', '15 sec', 'Stop when traps dominate.'],
            ['Face pull', '4', '15', '45 sec', 'Control external rotation.']
          ]
        },
        {
          title: 'Day 4 - Pull Support',
          meta: '55-65 minutes. Upper-back volume supports pressing frequency.',
          exercises: [
            ['Chest-supported row', '4', '8-10', '90 sec', 'Pause at the top.'],
            ['Neutral-grip pulldown', '4', '8-12', '75 sec', 'Drive elbows down.'],
            ['Reverse pec deck', '4', '15-20', '45 sec', 'Keep torso still.'],
            ['Hammer curl', '3', '10-12', '60 sec', 'No swinging.']
          ]
        },
        {
          title: 'Day 5 - Pressing Density',
          meta: '55 minutes. Use stable equipment for high local fatigue.',
          exercises: [
            ['Incline machine press density block', '1', '35 reps in 8 min', 'As needed', 'Stop every mini-set before grinding.'],
            ['Pec deck rest-pause', '1', '15 + 5+5+5', '20 sec', 'Keep range consistent.'],
            ['Cable lateral raise drop set', '3', '12 + 10', '45 sec', 'Reduce load once.'],
            ['Rope pressdown rest-pause', '1', '18 + 5+5+5', '20 sec', 'Full extension on every rep.']
          ]
        }
      ]
    },
    {
      name: 'Advanced Leg Hypertrophy Rotation',
      project: 'muscle-build-pro',
      keywords: 'leg hypertrophy quad hamstring advanced rotation rest pause drop set',
      goal: 'muscle strength',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '10 weeks',
      summary: 'A five-day split with three distinct lower-body stimuli and two upper-body recovery buffers.',
      bestFor: 'advanced physique athletes prioritizing complete leg development',
      equipment: 'full gym with hack squat, leg press, cables and machines',
      split: 'Quad strength, upper, posterior chain, upper, then mixed leg intensification.',
      focus: 'Deep knee flexion, long-length hamstring work, unilateral control and carefully dosed intensity methods.',
      progression: 'Alternate load progression on strength days with rep progression on intensification day.',
      note: 'Three lower exposures demand strong recovery. Remove the fifth-day intensifier if performance, sleep or joint comfort declines.',
      sessions: [
        {
          title: 'Day 1 - Quad Strength',
          meta: '70 minutes. Stable depth and long rest periods.',
          exercises: [
            ['High-bar back squat', '5', '4-6', '2-3 min', 'Same depth every set.'],
            ['Pendulum squat', '4', '8', '2 min', 'Control deep knee flexion.'],
            ['Reverse Nordic', '3', '8-10', '75 sec', 'Keep hips extended.'],
            ['Standing calf raise', '4', '8-12', '60 sec', 'Full range.']
          ]
        },
        {
          title: 'Day 2 - Upper Buffer',
          meta: '55 minutes. Moderate upper-body work supports recovery.',
          exercises: [
            ['Incline dumbbell press', '4', '8-10', '90 sec', 'Controlled range.'],
            ['Chest-supported row', '4', '8-10', '90 sec', 'Pause at top.'],
            ['Lat pulldown', '3', '10-12', '75 sec', 'Full reach.'],
            ['Cable lateral raise', '3', '15-20', '45 sec', 'Strict reps.']
          ]
        },
        {
          title: 'Day 3 - Posterior Chain',
          meta: '70 minutes. Long-length hamstring and glute emphasis.',
          exercises: [
            ['Romanian deadlift', '5', '6-8', '2-3 min', 'Maintain lat tension.'],
            ['Front-foot elevated split squat', '4', '8/side', '90 sec', 'Long stride.'],
            ['Seated leg curl', '4', '10-12', '75 sec', 'Control the stretch.'],
            ['45-degree hip extension', '3', '12-15', '60 sec', 'Move through hips.']
          ]
        },
        {
          title: 'Day 4 - Upper Buffer Two',
          meta: '50-60 minutes. Keep systemic effort moderate.',
          exercises: [
            ['Machine chest press', '3', '10-12', '75 sec', 'Smooth reps.'],
            ['One-arm cable row', '3', '10/side', '75 sec', 'No rotation.'],
            ['Reverse pec deck', '3', '15-20', '45 sec', 'Rear delts lead.'],
            ['Curl and pressdown superset', '3', '12 each', '45 sec', 'Full range.']
          ]
        },
        {
          title: 'Day 5 - Leg Intensification',
          meta: '55-65 minutes. Stable machines carry the intensity techniques.',
          exercises: [
            ['Hack squat rest-pause', '1', '12 + 4+4+4', '25 sec', 'Use safeties and stop before depth changes.'],
            ['Leg extension drop set', '3', '12 + 10', '60 sec', 'Reduce load once on each set.'],
            ['Lying leg curl myo-reps', '1', '18 + 5x4', '15 sec', 'Keep hips down.'],
            ['Seated calf raise rest-pause', '1', '15 + 5+5+5', '20 sec', 'Keep full range.']
          ]
        }
      ]
    },
    {
      name: 'Deadlift Specialization Cycle',
      project: 'strength-reset',
      keywords: 'deadlift specialization paused deficit speed block pull advanced strength',
      goal: 'strength muscle',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '10 weeks',
      summary: 'A four-day deadlift specialization phase covering competition skill, weak-position strength and speed.',
      bestFor: 'advanced powerlifters with consistent deadlift technique',
      equipment: 'platform, barbell, rack, blocks, bands optional and upper-body machines',
      split: 'Competition pull, upper strength, position pull and speed plus posterior accessories.',
      focus: 'Top sets, paused and deficit pulls, block pulls, speed work and trunk stiffness.',
      progression: 'Add load only within the RPE cap and reduce secondary-pull volume every fourth week.',
      note: 'Deadlift specialization raises spinal and grip fatigue. Keep all pulls technically submaximal and replace deficit work if start position cannot be maintained.',
      sessions: [
        {
          title: 'Day 1 - Competition Deadlift',
          meta: '75 minutes. One controlled top set followed by technically identical back-offs.',
          exercises: [
            ['Competition deadlift', '1+4', '3 @ RPE 8 + 4x3', '3 min', 'Reset every rep.'],
            ['Paused deadlift below knee', '3', '3', '2-3 min', 'Hold the bar close for 2 seconds.'],
            ['Chest-supported row', '4', '8-10', '90 sec', 'Avoid more unsupported spinal loading.'],
            ['Weighted plank', '3', '35 sec', '60 sec', 'Brace and breathe.']
          ]
        },
        {
          title: 'Day 2 - Upper Strength',
          meta: '60-70 minutes. Heavy upper work with minimal lower fatigue.',
          exercises: [
            ['Bench press', '5', '4-6', '2 min', 'Strong setup.'],
            ['Weighted pull-up', '5', '4-6', '2 min', 'Full range.'],
            ['Seated dumbbell press', '3', '8-10', '90 sec', 'No leg drive.'],
            ['Seal row', '3', '10', '75 sec', 'Pause at top.']
          ]
        },
        {
          title: 'Day 3 - Position Pull',
          meta: '70 minutes. Alternate deficit and block emphasis between training blocks.',
          exercises: [
            ['Deficit deadlift', '4', '4', '2-3 min', 'Use a small deficit and maintain start position.'],
            ['Block pull below knee', '4', '4', '2-3 min', 'Do not lean back at lockout.'],
            ['Front squat', '4', '5-7', '2 min', 'Upright brace.'],
            ['Suitcase carry', '4', '35 m/side', '60 sec', 'Resist lateral flexion.']
          ]
        },
        {
          title: 'Day 4 - Speed and Posterior Chain',
          meta: '65 minutes. All speed pulls should look faster than competition work.',
          exercises: [
            ['Speed deadlift', '10', '1', '45-60 sec', 'Use 60-70%; add bands only with experience.'],
            ['Romanian deadlift', '3', '6-8', '2 min', 'Controlled eccentric.'],
            ['Nordic hamstring curl', '4', '4-6', '90 sec', 'Use assistance.'],
            ['Reverse sled drag', '6', '25 m', '60 sec', 'Low-impact conditioning.']
          ]
        }
      ]
    },
    {
      name: 'Squat Bench Frequency Project',
      project: 'strength-reset',
      keywords: 'squat bench frequency powerlifting advanced technique competition lift',
      goal: 'strength muscle',
      level: 'advanced',
      place: 'gym',
      schedule: '5 days/week',
      block: '10 weeks',
      summary: 'A high-frequency technical project exposing squat and bench variations across five managed days.',
      bestFor: 'advanced powerlifters who recover well from frequent practice',
      equipment: 'power rack, competition bench, barbells and specialty bars optional',
      split: 'Heavy squat and bench, bench volume, squat technique, bench intensity and combined speed day.',
      focus: 'Frequent submaximal practice, variation-specific weak-point work and precise fatigue control.',
      progression: 'Increase weekly average load slowly while keeping most sets at RPE 6-8; deload every fourth week.',
      note: 'Frequency is used for skill, not daily maximal effort. Reduce sets before reducing movement quality, and keep shoulder and knee comfort monitored.',
      sessions: [
        {
          title: 'Day 1 - Heavy Squat and Bench',
          meta: '75 minutes. Controlled top sets with no missed repetitions.',
          exercises: [
            ['Competition squat', '1+4', '3 @ RPE 8 + 4x3', '3 min', 'Consistent commands and depth.'],
            ['Competition bench press', '1+4', '3 @ RPE 8 + 4x4', '2-3 min', 'Consistent pause.'],
            ['Romanian deadlift', '3', '7', '2 min', 'Moderate accessory load.'],
            ['Lat pulldown', '3', '10-12', '75 sec', 'Full reach.']
          ]
        },
        {
          title: 'Day 2 - Bench Volume',
          meta: '60 minutes. Submaximal volume and upper-back support.',
          exercises: [
            ['Bench press', '6', '5 @ RPE 7', '2 min', 'Every rep uses the same touch point.'],
            ['Close-grip bench press', '3', '8', '90 sec', 'Keep wrists stacked.'],
            ['Chest-supported row', '4', '10', '75 sec', 'Pause at top.'],
            ['Cable external rotation', '3', '15/side', '45 sec', 'Light and controlled.']
          ]
        },
        {
          title: 'Day 3 - Squat Technique',
          meta: '60-70 minutes. Low fatigue and high positional precision.',
          exercises: [
            ['Tempo squat 3-1-X', '5', '4 @ RPE 6-7', '2 min', 'Maintain brace through the pause.'],
            ['Paused front squat', '3', '5', '2 min', 'Elbows high.'],
            ['Bench press technique singles', '6', '1 @ RPE 6', '60 sec', 'Fast, paused and identical.'],
            ['Copenhagen plank', '3', '25 sec/side', '45 sec', 'Level hips.']
          ]
        },
        {
          title: 'Day 4 - Bench Intensity',
          meta: '65 minutes. Heavy bench exposure with reduced volume.',
          exercises: [
            ['Competition bench press', '5', '2 @ RPE 8', '2-3 min', 'No grinders.'],
            ['Two-board or pin press', '4', '4', '2 min', 'Use a controlled dead stop.'],
            ['Weighted chin-up', '4', '6', '2 min', 'Full range.'],
            ['Cable pressdown', '3', '12-15', '45 sec', 'Elbows fixed.']
          ]
        },
        {
          title: 'Day 5 - Combined Speed',
          meta: '60 minutes. Use light loads and aggressive intent.',
          exercises: [
            ['Speed squat', '8', '2', '60 sec', 'Use 55-65%; identical depth.'],
            ['Speed bench press', '9', '3', '45-60 sec', 'Use 50-60%; pause the first rep.'],
            ['Trap-bar jump', '5', '3', '75 sec', 'Light load and controlled landing.'],
            ['Farmer carry', '4', '40 m', '60 sec', 'Heavy but posture stays tall.']
          ]
        }
      ]
    }
  ];
});
