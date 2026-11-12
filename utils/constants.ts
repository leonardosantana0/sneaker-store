import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Paleta de Cores Minimalista Luxo (estilo Apple / Kith) ───────────────────
export const COLORS = {
  primary:      '#111111',      // Preto ônix puro para tipografia e botões de destaque
  accent:       '#111111',      // Acento primário minimalista preto puro
  accentRed:    '#B91C1C',      // Vermelho discreto e elegante para descontos
  accentDark:   '#000000',
  accentLight:  '#F4F4F3',      // Tint neutro para fundos sutis
  white:        '#FFFFFF',      // Fundo dos cartões
  offWhite:     '#F9F9F8',      // Fundo geral do ecrã estilo galeria de arte
  surface:      '#FFFFFF',      // Superfície dos cartões
  imageBg:      '#F4F4F2',      // Fundo neutro e respirável da fotografia
  gray:         '#737373',      // Cinza neutro editorial
  lightGray:    '#EBEBE9',      // Bordas ultra finas
  midGray:      '#D4D4D2',      // Bordas de campos
  darkGray:     '#262626',      // Texto secundário escuro
  success:      '#059669',      // Verde esmeralda para benefícios e frete grátis
  successLight: '#F0FDF4',      // Fundo suave de sucesso
  error:        '#B91C1C',
  errorLight:   '#FEF2F2',
  warning:      '#D97706',
  gold:         '#B45309',      // Tom bronze/dourado champagne elegante
  overlay:      'rgba(0,0,0,0.45)',
};

// ─── Sistema de Sombras Difusas e Suaves (Apple/Kith Experience) ─────────────
export const SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 4,
  },
};

// ─── Tipografia ───────────────────────────────────────────────────────────────
export const FONTS = {
  sizes: {
    xs:   11,
    sm:   13,
    md:   14,
    base: 16,
    lg:   18,
    xl:   20,
    xl2:  24,
    xl3:  28,
    xl4:  32,
    xl5:  40,
  },
  weights: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
    black:     '900' as const,
  },
};

// ─── Espaçamento (Breathability) ──────────────────────────────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,                   // paddingHorizontal padrão de 20px
  xl:   24,
  xl2:  32,
  xl3:  40,
  xl4:  48,
  xl5:  64,
};

// ─── Border Radius Moderno ───────────────────────────────────────────────────
export const BORDER_RADIUS = {
  sm:   6,
  md:   10,
  lg:   16,                   // borderRadius: 16 para cartões modernos
  xl:   20,
  xl2:  28,
  full: 999,
};

// ─── Grid de produtos ─────────────────────────────────────────────────────────
// paddingHorizontal: 20px | Gap entre colunas: 16px
export const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.base) / 2;
