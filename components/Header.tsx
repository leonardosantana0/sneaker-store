import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  cartCount?: number;
  onCartPress?: () => void;
  onProfilePress?: () => void;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

/**
 * Cabeçalho Minimalista Luxo (estilo Apple / Kith).
 */
const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showCart = false,
  showProfile = false,
  cartCount = 0,
  onCartPress,
  onProfilePress,
  onBackPress,
  rightAction,
}) => {
  const handleBack = () => (onBackPress ? onBackPress() : router.back());
  const handleCart = () => (onCartPress ? onCartPress() : router.push('/cart'));
  const handleProfile = () => (onProfilePress ? onProfilePress() : router.push('/profile'));

  return (
    <View style={styles.containerOuter}>
      <View style={styles.containerInner}>
        {/* Lado Esquerdo */}
        <View style={styles.sideSlot}>
          {showBack && (
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={20} color="#111111" />
            </TouchableOpacity>
          )}
        </View>

        {/* Centro */}
        <View style={styles.centerSlot}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Lado Direito */}
        <View style={[styles.sideSlot, styles.sideSlotRight]}>
          {rightAction}

          {showProfile && (
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={handleProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={19} color="#111111" />
            </TouchableOpacity>
          )}

          {showCart && (
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={handleCart}
              activeOpacity={0.7}
            >
              <Ionicons name="bag-outline" size={19} color="#111111" />
              {cartCount > 0 && (
                <View style={styles.badgeWrapper}>
                  <Text style={styles.badgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerOuter: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
    alignItems: 'center',
  },
  containerInner: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 14,
  },
  sideSlot: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSlotRight: {
    justifyContent: 'flex-end',
    gap: 8,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#111111',
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#737373',
    marginTop: 2,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F7F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  badgeWrapper: {
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
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default Header;
