import React from 'react';
import { Container, Box, Button, Heading, TextField} from 'gestalt';
import { setToken } from '../utils';
import ToastMessage from './ToastMessage';
import Strapi from 'strapi-sdk-javascript/build/main';

const apiURL = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiURL);

class Signin extends React.Component {
    state = {
        username: '',
        password: '',
        toast: false,
        toastMessage: '',
        loading: false
    };

    handleChange = ({ event, value }) => {
        event.persist();
        this.setState({ [event.target.name]: value });
    };

    handleSubmit = async event => {
        event.preventDefault();
        const { username, password } = this.state;

        if (this.isFormEmpty(this.state)) {
            this.showToast('Fill in all fields');
            return;
        }
        // console.log('submitted')

        // Sign up users
        try {
            this.setState({ loading: true });
            // make request to register user with strapi
            const response = await strapi.login(username, password);
            this.setState({ loading: false });
            // put token (to manage user session) in local storage
            setToken(response.jwt);
            // console.log(response);
            this.redirectUser('/');
        } catch (err) {
            this.setState({ loading: false });
            // show error message with toast message
            this.showToast(err.message);
        }
    };

    redirectUser = path => this.props.history.push(path);

    isFormEmpty = ({ username, password }) => {
        return !username || !password;
    }

    showToast = toastMessage => {
        this.setState({ toast: true, toastMessage });
        setTimeout(() => this.setState({ toast: false, toastMessage: '' }), 5000);
    }

    render() {
        const { toastMessage, toast, loading } = this.state;

        return (
            <Container>
                <Box
                dangerouslySetInlineStyle={{
                    __style: {
                        backgroundColor: '#d6a3b1'
                    }
                }}
                margin={4}
                padding={4}
                shape="rounded"
                display="flex"
                justifyContent="center"
                >
                    {/* Sign in form */}
                    <form style={{
                        display: 'inlineBlock',
                        textalign: 'center',
                        maxwidth: 450
                    }}
                    onSubmit={this.handleSubmit}>
                        {/* Sign in heading */}
                        <Box
                            marginBottom={2}
                            display="flex"
                            direction="column"
                            alignItems="center"
                        >
                            <Heading color="midnight">Welcome back!</Heading>
                        </Box>
                        {/* Username input */}
                        <TextField
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={this.handleChange}
                        >
                        </TextField>
                        {/* Password input */}
                        <TextField
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={this.handleChange}
                        >
                        </TextField>
                        <Button inline disabled={loading} color="blue" text="Submit" type="submit"></Button>
                    </form>
                </Box>
                <ToastMessage show={toast} message={toastMessage}></ToastMessage>
            </Container>
        )
    }
}

export default Signin;