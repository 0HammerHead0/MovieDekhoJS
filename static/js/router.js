import user_login from "./components/user-login.js";
import user_register from "./components/user-register.js";
import user_dash from "./components/user-dash.js"
import bookings from "./components/bookings.js";
import book from "./components/book.js";
import search_res from "./components/search-res.js";
import admin_dash from "./components/admin-dash.js";
import create_venue from "./components/create-venue.js";
import create_show from "./components/create-show.js";
import edit_show from "./components/edit-show.js";
import edit_venue from "./components/edit-venue.js";

const routes = [
    {
        path:'*',
        redirect:'/login'

    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path:"/login",
        name:"login",
        component : user_login
    },
    {
        path:"/user-register",
        name:"user_register",
        component : user_register
    },
    {
        path:"/user-dash/:username",
        name:'user_dash',
        component:user_dash
    },
    {
        path:"/bookings/:username",
        name:"bookings",
        component:bookings
    },
    {
        path:"/user-dash/:username/book/:showID",
        name:"book",
        component:book
    },
    {
        path: "/search-res/:username/:venueID/:tag_name/:rating/:start_time/:end_time",
        name: "search_res",
        component: search_res
    },
    {
        path:"/admin-dash",
        name:"admin_dash",
        component:admin_dash
    },
    {
        path:"/create-venue",
        name:"create_venue",
        component:create_venue
    },
    {
        path:"/create-show/:venue_id",
        name:"create_show",
        component:create_show
    },
    {
        path:"/edit-show/:venue_id/:show_id",
        name:"edit_show",
        component:edit_show
    },
    {
        path:"/edit-venue/:venue_id",
        name:"edit_venue",
        component:edit_venue
    }
]
const router = new VueRouter({
    routes
});
export default router;
