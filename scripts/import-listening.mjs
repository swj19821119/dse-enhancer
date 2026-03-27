import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Paths
const OLD_LISTENING_PATH = '/Users/shi/WorkBuddy/20260319202514/dse-english-platform/src/lib/listeningExercises.ts';

// Parse TypeScript file to extract listening exercises
function parseListeningExercises(content) {
  try {
    // Find and extract the AUDIO_BASE constant definition
    const audioBaseMatch = content.match(/const AUDIO_BASE\s*=\s*['"](.*?)['"]/);
    const AUDIO_BASE = audioBaseMatch ? audioBaseMatch[1] : '';

    // Find all three exercise arrays: partAExercises, partBExercises, partCExercises
    const partAMatch = content.match(/const partAExercises: ListeningExercise\[\]\s*=\s*\[(.*?)\];/s);
    const partBMatch = content.match(/const partBExercises: ListeningExercise\[\]\s*=\s*\[(.*?)\];/s);
    const partCMatch = content.match(/const partCExercises: ListeningExercise\[\]\s*=\s*\[(.*?)\];/s);

    if (!partAMatch || !partBMatch || !partCMatch) {
      throw new Error('Could not find all listening exercise arrays in the file');
    }

    // Parse each array with AUDIO_BASE context
    // eslint-disable-next-line no-eval
    const partAExercises = eval(`const AUDIO_BASE = '${AUDIO_BASE}'; [${partAMatch[1]}]`);
    // eslint-disable-next-line no-eval
    const partBExercises = eval(`const AUDIO_BASE = '${AUDIO_BASE}'; [${partBMatch[1]}]`);
    // eslint-disable-next-line no-eval
    const partCExercises = eval(`const AUDIO_BASE = '${AUDIO_BASE}'; [${partCMatch[1]}]`);

    if (!Array.isArray(partAExercises) || !Array.isArray(partBExercises) || !Array.isArray(partCExercises)) {
      throw new Error('Parsed content is not an array');
    }

    // Combine all exercises
    return [...partAExercises, ...partBExercises, ...partCExercises];
  } catch (error) {
    console.error('Error parsing listening exercises file:', error.message);
    throw error;
  }
}

// Extract and flatten all questions from exercises
function extractQuestionsFromExercises(exercises) {
  const allQuestions = [];

  for (const exercise of exercises) {
    // Skip if no questions
    if (!exercise.questions || !Array.isArray(exercise.questions)) {
      continue;
    }

    // Add each question with exercise context
    for (const question of exercise.questions) {
      allQuestions.push({
        ...question,
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        exercisePart: exercise.part,
        exerciseDifficulty: exercise.difficulty,
        exerciseTopic: exercise.topic,
      });
    }
  }

  return allQuestions;
}

// Convert listening question to Prisma format
function convertListeningQuestion(oldQuestion) {
  // Map part letter to Prisma format
  const partMap = {
    'A': 'part_a',
    'B': 'part_b',
    'C': 'part_c',
  };
  const part = partMap[oldQuestion.exercisePart] || null;

  return {
    id: oldQuestion.id || undefined, // Will generate UUID if not provided
    type: 'listening',
    subType: null,
    part: part,
    topic: oldQuestion.topic || oldQuestion.exerciseTopic || null,
    difficulty: oldQuestion.difficulty || oldQuestion.exerciseDifficulty || 1,
    content: oldQuestion.question || '',
    options: oldQuestion.options ? JSON.stringify(oldQuestion.options) : null,
    answer: oldQuestion.correctAnswer || null,
    explanation: oldQuestion.explanation || null,
    source: 'listening-exercise',
    year: null,
    isApproved: true,
    createdAt: new Date(),
  };
}

// Batch insert questions
async function insertQuestions(questions, batchSize = 50) {
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
        console.log(`✓ Imported: ${question.id} (Part ${question.part || 'N/A'} - ${question.topic})`);
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
  console.log('  Listening Exercises Import Script');
  console.log('========================================\n');

  try {
    // Read the old listening exercises file
    console.log('Reading listening exercises file...');
    const fileContent = fs.readFileSync(OLD_LISTENING_PATH, 'utf-8');
    console.log(`✓ File loaded: ${OLD_LISTENING_PATH}\n`);

    // Parse exercises from TypeScript file
    console.log('Parsing listening exercises from TypeScript file...');
    const exercises = parseListeningExercises(fileContent);
    console.log(`✓ Parsed ${exercises.length} listening exercises\n`);

    // Extract all questions from exercises
    console.log('Extracting questions from exercises...');
    const questions = extractQuestionsFromExercises(exercises);
    console.log(`✓ Extracted ${questions.length} questions\n`);

    // Convert questions to Prisma format
    console.log('Converting questions to Prisma format...');
    const convertedQuestions = questions.map(convertListeningQuestion);
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
    console.log(`📊 Total processed:      ${questions.length} questions`);
    console.log(`📚 From exercises:       ${exercises.length} exercises`);
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
