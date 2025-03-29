import AdminNav from './AdminNav.js';
export default {
    components:{
        AdminNav
    },
    template: `
    <div>
       <AdminNav/>
      <div class="login-container">
        <h2>Admin Login - A to Z Household services</h2>
        <hr/>
        <form @submit="submitInfo" class="mt-5" >
            <div>
                <label for="email" class="form-label">Email:
                <input v-model="email" type="email" id="email" name="email" required>
                </label>
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
            const url = window.location.origin
            const res = await fetch(url+'/api/adminlogin', {
                method: 'POST',
                headers : {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({email: this.email, password: this.password})
                });

                if (res.ok){
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    this.$router.push('/admin/dashboard');
                }else{
                    alert("Invalid email or password");
                }

        },
    },
}

const styles = `
   h2{
       margin-top: 5%;
        text-align: center;
    }
    form{
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        gap: 0px;
    } 
    p {
        text-align: right;
        margin: 50%;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);