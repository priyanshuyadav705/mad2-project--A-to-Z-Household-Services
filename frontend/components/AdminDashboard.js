import AdminNav2 from "./AdminNav2.js";

export default {
    components:{
        AdminNav2
    },
    template: `
    <div>
       <AdminNav2/>
       <h1>Admin dashboard</h1>
       <div class ="row_border">
                <button @click="csvExport" class = "btn btn-secondary">Download CSV</button>
        </div>
        <div class="heading">
            <h2 class="text-muted">Services</h2>
        </div>
       <table class = "table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Service Name</th>
                    <th>Base Price</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in services" :key="service.id">
                    <td><router-link :to = "'/admin/service/details/'+ service.id">{{service.id}}</router-link></td>
                    <td>{{ service.service_name }}</td>
                    <td>{{ service.base_price }}</td>
                    <td> 
                        <router-link :to = "'/admin/services/edit/' + service.id" class="btn btn-primary">
                            <i class = "fas fa-edit fa-xs"></i> Edit
                        </router-link>
                        <a class =  "btn btn-danger" @click = "deleteService(service.id)">
                            <i class = "fas fa-trash fa-xs"></i> Delete 
                        </a>
                    </td>
                </tr>
                <tr v-if="services?.length === 0">
                    <td colspan="4">No services found.</td>
                </tr>
            </tbody>
        </table>
        <p> 
            <a href="/admin/services/newservice" class = "btn btn-success">
                <i class="fas fa-plus fa-xs"></i> New Service
            </a>
        </p>
        <div class="heading">
            <h2 class = "text-muted">Professionals</h2>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Experience</th>
                    <th>Service Name</th>
                    <th>Action</th>
                    <th>Block/Unblock</th>
                </tr>
            </thead>
            <tbody>
                 <tr v-for="professional in professionals" :key="professional.id">
                    <td><router-link :to = "'/admin/professional/details/'+ professional.id">{{professional.id}}</router-link></td>
                    <td>{{ professional.name }}</td>
                     <td>{{professional.experience}}</td>
                    <td>
                        <span v-if="professional.services?.length > 0">
                              {{ professional.services.map(s => s.name).join(', ')}}
                        </span>
                    </td>
                    <td>
                         <span v-if="professional.action !== 'None'" :class="badgeClass(professional.action)">
                               {{ professional.action }}
                         </span>
                         <a v-if="professional.action==='None'" class="btn btn-success" @click="approveProfessionals(professional.id)">
                             <i class="fas fa-check fa-1x"></i>Approve
                          </a>
                         <a v-if="professional.action==='None'" class="btn btn-danger" @click="deleteProfessionals(professional.id)">
                              <i class="fas fa-trash fa-1x"></i> Delete
                         </a>
                        
                        
                    </td>
                    <td>
                         <a v-if="professional.action ==='Rejected'" class="btn btn-success" @click="unblockProfessional(professional.id)">
                              unblock?
                         </a>

                         <a v-if="professional.action ==='Approved'" class="btn btn-danger" @click="blockProfessional(professional.id)">
                              block
                         </a>            

                         <a v-if="professional.action ==='None'" class="btn btn-danger" @click="blockProfessional(professional.id)">
                              block
                         </a>            
                    </td>
                </tr>
                  </tr>
                <tr v-if="professionals?.length === 0">
                           <td colspan="5">No professional found.</td>
                </tr>
            </tbody>
        </table>

        <div class="heading">
            <h2 class = "text-muted">Customers</h2>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone number</th>
                    <th>Location</th>
                    <th>Created on</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                 <tr v-for="customer in customers" :key="customer.id">
                    <td><router-link :to = "'/admin/customer/details/'+ customer.id">{{customer.id}}</router-link></td>
                    <td>{{ customer.name }}</td>
                     <td>{{customer.contact_number }}</td>
                    <td>{{customer.location}}</td>
                    <td>{{customer.created_at}}</td>
                    <td>
                         <a v-if="customer.action ==='None'" class="btn btn-danger" @click="blockCustomer(customer.id)">
                               Block

                         </a>
                        <a v-else-if="customer.action !== 'None'" class="btn btn-success" @click="unblockCustomer(customer.id)">
                              Unblock
                        </a>
                          
                    </td>
                </tr>
                  </tr>
                <tr v-if="customers?.length === 0">
                           <td colspan="6">No Customers found.</td>
                </tr>
            </tbody>
        </table>



        <div class ="heading">
            <h2 class="text-muted">Service Requests</h2>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                        <th>Assigned Professionals</th>
                        <th>Requested Date </th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="serviceRequests?.length === 0">
                   <td colspan="4">No service requests found.</td>
                </tr>
                <tr v-for="serviceRequest in serviceRequests" :key="serviceRequest.id">
                    <td>{{ serviceRequest.id }}</td>
                    <td>{{ serviceRequest.professional ? serviceRequest.professional.name : 'Not Assigned' }}</td>
                    <td>{{ serviceRequest.date_of_request }}</td>
                    <td>{{ serviceRequest.service_status }}</td>
                </tr>
            </tbody>
        </table>

        
              

    </div>

    `,
data(){
    return{
        services: [],
        professionals:[],
        serviceRequests:[],
        customers:[]
        };
    },
methods:{
    csvExport(){
        fetch('/api/export')
        .then(response => response.json())
        .then(data => {
            window.location.href = `//127.0.0.1:5000/api/download/${data.id}`
        })
    },
    async fetchServices(){
      try{
        const url = "//127.0.0.1:5000";
        const res = await fetch(`${url}/api/services`,{
            method :'GET',
                    credentials: 'include',
                });

        const data = await res.json();
        this.services = data.services;
      } catch (error){
                console.error("Error fetching services:", error);
      
        }
        },
    async fetchProfessionals(){
      try{
        const url = "//127.0.0.1:5000";
        const res = await fetch(`${url}/api/professionals`,{
            method :'GET',
                    credentials: 'include',
                });
        const data = await res.json();
        this.professionals = data.professionals;
        }catch (error){
            console.error("Error fetching professionals:",error);
        
    }},
    async fetchServiceRequests(){
      try{
        const url = "//127.0.0.1:5000";
        const res = await fetch(`${url}/api/servicerequests`,{
            method :'GET',
                    credentials: 'include',
                });
            const data = await res.json();
            this.serviceRequests = data.service_requests;
            }catch (error){
                console.error("Error fetching service requests:",error);
        }},

    async fetchCustomers(){
            try{
                const url ="//127.0.0.1:5000";
                const res = await fetch(`${url}/api/customers`,{
                    method : 'GET',
                         credentials:'include',
                });
                const data = await res.json();
                this.customers = data.customers;
                }catch (error){
                    console.error("Error fetching customers:",error);
                }
    },

    async blockCustomer(customerId){
        if(!confirm("Are you sure you want to block this customer?")) return;
        try{
            const url ="//127.0.0.1:5000";
            const res = await fetch(`${url}/api/admin/customers/${customerId}/block`,{
                method :'POST',
                    credentials: 'include',
                });
                if(res.ok){
                    await this.fetchCustomers();
                    console.log("Customer unblocked succesfully")
                }
            }catch(error){
                console.error("Error Blocking Customer:",error);
            }
        },

    async unblockCustomer(customerId){
        if(!confirm("Are you sure you want to unblock this customer?")) return;
            try{
                const url ="//127.0.0.1:5000";
                const res = await fetch(`${url}/api/admin/customers/${customerId}/unblock`,{
                    method :'POST',
                        credentials: 'include',
                    });

                if(res.ok){
                    await this.fetchCustomers();
                    console.log("Customer unblocked succesfully")
                }
                }catch(error){
                    console.error("Error Unblocking Customer:",error);
                }
            },

    async approveProfessionals(professionalId){
        try{
            const url = "//127.0.0.1:5000";
            const res = await fetch(`${url}/api/admin/professionals/${professionalId}/approve`,{
                method :'POST',
                    credentials: 'include',
                });
            if(res.ok){
                    await this.fetchProfessionals();
                    console.log("Professional approved succesfully")
            }
            }catch (error){
                console.error("Error fetching professionals:",error);
        }},

    async rejectProfessionals(professionalId){
            try{
                const url = "//127.0.0.1:5000";
                const res = await fetch(`${url}/api/admin/professionals/${professionalId}/reject`,{
                    method :'POST',
                    credentials: 'include',
                });
                if(res.ok){
                    await this.fetchProfessionals();
                    console.log("Professional rejected succesfully")
            }
                }catch (error){
                    console.error("Error fetching professionals:",error);
            }},

    async deleteService(serviceId){
        if (!serviceId) {
            console.error("Error: Service ID is undefined");
            alert("Error: Service ID is missing.");
            return;
        }
      if(!confirm("Are you sure you want to delete this service?")) return;
      try{  
        const url = "http://127.0.0.1:5000"
        const res  = await fetch(`${url}/api/admin/service/${serviceId}`,{
            method:'DELETE',
                credentials: 'include'
                });
            if(res.ok){
                this.services = this.services.filter(service=> service.id !== serviceId);
                this.services = [...this.services];
                console.log("Service deleted succesfully")
            }
        } catch (error){
            console.error("Error deleting service:",error)
            }
        },

    async deleteProfessionals(professionalId){
        if(!confirm("Are you sure you want to delete this professional?")) return;
        try{ 
           const url = "http://127.0.0.1:5000";
           const res  = await fetch(`${url}/api/admin/professionals/${professionalId}/delete`,{
                method:'DELETE',
                   credentials: 'include'
                });
        if(res.ok){
             this.professionals = this.professionals.filter(prof=> prof.id !== professionalId);
             this.services = [...this.services];
             console.log("Professional deleted succesfully")
                }
        }catch (error){
            console.error("Error deleting service:",error)
            }
        },
    badgeClass(action){
        if(action==='Approved') return 'badge badge-success';
        if(action==='Rejected') return 'badge badge-danger';
            return 'badge badge-secondary';
        },
    
    async unblockProfessional(professionalId){
            if(!confirm("Are you sure you want to unblock this professional?")) return;
                try{
                    const url ="//127.0.0.1:5000";
                    const res = await fetch(`${url}/api/admin/dashboard/professional/${professionalId}/unblock`,{
                        method :'POST',
                            credentials: 'include',
                        });
    
                    if(res.ok){
                        await this.fetchProfessionals();
                        console.log("Professional unblocked succesfully")
                    }
                    }catch(error){
                        console.error("Error Unblocking Customer:",error);
                    }
                },
    async blockProfessional(professionalId){
            if(!confirm("Are you sure you want to block this professional?")) return;
                try{
                    const url ="//127.0.0.1:5000";
                    const res = await fetch(`${url}/api/admin/dashboard/professional/${professionalId}/block`,{
                        method :'POST',
                            credentials: 'include',
                        });
    
                    if(res.ok){
                        await this.fetchProfessionals();
                        console.log("Professional blocked succesfully")
                    }
                    }catch(error){
                        console.error("Error Unblocking Customer:",error);
                    }
                },
    },
    mounted() {
        if (!localStorage.getItem('isAdminLoggedIn')) {
            alert('You need to login first');
            setTimeout(() => {
        this.$router.push('/adminlogin');},100);
        } else {
            this.fetchServices();
            this.fetchProfessionals();
            this.fetchServiceRequests();
            this.fetchCustomers();
        }
        }
    };
