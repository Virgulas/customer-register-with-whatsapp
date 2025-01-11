import React, { useEffect, useState } from 'react';

function SendMessage() {
    const [status, setStatus] = useState('Disconnected');
    const [number, setNumber] = useState('');
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/status')
            .then(response => response.json())
            .then(data => setStatus(data.status));
    }, []);

    const handleSendMessage = async () => {
        try {
            const res = await fetch('http://localhost:5000/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ number, message }),
            });

            const data = await res.json();
            setResponse(data.message);
        } catch (error) {
            console.error('Error sending message:', error);
            setResponse('Failed to send message');
        }
    };

    return (
        <div className="App">
            <h1>WhatsApp Status: {status}</h1>
            <h1>Send WhatsApp Message</h1>
            <input
                type="text"
                placeholder="Recipient's Number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
            />
            <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button onClick={handleSendMessage}>Send Message</button>
            <p>{response}</p>
        </div>
    );
}


export default SendMessage;
