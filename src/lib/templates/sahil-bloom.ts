import { ReviewTemplate } from './types'

export const sahilBloomTemplate: ReviewTemplate = {
  slug: 'sahil-bloom-annual-review',
  name: "Sahil Bloom's Personal Annual Review",
  year: 2025,
  creator: {
    name: 'Sahil Bloom',
    title: 'Writer & Entrepreneur',
    bio: 'A structured 7-question framework for deep reflection on your year, focused on energy, fear, and growth.',
    websiteUrl: 'https://sahilbloom.com',
  },
  intro: {
    headline: 'The Personal Annual Review',
    description:
      'Seven powerful questions to help you reflect on what changed, what energized you, what held you back, and what you learned. Give yourself space to think deeply.',
    estimatedMinutes: 45,
  },
  questions: [
    // QUESTION 1: Changed Mind
    {
      id: 'changed-mind-professional',
      text: 'What did you change your mind on this year? (Professional)',
      type: 'textarea',
      section: 'Question 1: Changed Mind',
      placeholder: 'Think about beliefs, strategies, or approaches you reconsidered...',
      helpText:
        'Changing your mind is a sign of growth. What professional assumptions did you update?',
      required: true,
    },
    {
      id: 'changed-mind-personal',
      text: 'What did you change your mind on this year? (Personal)',
      type: 'textarea',
      section: 'Question 1: Changed Mind',
      placeholder: 'Relationships, lifestyle, values, priorities...',
      helpText: 'What personal beliefs or approaches did you reconsider?',
      required: true,
    },

    // QUESTION 2: Created Energy
    {
      id: 'created-energy-professional',
      text: 'What created energy this year? (Professional)',
      type: 'textarea',
      section: 'Question 2: Created Energy',
      placeholder: 'Projects, tasks, achievements that lit you up...',
      helpText: 'What professional activities left you feeling energized and alive?',
      required: true,
    },
    {
      id: 'created-energy-personal',
      text: 'What created energy this year? (Personal)',
      type: 'textarea',
      section: 'Question 2: Created Energy',
      placeholder: 'Hobbies, experiences, routines that energized you...',
      helpText: 'What personal activities gave you energy?',
      required: true,
    },
    {
      id: 'created-energy-people',
      text: 'What created energy this year? (People)',
      type: 'textarea',
      section: 'Question 2: Created Energy',
      placeholder: 'Relationships and interactions that lifted you up...',
      helpText: 'Which people left you feeling energized after spending time with them?',
      required: true,
    },

    // QUESTION 3: Drained Energy
    {
      id: 'drained-energy-professional',
      text: 'What drained energy this year? (Professional)',
      type: 'textarea',
      section: 'Question 3: Drained Energy',
      placeholder: 'Tasks, projects, situations that depleted you...',
      helpText: 'What professional activities consistently left you feeling drained?',
      required: true,
    },
    {
      id: 'drained-energy-personal',
      text: 'What drained energy this year? (Personal)',
      type: 'textarea',
      section: 'Question 3: Drained Energy',
      placeholder: 'Habits, obligations, routines that depleted you...',
      helpText: 'What personal activities took more than they gave?',
      required: true,
    },
    {
      id: 'drained-energy-people',
      text: 'What drained energy this year? (People)',
      type: 'textarea',
      section: 'Question 3: Drained Energy',
      placeholder: 'Relationships or interactions that left you depleted...',
      helpText: 'Which people consistently drained your energy?',
      required: true,
    },

    // QUESTION 4: Boat Anchors
    {
      id: 'boat-anchors-professional',
      text: 'What were the boat anchors in your life? (Professional)',
      type: 'textarea',
      section: 'Question 4: Boat Anchors',
      placeholder: 'What professional commitments held you back from sailing faster?',
      helpText:
        'Boat anchors are things that slow your progress. What professional weights are you dragging?',
      required: true,
    },
    {
      id: 'boat-anchors-personal',
      text: 'What were the boat anchors in your life? (Personal)',
      type: 'textarea',
      section: 'Question 4: Boat Anchors',
      placeholder: 'What personal commitments or habits held you back?',
      helpText: 'What personal weights are slowing your progress?',
      required: true,
    },
    {
      id: 'boat-anchors-people',
      text: 'What were the boat anchors in your life? (People)',
      type: 'textarea',
      section: 'Question 4: Boat Anchors',
      placeholder: 'What relationships held you back from growth?',
      helpText: 'Which relationships were weighing you down?',
      required: true,
    },

    // QUESTION 5: Fear
    {
      id: 'fear-1',
      text: 'What did you not do because of fear? (Fear #1)',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'Describe something you avoided due to fear...',
      helpText: 'Be honest about what you let fear stop you from doing.',
      required: true,
    },
    {
      id: 'fear-1-downsides',
      text: 'What were the realistic downsides of that fear?',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'What was the worst that could have realistically happened?',
      helpText: 'Often our fears are exaggerated. What was the actual risk?',
    },
    {
      id: 'fear-1-upsides',
      text: 'What were the realistic upsides if you had acted?',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'What might you have gained?',
      helpText: 'What opportunities did fear cost you?',
    },
    {
      id: 'fear-2',
      text: 'What did you not do because of fear? (Fear #2)',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'Describe another thing you avoided due to fear...',
    },
    {
      id: 'fear-2-downsides',
      text: 'What were the realistic downsides of that fear?',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'What was the worst that could have realistically happened?',
    },
    {
      id: 'fear-2-upsides',
      text: 'What were the realistic upsides if you had acted?',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'What might you have gained?',
    },
    {
      id: 'fear-3',
      text: 'What did you not do because of fear? (Fear #3)',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'Describe another thing you avoided due to fear...',
    },
    {
      id: 'fear-3-downsides',
      text: 'What were the realistic downsides of that fear?',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'What was the worst that could have realistically happened?',
    },
    {
      id: 'fear-3-upsides',
      text: 'What were the realistic upsides if you had acted?',
      type: 'textarea',
      section: 'Question 5: Fear',
      placeholder: 'What might you have gained?',
    },

    // QUESTION 6: Greatest Hits & Worst Misses
    {
      id: 'greatest-hits',
      text: 'What were your greatest hits this year?',
      type: 'textarea',
      section: 'Question 6: Greatest Hits & Worst Misses',
      placeholder: 'List your biggest wins, achievements, and proud moments...',
      helpText: 'What accomplishments stand out when you look back?',
      required: true,
    },
    {
      id: 'greatest-hits-reflect',
      text: 'Reflecting on your greatest hits: What patterns do you notice?',
      type: 'textarea',
      section: 'Question 6: Greatest Hits & Worst Misses',
      placeholder: 'What do your wins have in common?',
      helpText: 'Understanding patterns helps you replicate success.',
    },
    {
      id: 'worst-misses',
      text: 'What were your worst misses this year?',
      type: 'textarea',
      section: 'Question 6: Greatest Hits & Worst Misses',
      placeholder: 'List your biggest failures, mistakes, and disappointments...',
      helpText: 'Be honest about what didn\'t go well.',
      required: true,
    },
    {
      id: 'worst-misses-reflect',
      text: 'Reflecting on your worst misses: What patterns do you notice?',
      type: 'textarea',
      section: 'Question 6: Greatest Hits & Worst Misses',
      placeholder: 'What do your misses have in common?',
      helpText: 'Understanding patterns helps you avoid repeating mistakes.',
    },

    // QUESTION 7: Lessons Learned
    {
      id: 'lessons-learned',
      text: 'What did you learn this year?',
      type: 'textarea',
      section: 'Question 7: Lessons Learned',
      placeholder:
        'Capture the most important lessons from your experiences...',
      helpText:
        'What insights will you carry forward? What wisdom did this year teach you?',
      required: true,
    },
    {
      id: 'lessons-apply',
      text: 'How will you apply these lessons going forward?',
      type: 'textarea',
      section: 'Question 7: Lessons Learned',
      placeholder: 'How will these lessons shape your decisions and actions?',
      helpText: 'Lessons are only valuable if you act on them.',
      required: true,
    },
  ],
}
