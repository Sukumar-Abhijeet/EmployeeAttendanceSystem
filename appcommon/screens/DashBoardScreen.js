import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, ToastAndroid, TouchableOpacity, AsyncStorage, BackHandler, ActivityIndicator } from 'react-native';
import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, CheckBox, Body, Left, Right, Radio, Badge, DatePicker, DeckSwiper } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';

import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Geolocation from 'react-native-geolocation-service';
import Global from '../Urls/Global.js';
import Display from 'react-native-display';
import firebase from 'react-native-firebase';

const BASEPATH = Global.BASE_PATH;


export default class DashBoardScreen extends Component {
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid));

    this.state = {
      hrs: '',
      mins: '',
      secs: '',
      ampm: '',
      mapRegion: {
        latitude: 20.3011504,
        longitude: 85.6803644,
        latitudeDelta: 0.012,
        longitudeDelta: 0.023,
      },
      userData: {},
      bawarchiCard: [{}],
      loader: false,
      itemCount: 0,
      countback: true,
      clockIn: true,
      notificationId: '',
      dutyStatus: 'OFF DUTY',
      todayDate: '',
      orderStats: {},
      cityCode: ''
    }
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

  async checkPermission() {
    console.log("DashBoardScreen checkPermission(FIREBASE)");
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.showLocalNotification("New");
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    console.log("DashBoardScreen requestPermission(FIREBASE)");
    try {
      await firebase.messaging().requestPermission();
      //this.getToken();
    } catch (error) {
      console.log('permission rejected');
    }
  }

  onBackButtonPressAndroid = () => {

    console.log("BashboardScreen onBackButtonPressAndroid()");
    if (this.state.countback) {
      ToastAndroid.show("Double tap to close.", ToastAndroid.SHORT);
      this.setState({ countback: false, });
      setTimeout(() => {
        this.setState({ countback: true })
        console.log("Clearing Count after 3 secs.")
      }, 3000);
    }
    else {
      ToastAndroid.show("Closing the app.", ToastAndroid.SHORT);
      this.setState({ countback: true });
      BackHandler.exitApp();
      //return false;
    }
  };

  componentDidMount() {
    console.log('DashBoardScreen componentDidMount()')
    this.setState({ loader: true })
    this.fetchUserData();
    this.props.navigation.addListener('didFocus', () => {
      this.fetchAsyncSelectedCity();
    });

    //this.props.navigation.openDrawer();
    this.clockTimer();
    this.checkPermission();
    // setTimeout(() => {
    //   this.fetchDashboardStats();
    // }, 1000)

  }

  fetchAsyncSelectedCity() {
    console.log('MainHeaderScreen fetchAsyncSelectedCity()');
    this.retrieveItem('SelectedCC').then((data) => {
      //console.log("userData : ", data)
      if (data == null) {
        ToastAndroid.show("Set CITY & HUB from DrawerScreen", ToastAndroid.LONG);
      }
      else {
        this.setState({ cityCode: data }, () => {
          this.fetchDashboardStats();
        })
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchUserData() {
    console.log("DashBoardScreen fetchUserData()");
    this.retrieveItem('UserData').then((data) => {
      //console.log("UserData : ", data)
      if (data == null) {
        this.props.navigation.navigate('Login');
      }
      else {
        this.setState({ userData: data }, () => { this.fetchClockInData() })
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchClockInData() {
    console.log("DashboardScreen fetchClockInData");
    this.retrieveItem('ClockInData').then((data) => {
      if (data == null) {
        console.log("no clockin data");
        // this.props.navigation.navigate('Login');
      }
      else {
        if (true) {
          // this.sendLatestLocation();
        }
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchDashboardStats() {
    console.log("DashboardScreen fetchDashboardStats");
    if (this.state.cityCode == "") {
      ToastAndroid.show("Set CITY & HUB from DrawerScreen", ToastAndroid.LONG);
    } else {
      this.setState({ loader: true })
      let formValue = JSON.stringify({
        'date': this.state.todayDate,
        "cityCode": this.state.cityCode
      });
      console.log('DashboardScreen fetchDashboardStats() formvalue : ', formValue);
      fetch(BASEPATH + Global.DASHBOARD_ORDERS_STATS_URL, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: formValue
      }).then((response) => response.json()).then((responseData) => {
        console.log('DashboardScreen fetchDashboardStats() response : ', responseData);

        let bawCountObj = {
          "Type": 'COUNT',
          'color1': '#20002c',
          'color2': '#cbb4d4',
          "Count": eval(responseData.OrderStats.BawPhoneCount) + eval(responseData.OrderStats.BawAppCount) + eval(responseData.OrderStats.BawWebCount),
          "AppCount": responseData.OrderStats.BawAppCount,
          "WebCount": responseData.OrderStats.BawWebCount,
          "PhoneCount": responseData.OrderStats.BawPhoneCount,
        }

        let bawSaleObj = {
          "Type": 'SALES',
          'color1': '#0575E6',
          'color2': '#021B79',
          "Sales": eval(responseData.OrderStats.BawPhoneSales) + eval(responseData.OrderStats.BawAppSales) + eval(responseData.OrderStats.BawWebSales),
          "AppSales": responseData.OrderStats.BawAppSales,
          "WebSales": responseData.OrderStats.BawWebSales,
          "PhoneSales": responseData.OrderStats.BawPhoneSales,
        }

        let arr = [];
        arr[0] = bawCountObj;
        arr[1] = bawSaleObj;
        this.setState({ orderStats: responseData.OrderStats, bawarchiCard: arr, loader: false }, () => { console.log("BawarchiCard", this.state.bawarchiCard) })

      }).catch((error) => {
        console.log("Error Authenticate User: ", error);
        ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        this.setState({ loader: false });
      });
    }
  }


  clockTimer() {
    // console.log("DashboardScreen clockTimer()")
    let today = new Date();

    let h = today.getHours();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = this.checkTime(m);
    s = this.checkTime(s);
    //console.log("Time", h, ":", m, ":", s)

    let date = this.findDate(today)
    console.log("Today Date", date);
    this.setState({ hrs: h, mins: m, secs: s, ampm: ampm, todayDate: date, })

    // setTimeout(() => {
    //   this.clockTimer();
    // }, 500);
  }

  findDate(today) {
    console.log("findDate() : ", today)
    let date = today.getFullYear() + "-" + (((today.getMonth() + 1) < 10) ? "0" + (today.getMonth() + 1) : today.getMonth() + 1) + "-" + ((today.getDate() < 10) ? ("0" + today.getDate()) : today.getDate());
    return date;
  }

  checkTime(i) {
    //  console.log("DashboardScreen checkTime()");
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
  }

  startLocationTrack() {
    console.log("DashBoard startLocationTrack()");
    this.showLocalNotification("Generated");
    Geolocation.watchPosition((position) => {
      var position = position.coords;
      console.log("Position: ", position);
      // this.setState({
      //   mapRegion: {
      //     latitude: position.latitude,
      //     longitude: position.longitude,
      //     latitudeDelta: 0.0092,
      //     longitudeDelta: 0.0042
      //   },
      // }, () => { this.sendClockInData() });
    }, (error) => {
      this.setState({ loader: false })
      if (error.message == "No location provider available.") {
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
          message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
          ok: "YES",
          cancel: "NO",
          enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
          showDialog: true, // false => Opens the Location access page directly
          openLocationServices: true, // false => Directly catch method is called if location services are turned off
          preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
          preventBackClick: true, // true => To prevent the location services popup from closing when it is clicked back button
          providerListener: false // true ==> Trigger locationProviderStatusChange listener when the location state changes
        }).then(function (success) {
          console.log(success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
        }).catch((error) => {
          console.log(error.message); // error.message => "disabled"
        })
      } else {
        alert("Error: " + error.message)
      }
    },
      { enableHighAccuracy: true, distanceFilter: 5, showLocationDialog: true }
    );
  }

  sendClockInData() {
    console.log("DashBoardScreen sendClockInData()");
    let formValue = JSON.stringify({
      'uid': this.state.userData.session_admin_employee_id,
      'lat': this.state.mapRegion.latitude,
      'lng': this.state.mapRegion.longitude,
    });
    console.log("DashboardScreen sendClockInData formvalue :", formValue)
    this.setState({ dutyStatus: 'ON DUTY' })
    // fetch(BASEPATH + Global.CHECK_ATTENDANCE_LOCATION, {
    //   method: "POST",
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: formValue
    // }).then((response) => response.json()).then((responseData) => {
    //   console.log("DashboardScreen sendClockInData response : ", responseData);
    //   this.setState({ loader: false })

    // }).catch((error) => {
    //   this.setState({ loader: false })
    //   console.log("Error App Version: ", error);
    //   ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    // });
    this.setState({ loader: false, clockIn: false })
    this.startLocationTrack();
  }

  checkClockIn() {
    console.log("DashboardScreen checkClockIn()");
    this.setState({ loader: true });
    Geolocation.getCurrentPosition((position) => {
      var position = position.coords;
      console.log("Position: ", position);
      this.setState({
        mapRegion: {
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.0092,
          longitudeDelta: 0.0042
        },
      }, () => { this.sendClockInData() });
    }, (error) => {
      this.setState({ loader: false })
      if (error.message == "No location provider available.") {
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
          message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
          ok: "YES",
          cancel: "NO",
          enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
          showDialog: true, // false => Opens the Location access page directly
          openLocationServices: true, // false => Directly catch method is called if location services are turned off
          preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
          preventBackClick: true, // true => To prevent the location services popup from closing when it is clicked back button
          providerListener: false // true ==> Trigger locationProviderStatusChange listener when the location state changes
        }).then(function (success) {
          console.log(success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
        }).catch((error) => {
          console.log(error.message); // error.message => "disabled"
        })
      } else {
        alert("Error: " + error.message)
      }
    },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  checkClockOut() {
    console.log("DashboardScreen checkClockIn()");
    this.setState({ dutyStatus: 'OFF DUTY', clockIn: true })
  }

  showLocalNotification(value) {
    console.log("DashboardScreen showLocalNotification() :", value);
    if (value == "New") {
      firebase.notifications().removeAllDeliveredNotifications();
    }
    const channel = new firebase.notifications.Android.Channel('BMF-Employee-Info', 'BMF Employee', firebase.notifications.Android.Importance.Max)
      .setDescription('BMF-Employee-Notifications')
      .enableVibration(true)
      .setVibrationPattern([1000, 2000, 2000])
    //.setSound("plucky.mp3");
    firebase.notifications().android.createChannel(channel);

    let notification = new firebase.notifications.Notification();
    if (value == "New") {
      notification = notification.setNotificationId(new Date().valueOf().toString())
        .setTitle("Your Working Status shows ")
        .setBody("You are offline").setData({
          key1: 'value1',
          key2: 'value2'
        });
    } else {
      notification = notification.setNotificationId(this.state.notificationId)
        .setTitle("Your Working Status shows ")
        .setBody("You are Online").setData({
          key1: 'value1',
          key2: 'value2'
        });
    }

    notification.ios.badge = 10
    //notification.android.setAutoCancel(false);

    // notification.android.setBigPicture("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png", "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg", "content title", "summary text")
    // notification.android.setColor("red")
    // notification.android.setColorized(true)
    notification.android.setOngoing(true)
    notification.android.setPriority(firebase.notifications.Android.Priority.High)
    notification.android.setSmallIcon("ic_launcher")
    notification.android.setVibrate([100])
    // notification.android.addAction(new firebase.notifications.Android.Action("view", "ic_launcher", "VIEW"))
    // notification.android.addAction(new firebase.notifications.Android.Action("dismiss", "ic_launcher", "DISMISS"))
    notification.android.setChannelId("BMF-Employee-Info");
    console.log("local notification : ", notification)
    firebase.notifications().displayNotification(notification);
    if (value == "New") {
      this.setState({ notificationId: notification.notificationId })
    }
  }

  changeStatisticsDate(dateChange) {
    console.log("DashboardScreen changeStatisticsDate() : ", dateChange);
    let date = this.findDate(dateChange);
    console.log("Today", date);
    this.setState({ todayDate: date }, () => { this.fetchDashboardStats() })
  }


  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.menuHeadItem}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => { this.props.navigation.openDrawer(); }}>
              <Icon name="ios-menu" style={{ fontSize: 30 }} color={'#cd2121'} />
            </TouchableOpacity>
            <Text style={{ marginLeft: 8, color: '#cd2121', fontSize: 20, fontWeight: '600' }}>DASHBOARD</Text>
          </View>
          <View style={{ flex: 1, paddingRight: 15 }}>
            <TouchableOpacity style={{ alignSelf: 'flex-end', }}>
              <Icon name="md-notifications" style={{ fontSize: 22 }} color={'#000'} />
            </TouchableOpacity>
          </View>
        </View>
        <Display enable={this.state.clockIn} style={{ flex: 1 }}>
          <View style={styles.upperContainer}>
            <View style={styles.morningBox}>
              <Text style={{ color: 'pink', fontSize: 30, fontWeight: '500' }}>GOOD MORNING</Text>
              <Text style={{ fontSize: 20, fontWeight: '200' }}>Hi,  {this.state.userData.session_admin_employee_name}</Text>
            </View>
          </View>
          <View style={styles.middleContainer}>
            <View style={styles.clockView}>
              <Text style={{ fontSize: 45, fontWeight: '600' }}>{this.state.hrs}:{this.state.mins}</Text>
              <Text style={{ fontSize: 45, fontWeight: '600' }}>{this.state.ampm}</Text>
            </View>
            <Text style={{ marginTop: 10 }}>Your are <Text style={{ color: (this.state.dutyStatus == "OFF DUTY") ? '#cd2121' : '#28a745', fontSize: 18, fontWeight: '600' }}>{this.state.dutyStatus}</Text> now</Text>
            <Text style={{ marginTop: 5, fontSize: 10 }}>Please {this.state.dutyStatus == "OFF DUTY" ? "clock-in" : 'clock-out'} to {this.state.dutyStatus == "OFF DUTY" ? "continue" : 'go offline'}</Text>
          </View>
          <View style={styles.bottomContainer}>
            <Display enable={this.state.clockIn}>
              <TouchableOpacity style={styles.clockinBox} disabled={this.state.loader} onPress={() => { this.checkClockIn() }}>
                <Display enable={this.state.loader}>
                  <ActivityIndicator size={'small'} color={'#fff'} />
                </Display>
                <Display enable={!this.state.loader}>
                  <Text style={{ color: '#fff', fontSize: 25, fontWeight: '300' }}>CLOCK IN NOW</Text>
                </Display>
              </TouchableOpacity>
            </Display>
            <Display enable={this.state.cityCode == ""} style={{ marginTop: 5, padding: 10 }}>
              <View style={styles.noInternetView}>
                <Text style={{ color: '#fff' }}>NO CITY/HUB SELECTED</Text>
                <Text style={{ fontSize: 12, color: '#fcf40f' }}>First Select City/HUb from Menu Screen in Left & restart</Text>
              </View>
            </Display>
            <Display enable={!this.state.clockIn}>
              <TouchableOpacity style={styles.clockinBox} onPress={() => { this.checkClockOut() }}>
                <Display enable={this.state.loader}>
                  <ActivityIndicator size={'small'} color={'#fff'} />
                </Display>
                <Display enable={!this.state.loader}>
                  <Text style={{ color: '#fff', fontSize: 25, fontWeight: '300' }}>CLOCK OUT NOW</Text>
                </Display>
              </TouchableOpacity>
            </Display>
          </View>
        </Display>
        <Display enable={!this.state.clockIn} style={{ flex: 1 }}>
          <View style={[styles.morningBox, { flexDirection: 'row' }]}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{}}>Your are</Text>
              <Text style={{ color: (this.state.dutyStatus == "OFF DUTY") ? '#cd2121' : '#28a745', fontSize: 16, fontWeight: '600' }}>{this.state.dutyStatus}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.clockViewMini}>
                <Text style={{ fontSize: 25, fontWeight: '400', color: '#fff' }}>{this.state.hrs}:{this.state.mins}</Text>
                <Text style={{ fontSize: 25, fontWeight: '400', color: '#fff' }}>{this.state.ampm}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity disabled={this.state.loader} style={styles.clockOutBox} onPress={() => { this.checkClockOut() }}>
                <Display enable={this.state.loader}>
                  <ActivityIndicator size={'small'} color={'#fff'} />
                </Display>
                <Display enable={!this.state.loader}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '200' }}>CLOCK OUT</Text>
                </Display>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 20, padding: 10, backgroundColor: '#ebebeb' }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>Statistics</Text>
              <Text style={{ fontSize: 12, fontWeight: '100', }}>Check Your statistics reports </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#fff', padding: 5 }}>
              <DatePicker
                defaultDate={new Date()}
                minimumDate={new Date(2018, 1, 18)}
                maximumDate={new Date()}
                locale={"en"}
                timeZoneOffsetInMinutes={undefined}
                modalTransparent={false}
                animationType={"fade"}
                androidMode={"default"}
                placeHolderText={this.state.todayDate}
                textStyle={{ color: "green" }}
                placeHolderTextStyle={{ color: "#d3d3d3" }}
                onDateChange={(date) => { this.changeStatisticsDate(date) }}
                disabled={false}
              />
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <Display enable={!this.state.loader}>
              {/* ORDERS */}
              <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '400', }}>Order Overview</Text>

                {/* ORDER COUNT */}
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  <View style={{ flex: 1 }}>
                    <LinearGradient
                      colors={['#2193b0', '#6dd5ed']}
                      style={{
                        left: 0,
                        right: 0,
                        top: 0,
                        borderRadius: 4,
                        padding: 20, justifyContent: 'center', alignItems: 'center'
                      }}
                    >

                      <Text style={{ color: '#fff', fontSize: 16 }}>Order Count</Text>
                      <Text style={{ fontSize: 25, fontWeight: '600', alignSelf: 'center', color: '#fff' }}>{eval(this.state.orderStats.AppCount) + eval(this.state.orderStats.PhoneCount) + eval(this.state.orderStats.WebCount)}</Text>

                      <View style={{ flexDirection: 'row', marginTop: 5 }}>

                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#28a745', borderRadius: 2 }}>
                          <Icon name={'md-laptop'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.WebCount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#343a40', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'md-phone-portrait'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.AppCount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ffc107', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'ios-call'} style={{ color: '#000', fontSize: 15 }} />
                          <Text style={{ color: '#000', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.WebCount}</Text>
                        </View>
                      </View>

                    </LinearGradient>

                  </View>

                  {/* ORDER SALE */}
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <LinearGradient
                      colors={['#ee9ca7', '#ffdde1']}
                      style={{
                        left: 0,
                        right: 0,
                        top: 0,
                        borderRadius: 4,
                        padding: 20, justifyContent: 'center', alignItems: 'center'
                      }}
                    >

                      <Text style={{ color: '#fff', fontSize: 16 }}>Order Sale</Text>
                      <Text style={{ fontSize: 25, fontWeight: '600', alignSelf: 'center', color: '#fff' }}>₹ {eval(this.state.orderStats.AppSales) + eval(this.state.orderStats.WebSales) + eval(this.state.orderStats.PhoneSales)}</Text>

                      <View style={{ flexDirection: 'row', marginTop: 5 }}>

                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#28a745', borderRadius: 2 }}>
                          <Icon name={'md-laptop'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.WebSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#343a40', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'md-phone-portrait'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.AppSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ffc107', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'ios-call'} style={{ color: '#000', fontSize: 15 }} />
                          <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.PhoneSales}</Text>
                        </View>
                      </View>

                    </LinearGradient>

                  </View>

                </View>
              </View>

              {/* FOODS */}
              <View style={{ padding: 10, }}>
                <Text style={{ fontSize: 18, fontWeight: '400', }}>FOOD Overview</Text>


                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  {/* FOOD COUNT */}
                  <View style={{ flex: 1 }}>
                    <LinearGradient
                      colors={['#bdc3c7', '#2c3e50']}
                      style={{
                        left: 0,
                        right: 0,
                        top: 0,
                        borderRadius: 4,
                        padding: 20, justifyContent: 'center', alignItems: 'center'
                      }}
                    >

                      <Text style={{ color: '#fff', fontSize: 16 }}>Food Orders</Text>
                      <Text style={{ fontSize: 25, fontWeight: '600', alignSelf: 'center', color: '#fff' }}>{eval(this.state.orderStats.FoodPhoneCount) + eval(this.state.orderStats.FoodAppCount) + eval(this.state.orderStats.FoodWebCount)}</Text>

                      <View style={{ flexDirection: 'row', marginTop: 5 }}>

                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#28a745', borderRadius: 2 }}>
                          <Icon name={'md-laptop'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.FoodWebCount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#343a40', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'md-phone-portrait'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.FoodAppCount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ffc107', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'ios-call'} style={{ color: '#000', fontSize: 15 }} />
                          <Text style={{ color: '#000', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.FoodPhoneCount}</Text>
                        </View>
                      </View>

                    </LinearGradient>

                  </View>

                  {/* FOOD SALE */}
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <LinearGradient
                      colors={['#56ab2f', '#a8e063']}
                      style={{
                        left: 0,
                        right: 0,
                        top: 0,
                        borderRadius: 4,
                        padding: 20, justifyContent: 'center', alignItems: 'center'
                      }}
                    >

                      <Text style={{ color: '#fff', fontSize: 16 }}>Food Sale</Text>
                      <Text style={{ fontSize: 25, fontWeight: '600', alignSelf: 'center', color: '#fff' }}>₹ {eval(this.state.orderStats.FoodAppSales) + eval(this.state.orderStats.FoodWebSales) + eval(this.state.orderStats.FoodPhoneSales)}</Text>

                      <View style={{ flexDirection: 'row', marginTop: 5 }}>

                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#28a745', borderRadius: 2 }}>
                          <Icon name={'md-laptop'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.FoodWebSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#343a40', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'md-phone-portrait'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.FoodAppSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ffc107', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'ios-call'} style={{ color: '#000', fontSize: 15 }} />
                          <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.FoodPhoneSales}</Text>
                        </View>
                      </View>

                    </LinearGradient>

                  </View>
                </View>


              </View>

              {/* BUSINESS */}
              <View style={{ padding: 10, }}>
                <Text style={{ fontSize: 18, fontWeight: '400', }}>Business Overview</Text>


                <View style={{ marginTop: 6 }}>
                  {/* BUSINESS COUNT */}
                  <View style={{ flex: 1 }}>
                    <LinearGradient
                      colors={['#ffd89b', '#19547b']}
                      style={{
                        left: 0,
                        right: 0,
                        top: 0,
                        borderRadius: 4,
                        padding: 20, justifyContent: 'center', alignItems: 'center'
                      }}
                    >

                      <Text style={{ color: '#fff', fontSize: 16 }}>Business Orders</Text>
                      <Text style={{ fontSize: 25, fontWeight: '600', alignSelf: 'center', color: '#fff' }}>{eval(this.state.orderStats.BizPhoneCount) + eval(this.state.orderStats.BizAppCount) + eval(this.state.orderStats.BizWebCount)}</Text>

                      <View style={{ flexDirection: 'row', marginTop: 5 }}>

                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#28a745', borderRadius: 2 }}>
                          <Icon name={'md-laptop'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.BizWebCount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#343a40', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'md-phone-portrait'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.BizAppCount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ffc107', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'ios-call'} style={{ color: '#000', fontSize: 15 }} />
                          <Text style={{ color: '#000', fontSize: 18, fontWeight: '600', marginLeft: 2 }}>{this.state.orderStats.BizPhoneCount}</Text>
                        </View>
                      </View>

                    </LinearGradient>

                  </View>

                  {/* BUSINESS SALE */}
                  <View style={{ flex: 1, marginTop: 5 }}>
                    <LinearGradient
                      colors={['#6D6027', '#D3CBB8']}
                      style={{
                        left: 0,
                        right: 0,
                        top: 0,
                        borderRadius: 4,
                        padding: 20, justifyContent: 'center', alignItems: 'center'
                      }}
                    >

                      <Text style={{ color: '#fff', fontSize: 16 }}>Business Sale</Text>
                      <Text style={{ fontSize: 25, fontWeight: '600', alignSelf: 'center', color: '#fff' }}>₹ {eval(this.state.orderStats.BizAppSales) + eval(this.state.orderStats.BizWebSales) + eval(this.state.orderStats.BizPhoneSales)}</Text>

                      <View style={{ flexDirection: 'row', marginTop: 5 }}>

                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#28a745', borderRadius: 2 }}>
                          <Icon name={'md-laptop'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.BizWebSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#343a40', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'md-phone-portrait'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.BizAppSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ffc107', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'ios-call'} style={{ color: '#000', fontSize: 15 }} />
                          <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{this.state.orderStats.BizPhoneSales}</Text>
                        </View>
                      </View>

                    </LinearGradient>

                  </View>
                </View>


              </View>

              {/* BAWARCHI */}
              <View style={{ padding: 10, }}>
                <Text style={{ fontSize: 18, fontWeight: '400', }}>Bawarchi Overview</Text>
                <View style={{ flex: 1, marginTop: 6 }}>
                  {this.state.bawarchiCard.map((item, index) => (
                    <LinearGradient
                      key={index}
                      colors={[item.color1, item.color2]}
                      style={{
                        left: 0,
                        right: 0,
                        top: 0,
                        borderRadius: 4,
                        padding: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 5
                      }}
                    >
                      {/* {console.log("BAwarchi RENDER ", item)} */}
                      <Text style={{ color: '#fff', fontSize: 16 }}>{item.Type == "COUNT" ? "Bawarchi Count" : "Bawarchi Sale"}</Text>
                      <Text style={{ fontSize: 25, fontWeight: '600', alignSelf: 'center', color: '#fff' }}>₹ {item.Type == "COUNT" ? item.Count : item.Sales}</Text>

                      <View style={{ flexDirection: 'row', marginTop: 5 }}>

                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#28a745', borderRadius: 2 }}>
                          <Icon name={'md-laptop'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{item.Type == "COUNT" ? item.WebCount : item.WebSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#343a40', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'md-phone-portrait'} style={{ color: '#fff', fontSize: 15 }} />
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{item.Type == "COUNT" ? item.AppCount : item.AppSales}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ffc107', borderRadius: 2, marginLeft: 5 }}>
                          <Icon name={'ios-call'} style={{ color: '#000', fontSize: 15 }} />
                          <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', marginLeft: 2 }}>₹{item.Type == "COUNT" ? item.PhoneCount : item.PhoneSales}</Text>
                        </View>
                      </View>

                    </LinearGradient>

                  ))}
                </View>

              </View>
            </Display>
            <Display enable={this.state.loader} style={{ flex: 1 }}>
              <ActivityIndicator size={'large'} color={'#cd2121'} />
            </Display>

          </ScrollView>
        </Display>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  menuHeadItem: {
    height: 60,
    paddingLeft: 10, flexDirection: 'row',
    borderBottomColor: '#d8d8d8',
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
    shadowRadius: 1, elevation: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start', alignItems: 'center'
  },
  upperContainer: {
    flex: 3, justifyContent: 'center', alignItems: 'center'
  },
  middleContainer: {
    flex: 5, justifyContent: 'flex-start', alignItems: 'center',
  },
  clockViewMini: {
    backgroundColor: '#007bff'
    , borderRadius: 4, shadowColor: '#000', shadowOpacity: .58, height: 100,
    shadowRadius: 16, elevation: 24, padding: 10, borderRadius: 150,
    shadowOffset: {
      height: 12,
      width: 12
    },
    justifyContent: 'center', alignItems: 'center',
    width: 100
  },
  clockView: {
    backgroundColor: '#f7f7d7', marginTop: 10
    , borderRadius: 4, shadowColor: '#000', shadowOpacity: .58, height: 250,
    shadowRadius: 16, elevation: 24, padding: 10, borderRadius: 150,
    shadowOffset: {
      height: 12,
      width: 12
    },
    justifyContent: 'center', alignItems: 'center',
    width: 250
  },
  bottomContainer: {
    flex: 2,
  },
  morningBox: {
    backgroundColor: '#fff', marginTop: 10
    , borderRadius: 10, shadowColor: '#000', shadowOpacity: .58, height: 60,
    shadowRadius: 16, elevation: 24, padding: 10,
    shadowOffset: {
      height: 12,
      width: 12
    },
    justifyContent: 'center', alignItems: 'center',
    width: '90%',
    alignSelf: 'center'
  },
  clockinBox: {
    backgroundColor: '#0e6ba8', marginTop: 10
    , borderRadius: 50, shadowColor: '#000', shadowOpacity: .58, height: 60,
    shadowRadius: 16, elevation: 24, padding: 10,
    shadowOffset: {
      height: 12,
      width: 12
    },
    justifyContent: 'center', alignItems: 'center',
    width: '90%', flexDirection: 'row',
    alignSelf: 'center'
  },
  clockOutBox: {
    backgroundColor: '#0e6ba8'
    , borderRadius: 50, shadowColor: '#000', shadowOpacity: .58, height: 'auto',
    shadowRadius: 16, elevation: 24, padding: 10,
    shadowOffset: {
      height: 12,
      width: 12
    },
    justifyContent: 'center', alignItems: 'center',
    width: '90%', flexDirection: 'row',
    alignSelf: 'center'
  }, noInternetView: {
    backgroundColor: '#000', height: 'auto', width: '100%', borderRadius: 5,
    justifyContent: 'center', alignItems: 'center', paddingVertical: 4
  },
});