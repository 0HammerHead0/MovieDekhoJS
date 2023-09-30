import { logoutMixin } from './logout.js';
const bookings=Vue.component('bookings',{
  mixins:[logoutMixin],
  template:`
    <div>
      <link href="../static/style/booking.css" rel="stylesheet">
      <nav class="navbar navbar-dark bg-dark fixed-top" style="display:inline-block;">
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
                    <a @click="logout" class="nav-link">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <div style="margin-top:70px">
        <h4> Total number of shows booked: {{tot_shows}}</h4>
      </div>
      <div class="movies">
        <div v-for="(show, index) in shows" :key="index">
          <div v-if="index==0" class="card"  style="margin-top:2% ; margin-bottom:3%;">
            <div class="card-body"style="text-shadow: 2px 2px 3px rgb(0, 0, 0);">
              <h5 class="card-title"><strong>Venue: </strong> {{show_venue[index].name}} -> <strong>Show: </strong> {{show.name}}</h5>
              <div class="card-text" style="display:flex; flex-wrap: wrap;">
                <p style="flex:1">Time:- <strong>{{show.start_time}}-{{show.end_time}}</strong></p>
                <p style="flex:1">Tags:- <strong>{{show.tags}}</strong></p>
                <p style="flex:1">Remaining Seats:- <strong>{{show.rem_cap}}</strong></p>
                <p style="flex:1">Seats Booked:- <strong>{{shows_ratings_seats[index].seats}}</strong></p>
              </div>
              <div class="rate">
                <input type="radio" :id="'star5-' + index" name="rate" value="5" v-model="selectedRating"/>
                <label :for="'star5-' + index" title="text">5 stars</label>
                <input type="radio" :id="'star4-' + index" name="rate" value="4" v-model="selectedRating"/>
                <label :for="'star4-' + index" title="text">4 stars</label>
                <input type="radio" :id="'star3-' + index" name="rate" value="3" v-model="selectedRating"/>
                <label :for="'star3-' + index" title="text">3 stars</label>
                <input type="radio" :id="'star2-' + index" name="rate" value="2" v-model="selectedRating"/>
                <label :for="'star2-' + index" title="text">2 stars</label>
                <input type="radio" :id="'star1-' + index" name="rate" value="1" v-model="selectedRating" />
                <label :for="'star1-' + index" title="text">1 star</label>
              </div>
              <a class="btn btn-primary button" style="margin-bottom:0.6% ;width:10%" @click="rate(index, selectedRating)"> Rate </a> <br>
              <p class="card-text">
                <div v-if="show.rating"> Admin rating:- <strong>{{ show.rating }}</strong></div>
                <span v-if="show.user_rating">All User Rating:- <strong>{{ show.user_rating}}</strong></span><br>
                <span v-if="shows_ratings_seats[index].rating">Your Current Rating:- <strong>{{ shows_ratings_seats[index].rating}}</strong></span>
              </p>
            </div>
          </div>
          <div v-else-if="index === shows_ratings_seats.length - 1" class="card"  style="margin-top:0% ; margin-bottom:7%;">
            <div class="card-body"style="text-shadow: 2px 2px 3px rgb(0, 0, 0);">
            <h5 class="card-title"><strong>Venue: </strong> {{show_venue[index].name}} -> <strong>Show:</strong> {{show.name}}</h5>
              <div class="card-text" style="display:flex; flex-wrap: wrap;">
                <p style="flex:1">Time:- <strong>{{show.start_time}}-{{show.end_time}}</strong></p>
                <p style="flex:1">Tags:- <strong>{{show.tags}}</strong></p>
                <p style="flex:1">Remaining Seats:- <strong>{{show.rem_cap}}</strong></p>
                <p style="flex:1">Seats Booked:- <strong>{{shows_ratings_seats[index].seats}}</strong></p>
              </div>
              <div class="rate">
                <input type="radio" :id="'star5-' + index" name="rate" value="5" v-model="selectedRating"/>
                <label :for="'star5-' + index" title="text">5 stars</label>
                <input type="radio" :id="'star4-' + index" name="rate" value="4" v-model="selectedRating"/>
                <label :for="'star4-' + index" title="text">4 stars</label>
                <input type="radio" :id="'star3-' + index" name="rate" value="3" v-model="selectedRating"/>
                <label :for="'star3-' + index" title="text">3 stars</label>
                <input type="radio" :id="'star2-' + index" name="rate" value="2" v-model="selectedRating"/>
                <label :for="'star2-' + index" title="text">2 stars</label>
                <input type="radio" :id="'star1-' + index" name="rate" value="1" v-model="selectedRating" />
                <label :for="'star1-' + index" title="text">1 star</label>
              </div>
              <a class="btn btn-primary button" style="margin-bottom:0.6% ;width:10%" @click="rate(index , selectedRating)"> Rate </a> <br>
              <p class="card-text">
                <div v-if="show.rating"> Admin rating:- <strong>{{ show.rating }}</strong></div>
                <span v-if="show.user_rating">All User Rating:- <strong>{{ show.user_rating}}</strong></span><br>
                <span v-if="shows_ratings_seats[index].rating">Your Current Rating:- <strong>{{ shows_ratings_seats[index].rating}}</strong></span>
              </p>
            </div>
          </div>
          <div v-else class="card" style="margin-top:0% ;margin-bottom:3%;">
            <div class="card-body"style="text-shadow: 2px 2px 3px rgb(0, 0, 0);">
            <h5 class="card-title"><strong>Venue: </strong> {{show_venue[index].name}} -> <strong>Show: </strong> {{show.name}}</h5>
              <div class="card-text" style="display:flex; flex-wrap: wrap;">
                <p style="flex:1">Time:- <strong>{{show.start_time}}-{{show.end_time}}</strong></p>
                <p style="flex:1">Tags:- <strong>{{show.tags}}</strong></p>
                <p style="flex:1">Remaining Seats:- <strong>{{show.rem_cap}}</strong></p>
                <p style="flex:1">Seats Booked:- <strong>{{shows_ratings_seats[index].seats}}</strong></p>
              </div>
              <div class="rate">
                <input type="radio" :id="'star5-' + index" name="rate" value="5" v-model="selectedRating"/>
                <label :for="'star5-' + index" title="text">5 stars</label>
                <input type="radio" :id="'star4-' + index" name="rate" value="4" v-model="selectedRating"/>
                <label :for="'star4-' + index" title="text">4 stars</label>
                <input type="radio" :id="'star3-' + index" name="rate" value="3" v-model="selectedRating"/>
                <label :for="'star3-' + index" title="text">3 stars</label>
                <input type="radio" :id="'star2-' + index" name="rate" value="2" v-model="selectedRating"/>
                <label :for="'star2-' + index" title="text">2 stars</label>
                <input type="radio" :id="'star1-' + index" name="rate" value="1" v-model="selectedRating" />
                <label :for="'star1-' + index" title="text">1 star</label>
              </div>
              <a class="btn btn-primary button" style="margin-bottom:0.6% ;width:10%" @click="rate(index , selectedRating)"> Rate </a>
              <p class="card-text">
                <div v-if="show.rating"> Admin rating:- <strong>{{ show.rating }}</strong></div>
                <span v-if="show.user_rating">All User Rating:- <strong>{{ show.user_rating}}</strong></span><br>
                <span v-if="shows_ratings_seats[index].rating">Your Current Rating:- <strong>{{ shows_ratings_seats[index].rating}}</strong></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    ,data: function(){
      return{
          username:'',
          user:[],
          shows:[],
          show_ids:[],
          shows_ratings_seats:[],
          ele:[],
          show_venue:[],
          selectedRating:null,
          token: localStorage.getItem('access_token'),
          tot_shows:0
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
      async get_shows(){
        const url="http://127.0.0.1:8080/api/shows_ratings/uid/" + this.user.ID;
        const requestOptions = {
          method:"GET",
          mode:"cors",
          headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
        };
        try{
          const response = await fetch(url,requestOptions);
          if(response.ok){
            this.shows_ratings_seats = await response.json();

            for(const element of this.shows_ratings_seats){
              this.show_ids.push(element.shows_id);
              this.tot_shows+=1;
            }
          }
          else{
            throw new Error('Network response was not ok');
          }
        }
        catch(error){
          console.log(error.message);
        }
      },
      async get_show_details(){
        for(const show_id of this.show_ids){
          const showurl="http://127.0.0.1:8080/api/show/" + show_id;
          const showrequestOptions= {
            method:"GET",
            mode:"cors",
            
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          };
          try{
            const showresponse = await fetch(showurl,showrequestOptions);
            if(showresponse.ok){
              const data = await showresponse.json()
              this.shows.push(data);
            }
            else{
              throw new Error('show network response was not ok')
            }
          }
          catch(error){
            console.log(error.message);
          }
        }
      },
      async get_show_venue(){
        for(const show_id of this.show_ids){
          const showurl="http://127.0.0.1:8080/api/show/venue/" + show_id;
          const showrequestOptions= {
            method:"GET",
            mode:"cors",
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          };
          try{
            const showresponse = await fetch(showurl,showrequestOptions);
            if(showresponse.ok){
              const data=await showresponse.json()
              this.show_venue.push(data);
            }
            else{
              throw new Error('show network response was not ok')
            }
          }
          catch(error){
            console.log(error.message);
          }
        }
        console.log(this.show_venue)
      },
      async rate(index,selectedRating){
        var data={
          "users_id":Number(this.user.ID),
          "shows_id":Number(this.shows_ratings_seats[index].shows_id),
          "rating":Number(this.selectedRating)
        }
        for(const show_id of this.show_ids){
          const showurl="http://127.0.0.1:8080/api/"+this.username+"/rate/"+this.shows_ratings_seats[index].shows_id;
          const showrequestOptions= {
            method:"POST",
            mode:"cors",
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body:JSON.stringify(data)
          };
          try{
            const showresponse = await fetch(showurl,showrequestOptions);
            if(showresponse.ok){
              const updatedData=await showresponse.json()
              this.$set(this.shows_ratings_seats, index, updatedData);
              const url="http://127.0.0.1:8080/api/show/"+this.shows_ratings_seats[index].shows_id;
              const requestOptions= {
                method:"GET",
                mode:"cors",
                headers: {
                  'Authorization': `Bearer ${this.token}`,
                  'Content-Type': 'application/json',
                },
              }
              try{
                const response = await fetch(url,requestOptions);
                const show_new= await response.json();
                this.$set(this.shows,index,show_new);
              }
              catch(error){
                console.log(error.message)
              }
            }
            else{
              console.log("Show response not ok")
            }
          }
          catch(error){
            console.log(error.message);
          }
        }
      },
    },
    created(){
      this.get_user_info()
      .then(()=> {
        this.get_shows()
        .then(() => {
          this.get_show_details()
          .then(()=>{
            this.get_show_venue()
            console.log(typeof this.show_venue);
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
    }
});

export default bookings