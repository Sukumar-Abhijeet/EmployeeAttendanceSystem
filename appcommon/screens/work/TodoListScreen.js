import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Display from 'react-native-display';
import { Container, Header, Content, SwipeRow, Icon as NBIcon, Button } from 'native-base';

export default class TodoListScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            workType: [
                {
                    "Name": 'Today',
                    "Selected": true,
                },
                {
                    "Name": 'Week',
                    "Selected": false,
                },
                {
                    "Name": 'Month',
                    "Selected": false,
                }
            ],
            showDate: true,
            dateString: '',
            selectSlot: [
                {
                    'Name': 'ALL',
                    'Color': '#000',
                    'Selected': true,
                },
                {
                    'Name': 'PERSONAL',
                    'Color': '#199fff',
                    'Selected': false,
                },
                {
                    'Name': 'WORK',
                    'Color': '#e5e85a',
                    'Selected': false,
                },
                {
                    'Name': 'PRIORITY',
                    'Color': '#cd2121',
                    'Selected': false,
                }
            ],
            TodoList: [
                { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }, { 'Name': 'Swipe to Dismiss' }
            ]
        }
    }
    componentDidMount() {
        console.log('TodoListScreen componentDidMount()')
        this.generateDate()
    }

    generateDate() {
        console.log('TodoListScreen generateDate()')
        let date = new Date();
        let dateString = date.toDateString();
        dateString = dateString.replace(" ", ", ");
        console.log(dateString);
        this.setState({ dateString: dateString })

    }
    checkSelectType(option) {
        console.log('TodoListScreen checkSelectType() : ', option)
        let arr = this.state.workType;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].Name == option.Name) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false;
            }
            if (option.Name == "Today") {
                this.setState({ showDate: true })
            } else {
                this.setState({ showDate: false })
            }
        }
        this.setState({ workType: arr })

    }
    changeSelectSlot(option) {
        console.log('TodoListScreen changeSelectSlot() : ', option)
        let arr = this.state.selectSlot;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].Name == option.Name) {
                arr[i].Selected = true;
            } else {
                arr[i].Selected = false;
            }
        }
        this.setState({ selectSlot: arr })

    }
    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.menuHeadItem}>
                    <TouchableOpacity onPress={() => { this.props.navigation.goBack(null) }} >
                        <Icon name="arrow-left" style={{ fontSize: 18, marginRight: 10 }} color={"#000"} />
                    </TouchableOpacity>
                    <Text style={{ color: '#cd2121', fontSize: 20, fontWeight: '600', }}>ToDo List</Text>
                </View>
                <View style={styles.selectType}>
                    <ScrollView horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    >
                        {this.state.workType.map((selectType, index) => (
                            <View key={index} style={{ padding: 20, paddingVertical: 15 }}>
                                <TouchableOpacity onPress={() => { this.checkSelectType(selectType) }}>
                                    <Text style={{ color: selectType.Selected == true ? "blue" : '#a5a2a2', fontSize: 50, fontWeight: '800' }}>{selectType.Name}</Text>
                                </TouchableOpacity>
                                <Display enable={this.state.showDate && selectType.Name == "Today"}>
                                    <Text style={{ marginLeft: 5, color: '#199fff', fontSize: 14 }}>{this.state.dateString}</Text>
                                </Display>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.selectType}>
                    <ScrollView horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    >
                        {this.state.selectSlot.map((selectWorkSlot, index) => (
                            <View key={index} style={{ padding: 20, paddingVertical: 0 }}>
                                <TouchableOpacity style={{ borderWidth: 1, borderColor: selectWorkSlot.Color, padding: 5, borderRadius: 10, backgroundColor: selectWorkSlot.Selected == true ? selectWorkSlot.Color : '#fff' }} onPress={() => { this.changeSelectSlot(selectWorkSlot) }}>
                                    <Text style={{ color: selectWorkSlot.Selected == true ? '#fff' : selectWorkSlot.Color, fontSize: 14 }}>{selectWorkSlot.Name}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <ScrollView style={styles.bodyList}>
                    {this.state.TodoList.map((selectType, index) => (
                        <SwipeRow
                            key={index}
                            leftOpenValue={75}
                            rightOpenValue={-75}
                            left={
                                <Button success onPress={() => alert('Add')}>
                                    <NBIcon active name="add" />
                                </Button>
                            }
                            body={
                                <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                                    <View style={{ backgroundColor: 'red', borderRadius: 10, width: 10, height: 10, marginRight: 15, alignSelf: 'center' }}>
                                    </View>
                                    <Text style={{ color: '#898989', alignSelf: 'center' }}>6:00 AM</Text>
                                    <Text style={{ alignSelf: 'center', marginLeft: 8, color: '#000', fontSize: 16, fontWeight: '400' }}>SwipeRow Body Text</Text>
                                </View>
                            }
                            right={
                                <Button danger onPress={() => alert('Trash')}>
                                    <NBIcon active name="trash" />
                                </Button>
                            }
                        />
                    ))}
                </ScrollView>

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
        alignItems: 'center',
        borderBottomWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        backgroundColor: '#fff'
    },
    selectType: {
        padding: 0,
        paddingTop: 5,
        marginLeft: 5,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    bodyList: {
        paddingVertical: 20, paddingBottom: 15
    }
});