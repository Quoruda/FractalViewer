<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="nav">
        <RouterLink to="/fractal">Fractal</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>

.nav{
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8);
}

.body{
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  font-family: Arial, sans-serif;
}

</style>
