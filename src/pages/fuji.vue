<!-- pages/fuji.vue -->
<template>
    <FujiImage />
    <DeviceUsage deviceId="3go" title="視程観測装置(富士山方面)の使用状況" />
</template>

<script setup>
import FujiImage from '@/components/live/fuji/fujiLatestImage.vue';
import DeviceUsage from '@/components/live/DeviceUsage.vue';
</script>