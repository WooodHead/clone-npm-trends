<template>
  <div id="app">
    <Trends />
  </div>
</template>

<script>
import Trends from "@/components/Trends.vue";

export default {
  name: "App",
  components: {
    Trends,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
