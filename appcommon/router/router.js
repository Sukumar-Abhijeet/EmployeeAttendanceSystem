import { createStackNavigator, createDrawerNavigator, createAppContainer } from 'react-navigation';
import LoginScreen from '../screens/auth/LoginScreen';
import DashBoardScreen from '../screens/DashBoardScreen';
import SideMenu from '../screens/menu/SideMenu';
import AppLoaderScreen from '../screens/auth/AppLoaderScreen';
import TodoListScreen from '../screens/work/TodoListScreen';
import CreateCustomerOrderScreen from '../screens/orders/CreateCustomerOrderScreen';
import MainHeaderScreen from '../screens/header/MainHeaderScreen';
import ViewOrderScreen from '../screens/orders/ViewOrderScreen';
import ViewOrderDetailsScreen from '../screens/orders/ViewOrderDetailsScreen';
import orderLogScreen from '../screens/logs/orderLogScreen';
import CreateB2BOrderScreen from '../screens/orders/CreateB2BOrderScreen';
import ViewPurchaseOrderScreen from '../screens/orders/ViewPurchaseOrderScreen';

export const AppStack = createStackNavigator(
    {
        AppLoader:
        {
            screen: AppLoaderScreen,
            navigationOptions: {
                header: null,
                drawerLockMode: 'locked-closed',
                disableGestures: true
            }
        },
        Login:
        {
            screen: LoginScreen,
            navigationOptions: {
                header: null,
                drawerLockMode: 'locked-closed',
                disableGestures: true
            }
        },
        Dashboard:
        {
            screen: DashBoardScreen,
            navigationOptions: {
                header: null,
            }
        },
        TodoList:
        {
            screen: TodoListScreen,
            navigationOptions: {
                header: null,
            }
        },
        // ORDERS
        CustomerOrderPG:
        {
            screen: CreateCustomerOrderScreen,
            navigationOptions: {
                header: null,
            }
        },
        ViewOrderPG:
        {
            screen: ViewOrderScreen,
            navigationOptions: {
                header: null,
            }
        },
        ViewOrderDetailsPG: {
            screen: ViewOrderDetailsScreen,
            navigationOptions: {
                header: null,
            }
        },
        B2BOrderPG:
        {
            screen: CreateB2BOrderScreen,
            navigationOptions: {
                header: null,
            }
        },
        ViewPurchaseOrderPG:
        {
            screen: ViewPurchaseOrderScreen,
            navigationOptions: {
                header: null,
            }
        },
        orderLogPG: {
            screen: orderLogScreen,
            navigationOptions: {
                header: null,
            }
        },
        // ORDERS END

        MainHeader: {
            screen: MainHeaderScreen,
            navigationOptions: {
                header: null,
            }
        }
    },
    {
        initialRouteName: 'AppLoader',
    }
);

const prevGetStateForAction = AppStack.router.getStateForAction;
AppStack.router.getStateForAction = (action, state) => {
    // Do not allow to go back from Home
    if (action.type === 'Navigation/BACK' && state && state.routes[state.index].routeName === 'Dashboard') {
        return null;
    }

    // Do not allow to go back to Login
    // if (action.type === 'Navigation/BACK' && state) {
    //   const newRoutes = state.routes.filter(r => r.routeName !== 'Login');
    //   const newIndex = newRoutes.length - 1;
    //   return prevGetStateForAction(action, { index: newIndex, routes: newRoutes });
    // }
    return prevGetStateForAction(action, state);
};


export const DrawerNav = createDrawerNavigator({
    Stack: {
        screen: AppStack
    },
},
    {
        initialRouteName: 'Stack',
        drawerWidth: 300,
        contentComponent: SideMenu,
        drawerPosition: 'left'
    });


//const RootStack = createAppContainer(DrawerNav);
export default DrawerNav;