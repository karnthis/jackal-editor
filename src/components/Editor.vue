<script setup lang="ts">

</script>

<template setup lang="ts">
  // @ts-ignore: all
  <Editor :value="value" :plugins="plugins" @change="handleChange" />
</template>

<script setup lang="ts">
import gfm from '@bytemd/plugin-gfm'
import { Editor } from '@bytemd/vue'

const _plugins = [
  gfm(),
  // Add more plugins here
]

const methods : any = {
    handleChange(v : string): any {
      this.value = v
    }
}

const item: any = {
  components: { Editor },
  data() {
    return { value: '', _plugins }
  },
  methods: methods 
}


export default item
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
