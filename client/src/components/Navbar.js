import React from 'react';
import { Box, Text, Heading, Button } from 'gestalt';
import { getToken, clearToken, clearCart } from '../utils';
import {NavLink, withRouter} from 'react-router-dom';

class Navbar extends React.Component {
    handleSignout = () => {
        clearToken();
        clearCart();
        // redirect home
        this.props.history.push('/');
    }

    render() {
        return getToken() !== null ? 
        <AuthNav handleSignout={this.handleSignout} /> : <UnAuthNav />;
    }
    
};

const AuthNav = ({ handleSignout }) => (
    <Box
    display="flex"
    alignItems="center"
    justifyContent="around"
    height={70}
    color={"midnight"}
    padding={1}
    shape="roundedBottom"
    >
    {/* Checkout link */}
    <NavLink activeClassName="active" to="/checkout">
        <Text size="lg" color="white">Checkout</Text>
    </NavLink>

    {/* Title and Logo */}
    <NavLink activeClassName="active" exact to="/">
        <Heading size="md" color="orange">
            Puhcho webshop
        </Heading>
    </NavLink>

    {/* Signout button */}
    <Button
        onClick={handleSignout}
        color="transparent"
        text="Sign out"
        inline
        size="md"
    >

    </Button>
    </Box>
)

const UnAuthNav = () => (
    <Box
        display="flex"
        alignItems="center"
        justifyContent="around"
        height={70}
        color={"midnight"}
        padding={1}
        shape="roundedBottom"
        >
    {/* Sign in link */}
    <NavLink activeClassName="active" to="/signin">
        <Text size="lg" color="white">Sign In</Text>
    </NavLink>

    {/* Title and Logo */}
    <NavLink activeClassName="active" exact to="/">
        <Heading size="md" color="orange">
            Puhcho webshop
        </Heading>
    </NavLink>

    {/* Sign up link */}
    <NavLink activeClassName="active" to="/signup">
    <Text size="lg" color="white">Sign Up</Text>
    </NavLink>
    </Box>
)

export default withRouter(Navbar);