import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ToastAndroid, TouchableOpacity, ScrollView, Alert, PermissionsAndroid, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import Global from '../../Urls/Global.js';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Display from 'react-native-display';
import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, Left, Right, Radio, Badge, Form, Textarea } from 'native-base';
import Modal from 'react-native-modal';
const BASEPATH = Global.BASE_PATH;
export default class ViewOrderDetailsScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            orderItem: this.props.navigation.getParam('orderItem'),
            cancelReason: '',
            orderActions: false,
            reasonBox: false,
            selectBox: false,
            orderProcessActionType: '',
            submitReason: '',
            viewOrderObj: { ItemDetails: [] },
            deliveryBoyList: [
                {
                    "Id": 'DEFAULT',
                    "Name": "Select Delivery Person",
                }
            ],
            selectedDeliveryBoy: '',
            assignDeliveryPerson: false,
            refreshing: false,
            loader: true,
            cancelOrderModal: null,
        }
    }

    componentDidMount() {
        console.log('ViewOrderDetailsScreen componentDidMount()', this.state.orderItem);
        this.getOrderDetails();
        this.getDeliveryPersonList();
    }

    getOrderDetails() {
        console.log('ViewOrderDetailsScreen getOrderDetails()');

        this.setState({ refreshing: true, loader: true });
        let formValue = JSON.stringify({
            'uId': this.state.orderItem.Uid,
            'orderId': this.state.orderItem.Id,
        });
        // let formValue = JSON.stringify({
        //     'uId': '2Dc7gSjdGQ0dSwf1DwUPwg==',
        //     'orderId': '3277702',
        // });
        console.log('ViewOrderScreen getOrderDetails() formvalue : ', formValue);
        fetch(BASEPATH + Global.GET_ORDER_DETAILS, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('ViewOrderScreen getOrders() response : ', responseData);
            this.setState({ viewOrderObj: responseData.OrderDetails })
            if (responseData.OrderDetails.Status != "Order Delivered") {
                this.setState({ orderActions: true, selectBox: false, reasonBox: false, assignDeliveryPerson: false, })
                if (responseData.OrderDetails.Status == "Order Confirmed") {
                    this.setState({ selectBox: true })
                }
                if (responseData.OrderDetails.Status == "Cooking") {
                    if (responseData.OrderDetails.OrderPosition > 2 && responseData.OrderDetails.OrderPosition < 5) {
                        this.setState({ assignDeliveryPerson: true })
                    }
                    this.setState({ reasonBox: false, selectedDeliveryBoy: '' })
                }
            } else {
                this.setState({ orderActions: false, selectBox: false, reasonBox: false, assignDeliveryPerson: false, selectedDeliveryBoy: '' })
            }
            this.setState({ loader: false })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
        this.setState({ selectedDeliveryBoy: '', refreshing: false, });

    }

    assignDelPerson() {
        console.log("ViewOrderDetailsScreen assignDelPerson()");
        let formValue = JSON.stringify({
            'uId': this.state.orderItem.Uid,
            'orderId': this.state.orderItem.Id,
            'actionType': "ASSIGNDEL",
            'actionReason': "",
            'deliveryPerson': this.state.selectedDeliveryBoy
        });

        console.log("cofnirm order formValue: ", formValue);
        fetch(BASEPATH + Global.PROCESS_ORDER_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('ViewOrderScreen assignDelPerson() response : ', responseData);
            if (responseData.Success == "Y") {
                ToastAndroid.show("Order Confirmed", ToastAndroid.LONG);
                this.getOrderDetails();
            }
            this.setState({ loader: false });

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    downloadInvoice() {
        console.log('ViewOrderDetailsScreen downloadInvoice()', this.state.orderItem.Id);
        let formValue = JSON.stringify({
            'orderId': this.state.orderItem.Id,
        });
        console.log('ViewOrderDetailsScreen downloadInvoice() formValue:', formValue);
        fetch(BASEPATH + Global.GENERATE_INVOICE_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('ViewOrderDetailsScreen downloadInvoice() response : ', responseData);
            this.requestExternalWritePermission(responseData.HTML);
            //this.createPDF()
            // this.setState({ viewOrderObj: responseData.OrderDetails })

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });

    }

    takeAction(orderPos, confirmType) {
        console.log("takeAction() orderPos: ", orderPos, confirmType);
        this.setState({ reasonBox: true, submitReason: '' })
        if (confirmType == "COOK")
            this.setState({ selectBox: false, reasonBox: true, submitReason: '' })

        // this.orderAction = true;
        this.state.orderProcessActionType = confirmType;
    }

    confirmOrder() {
        // let formValue = JSON.stringify({
        //     'uId': '2Dc7gSjdGQ0dSwf1DwUPwg==',
        //     'orderId': '3277702',
        //     'actionType': this.state.orderProcessActionType,
        //     'actionReason': this.state.submitReason,
        //     'deliveryPerson': this.state.selectedDeliveryBoy,
        // });
        this.setState({ loader: true })
        let formValue = JSON.stringify({
            'uId': this.state.orderItem.Uid,
            'orderId': this.state.orderItem.Id,
            'actionType': this.state.orderProcessActionType,
            'actionReason': this.state.submitReason,
            'deliveryPerson': this.state.selectedDeliveryBoy,
        });

        console.log("confirm order formValue: ", formValue);
        fetch(BASEPATH + Global.PROCESS_ORDER_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('ViewOrderScreen confirmOrder() response : ', responseData);
            if (responseData.Success == "Y") {
                ToastAndroid.show("Order Confirmed", ToastAndroid.LONG);
            } else {
                ToastAndroid.show("Something went wrong", ToastAndroid.LONG)
            }
            this.getOrderDetails();
            this.setState({ loader: false });

        }).catch((error) => {
            console.log("Error Authenticate User: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ loader: false });
        });
    }

    getDeliveryPersonList() {
        console.log('ViewOrderDetailsScreen getDeliveryPersonList()');
        let orderId = '3277702'
        if (orderId != "" && typeof orderId != 'undefined') {
            this.loader = true;
            let formValue = JSON.stringify({
                'uId': this.state.orderItem.Uid,
                'orderId': this.state.orderItem.Id,
            });
            // let formValue = JSON.stringify({
            //     'uId': '2Dc7gSjdGQ0dSwf1DwUPwg==',
            //     'orderId': '3277702',
            // });
            console.log('ViewOrderScreen getDeliveryPersonList() formvalue : ', formValue);
            fetch(BASEPATH + Global.GET_DEL_PERSON_LIST_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseData) => {
                console.log('ViewOrderScreen getOrders() response : ', responseData);
                let dbL = this.state.deliveryBoyList;
                dbL = dbL.concat(responseData.DelPersonList);
                this.setState({ deliveryBoyList: dbL, }, () => { this.setState({ loader: false }) })

            }).catch((error) => {
                console.log("Error Authenticate User: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                this.setState({ loader: false });
            });

        }
    }

    changeDeliveryBoy(id) {
        console.log('ViewOrderScreen changeDeliveryBoy() response : ', id);
        if (id != "DEFAULT") {
            this.setState({ selectedDeliveryBoy: id })
        } else {
            this.setState({ selectedDeliveryBoy: '' })
        }
    }

    async  requestExternalWritePermission(HTML) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'CameraExample App External Storage Write Permission',
                    message:
                        'CameraExample App needs access to Storage data in your SD Card ',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //If WRITE_EXTERNAL_STORAGE Permission is granted
                //changing the state to show Create PDF option
                this.createPDF(HTML)
            } else {
                alert('WRITE_EXTERNAL_STORAGE permission denied');
            }
        } catch (err) {
            alert('Write permission err', err);
            console.warn(err);
        }
    }

    viewLogs() {
        console.log('ViewOrderScreen viewLogs() ');
        this.props.navigation.navigate('orderLogPG', { 'uId': this.state.orderItem.Uid, 'orderId': this.state.orderItem.Id })
    }

    async createPDF(htmlFile) {
        console.log("createPDF()")
        let options = {
            html: '<Body><div id="contentToConvert" style="display: inline-block;padding: 20px;">' + htmlFile + '</div></Body>',
            fileName: 'BMFInvoice' + this.state.viewOrderObj.Id,
            directory: 'docs',
        };

        let file = await RNHTMLtoPDF.convert(options)
        console.log(file.filePath);
        Alert.alert("File Downloaded to :", file.filePath);
    }

    cancelOrder() {
        if (this.state.cancelReason.length >= 20) {
            this.setState({ loader: true })

            let formValue = JSON.stringify({
                'uId': this.state.orderItem.Uid,
                'orderId': this.state.orderItem.Id,
                'actionType': "CANCEL",
                'actionReason': this.state.cancelReason,
            });

            console.log("cofnirm order formValue: ", formValue);
            fetch(BASEPATH + Global.PROCESS_ORDER_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseData) => {
                console.log('ViewOrderScreen assignDelPerson() response : ', responseData);
                if (responseData.Success == "Y") {
                    ToastAndroid.show("Order Cancelled", ToastAndroid.LONG);
                    this.setState({ cancelOrderModal: null, cancelReason: '' })
                    this.getOrderDetails();
                }
                this.setState({ loader: false });

            }).catch((error) => {
                console.log("Error Authenticate User: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                this.setState({ loader: false });
            });
        } else {
            ToastAndroid.show('More characters required', ToastAndroid.LONG);
        }
    }


    __renderCancelOrderDetails = () => (
        <View style={styles.filterModalContainer}>
            <View style={{ flex: 1, flexDirection: 'row', padding: 10, borderBottomColor: '#ebebeb', borderBottomWidth: 1 }}>
                <View style={{ flex: 2 }}>
                    <Text style={{ fontWeight: '600', fontSize: 16 }}>Reason For Cancellation</Text>
                </View>
                <View style={{ flex: 1, }}>
                    <TouchableOpacity onPress={() => { this.setState({ cancelOrderModal: null }) }}>
                        <Icon name={'md-close'} style={{ color: '#cd2121', fontSize: 20, alignSelf: 'flex-end' }} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ paddingHorizontal: 4 }}>
                <Form>
                    <Textarea
                        onChangeText={(cancelReason) => { this.setState({ cancelReason }) }}
                        rowSpan={5} bordered placeholder="Cancel Reason" />
                </Form>
                <Display enable={this.state.cancelReason.length < 20}>
                    <Text style={{ color: '#cd2121', fontSize: 16, fontWeight: '300', marginTop: 5 }}>Minimum 20 characters are required</Text>
                </Display>
            </View>
            <View opacity={(this.state.cancelReason.length < 20) ? .5 : 1} style={{ paddingTop: 5 }}>
                <TouchableOpacity onPress={() => { this.cancelOrder() }} style={{ padding: 10, width: '100%', backgroundColor: '#fed844', borderRadius: 4, justifyContent: 'center', alignItems: 'center' }} disabled={this.state.cancelReason.length < 20}>
                    <Display enable={this.state.loader}>
                        <ActivityIndicator size={'small'} color={'#cd2121'} />
                    </Display>
                    <Display enable={!this.state.loader}>
                        <Text style={{ fontSize: 19, fontWeight: '600', color: '#fff' }}>Cancel Order</Text>
                    </Display>

                </TouchableOpacity>
            </View>

        </View>
    )

    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.menuHeadItem}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <TouchableOpacity style={{ alignSelf: 'center', }} onPress={() => { this.props.navigation.goBack(null) }}>
                            <Icon active name='md-arrow-back' style={{ color: '#000', fontSize: 20 }} />
                        </TouchableOpacity>
                        <View style={{ paddingLeft: 15 }}>
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '400' }}>Order #{this.state.viewOrderObj.Id}</Text>
                            <Text>placed @{this.state.viewOrderObj.PlacedDate}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, padding: 5, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 5, borderRadius: 4, backgroundColor: (this.state.viewOrderObj.Status == "Order Cancelled") ? '#cd2121' : '#28a745' }}>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>{this.state.viewOrderObj.Status}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { ToastAndroid.show("Use Web Panel to edit", ToastAndroid.LONG) }} style={{ padding: 5, marginLeft: 3, backgroundColor: '#000', borderRadius: 4 }}>
                            <Icon active name='md-create' style={{ color: '#fff', fontSize: 14 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={{ paddingBottom: (this.state.loader) ? 0 : 50, padding: 10, backgroundColor: this.state.loader ? "#fff" : '#e5e5e5', flex: this.state.loader ? 1 : undefined }}
                // refreshControl={
                //     <RefreshControl
                //         refreshing={this.state.refreshing}
                //         onRefresh={this.getOrderDetails()}
                //     />
                // }
                >
                    <Display enable={this.state.loader} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                        <ActivityIndicator size={'large'} color='#cd2121' />
                    </Display>
                    <Display enable={!this.state.loader}>
                        <Text style={{ fontSize: 18 }}>Order Item Details</Text>
                        {this.state.viewOrderObj.ItemDetails.map((ItemDetails, index) => (
                            <View style={[styles.infoBox, { marginTop: 6 }]} key={index}>
                                <View style={{ backgroundColor: '#007bff', padding: 10, flexDirection: 'row', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                                    <View style={{ flex: 1.4 }}>
                                        <View style={{ flexDirection: 'row', flex: 1 }}>
                                            <Text style={{ color: '#fff' }}>{ItemDetails.RestName}({ItemDetails.RestPhone}) </Text>
                                        </View>
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>OTP : <Text>{ItemDetails.RestOTP}</Text></Text>
                                    </View>
                                    <View style={{ flex: .6, flexDirection: 'row', alignItems: 'center' }}>
                                        <Display enable={!(ItemDetails.FTR == "NO")} style={{ backgroundColor: '#fff', padding: 3, borderRadius: 4, height: 20, justifyContent: 'center', alignItems: 'center', width: 20 }}>
                                            <Icon name='ios-checkmark' style={{ color: '#007bff', fontSize: 22, fontWeight: '600' }} />
                                        </Display>
                                        <View style={{ backgroundColor: (ItemDetails.FTR == "NO") ? "#ffc107" : 'transparent', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 }}>
                                            <Text style={{ color: (ItemDetails.FTR == "NO") ? "#000" : '#fff', fontWeight: '400' }}>{(ItemDetails.FTR == "ACC") ? 'Accepted' : (ItemDetails.FTR == "COK") ? 'Cooking' : (ItemDetails.FTR == "PKD") ? 'Packed' : (ItemDetails.FTR == "HND") ? 'Handed' : 'Not Accepted Yet'}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ borderColor: '#000', borderWidth: 1, paddingVertical: 15 }}>
                                    {ItemDetails.Items.map((Item, index) => (
                                        <View style={{ flexDirection: 'row', paddingHorizontal: 10, }} key={index}>
                                            <View style={{ flex: 5, borderWidth: 1, borderColor: '#fff', padding: 5 }}>
                                                <Text style={{ color: '#000', fontSize: 16, fontWeight: '800' }}>{Item.ProductName}</Text>
                                            </View>
                                            <View style={{ flex: 1, borderWidth: 1, borderColor: '#fff', padding: 5 }}>
                                                <Text style={{ color: '#000', }}>{Item.Qty}</Text>
                                            </View>
                                            <View style={{ flex: 2, borderWidth: 1, borderColor: '#fff', padding: 5 }}>
                                                <Text style={{ color: '#000', }}>₹ {Item.UnitPrice}</Text>
                                            </View>
                                            <View style={{ flex: 2, borderWidth: 1, borderColor: '#fff', padding: 5 }}>
                                                <Text style={{ color: '#000', }}> ₹{Item.ItemTotal}</Text>
                                            </View>
                                        </View>

                                    ))}
                                </View>
                            </View>
                        ))}

                        {/* Customer Instructions */}
                        <Display enable={this.state.viewOrderObj.OrderInstructions != "None"}>
                            <Text style={{ fontSize: 18, marginTop: 10 }}>Customer Instructions</Text>
                            <View style={{ borderWidth: 1, borderColor: '#fff', padding: 10, marginTop: 6 }}>
                                <Text style={{ color: '#000', fontWeight: '600' }}>{this.state.viewOrderObj.OrderInstructions}</Text>
                            </View>
                        </Display>

                        {/* Billing Details */}

                        <Text style={{ fontSize: 18, marginTop: 10 }}>Billing Details</Text>
                        <View style={{ flexDirection: 'row', marginTop: 6, borderTopWidth: 1, borderTopColor: '#fff', paddingTop: 3 }}>
                            <View style={{
                                flex: 1
                            }}>
                                <View style={styles.billingView}>
                                    <Text style={styles.textBill}>Order Price</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.textBill}>Delivery Charge</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.textBill}>Packaging Charge</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.textBill}>Taxes</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.textBill}>Coupon Save</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.textBill}>Wallet Deduction</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={[styles.textBill, { fontWeight: '800', color: '#000' }]}>Net Payable</Text>
                                </View>
                            </View>
                            <View style={{
                                flex: 1
                            }}>
                                <View style={styles.billingView}>
                                    <Text style={styles.billingText}>₹ {this.state.viewOrderObj.OrderPrice}</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.billingText}>₹ {this.state.viewOrderObj.DeliveryCharge}</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.billingText}>₹ {this.state.viewOrderObj.PackingCharge}</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.billingText}>₹ {this.state.viewOrderObj.Taxes}</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.billingText}>₹ {this.state.viewOrderObj.CouponSave}</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={styles.billingText}>₹ {this.state.viewOrderObj.WalletDeduction}</Text>
                                </View>
                                <View style={styles.billingView}>
                                    <Text style={[styles.billingText, { color: '#000' }]}>₹ {this.state.viewOrderObj.NetPayable}</Text>
                                </View>
                            </View>
                        </View>
                        {/* Customer & Payment Details */}

                        <Text style={{ fontSize: 18, marginTop: 10 }}>Customer & Payment Details</Text>
                        <View style={styles.cardBox}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.billingView}>
                                        <Text style={[styles.billingText, { fontWeight: '600', alignSelf: 'flex-start' }]}>{this.state.viewOrderObj.CustomerName} | {this.state.viewOrderObj.BuyerName == this.state.viewOrderObj.CustomerName ? "" : this.state.viewOrderObj.BuyerName}</Text>
                                    </View>
                                    <View style={styles.billingView}>
                                        <Text style={[styles.billingText, { fontSize: 16 }]}>{this.state.viewOrderObj.DeliveryAddress}</Text>

                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ alignSelf: 'flex-end', padding: 5, backgroundColor: '#cd2121' }}>
                                        <Text style={{ color: '#fff' }}>OTP: {(this.state.viewOrderObj.CustOTP == "") ? 'NA' : this.state.viewOrderObj.CustOTP}</Text>
                                    </View>
                                    <TouchableOpacity style={{ padding: 5, backgroundColor: '#28a745', alignSelf: 'flex-end', borderRadius: 4, marginTop: 5 }}>
                                        <Icon name={'md-call'} style={{ fontSize: 18 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.billingView}>
                                        <Text>Payment Mode</Text>
                                    </View>
                                    <View style={styles.billingView}>
                                        <Text>Payment Status</Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.billingView}>
                                        <Text style={styles.billingText}>{this.state.viewOrderObj.PaymentMode}</Text>
                                    </View>
                                    <View style={styles.billingView}>
                                        <Text style={[styles.billingText, { color: (this.state.viewOrderObj.PaymentStatus == "Pending") ? "#cd2121" : 'green' }]}>{this.state.viewOrderObj.PaymentStatus}</Text>
                                    </View>

                                </View>
                            </View>

                        </View>

                        {/* Delivery Person Details */}

                        <Text style={{ fontSize: 18, marginTop: 10 }}>Delivery Person Details</Text>
                        <View style={styles.cardBox}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.billingView2}>
                                        <Text style={[styles.billingText2, { fontWeight: '600' }]}>{this.state.viewOrderObj.DelPersonName}</Text>
                                    </View>
                                    {/* <View style={styles.billingView2}>
                                    <Text style={{ color: '#000', fontWeight: '200' }}>Phone</Text>
                                </View> */}
                                    <View style={styles.billingView2}>
                                        <Text style={{ fontWeight: '200' }}>Accepted?</Text>
                                    </View>
                                    <Display enable={this.state.assignDeliveryPerson} style={styles.billingView2}>
                                        <Text style={{ fontWeight: '200' }}>Assign Delivery Person</Text>
                                    </Display>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={{ padding: 5, backgroundColor: '#28a745', alignSelf: 'flex-end', borderRadius: 4, marginTop: 5 }}>
                                        <Icon name={'md-call'} style={{ fontSize: 18 }} />
                                    </TouchableOpacity>
                                    {/* <View style={styles.billingView2}>
                                    <Text style={styles.billingText2}>{this.state.viewOrderObj.DelPersonPhone}</Text>
                                </View> */}
                                    <View style={[styles.billingView2, { alignSelf: 'flex-end', paddingTop: 10 }]}>
                                        <Text style={[styles.billingText2, { color: this.state.viewOrderObj.DelPersonAccepted == 'NO' ? '#cd2121' : 'green' }]}>{this.state.viewOrderObj.DelPersonAccepted}</Text>
                                    </View>
                                    <Display enable={this.state.assignDeliveryPerson} style={[styles.billingView2, { flexDirection: 'row' }]}>
                                        <Picker
                                            mode="dropdown"
                                            iosIcon={<Icon name="arrow-down" />}
                                            style={{ width: 100 }}
                                            placeholder="Select Location"
                                            placeholderStyle={{ color: "#bfc6ea" }}
                                            placeholderIconColor="#007aff"
                                            selectedValue={this.state.selectedDeliveryBoy}
                                            onValueChange={this.changeDeliveryBoy.bind(this)}
                                        >
                                            {this.state.deliveryBoyList.map((deliveryBoy, index) => (
                                                <Picker.Item label={deliveryBoy.Name} value={deliveryBoy.Id} key={index} />
                                            ))
                                            }
                                        </Picker>
                                        <View opacity={this.state.selectedDeliveryBoy == "" ? .4 : 1} style={{ alignSelf: 'center' }}>
                                            <TouchableOpacity onPress={() => { this.assignDelPerson() }} disabled={this.state.selectedDeliveryBoy == ""} style={{ padding: 5, backgroundColor: '#cd2121', }}>
                                                <Text style={{ color: '#fff', fontSize: 16 }}>Assign</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Display>
                                </View>
                            </View>
                        </View>
                        {/* Order Status */}

                        <Text style={{ fontSize: 18, marginTop: 10 }}>Order Status</Text>
                        <View style={{
                            marginTop: 6, flexDirection
                                : 'row'
                        }}>
                            <View style={[styles.billingView2, { flex: 4 }]}>
                                <Text>Time Taken To Complete The Order : <Text style={{ fontWeight: '600', fontSize: 16, color: '#000' }}>{(this.state.viewOrderObj.CompletionTime == "") ? "N.A." : this.state.viewOrderObj.CompletionTime}</Text></Text>
                            </View>
                            <View style={[styles.billingView2, { flex: 1, padding: 4 }]}>
                                <TouchableOpacity onPress={() => { this.downloadInvoice() }} style={{ flexDirection: 'row', padding: 5, backgroundColor: '#fed844', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name={'ios-cloud-download'} style={{ fontSize: 15 }} />
                                    <Text style={{ color: '#000', marginLeft: 1 }}>Invoice</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Order Actions */}

                        <Text style={{ fontSize: 18, marginTop: 10 }}>Order Actions</Text>

                        <Display enable={this.state.orderActions} style={{ flexDirection: 'row', flex: 1, marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <Display enable={this.state.reasonBox}>
                                <View style={{ borderWidth: 1, borderColor: '#fff', padding: 10, paddingVertical: 2 }}>
                                    <Input
                                        returnKeyType="done"
                                        keyboardType='default'
                                        onChangeText={(submitReason) => { this.setState({ submitReason }) }} placeholder={"Specify Reason"}
                                        onSubmitEditing={() => { }}
                                    />
                                </View>
                            </Display>
                            <Display enable={this.state.selectBox}>
                                <View style={{ borderWidth: 1, borderColor: '#fff', padding: 10, paddingVertical: 2 }}>

                                    <Picker
                                        mode="dropdown"
                                        iosIcon={<Icon name="arrow-down" />}
                                        style={{ width: 130 }}
                                        placeholder="Select DeliveryBoy"
                                        placeholderStyle={{ color: "#bfc6ea" }}
                                        placeholderIconColor="#007aff"
                                        selectedValue={this.state.selectedDeliveryBoy}
                                        onValueChange={this.changeDeliveryBoy.bind(this)}
                                    >
                                        {this.state.deliveryBoyList.map((deliveryBoy, index) => (
                                            <Picker.Item label={deliveryBoy.Name} value={deliveryBoy.Id} key={index} />
                                        ))
                                        }
                                    </Picker>


                                </View>
                            </Display>
                            <View style={{ backgroundColor: '#cd2121' }} opacity={this.state.selectedDeliveryBoy == "" && this.state.viewOrderObj.Status == "Order Confirmed" ? .5 : 1}>
                                <TouchableOpacity disabled={this.state.selectedDeliveryBoy == "" && this.state.viewOrderObj.Status == "Order Confirmed"} style={{ padding: 10, marginLeft: (this.state.reasonBox) ? 5 : 0 }} onPress={() => {
                                    this.state.viewOrderObj.Status == 'Order Cancelled' ? undefined :
                                        this.state.reasonBox ? this.confirmOrder() :
                                            this.takeAction(
                                                this.state.viewOrderObj.OrderPosition, this.state.viewOrderObj.Status == "Order Placed" ? 'CONFIRM' : this.state.viewOrderObj.Status == "Order Confirmed" ? "COOK" :
                                                    this.state.viewOrderObj.Status == "Cooking" ? 'OUT' : this.state.viewOrderObj.Status == "Out For Delivery" ? 'DELIVER' : 'Error'
                                            )
                                }}>
                                    <Display enable={!this.state.loader}>
                                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '400' }}>
                                            {this.state.reasonBox ? "Submit" : this.state.viewOrderObj.Status == "Order Placed" ? 'CONFIRM Order' : this.state.viewOrderObj.Status == "Order Confirmed" ? "COOK Order" :
                                                this.state.viewOrderObj.Status == "Cooking" ? 'OUT for Delivery' : this.state.viewOrderObj.Status == "Out For Delivery" ? 'DELIVER Order' : this.state.viewOrderObj.Status ? 'Order Cancelled' : "Error"}
                                        </Text>
                                    </Display>
                                    <Display enable={this.state.loader}>
                                        <ActivityIndicator size={'small'} color={'#fff'} />
                                    </Display>
                                </TouchableOpacity>
                            </View>

                            <Display enable={this.state.viewOrderObj.Status != "Order Cancelled"}>
                                <TouchableOpacity onPress={() => { this.setState({ cancelOrderModal: 1 }) }} style={{ padding: 10, backgroundColor: '#343a40', marginLeft: 5 }}>
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '400' }}>Cancel Order</Text>
                                </TouchableOpacity>
                            </Display>
                        </Display>

                        <TouchableOpacity onPress={() => { this.viewLogs() }} style={{ padding: 10, backgroundColor: '#17a2b8', marginTop: 10, alignSelf: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '400' }}>View Logs</Text>
                        </TouchableOpacity>
                    </Display>
                </ScrollView>
                <Modal isVisible={this.state.cancelOrderModal === 1} style={styles.bottomModal} onBackButtonPress={() => this.setState({ cancelOrderModal: null })}>
                    {this.__renderCancelOrderDetails()}
                </Modal>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
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
    largeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#747475',
    },
    infoBox: {
        borderRadius: 4, height: 'auto',
    },
    billingView: {
        flex: 1,
        padding: 1,
    },
    billingText: {
        fontWeight: '300', alignSelf: 'flex-end', fontSize: 18
    },
    billingView2: {
        flex: 1, borderColor: '#fff', borderWidth: 1,
        padding: 1, padding: 4
    },
    billingText2: {
        fontWeight: '300', fontSize: 18
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
    },
    bottomModal: {
        justifyContent: 'center', alignItems: 'center',
        margin: 0,
    },
    filterModalContainer: {
        width: "80%",
        backgroundColor: '#fff',
        padding: 0,
        borderRadius: 4,
        shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        height: 250,
    },

});