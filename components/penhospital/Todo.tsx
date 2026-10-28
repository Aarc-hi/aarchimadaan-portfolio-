import React from 'react';

// A note to myself on the page: something the section still needs. Remove the <Todo> once the text is in.
export const Todo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-sans text-lg leading-relaxed border border-dashed border-cobalt/50 text-cobalt px-5 py-4 my-6">
    <span className="font-sans text-[11px] tracking-wide mr-3">TO ADD</span>{children}
  </p>
);
