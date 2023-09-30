
function animateElement(element, duration) {
    const startTime = performance.now();
  
    function updatePosition(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const translateY = progress * 200;
  
      element.style.transform = `translateY(${translateY}px)`;
  
      if (progress < 1) {
        requestAnimationFrame(updatePosition);
      }
    }
  
    requestAnimationFrame(updatePosition);
  }
const user_login =  Vue.component ('user-login',{
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
        <div class="container-sm col-lg-4" id="form" >
        
            
            <form @submit='login' method="POST">
                <div class="form-floating mb-3" >
                    <input v-model='username' name='username' class="form-control" id="floatingInput" placeholder="Username" required >
                    <label for="floatingInput">Username</label>
                </div>
                <div class="form-floating">
                    <input v-model="pass" name='password' type="password" class="form-control" id="floatingPassword" placeholder="Password" required >
                    <label for="floatingPassword">Password</label>
                </div>
                <div id="texting">
                    <button type="submit" class="btn d-grid gap-2 col-6 mx-auto bg-dark text-light idp">Login</button>
                    <router-link :to="{name:'user_register'}" class="text-link" style="--bs-link-opacity:0.75;color:rgb(178, 214, 209);">
                        Not registered yet?<br>
                    </router-link>
                </div>
                <div id='msg' v-if='showErrorMessage' style="position:relative;color:rgb(178, 214, 209);margin-top:30px;">
                    <p>Wrong !!!</p>
                </div>
            </form>
        </div>
    </div>
    `,
    data: function(){
        return{
            username:'',
            pass:'',
            user:[],
            showErrorMessage:false,
            css_name:'login'
        }
    },
    methods:{
        async check_user_info(){
            const url='http://127.0.0.1:8080/api/user/hammer';
            const requestOptions = {
                method: "GET",
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },

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
        async login(event){
            event.preventDefault();
            const url = 'http://127.0.0.1:8080/api/login';
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                username: this.username,
                password: this.pass,
                }),
            };

            try {
                const response = await fetch(url, requestOptions);
                if (response.ok) {
                    const data = await response.json();
                    const access_token = data.access_token;
                    const role = data.role;
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('role', role);
                    this.$router.push({ name: 'user_dash', params: { username: this.username } });
                } else {
                this.showErrorMessage = true;
                setTimeout(() => {
                    this.showErrorMessage = false;
                }, 1000);
                }
            } catch (error) {
                console.log(error.message);
            }
        },
    },
    watch: {
        showErrorMessage: function (newValue) {
            if (newValue) {
            const errorMessage = document.getElementById('msg');
            console.log(errorMessage)
            animateElement(errorMessage, 5000);
            }
        }
    }
});
    
export default user_login