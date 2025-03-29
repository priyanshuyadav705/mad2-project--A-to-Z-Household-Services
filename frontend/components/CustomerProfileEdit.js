import CustomerNav2 from './CustomerNav2.js';
export default{
    name: 'CustomerProfileEdit',
    components: {
        CustomerNav2
    },
    template: `
    <div>
        <CustomerNav2/>
        <h1>Customer Profile
            <small class="text-muted">(@{{ customerEmail }})</small>
        </h1>
        <hr>
        <h3>Edit Profile</h3>
        <form @submit.prevent="UpdateProfile"  class="form">
            <label for ="email" class="form-label" >New Email
            <input v-model="user.email"  type="email" id="email" class="form-control" required>
            </label>
            <label for ="name" class="form-label">Name
            <input v-model="user.name"  type="text" id="name" class="form-control"> 
            </label>
            <label for ="currentpassword" class="form-label">Current Password
            <input v-model="user.currentpassword" type="password" id="currentpassword" class="form-control" required> 
            </label>
            <label for ="newpassword" class="form-label">New Password
            <input v-model="user.newpassword" type="password" id="newpassword" class="form-control" required> 
            </label>
            </br>
            <button type="submit" class="btn btn-primary">Update</button>
        </form>
        <button @click="cancel" class="btn btn-secondary">Cancel</button>

    </div>
</template> 
    `,
    data() {
        return{
            user: {
                email: '',
                name: '',
                currentpassword: '',
                newpassword: ''
            }
                
        }  
    }, 
computed:{
    customerEmail(){
        return localStorage.getItem('customerEmail');
    }
},

mounted(){
    if(!localStorage.getItem('isCustomerLoggedIn')){
      alert("You need to be logged in as a customer")
      this.$router.replace('/customerlogin')
    } 
},
methods:{

    async UpdateProfile(){
        const {email, name, currentpassword, newpassword} = this.user;
        const url = 'http://127.0.0.1:5000';
        const response = await fetch(`${url}/api/customer/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,    
                name,
                currentpassword,
                newpassword
            })
        });
        const data = await response.json();
        if(response.ok){
            alert('Profile updated successfully');
        } else{
            alert(data.error) || 'Failed to update profile';
        }
    },

    cancel(){
        this.$router.push('/customer/dashboard');
    }
}}