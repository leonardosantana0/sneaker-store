import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ListRenderItem,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';
import CartItemComponent from '../components/CartItem';
import CustomButton from '../components/CustomButton';
import { CartItem } from '../types';

const FREE_SHIPPING_THRESHOLD = 800;
const STANDARD_SHIPPING = 29.90;

export default function CartScreen() {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const isFreeShipping = state.total >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = state.items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING;
  const freeShippingProgress = Math.min(1, state.total / FREE_SHIPPING_THRESHOLD);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - state.total);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SNKRS10' || code === 'PRIMEIRACOMPRA' || code === 'KITH10' || code === 'DESCONTO10') {
      const discount = state.total * 0.1;
      setCouponDiscount(discount);
      setCouponApplied(true);
      Alert.alert('Cupom Validado', 'Desconto exclusivo de 10% aplicado ao seu pedido.');
    } else {
      Alert.alert('Cupom não localizado', 'Tente utilizar o cupom SNKRS10 para 10% de benefício.');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode('');
  };

  const finalTotal = Math.max(0, state.total + shippingFee - couponDiscount);

  const handleRemove = (productId: string, size: number) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Deseja retirar este calçado da sua sacola?');
      if (confirm) removeFromCart(productId, size);
    } else {
      Alert.alert(
        'Remover Modelo',
        'Deseja retirar este calçado da sua sacola?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Remover', style: 'destructive', onPress: () => removeFromCart(productId, size) },
        ],
      );
    }
  };

  const handleClearCart = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Deseja esvaziar todos os itens da sacola?');
      if (confirm) clearCart();
    } else {
      Alert.alert(
        'Esvaziar Sacola',
        'Deseja remover todos os modelos da sacola?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Esvaziar', style: 'destructive', onPress: clearCart },
        ],
      );
    }
  };

  const renderItem: ListRenderItem<CartItem> = ({ item }) => (
    <CartItemComponent
      item={item}
      onRemove={() => handleRemove(item.product.id, item.selectedSize)}
      onUpdateQuantity={(qty) => updateQuantity(item.product.id, item.selectedSize, qty)}
    />
  );

  // ── Estado de Carrinho Vazio ──────────────────────────────────────────────
  if (state.items.length === 0) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.circleHeaderBtn}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={20} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Sua Sacola</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-outline" size={40} color="#8A8A8A" />
          </View>
          <Text style={styles.emptyTitleText}>Sua sacola está vazia</Text>
          <Text style={styles.emptySubtitleText}>
            Navegue pela nossa seleção exclusiva e encontre a silhueta ideal para o seu acervo.
          </Text>
          <CustomButton
            title="Explorar Galeria"
            onPress={() => router.push('/')}
            variant="primary"
            size="large"
            iconElement={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
            style={styles.emptyExploreButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ── Top Bar / Header ────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.circleHeaderBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={20} color="#111111" />
        </TouchableOpacity>

        <View style={styles.headerTitleColumn}>
          <Text style={styles.headerTitleText}>Sua Sacola</Text>
          <Text style={styles.headerCountSubtitle}>
            {state.itemCount} {state.itemCount === 1 ? 'modelo selecionado' : 'modelos selecionados'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.clearHeaderBtn}
          onPress={handleClearCart}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearHeaderText}>Esvaziar</Text>
        </TouchableOpacity>
      </View>

      {/* ── Barra de Progresso de Frete Cortesia ────────────────────────── */}
      <View style={styles.freeShippingBox}>
        <View style={styles.shippingTextRow}>
          <Ionicons
            name={isFreeShipping ? 'checkmark-circle' : 'cube-outline'}
            size={15}
            color={isFreeShipping ? '#059669' : '#111111'}
          />
          <Text style={styles.shippingNoticeTitle}>
            {isFreeShipping ? (
              <Text style={styles.freeShippingSuccess}>Parabéns! Você desbloqueou o Frete Cortesia.</Text>
            ) : (
              <Text>
                Adicione mais <Text style={styles.freeShippingAmount}>{formatPrice(amountToFreeShipping)}</Text> para frete cortesia
              </Text>
            )}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.round(freeShippingProgress * 100)}%`,
                backgroundColor: isFreeShipping ? '#059669' : '#111111',
              },
            ]}
          />
        </View>
      </View>

      {/* ── Lista de Calçados no Carrinho ──────────────────────────────── */}
      <FlatList
        data={state.items}
        keyExtractor={(item) => `${item.product.id}-${item.selectedSize}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View style={styles.summaryContainer}>
            {/* Campo de Cupom Minimalista */}
            <View style={styles.couponCard}>
              <View style={styles.couponInputWrapper}>
                <Ionicons name="pricetag-outline" size={17} color="#737373" />
                <TextInput
                  style={styles.couponInput}
                  placeholder="Código de benefício (ex: SNKRS10)"
                  placeholderTextColor="#A3A3A3"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                  editable={!couponApplied}
                />
              </View>
              {couponApplied ? (
                <TouchableOpacity
                  style={styles.removeCouponBtn}
                  onPress={handleRemoveCoupon}
                >
                  <Text style={styles.removeCouponText}>Remover</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.applyCouponBtn,
                    !couponCode.trim() && styles.applyCouponBtnDisabled,
                  ]}
                  onPress={handleApplyCoupon}
                  disabled={!couponCode.trim()}
                >
                  <Text style={styles.applyCouponText}>Aplicar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Resumo Financeiro com Linhas Finas */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryPreTitle}>RESUMO DA SELEÇÃO</Text>

              <View style={styles.summaryLineRow}>
                <Text style={styles.summaryLabelText}>
                  Subtotal ({state.itemCount} {state.itemCount === 1 ? 'item' : 'itens'})
                </Text>
                <Text style={styles.summaryValueText}>{formatPrice(state.total)}</Text>
              </View>

              <View style={styles.summaryLineRow}>
                <Text style={styles.summaryLabelText}>Logística de Envio</Text>
                <Text
                  style={[
                    styles.summaryValueText,
                    isFreeShipping && styles.freeShippingGreen,
                  ]}
                >
                  {isFreeShipping ? 'Cortesia' : formatPrice(shippingFee)}
                </Text>
              </View>

              {couponApplied && (
                <View style={styles.summaryLineRow}>
                  <Text style={[styles.summaryLabelText, styles.discountText]}>
                    Desconto Especial
                  </Text>
                  <Text style={[styles.summaryValueText, styles.discountText]}>
                    −{formatPrice(couponDiscount)}
                  </Text>
                </View>
              )}

              <View style={styles.dividerLine} />

              <View style={styles.totalHighlightRow}>
                <View>
                  <Text style={styles.totalMainLabel}>Total a Pagar</Text>
                  <Text style={styles.totalInstallmentsNote}>
                    Em até 10x de {formatPrice(finalTotal / 10)} sem juros
                  </Text>
                </View>
                <Text style={styles.totalHighlightPrice}>
                  {formatPrice(finalTotal)}
                </Text>
              </View>

              {/* Selo de Confiança */}
              <View style={styles.secureNotice}>
                <Ionicons name="lock-closed-outline" size={14} color="#111111" />
                <Text style={styles.secureNoticeText}>
                  Transação criptografada de ponta a ponta com seguro garantido
                </Text>
              </View>
            </View>

            <View style={{ height: 110 }} />
          </View>
        )}
      />

      {/* ── Footer Fixo de Checkout ─────────────────────────────────────── */}
      <View style={styles.floatingFooterOuter}>
        <View style={styles.floatingFooterInner}>
          <View style={styles.footerPriceCol}>
            <Text style={styles.footerPriceHeading}>Total da Sacola</Text>
            <Text style={styles.footerPriceAmount}>{formatPrice(finalTotal)}</Text>
          </View>
          <CustomButton
            title="Avançar ao Checkout"
            onPress={() => router.push('/checkout')}
            variant="primary"
            size="large"
            iconElement={<Ionicons name="arrow-forward" size={17} color="#FFFFFF" />}
            style={styles.checkoutActionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAF9F8',
  },
  topHeader: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
  },
  circleHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleColumn: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerCountSubtitle: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
    marginTop: 1,
  },
  clearHeaderBtn: {
    padding: 6,
  },
  clearHeaderText: {
    fontSize: 12.5,
    color: '#737373',
    fontWeight: '600',
  },
  freeShippingBox: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
  },
  shippingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  shippingNoticeTitle: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '500',
  },
  freeShippingSuccess: {
    color: '#059669',
    fontWeight: '700',
  },
  freeShippingAmount: {
    color: '#111111',
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#ECECEC',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  listContainer: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    paddingTop: 16,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ECECEC',
    marginBottom: 16,
  },
  couponInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  couponInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#111111',
  },
  applyCouponBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyCouponBtnDisabled: {
    backgroundColor: '#E5E5E5',
  },
  applyCouponText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  removeCouponBtn: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  removeCouponText: {
    color: '#737373',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  summaryPreTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  summaryLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabelText: {
    fontSize: 13,
    color: '#737373',
    fontWeight: '400',
  },
  summaryValueText: {
    fontSize: 13.5,
    color: '#111111',
    fontWeight: '600',
  },
  freeShippingGreen: {
    color: '#059669',
    fontWeight: '700',
  },
  discountText: {
    color: '#B91C1C',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F0EE',
    marginVertical: 14,
  },
  totalHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalMainLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111111',
  },
  totalInstallmentsNote: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
    marginTop: 2,
  },
  totalHighlightPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7F7F6',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  secureNoticeText: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
    flex: 1,
  },
  floatingFooterOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0EE',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingFooterInner: {
    width: '100%',
    maxWidth: 860,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  footerPriceHeading: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
  },
  footerPriceAmount: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },
  checkoutActionButton: {
    flex: 1,
    marginLeft: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitleText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  emptySubtitleText: {
    fontSize: 13,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    maxWidth: 320,
  },
  emptyExploreButton: {
    width: '100%',
    maxWidth: 280,
  },
});
