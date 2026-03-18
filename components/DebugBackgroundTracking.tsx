// components/DebugBackgroundTracking.tsx
import {
    getBackgroundTrackingStatus,
    refreshInProgressTickets,
    startBackgroundTracking,
    stopBackgroundTracking,
    testBackgroundTracking
} from '@/services/backgroundLocation';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export const DebugBackgroundTracking = () => {
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 20));
  };

  const checkStatus = async () => {
    const status = await getBackgroundTrackingStatus();
    setStatus(status);
    addLog(`Status: ${JSON.stringify(status)}`);
  };

  const handleStart = async () => {
    addLog('Starting background tracking...');
    const result = await startBackgroundTracking();
    addLog(`Start result: ${result}`);
    await checkStatus();
  };

  const handleStop = async () => {
    addLog('Stopping background tracking...');
    await stopBackgroundTracking();
    await checkStatus();
  };

  const handleTest = async () => {
    addLog('Running test...');
    const result = await testBackgroundTracking();
    addLog(`Test result: ${JSON.stringify(result)}`);
  };

  const handleRefresh = async () => {
    addLog('Refreshing tickets...');
    await refreshInProgressTickets();
    await checkStatus();
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Background Tracking Debug</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Check Status" onPress={checkStatus} />
        <Button title="Start Tracking" onPress={handleStart} />
        <Button title="Stop Tracking" onPress={handleStop} />
        <Button title="Run Test" onPress={handleTest} />
        <Button title="Refresh Tickets" onPress={handleRefresh} />
      </View>

      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Current Status:</Text>
          <Text>Running: {status.isRunning ? '✅' : '❌'}</Text>
          <Text>Foreground Permission: {status.foregroundPermission}</Text>
          <Text>Background Permission: {status.backgroundPermission}</Text>
          <Text>Available: {status.isAvailable ? '✅' : '❌'}</Text>
          <Text>In-Progress Tickets: {status.inProgressTicketsCount}</Text>
          <Text>Last Update: {status.lastUpdate || 'Never'}</Text>
        </View>
      )}

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  statusContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logsContainer: {
    flex: 1,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
});