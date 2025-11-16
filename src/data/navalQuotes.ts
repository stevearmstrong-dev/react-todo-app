// Naval Ravikant quotes categorized by context

export interface Quote {
  text: string;
  category: 'productivity' | 'time' | 'completion' | 'focus' | 'wisdom';
}

export const navalQuotes: Quote[] = [
  // Productivity & Work
  {
    text: "Inspiration is perishable - act on it immediately.",
    category: 'productivity'
  },
  {
    text: "The most important trick to be happy is to realize happiness is a skill you develop and a choice you make.",
    category: 'productivity'
  },
  {
    text: "Specific knowledge is found by pursuing your genuine curiosity.",
    category: 'productivity'
  },
  {
    text: "Play iterated games. All the returns in life come from compound interest over many turns of the game.",
    category: 'productivity'
  },
  {
    text: "Clear thinker → Clear speaker → Clear writer.",
    category: 'productivity'
  },
  {
    text: "Earn with your mind, not your time.",
    category: 'productivity'
  },

  // Time Management
  {
    text: "You're not going to get rich renting out your time.",
    category: 'time'
  },
  {
    text: "Set and enforce an aspirational personal hourly rate.",
    category: 'time'
  },
  {
    text: "Ruthlessly decline meetings. Not trying to be rude, optimizing time.",
    category: 'time'
  },
  {
    text: "The direction you're heading in matters more than how fast you move.",
    category: 'time'
  },
  {
    text: "Impatience with actions, patience with results.",
    category: 'time'
  },
  {
    text: "If you can't decide, the answer is no.",
    category: 'time'
  },

  // Completion & Achievement
  {
    text: "All the benefits in life come from compound interest.",
    category: 'completion'
  },
  {
    text: "The best jobs are neither decreed nor degreed. They are creative expressions of continuous learners.",
    category: 'completion'
  },
  {
    text: "A calm mind, a fit body, a house full of love. These things cannot be bought - they must be earned.",
    category: 'completion'
  },
  {
    text: "The genuine love for reading itself is a superpower.",
    category: 'completion'
  },
  {
    text: "The modern devil is cheap dopamine.",
    category: 'completion'
  },
  {
    text: "Sophistication is removing the unnecessary.",
    category: 'completion'
  },

  // Focus & Deep Work
  {
    text: "Intentions don't matter. Actions do. That's why being ethical is hard.",
    category: 'focus'
  },
  {
    text: "The ability to singularly focus is related to the ability to lose yourself and be present.",
    category: 'focus'
  },
  {
    text: "Meditation is intermittent fasting for the mind.",
    category: 'focus'
  },
  {
    text: "A busy mind accelerates the passage of time. A calm mind slows it down.",
    category: 'focus'
  },
  {
    text: "It's only after you're bored that you have great ideas.",
    category: 'focus'
  },
  {
    text: "Doctors won't make you healthy. Nutritionists won't make you slim. Teachers won't make you smart. Gurus won't make you calm. Mentors won't make you rich. Trainers won't make you fit. Ultimately, you have to take responsibility.",
    category: 'focus'
  },

  // General Wisdom
  {
    text: "Seek wealth, not money or status. Wealth is assets that earn while you sleep.",
    category: 'wisdom'
  },
  {
    text: "Reading is faster than listening. Doing is faster than watching.",
    category: 'wisdom'
  },
  {
    text: "The three big ones in life are wealth, health, and happiness. We pursue them in that order, but their importance is reverse.",
    category: 'wisdom'
  },
  {
    text: "If you can't see yourself working with someone for life, don't work with them for a day.",
    category: 'wisdom'
  },
  {
    text: "Retirement is when you stop sacrificing today for an imaginary tomorrow.",
    category: 'wisdom'
  },
  {
    text: "The best relationships are peer relationships.",
    category: 'wisdom'
  },
  {
    text: "You make your own luck if you stay at it long enough.",
    category: 'wisdom'
  },
  {
    text: "Peace is happiness at rest. Happiness is peace in motion.",
    category: 'wisdom'
  },
  {
    text: "Easy choices, hard life. Hard choices, easy life.",
    category: 'wisdom'
  },
  {
    text: "The measure of wealth is freedom.",
    category: 'wisdom'
  }
];

// Get quote by category
export const getQuoteByCategory = (category: Quote['category']): string => {
  const categoryQuotes = navalQuotes.filter(q => q.category === category);
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex].text;
};

// Get daily quote (rotates based on day of year)
export const getDailyQuote = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % navalQuotes.length;
  return navalQuotes[index].text;
};

// Get random quote
export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * navalQuotes.length);
  return navalQuotes[randomIndex].text;
};
