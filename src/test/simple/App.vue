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

.pan-container {
  background: #ccc;
  position: relative;
  height: 100px;
}
.pan-item {
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
.pan-item.dd-touch {
  background: #faa;
  z-index: 2;
}

#alerts {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .8);
  color: #fff;
}
</style>
<template>
<div>
  <h1>Simple Test</h1>
  <section>
    <h2>Tap</h2>
    <p><a href="javascript:void(0);" @tap="tap1">anchor</a></p>
    <p><a href="https://www.google.co.jp" @tap="tap1" target="_blank">https://www.google.co.jp</a></p>
    <p><a href="https://www.google.co.jp" @tap="tap1" @tapstart.prevent @click.prevent target="_blank">https://www.google.co.jp (click.event.preventDefault)</a></p>
    <p><button @tap="tap1">button</button></p>
    <p><a href="javascript:void(0);" @tap="addCount" @tapstart.prevent>count[{{count}}]</a></p>
    <p><button @tap="addCount" @tapstart.prevent>count[{{count}}]</button></p>
    <div @tap="addCount" @tapstart.prevent style="cursor: pointer; width: 100px; height: 50px; text-align: center; vertical-align: 50px; background: #efefef">
      count[{{count}}]
    </div>
  </section>

  <section>
    <h2>Nested</h2>
    <div class="box bg1" @tap="tapParent">
      <p>Parent</p>
      <div class="box bg2" @tap="tapChild1">
        <p>Child1</p>
        <div class="box bg3" @tap="tapChild2">
          <p>Child2</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Nested (stopPropagation)</h2>
    <div class="box bg1" @tap.stop="tapParent">
      <p>Parent</p>
      <div class="box bg2" @tap.stop="tapChild1">
        <p>Child1</p>
        <div class="box bg3" @tap.stop="tapChild2">
          <p>Child2</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Pan</h2>
    <div class="pan-container">
      <div
        class="pan-item"
        v-for="n in 3"
        :key="n"
        @panstart="panStart"
        @panmove.prevent="panMove"
        @panend="panEnd"
      >{{n}}</div>
    </div>
  </section>

  <section>
    <h2>Pan (enclosure)</h2>
    <div class="pan-container">
      <div
        class="pan-item"
        v-for="n in 3"
        :key="n"
        @panstart="panStart"
        @panmove.prevent="panMoveEnclosure"
        @panend="panEnd"
      >{{n}}</div>
    </div>
  </section>

  <div id="alerts" v-if="alerts.length" @tap="alerts = []">
    <p v-for="alert, index in alerts" :key="index">{{alert}}</p>
  </div>
</div>
</template>
<script>
export default {
  data() {
    return {
      count: 0,
      alerts: [],
    }
  },



  computed: {
  },



  methods: {
    alert() {
      this.alerts.push(...arguments);
    },
    addCount() {
      this.count++;
    },
    tap1(e) {
      console.log(e);
      this.alert('tap!!!');
    },
    tapParent(e) {
      console.log(e);
      this.alert('tapParent');
    },
    tapChild1(e) {
      console.log(e);
      this.alert('tapChild1');
    },
    tapChild2(e) {
      console.log(e);
      this.alert('tapChild2');
    },
    panStart(e) {
      console.info('panStart');
      console.log(e);
      return DDTappable.panStart(e);
    },
    panMove(e) {
      return DDTappable.panMove(e);
    },
    panMoveEnclosure(e) {
      return DDTappable.panMove(e, {enclosure: true});
    },
    panEnd(e) {
      console.info('panEnd');
      console.log(e);
      return DDTappable.panEnd(e);
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
