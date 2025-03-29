export default{
    template:`
       <div>
         <h2> Service Remark </h2>
         <hr>
             <h2> Request id: {{ serviceRequestId }}</h2>
             <br>
             <div class="line1">
                 {{ serviceRequest.service.service_name }} | {{ serviceRequest.professional.service_description }} | {{ currentTime }}
             </div>
             <div class = "line2">
                 {{ serviceRequest.professional.professional_id }} | {{ serviceRequest.professional.name }} | {{ user.contact_number }}
             </div>
             <br>
             <form @submit.prevent="submitForm" class="form">
               <input type="hidden" v-model="serviceRequest.id">
               
               <label for="service_rating" class="form-label">Rating:</label>
               <div class="rating">
                   <input type = "radio" v-model="rating" value="1" id="star1">
                   <label for ="star1" class = "star"> &#9733;</label>

                   <input type = "radio" v-model="rating" value="2" id="star2">
                   <label for ="star2" class = "star"> &#9733;</label>

                   <input type = "radio" v-model="rating" value="3" id="star3">
                   <label for ="star3" class = "star"> &#9733;</label>

                   <input type = "radio" v-model="rating" value="4" id="star4">
                   <label for ="star4" class = "star"> &#9733;</label>

                   <input type = "radio" v-model="rating" value="5" id="star5">
                   <label for ="star5" class = "star"> &#9733;</label>
               </div>

               <br>

               <label for = "remarks"> Remarks (if any): </label>
               <textarea v-model="remarks" id="remarks"></textarea>

               <br>

               <input type = "submit" value="Submit">
               <a href="/customer/dashboard" class="btn btn-secondary">Cancel</a>
             </form>
       </div>
    `, 
    data(){
        return{
            serviceRequestId:this.$route.params.id,
            serviceRequest : '',
            user:{},
            currentTime: new Date().toLocaleString(),
            rating:null,
            remarks:''
    }
},
    mounted(){
        if(!localStorage.getItem('isCustomerLoggedIn')){
          alert("You need to be logged in as a customer")
          this.$router.replace('/customerlogin')
        } else{
            this.fetchServiceRequests();
        }
    },
    methods:{
        async fetchServiceRequests(){
            const baseUrl = 'http://127.0.0.1:5000';
            try {
              const response = await fetch(`${baseUrl}/api/customer/dashboard`, {
                credentials: 'include',
              });
              if (!response.ok) {
                throw new Error(`Service requests fetch failed: ${response.status}`);
              }
              const data = await response.json();
              this.serviceRequest = data.service_requests.find(
                (request)=>request.id === parseInt(this.serviceRequestId)
              )
              this.user = data.user;
            } catch (err) {
              console.error('Error fetching service requests:', err);
              alert('Service requests fetch failed');
            }
          },

        async submitForm(){
            const {rating, remarks} = this;
            const url = 'http://127.0.0.1:5000';
            const professional_id  = this.serviceRequest.professional.professional_id;
            const service_requests_id = this.serviceRequest.id;
            const response = await fetch(`${url}/api/customer/dashboard/service_close/${professional_id}/${service_requests_id}`, 
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
            },
              body: JSON.stringify({ rating, remarks })
            });
                
            const data = await response.json();
            if(response.ok){
                this.$router.push('/customer/dashboard');
                alert('Thank you for taking Household services from us.')
            } else{
                alert(data.error) || 'Failed to update profile';
            }
        }
    }
}