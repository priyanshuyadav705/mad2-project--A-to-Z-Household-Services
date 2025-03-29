import AdminNav2 from "./AdminNav2.js";
export default {
    components:{
        AdminNav2
    },
    template: `
        <div>
            <AdminNav2 /> 
            <div class="container">
                <h1>Add New Service</h1>
                <hr>
                <div class="form-container"> 
                    <form @submit.prevent="addService" class="mt-5">
                        <label for="service">Service Name:</label>
                            <input type="text" id="name" v-model="service.name" class="form-control">
                        <br>
                        <label for="description">Description:</label>
                            <textarea id="description" v-model="service.description" class="form-control"></textarea>
                        <br>
                        <label for="base_price">Base Price:</label>
                            <input type="number" id="base_price" v-model="service.base_price" class="form-control">

                        <br>
                        <button type="submit" class="btn btn-primary">Add Service</button>
                    </form>
                </div>
            </div>
        </div>
    </template>
    `,
    data(){
        return{
            service: {
                name: "",
                description: "",
                base_price: "",
            }
        };
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
        async addService(){
            const response = await fetch('http://127.0.0.1:5000/api/admin/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.service),
            });
            const data = await response.json();
            if (response.ok){
                alert('Service added successfully');
                this.$router.push('/admin/dashboard');
            }else{
                alert(data.error || 'Failed to add service');
            }
        }
    }
};