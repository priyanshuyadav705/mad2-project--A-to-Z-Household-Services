import ProfessionalNav from "./ProfessionalNav.js";
export default {
    components:{
      ProfessionalNav
    },
    template: `
<div>
    <ProfessionalNav/>
    <p> <router-link to = "/Professional/register">Register for Professional</router-link></p>
    <div class="login-container">
        <h2> Professional Login - A to Z Household services</h2>
        <hr/>
        <form @submit="submitInfo" class="mt-5" >
            <div>
                <label for="email" class="form-label">Email:
                <input v-model="email" type="email" id="email" name="email" required></label>
            </div>
            <br />
            <div>
                <label for="password" class="form-label">Password:
                <input v-model= "password" type="password" id="password" name="password" required>
                </label>
            </div>
            <br />
            <br />
            <button class="btn btn-success" type="submit" style="align-self: center; width: auto;">Login </button>     
      </form>
    </div>
</div>
    `,
    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        async submitInfo(event) {
            event.preventDefault();
            const url = 'http://127.0.0.1:5000';
            const res = await fetch(`${url}/api/professional/login`, {
                method: 'POST',
                headers : {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email: this.email, password: this.password})
                });

                const data = await res.json();


                if (res.ok){
                    localStorage.setItem('isProfessionalLoggedIn', 'true');
                    localStorage.setItem('professionalemail', this.email);
                    this.$router.push('/professional/dashboard');
                }else{
                    if (data.error){
                        alert(data.error); 
                    } else {
                        alert('Unknown error occured.');
                    }
            }}
    },
}
