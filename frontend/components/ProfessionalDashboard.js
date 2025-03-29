import ProfessionalNav2 from "./ProfessionalNav2.js";

export default {
    components:{
        ProfessionalNav2,
    },
    template: `
    <div>
        <ProfessionalNav2/>
        <h1>Welcome to Professional dashboard</h1> 

        <br>
        <p>
            <router-link to="/professional/profile" class="btn btn-success">
                <i class="fas fa-user fa-xs"></i> view/Profile
            </router-link>
        </p>
        <div class="heading">
            <h2 class="text-muted">Today Services</h2>
        </div>
       <table class = "table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Contact number</th>
                    <th>Location(with pincode)</th>
                    <th>Status</th>
                </tr>
            </thead> 
            <tbody>
                <tr v-if ="todayServices.length === 0">
                    <td colspan="5" class="text-center">No Service Requests by the Customers Today</td>
                </tr>
                <tr v-for = "serviceRequest in todayServices" :key="serviceRequest.id">
                    <td>{{serviceRequest.id}}</td>
                    <td>{{serviceRequest.customer.name}}</td>
                    <td>{{serviceRequest.customer.contact_number}}</td>
                    <td>{{serviceRequest.customer.location}}({{serviceRequest.customer.pincode}})</td>
                    <td>
                        <p v-if="serviceRequest.service_status === 'Accepted'">Accepted</p>
                        <p v-else-if="serviceRequest.service_status === 'Rejected'">Rejected</p>
                        <p v-else-if="serviceRequest.service_status === 'Closed'">Closed</p>
                        <p v-else>
                            <button @click="acceptServiceRequest(serviceRequest.id)" class="btn btn-success">Accept</button>
                            <button @click="rejectServiceRequest(serviceRequest.id)" class="btn btn-danger">Reject</button>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="heading">
            <h2 class="text-muted">Closed Services</h2>
        </div>
        <table class = "table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer Name</th>
                        <th>Contact number</th>
                        <th>Location(with pincode)</th>
                        <th>Date</th>
                        <th>Rating (out of 5)</th>
                        <th>Remarks</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if ="closedServices.length === 0">
                        <td colspan="8" class="text-center">No Service Requests Closed yet.</td>
                    </tr>
                    <tr v-for = "serviceRequest in closedServices" :key="serviceRequest.id">
                        <td>{{ serviceRequest.id}}</td>
                        <td>{{ serviceRequest.customer.name}}</td>
                        <td>{{ serviceRequest.customer.contact_number}}</td>
                        <td>{{ serviceRequest.customer.location}}({{serviceRequest.customer.pincode}})</td>
                        <td>{{ serviceRequest.date_of_completion }}</td>
                        <td>{{ serviceRequest.review? serviceRequest.review.rating:'N/A'}}</td>
                        <td>{{ serviceRequest.review? serviceRequest.review.remarks : 'N/A'}}</td>
                        {{serviceRequest.service_status}}
                    </tr>
                </tbody>
        </table>
        <div class="heading">
            <h2 class="text-muted">Pending Services</h2>
            <table class = "table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer Name</th>
                        <th>Contact number</th>
                        <th>Location(with pincode)</th>
                        <th>Action</th>
                    </tr>       
                </thead>
                <tbody>
                    <tr v-if ="pendingServices.length === 0">
                        <td colspan="5" class="text-center">No Service Requests Pending</td>
                    </tr>
                    <tr v-for = "serviceRequest in pendingServices" :key="serviceRequest.id">
                        <td>{{ serviceRequest.id}}</td>
                        <td>{{ serviceRequest.customer.name}}</td>
                        <td>{{ serviceRequest.customer.contact_number}}</td>
                        <td>{{ serviceRequest.customer.location}}({{serviceRequest.customer.pincode}})</td>
                        <td>
                            <button @click="acceptServiceRequest(serviceRequest.id)" class="btn btn-success">Accept</button>
                            <button @click="rejectServiceRequest(serviceRequest.id)" class="btn btn-danger">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <br>
            <div class="heading">
                <h2 class="text-muted text-center">Accepted Services</h2>
            </div>
            <table class = "table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Contact number</th>
                    <th>Location(with pincode)</th>
                    <th>Status</th>
                </tr>   
            </thead>
            <tbody>
                <tr v-if ="acceptedServices.length === 0">
                    <td colspan="5" class="text-center">No Service Requests Accepted</td>
                </tr>
                <tr v-for = "serviceRequest in acceptedServices" :key="serviceRequest.id">
                    <td>{{ serviceRequest.id}}</td>
                    <td>{{ serviceRequest.customer.name}}</td>
                    <td>{{ serviceRequest.customer.contact_number}}</td>
                    <td>{{ serviceRequest.customer.location}}({{serviceRequest.customer.pincode}})</td>
                    <td>
                         {{serviceRequest.service_status}}
                    </td>
                </tr>
            </tbody>
            </table>
       </div>
    </div>
    
    `,
    data(){
        return {
            professionalId: '',
            todayServices: [],
            closedServices: [],
            pendingServices: [],
            acceptedServices: [],
        }
    },
    mounted(){
        
        if(!localStorage.getItem('isProfessionalLoggedIn')){
            alert("You need to be logged in as a professional");
            this.$router.push('/professionallogin');
        } else {
            this.getTodayServices();
            this.getClosedServices(); 
            this.getAcceptedServices();
            this.getPendingServices();
        }
    },

    methods: {
        async getTodayServices(){
            const professionalId = localStorage.getItem('professionalId');
            const url = 'http://127.0.0.1:5000';
            const response = await fetch(`${url}/api/professional/dashboard/today`);
            const data = await response.json(); 
            this.todayServices = data.today_services;
        },
        async getClosedServices(){
            const professionalId = localStorage.getItem('professionalId');
            const url = 'http://127.0.0.1:5000';
            const response = await fetch(`${url}/api/professional/dashboard/closed`);
            const data = await response.json();
            this.closedServices = data.closed_services;
        },
        async getPendingServices(){
             const professionalId = localStorage.getItem('professionalId');
             const url = 'http://127.0.0.1:5000';
             const response = await fetch(`${url}/api/professional/dashboard/requested`);
             const data = await response.json();
             this.pendingServices = data.requested_services;
        },
        async getAcceptedServices(){
             const professionalId = localStorage.getItem('professionalId');
             const url = 'http://127.0.0.1:5000';
             const response = await fetch(`${url}/api/professional/dashboard/accepted`);
             const data = await response.json();
             this.acceptedServices = data.accepted_services
        },  
        
        async acceptServiceRequest(serviceRequestId){
             const professionalId = localStorage.getItem('professionalId');
             const url = 'http://127.0.0.1:5000';
             const response = await fetch(`${url}/api/professional/dashboard/accept/${serviceRequestId}`, {
                  method: 'PUT'
             });
             const data = await response.json();
             if(response.ok){
                alert('Service request accepted');
                this.getTodayServices();
                this.getPendingServices();
             } else {
                alert(data.error) || 'Failed to accept service request';
             }
        },  
        async rejectServiceRequest(serviceRequestId){
             const professionalId = localStorage.getItem('professionalId');
             const url = 'http://127.0.0.1:5000';
             const response = await fetch(`${url}/api/professional/dashboard/reject/${serviceRequestId}`, {
                   method: 'PUT'
             });
             const data = await response.json();
             if(response.ok){
                alert('Service request rejected');
                this.getTodayServices();
                this.getPendingServices();
            } else {
               alert(data.error) || 'Failed to reject service request';
            }
        }
    }
 }
