import CustomerNav2 from './CustomerNav2.js';
export default {
    name: 'AdminSummary',
    components: {
        CustomerNav2
    },
    template: `
        <div>
            <CustomerNav2/>
            <h2 class="text-center">Customer Summary</h2>
            <hr>
            <br>

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
    if(!localStorage.getItem('isCustomerLoggedIn')){
        alert("You need to be logged in as a customer")
        this.$router.replace('/customerlogin')
        } 
    this.fetchCustomerSummary()
},
  methods:{
    async fetchCustomerSummary(){
        const response = await fetch('http://127.0.0.1:5000/api/customer_summary');
        const data = await response.json();
        this.ratingImage = data.rating_image;
        this.serviceRequestImage = data.service_request_image;
    }
  }
}
   
