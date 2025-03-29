import AdminNav2 from "./AdminNav2.js";
export default {
    components:{
        AdminNav2
    },
    template: `
    <div>
         <AdminNav2/>
         <h2 class="text-muted"> {{ professional.name }} details</h2>
         <hr>
         <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Experience</th>
                    <th>Service Name</th>
                    <th>Action</th>
                    <th>Average Rating</th>
                    <th>Pdf</th>
                </tr>
            </thead>
            <tbody>
                    <td>{{ professional.id }}</td>
                    <td>{{ professional.name }}</td>
                    <td>{{professional.experience}}</td>
                    <td>
                        {{ professional.service_name[0] }}
                    </td>
                    <td> {{ professional.action }}</td>
                    <td> {{ professional.rating }}</td>
                    <td> 
                        <a :href="professional.pdf" target="_blank>">Download PDF</a>
                       
                    </td>
                    
            </tbody>
        </table>
    </div>
    `,
    data(){
      return{
          professional: {},
          professionalID: null,
         };
    },
    created(){
        this.professionalID = this.$route.params.id;
        this.fetchProfessional();
    },
    methods:{
    async fetchProfessional(){
      try{
        const url = "//127.0.0.1:5000";
        const res = await fetch(`${url}/api/admin/professionaldetails/${this.professionalID}`,{
            method :'GET',
                    credentials: 'include',
                });

        const data = await res.json();
        this.professional = data.professional;
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
