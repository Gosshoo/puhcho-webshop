import React from 'react';
import Strapi from 'strapi-sdk-javascript/build/main';
import { Container,Box, Heading, Text, Image, Card, Button, Mask, IconButton} from 'gestalt';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import { calculatePrice, setCart, getCart } from '../utils';

const apiURL = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiURL);

class Toys extends React.Component {
    state = {
        toys: [],
        brand: '',
        cartItems: [],
        loadingToys: true
    }

    async componentDidMount() {
        try {
        const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    brand(id:"${this.props.match.params.brandId}") {
                      _id
                      name
                      toys {
                        _id
                        name
                        description
                        image {
                          url
                        }
                        price
                      }
                    }
                  }`
            }
        });
        // console.log(response);
        this.setState({
            toys: response.data.brand.toys,
            brand: response.data.brand.name,
            loadingToys: false,
            cartItems: getCart()
        });
    } catch (err) {
        console.error(err);
        this.setState({loadingToys: false});
    }
}

addToCart = toy => {
  const alreadyInCart = this.state.cartItems.findIndex(item => item._id === toy._id)

  if (alreadyInCart === -1) {
    const updatedItems = this.state.cartItems.concat({
      ...toy,
      quantity: 1
    });
    this.setState({ cartItems: updatedItems }, () => setCart(updatedItems));
  } else {
    const updatedItems = [...this.state.cartItems];
    updatedItems[alreadyInCart].quantity += 1;
    this.setState({ cartItems: updatedItems }, () => setCart(updatedItems));
  }
};

deleteItemFromCart = itemToDeleteId => {
  const filteredItems = this.state.cartItems.filter(
    item => item._id !== itemToDeleteId
  );
  this.setState({ cartItems: filteredItems }, () => setCart(filteredItems));
}

    render() {
      const { brand, toys, cartItems, loadingToys } = this.state;

        return (
          <Container>
            <Box
                marginTop={4}
                display="flex"
                justifyContent="center"
                alignItems="start"
                dangerouslySetInlineStyle={{
                  __style: {
                    flexWrap: 'wrap-reverse'
                  }
                }}
            >
                {/* Toys section */}
                <Box
                    display="flex"
                    direction="column"
                    alignItems="center"
                >
                {/* Toys heading */}
                <Box margin={2}>
                    <Heading color="orchid">{brand}</Heading>
                </Box>
                {/* Toys */}
                <Box
                    dangerouslySetInlineStyle={{
                        __style: {
                            backgroundColor: '#bdcdd9'
                        }
                    }}
                    wrap
                    shape="rounded"
                    display="flex"
                    justifyContent="center"
                    padding={4}
                >
                    {toys.map(toy => (
                        <Box
                        paddingY={4}
                        margin={2}
                        width={210}
                        key={toy._id}
                      >
                        <Card
                          image={
                            <Box height={200} width={200}>
                              <Image
                                fit="cover"
                                alt="Brand"
                                naturalHeight={1}
                                naturalWidht={1}
                                src={`${apiURL}${toy.image.url}`}
                              >
                              </Image>
                            </Box>
                          }
                        >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          direction="column"
                          height={250}
                        >
                        <Box marginBottom={2}>  
                          <Text bold size="lg">
                            {toy.name}
                          </Text>
                        </Box>
                          <Text>{toy.description}</Text>
                          <Text color="orchid">${toy.price}</Text>
                        <Box marginTop={2}>
                          <Text bold size="lg">
                            <Button onClick={() => this.addToCart(toy)} 
                              color="blue" text="Add to Cart"></Button>
                          </Text>
                        </Box>
                        </Box>
                        </Card>
                      </Box>
                    ))}

                </Box>
                </Box>

                {/* User cart */}
                <Box
                  alignSelf="end"
                  marginTop={2}
                  marginLeft={8}
                >
                  <Mask shape="rounded" wash>
                    <Box
                      display="flex"
                      direction="column"
                      alignItems="center"
                      padding={2}
                    >
                      {/* User cart heading */}
                      <Heading
                        align="center"
                        size="md"
                      >
                        Your Cart
                      </Heading>
                      <Text color="gray" italic>
                        {cartItems.length} items selected
                      </Text>

                      {/* Cart items */}
                      {cartItems.map(item => (
                        <Box key={item._id} display="flex" alignItems="center">
                          <Text>
                            {item.name} x {item.quantity} - {(item.quantity * item.price).toFixed(2)}
                          </Text>
                          <IconButton
                            accessibilityLabel="Delete Item"
                            icon="cancel"
                            size="sm"
                            iconColor="red"
                            onClick={() => this.deleteItemFromCart(item._id)}
                          >

                          </IconButton>
                        </Box>
                      ))}

                        <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        direction="column"
                        >
                          <Box margin={2}>
                            {cartItems.length === 0 && (
                              <Text color="red">Please select some items</Text>
                            )}
                          </Box>
                            <Text size="lg">Total: {calculatePrice(cartItems)}</Text>
                          <Text>
                            <Link to="/checkout">Checkout</Link>
                          </Text>

                        </Box>
                    </Box>

                  </Mask>
                </Box>
            </Box>
            <Loader show={loadingToys}></Loader>
          </Container>
        )
    }
}

export default Toys;