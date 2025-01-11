import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function Qrcode() {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState('Inicializando...');
    const [serverStatus, setServerStatus] = useState(null);
    const [isClientOn, setClientOn] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const checkWppConnection = async () => {
           try {
                const response = await fetch('http://localhost:5000/status');
                const data = await response.json();

                if (data.status === "connected") {
                setStatus("Conectado!")
                setClientOn(true);
                }
                else {
                setStatus("Inicializando...")
                setTimeout(checkWppConnection, 9000);
                }
           } catch (error) {
                console.error('Error connecting to the server:', error);
                setTimeout(checkWppConnection, 9000);
           }

        }
        const checkServerStatus = async () => {
            try {
              const response = await fetch('http://localhost:5000/status');
              const data = await response.json();

            if (data.connection) {
                const socketConnection = io('http://localhost:5000');
                setSocket(socketConnection);
                setServerStatus("connected")
                console.log('trying..');
    
            } else {
                console.log('Server not ready, retrying...');
                setTimeout(checkServerStatus, 1000); // Retry after 1 second
            }
            } catch (error) {
              console.error('Error connecting to the server:', error);
                setTimeout(checkServerStatus, 1000); // Retry after 1 second
            }
          };
        
        checkWppConnection();
        checkServerStatus();
   
    }, [status]);

    useEffect(() => {
        if (serverStatus === 'connected') {
            socket.on('connect', () => {
                console.log('Connected to server');
            });
            
            const broadcastQr = () => {
                socket.on('qr', (qrDataURL) => {
                    setQrCode(qrDataURL);
                    setStatus('Escaneie o QR code com o WhatsApp');
                });
            }
            
            if (!isClientOn) {
                broadcastQr()
            }

            return () => socket.disconnect();
        }

    }, [qrCode, serverStatus]);

    return (
        <div className="">
            <h1>{status}</h1>
            {qrCode && !isClientOn && (
                <div>
                    <img src={qrCode} alt="QR Code for WhatsApp" />
                    <p>Escaneie o QR code com o WhatsApp.</p>
                </div>
            )}
        </div>
    );
}

export default Qrcode;
