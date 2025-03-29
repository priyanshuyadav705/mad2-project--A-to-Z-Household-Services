import AdminNav2 from './AdminNav2.js';
export default{
    components: {
        AdminNav2
    },
    template: `
     <div>
        </AdminNav2>
        <h2>Edit Service</h2>
        <hr>
        <div class="login-container">
             <form @submit.prevent="updateService">
                   <label for="service-name">Service Name:</label>
                    <input type="text" class="form-control" v-model="service.name" id="name">
                   <br>
                   <label for="service-description">Service Description:</label>
                    <textarea class="form-control" id="service-description" v-model="service.description" rows="3"></textarea>
                   <br>
                   <label for="base_price">Base Price:</label>
                   <input type="text" class="form-control" v-model="service.base_price" id="base_price">
                   <br>
                   <br>
                   <button type="submit" class="btn btn-success">Update</button>
                   <a href="/admin/dashboard" class="btn btn-secondary">Cancel</a>
              </form>
        </div>
     </div>
    </template>
    `,
    data(){
        return{
            serviceId: null,
            service:{
                name:'',
                description:'',
                base_price: ''
            }
        }
    },
    created(){
        this.serviceId = this.$route.params.id;
        this.fetchServiceData();
    },
     mounted(){
            if (!localStorage.getItem('isAdminLoggedIn')) {
                alert('You need to login first');
                setTimeout(() => {
            this.$router.push('/adminlogin');
            },100);
      }
    },
    methods:{ 
        async fetchServiceData(){

            const response  = await fetch(`'http://127.0.0.1:5000//api/admin/services/${this.serviceId}`);
            if (response.ok){
                const data = await response.json();
                this.service = data.service;
            } else {
                  alert("service not found");
            }
    },

    async updateService(){
        const data = {
            name: this.service.name,
            description: this.service.description,
            base_price: this.service.base_price
        };
        const response  = await fetch(`/api/admin/services/${this.serviceId}`,{
             method:'PUT',
             headers:{
                'Content-Type': 'application/json'
             },
             body: JSON.stringify(data)
            });

            if (response.ok){
                const responseData = await response.json();
                alert(responseData.message);
                this.$router.push('/admin/dashboard');

            } else{
                const errorData = await response.json();
                alert(errorData.error)
            }

    }

    }
    };
             
                       
            