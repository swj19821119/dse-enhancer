import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateId() {
  return crypto.randomUUID();
}

const writingQuestions = [
  {
    id: generateId(),
    type: 'writing',
    subType: 'letter_complaint',
    part: 'part_a',
    topic: '书信类（正式投诉信）',
    difficulty: 3,
    content: JSON.stringify({
      title: '书信类（正式投诉信）',
      instruction: '你住在香港某公寓，最近楼上邻居经常深夜发出噪音，影响你休息。请给物业管理处写一封信投诉，要求他们采取行动。（约200字）',
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: `Dear Sir/Madam,

I am writing to complain about the noise from my upstairs neighbor. I live in Room 1203 of Block A.

Every night, my neighbor makes loud noises after 11pm. They play music and move furniture. I cannot sleep well because of this. It affects my study and daily life.

I have talked to them two times, but nothing changed. Could you please help me solve this problem? I hope you can warn them or find other solutions.

Thank you for your attention.

Yours faithfully,
John Chan
Room 1203, Block A`,
        wordCount: 98,
        highlights: ['完成了投诉信的基本结构', '说明了问题（噪音）和影响（无法睡眠）', '语言简单直接', '词汇较基础', '句式简单，多为短句']
      },
      level4: {
        content: `Dear Sir or Madam,

I am writing to bring to your attention a serious noise problem caused by my upstairs neighbor. I am a resident of Room 1203 in Block A.

For the past two weeks, my neighbor has been making excessive noise late at night, typically after 11 pm. The noise includes loud music, moving furniture, and heavy footsteps. As a result, I have been suffering from sleep deprivation, which has negatively affected my academic performance and daily routine.

Despite my attempts to communicate with them on two separate occasions, the situation has not improved. I would appreciate it if you could intervene by issuing a warning or mediating between us.

I look forward to your prompt response.

Yours sincerely,
John Chan
Resident, Room 1203, Block A`,
        wordCount: 128,
        highlights: ['结构完整，语气正式得体', '具体描述了噪音类型', '说明了具体影响', '尝试了沟通但未解决', '词汇较丰富', '句式有一定变化']
      },
      level5: {
        content: `Dear Sir or Madam,

I am writing to express my profound dissatisfaction with the persistent noise disturbance emanating from the resident of Room 1303, directly above my apartment. As an occupant of Room 1203 in Block A, I have been subjected to intolerable levels of noise on a nightly basis.

The disturbance typically commences after 11 pm and persists well into the early hours, encompassing blaring music, incessant furniture rearrangement, and thunderous footsteps. Consequently, I have been grappling with chronic sleep deprivation, which has severely compromised my concentration levels and overall well-being. This issue warrants immediate attention, as it constitutes a blatant violation of the building's noise regulations.

Notwithstanding my diplomatic attempts to resolve this matter amicably through two face-to-face conversations, the resident has demonstrated a flagrant disregard for my concerns. I would be grateful if you could expedite an investigation and implement appropriate disciplinary measures to rectify this untenable situation.

I anticipate your swift intervention in this matter.

Yours faithfully,
John Chan
Resident, Room 1203, Block A`,
        wordCount: 198,
        highlights: ['语言高度正式，语气强烈但不失礼貌', '词汇非常丰富且精准', '句式复杂多样', '逻辑严密', '使用了高级连接词']
      }
    }),
    explanation: '投诉信需要注意：开头表明身份和目的，中间详细描述问题及影响，结尾提出具体要求并表示感谢。',
    source: 'dse-practice',
    isApproved: true,
  },
  {
    id: generateId(),
    type: 'writing',
    subType: 'speech',
    part: 'part_a',
    topic: '演讲辞（校园活动）',
    difficulty: 3,
    content: JSON.stringify({
      title: '演讲辞（校园活动）',
      instruction: '你是学生会主席，请为下周的英语周活动写一篇演讲辞，鼓励同学们积极参与。（约250字）',
      wordLimit: 250,
    }),
    answer: JSON.stringify({
      level3: {
        content: `Good morning, everyone!

I am Peter, the chairman of the Student Union. I want to tell you about English Week next week.

English Week will start on Monday. We have many fun activities. There are English movies, singing contests, and drama shows. You can also join the spelling competition.

I hope all of you can join. It is a good chance to practice English. Don't be shy. Just try your best. You can learn and have fun at the same time.

Please come and support English Week. Thank you!`,
        wordCount: 85,
        highlights: ['完成了演讲的基本结构', '说明了活动内容', '语言简单直接', '词汇较基础', '句式简单']
      },
      level4: {
        content: `Good morning, teachers and fellow students!

As the chairman of the Student Union, I am delighted to announce that our annual English Week will take place from next Monday to Friday. This year's theme is "English in Our Daily Lives."

We have prepared an array of exciting activities for everyone. You can enjoy English movie screenings on Monday, participate in the singing competition on Wednesday, and watch impressive drama performances on Friday. For those who love challenges, don't miss the spelling bee contest on Thursday.

I strongly encourage all of you to take part in these activities. It is an excellent opportunity to improve your English skills in a relaxed and enjoyable environment. Remember, practice makes perfect. Don't be afraid to make mistakes – just speak up and have fun!

Let's make this English Week a memorable one. See you there!`,
        wordCount: 142,
        highlights: ['结构完整，语气热情', '具体描述了活动安排', '说明了参与好处', '词汇较丰富', '句式有一定变化']
      },
      level5: {
        content: `Good morning, distinguished teachers and dear fellow students!

It is my great privilege, as the Chairman of the Student Union, to officially announce the commencement of our much-anticipated English Week, which will run from next Monday through Friday. Under the theme "English in Our Daily Lives," this annual event promises to be an enriching and exhilarating experience for all.

Our dedicated team has meticulously curated a diverse repertoire of activities designed to cater to varied interests. Cinephiles can immerse themselves in critically acclaimed English films on Monday. Aspiring vocalists are invited to showcase their talents in our singing competition on Wednesday. Thespians will undoubtedly be captivated by the spectacular drama performances scheduled for Friday. Additionally, wordsmiths can test their prowess in the intellectually stimulating spelling bee on Thursday.

I implore each and every one of you to seize this golden opportunity to hone your linguistic capabilities in an immersive, supportive milieu. Bear in mind that linguistic proficiency is cultivated through persistent practice and unwavering confidence. Embrace every chance to communicate, and do not let the fear of error impede your progress.

Let us collectively endeavor to render this English Week an unforgettable celebration of language and culture. Your enthusiastic participation is what makes this event truly special.

Thank you, and see you next week!`,
        wordCount: 214,
        highlights: ['语言高度正式但热情', '词汇非常丰富', '句式复杂多样', '逻辑严密', '使用了高级连接词', '情感表达充分']
      }
    }),
    explanation: '演讲辞需要注意：开头问候观众，中间详细介绍活动内容，结尾号召参与并表示感谢。',
    source: 'dse-practice',
    isApproved: true,
  },
  {
    id: generateId(),
    type: 'writing',
    subType: 'report',
    part: 'part_a',
    topic: '报告（活动总结）',
    difficulty: 3,
    content: JSON.stringify({
      title: '报告（活动总结）',
      instruction: '你是班长，上周班级组织了一次敬老院探访活动。请写一份报告给班主任，汇报活动情况和同学们的反馈。（约200字）',
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: `To: Miss Wong, Class Teacher
From: Mary Chan, Class Monitor
Date: 25 March 2026
Subject: Visit to Elderly Centre

Introduction
Last Saturday, our class visited Happy Elderly Centre.

Activities
We arrived at 9 am. We sang songs and played games with the elderly. Some classmates helped clean the rooms. We also gave them fruits and snacks.

Feedback
The elderly were very happy. Our classmates felt meaningful. They want to visit again.

Conclusion
The visit was successful. We learned to care for old people.`,
        wordCount: 69,
        highlights: ['完成了报告的基本结构', '说明了活动内容', '语言简单直接', '结构清晰']
      },
      level4: {
        content: `To: Miss Wong, Class Teacher
From: Mary Chan, Class Monitor
Date: 25 March 2026
Subject: Report on Elderly Centre Visit

Introduction
This report summarizes our class visit to Happy Elderly Centre last Saturday, 22 March 2026.

Details of Activities
Twenty students participated in this meaningful activity. Upon arrival at 9 am, we were warmly welcomed by the staff. We prepared a mini-concert for the elderly, performing three classic songs. Afterwards, we engaged them in interactive games such as chess and puzzle-solving. Additionally, we assisted in cleaning their rooms and distributed fruits and handmade cards.

Participants' Feedback
The elderly expressed great appreciation for our visit, with many saying it brightened their day. Our classmates found the experience rewarding and eye-opening. Several students mentioned that they developed better communication skills and empathy through this activity.

Recommendations
It is suggested that we organize similar visits quarterly to establish long-term relationships with the elderly.

Conclusion
The visit was successful in promoting care for the elderly among students.

Mary Chan
Class Monitor`,
        wordCount: 158,
        highlights: ['结构完整，格式规范', '详细描述了活动内容', '包含了参与者反馈', '提出了建议', '词汇较丰富']
      },
      level5: {
        content: `To: Miss Wong, Class Teacher
From: Mary Chan, Class Monitor (6A)
Date: 25 March 2026
Subject: Comprehensive Report on Elderly Centre Visit

1. Introduction
This report aims to document the class visit to Happy Elderly Centre conducted on 22 March 2026, encompassing activity details, participant feedback, and recommendations for future initiatives.

2. Activity Overview
A contingent of twenty students assembled at the school entrance at 8:30 am and arrived punctually at the centre by 9:00 am. The meticulously planned itinerary comprised:

- A musical performance featuring three nostalgic Cantonese classics, which resonated profoundly with the elderly residents
- Interactive cognitive games including Chinese chess and jigsaw puzzles, designed to stimulate mental acuity
- Environmental enhancement through room cleaning and decoration
- Distribution of nutritious hampers and personalized handmade cards conveying heartfelt messages

3. Feedback Analysis
Quantitative and qualitative feedback was collected through post-visit reflection sessions:

Beneficiaries' Perspective: The elderly unanimously expressed profound gratitude, with several residents moved to tears. They particularly valued the intergenerational interaction and companionship.

Students' Perspective: Participants described the experience as transformative and humbling. Many reported enhanced interpersonal skills and a heightened awareness of geriatric issues. Several students have expressed keen interest in volunteering regularly.

4. Recommendations
- Institutionalize quarterly visits to foster sustained engagement
- Establish a pen-pal programme between students and residents
- Organize skill-sharing workshops where students teach technology usage

5. Conclusion
The visit achieved its pedagogical objectives of cultivating empathy and social responsibility. The overwhelmingly positive response from both parties underscores the value of such experiential learning opportunities.

Mary Chan
Class Monitor, 6A`,
        wordCount: 278,
        highlights: ['语言高度正式，格式专业', '结构清晰有层次', '详细描述活动内容', '包含多角度反馈', '提出具体建议', '词汇丰富高级']
      }
    }),
    explanation: '报告需要注意：使用正式格式（To/From/Date/Subject），分点说明活动内容，包含参与者反馈，提出改进建议。',
    source: 'dse-practice',
    isApproved: true,
  },
  {
    id: generateId(),
    type: 'writing',
    subType: 'article',
    part: 'part_a',
    topic: '文章投稿（社会议题）',
    difficulty: 3,
    content: JSON.stringify({
      title: '文章投稿（社会议题）',
      instruction: '你校英文报正在征稿，主题是"青少年沉迷手机"。请投稿一篇短文，分析原因并提出建议。（约250字）',
      wordLimit: 250,
    }),
    answer: JSON.stringify({
      level3: {
        content: `Title: Stop Phone Addiction

Nowadays, many teenagers use mobile phones too much. This is a serious problem.

There are some reasons. First, phones have many interesting games and videos. Second, teenagers want to chat with friends online. Third, some parents are too busy and don't spend time with their children.

Phone addiction is bad for teenagers. It affects their study and eyesight. They also have less time to exercise and talk with family.

I have some suggestions. Schools should limit phone use during class. Parents should set rules at home. Teenagers should find other hobbies like reading or sports.

I hope teenagers can use phones wisely and have a healthy life.`,
        wordCount: 108,
        highlights: ['完成了文章的基本结构', '分析了原因和影响', '提出了建议', '语言简单直接', '结构清晰']
      },
      level4: {
        content: `Title: Addressing the Pervasive Issue of Teenage Mobile Phone Addiction

In contemporary society, the excessive use of mobile phones among adolescents has become an increasingly prevalent concern that warrants immediate attention.

Several contributing factors can be identified. Primarily, smartphones offer an endless array of entertainment options, from immersive games to captivating social media platforms, making them highly addictive. Additionally, peer pressure plays a significant role, as teenagers fear being ostracized if they are not constantly connected online. Furthermore, the lack of parental supervision in many households exacerbates this issue.

The ramifications of phone addiction are multifaceted. Academically, students' concentration and performance deteriorate. Physically, prolonged screen time leads to vision problems and sedentary lifestyles. Socially, face-to-face communication skills diminish.

To combat this, a collaborative approach is necessary. Schools should implement stricter regulations on phone usage during school hours. Parents must lead by example and establish screen-time limits. Most importantly, teenagers themselves should cultivate alternative interests and practice digital detox regularly.

Only through concerted efforts can we help teenagers develop a healthy relationship with technology.`,
        wordCount: 176,
        highlights: ['结构完整，论证清晰', '多角度分析原因', '详细说明影响', '提出具体建议', '词汇较丰富', '句式有变化']
      },
      level5: {
        content: `Title: The Digital Epidemic: Confronting Adolescent Mobile Phone Addiction in the Modern Era

The ubiquitous presence of mobile devices has precipitated a burgeoning crisis of digital dependency among today's youth, an issue that demands urgent scrutiny and decisive intervention from all stakeholders in society.

The etiology of this phenomenon is complex and multifaceted. At its core, smartphones are meticulously engineered to exploit psychological vulnerabilities through variable reward mechanisms and infinite scroll features. Social media platforms, in particular, capitalize on adolescents' innate desire for social validation and fear of missing out (FOMO), creating a perpetual cycle of compulsive checking. Compounding this, the decline in supervised outdoor activities and the proliferation of helicopter parenting have left many teenagers ill-equipped to seek fulfillment beyond the digital realm.

The deleterious consequences permeate every facet of adolescent development. Cognitively, the constant distraction fragments attention spans and impairs deep thinking. Emotionally, excessive social media consumption correlates strongly with anxiety, depression, and diminished self-esteem stemming from unrealistic comparisons. Physically, sleep deprivation caused by late-night usage and the prevalence of repetitive strain injuries present alarming public health concerns.

Addressing this crisis necessitates a multi-pronged strategy. Educational institutions must incorporate digital literacy and mindfulness training into the curriculum, empowering students to recognize and resist manipulative design tactics. Parents should establish device-free zones and model healthy digital habits themselves. Policymakers ought to consider regulations limiting addictive features in apps targeting minors.

Ultimately, cultivating a balanced relationship with technology requires shifting societal values from passive consumption to active creation, encouraging teenagers to harness digital tools productively rather than being enslaved by them.`,
        wordCount: 267,
        highlights: ['语言高度正式，学术性强', '深入分析原因', '全面说明影响', '提出多层次解决方案', '词汇非常丰富', '句式复杂多样', '逻辑严密']
      }
    }),
    explanation: '议论文需要注意：开头提出问题和观点，中间分析原因和影响，结尾提出建议并总结。',
    source: 'dse-practice',
    isApproved: true,
  },
  {
    id: generateId(),
    type: 'writing',
    subType: 'letter_suggestion',
    part: 'part_a',
    topic: '建议信（给校长）',
    difficulty: 3,
    content: JSON.stringify({
      title: '建议信（给校长）',
      instruction: '你认为学校应该增加学生的体育锻炼时间。请给校长写一封信，说明理由并提出具体建议。（约200字）',
      wordLimit: 200,
    }),
    answer: JSON.stringify({
      level3: {
        content: `Dear Principal,

I am Mary from Form 4A. I want to suggest having more PE lessons.

Many students in our school don't exercise enough. They sit in class all day. This is not good for health. Some students are getting fat and feel tired easily.

I have two suggestions. First, we can have PE lessons three times a week instead of two. Second, we can have sports clubs after school.

Exercise can make us healthy and happy. I hope you can consider my suggestion.

Yours sincerely,
Mary Chan
Form 4A`,
        wordCount: 89,
        highlights: ['完成了建议信的基本结构', '说明了问题', '提出了具体建议', '语言简单直接', '结构清晰']
      },
      level4: {
        content: `Dear Principal,

I am writing to propose that our school increase the amount of physical exercise for students. As a Form 4 student, I have observed that many of my classmates lead increasingly sedentary lifestyles.

The current situation is concerning. Most students spend seven hours sitting in classrooms, followed by hours of homework at home. This lack of physical activity has led to declining fitness levels, rising obesity rates, and increased reports of stress and anxiety among students.

To address this, I would like to put forward two concrete suggestions. Firstly, the number of PE lessons should be increased from two to three per week, with a focus on enjoyable activities rather than competitive sports. Secondly, the school should establish a wider variety of extracurricular sports clubs, such as yoga, hiking, or dance, to cater to diverse interests.

Regular exercise not only improves physical health but also enhances mental well-being and academic concentration. I sincerely hope you will consider implementing these changes for the benefit of all students.

Yours faithfully,
Mary Chan
Form 4A`,
        wordCount: 172,
        highlights: ['结构完整，语气得体', '详细说明了问题', '提出了具体可行的建议', '说明了锻炼的好处', '词汇较丰富', '句式有变化']
      },
      level5: {
        content: `Dear Principal,

I am writing to respectfully advocate for a comprehensive enhancement of physical education provisions within our school, a matter I believe is imperative for the holistic development of students.

The prevailing sedentary culture among our student body is, quite frankly, alarming. The confluence of prolonged classroom instruction, extensive homework demands, and recreational screen time has precipitated a generation of physically inactive adolescents. The ramifications are manifold: deteriorating cardiovascular health, escalating obesity prevalence, compromised postural alignment, and notably, heightened susceptibility to mental health disorders such as anxiety and depression.

In light of these concerns, I wish to propose two pragmatic initiatives. Primarily, I urge the administration to augment the PE curriculum from two to three weekly sessions, with an emphasis on cultivating lifelong fitness habits rather than solely fostering athletic excellence. Complementarily, the establishment of diverse recreational sports clubs—encompassing activities such as yoga, orienteering, and ballroom dancing—would accommodate students with varying aptitudes and interests, thereby maximizing participation.

Mounting empirical evidence substantiates the synergistic relationship between physical activity and cognitive function. Regular exercise enhances neuroplasticity, mitigates stress hormones, and improves sleep quality—all of which conduce to superior academic performance.

I would welcome the opportunity to discuss these proposals further and am confident that their implementation would yield substantial dividends for our school community.

Yours sincerely,
Mary Chan
Form 4A`,
        wordCount: 236,
        highlights: ['语言高度正式，有说服力', '深入分析了问题', '提出了具体可行的建议', '引用了科学依据', '词汇非常丰富', '句式复杂多样', '逻辑严密']
      }
    }),
    explanation: '建议信需要注意：开头表明身份和目的，中间说明问题和理由，结尾提出具体建议并表示期待回复。',
    source: 'dse-practice',
    isApproved: true,
  }
];

async function main() {
  console.log('Starting writing questions import...');
  console.log(`Total questions to import: ${writingQuestions.length}`);

  let imported = 0;
  let skipped = 0;

  for (const question of writingQuestions) {
    try {
      const existing = await prisma.question.findFirst({
        where: { 
          type: 'writing',
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

  console.log(`\nImport complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);

  const count = await prisma.question.count({
    where: { type: 'writing' }
  });
  console.log(`Total writing questions in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });