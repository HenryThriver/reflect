import { ReviewTemplate } from './types'

export const henryTemplate: ReviewTemplate = {
  slug: 'henry-finkelstein',
  name: "Henry's Annual Review",
  creator: {
    name: 'Henry A Finkelstein',
    title: 'Builder & Thinker',
    bio: 'A comprehensive 9-section framework blending reflection, values alignment, and forward planning. Designed around thriving (not just achievement), systems (not just goals), and invitational mastery.',
    websiteUrl: 'https://thrivinghenry.com',
  },
  intro: {
    headline: 'Beginning Again',
    description:
      "This isn't about grades. It's about attention - choosing to look honestly at where you've been so you can move forward with clarity. Give yourself 3-4 hours (can be spread across sessions). Find a quiet space. Have your calendar, photos, and journal nearby.",
    estimatedMinutes: 210,
  },
  questions: [
    // ========================================
    // SECTION 1: RITUAL OPENING
    // ========================================

    // 1A. Preparation Checklist
    {
      id: 'prep-time-blocked',
      text: 'I have 2-3 hours blocked without interruption',
      type: 'select',
      options: ['Yes', 'No'],
      section: 'Section 1: Ritual Opening',
      helpText: 'Deep reflection needs space.',
    },
    {
      id: 'prep-devices-away',
      text: 'Devices are away or on Do Not Disturb',
      type: 'select',
      options: ['Yes', 'No'],
      section: 'Section 1: Ritual Opening',
    },
    {
      id: 'prep-quiet-space',
      text: 'I am in a quiet, comfortable space',
      type: 'select',
      options: ['Yes', 'No'],
      section: 'Section 1: Ritual Opening',
    },
    {
      id: 'prep-materials',
      text: 'I have materials nearby (journal, calendar, photos)',
      type: 'select',
      options: ['Yes', 'No'],
      section: 'Section 1: Ritual Opening',
    },
    {
      id: 'prep-water',
      text: 'I have water or tea within reach',
      type: 'select',
      options: ['Yes', 'No'],
      section: 'Section 1: Ritual Opening',
    },
    {
      id: 'prep-ready',
      text: 'I am ready to be honest with myself',
      type: 'select',
      options: ['Yes', 'No'],
      section: 'Section 1: Ritual Opening',
    },

    // ========================================
    // SECTION 2: REMEMBER (HIGH POINTS)
    // ========================================

    // 2B.1 Photo Walk
    {
      id: 'photo-walk',
      text: 'Open your [Google Photos](https://photos.google.com) or [iCloud Photos](https://icloud.com/photos) and take a journey through the year. As you scroll, notice which images bring up the strongest positive emotions.\n\nWhat moments or memories stood out as you scrolled through your photos? What surprised you?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'List moments and memories that stood out...',
      helpText: 'Extra credit: Create an album of your favorite moments and memories from this year.',
      required: true,
    },

    // 2C.1 Calendar Walk
    {
      id: 'calendar-walk',
      text: 'Walk through your calendar ([Google](https://calendar.google.com/calendar/u/0/r/month/2025/1/1) / [Apple](https://icloud.com/calendar)) month by month.\n\nWhat high points emerge from your calendar? What were the moments worth remembering?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'January: ...\nFebruary: ...\n(continue through the year)',
      helpText: 'A year contains more than we remember. Let your calendar remind you.',
      required: true,
    },

    // 2C.2 Peak Experiences
    {
      id: 'peak-moments',
      text: 'What were your peak experiences this year - moments of joy, awe, satisfaction, or deep connection?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Describe 3-5 peak experiences...',
      required: true,
    },

    // 2D. FAVORITES (7 questions)
    {
      id: 'favorites-reading',
      text: 'What were your favorite books, essays, or articles this year? What made them meaningful to you?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'List your favorites and what resonated...',
    },
    {
      id: 'favorites-screen-audio',
      text: 'What were your favorite movies, shows, or podcasts? What stood out to or resonated with you?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Your favorites from screens and speakers...',
    },
    {
      id: 'favorites-experiences',
      text: 'What were your favorite experiences - concerts, performances, events, or adventures?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Live moments that stood out...',
    },
    {
      id: 'favorites-travel',
      text: 'What were your favorite trips or travel moments?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Memorable journeys and destinations...',
    },
    {
      id: 'favorites-spiritual',
      text: 'Did you have any spiritual or expansive experiences this year? What happened and how has it impacted you?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Moments of transcendence or expansion...',
    },
    {
      id: 'favorites-skills',
      text: 'What new skills did you learn or start developing?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Skills you began learning this year...',
    },
    {
      id: 'favorites-changed-mind',
      text: 'What did you read, watch, or learn that changed your mind? What belief shifted?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'What you encountered that shifted your thinking...',
    },

    // 2E. CORE REFLECTIONS (6 questions)
    {
      id: 'accomplishments',
      text: 'What accomplishments are you most proud of?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'List accomplishments big and small...',
      helpText: 'Professional, personal, creative, relational - anything you\'re proud of counts.',
      required: true,
    },
    {
      id: 'core-small-delight',
      text: "What's something small that made you smile? Not a big achievement - just a moment of unexpected delight.",
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'A tiny moment of joy...',
    },
    {
      id: 'core-new-connection',
      text: 'What new connection or relationship had a big impact on you this year? Why and how?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'A person who entered your life...',
    },
    {
      id: 'core-most-connected',
      text: 'When did you feel most connected to others this year? What facilitated or deepened that connection?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Moments of deep connection...',
    },
    {
      id: 'core-gratitude',
      text: 'Who and what are you most grateful for this year?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'People, experiences, gifts...',
      required: true,
    },
    {
      id: 'core-relive',
      text: 'If you could relive any moment from this year, which would it be? What about that moment do you want to experience again?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'The moment and what made it special...',
    },

    // ========================================
    // SECTION 3: ACKNOWLEDGE (LOW POINTS)
    // ========================================

    // 3A. Intro framing (in section text, not a question)

    // 3B.1 Hardship (tough moments + coping combined)
    {
      id: 'tough-moments',
      text: 'What were your toughest moments this year? How did you get through them?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'The hardest times and what helped you through...',
      helpText: 'Naming difficulty is not dwelling - it is honoring what you carried.',
      required: true,
    },

    // 3B.2 Energy drains
    {
      id: 'energy-drains',
      text: 'What drained your energy or held you back this year? Think about people, tasks, obligations, beliefs, or circumstances that depleted you or blocked your progress.',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'People, tasks, obligations, beliefs, circumstances that drained you...',
    },

    // 3C.1 Strained relationship (RELATIONAL)
    {
      id: 'strained-relationship',
      text: 'What relationship felt strained or neglected this year?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'A relationship that needs attention...',
    },

    // 3C.2 Failed to show up (RELATIONAL)
    {
      id: 'failed-show-up',
      text: 'Where did you fail to show up for someone important to you?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'A moment when you were not there for someone...',
    },

    // 3D.1 Let go/forgot (REVEALED PREFERENCES)
    {
      id: 'let-go-forgot',
      text: 'What did you let go of this year - intentionally or not? What did you simply forget about?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'What fell away or was released...',
      helpText: 'What you let go of reveals what actually mattered versus what you thought mattered.',
    },

    // 3E.1 Fear cost (FEAR)
    {
      id: 'fear-cost',
      text: 'What did you not do because of fear? Be honest about what fear cost you this year.',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'What fear held you back from...',
    },

    // 3E.2 Fear reframe (FEAR REFRAME)
    {
      id: 'fear-reframe',
      text: 'Looking at that fear: What were the realistic downsides? What were the potential upsides you missed?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'Realistic risks versus missed opportunities...',
      helpText: 'The pause between naming fear and examining it creates perspective.',
    },

    // 3F.1 Disappointments
    {
      id: 'disappointments',
      text: 'What were your biggest disappointments or misses?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'What fell short of your hopes...',
    },

    // 3G.1 Time travel hug (SELF-COMPASSION CLOSE)
    {
      id: 'self-compassion-moment',
      text: 'You can time travel to any moment in the past year to give yourself a hug and envelop yourself in compassion. What situation or experience do you choose?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'The moment where you most needed compassion...',
    },

    // ========================================
    // SECTION 4: SYNTHESIZE
    // ========================================

    // 4A. Intro (in section text)

    // 4B.1 High Point Patterns
    {
      id: 'patterns-highs',
      text: 'Looking at your high points: What patterns do you notice? What conditions, people, or choices led to those moments?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Notice patterns across your high points...',
      required: true,
    },

    // 4B.2 Low Point Patterns
    {
      id: 'patterns-lows',
      text: 'Looking at your low points: What patterns do you notice? Are there recurring themes in what brought you down?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Notice patterns across your low points...',
    },

    // 4B.3 Energy Patterns
    {
      id: 'patterns-energy',
      text: 'When throughout the year did you feel most energized? What created that energy for you?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Times and conditions that energized you...',
    },

    // 4C.1 Relational Mirror (NEW)
    {
      id: 'relational-mirror',
      text: 'What did you learn about yourself from your relationships? What do you perceive was reflected back to you?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'What your relationships reflected back to you...',
      helpText: 'How others engage with us is a mirror on how we engage with the world.',
    },

    // 4D.1 Surprises
    {
      id: 'surprises',
      text: "What surprised you this year? What happened that you didn't expect or plan for?",
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Unexpected events, realizations, outcomes...',
    },

    // 4D.2 Risks Taken (NEW)
    {
      id: 'risks-taken',
      text: 'What risks did you take this year? What inspired you to go there?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Risks you took and what inspired them...',
    },

    // 4E.1 Lessons Learned
    {
      id: 'lessons-learned',
      text: 'What did you learn this year? What important lessons would you impart from your experiences?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Important lessons from this year...',
      required: true,
    },

    // 4E.2 Chapter Title (NEW - replaces year-word)
    {
      id: 'chapter-title',
      text: 'If this year were a chapter in your life story, what would you title it? What was the narrative arc?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Your chapter title and the story arc...',
    },

    // 4F.1 Stories to Let Go (NEW)
    {
      id: 'stories-release',
      text: 'What stories from this year are you ready to let go of? What narratives no longer serve you?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Stories and narratives you are ready to release...',
    },

    // ========================================
    // SECTION 5: VALUE FOREST REVIEW
    // ========================================

    // Note: Full Value Forest implementation requires dynamic tree selection
    // and per-tree question loops. This represents the static questions.

    // 5A. Intro (in section text)

    // 5B. Tree Selection - represented as multi-select
    {
      id: 'value-trees-selected',
      text: 'Which Value Trees do you want to explore in this review? Select 4-8 areas to reflect on deeply. (You can add custom trees as well.)',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder:
        'Select from: Health & Body, Mental & Emotional, Career & Work, Finances, Partnership/Romance, Family, Friendships & Community, Learning & Intellect, Creativity, Spirituality, Fun & Play, Environment & Home, Legacy & Impact\n\nMy selected trees:\n1. ...\n2. ...\n3. ...',
      helpText:
        'These are areas of life you want to be intentional about. The Value Forest is your personal ecosystem.',
      required: true,
    },

    // 5C. Per-Tree Questions (template - actual implementation would loop)
    // Representing one tree as example; in real UI this repeats for each selected tree
    // Order: name → scope → standards → proud → gratitude → held back → aspirations → help → satisfaction

    {
      id: 'tree-1-name',
      text: 'Value Tree #1: What is this tree? (e.g., "Health & Body" or a custom area)',
      type: 'text',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Tree name...',
      required: true,
    },
    // 5C.1 Scope
    {
      id: 'tree-1-scope',
      text: 'What does this area of life include for you? What falls inside and outside its boundaries?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: "Define what's in and out of scope for this tree...",
      helpText: 'Clarity on scope prevents this tree from absorbing everything.',
    },
    // 5C.2 Standards
    {
      id: 'tree-1-standards',
      text: 'How do you want to show up in this area? What principles or values guide your behavior here?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Your standards and values for this area...',
    },
    // 5C.3 Proud
    {
      id: 'tree-1-wins',
      text: 'What are you most proud of in this area this year?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Wins, progress, moments of pride...',
    },
    // 5C.4 Gratitude (NEW)
    {
      id: 'tree-1-gratitude',
      text: 'Who supported you or showed up for you here? What are you grateful for in this area?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: "People who helped, things you're grateful for...",
    },
    // 5C.5 Held back
    {
      id: 'tree-1-challenges',
      text: "What held you back or didn't go the way you hoped? What fears or obstacles got in the way?",
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: "Obstacles, fears, what didn't work...",
    },
    // 5C.6 Aspirations
    {
      id: 'tree-1-aspirations',
      text: 'What do you want next year? What outcomes, ways of being, or changes are you aspiring to?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Aspirations and intentions for next year...',
    },
    // 5C.7 Help
    {
      id: 'tree-1-help',
      text: 'Who or what could help you with this? Is there anyone you know or are aware of who has succeeded doing something similar?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Resources, mentors, people who have succeeded in this area...',
    },
    // 5C.8 Satisfaction
    {
      id: 'tree-1-satisfaction',
      text: 'How satisfied are you with this area of your life right now?',
      type: 'scale',
      section: 'Section 5: Value Forest Review',
      minValue: 1,
      maxValue: 5,
      helpText: '1 = Very dissatisfied, 2 = Dissatisfied, 3 = Neutral, 4 = Satisfied, 5 = Very satisfied',
    },

    // Placeholder for additional trees (2-8)
    // In real implementation, these would be dynamically generated

    // 5D. Priority Ranking
    {
      id: 'tree-priority-ranking',
      text: 'Now rank your Value Trees by priority for the coming year. Which areas need the most attention and investment?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder:
        '1. (highest priority)\n2. \n3. \n4. \n5. \n6. \n(continue for all selected trees)',
      helpText: "Not all trees need equal attention. What's calling for focus?",
      required: true,
    },

    // 5E. Overview Questions (split from single reveal-reflection)
    // 5E.1 Gap reflection
    {
      id: 'tree-gap-reflection',
      text: 'Looking at your forest, where is the biggest gap between where you are and where you want to be?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Which area shows the biggest gap...',
    },
    // 5E.2 Shifts reflection
    {
      id: 'tree-shifts-reflection',
      text: "Are there any Value Trees that have shifted in importance this year? Something that used to matter that doesn't anymore, or something newly important?",
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Trees that have become more or less important...',
    },
    // 5E.3 Interdependencies reflection
    {
      id: 'tree-interdependencies-reflection',
      text: 'How do your different Value Trees affect each other? Where does progress in one area support another? Where do they compete for your time and energy?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Synergies and trade-offs between your trees...',
    },

    // ========================================
    // SECTION 6: RESTORATION & KEYSTONE HABITS
    // ========================================

    // 6A. Intro (in section text)

    // 6B. Rest & Restoration
    {
      id: 'rest-filled-cup',
      text: 'What activities or experiences filled your cup this year versus just filled your time?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Things that genuinely restored you vs. passive time-fillers...',
      helpText: 'There is a difference between rest and mere distraction.',
      required: true,
    },
    {
      id: 'rest-vibrant',
      text: 'When did you feel most rested and vibrant? What were you doing (or not doing) to cultivate that?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Conditions that led to feeling restored...',
    },
    {
      id: 'rest-being-doing',
      text: 'When throughout the year were you "being" without the need to be "doing"? What is the right balance of those two poles for you?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Presence vs. productivity - what serves you?',
      helpText: 'Being is not laziness. It is presence without agenda.',
    },
    {
      id: 'rest-blockers',
      text: 'What behaviors or beliefs got in the way of your rest this year? Is there anything to be done about those blockers next year?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Guilt, overcommitment, inability to disconnect...',
    },

    // 6C. Keystone Behaviors
    {
      id: 'keystone-past',
      text: 'Looking back: What small, repeated actions had the biggest ripple effects on your life this year - for better or worse?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Small habits with outsized positive or negative impact...',
      helpText:
        'Keystone behaviors are like keystone species in an ecosystem - small but with ripple effects.',
      required: true,
    },
    {
      id: 'keystone-experiment-add',
      text: "What are 2-3 keystone behaviors you'd like to experiment with in Q1? Small habits you suspect might have positive ripple effects. Be specific: What time of day would this happen? What comes before or after? What would trigger this behavior?",
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: '1. ...\n2. ...\n3. ...',
      helpText: 'Frame these as experiments, not commitments. You are trying things to see what works.',
      required: true,
    },
    {
      id: 'keystone-experiment-remove',
      text: "Is there a habit you want to experiment with releasing? Something that might be quietly draining you that you'd like to try living without for a month or two. Be specific: When does this habit typically occur? What triggers it? What might you do instead?",
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'The habit and your plan for releasing it...',
    },
    {
      id: 'keystone-obstacles',
      text: 'Is there anything that would hinder your ability to add or remove those habits? What can you do, or who can you tap, to help you overcome those blockers?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Anticipate obstacles and plan for them...',
      helpText: 'Obstacles are not failures - they are data. Plan for them.',
    },

    // ========================================
    // SECTION 7: WAYFINDING
    // ========================================

    // 7A. Intro (in section text)

    // 7B. Future Self Visualization
    {
      id: 'future-self-message',
      text: 'Guided Visualization: Picture yourself in your happy place. As you walk through it, you encounter yourself 30 years from now - wise, at peace, with something important to tell you. What did they say? What did they want you to know?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'What your future self shared with you...',
      helpText:
        'Find a comfortable position, take a few breaths. Let yourself really imagine this meeting.',
      required: true,
    },
    {
      id: 'future-self-priorities',
      text: 'What did your future self encourage you to prioritize - or let go of?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'Their advice about what matters and what does not...',
    },

    // 7C. Big Questions (Feynman-Inspired)
    {
      id: 'feynman-questions',
      text: "What are 3-6 big questions you're holding for your life right now? Questions you don't have answers to, but that feel important to keep asking.",
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder:
        'Examples:\n- What would it feel like to be completely at peace with myself?\n- How do I want to be remembered by the people I love?\n- What am I avoiding that I know I need to face?\n\nYour questions:\n1. ...\n2. ...\n3. ...',
      helpText:
        'Richard Feynman kept a list of his "favorite problems" - questions he carried with him, returning to them again and again.',
      required: true,
    },

    // 7D. Feel / Become / Experience
    {
      id: 'next-year-feel',
      text: 'How do you want to FEEL next year? Not what you want to accomplish - how you want to experience your days. What emotional texture do you want your life to have?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'Peaceful, energized, connected, creative, grounded...',
      required: true,
    },
    {
      id: 'next-year-become',
      text: 'Who do you want to BECOME in the coming year? What qualities, capacities, or ways of being do you want to develop?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'More patient, more creative, better listener, stronger boundaries...',
    },
    {
      id: 'next-year-experience',
      text: 'What do you want to EXPERIENCE next year? What moments, adventures, or milestones are you looking forward to - or want to create?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'Trips, projects, milestones, conversations...',
    },

    // 7E. Theme for the Year
    {
      id: 'theme-word',
      text: 'What word or theme do you want to carry into the coming year?',
      type: 'text',
      section: 'Section 7: Wayfinding',
      placeholder: 'One word or short phrase...',
      helpText:
        "I've had years guided by words like \"Depth,\" \"Presence,\" \"Integration.\" The word doesn't have to be perfect - it's a compass, not a contract. Let it find you.",
      required: true,
    },
    {
      id: 'theme-meaning',
      text: 'What does this theme mean to you? How will you embody it?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'What this word represents and how it will guide you...',
    },

    // ========================================
    // SECTION 8: GROUND IT
    // ========================================

    // 8A. Intro (in section text)

    // 8B. Aspirations Summary reflection
    {
      id: 'aspirations-reflection',
      text: 'Looking at all of this together, what stands out? Is there anything you want to add, remove, or reframe?',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: 'Reflections on seeing everything in one place...',
      helpText:
        'Before you prioritize, take a moment to see the full picture. Your aspirations from the Value Forest, keystone habits from Section 6, and theme from Section 7.',
    },

    // 8C. Q1 Focus
    {
      id: 'q1-focus',
      text: "Of all your aspirations, what 2-3 things do you want to focus on in Q1? These aren't your only priorities - just where you'll direct your energy first.",
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: '1. ...\n2. ...\n3. ...',
      helpText:
        'I aim for 60-70% achievement on my aspirations across the year. If I hit 100%, I was not dreaming big enough. Focusing on 2-3 things per quarter means I can actually make progress.',
      required: true,
    },
    {
      id: 'q1-changes',
      text: "What would have to change in your life to make room for these Q1 priorities? What's currently taking up space that shouldn't be?",
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: 'What needs to shift to create space...',
    },

    // 8D. Creating Space
    {
      id: 'q1-no',
      text: "What's one thing you will say NO to in Q1 to create space for what you do want?",
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: 'A commitment, habit, or obligation to decline...',
      required: true,
    },
    {
      id: 'q1-dont-do-list',
      text: "What are 2-3 aspirations from your list that you'll put on your \"Don't Do\" list for Q1? Things that matter, but that you're giving yourself permission to pick up later.",
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder:
        'This is not about abandoning aspirations - it is about sequencing them.\n\n1. ...\n2. ...\n3. ...',
      helpText:
        'Putting something on your "Don\'t Do" list for Q1 means you are consciously choosing to focus elsewhere first. It creates exhale.',
    },

    // 8E. Defining Success
    {
      id: 'q1-success',
      text: 'For your 2-3 Q1 priorities: What would "done" or "success" look like? How would you know you made meaningful progress?',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: 'Define what success looks like for each priority...',
      required: true,
    },
    {
      id: 'q1-activation-energy',
      text: 'For each priority, is this something brand new (requiring activation energy to start) or building on existing momentum?',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder:
        'New initiatives require more activation energy than continuing something already in motion. One brand-new initiative plus one or two "continuing" priorities is often the right balance.',
      helpText: 'Be realistic about how much activation energy you have available.',
    },

    // ========================================
    // SECTION 9: COMMITMENT
    // ========================================

    // 9A. Intro (in section text)

    // 9B. Letter to Future Self
    {
      id: 'letter-to-future-self',
      text: "Write a letter to yourself one year from now. What do you hope you'll be able to say when you read this? What do you want to remind yourself of? What commitments are you making to yourself?",
      type: 'textarea',
      section: 'Section 9: Commitment',
      placeholder:
        'Dear Future Me,\n\nThis time next year, I hope you...\n\nI want you to remember that...\n\nI am committing to...\n\nDo not forget...\n\nWith love,\n[Present You]',
      helpText:
        'I actually schedule this letter to arrive via email on December 15th of the following year. Reading last year\'s letter while doing this year\'s review is one of my favorite moments.',
      required: true,
    },

    // 9C. First Step
    {
      id: 'first-step',
      text: 'What is ONE action you can take in the next 48 hours to begin living into your intentions? Something small but concrete that creates momentum.',
      type: 'textarea',
      section: 'Section 9: Commitment',
      placeholder: 'One specific action to take in the next 48 hours...',
      required: true,
    },

    // 9D. The Witness
    {
      id: 'witness',
      text: 'Some people publish their reviews online. Others share with their closest friends and loved ones. Is there anyone you want to share aspects of this review - or your 2026 aspirations - with?',
      type: 'textarea',
      section: 'Section 9: Commitment',
      placeholder: 'Who might you share this with?',
    },

    // 9E. Final Reflection
    // Note: UI should auto-pull and display their 1C.1 response here as a bookend
    {
      id: 'final-feeling',
      text: 'How do you feel right now, having completed this reflection? Did you get what you hoped for?',
      type: 'textarea',
      section: 'Section 9: Commitment',
      placeholder: 'Check in with yourself after this journey...',
      helpText: 'At the start, you said you wanted to feel a certain way. Did you get there?',
      required: true,
    },
    {
      id: 'final-discovery',
      text: 'What did you discover that you didn\'t expect?',
      type: 'textarea',
      section: 'Section 9: Commitment',
      placeholder: 'Surprises, insights, or realizations from this process...',
    },
    {
      id: 'final-missing-question',
      text: 'What is one question you wished we asked - or you answered - that wasn\'t included in this review?',
      type: 'textarea',
      section: 'Section 9: Commitment',
      placeholder: 'A question that would have made this review more complete for you...',
    },
  ],
}
