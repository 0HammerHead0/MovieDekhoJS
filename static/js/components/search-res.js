import { logoutMixin } from './logout.js';
const search_res=Vue.component('search-res',{
    mixins: [logoutMixin],
    beforeRouteEnter(to, from, next) {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('role');
    
        if (!token) {
            next({ name: 'login' });
        }else {
            try {
                const tokenPayloadBase64 = token.split('.')[1];
                const tokenPayload = JSON.parse(atob(tokenPayloadBase64));
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    
                if (tokenPayload.exp < currentTimeInSeconds) {
                    console.error('Token has expired.');
                    next({ name: 'login' }); 
                } else if (tokenPayload.sub === to.params.username) {
                    if (role === 'user' || role === 'admin') {
                        next();
                    }
                } else {
                    console.error('Token username does not match the expected username.');
                    next({ name: 'login' });
                }
            }catch (error) {
                console.error('Error decoding token:', error);
                next({ name: 'login' });
            }
        }
    },
    template:`
    <div>
        <link href="../static/style/search_res.css" rel="stylesheet">
        <nav class="navbar navbar-dark bg-dark fixed-top">
            <div class="container-fluid">
                <router-link :to="{ name: 'user_dash', params: { username: username } }" class="navbar-brand">
                    <a class="navbar-brand" >{{ user.name }}'s Dashboard</a>
                </router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel">Menu</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-end flex-grow-1 pe-3 " style="font-size:large;">
                            <li class="nav-item">
                                <router-link :to="{ name: 'user_dash' , params: { username: username}}" class="nav-link">Home</router-link>
                            </li>
                            <li class="nav-item">
                            <router-link class="nav-link" :to="{name:'bookings' , params:{username:username}} " >Bookings</router-link>
                            </li>
                            <li class="nav-item">
                                <a @click="logout" class="nav-link">Logout</a>
                            </li>
                            <hr>
                            <li style="opacity:0.5;font-weight: 500;">
                                Search
                            </li>
                        </ul>
                        <form @submit.prevent="submitForm" method="POST" style="margin-top:25px"role="search">
                            <select v-if="venues" v-model="venueID_new" class="me-2" style="border-radius:8px; height: 40px; width:100%;margin-bottom:25px;">
                                <option value="0" selected>Select location</option>
                                <option v-for="venue in venues" :key="venue.ID" :value="venue.ID">
                                    {{venue.place}}
                                </option>
                            </select>
                            <input v-model="tag_name_new" class="form-control me-2" type="search" placeholder="tag/name" aria-label="Search"><br>
                            <input v-model="rating_new" class="form-control me-2" type="search" placeholder="any rating > ? " aria-label="Search"><br>
                            <p style="opacity:0.7;font-weight: 500;">Available time:</p>
                            <div style="display:flex;">
                                <input v-model="start_time_new" class="form-control" type="time" style="flex:1;margin:2px"> _ 
                                <input v-model="end_time_new" class="form-control" type="time" style="flex:1;margin:2px;">
                            </div><br>
                            <button class="btn btn-outline-success search-button" type="submit" >Search</button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
        <div v-if="shows">
            <h4  style="margin-left:2%; margin-top:7%; color: rgb(255, 255, 255); font-family: 'Poppins', sans-serif;font-weight: bolder;font-size: xx-large;text-shadow: 2px 2px 5px rgb(9, 29, 22); ">
                Results -
            </h4>
            <div class="venue-body">
                <div v-for="show in shows" class="card">
                    <div class="card-img">
                        <img :src="show.img" class="card-img-top" alt="...">
                    </div>
                    <div class="card-body">
                        <h5 v-if="show.name" class="card-title">{{show.name}}</h5>
                        <h5 v-else class="card-title" style="opacity:0.7">No Show name</h5>
                        <div style="display: flex; flex-wrap:wrap;">
                            <p class="card-text" style="flex:1">Date: {{show.date}}</p>
                            <p class="card-text" style="flex:1">Time:{{show.start_time}}-{{show.end_time}}</p>
                        </div>
                        <div style="display: flex; flex-wrap:wrap;">
                            <p v-if="show.user_rating" class="card-text" style="flex:1">UserRating: {{show.user_rating}}</p>
                            <p v-else class="card-text" style="flex:1;opacity: 0.7;">No users rated</p>
                            <p v-if="show.rating" class="card-text" style="flex:1">AdminRating: {{show.rating}}</p>
                            <p v-else class="card-text" style="flex:1 ;opacity:0.7">Rated 0 by Admin</p>
                        </div>
                        <div style="display: flex; flex-wrap:wrap;">
                            <p class="card-text" style="flex:1">Tags: {{show.tags}}</p>
                        </div>
                        <div v-if="show.tot_cap > 0">
                            <button
                                v-if="show.rem_cap > 0"
                                class="btn btn-primary boton"
                                style="margin-top: 3%; font-size: large">
                                <router-link 
                                :to="{ name: 'book', params: { showID: show.ID, username: username} }" style="color:white;text-decoration: none;">
                                    Book
                                </router-link>
                            </button>
                            <button
                                v-else
                                type="button"
                                class="btn btn-lg btn-primary"
                                style="background-color: #1a3f36; border-color: transparent; margin-top: 3%; font-size: large"
                                disabled
                            >
                                Housefull
                            </button>
                        </div >
                        <button
                            v-else
                            type="button"
                            class="btn btn-lg btn-primary"
                            style="background-color: #1a3f36; border-color: transparent; margin-top: 3%; font-size: large"
                            disabled
                            >
                            No Seats
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <h1 style="margin-left:2%;margin-top:5%; margin-bottom:5%;color: rgb(178, 214, 209); opacity:0.7">No matching shows!</h1>
        </div>
    </div>
    `
    ,data: function(){
        return{
            username:'',
            user:[],
            shows:[],
            venues:[],
            tag_name:'',
            venueID:'',
            start_time:'',
            end_time:'',
            rating:'',
            tag_name_new:'',
            venueID_new:'',
            start_time_new:'',
            end_time_new:'',
            rating_new:'',
            token: localStorage.getItem('access_token'),
            role : localStorage.getItem('role'),
        }
    },
    methods:{
        async get_user_info(){
            this.tag_name=this.$route.params.tag_name;
            this.venueID = this.$route.params.venueID;
            this.rating= this.$route.params.rating;
            this.start_time = this.$route.params.start_time;
            this.end_time = this.$route.params.end_time;
            this.username = this.$route.params.username;
            const url='http://127.0.0.1:8080/api/user/'+ this.username.toString();
            const requestOptions = {
                method: "GET",
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            }
            try{
                const response = await fetch(url, requestOptions)
                if(response.ok){
                    this.user =  await response.json();
                }
                else{
                    throw new Error('Network response was not ok');}
                }
            catch(error) {
                console.log(error.message);
            }
        },
        async get_venues_info(){
            const requestOptions = {
                method: "GET",
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            }
            const Response = await fetch(`http://127.0.0.1:8080/api/venue/all` , requestOptions);
            if (!Response.ok) {
                throw new Error(`Network response venue  was not ok`);}
            else{
                const Data = await Response.json();
                this.venues = Data;
            }
        },
        async fetchData(){
            const url = `http://127.0.0.1:8080/api/search?venueID=${this.venueID}&tag_name=${this.tag_name}&rating=${this.rating}&start_time=${this.start_time}&end_time=${this.end_time}`;
            
            const requestOptions = {
                method : "GET",
                mode : "cors" , 
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
            };
            try{
                const response = await fetch(url, requestOptions)
                if(response.ok){
                    this.shows =  await response.json();
                }
                else{
                    throw new Error('Network response was not ok');}
                }
            catch(error) {
                console.log(error.message);
            }
        },
        submitForm(){
            console.log("Form submitted!");
            console.log(this.venueID_new,this.tag_name_new,this.rating_new,this.start_time_new,this.end_time_new);
            this.$router.push({ name: 'search_res', params: { venueID:this.venueID_new , tag_name:this.tag_name_new , rating:Number(this.rating_new), start_time:this.start_time_new , end_time:this.end_time_new } });
        }
    },
    created(){
        this.get_user_info()
        .then(()=>{
            this.get_venues_info()
            .then(()=>{
                this.fetchData()

            })
        })
    },
});

export default search_res