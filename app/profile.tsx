import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { saveProfile, loadProfile } from '../services/storageService';
import { formatPhone } from '../utils/formatters';
import CustomButton from '../components/CustomButton';
import { UserProfile } from '../types';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  photoUri: null,
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  useEffect(() => {
    const init = async () => {
      const saved = await loadProfile();
      if (saved) setProfile(saved);
      setLoading(false);
    };
    init();
  }, []);

  const handleTakePhoto = async () => {
    setPickingImage(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão requerida',
          'Permita o acesso à câmera para registrar sua foto de perfil.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProfile((prev) => ({ ...prev, photoUri: result.assets[0].uri }));
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível acionar a câmera.');
    } finally {
      setPickingImage(false);
    }
  };

  const handlePickFromGallery = async () => {
    setPickingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão requerida',
          'Permita o acesso à galeria para selecionar uma imagem.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProfile((prev) => ({ ...prev, photoUri: result.assets[0].uri }));
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a galeria.');
    } finally {
      setPickingImage(false);
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, informe seu nome completo.');
      return;
    }
    setSaving(true);
    try {
      await saveProfile(profile);
      Alert.alert('Perfil Atualizado', 'Suas informações cadastrais foram salvas com sucesso.');
    } catch {
      Alert.alert('Erro', 'Houve uma falha ao salvar seu perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={20} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111111" />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Minha Conta</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Seção Superior de Foto & Identidade Minimalista ───────────── */}
        <View style={styles.heroCard}>
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={handlePickFromGallery}
            activeOpacity={0.85}
          >
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person-outline" size={38} color="#737373" />
              </View>
            )}

            {pickingImage && (
              <View style={styles.photoOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}

            <View style={styles.photoEditBadge}>
              <Ionicons name="camera-outline" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.vipBadge}>
            <Text style={styles.vipBadgeText}>ARCHIVE CLUB · BLACK EDITION</Text>
          </View>

          <Text style={styles.photoName} numberOfLines={1}>
            {profile.name || 'Membro Convidado'}
          </Text>
          <Text style={styles.photoEmail} numberOfLines={1}>
            {profile.email || 'Complete seus dados de cadastro'}
          </Text>

          {/* Botões de Ação de Foto */}
          <View style={styles.photoBtnsRow}>
            <TouchableOpacity
              style={styles.photoActionBtn}
              onPress={handleTakePhoto}
              disabled={pickingImage}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={15} color="#111111" />
              <Text style={styles.photoActionLabel}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoActionBtn}
              onPress={handlePickFromGallery}
              disabled={pickingImage}
              activeOpacity={0.8}
            >
              <Ionicons name="images-outline" size={15} color="#111111" />
              <Text style={styles.photoActionLabel}>Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Card de Informações Pessoais ─────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="person-outline" size={17} color="#111111" />
            </View>
            <View>
              <Text style={styles.cardPreTitle}>DADOS PESSOAIS</Text>
              <Text style={styles.cardTitle}>Informações de Contato</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="person-circle-outline" size={17} color="#737373" />
              <TextInput
                style={styles.inputInner}
                value={profile.name}
                onChangeText={(text) => setProfile((p) => ({ ...p, name: text }))}
                placeholder="Ex: Marcus Jordan"
                placeholderTextColor="#A3A3A3"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="mail-outline" size={17} color="#737373" />
              <TextInput
                style={styles.inputInner}
                value={profile.email}
                onChangeText={(text) => setProfile((p) => ({ ...p, email: text }))}
                placeholder="Ex: jordan@archive.com"
                placeholderTextColor="#A3A3A3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Telefone / Celular</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="call-outline" size={17} color="#737373" />
              <TextInput
                style={styles.inputInner}
                value={profile.phone}
                onChangeText={(text) =>
                  setProfile((p) => ({ ...p, phone: formatPhone(text) }))
                }
                placeholder="(11) 99999-9999"
                placeholderTextColor="#A3A3A3"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* ── Card de Atalhos e Central de Ajuda ───────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="grid-outline" size={17} color="#111111" />
            </View>
            <View>
              <Text style={styles.cardPreTitle}>GESTÃO</Text>
              <Text style={styles.cardTitle}>Preferências da Conta</Text>
            </View>
          </View>

          {[
            {
              icon: 'bag-outline' as const,
              label: 'Minha Sacola de Compras',
              subtitle: 'Ver modelos selecionados',
              onPress: () => router.push('/cart'),
            },
            {
              icon: 'location-outline' as const,
              label: 'Endereço e Logística',
              subtitle: 'Consultar CEPs e rotas',
              onPress: () => router.push('/checkout'),
            },
            {
              icon: 'time-outline' as const,
              label: 'Histórico de Aquisições',
              subtitle: 'Rastrear expedições em trânsito',
              onPress: () =>
                Alert.alert('Rastreamento', 'Seus pedidos confirmados aparecem com código de rastreamento oficial.'),
            },
            {
              icon: 'shield-checkmark-outline' as const,
              label: 'Garantia e Autenticidade',
              subtitle: 'Certificação e troca em até 30 dias',
              onPress: () =>
                Alert.alert(
                  'Certificação Archive',
                  'Todos os calçados possuem certificado de autenticidade emitido por especialistas.',
                ),
            },
          ].map((action, index, arr) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.actionRow,
                index === arr.length - 1 && styles.actionRowLast,
              ]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name={action.icon} size={18} color="#111111" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A3A3A3" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Botão Salvar ────────────────────────────────────────────── */}
        <View style={styles.saveContainer}>
          <CustomButton
            title="Salvar Informações"
            onPress={handleSave}
            variant="primary"
            size="large"
            loading={saving}
            iconElement={<Ionicons name="checkmark-sharp" size={17} color="#FFFFFF" />}
            fullWidth
          />
        </View>
      </ScrollView>
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
    maxWidth: 780,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  photoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    position: 'relative',
    marginBottom: 14,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F7F7F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECECEC',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#111111',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  vipBadge: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  vipBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 1,
  },
  photoName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.2,
  },
  photoEmail: {
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
  },
  photoBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  photoActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
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
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525252',
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  inputInner: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 13.5,
    color: '#111111',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
    gap: 12,
  },
  actionRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  actionIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7F7F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#737373',
    marginTop: 1,
  },
  saveContainer: {
    marginTop: 6,
  },
});
