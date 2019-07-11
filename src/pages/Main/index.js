import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ActivityIndicator } from 'react-native';
import { darken } from 'polished';

import api from '../../services/api';
import { formatPrice } from '../../util/format';

import * as CartActions from '../../store/modules/cart/actions';

import {
  Container,
  List,
  Product,
  ProductImage,
  ProductTitle,
  ProductPrice,
  AddButton,
  ProductAmount,
  ProductAmountText,
  AddButtonText,
  BottomBar,
  EmptyCart,
  EmptyCartMessage,
  GoToCart,
  GoToCartButton,
  GoToCartButtonText,
  TotalWrapper,
  TotalLabel,
  TotalValue,
} from './styles';

const Main = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const amount = useSelector(state =>
    state.cart.reduce((amount, product) => {
      amount[product.id] = product.amount;
      return amount;
    }, {})
  );
  const cartSize = useSelector(state => state.cart.length);
  const total = useSelector(state =>
    formatPrice(
      state.cart.reduce((total, product) => {
        return total + product.price * product.amount;
      }, 0)
    )
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const response = await api.get('products');

      const data = response.data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price),
      }));

      setProducts(data);

      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    fetchProducts();
  }, []);

  const handleAddProduct = id => {
    dispatch(CartActions.addToCartRequest(id));
  };

  if (loading) {
    return (
      <Container loading>
        <ActivityIndicator color="#fff" size="large" />
      </Container>
    );
  }

  return (
    <>
      <Container>
        <List
          data={products}
          keyExtractor={product => String(product.id)}
          renderItem={({ item, index }) => (
            <Product first={index === 0}>
              <ProductImage source={{ uri: item.image }} />
              <ProductTitle>{item.title}</ProductTitle>
              <ProductPrice>{formatPrice(item.price)}</ProductPrice>
              <AddButton onPress={() => handleAddProduct(item.id)}>
                <ProductAmount>
                  <Icon name="add-shopping-cart" color="#FFF" size={20} />
                  <ProductAmountText>{amount[item.id] || 0}</ProductAmountText>
                </ProductAmount>
                <AddButtonText>ADD TO CART</AddButtonText>
              </AddButton>
            </Product>
          )}
        />
      </Container>
      <BottomBar>
        {cartSize > 0 ? (
          <GoToCart>
            <TotalWrapper>
              <TotalLabel>TOTAL</TotalLabel>
              <TotalValue>{total}</TotalValue>
            </TotalWrapper>
            <GoToCartButton>
              <GoToCartButtonText>GO TO CART</GoToCartButtonText>
              <Icon name="keyboard-arrow-right" color="#7159c1" size={18} />
            </GoToCartButton>
          </GoToCart>
        ) : (
          <EmptyCart>
            <Icon
              name="remove-shopping-cart"
              color={darken(0.25, '#7159c1')}
              size={36}
            />
            <EmptyCartMessage>Your cart is empty</EmptyCartMessage>
          </EmptyCart>
        )}
      </BottomBar>
    </>
  );
};

export default Main;
