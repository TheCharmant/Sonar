import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Compose: React.FC = () => {
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your email sending logic here
    
    // Navigate back to sentbox after sending
    navigate('/sentbox');
  };

  return (
    <div className="compose-container">
      <h2>Compose New Message</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient">To:</label>
          <input
            type="email"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={10}
          />
        </div>
        
        <div className="button-group">
          <button type="submit">Send</button>
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Compose;