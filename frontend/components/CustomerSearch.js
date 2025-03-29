import CustomerNav2 from './CustomerNav2.js';
import customerSearchBar from './customerSearchBar.js';
export default {
  name: 'CustomerDashboard',
    components:{
    CustomerNav2,
    customerSearchBar
  }, 
    template:`
   <div>
        <CustomerNav2 />
        <h2 class=text-center>Customer Search</h2>
        <customerSearchBar @search="handleSearch" />
             <div v-if="services.length">
                 <h2>Service ({{ searchQuery }})</h2>
                 <table class="table mt-4">
                      <thead>
                            <tr>
                               <th>ID</th>
                               <th>Name</th>
                               <th>Base Price</th>
                               <th>Description</th>
                               <th>Action</th>
                            </tr>
                      </thead>
                      <tbody>
                            <tr v-for="service in services" :key="service.id">
                                <td>{{ service.id}}</td>
                                <td>{{ service.name }}</td>
                                <td>{{ service.base_price || 'N/A'}}</td>
                                <td>{{ service.service_description }}</td>
                                <td>
                                <button
                                       v-for="professionals in service.professionals" :key="professionals.id"
                                       @click="handleBooking(professionals.id, service.id)" 
                                       class="btn btn-primary">
                                        Book
                                </button>
                                </td>
                            </tr>
                      </tbody>
                 </table>
             </div>

             <div v-if="professionals.length">
                  <h2>Professional ({{ searchQuery }})</h2>
                  <table class="table mt-5">
                        <thead>
                              <tr>
                                  <th>ID</th>
                                  <th>Name</th>
                                  <th>Experience</th>
                                  <th>Service name</th>
                                  <th>Action</th>
                              </tr>
                        </thead>
                        <tbody>
                               <tr v-for="professional in professionals" :key="professional.professional_id">
                                    <td>{{ professional.id }}</td>
                                    <td>{{ professional.name }}</td>
                                    <td>{{ professional.experience}}</td>
                                    <td>
                                        <span v-if="professional.services && professional.services.length">
                                              {{ professional.services.map(s=> s.name).join(',')}}
                                        </span>
                                        <span v-else>No Services Assigned Yet.</span>
                                    </td>
                                    <td>{{ professional.action }}</td>
                               </tr>
                        </tbody>
                  </table>
             </div>
             
             <div v-if="serviceRequests.length">
                  <h2>Service Request ({{ searchQuery }})</h2>
                  <table class="table mt-4">
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>Professional Name</th>
                              <th>Date of Request </th>
                              <th>Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="request in serviceRequests" :key="request.id">
                              <td>{{ request.id }}</td>
                              <td>{{ request.professional ? request.professional.name: 'Not Assigned' }}</td>
                              <td>{{ request.date_of_request }}</td>
                              <td>{{ request.service_status }}</td>
                          </tr>
                      </tbody>
                  </table>
             </div>
        </div>
    </template>
  
`,
data(){
    return{
        searchQuery:"",
        services:[],
        professionals:[],
        serviceRequests:[],
    };
},
mounted(){
  if(!localStorage.getItem('isCustomerLoggedIn')){
    alert("You need to be logged in as a customer")
    this.$router.replace('/customerlogin')
  } else{
    this.services = [];
    this.professionals = [];
    this.serviceRequests = [];
}},
methods:{
    async handleSearch(query){
        try{
            const url ="http://127.0.0.1:5000";
                const res = await fetch(`${url}/api/customer/search?type=${query.type}&search=${query.query}`);

            if (!res.ok) {
                const erroDrata = await res.json();
                throw new Error(data.message || 'Search failed');
            }
            const data = await res.json();
            this.searchQuery = query.query;
            this.services = data.services || [];
            this.professionals = data.professionals || [];
            this.serviceRequests = data.service_requests || [];
        }catch (error) {
              console.error('Error fetching search results:',error);
        
        }   
    },

    async handleBooking(professionalId, serviceId){
      const confirmBooking = confirm('Do you want to book this service?');
      if (confirmBooking){
        this.fetchBooking(professionalId, serviceId);
      }
    },  

    async fetchBooking(professionalId, serviceId) {
      const baseUrl = 'http://127.0.0.1:5000';
      try {
        const response = await fetch(
          `${baseUrl}/api/customer/dashboard/book/${professionalId}/${serviceId}`,
          {
            method: 'POST',
            credentials: 'include'
          }
        );
        if (!response.ok) {
          throw new Error(`Booking failed: ${response.status}`);
        }
        const data = await response.json();
        alert('Booking successful');
      } catch (err) {
        console.error('Error booking service:', err);
        alert('Booking failed');
      }
    },
  },
};
  