const DateHelper = require('../date/dateHelper');
const { registerSteps, registerMessages, restart } = require('../../settings.json');
const { createUser } = require('../user/functions')

class RegistrationHandler {
    static currentCustomers = {};
    static minimumTime = 7; // days
    static maximumTime = 90; // days
    static confirmation = { yes: ["sim", "sim.", "s"], no: ["não", "não.", "n"] }

    static removeCustomer(id) {
        delete this.currentCustomers[id];
    }

    static getCurrentCustomer(id) {
        return this.currentCustomers[id];
    }

    static setCurrentCustomer(id, value) {
        this.currentCustomers[id] = value;
    }

    static async handleRegistration(userId, userMessage, client) {
        const userState = this.getCurrentCustomer(userId);

        switch (userState.step) {
            case registerSteps.REGISTER_PROMPT:
                if (this.confirmation.yes.includes(userMessage.toLowerCase())) {
                    userState.step = registerSteps.ASK_FULL_NAME;
                    client.sendMessage(userId, registerMessages.ASK_FULL_NAME);
                } else if (this.confirmation.no.includes(userMessage.toLowerCase())) {
                    delete this.currentCustomers[userId];
                    client.sendMessage(userId, 'Cadastro cancelado.');
                } else {
                    client.sendMessage(userId, 'Resposta inválida. Por favor, responda com *Sim* ou *Não*.');
                }
                break;

            case registerSteps.ASK_FULL_NAME:
                userState.fullName = userMessage;
                userState.step = registerSteps.CONFIRM_FULL_NAME;
                const [start, finish] = registerMessages.CONFIRM_FULL_NAME.split("_")
                client.sendMessage(userId, `${start}"${userMessage}"${finish}`);
                break;

            case registerSteps.CONFIRM_FULL_NAME:
                if (this.confirmation.yes.includes(userMessage.toLowerCase())) {
                    userState.step = registerSteps.ASK_BIRTH_DATE;
                    client.sendMessage(userId, registerMessages.ASK_BIRTH_DATE);
                } else if (this.confirmation.no.includes(userMessage.toLowerCase())) {
                    userState.step = 'ask_full_name';
                    client.sendMessage(userId, 'Por favor, escreva seu *nome* e *sobrenome* novamente então.');
                } else {
                    client.sendMessage(userId, 'Resposta inválida. Por favor responda com *Sim* ou *Não*.');
                }
                break;

            case registerSteps.ASK_BIRTH_DATE:
                const date = DateHelper.validate(userMessage)
                if (date) {
                    userState.birthDate = date;
                    userState.step = registerSteps.ASK_USER_PERIOD;
                    client.sendMessage(userId, registerMessages.ASK_USER_PERIOD);
                } else {
                    client.sendMessage(userId, 'Formato inválido. Por favor, informe sua data de nascimento no formato *dia/mês* (exemplo: *16/03*).');
                }
                break;

            case registerSteps.ASK_USER_PERIOD:
                const days = parseInt(userMessage);
                if (!isNaN(days) && days >= this.minimumTime && days <= this.maximumTime) {
                    userState.usePeriod = days;
                    userState.step = registerSteps.REGISTRATION_COMPLETE;
                    client.sendMessage(userId, registerMessages.REGISTRATION_COMPLETE);
                    client.sendMessage(userId, `Seus dados são: \n Nome: ${userState.fullName} \n Aniversário: ${userState.birthDate} \n Período de uso: ${userState.usePeriod} \n Caso deseje alterar alguma informação, digite ${restart}`)
                    await createUser(userId, userState.fullName, userState.birthDate, userState.usePeriod, DateHelper.sum(DateHelper.getCurrent(), userState.usePeriod))
                    this.removeCustomer[userId];
                } else {
                    client.sendMessage(userId, `Período inválido. Por favor, escolha um período maior que ${this.minimumTime - 1} e menor que ${this.maximumTime + 1}.`);
                }
                break;
        }
    }
}

module.exports = RegistrationHandler;
