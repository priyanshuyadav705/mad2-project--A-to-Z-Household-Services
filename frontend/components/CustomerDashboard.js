import CustomerNav2 from './CustomerNav2.js';
export default {
  name: 'CustomerDashboard',
    components:{
    CustomerNav2
  }, 
    template:`
  <div>
     <CustomerNav2 :serviceName="selectedService" v-if="selectedService" />
     <h2 class=text-center>Welcome to the Customer Dashboard, {{ user.name }}</h2>

    <p>
      <router-link to="/customer/profile/edit" class="profile">
                    <i class="fa fa-user"></i> Edit/View profile
      </router-link>
    </p>

    <div class="heading1">
      <h3 class="text-muted">Looking for Services?</h3>
    </div>
    
    <div class ="services">
         <a href="#" v-for = "service in serviceList" :key = "service" @click.prevent="selectedService(service)">
             {{service}}
         </a>
    </div>

    <div v-if="service_name" class="service_information">
        <h3 class = "text-muted">Best {{ service_name }} services</h3>
            <div v-if="filteredServices.length > 0">
                <p><strong>Service description | AVg. Rating | Base price |  Created on</strong></p>
                   <div v-for = "(service,index) in filteredServices" :key="index">
                        <p>
                           {{ index + 1}}.
                           {{ service.service_description }},
                           {{ 'N/a' }},
                           {{ service.base_price }} ,
                           {{ service.created_at }},
                            <strong> No professionals available yet.</strong>
                        </p>
                        <div v-if = "service.professionals && service.professionals?.length > 0">
                            <div v-for = "(professional, index) in service.professionals" :key="index">
                                <p>
                                    {{ index + 1}}.
                                    {{ professional.service_description}},
                                    {{ professional_avg_rating[professional.professional_id] || 'N/a' }},
                                    {{ service.base_price }},
                                    {{ service.created_at }},  
                                    <button
                                       @click="handleBooking(professional.id, service.id)" 
                                       class="btn btn-primary">
                                        Book
                                    </button>
                                </p>
                            </div>
                        </div>
                   </div>
            </div>
            <div v-else>
                 <p> No services found for {{ service_name }} yet, try sometime later </p>
            </div>
    </div>
    <br>
    <br>

    <div class="heading2">
      <h3 class="text-muted">Service History</h3>
    </div>

            <table class = "table">
      <thead>
        <tr>
                            <th>Service request ID</th>
                            <th>Service name</th>  
                            <th>Professional name</th>
                            <th>Phone no.</th>
                            <th>Status</th>
                            <th>Actions</th>
        </tr>
      </thead>
      <tbody>
         <tr v-if = "service_requests.length == 0">
                <td colspan="6" class="text-center">No service requests found</td>
         </tr>

        <tr v-for = "(service_request, index) in service_requests" :key="index">
          <td>{{ service_request.id }}</td>
          <td>{{ service_request.service.service_name }}</td>
          <td>{{ service_request.professional.name }}</td>
          <td>{{ service_request.professional.phonenumber }}</td>
          <td>{{ service_request.status }}</td>
          <td>
              <p v-if="service_request.status == 'Requested'">
                 <button @click="cancelBooking(service_request.id)"
                  class="btn btn-danger">
                  Cancel
                </button>
              </p>
              <p v-else-if = "service_request.status == 'Accepted'">
              <button
                   <router-link :to = "'/customer/service/close/' + service_request.id">
                       <i class = "btn btn-success"></i> Close?
                   </router-link>
              </button>
              </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
                          
  </div>
        `,

  data() {
    return {
      user: null,
      serviceList: ['AC Repair','Saloon','Cleaning','Electrician','Plumbing','Cooking','Appliance Repair','Gardening' ],
      service_name: "",
      all_services: [],
      service_requests:[],
      professional_avg_rating: {}

    };
  },
  async created() {
        if(!localStorage.getItem('isCustomerLoggedIn')){
            alert("You need to be logged in as a customer")
            this.$router.replace('/customerlogin')
        } else{
            try{
                const baseUrl = "http://127.0.0.1:5000";
                const response = await fetch(`${baseUrl}/api/customer/dashboard`,{ credentials: 'include'});
                if (!response.ok){
                    throw new Error(`Dashboard fetch error: ${response.status}`);
                }

                const data = await response.json();
                this.user = data.user;
                this.service_requests = data.service_requests;

                const serviceResponse = await fetch(`${baseUrl}/api/services`,{ credentials: 'include'});
                if (!serviceResponse.ok){
                    throw new Error(`Service fetch error: ${serviceResponse.status}`);
                }
                const contentType = serviceResponse.headers.get("Content-Type");

                if (contentType && contentType.includes("application/json")) {
                    const serviceData = await serviceResponse.json();
                    console.log(serviceData);  // Debugging line to check the service data
                    this.all_services = serviceData.services;
                    this.serviceList = this.all_services.map(service => service.service_name);
                } else {
                       const text = await serviceResponse.text();  // Log the response text if it's not JSON
                       console.error("Expected JSON, but received:", text);
                }


                } catch(err){
                  console.error("Error fetching data: ", err);
      }

    }

  },
  computed:{
    filteredServices(){
      return this.all_services.filter(service => service.service_name === this.service_name);
    }
  },
  methods:{
    selectedService(service){
        this.service_name = service;
    },


    async handleBooking(professionalId, serviceId){
      const confirmBooking = confirm('Do you want to book this service?');
      if (confirmBooking){
        this.fetchBooking(professionalId, serviceId);
      }
    },  

    async fetchServiceRequests(){
      const baseUrl = 'http://127.0.0.1:5000';
      try {
        const response = await fetch(`${baseUrl}/api/customer/dashboard`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Service requests fetch failed: ${response.status}`);
        }
        const data = await response.json();
        this.service_requests = data.service_requests;
      } catch (err) {
        console.error('Error fetching service requests:', err);
        alert('Service requests fetch failed');
      }
    },

    async cancelBooking(service_requestsID) {
      const confirmCancel = confirm('Do you want to cancel this service?');
      if (confirmCancel) {
        this.fetchCancelBooking(service_requestsID);
      }
    },

    async fetchCancelBooking(service_requestsID) {
      const baseUrl = 'http://127.0.0.1:5000';
      try {
        const response = await fetch(
          `${baseUrl}/api/customer/dashboard/cancel/${service_requestsID}`,
          {
            method: 'POST',
            credentials: 'include'
          }
        );
        if (!response.ok) {
          throw new Error(`Canceling service failed: ${response.status}`);
        }
        const data = await response.json();
        alert('Service canceled');
        this.fetchServiceRequests();
      } catch (err) {
        console.error('Error canceling service:', err);
        alert('Canceling service failed');
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
        this.fetchServiceRequests(); 
      } catch (err) {
        console.error('Error booking service:', err);
        alert('Booking failed');
      }
    },
  },
  computed: {
    filteredServices(){
       return this.all_services.filter(service => service.service_name === this.service_name);
    }
  }
};
