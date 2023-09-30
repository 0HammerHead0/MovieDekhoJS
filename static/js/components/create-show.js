import { logoutMixin } from './logout.js';
const create_show = Vue.component('create-show', {
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
            <router-link :to="{ name: 'admin_dash' }" class="navbar-brand">Admin's Dashboard</router-link>
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
        <div class="head">
        <h1 class="title"><strong>Create show for venue-</strong>[{{ venue.name }}]-</h1>
        </div>
        <div class="body_ container-fluid" style="justify-content: right; margin-top: 10%">
        <form @submit.prevent="saveForm">
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Show name:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="name" id="inputPassword6" class="form-control">
                </div>
            </div>
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500;">Rating:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="rating" id="inputPassword6" class="form-control" type="number">
                </div>
            </div>
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500;">Start time:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="start_time" id="inputPassword6" class="form-control"  type="time">
                </div>
            </div> 
            <!-- (XXam/pm-XXam/pm) -->
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">End time:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="end_time" id="inputPassword6" class="form-control" type="time">
                </div>
            </div>
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label"  style="font-size:25px;font-weight: 500; ">Date:</label>
                </div>
                <!-- YYYY-MM-DD -->
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="date" id="inputPassword6" class="form-control"type="date">
                </div>
            </div>        
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Tags:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="tags" id="inputPassword6" class="form-control">
                </div>
            </div>   
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Price:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="price" id="inputPassword6" class="form-control" type="number">
                </div>
            </div>
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Capacity:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="capacity" id="inputPassword6" class="form-control"type="number">
                </div>
                <div class="col-4 ">
                    Available seats: {{availableSeats}}
                </div>
            </div>
            <div class="row g-2 align-items-center">
                <div class="col-4 text-end">
                    <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Thumbnail Link:</label>
                </div>
                <div class="col-4 d-flex justify-content-center">
                    <input v-model="img" id="inputPassword6" class="form-control">
                </div> 
            </div>
            <div style="text-align: center; margin-top: 2%;">
                <button type="submit" class="btn btn-primary btn-lg button">Save</button>
            </div>
        </form>
        </div>
    </div>
    `,
    data: function () {
        return {
            venue_id:'',
            venue: {},
            name: '',
            location: '',
            capacity: '',
            rating: '',
            start_time: '',
            end_time: '',
            date: '',
            tags: '',
            price: '',
            img: '',
            show:{},
            availableSeats: 0,
            token: localStorage.getItem('access_token'),
            role: localStorage.getItem('role'),
        }
    },
    methods: {
        async availSeats(){
            const url = "http://127.0.0.1:8080/api/venue/show/"+this.venue_id;
            const requestOptions = {
                method: "GET",
                mode: "cors",
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                  },
            };
            var data=null;
            try{
                const response = await fetch(url, requestOptions);
                data = await response.json();
            }
            catch(error){
                console.error(error.message);
            }
            var sum = 0;
            if(data!=null){
                for(var i = 0; i < data.length; i++){
                    sum+=data[i].tot_cap;
                }
            }
            return this.venue.capacity-sum;
        },
        async saveForm() {
            if(this.name!=""){
                this.show.name=this.name;
            }
            if(this.rating!=""){
                this.show.rating=Number(this.rating);
            }
            if(this.tags!=""){
                this.show.tags=this.tags;
            }
            if(this.price!=""){
                this.show.price=Number(this.price);
            }
            if(this.start_time!=""){
                this.show.start_time=this.start_time;
            }
            if(this.end_time!=""){
                this.show.end_time=this.end_time;
            }
            if(this.date!=""){
                this.show.date=this.date;
            }
            this.show.VID=Number(this.venue_id);
            this.show.rated=0;
            this.show.user_rating=0;
            if(this.capacity!=""){
                this.show.rem_cap=Number(this.capacity);
                this.show.tot_cap=Number(this.capacity);
            }
            if(this.img!=""){
                this.show.img=this.img;
            }
            if(this.capacity>this.availableSeats){
                alert("Not enough seats available");
                return;
            }
            console.log(this.show);
            const url = "http://127.0.0.1:8080/api/show";
            const requestOptions = {
              method: "POST",
              mode: "cors",
              headers: {
                  'Authorization': `Bearer ${this.token}`,
                  'Content-Type': 'application/json',
                },
              body: JSON.stringify(this.show), // Use this.show instead of show
            };
            console.log(this.show);
          
            try {
              const response = await fetch(url, requestOptions);
              if (response.ok) {
                this.$router.push({ name: 'admin_dash' });
              } else {
                throw new Error('Network response was not ok');
              }
            } catch (error) {
              console.log(error.message);
            }
            console.log(this.show);
          },
        async get_venue_info(){
            const url="http://127.0.0.1:8080/api/venue/" + this.venue_id;
            const requestOptions = {
              method:"GET",
              mode:"cors",
              
              headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
              },
            }
            try{
              const response = await fetch(url,requestOptions);
              if(response.ok){
                this.venue = await response.json();
              }
              else{
                throw new Error('Network response was not ok');}
            }
            catch(error){
                console.log(error.message)
            }
            this.availableSeats = await this.availSeats();
        },
    },
    created: function () {
        this.venue_id = this.$route.params.venue_id;
        this.get_venue_info()
    }
})

export default create_show;
