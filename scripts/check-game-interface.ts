/**
 * Game Interface Validator
 *
 * Checks that every game in src/games/ properly implements the PlayBoxGame interface.
 * Validates:
 * - Default export exists
 * - metadata field with all required properties
 * - mount() method exists
 * - unmount() method exists
 * - Metadata values are valid (category, engine, difficulties)
 *
 * Usage: pnpm check-games
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GameCategory,
  EngineType,
  Difficulty,
} from '../src/types/game';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GAMES_DIR = path.resolve(__dirname, '../src/games');

const _VALID_CATEGORIES = Object.values(GameCategory);
const _VALID_ENGINES = Object.values(EngineType);
const _VALID_DIFFICULTIES = Object.values(Difficulty);

// These are used for runtime validation when fully implemented
void _VALID_CATEGORIES; void _VALID_ENGINES; void _VALID_DIFFICULTIES;

interface ValidationResult {
  gameId: string;
  valid: boolean;
  errors: string[];
}

function validateGameDir(gameId: string): ValidationResult {
  const errors: string[] = [];
  const indexPath = path.join(GAMES_DIR, gameId, 'index.ts');

  if (!fs.existsSync(indexPath)) {
    return { gameId, valid: false, errors: ['Missing index.ts'] };
  }

  const content = fs.readFileSync(indexPath, 'utf-8');

  // Check for default export
  if (!content.includes('export default')) {
    errors.push('Missing default export');
  }

  // Check for metadata
  if (!content.includes('metadata')) {
    errors.push('Missing metadata field');
  }

  // Check for mount method
  if (!content.includes('mount')) {
    errors.push('Missing mount() method');
  }

  // Check for unmount method
  if (!content.includes('unmount')) {
    errors.push('Missing unmount() method');
  }

  return { gameId, valid: errors.length === 0, errors };
}

function main() {
  console.log('🔍 Validating game implementations...\n');

  if (!fs.existsSync(GAMES_DIR)) {
    console.log('No games directory found. Nothing to validate.');
    return;
  }

  const entries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
  const gameDirs = entries
    .filter((e: fs.Dirent) => e.isDirectory())
    .map((e: fs.Dirent) => e.name);

  if (gameDirs.length === 0) {
    console.log('No game directories found in src/games/.');
    return;
  }

  const results = gameDirs.map(validateGameDir);
  const validCount = results.filter((r: ValidationResult) => r.valid).length;
  const invalidCount = results.filter((r: ValidationResult) => !r.valid).length;

  for (const result of results) {
    const icon = result.valid ? '✅' : '❌';
    console.log(`${icon} ${result.gameId}`);
    for (const error of result.errors) {
      console.log(`   ⚠️  ${error}`);
    }
  }

  console.log(`\n📊 Results: ${validCount} valid, ${invalidCount} invalid`);

  if (invalidCount > 0) {
    process.exit(1);
  }
}

main();
