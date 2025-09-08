import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! This is the HRD Chat Bot. How may I help you today?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    setMessages(prev => [...prev, { text: inputText, isBot: false }]);
    
    const response = generateResponse(inputText.toLowerCase());
    setTimeout(() => {
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 500);

    setInputText('');
  };

  const generateResponse = (input) => {
    if (input.includes('request') || input.includes('form')) {
      return "You can find request forms under the 'Forms' section in the main menu. Need more specific guidance?";
    }
    if (input.includes('help') || input.includes('support')) {
      return "Our support team is available 24/7. You can reach them through the 'Support' tab or call 1-800-XXX-XXXX.";
    }
    if (input.includes('salary') || input.includes('salary concerns')) {
      return "If you're looking for the Salary Concerns/Issues you can proceed on the Payroll and Compensation Inquiries > Salary Concerns";
    }
    if (input.includes('overtime') || input.includes('overtime calculations')) {
      return "If you're looking for the Overtime Calculations you can proceed on the Payroll and Compensation Inquiries > Overtime Calculations";
    }
    if (input.includes('payslip') || input.includes('payslip request')) {
      return "If you're looking for the Payslip Request you can proceed on the Payroll and Compensation Inquiries > Payslip Request";
    }
    if (input.includes('tax') || input.includes('tax deduction')) {
      return "If you're looking for the Tax related concerns you can proceed on the Payroll and Compensation Inquiries > Tax-Related Questions";
    }
    // Add more custom responses based on your needs
    return "This feature is still under development. Please stay tuned for updates. - IT Department";
  };

  return (
    <div className="chatbot-container">
      {/* Chat bot toggle button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '×' : 'Need Help?'}
      </button>

      {/* Chat interface */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>HRD CHAT BOT</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.isBot ? 'bot' : 'user'}`}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;