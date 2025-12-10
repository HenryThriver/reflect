import { ReviewTemplate } from './types'

export const henryTemplate: ReviewTemplate = {
  slug: 'henry-finkelstein',
  name: "Henry's Quick Review",
  creator: {
    name: 'Henry A Finkelstein',
    title: 'Builder & Thinker',
    bio: 'A simple 3-question reflection to test the waters.',
  },
  intro: {
    headline: 'Quick Reflection',
    description:
      'Three simple questions to get you started. Perfect for testing or a quick check-in.',
    estimatedMinutes: 5,
  },
  questions: [
    {
      id: 'favorite-win',
      text: "What's your favorite win from this year?",
      type: 'textarea',
      placeholder: 'Think about a moment that made you proud...',
      helpText: 'Big or small, what accomplishment stands out?',
      required: true,
    },
    {
      id: 'favorite-lesson',
      text: "What's the most valuable lesson you learned?",
      type: 'textarea',
      placeholder: 'A challenge that taught you something...',
      helpText: 'Growth often comes from difficulty.',
      required: true,
    },
    {
      id: 'favorite-hope',
      text: "What are you most excited about for next year?",
      type: 'textarea',
      placeholder: 'Looking ahead, what energizes you?',
      helpText: 'Dreams, goals, or simple pleasures.',
      required: true,
    },
  ],
}
