<template>
  <div id="app">
    <Navbar />
    <router-view/>
  </div>
</template>

<script>
import Navbar from '@/components/layout/Navbar'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style lang="scss">
body {
  background-color: #f2f2f2;
  input[type]:focus {
    border-bottom: 1px solid #5e35b1 !important;
    -webkit-box-shadow: 0 1px 0 0 #5e35b1 !important;
    box-shadow: 0 1px 0 0 #5e35b1 !important;
  }
}
</style>
