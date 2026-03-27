import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Paths
const OLD_QUESTIONS_PATH = '/Users/shi/WorkBuddy/20260319202514/dse-english-platform/src/lib/dseQuestions.ts';

// Parse TypeScript array literal to extract question objects
function parseQuestionsFile(content) {
  try {
    // Extract the array content between export const dseQuestions: DSEQuestion[] = [ and ];
    const arrayMatch = content.match(/export const dseQuestions: DSEQuestion\[\]\s*=\s*\[(.*?)\];/s);

    if (!arrayMatch) {
      throw new Error('Could not find dseQuestions array in the file');
    }

    const arrayContent = arrayMatch[1];

    // Use eval to parse the array (note: this is safe as we control the source file)
    // eslint-disable-next-line no-eval
    const questions = eval(`[${arrayContent}]`);

    if (!Array.isArray(questions)) {
      throw new Error('Parsed content is not an array');
    }

    return questions;
  } catch (error) {
    console.error('Error parsing questions file:', error.message);
    throw error;
  }
}

// Convert old question format to Prisma format
function convertQuestion(oldQuestion) {
  return {
    id: oldQuestion.id || undefined, // Will generate UUID if not provided
    type: oldQuestion.type || 'vocabulary',
    subType: null,
    part: null,
    topic: oldQuestion.topic || null,
    difficulty: oldQuestion.difficulty || 1,
    content: oldQuestion.question || '',
    options: oldQuestion.options ? JSON.stringify(oldQuestion.options) : null,
    answer: oldQuestion.correctAnswer || null,
    explanation: oldQuestion.explanation || null,
    source: oldQuestion.dseLevel ? `dse-level-${oldQuestion.dseLevel}` : 'old-dse-questions',
    year: null,
    isApproved: true,
    createdAt: new Date(),
  };
}

// Batch insert questions
async function insertQuestions(questions, batchSize = 100) {
  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);

    for (const question of batch) {
      try {
        // Check if question already exists by id
        const existing = await prisma.question.findUnique({
          where: { id: question.id },
        });

        if (existing) {
          console.log(`Skipping duplicate question: ${question.id}`);
          skippedCount++;
          continue;
        }

        // Insert question
        await prisma.question.create({
          data: question,
        });

        insertedCount++;
        console.log(`✓ Imported: ${question.id} (${question.type} - ${question.topic})`);
      } catch (error) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          console.log(`Skipping duplicate (constraint): ${question.id}`);
          skippedCount++;
        } else {
          console.error(`✗ Error inserting question ${question.id}:`, error.message);
          errorCount++;
        }
      }
    }

    // Progress update
    const processed = Math.min(i + batchSize, questions.length);
    console.log(`Progress: ${processed}/${questions.length} questions processed`);
  }

  return { insertedCount, skippedCount, errorCount };
}

// Main function
async function main() {
  console.log('========================================');
  console.log('  DSE Questions Import Script');
  console.log('========================================\n');

  try {
    // Read the old questions file
    console.log('Reading old questions file...');
    const fileContent = fs.readFileSync(OLD_QUESTIONS_PATH, 'utf-8');
    console.log(`✓ File loaded: ${OLD_QUESTIONS_PATH}\n`);

    // Parse questions from TypeScript file
    console.log('Parsing questions from TypeScript file...');
    const oldQuestions = parseQuestionsFile(fileContent);
    console.log(`✓ Parsed ${oldQuestions.length} questions\n`);

    // Convert questions to Prisma format
    console.log('Converting questions to Prisma format...');
    const convertedQuestions = oldQuestions.map(convertQuestion);
    console.log(`✓ Converted ${convertedQuestions.length} questions\n`);

    // Insert questions in batches
    console.log('Importing questions to database...');
    const { insertedCount, skippedCount, errorCount } = await insertQuestions(convertedQuestions);

    // Summary
    console.log('\n========================================');
    console.log('  Import Summary');
    console.log('========================================');
    console.log(`✓ Successfully imported: ${insertedCount} questions`);
    console.log(`⊘ Skipped (duplicates):  ${skippedCount} questions`);
    console.log(`✗ Failed:               ${errorCount} questions`);
    console.log(`📊 Total processed:      ${oldQuestions.length} questions`);
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
