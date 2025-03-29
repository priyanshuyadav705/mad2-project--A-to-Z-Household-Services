import AdminNav2 from "./AdminNav2.js";
import SearchBar from "./SearchBar.js";
export default {
    name: 'AdminSearch',
    components: {
        AdminNav2,
        SearchBar
    },
    template:`
         <div>
             <AdminNav2/>
             <h2 class="text-center">Admin Search</h2>
             
             <SearchBar @search="handleSearch"/>
            
             <div v-if="services.length">
                 <h2>Service ({{ searchQuery }})</h2>
                 <table class="table mt-4">
                      <thead>
                            <tr>
                               <th>ID</th>
                               <th>Name</th>
                               <th>Base Price</th>
                               <th>Description</th>
                            </tr>
                      </thead>
                      <tbody>
                            <tr v-for="service in services" :key="service.id">
                                <td>{{ service.id}}</td>
                                <td>{{ service.name }}</td>
                                <td>{{ service.base_price || 'N/A'}}</td>
                                <td>{{ service.service_description || 'N/A' }}</td>
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

             <div v-if="customers.length">
                  <h2>Customers ({{ searchQuery }})</h2>
                  <table class="table mt-4">
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>Customer Name</th>
                              <th>Contact Number </th>
                              <th>Address</th>
                              <th>Status</th>

                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="customer in customers" :key="customer.customer_id">
                              <td>{{ customer.id }}</td>
                              <td>{{ customer.name }}</td>
                              <td>{{ customer.contact_number  }}</td>
                              <td>{{ customer.address }}</td>
                              <td>{{ customer.service_requests && customer.service_requests.length > 0? customer.service_requests[0].service_status:'N/A' }}</td>
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
        customers:[]
    };
},
methods:{
    async handleSearch(query){
        this.services = [];
        this.professionals = [];
        this.serviceRequests = [];
        this.customers = [];

        try{
            const url ="http://127.0.0.1:5000";
                const res = await fetch(`${url}/api/admin/search?type=${query.type}&search=${query.query}`);

            if (!res.ok) {
                const erroDrata = await res.json();
                throw new Error(data.message || 'Search failed');
            }
            const data = await res.json();
            this.searchQuery = query.query;
            this.services = data.services || [];
            this.professionals = data.professionals || [];
            this.serviceRequests = data.service_requests || [];
            this.customers = data.customers || [];
        }catch (error) {
              console.error('Error fetching search results:',error);
        }}
    }
}
