<script setup lang="ts">

</script>

<template>
  <Editor :value="value" :plugins="plugins" @change="handleChange" />
</template>

<script>
import gfm from '@bytemd/plugin-gfm'
import { Editor } from '@bytemd/vue'

const plugins = [
  gfm(),
  // Add more plugins here
]

export default {
  components: { Editor },
  data() {
    return { value: '', plugins }
  },
  methods: {
    handleChange(v) {
      this.value = v
    },
  },
}
</script>

<style scoped>
@import "bytemd/dist/index.min.css";
body {
  margin: 0 10px;
}
.bytemd {
  height: 90vh !important;
}
</style>