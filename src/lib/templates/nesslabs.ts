import { ReviewTemplate } from './types'

export const nesslabsTemplate: ReviewTemplate = {
  slug: 'nesslabs-annual-review',
  name: 'Ness Labs Annual Review',
  creator: {
    name: 'Anne-Laure Le Cunff',
    title: 'Founder of Ness Labs',
    bio: 'A structured, category-based approach to annual reflection covering all major life areas.',
    websiteUrl: 'https://nesslabs.com',
  },
  intro: {
    headline: 'A Mindful Annual Review',
    description: 'This worksheet guides you through 9 key life categories, helping you reflect on what went well, what didn\'t, and what to focus on next year. Take time with each category.',
    estimatedMinutes: 45,
  },
  questions: [
    // CATEGORY 1: HEALTH & FITNESS
    {
      id: 'health-went-well',
      text: 'Health & Fitness: What went well this year?',
      type: 'textarea',
      section: 'Health & Fitness',
      placeholder: 'Exercise habits, nutrition, sleep, energy levels, medical care...',
      required: true,
    },
    {
      id: 'health-didnt-work',
      text: 'Health & Fitness: What didn\'t go so well?',
      type: 'textarea',
      section: 'Health & Fitness',
      placeholder: 'Challenges, setbacks, areas that need attention...',
    },
    {
      id: 'health-focus',
      text: 'Health & Fitness: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Health & Fitness',
      placeholder: 'Goals, habits, changes you want to make...',
    },

    // CATEGORY 2: WORK & BUSINESS
    {
      id: 'work-went-well',
      text: 'Work & Business: What went well this year?',
      type: 'textarea',
      section: 'Work & Business',
      placeholder: 'Projects completed, promotions, new skills, income growth...',
      required: true,
    },
    {
      id: 'work-didnt-work',
      text: 'Work & Business: What didn\'t go so well?',
      type: 'textarea',
      section: 'Work & Business',
      placeholder: 'Failed projects, missed opportunities, challenges...',
    },
    {
      id: 'work-focus',
      text: 'Work & Business: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Work & Business',
      placeholder: 'Career goals, skill development, business objectives...',
    },

    // CATEGORY 3: PERSONAL LIFE & FAMILY
    {
      id: 'family-went-well',
      text: 'Personal Life & Family: What went well this year?',
      type: 'textarea',
      section: 'Personal Life & Family',
      placeholder: 'Quality time, milestones, relationship improvements...',
      required: true,
    },
    {
      id: 'family-didnt-work',
      text: 'Personal Life & Family: What didn\'t go so well?',
      type: 'textarea',
      section: 'Personal Life & Family',
      placeholder: 'Conflicts, neglected relationships, challenges...',
    },
    {
      id: 'family-focus',
      text: 'Personal Life & Family: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Personal Life & Family',
      placeholder: 'Ways to strengthen bonds, time priorities...',
    },

    // CATEGORY 4: FRIENDS & COMMUNITY
    {
      id: 'friends-went-well',
      text: 'Friends & Community: What went well this year?',
      type: 'textarea',
      section: 'Friends & Community',
      placeholder: 'New friendships, deepened connections, community involvement...',
      required: true,
    },
    {
      id: 'friends-didnt-work',
      text: 'Friends & Community: What didn\'t go so well?',
      type: 'textarea',
      section: 'Friends & Community',
      placeholder: 'Lost touch with people, isolation, conflicts...',
    },
    {
      id: 'friends-focus',
      text: 'Friends & Community: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Friends & Community',
      placeholder: 'Relationships to nurture, new connections to make...',
    },

    // CATEGORY 5: LEARNING & KNOWLEDGE
    {
      id: 'learning-went-well',
      text: 'Learning & Knowledge: What went well this year?',
      type: 'textarea',
      section: 'Learning & Knowledge',
      placeholder: 'Courses completed, books read, new skills acquired...',
      required: true,
    },
    {
      id: 'learning-didnt-work',
      text: 'Learning & Knowledge: What didn\'t go so well?',
      type: 'textarea',
      section: 'Learning & Knowledge',
      placeholder: 'Abandoned courses, unread books, neglected areas...',
    },
    {
      id: 'learning-focus',
      text: 'Learning & Knowledge: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Learning & Knowledge',
      placeholder: 'Skills to develop, topics to explore, learning goals...',
    },

    // CATEGORY 6: TRAVEL & CULTURE
    {
      id: 'travel-went-well',
      text: 'Travel & Culture: What went well this year?',
      type: 'textarea',
      section: 'Travel & Culture',
      placeholder: 'Trips taken, new places explored, cultural experiences...',
      required: true,
    },
    {
      id: 'travel-didnt-work',
      text: 'Travel & Culture: What didn\'t go so well?',
      type: 'textarea',
      section: 'Travel & Culture',
      placeholder: 'Cancelled trips, missed opportunities, regrets...',
    },
    {
      id: 'travel-focus',
      text: 'Travel & Culture: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Travel & Culture',
      placeholder: 'Places to visit, experiences to have...',
    },

    // CATEGORY 7: HOBBIES & CREATIVITY
    {
      id: 'hobbies-went-well',
      text: 'Hobbies & Creativity: What went well this year?',
      type: 'textarea',
      section: 'Hobbies & Creativity',
      placeholder: 'Creative projects, hobbies enjoyed, artistic expression...',
      required: true,
    },
    {
      id: 'hobbies-didnt-work',
      text: 'Hobbies & Creativity: What didn\'t go so well?',
      type: 'textarea',
      section: 'Hobbies & Creativity',
      placeholder: 'Neglected interests, abandoned projects...',
    },
    {
      id: 'hobbies-focus',
      text: 'Hobbies & Creativity: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Hobbies & Creativity',
      placeholder: 'Creative pursuits, hobbies to pick up or continue...',
    },

    // CATEGORY 8: EMOTIONS & SPIRITUALITY
    {
      id: 'emotions-went-well',
      text: 'Emotions & Spirituality: What went well this year?',
      type: 'textarea',
      section: 'Emotions & Spirituality',
      placeholder: 'Mental health, mindfulness practice, spiritual growth, emotional processing...',
      required: true,
    },
    {
      id: 'emotions-didnt-work',
      text: 'Emotions & Spirituality: What didn\'t go so well?',
      type: 'textarea',
      section: 'Emotions & Spirituality',
      placeholder: 'Struggles, neglected practices, emotional challenges...',
    },
    {
      id: 'emotions-focus',
      text: 'Emotions & Spirituality: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Emotions & Spirituality',
      placeholder: 'Mental health goals, spiritual practices, emotional growth...',
    },

    // CATEGORY 9: MONEY & FINANCES
    {
      id: 'money-went-well',
      text: 'Money & Finances: What went well this year?',
      type: 'textarea',
      section: 'Money & Finances',
      placeholder: 'Savings, investments, income, financial decisions...',
      required: true,
    },
    {
      id: 'money-didnt-work',
      text: 'Money & Finances: What didn\'t go so well?',
      type: 'textarea',
      section: 'Money & Finances',
      placeholder: 'Overspending, missed goals, financial stress...',
    },
    {
      id: 'money-focus',
      text: 'Money & Finances: What do you want to focus on next year?',
      type: 'textarea',
      section: 'Money & Finances',
      placeholder: 'Financial goals, budgeting, investments...',
    },

    // SUMMARY
    {
      id: 'proudest-accomplishments',
      text: 'Looking across all categories, what are your proudest accomplishments this year?',
      type: 'textarea',
      section: 'Summary',
      placeholder: 'Your top achievements across all areas of life...',
      required: true,
    },
    {
      id: 'biggest-challenges',
      text: 'What were your biggest challenges this year?',
      type: 'textarea',
      section: 'Summary',
      placeholder: 'The hardest things you faced...',
      required: true,
    },
    {
      id: 'main-aspirations',
      text: 'What are your main aspirations for next year?',
      type: 'textarea',
      section: 'Summary',
      placeholder: 'Your top goals and dreams for the coming year...',
      required: true,
    },
    {
      id: 'one-word',
      text: 'Summarize your intentions for next year in one word.',
      type: 'text',
      section: 'Summary',
      placeholder: 'One word to guide you...',
      required: true,
    },
    {
      id: 'commitment',
      text: 'Write a commitment to yourself for the year ahead.',
      type: 'textarea',
      section: 'Summary',
      placeholder: 'I commit to...',
    },
  ],
}
