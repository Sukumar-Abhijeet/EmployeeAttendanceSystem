import React, { Component } from 'react';
import {
  StyleSheet, View, NetInfo, Image, TouchableOpacity,
  Text, TextInput, Keyboard, ScrollView, ActivityIndicator, AsyncStorage, Alert
} from 'react-native';
import Display from 'react-native-display';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

import Global from '../../Urls/Global.js';
import SideMenu from '../menu/SideMenu.js';
const BASEPATH = Global.BASE_PATH;
export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    Obj = new SideMenu();
    this.state = {
      noInternet: false,
      change: 0,
      loader: false,
      fcmToken: '',
      number: '',
      password: '',
      msgDiv: false,
      msg: '',
    }
  }

  async storeItem(key, item) {
    console.log("LoginScren storeItem() key: ", key);
    let jsonItem = null;
    try {
      jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
    }
    catch (error) {
      console.log(error.message);
    }
    return jsonItem;
  }

  async retrieveItem(key) {
    console.log("LoginScreen retrieveItem() key: ", key);
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


  componentDidMount() {
    console.log("LoginScreen componentDidMount()")
    // let func = new SideMenu();
    // func.fetchUserData();
    this.checkPermission();
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  _keyboardDidShow = (event) => {
    console.log("LoginScreen _keyboardDidSchow() :");
    const keyboardHeight = event.endCoordinates.height;
    // this.ScrollView.scrollToEnd({ animated: true });
    console.log("KeyboardHeight : ", keyboardHeight)
    this.setState({ change: keyboardHeight })
  }
  _keyboardDidHide = () => {
    console.log("LoginScreen _keyboardDidHide() :");
    this.setState({ change: 0 })
  }


  async getToken() {
    console.log("LoginScreen getToken(FIREBASE)");
    let fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      console.log("Token generated : ", fcmToken);
      this.state.fcmToken = fcmToken;
      this.storeItem("fcmToken", fcmToken);
    }
  }

  async checkPermission() {
    console.log("LoginScreen checkPermission(FIREBASE)");
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    console.log("LoginScreen requestPermission(FIREBASE)");
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log('permission rejected');
    }
  }

  componentWillUnmount() {

    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }


  checkLogin() {
    console.log("LoginScreen checkLogin()");

    if (this.state.number != "" && this.state.password != "") {
      this.setState({ loader: true })
      let formValue = JSON.stringify({
        'authName': this.state.number,
        'authPass': this.state.password,
      });
      // "token": this.state.fcmToken,
      // "reqFrom": "APP"

      console.log("LoginScreen checkLogin formvalue  : ", formValue);
      fetch(BASEPATH + Global.AUTHENTICATE_USER_URL, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: formValue
      }).then((response) => response.json()).then((responseData) => {
        this.setState({ loader: false });
        console.log("LoginScreen")
        console.log("LoginScreen checkLogin response  : ", responseData);
        if (responseData.Success == "Y") {
          this.storeItem('UserData', responseData);
          this.props.navigation.navigate('Dashboard')
        }
        else if (responseData.Success == "I") {
          console.log("User account is not active");
          Alert.alert("", "This account is not active");
        }
        else {
          Alert.alert("Invalid Password");
          console.log("Some problem occurred. ", responseData.Message);
        }
      }).catch((error) => {
        console.log("Error Authenticate User: ", error);
        ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        this.setState({ loader: false });
      });

    } else {
      this.setState({ msgDiv: true, msg: "Please fill all the fields", loader: false })
    }
  }



  render() {
    return (
      <ScrollView contentContainerStyle={[styles.mainContainer, { marginTop: -this.state.change }]}
        keyboardShouldPersistTaps={'always'} opacity={this.state.noInternet ? .5 : 1}>
        <View style={styles.upperContainer}>
          <Image source={require('../../assets/logos/adminlogo.png')} resizeMode={'cover'} style={{ width: 100, height: 100 }} />
          <Text style={[styles.customFont, { color: '#000', fontSize: 30, fontWeight: '600', marginTop: 20 }]}>Welcome </Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#b7b5b5', marginTop: 5 }}>Sign in to continue</Text>
          <Text style={{ alignSelf: 'center', marginTop: 30, fontSize: 25, fontWeight: '600', color: '#cd2121' }}>BMF EMPLOYEE</Text>
        </View>
        <View style={styles.middleContainer}>
          <View style={styles.inputBox}>
            <Icon name="user" size={16} color="#0000e5" />
            <TextInput placeholder=" Enter Phone Number / Username"
              returnKeyType="next"
              keyboardType="default"
              onSubmitEditing={() => { this.passwordInput.focus(); }}
              blurOnSubmit={false}
              //maxLength={10}
              //autoFocus={true}
              onChangeText={(number) => this.setState({ number })}
              underlineColorAndroid='transparent'
            />
          </View>
          <View style={styles.inputBox}>
            <Icon name="key" size={16} color="#0000e5" />
            <TextInput placeholder="Enter your Password"
              ref={(input) => { this.passwordInput = input; }}
              returnKeyType="go"
              secureTextEntry={true}
              onChangeText={(password) => this.setState({ password })}
              underlineColorAndroid='transparent'
              onSubmitEditing={() => { this.checkLogin(); }}
            />
          </View>
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 7, marginRight: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '500', color: '#999797', marginTop: 5, }}>Forgot Password?</Text>
          </TouchableOpacity>


          <View style={{ flex: 2, flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flexDirection: 'row', flex: 1, paddingLeft: 15, alignItems: 'center', justifyContent: 'flex-start', }}>
              <View style={{ borderWidth: 1, borderRadius: 10, width: 20, height: 20, borderColor: '#0000e5', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#0000e5', borderRadius: 7, width: 15, height: 15, }}></View>
              </View>
              <Text style={{ marginLeft: 6, color: '#5c5c5c', fontWeight: '600', width: 100, fontSize: 17 }}>Remember me</Text>
            </View>

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
              <TouchableOpacity onPress={() => { this.checkLogin() }} style={{ padding: 20, backgroundColor: '#0000e5', borderRadius: 50, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Display enable={!this.state.loader} style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '500', fontSize: 24 }}>LOGIN</Text>
                </Display>
                <Display enable={this.state.loader} style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" />
                </Display>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <Display enable={this.state.msgDiv}
            enterDuration={10}
            exitDuration={20}
            exit="fadeOutRight"
            enter="fadeInLeft">
            <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 4 }}><Text style={{ fontSize: 12, color: '#fcf40f', alignSelf: 'center' }}>{this.state.msg}</Text></View>
          </Display>
          <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', padding: 15 }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#000' }}>Dont Have an account?</Text>
            <TouchableOpacity onPress={() => { }}>
              <Text style={{ color: '#0049bf', marginLeft: 5, fontWeight: '400' }}>SignUp</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#bcb8b8' }}>Made in </Text>
            <Icon name={'heart'} color={'#cd2121'} size={12} />
            <Text style={{ fontSize: 12, color: '#bcb8b8' }}> with Food!..</Text>
          </View>
        </View>


      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#e5e6ea',
    padding: 25
  },
  noInternetModalContainer: {
    padding: 5
  },
  noInternetView: {
    backgroundColor: '#000', height: 50, width: '100%', borderRadius: 5,
    justifyContent: 'center', alignItems: 'center'
  },
  upperContainer: {
    flex: 3,
  },
  middleContainer: {
    flex: 5, justifyContent: 'center', alignItems: 'center',
    marginTop: 10, paddingTop: 40
  },
  bottomContainer: {
    flex: 1,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
    height: 50,
  },

  inputBox: {
    backgroundColor: '#f7f7d7', marginTop: 10
    , borderRadius: 4, shadowColor: '#000', shadowOpacity: .58, height: 60,
    shadowRadius: 16, elevation: 24, padding: 10,
    shadowOffset: {
      height: 12,
      width: 12
    },
    justifyContent: 'center', alignItems: 'center',
    width: '90%', flexDirection: 'row'
  },
  customFont: {
    fontFamily: 'Poppins-Regular'
  },

});

