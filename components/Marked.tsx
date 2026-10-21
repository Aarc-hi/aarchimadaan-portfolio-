import React from 'react';

// Important words in blue. Wrap them in **double asterisks**:
//   <Marked text="A **wearable** that spots slouching" />
const MARK: React.CSSProperties = {
  backgroundColor: 'transparent', // <mark> is yellow by default
  color: '#2A52BE',               // the site's blue
};

export const Marked: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split('**').map((part, i) => (i % 2 === 1 ? <mark key={i} style={MARK}>{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>))}
  </>
);
