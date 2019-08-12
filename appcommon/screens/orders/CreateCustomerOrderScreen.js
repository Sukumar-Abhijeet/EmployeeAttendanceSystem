import React, { Component } from 'react';
import { Keyboard, StyleSheet, Text, View, ActivityIndicator, AsyncStorage, ToastAndroid, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, Left, Right, Radio, Badge } from 'native-base';
import Display from 'react-native-display';
import Global from '../../Urls/Global.js';
import FlatGrid from 'react-native-super-grid';
const BASEPATH = Global.BASE_PATH;
export default class CreateCustomerOrderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cityCode: '',
            cityName: '',
            hubCode: '',
            change: 0,
            delCharge: 0,
            pakCharge: 0,
            userType: 'Existing User',
            userNumber: '',
            userData: {},
            msg: false,
            loader: false,
            seflKitchen: false,
            makeOrder: false,
            userDetailDisplay: false,
            userOrderInfo: {},
            localityList: [],
            selectedLocality: '',
            selectedPincode: '',
            selectedLocalityName: '',
            searchOrderItem: false,
            categoryList: [],
            searchProductList: [],
            searchProduct: '',
            cartArr: [],
            tempLocProductsList: [],
            selectedCategory: {},
            aftCheckout: true,
            checkoutObj: {
                itemTotal: 0,
                deliveryCharge: 0,
                packingCharge: 0,
                taxesApplicable: "NO",
                walletDeduction: 0,
                couponApplied: "",
                couponSave: 0,
                netPayable: 0,
                items: [],
                buyerName: "Buyer's Name",
                instructions: "",
                deliveryAddress: {
                    houseNo: "",
                    streetName: "",
                    landmark: "",
                    localityCode: "",
                    localityName: "",
                    cityName: "",
                    cityCode: "",
                    pincode: ""
                },
                addressId: "",
                customerId: "",
                customerPhone: "",
                customerType: ""
            },
            selectedCoupon: 'No Coupons',
            offersList: [],
            taxesApplicable: false,
            showCategory: false
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

    fetchSelectedCity() {
        console.log("createCustomerOrderScreen fetchSelectedCity()")
        this.retrieveItem('SelectedCC').then((data) => {
            //console.log("userData : ", data)
            if (data == null) {
                console.log("No Selected City");
                this.setState({ loader: true })
            }
            else {
                this.setState({ cityCode: data, loader: false })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchSelectedHUb() {
        console.log("createCustomerOrderScreen fetchSelectedHUb()")
        this.retrieveItem('SelectedHC').then((data) => {
            console.log("SelectedHC : ", data)
            if (data == null) {
                console.log("No Selected Hub");
                this.setState({ loader: true })
            }
            else {
                this.setState({ hubCode: data, loader: false })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    // fetchAsyncSelectedCity() {
    //     console.log('MainHeaderScreen fetchAsyncSelectedCity()');
    //     this.retrieveItem('SelectedCC').then((data) => {
    //       //console.log("userData : ", data)
    //       if (data == null) {
    //         ToastAndroid.show("Set CITY & HUB from DrawerScreen", ToastAndroid.LONG);
    //       }
    //       else {
    //         this.setState({ cityCode: data }, () => {
    //           this.fetchDashboardStats();
    //         })
    //       }
    //     }).catch((error) => {
    //       console.log('Promise is rejected with error: ' + error);
    //     });
    //   }

    componentDidMount() {
        console.log('CreateCustomerOrderScreen componentDidMount()');
        this.fetchUserData();
        this.props.navigation.addListener('didFocus', () => {
            this.fetchSelectedCity()
            this.fetchSelectedHUb()
            // this.fetchAsyncSelectedCity();
        });


        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        //this.setState({ searchOrderItem: true })
    }

    fetchUserData() {
        console.log("CreateCustomerOrderScreen fetchUserData()");
        this.retrieveItem('UserData').then((data) => {
            // console.log("userData : ", data)
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

    fetchLocation() {
        console.log('CreateCustomerOrderScreen fetchLocation()');
        let formValue = JSON.stringify({
            'hubCode': this.state.hubCode,
            'uId': this.state.userData.session_admin_employee_id,
        });
        fetch(BASEPATH + Global.LOCALITY_LIST_BY_HUB, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen checkNumber() response : ', responseData);
            this.setState({ loader: false });
            this.setState({ selectedLocality: responseData.LocalityList[0].Code, selectedPincode: responseData.LocalityList[0].Pincode, selectedLocalityName: responseData.LocalityList[0].Name });
            this.setState({ localityList: responseData.LocalityList })
        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    checkNumber() {
        console.log('CreateCustomerOrderScreen checkNumber()');
        this.setState({
            msg: false, checkoutObj: {
                itemTotal: 0,
                deliveryCharge: 0,
                packingCharge: 0,
                taxesApplicable: "NO",
                walletDeduction: 0,
                couponApplied: "",
                couponSave: 0,
                netPayable: 0,
                items: [],
                buyerName: "Buyer's Name",
                instructions: "",
                deliveryAddress: {
                    houseNo: "",
                    streetName: "",
                    landmark: "",
                    localityCode: "",
                    localityName: "",
                    cityName: "",
                    cityCode: "",
                    pincode: ""
                },
                addressId: "",
                customerId: "",
                customerPhone: "",
                customerType: ""
            }
        })
        if (this.state.userNumber != "" && this.state.userNumber.length == 10) {
            this.setState({ loader: true, makeOrder: false, userDetailDisplay: false, msg: false, userType: 'Existing User' });
            let formValue = JSON.stringify({
                'phoneNumber': this.state.userNumber,
                'uId': this.state.userData.session_admin_employee_id,
            });
            console.log("CreateCustomerOrderScreen checkNumber() formValue : ", formValue)
            fetch(BASEPATH + Global.CUSTOMER_PHONE_ORDER_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseData) => {
                console.log('CreateCustomerOrderScreen checkNumber() response : ', responseData);
                if (responseData.Success == "Y") {
                    this.fetchLocation();
                    this.setState({ userOrderInfo: responseData.UserInfo, makeOrder: true, })
                    if (responseData.UserInfo.Type == "Existing") {
                        this.setState({ userDetailDisplay: true, searchOrderItem: false, userType: 'Existing User', msg: true })
                    } else {
                        this.setState({
                            userType: 'New User', msg: true, searchOrderItem: false,
                        })
                    }
                }
            }).catch((error) => {
                console.log("Error Authenticate User: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                this.setState({ loader: false });
            });
        }
        else {
            this.setState({ userType: 'Invalid Number', msg: true })
        }

    }

    localityChange(locality) {
        console.log(" console.log('CreateCustomerOrderScreen fetchLocation() : ", locality)
        let locArr = this.state.localityList;
        for (i = 0; i < locArr.length; i++) {
            if (locArr[i].Code == locality) {
                this.setState({ selectedLocality: locArr[i].Code, selectedPincode: locArr[i].Pincode, selectedLocalityName: locArr[i].Name, })
            }
        }
    }

    couponChange(coupon) {
        console.log(" console.log('CreateCustomerOrderScreen couponChange() : ", coupon);
        this.setState({ selectedCoupon: coupon })
    }

    makeOrder() {
        console.log(" console.log('CreateCustomerOrderScreen makeOrder() : ");
        this.setState({ loader: true })
        this.fetchDeliveryChargeOrder();
    }

    fetchProductsByLocality() {
        console.log(" console.log('CreateCustomerOrderScreen fetchProductsByLocality() : ");
        let formValue = JSON.stringify({
            'uId': this.state.userData.session_admin_employee_id,
            'locCode': this.state.selectedLocality,
            'cityCode': this.state.cityCode,
            'selfKitchen': this.state.seflKitchen ? 'YES' : 'NO'
        });
        console.log('CreateCustomerOrderScreen fetchProductsByLocality() formValue : ', formValue);
        fetch(BASEPATH + Global.PRODUCTS_BY_LOCALITY, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen fetchProductsByLocality() response : ', responseData);
            if (responseData.Success == 'Y') {
                this.setState({ loader: false, makeOrder: false, searchOrderItem: true, searchProductList: responseData.ProductList })
            }

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    fetchDeliveryChargeOrder() {
        console.log(" console.log('CreateCustomerOrderScreen fetchDeliveryChargeOrder() : ");
        this.fetchOffers();
        let formValue = JSON.stringify({
            'uId': this.state.userData.session_admin_employee_id,
            'pincode': this.state.selectedPincode,
        });
        console.log('CreateCustomerOrderScreen fetchDeliveryChargeOrder() formValue : ', formValue);
        fetch(BASEPATH + Global.DELIVERY_CHARGE_OF_ORDER, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen fetchDeliveryChargeOrder() response : ', responseData);

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    fetchOffers() {
        console.log(" console.log('CreateCustomerOrderScreen fetchOffers() : ");
        this.fetchProductsByLocality();
        this.fetchCategories();
        let formValue = JSON.stringify({
            'uId': this.state.userData.session_admin_employee_id,
            'pincode': this.state.selectedPincode,
        });
        console.log('CreateCustomerOrderScreen fetchOffers() formValue : ', formValue);
        fetch(BASEPATH + Global.GET_OFFERS, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen fetchOffers() response : ', responseData);
            this.setState({ offersList: responseData.OfferList });

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    fetchCategories() {
        console.log(" console.log('CreateCustomerOrderScreen fetchCategories() : ");
        this.fetchProductsByLocality();
        let formValue = JSON.stringify({
            'uId': this.state.userData.session_admin_employee_id,
        });
        console.log('CreateCustomerOrderScreen fetchCategories() formValue : ', formValue);
        fetch(BASEPATH + Global.ALL_CATEGORIES_FOR_PRODUCT, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen fetchCategories() response : ', responseData);
            this.setState({ categoryList: responseData.CategoryList })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    findProducts() {
        console.log("findProducts() search: ", this.state.searchProduct);
        let temp = [];
        this.state.selectedCategory = {};
        if (this.state.searchProduct.trim().length > 0) {
            for (let i = 0; i < this.state.searchProductList.length; i++) {
                let prod = this.state.searchProductList[i];
                if (prod.ProductName.toLowerCase().includes(this.state.searchProduct.toLowerCase())) {
                    temp.push(prod);
                }
            }
        }
        else {
            temp = this.state.searchProductList;
        }
        console.log("Products found: ", temp.length);
        this.initCart(temp);
    }

    chooseCategory(cat) {
        console.log("chooseCategory() cat: ", cat);
        this.state.selectedCategory = cat;
        let temp = [];
        for (let i = 0; i < this.state.searchProductList.length; i++) {
            let prod = this.state.searchProductList[i];
            if (prod.CategoryId == cat.Id) {
                temp.push(prod);
            }
        }
        console.log("Products found: ", temp.length);
        this.initCart(temp);
    }

    removeFromCart(prod) {
        console.log("removeFromCart() product: ", prod);
        let idx = this.state.tempLocProductsList.indexOf(prod);
        console.log("index found: ", idx);
        if (this.state.tempLocProductsList[idx].Qty > 0) {
            this.state.tempLocProductsList[idx].Qty -= 1;
        }
        let cartArr = this.state.cartArr;
        if (cartArr.length > 0) {
            let index = -1;
            for (let i = 0; i < cartArr.length; i++) {
                if (cartArr[i].ProductId == prod.ProductId && cartArr[i].RestaurantId == prod.RestaurantId) {
                    cartArr[i].Qty = prod.Qty;
                    if (cartArr[i].Qty < 1) {
                        index = i;
                    }
                    break;
                }
            }
            if (index > -1) {
                cartArr.splice(index, 1);
            }
        }
        this.setState({ cartArr: cartArr });
    }

    addToCart(prod) {
        console.log("addToCart() product: ", prod);
        let idx = this.state.tempLocProductsList.indexOf(prod);
        console.log("index found: ", idx);
        if (idx !== -1) {
            this.state.tempLocProductsList[idx].Qty += 1;
        }
        let cartArr = this.state.cartArr;
        if (this.state.cartArr.length > 0) {
            let flag = true;
            for (let i = 0; i < cartArr.length; i++) {
                if (cartArr[i].ProductId == prod.ProductId && cartArr[i].RestaurantId == prod.RestaurantId) {
                    cartArr[i].Qty = prod.Qty;
                    flag = false;
                    break;
                }
            }
            if (flag) {
                cartArr.push(prod);
            }
        }
        else {
            cartArr.push(prod);
        }
        this.setState({ cartArr: cartArr }, () => { console.log("cartArr: ", this.state.cartArr) })

    }


    initCart(tempArr) {
        console.log("initCart called");
        this.state.tempLocProductsList = [];
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

    checkoutCart() {
        console.log("checkoutCart()");
        let cktObj = this.state.checkoutObj;
        this.checkout = true;
        let itemTotal = 0;
        let itemFlag = false;
        let deliveryTotal = 0;
        let payableAmt = 0;
        for (let i = 0; i < this.state.cartArr.length; i++) {
            itemTotal += this.state.cartArr[i].Qty * (eval(this.state.cartArr[i].OfferPrice));
            itemFlag = true;
        }
        if (itemTotal < this.minOrderChargeForDel && itemFlag) {
            deliveryTotal = eval("" + this.delCharge);
        }
        let walletMoneyToBeDeducted = 0;
        if (this.state.userOrderInfo.Type == "Existing") {
            if (eval(this.state.userOrderInfo.WalletBalance) > 25) {
                walletMoneyToBeDeducted = 0.1 * eval(this.state.userOrderInfo.WalletBalance);
                if (walletMoneyToBeDeducted < 25) {
                    walletMoneyToBeDeducted = 25;
                }
            }
            else {
                walletMoneyToBeDeducted = eval(this.state.userOrderInfo.WalletBalance);
            }
            payableAmt = (itemTotal + deliveryTotal);
            if (payableAmt >= walletMoneyToBeDeducted) {
                payableAmt -= walletMoneyToBeDeducted;
            }
            else {
                payableAmt = 0;
                walletMoneyToBeDeducted = payableAmt;
            }
            console.log("payableAmount: ", payableAmt);
            cktObj.buyerName = this.state.userOrderInfo.Name != "N.A." ? this.state.userOrderInfo.Name : "";
        }

        this.retrieveItem('CityData').then((data) => {
            //console.log("CityData : ", data, this.state.cityCode);
            if (data == null) {
                console.log("No city Selected");
            }
            else {
                for (i = 0; i < data.length; i++) {
                    console.log("Data[i].Code : ", data[i].Code);
                    if (data[i].Code == this.state.cityCode) {
                        this.setState({ cityName: data[i].Name }, () => { cktObj.deliveryAddress.cityName = data[i].Name; })
                        break;
                    } else {
                        console.log("No city name Found");
                    }
                }
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });

        cktObj.deliveryAddress.pincode = this.state.selectedPincode;
        cktObj.deliveryAddress.localityName = this.state.selectedLocalityName;
        cktObj.deliveryAddress.localityCode = this.state.selectedLocality;
        cktObj.customerId = this.state.userOrderInfo.Id;
        cktObj.customerType = this.state.userOrderInfo.Type;
        cktObj.customerPhone = this.state.userOrderInfo.PhoneNumber;
        cktObj.addressId = this.state.userOrderInfo.AddressId;
        cktObj.deliveryAddress.cityCode = this.state.cityCode;
        cktObj.itemTotal = itemTotal.toFixed(2);
        cktObj.deliveryCharge = deliveryTotal;
        cktObj.packingCharge = 0;
        cktObj.walletDeduction = walletMoneyToBeDeducted;
        cktObj.couponApplied = "";
        cktObj.couponSave = 0;
        cktObj.netPayable = payableAmt.toFixed(2);
        cktObj.items = this.state.cartArr;
        this.setState({ checkoutObj: cktObj }, () => { console.log("chekoutObj: ", this.state.checkoutObj), this.setState({ aftCheckout: false, }) })

    }

    calcPayableAmount(changeAmount, type) {
        console.log("calcPayableAmount() ", changeAmount, type);
        let cktObj = this.state.checkoutObj;
        if (type == "DC") {
            cktObj.netPayable = (eval(this.state.checkoutObj.itemTotal) + eval(changeAmount) + this.state.checkoutObj.packingCharge - this.state.checkoutObj.walletDeduction - this.state.checkoutObj.couponSave).toFixed(2);
            cktObj.deliveryCharge = eval(changeAmount);
        }
        if (type == "PC") {
            cktObj.netPayable = (eval(this.state.checkoutObj.itemTotal) + this.state.checkoutObj.deliveryCharge + eval(changeAmount) - this.state.checkoutObj.walletDeduction - this.state.checkoutObj.couponSave).toFixed(2);
            cktObj.packingCharge = eval(changeAmount);
        }
        console.log("cktobj : ", cktObj);
        this.setState({ checkoutObj: cktObj });
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
        console.log("createOrder()");

        this.setState({ loader: true })
        cktObj = this.state.checkoutObj;
        cktObj.uId = this.state.userData.session_admin_employee_id;
        cktObj.cityCode = this.state.cityCode;
        cktObj.hubCode = this.state.hubCode;
        let formValue = JSON.stringify(
            cktObj
        );
        console.log(cktObj);
        console.log('CreateCustomerOrderScreen fetchCategories() formValue : ', formValue);
        fetch(BASEPATH + Global.CREATE_PHONE_ORDER_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('CreateCustomerOrderScreen fetchCategories() response : ', responseData);
            if (responseData.Success == "Y") {
                ToastAndroid.show("ORDER CREATED", ToastAndroid.LONG);
                this.setState({
                    checkoutObj: {
                        itemTotal: 0,
                        deliveryCharge: 0,
                        packingCharge: 0,
                        taxesApplicable: "NO",
                        walletDeduction: 0,
                        couponApplied: "",
                        couponSave: 0,
                        netPayable: 0,
                        items: [],
                        buyerName: "Buyer's Name",
                        instructions: "",
                        deliveryAddress: {
                            houseNo: "",
                            streetName: "",
                            landmark: "",
                            localityCode: "",
                            localityName: "",
                            cityName: "",
                            cityCode: "",
                            pincode: ""
                        }
                    }, msg: false, aftCheckout: false, cartArr: [], makeOrder: false, searchOrderItem: false,
                })
            } else {
                ToastAndroid.show("Something Went Wrong", ToastAndroid.LONG)
            }
            this.setState({ loader: false })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    showCategoryList() {
        console.log('showCategoryList');
        this.setState({ showCategory: this.state.showCategory ? false : true }, () => { console.log(this.state.showCategory) })
    }

    buyersInfo(text, type) {
        console.log("buyersInfo() :", text, type);
        cktObj = this.state.checkoutObj;
        if (type == "NAME") {
            cktObj.buyerName = text;
        }
        if (type == "INS") {
            cktObj.instructions = text;
        }
        if (type == "H/F") {
            cktObj.deliveryAddress.houseNo = text;
        }
        if (type == "SN") {
            cktObj.deliveryAddress.streetName = text;
        }
        if (type == "LND") {
            cktObj.deliveryAddress.landmark = text;
        }
        this.setState({ checkoutObj: cktObj }, () => { console.log('checkout Object : ', cktObj) })
    }




    render() {
        return (
            <View style={[styles.mainContainer,]}>
                <View style={styles.menuHeadItem}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => { this.props.navigation.goBack(null) }}>
                            <Icon active name='md-arrow-back' style={{ color: '#000', fontSize: 20 }} />
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 8, color: '#cd2121', fontSize: 20, fontWeight: '600' }}>Create Customer Orders</Text>
                    </View>
                </View>
                <View style={{ paddingTop: 5, backgroundColor: '#bdbebf', paddingHorizontal: 10 }}>

                    <Item>
                        <Icon active name='ios-phone-portrait' />
                        <Input placeholder='Enter mobile number'
                            keyboardType='numeric'
                            maxLength={10}
                            returnKeyType="go"
                            onSubmitEditing={() => { this.checkNumber(); }}
                            onChangeText={(userNumber) => { this.setState({ userNumber }) }}
                        />
                        <Button style={{ backgroundColor: 'green', paddingHorizontal: 4, borderRadius: 3, width: 55, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.checkNumber() }} disabled={this.state.loader}>
                            <Display enable={!this.state.loader}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '400' }} >CREATE</Text>
                            </Display>
                            <Display enable={this.state.loader}>
                                <ActivityIndicator size={'small'} color={'#fff'} />
                            </Display>
                        </Button>
                    </Item>
                    <Display enable={this.state.cityCode == "" || this.state.hubCode == ""} style={{ marginTop: 5, padding: 10 }}>
                        <View style={styles.noInternetView}>
                            <Text style={{ color: '#fff' }}>NO CITY/HUB SELECTED</Text>
                            <Text style={{ fontSize: 12, color: '#fcf40f' }}>First Select City/HUb from Menu Screen in Left & restart</Text>
                        </View>
                    </Display>
                    <Display enable={this.state.msg} style={{ padding: 4 }}>

                        <View style={{ backgroundColor: '#000', width: '100%', borderRadius: 4, padding: 5 }}>
                            <Text style={{ color: '#eef218', fontWeight: '400', fontSize: 16 }}>{this.state.userType}</Text>
                        </View>
                    </Display>

                </View>
                <Display enable={this.state.makeOrder} style={{ paddingTop: 20, paddingHorizontal: 10 }}>
                    <Display enable={this.state.userDetailDisplay} style={styles.infoBox}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText}>Name</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText2}>: {this.state.userOrderInfo.Name}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText}>Wallet Balance</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText2}>: ₹ {this.state.userOrderInfo.WalletBalance}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText}>Past orders</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText2}>: {this.state.userOrderInfo.PastOrderCount}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText}>Last Order Date</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoText2}>:  {this.state.userOrderInfo.LastOrderDate}</Text>
                            </View>
                        </View>

                    </Display>
                    <View style={{ paddingTop: 10 }}>
                        <Text style={{ marginTop: 5, fontSize: 16, fontWeight: '300' }}>Select Location</Text>
                        <Item picker>
                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                style={{ width: undefined }}
                                placeholder="Select Location"
                                placeholderStyle={{ color: "#bfc6ea" }}
                                placeholderIconColor="#007aff"
                                selectedValue={this.state.selectedLocality}
                                onValueChange={this.localityChange.bind(this)}
                            >
                                {this.state.localityList.map((localityList, index) => (
                                    <Picker.Item label={localityList.Name + localityList.Pincode} value={localityList.Code} key={index} />
                                ))
                                }
                            </Picker>
                        </Item>

                        <ListItem selected={false} >
                            <Left>
                                <Text>Use Self Kitchen</Text>
                            </Left>
                            <Right>
                                <Radio
                                    color={"#f0ad4e"}
                                    selectedColor={"#5cb85c"}
                                    selected={this.state.seflKitchen}
                                    onPress={() => { this.setState({ seflKitchen: this.state.seflKitchen ? false : true }) }}
                                />
                            </Right>
                        </ListItem>

                        <Button rounded success style={{ alignSelf: 'center', marginTop: 15, width: 100, justifyContent: 'center', alignItems: 'center', }} onPress={() => { this.makeOrder() }}>
                            <Display enable={!this.state.loader}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Make Order</Text>
                            </Display>
                            <Display enable={this.state.loader}>
                                <ActivityIndicator size={'small'} color={'#fff'} />
                            </Display>
                        </Button>
                    </View>
                </Display>
                <Display enable={this.state.searchOrderItem} >
                    <ScrollView contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 10, paddingBottom: (this.state.cartArr.length > 0) ? 250 : 200, marginTop: -this.state.change }} showsVerticalScrollIndicator={false} >
                        <View style={styles.infoBox}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 4.5, flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon active name='ios-star' style={{ color: '#cd2121' }} />
                                    <Text style={{ fontSize: 18, fontWeight: '300', marginLeft: 5, color: '#ef7204' }}>{this.state.userType}</Text>
                                </View>
                                <View style={{ flex: .5 }}>
                                    <Icon active name='md-text' style={{ color: '#000' }} onPress={() => { this.setState({ searchOrderItem: false, makeOrder: true }) }} />
                                </View>
                            </View>
                            <Text>Creating Order For</Text>
                            <Text style={{ fontSize: 17, fontWeight: '500', color: '#000' }}>{this.state.userOrderInfo.Name}<Text>({this.state.userNumber})</Text></Text>
                            <Text style={{ color: '#333232', fontWeight: '300' }}>Address :{this.state.selectedLocalityName} - {this.state.selectedPincode}</Text>
                            <Text style={{ color: '#333232', fontWeight: '300' }}>From :{this.state.seflKitchen ? 'BMF Kitchen' : 'All kitchens'}</Text>
                        </View>
                        <Display enable={this.state.aftCheckout}>
                            <View style={[styles.infoBox, { backgroundColor: '#fff', height: 70 }]}>
                                <Item>
                                    <Input placeholder='Search Products'
                                        keyboardType='default'
                                        //maxLength={10}
                                        returnKeyType="go"
                                        //onSubmitEditing={() => { this.checkNumber(); }}
                                        onChangeText={(searchProduct) => { this.setState({ searchProduct }) }}
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
                                                    <Text style={{ fontSize: 18, color: '#000', fontWeight: '600' }}>{item.ProductName}</Text>
                                                    <Text>{item.RestaurantName}</Text>
                                                    <Text>{item.ProductDescription}</Text>
                                                </View>
                                            </View>


                                            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>₹{item.OfferPrice} | {item.ProductRestaurantRating}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }} >
                                            <Display enable={!item.Addable} style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>Not Available Now</Text>
                                            </Display>
                                            <Display enable={item.Addable} style={{ flexDirection: 'row', flex: 1 }}>
                                                <TouchableOpacity onPress={() => { this.removeFromCart(item) }} style={{ flex: 1, backgroundColor: 'green' }}>
                                                    <Text style={{ fontSize: 30, fontWeight: '500', alignSelf: 'center', color: '#fff' }} disabled={eval(item.Qty) < 1}>-</Text>
                                                </TouchableOpacity>
                                                <View style={{ flex: 2 }}>
                                                    <Text style={{ fontSize: 30, fontWeight: '500', alignSelf: 'center', color: '#000' }}>{item.Qty}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => { this.addToCart(item) }} style={{ flex: 1, backgroundColor: 'green' }}>
                                                    <Text style={{ fontSize: 30, fontWeight: '500', alignSelf: 'center', color: '#fff' }}>+</Text>
                                                </TouchableOpacity>
                                            </Display>
                                        </View>
                                    </View>
                                ))}
                                {/* )
                                    }
                                /> */}
                            </Display>
                        </Display>
                        <Display enable={!this.state.aftCheckout}>
                            <View style={[styles.infoBox, { height: 40 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 4.5, flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon active name='ios-star' style={{ color: '#cd2121' }} />
                                        <Text style={{ fontSize: 18, fontWeight: '300', marginLeft: 5, color: '#ef7204' }}>{this.state.checkoutObj.items.length} items(s) Added ! </Text>
                                    </View>
                                    <View style={{ flex: .5 }}>
                                        <Icon active name='md-text' style={{ color: '#000' }} onPress={() => { this.setState({ aftCheckout: true }) }} />
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.infoBox, { backgroundColor: '#ebebeb', height: 'auto' }]}>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 20, fontWeight: '600', }}>#</Text>
                                    </View>
                                    <View style={{ flex: 5 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '600', }}>Item Name</Text>
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '600', }}>Qty</Text>
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '600', }}>Item Price</Text>
                                    </View>
                                </View>
                                {this.state.checkoutObj.items.map((item, index) => (
                                    <View style={{ flexDirection: 'row', flex: 1 }} key={index}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 20, color: '#000' }}>{index + 1}</Text>
                                        </View>
                                        <View style={{ flex: 5 }}>
                                            <Text style={{ fontSize: 15, color: '#000' }}>{item.ProductName}</Text>
                                        </View>
                                        <View style={{ flex: 2 }}>
                                            <Text style={{ fontSize: 18, color: '#000' }}>{item.Qty}</Text>
                                        </View>
                                        <View style={{ flex: 2 }}>
                                            <Text style={{ fontSize: 18, color: '#000' }}>₹{item.OfferPrice}</Text>
                                        </View>
                                    </View>
                                ))}

                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10, }}><View style={{ flex: 1, borderRadius: 4, marginLeft: 5, backgroundColor: '#ebebeb', padding: 10, width: '100%' }}>
                                <Text style={{ fontSize: 20, fontWeight: '500', marginBottom: 10 }}>More details.</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Items Total</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '300' }}>₹ {this.state.checkoutObj.itemTotal}</Text>
                                    </View>
                                </View>
                                <View >
                                    <View>
                                        <Text>Delivery Charges</Text>
                                    </View>
                                    <View>
                                        <Item>
                                            <Icon active name='ios-bicycle' />
                                            <Input
                                                returnKeyType="done"
                                                keyboardType='numeric'
                                                onChangeText={(delCharge) => { this.setState({ delCharge: delCharge }) }} placeholder={this.state.checkoutObj.deliveryCharge.toString()}
                                                onSubmitEditing={() => { this.calcPayableAmount(this.state.delCharge, 'DC') }}
                                            />
                                        </Item>
                                    </View>
                                </View>
                                <View >
                                    <View>
                                        <Text>Packaging Charges</Text>
                                    </View>
                                    <View>
                                        <Item>
                                            <Icon active name='ios-ribbon' />
                                            <Input
                                                ref={(input) => { this.packagingInput = input; }}
                                                returnKeyType="done"
                                                keyboardType='numeric'
                                                onChangeText={(pakCharge) => { this.setState({ pakCharge: pakCharge }) }} placeholder={this.state.checkoutObj.packingCharge.toString()}
                                                onSubmitEditing={() => { this.calcPayableAmount(this.state.pakCharge, 'PC') }}
                                            />
                                        </Item>
                                    </View>
                                </View>
                                <View >
                                    <View>
                                        <Text>Taxes</Text>
                                    </View>
                                    <View>
                                        <Item>
                                            <Radio
                                                color={"#f0ad4e"}
                                                selectedColor={"#5cb85c"}
                                                selected={this.state.taxesApplicable}
                                                onPress={() => { this.checkTaxes() }}
                                            />
                                            <Input placeholder="Tax Applicable" disabled />
                                        </Item>
                                    </View>
                                </View>
                                <View >
                                    <View>
                                        <Text>Wallet Deduction</Text>
                                    </View>
                                    <View>
                                        <Item>
                                            <Icon active name='ios-wallet' />
                                            <Input disabled placeholder={this.state.checkoutObj.walletDeduction.toString()} />
                                        </Item>
                                    </View>
                                </View>
                                <View >
                                    <View>
                                        <View>
                                            <Text>Coupons </Text>
                                        </View>
                                        <Display enable={this.state.offersList.length > 0}>
                                            <Item picker>
                                                <Picker
                                                    mode="dropdown"
                                                    iosIcon={<Icon name="arrow-down" />}
                                                    style={{ width: undefined }}
                                                    placeholder="Coupons"
                                                    placeholderStyle={{ color: "#bfc6ea" }}
                                                    placeholderIconColor="#007aff"
                                                    selectedValue={this.state.selectedCoupon}
                                                    onValueChange={this.couponChange.bind(this)}
                                                >
                                                    {this.state.offersList.map((offersList, index) => (
                                                        <Picker.Item label={offersList.OfferCode} value={offersList.OfferCode} key={index} />
                                                    ))
                                                    }
                                                </Picker>
                                            </Item>
                                        </Display>
                                        <Display enable={!this.state.offersList.length > 0} style={{ paddingVertical: 8 }}>
                                            <Text style={{ color: '#000', fontSize: 16, fontWeight: '300' }}>No Coupons Available Now</Text>
                                        </Display>
                                    </View>
                                </View>
                                <View >
                                    <View>
                                        <Text>Net Payable</Text>
                                    </View>
                                    <View>
                                        <Item>
                                            <Icon active name='ios-pricetag' />
                                            <Input
                                                style={{ fontSize: 16, fontWeight: '300' }}
                                                disabled placeholder={this.state.checkoutObj.netPayable.toString()} />
                                        </Item>
                                    </View>
                                </View>
                            </View>
                                <View style={{ flex: 1, marginTop: 10, width: '100%' }}>
                                    <View style={{ borderRadius: 4, backgroundColor: '#ffe2c6', padding: 10, width: '100%' }}>
                                        <Text style={{ fontSize: 20, fontWeight: '500', marginBottom: 10 }}>Buyers Informations.</Text>
                                        <Item regular>
                                            <Icon active name='md-person' />
                                            <TextInput
                                                returnKeyType="next"
                                                onSubmitEditing={() => { this.instructionInput.focus(); }}
                                                onChangeText={(text) => {
                                                    setTimeout(() => {
                                                        this.buyersInfo(text, 'NAME')
                                                    }, 400);
                                                }} placeholder={this.state.checkoutObj.buyerName.toString()} />
                                        </Item>
                                        <Item regular>
                                            <Icon active name='md-text' />
                                            <TextInput
                                                ref={(input) => { this.instructionInput = input; }}
                                                returnKeyType="next"
                                                onSubmitEditing={() => { this.houseNoInput.focus(); }}
                                                onChangeText={(text) => { this.buyersInfo(text, 'INS') }} placeholder='Special Instructions' />
                                        </Item>
                                        <Text style={{ marginTop: 8 }}>Delivery Address.</Text>
                                        <Item>
                                            <TextInput
                                                ref={(input) => { this.houseNoInput = input; }}
                                                returnKeyType="next"
                                                onSubmitEditing={() => { this.streetInput.focus(); }}
                                                onChangeText={(text) => { this.buyersInfo(text, 'H/F') }} placeholder="House/Flat Number" />
                                        </Item>
                                        <Item>
                                            <TextInput
                                                ref={(input) => { this.streetInput = input; }}
                                                returnKeyType="next"
                                                onSubmitEditing={() => { this.landInput.focus(); }}
                                                onChangeText={(text) => { this.buyersInfo(text, 'SN') }} placeholder="Street Name" />
                                        </Item>
                                        <Item>
                                            <TextInput
                                                ref={(input) => { this.landInput = input; }}
                                                returnKeyType="done"
                                                onSubmitEditing={() => {
                                                    if (this.state.checkoutObj.deliveryAddress.houseNo != "" && this.state.checkoutObj.deliveryAddress.streetName != "") {
                                                        this.createOrder();
                                                    }
                                                }}
                                                placeholder="Landmark if any" />
                                        </Item>
                                        <Item>
                                            <TextInput editable={false} placeholder={this.state.checkoutObj.deliveryAddress.localityName + this.state.checkoutObj.deliveryAddress.cityName + this.state.checkoutObj.deliveryAddress.pincode} />
                                        </Item>
                                    </View>

                                    <View style={{}} opacity={(this.state.checkoutObj.deliveryAddress.houseNo == "" || this.state.checkoutObj.deliveryAddress.streetName == "" || this.state.checkoutObj.buyerName == "Buyer's Name") ? .2 : 1}>
                                        <TouchableOpacity disabled={this.state.checkoutObj.deliveryAddress.houseNo == "" || this.state.checkoutObj.deliveryAddress.streetName == "" || this.state.checkoutObj.buyerName == "Buyer's Name"} onPress={() => { this.createOrder() }} style={{ borderRadius: 4, padding: 20, backgroundColor: '#f4f402', marginTop: 20, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Display enable={this.state.loader}>
                                                <ActivityIndicator size={'large'} color='#cd2121' />
                                            </Display>
                                            <Display enable={!this.state.loader}>
                                                <Text style={{ color: '#cd2121', fontSize: 20, fontWeight: '500' }}>Create Order</Text></Display>

                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        </Display>
                    </ScrollView>

                </Display>
                <Display enable={this.state.showCategory && (this.state.searchOrderItem && this.state.aftCheckout == true)} style={{ zIndex: 100, bottom: 120, position: 'absolute', alignSelf: 'flex-end', padding: 6, backgroundColor: '#fff', borderRadius: 4, right: 10 }}>
                    <View>
                        <ScrollView contentContainerStyle={{ height: (this.state.categoryList.length > 15) ? 450 : 'auto', flex: 1, }} >
                            {this.state.categoryList.map((categoryList, index) => (
                                <TouchableOpacity onPress={() => { this.chooseCategory(categoryList) }} style={{ borderRadius: 6, padding: 6, marginTop: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: (index % 8 == 0) ? 'black' : (index % 8 == 1) ? 'blue' : (index % 8 == 2) ? 'green' : (index % 8 == 4) ? 'yellow' : (index % 8 == 5) ? 'pink' : (index % 8 == 6) ? 'orange' : (index % 8 == 7) ? 'grey' : 'red' }} key={index}>
                                    <Text style={{ color: (index % 8 == 4) ? '#000' : '#fff', fontWeight: '600' }}>{categoryList.Name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Display>
                <Display enable={this.state.searchOrderItem && this.state.aftCheckout == true} style={{ height: 50, zIndex: 100, bottom: 60, position: 'absolute', alignSelf: 'flex-end', paddingRight: 10 }}>
                    <TouchableOpacity onPress={() => { this.showCategoryList() }} style={{ backgroundColor: 'pink', borderRadius: 25, alignSelf: 'center', padding: 10, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name={'ios-bookmark'} style={{ color: '#fff' }} />
                    </TouchableOpacity>
                </Display>
                <Display enable={this.state.cartArr.length > 0 && this.state.aftCheckout == true} style={{ height: 50, backgroundColor: 'blue', width: '100%', zIndex: 100, bottom: 0, position: 'absolute' }}>
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
    infoText: {
        fontSize: 20,
        fontWeight: '500', marginTop: 4
    },
    infoText2: {
        fontSize: 16, marginTop: 4
    },
    itemContainer: {
        borderRadius: 5,
        margin: 10,
        height: 150,
        backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    noInternetView: {
        backgroundColor: '#000', height: 50, width: '100%', borderRadius: 5,
        justifyContent: 'center', alignItems: 'center'
    },
});