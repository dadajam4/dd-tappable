import Vue from 'vue';
import App from './App';
import 'console-polyfill';



const Root = Vue.extend({
  render: h => h(App),
});

new Root({el: '#app'});
