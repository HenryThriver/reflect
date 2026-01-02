import { ReviewTemplate } from './types'

export const tkKaderTemplate: ReviewTemplate = {
  slug: 'tk-kader-life-planning',
  name: "TK Kader's 5-Step Life Planning Guide",
  year: 2025,
  creator: {
    name: 'TK Kader',
    title: 'Founder of Unstoppable',
    bio: 'A structured 5-step framework for checking in on your life, setting meaningful goals, and creating an action plan.',
    websiteUrl: 'https://www.unstoppable.do',
  },
  intro: {
    headline: 'Unstoppable Life Planning',
    description:
      'Five steps to check in with yourself, set goals across all life areas, identify what\'s holding you back, and create a plan for an unstoppable year ahead.',
    estimatedMinutes: 60,
  },
  questions: [
    // STEP 1: CHECK IN
    {
      id: 'gratitude',
      text: 'What are you most grateful for right now?',
      type: 'textarea',
      section: 'Step 1: Check In',
      placeholder: 'List the things, people, and experiences you\'re thankful for...',
      helpText: 'Starting with gratitude sets the right tone for reflection.',
      required: true,
    },
    {
      id: 'stress-sources',
      text: 'What is causing you the most stress right now?',
      type: 'textarea',
      section: 'Step 1: Check In',
      placeholder: 'Be honest about what\'s weighing on you...',
      helpText: 'Naming your stressors is the first step to addressing them.',
      required: true,
    },
    {
      id: 'accomplishments',
      text: 'What have you accomplished recently that you\'re proud of?',
      type: 'textarea',
      section: 'Step 1: Check In',
      placeholder: 'Big or small wins from the past year...',
      helpText: 'Acknowledge your progress and achievements.',
      required: true,
    },
    {
      id: 'weakness-to-improve',
      text: 'What weakness do you most want to improve?',
      type: 'textarea',
      section: 'Step 1: Check In',
      placeholder: 'An area where you know you could be better...',
      helpText: 'Self-awareness about weaknesses enables growth.',
      required: true,
    },
    {
      id: 'habits-assessment',
      text: 'What habits are serving you well? What habits are holding you back?',
      type: 'textarea',
      section: 'Step 1: Check In',
      placeholder: 'Positive habits to keep:\n\nHabits to change or eliminate:',
      helpText: 'Your habits shape your outcomes.',
      required: true,
    },

    // STEP 2: 5 GOALS
    // Health
    {
      id: 'goal-health',
      text: 'HEALTH: What is your health goal for the coming year?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Describe your health and wellness goal...',
      helpText: 'Physical health, mental health, energy, fitness, nutrition.',
      required: true,
    },
    {
      id: 'goal-health-quantify',
      text: 'How will you quantify this health goal?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Make it measurable... (e.g., weight, workouts per week, etc.)',
      helpText: 'Specific numbers make goals trackable.',
    },
    {
      id: 'goal-health-feeling',
      text: 'How will achieving this health goal make you feel?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Connect to the emotion behind the goal...',
      helpText: 'Emotional connection increases motivation.',
    },

    // Wealth
    {
      id: 'goal-wealth',
      text: 'WEALTH: What is your wealth/career goal for the coming year?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Describe your financial or career goal...',
      helpText: 'Income, savings, career advancement, business growth.',
      required: true,
    },
    {
      id: 'goal-wealth-quantify',
      text: 'How will you quantify this wealth goal?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Make it measurable... (e.g., income target, savings amount)',
      helpText: 'Specific numbers make goals trackable.',
    },
    {
      id: 'goal-wealth-feeling',
      text: 'How will achieving this wealth goal make you feel?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Connect to the emotion behind the goal...',
      helpText: 'Emotional connection increases motivation.',
    },

    // Relationships
    {
      id: 'goal-relationships',
      text: 'RELATIONSHIPS: What is your relationships goal for the coming year?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Describe your goal for relationships...',
      helpText: 'Family, friendships, romantic relationships, community.',
      required: true,
    },
    {
      id: 'goal-relationships-quantify',
      text: 'How will you quantify this relationships goal?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Make it measurable... (e.g., date nights per month, calls with friends)',
      helpText: 'Specific commitments make relationships intentional.',
    },
    {
      id: 'goal-relationships-feeling',
      text: 'How will achieving this relationships goal make you feel?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Connect to the emotion behind the goal...',
      helpText: 'Emotional connection increases motivation.',
    },

    // Giving Back
    {
      id: 'goal-giving',
      text: 'GIVING BACK: What is your giving/contribution goal for the coming year?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Describe how you want to give back...',
      helpText: 'Charity, volunteering, mentoring, community service.',
      required: true,
    },
    {
      id: 'goal-giving-quantify',
      text: 'How will you quantify this giving goal?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Make it measurable... (e.g., hours volunteered, amount donated)',
      helpText: 'Specific commitments ensure follow-through.',
    },
    {
      id: 'goal-giving-feeling',
      text: 'How will achieving this giving goal make you feel?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Connect to the emotion behind the goal...',
      helpText: 'Emotional connection increases motivation.',
    },

    // Self Improvement
    {
      id: 'goal-self-improvement',
      text: 'SELF IMPROVEMENT: What is your personal growth goal for the coming year?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Describe how you want to grow...',
      helpText: 'Learning, skills, mindset, spiritual growth.',
      required: true,
    },
    {
      id: 'goal-self-improvement-quantify',
      text: 'How will you quantify this self-improvement goal?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Make it measurable... (e.g., books read, courses completed)',
      helpText: 'Specific commitments drive growth.',
    },
    {
      id: 'goal-self-improvement-feeling',
      text: 'How will achieving this self-improvement goal make you feel?',
      type: 'textarea',
      section: 'Step 2: Set Your 5 Goals',
      placeholder: 'Connect to the emotion behind the goal...',
      helpText: 'Emotional connection increases motivation.',
    },

    // STEP 3: HOW TO GET HELP
    {
      id: 'never-done-before',
      text: 'To achieve your goals, what have you never done before that you need to do?',
      type: 'textarea',
      section: 'Step 3: How to Get Help',
      placeholder: 'List new actions, skills, or approaches you\'ll need...',
      helpText: 'New results require new actions.',
      required: true,
    },
    {
      id: 'who-has-done-it',
      text: 'Who has already achieved what you want? How can they help you?',
      type: 'textarea',
      section: 'Step 3: How to Get Help',
      placeholder: 'Identify mentors, role models, or resources...',
      helpText: 'Learn from those who\'ve walked the path.',
      required: true,
    },
    {
      id: 'counteract-weakness',
      text: 'How will you counteract your weaknesses to achieve your goals?',
      type: 'textarea',
      section: 'Step 3: How to Get Help',
      placeholder: 'Strategies to overcome your limitations...',
      helpText: 'Awareness without action doesn\'t create change.',
      required: true,
    },

    // STEP 4: WHAT'S HOLDING/PROPELLING
    {
      id: 'holding-back',
      text: 'What is holding you back from achieving your goals?',
      type: 'textarea',
      section: 'Step 4: What\'s Holding You Back & Propelling You Forward',
      placeholder: 'Fears, limiting beliefs, obstacles, circumstances...',
      helpText: 'Name the barriers so you can address them.',
      required: true,
    },
    {
      id: 'propelling-forward',
      text: 'What is propelling you forward toward your goals?',
      type: 'textarea',
      section: 'Step 4: What\'s Holding You Back & Propelling You Forward',
      placeholder: 'Motivations, support systems, strengths...',
      helpText: 'Identify what\'s already working in your favor.',
      required: true,
    },
    {
      id: 'going-to-propel',
      text: 'What will you add to propel yourself even further?',
      type: 'textarea',
      section: 'Step 4: What\'s Holding You Back & Propelling You Forward',
      placeholder: 'New habits, systems, relationships, or resources...',
      helpText: 'Be intentional about creating momentum.',
      required: true,
    },

    // STEP 5: SCHEDULE
    {
      id: 'daily-schedule',
      text: 'What will your ideal daily schedule look like to achieve your goals?',
      type: 'textarea',
      section: 'Step 5: Create Your Schedule',
      placeholder: 'Morning routine, work blocks, evening habits...',
      helpText: 'Goals are achieved through daily actions.',
      required: true,
    },
    {
      id: 'weekly-schedule',
      text: 'What will your ideal weekly schedule look like?',
      type: 'textarea',
      section: 'Step 5: Create Your Schedule',
      placeholder: 'How will you structure your week to support your goals?',
      helpText: 'Weekly rhythms create sustainable progress.',
    },
    {
      id: 'monthly-checkpoints',
      text: 'What monthly checkpoints will you set to review progress?',
      type: 'textarea',
      section: 'Step 5: Create Your Schedule',
      placeholder: 'When and how will you review your progress?',
      helpText: 'Regular reviews keep you on track.',
    },

    // BONUS: Letter to Yourself
    {
      id: 'letter-to-self',
      text: 'Write a letter to your future self at the end of next year.',
      type: 'textarea',
      section: 'Bonus: Letter to Yourself',
      placeholder:
        'Dear Future Me,\n\nThis time next year, I hope you have...\n\nI want you to remember that...\n\nI\'m committing to...',
      helpText:
        'Imagine reading this letter in one year. What do you want to tell yourself?',
      required: true,
    },
  ],
}
