import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Alert } from 'react-bootstrap';
import '../styles/callToday.css';

const CallTodayTable = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [alert, setAlert] = useState('');

    useEffect(() => {
        const fetchUsersToCallToday = async () => {
            try {
                const response = await fetch('http://localhost:5000/users-to-call-today');
                const data = await response.json();
                setUsers(data.users || []);
            } catch (error) {
                console.error('Error fetching users to call today:', error);
            }
        };

        fetchUsersToCallToday();
    }, []);

    const handleSendMessages = async () => {
        if (!message) {
            return;
        }

        for (const user of users) {
            try {
                const messageResponse = await fetch('http://localhost:5000/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ number: user.id, message }),
                });

                const messageData = await messageResponse.json();
                if (messageData.success) {
                    // Update callDate for the user after a successful message send
                    await fetch(`http://localhost:5000/update-callDate/${user.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                } else {
                    console.error(`Failed to send message to ${user.name} (${user.id})`);
                }
            } catch (error) {
                console.error(`Error sending message to ${user.name} (${user.id}):`, error);
            }
        }
        setAlert('Mensagem enviada com sucesso!');
        setMessage(''); // Clear message input after sending
    };

    return (
        <div className="dark-theme-container">
            <h2 className="text-center text-light">Clientes para chamar hoje:</h2>
            {alert && <Alert variant="success">{alert}</Alert>}
            {/* Message Input */}
            <Form className="mb-3">
                <Form.Group controlId="messageInput">
                    <Form.Control
                        type="text"
                        placeholder="Digite a mensagem para enviar"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="dark-input"
                    />
                </Form.Group>
                <Button variant="secondary" onClick={handleSendMessages}>
                    Enviar mensagem para todos
                </Button>
            </Form>

            <Table bordered hover className="table-dark" style={{ color: '#f1f1f1' }}>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Nome</th>
                        <th>Data</th>
                        <th>Usa a cada</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id.split("@c.us")}</td>
                                <td>{user.name}</td>
                                <td>{user.callDate}</td>
                                <td>{user.period} dias</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">Nenhum cliente para chamar hoje</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default CallTodayTable;
