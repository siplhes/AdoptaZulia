# Lost Pets Seeder

## Overview

Utility to populate the database with realistic lost pet data for development and testing purposes.

## Features

- ✅ Generates realistic Venezuelan lost pet data
- ✅ Random pet types, breeds, and locations from Zulia
- ✅ Varied timestamps (last 90 days)
- ✅ Mix of statuses (lost, found, reunited)
- ✅ Realistic descriptions in Spanish
- ✅ Test data clearly marked (`isTest: true`)
- ✅ Development-only (blocked in production)

## Usage

### Import the Seeder

```typescript
import {
  seedLostPets,
  clearLostPetsTestData,
  getTestLostPetsCount,
} from '~/utils/seeders/lostPetsSeeder'
```

### Seed Lost Pets

```typescript
// Seed 30 lost pets (default)
await seedLostPets()

// Seed custom amount
await seedLostPets(50)
```

### Clear Test Data

```typescript
// Remove all test lost pets
await clearLostPetsTestData()
```

### Check Test Data Count

```typescript
const count = await getTestLostPetsCount()
console.log(`There are ${count} test lost pets`)
```

## Example: Development Script

Create `scripts/seed-dev-data.ts`:

```typescript
import { seedLostPets } from '~/utils/seeders/lostPetsSeeder'

async function seedDevelopmentData() {
  console.log('🌱 Seeding development data...')

  await seedLostPets(40)

  console.log('✅ Development data seeded successfully!')
}

seedDevelopmentData()
```

## Example: Admin Page Integration

```vue
<template>
  <div>
    <h2>Development Tools</h2>
    <button @click="seedData">Seed Lost Pets</button>
    <button @click="clearData">Clear Test Data</button>
    <p>Test pets: {{ testCount }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  seedLostPets,
  clearLostPetsTestData,
  getTestLostPetsCount,
} from '~/utils/seeders/lostPetsSeeder'

const testCount = ref(0)

async function seedData() {
  await seedLostPets(30)
  await refreshCount()
}

async function clearData() {
  await clearLostPetsTestData()
  await refreshCount()
}

async function refreshCount() {
  testCount.value = await getTestLostPetsCount()
}

onMounted(refreshCount)
</script>
```

## Generated Data

### Pet Types

- Perros (dogs)
- Gatos (cats)
- Aves (birds)
- Conejos (rabbits)

### Locations (Zulia)

- Maracaibo Centro
- Delicias
- Santa Rita
- Valle Frío
- La Lago
- And 13 more neighborhoods

### Data Fields

- **Name:** Random from Venezuelan pet name lists
- **Breed:** Appropriate breeds per type
- **Color:** Common pet colors
- **Size:** Pequeño, mediano, grande
- **Description:** Templated realistic descriptions
- **Contact:** Generated Venezuelan phone numbers (0414, 0424, etc.)
- **Reward:** 60% chance of reward (50-500 Bs)
- **Status:** 70% lost, 20% found, 10% reunited
- **Date:** Random within last 90 days
- **Images:** Placeholder images

## Safety Features

### Production Protection

```typescript
if (process.env.NODE_ENV === 'production') {
  throw new Error('Seeding is not allowed in production!')
}
```

### Test Data Markers

All seeded data includes:

- `isTest: true`
- `userId: 'test_user_seed'`

This allows easy identification and cleanup.

## Notes

- Seeder respects Firebase security rules
- Only works in development environment
- Test data is clearly marked
- Can be safely cleared without affecting real data
- Timestamps are randomized for realistic testing

## Future Enhancements

- [ ] Add more pet types (reptiles, hamsters)
- [ ] Generate sighting reports
- [ ] Add user seed data
- [ ] Create adoption seed data
- [ ] Add command-line interface
- [ ] Progress indicators for large seeds
