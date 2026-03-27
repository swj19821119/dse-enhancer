import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateId() {
  return crypto.randomUUID();
}

const vocabularyData = [
  // Level 1 - Basic words
  { word: 'analyse', phonetic: '/ˈænəlaɪz/', definition: 'v. 分析', example: 'We need to analyse the results carefully.', difficulty: 1, topic: '学术', frequency: 85 },
  { word: 'approach', phonetic: '/əˈprəʊtʃ/', definition: 'v. 接近；n. 方法', example: 'We need a new approach to this problem.', difficulty: 1, topic: '通用', frequency: 90 },
  { word: 'assess', phonetic: '/əˈses/', definition: 'v. 评估', example: 'We need to assess the situation.', difficulty: 1, topic: '学术', frequency: 80 },
  { word: 'available', phonetic: '/əˈveɪləbl/', definition: 'adj. 可用的', example: 'This option is available to all users.', difficulty: 1, topic: '通用', frequency: 95 },
  { word: 'benefit', phonetic: '/ˈbenɪfɪt/', definition: 'n. 好处；v. 有益于', example: 'Regular exercise has many benefits.', difficulty: 1, topic: '通用', frequency: 88 },
  { word: 'concept', phonetic: '/ˈkɒnsept/', definition: 'n. 概念', example: 'This concept is difficult to understand.', difficulty: 1, topic: '学术', frequency: 75 },
  { word: 'context', phonetic: '/ˈkɒntekst/', definition: 'n. 背景；上下文', example: 'Consider the context before making a decision.', difficulty: 1, topic: '学术', frequency: 82 },
  { word: 'create', phonetic: '/kriˈeɪt/', definition: 'v. 创造', example: 'We need to create a new solution.', difficulty: 1, topic: '通用', frequency: 92 },
  { word: 'define', phonetic: '/dɪˈfaɪn/', definition: 'v. 定义', example: 'Let me define my terms clearly.', difficulty: 1, topic: '学术', frequency: 78 },
  { word: 'element', phonetic: '/ˈelɪmənt/', definition: 'n. 元素；要素', example: 'This is a key element of our plan.', difficulty: 1, topic: '学术', frequency: 77 },

  // Level 2 - Intermediate words
  { word: 'evaluate', phonetic: '/ɪˈvæljueɪt/', definition: 'v. 评估', example: 'We need to evaluate the results.', difficulty: 2, topic: '学术', frequency: 85 },
  { word: 'factor', phonetic: '/ˈfæktə/', definition: 'n. 因素', example: 'There are many factors to consider.', difficulty: 2, topic: '学术', frequency: 88 },
  { word: 'identify', phonetic: '/aɪˈdentɪfaɪ/', definition: 'v. 识别', example: 'We need to identify the main issues.', difficulty: 2, topic: '学术', frequency: 90 },
  { word: 'indicate', phonetic: '/ˈɪndɪkeɪt/', definition: 'v. 表明', example: 'The data indicates a clear trend.', difficulty: 2, topic: '学术', frequency: 82 },
  { word: 'interpret', phonetic: '/ɪnˈtɜːprɪt/', definition: 'v. 解释', example: 'How do you interpret these results?', difficulty: 2, topic: '学术', frequency: 75 },
  { word: 'method', phonetic: '/ˈmeθəd/', definition: 'n. 方法', example: 'This method is very effective.', difficulty: 2, topic: '学术', frequency: 92 },
  { word: 'obtain', phonetic: '/əbˈteɪn/', definition: 'v. 获得', example: 'We need to obtain more data.', difficulty: 2, topic: '学术', frequency: 80 },
  { word: 'potential', phonetic: '/pəˈtenʃl/', definition: 'adj. 潜在的；n. 潜力', example: 'This has great potential for growth.', difficulty: 2, topic: '通用', frequency: 88 },
  { word: 'primary', phonetic: '/ˈpraɪməri/', definition: 'adj. 主要的', example: 'What is the primary concern?', difficulty: 2, topic: '通用', frequency: 85 },
  { word: 'relevant', phonetic: '/ˈreləvənt/', definition: 'adj. 相关的', example: 'This information is relevant to our topic.', difficulty: 2, topic: '学术', frequency: 82 },

  // Level 3 - Advanced words
  { word: 'comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', definition: 'adj. 全面的', example: 'We need a comprehensive analysis.', difficulty: 3, topic: '学术', frequency: 75 },
  { word: 'phenomenon', phonetic: '/fɪˈnɒmɪnən/', definition: 'n. 现象', example: 'This is an interesting phenomenon.', difficulty: 3, topic: '学术', frequency: 70 },
  { word: 'significance', phonetic: '/sɪɡˈnɪfɪkəns/', definition: 'n. 重要性', example: 'The significance of this study is clear.', difficulty: 3, topic: '学术', frequency: 78 },
  { word: 'contribute', phonetic: '/kənˈtrɪbjuːt/', definition: 'v. 贡献', example: 'Many factors contribute to this issue.', difficulty: 3, topic: '通用', frequency: 85 },
  { word: 'establish', phonetic: '/ɪˈstæblɪʃ/', definition: 'v. 建立', example: 'We need to establish clear guidelines.', difficulty: 3, topic: '学术', frequency: 80 },
  { word: 'fluctuate', phonetic: '/ˈflʌktʃueɪt/', definition: 'v. 波动', example: 'Prices fluctuate based on demand.', difficulty: 3, topic: '商业', frequency: 65 },
  { word: 'implement', phonetic: '/ˈɪmplɪment/', definition: 'v. 实施', example: 'We need to implement these changes.', difficulty: 3, topic: '商业', frequency: 88 },
  { word: 'occupation', phonetic: '/ˌɒkjʊˈpeɪʃn/', definition: 'n. 职业', example: 'What is your current occupation?', difficulty: 3, topic: '生活', frequency: 75 },
  { word: 'perceive', phonetic: '/pəˈsiːv/', definition: 'v. 感知；认为', example: 'How do you perceive this situation?', difficulty: 3, topic: '学术', frequency: 72 },
  { word: 'sufficient', phonetic: '/səˈfɪʃnt/', definition: 'adj. 足够的', example: 'Is there sufficient evidence?', difficulty: 3, topic: '学术', frequency: 80 },

  // Level 4 - Higher Advanced words
  { word: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', definition: 'n. 假设', example: 'We need to test this hypothesis.', difficulty: 4, topic: '学术', frequency: 72 },
  { word: 'methodology', phonetic: '/ˌmeθəˈdɒlədʒi/', definition: 'n. 方法论', example: 'The methodology is well-designed.', difficulty: 4, topic: '学术', frequency: 68 },
  { word: 'substantial', phonetic: '/səbˈstænʃl/', definition: 'adj. 大量的', example: 'There is a substantial improvement.', difficulty: 4, topic: '学术', frequency: 75 },
  { word: 'accommodate', phonetic: '/əˈkɒmədeɪt/', definition: 'v. 容纳；适应', example: 'We need to accommodate all users.', difficulty: 4, topic: '通用', frequency: 70 },
  { word: 'consecutive', phonetic: '/kənˈsekjʊtɪv/', definition: 'adj. 连续的', example: 'Three consecutive days of rain.', difficulty: 4, topic: '通用', frequency: 65 },
  { word: 'deteriorate', phonetic: '/dɪˈtɪəriəreɪt/', definition: 'v. 恶化', example: 'The situation may deteriorate.', difficulty: 4, topic: '新闻', frequency: 60 },
  { word: 'elaborate', phonetic: '/ɪˈlæbərət/', definition: 'v. 详细说明；adj. 精心设计的', example: 'Can you elaborate on this point?', difficulty: 4, topic: '学术', frequency: 72 },
  { word: 'facilitate', phonetic: '/fəˈsɪlɪteɪt/', definition: 'v. 促进', example: 'This tool facilitates learning.', difficulty: 4, topic: '学术', frequency: 75 },
  { word: 'incorporate', phonetic: '/ɪnˈkɔːpəreɪt/', definition: 'v. 包含；整合', example: 'We should incorporate these suggestions.', difficulty: 4, topic: '商业', frequency: 78 },
  { word: 'legitimate', phonetic: '/lɪˈdʒɪtɪmət/', definition: 'adj. 合法的；正当的', example: 'This is a legitimate concern.', difficulty: 4, topic: '商业', frequency: 65 },

  // Level 5 - Highest level words
  { word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', definition: 'adj. 模棱两可的', example: 'The statement is ambiguous.', difficulty: 5, topic: '学术', frequency: 60 },
  { word: 'consolidate', phonetic: '/kənˈsɒlɪdeɪt/', definition: 'v. 巩固', example: 'We need to consolidate our gains.', difficulty: 5, topic: '商业', frequency: 55 },
  { word: 'deteriorate', phonetic: '/dɪˈtɪəriəreɪt/', definition: 'v. 恶化', example: 'His health began to deteriorate.', difficulty: 5, topic: '新闻', frequency: 58 },
  { word: 'exacerbate', phonetic: '/ɪɡˈzæsəbeɪt/', definition: 'v. 加剧', example: 'This will exacerbate the problem.', difficulty: 5, topic: '学术', frequency: 52 },
  { word: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', definition: 'n. 假设', example: 'The hypothesis was proven correct.', difficulty: 5, topic: '学术', frequency: 65 },
  { word: 'indispensable', phonetic: '/ˌɪndɪˈspensəbl/', definition: 'adj. 不可或缺的', example: 'This tool is indispensable.', difficulty: 5, topic: '通用', frequency: 55 },
  { word: 'meticulous', phonetic: '/məˈtɪkjələs/', definition: 'adj. 一丝不苟的', example: 'She is meticulous in her work.', difficulty: 5, topic: '生活', frequency: 50 },
  { word: 'precedent', phonetic: '/ˈpresɪdənt/', definition: 'n. 先例', example: 'There is no precedent for this.', difficulty: 5, topic: '法律', frequency: 58 },
  { word: 'substantiate', phonetic: '/səbˈstænʃieɪt/', definition: 'v. 证实', example: 'Can you substantiate your claim?', difficulty: 5, topic: '学术', frequency: 48 },
  { word: 'unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', definition: 'adj. 史无前例的', example: 'This is an unprecedented situation.', difficulty: 5, topic: '新闻', frequency: 62 },

  // Additional DSE-focused words
  { word: 'advantage', phonetic: '/ədˈvɑːntɪdʒ/', definition: 'n. 优势', example: 'This approach has many advantages.', difficulty: 1, topic: '通用', frequency: 92 },
  { word: 'circumstance', phonetic: '/ˈsɜːkəmstəns/', definition: 'n. 情况', example: 'Under these circumstances, we must be careful.', difficulty: 2, topic: '通用', frequency: 78 },
  { word: 'consequence', phonetic: '/ˈkɒnsɪkwəns/', definition: 'n. 后果', example: 'We must consider the consequences.', difficulty: 2, topic: '学术', frequency: 82 },
  { word: 'demonstrate', phonetic: '/ˈdemənstreɪt/', definition: 'v. 展示', example: 'Let me demonstrate how it works.', difficulty: 2, topic: '学术', frequency: 85 },
  { word: 'emphasis', phonetic: '/ˈemfəsɪs/', definition: 'n. 强调', example: 'We need to place more emphasis on quality.', difficulty: 2, topic: '学术', frequency: 88 },
  { word: 'feature', phonetic: '/ˈfiːtʃə/', definition: 'n. 特征', example: 'This is a key feature of the product.', difficulty: 1, topic: '通用', frequency: 90 },
  { word: 'generate', phonetic: '/ˈdʒenəreɪt/', definition: 'v. 产生', example: 'This will generate new opportunities.', difficulty: 2, topic: '通用', frequency: 82 },
  { word: 'illustrate', phonetic: '/ˈɪləstreɪt/', definition: 'v. 说明', example: 'Let me illustrate my point.', difficulty: 2, topic: '学术', frequency: 78 },
  { word: 'justify', phonetic: '/ˈdʒʌstɪfaɪ/', definition: 'v. 证明...是正当的', example: 'Can you justify your decision?', difficulty: 3, topic: '学术', frequency: 72 },
  { word: 'maintain', phonetic: '/meɪnˈteɪn/', definition: 'v. 维持', example: 'We need to maintain high standards.', difficulty: 2, topic: '通用', frequency: 85 },
  { word: 'notion', phonetic: '/ˈnəʊʃn/', definition: 'n. 概念', example: 'This notion is widely accepted.', difficulty: 3, topic: '学术', frequency: 65 },
  { word: 'perspective', phonetic: '/pəˈspektɪv/', definition: 'n. 观点', example: 'From my perspective, this is correct.', difficulty: 2, topic: '学术', frequency: 80 },
  { word: 'recommend', phonetic: '/ˌrekəˈmend/', definition: 'v. 推荐', example: 'I recommend this approach.', difficulty: 1, topic: '通用', frequency: 88 },
  { word: 'specify', phonetic: '/ˈspesɪfaɪ/', definition: 'v. 指定', example: 'Please specify your requirements.', difficulty: 2, topic: '学术', frequency: 75 },
  { word: 'theme', phonetic: '/θiːm/', definition: 'n. 主题', example: 'What is the main theme of this article?', difficulty: 1, topic: '学术', frequency: 92 },
  { word: 'transform', phonetic: '/trænsˈfɔːm/', definition: 'v. 改变', example: 'Technology has transformed our lives.', difficulty: 2, topic: '通用', frequency: 82 },
  { word: 'unique', phonetic: '/juˈniːk/', definition: 'adj. 独特的', example: 'Each person has unique qualities.', difficulty: 1, topic: '通用', frequency: 90 },
  { word: 'voluntary', phonetic: '/ˈvɒləntri/', definition: 'adj. 自愿的', example: 'This is a voluntary program.', difficulty: 2, topic: '通用', frequency: 70 },
  { word: 'yield', phonetic: '/jiːld/', definition: 'v. 产生；n. 收益', example: 'This investment will yield good returns.', difficulty: 3, topic: '商业', frequency: 65 },
];

async function main() {
  console.log('Starting vocabulary import...');
  console.log(`Total words to import: ${vocabularyData.length}`);

  let imported = 0;
  let skipped = 0;

  for (const word of vocabularyData) {
    try {
      const existing = await prisma.vocabulary.findFirst({
        where: { word: word.word }
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.vocabulary.create({
        data: {
          id: generateId(),
          word: word.word,
          phonetic: word.phonetic,
          definition: word.definition,
          example: word.example,
          difficulty: word.difficulty,
          topic: word.topic,
          frequency: word.frequency,
          part: 'part_a',
        }
      });
      imported++;
    } catch (error) {
      console.error(`Error importing word "${word.word}":`, error.message);
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Total in database: ${imported + skipped}`);

  const stats = await prisma.vocabulary.groupBy({
    by: ['difficulty'],
    _count: { id: true }
  });

  console.log('\nWords by difficulty:');
  stats.forEach(s => {
    console.log(`  Level ${s.difficulty}: ${s._count.id} words`);
  });
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });