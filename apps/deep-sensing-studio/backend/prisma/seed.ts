import { PrismaClient, Regime, SentimentLabel } from '@prisma/client';

const prisma = new PrismaClient();

// --- Configuration ---
const TOTAL_DOCUMENTS = 1000;
const REGIME_DISTRIBUTION = {
  [Regime.Support]: 0.5,     // 50%
  [Regime.Exploration]: 0.3, // 30%
  [Regime.Balance]: 0.2,     // 20%
};
const DOCUMENTS_WITH_RELATIONS = 100; // Create relations for the first 100 docs

// --- Helper Functions ---

/**
 * Generates a random float between min and max.
 */
function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min and max.
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a regime based on the defined distribution.
 */
function selectRegime(): Regime {
  const rand = Math.random();
  let cumulative = 0;

  for (const regime in REGIME_DISTRIBUTION) {
    cumulative += REGIME_DISTRIBUTION[regime as Regime];
    if (rand < cumulative) {
      return regime as Regime;
    }
  }
  return Regime.Balance; // Fallback
}

/**
 * Generates a sample 4D quaternion embedding.
 */
function createQuaternion() {
  return {
    a: getRandomFloat(-1, 1),
    bi: getRandomFloat(-1, 1),
    cj: getRandomFloat(-1, 1),
    dk: getRandomFloat(-1, 1),
  };
}

/**
 * Generates a sample sentiment label based on score.
 */
function getSentimentLabel(score: number): SentimentLabel {
  if (score > 0.3) return SentimentLabel.positive;
  if (score < -0.3) return SentimentLabel.negative;
  return SentimentLabel.neutral;
}

// --- Main Seeding Logic ---

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data to ensure idempotency
  console.log('🗑️  Deleting existing data...');
  await prisma.embedding.deleteMany({});
  await prisma.sentiment.deleteMany({});
  await prisma.entity.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});

  // --- Seed Documents ---
  console.log(`📄 Creating ${TOTAL_DOCUMENTS} sample documents...`);
  const createdDocuments = [];
  for (let i = 0; i < TOTAL_DOCUMENTS; i++) {
    const regime = selectRegime();
    const confidence =
      regime === Regime.Support
        ? getRandomFloat(0.8, 1.0)
        : regime === Regime.Exploration
        ? getRandomFloat(0.3, 0.7)
        : getRandomFloat(0.6, 0.9);

    const document = await prisma.document.create({
      data: {
        content: `This is a sample document content for document #${i + 1}. Its classified regime is ${regime} with a confidence of ${confidence.toFixed(2)}. The content contains various pieces of information for analysis.`,
        structured_data: {
          source: 'seed-script',
          index: i,
          has_relations: i < DOCUMENTS_WITH_RELATIONS,
        },
        embedding: createQuaternion(),
        confidence,
        regime,
      },
    });
    createdDocuments.push(document);
  }
  console.log(`✅ ${createdDocuments.length} documents created.`);

  // --- Seed Relations (Entities, Sentiments, Embeddings) ---
  console.log(`🔗 Creating relations for the first ${DOCUMENTS_WITH_RELATIONS} documents...`);
  for (let i = 0; i < DOCUMENTS_WITH_RELATIONS; i++) {
    const doc = createdDocuments[i];

    // Create 1-5 entities per document
    const numEntities = getRandomInt(1, 5);
    for (let j = 0; j < numEntities; j++) {
      await prisma.entity.create({
        data: {
          document_id: doc.id,
          entity_type: 'SAMPLE_TYPE',
          entity_value: `SampleEntity_${j}`,
          confidence: getRandomFloat(0.5, 0.99),
          position_start: 10,
          position_end: 25,
        },
      });
    }

    // Create one sentiment record per document
    const sentimentScore = getRandomFloat(-1, 1);
    await prisma.sentiment.create({
      data: {
        document_id: doc.id,
        sentiment_score: sentimentScore,
        sentiment_label: getSentimentLabel(sentimentScore),
        confidence: getRandomFloat(0.7, 0.98),
      },
    });

    // Create one additional embedding record per document
    await prisma.embedding.create({
      data: {
        document_id: doc.id,
        quaternion: createQuaternion(),
      },
    });
  }
  console.log('✅ Relations created.');

  // --- Seed a sample user ---
  console.log('👤 Creating a sample user...');
  await prisma.user.create({
    data: {
      email: 'jules@asymmetrica.ai',
      name: 'Jules AI',
      api_key_hash: 'sample-key-hash-for-testing'
    }
  });
  console.log('✅ Sample user created.');


  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });