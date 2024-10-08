import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Platform, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  }
});

export default function App() {

  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission required', 
          'We need for push notification'
        );
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log(pushTokenData);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        });
      }        
    }
    configurePushNotifications();

  }, []);

  useEffect(() => {
    const subscriptionAndroid = Notifications.addNotificationReceivedListener((notification) => {
      console.log('NOTIFICATION RECEIVED');
      console.log(notification);
      const userName = notification.request.content.data.userName;
      console.log(userName);

    });

    const subscriptionIOS = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('NOTIFICATION RESPONSE RECEIVED');
      console.log(response);
      const userName = response.notification.request.content.data.userName;
      console.log(userName);
    });

    return () => {
      subscriptionAndroid.remove();
      subscriptionIOS.remove();
    }

  }, []);


  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to show notifications has not been granted.");
      }
    })();
  }, []);

  async function scheduleNotificationHandler() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hello World!',
          body: 'I am a notification!!!',
          data: { userName: 'Yoko' },
          sound: true, // Add sound
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: 1,
        },
      });
      console.log('Notification scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  function sendPushNotificationHandler() {
    fetch('https://exp.host/--api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'ExponentPushToken[-----------]',
        title: 'Test Push Notification',
        body: 'test'
      })
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Button 
          title='Schedule Notification' 
          onPress={scheduleNotificationHandler}
        />
      </View>
      <View style={styles.button}>
        <Button     
          title='Push Notification' 
          onPress={sendPushNotificationHandler}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginBottom: 20
  }
});
