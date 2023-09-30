import { logoutMixin } from './logout.js';
const create_venue = Vue.component('create-venue', {
    mixins: [logoutMixin],
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
    },
    template: `
    <div>
        <link href="../static/style/book.css" rel="stylesheet">
        <nav class="navbar navbar-dark bg-dark fixed-top">
            <div class="container-fluid">
                <router-link class="navbar-brand" :to="{ name: 'admin_dash' }">Admin's Dashboard</router-link>
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
                                <router-link class="nav-link" :to="{name:'summary'}">Summary</router-link>
                            </li>
                            <li class="nav-item">
                                <a @click="logout" class="nav-link">Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
        <div class=" head">
            <h1 class="title"><strong>Create venue</strong></h1>
        </div>
        <div class="body_ container-fluid " style="justify-content: right;">
            <form style="margin-top:10%" @submit.prevent="submitForm">
                <div class="row g-2 align-items-center">
                    <div class="col-4 text-end">
                        <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Venue name:</label>
                    </div>
                    <div class="col-4 d-flex justify-content-center">
                        <input v-model="name" id="inputPassword6" class="form-control" >
                    </div>
                </div>
                <div class="row g-2 align-items-center">
                    <div class="col-4 text-end">
                        <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Location:</label>
                    </div>
                    <div class="col-4 d-flex justify-content-center">
                        <input v-model="location"id="inputPassword6" class="form-control" >
                    </div>
                </div>
                <div class="row g-2 align-items-center">
                    <div class="col-4 text-end">
                        <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500;">Capacity:</label>
                    </div>
                    <div class="col-4 d-flex justify-content-center">
                        <input v-model="capacity" id="inputPassword6" class="form-control" type="number" >
                    </div>
                </div> 
                <div style="text-align: center;margin-top:2%">
                    <button type="submit" class="btn btn-primary btn-lg button">Save</button>
                </div> 
            </form>
        </div>
    </div>
    `,
    data: function () {
        return {
            name: '',
            location: '',
            capacity: '',
            token: localStorage.getItem('access_token'),
            role: localStorage.getItem('role'),
        }
    },
    methods: {
        async submitForm(){
            const venueData = {
                name: this.name,
                place: this.location,
                capacity: this.capacity
            };
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                  },
                body: JSON.stringify(venueData)
            };
    
            try {
            const response = await fetch('http://127.0.0.1:8080/api/venue', requestOptions);
            if (response.ok) {
                console.log('Venue created:', venueData);
                this.$router.push({ name: 'admin_dash' });
            } else {
                console.error('Venue creation failed:', response.statusText);
            }
            }catch (error) {
                console.error('An error occurred while creating the venue:', error);
            }
        }
    },
})

export default create_venue;
