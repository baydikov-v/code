import React, { useState, useEffect, useRef } from 'react';
import { View, Text, AppState, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import _isEqual from 'lodash/isEqual';
import { setTaskExecutor, LOCATION_TASK_NAME } from 'services/TaskService';

const ExampleScreen = () => {
  const appState = useRef(AppState.currentState);
  const [location, setLocation] = useState({});

  useEffect(() => {
    // Init audio
    (async function AudioSetup() {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false
      });
    })();

    // Set an execute function for background tasks
    setTaskExecutor((res) => {
      if (appState.current === 'background' && !_isEqual(location, res)) {
        setLocation(res);
      }
    });

    // Subscribe on location change
    let subscriptionPosition;
    Location.requestForegroundPermissionsAsync()
      .then(() => {
        // Current location
        subscriptionPosition = Location.watchPositionAsync({
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 1
        }, (res) => {
          if (!_isEqual(location, res)) {
            setLocation(res);
          }
        });
      });

    // Request permissions for background tasks
    (async function Background() {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 1,
          showsBackgroundLocationIndicator: true,
        });
      }
    })();

    // AppState listener
    AppState.addEventListener("change", handleAppStateChange);
    getSettings();

    // Unsubscribe listeners
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
      subscriptionPosition.then(({ remove }) => remove());
    };
  }, []);

  // Functions with business logic
  const handleAppStateChange = () => {};
  const getSettings = () => {};

  return (
    <View style={styles.container}>
      <Text>Some components here...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
});

export default ExampleScreen;
