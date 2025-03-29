import ProfessionalNav from './ProfessionalNav.js';
export default {
     name: 'ProfessionalRegister',
    components:{
        ProfessionalNav},
    data() {
        return{
          email: '',
          password: '',
          name: '',
          service: '',
          newService: '',
          service_description: '',
          experience: '',
          file: null,
          address: '',
          pincode: '',
          phonenumber: '',
          services: [],
        };
    },
    async created() {
      try {
          console.log("Fetching services...");
          const response = await fetch('/api/services');
  
          if (!response.ok) {
              throw new Error(`Service fetch error: ${response.status}`);
          }
  
          const data = await response.json();
          console.log("Fetched data:", data); // Check if the response is valid JSON
  
          this.services = data.services || []; // Ensure it's an array
          this.services.push({ service_name: 'Others' }); // Add "Others" option
  
          console.log("Updated services list:", this.services);
      } catch (err) {
          console.error("Error fetching services: ", err);
      }
  },
  
    methods: {
      handleFileChange(event){
        this.file = event.target.files[0];
      },
      async register(){
        const formData = new FormData();
        formData.append('email', this.email);
        formData.append('password', this.password);
        formData.append('name', this.name);

        let selectedService = this.service;
        if (this.service == 'Others' && this.newService){
          selectedService = this.newService;}

        formData.append('service', selectedService);
        
        formData.append('service_description', this.service_description);
        formData.append('experience', this.experience);
        if(this.file){
          formData.append('file', this.file);
        }
        formData.append('address', this.address);
        formData.append('pincode', this.pincode);
        formData.append('phonenumber', this.phonenumber);

        try{
          const url = "http://127.0.0.1:5000";
          const response = await fetch(`${url}/api/professional/register`,{
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
          if (!response.ok){
            throw new Error(`Register fetch error: ${response.status}`);
          }
          const data = await response.json();
          if(data.error){
            alert(data.error);
          } else{
            alert("Professional registered successfully");
            this.$router.push('/professionallogin');
          }
        } catch(err){
          console.error("Error registering professional: ", err);
        }}
    },

    template:`
    <div>
        <ProfessionalNav/>
        <h2> Professional Register</h2>
        <hr>
        <form @submit.prevent="register" class="mt-2">
            <div>
                Email Id: <input type="email" v-model="email" required>
            </div>
            <br>
            <div>
                Password: <input type="password" v-model="password" required>
            </div>
            <br>
            <div>
                Name: <input type="text" v-model="name" required>
            </div>
            <br>
            <div>
                <label for="service">Service Name:</label>
                <select name="service" id="service" v-model="service" required>
                    <option value="" disabled selected>Select Service</option>
                    <option v-for="(srv, index) in services" 
                    :key="index"
                    :value= "srv.service_name">{{ srv.service_name }}
                    </option>
                </select>
            </div>
            <br>
            <div v-if="service === 'Others'">
                New Service: <input type="text" v-model="newService" placeholder="Enter new service" required>
            </div>
            <br>
            <div>
                Service Description: <input type="text" v-model="service_description" required>
            </div>
            <br>
            <div>
                Experience(in years): <input type="number" v-model="experience" required>
            </div>
            <br>
            <div>
                Attach Document : <input type="file" @change="handleFileChange" id="file" required>
            </div>
            <br>
            <div>
                Address: <br>
                <textarea v-model="address" id="address" cols="30" rows="10" required></textarea>
            </div>
            <br>
            <div>
                 Pin-code: <input type='text' v-model="pincode" required>
            </div>
            <br>
            <div>
                 Phone number: <input type='text' v-model="phonenumber" required>
            </div>
            <br>
            <div>
                 <input type="submit" value="Register" class="btn btn-success mt-3">
            </div>
        </form>
    </div>
  `
};