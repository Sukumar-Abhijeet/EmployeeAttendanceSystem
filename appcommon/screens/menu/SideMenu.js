import React from 'react';
import {
    Dimensions, TouchableOpacity, View, Image, Alert, ActivityIndicator, RefreshControl,
    StyleSheet, ScrollView, ListView, Text, TextInput, AsyncStorage,
} from 'react-native'; import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, Left, Right, Radio, Badge } from 'native-base';
import Display from 'react-native-display';
import Global from '../../Urls/Global.js';
const BASEPATH = Global.BASE_PATH;
import MainHeaderScreen from '../header/MainHeaderScreen';
export default class SideMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userData: {},
            activateMenu: false,
            dashboardSelected: true,
            cityList: [
                {
                    "Code": "Default",
                    "Name": 'Select City',
                    "Status": 'DEACTIVE',
                }
            ],
            workOptions: false,
            workMenuList: [
                {
                    "menuName": 'Upcoming Tasks',
                    "iconName": 'ios-timer',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Todo List',
                    "iconName": 'md-code-working',
                    "selected": false,
                    "navigateTo": 'TodoList'
                },
            ],

            bawarchiOptions: false,
            bawarchiMenuList: [
                {
                    "menuName": 'Add Bawarchi',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Bawarchi',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": ''
                },
                {
                    "menuName": 'Add Dishes',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": ''
                },
                {
                    "menuName": 'View Dishes',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": ''
                },
                {
                    "menuName": 'Edit Dishes',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": ''
                },

                {
                    "menuName": 'View Request',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": ''
                },
            ],
            businessOptions: false,
            businessMenuList: [
                {
                    "menuName": 'Add Business',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Business',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                }, {
                    "menuName": 'Add Product',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                }, {
                    "menuName": 'View Product',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            customerOptions: false,
            customerMenuList: [
                {
                    "menuName": 'View Customer',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Notify Customer',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            humanOptions: false,
            humanMenuList: [
                {
                    "menuName": 'Add Employee',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Employee',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            inventoryOptions: false,
            inventoryMenuList: [
                {
                    "menuName": 'Add Office',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Offices',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Add Inventory item',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Inventory item',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Add Stock',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Stock',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Issues Inventory',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Add Inv Selling inf',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            kitchenOptions: false,
            kitchenMenuList: [
                {
                    "menuName": 'Manage Catagories',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage Ingredients',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Add kitchen vendor',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View kitchen Vendor',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Link Ingredients',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Link Dish to ingre',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Kitchen stock entry',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Kitchen stock report',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Create purchase order',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage ktcn vendor hprd',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            locationOptions: false,
            locationMenuList: [
                {
                    "menuName": 'Manage Cities',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage Localities',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage Zones',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage Hubs',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            offersOptions: false,
            offersMenuList: [
                {
                    "menuName": 'Add Coupon',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Coupon',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Link Coupon Location',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage City Offers',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage Category Offers',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage product Offers',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            operationOptions: false,
            operationMenuList: [
                {
                    "menuName": 'Locality & Services Link',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Dashboard Offers',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            orderOptions: false,
            orderMenuList: [
                {
                    "menuName": 'View Order',
                    "iconName": 'md-list',
                    "selected": false,
                    "navigateTo": 'ViewOrderPG'
                },
                {
                    "menuName": 'Create Customer Order',
                    "iconName": 'ios-person-add',
                    "selected": false,
                    "navigateTo": 'CustomerOrderPG'
                },
                {
                    "menuName": 'Create B2B Order',
                    "iconName": 'md-people',
                    "selected": false,
                    "navigateTo": 'B2BOrderPG'
                },
                {
                    "menuName": 'Create Past Order',
                    "iconName": 'md-time',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Purchase Order',
                    "iconName": 'md-options',
                    "selected": false,
                    "navigateTo": 'ViewPurchaseOrderPG'
                },
            ],
            productOptions: false,
            productMenuList: [
                {
                    "menuName": 'Manage Categories',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Manage Addons',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Add Products',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Products',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Add Prod in Restaurant',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Prod in Restaurant',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Edit Prod in Restaurant',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Link Addons to product',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            restaurantOptions: false,
            restaurantMenuList: [
                {
                    "menuName": 'Add Restaurant',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'View Restaurant',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            reportOptions: false,
            reportMenuList: [
                {
                    "menuName": 'Daily Accounts',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'Restaurant Sales',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
                {
                    "menuName": 'B2B monthly report',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ],
            reviewOptions: false,
            reviewMenuList: [
                {
                    "menuName": 'View Reviews',
                    "iconName": '',
                    "selected": false,
                    "navigateTo": 'AddBawarchi'
                },
            ]

        }
    }

    async retrieveItem(key) {
        console.log("SideMenu retrieveItem() key: ", key);
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
        console.log("SideMenu storeItem() key: ", key);
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
        console.log("SideMenu removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    componentDidMount() {
        // console.log("SideMenu componentDidMount()");
        // this.props.navigation.addListener('didFocus', () => {
        //     this.fetchUserData()
        // });
        this.fetchUserData();
    }

    fetchUserData() {
        console.log("SideMenu fetchUserData()");

        this.retrieveItem('UserData').then((data) => {
            // console.log("userData : ", data)
            if (data == null) {
                this.setState({ activateMenu: false })
            }
            else {
                this.setState({ userData: data, activateMenu: true })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    checkNavigation(menuList, option) {
        console.log("SideMenu checkNavigation() : ", menuList, option);
        if (option != "DASHBOARD") {
            this.setState({ dashboardSelected: false })
        }

        // check for work
        let worklistArr = this.state.workMenuList;
        for (let i = 0; i < worklistArr.length; i++) {
            if (option == "WORK") {
                this.props.navigation.navigate(menuList.navigateTo);
                worklistArr[i].selected = (menuList.menuName == worklistArr[i].menuName)
            }
            else {
                worklistArr[i].selected = false
            }
        }

        // check for bawarchi
        let bawarchilistArr = this.state.bawarchiMenuList;
        for (let i = 0; i < bawarchilistArr.length; i++) {
            if (option == "BAWARCHI") {
                bawarchilistArr[i].selected = (menuList.menuName == bawarchilistArr[i].menuName)
            }
            else {
                bawarchilistArr[i].selected = false
            }
        }

        //check for business
        let businesslistArr = this.state.businessMenuList;
        for (let i = 0; i < businesslistArr.length; i++) {
            if (option == "BUSINESS") {
                businesslistArr[i].selected = (menuList.menuName == businesslistArr[i].menuName)
            }
            else {
                businesslistArr[i].selected = false
            }
        }

        //check for customer
        let customerlistArr = this.state.customerMenuList;
        for (let i = 0; i < customerlistArr.length; i++) {
            if (option == "CUSTOMER") {
                customerlistArr[i].selected = (menuList.menuName == customerlistArr[i].menuName)
            }
            else {
                customerlistArr[i].selected = false
            }
        }

        //check for human resource 
        let humanlistArr = this.state.humanMenuList;
        for (let i = 0; i < humanlistArr.length; i++) {
            if (option == "HUMAN") {
                humanlistArr[i].selected = (menuList.menuName == humanlistArr[i].menuName)
            }
            else {
                humanlistArr[i].selected = false
            }
        }

        // check for inventory
        let inventorylistArr = this.state.inventoryMenuList;
        for (let i = 0; i < inventorylistArr.length; i++) {
            if (option == "INVENTORY") {
                inventorylistArr[i].selected = (menuList.menuName == inventorylistArr[i].menuName)
            }
            else {
                inventorylistArr[i].selected = false
            }
        }

        // check for kitchen
        let kitchenlistArr = this.state.kitchenMenuList;
        for (let i = 0; i < kitchenlistArr.length; i++) {
            if (option == "KITCHEN") {
                kitchenlistArr[i].selected = (menuList.menuName == kitchenlistArr[i].menuName)
            }
            else {
                kitchenlistArr[i].selected = false
            }
        }

        // check for Locations
        let locationlistArr = this.state.locationMenuList;
        for (let i = 0; i < locationlistArr.length; i++) {
            if (option == "LOCATION") {
                locationlistArr[i].selected = (menuList.menuName == locationlistArr[i].menuName)
            }
            else {
                locationlistArr[i].selected = false
            }
        }

        // check for OFFERS N COUPONS
        let offerlistArr = this.state.offersMenuList;
        for (let i = 0; i < offerlistArr.length; i++) {
            if (option == "OFFERS") {
                offerlistArr[i].selected = (menuList.menuName == offerlistArr[i].menuName)
            }
            else {
                offerlistArr[i].selected = false
            }
        }

        // check for operation 
        let operationlistArr = this.state.operationMenuList;
        for (let i = 0; i < operationlistArr.length; i++) {
            if (option == "OPERATION") {
                operationlistArr[i].selected = (menuList.menuName == operationlistArr[i].menuName)
            }
            else {
                operationlistArr[i].selected = false
            }
        }

        // check for order 
        let orderlistArr = this.state.orderMenuList;
        for (let i = 0; i < orderlistArr.length; i++) {
            if (option == "ORDER") {
                this.props.navigation.navigate(menuList.navigateTo);
                orderlistArr[i].selected = (menuList.menuName == orderlistArr[i].menuName)
            }
            else {
                orderlistArr[i].selected = false
            }
        }

        // check for Product 
        let productlistArr = this.state.productMenuList;
        for (let i = 0; i < productlistArr.length; i++) {
            if (option == "PRODUCT") {
                productlistArr[i].selected = (menuList.menuName == productlistArr[i].menuName)
            }
            else {
                productlistArr[i].selected = false
            }
        }

        // check for Restaurant 
        let restaurantlistArr = this.state.restaurantMenuList;
        for (let i = 0; i < restaurantlistArr.length; i++) {
            if (option == "RESTAURANT") {
                restaurantlistArr[i].selected = (menuList.menuName == restaurantlistArr[i].menuName)
            }
            else {
                restaurantlistArr[i].selected = false
            }
        }

        // check for Report 
        let reportlistArr = this.state.reportMenuList;
        for (let i = 0; i < reportlistArr.length; i++) {
            if (option == "REPORT") {
                reportlistArr[i].selected = (menuList.menuName == reportlistArr[i].menuName)
            }
            else {
                reportlistArr[i].selected = false
            }
        }

        // check for Report 
        let reviewlistArr = this.state.reviewMenuList;
        for (let i = 0; i < reviewlistArr.length; i++) {
            if (option == "REVIEW") {
                reviewlistArr[i].selected = (menuList.menuName == reviewlistArr[i].menuName)
            }
            else {
                reviewlistArr[i].selected = false
            }
        }

        this.setState({ workMenuList: worklistArr, bawarchiMenuList: bawarchilistArr, businessMenuList: businesslistArr, customerMenuList: customerlistArr, humanMenuList: humanlistArr, inventoryMenuList: inventorylistArr, kitchenMenuList: kitchenlistArr, locationMenuList: locationlistArr, offersMenuList: offerlistArr, operationMenuList: operationlistArr, orderMenuList: orderlistArr, productMenuList: productlistArr, restaurantMenuList: restaurantlistArr, reportMenuList: reportlistArr, reviewMenuList: reviewlistArr });
    }

    showOptionList(option) {
        console.log('SideMenu showOptionList : ', option);
        if (option == "DASHBOARD") {
            console.log("close"),
                this.setState({ dashboardSelected: true })
            this.props.navigation.navigate('Dashboard'),
                this.props.navigation.closeDrawer();
        }
        if (option == "WORK") {
            if (this.state.workOptions == true)
                this.setState({ workOptions: false })
            else
                this.setState({ workOptions: true, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, locationOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "BAWARCHI") {
            if (this.state.bawarchiOptions == true)
                this.setState({ bawarchiOptions: false })
            else
                this.setState({ bawarchiOptions: true, workOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, locationOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "BUSINESS") {
            if (this.state.businessOptions == true)
                this.setState({ businessOptions: false })
            else
                this.setState({ businessOptions: true, workOptions: false, customerOptions: false, bawarchiOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, locationOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "CUSTOMER") {
            if (this.state.customerOptions == true)
                this.setState({ customerOptions: false })
            else
                this.setState({ customerOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, locationOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "HUMAN") {
            if (this.state.humanOptions == true)
                this.setState({ humanOptions: false })
            else
                this.setState({ humanOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, inventoryOptions: false, kitchenOptions: false, locationOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "INVENTORY") {
            if (this.state.inventoryOptions == true)
                this.setState({ inventoryOptions: false })
            else
                this.setState({ inventoryOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, kitchenOptions: false, locationOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "KITCHEN") {
            if (this.state.kitchenOptions == true)
                this.setState({ kitchenOptions: false })
            else
                this.setState({ kitchenOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, locationOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "LOCATION") {
            if (this.state.locationOptions == true)
                this.setState({ locationOptions: false })
            else
                this.setState({ locationOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "OFFERS") {
            if (this.state.offersOptions == true)
                this.setState({ offersOptions: false })
            else
                this.setState({ offersOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "OPERATION") {
            if (this.state.operationOptions == true)
                this.setState({ operationOptions: false })
            else
                this.setState({ operationOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, offersOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "ORDER") {
            if (this.state.orderOptions == true)
                this.setState({ orderOptions: false })
            else
                this.setState({ orderOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, offersOptions: false, operationOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "PRODUCT") {
            if (this.state.productOptions == true)
                this.setState({ productOptions: false })
            else
                this.setState({ productOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, offersOptions: false, operationOptions: false, orderOptions: false, restaurantOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "RESTAURANT") {
            if (this.state.restaurantOptions == true)
                this.setState({ restaurantOptions: false })
            else
                this.setState({ restaurantOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, offersOptions: false, operationOptions: false, orderOptions: false, productOptions: false, reportOptions: false, reviewOptions: false })
        }
        if (option == "REPORT") {
            if (this.state.reportOptions == true)
                this.setState({ reportOptions: false })
            else
                this.setState({ reportOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, offersOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reviewOptions: false })
        }
        if (option == "REVIEW") {
            if (this.state.reviewOptions == true)
                this.setState({ reviewOptions: false })
            else
                this.setState({ reviewOptions: true, workOptions: false, bawarchiOptions: false, businessOptions: false, customerOptions: false, humanOptions: false, inventoryOptions: false, kitchenOptions: false, offersOptions: false, operationOptions: false, orderOptions: false, productOptions: false, restaurantOptions: false, reportOptions: false })
        }



    }

    logout() {
        console.log("SideMenu logout()");
        this.removeItem("UserData");
        this.setState({ activateMenu: false })
        this.props.navigation.navigate("AppLoader");
    }

    render() {
        return (
            <ScrollView style={styles.mainContainer}>
                <Display enable={this.state.activateMenu}>
                    <View style={styles.menuHeadItem}>
                        <MainHeaderScreen />
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                            <TouchableOpacity style={{ backgroundColor: '#cd2121', paddingHorizontal: 4, borderRadius: 4, width: 70, height: 20, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.logout() }} >
                                <Display enable={!this.state.loader}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '400' }} >LOGOUT</Text>
                                </Display>
                                <Display enable={this.state.loader}>
                                    <ActivityIndicator size={'small'} color={'#fff'} />
                                </Display>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.commonHead, { width: '100%', paddingLeft: 0 }]}>
                        <TouchableOpacity style={[styles.menuItem, { backgroundColor: this.state.dashboardSelected == true ? '#fff' : '#0e6ba8', paddingLeft: 30, width: '100%' }]} onPress={() => { this.showOptionList("DASHBOARD") }}>
                            <Text style={{ color: this.state.dashboardSelected == true ? '#cd2121' : '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>DASHBOARD</Text>
                        </TouchableOpacity>
                    </View>

                    {/* for WORK */}
                    <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("WORK") }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>YOUR WORKS</Text>
                    </TouchableOpacity>
                    <Display enable={this.state.workOptions}>
                        <View style={styles.menuList}>
                            {this.state.workMenuList.map((workMenuList, index) => (
                                <TouchableOpacity style={[styles.menuItem, { backgroundColor: workMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(workMenuList, "WORK") }} key={index}>
                                    <Icon name={workMenuList.iconName} style={{ fontSize: 20, color: workMenuList.selected == true ? '#cd2121' : '#fff' }} />
                                    <Text style={{ color: workMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8, marginTop: 3 }}>{workMenuList.menuName}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Display>

                    {/* for BAWARCHI */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("BAWARCHI") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>BAWARCHI & CATALOGUE</Text>
                </TouchableOpacity>
                <Display enable={this.state.bawarchiOptions}>
                    <View style={styles.menuList}>
                        {this.state.bawarchiMenuList.map((bawarchiMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: bawarchiMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(bawarchiMenuList, "BAWARCHI") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={bawarchiMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: bawarchiMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{bawarchiMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for BUSINESS */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("BUSINESS") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>BUSINESS & CATALOGUE</Text>
                </TouchableOpacity>
                <Display enable={this.state.businessOptions}>
                    <View style={styles.menuList}>
                        {this.state.businessMenuList.map((businessMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: businessMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(businessMenuList, "BUSINESS") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={businessMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: businessMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{businessMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for CUSTOMER */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("CUSTOMER") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>CUSTOMERS</Text>
                </TouchableOpacity>
                <Display enable={this.state.customerOptions}>
                    <View style={styles.menuList}>
                        {this.state.customerMenuList.map((customerMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: customerMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(customerMenuList, "CUSTOMER") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={customerMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: customerMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{customerMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for HUMAN RESOURCES */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("HUMAN") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>HUMAN RESOURCES</Text>
                </TouchableOpacity>
                <Display enable={this.state.humanOptions}>
                    <View style={styles.menuList}>
                        {this.state.humanMenuList.map((humanMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: humanMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(humanMenuList, "HUMAN") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={humanMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: humanMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{humanMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for INVENTORY */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("INVENTORY") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>INVENTORY</Text>
                </TouchableOpacity>
                <Display enable={this.state.inventoryOptions}>
                    <View style={styles.menuList}>
                        {this.state.inventoryMenuList.map((inventoryMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: inventoryMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(inventoryMenuList, "INVENTORY") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={inventoryMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: inventoryMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{inventoryMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for KITCHEN */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("KITCHEN") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>KITCHEN & CATALOGUE</Text>
                </TouchableOpacity>
                <Display enable={this.state.kitchenOptions}>
                    <View style={styles.menuList}>
                        {this.state.kitchenMenuList.map((kitchenMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: kitchenMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(kitchenMenuList, "KITCHEN") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={kitchenMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: kitchenMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{kitchenMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for LOCATION */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("LOCATION") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>LOCATIONS</Text>
                </TouchableOpacity>
                <Display enable={this.state.locationOptions}>
                    <View style={styles.menuList}>
                        {this.state.locationMenuList.map((locationMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: locationMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(locationMenuList, "LOCATION") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={locationMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: locationMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{locationMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for OFFERS & COUPONS */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("OFFERS") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>OFFERS & COUPONS</Text>
                </TouchableOpacity>
                <Display enable={this.state.offersOptions}>
                    <View style={styles.menuList}>
                        {this.state.offersMenuList.map((offersMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: offersMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(offersMenuList, "OFFERS") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={offersMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: offersMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{offersMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for OPERATIONS */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("OPERATION") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>OPERATIONS</Text>
                </TouchableOpacity>
                <Display enable={this.state.operationOptions}>
                    <View style={styles.menuList}>
                        {this.state.operationMenuList.map((operationMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: operationMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(operationMenuList, "OPERATION") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={operationMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: operationMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{operationMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for ORDERS */}
                    <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("ORDER") }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>ORDERS</Text>
                    </TouchableOpacity>
                    <Display enable={this.state.orderOptions}>
                        <View style={styles.menuList}>
                            {this.state.orderMenuList.map((orderMenuList, index) => (
                                <TouchableOpacity style={[styles.menuItem, { backgroundColor: orderMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(orderMenuList, "ORDER") }} key={index}>
                                    <Icon name={orderMenuList.iconName} style={{ fontSize: 20, color: orderMenuList.selected == true ? '#cd2121' : '#fff' }} />
                                    <Text style={{ color: orderMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8, marginTop: 3 }}>{orderMenuList.menuName}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Display>

                    {/* for PRODUCT CATALOGUE */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("PRODUCT") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>PRODUCT CATALOGUE</Text>
                </TouchableOpacity>
                <Display enable={this.state.productOptions}>
                    <View style={styles.menuList}>
                        {this.state.productMenuList.map((productMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: productMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(productMenuList, "PRODUCT") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={productMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: productMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{productMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for RESTAURANT */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("RESTAURANT") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>RESTAURANT</Text>
                </TouchableOpacity>
                <Display enable={this.state.restaurantOptions}>
                    <View style={styles.menuList}>
                        {this.state.restaurantMenuList.map((restaurantMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: restaurantMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(restaurantMenuList, "RESTAURANT") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={restaurantMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: restaurantMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{restaurantMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for RESTAURANT */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("REPORT") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>REPORTS</Text>
                </TouchableOpacity>
                <Display enable={this.state.reportOptions}>
                    <View style={styles.menuList}>
                        {this.state.reportMenuList.map((reportMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: reportMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(reportMenuList, "REPORT") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={reportMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: reportMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{reportMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}

                    {/* for REVIEW */}
                    {/* <TouchableOpacity style={styles.commonHead} onPress={() => { this.showOptionList("REVIEW") }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>REVIEW</Text>
                </TouchableOpacity>
                <Display enable={this.state.reviewOptions} >
                    <View style={styles.menuList}>
                        {this.state.reviewMenuList.map((reviewMenuList, index) => (
                            <TouchableOpacity style={[styles.menuItem, { backgroundColor: reviewMenuList.selected == true ? '#fff' : '#064269' }]} onPress={() => { this.checkNavigation(reviewMenuList, "REVIEW") }} key={index}>
                                <Icon name="heart" style={{ fontSize: 18 }} color={reviewMenuList.selected == true ? '#cd2121' : '#fff'} />
                                <Text style={{ color: reviewMenuList.selected == true ? '#cd2121' : '#fff', marginLeft: 8 }}>{reviewMenuList.menuName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Display> */}
                </Display>
                <Display enable={!this.state.activateMenu} style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#fff', padding: 10, width: '100%' }}>
                        <Text style={{ fontSize: 16 }}>Please Login To Access<Text style={{ fontSize: 18, fontWeight: '600', color: '#cd2121' }}> ADMIN</Text>  Features!</Text>

                        <TouchableOpacity onPress={() => { this.fetchUserData() }} style={{ alignSelf: 'center', backgroundColor: '#000', padding: 5, marginTop: 10 }}>
                            <Text style={{ color: '#fff', fontSize: 18 }}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                </Display>
            </ScrollView>

        );
    }
}
const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#0e6ba8'
    },
    menuHeadItem: {
        height: 160, justifyContent: 'center', alignItems: 'center',
        borderBottomColor: '#d8d8d8',
        borderBottomWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        backgroundColor: '#ccc9cb'
    },
    commonHead: {
        height: 40,
        paddingLeft: 30, flexDirection: 'row',
    },
    textBig: {
        fontSize: 24,
        fontWeight: '500'
    },
    textWhite: {
        color: '#fff'
    },
    menuList: {
        backgroundColor: '#064269'
    },
    menuItem: {
        backgroundColor: '#fff',
        // borderTopRightRadius: 30,
        // borderBottomRightRadius: 30,
        padding: 15,
        paddingHorizontal: 60,
        flexDirection: 'row',
    },
});

