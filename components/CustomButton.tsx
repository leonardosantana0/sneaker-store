import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'small' | 'medium' | 'large';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconElement?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

/**
 * Botão reutilizável de alto padrão estilo Nike SNKRS.
 * - Formato pill moderno (borderRadius: 999)
 * - Cores da Nike: Preto premium (#111111) ou Laranja/Vermelho vibrante (#FF4500)
 * - Sombra suave e tipografia marcante
 */
const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconElement,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    (variant === 'primary' || variant === 'secondary') && styles.shadowEffect,
    style,
  ].filter(Boolean) as ViewStyle[];

  const labelStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.84}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#111111' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View style={styles.row}>
          {iconElement ? iconElement : icon ? <Text style={[styles.icon, styles[`text_${variant}`]]}>{icon}</Text> : null}
          <Text style={labelStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999, // Pill elegante
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.38,
  },
  shadowEffect: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
  },
  icon: {
    fontSize: 16,
  },

  // ── Variantes de Cores Minimalista Luxo ─────────────────────────────────────
  variant_primary: {
    backgroundColor: '#111111', // Preto ônix refinado
  },
  variant_secondary: {
    backgroundColor: '#111111', // Preto luxuoso consistente
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.2,
    borderColor: '#111111',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  // ── Tamanhos ─────────────────────────────────────────────────────────────────
  size_small: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  size_medium: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  size_large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },

  // ── Tipografia ───────────────────────────────────────────────────────────────
  text: {
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: '#111111',
  },
  text_ghost: {
    color: '#111111',
  },

  textSize_small: {
    fontSize: 12,
  },
  textSize_medium: {
    fontSize: 14,
  },
  textSize_large: {
    fontSize: 16,
  },
});

export default CustomButton;
