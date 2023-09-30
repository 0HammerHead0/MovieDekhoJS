import { logoutMixin } from './logout.js';
const  admin_dash= Vue.component('admin-dash',{
    mixins: [logoutMixin],
    template:`
    <div>
        <link href="../static/style/admin_dash.css" rel="stylesheet">
        <nav class="navbar navbar-dark bg-dark fixed-top">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Admin's Dashboard</a>
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
                            <router-link class="nav-link" :to="{ name: 'user_dash', params: { username: 'admin' } }">User Dashboard</router-link>
                        </li>
                        <li class="nav-item">
                            <a @click="logout" class="nav-link">Logout</a>
                        </li>
                    </ul>
                    </div>
                </div>
            </div>
        </nav>
        <div class="venues" style="margin-top: 5%">
            <div v-if="venues">
                <div v-for="(venue, index) in venues" :key="index">
                    <div class="venue-body" :style="{ marginBottom: index == venues.length - 1 ? '4%' : '0%' }">
                        <div style="display: flex; flex-direction: row;">
                            <h1 :style="{ marginLeft: '2%', marginTop: '10px', color: venue.name ? 'rgb(178, 214, 209)' : 'rgb(178, 214, 209)', flex: 1, opacity: venue.name ? 1 : 0.7 }">
                                {{ venue.name ? venue.name : 'No Venue name' }}
                            </h1>
                            <router-link :to="{ name: 'create_show', params: { venue_id: venue.ID } }" style="flex: 1">
                            <img
                                src="/static/images/plus.png"
                                class="button"
                                style="margin-top: 8%; margin-left: 30%; background-color: transparent;"
                            />
                            </router-link>
                            <router-link :to="{ name: 'edit_venue', params: { venue_id: venue.ID } }" class="btn btn-primary button" style="flex: 1; margin: 1%; margin-top: 1.5%; max-width: 70%; background-color: #125662; border-color: transparent;">
                                Edit
                            </router-link>
                            <button @click="deleteVenue(venue.ID)"
                                    class="btn btn-primary button"
                                    style="flex: 1; margin: 1%; margin-top: 1.5%; max-width: 70%; background-color: #125662; border-color: transparent;">
                                Delete
                            </button>
                            <button @click="exportCSV(venue.ID)"
                                    class="btn btn-primary button"
                                    style="flex: 1; margin: 1%; margin-top: 1.5%; max-width: 70%; background-color: #125662; border-color: transparent;">
                                Get CSV
                            </button>
                        </div>
                        <p style="color: rgb(159, 190, 186); margin-left: 2%; font-size: large" >
                            Venue ID: {{ venue.ID }} &emsp;
                            <span v-if="venue.place">Place: {{ venue.place }}</span>
                        </p>
                        <div class="movies">
                            <div v-if="showslist[index]">
                                <div v-for="show in showslist[index]" :key="show.ID" class="card" style="border-radius: 22px;">
                                    <div class="card-body">
                                        <h5 class="card-title" :style="{ opacity: show.name ? 1 : 0.6 }">
                                            {{ show.name ? show.name : 'No show name' }}
                                        </h5>
                                        <p class="card-text" style="line-height: 1.5;">
                                            Show ID: {{ show.ID }} <br>
                                            Rating: {{ show.rating }} <br>
                                            Tags: {{ show.tags ? show.tags : 'none' }} <br>
                                            Price: {{ show.price }} <br>
                                            Time: {{ show.start_time }} - {{ show.end_time }} <br>
                                        </p>
                                        <div style="display: flex; flex-wrap: wrap;">
                                            <router-link :to="{ name: 'edit_show', params: { show_id: show.ID, venue_id: venue.ID } }"
                                                        class="btn btn-primary button"
                                                        style="background-color: #176a78; border-color: transparent; flex: 1; margin: 3px;">
                                                Edit
                                            </router-link>
                                            <button @click="deleteShow(show.ID)"
                                            class="btn btn-primary button"
                                            style="background-color: #176a78; border-color: transparent; flex: 1; margin: 3px">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p v-else style="color: rgb(159, 190, 186); margin-left: 3%; font-size: large;">No shows yet</p>
                        </div>
                    </div>
                </div>
            </div>
            <p v-else style="color: rgb(159, 190, 186); margin-left: 4%; font-size: x-large; font-weight: 800;">No Venues yet</p>
        </div>

        <footer>
            <nav class="navbar navbar-dark bg-transparent fixed-bottom">
            <div class="container-fluid">
                <a class="navbar-brand">
                <router-link to="/create-venue">
                    <!-- <button type="button" class="btn btn-primary btn-circle" style="border-radius: 50%;"> -->
                    <img src="/static/images/plus.png" class="button" style="margin:auto; margin-bottom:50%;width:40px">
                    <!-- </button> -->
                </router-link>
                </a>
            </div>
            </nav>
        </footer>
    </div>
    `
    ,data: function(){
        return{
            username:'',
            venues:[],
            showslist: [] ,
            token: localStorage.getItem('access_token'),
            role: localStorage.getItem('role'),
            
        }
    },
    methods:{
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
                    console.log(this.venues);
                    for (const venue of this.venues){
                        const showsResponse = await fetch(`http://127.0.0.1:8080/api/venue/show/${venue.ID}` , requestOptions);
                        if (!showsResponse.ok) {
                            throw new Error(`Network response for shows in venue ID ${venue.ID} was not ok`);
                        }
                        else{
                            const showsData = await showsResponse.json();
                            this.showslist.push(showsData);
                        }
                    }
                }
                else{
                    throw new Error('Network response for venues was not ok');}
            }catch (error) {
                console.log(error.message);
            }
        },
        async deleteVenue(venue_id) {
            const requestOptions = {
                method: "DELETE",
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                  },
            };
            try {
                const response = await fetch(`http://127.0.0.1:8080/api/venue/${venue_id}`, requestOptions);
                if (response.ok) {
                    this.getVenuesAndShows();
                    console.log('Venue deleted');
                } else {
                    const errorText = await response.text(); // Get error message from response
                    console.error('Venue deletion failed:', errorText);
                }
            } catch (error) {
                console.error('An error occurred while deleting the venue:', error.message);
            }
        },
        async deleteShow(show_id) {
            const requestOptions = {
                method: "DELETE",
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                  },
            };
            try {
                const response = await fetch(`http://127.0.0.1:8080/api/show/${show_id}`, requestOptions);
                if (response.ok) {
                    for (let i = 0; i < this.showslist.length; i++) {
                        const index = this.showslist[i].findIndex(show => show.ID === show_id);
                        if (index !== -1) {
                            this.showslist[i].splice(index, 1);
                            break
                        }
                    }
                    console.log('Venue deleted');
                } else {
                    const errorText = await response.text(); // Get error message from response
                    console.error('Venue deletion failed:', errorText);
                }
            } catch (error) {
                console.error('An error occurred while deleting the venue:', error.message);
            }
        },
        async exportCSV(venueID) {
            try {
                const requestOptions = {
                    method: "POST",
                    mode: 'cors',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json',
                    },
                };
                const response = await fetch(`http://127.0.0.1:8080/api/export-csv/${venueID}`, requestOptions);
                if (response.ok) {
                console.log('CSV export task initiated successfully');
                } else {
                const errorText = await response.text();
                console.error('CSV export task initiation failed:', errorText);
                }
            } catch (error) {
                console.error('An error occurred while initiating CSV export task:', error.message);
            }
        },
        
    },
    created(){
        console.log(this.token , this.role);
        this.getVenuesAndShows()
        .then(()=>{
            console.log(this.venues);
            console.log(this.showslist[0][0].ID);
        })
    },
    beforeRouteEnter(to, from, next) {
        const token = localStorage.getItem('access_token');
        if (!token) {
            next({ name: 'login' }); // Redirect to login if token is not present
        } else {
            try {
                const tokenPayloadBase64 = token.split('.')[1];
                const tokenPayload = JSON.parse(atob(tokenPayloadBase64));
                const role = tokenPayload.role; // Extract the role from the token payload
                
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                if (tokenPayload.exp < currentTimeInSeconds) {
                    console.error('Token has expired.');
                    next({ name: 'login' }); // Redirect to login if token is expired
                } else if (role === 'admin') {
                    next(); // Continue to load the component
                } else {
                    console.error('User is not authorized to access the admin dashboard.');
                    next({ name: 'login' }); // Redirect to login if user's role is not admin
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                next({ name: 'login' }); // Redirect to login if there's an error decoding the token
            }
        }
    }    
});

export default admin_dash