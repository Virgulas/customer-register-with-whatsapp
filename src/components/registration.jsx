import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import '../styles/registration.css';
const DateHelper = require('../date/dateHelper');

const RegistrationPage = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [period, setPeriod] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validatedBirthday = DateHelper.validate(birthday);
    if (!validatedBirthday) {
      setError('Formato do aniversário inválido. Por favor use o formato dia/mês.');
      return;
    }

    const callDate = DateHelper.sum(DateHelper.getCurrent(), parseInt(period, 10));
    const formattedId = `55${id}@c.us`;

    try {
      const response = await fetch('http://localhost:5000/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: formattedId,
          name: name,
          birthday: validatedBirthday,
          period: parseInt(period, 10),
          callDate: callDate
        })
      });

      if (response.ok) {
        setMessage('Usuário criado com sucesso!.');
        setId('');
        setName('');
        setBirthday('');
        setPeriod('');
      } else {
        setError('Operação falhou.');
      }
    } catch (err) {
      console.error('Error creating or updating user:', err);
      setError('Um erro correu, por favor, tente novamente..');
    }
  };

  return (
    <div className="registration-page dark-theme">
      <h2>Registro de Clientes</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formId">
          <Form.Label>Número (DD + 8 digitos)</Form.Label>
          <Form.Control
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Digite o número (DD + 8 Digitos)"
            required
            maxLength="10"
            minLength="10"
            pattern="\d{10}"
          />
        </Form.Group>

        <Form.Group controlId="formName">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome"
            required
          />
        </Form.Group>

        <Form.Group controlId="formBirthday">
          <Form.Label>Aniversário (Dia/Mês)</Form.Label>
          <Form.Control
            type="text"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            placeholder="Digite o aniversário (dia/mês)"
            required
          />
        </Form.Group>

        <Form.Group controlId="formPeriod">
          <Form.Label>Período de uso (Em dias)</Form.Label>
          <Form.Control
            type="number"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Digite o período de uso"
            required
            min="0"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Registrar usuário
        </Button>
      </Form>
    </div>
  );
};

export default RegistrationPage;
