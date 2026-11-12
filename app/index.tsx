import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ListRenderItem,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating';

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: 'grid-outline' as const },
  { id: 'running', label: 'Performance', icon: 'flash-outline' as const },
  { id: 'casual', label: 'Lifestyle', icon: 'footsteps-outline' as const },
  { id: 'basketball', label: 'Basquete', icon: 'trophy-outline' as const },
  { id: 'training', label: 'Treino', icon: 'fitness-outline' as const },
];

export default function HomeScreen() {
  const { products, loading } = useProducts();
  const { state: cartState } = useCart();
  const { width } = useWindowDimensions();

  // Grid responsivo inteligente: 4 colunas em telas grandes, 3 em tablet/notebook, 2 no mobile
  const numColumns = width >= 1180 ? 4 : width >= 800 ? 3 : 2;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const filteredAndSortedProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const renderProduct: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <ProductCard
        product={item}
        onPress={() => router.push(`/product/${item.id}` as any)}
      />
    ),
    [],
  );

  const ListHeader = () => (
    <View style={styles.headerWrapper}>
      {/* ── Barra de Pesquisa Minimalista Luxo ───────────────────────── */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={17} color="#737373" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar silhueta, linha ou modelo..."
          placeholderTextColor="#A3A3A3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearSearchBtn}
          >
            <Ionicons name="close-circle" size={17} color="#737373" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Showcase Editorial (Estilo Apple / Kith) ─────────────────── */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <View style={styles.editorialBanner}>
          <View style={styles.editorialTextCol}>
            <View style={styles.editorialTag}>
              <Text style={styles.editorialTagText}>COLEÇÃO 2026 · EDITION 01</Text>
            </View>
            <Text style={styles.editorialTitle}>ESSENCE &{'\n'}MOTION</Text>
            <Text style={styles.editorialSubtitle}>
              Silhuetas emblemáticas com estética contemporânea e entrega com garantia de procedência.
            </Text>
            <TouchableOpacity
              style={styles.editorialCta}
              activeOpacity={0.85}
              onPress={() => setSelectedCategory('running')}
            >
              <Text style={styles.editorialCtaText}>Explorar Seleção</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.editorialImageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' }}
              style={styles.editorialShoeImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {/* ── Seletor de Categorias em Pílula Clean ────────────────────── */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#737373'}
                />
                <Text
                  style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Cabeçalho da Grade & Filtros Refinados ──────────────────── */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'Catálogo Selecionado'
              : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </Text>
          <Text style={styles.sectionCountText}>
            {filteredAndSortedProducts.length}{' '}
            {filteredAndSortedProducts.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}
          </Text>
        </View>

        {/* Chips de Ordenação Minimalistas */}
        <View style={styles.sortChipsRow}>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price-asc' && styles.sortChipActive]}
            onPress={() => setSortBy(sortBy === 'price-asc' ? 'default' : 'price-asc')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortChipText, sortBy === 'price-asc' && styles.sortChipTextActive]}>
              Menor Preço
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'rating' && styles.sortChipActive]}
            onPress={() => setSortBy(sortBy === 'rating' ? 'default' : 'rating')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortChipText, sortBy === 'rating' && styles.sortChipTextActive]}>
              Avaliados
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ── Top Bar Minimalista Luxo ──────────────────────────────────── */}
      <View style={styles.topBarOuter}>
        <View style={styles.topBarInner}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>ARCHIVE</Text>
            <Text style={styles.brandSub}>EDITION</Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.topIconBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="person-outline" size={19} color="#111111" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/cart')}
              style={styles.topIconBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="bag-outline" size={19} color="#111111" />
              {cartState.itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartState.itemCount > 9 ? '9+' : cartState.itemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Feed de Produtos Centralizado ────────────────────────────── */}
      <View style={styles.bodyWrapper}>
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#111111" />
            <Text style={styles.loadingText}>Carregando coleção...</Text>
          </View>
        ) : (
          <FlatList
            style={styles.flatList}
            key={`grid-cols-${numColumns}`}
            data={filteredAndSortedProducts}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            renderItem={renderProduct}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyStateBox}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="search-outline" size={28} color="#737373" />
                </View>
                <Text style={styles.emptyTitle}>Nenhum modelo encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  Experimente redefinir os filtros de busca para ver toda a coleção.
                </Text>
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSortBy('default');
                  }}
                >
                  <Text style={styles.emptyResetText}>Redefinir Filtros</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAF9F8',
  },
  topBarOuter: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
    alignItems: 'center',
  },
  topBarInner: {
    width: '100%',
    maxWidth: 1140,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 2.2,
  },
  brandSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#737373',
    letterSpacing: 1.6,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topIconBtn: {
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
  cartBadge: {
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
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  bodyWrapper: {
    flex: 1,
    width: '100%',
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    width: '100%',
    maxWidth: 1140,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerWrapper: {
    paddingTop: 14,
    paddingBottom: 14,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#111111',
    fontWeight: '500',
  },
  clearSearchBtn: {
    padding: 4,
  },
  editorialBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  editorialTextCol: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },
  editorialTag: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  editorialTagText: {
    color: '#111111',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  editorialTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  editorialSubtitle: {
    fontSize: 11,
    color: '#737373',
    marginTop: 6,
    lineHeight: 15,
  },
  editorialCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111111',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  editorialCtaText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  editorialImageWrapper: {
    width: 110,
    height: 95,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  editorialShoeImage: {
    width: '100%',
    height: '100%',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoriesContent: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  categoryPillActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  categoryLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#737373',
    letterSpacing: 0.3,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
  },
  sectionCountText: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  sortChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  sortChipActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 36,
  },
  loadingText: {
    fontSize: 13,
    color: '#737373',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#737373',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyResetBtn: {
    marginTop: 16,
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyResetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
