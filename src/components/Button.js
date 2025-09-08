import React from 'react';

const Button = ({ text, imageSrc, style, onClick }) => (
  <div className="button-container" style={style}>
    <button className="circle-button" onClick={onClick}>
      {imageSrc && <img src={imageSrc} alt={text} className="button-image" />}
      <span className="button-text">{text}</span>
    </button>
  </div>
);

export default React.memo(Button);