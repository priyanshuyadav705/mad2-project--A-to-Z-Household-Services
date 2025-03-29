import ProfessionalNav2 from "./ProfessionalNav2.js";
import ProfessionalSearchBar from "./ProfessionalSearchBar.js";
export default {
    name: 'AdminSearch',
    components: {
        ProfessionalNav2,
        ProfessionalSearchBar,
    },
    template:`
         <div>
             <ProfessionalNav2/>
             <h2 class="text-center">Professional Search</h2>
             
             <ProfessionalSearchBar @search="handleSearch"/>

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
                         <td>{{ customer.service_status }}</td>
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
        customers:[]
    };
},
methods:{
    async handleSearch(query){
        this.serviceRequests = [];
        this.customers = [];

        try{
            const url ="http://127.0.0.1:5000";
                const res = await fetch(`${url}/api/professional/search?type=${query.type}&search=${query.query}`);

            if (!res.ok) {
                const erroDrata = await res.json();
                throw new Error(data.message || 'Search failed');
            }
            const data = await res.json();
            this.searchQuery = query.query;
            this.serviceRequests = data.service_requests || [];
            this.customers = data.customers || [];
        }catch (error) {
              console.error('Error fetching search results:',error);
        }}
    }
}
