import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { formatPrice, formatDiscount } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onToggleFavorite,
  isFavorite: initialFavorite = false,
}) => {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [imageUri, setImageUri] = useState(product.image);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageUri(product.image);
    setHasError(false);
  }, [product.image]);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount ? formatDiscount(product.originalPrice!, product.price) : 0;
  const installmentValue = product.price / 10;

  const handleHeartPress = () => {
    setFavorite((prev) => !prev);
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  const handleImageError = () => {
    if (imageUri !== FALLBACK_IMAGE) {
      setImageUri(FALLBACK_IMAGE);
    } else {
      setHasError(true);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Vitrine de Imagem Minimalista & Respirável */}
      <View style={styles.imageWrapper}>
        {hasError ? (
          <View style={styles.fallbackContainer}>
            <Ionicons name="footsteps-outline" size={40} color="#D4D4D2" />
            <Text style={styles.fallbackLabel}>{product.brand}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            onError={handleImageError}
          />
        )}

        {/* Badges de Cápsula Minimalista */}
        <View style={styles.badgeRow}>
          {product.isNew && (
            <View style={styles.badgeNew}>
              <Text style={styles.badgeNewText}>NOVO</Text>
            </View>
          )}
          {hasDiscount && (
            <View style={styles.badgeDiscount}>
              <Text style={styles.badgeDiscountText}>−{discount}%</Text>
            </View>
          )}
        </View>

        {/* Botão de Favoritar Frosted Glass */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={handleHeartPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.75}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={16}
            color={favorite ? '#111111' : '#737373'}
          />
        </TouchableOpacity>
      </View>

      {/* Bloco de Informações - Estética Apple/Kith */}
      <View style={styles.infoContainer}>
        {/* Metadados: Marca & Classificação Discreta */}
        <View style={styles.topMetaRow}>
          <Text style={styles.brandText} numberOfLines={1}>
            {product.brand}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#111111" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Nome do Produto */}
        <Text style={styles.titleText} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Subtítulo de Categoria */}
        <Text style={styles.categorySubText} numberOfLines={1}>
          {product.category === 'running'
            ? 'Performance'
            : product.category === 'basketball'
            ? 'Basquete'
            : product.category === 'training'
            ? 'Treino'
            : 'Lifestyle'}
        </Text>

        {/* Preço e Parcelamento */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <View style={styles.priceNumbersRow}>
              <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
              {hasDiscount && (
                <Text style={styles.originalPriceText}>
                  {formatPrice(product.originalPrice!)}
                </Text>
              )}
            </View>
            <Text style={styles.installmentText}>
              10x {formatPrice(installmentValue)} sem juros
            </Text>
          </View>

          {/* Seta Minimalista de Ação */}
          <View style={styles.quickAddBtn}>
            <Ionicons name="arrow-forward" size={13} color="#111111" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: '49%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1.15,
    maxHeight: 260,
    backgroundColor: '#F7F7F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  fallbackLabel: {
    fontSize: 9.5,
    color: '#A3A3A3',
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 5,
    zIndex: 2,
  },
  badgeNew: {
    backgroundColor: '#111111',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeNewText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badgeDiscount: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  badgeDiscountText: {
    color: '#111111',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    zIndex: 2,
  },
  infoContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#111111',
  },
  titleText: {
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: '600',
    color: '#111111',
    marginTop: 3,
    letterSpacing: -0.2,
  },
  categorySubText: {
    fontSize: 10.5,
    color: '#8A8A8A',
    marginTop: 2,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceCol: {
    flex: 1,
  },
  priceNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
  },
  originalPriceText: {
    fontSize: 10.5,
    color: '#A3A3A3',
    textDecorationLine: 'line-through',
  },
  installmentText: {
    fontSize: 9.5,
    color: '#525252',
    fontWeight: '500',
    marginTop: 2,
  },
  quickAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    flexShrink: 0,
  },
});

export default ProductCard;
