import React, { useEffect } from 'react';

interface CelebrationToastProps {
  quote: string;
  onClose: () => void;
  duration?: number;
}

function CelebrationToast({ quote, onClose, duration = 5000 }: CelebrationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="celebration-toast">
      <div className="celebration-content">
        <div className="celebration-icon">🎉</div>
        <div className="celebration-message">
          <h3 className="celebration-title">Task Completed!</h3>
          <blockquote className="celebration-quote">
            {quote}
          </blockquote>
          <div className="celebration-author">— Naval Ravikant</div>
        </div>
        <button className="celebration-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export default CelebrationToast;
