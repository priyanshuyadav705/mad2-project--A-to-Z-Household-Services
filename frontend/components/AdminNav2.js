export default {
    name: 'Navbar2',
    methods: {
      async logout() {
          if (!confirm("Are you sure you want to logout?")) {
            return;
          }
          const url = window.location.origin
          const res = await fetch(url+'/api/adminlogout', {
              method: 'POST',
              credentials: 'include',
          })
          .then(response => response.json())
          .then(() => {
              alert('Logout succesfull')
              localStorage.removeItem('isAdminLoggedIn');
              this.$router.push('/adminlogin');
          });
      }
  },
    template : `
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/admin/dashboard">Admin Dashboard  </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link active" to="/admin/search">Search Page</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/admin/summary">Summary Page</router-link>
          </li>
          <li class="nav-item">
            <button class="nav-link active btn btn-link" @click="logout">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
    `
}