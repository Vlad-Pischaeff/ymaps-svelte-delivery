<script>
  export let point, myMap;
  let show = true, display = 'block', bgColor;

  $: show  
      ? myMap.geoObjects.add(point.Polygon)
      : myMap.geoObjects.remove(point.Polygon);

  $: bgColor = show 
      ? point.Polygon.options._options.fillColor
      : "#eee";

  $: display = show ? 'block' : 'none';

  $: {
    show = point.Show ? true : false;
    // console.log('show', point.Name, point.Show)
    }
</script>

<div class="item">
  <div  class="item_box"
        style="--bg-color: {bgColor}; --display: {display}" 
        on:click={() => show = !show}>
  </div>
  <div class="item_name">{point.Name}</div>
  <span class="item_square">{(point.Square / 1e6).toFixed(3)} км²</span>
</div>

<style>
  .item {
    display: flex;
    align-items: center;
    max-height: 3rem;
    padding: 2px;
    margin: 2px 0;
  }
  .item_box {
    position: relative;
    width: 20px;
    height: 20px;
    margin-right: .5rem;
    opacity: 0.7;
  }
  .item_box:before {
    content: '';
    margin-right: 10px;
    display: inline-block;
    vertical-align: text-top;
    width: 20px;
    height: 20px;
    background: var(--bg-color);
    outline: 1px solid #8080806e;
  }
  .item_box:after {
    content: '';
    position: absolute;
    left: 5px;
    top: 9px;
    background: white;
    width: 2px;
    height: 2px;
    box-shadow: 
      2px 0 0 white,
      4px 0 0 white,
      4px -2px 0 white,
      4px -4px 0 white,
      4px -6px 0 white,
      4px -8px 0 white;
    transform: rotate(45deg);
    display: var(--display);
  }
  .item_box:hover {
    cursor: pointer;
    opacity: 1;
    outline: 2px solid black;
  }

  .item_name {
    flex: 1 1 70%;
  }
  .item_square {
    flex: 1 1 30%;
  }
  .item:hover {
    background: #ccc;
  }
</style>