#!/usr/bin/env tsx

/**
 * Generate OpenAPI specification file
 *
 * This script generates the openapi.json file which can be used for:
 * - TypeScript client generation for frontend
 * - API documentation review
 * - Integration with external tools
 *
 * Usage:
 *   npm run generate-openapi
 *   tsx scripts/generate-openapi.ts
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateOpenAPIDocument } from '../src/docs/openapi-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🔄 Generating OpenAPI specification...');

  const openApiDocument = generateOpenAPIDocument();
  const outputPath = join(__dirname, '..', 'openapi.json');

  writeFileSync(
    outputPath,
    JSON.stringify(openApiDocument, null, 2),
    'utf-8'
  );

  console.log('✅ OpenAPI specification generated successfully!');
  console.log(`📄 File location: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('  - Generate TypeScript client: npm run generate-client');
  console.log('  - View in Swagger UI: npm run dev → http://localhost:3000/api-docs');
  console.log('  - Use for API testing: Import openapi.json into Postman/Insomnia');

} catch (error) {
  console.error('❌ Error generating OpenAPI specification:', error);
  process.exit(1);
}
