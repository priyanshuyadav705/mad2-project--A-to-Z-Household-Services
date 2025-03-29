export default {
    name : 'SearchBar',
    template:`
        <div class="container">
        <form @submit.prevent='handleSearch'>
            <div class="form-group">
                <select v-model="selectedType" class="form-control">
                    <option value="customer">Customer</option>
                    <option value="service_request">Service Requests</option>
                </select>
                <input
                   type="text" required
                   class = "form-control"
                   v-model="searchQuery"
                   placeholder="Search..."
                />
                <button type="submit" class="btn btn-primary">
                    <i class="fa fa-search"></i> Search
                </button>
            </div>
        </form>
        </div>
    `,
    data(){
        return{
            selectedType: "customer",
            searchQuery: ""
        }
    },
    methods:{
        handleSearch(){
            this.$emit('search',{ type: this.selectedType, query: this.searchQuery });
        },
    },
}

const styles = `
   .form-group{
       width: 100%;
       display: flex;
       flex-direction: row;
       justify-content: center;
       align-items: center;
   }
   .form-select{
       margin-left:5px;
       margin-right:5px
       width:15%;}
   }
   .form-control{
      margin-left: 5px;
      margin-right: 5px;
      width: 70%;}

`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);