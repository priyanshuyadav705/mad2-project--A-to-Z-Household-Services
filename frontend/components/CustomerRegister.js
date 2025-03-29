import CustomerNav from './CustomerNav.js';
export default {
    components:{
        CustomerNav
    },
    template:`
    <div>
         <CustomerNav/>
         <h1>customer register</h1>
         <hr>
         <br>
         <div class="login-container">
              <form @submit.prevent="register">
                   <label class="form-label">Email:
                     <input type="email" v-model="customer.email" required>
                    </label>
                    <br>
                   <label class="form-label">Password:
                     <input type="password" v-model="customer.password" required>
                    </label>
                    <br>
                   <label class="form-label">Name:
                     <input type="text" v-model="customer.name" required>
                    </label>
                    <br>
                   <label class="form-label">Address:
                     <input type="text" v-model="customer.address" required>
                    </label>
                    <br>
                   <label class="form-label">Location:
                     <input type="text" v-model="customer.location" required>
                    </label>
                    <br>
                   <label class="form-label">Pincode:
                     <input type="text" v-model="customer.pincode" required>
                    </label>
                    <br>
                   <label class="form-label">Contact Number:
                     <input type="tel" v-model="customer.contact" required>
                    </label>
                    <br>
                    <br>
                    <button type="submit" class="btn btn-success">Register</button>
              </form>
         </div>
    </div>
                    
    `,
data(){
    return{
            customer:{
            email:'',
            password:'',
            name:'',
            address:'',
            location:'',
            pincode:'',
            contact:''
        }
    }
},
methods:{
    async register(){
        try{
            const url = window.location.origin
            const res = await fetch(url+'/api/customer/signup',{
                 method:'POST',
                 headers:{
                        "Content-Type":"application/json"
                 },
                  body:JSON.stringify(this.customer)
              })
              if(res.ok){
                  this.$router.push('/customerlogin')
              }else{
                    const errorData = await res.json()
                    alert(errorData.message || "Registration failed,please try again");
              }
        }catch(error){
            console.error("Error:",error)
            alert("Registration failed,please try again")
        }
}}};

const styles = `
    .login-container form{
      text-align: center;

   }
    h2 {
      margin-top: 2%;
      text-align: center;
   }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);