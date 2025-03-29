import AdminLogin from "./components/AdminLogin.js";
import Home from "./components/Home.js";
import CustomerLogin from "./components/CustomerLogin.js";
import ProfessionalLogin from "./components/ProfessionalLogin.js";
import AdminDashboard from "./components/AdminDashboard.js";
import Navbar from "./components/Navbar.js";
import CustomerRegister from "./components/CustomerRegister.js";
import ProfessionalRegister from "./components/ProfessionalRegister.js"
import AdminLogout from "./components/AdminLogout.js";
import AdminSearch from "./components/AdminSearch.js";
import AdminSummary from "./components/AdminSummary.js";
import CustomerDashboard from "./components/CustomerDashboard.js"
import CustomerSearch from "./components/CustomerSearch.js"
import CustomerProfileEdit from "./components/CustomerProfileEdit.js"
import AddService from "./components/AddService.js"
import EditService from "./components/EditService.js"
import ProfessionalDashboard from "./components/ProfessionalDashboard.js";
import ProfessionalSeach from "./components/ProfessionalSearch.js";
import ProfessionalProfile from "./components/ProfessionalProfile.js";
import ServiceClose from "./components/ServiceClose.js";
import CustomerSummary from "./components/CustomerSummary.js";
import ProfessionalSummary from "./components/ProfessionalSummary.js";
import ServiceDetails from "./components/ServiceDetails.js";
import ProfessionalDetails from "./components/ProfessionalDetails.js";
import CustomerDetails from "./components/CustomerDetails.js";


const routes = [
    { path: "/", component: Home },
    { path: "/adminlogin", component: AdminLogin},
    { path: "/customerlogin", component: CustomerLogin},
    { path: "/professionallogin", component: ProfessionalLogin},
    { path: "/admin/dashboard", component: AdminDashboard},
    { path: "/customer/signup", component: CustomerRegister},
    { path: "/professional/register", component: ProfessionalRegister},
    { path: "/admin/logout", component: AdminLogout},
    { path: "/admin/search", component: AdminSearch},
    { path: "/admin/summary", component: AdminSummary},
    { path: "/customer/dashboard", component: CustomerDashboard},
    { path: "/customer/search", component: CustomerSearch},
    { path: "/customer/profile/edit", component: CustomerProfileEdit},
    { path: "/admin/services/newservice", component: AddService},
    { path: "/admin/services/edit/:id", component: EditService},
    { path: "/professional/dashboard", component: ProfessionalDashboard},
    { path: "/professional/search", component: ProfessionalSeach},
    { path: "/professional/profile", component: ProfessionalProfile},
    { path: "/customer/service/close/:id", component: ServiceClose},
    { path: "/customer/summary", component: CustomerSummary},
    { path: "/professional/summary", component: ProfessionalSummary},
    { path: "/admin/service/details/:id", component: ServiceDetails},
    { path: "/admin/professional/details/:id", component: ProfessionalDetails},
    { path: "/admin/customer/details/:id", component: CustomerDetails}


];

const router = new VueRouter({
    mode: "history",
    routes,
});

const app = {
    template: `
      <div>
        <router-view></router-view>
      </div>
    `,
    components: {
        Navbar,
    },
};

Vue.use(VueRouter);

new Vue({
    el: "#app",
    router,
    render: (h) => h(app),
});

