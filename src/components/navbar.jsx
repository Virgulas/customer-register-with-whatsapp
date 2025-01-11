import { useState } from "react";
import Qrcode from './qrcode';
import SendMessage from "./test_page";
import RegistrationPage from './registration'
import DataTable from "./usersTable";
import BirthdayTable from "./birthdayTable";
import CallTodayTable from "./callToday";
import "../styles/navbar.css"

function Navbar() {
    const buttons = { HOME: "Início", USERS: "Clientes", BIRTHDAY: "Aniversariantes", CALLDATE: "Chamar Hoje", REGISTER: "Cadastro" }
    const [tab, setTab] = useState(buttons.HOME);

    const buttonsComponentGroup = Object.values(buttons).map(button => 
    (<a href="#" onClick={() => setTab(button)} class={`btn-custom btn btn-success ${tab === button? "" : "active"}`} aria-current="page">{button}</a>)
    )

    return (
        <div className="navbar">
            <div class="btn-group-custom btn-group">
                {buttonsComponentGroup}
            </div>
            {tab === buttons.HOME? (
                <div className="page-start">
                <Qrcode />
            </div>
            ) : ""}
            {tab === buttons.USERS? (
            <div className="page-users">
                <DataTable />
            </div>
            ) : ""}
            {tab === buttons.REGISTER? (
            <div className="page-users">
                <RegistrationPage />
            </div>
            ) : ""}
            {tab === buttons.BIRTHDAY? (
            <div className="page-users">
                <BirthdayTable />
            </div>
            ) : ""}
            {tab === buttons.CALLDATE? (
            <div className="page-users">
                <CallTodayTable />
            </div>
            ) : ""}
        </div>
    );
}


export default Navbar;