import React, { Component } from 'react';
import { Keyboard, StyleSheet, Text, View, ActivityIndicator, AsyncStorage, ToastAndroid, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, Left, Right, Radio, Badge, DatePicker, CheckBox } from 'native-base';
import Display from 'react-native-display';
import Global from '../../Urls/Global.js';
import FlatGrid from 'react-native-super-grid';
const BASEPATH = Global.BASE_PATH;
export default class CreateB2BOrderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            todayDate: '',
            hrs: '',
            mins: '',
            secs: '',
            ampm: '',
            userData: {},
            customerList: [
                {
                    "ID": 'DEFAULT',
                    "Name": 'Select a Business',
                    "Phone": 'DEFAULT'
                }
            ],
            selectedCustomer: '',
            cityCode: 'BBSR',
            hubCode: 'HO',
            categoryList: [],
            searchProductList: [],
            tempLocProductsList: [],
            selectedCategory: {},
            cartArr: [],
            searchProducts: '',
            loader: true,
            checkoutObj: {
                itemTotal: 0,
                deliveryCharge: 0,
                packingCharge: 0,
                taxesApplicable: "NO",
                netPayable: 0,
                items: [],
                instructions: "",
                buyerName: "",
                customerId: "",
                paymentMode: "CREDIT"
            },
            checkoutState: false,
            refreshing: false,
            selectedPaymentType: 'CREDIT',
            paymentTypeList: [
                {
                    "Name": 'Cash',
                    "Value": 'CASH',
                    "Selected": false
                },
                {
                    "Name": 'Credit',
                    "Value": 'CREDIT',
                    "Selected": true
                }

            ],
            delCharge: 0,
            pakCharge: 0,
            taxesApplicable: false,
            showCategory: false
        }
    }
    componentDidMount() {
        console.log('CreateB2BOrderScreen componentDidMount()')
        this.fetchUserData();
        this.clockTimer();
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
        console.log("CreateCustomerOrderScreen fetchUserData()");
        this.retrieveItem('UserData').then((data) => {
            console.log("userData : ", data)
            if (data == null) {
                this.props.navigation.navigate('Login');
            }
            else {
                // console.log(data);
                this.setState({ userData: data }, () => {
                    let today = new Date();
                    let date = this.findDate(today);
                    this.setState({ todayDate: date }, () => { this.fetchB2BCustomers() })
                })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchB2BCustomers = () => {
        console.log('CreateB2BOrderScreen fetchB2BCustomers()');
        //this.setState({ refreshing: true })
        let formValue = JSON.stringify({
            'uId': this.state.userData.session_admin_employee_id,
            'cityCode': this.state.cityCode,
        });
        console.log('CreateB2BOrderScreen fetchB2BCustomers() formValue : ', formValue);
        fetch(BASEPATH + Global.GET_B2B_CUSTOMERS_BY_CITY_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            let cL = this.state.customerList;
            console.log('CreateB2BOrderScreen fetchB2BCustomers() response : ', responseData);
            cL = cL.concat(responseData.CustomerList);
            this.setState({ loader: false, customerList: cL, });

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false, });
        });
    }

    customerChange(Id) {
        console.log("CreateB2BOrderScreen customerChange() : ", Id);
        if (id1 = "DEFAULT") {
            this.setState({ selectedCustomer: Id, loader: true }, () => { this.getAllProductsOfB2BCustomer() })
        }
    }

    getAllProductsOfB2BCustomer() {
        console.log("CreateB2BOrderScreen getAllProductsOfB2BCustomer()");
        let formValue = JSON.stringify({
            'custId': this.state.selectedCustomer,
            'uId': this.state.userData.session_admin_employee_id,
            'cityCode': this.state.cityCode,
        });
        let cktObj = this.state.checkoutObj;
        cktObj.customerId = this.state.selectedCustomer;
        this.setState({ checkoutObj: cktObj });
        console.log('CreateB2BOrderScreen getAllProductsOfB2BCustomer() formValue : ', formValue);
        fetch(BASEPATH + Global.GET_B2B_CUSTOMERS_PRODUCTS_FOR_ORDER_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateB2BOrderScreen getAllProductsOfB2BCustomer() response : ', responseData);
            // this.setState({ loader: false, customerList: responseData.CustomerList });
            if (responseData.Success == "Y") {
                this.setState({ searchProductList: responseData.ProductList })
                this.makeCategoryList(responseData.ProductList);
            }
            else {
                this.setState({ searchProductList: [], loader: false })
            }

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    makeCategoryList(ar) {
        console.log("CreateB2BOrderScreen makeCategoryList()");
        let catList = [];
        ar.forEach(element => {
            let obj = { Id: element.CatId, Name: element.CatName };
            let flag = true;
            for (let i = 0; i < catList.length; i++) {
                if (catList[i].Id == element.CatId) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                catList.push(obj);
            }
        });
        this.setState({ categoryList: catList, loader: false }, () => { console.log("catList: ", catList); })

    }

    checkoutCart() {
        console.log("checkoutCart()");
        let itemTotal = 0;
        let deliveryTotal = 0;
        let payableAmt = 0;
        let cArr = this.state.cartArr;
        let cktObj = this.state.checkoutObj;
        for (let i = 0; i < cArr.length; i++) {
            itemTotal += cArr[i].Qty * (eval(cArr[i].SellingPrice));
        }
        payableAmt = (itemTotal + deliveryTotal);
        console.log("payableAmount: ", payableAmt);
        cktObj.itemTotal = itemTotal.toFixed(2);
        cktObj.deliveryCharge = deliveryTotal;
        cktObj.packingCharge = 0;
        cktObj.netPayable = payableAmt.toFixed(2);
        cktObj.items = cArr;
        this.setState({ checkoutObj: cktObj, checkoutState: true }, () => { console.log("chekoutObj: ", this.state.checkoutObj); })
    }

    chooseCategory(cat) {
        console.log("chooseCategory() cat: ", cat);
        this.setState({ selectedCategory: cat });
        let temp = [];
        for (let i = 0; i < this.state.searchProductList.length; i++) {
            let prod = this.state.searchProductList[i];
            //  console.log("Prod ID:", prod);
            if (prod.CatId == cat.Id) {
                temp.push(prod);
            }
        }
        console.log("Products found: ", temp.length);
        this.initCart(temp);
    }

    showCategoryList() {
        console.log('showCategoryList');
        this.setState({ showCategory: this.state.showCategory ? false : true }, () => { console.log(this.state.showCategory) })
    }

    removeFromCart(prod) {
        console.log("removeFromCart() product: ", prod);
        let idx = this.state.tempLocProductsList.indexOf(prod);
        console.log("index found: ", idx);
        if (this.state.tempLocProductsList[idx].Qty > 0) {
            this.state.tempLocProductsList[idx].Qty -= 1;
        }
        let cArr = this.state.cartArr;
        if (cArr.length > 0) {
            let index = -1;
            for (let i = 0; i < cArr.length; i++) {
                if (cArr[i].ProdId == prod.ProdId && cArr[i].RestId == prod.RestId) {
                    cArr[i].Qty = prod.Qty;
                    if (cArr[i].Qty < 1) {
                        index = i;
                    }
                    break;
                }
            }
            if (index > -1) {
                cArr.splice(index, 1);
            }
        }
        this.setState({ cartArr: cArr }, () => { console.log("cartArr: ", this.state.cartArr); })
    }

    addToCart(prod) {
        console.log("addToCart() product: ", prod);
        let idx = this.state.tempLocProductsList.indexOf(prod);
        console.log("index found: ", idx);
        if (idx !== -1) {
            this.state.tempLocProductsList[idx].Qty += 1;
        }
        let cArr = this.state.cartArr;
        if (cArr.length > 0) {
            let flag = true;
            for (let i = 0; i < this.state.cartArr.length; i++) {
                if (cArr[i].ProdId == prod.ProdId && cArr[i].RestId == prod.RestId) {
                    cArr[i].Qty = prod.Qty;
                    flag = false;
                    break;
                }
            }
            if (flag) {
                cArr.push(prod);
            }
        }
        else {
            cArr.push(prod);
        }
        this.setState({ cartArr: cArr }, () => { console.log("cartArr: ", this.state.cartArr); })

    }

    selectPaymentType(paymentType) {
        console.log('ViewOrderScreen selectOrderOf() response : ', paymentType);
        let arr = this.state.paymentTypeList;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].Value == paymentType.Value) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false;
            }
        }
        this.setState({ selectedPaymentType: paymentType.Value, paymentTypeList: arr })
    }

    calcPayableAmount(changeAmount, type) {
        console.log("calcPayableAmount() ", changeAmount, type);
        let cktObj = this.state.checkoutObj;
        if (type == "DC") {
            cktObj.netPayable = (eval(this.state.checkoutObj.itemTotal) + eval(changeAmount) + this.state.checkoutObj.packingCharge).toFixed(2);
            cktObj.deliveryCharge = eval(changeAmount);
        }
        if (type == "PC") {
            cktObj.netPayable = (eval(this.state.checkoutObj.itemTotal) + this.state.checkoutObj.deliveryCharge + eval(changeAmount)).toFixed(2);
            cktObj.packingCharge = eval(changeAmount);
        }
        console.log("cktobj : ", cktObj);
        this.setState({ checkoutObj: cktObj });
    }


    initCart(tempArr) {
        console.log("initCart called:");
        this.setState({ tempLocProductsList: [] });
        let temList = [];
        for (let i = 0; i < tempArr.length; i++) {
            let qty = 0;
            for (let j = 0; j < this.state.cartArr.length; j++) {
                if (tempArr[i].ProductId == this.state.cartArr[j].ProductId && tempArr[i].RestaurantId == this.state.cartArr[j].RestaurantId) {
                    qty = this.state.cartArr[j].Qty;
                    break;
                }
            }
            let prod = tempArr[i];
            prod.Qty = qty;
            temList.push(prod);
        }
        this.setState({ tempLocProductsList: temList }, () => { console.log(this.state.tempLocProductsList) });
    }

    findProducts() {
        console.log("findProducts() search: ", this.state.searchProducts);
        let temp = [];
        this.checkout = false;
        this.state.selectedCategory = {};
        if (this.state.searchProducts.trim().length > 0) {
            for (let i = 0; i < this.state.searchProductList.length; i++) {
                let prod = this.state.searchProductList[i];
                if (prod.ProdName.toLowerCase().includes(this.state.searchProducts.toLowerCase())) {
                    temp.push(prod);
                }
            }
        }
        else {
            temp = this.state.prodList;
        }
        console.log("Products found: ", temp.length);
        this.initCart(temp);
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
        this.setState({ hrs: h, mins: m, secs: s, ampm: ampm })
        //console.log("Time", h, ":", m, ":", s)


        // setTimeout(() => {
        //   this.clockTimer();
        // }, 500);
    }

    checkTaxes() {
        console.log("checkTaxes()");
        this.setState({ taxesApplicable: this.state.taxesApplicable ? false : true }, () => {
            let cktObj = this.state.checkoutObj;
            if (this.state.taxesApplicable) {
                cktObj.taxesApplicable = 'YES'
            } else {
                cktObj.taxesApplicable = 'NO'
            }
            this.setState({ checkoutObj: cktObj }, () => {
                console.log("chekoutObj: ", this.state.checkoutObj);

            });
        })
    }

    createOrder() {
        console.log("createB2BOrderScreen createOrder()");
        this.setState({ loader: true })
        let cktObj = this.state.checkoutObj;
        let hr = (eval(this.state.hrs) < 10 ? "0" + this.state.hrs : this.state.hrs);
        let ms = (eval(this.state.mins) < 10 ? "0" + this.state.mins : this.state.mins);
        let sec = (eval(this.state.secs) < 10 ? "0" + this.state.secs : this.state.secs);
        if (this.state.ampm == "AM") {
            hr = eval(hr) + 12;
        }
        cktObj.uId = this.state.userData.session_admin_employee_id;
        cktObj.orderDate = this.state.todayDate;
        cktObj.orderTime = hr + ":" + ms + ":" + sec;
        cktObj.cityCode = this.state.cityCode;
        cktObj.hubCode = this.state.hubCode;
        console.log("cktObj : ", cktObj)
        let formValue = JSON.stringify(
            cktObj
        );
        console.log('CreateB2BOrderScreen createOrder() formValue : ', formValue);
        fetch(BASEPATH + Global.CREATE_B2B_ORDER_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateB2BOrderScreen fetchB2BCustomers() response : ', responseData);
            if (responseData.Success == "Y") {
                ToastAndroid.show("Order Placed ", ToastAndroid.LONG)
                this.setState({
                    checkoutObj: {
                        itemTotal: 0,
                        deliveryCharge: 0,
                        packingCharge: 0,
                        taxesApplicable: "NO",
                        netPayable: 0,
                        items: [],
                        instructions: "",
                        buyerName: "",
                        customerId: "",
                        paymentMode: "CREDIT"
                    }, cartArr: [], searchProductList: [], tempLocProductsList: [], checkoutState: false
                })
            }
            else {
                ToastAndroid.show("Error Occured ", ToastAndroid.LONG)
                //this.setState({ searchProductList: [], loader: false })
            }
            this.setState({ loader: false })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.menuHeadItem}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => { this.props.navigation.goBack(null) }}>
                            <Icon active name='md-arrow-back' style={{ color: '#000', fontSize: 20 }} />
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 8, color: '#cd2121', fontSize: 20, fontWeight: '600' }}>Create B2B Orders</Text>
                    </View>
                    <Display style={{ flex: 1, }} enable={this.state.loader}>
                        <View style={{ borderRadius: 4, padding: 5, backgroundColor: '#cd2121', alignSelf: 'flex-end' }}>
                            <ActivityIndicator size={'large'} color={'#fff'} />
                        </View>
                    </Display>
                </View>

                <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#ebebeb' }}>
                    <View style={{ flex: 1.2, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>B2b Customers</Text>
                        <Item picker>
                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                style={{ width: undefined }}
                                placeholder="Select Location"
                                placeholderStyle={{ color: "#bfc6ea" }}
                                placeholderIconColor="#007aff"
                                selectedValue={this.state.selectedCustomer}
                                onValueChange={this.customerChange.bind(this)}
                            >
                                {this.state.customerList.map((customerList, index) => (
                                    <Picker.Item label={customerList.Name + " (" + customerList.Status + ")"} value={customerList.Id} key={index} />
                                ))
                                }
                            </Picker>
                        </Item>
                    </View>
                    <View style={{ flex: .8, backgroundColor: '#fff', padding: 5 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <Text style={{ marginTop: 12 }}>Date:</Text>
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
                                // onDateChange={(date) => { this.changeStatisticsDate(date) }}
                                disabled={false}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', paddingLeft: 15 }}>
                            <Text style={{}}>Time:</Text>
                            <TextInput
                                style={{ height: 35, justifyContent: 'center', alignItems: 'center', marginTop: -10, marginLeft: 12 }}
                                placeholder={this.state.hrs + ":" + this.state.mins + "  " + this.state.ampm}
                                keyboardType='default'
                                editable={false}
                            />
                        </View>
                    </View>
                </View>
                <Display enable={this.state.searchProductList.length > 0 && (!this.state.checkoutState)} style={{ backgroundColor: '#fff' }}>
                    <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: (this.state.cartArr.length > 0) ? 250 : 200 }}>
                        <View style={[styles.infoBox, { backgroundColor: '#fff', height: 70 }]}>
                            <Item>
                                <Input placeholder='Search Products'
                                    keyboardType='default'
                                    //maxLength={10}
                                    returnKeyType="go"
                                    onSubmitEditing={() => { this.findProducts(); }}
                                    onChangeText={(searchProducts) => { this.setState({ searchProducts }) }}
                                />
                                <Button style={{ backgroundColor: 'green', padding: 2, borderRadius: 3 }} onPress={() => { this.findProducts() }} disabled={this.state.loader}>
                                    <Display enable={!this.state.loader} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon active name='ios-search' />
                                    </Display>
                                    <Display enable={this.state.loader}>
                                        <ActivityIndicator size={'small'} color={'#fff'} />
                                    </Display>
                                </Button>
                            </Item>
                        </View>
                        {/* <View style={{ width: 'auto', marginTop: 10 }}>
                            <Text>Search By categories</Text>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 5 }}>
                                {this.state.categoryList.map((categoryList, index) => (
                                    <TouchableOpacity onPress={() => { this.chooseCategory(categoryList) }} style={{ borderRadius: 6, padding: 6, marginRight: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: (index % 8 == 0) ? 'black' : (index % 8 == 1) ? 'blue' : (index % 8 == 2) ? 'green' : (index % 8 == 4) ? 'yellow' : (index % 8 == 5) ? 'pink' : (index % 8 == 6) ? 'orange' : (index % 8 == 7) ? 'grey' : 'red' }} key={index}>
                                        <Text style={{ color: (index % 8 == 4) ? '#000' : '#fff', fontWeight: '600' }}>{categoryList.Name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View> */}


                        <Display enable={this.state.tempLocProductsList.length > 0} style={{ flex: 1, marginTop: 10 }}>

                            <Text>Products found : {this.state.tempLocProductsList.length}</Text>
                            {/* <FlatGrid
                                spacing={0}
                                itemDimension={150}
                                items={this.state.tempLocProductsList}
                                renderItem={({ item }) => ( */}

                            {this.state.tempLocProductsList.map((item, index) => (
                                <View style={styles.itemContainer} key={index}>
                                    <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ flex: 2, flexDirection: 'row', padding: 2 }}>
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffedbc' }}>
                                                <Text>No Image Availabe</Text>
                                            </View>
                                            <View style={{ flex: 2, padding: 5 }}>
                                                <Text style={{ fontSize: 18, color: '#000', fontWeight: '600' }}>{item.ProdName}</Text>
                                                <Text>{item.RestName}</Text>
                                                <Text>{item.ProdDesc}</Text>
                                            </View>

                                        </View>
                                        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>₹{item.SellingPrice}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }} >
                                        <Display enable={true} style={{ flexDirection: 'row', flex: 1 }}>
                                            <TouchableOpacity onPress={() => { this.removeFromCart(item) }} style={{ flex: 1, backgroundColor: 'green' }}>
                                                <Text style={{ fontSize: 30, fontWeight: '500', alignSelf: 'center', color: '#fff' }} disabled={eval(item.Qty) < 1}>-</Text>
                                            </TouchableOpacity>
                                            <View style={{ flex: 2 }}>
                                                <Text style={{ fontSize: 30, fontWeight: '500', alignSelf: 'center', color: '#000' }}>{item.Qty}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => { this.addToCart(item) }} style={{ flex: 1, backgroundColor: 'green' }}>
                                                <Text style={{ fontSize: 30, fontWeight: '500', alignSelf: 'center', color: '#fff' }} >+</Text>
                                            </TouchableOpacity>
                                        </Display>
                                    </View>
                                </View>
                            ))}
                            {/* 
                                 )
                                 }
                             /> */}
                        </Display>
                    </ScrollView>

                </Display>
                <Display enable={this.state.checkoutState} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ padding: 10, }}>
                        <View style={[styles.infoBox, { height: 40 }]}>
                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                <View style={{ flex: 4.5, flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon active name='ios-star' style={{ color: '#cd2121' }} />
                                    <Text style={{ fontSize: 18, fontWeight: '300', marginLeft: 5, color: '#ef7204' }}>{this.state.checkoutObj.items.length} items(s) Added ! </Text>
                                </View>
                                <View style={{ flex: .5 }}>
                                    <Icon active name='md-create' style={{ color: '#000' }} onPress={() => { this.setState({ checkoutState: false }) }} />
                                </View>
                            </View>
                        </View>
                        <View style={{ paddingTop: 10, flex: 1 }}>
                            <Text>Checkout Details</Text>
                            <View style={{ paddingTop: 6, }}>
                                <View style={{
                                    flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
                                    shadowRadius: 1, elevation: 1,
                                }}>
                                    <View style={{ flex: .5 }}>
                                        <Text style={styles.listHeadTxt}>#</Text>
                                    </View>
                                    <View style={{ flex: 1.5 }}>
                                        <Text style={styles.listHeadTxt}>Item Name</Text>
                                    </View>
                                    <View style={{ flex: .5 }}>
                                        <Text style={styles.listHeadTxt}>Qty </Text>
                                    </View>
                                    <View style={{ flex: 1.5 }}>
                                        <Text style={styles.listHeadTxt}>Item Price</Text>
                                    </View>
                                </View>
                                <View style={{ borderWidth: 1, borderColor: '#ebebeb', paddingHorizontal: 4 }}>
                                    {this.state.checkoutObj.items.map((item, index) => (
                                        <View style={{ flexDirection: 'row', paddingVertical: 6 }} key={index}>
                                            <View style={{ flex: .5 }}>
                                                <Text>{index + 1}</Text>
                                            </View>
                                            <View style={{ flex: 1.5 }}>
                                                <Text>{item.ProdName}</Text>
                                            </View>
                                            <View style={{ flex: .5 }}>
                                                <Text>{item.Qty}</Text>
                                            </View>
                                            <View style={{ flex: 1.5 }}>
                                                <Text>₹ {item.SellingPrice}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <Text style={{ fontSize: 18, marginTop: 10 }}>Billing Details</Text>
                            <View style={{ flexDirection: 'row', marginTop: 6, borderTopWidth: 1, borderTopColor: '#fff', paddingTop: 3, flex: 1 }}>
                                <View style={{
                                    flex: 1,
                                }}>
                                    <View style={styles.billingView}>
                                        <Text style={styles.textBill}>Item Total</Text>
                                    </View>
                                    <View style={styles.billingView}>
                                        <Text style={styles.textBill}>Taxes</Text>
                                    </View>
                                    <View style={styles.billingView}>
                                        <Text style={[styles.textBill, { marginTop: 5 }]}>Delivery Charge</Text>
                                    </View>
                                    <View style={styles.billingView}>
                                        <Text style={[styles.textBill, { marginTop: 5 }]}>Packaging Charge</Text>
                                    </View>
                                    {/* <View style={styles.billingView}>
                                    <Text style={styles.textBill}>Taxes</Text>
                                </View> */}
                                    <View style={styles.billingView}>
                                        <Text style={[styles.textBill, { fontWeight: '800', color: '#000', marginTop: 10 }]}>Net Payable</Text>
                                    </View>
                                </View>
                                <View style={{
                                    flex: 1
                                }}>
                                    <View style={styles.billingView}>
                                        <Text style={styles.billingText}>₹ {this.state.checkoutObj.itemTotal}</Text>
                                    </View>
                                    <View style={[styles.billingView, { height: 30, width: 100, alignSelf: 'flex-end', flexDirection: 'row' }]}>
                                        {/* <Item> */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Radio
                                                color={"#f0ad4e"}
                                                selectedColor={"#5cb85c"}
                                                selected={this.state.taxesApplicable}
                                                onPress={() => { this.checkTaxes() }}
                                            />
                                            <Text style={{ marginLeft: 5 }}>Tax Applicable?</Text>
                                            {/* <Input placeholder="Tax Applicable" disabled /> */}
                                            {/* </Item> */}
                                        </View>
                                    </View>
                                    <View style={[styles.billingView, { height: 40, width: 40, alignSelf: 'flex-end' }]}>
                                        <TextInput
                                            keyboardType='numeric'
                                            onChangeText={(delCharge) => { this.setState({ delCharge: delCharge }) }} placeholder={this.state.checkoutObj.deliveryCharge.toString()}
                                            onSubmitEditing={() => { this.calcPayableAmount(this.state.delCharge, 'DC') }}
                                            underlineColorAndroid={'#000'}
                                            placeholder={"₹" + this.state.checkoutObj.deliveryCharge.toString()} />
                                    </View>
                                    <View style={[styles.billingView, { height: 40, width: 40, alignSelf: 'flex-end', marginTop: -5 }]}>
                                        <TextInput
                                            keyboardType='numeric'
                                            underlineColorAndroid={'#000'}
                                            onChangeText={(pakCharge) => { this.setState({ pakCharge: pakCharge }) }} placeholder={this.state.checkoutObj.packingCharge.toString()}
                                            onSubmitEditing={() => { this.calcPayableAmount(this.state.pakCharge, 'PC') }}
                                            placeholder={"₹" + this.state.checkoutObj.packingCharge.toString()} />
                                    </View>
                                    {/* <View style={styles.billingView}>
                                    <Text style={styles.billingText}>₹ {this.state.checkoutObj.Taxes}</Text>
                                </View> */}
                                    <View style={styles.billingView}>
                                        <Text style={[styles.billingText, { color: '#000' }]}>₹ {this.state.checkoutObj.netPayable}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={{ fontSize: 18, marginTop: 10 }}>Order Informations</Text>
                            <View style={styles.cardBox}>
                                <Item>
                                    <Icon active name='home' />
                                    <Input placeholder='Room No (Mandatory*)'
                                        keyboardType='numeric'
                                        onChangeText={(roomNo) => {
                                            let cktObj = this.state.checkoutObj;
                                            cktObj.buyerName = roomNo
                                            this.setState({ checkoutObj: cktObj })
                                        }}
                                    />
                                </Item>
                                <Item>
                                    <Icon active name='ios-information-circle' />
                                    <Input placeholder='Special Instructions..'
                                        keyboardType='default'
                                        onChangeText={(specialIns) => {
                                            let cktObj = this.state.checkoutObj;
                                            cktObj.instructions = specialIns
                                            this.setState({ checkoutObj: cktObj })

                                        }}
                                    />
                                </Item>
                                <Text style={{ marginTop: 5 }}>Payment Mode</Text>
                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                    {this.state.paymentTypeList.map((paymentType, index) => (
                                        <View key={index} style={{ flexDirection: 'row' }}>
                                            <CheckBox onPress={() => { this.selectPaymentType(paymentType) }} checked={paymentType.Selected} color="green" />
                                            <Text style={{ marginLeft: 12 }}>{paymentType.Name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={{ marginTop: 10 }} opacity={this.state.checkoutObj.buyerName == "" ? .5 : 1}>
                                <TouchableOpacity onPress={() => { this.createOrder() }} disabled={this.state.checkoutObj.buyerName == "" && this.state.loader == false} style={{ padding: 15, backgroundColor: '#fed844', borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
                                    <Display enable={this.state.loader}>
                                        <ActivityIndicator size={'large'} color={'#cd2121'} />
                                    </Display>
                                    <Display enable={!this.state.loader}>
                                        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '600' }}>Create Order</Text>
                                    </Display>

                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </Display>
                <Display enable={this.state.showCategory && (this.state.searchProductList.length > 0 && (!this.state.checkoutState))} style={{ zIndex: 100, bottom: 120, position: 'absolute', alignSelf: 'flex-end', padding: 6, backgroundColor: '#fff', borderRadius: 4, right: 10 }}>
                    <ScrollView contentContainerStyle={{ height: (this.state.categoryList.length > 15) ? 450 : 'auto', flex: 1, }} >
                        {this.state.categoryList.map((categoryList, index) => (
                            <TouchableOpacity onPress={() => { this.chooseCategory(categoryList) }} style={{ borderRadius: 6, padding: 6, marginTop: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: (index % 8 == 0) ? 'black' : (index % 8 == 1) ? 'blue' : (index % 8 == 2) ? 'green' : (index % 8 == 4) ? 'yellow' : (index % 8 == 5) ? 'pink' : (index % 8 == 6) ? 'orange' : (index % 8 == 7) ? 'grey' : 'red' }} key={index}>
                                <Text style={{ color: (index % 8 == 4) ? '#000' : '#fff', fontWeight: '600' }}>{categoryList.Name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Display>
                <Display enable={this.state.searchProductList.length > 0 && (!this.state.checkoutState)} style={{ height: 50, zIndex: 100, bottom: 60, position: 'absolute', alignSelf: 'flex-end', paddingRight: 10 }}>
                    <TouchableOpacity onPress={() => { this.showCategoryList() }} style={{ backgroundColor: 'pink', borderRadius: 25, alignSelf: 'center', padding: 10, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name={'ios-bookmark'} style={{ color: '#fff' }} />
                    </TouchableOpacity>
                </Display>
                <Display enable={!this.state.searchProductList.length > 0 && this.state.selectedCustomer != ""} style={{ padding: 10 }}>
                    <View style={{ backgroundColor: '#000', padding: 10 }}>
                        <Text style={{ color: '#fff' }}>There are no products associated with this business</Text>
                    </View>
                </Display>
                <Display enable={this.state.cartArr.length > 0 && (!this.state.checkoutState)} style={{ height: 50, backgroundColor: 'blue', width: '100%', zIndex: 100, bottom: 0, position: 'absolute' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '300', fontSize: 16, color: '#fff' }}>Item Count : {this.state.cartArr.length}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { this.checkoutCart() }} style={{ flex: 1, borderColor: 'blue', borderWidth: 1, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: '600', fontSize: 18, color: 'blue' }}>CHECKOUT</Text>
                        </TouchableOpacity>
                    </View>
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
    largeText: {
        fontSize: 25,
        fontWeight: '600',
        color: '#747475'
    },
    infoBox: {
        backgroundColor: '#f7f7d7', marginTop: 10
        , borderRadius: 4, shadowColor: '#000', shadowOpacity: .58, height: 120,
        shadowRadius: 16, elevation: 24, padding: 10,
        shadowOffset: {
            height: 12,
            width: 12
        }
    },
    itemContainer: {
        borderRadius: 5,
        margin: 10,
        height: 150,
        backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    listHeadTxt: {
        fontSize: 18, fontWeight: '600', color: '#000'
    },
    billingView: {
        flex: 1,
        padding: 1,
    },
    billingText: {
        fontWeight: '300', alignSelf: 'flex-end', fontSize: 18
    },
    textBill: {
        fontSize: 18, fontWeight: '300'
    },
    cardBox: {
        backgroundColor: '#fff', marginTop: 6,
        borderRadius: 4, shadowColor: '#000', shadowOpacity: .58, height: 'auto',
        shadowRadius: 16, elevation: 24, padding: 10,
        shadowOffset: {
            height: 12,
            width: 12
        }
    }
});