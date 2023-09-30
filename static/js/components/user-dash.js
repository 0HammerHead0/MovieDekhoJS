import { logoutMixin } from './logout.js';
const user_dash =  Vue.component ('user-dash',{
    mixins: [logoutMixin],
    template: `
    <div>
        <link href="../static/style/dash.css" rel="stylesheet">
        <nav class="navbar navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand"> {{user.name}}'s Dashboard</a>
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
                    <router-link class="nav-link" :to="{name:'bookings' , params:{username:username}} " >Bookings</router-link>
                </li>
                <li v-if="role == 'admin' " class="nav-item">
                    <router-link class="nav-link" :to="{ name: 'admin_dash', params: { username: 'admin' } }">Admin Dashboard</router-link>
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
                    <select v-if="venues" v-model="venueID" class="me-2" style="border-radius:8px; height: 40px; width:100%;margin-bottom:25px;">
                        <option value="0" selected>Select location</option>
                        <option v-for="venue in venues" :key="venue.ID" :value="venue.ID">
                            {{venue.place}}
                        </option>
                    </select>
                    <input v-model="tag_name" class="form-control me-2" type="search" placeholder="tag/name" aria-label="Search"><br>
                    <input v-model="rating" class="form-control me-2" type="search" placeholder="any rating > ? " aria-label="Search"><br>
                    <p style="opacity:0.7;font-weight: 500;">Available time:</p>
                    <div style="display:flex;">
                        <input v-model="start_time" class="form-control" type="time" style="flex:1;margin:2px"> _ 
                        <input v-model="end_time" class="form-control" type="time" style="flex:1;margin:2px;">
                    </div><br>
                    <button class="btn btn-outline-success search-button" type="submit" >Search</button>
                </form>
            </div>
            </div>           

        </div>
    </nav>
    <h4 style="margin-left:2%; margin-top:7%; color: rgb(255, 255, 255); font-family: 'Poppins', sans-serif;font-weight: bolder;font-size: xx-large;text-shadow: 2px 2px 5px rgb(9, 29, 22); ">
        Top 5 Rated Movies by our Users -
    </h4>
    <div class="slider container-fluid" id="revel" autoplay>
        <input type="radio" name="testimonial" id="t-1">
        <input type="radio" name="testimonial" id="t-2">
        <input type="radio" name="testimonial" id="t-3" checked>
        <input type="radio" name="testimonial" id="t-4">
        <input type="radio" name="testimonial" id="t-5">
        <div class="testimonials">
            <label class="item" for="t-1">
                <img :src="img0" class="d-block w-100" alt="...">
            </label>
            <label class="item" for="t-2">
                <img :src="img1" class="d-block w-100" alt="...">
            </label>
            <label class="item" for="t-3">
                <img :src="img2" class="d-block w-100" alt="...">
            </label>
            <label class="item" for="t-4">
                <img :src="img3" class="d-block w-100" alt="...">
            </label>
            <label class="item" for="t-5">
                <img :src="img4" class="d-block w-100" alt="...">
            </label>
            
        </div>
        <div class="dots">
            <label for="t-1"></label>
            <label for="t-2"></label>
            <label for="t-3"></label>
            <label for="t-4"></label>
            <label for="t-5"></label>
        </div>
    </div>         

    <div class="venues">
        <h4 style="margin-left:2%;margin-top:1%;margin-bottom:0;color: rgb(255, 255, 255); font-family: 'Poppins', sans-serif;font-weight: bolder;font-size: xx-large;text-shadow: 2px 2px 5px rgb(9, 29, 22); ">
        Available Shows -
        </h4>
        <div v-if="venues" v-for="venue in venues" :key="venue.ID" class="venue-body">
        <h1 
            v-if="venue.name"
            style="margin-left:2%; margin-top:2%; color: rgb(178, 214, 209);text-shadow: 2px 2px 5px rgb(0, 0, 0)">
            {{venue.name}}
        </h1>
        <h1 
            v-else 
            style="margin-left:2%; margin-top:2%; color: rgb(178, 214, 209);text-shadow: 2px 2px 5px rgb(0, 0, 0);opacity: 0.7;">
            No Venue name
        </h1>
        <div style="display:flex;flex-wrap: wrap;text-shadow: 1px 1px 2px rgb(0, 0, 0)">
        <h5 style="margin-left:2%; margin-bottom:0;color: rgb(178, 214, 209); flex:1">VenueID: {{venue.ID}}</h5>
        <h5 style="color:rgb(159, 190, 186); margin-left:2%;flex:1">Location: {{venue.place}}</h5>
        </div>
        <div class="movies">
            <div v-if="venue.shows" v-for="show in venue.shows" :key="show.ID" class="card">
                <div class="card-img">
                <img :src="show.img" class="card-img-top" alt="...">
                </div>
                <div class="card-body">
                    <h5 class="card-title" v-if="show.name">{{show.name}}</h5>
                    <h5 class="card-title" v-else style="opacity:0.7" >No Show name</h5>
                    <div style="display: flex; flex-wrap:wrap;">
                        <p class="card-text" style="flex:1">Date: {{show.date}}</p>
                        <p class="card-text" style="flex:1">Time: {{show.start_time}}-{{show.end_time}}</p>
                    </div>
                    <div style="display: flex; flex-wrap:wrap;">
                        <p class="card-text" style="flex: 1" v-if="show.user_rating">UserRating: {{ show.user_rating }}</p>
                        <p class="card-text" style="flex: 1; opacity: 0.7;" v-else>No users rated</p>
                        <p class="card-text" style="flex: 1" v-if="show.rating">AdminRating: {{ show.rating }}</p>
                        <p class="card-text" style="flex: 1; opacity: 0.7" v-else>Rated 0 by Admin</p>
                    </div>
                    <div style="display: flex; flex-wrap:wrap;">
                        <p class="card-text" style="flex:1">Tags: {{show.tags}}</p>
                    </div>
                    <div v-if="show.tot_cap > 0">
                        <button
                            v-if="show.rem_cap > 0"
                            class="btn btn-primary boton"
                            style="margin-top: 3%; font-size: large"
                        >
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
                    </div>
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
            <p v-else style="color:rgb(159, 190, 186); margin-left:3%; font-size: large;">No shows yet</p>
        </div>
        </div>
        <p v-else style="color:rgb(159, 190, 186); margin-left:4%; font-size:x-large;  font-weight: 800;">No Venues yet</p>
        </div>
    </div>
    `,
    data: function(){
        return{
            username:'',
            user:[],
            venues:[],
            shows:[],
            img0:'',
            img1:'',
            img2:'',
            img3:'',
            img4:'',
            venueID:0,
            start_time:'',
            end_time:"",
            rating:'',
            tag_name:'',
            token: localStorage.getItem('access_token'),
            role: localStorage.getItem('role'),
        }
    },
    methods:{
        async get_user_info(){
            this.username = this.$route.params.username;
            const url='http://127.0.0.1:8080/api/user/'+ this.username.toString();
            const requestOptions = {
                method: "GET",
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                  },
            };
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
        async getVenuesAndShows() {
            const requestOptions = {
                method: "GET",
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                  },
            };
            try {
                const venuesResponse = await fetch('http://127.0.0.1:8080/api/venue/all' , requestOptions);
                if (venuesResponse.ok) {
                    this.venues = await venuesResponse.json();
                    for (const venue of this.venues){
                        const showsResponse = await fetch(`http://127.0.0.1:8080/api/venue/show/${venue.ID}` , requestOptions);
                        if (!showsResponse.ok) {
                            if (showsResponse.status === 404) {
                                venue.shows = [];}
                            else{
                                throw new Error(`Network response for shows in venue ID ${venue.ID} was not ok`);}
                        }
                        else{
                            const showsData = await showsResponse.json();
                            venue.shows = showsData;
                        }
                    }
                }
                else{
                    throw new Error('Network response for venues was not ok');}
                try{
                    const top5showsResponse = await fetch('http://127.0.0.1:8080/api/show/all' , requestOptions);
                    if (top5showsResponse.ok) {
                        const shows = await top5showsResponse.json();
                        console.log(shows)
                        const sortedShows = shows.sort((a, b) => b.user_rating - a.user_rating);
                        const top5Shows = sortedShows.slice(0, 5);
                        const imageUrls = top5Shows.map(show => show.img.toString());
                        while (imageUrls.length < 5) {
                            imageUrls.push("https://media.istockphoto.com/id/915697084/photo/concept-of-reserved-seats.jpg?b=1&s=170667a&w=0&k=20&c=TxTJtGan1OAnc_7LfKoUM_OyDiKzZQqyMCfSGM2M8UE=");
                        }
                        this.img0 = imageUrls[0];
                        this.img1 = imageUrls[1];
                        this.img2 = imageUrls[2];
                        this.img3 = imageUrls[3];
                        this.img4 = imageUrls[4];
                        console.log(imageUrls)
                    }
                    else{
                        throw new Error('Network response for shows was not ok');}
                    }catch(error){
                        console.log(error.message)
                    }
            }catch (error) {
                console.log(error.message);
            }
        },
        book(showId) {
            this.$router.push({ name: 'book', params: { showId } });
        },
        submitForm(){
            console.log("Form submitted!");
            console.log(this.venueID , this.tag_name , this.rating, this.start_time , this.end_time)
            this.$router.push({ name: 'search_res', params: { venueID:this.venueID , tag_name:this.tag_name , rating:Number(this.rating), start_time:this.start_time , end_time:this.end_time } });
        },
    },
    created(){
        // console.log(this.token , this.role)
        this.get_user_info()
        this.getVenuesAndShows()
        .then(()=>{
            console.log(this.venues)
        })
    },
    beforeRouteEnter(to, from, next) {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('role');
        console.log(token , role)
        if (!token) {
            next({ name: 'login' });
        } else {
            try {
                const tokenPayloadBase64 = token.split('.')[1];
                const tokenPayload = JSON.parse(atob(tokenPayloadBase64));
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                console.log('Token sub:', tokenPayload.sub); // Add this line
                console.log('Route username:', to.params.username); 
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
            } catch (error) {
                console.error('Error decoding token:', error);
                next({ name: 'login' });
            }
        }
    }

});

export default user_dash