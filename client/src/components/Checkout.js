import React from 'react';
import { Container, Box, Button, Heading, Text, TextField, Modal, Spinner} from 'gestalt';
import { Elements, StripeProvider, CardElement, injectStripe} from 'react-stripe-elements';
import ToastMessage from './ToastMessage';
import { getCart, calculatePrice, clearCart, calculateAmount } from '../utils';
import { withRouter } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';

const apiURL = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiURL);

class _CheckoutForm extends React.Component {
    state = {
        cartItems: [],
        address: '',
        postalCode: '',
        city: '',
        confirmationEmailAddress: '',
        toast: false,
        toastMessage: '',
        orderProcessing: false,
        modal: false
    }

    componentDidMount() {
        this.setState({ cartItems: getCart() });
    }

    handleChange = ({ event, value }) => {
        event.persist();
        this.setState({ [event.target.name]: value });
    };

    handleConfirmOrder = async event => {
        event.preventDefault();

        if (this.isFormEmpty(this.state)) {
            this.showToast('Fill in all fields');
            return;
        }

        this.setState({ modal : true }); 
    };

    handleSubmitOrder = async () => {
        const { cartItems, city, address, postalCode, confirmationEmailAddress } = this.state;
        
        const amount = calculateAmount(cartItems);
        // Process order
        this.setState({ orderProcessing: true });
        let token;
        try {
            // Create stripe token
            const response = await this.props.stripe.createToken();
            token = response.token.id;
            // Create order with strapi sdk (make request to backend)
            await strapi.createEntry('orders', {
                amount,
                toys: cartItems,
                city,
                postalCode,
                address,
                token
            });
            // Send email to user after ordering // `${apiURL}/email`
            // await strapi.request('POST', '/email', {
            //     data: {
            //         to: confirmationEmailAddress,
            //         // from: 'test@example.com',
            //         subject: `Order confirmation - Puhcho Toys ${new Date(Date.now())}`,
            //         text: 'Your order has been processed!',
            //         html: '<bold>Expect your order to arrive in 2-3 shipping days</bold>'
            //     }
            // });
            // set orderProcessing to false, set modal to false
            this.setState({ orderProcessing: false, modal: false });
            // Clear user cart of toys
            clearCart();
            // Show success toast
            this.showToast('Your order has been successfully submitted!', true);
        } catch (err) {
            // Set orderProcessing to false, modal to false
            this.setState({ orderProcessing: false, modal: false });
            // Show error toast
            this.showToast(err.message);
        }
    };

    isFormEmpty = ({ address, postalCode, city, confirmationEmailAddress }) => {
        return !address || !postalCode || !city || !confirmationEmailAddress;
    }

    showToast = (toastMessage, redirect = false) => {
        this.setState({ toast: true, toastMessage });
        setTimeout(() => this.setState({ toast: false, toastMessage: '' },
        // if true passed to 'redirect' argument, redirect home 
            () => redirect && this.props.history.push('/')
        ), 5000);
    };

    closeModal = () => this.setState({ modal: false});

