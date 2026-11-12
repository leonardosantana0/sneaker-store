import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';

/**
 * Layout raiz do aplicativo.
 * Envolve todo o app no CartProvider e SafeAreaProvider.
 * Configura o Stack Navigator e a StatusBar.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FAF9F8' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="checkout" />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}
