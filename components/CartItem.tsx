import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../types';
import { formatPrice } from '../utils/formatters';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

/**
 * Item da Sacola com visual premium e refinado estilo sneaker boutique.
 */
const CartItemComponent: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <View style={styles.card}>
      {/* Imagem do Tênis com fundo neutro */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Detalhes do Produto */}
      <View style={styles.infoCol}>
        {/* Topo: Marca, Nome e Lixeira */}
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <Text style={styles.brandText}>{item.product.brand}</Text>
            <Text style={styles.titleText} numberOfLines={1}>
              {item.product.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteCircleBtn}
            onPress={onRemove}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={17} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Especificação (Tamanho e Cor) */}
        <View style={styles.metaRow}>
          <View style={styles.colorWrapper}>
            <View
              style={[
                styles.colorDotIndicator,
                { backgroundColor: item.selectedColor },
                item.selectedColor.toLowerCase() === '#ffffff' && styles.whiteColorBorder,
              ]}
            />
            <Text style={styles.metaText}>Tam. {item.selectedSize}</Text>
          </View>
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Em Estoque</Text>
          </View>
        </View>

        {/* Rodapé: Preço e Controle de Quantidade */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceHighlight}>
              {formatPrice(item.product.price)}
            </Text>
            {item.quantity > 1 && (
              <Text style={styles.subtotalText}>
                Total: {formatPrice(item.product.price * item.quantity)}
              </Text>
            )}
          </View>

          {/* Stepper de Quantidade Moderno */}
          <View style={styles.counterPill}>
            <TouchableOpacity
              style={styles.counterActionButton}
              onPress={() => onUpdateQuantity(item.quantity - 1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.6}
            >
              <Ionicons name="remove" size={15} color="#111827" />
            </TouchableOpacity>

            <Text style={styles.quantityNumberText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.counterActionButton}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.6}
            >
              <Ionicons name="add" size={15} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  imageContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#F7F7F6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#F0F0EE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 6,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  deleteCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  colorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDotIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  whiteColorBorder: {
    borderWidth: 1,
    borderColor: '#D4D4D2',
  },
  metaText: {
    fontSize: 12,
    color: '#737373',
    fontWeight: '500',
  },
  stockBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  stockText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  priceHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.2,
  },
  subtotalText: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F4',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  counterActionButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    minWidth: 26,
    textAlign: 'center',
  },
});

export default CartItemComponent;