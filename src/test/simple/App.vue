<style>
* {
  box-sizing: border-box;
}

.box {
  border: solid 1px;
  padding: 1em;
  cursor: pointer;
}

.bg1 { background-color: #faa; }
.bg2 { background-color: #afa; }
.bg3 { background-color: #aaf; }

.drag-container {
  background: #ccc;
  position: relative;
  height: 100px;
}
.drag-item {
  border: solid 1px;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  position: absolute;
  cursor: pointer;
  background: #f00;
  top: 0;
  left: 0;
}
.drag-item.dd-touch {
  background: #faa;
  z-index: 2;
}
</style>
<template>
<div>
  <h1>Simple Test</h1>
  <section>
    <h2>Tap</h2>
    <p><a href="javascript:void(0);" @dd-tap="tap1">anchor</a></p>
    <p><a href="https://www.google.co.jp" @dd-tap="tap1" target="_blank">https://www.google.co.jp</a></p>
    <p><a href="https://www.google.co.jp" @dd-tap.prevent="tap1" target="_blank">https://www.google.co.jp (preventDefault)</a></p>
    <p><button @dd-tap="tap1">button</button></p>
  </section>

  <section>
    <h2>Nested</h2>
    <div class="box bg1" @dd-tap="tapParent">
      <p>Parent</p>
      <div class="box bg2" @dd-tap="tapChild1">
        <p>Child1</p>
        <div class="box bg3" @dd-tap="tapChild2">
          <p>Child2</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Nested (stopPropagation)</h2>
    <div class="box bg1" @dd-tap.stop="tapParent">
      <p>Parent</p>
      <div class="box bg2" @dd-tap.stop="tapChild1">
        <p>Child1</p>
        <div class="box bg3" @dd-tap.stop="tapChild2">
          <p>Child2</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Drag</h2>
    <div class="drag-container">
      <div
        class="drag-item"
        v-for="n in 3"
        :key="n"
        @dd-dragstart.prevent="dragStart"
        @dd-dragmove="dragMove"
        @dd-dragend="dragEnd"
      >{{n}}</div>
    </div>
  </section>

  <section>
    <h2>Drag (enclosure)</h2>
    <div class="drag-container">
      <div
        class="drag-item"
        v-for="n in 3"
        :key="n"
        @dd-dragstart.prevent="dragStart"
        @dd-dragmove="dragMoveEnclosure"
        @dd-dragend="dragEnd"
      >{{n}}</div>
    </div>
  </section>
</div>
</template>
<script>
export default {
  data() {
    return {
    }
  },



  computed: {
  },



  methods: {
    tap1(e) {
      console.log(e);
      alert('tap!!!');
    },
    tapParent(e) {
      console.log(e);
      alert('tapParent');
    },
    tapChild1(e) {
      console.log(e);
      alert('tapChild1');
    },
    tapChild2(e) {
      console.log(e);
      alert('tapChild2');
    },
    dragStart(e) {
      console.info('dragStart');
      console.log(e);
      return DDTappable.dragStart(e);
    },
    dragMove(e) {
      return DDTappable.dragMove(e);
    },
    dragMoveEnclosure(e) {
      return DDTappable.dragMove(e, {enclosure: true});
    },
    dragEnd(e) {
      console.info('dragEnd');
      console.log(e);
      return DDTappable.dragEnd(e);
    },
  },



  created() {
    this.tappable = new DDTappable({
      // tapEventNameSuffix: 'dd-tap',
      // touchClassName: 'dd-touch',
    });
  },



  mounted() {
  },
}
</script>
