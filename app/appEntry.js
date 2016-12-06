'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
const events = window.require('events');
const path = window.require('path');
const fs = window.require('fs');
let $ = require('jquery');

const electron = window.require('electron');
const {ipcRenderer, shell} = electron;
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
const iconv = window.require('iconv-lite');
let loginwindows;

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';


let muiTheme = getMuiTheme({
    fontFamily: 'Microsoft YaHei'
});


class MainWindow extends React.Component {

    constructor(props) {
        super(props);
        loginwindows = this;
        injectTapEventPlugin();
        //console.log($("#content").prop('outerHTML'));
        this.state = {
            userName: "xiongzhiming",
            password: "yiyeiFUWON528",
            islogin: false,
            open: false
        };
    }

    _handleClose()  {
        this.setState({open: false});
    };

    render() {
        const actions = [
            <FlatButton
                label="好的"
                primary={true}
                onTouchTap={this._handleClose.bind(this)}
            />
        ];
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div style={styles.root}>
                    <img style={styles.icon} src='public/img/app-icon.png'/>

                    <TextField
                        hintText='请输入用户名'
                        value={this.state.userName}
                        onChange={(event) => {this.setState({userName: event.target.value})}}/>
                    <TextField
                        hintText='请输入密码'
                        type='password'
                        value={this.state.password}
                        onChange={(event) => {this.setState({password: event.target.value})}}/>

                    <div style={styles.buttons_container}>
                        {
                            this.state.islogin == false ? (
                                <RaisedButton label="登录" primary={true} onClick={this._handleLogin.bind(this)}/>) : (
                                <div><CircularProgress /></div>)
                        }

                    </div>
                    <Dialog
                        title="登录失败"
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                    >
                        请仔细检查你的用户名和密码.
                    </Dialog>
                </div>
            </MuiThemeProvider>
        );
    }

    _handleLogin() {
        loginwindows.setState({islogin: true});
        ipcRenderer.on('login-response', function (event, arg) {
            loginwindows.setState({islogin: false});
            if (arg == "loginfalse") {
                loginwindows.setState({open: true});
            }
            console.log(arg);
        });
        ipcRenderer.send('login-message', [this.state.userName, this.state.password]);
    }

    _handleRegistry() {
    }
}

const styles = {
    root: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
        //backgroundImage: "url('public/img/app-backgroud.jpg')"
    },
    icon: {
        width: 100,
        height: 100,
        marginBottom: 40
    },
    buttons_container: {
        paddingTop: 30,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
};


let mainWndComponent = ReactDOM.render(
    <MainWindow />,
    document.getElementById('content'));