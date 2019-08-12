import { AsyncStorage, } from 'react-native';

import firebase from 'react-native-firebase';
import { RemoteMessage } from 'react-native-firebase';

AsyncStorage.getItem('lastNotification').then(data => {
    if (data) {
        console.log('last notification', JSON.parse(data));
        AsyncStorage.removeItem('lastNotification');
    }
})

export function registerHeadlessListener(message) {
    console.log("ListenerScreen registerHeadlessListener()", message);
    AsyncStorage.setItem('lastNotification', JSON.stringify(message));
}

export default async (RemoteMessage) => {
    console.log("ListenerScreen RemoteMessaging", RemoteMessage);
    this.notificationListener = firebase.notifications().onNotification(notification => {
        console.log("ListenerScreen notificationListener()", notification);
        notification.android.setChannelId('BMF-Channel-Info');
        firebase.notifications().displayNotification(notification);
    })
    return Promise.resolve();
}

// these callback will be triggered only when app is foreground or background
export function registerAppListener(navigation) {
    console.log("ListenerScreen registerAppListener()", navigation.state);

    if (navigation.state.routeName == 'AppLoader') {
        const channel = new firebase.notifications.Android.Channel('BMF-Employee-Info', 'BMF Employee', firebase.notifications.Android.Importance.Max)
            .setDescription('BMF-Employee-Notifications')
            .enableVibration(true)
            .setVibrationPattern([1000, 2000, 2000])
        //.setSound("plucky.mp3");
        firebase.notifications().android.createChannel(channel);
    }


    this.notificationListener = firebase.notifications().onNotification(receivedNotification => {
        receivedNotification.android.setChannelId('BMF-Employee-Info');
        console.log("ListenerScreen registerAppListener()", navigation.state);
        //console.log("ListenerScreen notificationListener()", receivedNotification);
        firebase.notifications().displayNotification(receivedNotification);
    })

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        console.log("ListenerScreen notificationOpenedListener()", notificationOpen);
        const notif = notificationOpen.notification;

        // if (notif.data.targetScreen === 'OrderHistory') {
        //     setTimeout(() => {
        //         navigation.navigate('OrderHistory');
        //     }, 300)
        // }
    });

    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(token => {
        console.log("TOKEN (refreshUnsubscribe)", token);
    });

    this.messageListener = firebase.messaging().onMessage((message) => {
        console.log("ListenerScreen messageListener()", message);
        if (message.data && message.data.custom_notification) {
            let notification = new firebase.notifications.Notification();
            notification = notification.setNotificationId(new Date().valueOf().toString())
                .setTitle(message.title)
                .setBody(message.body)
                .setData(message.data)
            //.setSound("bell.mp3")
            notification.android.setChannelId("BMF-Channel");
            firebase.notifications().displayNotification(notification);
        }
    });

}