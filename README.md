# Customer Register App with WhatsApp Integration

This app was created by request of a local business. It combines **React**, **Electron**, **SQLite**, and the **whatsapp-web.js** package to create a seamless user experience.

---

## Features

### 1. Customer Registration
- **Manual Registration**: Easily register customers using the provided form.
- **Automatic Registration**: Use a WhatsApp bot to register customers via commands.

### 2. Customer Data Management
- View and manage customer data in a table format, stored securely in an **SQLite** database.

### 3. Birthdays
- A dedicated tab to view customers with birthdays.
- Send personalized messages to customers on their birthdays through WhatsApp.

### 4. Service Usage Period
- A tab to manage customers based on their service usage period.
- Send customized messages to customers within the given period.

### 5. Messaging
- Each tab includes a message input box to send messages to multiple customers at once via WhatsApp.

### Demo
<iframe width="560" height="315" src="https://www.youtube.com/embed//LMiCRc8WdLc" frameborder="0" allowfullscreen></iframe>

---

## Technology Stack

- **Frontend**: React
- **Desktop Environment**: Electron
- **Database**: SQLite
- **WhatsApp Integration**: whatsapp-web.js

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```

2. Navigate to the project directory:
   ```bash
   cd <app_folder>
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the app:
   ```bash
   npm run dev
   ```

---

## Usage

### Initial Setup
- Launch the app.
- Scan the QR code with your WhatsApp to connect.

### Registering Customers
- **Manually**: Go to the "Cadastro" tab and fill out the registration form.
- **Automatically**: Use the WhatsApp bot by sending a predefined command.

### Managing Birthdays
- Access the "Aniversariantes" tab to view customers with birthdays and send them messages.

### Managing Service Usage
- Go to the "Chamar Hoje" tab to contact customers within their service period.

---

## Screenshots
- **Home Screen**: Displays the QR code for WhatsApp connection.
- **Customer Management**: Table view of customer data.
- **Messaging Tabs**: Separate tabs for birthdays and service usage.

---

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature/bugfix.
3. Submit a pull request.

---

## License
This project is licensed under [Avila].

---

## Acknowledgments
- **whatsapp-web.js** for WhatsApp integration.
- **SQLite** for database management.
- The open-source community for inspiration and support.




