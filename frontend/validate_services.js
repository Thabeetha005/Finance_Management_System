import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { servicesData } from './src/data/servicesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Kalpanaa Finance Services Validation ---');

// 1. Verify we have 27 services
if (servicesData.length !== 27) {
  console.error(`❌ Expected 27 services, found ${servicesData.length}`);
  process.exit(1);
} else {
  console.log('✅ Correct number of services (27)');
}

const slugs = new Set();
let hasErrors = false;

servicesData.forEach((service, index) => {
  // 2. Unique slugs
  if (slugs.has(service.slug)) {
    console.error(`❌ Duplicate slug found: ${service.slug}`);
    hasErrors = true;
  }
  slugs.add(service.slug);

  // 3. Required fields
  const required = ['category', 'title', 'heroTitle', 'heroImage', 'introduction', 'features', 'cta', 'seo'];
  required.forEach(field => {
    if (!service[field]) {
      console.error(`❌ Service '${service.title}' is missing required field: ${field}`);
      hasErrors = true;
    }
  });

  // 4. Validate array lengths
  if (service.features.length < 2) {
    console.error(`❌ Service '${service.title}' has too few features.`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n❌ Validation Failed.');
  process.exit(1);
} else {
  console.log('✅ All services have valid slugs, unique content, required fields, and SEO metadata.');
  console.log('\n--- Validation Passed ---');
}
