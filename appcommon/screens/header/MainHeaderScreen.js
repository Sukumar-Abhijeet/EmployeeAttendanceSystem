import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ActivityIndicator, AsyncStorage, TouchableOpacity, Image } from 'react-native';
import { withNavigation } from 'react-navigation';
import Display from 'react-native-display';
import Global from '../../Urls/Global.js';
const BASEPATH = Global.BASE_PATH;

import { Item, Icon, Picker, Button } from 'native-base';
class MainHeaderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: {},
            loader: false,
            selectedCityCode: "",
            cityList: [
                {
                    "Name": 'Select City',
                    "Code": 'DEFAULT',
                    "Status": 'Now',
                },
            ],
            selectedHubCode: '',
            hubList: [
                {
                    "Name": 'Select Hub',
                    "Code": 'DEFAULT',
                    "ZoneList": [],
                },

            ]
        }
    }

    async retrieveItem(key) {
        console.log("MainHeaderScreen retrieveItem() key: ", key);
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
        console.log("MainHeaderScreen storeItem() key: ", key);
        let jsonItem = null;
        try {
            jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        }
        catch (error) {
            console.log(error.message);
        }
        return jsonItem;
    }
    async removeItem(key) {
        console.log("MainHeaderScreen removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }



    fetchUserData() {
        console.log("MainHeaderScreen fetchUserData()");
        this.retrieveItem('UserData').then((data) => {
            //console.log("userData : ", data)
            if (data == null) {
                this.props.navigation.navigate('Login');
            }
            else {
                // console.log(data);
                this.setState({ userData: data })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchCityList() {
        console.log("MainHeaderScreen fetchCityList()");
        fetch(BASEPATH + Global.GET_ALL_CITIES_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen checkNumber() response : ', responseData);
            let defCL = this.state.cityList;
            defCL = defCL.concat(responseData.CityList);
            this.storeItem('CityData', defCL);
            this.setState({ cityList: defCL })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });

    }

    fetchHubList() {
        console.log("MainHeaderScreen fetchHubList()");
        let formValue = JSON.stringify({
            'cityCode': this.state.selectedCityCode,
        });
        fetch(BASEPATH + Global.GET_HUB_LIST_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen checkNumber() response : ', responseData);
            let defHL = this.state.hubList;
            defHL = defHL.concat(responseData.HubList);
            this.storeItem('HubData', defHL);
            this.setState({ hubList: defHL })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    changeCity(city) {
        console.log("MainHeaderScreen changeCity() :", city);
        if (city != "DEFAULT") {
            console.log("fetch HubList");
            this.setState({ selectedCityCode: city }, () => { this.fetchHubList(); this.storeItem('SelectedCC', city); })
        }
    }

    changeHub(hub) {
        console.log("MainHeaderScreen changeHub() :", hub);
        if (hub != "DEFAULT") {
            this.setState({ selectedHubCode: hub }, () => { this.storeItem('SelectedHC', hub); })
        }
    }

    componentDidMount() {
        console.log('MainHeaderScreen componentDidMount()', this.props);
        this.fetchUserData();
        this.checkCityHub();
        //this.fetchCityList();
    }

    checkCityHub() {
        console.log('MainHeaderScreen checkCityHub()');
        this.retrieveItem('CityData').then((data) => {
            // console.log("CityData : ", data);
            if (data == null) {
                this.fetchCityList();
            }
            else {
                this.setState({ cityList: data }, () => {
                    this.fetchAsyncSelectedCity()
                })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchAsyncSelectedCity() {
        console.log('MainHeaderScreen fetchAsyncSelectedCity()');
        this.retrieveItem('SelectedCC').then((data) => {
            //console.log("userData : ", data)
            if (data == null) {
                console.log("No Selected City");
            }
            else {
                this.setState({ selectedCityCode: data }, () => {
                    this.fetchAsyncSelectedHub();
                })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchAsyncSelectedHub() {
        console.log('MainHeaderScreen fetchAsyncSelectedHub()');
        this.retrieveItem('SelectedHC').then((data) => {
            //console.log("SelectedHC : ", data)
            if (data == null) {
                this.fetchHubList();
            }
            else {
                this.retrieveItem('HubData').then((hubData) => {
                    //console.log("HubData : ", hubData)
                    if (hubData == null) {
                        this.fetchCityList();
                    }
                    else {
                        this.setState({ hubList: hubData, selectedHubCode: data });
                    }
                }).catch((error) => {
                    console.log('Promise is rejected with error: ' + error);
                });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }
    render() {
        return (
            <View style={styles.mainContainer}>
                <Image source={require('../../assets/logos/logohd.png')} resizeMode={'cover'} style={{ width: 40, height: 40, alignSelf: 'center' }} />
                <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 5 }}>{this.state.userData.session_admin_employee_name}</Text>
                <View style={{ flex: 1, flexDirection: 'row', }}>
                    <View style={{ flex: 1, }}>
                        <Item picker>
                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                style={{ width: undefined }}
                                placeholder="City"
                                placeholderStyle={{ color: "#000" }}
                                placeholderIconColor="#007aff"
                                selectedValue={this.state.selectedCityCode}
                                onValueChange={this.changeCity.bind(this)}
                            >
                                {this.state.cityList.map((cityList, index) => (
                                    <Picker.Item label={cityList.Name + " (" + cityList.Status + ")"} value={cityList.Code} key={index} />
                                ))
                                }
                            </Picker>
                        </Item>
                    </View>
                    <View style={{ flex: 1, }}>
                        {/* <Text>Hub:</Text> */}
                        <Item picker>
                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                style={{ width: undefined }}
                                placeholder="Hub:"
                                placeholderStyle={{ color: "#000" }}
                                placeholderIconColor="#007aff"
                                selectedValue={this.state.selectedHubCode}
                                onValueChange={this.changeHub.bind(this)}
                            >
                                {this.state.hubList.map((hubList, index) => (
                                    <Picker.Item label={hubList.Name} value={hubList.Code} key={index} />
                                ))
                                }
                            </Picker>
                        </Item>
                    </View>
                </View>

            </View>
        );
    }
}
const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#ccc9cb',
        padding: 10,
        width: '100%',
        height: '80%',
        justifyContent: 'center', alignItems: 'center'
    },
});


export default MainHeaderScreen;