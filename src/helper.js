/**
 * @author Peter Kelley
 * @author pgkelley4@gmail.com
 */

/**
 * See if two line segments intersect. This uses the 
 * vector cross product approach described below:
 * http://stackoverflow.com/a/565282/786339
 * 
 * @param {Object} p point object with x and y coordinates
 *  representing the start of the 1st line.
 * @param {Object} p2 point object with x and y coordinates
 *  representing the end of the 1st line.
 * @param {Object} q point object with x and y coordinates
 *  representing the start of the 2nd line.
 * @param {Object} q2 point object with x and y coordinates
 *  representing the end of the 2nd line.
 */
 export function doLineSegmentsIntersect(p, p2, q, q2) {
	var r = subtractPoints(p2, p);
	var s = subtractPoints(q2, q);

	var uNumerator = crossProduct(subtractPoints(q, p), r);
	var denominator = crossProduct(r, s);

	if (uNumerator == 0 && denominator == 0) {
		// They are coLlinear
		
		// Do they touch? (Are any of the points equal?)
		if (equalPoints(p, q) || equalPoints(p, q2) || equalPoints(p2, q) || equalPoints(p2, q2)) {
			return true
		}
		// Do they overlap? (Are all the point differences in either direction the same sign)
		return !allEqual(
				(q.x - p.x < 0),
				(q.x - p2.x < 0),
				(q2.x - p.x < 0),
				(q2.x - p2.x < 0)) ||
			!allEqual(
				(q.y - p.y < 0),
				(q.y - p2.y < 0),
				(q2.y - p.y < 0),
				(q2.y - p2.y < 0));
	}

	if (denominator == 0) {
		// lines are paralell
		return false;
	}

	var u = uNumerator / denominator;
	var t = crossProduct(subtractPoints(q, p), s) / denominator;

	return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
}

/**
 * Calculate the cross product of the two points.
 * 
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 * 
 * @return the cross product result as a float
 */
export function crossProduct(point1, point2) {
	return point1.x * point2.y - point1.y * point2.x;
}

/**
 * Subtract the second point from the first.
 * 
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 * 
 * @return the subtraction result as a point object
 */ 
export function subtractPoints(point1, point2) {
	var result = {};
	result.x = point1.x - point2.x;
	result.y = point1.y - point2.y;

	return result;
}

/**
 * See if the points are equal.
 *
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 *
 * @return if the points are equal
 */
export function equalPoints(point1, point2) {
	return (point1.x == point2.x) && (point1.y == point2.y)
}

/**
 * See if all arguments are equal.
 *
 * @param {...} args arguments that will be compared by '=='.
 *
 * @return if all arguments are equal
 */
export function allEqual(args) {
	var firstValue = arguments[0],
		i;
	for (i = 1; i < arguments.length; i += 1) {
		if (arguments[i] != firstValue) {
			return false;
		}
	}
	return true;
}


/**
 * See if all arguments are equal.
 *
 * @param x1, x2, y1, y2 = first line, x3, x4, y3, y4 = second line
 *
 * @return intersection coordinates or false
 */
export function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

  // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}

	let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
	if (denominator === 0) {
		return false
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}

  // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return {x, y}
}

export function randomInteger(min, max) {
	// случайное число от min до (max+1)
	let rand = min + Math.random() * (max + 1 - min);
	return Math.floor(rand);
}

/**
 * swap x,y for correct working with yMaps
 * меняем местами координаты
 * 
 * @param {Array} arr array of coordinates [{"Lat": x, "Lon": y}, {}...]
 * 
 * @return {Array} of swaped coordinates [[y, x], []...]
 */
export const setCoordArray = (arr) => {
	return arr.map(n => [n.Lat, n.Lon]);
}

/**
 * swap x,y for correct working with yMaps
 * меняем местами координаты
 * 
 * @param {Array} arr array of coordinates [[x, y], []...]
 * 
 * @return {Array} of swaped coordinates [[y, x], []...]
 */
export const swapXY = (arr) => {
	return arr.map(n => n.reverse());
}

/**
 * 
 * set array of obj from array of coordinates
 * 
 * @param {Array} arr [[xCoord, yCoord], [] ...]
 * 
 * @return {Array} array of objects [{'x': xCoord, 'y': yCoord}, {} ...]
 */
export const setLines = (arr) => {
	return arr.map(n => ({ 'x': n[0], 'y': n[1] }));
}

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