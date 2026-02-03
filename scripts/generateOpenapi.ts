#!/usr/bin/env bun

import { $ } from 'bun';
import { existsSync, mkdirSync } from 'fs';
import { basename } from 'path';

const outputDir = './src/types/openapi-ts';

// Create output directory if it doesn't exist
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Find all yaml files in splice/token-standard/**/openapi
const files = await $`find ./splice/token-standard/**/openapi/* -name "*.yaml"`.text();

const yamlFiles = files.trim().split('\n').filter(Boolean);

console.log(`Found ${yamlFiles.length} OpenAPI files`);

for (const file of yamlFiles) {
  const filename = basename(file).replace(/\.[^.]*$/, '.ts');
  const outputFile = `${outputDir}/${filename}`;

  console.log(`Generating TypeScript for ${file}...`);

  try {
    await $`openapi typegen --backend ${file} > ${outputFile}`;
    console.log(`✓ Generated ${outputFile}`);
  } catch (error) {
    console.error(`✗ Failed to generate for ${file}:`, error);
  }
}

console.log('Done!');
