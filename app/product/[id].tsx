import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProductById } from '../../utils/mockData';
import { formatPrice, formatDiscount, formatRating } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import CustomButton from '../../components/CustomButton';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, state: cartState } = useCart();

  const product = getProductById(id ?? '');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0] ?? '#111111');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUri, setImageUri] = useState(product?.image ?? FALLBACK_IMAGE);

  useEffect(() => {
    if (product?.image) {
      setImageUri(product.image);
    }
  }, [product?.image]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.notFoundBox}>
          <Ionicons name="alert-circle-outline" size={44} color="#737373" />
          <Text style={styles.notFoundTitle}>Modelo indisponível</Text>
          <TouchableOpacity
            style={styles.notFoundBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={15} color="#FFFFFF" />
            <Text style={styles.notFoundBtnText}>Voltar à Vitrine</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount ? formatDiscount(product.originalPrice!, product.price) : 0;
  const installments = product.price / 10;

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert(
        'Selecione a numeração',
        'Por favor, selecione seu tamanho BR antes de prosseguir com a reserva.',
      );
      return;
    }

    addToCart(product, selectedSize, selectedColor);

    Alert.alert(
      'Adicionado à Sacola',
      `${product.name} (Tamanho ${selectedSize}) foi reservado com sucesso na sua sacola.`,
      [
        { text: 'Continuar Navegando', style: 'cancel' },
        { text: 'Ver Sacola', onPress: () => router.push('/cart') },
      ],
    );
  };

  const categoryLabel: Record<string, string> = {
    running: 'Performance',
    casual: 'Lifestyle',
    basketball: 'Basquete',
    training: 'Treino',
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ── Top Bar / Header Minimalista ──────────────────────────────── */}
      <View style={styles.topHeaderOuter}>
        <View style={styles.topHeaderInner}>
          <TouchableOpacity
            style={styles.circleHeaderBtn}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={20} color="#111111" />
          </TouchableOpacity>

          <Text style={styles.headerProductName} numberOfLines={1}>
            {product.brand} · {product.name}
          </Text>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.circleHeaderBtn}
              onPress={() => setIsFavorite((prev) => !prev)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#111111' : '#737373'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleHeaderBtn}
              onPress={() => router.push('/cart')}
              activeOpacity={0.75}
            >
              <Ionicons name="bag-outline" size={18} color="#111111" />
              {cartState.itemCount > 0 && (
                <View style={styles.headerCartBadge}>
                  <Text style={styles.headerCartBadgeText}>
                    {cartState.itemCount > 9 ? '9+' : cartState.itemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Vitrine Visual da Fotografia ────────────────────────────── */}
        <View style={styles.heroImageWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.heroImage}
            resizeMode="contain"
            onError={() => setImageUri(FALLBACK_IMAGE)}
          />

          <View style={styles.floatingBadges}>
            {product.isNew && (
              <View style={styles.badgeNew}>
                <Text style={styles.badgeNewText}>EDITION</Text>
              </View>
            )}
            {hasDiscount && (
              <View style={styles.badgeDiscount}>
                <Text style={styles.badgeDiscountText}>−{discount}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Painel de Informações do Calçado ────────────────────────── */}
        <View style={styles.mainInfoCard}>
          <View style={styles.brandCategoryRow}>
            <Text style={styles.productBrandText}>{product.brand}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {categoryLabel[product.category] || 'Silhueta'}
              </Text>
            </View>
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Avaliação e Reviews */}
          <View style={styles.ratingRow}>
            <View style={styles.starsWrapper}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={13}
                  color="#111111"
                />
              ))}
            </View>
            <Text style={styles.ratingValue}>{formatRating(product.rating)}</Text>
            <Text style={styles.reviewCountText}>
              ({product.reviewCount.toLocaleString('pt-BR')} avaliações verificadas)
            </Text>
          </View>

          {/* Bloco de Preço Minimalista */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.mainPriceText}>{formatPrice(product.price)}</Text>
              {hasDiscount && (
                <Text style={styles.originalPriceStriked}>
                  {formatPrice(product.originalPrice!)}
                </Text>
              )}
            </View>
            <Text style={styles.installmentsText}>
              Em até 10x de {formatPrice(installments)} sem juros no cartão
            </Text>
          </View>

          <View style={styles.horizontalDivider} />

          {/* ── Seletor de Cores ────────────────────────────────────── */}
          <View style={styles.selectorBlock}>
            <Text style={styles.selectorHeaderTitle}>Variações de Cor</Text>
            <View style={styles.colorsListRow}>
              {product.colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorRing,
                      isSelected && styles.colorRingActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.colorChoiceDot,
                        { backgroundColor: color },
                        color.toLowerCase() === '#ffffff' && styles.colorChoiceWhite,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          {/* ── Seletor de Tamanhos ──────────────────────────────────── */}
          <View style={styles.selectorBlock}>
            <View style={styles.selectorHeaderRow}>
              <Text style={styles.selectorHeaderTitle}>Numeração (BR)</Text>
              {selectedSize && (
                <Text style={styles.selectedSizeLabel}>Tam. {selectedSize} selecionado</Text>
              )}
            </View>

            <View style={styles.sizesGridContainer}>
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[styles.sizeOptionBtn, isSelected && styles.sizeOptionBtnActive]}
                    onPress={() => setSelectedSize(size)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.sizeOptionText,
                        isSelected && styles.sizeOptionTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          {/* ── Selos de Autenticidade e Garantia ──────────────────────── */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark-outline" size={17} color="#111111" />
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Procedência e Autenticidade Verificadas</Text>
                <Text style={styles.benefitSubtitle}>Todos os calçados passam por análise minuciosa de autenticidade</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="cube-outline" size={17} color="#111111" />
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Logística Expressa com Rastreamento</Text>
                <Text style={styles.benefitSubtitle}>Embalagem protetora reforçada e seguro integral contra extravios</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="swap-horizontal-outline" size={17} color="#111111" />
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Política de Troca Descomplicada</Text>
                <Text style={styles.benefitSubtitle}>Primeira troca gratuita em até 30 dias após a entrega</Text>
              </View>
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          {/* ── Descrição Detalhada do Calçado ──────────────────────── */}
          <View style={styles.descriptionBlock}>
            <Text style={styles.selectorHeaderTitle}>Sobre o Modelo</Text>
            <Text style={styles.descriptionBodyText}>{product.description}</Text>
          </View>

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* ── Footer de Ação Fixo ─────────────────────────────────────────── */}
      <View style={styles.floatingFooterOuter}>
        <View style={styles.floatingFooterInner}>
          <View style={styles.footerPriceBlock}>
            <Text style={styles.footerPriceLabel}>Valor Final</Text>
            <Text style={styles.footerPriceValue}>{formatPrice(product.price)}</Text>
          </View>
          <CustomButton
            title="Adicionar à Sacola"
            onPress={handleAddToCart}
            variant="primary"
            size="large"
            iconElement={<Ionicons name="bag-outline" size={17} color="#FFFFFF" />}
            style={styles.addToCartBtn}
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
  topHeaderOuter: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
    alignItems: 'center',
  },
  topHeaderInner: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 14,
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
    position: 'relative',
  },
  headerProductName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#111111',
    borderRadius: 999,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroImageWrapper: {
    width: '100%',
    height: 340,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
    elevation: 2,
  },
  heroImage: {
    width: '84%',
    height: '84%',
  },
  floatingBadges: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  badgeNew: {
    backgroundColor: '#111111',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeNewText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badgeDiscount: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  badgeDiscountText: {
    color: '#111111',
    fontSize: 9.5,
    fontWeight: '800',
  },
  mainInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
    elevation: 2,
  },
  brandCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productBrandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  categoryBadge: {
    backgroundColor: '#F7F7F6',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  categoryBadgeText: {
    fontSize: 10.5,
    color: '#737373',
    fontWeight: '600',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginTop: 8,
    letterSpacing: -0.4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  starsWrapper: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  reviewCountText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  priceContainer: {
    marginTop: 18,
    backgroundColor: '#F8F8F7',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  mainPriceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.4,
  },
  originalPriceStriked: {
    fontSize: 14,
    color: '#A3A3A3',
    textDecorationLine: 'line-through',
  },
  installmentsText: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '500',
    marginTop: 4,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#F0F0EE',
    marginVertical: 20,
  },
  selectorBlock: {},
  selectorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectedSizeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737373',
  },
  colorsListRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  colorRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRingActive: {
    borderColor: '#111111',
  },
  colorChoiceDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorChoiceWhite: {
    borderWidth: 1,
    borderColor: '#D4D4D2',
  },
  sizesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOptionBtn: {
    width: 54,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  sizeOptionBtnActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  sizeOptionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#525252',
  },
  sizeOptionTextActive: {
    color: '#FFFFFF',
  },
  benefitsContainer: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F8F7',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111111',
  },
  benefitSubtitle: {
    fontSize: 11,
    color: '#737373',
    marginTop: 1,
  },
  descriptionBlock: {},
  descriptionBodyText: {
    fontSize: 13.5,
    color: '#525252',
    lineHeight: 22,
    marginTop: 8,
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
    maxWidth: 960,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  footerPriceBlock: {
    justifyContent: 'center',
  },
  footerPriceLabel: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },
  addToCartBtn: {
    flex: 1,
    marginLeft: 20,
  },
  notFoundBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginTop: 12,
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  notFoundBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
