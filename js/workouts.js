(function () {
  'use strict';

  const workoutPlans = {
    'Lose Weight Starter': {
      note: 'Use a load that leaves 2 reps in reserve. Rest enough to keep form clean, then finish with an easy walk or bike.',
      sessions: [
        {
          title: 'Day 1 - Full Body A',
          meta: '45 minutes. Start with 5 minutes brisk walking and 2 light warm-up sets.',
          exercises: [
            ['Goblet squat or leg press', '3', '10-12', '75 sec', 'Control the lowering and keep knees tracking over toes.'],
            ['Incline push-up or chest press', '3', '8-12', '75 sec', 'Stop each set before form breaks.'],
            ['Seated row', '3', '10-12', '60 sec', 'Pull elbows back and pause for 1 second.'],
            ['Dumbbell Romanian deadlift', '2', '10-12', '75 sec', 'Hips back, soft knees, flat back.'],
            ['Farmer carry', '3', '30-40 sec', '60 sec', 'Walk tall and keep ribs down.']
          ]
        },
        {
          title: 'Day 2 - Conditioning and Core',
          meta: '35 minutes. Keep effort conversational for most of the session.',
          exercises: [
            ['Incline treadmill walk or bike', '1', '20 min', 'As needed', 'Stay at a pace you can repeat weekly.'],
            ['Dead bug', '3', '8/side', '30 sec', 'Move slowly without arching your lower back.'],
            ['Side plank', '3', '20-30 sec/side', '30 sec', 'Make a straight line from shoulder to ankle.'],
            ['Bodyweight reverse lunge', '2', '8/side', '60 sec', 'Use support if balance is difficult.'],
            ['Easy cooldown walk', '1', '5 min', 'None', 'Finish feeling better than when you started.']
          ]
        },
        {
          title: 'Day 3 - Full Body B',
          meta: '45 minutes. Add a fourth weekly walk if recovery is good.',
          exercises: [
            ['Step-up or split squat', '3', '8-10/side', '75 sec', 'Choose a height that lets you control the knee.'],
            ['Lat pulldown', '3', '10-12', '60 sec', 'Pull to upper chest without leaning far back.'],
            ['Dumbbell bench press', '3', '8-12', '75 sec', 'Use a neutral grip if shoulders prefer it.'],
            ['Hip thrust or glute bridge', '3', '10-15', '60 sec', 'Pause hard at the top.'],
            ['Sled push, bike, or rower', '6', '30 sec easy-hard waves', '60 sec', 'Work hard, but never sprint sloppy.']
          ]
        }
      ]
    },
    'Fat Loss Engine': {
      note: 'Keep the main lift strong, then use accessories and finishers to drive calorie output without losing muscle.',
      sessions: [
        {
          title: 'Day 1 - Upper Strength',
          meta: '60 minutes. Use 2-3 warm-up sets before the first lift.',
          exercises: [
            ['Bench press', '4', '5-7', '2 min', 'Leave 1-2 reps in reserve.'],
            ['Chest-supported row', '4', '8-10', '90 sec', 'Pause at the top of each rep.'],
            ['Incline dumbbell press', '3', '8-10', '75 sec', 'Use a deep but pain-free range.'],
            ['Lat pulldown', '3', '10-12', '75 sec', 'Drive elbows toward ribs.'],
            ['Bike intervals', '8', '20 sec hard / 70 sec easy', 'Built in', 'Hard means controlled, not frantic.']
          ]
        },
        {
          title: 'Day 2 - Lower Strength',
          meta: '60 minutes. Finish with low-impact conditioning.',
          exercises: [
            ['Back squat or hack squat', '4', '5-8', '2 min', 'Brace before every rep.'],
            ['Romanian deadlift', '3', '8-10', '90 sec', 'Stretch hamstrings without rounding.'],
            ['Walking lunge', '3', '10/side', '75 sec', 'Keep steps long and controlled.'],
            ['Standing calf raise', '3', '12-15', '45 sec', 'Pause at the stretch and top.'],
            ['Incline walk', '1', '12-15 min', 'None', 'Zone 2 effort.']
          ]
        },
        {
          title: 'Day 3 - Upper Pump',
          meta: '50 minutes. Shorter rests, clean reps.',
          exercises: [
            ['Machine shoulder press', '3', '8-12', '75 sec', 'Do not chase load with a short range.'],
            ['Cable row', '3', '10-12', '60 sec', 'Keep torso still.'],
            ['Cable fly', '3', '12-15', '45 sec', 'Squeeze without shrugging.'],
            ['Face pull', '3', '12-15', '45 sec', 'Pull toward eye level.'],
            ['Rope pressdown plus curl', '3', '12-15 each', '45 sec', 'Alternate movements with no rush.']
          ]
        },
        {
          title: 'Day 4 - Lower Posterior Chain',
          meta: '55 minutes. Best placed after a rest or easy step day.',
          exercises: [
            ['Trap bar deadlift', '4', '4-6', '2 min', 'Fast up, controlled down.'],
            ['Leg press', '3', '10-12', '90 sec', 'Use full foot pressure.'],
            ['Seated leg curl', '3', '10-15', '60 sec', 'Pause in the squeezed position.'],
            ['Farmer carry', '4', '40 m', '75 sec', 'Heavy but posture must stay tall.'],
            ['Sled push', '6', '20 m', '60 sec', 'Powerful strides, steady breathing.']
          ]
        }
      ]
    },
    'Advanced Cut Athletic': {
      note: 'This is for experienced lifters only. If bar speed or sleep drops for two sessions, cut one finisher.',
      sessions: [
        {
          title: 'Day 1 - Push',
          meta: '70 minutes. Heavy press first, then controlled density.',
          exercises: [
            ['Bench press', '5', '3-5', '2-3 min', 'Keep one clean rep in reserve.'],
            ['Incline dumbbell press', '4', '8-10', '90 sec', 'Full range, no bouncing.'],
            ['Seated shoulder press', '3', '6-8', '90 sec', 'Brace hard before pressing.'],
            ['Cable lateral raise', '4', '12-20', '45 sec', 'Lead with elbows.'],
            ['Dip or rope pressdown', '3', '8-12', '60 sec', 'Stop before shoulder irritation.']
          ]
        },
        {
          title: 'Day 2 - Pull',
          meta: '70 minutes. Pair heavy pulling with upper-back volume.',
          exercises: [
            ['Weighted pull-up or pulldown', '5', '4-6', '2 min', 'Chest up, no swinging.'],
            ['Barbell row', '4', '6-8', '2 min', 'Lock torso position.'],
            ['Single-arm cable row', '3', '10/side', '75 sec', 'Reach forward, then pull low.'],
            ['Rear delt fly', '4', '15-20', '45 sec', 'Keep traps quiet.'],
            ['Incline curl', '3', '10-12', '60 sec', 'Use a full stretch.']
          ]
        },
        {
          title: 'Day 3 - Legs',
          meta: '75 minutes. Heavy lower body with no sloppy grinders.',
          exercises: [
            ['Back squat', '5', '3-5', '2-3 min', 'Same depth every set.'],
            ['Romanian deadlift', '4', '6-8', '2 min', 'Own the eccentric.'],
            ['Hack squat', '3', '8-10', '90 sec', 'Drive through mid-foot.'],
            ['Leg curl', '4', '10-12', '60 sec', 'Squeeze for 1 second.'],
            ['Hanging knee raise', '3', '10-15', '45 sec', 'Curl pelvis up, not just knees.']
          ]
        },
        {
          title: 'Day 4 - Upper Density',
          meta: '55 minutes. Use supersets but preserve movement quality.',
          exercises: [
            ['Incline machine press', '4', '10-12', '60 sec', 'Smooth tempo.'],
            ['Chest-supported row', '4', '10-12', '60 sec', 'Match press reps.'],
            ['Cable fly', '3', '15', '45 sec', 'Short rest, constant tension.'],
            ['Straight-arm pulldown', '3', '12-15', '45 sec', 'Feel lats, not triceps.'],
            ['Battle rope or ski erg', '8', '20 sec hard / 40 sec easy', 'Built in', 'Stop before output collapses.']
          ]
        },
        {
          title: 'Day 5 - Lower Conditioning',
          meta: '45-55 minutes. Lower load, high output.',
          exercises: [
            ['Front-foot elevated split squat', '3', '10/side', '75 sec', 'Stay upright.'],
            ['Hip thrust', '4', '8-12', '75 sec', 'Hard lockout without overextending.'],
            ['Reverse sled drag', '6', '25 m', '45 sec', 'Small steps and constant tension.'],
            ['Walking lunge', '3', '16-20 steps', '60 sec', 'Controlled breathing.'],
            ['Zone 2 bike', '1', '20 min', 'None', 'Nasal breathing if possible.']
          ]
        }
      ]
    },
    'Men\'s Muscle Foundation': {
      note: 'Train the same basic patterns often. Add weight only when every set hits the top of the range with clean form.',
      sessions: [
        {
          title: 'Day 1 - Full Body A',
          meta: '55 minutes. Technique first.',
          exercises: [
            ['Back squat or leg press', '3', '8-10', '90 sec', 'Build depth and control.'],
            ['Bench press', '3', '8-10', '90 sec', 'Touch lightly and press straight.'],
            ['Seated row', '3', '10-12', '75 sec', 'Do not shrug.'],
            ['Dumbbell Romanian deadlift', '3', '10', '90 sec', 'Stretch hamstrings.'],
            ['Cable curl plus pressdown', '2', '12 each', '45 sec', 'Smooth reps.']
          ]
        },
        {
          title: 'Day 2 - Full Body B',
          meta: '55 minutes. Slightly different angles.',
          exercises: [
            ['Trap bar deadlift', '3', '5-6', '2 min', 'Strong brace before lifting.'],
            ['Overhead press', '3', '6-8', '90 sec', 'Glutes tight, ribs down.'],
            ['Lat pulldown', '3', '8-12', '75 sec', 'Drive elbows down.'],
            ['Bulgarian split squat', '2', '8/side', '75 sec', 'Use support if needed.'],
            ['Plank', '3', '30-45 sec', '45 sec', 'Create full-body tension.']
          ]
        },
        {
          title: 'Day 3 - Full Body C',
          meta: '50-60 minutes. Finish with arms or calves if time allows.',
          exercises: [
            ['Goblet squat', '3', '10-12', '75 sec', 'Stay tall.'],
            ['Incline dumbbell press', '3', '8-12', '75 sec', 'Control the bottom.'],
            ['One-arm dumbbell row', '3', '10/side', '60 sec', 'Pull elbow to hip.'],
            ['Leg curl', '3', '10-15', '60 sec', 'No swinging.'],
            ['Standing calf raise', '3', '12-15', '45 sec', 'Pause top and bottom.']
          ]
        }
      ]
    },
    'Men\'s Hypertrophy Split': {
      note: 'Most sets should land 1-2 reps from failure. Track total reps and add load when all sets are at the top.',
      sessions: [
        {
          title: 'Day 1 - Upper Strength',
          meta: '65 minutes. Chest and back priority.',
          exercises: [
            ['Bench press', '4', '5-8', '2 min', 'Stable setup.'],
            ['Weighted row', '4', '6-8', '2 min', 'No torso bounce.'],
            ['Incline dumbbell press', '3', '8-10', '90 sec', 'Deep stretch.'],
            ['Lat pulldown', '3', '8-10', '90 sec', 'Pull to upper chest.'],
            ['Lateral raise', '3', '12-20', '45 sec', 'Constant tension.']
          ]
        },
        {
          title: 'Day 2 - Lower Strength',
          meta: '65 minutes. Big lower patterns first.',
          exercises: [
            ['Squat', '4', '5-8', '2 min', 'Consistent depth.'],
            ['Romanian deadlift', '4', '6-10', '2 min', 'Hinge, do not squat it.'],
            ['Leg press', '3', '10-12', '90 sec', 'Full range.'],
            ['Seated leg curl', '3', '10-12', '75 sec', 'Squeeze hard.'],
            ['Cable crunch', '3', '10-15', '60 sec', 'Round upper back.']
          ]
        },
        {
          title: 'Day 3 - Upper Hypertrophy',
          meta: '60 minutes. More angles, shorter rests.',
          exercises: [
            ['Machine chest press', '3', '10-12', '75 sec', 'Controlled tempo.'],
            ['Chest-supported row', '3', '10-12', '75 sec', 'Pause each rep.'],
            ['Cable fly', '3', '12-15', '45 sec', 'Hug around the rib cage.'],
            ['Rear delt fly', '3', '15-20', '45 sec', 'Keep shoulders down.'],
            ['Curl plus triceps extension', '3', '10-15 each', '45 sec', 'Use a full range.']
          ]
        },
        {
          title: 'Day 4 - Lower Hypertrophy',
          meta: '60 minutes. Pump-focused but still progressive.',
          exercises: [
            ['Hack squat', '4', '8-12', '90 sec', 'Do not lock out hard.'],
            ['Hip thrust', '3', '8-12', '90 sec', 'Pause at top.'],
            ['Walking lunge', '3', '12/side', '75 sec', 'Long stride.'],
            ['Leg extension', '3', '12-15', '60 sec', 'Squeeze quads.'],
            ['Standing calf raise', '4', '10-15', '45 sec', 'Full stretch.']
          ]
        }
      ]
    },
    'Men\'s Advanced Mass Block': {
      note: 'High-volume mass phase. Eat enough, sleep hard, and deload after 5-6 demanding weeks.',
      sessions: [
        {
          title: 'Day 1 - Push Heavy',
          meta: '70 minutes. Chest, shoulders, triceps.',
          exercises: [
            ['Bench press', '4', '4-6', '2-3 min', 'Strong bar path.'],
            ['Incline barbell press', '3', '6-8', '2 min', 'No bounce.'],
            ['Seated dumbbell press', '3', '8-10', '90 sec', 'Control the descent.'],
            ['Cable lateral raise', '4', '12-18', '45 sec', 'Slow negatives.'],
            ['Weighted dip or pressdown', '3', '8-12', '75 sec', 'Pain-free range only.']
          ]
        },
        {
          title: 'Day 2 - Pull Heavy',
          meta: '70 minutes. Back thickness and biceps.',
          exercises: [
            ['Weighted pull-up', '4', '4-6', '2 min', 'Full hang if shoulders allow.'],
            ['Barbell row', '4', '6-8', '2 min', 'Brace like a deadlift.'],
            ['Machine row', '3', '8-10', '90 sec', 'Elbows low.'],
            ['Face pull', '3', '15-20', '45 sec', 'External rotation.'],
            ['EZ-bar curl', '4', '8-12', '60 sec', 'No hip swing.']
          ]
        },
        {
          title: 'Day 3 - Legs Heavy',
          meta: '75 minutes. Quad and hamstring strength.',
          exercises: [
            ['Back squat', '4', '4-6', '2-3 min', 'Brace every rep.'],
            ['Romanian deadlift', '4', '6-8', '2 min', 'Hamstring stretch.'],
            ['Leg press', '3', '10', '90 sec', 'Deep reps.'],
            ['Lying leg curl', '3', '10-12', '75 sec', 'Hard squeeze.'],
            ['Standing calf raise', '4', '8-12', '60 sec', 'Full range.']
          ]
        },
        {
          title: 'Day 4 - Upper Volume',
          meta: '60 minutes. Volume without joint irritation.',
          exercises: [
            ['Incline dumbbell press', '4', '8-12', '90 sec', 'Stable shoulder blades.'],
            ['Wide-grip pulldown', '4', '8-12', '90 sec', 'Lead with elbows.'],
            ['Machine chest press', '3', '12-15', '60 sec', 'Constant tension.'],
            ['Cable row', '3', '12-15', '60 sec', 'Do not lean back.'],
            ['Lateral raise mechanical drop set', '3', '12 plus partials', '75 sec', 'Stop before traps take over.']
          ]
        },
        {
          title: 'Day 5 - Legs and Arms Pump',
          meta: '55 minutes. Higher reps and joint-friendly movements.',
          exercises: [
            ['Hack squat', '3', '10-15', '90 sec', 'Continuous reps.'],
            ['Hip thrust', '3', '10-12', '75 sec', 'Lock out glutes.'],
            ['Leg extension', '3', '15-20', '45 sec', 'Squeeze quads.'],
            ['Cable curl plus rope pressdown', '4', '12-15 each', '45 sec', 'Pump work, clean reps.'],
            ['Seated calf raise', '4', '12-20', '45 sec', 'Slow stretch.']
          ]
        }
      ]
    },
    'Women\'s Strength Starter': {
      note: 'This plan builds confidence with lower-body, upper-body, and core basics while keeping soreness manageable.',
      sessions: [
        {
          title: 'Day 1 - Lower Body Basics',
          meta: '45-50 minutes. Use machines or dumbbells.',
          exercises: [
            ['Goblet squat', '3', '8-12', '75 sec', 'Keep chest tall.'],
            ['Hip thrust', '3', '10-12', '75 sec', 'Pause at lockout.'],
            ['Step-up', '2', '8/side', '60 sec', 'Push through the working leg.'],
            ['Seated leg curl', '3', '10-12', '60 sec', 'Slow return.'],
            ['Pallof press', '3', '10/side', '45 sec', 'Resist rotation.']
          ]
        },
        {
          title: 'Day 2 - Upper Body Basics',
          meta: '45 minutes. Build posture and pressing confidence.',
          exercises: [
            ['Dumbbell bench press', '3', '8-12', '75 sec', 'Wrists stacked over elbows.'],
            ['Lat pulldown', '3', '10-12', '60 sec', 'Pull elbows down.'],
            ['Seated cable row', '3', '10-12', '60 sec', 'Squeeze shoulder blades.'],
            ['Dumbbell shoulder press', '2', '8-10', '75 sec', 'Stop if lower back arches.'],
            ['Dead bug', '3', '8/side', '30 sec', 'Exhale before extending.']
          ]
        },
        {
          title: 'Day 3 - Full Body Practice',
          meta: '45 minutes. Repeat patterns with light progression.',
          exercises: [
            ['Leg press', '3', '10-12', '75 sec', 'Controlled depth.'],
            ['Incline push-up', '3', '8-12', '60 sec', 'Body stays straight.'],
            ['Dumbbell Romanian deadlift', '3', '10', '75 sec', 'Hips back first.'],
            ['Cable face pull', '3', '12-15', '45 sec', 'Pull to eye level.'],
            ['Farmer carry', '3', '30 m', '60 sec', 'Walk tall.']
          ]
        }
      ]
    },
    'Women\'s Lean Muscle Build': {
      note: 'Glutes, legs, back, shoulders, and core get enough volume to build shape without turning every day into a max effort.',
      sessions: [
        {
          title: 'Day 1 - Glutes and Hamstrings',
          meta: '60 minutes. Heavy hip hinge and thrust focus.',
          exercises: [
            ['Barbell hip thrust', '4', '6-10', '2 min', 'Pause hard at top.'],
            ['Romanian deadlift', '4', '8-10', '90 sec', 'Keep lats tight.'],
            ['Seated leg curl', '3', '10-15', '60 sec', 'Full squeeze.'],
            ['Cable kickback', '3', '12-15/side', '45 sec', 'No lower-back swing.'],
            ['Side plank', '3', '25-40 sec/side', '30 sec', 'Stack hips.']
          ]
        },
        {
          title: 'Day 2 - Upper Shape',
          meta: '55 minutes. Back and shoulder emphasis.',
          exercises: [
            ['Lat pulldown', '4', '8-12', '75 sec', 'Pull with elbows.'],
            ['Incline dumbbell press', '3', '8-10', '75 sec', 'Controlled range.'],
            ['Cable row', '3', '10-12', '60 sec', 'Pause at ribs.'],
            ['Dumbbell lateral raise', '4', '12-20', '45 sec', 'Soft elbows.'],
            ['Cable curl plus rope pressdown', '2', '12-15 each', '45 sec', 'Optional arm finisher.']
          ]
        },
        {
          title: 'Day 3 - Quads and Core',
          meta: '60 minutes. Knee-dominant strength.',
          exercises: [
            ['Front squat or hack squat', '4', '6-10', '2 min', 'Stay upright.'],
            ['Leg press', '3', '10-12', '90 sec', 'Full foot pressure.'],
            ['Walking lunge', '3', '10/side', '75 sec', 'Long, controlled steps.'],
            ['Leg extension', '3', '12-15', '60 sec', 'Squeeze quads.'],
            ['Cable crunch', '3', '10-15', '45 sec', 'Round upper back.']
          ]
        },
        {
          title: 'Day 4 - Full Body Pump',
          meta: '50 minutes. Lighter, repeatable volume.',
          exercises: [
            ['Dumbbell squat to press', '3', '10', '75 sec', 'Smooth transition.'],
            ['Single-leg Romanian deadlift', '3', '8/side', '60 sec', 'Reach hips back.'],
            ['Chest-supported row', '3', '12', '60 sec', 'No shrugging.'],
            ['Cable fly', '2', '12-15', '45 sec', 'Light stretch.'],
            ['Incline walk', '1', '15 min', 'None', 'Easy to moderate pace.']
          ]
        }
      ]
    },
    'Women\'s Shape and Strength': {
      note: 'A higher-volume block for trained women. Push main lifts, but keep accessory reps controlled and joint-friendly.',
      sessions: [
        {
          title: 'Day 1 - Glute Strength',
          meta: '65 minutes. Heavy hip thrust day.',
          exercises: [
            ['Barbell hip thrust', '5', '4-6', '2-3 min', 'Powerful lockout.'],
            ['Romanian deadlift', '4', '6-8', '2 min', 'Hamstrings loaded.'],
            ['Reverse lunge', '3', '8/side', '90 sec', 'Slight forward lean.'],
            ['Cable abduction', '3', '15-20/side', '45 sec', 'Small, controlled range.'],
            ['Farmer carry', '4', '30 m', '60 sec', 'Heavy and tall.']
          ]
        },
        {
          title: 'Day 2 - Upper Strength',
          meta: '60 minutes. Strong back and shoulders.',
          exercises: [
            ['Pull-up or heavy pulldown', '4', '5-8', '2 min', 'Full control.'],
            ['Dumbbell bench press', '4', '6-8', '90 sec', 'Stable wrists.'],
            ['One-arm row', '3', '8-10/side', '75 sec', 'Pull to hip.'],
            ['Seated shoulder press', '3', '8-10', '75 sec', 'No low-back arch.'],
            ['Face pull', '3', '15', '45 sec', 'Elbows high.']
          ]
        },
        {
          title: 'Day 3 - Quad Focus',
          meta: '65 minutes. Strong knee-dominant work.',
          exercises: [
            ['Front squat or hack squat', '4', '5-8', '2 min', 'Brace hard.'],
            ['Leg press', '4', '10-12', '90 sec', 'Deep controlled reps.'],
            ['Bulgarian split squat', '3', '8-10/side', '90 sec', 'Use straps if grip limits.'],
            ['Leg extension', '3', '12-15', '60 sec', 'Pause at top.'],
            ['Dead bug', '3', '10/side', '30 sec', 'Slow and quiet.']
          ]
        },
        {
          title: 'Day 4 - Upper Hypertrophy',
          meta: '55 minutes. Shoulders, back, arms.',
          exercises: [
            ['Incline machine press', '3', '10-12', '75 sec', 'Controlled tempo.'],
            ['Cable row', '4', '10-12', '60 sec', 'Shoulders down.'],
            ['Lat pulldown', '3', '12', '60 sec', 'Stretch at top.'],
            ['Lateral raise', '4', '15-20', '45 sec', 'Lead with elbows.'],
            ['Cable curl plus triceps pressdown', '3', '12-15 each', '45 sec', 'Light pump work.']
          ]
        },
        {
          title: 'Day 5 - Lower Pump',
          meta: '50 minutes. Shorter rest, lower joint stress.',
          exercises: [
            ['Smith machine squat', '3', '10-12', '90 sec', 'Controlled depth.'],
            ['Glute bridge', '4', '12-15', '60 sec', 'Constant tension.'],
            ['Seated leg curl', '3', '12-15', '60 sec', 'Squeeze hard.'],
            ['Step-up', '3', '10/side', '60 sec', 'Drive through heel and mid-foot.'],
            ['Incline walk', '1', '12 min', 'None', 'Moderate pace.']
          ]
        }
      ]
    },
    'Home Bodyweight Beginner': {
      note: 'No gym required. Focus on repeatable movement quality and daily steps.',
      sessions: [
        {
          title: 'Day 1 - Full Body A',
          meta: '30-40 minutes. Use a chair, wall, or countertop as needed.',
          exercises: [
            ['Box squat to chair', '3', '10-15', '60 sec', 'Sit back and stand tall.'],
            ['Incline push-up', '3', '8-12', '60 sec', 'Hands elevated to match strength.'],
            ['Backpack row', '3', '10-15', '60 sec', 'Squeeze shoulder blades.'],
            ['Glute bridge', '3', '12-15', '45 sec', 'Pause at top.'],
            ['Front plank', '3', '20-35 sec', '30 sec', 'Ribs down.']
          ]
        },
        {
          title: 'Day 2 - Walk and Core',
          meta: '30 minutes. Recovery-friendly.',
          exercises: [
            ['Brisk walk', '1', '20 min', 'None', 'Comfortably challenging pace.'],
            ['Dead bug', '3', '8/side', '30 sec', 'Move slow.'],
            ['Bird dog', '3', '8/side', '30 sec', 'Hold for 1 second.'],
            ['Side plank from knees', '3', '20 sec/side', '30 sec', 'Keep hips forward.'],
            ['Hip flexor stretch', '2', '30 sec/side', '15 sec', 'Breathe calmly.']
          ]
        },
        {
          title: 'Day 3 - Full Body B',
          meta: '35-40 minutes. Repeat weekly and add reps before harder variations.',
          exercises: [
            ['Reverse lunge', '3', '8-10/side', '60 sec', 'Hold a wall for balance.'],
            ['Push-up negative', '3', '5-8', '60 sec', 'Lower slowly, reset at top.'],
            ['Towel row or band row', '3', '10-15', '60 sec', 'Elbows close to ribs.'],
            ['Hip hinge good morning', '3', '12', '45 sec', 'Hands on hips, flat back.'],
            ['Step jack', '6', '30 sec', '30 sec', 'Low-impact conditioning.']
          ]
        }
      ]
    },
    'Home Dumbbell Progression': {
      note: 'Use adjustable dumbbells if possible. When load is limited, progress with slower tempo and more reps.',
      sessions: [
        {
          title: 'Day 1 - Upper',
          meta: '45 minutes. Dumbbells and a bench or floor.',
          exercises: [
            ['Dumbbell floor press', '4', '8-12', '75 sec', 'Pause elbows on floor.'],
            ['One-arm dumbbell row', '4', '10/side', '60 sec', 'Pull to hip.'],
            ['Seated dumbbell press', '3', '8-12', '75 sec', 'Brace hard.'],
            ['Rear delt fly', '3', '12-15', '45 sec', 'Light and strict.'],
            ['Hammer curl plus overhead extension', '3', '10-12 each', '45 sec', 'Alternate movements.']
          ]
        },
        {
          title: 'Day 2 - Lower',
          meta: '45 minutes. Unilateral work makes light weights useful.',
          exercises: [
            ['Goblet squat', '4', '10-15', '75 sec', 'Deep controlled reps.'],
            ['Dumbbell Romanian deadlift', '4', '8-12', '90 sec', 'Stretch hamstrings.'],
            ['Bulgarian split squat', '3', '8-10/side', '75 sec', 'Slight forward lean.'],
            ['Single-leg calf raise', '3', '12-15/side', '45 sec', 'Full range.'],
            ['Suitcase carry', '3', '30 sec/side', '45 sec', 'Do not lean.']
          ]
        },
        {
          title: 'Day 3 - Full Body Density',
          meta: '35-45 minutes. Keep movements crisp.',
          exercises: [
            ['Dumbbell squat', '3', '12', '60 sec', 'Steady pace.'],
            ['Push-up', '3', 'AMRAP leaving 2 reps', '60 sec', 'Elevate hands if needed.'],
            ['Dumbbell row', '3', '12/side', '45 sec', 'No torso twist.'],
            ['Dumbbell swing or hinge', '3', '15', '60 sec', 'Snap hips, not arms.'],
            ['Mountain climber', '6', '25 sec', '35 sec', 'Fast feet, stable shoulders.']
          ]
        },
        {
          title: 'Day 4 - Core and Conditioning',
          meta: '30 minutes. Optional if recovery is good.',
          exercises: [
            ['Walk or bike', '1', '20 min', 'None', 'Moderate effort.'],
            ['Turkish get-up to elbow', '3', '5/side', '45 sec', 'Move slowly.'],
            ['Side plank', '3', '30 sec/side', '30 sec', 'Stack ribs over hips.'],
            ['Loaded march', '3', '45 sec', '45 sec', 'Hold dumbbells at sides.'],
            ['Child pose breathing', '2', '60 sec', 'None', 'Relax shoulders.']
          ]
        }
      ]
    },
    'Home Advanced Density': {
      note: 'Advanced home block using short rests, unilateral loading, and timed finishers. Quality stays higher priority than speed.',
      sessions: [
        {
          title: 'Day 1 - Upper Density',
          meta: '45 minutes. Pair push and pull work.',
          exercises: [
            ['Deficit push-up', '4', '8-15', '60 sec', 'Full range.'],
            ['Heavy one-arm row', '4', '8-12/side', '60 sec', 'Pause at top.'],
            ['Pike push-up or dumbbell press', '3', '6-10', '75 sec', 'Controlled shoulders.'],
            ['Band pull-apart', '4', '15-25', '30 sec', 'Keep ribs down.'],
            ['Burpee step-back', '8', '20 sec work', '40 sec', 'Repeatable pace.']
          ]
        },
        {
          title: 'Day 2 - Lower Unilateral',
          meta: '50 minutes. Demanding but joint-friendly.',
          exercises: [
            ['Bulgarian split squat', '4', '8-12/side', '90 sec', 'Deep controlled reps.'],
            ['Single-leg Romanian deadlift', '4', '8-10/side', '75 sec', 'Square hips.'],
            ['Goblet cyclist squat', '3', '12-15', '75 sec', 'Heels elevated.'],
            ['Hamstring walkout', '3', '8-12', '60 sec', 'Small controlled steps.'],
            ['Suitcase carry', '4', '40 sec/side', '45 sec', 'Heavy and straight.']
          ]
        },
        {
          title: 'Day 3 - Conditioning',
          meta: '30-40 minutes. Choose low-impact options if joints need it.',
          exercises: [
            ['Jump rope or step jack', '10', '30 sec', '30 sec', 'Stay light.'],
            ['Dumbbell complex', '5', '6 reps each move', '90 sec', 'Row, clean, squat, press.'],
            ['Bear crawl', '6', '20 m', '45 sec', 'Hips low.'],
            ['Dead bug', '3', '10/side', '30 sec', 'Slow exhale.'],
            ['Easy walk', '1', '10 min', 'None', 'Cooldown.']
          ]
        },
        {
          title: 'Day 4 - Full Body Strength',
          meta: '50 minutes. Lower reps where load allows.',
          exercises: [
            ['Weighted push-up', '4', '6-10', '90 sec', 'Backpack load if safe.'],
            ['Goblet squat', '5', '8-10', '90 sec', 'Brace and drive.'],
            ['Dumbbell Romanian deadlift', '4', '8-10', '90 sec', 'Slow eccentric.'],
            ['Renegade row', '3', '6-8/side', '75 sec', 'Avoid hip twist.'],
            ['Hollow hold', '3', '25-40 sec', '45 sec', 'Lower back down.']
          ]
        }
      ]
    },
    'Gym Strength Basics': {
      note: 'A beginner-friendly gym strength plan built around repeat practice of big patterns.',
      sessions: [
        {
          title: 'Day 1 - Squat and Press',
          meta: '55 minutes. Keep all reps technically clean.',
          exercises: [
            ['Goblet squat or back squat', '3', '6-8', '2 min', 'Same depth every rep.'],
            ['Bench press', '3', '6-8', '2 min', 'Stable shoulder blades.'],
            ['Seated cable row', '3', '8-10', '90 sec', 'Pause at ribs.'],
            ['Leg curl', '2', '10-12', '60 sec', 'Smooth reps.'],
            ['Plank', '3', '30-45 sec', '45 sec', 'Full-body tension.']
          ]
        },
        {
          title: 'Day 2 - Hinge and Pull',
          meta: '55 minutes. Deadlift variation stays submaximal.',
          exercises: [
            ['Trap bar deadlift', '3', '5', '2 min', 'No grinders.'],
            ['Overhead press', '3', '6-8', '90 sec', 'Ribs down.'],
            ['Lat pulldown', '3', '8-12', '75 sec', 'Elbows down.'],
            ['Split squat', '2', '8/side', '75 sec', 'Use support if needed.'],
            ['Pallof press', '3', '10/side', '45 sec', 'Resist rotation.']
          ]
        },
        {
          title: 'Day 3 - Full Body Volume',
          meta: '50 minutes. Slightly higher reps.',
          exercises: [
            ['Leg press', '3', '10-12', '90 sec', 'Full foot pressure.'],
            ['Incline dumbbell press', '3', '8-10', '75 sec', 'Controlled bottom.'],
            ['Chest-supported row', '3', '10-12', '75 sec', 'No shrug.'],
            ['Hip thrust', '3', '10-12', '75 sec', 'Pause at top.'],
            ['Farmer carry', '3', '30 m', '60 sec', 'Walk tall.']
          ]
        }
      ]
    },
    'Gym Upper Lower Builder': {
      note: 'Four-day strength and muscle builder. Main lifts are heavier; accessories build the base around them.',
      sessions: [
        {
          title: 'Day 1 - Upper Heavy',
          meta: '65 minutes. Press and row strength.',
          exercises: [
            ['Bench press', '4', '4-6', '2-3 min', 'Clean bar path.'],
            ['Weighted row', '4', '5-8', '2 min', 'Brace hard.'],
            ['Overhead press', '3', '6-8', '90 sec', 'No lower-back lean.'],
            ['Pull-up or pulldown', '3', '6-10', '90 sec', 'Full control.'],
            ['Face pull', '3', '15', '45 sec', 'Shoulders down.']
          ]
        },
        {
          title: 'Day 2 - Lower Heavy',
          meta: '70 minutes. Squat and hinge.',
          exercises: [
            ['Back squat', '4', '4-6', '2-3 min', 'Brace before descent.'],
            ['Romanian deadlift', '4', '6-8', '2 min', 'Hips back.'],
            ['Leg press', '3', '8-10', '90 sec', 'Strong reps.'],
            ['Leg curl', '3', '10-12', '75 sec', 'Pause squeezed.'],
            ['Standing calf raise', '4', '10-12', '45 sec', 'Full range.']
          ]
        },
        {
          title: 'Day 3 - Upper Volume',
          meta: '60 minutes. Hypertrophy-focused.',
          exercises: [
            ['Incline dumbbell press', '4', '8-12', '90 sec', 'Deep range.'],
            ['Lat pulldown', '4', '8-12', '75 sec', 'Drive elbows down.'],
            ['Machine chest press', '3', '10-12', '60 sec', 'Constant tension.'],
            ['Cable row', '3', '10-12', '60 sec', 'Pause at ribs.'],
            ['Lateral raise plus curl', '3', '12-15 each', '45 sec', 'Clean reps.']
          ]
        },
        {
          title: 'Day 4 - Lower Volume',
          meta: '60 minutes. Less spinal loading.',
          exercises: [
            ['Hack squat', '4', '8-12', '90 sec', 'Consistent depth.'],
            ['Hip thrust', '4', '8-12', '90 sec', 'Hard lockout.'],
            ['Walking lunge', '3', '10/side', '75 sec', 'Long stride.'],
            ['Leg extension', '3', '12-15', '60 sec', 'Quad squeeze.'],
            ['Cable crunch', '3', '12-15', '45 sec', 'Exhale fully.']
          ]
        }
      ]
    },
    'Strength and Conditioning Pro': {
      note: 'For advanced trainees who can recover from strength work plus conditioning. Separate hard running from heavy legs when possible.',
      sessions: [
        {
          title: 'Day 1 - Lower Strength',
          meta: '70 minutes. Heavy lower body.',
          exercises: [
            ['Back squat', '5', '3-5', '2-3 min', 'Strong, fast reps.'],
            ['Trap bar deadlift', '4', '3-5', '2-3 min', 'No missed reps.'],
            ['Front-foot elevated split squat', '3', '8/side', '90 sec', 'Stay controlled.'],
            ['Nordic curl or leg curl', '3', '6-10', '90 sec', 'Slow eccentric.'],
            ['Farmer carry', '5', '30 m', '75 sec', 'Heavy posture work.']
          ]
        },
        {
          title: 'Day 2 - Upper Strength',
          meta: '65 minutes. Heavy upper with shoulder health.',
          exercises: [
            ['Bench press', '5', '3-5', '2-3 min', 'Pause first rep.'],
            ['Weighted pull-up', '5', '3-6', '2 min', 'Full control.'],
            ['Standing overhead press', '3', '5-6', '2 min', 'Brace hard.'],
            ['Chest-supported row', '3', '8-10', '90 sec', 'Pause at top.'],
            ['Face pull', '3', '15-20', '45 sec', 'Elbows high.']
          ]
        },
        {
          title: 'Day 3 - Conditioning Power',
          meta: '35-45 minutes. Hard but repeatable output.',
          exercises: [
            ['Sled push', '8', '20 m', '60 sec', 'Powerful steps.'],
            ['Ski erg or rower', '8', '30 sec hard', '60 sec', 'Keep pace consistent.'],
            ['Kettlebell swing', '5', '15', '60 sec', 'Explosive hips.'],
            ['Med ball slam', '5', '8', '45 sec', 'Full-body throw.'],
            ['Cooldown bike', '1', '8 min', 'None', 'Easy spin.']
          ]
        },
        {
          title: 'Day 4 - Full Body Power',
          meta: '60 minutes. Low reps, high intent.',
          exercises: [
            ['Power clean pull or trap bar jump', '5', '3', '2 min', 'Explosive but crisp.'],
            ['Front squat', '4', '4-6', '2 min', 'Tall torso.'],
            ['Push press', '4', '3-5', '2 min', 'Dip and drive.'],
            ['Pendlay row', '4', '5-6', '2 min', 'Reset each rep.'],
            ['Hanging leg raise', '3', '8-12', '60 sec', 'No swing.']
          ]
        },
        {
          title: 'Day 5 - Aerobic Base',
          meta: '40-60 minutes. Supports recovery and conditioning.',
          exercises: [
            ['Zone 2 run, bike, or row', '1', '35-45 min', 'None', 'Breathing controlled.'],
            ['Walking lunge', '2', '12/side', '60 sec', 'Light flush work.'],
            ['Copenhagen plank', '3', '15-25 sec/side', '45 sec', 'Short lever if needed.'],
            ['Thoracic rotation', '2', '8/side', '15 sec', 'Move slowly.'],
            ['Calf mobility', '2', '45 sec/side', '15 sec', 'Breathe into stretch.']
          ]
        }
      ]
    },
    'Busy Schedule Fat Loss': {
      note: 'Three focused 30-minute sessions. Keep transitions fast and use simple equipment.',
      sessions: [
        {
          title: 'Day 1 - 30-Minute Strength A',
          meta: 'Set a timer and move with purpose.',
          exercises: [
            ['Goblet squat', '3', '10-12', '45 sec', 'Controlled depth.'],
            ['Dumbbell bench press', '3', '8-12', '45 sec', 'Smooth reps.'],
            ['One-arm row', '3', '10/side', '45 sec', 'Pull to hip.'],
            ['Romanian deadlift', '3', '10', '45 sec', 'Hips back.'],
            ['Incline walk or bike', '1', '8 min', 'None', 'Moderate pace.']
          ]
        },
        {
          title: 'Day 2 - 30-Minute Conditioning',
          meta: 'Low setup, high value.',
          exercises: [
            ['Bike or rower', '10', '30 sec hard', '45 sec easy', 'Repeatable output.'],
            ['Push-up', '3', 'AMRAP leaving 2 reps', '45 sec', 'Elevate hands if needed.'],
            ['Reverse lunge', '3', '8/side', '45 sec', 'Stay balanced.'],
            ['Plank', '3', '30-45 sec', '30 sec', 'Ribs down.'],
            ['Cooldown walk', '1', '5 min', 'None', 'Easy finish.']
          ]
        },
        {
          title: 'Day 3 - 30-Minute Strength B',
          meta: 'Full body with a posterior-chain focus.',
          exercises: [
            ['Trap bar deadlift or kettlebell deadlift', '4', '5-8', '60 sec', 'Clean reps only.'],
            ['Lat pulldown', '3', '8-12', '45 sec', 'Elbows down.'],
            ['Step-up', '3', '8/side', '45 sec', 'Drive through the working leg.'],
            ['Dumbbell shoulder press', '3', '8-10', '45 sec', 'Brace.'],
            ['Farmer carry', '4', '30 sec', '30 sec', 'Heavy and tall.']
          ]
        }
      ]
    },
    'Low Impact Rebuild': {
      note: 'Designed for returning after a break. Keep pain out of the session and add volume gradually.',
      sessions: [
        {
          title: 'Day 1 - Supported Full Body A',
          meta: '40 minutes. Easy entry back into training.',
          exercises: [
            ['Box squat', '3', '8-10', '75 sec', 'Use a height that feels safe.'],
            ['Machine chest press', '3', '8-12', '75 sec', 'Neutral wrist.'],
            ['Seated row', '3', '10-12', '60 sec', 'Pause at ribs.'],
            ['Glute bridge', '3', '10-12', '60 sec', 'Gentle squeeze.'],
            ['Treadmill walk', '1', '10 min', 'None', 'Easy pace.']
          ]
        },
        {
          title: 'Day 2 - Mobility and Walk',
          meta: '25-35 minutes. Restore range without forcing it.',
          exercises: [
            ['Easy walk or bike', '1', '20 min', 'None', 'Low impact.'],
            ['Cat-camel', '2', '8 reps', '15 sec', 'Move gently.'],
            ['Half-kneeling hip flexor stretch', '2', '30 sec/side', '15 sec', 'Glute squeezed.'],
            ['Band pull-apart', '2', '15', '30 sec', 'Light resistance.'],
            ['Dead bug', '2', '8/side', '30 sec', 'Slow exhale.']
          ]
        },
        {
          title: 'Day 3 - Supported Full Body B',
          meta: '40 minutes. Increase only one variable from week to week.',
          exercises: [
            ['Leg press', '3', '10', '75 sec', 'Pain-free depth.'],
            ['Lat pulldown', '3', '10-12', '60 sec', 'Controlled range.'],
            ['Dumbbell Romanian deadlift', '2', '10', '75 sec', 'Light hinge practice.'],
            ['Step-up to low box', '2', '8/side', '60 sec', 'Use rail support.'],
            ['Suitcase carry', '3', '20-30 m/side', '45 sec', 'Stay tall.']
          ]
        }
      ]
    },
    'Mobility and Core for Lifters': {
      note: 'Use these as 20-minute add-ons after lifting or on recovery days. Better positions should carry into your main lifts.',
      sessions: [
        {
          title: 'Add-on 1 - Hips and Ankles',
          meta: '20 minutes. Best after lower body or on a rest day.',
          exercises: [
            ['90/90 hip switch', '2', '8/side', '20 sec', 'Move without using hands if possible.'],
            ['Couch stretch', '2', '45 sec/side', '15 sec', 'Squeeze rear glute.'],
            ['Knee-to-wall ankle rocks', '3', '10/side', '20 sec', 'Heel stays down.'],
            ['Goblet squat pry', '3', '30 sec', '30 sec', 'Breathe at the bottom.'],
            ['Dead bug', '3', '10/side', '30 sec', 'Keep ribs stacked.']
          ]
        },
        {
          title: 'Add-on 2 - T-Spine and Shoulders',
          meta: '20 minutes. Useful before upper body work.',
          exercises: [
            ['Open book rotation', '2', '8/side', '15 sec', 'Follow hand with eyes.'],
            ['Wall slide', '3', '10', '30 sec', 'Keep ribs down.'],
            ['Band external rotation', '3', '12/side', '30 sec', 'Elbow stays tucked.'],
            ['Prone Y raise', '3', '10-12', '30 sec', 'Thumbs up.'],
            ['Side plank reach-through', '3', '8/side', '30 sec', 'Rotate under control.']
          ]
        },
        {
          title: 'Add-on 3 - Trunk and Carries',
          meta: '20-25 minutes. Builds stiffness for squats, pulls, and presses.',
          exercises: [
            ['Pallof press', '3', '10/side', '30 sec', 'Do not rotate.'],
            ['Suitcase carry', '4', '30-40 m/side', '45 sec', 'Heavy but straight.'],
            ['Hollow hold', '3', '20-35 sec', '45 sec', 'Low back down.'],
            ['Back extension hold', '3', '20 sec', '45 sec', 'Glutes on, neck neutral.'],
            ['Box breathing', '3', '4 slow breaths', '20 sec', 'Inhale, hold, exhale, hold.']
          ]
        }
      ]
    }
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const renderWorkoutPlan = (plan) => `
    <section class="workout-plan" aria-label="Complete exercise prescription">
      <h4>Complete sessions</h4>
      <p class="workout-plan-note">${escapeHtml(plan.note)}</p>
      ${plan.sessions.map((session) => `
        <div class="session-block">
          <h5>${escapeHtml(session.title)}</h5>
          <p class="session-meta">${escapeHtml(session.meta)}</p>
          <div class="exercise-table-wrap">
            <table class="exercise-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Sets</th>
                  <th>Reps/time</th>
                  <th>Rest</th>
                  <th>Coaching note</th>
                </tr>
              </thead>
              <tbody>
                ${session.exercises.map((exercise) => `
                  <tr>
                    <td>${escapeHtml(exercise[0])}</td>
                    <td>${escapeHtml(exercise[1])}</td>
                    <td>${escapeHtml(exercise[2])}</td>
                    <td>${escapeHtml(exercise[3])}</td>
                    <td>${escapeHtml(exercise[4])}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('')}
    </section>
  `;

  const setupMenu = () => {
    const menuToggle = document.getElementById('gb-menu-toggle');
    const menu = document.getElementById('gb-menu');
    if (!menuToggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isActive = menu.classList.toggle('active');
      menuToggle.classList.toggle('active', isActive);
      menuToggle.setAttribute('aria-expanded', String(isActive));
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    menu.querySelectorAll('.gb-menu-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  };

  const filters = {
    goal: 'all',
    level: 'all',
    place: 'all'
  };

  const cards = Array.from(document.querySelectorAll('.workout-card'));
  const buttons = Array.from(document.querySelectorAll('[data-filter-group]'));
  const search = document.getElementById('workout-search');
  const count = document.getElementById('workout-count');
  const noResults = document.getElementById('no-results');
  const clearFilters = document.getElementById('clear-workout-filters');
  const jumpLinks = Array.from(document.querySelectorAll('[data-jump-filter]'));
  let modalTrigger = null;

  const validFilterValues = {
    goal: new Set(['all', 'fat-loss', 'muscle', 'strength', 'mobility']),
    level: new Set(['all', 'beginner', 'intermediate', 'advanced']),
    place: new Set(['all', 'home', 'gym'])
  };

  const restoreFiltersFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    Object.keys(filters).forEach((group) => {
      const value = params.get(group);
      if (value && validFilterValues[group].has(value)) filters[group] = value;
    });
    if (search) search.value = params.get('q') || '';
  };

  const syncFiltersToUrl = () => {
    if (!window.history?.replaceState) return;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([group, value]) => {
      if (value !== 'all') params.set(group, value);
    });
    const term = (search?.value || '').trim();
    if (term) params.set('q', term);
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  };

  const renderWorkoutPlans = () => {
    cards.forEach((card) => {
      const title = card.querySelector('h3')?.textContent.trim();
      const detail = card.querySelector('.workout-detail');
      const plan = workoutPlans[title];
      if (!detail || !plan || detail.querySelector('.workout-plan')) return;
      detail.insertAdjacentHTML('beforeend', renderWorkoutPlan(plan));
    });
  };

  const ensureWorkoutModal = () => {
    let modal = document.getElementById('workout-modal');
    if (modal) return modal;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="workout-modal" id="workout-modal" role="dialog" aria-modal="true" aria-labelledby="workout-modal-title" hidden>
        <div class="workout-modal-backdrop" data-workout-close aria-hidden="true"></div>
        <div class="workout-modal-panel" role="document">
          <header class="workout-modal-header">
            <div>
              <p class="workout-modal-kicker">Workout template</p>
              <h2 class="workout-modal-title" id="workout-modal-title"></h2>
              <p class="workout-modal-summary" id="workout-modal-summary"></p>
              <div class="workout-modal-meta" id="workout-modal-meta"></div>
            </div>
            <button type="button" class="workout-modal-close" data-workout-close aria-label="Close workout template">&times;</button>
          </header>
          <div class="workout-modal-body" id="workout-modal-body"></div>
          <footer class="workout-modal-footer">
            <a class="btn btn-gold" href="contact.html">Customize this plan</a>
            <button type="button" class="btn" id="print-workout-plan">Print plan</button>
            <button type="button" class="btn" data-workout-close>Close plan</button>
          </footer>
        </div>
      </div>
    `);

    modal = document.getElementById('workout-modal');
    modal.querySelectorAll('[data-workout-close]').forEach((control) => {
      control.addEventListener('click', () => closeWorkoutModal());
    });
    modal.querySelector('#print-workout-plan')?.addEventListener('click', () => window.print());
    return modal;
  };

  const closeWorkoutModal = () => {
    const modal = document.getElementById('workout-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    modalTrigger?.focus();
    modalTrigger = null;
  };

  const openWorkoutModal = (card) => {
    const modal = ensureWorkoutModal();
    modalTrigger = card;
    const title = card.querySelector('h3')?.textContent.trim() || 'Workout template';
    const summary = card.querySelector(':scope > p')?.textContent.trim() || '';
    const detail = card.querySelector('.workout-detail');
    const facts = Array.from(card.querySelectorAll('.quick-facts li')).map((item) => item.textContent.trim());
    const schedule = card.querySelector('.workout-card-head span:last-child')?.textContent.trim();
    const level = card.querySelector('.level')?.textContent.trim();

    document.getElementById('workout-modal-title').textContent = title;
    document.getElementById('workout-modal-summary').textContent = summary;
    document.getElementById('workout-modal-meta').innerHTML = [level, schedule, ...facts]
      .filter(Boolean)
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join('');
    document.getElementById('workout-modal-body').innerHTML = detail ? detail.innerHTML : '';

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.workout-modal-close')?.focus();
  };

  const setupWorkoutModal = () => {
    document.body.classList.add('workout-js');

    cards.forEach((card) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Open ${card.querySelector('h3')?.textContent.trim() || 'workout'} template`);

      const summary = card.querySelector('summary');
      summary?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openWorkoutModal(card);
      });

      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button, input, select, textarea')) return;
        event.preventDefault();
        openWorkoutModal(card);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openWorkoutModal(card);
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      const modal = document.getElementById('workout-modal');
      if (!modal || modal.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWorkoutModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  const setupCardAnimations = () => {
    if (!('IntersectionObserver' in window)) {
      cards.forEach((card) => card.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach((card, index) => {
      card.style.transitionDelay = `${Math.min(index, 8) * 45}ms`;
      observer.observe(card);
    });
  };

  const tokenList = (value) => (value || '').toLowerCase().split(/\s+/).filter(Boolean);

  const matchesFilter = (card, group, value) => {
    if (value === 'all') return true;
    const source = group === 'place' ? card.dataset.place : card.dataset[group];
    return tokenList(source).includes(value);
  };

  const matchesSearch = (card, term) => {
    if (!term) return true;
    const haystack = [
      card.textContent,
      card.dataset.goal,
      card.dataset.level,
      card.dataset.place,
      card.dataset.audience
    ].join(' ').toLowerCase();
    return haystack.includes(term);
  };

  const setButtonState = (group, value) => {
    buttons
      .filter((button) => button.dataset.filterGroup === group)
      .forEach((button) => {
        const isActive = button.dataset.filter === value;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
  };

  const applyFilters = ({ syncUrl = true } = {}) => {
    const term = (search?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const isVisible =
        matchesFilter(card, 'goal', filters.goal) &&
        matchesFilter(card, 'level', filters.level) &&
        matchesFilter(card, 'place', filters.place) &&
        matchesSearch(card, term);

      card.hidden = !isVisible;
      if (isVisible) visible += 1;
    });

    if (count) count.textContent = String(visible);
    if (noResults) noResults.hidden = visible !== 0;
    const hasActiveFilters = Object.values(filters).some((value) => value !== 'all') || Boolean(term);
    if (clearFilters) clearFilters.hidden = !hasActiveFilters;
    if (syncUrl) syncFiltersToUrl();
  };

  const resetFilters = () => {
    Object.keys(filters).forEach((group) => { filters[group] = 'all'; });
    if (search) search.value = '';
    Object.keys(filters).forEach((group) => setButtonState(group, filters[group]));
    applyFilters();
    search?.focus();
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.filterGroup;
      const value = button.dataset.filter;
      filters[group] = value;
      setButtonState(group, value);
      applyFilters();
    });
  });

  search?.addEventListener('input', applyFilters);
  clearFilters?.addEventListener('click', resetFilters);

  jumpLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.dataset.jumpFilter;
      const group = value === 'home' ? 'place' : 'goal';
      filters.goal = 'all';
      filters.level = 'all';
      filters.place = 'all';
      filters[group] = value;
      if (search) search.value = '';
      setButtonState('goal', filters.goal);
      setButtonState('level', filters.level);
      setButtonState('place', filters.place);
      applyFilters();
    });
  });

  setupMenu();
  restoreFiltersFromUrl();
  Object.keys(filters).forEach((group) => setButtonState(group, filters[group]));
  renderWorkoutPlans();
  setupWorkoutModal();
  setupCardAnimations();
  applyFilters({ syncUrl: false });
})();
