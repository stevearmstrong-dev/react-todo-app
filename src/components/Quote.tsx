import React from 'react';

interface QuoteProps {
  text: string;
  variant?: 'default' | 'minimal' | 'highlighted';
}

function Quote({ text, variant = 'default' }: QuoteProps) {
  return (
    <div className={`naval-quote ${variant}`}>
      <div className="quote-icon">💡</div>
      <blockquote className="quote-text">
        {text}
      </blockquote>
      <div className="quote-author">— Naval Ravikant</div>
    </div>
  );
}

export default Quote;
