(function (root, factory) {
  const templates = factory();
  if (typeof module === 'object' && module.exports) module.exports = templates;
  if (root) root.GB_RACE_SPECIALIST_TEMPLATES = templates;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  return [
    {
      name: 'HYROX Compromised 1K Pace Lab',
      project: 'hyrox-race-prep',
      keywords: 'hyrox 1km compromised running threshold ski erg row sled wall balls race pace',
      goal: 'fat-loss strength',
      level: 'intermediate',
      place: 'gym',
      schedule: '4 days/week',
      block: '10 weeks',
      summary: 'A running-first HYROX plan that teaches athletes to repeat controlled 1 km efforts after demanding stations.',
      bestFor: 'HYROX athletes whose run pace fades after stations',
      equipment: 'track or treadmill, SkiErg, rower, sled and wall ball',
      split: 'One pure run session, one strength day, one compromised run-station day and one aerobic technique day.',
      focus: 'Repeatable 1 km pacing, fast Roxzone-style transitions and station work that does not destroy the next run.',
      progression: 'Add one compromised repeat every two weeks, then reduce volume during the final seven days.',
      note: 'HYROX uses eight 1 km runs separated by eight stations. Use the load prescribed for your official division and train transitions without sprinting the opening kilometres.',
      sessions: [
        {
          title: 'Day 1 - Repeatable 1K Running',
          meta: '55-70 minutes. Keep all repetitions within a narrow pace range.',
          exercises: [
            ['Easy run and drills', '1', '12 min', 'None', 'Finish with 3 x 20 sec relaxed strides.'],
            ['1 km repeats', '5-7', 'Target HYROX run pace', '2 min easy jog', 'The final repeat should be no more than 5 sec slower than the first.'],
            ['Treadmill incline walk', '3', '2 min', '60 sec', 'Use moderate incline to build calf and hip durability.'],
            ['Standing calf raise', '3', '12-15', '45 sec', 'Pause at the top and use full range.'],
            ['Tibialis raise', '3', '15-20', '30 sec', 'Keep heels planted and control every repetition.']
          ]
        },
        {
          title: 'Day 2 - Station Strength Reserve',
          meta: '60 minutes. Build enough strength that race loads feel submaximal.',
          exercises: [
            ['Front squat', '4', '5', '2 min', 'Leave two repetitions in reserve.'],
            ['Heavy sled push', '6', '12.5 m', '90 sec', 'Use short powerful steps and consistent lane turns.'],
            ['Sled pull', '6', '12.5 m', '90 sec', 'Stay low, keep the rope organized and walk backward quickly.'],
            ['Farmer carry', '4', '50 m', '75 sec', 'Train clean pick-ups and relaxed breathing.'],
            ['Wall ball', '4', '15-20', '60 sec', 'Use the official target height and division ball when available.']
          ]
        },
        {
          title: 'Day 3 - Compromised Run Blocks',
          meta: '65-80 minutes. Rehearse calm transitions into the run.',
          exercises: [
            ['1 km run + SkiErg', '2', '1 km + 500 m', '90 sec', 'Settle into pace in the first 200 m after the erg.'],
            ['1 km run + sled push', '2', '1 km + 25 m', '2 min', 'Do not overstride when leaving the sled.'],
            ['1 km run + row', '2', '1 km + 500 m', '90 sec', 'Use an efficient row cadence and quick foot release.'],
            ['1 km run + wall balls', '1', '1 km + 40 reps', 'None', 'Finish with planned sets such as 15-15-10.'],
            ['Easy cooldown', '1', '8 min', 'None', 'Walk until breathing is controlled.']
          ]
        },
        {
          title: 'Day 4 - Aerobic Support and Skills',
          meta: '45-60 minutes. This day should improve recovery, not create soreness.',
          exercises: [
            ['Zone 2 run or bike', '1', '35-45 min', 'None', 'Keep a conversational effort.'],
            ['Burpee broad jump technique', '5', '10 m', '45 sec', 'Use repeatable steps and land under control.'],
            ['Sandbag walking lunge', '4', '20 m', '60 sec', 'Keep the bag secure and avoid excessive forward lean.'],
            ['Dead bug with pulldown', '3', '8/side', '30 sec', 'Exhale fully while keeping the lower back controlled.'],
            ['Hip and ankle mobility', '1', '8 min', 'None', 'Prioritise the positions that limit running or lunges.']
          ]
        }
      ]
    },
    {
      name: 'HYROX Sled Power Specialist',
      project: 'hyrox-race-prep',
      keywords: 'hyrox sled push sled pull strength power 50m race load rope grip',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A targeted block for the 50 m sled push and 50 m sled pull while preserving the running needed around them.',
      bestFor: 'athletes losing excessive time on HYROX sled stations',
      equipment: 'competition-style sled, rope, plates, rack and running route',
      split: 'Push strength, pull strength, compromised sled intervals and aerobic recovery.',
      focus: 'Start mechanics, lane turns, rope management, leg drive and returning to run cadence after heavy work.',
      progression: 'Build distance at division load before adding overload; peak with short efforts slightly above race load.',
      note: 'Sled friction changes between surfaces. Record the venue, surface and total load, and prioritise movement quality over copying a number from another gym.',
      sessions: [
        {
          title: 'Day 1 - Sled Push Force',
          meta: '60-70 minutes. Warm calves, hips and trunk before loading the sled.',
          exercises: [
            ['Back squat', '5', '4', '2-3 min', 'Drive through the full foot and stop before grinding.'],
            ['Heavy sled push', '8', '12.5 m', '90 sec', 'Practice the exact start and lane turn used in racing.'],
            ['Race-load sled push', '4', '25 m', '90 sec', 'Hold an even speed across both lengths.'],
            ['Rear-foot elevated split squat', '3', '8/side', '75 sec', 'Keep the front foot planted and torso stable.'],
            ['Soleus calf raise', '3', '15', '45 sec', 'Use a bent knee and controlled tempo.']
          ]
        },
        {
          title: 'Day 2 - Sled Pull and Grip',
          meta: '60 minutes. Set the rope safely before every repetition.',
          exercises: [
            ['Trap-bar deadlift', '4', '5', '2 min', 'Build posterior-chain strength without maximal fatigue.'],
            ['Sled pull', '8', '12.5 m', '90 sec', 'Pull hand over hand, then retreat with fast controlled steps.'],
            ['Race-load sled pull', '4', '25 m', '90 sec', 'Keep the rope inside the lane and avoid tangles.'],
            ['Chest-supported row', '4', '8-10', '75 sec', 'Pause with the shoulder blades retracted.'],
            ['Heavy farmer hold', '4', '35 sec', '60 sec', 'Brace and keep shoulders level.']
          ]
        },
        {
          title: 'Day 3 - Run Sled Run',
          meta: '65 minutes. Use race shoes only if the surface provides safe traction.',
          exercises: [
            ['1 km controlled run', '2', 'Target race pace', '60 sec', 'Finish ready to push rather than sprinting.'],
            ['Sled push', '2', '50 m total', '90 sec', 'Break only at the lane turn if possible.'],
            ['1 km controlled run', '2', 'Target race pace', '60 sec', 'Shorten stride briefly until the legs recover.'],
            ['Sled pull', '2', '50 m total', '2 min', 'Use the same rope strategy every round.'],
            ['Easy jog', '1', '10 min', 'None', 'Return breathing and gait to normal.']
          ]
        },
        {
          title: 'Day 4 - Aerobic Recovery and Mobility',
          meta: '45-55 minutes. Stay well below threshold.',
          exercises: [
            ['Zone 2 run', '1', '35 min', 'None', 'Keep breathing conversational.'],
            ['Backward sled drag', '5', '25 m', '45 sec', 'Use a light load and continuous short steps.'],
            ['Copenhagen plank', '3', '20 sec/side', '30 sec', 'Use a short lever if needed.'],
            ['Half-kneeling ankle mobilisation', '3', '8/side', '20 sec', 'Keep the heel down.'],
            ['Easy calf and hip mobility', '1', '8 min', 'None', 'Do not force end range.']
          ]
        }
      ]
    },
    {
      name: 'HYROX Erg Transition Specialist',
      project: 'hyrox-race-prep',
      keywords: 'hyrox skierg row 1000m transition pacing erg efficiency compromised run',
      goal: 'fat-loss strength',
      level: 'intermediate',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'Specific 1,000 m SkiErg and rowing work with fast setup, sustainable pacing and controlled runs off each machine.',
      bestFor: 'athletes who overpace the ergs or lose time in setup and exit',
      equipment: 'SkiErg, rower, treadmill or track and basic strength kit',
      split: 'SkiErg technique, rowing efficiency, combined transitions and full-body strength.',
      focus: 'Damper choice, stroke economy, strap and handle setup, negative splits and the first 200 m of running after each erg.',
      progression: 'Reduce pace variation before reducing total time; add compromised running only when erg technique stays consistent.',
      note: 'HYROX places the 1,000 m SkiErg first and the 1,000 m row fifth. Train both at a pace that protects the next run rather than chasing standalone personal bests.',
      sessions: [
        {
          title: 'Day 1 - SkiErg Economy',
          meta: '50-60 minutes. Use one repeatable damper setting.',
          exercises: [
            ['Easy SkiErg', '1', '8 min', 'None', 'Practice long relaxed strokes.'],
            ['SkiErg intervals', '5', '500 m', '90 sec', 'Keep each split within two seconds per 500 m.'],
            ['SkiErg race rehearsal', '2', '1,000 m', '3 min', 'Start controlled and finish slightly faster.'],
            ['Straight-arm pulldown', '3', '12', '45 sec', 'Connect lats to a braced trunk.'],
            ['Pallof press', '3', '10/side', '30 sec', 'Keep ribs stacked over pelvis.']
          ]
        },
        {
          title: 'Day 2 - Row Efficiency',
          meta: '50-60 minutes. Make every transition into and out of the foot straps deliberate.',
          exercises: [
            ['Easy row', '1', '8 min', 'None', 'Build from legs to body to arms.'],
            ['Row intervals', '4', '750 m', '2 min', 'Hold a sustainable stroke rate and even split.'],
            ['Row race rehearsal', '2', '1,000 m', '3 min', 'Avoid an aggressive first 200 m.'],
            ['Romanian deadlift', '3', '8', '90 sec', 'Build hinge endurance with a neutral spine.'],
            ['Seated cable row', '3', '10-12', '60 sec', 'Finish without shrugging.']
          ]
        },
        {
          title: 'Day 3 - Erg to Run Transitions',
          meta: '65 minutes. Time setup and exit as well as work intervals.',
          exercises: [
            ['1 km run + SkiErg', '3', '1 km + 500 m', '90 sec', 'Use quick controlled steps leaving the machine.'],
            ['1 km run + row', '3', '1 km + 500 m', '90 sec', 'Release straps cleanly without looking down for too long.'],
            ['SkiErg to run', '2', '750 m + 400 m', '75 sec', 'Match the opening run pace to tired legs.'],
            ['Row to run', '2', '750 m + 400 m', '75 sec', 'Stand smoothly before accelerating.'],
            ['Walk cooldown', '1', '8 min', 'None', 'Track how quickly breathing settles.']
          ]
        },
        {
          title: 'Day 4 - Full-Body Support',
          meta: '55 minutes. Moderate loads and no missed repetitions.',
          exercises: [
            ['Front squat', '4', '6', '90 sec', 'Stay upright and leave two reps in reserve.'],
            ['Push press', '3', '8', '75 sec', 'Use a vertical dip and stable overhead finish.'],
            ['Weighted step-up', '3', '10/side', '60 sec', 'Drive through the working leg.'],
            ['Farmer carry', '4', '50 m', '60 sec', 'Keep grip relaxed enough to breathe.'],
            ['Easy bike', '1', '12 min', 'None', 'Finish with low-intensity circulation.']
          ]
        }
      ]
    },
    {
      name: 'HYROX Lunge Wall-Ball Finish Builder',
      project: 'hyrox-race-prep',
      keywords: 'hyrox sandbag lunges 100m wall balls 100 finish station squat endurance',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A late-race specialist plan for the 100 m sandbag lunge and 100-wall-ball finish under accumulated fatigue.',
      bestFor: 'athletes who reach the final two stations but lose movement quality',
      equipment: 'division sandbag, wall ball and target, rack, track or treadmill',
      split: 'Lunge strength, wall-ball capacity, late-race simulation and recovery running.',
      focus: 'Efficient sandbag position, legal lunge standards, planned wall-ball breaks and calm breathing at the finish.',
      progression: 'Increase unbroken quality in small steps, then practise the full prescribed distance and repetitions every other week.',
      note: 'Train with your division ball, target and sandbag when possible. Stop sets when depth, target accuracy or lunge control no longer meets the event standard.',
      sessions: [
        {
          title: 'Day 1 - Sandbag Lunge Durability',
          meta: '55-65 minutes. Accumulate clean distance before loading heavier.',
          exercises: [
            ['Front squat', '4', '6', '2 min', 'Use full controlled depth.'],
            ['Sandbag walking lunge', '5', '20 m', '75 sec', 'Practise secure bag placement and complete knee contact.'],
            ['Reverse lunge', '3', '10/side', '60 sec', 'Keep balance and even foot pressure.'],
            ['Step-up', '3', '12/side', '60 sec', 'Control the lowering phase.'],
            ['Suitcase carry', '3', '40 m/side', '45 sec', 'Resist side bending.']
          ]
        },
        {
          title: 'Day 2 - Wall-Ball Capacity',
          meta: '50-60 minutes. Choose a break plan before every long set.',
          exercises: [
            ['Wall-ball technique', '5', '15', '45 sec', 'Hit the target consistently and let the legs drive the throw.'],
            ['Wall-ball density block', '1', '60 reps in planned sets', 'As planned', 'Compare 20-15-15-10 with smaller repeatable sets.'],
            ['Thruster', '3', '8', '90 sec', 'Use a moderate load and continuous rhythm.'],
            ['Goblet squat', '3', '12', '60 sec', 'Maintain upright posture.'],
            ['Breathing recovery drill', '5', '45 sec', '30 sec', 'Walk and regain nasal breathing between sets.']
          ]
        },
        {
          title: 'Day 3 - Final Two Stations Simulation',
          meta: '65-75 minutes. Practise this in race order.',
          exercises: [
            ['1 km run', '1', 'Controlled race pace', '30 sec', 'Finish ready to lunge.'],
            ['Sandbag walking lunge', '1', '100 m', '60 sec', 'Use planned micro-breaks without dropping posture.'],
            ['1 km run', '1', 'Controlled race pace', '30 sec', 'Settle cadence before accelerating.'],
            ['Wall ball', '1', '100 reps', 'As planned', 'Follow a preselected break strategy and record misses.'],
            ['Walk cooldown', '1', '10 min', 'None', 'Continue moving until breathing normalises.']
          ]
        },
        {
          title: 'Day 4 - Easy Run and Tissue Capacity',
          meta: '45-55 minutes. Keep soreness low.',
          exercises: [
            ['Zone 2 run', '1', '30-40 min', 'None', 'Conversational pace.'],
            ['Spanish squat hold', '4', '30 sec', '30 sec', 'Keep torso upright and use a pain-free depth.'],
            ['Single-leg calf raise', '3', '12/side', '30 sec', 'Use full range.'],
            ['Side plank', '3', '30 sec/side', '30 sec', 'Keep hips stacked.'],
            ['Hip flexor and ankle mobility', '1', '8 min', 'None', 'Use gentle controlled positions.']
          ]
        }
      ]
    },
    {
      name: 'HYROX Four-Person Relay Speed Plan',
      project: 'hyrox-race-prep',
      keywords: 'hyrox relay four person team 2x1km station handoff speed strategy',
      goal: 'fat-loss strength',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A four-person HYROX relay plan built around two allocated run-station legs per athlete, station ownership and fast handoffs.',
      bestFor: 'relay teams that can train together once or twice per week',
      equipment: 'full HYROX station setup, track and four teammates',
      split: 'Individual speed, individual strength, team station practice and relay rehearsal.',
      focus: 'Assigning stations by strength, repeatable 1 km speed, warm-up timing and clean changeovers.',
      progression: 'Develop each athlete’s two legs separately, then combine all eight legs in race order during the peak phase.',
      note: 'Confirm the current relay rules and station loads for the entered division. Every athlete should know both allocated run-station legs and the backup plan before race week.',
      sessions: [
        {
          title: 'Day 1 - Individual 1K Speed',
          meta: '50-60 minutes. Each athlete completes this independently.',
          exercises: [
            ['Easy run and strides', '1', '12 min', 'None', 'Finish with 4 x 20 sec strides.'],
            ['1 km repeats', '4-6', 'Relay target pace', '2 min', 'Run fast but keep every repetition repeatable.'],
            ['400 m fast finish', '4', 'Faster than relay pace', '75 sec', 'Stay relaxed through shoulders and hands.'],
            ['Walking lunge', '3', '12/side', '45 sec', 'Build basic leg durability.'],
            ['Calf raise', '3', '15', '30 sec', 'Control both directions.']
          ]
        },
        {
          title: 'Day 2 - Assigned Station Strength',
          meta: '55-70 minutes. Athletes prioritise their two assigned stations.',
          exercises: [
            ['Primary station practice', '5', '25-50% race volume', '90 sec', 'Match the exact movement standard.'],
            ['Secondary station practice', '5', '25-50% race volume', '90 sec', 'Develop a repeatable work and break plan.'],
            ['Front squat or trap-bar deadlift', '4', '5', '2 min', 'Choose the lift that supports assigned stations.'],
            ['Farmer carry', '4', '50 m', '60 sec', 'All athletes maintain grip and trunk capacity.'],
            ['Pallof press', '3', '10/side', '30 sec', 'Brace without holding breath.']
          ]
        },
        {
          title: 'Day 3 - Team Handoffs and Station Order',
          meta: '60 minutes. All four athletes attend.',
          exercises: [
            ['Warm-up timing rehearsal', '1', '15 min', 'None', 'Stagger individual preparation around expected handoffs.'],
            ['400 m run + station segment', '8', 'One per race station', '60 sec', 'Each athlete practises entry, work and exit.'],
            ['Relay changeover rehearsal', '8', '20-30 sec', '30 sec', 'Use clear verbal cues and know where to wait.'],
            ['Team wall-ball sets', '1', '100 total reps', 'As planned', 'Only assigned athlete works; team tracks standards and counting.'],
            ['Team review', '1', '10 min', 'None', 'Record station owners, targets and backup assignments.']
          ]
        },
        {
          title: 'Day 4 - Broken Relay Rehearsal',
          meta: '70-90 minutes. Perform at 70-85% before the final peak rehearsal.',
          exercises: [
            ['Legs 1-2', '1', '2 x 1 km + stations 1-2', '3 min', 'Athletes execute the first two planned legs in order.'],
            ['Legs 3-4', '1', '2 x 1 km + stations 3-4', '3 min', 'Practise warm-up and handoff timing.'],
            ['Legs 5-6', '1', '2 x 1 km + stations 5-6', '3 min', 'Keep the waiting athletes warm without fatigue.'],
            ['Legs 7-8', '1', '2 x 1 km + stations 7-8', 'None', 'Use the intended finish strategy.'],
            ['Team cooldown and review', '1', '12 min', 'None', 'Capture splits, penalties and transition delays.']
          ]
        }
      ]
    },
    {
      name: 'TRYKA 500 First Race Path',
      project: 'tryka-race-prep',
      keywords: 'tryka 500 beginner 8x500m first race skierg farmers ram thrusters sled row lunges burpees',
      goal: 'fat-loss strength',
      level: 'beginner',
      place: 'home gym',
      schedule: '3 days/week',
      block: '8 weeks',
      summary: 'A first-race plan for TRYKA 500 athletes learning eight 500 m runs and the official station sequence progressively.',
      bestFor: 'first-time hybrid racers entering TRYKA 500',
      equipment: 'running route plus gym stations or safe home substitutions',
      split: 'Run development, station fundamentals and a progressive mini-race flow.',
      focus: 'Even 500 m pacing, movement standards, manageable station sets and confidence moving through the TRY Zone.',
      progression: 'Add one run-station pairing at a time until all eight are familiar; reduce volume in race week.',
      note: 'TRYKA 500 uses eight 500 m runs with modified workouts. Confirm the current event rulebook for your prescribed station loads and volumes before the final rehearsals.',
      sessions: [
        {
          title: 'Day 1 - 500 m Run Foundation',
          meta: '40-50 minutes. All repeats should feel controlled.',
          exercises: [
            ['Brisk walk and easy jog', '1', '10 min', 'None', 'Build gradually into running.'],
            ['500 m run repeats', '4-6', 'Comfortably hard', '90 sec walk', 'Keep the last repeat close to the first.'],
            ['Step-up', '3', '10/side', '45 sec', 'Use a stable box and full foot contact.'],
            ['Farmer carry', '4', '30 m', '45 sec', 'Walk tall with steady breathing.'],
            ['Easy walk cooldown', '1', '8 min', 'None', 'Finish fully in control.']
          ]
        },
        {
          title: 'Day 2 - TRYKA Station Fundamentals',
          meta: '50-60 minutes. Technique before speed or load.',
          exercises: [
            ['SkiErg or band pulldown', '4', '250 m or 60 sec', '60 sec', 'Use a long stroke and stable trunk.'],
            ['RAM thruster or light goblet thruster', '4', '10', '60 sec', 'Squat smoothly and finish overhead.'],
            ['Sled push and pull or loaded march', '4', '12.5 m each', '75 sec', 'Use short controlled steps.'],
            ['Walking lunge', '3', '16 steps', '45 sec', 'Keep balance and gentle knee contact.'],
            ['Burpee broad jump', '4', '8 m', '60 sec', 'Step down if needed and land softly.']
          ]
        },
        {
          title: 'Day 3 - Progressive TRYKA 500 Flow',
          meta: '50-70 minutes. Begin with four pairings and build toward eight.',
          exercises: [
            ['500 m + SkiErg', '1', '500 m + practice volume', '90 sec', 'Start slower than you think.'],
            ['500 m + farmer carry', '1', '500 m + practice volume', '90 sec', 'Use a load that preserves posture.'],
            ['500 m + thrusters', '1', '500 m + practice volume', '90 sec', 'Break before technique deteriorates.'],
            ['500 m + sled or home swap', '1-2', '500 m + practice volume', '90 sec', 'Add push and pull across the training block.'],
            ['500 m + row/lunge/burpee rotation', '1-3', '500 m + one station', 'As needed', 'Add later stations gradually rather than all at once.']
          ]
        }
      ]
    },
    {
      name: 'TRYKA 800 Open Pace Builder',
      project: 'tryka-race-prep',
      keywords: 'tryka open 800 8x800m pacing station order race simulation sprint finish',
      goal: 'fat-loss strength',
      level: 'intermediate',
      place: 'gym',
      schedule: '4 days/week',
      block: '10 weeks',
      summary: 'A complete TRYKA Open plan for eight repeatable 800 m runs, all eight stations and the 40 m sprint finish.',
      bestFor: 'TRYKA Open athletes targeting an even full-course performance',
      equipment: 'track, SkiErg, sled, rower, farmer handles, RAM and lunge space',
      split: '800 m run quality, stations 1-4, stations 5-8 and race-flow practice.',
      focus: 'Correct station order, repeatable running, fast transitions and enough reserve for the final burpee broad jumps and sprint.',
      progression: 'Build from four to eight run-station pairings, then taper total work while retaining short race-paced efforts.',
      note: 'TRYKA Open alternates eight 800 m runs with SkiErg, farmer carry, RAM thrusters, sled push, sled pull, row, walking lunges and burpee broad jumps before a 40 m sprint finish.',
      sessions: [
        {
          title: 'Day 1 - Repeatable 800 m Running',
          meta: '55-70 minutes. Pace consistency matters more than the fastest repetition.',
          exercises: [
            ['Easy run and drills', '1', '12 min', 'None', 'Add 3 relaxed strides.'],
            ['800 m repeats', '6-8', 'TRYKA target pace', '90 sec easy jog', 'Keep all repetitions within five seconds.'],
            ['200 m relaxed fast', '4', 'Fast but smooth', '60 sec', 'Practise speed for the final sprint without straining.'],
            ['Single-leg calf raise', '3', '12/side', '30 sec', 'Control full range.'],
            ['Side plank', '3', '30 sec/side', '30 sec', 'Keep a straight line from shoulder to ankle.']
          ]
        },
        {
          title: 'Day 2 - Stations 1 to 4',
          meta: '60-70 minutes. Practise the official opening order.',
          exercises: [
            ['SkiErg', '3', '1,000 m', '2 min', 'Use an even pace that protects the next run.'],
            ['Farmer carry', '4', '50 m', '60 sec', 'Four lengths equal the 200 m race distance.'],
            ['RAM thruster', '5', '12', '60 sec', 'Five sets build the 60-rep station in quality chunks.'],
            ['Sled push', '4', '12.5 m', '75 sec', 'Practise starts and lane turns for 50 m total.'],
            ['800 m easy-moderate run', '4', 'Between stations', '60 sec', 'Settle pace quickly after each movement.']
          ]
        },
        {
          title: 'Day 3 - Stations 5 to 8',
          meta: '60-75 minutes. Preserve technique through the late stations.',
          exercises: [
            ['Sled pull', '4', '12.5 m', '75 sec', 'Keep rope organized for 50 m total.'],
            ['Row', '2', '1,000 m', '2 min', 'Hold a sustainable stroke rate.'],
            ['Walking lunge', '5', '20 m', '60 sec', 'Accumulate the 100 m race demand with clean steps.'],
            ['Burpee broad jump', '4', '20 m', '75 sec', 'Use repeatable jump length for 80 m total.'],
            ['40 m sprint', '4', '40 m', '90 sec', 'Run fast only when landing mechanics remain safe.']
          ]
        },
        {
          title: 'Day 4 - Broken TRYKA Open Simulation',
          meta: '75-95 minutes. Use 70-85% station volume until the peak weeks.',
          exercises: [
            ['Runs and stations 1-2', '1', '2 x 800 m + SkiErg/carry', '2 min', 'Follow exact race order.'],
            ['Runs and stations 3-4', '1', '2 x 800 m + thruster/push', '2 min', 'Keep transitions calm and deliberate.'],
            ['Runs and stations 5-6', '1', '2 x 800 m + pull/row', '2 min', 'Avoid overpacing the row.'],
            ['Runs and stations 7-8', '1', '2 x 800 m + lunge/burpee', 'None', 'Protect movement standards under fatigue.'],
            ['Sprint finish', '1', '40 m', 'None', 'Accelerate only after clearing the final station safely.']
          ]
        }
      ]
    },
    {
      name: 'TRYKA RAM Thruster Power Lab',
      project: 'tryka-race-prep',
      keywords: 'tryka ram thrusters 60 reps strength squat press 800m compromised running',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A station-specialist block for completing 60 RAM thrusters efficiently before returning to the fourth 800 m run.',
      bestFor: 'TRYKA athletes limited by RAM-thruster strength or pacing',
      equipment: 'official-style RAM or suitable training substitute, rack and running route',
      split: 'Strength, thruster capacity, compromised run-thruster work and aerobic support.',
      focus: 'Efficient clean position, squat rhythm, overhead finish, planned breaks and the 800 m run immediately after the station.',
      progression: 'Build quality sets of 10-15, then reduce breaks across the full 60 repetitions without changing the movement standard.',
      note: 'Use the load specified for your current TRYKA division and confirm the movement standard in the current rulebook. A barbell or sandbag substitute should be used only for training preparation.',
      sessions: [
        {
          title: 'Day 1 - Thruster Strength Reserve',
          meta: '60 minutes. Use submaximal loads and technically clean repetitions.',
          exercises: [
            ['Front squat', '5', '5', '2 min', 'Keep elbows high and torso upright.'],
            ['Push press', '4', '6', '90 sec', 'Use leg drive and stable overhead position.'],
            ['RAM thruster', '5', '8', '75 sec', 'Use a smooth squat-to-press transition.'],
            ['Walking lunge', '3', '12/side', '60 sec', 'Maintain balance and even steps.'],
            ['Front rack carry', '4', '30 m', '60 sec', 'Brace while continuing to breathe.']
          ]
        },
        {
          title: 'Day 2 - Sixty-Rep Strategy',
          meta: '45-55 minutes. Test break patterns without reaching failure.',
          exercises: [
            ['RAM thruster warm-up', '3', '8', '45 sec', 'Increase to race load gradually.'],
            ['RAM thruster', '1', '60 reps', 'Planned breaks', 'Compare 15-15-15-15 with smaller repeatable sets.'],
            ['RAM thruster density', '5', '10', '45 sec', 'Keep every set technically identical.'],
            ['Goblet squat', '3', '15', '60 sec', 'Build leg endurance with full depth.'],
            ['Easy SkiErg', '1', '10 min', 'None', 'Flush the legs and keep effort low.']
          ]
        },
        {
          title: 'Day 3 - Run Thruster Run',
          meta: '60-70 minutes. This rehearses station three in race context.',
          exercises: [
            ['800 m run', '3', 'Target race pace', '30 sec', 'Finish ready to lift.'],
            ['RAM thruster', '3', '20 reps', '60 sec', 'Use the intended race break strategy.'],
            ['800 m run after thrusters', '3', 'Controlled pace', '90 sec', 'Use short steps until breathing settles.'],
            ['Farmer carry', '3', '50 m', '60 sec', 'Maintain grip without excessive tension.'],
            ['Walk cooldown', '1', '8 min', 'None', 'Return heart rate gradually.']
          ]
        },
        {
          title: 'Day 4 - Aerobic and Shoulder Support',
          meta: '45-55 minutes. Low soreness and stable shoulders.',
          exercises: [
            ['Zone 2 run', '1', '35 min', 'None', 'Conversational pace.'],
            ['Landmine press', '3', '10/side', '60 sec', 'Reach without shrugging.'],
            ['Cable row', '3', '12', '60 sec', 'Control shoulder blades.'],
            ['Face pull', '3', '15', '45 sec', 'Pull toward eye level.'],
            ['Thoracic mobility', '1', '8 min', 'None', 'Move slowly through comfortable range.']
          ]
        }
      ]
    },
    {
      name: 'TRYKA Sled to Row Strength Endurance',
      project: 'tryka-race-prep',
      keywords: 'tryka sled push 50m sled pull 50m row 1000m stations 4 5 6 800m',
      goal: 'strength fat-loss',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A specific block for TRYKA stations four to six: 50 m sled push, 50 m sled pull and 1,000 m row with 800 m runs between.',
      bestFor: 'athletes fading through the middle of the TRYKA course',
      equipment: 'sled, rope, rower, plates and 800 m running route',
      split: 'Sled push strength, sled pull and row, middle-course simulation and recovery conditioning.',
      focus: 'Leg drive, rope management, rowing economy and recovering run cadence after consecutive heavy stations.',
      progression: 'Reach full station distance at division load, then increase the number of complete middle-course sequences.',
      note: 'Train prescribed division loads and document sled surface because friction changes the effective demand. Keep the row sustainable enough to protect station seven and eight.',
      sessions: [
        {
          title: 'Day 1 - Sled Push Strength',
          meta: '60-70 minutes. Practise clean starts and lane turns.',
          exercises: [
            ['Back squat', '5', '4-5', '2 min', 'Leave one to two reps in reserve.'],
            ['Heavy sled push', '6', '12.5 m', '90 sec', 'Short forceful steps.'],
            ['Race-load sled push', '4', '25 m', '90 sec', 'Combine two efforts for the 50 m station.'],
            ['Split squat', '3', '8/side', '75 sec', 'Use stable full-foot pressure.'],
            ['Backward sled drag', '4', '25 m', '60 sec', 'Continuous steps with a light load.']
          ]
        },
        {
          title: 'Day 2 - Sled Pull and Row',
          meta: '60-70 minutes. Organise rope and rower setup before starting.',
          exercises: [
            ['Trap-bar deadlift', '4', '5', '2 min', 'Build posterior-chain reserve.'],
            ['Sled pull', '4', '25 m', '90 sec', 'Use consistent hand-over-hand pulls.'],
            ['Row', '4', '500 m', '90 sec', 'Hold an even stroke rate.'],
            ['Sled pull to row', '3', '12.5 m + 500 m', '2 min', 'Move smoothly between stations.'],
            ['Chest-supported row', '3', '10', '60 sec', 'Pause each repetition.']
          ]
        },
        {
          title: 'Day 3 - TRYKA Middle-Course Sequence',
          meta: '70-85 minutes. Follow the exact station order.',
          exercises: [
            ['800 m run + sled push', '1-2', '800 m + 50 m', '90 sec', 'Do not sprint into the sled.'],
            ['800 m run + sled pull', '1-2', '800 m + 50 m', '90 sec', 'Set the rope before the clocked practice begins.'],
            ['800 m run + row', '1-2', '800 m + 1,000 m', '2 min', 'Use a controlled first 250 m on the rower.'],
            ['800 m recovery run', '1', 'Easy-moderate', 'None', 'Practise returning to rhythm for station seven.'],
            ['Walk cooldown', '1', '10 min', 'None', 'Track run and station splits.']
          ]
        },
        {
          title: 'Day 4 - Aerobic Recovery and Trunk',
          meta: '45-55 minutes. Keep fatigue low.',
          exercises: [
            ['Zone 2 bike or run', '1', '35-40 min', 'None', 'Conversational effort.'],
            ['Farmer carry', '4', '50 m', '60 sec', 'Walk tall with quiet steps.'],
            ['Pallof press', '3', '10/side', '30 sec', 'Resist rotation.'],
            ['Dead bug', '3', '8/side', '30 sec', 'Move slowly while exhaling.'],
            ['Ankle and hip mobility', '1', '8 min', 'None', 'Use comfortable ranges.']
          ]
        }
      ]
    },
    {
      name: 'TRYKA Four-Person Relay Speed Plan',
      project: 'tryka-race-prep',
      keywords: 'tryka relay four person 2x800m two stations team handoff sprint finish',
      goal: 'fat-loss strength',
      level: 'advanced',
      place: 'gym',
      schedule: '4 days/week',
      block: '8 weeks',
      summary: 'A team-of-four TRYKA relay plan with two 800 m run segments and two assigned workout stations per athlete.',
      bestFor: 'TRYKA relay teams preparing station ownership and fast handoffs',
      equipment: 'full TRYKA station setup, 800 m route and four teammates',
      split: 'Individual 800 m speed, station strength, team handoffs and full relay rehearsal.',
      focus: 'Two-leg readiness, station matching, warm-up timing, changeover communication and the 40 m team finish strategy.',
      progression: 'Build each athlete’s two legs independently before joining all eight legs in race order during peak weeks.',
      note: 'TRYKA relay teams of four complete two 800 m segments and two stations per athlete. Confirm current station loads, relay-zone rules and running order before the final rehearsal.',
      sessions: [
        {
          title: 'Day 1 - Individual 800 m Speed',
          meta: '50-60 minutes. Each teammate completes the same running framework.',
          exercises: [
            ['Easy run and drills', '1', '12 min', 'None', 'Finish with 4 relaxed strides.'],
            ['800 m repeats', '5-7', 'Relay target pace', '90 sec', 'Keep the final repetition within five seconds of the first.'],
            ['200 m fast', '4', 'Faster than race pace', '60 sec', 'Stay relaxed and technically clean.'],
            ['Walking lunge', '3', '12/side', '45 sec', 'Build station durability.'],
            ['Calf raise', '3', '15', '30 sec', 'Use full range.']
          ]
        },
        {
          title: 'Day 2 - Two Assigned Stations',
          meta: '55-70 minutes. Each athlete prioritises their allocated station pair.',
          exercises: [
            ['Primary station practice', '5', '25-50% race volume', '90 sec', 'Match the official movement standard.'],
            ['Secondary station practice', '5', '25-50% race volume', '90 sec', 'Choose a repeatable set and break strategy.'],
            ['Front squat or trap-bar deadlift', '4', '5', '2 min', 'Select based on station needs.'],
            ['Farmer carry', '4', '50 m', '60 sec', 'All teammates maintain grip capacity.'],
            ['Pallof press', '3', '10/side', '30 sec', 'Brace while breathing.']
          ]
        },
        {
          title: 'Day 3 - Team Order and Handoffs',
          meta: '60 minutes. All four teammates attend.',
          exercises: [
            ['Team warm-up rehearsal', '1', '15 min', 'None', 'Stagger warm-ups around expected race order.'],
            ['400 m + station segment', '8', 'One per official station', '60 sec', 'Each athlete practises entry and exit.'],
            ['Handoff rehearsal', '8', '20-30 sec', '30 sec', 'Use one clear verbal cue.'],
            ['Station counting practice', '4', '2 min', '60 sec', 'Partners judge standards and count aloud.'],
            ['Team strategy review', '1', '10 min', 'None', 'Confirm order, loads, targets and backup assignments.']
          ]
        },
        {
          title: 'Day 4 - Broken TRYKA Relay',
          meta: '75-95 minutes. Build from 70% volume to one complete peak rehearsal.',
          exercises: [
            ['Relay legs 1-2', '1', '2 x 800 m + stations 1-2', '3 min', 'Athlete one executes their assigned opening legs.'],
            ['Relay legs 3-4', '1', '2 x 800 m + stations 3-4', '3 min', 'Athlete two practises warm-up timing.'],
            ['Relay legs 5-6', '1', '2 x 800 m + stations 5-6', '3 min', 'Athlete three stays ready without accumulating fatigue.'],
            ['Relay legs 7-8', '1', '2 x 800 m + stations 7-8', 'None', 'Athlete four protects movement quality before the finish.'],
            ['Team sprint finish', '2', '40 m', '3 min', 'Practise a safe controlled acceleration after the final station.']
          ]
        }
      ]
    }
  ];
});
