<script>
  import { onMount } from 'svelte';
  import { swapXY } from './helper';
  import { MKAD } from './MKAD';
  import { PointObject } from './mapObjects';
  import DeliveryPoint from './DelieryPoint.svelte';
  
  let geoJSON, fileinput, myMap, squareMKAD, polygonMKAD; 
  let deliveryPoints, deliveryPointsUpd, deliveryPointsUpdSorted = [];
  let disabled3 = true, disabled4 = true;
  let checked2 = false, checked3 = false, checked4 = false;

  let center = [55.78361503443606, 37.600883000000006];
  let zoom = 11;
  let Loaded = false;

  let optionsMKAD = { fillColor: '#3388ee', strokeColor: '#0000FF', opacity: 0.15, strokeWidth: 3, strokeStyle: 'shortdash'};

  const onFileSelected = e => {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = e => geoJSON = e.target.result;
  }

  const removeDeliveryPolygons = () => {
    clearPolygons();
    geoJSON = null;
    deliveryPointsUpdSorted = [];
    checked2 = false;
    checked3 = false;
    disabled3 = true;
  }

  // очищаем карту от полигонов
  function clearPolygons() {
    deliveryPointsUpdSorted &&
      deliveryPointsUpdSorted.forEach(n => myMap.geoObjects.remove(n.Polygon));
  }
  
  // русуем все полигоны
  const showPolygons = () => {
    deliveryPointsUpdSorted.forEach(n => {
      // n.Square/squareMKAD*100 < 5  &&  myMap.geoObjects.add(n.Polygon);
      myMap.geoObjects.add(n.Polygon);
    });
  }

  // показываем все полигоны
  const getAllPolygons = () => {
    deliveryPointsUpdSorted &&
      deliveryPointsUpdSorted.forEach(n => n.Show = true);
    deliveryPointsUpdSorted = [...deliveryPointsUpdSorted];
  }

  // вычисляем полигоны в пределах МКАД
  const getPolygonsInsideMKAD = () => {
    deliveryPointsUpdSorted = deliveryPointsUpdSorted.map(n => {
      let geoCenter = ymaps.util.bounds.getCenter(n.Polygon.geometry.getBounds());
      n.Show = polygonMKAD.geometry.contains(geoCenter)
        ? true
        : false;
      return n;
    });
  }

  // русуем полигоны <5% от площади МКАД
  const showPolygons5 = () => {
    deliveryPointsUpdSorted.forEach(n => {
      n.Square/squareMKAD*100 < 5 
        ? n.Show = n.Show
        : n.Show = false;
    });
    deliveryPointsUpdSorted = [...deliveryPointsUpdSorted];
  }
  
  const sortDeliveryPoints = () => {
    // сортируем по площади по убыванию, чтобы бОльшие по площади рисовались первыми
    deliveryPointsUpdSorted = deliveryPointsUpd.sort((a, b) => b.Square - a.Square);
  }

  const showMKAD = () => {
    let mkad = swapXY(MKAD);
    polygonMKAD = new ymaps.GeoObject({
            geometry: { type: "Polygon", coordinates: [mkad] },
            properties:{ balloonContent: "mkad" }}, optionsMKAD);
    myMap.geoObjects.add(polygonMKAD);
    // вычисляем площадь МКАД
    squareMKAD = Math.round(ymaps.util.calculateArea(polygonMKAD));
    // console.log('areaMKAD..', (squareMKAD / 1e6).toFixed(3),' км²' );
  }

  const loadMap = () => {
    myMap = new ymaps.Map("map", { center, zoom });
    Loaded = true;
    showMKAD();  // после монтирования показываем карту МКАД
  }

  onMount(() => ymaps.ready(['util.calculateArea']).then(loadMap));

  $: checked2 ? getPolygonsInsideMKAD() : getAllPolygons();

  $: checked3 ? showPolygons5() : getPolygonsInsideMKAD();

  $: disabled3 = checked2 ? false : true;

  $: if (!checked2) {
    disabled3 = true;
    checked3 = false;
  }
  
  $: if (deliveryPointsUpdSorted) {
    clearPolygons();
    showPolygons();
  }

  $: if (geoJSON) {
      let geoObj = JSON.parse(geoJSON);
      deliveryPoints = geoObj["Result 1"];
      deliveryPointsUpd = deliveryPoints.map(n => new PointObject(n));
      sortDeliveryPoints();
      // console.log('geoJSON upd...', deliveryPointsUpd);
    } 
</script>

<div>
  {#if Loaded === false}
    <h1>Loading...</h1>
  {/if}
</div>
<main>
  <div id="map"></div>
  <aside>
    <input type="button" value="select GeoObject file" on:click={() => fileinput.click()}>
    <input style="display:none" type="file" accept=".json" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
    <input type="button" value="clear map" on:click={removeDeliveryPolygons}>
    
    <section class="dpselection">
      <ul class="checkboxes">
        <li>
          <input class="styled-checkbox" id="sc2" type="checkbox" value="value2"
                bind:checked={checked2} >
          <label for="sc2">Show inside MKAD</label>
        </li>
        <li>
          <input class="styled-checkbox" id="sc3" type="checkbox" value="value3"
                bind:checked={checked3} disabled={disabled3} >
          <label for="sc3" class:disabled={disabled3}>Remove >5% delivery</label>
        </li>
        <li>
          <input class="styled-checkbox" id="sc4" type="checkbox" value="value4"
                bind:checked={checked4} disabled={disabled4}>
          <label for="sc4" class:disabled={disabled4}>Remove overlapping</label>
        </li>
      </ul>
    </section>

    <section class="dplist">
      {#if deliveryPointsUpdSorted}
        {#each deliveryPointsUpdSorted as point }
          <DeliveryPoint point={point} myMap={myMap} />
        {/each}
      {/if}
    </section>

  </aside>
</main>

<style>
  main {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: flex-start;
  }
  aside {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column nowrap;
    height: 540px;
    margin: 0 1rem;
  }

  .dpselection, .dplist {
    background: ghostwhite;
    border-radius: .3rem;
    border: 1px solid #ccc;
  }
  .dpselection {
    flex: 0 0 10rem;
    margin-bottom: .5rem;
  }
  .dplist {
    flex: 1 1 20rem;
    padding: .5rem;
    overflow: auto;
  }
  .dpselection:hover,
  .dplist:hover {
    box-shadow: 0 0 20px #80808051;
  }

  #map {
    width: 720px;
    height: 540px;
  }
</style>