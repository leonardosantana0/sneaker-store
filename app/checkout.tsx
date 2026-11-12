import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchAddressByCep } from '../services/viaCepService';
import { formatPrice, formatCEP } from '../utils/formatters';
import { useCart } from '../hooks/useCart';
import CustomButton from '../components/CustomButton';
import { Address } from '../types';

const SHIPPING_FEE = 29.90;
const FREE_SHIPPING_THRESHOLD = 800;

type PaymentMethod = 'pix' | 'credit' | 'boleto';

export default function CheckoutScreen() {
  const { state: cartState, clearCart } = useCart();

  // Address state
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<Address | null>(null);
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [cityOverride, setCityOverride] = useState('');

  // Loading states
  const [fetchingCep, setFetchingCep] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const isFreeShipping = cartState.total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = cartState.items.length === 0 ? 0 : isFreeShipping ? 0 : SHIPPING_FEE;
  // PIX offers 5% discount
  const pixDiscount = paymentMethod === 'pix' ? cartState.total * 0.05 : 0;
  const totalWithShipping = Math.max(0, cartState.total + shippingCost - pixDiscount);

  // ── ViaCEP ────────────────────────────────────────────────────────────────
  const handleCepChange = (text: string) => {
    const formatted = formatCEP(text);
    setCep(formatted);
    const digits = text.replace(/\D/g, '');
    if (digits.length === 8) {
      fetchAddress(formatted);
    }
  };

  const fetchAddress = async (cepValue: string) => {
    setFetchingCep(true);
    setAddress(null);
    try {
      const result = await fetchAddressByCep(cepValue);
      setAddress(result);
      setCityOverride(result.localidade);
    } catch (err: any) {
      Alert.alert('CEP não localizado', err.message ?? 'Verifique o código postal e tente novamente.');
    } finally {
      setFetchingCep(false);
    }
  };

  // ── expo-location (GPS) ───────────────────────────────────────────────────
  const handleUseLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão requerida',
          'Ative os serviços de localização para preenchimento ágil do endereço.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocoded = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geocoded.length > 0) {
        const loc = geocoded[0];
        const city = loc.city ?? loc.subregion ?? loc.region ?? '';
        const state = loc.region ?? '';
        const postalCode = loc.postalCode ?? '';

        setCityOverride(city);

        if (!address) {
          setAddress({
            cep: postalCode,
            logradouro: loc.street ?? '',
            bairro: loc.district ?? loc.subregion ?? '',
            localidade: city,
            uf: state,
          });
          if (postalCode) {
            setCep(formatCEP(postalCode));
          }
        }

        Alert.alert(
          'Localização Identificada',
          `${city}${state ? ` - ${state}` : ''}\nComplete o número e complemento abaixo.`,
        );
      } else {
        Alert.alert('Aviso', 'Não foi possível detectar a localidade exata via GPS.');
      }
    } catch {
      Alert.alert('GPS Indisponível', 'Verifique se o serviço de localização está ativo no aparelho.');
    } finally {
      setFetchingLocation(false);
    }
  };

  // ── Confirmar Pedido ──────────────────────────────────────────────────────
  const handleConfirmOrder = async () => {
    if (!address) {
      Alert.alert('Endereço requerido', 'Informe o CEP para carregar o endereço de entrega.');
      return;
    }
    if (!number.trim()) {
      Alert.alert('Número obrigatório', 'Informe o número do imóvel para entrega.');
      return;
    }
    if (cartState.items.length === 0) {
      Alert.alert('Sacola vazia', 'Adicione modelos antes de concluir o pedido.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1600));
    setSubmitting(false);

    const generatedCode = `ARC-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(generatedCode);
    clearCart();
    setOrderSuccess(true);
  };

  const paymentOptions: {
    id: PaymentMethod;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    detail: string;
    badge?: string;
  }[] = [
    {
      id: 'pix',
      label: 'PIX Instantâneo',
      icon: 'flash-outline',
      detail: 'Liquidação imediata · 5% de desconto cortesia',
      badge: '5% OFF',
    },
    {
      id: 'credit',
      label: 'Cartão de Crédito',
      icon: 'card-outline',
      detail: 'Até 10x sem acréscimo de juros',
    },
    {
      id: 'boleto',
      label: 'Boleto Bancário',
      icon: 'barcode-outline',
      detail: 'Compensação padrão em até 1 dia útil',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header Minimalista ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={20} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── Stepper Visual em Linhas Finas ──────────────────────────────── */}
      <View style={styles.stepsContainer}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepCircleTextActive}>1</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Entrega</Text>
        </View>

        <View style={[styles.stepLine, styles.stepLineActive]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepCircleTextActive}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Pagamento</Text>
        </View>

        <View style={[styles.stepLine, address ? styles.stepLineActive : null]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, address && number ? styles.stepCircleActive : null]}>
            <Text style={address && number ? styles.stepCircleTextActive : styles.stepCircleText}>3</Text>
          </View>
          <Text style={[styles.stepLabel, address && number ? styles.stepLabelActive : null]}>Revisão</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Card 1: Endereço de Entrega ─────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="location-outline" size={17} color="#111111" />
            </View>
            <View>
              <Text style={styles.cardPreTitle}>ETAPA 01</Text>
              <Text style={styles.cardTitle}>Endereço de Entrega</Text>
            </View>
          </View>

          {/* Input CEP */}
          <Text style={styles.inputLabel}>Código Postal (CEP)</Text>
          <View style={styles.cepRow}>
            <TextInput
              style={[styles.input, styles.cepInput]}
              value={cep}
              onChangeText={handleCepChange}
              placeholder="00000-000"
              placeholderTextColor="#A3A3A3"
              keyboardType="numeric"
              maxLength={9}
            />
            <TouchableOpacity
              style={[
                styles.cepSearchBtn,
                cep.replace(/\D/g, '').length !== 8 && styles.cepSearchBtnDisabled,
              ]}
              onPress={() => fetchAddress(cep)}
              disabled={fetchingCep || cep.replace(/\D/g, '').length !== 8}
              activeOpacity={0.8}
            >
              {fetchingCep ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.cepSearchText}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Botão de GPS Minimalista */}
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={handleUseLocation}
            disabled={fetchingLocation}
            activeOpacity={0.8}
          >
            {fetchingLocation ? (
              <ActivityIndicator size="small" color="#111111" />
            ) : (
              <Ionicons name="navigate-outline" size={18} color="#111111" />
            )}
            <View style={styles.locationBtnTextContainer}>
              <Text style={styles.locationBtnTitle}>
                {fetchingLocation ? 'Consultando coordenadas...' : 'Usar localização atual'}
              </Text>
              <Text style={styles.locationBtnSubtitle}>Preenchimento inteligente via GPS</Text>
            </View>
          </TouchableOpacity>

          {/* Card com dados do CEP */}
          {address && (
            <View style={styles.addressBox}>
              <View style={styles.addressBoxHeader}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
                <Text style={styles.addressBoxTitle}>Endereço Identificado</Text>
              </View>

              <View style={styles.addressDetails}>
                {address.logradouro ? (
                  <Text style={styles.addressStreet}>{address.logradouro}</Text>
                ) : null}
                <Text style={styles.addressLocation}>
                  {address.bairro ? `${address.bairro} · ` : ''}
                  {cityOverride || address.localidade} — {address.uf}
                </Text>
                <Text style={styles.addressCep}>CEP: {address.cep}</Text>
              </View>

              {/* Número e Complemento */}
              <View style={styles.extraInputsRow}>
                <View style={styles.extraInputHalf}>
                  <Text style={styles.inputLabel}>Número *</Text>
                  <TextInput
                    style={styles.input}
                    value={number}
                    onChangeText={setNumber}
                    placeholder="Ex: 120"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.extraInputHalf}>
                  <Text style={styles.inputLabel}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    value={complement}
                    onChangeText={setComplement}
                    placeholder="Ex: Apto 32"
                    placeholderTextColor="#A3A3A3"
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ── Card 2: Forma de Pagamento ──────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="card-outline" size={17} color="#111111" />
            </View>
            <View>
              <Text style={styles.cardPreTitle}>ETAPA 02</Text>
              <Text style={styles.cardTitle}>Forma de Pagamento</Text>
            </View>
          </View>

          {paymentOptions.map((opt) => {
            const isSelected = paymentMethod === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.paymentCard,
                  isSelected && styles.paymentCardSelected,
                ]}
                onPress={() => setPaymentMethod(opt.id)}
                activeOpacity={0.8}
              >
                {/* Rádio minimalista */}
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>

                {/* Ícone */}
                <View style={[styles.paymentIconWrapper, isSelected && styles.paymentIconWrapperActive]}>
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color="#111111"
                  />
                </View>

                {/* Detalhes */}
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentTitleRow}>
                    <Text style={[styles.paymentLabel, isSelected && styles.paymentLabelActive]}>
                      {opt.label}
                    </Text>
                    {opt.badge && (
                      <View style={styles.paymentBadge}>
                        <Text style={styles.paymentBadgeText}>{opt.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.paymentDetail}>{opt.detail}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Card 3: Resumo do Pedido ────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="receipt-outline" size={17} color="#111111" />
            </View>
            <View>
              <Text style={styles.cardPreTitle}>ETAPA 03</Text>
              <Text style={styles.cardTitle}>Resumo da Aquisição</Text>
            </View>
          </View>

          {cartState.items.map((item) => (
            <View key={`${item.product.id}-${item.selectedSize}`} style={styles.summaryItemRow}>
              <View style={styles.summaryItemBadge}>
                <Text style={styles.summaryItemBadgeText}>{item.quantity}x</Text>
              </View>
              <View style={styles.summaryItemInfo}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.summaryItemMeta}>
                  Tamanho: {item.selectedSize}
                </Text>
              </View>
              <Text style={styles.summaryItemPrice}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalBreakdownRow}>
            <Text style={styles.totalBreakdownLabel}>Subtotal</Text>
            <Text style={styles.totalBreakdownValue}>{formatPrice(cartState.total)}</Text>
          </View>

          <View style={styles.totalBreakdownRow}>
            <Text style={styles.totalBreakdownLabel}>Envio Expresso</Text>
            <Text
              style={[
                styles.totalBreakdownValue,
                isFreeShipping && styles.freeShippingGreen,
              ]}
            >
              {isFreeShipping ? 'Cortesia' : formatPrice(shippingCost)}
            </Text>
          </View>

          {pixDiscount > 0 && (
            <View style={styles.totalBreakdownRow}>
              <Text style={[styles.totalBreakdownLabel, styles.discountText]}>
                Benefício PIX (5%)
              </Text>
              <Text style={[styles.totalBreakdownValue, styles.discountText]}>
                −{formatPrice(pixDiscount)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.grandTotalRow}>
            <View>
              <Text style={styles.grandTotalLabel}>TOTAL DO PEDIDO</Text>
              <Text style={styles.grandTotalNote}>
                {paymentMethod === 'pix' ? 'Liquidação imediata' : 'Em até 10x sem juros'}
              </Text>
            </View>
            <Text style={styles.grandTotalValue}>{formatPrice(totalWithShipping)}</Text>
          </View>
        </View>

        {/* ── CTA Final de Confirmação ────────────────────────────────── */}
        <View style={styles.actionContainer}>
          <CustomButton
            title={`Confirmar Pedido • ${formatPrice(totalWithShipping)}`}
            onPress={handleConfirmOrder}
            variant="primary"
            size="large"
            loading={submitting}
            iconElement={<Ionicons name="lock-closed-outline" size={16} color="#FFFFFF" />}
            fullWidth
          />
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#737373" />
            <Text style={styles.securityText}>Processamento seguro com criptografia bancária</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Modal de Pedido Confirmado - Recibo de Luxo ────────────────── */}
      <Modal visible={orderSuccess} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={32} color="#111111" />
            </View>

            <Text style={styles.modalTitle}>Pedido Confirmado</Text>
            <Text style={styles.modalSubtitle}>
              Sua solicitação foi registrada no arquivo oficial e está em fase de preparação para expedição.
            </Text>

            <View style={styles.orderCodeBox}>
              <Text style={styles.orderCodeLabel}>CÓDIGO DE RASTREAMENTO</Text>
              <Text style={styles.orderCodeValue}>{orderCode}</Text>
            </View>

            <View style={styles.orderSummaryBox}>
              <Text style={styles.orderSummaryLine}>
                Total liquidado: <Text style={styles.boldDark}>{formatPrice(totalWithShipping)}</Text>
              </Text>
              <Text style={styles.orderSummaryLine}>
                Modalidade: <Text style={styles.boldDark}>{paymentOptions.find((p) => p.id === paymentMethod)?.label}</Text>
              </Text>
              <Text style={styles.orderSummaryLine}>
                Prazo estimado: <Text style={styles.boldDark}>3 a 5 dias úteis</Text>
              </Text>
            </View>

            <CustomButton
              title="Voltar ao Catálogo"
              onPress={() => {
                setOrderSuccess(false);
                router.push('/');
              }}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F8',
  },
  header: {
    width: '100%',
    maxWidth: 820,
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
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
    gap: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F0F0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#111111',
  },
  stepCircleText: {
    fontSize: 10,
    color: '#8A8A8A',
    fontWeight: '700',
  },
  stepCircleTextActive: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stepLabel: {
    fontSize: 10.5,
    color: '#8A8A8A',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#111111',
    fontWeight: '700',
  },
  stepLine: {
    width: 36,
    height: 1.5,
    backgroundColor: '#ECECEC',
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: '#111111',
  },
  scroll: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECECEC',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  cardHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPreTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525252',
    marginBottom: 6,
  },
  cepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 13.5,
    color: '#111111',
    fontWeight: '500',
  },
  cepInput: {
    flex: 1,
  },
  cepSearchBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cepSearchBtnDisabled: {
    backgroundColor: '#E5E5E5',
  },
  cepSearchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  locationBtnTextContainer: {
    flex: 1,
  },
  locationBtnTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#111111',
  },
  locationBtnSubtitle: {
    fontSize: 11,
    color: '#737373',
    marginTop: 1,
  },
  addressBox: {
    backgroundColor: '#F8F8F7',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  addressBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressBoxTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressStreet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  addressLocation: {
    fontSize: 12,
    color: '#525252',
    marginTop: 2,
  },
  addressCep: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  extraInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  extraInputHalf: {
    flex: 1,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#ECECEC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  paymentCardSelected: {
    borderColor: '#111111',
    backgroundColor: '#F8F8F7',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D4D4D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#111111',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111111',
  },
  paymentIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconWrapperActive: {
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111111',
  },
  paymentLabelActive: {
    fontWeight: '700',
  },
  paymentBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  paymentBadgeText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '700',
  },
  paymentDetail: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  summaryItemBadge: {
    backgroundColor: '#F7F7F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  summaryItemBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111111',
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  summaryItemMeta: {
    fontSize: 11,
    color: '#737373',
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0EE',
    marginVertical: 12,
  },
  totalBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalBreakdownLabel: {
    fontSize: 13,
    color: '#737373',
  },
  totalBreakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  freeShippingGreen: {
    color: '#059669',
    fontWeight: '700',
  },
  discountText: {
    color: '#B91C1C',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.5,
  },
  grandTotalNote: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },
  actionContainer: {
    marginTop: 8,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  securityText: {
    fontSize: 11,
    color: '#737373',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#737373',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  orderCodeBox: {
    backgroundColor: '#F8F8F7',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 18,
    borderWidth: 1,
    borderColor: '#ECECEC',
    width: '100%',
  },
  orderCodeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1.2,
  },
  orderCodeValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
    marginTop: 3,
    letterSpacing: 2,
  },
  orderSummaryBox: {
    width: '100%',
    backgroundColor: '#F8F8F7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  orderSummaryLine: {
    fontSize: 12,
    color: '#737373',
  },
  boldDark: {
    fontWeight: '600',
    color: '#111111',
  },
});
