import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import store from './redux/store';
import AuthNavigator from './navigation/AuthNavigator';

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  </Provider>
);

export default App;
