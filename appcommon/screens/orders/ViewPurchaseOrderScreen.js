import React, { Component } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, TouchableOpacity, ScrollView, AsyncStorage, ToastAndroid } from 'react-native';
import Global from '../../Urls/Global.js';
const BASEPATH = Global.BASE_PATH;
import Display from 'react-native-display';
import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, CheckBox, Body, Left, Right, Radio, Badge } from 'native-base';
import Modal from 'react-native-modal';
export default class ViewPurchaseOrderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedType: 'INPROGRESS',
            userData: {},
            cityCode: '',
            filterType: [
                {
                    "Name": 'New',
                    "Value": 'NEW',
                    "Selected": false,
                },
                {
                    "Name": 'In-Progress',
                    "Value": 'INPROGRESS',
                    "Selected": true,
                },
                {
                    "Name": 'History',
                    "Value": 'HISTORY',
                    "Selected": false,
                },
                {
                    "Name": 'Search',
                    "Value": 'SEARCH',
                    "Selected": false,
                },
            ],
            ordersList: [],
            loader: true,
        }
    }
    componentDidMount() {
        console.log('ViewPurchaseOrderScreen componentDidMount()')
        this.fetchUserData();
        this.props.navigation.addListener('didFocus', () => {
            this.fetchAsyncSelectedCity();
        });
    }

    fetchAsyncSelectedCity() {
        console.log('ViewPurchaseOrderScreen fetchAsyncSelectedCity()');
        this.retrieveItem('SelectedCC').then((data) => {
            //console.log("userData : ", data)
            if (data == null) {
                ToastAndroid.show("Set CITY & HUB from DrawerScreen", ToastAndroid.LONG);
                this.setState({ loader: true })
            }
            else {
                this.setState({ cityCode: data }, () => { this.fetchPurchaseOrderData() })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchUserData() {
        console.log("ViewPurchaseOrderScreen fetchUserData()");
        this.retrieveItem('UserData').then((data) => {
            // console.log("userData : ", data)
            if (data == null) {
                this.props.navigation.navigate('Login');
            }
            else {
                this.setState({ userData: data }, () => { })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchPurchaseOrderData() {
        console.log("ViewPurchaseOrderScreen fetchPurchaseOrderData()");
        if (this.state.cityCode != "") {
            let formValue = JSON.stringify({
                'uId': this.state.userData.session_admin_employee_id,
                "cityCode": this.state.cityCode,
                "orderType": this.state.selectedType
            });
            console.log('CreateCustomerOrderScreen fetchPurchaseOrderData() formValue : ', formValue);
            fetch(BASEPATH + Global.GET_PURCHASE_ORDERS_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseData) => {
                console.log('CreateCustomerOrderScreen fetchPurchaseOrderData() response : ', responseData);
                this.setState({ ordersList: responseData.OrdersList, loader: false })

            }).catch((error) => {
                console.log("Error Authenticate User: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                this.setState({ loader: false });
            });
        }
    }

    async retrieveItem(key) {
        console.log('ViewPurchaseOrderScreen retrieveItem() key: ', key);
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
        console.log('ViewPurchaseOrderScreen storeItem() key: ', key);
        let jsonItem = null;
        try {
            jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        }
        catch (error) {
            console.log(error.message);
        }
        return jsonItem;
    }

    changeType(type) {
        console.log('ViewOrderScreen changeDate() :', type);
        let arr = this.state.filterType;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].Value == type.Value) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false
            }
        }
        this.setState({ selectedType: type.Value, filterType: arr, loader: true }, () => { this.fetchPurchaseOrderData() })
    }


    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.menuHeadItem}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => { this.props.navigation.goBack(null) }}>
                            <Icon active name='md-arrow-back' style={{ color: '#000', fontSize: 20 }} />
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 8, color: '#cd2121', fontSize: 20, fontWeight: '600' }}>View Purchase Orders</Text>
                    </View>
                </View>
                <View style={{ backgroundColor: '#ebebeb', flexDirection: 'row' }}>
                    <Display style={{ flex: 1, }} enable={!this.state.cityCode == ""}>
                        <ScrollView horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {this.state.filterType.map((selectType, index) => (
                                <View key={index} style={{ padding: 20, paddingVertical: 15 }}>
                                    <TouchableOpacity onPress={() => { this.changeType(selectType) }}>
                                        <Text style={{ color: selectType.Selected == true ? "blue" : '#a5a2a2', fontSize: 18, fontWeight: '800', textDecorationLine: selectType.Selected == true ? 'underline' : undefined }}>{selectType.Name}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </Display>
                    <Display enable={this.state.cityCode == ""} style={{ marginTop: 5, padding: 10, width: '100%' }}>
                        <View style={styles.noInternetView}>
                            <Text style={{ color: '#fff' }}>NO CITY/HUB SELECTED</Text>
                            <Text style={{ fontSize: 12, color: '#fcf40f' }}>First Select City/HUb from Menu Screen in Left & restart</Text>
                        </View>
                    </Display>
                </View>

                <Display style={{ padding: 4 }} enable={!this.state.loader}>
                    <Display enable={this.state.ordersList.length < 1} >
                        <View style={{ backgroundColor: '#d1ecf1', padding: 10, alignSelf: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>No Order Data Found</Text>
                        </View>
                    </Display>
                    {this.state.ordersList.map((orderItem, index) => (
                        <View key={index} style={styles.orderBox}>
                            <View style={{ flexDirection: 'row', }}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <Badge style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#a5a2a2', width: 35, height: 25 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '400', color: '#fff' }}>#{index + 1}</Text>
                                    </Badge>
                                    <Text style={{ color: '#000', fontSize: 15, fontWeight: '400', marginLeft: 4 }}>Date : {orderItem.OrderDate}</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <TouchableOpacity style={{ alignSelf: 'flex-end', backgroundColor: '#fed844', padding: 5, borderRadius: 4 }}>
                                        <Text style={{ fontWeight: '600', color: '#fff' }}>View Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '300', marginTop: 4 }}>Order Info.</Text>
                            <View style={{ backgroundColor: '#ebebeb', padding: 2, }}>

                                <View style={{ flexDirection: 'row', padding: 5 }}>
                                    <View style={{ flex: 1, paddingLeft: 5 }}>
                                        <Text style={styles.smlTxt}>Order Of </Text>
                                        <Text style={styles.smlTxt}>For </Text>
                                        <Text style={[styles.smlTxt, { marginTop: 2 }]}>Status </Text>
                                        <Text style={[styles.smlTxt, { marginTop: 2 }]}>No. of items ordered</Text>
                                        <Text style={[styles.smlTxt, { marginTop: 1 }]}>Remarks</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bixText}>:{orderItem.OrderOf} </Text>
                                        <Text style={styles.bixText}>:{orderItem.EntityName} </Text>
                                        <Text style={styles.bixText}>:{orderItem.OrderStatus} </Text>
                                        <Text style={styles.bixText}>:{orderItem.OrderItemCount} </Text>
                                        <Text style={styles.bixText}>:{orderItem.OrderRemarks} </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </Display>
                <Display enable={this.state.loader} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <ActivityIndicator size={'large'} color={'#cd2121'} />
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
        padding: 10, flexDirection: 'row',
        borderBottomColor: '#d8d8d8',
        borderBottomWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        backgroundColor: '#fff',
        justifyContent: 'flex-start', alignItems: 'center'
    },
    noInternetView: {
        backgroundColor: '#000', height: 50, width: '100%', borderRadius: 5,
        justifyContent: 'center', alignItems: 'center'
    },
    orderBox: {
        backgroundColor: '#fff', marginTop: 10
        , borderRadius: 4, shadowColor: '#000', shadowOpacity: .58, height: 'auto',
        shadowRadius: 16, elevation: 24, padding: 5,
        shadowOffset: {
            height: 12,
            width: 12
        }
    },
    smlTxt: {
        fontSize: 15, fontWeight: '300',
    },
    bixText: {
        fontSize: 16, fontWeight: '600', color: '#000'
    }
});