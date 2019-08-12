
class Global {

    static PROD_VAR = true;

    //static BASE_PATH = Global.PROD_VAR ? 'https://www.bringmyfood.ml' : 'http://192.168.31.60';

    static BASE_PATH = Global.PROD_VAR ? 'https://www.bringmyfood.in' : 'http://192.168.31.60';

    // static VERSION_CHECK_URL = '/data/admin/get-current-version-number.php';

    static VERSION_CHECK_URL = '/data/reactapp/userapp/get-current-version-number.php';

    static AUTHENTICATE_USER_URL = '/data/admin/nextlogin.php';

    static GET_ALL_CITIES_URL = "/data/admin/get-all-city-list.php";

    static GET_HUB_LIST_URL = "/data/admin/get-hub-list.php";


    // DASHBOARD

    static DASHBOARD_ORDERS_STATS_URL = "/data/admin/fetch-order-stats.php";

    // DASHBOARD



    //CREATE CUSTOMER ORDER AND B2B START

    static CUSTOMER_PHONE_ORDER_URL = '/data/admin/search-phone-number-for-create-order.php';

    static LOCALITY_LIST_BY_HUB = '/data/admin/get-locality-list-by-hub.php';

    static PRODUCTS_BY_LOCALITY = '/data/admin/get-all-products-by-locality.php';

    static DELIVERY_CHARGE_OF_ORDER = '/data/admin/get-delivery-charge-of-order.php';

    static GET_B2B_CUSTOMERS_BY_CITY_URL = "/data/admin/get-b2b-customers-by-city.php";

    static GET_B2B_CUSTOMERS_PRODUCTS_FOR_ORDER_URL = "/data/admin/get-products-of-b2b-customers-for-order.php";

    static CREATE_PHONE_ORDER_URL = "/data/admin/create-phone-order.php";

    static CREATE_B2B_ORDER_URL = "/data/admin/create-b2b-order.php";

    static GET_OFFERS = '/data/admin/get-offers.php';

    static ALL_CATEGORIES_FOR_PRODUCT = '/data/admin/get-all-categories-for-product.php';

    // CREATE CUSTOMER ORDER AND B2B END

    //  VIEW ORDER FETCHES START

    static GET_ORDERS = '/data/admin/get-orders.php';

    static GET_ORDER_DETAILS = '/data/admin/get-order-details.php';

    static PROCESS_ORDER_URL = "/data/admin/process-order.php";

    static SEARCH_ORDERS_URL = "/data/admin/search-orders.php";

    static GET_DEL_PERSON_LIST_URL = "/data/admin/get-delivery-person-list.php";

    static FETCH_DEL_PERSON_TRACK_STATUS_URL = "/data/admin/fetch-del-person-current-status.php";

    static GET_ORDER_LOGS_URL = "/data/admin/get-order-logs.php";

    static GENERATE_INVOICE_URL = "/data/admin/generate-invoice.php";

    static GET_PURCHASE_ORDERS_URL = "/data/admin/get-purchase-orders.php";

    //  VIEW ORDER FETCHES END


}
export default Global;

