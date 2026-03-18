// components/AutoRevokeSettingsCard.tsx
import { useLocation } from '@/hooks/LocationProvider';
import { useTheme } from '@/theme/ThemeContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const AutoRevokeSettingsCard = () => {
  const { theme } = useTheme();
  const { 
    checkAutoRevoke, 
    openAutoRevokeSettings, 
    resetAutoRevokeGuide,
    autoRevokeEnabled 
  } = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    const result = await checkAutoRevoke();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="small" color={theme.colors.btnPrimaryBg} />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>📱</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Auto-Revoke Permissions
        </Text>
      </View>
      
      <Text style={[styles.description, { color: theme.colors.text + 'CC' }]}>
        Android may automatically remove permissions for unused apps to save battery.
        Disable this for continuous background tracking.
      </Text>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
          Current Status:
        </Text>
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: autoRevokeEnabled ? '#FF3B3020' : '#34C75920',
            borderColor: autoRevokeEnabled ? '#FF3B30' : '#34C759'
          }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: autoRevokeEnabled ? '#FF3B30' : '#34C759' }
          ]}>
            {autoRevokeEnabled ? '⚠️ May Auto-Revoke' : '✅ OK'}
          </Text>
        </View>
      </View>

      {status && status.message && (
        <Text style={[styles.message, { color: theme.colors.text + 'AA' }]}>
          {status.message}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={openAutoRevokeSettings}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#5856D6' }]}
          onPress={() => showAutoRevokeGuide(true)}
        >
          <Text style={styles.buttonText}>Show Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF3B30' }]}
          onPress={resetAutoRevokeGuide}
        >
          <Text style={styles.buttonText}>Reset Flags</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});