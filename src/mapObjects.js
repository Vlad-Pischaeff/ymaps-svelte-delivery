import { randomInteger, setCoordArray  } from './helper';

export function PointObject(item) {
  let r = randomInteger(16, 255).toString(16);
  let g = randomInteger(16, 255).toString(16);
  let b = randomInteger(16, 255).toString(16);

  let optionsArea = { 
    fillColor: '#' + r + g + b, 
    strokeColor: '#003dаe', 
    opacity: 0.5, 
    strokeWidth: 2, 
    strokeStyle: 'shortdash'
  };

  this.CoordinatesJson = setCoordArray(item.CoordinatesJson);

  let polygon = new ymaps.GeoObject({ 
    geometry: { type: "Polygon", coordinates: [ this.CoordinatesJson ] },
    properties:{ balloonContent: item.Name }}, optionsArea);
  this.Polygon = polygon;      // добавим в объект поле "полигон"

  let square = Math.round(ymaps.util.calculateArea(polygon));
  this.Square = square;        // добавим в объект поле "площадь"

  this.Show = true;            // добавим в объект поле "показывать"
  this.Name = item.Name;
  this.Phone = item.Phone;
}