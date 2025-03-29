export default {
    name: 'Navbar',
    template : `
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">A to Z Household Services</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link active" to="/adminlogin">Admin Login</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/customerlogin">Customer Login</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/professionallogin">Professional Login</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
    `
}