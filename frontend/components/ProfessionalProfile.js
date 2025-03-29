import ProfessionalNav2 from "./ProfessionalNav2.js";

export default {
    components:{
        ProfessionalNav2,
    },
    template:`
       <div>
           <ProfessionalNav2/>
           <h1> Professional Profile
                <small class='text-muted'>(@{{ professionalEmail }})</small>
           </h1>
           <hr>
           <h3>Edit Profile</h3>

           <form @submit.prevent="updateProfile" class="form">
                
               <div class="form-group">
                   <label for="email" class="form-label">New Email:</label>
                   <input v-model="formData.email" type="text" id="email" class="form-control">
               </div>

               <div class="form-group">
                   <label for="name" class="form-label">Name:</label>
                   <input v-model="formData.name" type="text" id="name" class="form-control">
               </div>

               <div class="form-group">
                   <label for="currentpassword" class="form-label">Currentpassword:</label>
                   <input v-model="formData.currentpassword" type="password" id="currentpassword" class="form-control">
               </div>

               <div class="form-group">
                   <label for="password" class="form-label">New Password:</label>
                   <input v-model="formData.password" type="password" id="password" class="form-control">
               </div>
               <div>
                    <label for="service">Service Name:</label>
                    <select name="service" id="service" v-model="formData.service" required>
                         <option value="" disabled selected>Select Service</option>
                         <option v-for="(srv, index) in services" 
                         :key="index"
                         :value= "srv.service_name">{{ srv.service_name }}
                         </option>
                    </select>
               </div>
               <div v-if="formData.service === 'Others'">
                     New Service: <input type="text" v-model="formData.newService" placeholder="Enter new service" required>
               </div>
               <br>
               <button type="submit" class="btn btn-success">Update Changes</button>
               <a href="/professional/dashboard" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </template>   
    `,
    data(){
        return {
            formData: {
                email: '',
                name: '',
                currentpassword:'',
                password:'',
                service:'',
                newService: '',

        },
        user:{
            email: '',
            name: '',
        },
        services:[]
      };
    },
    computed:{
        professionalEmail(){
            return localStorage.getItem('professionalemail');
        },
        professionalName(){
            return localStorage.getItem('professionalName');
        }
    },
    
mounted(){
    if(!localStorage.getItem('isProfessionalLoggedIn')){
      alert("You need to be logged in as a Professional")
      this.$router.replace('/professionallogin')
    } else{
        this.user.email = this.professionalemail;
        this.user.name = this.professionalName;
    }
    this.fetchServices();
},
methods:{
    async fetchServices(){
        const response = await fetch('http://127.0.0.1:5000/api/services');
        const data = await response.json()
        if (response.ok){
            this.services = data.services || [];
            this.services.push({ service_name: 'Others' });
        }else{
            alert('failed to fetch services')
        }
    },

    async updateProfile(){
        const {email, name, currentpassword, password, service, newService} = this.formData;
        const url = 'http://127.0.0.1:5000';
        const response = await fetch(`${url}/api/professional/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,    
                name,
                currentpassword,
                password,
                service,
                newService
            }),
        });
        const data = await response.json();
        if(response.ok){
            this.$router.push('/professionallogin');
            alert('Profile updated successfully, Login again with the update email and password')
        } else{
            alert(data.error) || 'Failed to update profile';
        }
    },
},
}