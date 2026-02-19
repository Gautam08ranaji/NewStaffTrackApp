import i18n from '@/i18n';
import { useTheme } from '@/theme/ThemeContext'; // 🌿 Sahara Theme Context
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Language = { code: string; label: string; nativeLabel: string };

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
 
];

export default function LanguageSelection() {
  const { theme, isDarkMode, toggleTheme } = useTheme(); // Theme + Toggle
  const { t } = useTranslation();
  const router = useRouter();

  const [selected, setSelected] = useState(i18n.language || 'en');
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // 🔥 UPDATED — change language instantly
  const handleSelect = async (code: string) => {
    setSelected(code);
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('appLanguage', code);
  };

  const handleContinue = async (lang: string) => {
    setLoading(true);
    try {
 
  
      router.push('/login');

    } catch (err) {
      console.error('Error changing language:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMore = () => setShowAll(true);
  const handleShowLess = () => setShowAll(false);

  const { width } = Dimensions.get('window');
  const cardWidth = width * 0.42;
  const visibleLanguages = showAll ? LANGUAGES : LANGUAGES.slice(0, 8);
  const hiddenCount = LANGUAGES.length - 8;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.btnPrimaryText, paddingHorizontal: width * 0.05 },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text
            style={[
              theme.typography.fontH1,
              { color: theme.colors.btnPrimaryBg, textAlign: 'center', marginBottom: 8 },
            ]}
          >
            {t('LanguageScreen.title') || 'Select Your Language'}
          </Text>

          <Text
            style={[
              theme.typography.fontBodySmall,
              { color: theme.colors.btnPrimaryBg, textAlign: 'center', marginBottom: 20 },
            ]}
          >
            {t('LanguageScreen.subtitle') || 'Choose the language you’re comfortable with'}
          </Text>

          {/* Theme Toggle */}
          <View style={styles.themeToggleContainer}>
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny'}
              size={20}
              color={theme.colors.btnPrimaryBg}
              style={{ marginRight: 8 }}
            />
            <Text style={[theme.typography.fontBodySmall, { color: theme.colors.btnPrimaryBg }]}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              thumbColor={isDarkMode ? theme.colors.colorPrimary500 : '#f4f3f4'}
              trackColor={{
                false: theme.colors.colorBorder,
                true: theme.colors.colorPrimary300,
              }}
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>

        {/* Languages Grid */}
        <View style={styles.langGrid}>
          {visibleLanguages.map((item, index) => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.langButton,
                {
                  width: cardWidth,
                  backgroundColor:
                    selected === item.code
                      ? theme.colors.btnPrimaryBg
                      : theme.colors.btnPrimaryText,
                  borderColor:
                    selected === item.code
                      ? theme.colors.btnPrimaryBg
                      : theme.colors.btnPrimaryBg,
                  borderWidth: 1.5,
                },
                index === visibleLanguages.length - 1 &&
                  visibleLanguages.length % 2 !== 0 && { alignSelf: 'center' },
              ]}
              onPress={() => handleSelect(item.code)}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={[
                    theme.typography.fontBody,
                    {
                      color:
                        selected === item.code
                          ? theme.colors.btnPrimaryText
                          : theme.colors.btnPrimaryBg,
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    theme.typography.fontBodySmall,
                    {
                      color:
                        selected === item.code
                          ? theme.colors.btnPrimaryText
                          : theme.colors.btnPrimaryBg,
                    },
                  ]}
                >
                  {item.nativeLabel}
                </Text>
              </View>

              {selected === item.code && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.colorPrimary100}
                  style={{ position: 'absolute', top: 8, right: 8 }}
                />
              )}
            </TouchableOpacity>
          ))}

          {!showAll && LANGUAGES.length > 8 && (
            <TouchableOpacity style={styles.moreButton} onPress={handleShowMore}>
              <Text style={[theme.typography.fontButton, { color: theme.colors.colorPrimary500 }]}>
                +{hiddenCount} More
              </Text>
            </TouchableOpacity>
          )}

          {showAll && LANGUAGES.length > 8 && (
            <TouchableOpacity style={styles.moreButton} onPress={handleShowLess}>
              <Text style={[theme.typography.fontButton, { color: theme.colors.colorPrimary500 }]}>
                Show Less
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.btnPrimaryBg,
              shadowColor: theme.colors.colorShadow,
            },
            loading && { opacity: 0.6 },
          ]}
          disabled={loading}
          onPress={() => handleContinue(selected)}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.btnPrimaryText} />
          ) : (
            <Text style={[theme.typography.fontButtonLarge, { color: theme.colors.btnPrimaryText }]}>
              {t('LanguageScreen.continue') || 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  langButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    position: 'relative',
  },
  moreButton: { marginTop: 10, alignItems: 'center', width: '100%' },
  button: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    elevation: 3,
  },
});
