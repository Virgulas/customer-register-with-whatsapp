import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Alert } from 'react-bootstrap';
import '../styles/birthTable.css';

const DarkThemeBirthdayTable = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [alert, setAlert] = useState('');

    useEffect(() => {
        const fetchUsersWithBirthdayToday = async () => {
            try {
                const response = await fetch('http://localhost:5000/users-birthday-today');
                const data = await response.json();
                setUsers(data.users || []);
            } catch (error) {
                console.error("Error fetching users with today's birthday:", error);
            }
        };

        fetchUsersWithBirthdayToday();
    }, []);

    const handleSendMessages = async () => {
        if (!message) {
            return;
        }

        for (const user of users) {
            try {
                const response = await fetch('http://localhost:5000/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ number: user.id, message }),
                });

                const data = await response.json();
                if (!data.success) {
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
            <h2 className="text-center text-light">Aniversariantes do dia</h2>
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
                        <th>Aniversário</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id.split("@c.us")}</td>
                                <td>{user.name}</td>
                                <td>{user.birthday}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">Nenhum aniversariante hoje</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default DarkThemeBirthdayTable;
