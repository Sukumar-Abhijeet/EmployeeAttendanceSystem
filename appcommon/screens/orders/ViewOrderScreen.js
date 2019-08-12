import React, { Component } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, TouchableOpacity, ScrollView, AsyncStorage, ToastAndroid, Dimensions } from 'react-native';
import Global from '../../Urls/Global.js';
const BASEPATH = Global.BASE_PATH;
import Display from 'react-native-display';
import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, CheckBox, Body, Left, Right, Radio, Badge, DatePicker } from 'native-base';
import Modal from 'react-native-modal';
export default class ViewOrderScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            refreshing: false,
            cityCode: '',
            selectedOrder: 'FOOD',
            searchOrderId: '',
            loader: false,
            userData: {},
            orderCategory: [
                {
                    "Type": 'Food',
                    "Selected": true
                },
                {
                    "Type": 'Bawarchi',
                    "Selected": false
                }
            ],
            selectedDate: 'TODAY',
            filterDate: [
                {
                    "Date": 'Upcoming',
                    "Value": 'UPCOMING',
                    "Selected": false,
                },
                {
                    "Date": 'Today',
                    "Value": 'TODAY',
                    "Selected": true,
                },
                {
                    "Date": 'Yesterday',
                    "Value": 'YESTERDAY',
                    "Selected": false,
                },
                {
                    "Date": 'Last 7 days',
                    "Value": 'LAST7D',
                    "Selected": false,
                },
                {
                    "Date": 'Last 1 month',
                    "Value": 'LAST1M',
                    "Selected": false,
                },
                {
                    "Date": 'Custom Date',
                    "Value": 'CUSTOM',
                    "Selected": false,
                }
            ],
            cStartDate: 'Select Start Date',
            cEndDate: 'Select End Date',
            tempOrderList: [],
            orderList: [],
            totalAmount: 0,
            appliedFilters: false,
            filtersModal: null,

            selectedDeliveryBoy: '',
            trackDelPerList: [],

            selectedPaymentMode: '',
            paymentModeList: [
                {
                    "Name": "Cash",
                    "Value": "CASH",
                    "Selected": false,
                },
                {
                    "Name": "Credit",
                    "Value": "CREDIT",
                    "Selected": false,
                },
                {
                    "Name": "Online",
                    "Value": "ONLINE",
                    "Selected": false,
                },
                {
                    "Name": "Paytm",
                    "Value": "PAYTM",
                    "Selected": false,
                },
                {
                    "Name": "Upi",
                    "Value": "UPI",
                    "Selected": false,
                }
            ],

            selectedOrderOf: '',
            orderOfList: [
                {
                    "Name": 'Business',
                    "Value": 'BMFBUSINESS',
                    "Selected": false,
                },
                {
                    "Name": 'Food',
                    "Value": 'BMFFOOD',
                    "Selected": false,
                }
            ],

            selectedOrderType: '',
            orderTypeList: [
                {
                    "Name": 'App',
                    "Value": 'APP',
                    "Selected": false,
                },
                {
                    "Name": 'Web',
                    "Value": 'WEB',
                    "Selected": false,
                },
                {
                    "Name": 'Phone',
                    "Value": 'PHONE',
                    "Selected": false,
                }
            ]
        }
    }
    componentDidMount() {
        console.log('ViewOrderScreen componentDidMount()')
        this.fetchUserData();
        this.props.navigation.addListener('didFocus', () => {
            this.fetchAsyncSelectedCity();
        });
    }

    fetchAsyncSelectedCity() {
        console.log('MainHeaderScreen fetchAsyncSelectedCity()');
        this.retrieveItem('SelectedCC').then((data) => {
            //console.log("userData : ", data)
            if (data == null) {
                ToastAndroid.show("Set CITY & HUB from DrawerScreen", ToastAndroid.LONG);
                this.setState({ loader: true })
            }
            else {
                this.setState({ cityCode: data }, () => {
                    this.getOrders(), this.fetchDelPersonCurrentStatus()
                })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
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


    fetchUserData() {
        console.log("ViewOrderScreen fetchUserData()");
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

    getOrders = (param) => {
        console.log("ViewOrderScreen getOrders() ", param);
        let formValue = "";
        if (param == "CUSTOMDT" || this.state.selectedDate == "CUSTOM") {
            console.log("Custom Date ORders");
            if (this.state.cStartDate != "Select Start Date" && this.state.cEndDate != "Select End Date") {
                this.setState({ filtersModal: null })
                formValue = JSON.stringify({
                    'orderDate': this.state.selectedDate,
                    'uId': this.state.userData.session_admin_employee_id,
                    'orderOf': this.state.selectedOrder,
                    "cityCode": this.state.cityCode,
                    'startDate': this.state.cStartDate,
                    'endDate': this.state.cEndDate,
                });
            }
        } else {
            formValue = JSON.stringify({
                'orderDate': this.state.selectedDate,
                'uId': this.state.userData.session_admin_employee_id,
                'orderOf': this.state.selectedOrder,
                "cityCode": this.state.cityCode
            });
        }
        this.setState({ loader: true, refreshing: true, })
        if (this.state.selectedDate != "") {

            console.log('ViewOrderScreen getOrders() formvalue : ', formValue);
            fetch(BASEPATH + Global.GET_ORDERS, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseData) => {
                console.log('ViewOrderScreen getOrders() response : ', responseData);
                this.setState({ tempOrderList: responseData.OrdersList, orderList: responseData.OrdersList })
                let totalAmount = 0;
                for (i = 0; i < responseData.OrdersList.length; i++) {
                    totalAmount += responseData.OrdersList[i].NetPayable;
                }
                this.setState({ totalAmount: totalAmount }, () => { this.setState({ loader: false, refreshing: false }) })
            }).catch((error) => {
                console.log("Error Authenticate User: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                this.setState({ loader: false, refreshing: false });
            });
        }
    }

    viewOrderByCategory(cat) {
        console.log('ViewOrderScreen viewOrderByCategory() :', cat);
        let arr = this.state.orderCategory;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].Type == cat.Type) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false
            }
        }
        if (cat.Type == "Food") {
            this.setState({ selectedOrder: 'FOOD' })
        } else {
            this.setState({ selectedOrder: 'BAWARCHI' })
        }
        this.setState({ orderCategory: arr }, () => { this.getOrders() })
        // console.log("arr : ", arr);
    }

    changeDate(date) {
        console.log('ViewOrderScreen changeDate() :', date);
        let arr = this.state.filterDate;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].Value == date.Value) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false
            }
        }
        if (date.Value == "CUSTOM") {
            this.setState({ selectedDate: date.Value, filterDate: arr, filtersModal: 2 })
        } else {
            this.setState({ selectedDate: date.Value, filterDate: arr }, () => { this.getOrders() })

        }
    }

    viewOrderDetails(order) {
        console.log('ViewOrderScreen viewOrderDetails() :', order, this.state.userData.session_admin_employee_id);
        order.Uid = this.state.userData.session_admin_employee_id
        this.props.navigation.navigate('ViewOrderDetailsPG', { orderItem: order, })
    }

    fetchDelPersonCurrentStatus() {
        console.log(" ViewOrderScreen fetchDelPersonCurrentStatus()");
        let formValue = JSON.stringify({
            'uId': this.state.userData.session_admin_employee_id,
            "cityCode": this.state.cityCode
        });
        console.log('ViewOrderScreen fetchDelPersonCurrentStatus() formvalue : ', formValue);
        fetch(BASEPATH + Global.FETCH_DEL_PERSON_TRACK_STATUS_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('ViewOrderScreen fetchDelPersonCurrentStatus() response : ', responseData);
            this.setState({ trackDelPerList: responseData.DelPerList })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    changeDeliveryBoy(id) {
        console.log('ViewOrderScreen changeDeliveryBoy() response : ', id);
        this.setState({ selectedDeliveryBoy: id })
    }
    changePaymentMode(value) {
        console.log('ViewOrderScreen changePaymentMode() response : ', value);
        this.setState({ selectedPaymentMode: value })
    }
    selectOrderOf(orderOf) {
        console.log('ViewOrderScreen selectOrderOf() response : ', orderOf);
        let arr = this.state.orderOfList;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].Value == orderOf.Value) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false;
            }
        }
        this.setState({ selectedOrderOf: orderOf.Value, orderOfList: arr })
    }

    selectOrderType(orderType) {
        console.log('ViewOrderScreen selectOrderType() response : ', orderType);
        let arr = this.state.orderTypeList;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].Value == orderType.Value) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false;
            }
        }
        this.setState({ selectedOrderType: orderType.Value, orderTypeList: arr })
    }

    applyFilter() {
        console.log('ViewOrderScreen applyFilter()', this.state.selectedDeliveryBoy, this.state.selectedPaymentMode, this.state.selectedOrderOf, this.state.selectedOrderType);
        this.setState({ appliedFilters: true })
        let orderList = [];
        if (this.selectedDeliveryBoy != "" || this.selectedPaymentMode != "" || this.selectedOrderType != "" || this.selectedOrderOf != "") {

            for (let i = 0; i < this.state.tempOrderList.length; i++) {

                let obj = this.state.tempOrderList[i];

                let str = '';

                if (this.selectedDeliveryBoy != "") {
                    str += 'obj.DelPersonId == this.state.selectedDeliveryBoy && ';
                }

                if (this.selectedPaymentMode != "") {
                    str += 'obj.PaymentMode.toUpperCase() == this.state.selectedPaymentMode && ';
                }

                if (this.selectedOrderOf != "") {
                    str += 'obj.OrderOf == this.state.selectedOrderOf && ';
                }

                if (this.selectedOrderType != "") {
                    str += 'obj.Type == this.state.selectedOrderType && ';
                }
                if (str != "") {
                    str = str.substr(0, str.length - 4);
                    console.log("str: ", str);
                    console.log("Eval(str): ", eval(str));
                    if (eval(str)) {

                        orderList.push(obj);
                    }
                }
            }
            console.log("orderlist: ", orderList);
        }

        else {
            orderList = JSON.parse(JSON.stringify(this.state.tempOrderList));
        }
        this.setState({ orderList: orderList, filtersModal: null });
    }

    applyFilterReset() {
        console.log('ViewOrderScreen applyFilterReset()', this.state.selectedDeliveryBoy, this.state.selectedPaymentMode, this.state.selectedOrderOf, this.state.selectedOrderType);

        let arrOrderOf = this.state.orderOfList;
        for (i = 0; i < arrOrderOf.length; i++) {
            arrOrderOf[i].Selected = false;
        }

        let arrOrderType = this.state.orderTypeList;
        for (i = 0; i < arrOrderType.length; i++) {
            arrOrderType[i].Selected = false;
        }

        let ordersList = JSON.parse(JSON.stringify(this.state.tempOrderList));

        this.setState({ selectedDeliveryBoy: '', selectedPaymentMode: '', selectedOrderOf: '', selectedOrderType: '', orderOfList: arrOrderOf, orderTypeList: arrOrderType, appliedFilters: false, orderList: ordersList, filtersModal: null })
    }

    searchOrders() {
        if (this.state.searchOrderId != "") {
            this.setState({ loader: true })
            let formValue = JSON.stringify({
                'uId': this.state.userData.session_admin_employee_id,
                'searchOrder': this.state.searchOrderId,
            });
            console.log('ViewOrderScreen searchOrders() formvalue : ', formValue);
            fetch(BASEPATH + Global.SEARCH_ORDERS_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseData) => {
                console.log('ViewOrderScreen searchOrders() response : ', responseData);
                this.setState({ tempOrderList: responseData.OrdersList, orderList: responseData.OrdersList })
                let totalAmount = 0;
                for (i = 0; i < responseData.OrdersList.length; i++) {
                    totalAmount += responseData.OrdersList[i].NetPayable;
                }
                this.setState({ totalAmount: totalAmount }, () => { this.setState({ loader: false, refreshing: false }) })
            }).catch((error) => {
                console.log("Error Authenticate User: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                this.setState({ loader: false, refreshing: false });
            });
        } else {
            ToastAndroid.show("Invalid Order Id", ToastAndroid.LONG);
        }
    }

    changeCustomDate(date, val) {
        console.log('ViewOrderScreen changeCustomDate(): ', date, val);
        let dt = this.findDate(date);
        console.log(dt, val);
        if (val == "SD") {
            this.setState({ cStartDate: dt })
        } else {
            this.setState({ cEndDate: dt })
        }
    }

    findDate(today) {
        console.log("findDate() : ", today)
        let date = today.getFullYear() + "-" + (((today.getMonth() + 1) < 10) ? "0" + (today.getMonth() + 1) : today.getMonth() + 1) + "-" + ((today.getDate() < 10) ? ("0" + today.getDate()) : today.getDate());
        return date;
    }


    __renderOrderDetails = () => (
        <View style={[styles.filterModalContainer, { width: '95%' }]}>
            <View style={{ backgroundColor: '#007bff', flex: 2 }}>
                <View style={{ padding: 6, borderBottomColor: '#fff', borderBottomWidth: 1, height: 30 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff', }}>Quick Filters</Text>
                </View>
                <View style={{ padding: 6, paddingVertical: 15 }}>
                    <Text style={{ color: '#fff' }}>Delivery Person</Text>
                </View>
                <View style={{ padding: 6, paddingVertical: 15 }}>
                    <Text style={{ color: '#fff' }}>Payment modes</Text>
                </View>
                <View style={{ padding: 6, paddingVertical: 15 }}>
                    <Text style={{ color: '#fff' }}>Order Of</Text>
                </View>
                <View style={{ padding: 6, paddingVertical: 15 }}>
                    <Text style={{ color: '#fff' }}>Order Type</Text>
                </View>
                <View style={{ padding: 6, paddingVertical: 15 }}>
                    <Text style={{ color: '#fff' }}>Actions</Text>
                </View>
            </View>
            <View style={{ flex: 4 }}>
                <View style={{ padding: 6, alignSelf: 'flex-end', height: 30 }}>
                    <TouchableOpacity onPress={() => { this.setState({ filtersModal: null }) }}>
                        <Icon name={'md-close'} style={{ color: '#cd2121', fontSize: 20 }} />
                    </TouchableOpacity>
                </View>
                <View>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="arrow-down" />}
                        style={{ width: undefined }}
                        placeholder="Select Location"
                        placeholderStyle={{ color: "#bfc6ea" }}
                        placeholderIconColor="#007aff"
                        selectedValue={this.state.selectedDeliveryBoy}
                        onValueChange={this.changeDeliveryBoy.bind(this)}
                    >
                        {this.state.trackDelPerList.map((dB, index) => (
                            <Picker.Item label={dB.DelPerName} value={dB.DelPerId} key={index} />
                        ))
                        }
                    </Picker>
                </View>
                <View>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="arrow-down" />}
                        style={{ width: undefined }}
                        placeholder="Select Location"
                        placeholderStyle={{ color: "#bfc6ea" }}
                        placeholderIconColor="#007aff"
                        selectedValue={this.state.selectedPaymentMode}
                        onValueChange={this.changePaymentMode.bind(this)}
                    >
                        {this.state.paymentModeList.map((payment, index) => (
                            <Picker.Item label={payment.Name} value={payment.Value} key={index} />
                        ))
                        }
                    </Picker>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    {this.state.orderOfList.map((orderOf, index) => (
                        <View key={index} style={{ flexDirection: 'row' }}>
                            <CheckBox onPress={() => { this.selectOrderOf(orderOf) }} checked={orderOf.Selected} color="green" />
                            <Text style={{ marginLeft: 12 }}>{orderOf.Name}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', paddingVertical: 15, marginTop: 10 }}>
                    {this.state.orderTypeList.map((orderType, index) => (
                        <View key={index} style={{ flexDirection: 'row' }}>
                            <CheckBox onPress={() => { this.selectOrderType(orderType) }} checked={orderType.Selected} color="green" />
                            <Text style={{ marginLeft: 12 }}>{orderType.Name}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', flex: 1, paddingHorizontal: 2, paddingBottom: 1 }}>
                    <View style={{ flex: 1, }} opacity={(this.state.selectedDeliveryBoy == "" && this.state.selectedPaymentMode == "" && this.state.selectedOrderOf == "" && this.state.selectedOrderType == "") ? .5 : 1}>
                        <TouchableOpacity disabled={(this.state.selectedDeliveryBoy == "" && this.state.selectedPaymentMode == "" && this.state.selectedOrderOf == "" && this.state.selectedOrderType == "")} onPress={() => { this.applyFilterReset() }} style={[styles.actionBtn,]}>
                            <Text style={{ color: '#fff', fontWeight: '500' }}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginLeft: 1 }} opacity={(this.state.selectedDeliveryBoy == "" && this.state.selectedPaymentMode == "" && this.state.selectedOrderOf == "" && this.state.selectedOrderType == "") ? .5 : 1}>
                        <TouchableOpacity disabled={(this.state.selectedDeliveryBoy == "" && this.state.selectedPaymentMode == "" && this.state.selectedOrderOf == "" && this.state.selectedOrderType == "")} onPress={() => { this.applyFilter() }} style={[styles.actionBtn, { backgroundColor: '#fed844' }]}>
                            <Text style={{ color: '#fff', fontWeight: '500' }}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
    __rendeCustomDateOrders = () => (
        <View style={styles.modalContainer}>
            <View style={{ backgroundColor: '#4dc74d', padding: 10, flexDirection: 'row' }}>
                <View style={{ flex: 3.5 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>View Orders</Text>
                    <Text>By Custom Dates</Text>
                </View>
                <View style={{ flex: .5, }}>
                    <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => { this.setState({ filtersModal: null }) }}>
                        <Icon name={'md-close'} style={{ color: '#cd2121', fontSize: 20 }} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: '500' }}>Start Date</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#ebebeb' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <DatePicker
                                defaultDate={new Date()}
                                minimumDate={new Date(2018, 1, 18)}
                                maximumDate={new Date()}
                                locale={"en"}
                                timeZoneOffsetInMinutes={undefined}
                                modalTransparent={false}
                                animationType={"fade"}
                                androidMode={"default"}
                                placeHolderText={this.state.cStartDate}
                                textStyle={{ color: "green" }}
                                placeHolderTextStyle={{ color: "#d3d3d3" }}
                                onDateChange={(date) => { this.changeCustomDate(date, "SD") }}
                                disabled={false}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: '500' }}>End Date</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#ebebeb' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <DatePicker
                                defaultDate={new Date()}
                                minimumDate={new Date(2018, 1, 18)}
                                maximumDate={new Date()}
                                locale={"en"}
                                timeZoneOffsetInMinutes={undefined}
                                modalTransparent={false}
                                animationType={"fade"}
                                androidMode={"default"}
                                placeHolderText={this.state.cEndDate}
                                textStyle={{ color: "green" }}
                                placeHolderTextStyle={{ color: "#d3d3d3" }}
                                onDateChange={(date) => { this.changeCustomDate(date, "ED") }}
                                disabled={false}
                            />
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ alignSelf: 'center', marginTop: 5 }} opacity={(this.state.cStartDate == "Select Start Date" || this.state.cEndDate == "Select End Date") ? .5 : 1}>
                <TouchableOpacity onPress={() => { this.getOrders("CUSTOMDT") }} disabled={(this.state.cStartDate == "Select Start Date" || this.state.cEndDate == "Select End Date")} style={{ padding: 8, backgroundColor: '#4dc74d', }}>
                    <Text style={{ fontSize: 18, fontWeight: '500', color: '#fff' }}>APPLY</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.menuHeadItem}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => { this.props.navigation.goBack(null) }}>
                            <Icon active name='md-arrow-back' style={{ color: '#000', fontSize: 20 }} />
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 8, color: '#cd2121', fontSize: 20, fontWeight: '600' }}>View Orders</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-end', flexDirection: 'row', flex: 1, }}>
                        {
                            this.state.orderCategory.map((cat, index) => (
                                <TouchableOpacity onPress={() => { this.viewOrderByCategory(cat) }} style={{
                                    padding: 10, paddingVertical: 4, backgroundColor: (cat.Selected) ? '#007bff' : '#fff', justifyContent: 'center', alignItems: 'center', width: '50%', borderColor: '#007bff', borderWidth: 1, flexDirection: 'row',
                                    borderBottomLeftRadius: (cat.Type == "Food") ? 15 : 0,
                                    borderTopLeftRadius: (cat.Type == "Food") ? 15 : 0,
                                    borderBottomRightRadius: (cat.Type != "Food") ? 15 : 0,
                                    borderTopRightRadius: (cat.Type != "Food") ? 15 : 0
                                }} key={index}>
                                    <Text style={{ color: (cat.Selected) ? '#fff' : '#000', fontWeight: '800' }}>{cat.Type}</Text>
                                    <Display enable={cat.Selected}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 4, padding: 5, backgroundColor: '#cd2121', borderRadius: 12 }}>
                                            <Text style={{ color: '#fff', fontWeight: '600' }}>{this.state.orderList.length}</Text>
                                        </View>
                                    </Display>
                                </TouchableOpacity>
                            ))
                        }
                    </View>

                </View>
                <View style={{ backgroundColor: '#e5e5e5', paddingHorizontal: 10, paddingTop: 5 }}>

                    {/* <View style={{ flex: 1, backgroundColor: 'red', marginTop: 5 }}>
                        <Item regular>
                            <Input placeholder='Search Order' />
                        </Item>
                    </View> */}
                    <Text>Search By Days :</Text>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ flex: 1 }}>
                            <ScrollView horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            >
                                {this.state.filterDate.map((selectType, index) => (
                                    <View key={index} style={{ padding: 20, paddingVertical: 15 }}>
                                        <TouchableOpacity onPress={() => { this.changeDate(selectType) }}>
                                            <Text style={{ color: selectType.Selected == true ? "blue" : '#a5a2a2', fontSize: 18, fontWeight: '800' }}>{selectType.Date}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                        {/* */}
                    </View>
                    <View>
                        <Text>Search By Order ID:</Text>
                        <View>
                            <Item>
                                <Icon active name='ios-search' />
                                <Input placeholder='Enter Order Id'
                                    keyboardType='numeric'
                                    maxLength={10}
                                    returnKeyType="go"
                                    onSubmitEditing={() => { this.searchOrders(); }}
                                    onChangeText={(searchOrderId) => { this.setState({ searchOrderId }) }}
                                />
                                <Button style={{ backgroundColor: 'green', paddingHorizontal: 4, borderRadius: 3, width: 55, justifyContent: 'center', alignItems: 'center' }} disabled={this.state.loader} onPress={() => { this.searchOrders() }}>
                                    <Display enable={!this.state.loader}>
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '400' }} >Search</Text>
                                    </Display>
                                    <Display enable={this.state.loader}>
                                        <ActivityIndicator size={'small'} color={'#fff'} />
                                    </Display>
                                </Button>
                            </Item>
                        </View>
                    </View>
                    <Display enable={this.state.cityCode == ""} style={{ marginTop: 5, padding: 10 }}>
                        <View style={styles.noInternetView}>
                            <Text style={{ color: '#fff' }}>NO CITY/HUB SELECTED</Text>
                            <Text style={{ fontSize: 12, color: '#fcf40f' }}>First Select City/HUb from Menu Screen in Left & restart</Text>
                        </View>
                    </Display>
                </View>
                <Display enable={!this.state.loader} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 65 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.getOrders}
                                title={"Auto Refreshing"}
                            />
                        }
                    >
                        <Display enable={this.state.orderList.length < 1} style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#d1ecf1', padding: 20, marginTop: 100 }}>
                                <Text style={{ color: '#0c5485', fontSize: 18, fontWeight: '600' }}>No Orders!</Text>
                            </View>
                        </Display>



                        {
                            this.state.orderList.map((order, index) => (
                                <View key={index} style={styles.orderViewBox}>
                                    <View style={{ flexDirection: 'row', backgroundColor: (order.Status == "Order Placed") ? "#f4ca38" : order.Status == "Order Cancelled" ? "#000" : order.Status == "Order Delivered" ? "#79b791" : "#fff", padding: 10 }}>
                                        <View style={{ flex: 3.5 }}>
                                            <Text style={{ color: order.Status == "Order Cancelled" ? "#fff" : '#000', fontSize: 18 }}>#{order.Id}</Text>
                                            <Text style={{ color: order.Status == "Order Confirmed" || order.Status == "Cooking" || order.Status == "Out For Delivery" ? "#757474" : '#fff' }}>Placed @{order.PlacedDate}</Text>
                                        </View>
                                        <View style={{ flex: 1.5, }}>
                                            <View style={{ alignSelf: 'flex-end', marginTop: -30, backgroundColor: (order.Type == "PHONE") ? '#5b507a' : (order.Type == "WEB") ? '#132e32' : '#6da72d', paddingHorizontal: 4, borderRadius: 4 }}>
                                                <Icon active name={(order.Type == "PHONE") ? 'ios-call' : (order.Type == "WEB") ? 'md-laptop' : 'md-phone-portrait'} style={{ color: '#fff', fontSize: 27 }} />
                                            </View>

                                            <TouchableOpacity onPress={() => { this.viewOrderDetails(order) }} style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: (order.Type == "PHONE") ? '#5b507a' : (order.Type == "WEB") ? '#132e32' : '#6da72d', borderRadius: 4, marginTop: 8, paddingVertical: 5 }}>
                                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>View Details</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{ backgroundColor: order.Status == "Cooking" ? '#f06a6a' : '#ebebeb' }}>
                                        <View style={{ borderBottomColor: '#fff', borderBottomWidth: 1, flexDirection: 'row', padding: 10, paddingVertical: 20 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#3f3d3d' }}>{order.CustomerName} | <Text>{order.CustomerName == order.BuyerName ? "" : order.BuyerName}</Text></Text>
                                                <Text style={{ fontSize: 13, fontWeight: '200', color: '#3f3d3d' }}>{order.CustomerPhone}</Text>
                                            </View>
                                            <View style={{ flex: 1, paddingLeft: 10 }}>
                                                <Text style={{ fontSize: 14, fontWeight: '400', color: order.Status == "Cooking" ? '#fff' : '#3f3d3d' }}>{order.DeliveryAddress}</Text>
                                            </View>
                                        </View>
                                        <View style={{ padding: 10 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Order Status</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.smallText, { color: order.Status == "Cooking" ? '#fff' : order.Status == "Order Cancelled" ? "#cd2121" : '#3f3d3d' }]}>{order.Status}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Order Total</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.smallText, { color: order.Status == "Cooking" ? '#fff' : '#3f3d3d' }]}>₹ {order.OrderTotal}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>PaymentMode</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.smallText, { color: order.Status == "Cooking" ? '#fff' : '#3f3d3d' }]}>{order.PaymentMode}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Net Payable</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Badge style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 4 }}>
                                                        <Text style={[styles.smallText, { fontSize: 18, fontWeight: '400', marginLeft: 0, color: '#fff' }]}>₹ {order.NetPayable}</Text>
                                                    </Badge>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Payment Status</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.smallText, { color: order.Status == "Cooking" ? '#fff' : '#3f3d3d' }]}>{order.PaymentStatus}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Coupon</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.smallText, { color: order.Status == "Cooking" ? '#fff' : '#3f3d3d' }]}>{order.Coupon}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                </View>
                            ))
                        }
                    </ScrollView>
                </Display>
                <Display enable={this.state.loader} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size={'large'} color={'#cd2121'} />
                </Display>
                <View style={{ height: 40, width: '80%', zIndex: 100, bottom: 0, position: 'absolute', padding: 5, paddingHorizontal: 10, alignSelf: 'center' }}>
                    <View style={{
                        height: 30, borderColor: '#007bff', flexDirection: 'row', borderRadius: 20, padding: 5, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
                        shadowRadius: 1, elevation: 1,
                        backgroundColor: '#fff',
                    }}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}>
                            <Text style={styles.footerTxt}>Total</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', marginLeft: 2 }}>
                            <Text style={styles.footerTxt}>{this.state.orderList.length} Orders</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', marginLeft: 2 }}>
                            <Text style={styles.footerTxt}>₹ {this.state.totalAmount}</Text>
                        </View>
                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff', marginLeft: 2, borderTopRightRadius: 10, borderBottomRightRadius: 10 }} onPress={() => { this.setState({ filtersModal: 1 }) }}>
                            <Icon active name={'ios-color-filter'} style={{ color: (this.state.appliedFilters) ? "#cd2121" : '#007bff', marginRight: 3, fontSize: 18 }} />
                            <Text style={[styles.footerTxt, { color: (this.state.appliedFilters) ? "#cd2121" : '#007bff' }]}>Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Modal isVisible={this.state.filtersModal === 1} style={styles.bottomModal} onBackButtonPress={() => this.setState({ filtersModal: null })}>
                    {this.__renderOrderDetails()}
                </Modal>
                <Modal isVisible={this.state.filtersModal === 2} style={styles.newBottomModal} onBackButtonPress={() => this.setState({ filtersModal: null })}>
                    {this.__rendeCustomDateOrders()}
                </Modal>
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
    orderViewBox: {
        borderRadius: 4, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        backgroundColor: '#fff', padding: 5
    },
    largeText: {
        fontSize: 23,
        fontWeight: '600',
        color: '#747475'
    },
    smallText: {
        color: '#636262',
        fontSize: 14, marginLeft: 10
    },
    textStyle: {
        fontSize: 18, fontWeight: '500', color: '#1e1d1d'
    },
    footerTxt: {
        color: '#007bff',
        fontSize: 18,
        fontWeight: '600'
    },
    bottomModal: {
        justifyContent: 'center', alignItems: 'center',
        margin: 0,
    },
    newBottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    filterModalContainer: {
        width: "80%",
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 0,
        borderRadius: 4,
        shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        height: 250,
    },
    modalContainer:
    {
        width: null,
        backgroundColor: '#fff',
        height: Dimensions.get('window').height / 2 - 150,
        flexDirection: 'column',
        padding: 4
    },
    actionBtn: {
        backgroundColor: '#cd2121', padding: 5, flex: 1, justifyContent: 'center',
        alignItems: 'center', borderRadius: 4
    },
    noInternetView: {
        backgroundColor: '#000', height: 'auto', width: '100%', borderRadius: 5,
        justifyContent: 'center', alignItems: 'center', paddingVertical: 4
    },
});