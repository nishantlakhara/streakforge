#!/usr/bin/env node

/**
 * StreakForge / Parth Skating Planner Seed Script
 * 
 * Usage:
 *   node scripts/seed.js <email> <password>
 * 
 * Example:
 *   node scripts/seed.js parth@skate.com pass1234
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json.data;
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('\n❌ Usage: node scripts/seed.js <email> <password>');
    console.error('Example: node scripts/seed.js user@example.com MyPassword123\n');
    process.exit(1);
  }

  console.log(`\n🚀 Connecting to ${API_BASE}...`);

  // 1. Authenticate (Login or Register)
  let token;
  try {
    console.log(`🔑 Logging in as ${email}...`);
    const authData = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    token = authData.accessToken;
    console.log(`✅ Logged in successfully!`);
  } catch (err) {
    console.log(`ℹ️  Login failed (${err.message}). Attempting registration...`);
    try {
      const authData = await request('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ displayName: 'Parth', email, password }),
      });
      token = authData.accessToken;
      console.log(`✅ Registered and logged in as Parth!`);
    } catch (regErr) {
      console.error(`❌ Registration also failed: ${regErr.message}`);
      process.exit(1);
    }
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Fetch or create athlete profile
  console.log(`\n📋 Fetching athlete profiles...`);
  let profiles = await request('/api/v1/planner/profiles', { headers: authHeaders });
  let profile = profiles && profiles[0];

  if (!profile) {
    console.log(`➕ Creating new profile: "Parth"...`);
    profile = await request('/api/v1/planner/profiles', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Parth' }),
    });
    console.log(`✅ Created profile: ${profile.name} (ID: ${profile.id})`);
  } else {
    console.log(`✅ Using profile: ${profile.name} (ID: ${profile.id})`);
  }

  const profileId = profile.id;

  // 3. Seed Routine Snippets
  console.log(`\n📦 Adding Routine Snippets to Library...`);
  const routine1 = await request(`/api/v1/planner/profiles/${profileId}/library`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Speed Skater Morning Activation',
      type: 'routines',
      data: {
        tasks: [
          { label: 'Dynamic Joint Mobility (Ankles, Hips, Knees)', category: 'morning' },
          { label: 'Core & Glute Activation (Side Planks, Monster Walks)', category: 'morning' },
          { label: '500ml Water + Pinch of Pink Salt & Lemon', category: 'morning' },
          { label: 'Mental Visualization (Lap Strategy & Cornering)', category: 'focus' }
        ]
      }
    }),
  });
  console.log(`  ✓ Routine created: "${routine1.name}"`);

  const routine2 = await request(`/api/v1/planner/profiles/${profileId}/library`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Evening Recovery & Wind Down',
      type: 'routines',
      data: {
        tasks: [
          { label: 'Foam Rolling (IT Bands, Quads & Calves)', category: 'recovery' },
          { label: 'Legs Up The Wall Stretch (10 mins)', category: 'recovery' },
          { label: 'Skate Inspection (Wheels, Bearings & Boots)', category: 'evening' },
          { label: 'No Screens 30 Mins Before Sleep', category: 'recovery' }
        ]
      }
    }),
  });
  console.log(`  ✓ Routine created: "${routine2.name}"`);

  // 4. Seed Meal Plan Snippets
  console.log(`\n🥗 Adding Meal Plan Snippets to Library...`);
  const meal1 = await request(`/api/v1/planner/profiles/${profileId}/library`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'High-Performance Vegetarian Fuel',
      type: 'mealPlans',
      data: {
        nutrition: [
          { label: 'Oatmeal with chia seeds, soaked almonds, banana & berries', category: 'breakfast' },
          { label: 'Sprouted Moong + Paneer/Tofu bowl with whole wheat roti', category: 'lunch' },
          { label: 'Pre-workout Banana + Electrolyte Coconut Water', category: 'pre-workout' },
          { label: 'Post-skate Sattu Protein Shake with Dates', category: 'post-workout' },
          { label: 'Mixed Dal / Lentil Soup with steamed veggies & rice', category: 'dinner' }
        ]
      }
    }),
  });
  console.log(`  ✓ Meal Plan created: "${meal1.name}"`);

  const meal2 = await request(`/api/v1/planner/profiles/${profileId}/library`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Recovery & Anti-Inflammatory Meals',
      type: 'mealPlans',
      data: {
        nutrition: [
          { label: 'Green smoothie (Spinach, flaxseed, apple, almond milk)', category: 'breakfast' },
          { label: 'Quinoa & Chickpea Protein Bowl with avocado', category: 'lunch' },
          { label: 'Walnuts & Dried Figs snack', category: 'snack' },
          { label: 'Warm Turmeric Golden Milk before bed', category: 'dinner' }
        ]
      }
    }),
  });
  console.log(`  ✓ Meal Plan created: "${meal2.name}"`);

  // 5. Seed Goal/Drill Set Snippets
  console.log(`\n🎯 Adding Goal/Drill Sets to Library...`);
  const drill1 = await request(`/api/v1/planner/profiles/${profileId}/library`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Cornering & Crossover Mastery',
      type: 'drillSets',
      data: {
        drills: [
          'Maintain low knee bend (< 90°) throughout the entire corner',
          'Right skate under-push power drills (4 sets x 15 reps)',
          '10 smooth crossover laps at 80% race pace',
          'Tight line exit drill with explosive stride'
        ]
      }
    }),
  });
  console.log(`  ✓ Goals created: "${drill1.name}"`);

  const drill2 = await request(`/api/v1/planner/profiles/${profileId}/library`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Sprint Starts & Speed Endurance',
      type: 'drillSets',
      data: {
        drills: [
          '5 x 30m explosive start drills from whistle',
          '3 x 300m flying start sprint time trials',
          'Deep dryland squat jumps (3 sets x 12 reps)'
        ]
      }
    }),
  });
  console.log(`  ✓ Goals created: "${drill2.name}"`);

  // 6. Seed Daily Templates
  console.log(`\n📋 Adding Daily Templates...`);
  const template1 = await request(`/api/v1/planner/profiles/${profileId}/templates`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Heavy Training Day (Track + Conditioning)',
      type: 'training',
      hydrationTarget: 10,
      tasks: [
        { label: 'Morning Dynamic Warm-up & Hip Mobility', category: 'morning' },
        { label: 'On-Track Speed & Cornering Practice', category: 'activity' },
        { label: 'Dryland Leg Conditioning & Plyometrics', category: 'activity' },
        { label: 'Cool-down Foam Rolling & Ice Bath', category: 'recovery' },
        { label: 'Review Lap Videos & Log Notes', category: 'evening' }
      ],
      nutrition: [
        { label: 'Oatmeal & Protein Breakfast', category: 'breakfast' },
        { label: 'Sprouts & Paneer High-Energy Lunch', category: 'lunch' },
        { label: 'Pre-Track Banana & Electrolytes', category: 'snack' },
        { label: 'Nutrient-Dense Dal & Veggie Dinner', category: 'dinner' }
      ],
      drills: [
        'Complete 10 high-speed crossover laps with clean posture',
        'Execute 5 explosive 100m sprint intervals',
        'Hold low skate squat stance for 90 seconds'
      ]
    }),
  });
  console.log(`  ✓ Template created: "${template1.name}" (ID: ${template1.id})`);

  const template2 = await request(`/api/v1/planner/profiles/${profileId}/templates`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Active Recovery & Flexibility Day',
      type: 'rest',
      hydrationTarget: 8,
      tasks: [
        { label: 'Easy 20-minute walk or gentle spin', category: 'activity' },
        { label: 'Full-body yoga & hip flexor release', category: 'recovery' },
        { label: 'Clean and rotate skate wheels / bearing oiling', category: 'evening' },
        { label: 'Early sleep target (9.5+ hours)', category: 'recovery' }
      ],
      nutrition: [
        { label: 'Fruit & Chia Seed Pudding', category: 'breakfast' },
        { label: 'Quinoa & Mixed Vegetable Bowl', category: 'lunch' },
        { label: 'Light Protein Soup & Chamomile Tea', category: 'dinner' }
      ],
      drills: [
        '15 mins ankle mobility & Achilles stretching',
        '10 mins race course visualization meditation'
      ]
    }),
  });
  console.log(`  ✓ Template created: "${template2.name}" (ID: ${template2.id})`);

  // 7. Schedule templates for the next 7 days
  console.log(`\n📅 Scheduling templates onto Calendar...`);
  const today = new Date();
  const dateStrings = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dateStrings.push(d.toISOString().split('T')[0]);
  }

  // Assign Heavy Training to Day 0, 1, 3, 4, 5 and Recovery to Day 2, 6
  const trainingDates = [];
  const restDates = [];
  dateStrings.forEach((dStr, idx) => {
    if (idx === 2 || idx === 6) {
      restDates.push(dStr);
    } else {
      trainingDates.push(dStr);
    }
  });

  if (trainingDates.length) {
    await request(`/api/v1/planner/profiles/${profileId}/schedule`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ dates: trainingDates, templateId: template1.id }),
    });
    console.log(`  ✓ Scheduled "${template1.name}" on: ${trainingDates.join(', ')}`);
  }

  if (restDates.length) {
    await request(`/api/v1/planner/profiles/${profileId}/schedule`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ dates: restDates, templateId: template2.id }),
    });
    console.log(`  ✓ Scheduled "${template2.name}" on: ${restDates.join(', ')}`);
  }

  // 8. Create a completed sample record for today
  const todayStr = dateStrings[0];
  console.log(`\n⭐ Seeding sample completed record for today (${todayStr})...`);
  await request(`/api/v1/planner/profiles/${profileId}/records/${todayStr}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'training',
      templateId: template1.id,
      tasks: [
        { id: 't1', label: 'Morning Dynamic Warm-up & Hip Mobility', category: 'morning', completed: true },
        { id: 't2', label: 'On-Track Speed & Cornering Practice', category: 'activity', completed: true },
        { id: 't3', label: 'Dryland Leg Conditioning & Plyometrics', category: 'activity', completed: true },
        { id: 't4', label: 'Cool-down Foam Rolling & Ice Bath', category: 'recovery', completed: false },
        { id: 't5', label: 'Review Lap Videos & Log Notes', category: 'evening', completed: true }
      ],
      nutrition: [
        { id: 'n1', label: 'Oatmeal & Protein Breakfast', category: 'breakfast', completed: true },
        { id: 'n2', label: 'Sprouts & Paneer High-Energy Lunch', category: 'lunch', completed: true },
        { id: 'n3', label: 'Pre-Track Banana & Electrolytes', category: 'snack', completed: true },
        { id: 'n4', label: 'Nutrient-Dense Dal & Veggie Dinner', category: 'dinner', completed: true }
      ],
      drills: [
        { label: 'Complete 10 high-speed crossover laps with clean posture', completed: true },
        { label: 'Execute 5 explosive 100m sprint intervals', completed: true },
        { label: 'Hold low skate squat stance for 90 seconds', completed: true }
      ],
      hydrationGlasses: 9,
      sleepBedTime: '21:30',
      sleepWakeTime: '06:30',
      sleepHours: 9.0,
      sleepScore: 'excellent',
      notes: 'Felt very powerful in corners today. Crossover under-push was smooth and low!'
    }),
  });
  console.log(`  ✓ Sample record created for ${todayStr} with 91% completion!`);

  console.log(`\n🎉 Success! Seeding completed successfully.`);
  console.log(`👉 Open http://localhost:5173/streakforge/ in your browser and check your Plan Builder, Calendar, and Dashboard!`);
}

main().catch(err => {
  console.error(`\n❌ Error:`, err.message);
  process.exit(1);
});
