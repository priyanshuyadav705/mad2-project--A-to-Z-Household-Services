import Navbar from "./Navbar.js";

export default {
    components: {
        Navbar
    },
    name: "Home",
    template: `
      <div>
        <Navbar/>
        <hr>
        <header>
            <h1>Welcome to A to Z  Household Services</h1>
        </header>
        
        <main>
            <div class="login_links">
                <p>
                    If you are admin, click 
                    <router-link to="/adminlogin">here</router-link>
                </p>
                <br>
                <p>
                    If you are a customer, click
                    <router-link to="/customerlogin">here</router-link>
                </p>
                <br>
                <p>
                    If you are a professional, click
                    <router-link to="/professionallogin">here</router-link>
                </p>
            </div>
        </main>
      </div>
    `,
};


const styles = `
   h1{
       margin-top: 5%;
       text-align: center;
       }
    .login_links{
       display: flex;
       justify-content: center;
       gap: 20px;
    }
    p {
    margin: 0%;
    } 
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
