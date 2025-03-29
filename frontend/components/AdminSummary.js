import AdminNav2 from './AdminNav2.js';
export default {
    name: 'AdminSummary',
    components: {
        AdminNav2
    },
    template: `
        <div>
            <AdminNav2/>
            <h2 class="text-center">Admin Summary</h2>
            <div class = "summary-container">
                <div class = "type">
                    <h4>Overall Customer Rating</h4>
                    <div class = "rating_chart">
                        <img :src="ratingImage" alt="Rating Chart" width="500" height="300">
                    </div>
                </div>
            </div>
            <div class = "summary-container">
                <div class = "type">
                    <h4>Service Request Summaries</h4>
                    <div class = "service_request_chart">
                        <img :src="serviceRequestImage" alt="Servicee Requests Chart" width="500" height="300" />
                    </div>
                </div>
            </div>
        </div>
`,
   data(){
     return{
     ratingImage:'',
     serviceRequestImage:''
   };
},
  created(){
    this.fetchAdminSummary();
  }, 
  methods:{
    async fetchAdminSummary(){
        const response = await fetch('http://127.0.0.1:5000/api/admin_summary');
        const data = await response.json();
        this.ratingImage = data.rating_image;
        this.serviceRequestImage = data.service_request_image;
    }
  }
}
   
