import ProfessionalNav2 from './ProfessionalNav2.js';
export default {
    components: {
        ProfessionalNav2
    },
    template: `
        <div>
            <ProfessionalNav2/>
            <h2 class="text-center">Professional Summary</h2>
            <hr>
            <br>
            <div class = "summary-container">
                <div class = "type">
                    <h4>Received Ratings</h4>
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
mounted(){
    if(!localStorage.getItem('isProfessionalLoggedIn')){
        alert("You need to be logged in as a Professional")
        this.$router.replace('/professionallogin')
        }
    const professionalId = this.$route.params.professionalId
    this.fetchProfessionalSummary(); 
    },
  methods:{
    async fetchProfessionalSummary(){
        const response = await fetch('http://127.0.0.1:5000/api/professional_summary');
        const data = await response.json();
        this.ratingImage = data.rating_image;
        this.serviceRequestImage = data.service_request_image;
    }
  }
}
   
