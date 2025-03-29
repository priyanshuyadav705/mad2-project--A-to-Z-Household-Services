import AdminNav2 from "./AdminNav2.js";
export default {
    components:{
        AdminNav2
    },
    template: `
    <div>
         <AdminNav2/>
         <h2 class="text-muted"> {{ customer.name }} details</h2>
         <hr>
         <table class = "table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Pincode</th>
                    <th>Contact Number </th>
                    <th>Created at </th>
                    <th>Total Requests</th>
                </tr>
            </thead>
            <tbody>
                    <td>{{customer.id }}
                    <td>{{ customer.name }}</td>
                    <td>{{ customer.location }}</td>
                    <td>{{customer.pincode}}</td>
                    <td>{{ customer.contact}}</td>
                    <td>{{ customer.created_at }}</td>
                    <td>{{ customer.total_requests }}</td>
            </tbody>
         </table>
    </div>
    `,
    data(){
      return{
         customer: {},
         customerID: null,
         };
    },
    created(){
        this.customerID = this.$route.params.id;
        this.fetchCustomer();
    },
    methods:{
    async fetchCustomer(){
      try{
        const url = "//127.0.0.1:5000";
        const res = await fetch(`${url}/api/admin/customerdetails/${this.customerID}`,{
            method :'GET',
                    credentials: 'include',
                });

        const data = await res.json();
        this.customer = data.customer;
      } catch (error){
                console.error("Error fetching customers:", error);
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
