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
      "This isn't about grades. It's about attention—choosing to look honestly at where you've been so you can move forward with clarity. Give yourself 3-4 hours (can be spread across sessions). Find a quiet space. Have your calendar, photos, and journal nearby.",
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

    // 1B. Grounding Breath
    {
      id: 'grounding-breath',
      text: 'Take three deep breaths. On the inhale, gather the year behind you. On the exhale, arrive fully in this moment. When ready, continue.',
      type: 'textarea',
      section: 'Section 1: Ritual Opening',
      placeholder: 'Note any sensations, thoughts, or feelings that arose...',
      helpText: 'This is optional—just a moment to arrive.',
    },

    // 1C. Setting Intention
    {
      id: 'intention-feel',
      text: 'How do you want to feel at the end of this review?',
      type: 'textarea',
      section: 'Section 1: Ritual Opening',
      placeholder: 'Grounded, clear, hopeful, motivated...',
      helpText: 'Set an emotional intention for this process.',
      required: true,
    },
    {
      id: 'intention-valuable',
      text: 'What would make this reflection genuinely valuable for you?',
      type: 'textarea',
      section: 'Section 1: Ritual Opening',
      placeholder: 'Clarity on a decision, patterns to notice, permission to let go...',
      required: true,
    },

    // ========================================
    // SECTION 2: REMEMBER (HIGH POINTS)
    // ========================================

    // 2A. Photo Walk
    {
      id: 'photo-walk',
      text: "Scroll through your camera roll from this year. Don't analyze—just notice. What images stop you? What moments did you forget you had? Jot down 5-10 memories that surface.",
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'List memories that surfaced from your photos...',
      helpText: 'This is about noticing, not judging. Let the images speak.',
      required: true,
    },

    // 2B. Calendar Archaeology
    {
      id: 'calendar-walk',
      text: 'Walk through your calendar month by month. What events, trips, milestones, or transitions stand out? What did you forget happened this year?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'January: ...\nFebruary: ...\n(continue through the year)',
      helpText: 'A year contains more than we remember. Let your calendar remind you.',
      required: true,
    },

    // 2C. Peak Experiences
    {
      id: 'peak-moments',
      text: 'What were your peak moments this year? Times when you felt most alive, joyful, or fulfilled.',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Describe 3-5 peak moments...',
      required: true,
    },
    {
      id: 'peak-patterns',
      text: 'What do your peak moments have in common? Who was there? What were you doing? Where were you?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Notice patterns across your highlights...',
    },

    // 2D. Accomplishments
    {
      id: 'accomplishments',
      text: 'What did you accomplish this year that you are proud of? (Professional, personal, creative, relational—all count.)',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'List accomplishments big and small...',
      required: true,
    },
    {
      id: 'accomplishment-feelings',
      text: 'How did these accomplishments make you feel in the moment? How do you feel about them now?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'The feelings matter as much as the achievements...',
    },

    // 2E. Growth
    {
      id: 'growth-skills',
      text: 'What new skills or knowledge did you gain this year?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Technical skills, soft skills, life lessons...',
    },
    {
      id: 'growth-character',
      text: 'How did you grow as a person? What character traits developed or strengthened?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Patience, resilience, boundaries, compassion...',
    },
    {
      id: 'growth-surprised',
      text: 'What surprised you about yourself this year?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Moments when you acted differently than expected...',
    },

    // 2F. Gratitude
    {
      id: 'gratitude-people',
      text: 'Who are you most grateful for this year? What did they contribute to your life?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'People who made a difference...',
      required: true,
    },
    {
      id: 'gratitude-experiences',
      text: 'What experiences are you most grateful for?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Moments, trips, conversations, discoveries...',
    },
    {
      id: 'gratitude-self',
      text: 'What are you grateful to yourself for? How did you show up for yourself this year?',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Self-care, boundaries, risks taken...',
    },

    // 2G. Favorites
    {
      id: 'favorites',
      text: 'What were your favorites this year? (Books, music, shows, meals, places, discoveries...)',
      type: 'textarea',
      section: 'Section 2: Remember (High Points)',
      placeholder: 'Favorite book: ...\nFavorite album: ...\nFavorite meal: ...\nFavorite discovery: ...',
      helpText: 'These small joys are part of the texture of your year.',
    },

    // ========================================
    // SECTION 3: ACKNOWLEDGE (LOW POINTS)
    // ========================================

    // 3A. Intro framing (in section text, not a question)

    // 3B. Valleys & Struggles
    {
      id: 'valleys',
      text: 'What were the hardest moments or periods this year? The valleys, the struggles, the times you wanted to give up.',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'Be honest about what was difficult...',
      helpText: 'Naming difficulty is not dwelling—it is honoring what you carried.',
      required: true,
    },
    {
      id: 'valleys-coping',
      text: 'How did you cope with these hard times? What helped you get through?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'People, practices, beliefs that sustained you...',
    },

    // 3C. Losses & Disappointments
    {
      id: 'losses',
      text: 'What did you lose this year? (People, relationships, opportunities, beliefs, parts of yourself...)',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'Losses deserve acknowledgment...',
    },
    {
      id: 'disappointments',
      text: 'What disappointed you this year? Where did reality fall short of expectation—in yourself, others, or circumstances?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'Disappointments with yourself, others, outcomes...',
    },

    // 3D. Mistakes & Regrets
    {
      id: 'mistakes',
      text: 'What mistakes did you make? Where did you fall short of who you want to be?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'Mistakes are data, not verdicts...',
      helpText: 'This is not about self-criticism—it is about honest accounting.',
    },
    {
      id: 'regrets',
      text: "What do you regret? What do you wish you had done differently—or hadn't done at all?",
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'Actions taken or not taken...',
    },

    // 3E. Letting Go
    {
      id: 'letting-go',
      text: 'Is there anything you need to let go of from this year? Grudges, guilt, stories you keep telling yourself?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'What would feel lighter to release?',
    },
    {
      id: 'forgiveness',
      text: 'Is there anyone you need to forgive—including yourself? What would forgiveness look like?',
      type: 'textarea',
      section: 'Section 3: Acknowledge (Low Points)',
      placeholder: 'Forgiveness is not about them—it is about freeing yourself.',
    },

    // ========================================
    // SECTION 4: SYNTHESIZE
    // ========================================

    // 4A. Intro (in section text)

    // 4B. Noticing Patterns
    {
      id: 'patterns-energy',
      text: 'Looking across your highs and lows: What gave you energy this year? What drained it?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'People, activities, environments that energized or depleted you...',
      required: true,
    },
    {
      id: 'patterns-recurring',
      text: 'What patterns do you notice recurring in your year? Behaviors, situations, or emotional cycles that kept showing up.',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Patterns in how you worked, related, rested, reacted...',
    },
    {
      id: 'patterns-surprised',
      text: 'What surprised you as you reflected? Anything you discovered that you had forgotten or not noticed in real-time?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Surprises from the reflection process...',
    },

    // 4C. Lessons
    {
      id: 'lessons-learned',
      text: 'What are the 3-5 most important lessons this year taught you?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: '1. ...\n2. ...\n3. ...',
      required: true,
    },
    {
      id: 'lessons-apply',
      text: 'How might you apply these lessons going forward? What would change if you took them seriously?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Practical implications of what you learned...',
    },

    // 4D. Changed Mind
    {
      id: 'changed-mind',
      text: 'What did you change your mind about this year? Beliefs, assumptions, or approaches you updated.',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'I used to think... Now I think...',
      helpText: 'Changing your mind is a sign of growth.',
    },

    // 4E. Year in a Word
    {
      id: 'year-word',
      text: 'If you had to summarize this year in one word or phrase, what would it be?',
      type: 'text',
      section: 'Section 4: Synthesize',
      placeholder: 'One word or short phrase...',
      required: true,
    },
    {
      id: 'year-word-why',
      text: 'Why that word? What does it capture about your year?',
      type: 'textarea',
      section: 'Section 4: Synthesize',
      placeholder: 'Explain your choice...',
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

    {
      id: 'tree-1-name',
      text: 'Value Tree #1: What is this tree? (e.g., "Health & Body" or a custom area)',
      type: 'text',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Tree name...',
      required: true,
    },
    {
      id: 'tree-1-scope',
      text: 'Roots (Scope): What does this area of life include for you? What falls inside and outside its boundaries?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: "Define what's in and out of scope for this tree...",
      helpText: 'Clarity on scope prevents this tree from absorbing everything.',
    },
    {
      id: 'tree-1-standards',
      text: 'Trunk (Standards): How do you want to show up in this area? What principles or values guide your behavior here?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Your standards and values for this area...',
    },
    {
      id: 'tree-1-wins',
      text: 'Looking back: What went well in this area this year? What are you proud of?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Wins, progress, moments of pride...',
    },
    {
      id: 'tree-1-challenges',
      text: 'What was challenging in this area? What fell short of your hopes?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Struggles, disappointments, unmet intentions...',
    },
    {
      id: 'tree-1-lessons',
      text: 'What did this area teach you this year?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Lessons specific to this part of your life...',
    },
    {
      id: 'tree-1-satisfaction',
      text: 'How satisfied are you with this area of your life right now?',
      type: 'scale',
      section: 'Section 5: Value Forest Review',
      minValue: 1,
      maxValue: 5,
      helpText: '1 = Very dissatisfied, 5 = Very satisfied',
    },
    {
      id: 'tree-1-aspirations',
      text: 'Branches (Resolves): What do you want to be different in this area next year? What would you like to nurture, grow, or change?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Aspirations and intentions for next year...',
    },
    {
      id: 'tree-1-help',
      text: 'Who or what could help you with this? Anyone who has succeeded in this area you could learn from?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'Resources, mentors, tools, communities...',
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

    // 5E. The Reveal reflection
    {
      id: 'tree-reveal-reflection',
      text: 'Looking at your priorities alongside your satisfaction ratings: What stands out? Are there high-priority/low-satisfaction areas that need focus? High-satisfaction areas to protect?',
      type: 'textarea',
      section: 'Section 5: Value Forest Review',
      placeholder: 'What does the pattern tell you about where to invest your energy?',
      helpText: 'Focus Areas: High priority, low satisfaction. Protect: High priority, high satisfaction.',
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
      placeholder: 'Presence vs. productivity—what serves you?',
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
      text: 'Looking back: What small, repeated actions had the biggest ripple effects on your life this year—for better or worse?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Small habits with outsized positive or negative impact...',
      helpText:
        'Keystone behaviors are like keystone species in an ecosystem—small but with ripple effects.',
      required: true,
    },
    {
      id: 'keystone-experiment-add',
      text: 'What are 2-3 keystone behaviors you would like to experiment with in Q1? Small habits you suspect might have positive ripple effects.',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder:
        'Be specific: What time of day would this happen? What comes before or after? What would trigger this behavior?\n\n1. ...\n2. ...\n3. ...',
      helpText: 'Frame these as experiments, not commitments. You are trying things to see what works.',
      required: true,
    },
    {
      id: 'keystone-experiment-remove',
      text: 'Is there a habit you want to experiment with releasing? Something that might be quietly draining you that you would like to try living without for a month or two.',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder:
        'Be specific: When does this habit typically occur? What triggers it? What might you do instead?',
    },
    {
      id: 'keystone-obstacles',
      text: 'Is there anything that would hinder your ability to add or remove those habits? What can you do, or who can you tap, to help you overcome those blockers?',
      type: 'textarea',
      section: 'Section 6: Restoration & Keystone Habits',
      placeholder: 'Anticipate obstacles and plan for them...',
      helpText: 'Obstacles are not failures—they are data. Plan for them.',
    },

    // ========================================
    // SECTION 7: WAYFINDING
    // ========================================

    // 7A. Intro (in section text)

    // 7B. Future Self Visualization
    {
      id: 'future-self-message',
      text: 'Guided Visualization: Picture yourself in your happy place. As you walk through it, you encounter yourself 30 years from now—wise, at peace, with something important to tell you. What did they say? What did they want you to know?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'What your future self shared with you...',
      helpText:
        'Find a comfortable position, take a few breaths. Let yourself really imagine this meeting.',
      required: true,
    },
    {
      id: 'future-self-priorities',
      text: 'What did your future self encourage you to prioritize—or let go of?',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder: 'Their advice about what matters and what does not...',
    },

    // 7C. Big Questions (Feynman-Inspired)
    {
      id: 'feynman-questions',
      text: 'What are 3-6 big questions you are holding for your life right now? Questions you do not have answers to, but that feel important to keep asking.',
      type: 'textarea',
      section: 'Section 7: Wayfinding',
      placeholder:
        'Examples:\n- What would it feel like to be completely at peace with myself?\n- How do I want to be remembered by the people I love?\n- What am I avoiding that I know I need to face?\n\nYour questions:\n1. ...\n2. ...\n3. ...',
      helpText:
        'Richard Feynman kept a list of his "favorite problems"—questions he carried with him, returning to them again and again.',
      required: true,
    },

    // 7D. Feel / Become / Experience
    {
      id: 'next-year-feel',
      text: 'How do you want to FEEL next year? Not what you want to accomplish—how you want to experience your days. What emotional texture do you want your life to have?',
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
      text: 'What do you want to EXPERIENCE next year? What moments, adventures, or milestones are you looking forward to—or want to create?',
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
        'I have had years guided by words like "Depth," "Presence," "Integration." The word does not have to be perfect—it is a compass, not a contract.',
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
      text: 'Looking at all your aspirations together (from your Value Trees, keystone habits, and theme): What stands out? Is there anything you want to add, remove, or reframe?',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: 'Reflections on seeing everything in one place...',
      helpText:
        'Before you prioritize, take a moment to see the full picture. Your aspirations from the Value Forest, keystone habits from Section 6, and theme from Section 7.',
    },

    // 8C. Q1 Focus
    {
      id: 'q1-focus',
      text: 'Of all your aspirations, what 2-3 things do you want to focus on in Q1? These are not your only priorities—just where you will direct your energy first.',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: '1. ...\n2. ...\n3. ...',
      helpText:
        'I aim for 60-70% achievement on my aspirations across the year. If I hit 100%, I was not dreaming big enough. Focusing on 2-3 things per quarter means I can actually make progress.',
      required: true,
    },
    {
      id: 'q1-changes',
      text: 'What would have to change in your life to make room for these Q1 priorities? What is currently taking up space that should not be?',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: 'What needs to shift to create space...',
    },

    // 8D. Creating Space
    {
      id: 'q1-no',
      text: 'What is one thing you will say NO to in Q1 to create space for what you do want?',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder: 'A commitment, habit, or obligation to decline...',
      required: true,
    },
    {
      id: 'q1-dont-do-list',
      text: 'What are 2-3 aspirations from your list that you will put on your "Don\'t Do" list for Q1? Things that matter, but that you are giving yourself permission to pick up later.',
      type: 'textarea',
      section: 'Section 8: Ground It',
      placeholder:
        'This is not about abandoning aspirations—it is about sequencing them.\n\n1. ...\n2. ...\n3. ...',
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
      text: 'For each priority: Is this something brand new (requiring activation energy to start) or building on existing momentum?',
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
      text: 'Write a letter to yourself one year from now. What do you hope you will be able to say when you read this? What do you want to remind yourself of? What commitments are you making to yourself?',
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
      text: 'Some people publish their reviews online. Others share with their closest friends and loved ones. Is there anyone you want to share aspects of this review—or your 2026 aspirations—with?',
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
      text: 'What is one question you wished we asked—or you answered—that wasn\'t included in this review?',
      type: 'textarea',
      section: 'Section 9: Commitment',
      placeholder: 'A question that would have made this review more complete for you...',
    },
  ],
}
