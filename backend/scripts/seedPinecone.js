// ─────────────────────────────────────────────
// backend/scripts/seedPinecone.js
//
// Run this ONCE to load ministry knowledge into
// your Pinecone index. Add more documents as
// your knowledge base grows.
//
// Usage:
//   cd backend
//   node scripts/seedPinecone.js
//
// Prerequisites:
//   1. PINECONE_API_KEY set in backend/.env
//   2. Replace generateEmbedding() in services/pinecone.js
//      with a real embedding model (see notes there)
// ─────────────────────────────────────────────

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initPinecone, upsertMinistryDocuments } = require('../services/pinecone');

// ─────────────────────────────────────────────
// SEED DATA
// Add your own entries below. Each document:
//   id     — unique string, no spaces
//   text   — the content to embed and retrieve
//   source — human-readable citation
//   type   — 'scripture' | 'theology' | 'commentary' | 'sermon' | 'general'
// ─────────────────────────────────────────────

const SEED_DOCUMENTS = [

  // ── CORE THEOLOGY ──────────────────────────
  {
    id: 'theology-grace-001',
    text: 'Grace is the unmerited favour of God towards humanity. It is not earned, deserved, or achieved through human effort. Grace is the foundation of salvation (Ephesians 2:8-9) and the basis of every blessing God bestows on his people.',
    source: 'Theology: Grace',
    type: 'theology',
  },
  {
    id: 'theology-faith-001',
    text: 'Faith is the substance of things hoped for, the evidence of things not seen (Hebrews 11:1). Biblical faith is not mere intellectual assent but active trust and reliance on God and His Word. Faith without works is dead (James 2:26).',
    source: 'Theology: Faith',
    type: 'theology',
  },
  {
    id: 'theology-salvation-001',
    text: 'Salvation is the deliverance of humanity from sin and its consequences through the atoning work of Jesus Christ. It encompasses justification (being declared righteous), sanctification (being made holy), and glorification (being fully conformed to Christ). Salvation is by grace alone, through faith alone, in Christ alone.',
    source: 'Theology: Salvation',
    type: 'theology',
  },
  {
    id: 'theology-holyspirit-001',
    text: 'The Holy Spirit is the third person of the Trinity. He convicts the world of sin, righteousness and judgement (John 16:8), indwells believers at salvation (Romans 8:9), empowers them for service (Acts 1:8), produces spiritual fruit (Galatians 5:22-23), and distributes gifts for the building up of the church (1 Corinthians 12).',
    source: 'Theology: The Holy Spirit',
    type: 'theology',
  },
  {
    id: 'theology-prayer-001',
    text: 'Prayer is direct communication with God. It includes adoration, confession, thanksgiving, and supplication (ACTS model). Jesus modelled prayer in Matthew 6:9-13 (the Lord\'s Prayer). Effective prayer is persistent (Luke 18:1), faith-filled (James 1:6), and aligned with God\'s will (1 John 5:14-15).',
    source: 'Theology: Prayer',
    type: 'theology',
  },
  {
    id: 'theology-church-001',
    text: 'The Church is the body of Christ — all those who have been redeemed by his blood across all generations and cultures. The local church is the primary expression of this community: a gathered people who worship together, teach the Word, celebrate the sacraments, exercise discipline, and are sent on mission.',
    source: 'Theology: The Church',
    type: 'theology',
  },

  // ── KEY SCRIPTURES ─────────────────────────
  {
    id: 'scripture-john316',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. (John 3:16) — The most concise summary of the Gospel. God\'s motivation is love. His method is the gift of His Son. The condition is belief. The result is eternal life.',
    source: 'John 3:16',
    type: 'scripture',
  },
  {
    id: 'scripture-romans828',
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose. (Romans 8:28) — A promise of divine sovereignty. "All things" is comprehensive. "Works together" (synergei) implies intentional cooperation. The beneficiaries are those who love God and are called according to His purpose.',
    source: 'Romans 8:28',
    type: 'scripture',
  },
  {
    id: 'scripture-jeremiah2911',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future. (Jeremiah 29:11) — Written to exiles in Babylon, this promise speaks of God\'s intentional goodness even in difficult seasons. The plans are God\'s, the future is secured, hope is guaranteed.',
    source: 'Jeremiah 29:11',
    type: 'scripture',
  },
  {
    id: 'scripture-philippians413',
    text: 'I can do all this through him who gives me strength. (Philippians 4:13) — Paul writes from prison. The "all things" refers to contentment in any circumstance, not unlimited human achievement. The source of strength is Christ alone, not human willpower.',
    source: 'Philippians 4:13',
    type: 'scripture',
  },
  {
    id: 'scripture-proverbs35-6',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. (Proverbs 3:5-6) — Total trust contrasted with self-reliance. Submission in "all your ways" is comprehensive. The promise is divine direction of the path, not elimination of difficulty.',
    source: 'Proverbs 3:5-6',
    type: 'scripture',
  },
  {
    id: 'scripture-isaiah4031',
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint. (Isaiah 40:31) — Waiting on God (qavah — to bind together, to expect) produces supernatural renewal. The progression from soaring to running to walking suggests sustained endurance more than moments of ecstasy.',
    source: 'Isaiah 40:31',
    type: 'scripture',
  },
  {
    id: 'scripture-psalm2314',
    text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me. (Psalm 23:4) — The valley is a transition, not a destination. The shepherd\'s presence is the antidote to fear. The rod (for protection) and staff (for guidance) represent complete pastoral care.',
    source: 'Psalm 23:4',
    type: 'scripture',
  },
  {
    id: 'scripture-hebrews111',
    text: 'Now faith is confidence in what we hope for and assurance about what we do not see. (Hebrews 11:1) — Faith is not wishful thinking. It is substantive confidence (hypostasis — a foundation, a title deed) in unseen realities. The chapter demonstrates faith through historical witnesses.',
    source: 'Hebrews 11:1',
    type: 'scripture',
  },
  {
    id: 'scripture-matthew1128-30',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls. (Matthew 11:28-30) — A direct invitation from Jesus. Rest is given (initial) and found (experiential). The yoke implies partnership and ongoing relationship, not just a one-time relief.',
    source: 'Matthew 11:28-30',
    type: 'scripture',
  },
  {
    id: 'scripture-romans101314',
    text: 'Everyone who calls on the name of the Lord will be saved. How, then, can they call on the one they have not believed in? And how can they believe in the one of whom they have not heard? And how can they hear without someone preaching to them? (Romans 10:13-14) — The logic of evangelism. Salvation requires calling. Calling requires belief. Belief requires hearing. Hearing requires preaching. The evangelist is essential in the chain.',
    source: 'Romans 10:13-14',
    type: 'scripture',
  },

  // ── SERMON STRUCTURES ──────────────────────
  {
    id: 'sermon-structure-expository',
    text: 'Expository preaching works through a passage of Scripture sequentially, explaining its meaning and applying it to contemporary life. Structure: (1) Read and introduce the text. (2) Explain the historical and grammatical context. (3) Identify the main proposition of the text. (4) Develop the points the text makes. (5) Apply each point practically. (6) Call for response.',
    source: 'Preaching: Expository Structure',
    type: 'sermon',
  },
  {
    id: 'sermon-structure-topical',
    text: 'Topical preaching selects a theme or topic and builds the message around it using multiple scriptures. Structure: (1) Introduce the topic with a real-life hook. (2) Establish the biblical foundation — what does God say about this? (3) Develop 2-3 main truths from Scripture. (4) Address common objections or misunderstandings. (5) Apply each truth to daily life. (6) Close with a compelling call to action.',
    source: 'Preaching: Topical Structure',
    type: 'sermon',
  },
  {
    id: 'sermon-illustration-prodigal',
    text: 'The Parable of the Prodigal Son (Luke 15:11-32) illustrates: (1) The grace of God — the father runs to meet the returning son. (2) The nature of repentance — the son came to his senses and returned. (3) The danger of self-righteousness — the elder brother\'s resentment reveals a works-based heart. Use this to illustrate salvation, restoration after failure, or the heart of the Father.',
    source: 'Sermon Illustration: The Prodigal Son',
    type: 'sermon',
  },
  {
    id: 'sermon-illustration-walking-on-water',
    text: 'Peter walking on water (Matthew 14:22-33) illustrates: (1) Faith requires stepping out. (2) Focus determines experience — Peter sank when he shifted focus to the storm. (3) Jesus is present in the storm and reaches out even when we sink. Use for messages on faith, fear, stepping into calling, or keeping our eyes on Christ.',
    source: 'Sermon Illustration: Faith Peter Walking on Water',
    type: 'sermon',
  },
  {
    id: 'THE IMMUTABILITY OF GOD-001',
    text: `I am the LORD, I change not; therefore ye sons of Jacob are not consumed. Malachi 3:6. illustrates: (1) Signifiacne of Christ Immunity to children of God . (2) What Immuninity in can make us see our christian life differently  (3) Moral Lessons to sermon.
            There are three things this morning. First of all, an unchanging God, secondly, the persons who
             derive benefit from this glorious attribute, “the sons of Jacob,” and thirdly, the benefit they so derive,
            they “are not consumed.” We address ourselves to these points.
            I. First of all, we have set before us the doctrine of THE IMMUTABILITY OF GOD. “I am God, I change not.” Here I shall attempt to expound, or rather to enlarge the thought, and then afterwards to bring a few arguments to prove its truth.
            1. I shall offer some exposition of my text by first saying, that God is JEHOVAH, and He changes not in His essence. We cannot tell you what Godhead is. We do not know what substance that is which we call God. It is an existence, it is a being, but what that is, we know not. However, whatever it is, we call it His essence and that essence never changes.The substance of mortal things is ever changing. The mountains with their snow-white crowns, doff their old diadems in summer, in rivers trickling down their sides, while the storm cloud gives them another coronation. The ocean, with its mighty floods, loses its water when the sunbeams kiss the waves
            and snatch them in mists to heaven. Even the sun himself requires fresh fuel from the hand of the Infinite Almighty, to replenish his ever-burning furnace.
            All creatures change. Man, especially as to his body, is always undergoing revolution. Very probably there is not a single particle in my body which was in it a few years ago. This frame has been worn away by activity, its atoms have been removed by friction, fresh particles of matter have in the meantime constantly accrued to my body, and so it has been replenished, but its substance is altered. The fabric of which this world is made is ever passing away. Like a stream of water, drops are running away and others are following after, keeping the river still full, but always changing in its elements. But God is perpetually the same. He is not composed of any substance or material, but is
            Spirit—pure, essential, and ethereal spirit—and therefore He is immutable.
            He remains everlastingly the same. There are no furrows on His eternal brow. No age has palsied Him, no years have marked Him with the mementoes of their flight. He sees ages pass, but with Him it
            is ever now. He is the great I AM—the Great Unchangeable. Mark you, His essence did not undergo a change when it became united with the manhood. When
            Christ in past years did gird Himself with mortal clay, the essence of His divinity was not changed, flesh did not become God, nor did God become flesh by a real actual change of nature. The two were united in hypostatical union, but the Godhead was still the same.`,
    source: 'DELIVERED ON SABBATH MORNING',
    type: 'sermon',
  },
  
   {
    id: 'THE IMMUTABILITY OF GOD-002',
    text: `It was the same when He was a babe in the manger, as it was when He stretched the curtains of heaven. It was the same God that hung upon the cross, and whose blood flowed down in a purple river, the self-same God that holds the world upon His everlasting shoulders, and bears in His hands the keys
          of death and hell. He never has been changed in His essence, not even by His incarnation. He remains everlastingly, eternally, the one unchanging God, the Father of lights, with whom there is no variableness, neither the shadow of a change.
          2. He changes not in His attributes. Whatever the attributes of God were of old, that they are now. And of each of them we may sing, “As it was in the beginning, is now, and ever shall be, world without end, Amen.”
          Was He powerful? Was He the mighty God when He spake the world out of the womb of nonexistence? Was He the Omnipotent when He piled the mountains and scooped out the hollow places for
          the rolling deep? Yes, He was powerful then and His arm is unpalsied now, He is the same giant in His might. The sap of His nourishment is undried, and the strength of His soul stands the same forever. Was He wise when He constituted this mighty globe, when He laid the foundations of the universe?
           Had He wisdom when He planned the way of our salvation, and when from all eternity He marked out His awful plans? Yes, and He is wise now. He is not less skillful, He has not less knowledge. His eye which sees all things is undimmed, His ear which hears all the cries, sighs, sobs, and groans of His people, is not rendered heavy by the years which He has heard their prayers.
          `,
    source: 'DELIVERED ON SABBATH MORNING',
    type: 'sermon',
  },
  {
    id: 'THE IMMUTABILITY OF GOD-002',
    text: `Then again, God changes not in His plans. That man began to build, but was not able to finish,
          and therefore he changed his plan, as every wise man would do in such a case. He built upon a smaller
          foundation and commenced again. But has it ever been said that God began to build but was not able to
          finish?
          Nay. When He has boundless stores at His command, and when His own right hand would create
          worlds as numerous as drops of morning dew, shall He ever stay because He has not power? and
          reverse, or alter, or disarrange His plan, because He cannot carry it out? “But,” say some, “perhaps God
          never had a plan.”
          Do you think God is more foolish than yourself then, sir? Do you go to work without a plan? “No,”
          say you, “I have always a scheme.” So has God. Every man has his plan and God has a plan too. God is
          a master-mind. He arranged everything in His gigantic intellect long before He did it. And once having
          settled it, mark you, He never alters it.
          “This shall be done,” says He, and the iron hand of destiny marks it down and it is brought to pass.
          “This is My purpose,” and it stands, nor can earth or hell alter it. “This is My decree,” says He,
          promulgate it angels, rend it down from the gate of heaven you devils, but you cannot alter the decree, it
          shall be done.
          God alters not His plans, why should He? He is Almighty and therefore can perform His pleasure.
          Why should He? He is the All-wise and therefore cannot have planned wrongly. Why should He? He is
          the everlasting God and therefore cannot die before His plan is accomplished. Why should He change?
          You worthless atoms of existence, ephemera of the day! you creeping insects upon this bay-leaf of
          existence! you may change your plans, but He shall never, never change His.
          Then has He told me that His plan is to save me? If so, I am safe.
          `,
    source: 'DELIVERED ON SABBATH MORNING',
    type: 'sermon',
  },
  // ── PASTORAL GUIDANCE ──────────────────────
  {
    id: 'pastoral-grief-001',
    text: 'When ministering to those who grieve: (1) Be present before you speak — Job\'s friends were wisest in their silence. (2) Validate grief — Jesus wept (John 11:35). Grief is not a lack of faith. (3) Avoid clichés — "everything happens for a reason" can feel dismissive. (4) Point gently to the hope of resurrection (1 Thessalonians 4:13-14). (5) Grief takes time — follow up weeks and months later.',
    source: 'Pastoral Ministry: Grief',
    type: 'commentary',
  },
  {
    id: 'pastoral-counseling-001',
    text: 'Biblical counselling principles: (1) Scripture is sufficient for life and godliness (2 Peter 1:3). (2) The goal is transformation, not just behaviour change — address heart motives. (3) Listen more than you speak (James 1:19). (4) Ask questions to help the person discover truth rather than simply handing them answers. (5) Pray with the person, not just for them. (6) Know the limits of pastoral care — refer to professional help when needed.',
    source: 'Pastoral Ministry: Counselling',
    type: 'commentary',
  },
  {
    id: 'pastoral-leadership-001',
    text: 'Servant leadership in ministry: Jesus redefined leadership as service (Mark 10:42-45). The leader who would be great must be servant of all. Key practices: (1) Develop people intentionally — Jesus spent three years investing in twelve. (2) Lead by example, not by title. (3) Protect your flock — shepherd language implies active guarding, not passive management. (4) Maintain personal spiritual health — you cannot give what you do not have.',
    source: 'Pastoral Ministry: Leadership',
    type: 'commentary',
  },

  // ── EVANGELISM ─────────────────────────────
  {
    id: 'evangelism-gospel-summary',
    text: 'The core Gospel message (the Roman Road): (1) All have sinned and fall short of the glory of God (Romans 3:23). (2) The wages of sin is death, but the gift of God is eternal life through Christ Jesus (Romans 6:23). (3) God demonstrates his love — while we were still sinners, Christ died for us (Romans 5:8). (4) If you declare with your mouth "Jesus is Lord" and believe in your heart God raised him from the dead, you will be saved (Romans 10:9).',
    source: 'Evangelism: The Roman Road',
    type: 'general',
  },
  {
    id: 'evangelism-objections-001',
    text: 'Common objections to the Gospel and responses: (1) "There are many ways to God" — Jesus said "I am the way, the truth and the life. No one comes to the Father except through me" (John 14:6). The exclusivity is Jesus\'s own claim. (2) "I\'m a good person" — our goodness is measured against God\'s perfection, not human standards (Isaiah 64:6). (3) "What about those who never heard?" — God is just and will judge righteously. Our responsibility is to ensure they hear.',
    source: 'Evangelism: Answering Objections',
    type: 'general',
  },
];

async function main() {
  console.log('🌱 Lightline — Pinecone Knowledge Base Seeder');
  console.log(`   Documents to seed: ${SEED_DOCUMENTS.length}`);
  console.log('');

  const connected = await initPinecone();
  if (!connected) {
    console.error('❌ Could not connect to Pinecone. Check your PINECONE_API_KEY in backend/.env');
    process.exit(1);
  }

  console.log('📤 Uploading documents...');
  await upsertMinistryDocuments(SEED_DOCUMENTS);

  console.log('');
  console.log('✅ Seeding complete!');
  console.log(`   ${SEED_DOCUMENTS.length} documents uploaded to Pinecone index.`);
  console.log('');
  console.log('   RAG uses OpenRouter embeddings — query your index after seeding.');
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
