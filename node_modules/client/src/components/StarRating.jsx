import React, { useState } from 'react';

/**
 * StarRating component
 * @param {number} value - Selected rating (1 to 5)
 * @param {function} onRate - Callback when a star is clicked (enables interactive mode)
 * @param {boolean} readOnly - Disable hover/click interactions
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 */
export default function StarRating({ value = 0, onRate, readOnly = false, size = 'md' }) {
  const [hoverValue, setHoverValue] = useState(0);

  const isInteractive = !readOnly && typeof onRate === 'function';
  const displayValue = hoverValue > 0 ? hoverValue : value;

  const handleClick = (star) => {
    if (isInteractive) {
      onRate(star);
    }
  };

  const handleMouseEnter = (star) => {
    if (isInteractive) {
      setHoverValue(star);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverValue(0);
    }
  };

  return (
    <div
      className={`star-rating ${isInteractive ? 'interactive' : ''}`}
      onMouseLeave={handleMouseLeave}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(displayValue);
        return (
          <span
            key={star}
            className={`star ${isFilled ? 'filled' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            style={{
              fontSize: size === 'sm' ? '1.1rem' : size === 'lg' ? '2rem' : '1.4rem',
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
