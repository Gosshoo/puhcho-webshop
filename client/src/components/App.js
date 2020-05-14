import React, { Component } from 'react';
import { Container, Box, Heading, Card, Image, Text, SearchField, Icon } from 'gestalt';
import './App.css';
import Strapi from 'strapi-sdk-javascript/build/main';
import { Link } from 'react-router-dom';
import Loader from './Loader';

const apiURL = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiURL);

class App extends Component {
  state = {
    brands: [],
    searchTerm: '',
    loadingToys: true
  }

  async componentDidMount() {
    try {
      const response = await strapi.request('POST', '/graphql', {
        data: {
          query: `query {
            brands {
              _id
              name
              description
              image {
                url
              }
            }
          }`
        }
      });
      // console.log(response);
      this.setState({brands: response.data.brands, loadingToys: false})
    } catch (err) {
      console.error(err);
      this.setState({loadingToys: false});
    }
  }

handleChange = ({value}) => {
  this.setState({ searchTerm: value }, () => this.searchBrands());
};

// filteredToys = ({ searchTerm, brands}) => {
//   return brands.filter(brand => {
//     return brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       brand.description.toLowerCase().includes(searchTerm.toLowerCase());
//   })
// };

searchBrands = async () => {
  const response = await strapi.request('POST', '/graphql', {
    data: {
      query: `query {
        brands(where:{
          name_contains: "${this.state.searchTerm}"
        }) {
          _id
          name
          description
          image {
            url
          }
        }
      }`
    }
  });
  console.log(this.state.searchTerm, response.data.brands);
  this.setState({
    brands: response.data.brands,
    loadingToys: false
  });
};

render() {
  const { searchTerm, loadingToys, brands } = this.state;

  return (
    <Container>
      {/* Toys search field */}
      <Box display="flex" justifyContent="center" marginTop={4}>
        <SearchField
          id="searchField"
          accessibilityLabel="Toys Search Field"
          onChange={this.handleChange}
          value={searchTerm}
          placeholder="Search Toys"
        >
        </SearchField>
        <Box margin={2}>
          <Icon
            icon="filter"
            color={ searchTerm ? 'orange' : 'gray' }
            size={20}
            accessibilityLabel="filter">
          </Icon>
        </Box>
      </Box>

      {/* Toys section */}
      <Box
        display="flex"
        justifycontent="center"
        marginBottom={2}
      >
      {/* Brands header */}
      <Heading class="header" color="midnight" size="md">
        Puhcho Toys
      </Heading>
      </Box>
      {/* Brands */}
      <Box
        dangerouslySetInlineStyle={{
          __style: {
            backgroundColor: "#d6c8ec"
          }
        }}
        shape="rounded"
        wrap
        display="flex"
        justifyContent="around"
        >
        {/* this.filteredToys(this.state) */}
        {brands.map(brand => (
          <Box
            paddingY={4}
            margin={2}
            width={200}
            key={brand._id}
          >
            <Card
              image={
                <Box height={200} width={200}>
                  <Image
                    fit="cover"
                    alt="Brand"
                    naturalHeight={1}
                    naturalWidht={1}
                    src={`${apiURL}${brand.image.url}`}
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
              height={200}
            >
              <Text bold size="lg">{brand.name}</Text>
              <Text>{brand.description}</Text>
              <Text bold size="lg">
                <Link to={`/${brand._id}`}>See Toys</Link>
              </Text>
            </Box>
            </Card>
          </Box>
        ))}
      </Box>
      {/* <Spinner 
        show={loadingToys}
        accessibilityLabel="Loading Spinner">
      </Spinner> */}
      <Loader show={loadingToys}></Loader>
    </Container>
  );
}
}

export default App;
