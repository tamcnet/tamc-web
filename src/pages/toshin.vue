<!-- pages/toshin.vue -->
<template>
    <latestImage />
    <DeviceUsage deviceId="1go" title="視程観測装置(都心方面)の使用状況" />
    <!-- <ToshinData /> -->
</template>

<script setup>
import ToshinData from '@/components/visibility/ToshinData.vue';
import latestImage from '@/components/live/toshin/latestImage.vue';
import DeviceUsage from '@/components/live/DeviceUsage.vue';
</script>