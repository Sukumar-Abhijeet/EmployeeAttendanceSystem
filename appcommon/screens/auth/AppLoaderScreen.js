import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, AppState, ToastAndroid, PermissionsAndroid, Dimensions, ImageBackground, TouchableOpacity, AsyncStorage, NetInfo, Linking, } from 'react-native';
import Global from '../../Urls/Global.js';
import Display from 'react-native-display';
import Modal from 'react-native-modal';
import { registerAppListener } from '../../router/Listener.js';

const BASEPATH = Global.BASE_PATH;

export default class AppLoaderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appState: '',
            latestVersion: false,
            noInternet: false,
            visibleModal: null,
            userData: {},
        };
    }

    async retrieveItem(key) {
        console.log("AppLoaderScreen retrieveItem() key: ", key);
        let item = null;
        try {
            const retrievedItem = await AsyncStorage.getItem(key);
            item = JSON.parse(retrievedItem);
        }
        catch (error) {
            console.log(error.message);
        }
        return item;
    }

    async storeItem(key, item) {
        console.log("AppLoaderScreen storeItem() key: ", key);
        let jsonItem = null;
        try {
            jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        }
        catch (error) {
            console.log(error.message);
        }
        return jsonItem;
    }

    _handleAppStateChange = (nextAppState) => {
        console.log("handleAppState : ", nextAppState);
        // if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
        //     console.log("PreApp State : ", this.state.appState);
        //     console.log("NextApp State : ", this.state.nextAppState);
        // }
        // this.setState({ appState: nextAppState });
        if (nextAppState == "background" || nextAppState == 'active') {
            this.checkClocIn();
        }
    }

    checkClocIn() {
        console.log("ApploaderScreen checkClockIn()");
        this.retrieveItem('ClockInData').then((data) => {
            if (data == null) {
                console.log("no clockin data");
                // this.props.navigation.navigate('Login');
            }
            else {
                if (true) {
                    this.sendLatestLocation();
                }
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    sendLatestLocation() {
        console.log("AppLoaderScreen sendLatestLocation");
    }


    checkAppVersionCode = () => {
        console.log("AppLoaderScreen checkAppVersionCode()");
        let pack = require('../../../app.json');
        let appVersion = pack.android.versionCode;
        console.log("Device App VersionCode : ", appVersion);
        fetch(BASEPATH + Global.VERSION_CHECK_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json()).then((responseData) => {
            console.log("Latest App VersionCode", responseData.Version);
            if (appVersion != responseData.Version) {
                this.setState({ latestVersion: false });
                this.fetchUserData();
            }
            else {
                this.setState({ latestVersion: true });
                console.log("New update available. Please update.");
            }
        }).catch((error) => {
            console.log("Error App Version: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });

    }

    fetchUserData() {
        console.log("AppLoaderScreen fetchUserData()");
        this.retrieveItem('UserData').then((data) => {
            if (data == null) {
                this.props.navigation.navigate('Login');
            }
            else {
                this.setState({ userData: data });
                this.props.navigation.navigate('Dashboard');
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    async accessMultiplePermissions() {
        console.log("AppLoaderScreen Screen accessmultiplepermissions");
        if (Platform.OS === 'android') {
            console.log("Platform is ANDROID");
            try {
                let granted = {};
                var permissions = [
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]
                granted = await PermissionsAndroid.requestMultiple(permissions)
                console.log("permissions array : ", granted);
            } catch (err) {
                console.warn(err)
            }
        }
        if (Platform.OS === 'ios') {
            console.log("Platform is IOS please add permission codes ");
        }
    }

    componentDidMount() {
        console.log('AppLoaderScreen componentDidMount()');
        registerAppListener(this.props.navigation);
        NetInfo.addEventListener('connectionChange', this.handleFirstConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);
        this.props.navigation.addListener('didFocus', () => { this.checkAppVersionCode(); })
    }

    componentWillMount() {
        this.accessMultiplePermissions();
    }

    handleFirstConnectivityChange = (connectionInfo) => {
        console.log(
            'First change, type: ' +
            connectionInfo.type +
            ', effectiveType: ' +
            connectionInfo.effectiveType,
        );
        if (connectionInfo.type == 'none') {
            this.setState({ noInternet: true, visibleModal: 1 })
        } else {
            this.setState({ noInternet: false, visibleModal: null, })
            this.checkAppVersionCode()
        }
    }

    componentWillUnmount() {
        console.log("ApploaderScreen componentWillUnmount()");
        AppState.removeEventListener('change', this._handleAppStateChange);
        NetInfo.removeEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange,
        );
        // this.onTokenRefreshListener();
        // this.notificationOpenedListener();
        // this.messageListener();
    }

    __renderNoInternet = () => (
        <View style={styles.noInternetModalContainer}>
            <View style={styles.noInternetView}>
                <Text style={{ color: '#fff' }}>NO INTERNET CONNECTION</Text>
                <Text style={{ fontSize: 12, color: '#fcf40f' }}>Your working time will hamper</Text>
            </View>
        </View>
    )

    render() {
        return (
            <ImageBackground source={require('../../assets/Images/splash.png')} style={styles.mainContainer}>
                {/* <View style={styles.upperContainer}>
                    <Image source={require('../../assets/bringmyfood.png')} style={{ width: 80, height: 80 }} />
                    <Text style={{ color: '#fff', justifyContent: 'center', alignItems: 'center', paddingTop: 10, fontSize: 18 }}>BringMyFood</Text>
                </View > */}
                <Display enable={this.state.latestVersion} style={styles.update}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '200', color: '#aaa7a7' }}>Please Update To Continue</Text>
                    </View>
                    <TouchableOpacity onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=in.bringmyfood&hl=en")} style={{ flex: 1, backgroundColor: '#2dbe60', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Update Now</Text>
                    </TouchableOpacity>
                </Display>
                <Modal hasBackdrop={false} isVisible={this.state.visibleModal === 1} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: 1 })} animationType="slide">
                    {this.__renderNoInternet()}
                </Modal>
            </ImageBackground>
        );
    }
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end'
    },
    upperContainer: {
        backgroundColor: 'transparent',
        flex: 9,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    update:
    {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        backgroundColor: '#fff',
        width: Dimensions.get('window').width,
        bottom: 0,
        height: 50
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
        height: 50,
    },
    noInternetModalContainer: {
        padding: 5
    },
    noInternetView: {
        backgroundColor: '#000', height: 50, width: '100%', borderRadius: 5,
        justifyContent: 'center', alignItems: 'center'
    },

});