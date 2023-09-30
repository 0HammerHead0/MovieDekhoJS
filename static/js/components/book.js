
import { logoutMixin } from './logout.js';
const book=Vue.component('book',{
    mixins: [logoutMixin],
    template:`
      <div>
        <link href="../static/style/book.css" rel="stylesheet">
        <nav class="navbar navbar-dark bg-dark fixed-top ">
            <div class="container-fluid">
            <a class="navbar-brand" href="#">{{user.name}}'s Dashboard</a>
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
                            <router-link :to="{ name: 'user_dash', params: { username: username } }" class="navbar-brand">
                                <a class="nav-link" >Home</a>
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link :to="{ name: 'bookings', params: { username: username} }" class="navbar-brand">
                                <a class="nav-link">Bookings</a>
                            </router-link>
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
            <h1 class="title"><span></span><strong>Booking-></strong>  Venue: {{venue.name}}-> Show: {{show.name}}</h1> <h2 class="time"><strong>Time:</strong> {{show.start_time}} - {{show.end_time}}</h2>
        </div>
        <div class="seat_select container-fluid">
            <h3 style="margin-left: 20%;">Available seats: {{show.rem_cap}}</h3>
            <form>
                <div class="form-input">
                    <div class="row g-2 align-items-center" style="justify-content: right; margin-right: 30%">
                        <div class="col-4 text-end">
                        <label for="inputPassword6" class="col-form-label " style="font-size:25px;font-weight: 500; " >Number of Tickets:</label>
                        </div>
                        <div class="col-8" style="width:50%; ">
                        <input id="inputPassword6" name="number" class="form-control" aria-describedby="passwordHelpInline" v-model="ticket_count">
                        </div>
                    </div>
                    <div class="row g-2 align-items-center" style="justify-content: right; margin-right: 30%">
                        <div class="col-4 text-end">
                            <label for="inputPassword6" class="col-form-label" style="font-size:25px;font-weight: 500; ">Price:</label>
                        </div>
                        <div class="col-8" style="width:50%; ">
                            <div id="inputPassword6" class="form-control">{{show.price}}</div>
                        </div>
                    </div>
                    <span v-if="show_rating_seat.seats>0" style="color: red; margin-left: 30%;">You have already booked {{show_rating_seat.seats}} tickets for this show. You are about to book more.</span>

                    <div v-if="ticket_count > 0" class="row g-2 align-items-center" style="justify-content: right; margin-right: 30%">
                        <div class="col-4 text-end">
                            <label class="col-form-label" style="font-size: 25px; font-weight: 500;">Total:</label>
                        </div>
                        <div class="col-8" style="width: 50%;">
                            <div class="form-control">{{ calculateTotal() }}</div>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <button v-if="ticket_count > 0" @click="book" class="btn btn-primary btn-lg" style="background-color: #2C3333; border-color: transparent; margin-top: 2%">
                            Book
                        </button>
                        <button v-else class="btn btn-primary btn-lg disabled" style="background-color: #2C3333; border-color: transparent; margin-top: 2%">
                            Enter count
                        </button>
                    </div>
                    <div>
                        {{error_message}}
                    </div>
                </div>
            </form>
        </div>
      </div>
      `
      ,data: function(){
        return{
            username:'',
            showID:'',
            user:[],
            show:[],
            show_rating_seat:[],
            venue:[],
            ticket_count:0,
            rem_cap:0,
            token: localStorage.getItem('access_token'),
            role: localStorage.getItem('role'),
            meth:"POST",
            list_show_rating_seat:[],
            error_message: '',
        }
      },
      methods:{
        calculateTotal() {
            return this.ticket_count * this.show.price;
        },        
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
        async get_venue_info(){
            const url="http://127.0.0.1:8080/api/venue/" + this.show.VID;
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
        },
        async get_show_info(){
            this.showID=this.$route.params.showID
            const url="http://127.0.0.1:8080/api/show/" + this.showID;
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
                this.show = await response.json();
              }
              else{
                throw new Error('Network response was not ok');}
            }
            catch(error){
                console.log(error.message)
            }
        },
        async get_show_rating_seat(){
            this.showID=this.$route.params.showID
            const url="http://127.0.0.1:8080/api/shows_ratings/sid/" +  this.showID;
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
                this.list_show_rating_seat=await response.json();
                console.log(this.list_show_rating_seat)
                if(response.ok){
                    for(const ele of this.list_show_rating_seat){
                        if(ele.users_id==this.user.ID){
                            this.show_rating_seat=ele;
                            this.meth="PUT"
                        }
                    }
                }
                else{
                    throw new Error('Network response was not ok');}
            }
            catch(error){
                console.log(error.message);
            }
        },
        async book(){
            var body_={
                "users_id":Number(this.user.ID),
                "shows_id":Number(this.show.ID),
                "seats":Number(this.ticket_count),
                "amount":Number(this.calculateTotal()),
            }
            const url="http://127.0.0.1:8080/api/"+this.username+"/book/"+this.show.ID;
            const requestOptions = {
                method:"POST",
                mode:"cors",
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body_),
            }
            console.log(JSON.stringify(body_))
            if(this.show.rem_cap<this.ticket_count){
                this.error_message="Not enough seats available"
            }
            try{
              const response = await fetch(url,requestOptions);
              if(response.ok){
                this.show_rating_seat = await response.json();
                this.$router.push({
                    name: "user_dash",
                    params: { username: this.username },
                });
              }
              else{
                throw new Error('Network response was not ok');}
            }
            catch(error){
                console.log(error.message)
            }
        },
      },
      created(){
        console.log(this.ticket_count)
        this.get_user_info()
        .then(()=>{
            this.get_show_info()
            .then(()=>{
                this.get_venue_info()
                .then(()=>{
                    this.get_show_rating_seat()
                })
            })
        })
      },
      beforeRouteEnter(to, from, next) {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('role');
    
        if (!token) {
            next({ name: 'login' }); // Redirect to login if token is not present
        } else {
            try {
                const tokenPayloadBase64 = token.split('.')[1];
                const tokenPayload = JSON.parse(atob(tokenPayloadBase64));
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    
                if (tokenPayload.exp < currentTimeInSeconds) {
                    console.error('Token has expired.');
                    next({ name: 'login' }); // Redirect to login if token is expired
                } else if (tokenPayload.sub === to.params.username) {
                    if (role === 'user' || role === 'admin') {
                        next();
                    }
                } else {
                    console.error('Token username does not match the expected username.');
                    next({ name: 'login' }); // Redirect to login if username doesn't match
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                next({ name: 'login' }); // Redirect to login if there's an error decoding the token
            }
        }
    },
    computed: {
        showRatingMessage() {
            return this.show_rating_seat.seats > 0;
        }
    }
  });
  
  export default book