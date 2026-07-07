const app = require('../api/stripe-server-premium');

const payload = {
  name: 'Nutrition Endpoint Test',
  email: 'nutrition-endpoint-test@example.com',
  source: 'Nutrition Calculator Test',
  page: '/nutrition-calculator.html',
  profile: {
    sex: 'male',
    age: 35,
    heightCm: 178,
    weightKg: 82,
    bodyFat: 22,
    goal: 'fat_loss',
    trainingFrequency: '3-4',
    sessionDuration: '45',
    trainingIntensity: 'moderate',
    dailyActivity: 'mostly_sitting',
    dailySteps: '4000_7000',
    mealPreference: '4',
    dietPreference: 'balanced',
    targetPace: 'moderate',
    accuracyMode: 'conservative',
    unitSystem: 'metric'
  },
  result: {
    maintenanceCalories: 2250,
    maintenanceLow: 2070,
    maintenanceHigh: 2430,
    targetCalories: 1850,
    calorieDelta: -400,
    baselineMultiplier: 1.3,
    trainingCaloriesDaily: 140,
    accuracyFactor: 0.93,
    protein: 165,
    carbs: 165,
    fats: 60,
    fiberTarget: 25,
    waterLow: 2460,
    waterHigh: 3280,
    mealSplitPlan: [
      { meal: 'Breakfast', calories: 460, protein: 40, carbs: 40, fats: 15 },
      { meal: 'Lunch', calories: 555, protein: 50, carbs: 50, fats: 18 },
      { meal: 'Dinner', calories: 555, protein: 50, carbs: 50, fats: 18 },
      { meal: 'Snack', calories: 280, protein: 25, carbs: 25, fats: 9 }
    ],
    exampleDay: [
      'Breakfast: Greek yoghurt, oats, berries and whey.',
      'Lunch: Chicken, rice, vegetables and olive oil.',
      'Dinner: Lean beef, potatoes and salad.',
      'Snack: Protein shake and fruit.'
    ],
    warnings: []
  },
  templates: [
    {
      title: 'Balanced Fat Loss Template',
      macroEmphasis: 'High protein, moderate carbs',
      calorieRange: [1700, 2100],
      mealFrequency: 4,
      bestFor: 'Busy professionals starting a fat-loss phase.',
      sampleDay: [
        { meal: 'Breakfast', example: 'Greek yoghurt bowl' },
        { meal: 'Lunch', example: 'Chicken rice bowl' }
      ]
    }
  ]
};

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: response.status, data };
}

async function main() {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const valid = await postJson(`${base}/api/nutrition-calculator`, payload);
    const invalid = await postJson(`${base}/api/nutrition-calculator`, {
      ...payload,
      email: 'not-an-email'
    });

    const summary = {
      validStatus: valid.status,
      validOk: valid.data.ok === true,
      saved: valid.data.saved === true,
      emailSent: valid.data.emailSent === true,
      emailSkipped: valid.data.emailSkipped === true,
      adminEmailSent: valid.data.adminEmailSent === true,
      adminEmailSkipped: valid.data.adminEmailSkipped === true,
      invalidStatus: invalid.status,
      invalidRejected: invalid.status === 400 && /email/i.test(String(invalid.data.error || ''))
    };

    console.log(JSON.stringify(summary, null, 2));

    if (summary.validStatus !== 200 || !summary.validOk || !summary.invalidRejected) {
      process.exitCode = 1;
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
