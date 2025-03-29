import AdminNav2 from "./AdminNav2.js";
export default {
    components:{
        AdminNav2
    },
    template: `
    <div>
         <AdminNav2/>
         <h2 class="text-muted"> {{ service.service_name }} details</h2>
         <hr>
         <table class = "table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Service Name</th>
                    <th>Base Price</th>
                    <th>Professionals-(service description)</th>
                    <th>Service Description</th>
                    <th>Created at </th>
                </tr>
            </thead>
            <tbody>
                    <td>{{ service.id }}
                    <td>{{ service.service_name }}</td>
                    <td>{{ service.base_price }}</td>
                    <td>
                       <div v-if="service.professionals && service.professionals.length > 0">
                           <ul>
                               <li v-for="professional in service.professionals" :key="professional.id">
                                    {{ professional.name }} - {{ professional.service_description }}
                               </li>
                           </ul>
                       </div>
                       <div v-else>
                            No professional assigned yet
                       </div>
                    </td>
                    <td>{{ service.service_description}}</td>
                    <td>{{ service.created_at }}</td>
            </tbody>
         </table>
    </div>
    `,
    data(){
      return{
          service: {},
          serviceID: null,
         };
    },
    created(){
        this.serviceID = this.$route.params.id;
        this.fetchServices();
    },
    methods:{
    async fetchServices(){
      try{
        const url = "//127.0.0.1:5000";
        const res = await fetch(`${url}/api/admin/servicedetails/${this.serviceID}`,{
            method :'GET',
                    credentials: 'include',
                });

        const data = await res.json();
        this.service = data.services;
      } catch (error){
                console.error("Error fetching services:", error);
            }
        }
    },
     mounted() {
        if (!localStorage.getItem('isAdminLoggedIn')) {
            alert('You need to login first');
            setTimeout(() => {
        this.$router.push('/adminlogin');},100);
        } 
    },  
}     
