// const admin_login =  Vue.component ('admin-login',{
//     // props :[''],
//     template: `
//     <div>
//     <link href="../static/style/login.css" rel="stylesheet">
//         <div class="full-body">
//             <nav class="navbar navbar-dark bg-dark fixed-top">
//                 <div class="container-fluid">
//                   <a class="navbar-brand">Movie Dekho</a>
//                 </div>
//             </nav>
//         </div>
//         <form method="POST">
//         <div class="container-sm col-lg-4" id="form">
//             <div class="form-floating mb-3" >
//                 <input name='username' class="form-control" id="floatingInput" placeholder="Username">
//                 <label for="floatingInput">Username</label>
//               </div>
//               <div class="form-floating">
//                 <input name='password' type="password" class="form-control" id="floatingPassword" placeholder="Password">
//                 <label for="floatingPassword">Password</label>
//               </div>
//               <div id="texting">
//                 <button type="submit" class="btn d-grid gap-2 col-6 mx-auto bg-dark text-light idp" >Login</button>
//                 <router-link to="/user-login">
//                 <div id="link">
//                     <a class="text-link" style="--bs-link-opacity:0.75 ;color:rgb(178, 214, 209);">User Login</a>
//                 </div>
//                 </router-link>
//               </div>
//           </div>
//         </form>
//     </div>
//     `,
//     data: function(){
//         return{
//             username:'',
//             pass:'',
//             admin_data:[]
//         }
//     },
//     methods:{
//         async check_user_info(){
//             const requestOptions = {
//                 method: "GET",
//                 mode: 'cors'
//             };
//             try{
//                 const response = await fetch(url, requestOptions)
//                 if(response.ok){
//                     const data = await response.json();
//                     this.admin_data = data;
//                     console.log(this.user_data.username);
//                 }
//                 else{
//                     throw new Error('Network response was not ok');}
//             }
//             catch(error) {
//                 console.log(error.message);
//             }
//         }
//     },
//     created(){
//         this.check_user_info()
//         .then(()=> {
//             console.log(this.admin_data.username);
//         })
//         .catch(error => {
//             console.log("userdata could not be verified")
//         })
//     }
// });

// export default admin_login