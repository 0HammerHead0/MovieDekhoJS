const user_register =  Vue.component ('user-register',{
    // props :[''],
    template: `
    <div>
    <link href="../static/style/login.css" rel="stylesheet">
        <div class="full-body">
        <nav class="navbar navbar-dark bg-dark fixed-top">
            <div class="container-fluid">
                <a class="navbar-brand">Movie Dekho</a>
            </div>
        </nav>
        </div>
        <div class="container-sm col-lg-4" id="form">
            <form @submit.prevent="post_user_info()" method="POST">
            <div class="form-floating mb-3" >
                <input v-model='name' name='name' class="form-control" id="floatingInput" placeholder="text" required>
                <label for="floatingInput">Name</label>
            </div>
            <div class="form-floating mb-3">
                <input v-model='username' name='username' class="form-control" id="floatingInput" placeholder="Username" required>
                <label for="floatingPassword">Username</label>
            </div>
            <div class="form-floating mb-3">
                <input v-model='email' name='email' class="form-control" type='email' id="floatingInput" placeholder="Email" required>
                <label for="floatingPassword">Email</label>
            </div>
            <div class="form-floating">
                <input v-model='password' name='password' type="password" class="form-control" id="floatingPassword" placeholder="Password" required>
                <label for="floatingPassword">Password</label>
            </div>
            <div id="texting">
                <button class="btn d-grid gap-2 col-6 mx-auto bg-dark text-light idp" >Register</button>
                <router-link to="/login">
                    <div id="link">
                        <a class="text-link" style="--bs-link-opacity:0.75 ;color:rgb(178, 214, 209);">Login</a>
                    </div>
                </router-link>
            </div>
        </form>
      </div>
    </div>
    `,
    data: function(){
        return{
            name:'',
            username:'',
            password:'',
            email:'',
            user_data:[]
        }
    },
    methods:{
        async post_user_info(){
            const url='http://127.0.0.1:8080/api/user';
            const data={
                "username": this.username,
                "name": this.name,
                "password": this.password,
                "email":this.email,
              }
            const requestOptions = {
                method: "POST",
                mode: 'cors'
            }
            try {
                console.log(JSON.stringify(data));
                const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json', // Set the appropriate Content-Type header
                  },
                  body: JSON.stringify(data), // Convert the data object to JSON string
                });
                const responseData = await response.json();
            if(response.ok){
                console.log(responseData);
                this.$router.push('/login');
            }
            else if(responseData.error_message=="Duplicate Username"){
                alert("username already exists");
            }
            else if(responseData.error_message=="Duplicate EmailAddress"){
                alert("email already exists");
            }
            else{
                throw new Error('Network response was not ok');}
            }
            catch(error){
                console.log(error.message);
            }
        }
    },
});

export default user_register