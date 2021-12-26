<script>
  import { onMount } from 'svelte';
  import { intersect, swapXY, setLines } from './helper';
  import { MKAD } from './MKAD';
  import { PointObject } from './mapObjects';
  import DeliveryPoint from './DelieryPoint.svelte';
  
  let geoJSON, fileinput, myMap, squareMKAD, polygonMKAD; 
  let deliveryPoints, deliveryPointsUpd, deliveryPointsUpdSorted = [];
  let state2 = false, state3 = false, state4 = false;

  const onFileSelected = e => {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = e => geoJSON = e.target.result;
  }

  let center = [55.78361503443606, 37.600883000000006];
  let zoom = 11;
  let Loaded = false;

  let optionsMKAD = { fillColor: '#3388ee', strokeColor: '#0000FF', opacity: 0.15, strokeWidth: 3, strokeStyle: 'shortdash'};

  let optionsArea1 = { fillColor: '#97a100', strokeColor: '#595959', opacity: 0.5, strokeWidth: 5, strokeStyle: 'shortdash'};
  let optionsArea11 = { fillColor:'#82cdff', fillOpacity: 0.3, strokeColor:'#ff98ff', strokeWidth: 2, strokeOpacity: 0.8, };
  let optionsArea12 = { fillColor:'#ff931e', fillOpacity: 0.4, strokeColor:'#ff4543', strokeWidth: 2, strokeOpacity: 0.8, };

  let optionsArea2 = { fillColor: '#a8d5e5', strokeColor: '#ff3d0e', opacity: 0.5, strokeWidth: 2, strokeStyle: 'shortdash'};
  let optionsArea21 = { fillColor:'#3866ff', fillOpacity: 0.3, strokeColor:'#ff98ff', strokeWidth: 2, strokeOpacity: 0.8, };
  let optionsArea22 = { fillColor:'#453f31', fillOpacity: 0.4, strokeColor:'#ff4543', strokeWidth: 2, strokeOpacity: 0.8, };

  let preBounds1 = [[37.631573165038915,55.8114078603953],[37.57870146093737,55.80135339608306],[37.56771513281236,55.7762058241978],[37.59037443457016,55.74871830427356],[37.63363310156235,55.738260196081995],[37.67895170507798,55.74639452348706],[37.685818160156096,55.77388368789247],[37.683071578124846,55.80057986772972],[37.631573165038915,55.8114078603953]];
  let preBounds2 = [[37.502679946016286,55.828240539418594],[37.48757374484441,55.80929779785282],[37.495813490938176,55.783768444491734],[37.53426563937566,55.75589906884554],[37.57134449679755,55.75512463387571],[37.60087025363347,55.77757697903805],[37.58782398898505,55.82012335559256],[37.502679946016286,55.828240539418594]];
  
  let bounds1 = [], bounds2 = [], tmp = [];
  let Bounds11 = [], Bounds12 = [], Bounds21 = [], Bounds22 = [];
  let lines1 = [], lines2 = [];
  let loc = [], its = [];
  let polygon1, polygon11, polygon12;
  let polygon2, polygon21, polygon22;

  /**
   * get lines intersections coordinates & locations 
   * 
   * @param {Array} arr1 [{'x': xCoord, 'y': yCoord}, {}...]
   * @param {Array} arr2 [{'x': xCoord, 'y': yCoord}, {}...]
   * 
   * @return {Object} {'locations':[[x, y], []...], 'intersections': [{'x': i, 'y': j, 'px': p.x, 'py': p.y, 'coord': [p.x, p.y]}, {}...]}
   */
  const getIntersections = (arr1, arr2) => {
    let locations = [], intersections = [];
    for (let i = 0; i < arr1.length-1; i++) {
      for (let j = 0; j < arr2.length-1; j++) {
        let p = intersect(arr1[i]['x'],   arr1[i]['y'], 
                          arr1[i+1]['x'], arr1[i+1]['y'], 
                          arr2[j]['x'],   arr2[j]['y'],
                          arr2[j+1]['x'], arr2[j+1]['y']);
        if (p) {
          locations.push([p.x, p.y]);
          intersections = [ ...intersections, {'x': i, 'y': j, 'px': p.x, 'py': p.y, 'coord': [p.x, p.y]}];
        }
      }
    }
    return { 'locations': locations, 'intersections': intersections };
  }
  /**
   * make 2 polygons from 1 with borders between intersections
   * 
   * @param {Array} arr coordinates of source polygon
   * @param {Array} its intersections coordinates
   * @prarm {String} index choose first or second polygon ('x' or 'y')
   * 
   * @return {Object} object of border coordinates of 2 polygons { 'Bounds1': [], 'Bounds2': []} 
   */
  const getSplittedPlygons = (arr, its, index) => {
    //
    // swap values [its] array if idx > idxNext
    //
    let idx = its[0][index];
    let idxNext = its[1][index];

    if (idx > idxNext) {
      [its[0], its[1]] = [its[1], its[0]];
      idx = its[0][index];
      idxNext = its[1][index];
    }
    //
    // calculate length of two polygons without intersections 
    //
    let len1 = Math.abs(idx - idxNext);
    let len2 = arr.length - len1- idx;
    //
    // calculate two polygons coordinates with intersections
    //
    let Bounds1 = [ ...arr];
    Bounds1.splice(idx + 1, len1, its[0].coord, its[1].coord);
    let Bounds2 = [ ...arr];
    Bounds2.splice(idxNext + 1, len2, its[1].coord, its[0].coord);
    Bounds2.splice(0, idx + 1, its[0].coord);
    return { Bounds1, Bounds2 };
  }

  const removeDeliveryPolygons = () => {
    clearPolygons();
    geoJSON = null;
  }

  // очищаем карту от полигонов
  function clearPolygons() {
    if (deliveryPointsUpdSorted)
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
    if (deliveryPointsUpdSorted) {
      deliveryPointsUpdSorted = deliveryPointsUpdSorted.map(n => {
        n.Show = true;
        return n;
      });
    }
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
  
  const sortDeliveryPoints = () => {
    // сортируем по площади по убыванию, чтобы бОльшие по площади рисовались первыми
    deliveryPointsUpdSorted = deliveryPointsUpd.sort((a, b) => b.Square - a.Square);
  }

  const removeExtraPolygons = () => {
    //вычислим приблизительно центр полигона
    let geoCenter = ymaps.util.bounds.getCenter(polygon11.geometry.getBounds());
    polygon2.geometry.contains(geoCenter)
      ? myMap.geoObjects.remove(polygon11)
      : myMap.geoObjects.remove(polygon12);

    geoCenter = ymaps.util.bounds.getCenter(polygon21.geometry.getBounds());
    polygon1.geometry.contains(geoCenter)
      ? myMap.geoObjects.remove(polygon21)
      : myMap.geoObjects.remove(polygon22);
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

  onMount(() => {
    ymaps.ready(['util.calculateArea']).then(loadMap);
  })

  $: if (state2) { getPolygonsInsideMKAD() } else { getAllPolygons() };

  $: if (deliveryPointsUpdSorted) {
    clearPolygons();
    showPolygons();
  }

  $: if (geoJSON) {
      let geoObj = JSON.parse(geoJSON);

      deliveryPoints = geoObj["Result 1"];

      deliveryPointsUpd = deliveryPoints.map(n => new PointObject(n));

      sortDeliveryPoints();

      console.log('geoJSON upd...', deliveryPointsUpd);

      
      // preBounds1 = geoObj.features[0].geometry.coordinates[0];
      // preBounds2 = geoObj.features[1].geometry.coordinates[0];
      
      // bounds1 = swapXY(preBounds1);
      // bounds2 = swapXY(preBounds2);

      // lines1 = setLines(bounds1);
      // lines2 = setLines(bounds2);

      // ({ locations: loc, intersections: its } = getIntersections(lines1, lines2));

      // ({ Bounds1: Bounds11, Bounds2: Bounds12 } = getSplittedPlygons(bounds1, its, 'x')); 
      // ({ Bounds1: Bounds21, Bounds2: Bounds22 } = getSplittedPlygons(bounds2, its, 'y')); 

      // showPolygons();
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
                on:click={() => state2 = !state2} >
          <label for="sc2">Show inside MKAD</label>
        </li>
        <li>
          <input class="styled-checkbox" id="sc3" type="checkbox" value="value3">
          <label for="sc3">Remove >5% delivery</label>
        </li>
        <li>
          <input class="styled-checkbox" id="sc4" type="checkbox" value="value4">
          <label for="sc4">Remove overlapping</label>
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