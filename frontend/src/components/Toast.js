import React from 'react';

export default function Toast({ message, type }) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  return (
    <div className={`toast ${type}`}>
      <span style={{ marginRight: 8 }}>{icons[type] || icons.info}</span>
      {message}
    </div>
  );
}
