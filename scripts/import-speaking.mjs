import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateId() {
  return crypto.randomUUID();
}

const speakingQuestions = [
  // Question 1: Picture Description - Marine Pollution
  {
    id: generateId(),
    type: 'speaking',
    subType: 'picture_description',
    part: 'part_a',
    topic: '图片描述 - 海洋污染',
    difficulty: 3,
    content: JSON.stringify({
      title: '图片描述 - 海洋污染',
      instruction: 'Describe this picture and talk about the problem it shows.',
      preparationTips: [
        '描述图片内容（看到了什么）',
        '指出问题（塑料污染）',
        '说明影响（对海洋动物的伤害）',
        '提出建议（如何解决）'
      ],
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: 'Good morning, everyone. Today I want to talk about this picture. I can see a lot of plastic rubbish in the sea. There are many plastic bottles and bags floating on the water. A poor turtle is caught in a plastic net. This is very sad.\\n\\nI think this picture shows a serious problem - plastic pollution. Every day, people throw away plastic things. Some of them end up in the ocean. This is bad for sea animals. They may eat the plastic or get hurt by it.\\n\\nIn my opinion, we should stop using so much plastic. We can bring our own bags when shopping. We can also recycle plastic bottles. If everyone does a little bit, we can protect our oceans and save the animals.\\n\\nThank you for listening.',
        wordCount: 128
      },
      level4: {
        content: 'Good morning, everyone. Looking at this picture, I can see a heartbreaking scene of marine pollution. The ocean is filled with plastic waste, including bottles, bags, and other debris. Most disturbingly, a sea turtle is trapped in a fishing net, struggling to free itself.\\n\\nThis image vividly illustrates the severity of plastic pollution in our oceans. According to recent studies, millions of tons of plastic enter the ocean every year. Marine animals often mistake plastic for food or become entangled in it, leading to injury or death.\\n\\nFrom my perspective, this problem requires immediate action from both individuals and governments. As individuals, we should reduce our plastic consumption by using reusable bags and bottles. We should also participate in beach clean-up activities. Meanwhile, the government should implement stricter regulations on plastic production and waste management.\\n\\nIn conclusion, protecting our oceans is everyone\'s responsibility. We must act now before it\'s too late.\\n\\nThank you.',
        wordCount: 168
      },
      level5: {
        content: 'Good morning, everyone. The image before us presents a harrowing depiction of environmental degradation - a once-pristine ocean now desecrated by an avalanche of plastic detritus. The sight of a vulnerable sea turtle ensnared in a discarded fishing net serves as a poignant metaphor for the devastating impact of human negligence on marine ecosystems.\\n\\nThis photograph encapsulates the burgeoning crisis of plastic pollution that has reached epidemic proportions. It is estimated that approximately eight million metric tons of plastic waste infiltrate our oceans annually, wreaking havoc on aquatic biodiversity. Marine creatures, unable to distinguish between nourishment and refuse, often ingest these toxic materials or become entrapped, culminating in a slow, agonizing demise.\\n\\nThe root cause of this predicament lies in our throwaway culture and the proliferation of single-use plastics. Consequently, I firmly believe that a multi-pronged approach is imperative. Individually, we must embrace sustainable alternatives and advocate for a circular economy. Corporations should be held accountable for their environmental footprint through Extended Producer Responsibility schemes. Furthermore, governments must enact and enforce stringent legislation to prohibit non-essential plastics.\\n\\nIn essence, the preservation of our oceans is not merely an environmental imperative but a moral obligation to future generations. The time for complacency has long passed; immediate, concerted action is the only viable path forward.\\n\\nThank you for your attention.',
        wordCount: 226
      }
    }),
    explanation: '图片描述需要：1）清晰描述图片内容 2）指出图片反映的问题 3）分析原因和影响 4）提出可行的解决方案',
    source: 'dse-practice',
    isApproved: true,
  },
  // Question 2: Personal Experience - Memorable Trip
  {
    id: generateId(),
    type: 'speaking',
    subType: 'personal_experience',
    part: 'part_a',
    topic: '个人经历 - 一次难忘的旅行',
    difficulty: 3,
    content: JSON.stringify({
      title: '个人经历 - 一次难忘的旅行',
      instruction: 'Describe a memorable trip you have taken.',
      preparationTips: [
        '去哪里（地点）',
        '什么时候（时间）',
        '做了什么（活动）',
        '为什么难忘（感受）'
      ],
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: 'Good morning. I want to talk about my trip to Japan last year.\\n\\nI went to Tokyo with my family during summer holiday. We stayed there for five days. The weather was very hot but we had a good time.\\n\\nWe visited many famous places. We went to Tokyo Tower and saw the beautiful city view. We also went to Disneyland. It was very fun. I tried many delicious Japanese food like sushi and ramen.\\n\\nThis trip is memorable because it was my first time to go abroad. I learned about Japanese culture and made many nice photos. I hope I can visit Japan again in the future.\\n\\nThank you.',
        wordCount: 104
      },
      level4: {
        content: 'Good morning, everyone. I would like to share with you a truly memorable journey I embarked upon last summer - a week-long family vacation to Japan.\\n\\nOur destination was Tokyo, where we spent five delightful days exploring this vibrant metropolis. Despite the sweltering summer heat, our enthusiasm remained undiminished throughout the trip.\\n\\nOur itinerary was packed with diverse experiences. We ascended the iconic Tokyo Tower, where the panoramic cityscape took our breath away. The highlight for me was undoubtedly our visit to Tokyo Disneyland, where the magical atmosphere transported me back to childhood. Additionally, we indulged in authentic Japanese cuisine, savoring exquisite sushi and flavorful ramen that far exceeded my expectations.\\n\\nWhat made this trip particularly unforgettable was that it marked my first international travel experience. It broadened my horizons, exposed me to a fascinating culture, and created cherished memories that I will treasure forever. The journey ignited my passion for travel and cultural exploration.\\n\\nThank you for listening.',
        wordCount: 158
      },
      level5: {
        content: 'Good morning, everyone. I would like to recount a profoundly transformative expedition that remains indelibly etched in my memory - an immersive week-long sojourn to Japan with my family during the preceding summer.\\n\\nOur voyage centered on Tokyo, that mesmerizing confluence of ancient tradition and cutting-edge modernity, where we resided for five exhilarating days. Notwithstanding the oppressive humidity and soaring temperatures characteristic of Japanese summers, our ardor for discovery remained unwavering.\\n\\nOur meticulously curated itinerary encompassed a kaleidoscope of experiences. We ascended the legendary Tokyo Tower, where the vertiginous vantage point afforded us a breathtaking panorama of the sprawling urban landscape. The pièce de résistance, however, was our pilgrimage to Tokyo Disneyland, an enchanting realm where the suspension of disbelief allowed me to recapture the unbridled wonder of youth. Gastronomically, we embarked on a culinary odyssey, partaking of superlative sushi crafted by master chefs and savoring umami-rich ramen that obliterated all prior benchmarks.\\n\\nYet what rendered this expedition truly epochal was its status as my inaugural international voyage. It served as a catalyst for intellectual and cultural expansion, dismantling parochial perspectives and instilling an insatiable wanderlust. The experience crystallized my conviction that immersion in foreign cultures constitutes the most edifying form of education.\\n\\nThank you for your attention.',
        wordCount: 184
      }
    }),
    explanation: '个人经历需要：1）清楚说明旅行的基本信息（时间、地点、人物）2）详细描述旅行中的活动和经历 3）表达真实的感受和收获 4）说明为什么这次旅行令人难忘',
    source: 'dse-practice',
    isApproved: true,
  },
  // Question 3: Opinion Expression - Online Learning
  {
    id: generateId(),
    type: 'speaking',
    subType: 'opinion_expression',
    part: 'part_a',
    topic: '观点表达 - 网络学习的利弊',
    difficulty: 3,
    content: JSON.stringify({
      title: '观点表达 - 网络学习的利弊',
      instruction: 'Do you think online learning is effective? Why or why not?',
      preparationTips: [
        '明确观点（有效/无效/双刃剑）',
        '列举优点（2-3点）',
        '列举缺点（2-3点）',
        '总结建议'
      ],
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: 'Good morning. Today I want to talk about online learning.\\n\\nI think online learning has both good and bad points. Let me talk about the good points first. First, we can study at home. We do not need to travel to school. This saves time. Second, we can watch the video again if we do not understand.\\n\\nBut online learning also has problems. First, it is bad for our eyes. We need to look at the computer for a long time. Second, we cannot talk with classmates face to face. We may feel lonely.\\n\\nIn my opinion, online learning is okay but not perfect. I prefer going to school. We can have both online and face-to-face learning. This is the best way.\\n\\nThank you.',
        wordCount: 114
      },
      level4: {
        content: 'Good morning, everyone. The question of whether online learning constitutes an effective pedagogical approach is one that has garnered considerable attention, particularly in the wake of recent global events. From my perspective, the efficacy of online learning is contingent upon multiple factors.\\n\\nThere are undeniable advantages to this mode of education. Primarily, it offers unprecedented flexibility, allowing students to access materials at their convenience and review recorded lectures multiple times. Additionally, it eliminates commuting time and associated costs, making education more accessible to those in remote areas.\\n\\nNevertheless, significant drawbacks exist. The absence of face-to-face interaction can impede the development of interpersonal skills and foster feelings of isolation. Furthermore, prolonged screen exposure poses health risks, particularly to eyesight, and the home environment often lacks the structured atmosphere conducive to focused study.\\n\\nIn conclusion, while online learning serves as a valuable supplementary tool, I believe it cannot fully supplant traditional classroom instruction. An optimal approach would integrate both methodologies, harnessing the strengths of each.\\n\\nThank you.',
        wordCount: 154
      },
      level5: {
        content: 'Good morning, everyone. The proliferation of online learning platforms has precipitated vigorous debate regarding their pedagogical efficacy - a discourse that has assumed unprecedented urgency in contemporary educational discourse. Having experienced both modalities extensively, I am inclined to posit that the effectiveness of online learning is inextricably linked to individual learning proclivities and the nature of the subject matter.\\n\\nUndeniably, online learning confers distinct advantages. The asynchronous nature of many platforms affords learners autonomy over their schedules, accommodating diverse chronotypes and extracurricular commitments. Moreover, the ability to pause, rewind, and rewatch instructional content facilitates mastery of complex concepts at one\'s own pace. For geographically dispersed populations, online education democratizes access to quality instruction previously available only to urban elites.\\n\\nHowever, these benefits must be weighed against substantial limitations. The diminution of spontaneous peer-to-peer interaction vitiates the collaborative learning environment essential for developing critical thinking and communication competencies. The digital divide exacerbates educational inequities, while the sedentary nature of prolonged screen engagement precipitates health complications. Furthermore, the absence of immediate instructor feedback can allow misconceptions to persist unchecked.\\n\\nUltimately, I contend that online learning functions most effectively not as a wholesale replacement for traditional pedagogy, but as a complementary modality within a blended learning framework.\\n\\nThank you for your attention.',
        wordCount: 192
      }
    }),
    explanation: '观点表达需要：1）清晰表明个人立场 2）有逻辑地支持观点（优缺点分析）3）使用恰当的连接词增强连贯性 4）总结并提出平衡的看法',
    source: 'dse-practice',
    isApproved: true,
  },
  // Question 4: Picture Description - Elderly Loneliness
  {
    id: generateId(),
    type: 'speaking',
    subType: 'picture_description',
    part: 'part_a',
    topic: '图片描述 - 老年人的孤独',
    difficulty: 3,
    content: JSON.stringify({
      title: '图片描述 - 老年人的孤独',
      instruction: 'Describe this picture and talk about the problem it shows.',
      preparationTips: [
        '描述画面（老人孤独的场景）',
        '指出现象（老龄化、独居老人）',
        '分析问题（原因：子女忙、缺乏陪伴）',
        '提出建议（如何解决）'
      ],
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: 'Good morning. I want to talk about this picture.\\n\\nIn this picture, I can see an old man sitting alone on a bench in the park. He looks very lonely. Around him, there are many children playing and young people walking. They all look very busy.\\n\\nI think this picture shows a big problem in our society. Many old people live alone. Their children are busy with work and have no time to visit them. The old people feel lonely and sad.\\n\\nI think we should care more about elderly people. Families should visit their parents more often. The government should build more community centers for old people. Young people can also volunteer to help them.\\n\\nThank you.',
        wordCount: 99
      },
      level4: {
        content: 'Good morning, everyone. The image before us poignantly captures a prevalent social phenomenon - an elderly gentleman seated in solitude on a park bench, conspicuously detached from the bustling activity surrounding him.\\n\\nThis scene serves as a microcosm of the escalating challenge of social isolation among senior citizens. As our society grapples with an aging demographic and the dissolution of traditional multi-generational households, an increasing number of elderly individuals find themselves living alone. Their adult children, ensnared by demanding work schedules and nuclear family obligations, often lack the temporal resources to provide regular companionship.\\n\\nThe ramifications extend beyond mere loneliness; social isolation has been demonstrably linked to deteriorating mental and physical health outcomes among the elderly population.\\n\\nTo ameliorate this situation, a multi-faceted response is required. At the familial level, we must prioritize regular communication and visitation. Community organizations should expand outreach programs and establish senior centers that foster social engagement. Furthermore, the implementation of intergenerational initiatives could bridge the gap between age cohorts, enriching both parties.\\n\\nThank you for listening.',
        wordCount: 149
      },
      level5: {
        content: 'Good morning, everyone. The tableau presented in this photograph constitutes a profoundly moving indictment of contemporary societal failures - an octogenarian figure sits in poignant isolation upon a park bench, his posture and demeanor eloquently articulating a profound sense of disconnection from the vibrant milieu that surrounds him.\\n\\nThis vignette encapsulates the burgeoning crisis of geriatric alienation that has reached epidemic proportions across developed societies. The confluence of demographic aging, the fragmentation of extended family structures, and the centrifugal pressures of modern professional life have conspired to consign unprecedented numbers of elderly individuals to lives of solitude. Their progeny, ensnared by the exigencies of career advancement and the demands of their own nuclear families, frequently find themselves unable to discharge their filial obligations with the frequency and intensity that earlier generations would have considered de rigueur.\\n\\nThe sequelae of this isolation extend far beyond transient melancholy; empirical research has established robust correlations between social disconnectedness and accelerated cognitive decline, compromised immunological function, and elevated mortality risk among the elderly.\\n\\nAddressing this malaise necessitates systemic interventions. Policymakers must prioritize the expansion of community-based eldercare infrastructure and incentivize intergenerational cohabitation through fiscal mechanisms. Civil society organizations should mobilize volunteer networks to provide companionship and practical assistance. Ultimately, however, the restoration of genuine intergenerational solidarity requires a cultural recalibration, reinstating respect for elder wisdom and the obligations of kinship at the heart of our collective value system.\\n\\nThank you for your attention.',
        wordCount: 206
      }
    }),
    explanation: '图片描述需要：1）详细描述图片的视觉内容 2）指出图片反映的社会问题 3）深入分析问题的成因 4）提出可行的解决方案',
    source: 'dse-practice',
    isApproved: true,
  },
  // Question 5: Personal Choice - Favorite Subject
  {
    id: generateId(),
    type: 'speaking',
    subType: 'personal_choice',
    part: 'part_a',
    topic: '个人选择 - 最喜欢的学科',
    difficulty: 3,
    content: JSON.stringify({
      title: '个人选择 - 最喜欢的学科',
      instruction: 'What is your favorite subject? Why do you like it?',
      preparationTips: [
        '选择学科（如英语、历史、生物等）',
        '说明原因（3点：有趣、有用、老师好等）',
        '举例说明（具体经历）',
        '未来计划（如何继续学习）'
      ],
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: 'Good morning. My favorite subject is English.\\n\\nI like English for three reasons. First, it is very interesting. I enjoy reading English stories and watching English movies. Second, English is very useful. It is an international language. If I learn English well, I can communicate with people from other countries. Third, my English teacher is very nice. She makes the lessons fun.\\n\\nLast month, I joined an English speech contest. I was very nervous but I tried my best. I won the second prize. This made me more confident.\\n\\nIn the future, I want to study English harder. I hope I can travel abroad and use English to talk with foreigners.\\n\\nThank you.',
        wordCount: 107
      },
      level4: {
        content: 'Good morning, everyone. Among all the subjects I study, English undoubtedly holds the distinction of being my favorite, a preference rooted in multiple compelling factors.\\n\\nPrimarily, the study of English captivates me because it serves as a gateway to diverse cultures and perspectives. Through English literature and media, I gain access to a wealth of knowledge and entertainment that transcends geographical boundaries. Moreover, proficiency in English constitutes an invaluable asset in our increasingly globalized world, enhancing both educational and career prospects.\\n\\nMy enthusiasm is further fueled by my exceptional teacher, whose innovative pedagogical methods transform mundane grammar lessons into engaging intellectual adventures. Her encouragement has emboldened me to participate in extracurricular activities such as debate competitions and drama productions.\\n\\nA particularly memorable experience was my participation in last year\'s regional English speech contest, where I secured second place. This achievement not only validated my efforts but also dramatically boosted my self-confidence.\\n\\nMoving forward, I am committed to achieving mastery of this language, with aspirations of studying abroad and pursuing an international career.\\n\\nThank you for listening.',
        wordCount: 173
      },
      level5: {
        content: 'Good morning, everyone. If compelled to identify a single academic discipline that resonates most profoundly with my intellectual temperament and aspirational trajectory, I would unequivocally designate English language studies.\\n\\nMy affinity for this subject is multifaceted and deeply rooted. Primarily, English functions as an unparalleled conduit for cross-cultural pollination, granting me access to the literary canon, philosophical treatises, and cinematic productions of diverse civilizations. This exposure has fundamentally reshaped my worldview, fostering cosmopolitan sensibilities and intercultural competence. Furthermore, in an era characterized by unprecedented globalization, advanced proficiency in English has transmuted from a supplementary skill to an essential prerequisite for participation in the global knowledge economy.\\n\\nMy passion is additionally nourished by my remarkable instructor, whose erudition and pedagogical artistry transmute even the most abstruse grammatical concepts into captivating intellectual odysseys. Her mentorship has emboldened me to venture beyond curricular confines, participating in debate tournaments and theatrical productions that have honed my communicative competencies.\\n\\nA watershed moment in my linguistic journey was my triumph in last year\'s regional oratory competition, where I distinguished myself among contestants from thirty schools. This validation of my dedication has only intensified my determination to pursue native-like mastery.\\n\\nThank you for your attention.',
        wordCount: 204
      }
    }),
    explanation: '个人选择需要：1）明确表达自己的偏好 2）提供充分的支持理由（多个角度）3）使用具体例子说明观点 4）展现对该主题的深度理解',
    source: 'dse-practice',
    isApproved: true,
  }];

async function main() {
  console.log('Starting speaking questions import...');
  console.log(`Total questions to import: ${speakingQuestions.length}`);

  let imported = 0;
  let skipped = 0;

  for (const question of speakingQuestions) {
    try {
      const existing = await prisma.question.findFirst({
        where: { 
          type: 'speaking',
          topic: question.topic 
        }
      });

      if (existing) {
        skipped++;
        console.log(`Skipped: ${question.topic} (already exists)`);
        continue;
      }

      await prisma.question.create({
        data: {
          id: question.id,
          type: question.type,
          subType: question.subType,
          part: question.part,
          topic: question.topic,
          difficulty: question.difficulty,
          content: question.content,
          answer: question.answer,
          explanation: question.explanation,
          source: question.source,
          isApproved: question.isApproved,
        }
      });
      imported++;
      console.log(`Imported: ${question.topic}`);
    } catch (error) {
      console.error(`Error importing question "${question.topic}":`, error);
    }
  }

  console.log(`\\nImport complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);

  const count = await prisma.question.count({
    where: { type: 'speaking' }
  });
  console.log(`Total speaking questions in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