    render() {
        const { toast, toastMessage, cartItems, modal, orderProcessing } = this.state;

        return (
            <Container>
                <Box
                color='darkWash'
                margin={4}
                padding={4}
                shape="rounded"
                display="flex"
                justifyContent="center"
                alignItems="center"
                direction="column"
                >
                    {/* Checkout form heading */}
                    <Heading color="midnight">Checkout</Heading>
                    {cartItems.length > 0 ? <React.Fragment>
                    {/* User cart */}
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                        marginTop={2}
                        marginBottom={6}
                    >
                        <Text color="darkGray" italic>{cartItems.lenght} Items for Checkout</Text>
                        <Box padding={2}>
                            {cartItems.map(item => (
                                <Box key={item._id} padding={1}>
                                    <Text color="midnight">
                                        {item.name} x {item.quantity} - ${item.quantity} * {item.price}
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                            <Text bold>Total Amount: {calculatePrice(cartItems)}</Text>
                    </Box>
                    {/* Checkout form */}
                    <form style={{
                        display: 'inlineBlock',
                        textalign: 'center',
                        maxwidth: 450
                    }}
                    onSubmit={this.handleConfirmOrder}>
                        {/* Checkout form heading */}
                        <Heading color="midnight"></Heading>
                        {/* Shipping address input */}
                        <TextField
                        id="address"
                        type="text"
                        name="address"
                        placeholder="Shipping Address"
                        onChange={this.handleChange}
                        >
                        </TextField>
                        {/* Postal code input */}
                        <TextField
                        id="postalCode"
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        onChange={this.handleChange}
                        >
                        </TextField>
                        {/* City input */}
                        <TextField
                        id="city"
                        type="text"
                        name="city"
                        placeholder="City of Residence"
                        onChange={this.handleChange}
                        >
                        </TextField>
                        {/* Confirmation email address input */}
                        <TextField
                        id="confirmationEmailAddress"
                        type="email"
                        name="confirmationEmailAddress"
                        placeholder="Confirmation Email Address"
                        onChange={this.handleChange}
                        >
                        </TextField>
                        {/* Credit card element */}
                        <CardElement id="stripe__input" onReady={input => input.focus()}></CardElement>
                        <Button inline id="stripe__button" text="Submit" type="submit">Submit</Button>
                    </form>
                    </React.Fragment> : (
                        // Default text if NO items in cart
                        <Box color="darkWash" shape="rounded" padding={4}>
                            <Heading align="center" color="watermelon" size="sm">Your cart is empty</Heading>
                            <Text align="center" italic color="green">Add some toys!</Text>
                        </Box>
                    )}
                </Box>
                {/* Confirmation modal */}
                {modal && (
                    <ConfimationModal 
                        orderProcessing={orderProcessing} 
                        cartItems={cartItems}
                        closeModal={this.closeModal}
                        handleSubmitOrder={this.handleSubmitOrder}/>
                )}
                <ToastMessage show={toast} message={toastMessage}></ToastMessage>
            </Container>
        );
    }
}

const ConfimationModal = ({ orderProcessing, cartItems, closeModal, handleSubmitOrder }) => (
    <Modal
        accessibilityCloseLabel="close"
        accessibilityModalLabel="Confirm your order"
        heading="Confirm your order"
        onDismiss={closeModal}
        footer={
            <Box display="flex" marginRight={-1} marginLeft={-1} justifyContent="center">
                <Box padding={1}>
                    <Button
                        size="lg"
                        color="red"
                        text="Submit"
                        disabled={orderProcessing}
                        onClick={handleSubmitOrder}
                    >
                    </Button>
                </Box>
                <Box padding={1}>
                    <Button
                        size="lg"
                        text="Cancel"
                        disabled={orderProcessing}
                        onClick={closeModal}
                    >
                    </Button>
                </Box>
            </Box>
        }
        role="alertdialog"
        size='sm'
    >
        {/* Order summary */}
        {!orderProcessing && (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            direction="column"
            padding={2}
            color="lightWash"
        >
            {cartItems.map(item => (
                <Box key={item._id} padding={1}>
                    <Text size="lg" color="red">
                        {item.name} x {item.quantity} - {item.quantity} * {item.price}
                    </Text>
                </Box>
            ))}
            <Box paddingY={2}>
                <Text size="lg" bold>
                    Total: {calculatePrice(cartItems)}
                </Text>
            </Box>
        </Box>
        )}
        {/* Order processing spinner */}
        <Spinner
            show={orderProcessing}
            accessibilityLabel="Order processing spinner"
        ></Spinner>
        {orderProcessing && <Text align="center" italic>Submiting order...</Text>}
    </Modal>
);

const CheckoutForm = withRouter(injectStripe(_CheckoutForm));

const Checkout = () => (
    <StripeProvider apiKey="pk_test_I6H5OIDzxJKe3AI98vA3eF3j0064dTox6x">
        <Elements>
            <CheckoutForm></CheckoutForm>
        </Elements>
    </StripeProvider>
)

export default Checkout;