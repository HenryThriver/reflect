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
    // OPENING SECTION (Housekeeping)
    // ========================================
    // This section is handled by the HousekeepingPage component.
    // See: src/components/review/housekeeping-page.tsx
    // Questions: prep-time-blocked, prep-devices-away, prep-quiet-space,
    //            prep-materials, prep-water, prep-ready

    // ========================================
    // SECTION 1: CELEBRATE (HIGH POINTS)
    // ========================================

    // 2B.1 Photo Walk
    {
      id: 'photo-walk',
      text: 'Open your [Google Photos](https://photos.google.com) or [iCloud Photos](https://icloud.com/photos) and take a journey through the year. As you scroll, notice which images bring up the strongest positive emotions.\n\nWhat moments or memories stood out as you scrolled through your photos? What surprised you?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'List moments and memories that stood out...',
      henryNote: "I've really enjoyed making a virtual album of my favorite moments, then compiling the top 50ish photos into a physical book. There's something really awesome about a photobook I can hold.",
      required: true,
    },

    // 2C.1 Calendar Walk
    {
      id: 'calendar-walk',
      text: 'Walk through your calendar ([Google](https://calendar.google.com/calendar/u/0/r/month/2025/1/1) / [Apple](https://icloud.com/calendar)) month by month.\n\nWhat high points emerge from your calendar? What were the moments worth remembering?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'January: ...\nFebruary: ...\n(continue through the year)',
      required: true,
    },

    // 2C.2 Peak Experiences
    {
      id: 'peak-moments',
      text: 'What were your peak experiences this year - moments of joy, awe, satisfaction, or deep connection?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'Describe 3-5 peak experiences...',
      required: true,
    },

    // 2D. FAVORITES (7 questions)
    {
      id: 'favorites-reading',
      text: 'What were your favorite books, essays, or articles this year?',
      subhead: 'What made them meaningful to you?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'List your favorites and what resonated...',
      henryNote: "I look through my Amazon, Audible, Libby, and Readwise accounts to get a sense of what I was reading this past year.",
    },
    {
      id: 'favorites-screen-audio',
      text: 'What were your favorite movies, shows, or podcasts?',
      subhead: 'What stood out to, or resonated with, you?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'Your favorites from screens and speakers...',
    },
    {
      id: 'favorites-experiences',
      text: 'What were your favorite experiences - concerts, performances, events, or adventures?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'Live moments that stood out...',
    },
    {
      id: 'favorites-travel',
      text: 'What were your favorite trips or travel moments?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'Memorable journeys and destinations...',
    },
    {
      id: 'favorites-spiritual',
      text: 'Did you have any spiritual or expansive experiences this year?',
      subhead: 'What happened and how has it impacted you?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'Moments of transcendence or expansion...',
    },
    {
      id: 'favorites-skills',
      text: 'What new skills did you learn or start developing?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'Skills you began learning this year...',
    },
    {
      id: 'favorites-changed-mind',
      text: 'What did you read, watch, or learn that changed your mind?',
      subhead: 'What belief shifted?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'What you encountered that shifted your thinking...',
      henryNote: "This question reminds me if I've been thinking critically and challenging deeply held assumptions enough. When I haven't changed my mind in a year, I flag an action item to read + think more afield next year.",
    },

    // 2E. CORE REFLECTIONS (6 questions)
    {
      id: 'accomplishments',
      text: 'What accomplishments are you most proud of?',
      subhead: 'Professional, personal, creative, relational - anything you\'re proud of counts.',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'List accomplishments big and small...',
      required: true,
    },
    {
      id: 'core-small-delight',
      text: "What's something small that made you smile?",
      subhead: 'Not a big achievement, just a moment of unexpected delight.',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'A tiny moment of joy...',
    },
    {
      id: 'core-new-connection',
      text: 'What new connection or relationship had a big impact on you this year?',
      subhead: 'Why did you connect? How have they touched your life?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'A person who entered your life...',
    },
    {
      id: 'core-most-connected',
      text: 'When did you feel most connected to others this year?',
      subhead: 'What facilitated or deepened that connection?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'Moments of deep connection...',
    },
    {
      id: 'core-gratitude',
      text: 'Who and what are you most grateful for this year?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'People, experiences, gifts...',
      required: true,
    },
    {
      id: 'core-relive',
      text: 'If you could relive any moment from this year, which would it be?',
      subhead: 'What about that moment do you want to experience again?',
      type: 'textarea',
      section: '1) Celebrate',
      placeholder: 'The moment and what made it special...',
    },

    // ========================================
    // SECTION 3: ACKNOWLEDGE (LOW POINTS)
    // ========================================

    // 3A. Intro framing (in section text, not a question)

    // 3B.1 Hardship (tough moments + coping combined)
    {
      id: 'tough-moments',
      text: 'What were your toughest moments this year?',
      subhead: 'How did you get through them?',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'The hardest times and what helped you through...',
      henryNote: "I am careful not to dwell or wallow here so much as honor the challenges I weathered.",
      required: true,
    },

    // 3B.2 Energy drains
    {
      id: 'energy-drains',
      text: 'What drained your energy or held you back this year?\n\nThink about people, tasks, obligations, beliefs, or circumstances that depleted you or blocked your progress.',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'People, tasks, obligations, beliefs, circumstances that drained you...',
    },

    // 3C.1 Strained relationship (RELATIONAL)
    {
      id: 'strained-relationship',
      text: 'What relationship felt strained or neglected this year?',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'A relationship that needs attention...',
    },

    // 3C.2 Failed to show up (RELATIONAL)
    {
      id: 'failed-show-up',
      text: 'Where did you fail to show up for someone important to you?',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'A moment when you were not there for someone...',
    },

    // 3D.1 Let go/forgot (REVEALED PREFERENCES)
    {
      id: 'let-go-forgot',
      text: 'What did you let go of this year?',
      subhead: 'What was intentionally released? What did you simply forget about?',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'What fell away or was released...',
      henryNote: "Noticing what I told myself was a priority but never actually prioritized has taught me a lot.",
    },

    // 3E.1 Fear cost (FEAR)
    {
      id: 'fear-cost',
      text: 'What did you not do because of fear?\n\nBe honest about what fear cost you this year.',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'What fear held you back from...',
      henryNote: "I must not fear. Fear is the mind-killer.",
    },

    // 3E.2 Fear reframe (FEAR REFRAME)
    {
      id: 'fear-reframe',
      text: 'Looking at that fear: What were the realistic downsides?\n\nWhat were the potential upsides you missed?',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'Realistic risks versus missed opportunities...',
      henryNote: "Fear is the expensive cousin of awareness. Reminding myself the cost helps me gain perspective for future similar situations.",
    },

    // 3F.1 Disappointments
    {
      id: 'disappointments',
      text: 'What were your biggest disappointments or misses?',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'What fell short of your hopes...',
    },

    // 3G.1 Time travel hug (SELF-COMPASSION CLOSE)
    {
      id: 'self-compassion-moment',
      text: 'You can time travel to any moment in the past year to give yourself a hug and envelop yourself in compassion.\n\nWhat situation or experience do you choose?',
      type: 'textarea',
      section: '2) Acknowledge',
      placeholder: 'The moment where you most needed compassion...',
    },

    // ========================================
    // SECTION 4: SYNTHESIZE
    // ========================================

    // 4A. Intro (in section text)

    // 4B.1 High Point Patterns
    {
      id: 'patterns-highs',
      text: 'Looking at your high points: What patterns do you notice?\n\nWhat conditions, people, or choices led to those moments?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Notice patterns across your high points...',
      required: true,
    },

    // 4B.2 Low Point Patterns
    {
      id: 'patterns-lows',
      text: 'Looking at your low points: What patterns do you notice?\n\nAre there recurring themes in what brought you down?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Notice patterns across your low points...',
    },

    // 4B.3 Energy Patterns
    {
      id: 'patterns-energy',
      text: 'When throughout the year did you feel most energized?',
      subhead: 'What created that energy for you?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Times and conditions that energized you...',
      henryNote: "The people, places, play, and purpose that light me up are hugely valuable to recognize. If you're anything like me, this will fluctuate significantly year by year.",
    },

    // 4C.1 Relational Mirror (NEW)
    {
      id: 'relational-mirror',
      text: 'What did you learn about yourself from your relationships?\n\nWhat do you perceive was reflected back to you?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'What your relationships reflected back to you...',
      henryNote: "How others engage with me is a mirror to how I engage with the world. Be the change I want to see and all that ...",
    },

    // 4D.1 Surprises
    {
      id: 'surprises',
      text: 'What surprised you this year?',
      subhead: "What happened that you didn't expect or plan for?",
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Unexpected events, realizations, outcomes...',
    },

    // 4D.2 Risks Taken (NEW)
    {
      id: 'risks-taken',
      text: 'What risks did you take this year?',
      subhead: 'What inspired you to go there?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Risks you took and what inspired them...',
    },

    // 4E.1 Lessons Learned
    {
      id: 'lessons-learned',
      text: 'What did you learn this year?\n\nWhat important lessons would you impart from your experiences?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Important lessons from this year...',
      required: true,
    },

    // 4E.2 Chapter Title (NEW - replaces year-word)
    {
      id: 'chapter-title',
      text: 'If this year were a chapter in your life story, what would you title it?\n\nWhat was the narrative arc?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Your chapter title and the story arc...',
    },

    // 4F.1 Stories to Let Go (NEW)
    {
      id: 'stories-release',
      text: 'What stories from this year are you ready to let go of?\n\nWhat narratives no longer serve you?',
      type: 'textarea',
      section: '3) Synthesize',
      placeholder: 'Stories and narratives you are ready to release...',
    },

    // ========================================
    // SECTION 4: VALUE FOREST REVIEW
    // ========================================
    // This section is handled by the ValueForestSection component.
    // See: src/components/review/value-trees/value-forest-section.tsx
    // The component provides a dynamic, interactive experience for:
    // - Tree selection (from preset categories + custom trees)
    // - Per-tree reflection questions (scope, standards, wins, gratitude, challenges, aspirations, help, satisfaction)
    // - Priority ranking
    // - Overview reflections (gaps, shifts, interdependencies)

    // ========================================
    // SECTION 5: RESTORATION & KEYSTONE HABITS
    // ========================================

    // 6A. Intro (in section text)

    // 6B. Rest & Restoration
    {
      id: 'rest-filled-cup',
      text: 'What activities or experiences filled your cup this year versus just filled your time?\n\nExplore the difference between rest / recharge and distraction.',
      type: 'textarea',
      section: '5) Restore',
      placeholder: 'Things that genuinely restored you vs. passive time-fillers...',
      henryNote: "This is very person specific. I often recharge more by running 10 miles than I do by watching a movie.",
      required: true,
    },
    {
      id: 'rest-vibrant',
      text: 'When did you feel most rested and vibrant?\n\nWhat were you doing (or not doing) to cultivate that?',
      type: 'textarea',
      section: '5) Restore',
      placeholder: 'Conditions that led to feeling restored...',
    },
    {
      id: 'rest-being-doing',
      text: 'When throughout the year were you "being" without the need to be "doing"?\n\nWhat is the right balance of those two poles for you?',
      type: 'textarea',
      section: '5) Restore',
      placeholder: 'Presence vs. productivity - what serves you?',
    },
    {
      id: 'rest-blockers',
      text: 'What behaviors or beliefs got in the way of your rest this year?\n\nIs there anything to be done about those blockers next year?',
      type: 'textarea',
      section: '5) Restore',
      placeholder: 'Guilt, overcommitment, inability to disconnect...',
    },

    // 6C. Keystone Behaviors
    {
      id: 'keystone-past',
      text: 'What small, repeated actions had the biggest ripple effects on your life this year?\n\nKeystone behaviors may seem small but have outsized impact. Consider positive and negative habits.',
      type: 'textarea',
      section: '5) Restore',
      placeholder: 'Small habits with outsized positive or negative impact...',
      required: true,
    },
    {
      id: 'keystone-experiment-add',
      text: "What are 2-3 keystone behaviors you'd like to experiment with in Q1? Small habits you suspect might have positive ripple effects.\n\nFrame these as experiments, not commitments. What time of day would this happen? What comes before or after? What would trigger this behavior?",
      type: 'textarea',
      section: '5) Restore',
      placeholder: '1. ...\n2. ...\n3. ...',
      required: true,
    },
    {
      id: 'keystone-experiment-remove',
      text: "Is there a habit you want to experiment with releasing? Something that might be quietly draining you that you'd like to try living without for a month or two.\n\nWhen does this habit typically occur? What triggers it? What might you do instead?",
      type: 'textarea',
      section: '5) Restore',
      placeholder: 'The habit and your plan for releasing it...',
    },
    {
      id: 'keystone-obstacles',
      text: 'Is there anything that would hinder your ability to add or remove those habits?\n\nObstacles are not failures - they are data. What can you do, or who can you tap, to help you overcome those blockers?',
      type: 'textarea',
      section: '5) Restore',
      placeholder: 'Anticipate obstacles and plan for them...',
      henryNote: "Habits are engrained social behaviors. When I can't start or shake a habit, I often question if I'm surrounding myself with the right people.",
    },

    // ========================================
    // SECTION 7: WAYFINDING
    // ========================================

    // 7A. Intro (in section text)

    // 7B. Future Self Visualization
    {
      id: 'future-self-message',
      text: 'What did your future self say?\n\nWhat did they want you to know?',
      type: 'textarea',
      section: '6) Wayfind',
      placeholder: 'What your future self shared with you...',
      required: true,
    },
    {
      id: 'future-self-priorities',
      text: 'What did your future self encourage you to prioritize - or let go of?',
      type: 'textarea',
      section: '6) Wayfind',
      placeholder: 'Their advice about what matters and what does not...',
    },

    // 7C. Big Questions (Feynman-Inspired)
    {
      id: 'feynman-questions',
      text: "What are 3-6 big questions you're holding for your life right now?",
      subhead:
        'Richard Feynman kept a list of his "favorite problems" - questions he didn\'t have answers to, but kept asking and returning to again and again.',
      type: 'textarea',
      section: '6) Wayfind',
      placeholder:
        'Examples:\n- What would it feel like to be completely at peace with myself?\n- How do I want to be remembered by the people I love?\n- What am I avoiding that I know I need to face?\n\nYour questions:\n1. ...\n2. ...\n3. ...',
      required: true,
    },

    // 7D. Feel / Become / Experience
    {
      id: 'next-year-feel',
      text: 'How do you want to FEEL next year?\n\nWhat emotional texture do you want your life to have?',
      type: 'textarea',
      section: '6) Wayfind',
      placeholder: 'Peaceful, energized, connected, creative, grounded...',
      required: true,
    },
    {
      id: 'next-year-become',
      text: 'Who do you want to BECOME in the coming year?\n\nWhat qualities, capacities, or ways of being do you want to develop?',
      type: 'textarea',
      section: '6) Wayfind',
      placeholder: 'More patient, more creative, better listener, stronger boundaries...',
    },
    {
      id: 'next-year-experience',
      text: 'What do you want to EXPERIENCE next year?\n\nWhat moments, adventures, or milestones are you looking forward to - or want to create?',
      type: 'textarea',
      section: '6) Wayfind',
      placeholder: 'Trips, projects, milestones, conversations...',
    },

    // 7E. Theme for the Year
    {
      id: 'theme-word',
      text: 'What word or theme do you want to center 2026?',
      subhead: 'Your word is a mantra or meditation to act as a compass of compassion throughout the year.',
      type: 'text',
      section: '6) Wayfind',
      placeholder: 'One word or short phrase...',
      henryNote: 'Past examples from recent years are "Graceful No", "Focus", "Healthy".',
      required: true,
    },
    {
      id: 'theme-meaning',
      text: 'What does this theme mean to you?',
      subhead: 'How will you embody it?',
      type: 'textarea',
      section: '6) Wayfind',
      placeholder: 'What this word represents and how it will guide you...',
    },

    // ========================================
    // SECTION 8: GROUND IT
    // ========================================

    // 8A. Intro (in section text)

    // 8B. Aspirations Summary reflection
    {
      id: 'aspirations-reflection',
      text: 'Zoom out to see the big picture - reread your aspirations from your top Value Trees, your keystone habits experiments, and your annual theme. What stands out?',
      subhead: 'Anything you want to add, remove, or reframe?',
      type: 'textarea',
      section: '7) Ground',
      placeholder: 'Reflections on seeing everything in one place...',
    },

    // 8C. Q1 Focus
    {
      id: 'q1-focus',
      text: "Of all your aspirations, what 2-3 things do you want to focus on in Q1?\n\nThese aren't your only priorities - just where you'll direct your energy first.",
      type: 'textarea',
      section: '7) Ground',
      placeholder: '1. ...\n2. ...\n3. ...',
      required: true,
    },
    {
      id: 'q1-changes',
      text: "What would have to change in your life to make room for these Q1 priorities?\n\nWhat's currently taking up space that shouldn't be?",
      type: 'textarea',
      section: '7) Ground',
      placeholder: 'What needs to shift to create space...',
    },

    // 8D. Creating Space
    {
      id: 'q1-no',
      text: "What's one thing you will say NO to in Q1 to create space for what you do want?",
      type: 'textarea',
      section: '7) Ground',
      placeholder: 'A commitment, habit, or obligation to decline...',
      required: true,
    },
    {
      id: 'q1-dont-do-list',
      text: "What are 2-3 aspirations from your list that you'll put on your \"Don't Do\" list for Q1?\n\nThings that matter, but that you're giving yourself permission to pick up later.",
      type: 'textarea',
      section: '7) Ground',
      placeholder:
        'This is not about abandoning aspirations - it is about sequencing them.\n\n1. ...\n2. ...\n3. ...',
    },

    // 8E. Defining Success
    {
      id: 'q1-success',
      text: 'For your 2-3 Q1 priorities: What would "done" or "success" look like?\n\nHow would you know you made meaningful progress?',
      type: 'textarea',
      section: '7) Ground',
      placeholder: 'Define what success looks like for each priority...',
      henryNote: "In the past, I've set moving goal posts that prevented me from scoring. The remedy that works for me is painting success before starting.",
      required: true,
    },
    {
      id: 'q1-activation-energy',
      text: 'For each priority, is this something net new or building on existing momentum?',
      henryNote: "I added this question after observing that I disproportionately failed on net new projects vs. maintenance or close out projects. Now I think about my resource allocation differently for activation energy.",
      subhead:
        'Establishing new patterns requires extra focus and energy. Set yourself up for success by being realistic about what you\'ll need to succeed.',
      type: 'textarea',
      section: '7) Ground',
      placeholder:
        'New initiatives require more activation energy than continuing something already in motion. One brand-new initiative plus one or two "continuing" priorities is often the right balance.',
    },

    // ========================================
    // SECTION 9: COMMITMENT
    // ========================================

    // 9A. Intro (in section text)

    // 9B. Letter to Future Self
    {
      id: 'letter-to-future-self',
      text: "Write a letter to yourself one year from now.\n\nWhat do you hope you'll be able to say when you read this? What do you want to remind yourself of? What commitments are you making to yourself?",
      type: 'textarea',
      section: '8) Commit',
      placeholder:
        'Dear Future Me,\n\nThis time next year, I hope you...\n\nI want you to remember that...\n\nI am committing to...\n\nDo not forget...\n\nWith love,\n[Present You]',
      henryNote:
        "Testing this one in the flow for this year. I've done this in classes + 10Q in the past and I love the time capsule feel.",
      required: true,
    },

    // 9C. First Step
    {
      id: 'first-step',
      text: 'What is ONE action you can take in the next 48 hours to begin living into your intentions?\n\nSomething small but concrete that creates momentum.',
      type: 'textarea',
      section: '8) Commit',
      placeholder: 'One specific action to take in the next 48 hours...',
      required: true,
    },

    // 9D. The Witness
    {
      id: 'witness',
      text: 'Some people publish their reviews online. Others share with their closest friends and loved ones.\n\nIs there anyone you want to share aspects of this review - or your 2026 aspirations - with?',
      type: 'textarea',
      section: '8) Commit',
      placeholder: 'Who might you share this with?',
      henryNote: 'Some people share the super cool site some handsome cat built for other people to do their annual reviews. I love sharing the love!',
    },

    // 9E. Final Reflection
    {
      id: 'final-discovery',
      text: 'What did you discover that you didn\'t expect?',
      type: 'textarea',
      section: '8) Commit',
      placeholder: 'Surprises, insights, or realizations from this process...',
    },
    {
      id: 'final-missing-question',
      text: 'What is one question you wished we asked - or you answered - that wasn\'t included in this review?',
      type: 'textarea',
      section: '8) Commit',
      placeholder: 'A question that would have made this review more complete for you...',
    },
  ],
}
