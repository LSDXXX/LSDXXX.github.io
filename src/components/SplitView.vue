<template>
  <div class="container">
    <div
      class="top"
      :style="{ height: `${topHeight}px` }"
    >
      <slot name="top" />
    </div>

    <div
      class="divider"
      @mousedown="startDrag"
    ></div>

    <div
      class="bottom"
      :style="{ height: `${bottomHeight}px` }"
    >
      <slot name="bottom" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const topHeight = ref(300)  // 默认顶部高度
const bottomHeight = ref(300)  // 默认底部高度

let isDragging = ref(false)
let initialY = ref(0)
let initialTopHeight = ref(0)

const startDrag = (event: MouseEvent) => {
  isDragging.value = true
  initialY.value = event.clientY
  initialTopHeight.value = topHeight.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
  if (isDragging.value) {
    const diff = event.clientY - initialY.value
    topHeight.value = initialTopHeight.value + diff
    bottomHeight.value = window.innerHeight - topHeight.value - 40  // 40 是 divider 的高度
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onMounted(()=> {
    bottomHeight.value = window.innerHeight - topHeight.value - 40  // 40 是 divider 的高度
})
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top, .bottom {
  overflow: auto;
}

.divider {
  height: 10px;
  background-color: #ccc;
  cursor: ns-resize;
}
</style>
