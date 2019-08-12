import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { Container, Header, Content, Item, Input, Icon, Button, Picker, ListItem, Left, Right, Radio, Badge } from 'native-base';
import Global from '../../Urls/Global.js';
const BASEPATH = Global.BASE_PATH;
import Display from 'react-native-display';
export default class orderLogScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            orderId: this.props.navigation.getParam('orderId'),
            uId: this.props.navigation.getParam('uId'),
            orderLogs: [],
            loader: false
        }
    }

    componentDidMount() {
        console.log('orderLogScreen componentDidMount() ', this.state.orderId, this.state.uId);
        this.fetchOrderLogs();
    }

    fetchOrderLogs() {
        this.setState({ loader: true })
        console.log('orderLogScreen fetchOrderLogs() ', this.state.orderId, this.state.uId);
        let formValue = JSON.stringify({
            'orderId': this.state.orderId,
            'uId': this.state.uId,
        });
        console.log('ViewOrderScreen getOrders() fetchOrderLogs : ', formValue);
        fetch(BASEPATH + Global.GET_ORDER_LOGS_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseData) => {
            console.log('ViewOrderScreen getOrders() response : ', responseData);
            this.setState({ orderLogs: responseData.OrderLogs, loader: false })
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
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Button style={{ backgroundColor: '#007bff', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', }} onPress={() => { this.props.navigation.goBack(null) }}>
                            <Icon active name='md-arrow-back' style={{ color: '#fff', fontSize: 16 }} />
                        </Button>
                        <View style={{ paddingLeft: 5 }}>
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '400' }}>OrderLogs </Text>
                            <Text style={{ fontSize: 20, fontWeight: '500' }}> #{this.state.orderId}</Text>
                        </View>
                    </View>
                </View>
                <Display enable={this.state.loader} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size={'large'} color={'#cd2121'} />
                </Display>
                <Display enable={!this.state.loader} style={{ padding: 10 }}>
                    <ScrollView>
                        {
                            this.state.orderLogs.map((log, index) => (
                                <View key={index} style={{ borderWidth: 1, borderColor: '#a09d9d', marginBottom: 6, }}>
                                    <View style={{ backgroundColor: '#c7f768', flexDirection: 'row', padding: 4 }}>
                                        <Icon name={'ios-clock'} style={{ color: '#000' }} />
                                        <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: '600', color: '#000' }}>{log.Time}</Text>
                                    </View>
                                    <View style={{ padding: 4 }}>
                                        <Text style={{ fontSize: 17, fontWeight: '300', color: '#000' }}>{log.Text}</Text>
                                    </View>
                                </View>
                            ))
                        }
                    </ScrollView>
                </Display>
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
});