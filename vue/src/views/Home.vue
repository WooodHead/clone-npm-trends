<template>
    <div class="home">
        <h1>npm trends</h1>
        <Trends />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Trends from '@/components/Trends.vue';

@Component({
    components: {
        Trends,
    },
})
export default class Home extends Vue {}
</script>
