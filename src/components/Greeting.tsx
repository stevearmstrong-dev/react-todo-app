import React, { useState, useEffect } from 'react';
import { getRandomQuote } from '../data/navalQuotes';

interface GreetingProps {
  userName?: string;
}

function Greeting({ userName }: GreetingProps) {
  const [greeting, setGreeting] = useState<string>('');
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    const updateGreeting = (): void => {
      const hour = new Date().getHours();
      let greetingText = '';

      if (hour >= 5 && hour < 12) {
        greetingText = 'Good Morning';
      } else if (hour >= 12 && hour < 17) {
        greetingText = 'Good Afternoon';
      } else if (hour >= 17 && hour < 22) {
        greetingText = 'Good Evening';
      } else {
        greetingText = 'Good Night';
      }

      setGreeting(greetingText);
    };

    updateGreeting();
    setQuote(getRandomQuote());

    // Update greeting every minute in case time period changes
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayName = userName || 'STEVE ARMSTRONG';

  return (
    <div className="greeting-section">
      <h1 className="greeting-text">
        {greeting}, {displayName}
      </h1>
      <p className="motivational-quote">{quote}</p>
    </div>
  );
}

export default Greeting;
