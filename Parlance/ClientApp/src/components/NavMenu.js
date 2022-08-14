import React, {Component} from 'react';
import Styles from './NavMenu.module.css';
import Button from "./Button";
import Modal from "./Modal";
import LoginUsernameModal from "./modals/account/LoginUsernameModal";
import UserManager from "../helpers/UserManager";
import UserModal from "./modals/account/UserModal";
import {withTranslation} from "react-i18next";

export default withTranslation()(class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            currentUser: "..."
        };
        
        UserManager.on("currentUserChanged", this.updateUserDetails.bind(this));
    }
    
    async componentDidMount() {
        await this.updateUserDetails();
    }
    
    async updateUserDetails() {
        this.setState({
            currentUser: UserManager.currentUser?.username || this.props.t("LOG_IN")
        });
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
    
    manageAccount() {
        if (UserManager.isLoggedIn) {
            Modal.mount(<UserModal />)
        } else {
            UserManager.clearLoginDetails();
            Modal.mount(<LoginUsernameModal />)
        }
    }

    render() {
        return (
            <header>
                <div className={Styles.navbarWrapper}>
                    <div className={Styles.navbarInner}>
                        <div>
                            Parlance
                        </div>
                        <div>
                            <Button onClick={this.manageAccount.bind(this)}>{this.state.currentUser}</Button>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
})
