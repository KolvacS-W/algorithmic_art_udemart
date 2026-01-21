function setup() {
  createCanvas(600, 600);
  background(240);

  // Pick a random center point where the two lines intersect
  let cx = random(150, width - 150);
  let cy = random(150, height - 150);

  // Try to find valid perpendicular lines that connect opposite edges
  let line1, line2, angle1, angle2;
  let maxAttempts = 100;
  let attempt = 0;

  while (attempt < maxAttempts) {
    // Pick a random angle for the first line
    angle1 = random(TWO_PI);

    // Second line is perpendicular (90 degrees)
    angle2 = angle1 + HALF_PI;

    // Find where each line hits the canvas edges
    line1 = findEdgePoints(cx, cy, angle1);
    line2 = findEdgePoints(cx, cy, angle2);

    // Check if both lines connect opposite edges (not adjacent)
    let line1Valid = connectsOppositeEdges(line1);
    let line2Valid = connectsOppositeEdges(line2);

    if (line1Valid && line2Valid) {
      break;  // Found valid lines!
    }

    attempt++;
  }

  // Collect all 4 edge points where lines hit the canvas
  let edgePoints = [
    {x: line1.x1, y: line1.y1},
    {x: line1.x2, y: line1.y2},
    {x: line2.x1, y: line2.y1},
    {x: line2.x2, y: line2.y2}
  ];

  // Define the 4 corners
  let corners = [
    {x: 0, y: 0, name: 'top-left'},
    {x: width, y: 0, name: 'top-right'},
    {x: width, y: height, name: 'bottom-right'},
    {x: 0, y: height, name: 'bottom-left'}
  ];

  // Draw the 4 colored segments with different polygon grids
  let colors = [
    [200, 220, 255],  // light blue
    [255, 180, 180],  // light coral
    [255, 240, 180],  // light yellow
    [200, 255, 200]   // light green
  ];

  // Define polygon types for each segment
  let polygonTypes = ['triangle', 'square', 'hexagon', 'diamond'];

  // For each corner, find its 2 closest edge points and draw the segment
  for (let i = 0; i < 4; i++) {
    // Find the 2 edge points closest to this corner
    let closestPoints = findClosestEdgePoints(corners[i], edgePoints);

    // Only draw if we have exactly 2 edge points for this corner
    if (closestPoints.length === 2) {
      // Define the segment boundary
      let segmentVertices = [
        corners[i],
        closestPoints[0],
        {x: cx, y: cy},
        closestPoints[1]
      ];

      // Fill segment with grid of polygons
      fillSegmentWithPolygons(segmentVertices, polygonTypes[i], colors[i]);
    }
  }

  // Draw the 2 perpendicular lines on top
  stroke(60, 90, 180);
  strokeWeight(4);
  line(line1.x1, line1.y1, line1.x2, line1.y2);
  line(line2.x1, line2.y1, line2.x2, line2.y2);
}

function fillSegmentWithPolygons(segmentVertices, polygonType, color) {
  // Fill a segment with a grid of polygons
  let gridSize = 30; // Distance between polygon centers

  // Find bounding box of the segment
  let minX = min(segmentVertices.map(v => v.x));
  let maxX = max(segmentVertices.map(v => v.x));
  let minY = min(segmentVertices.map(v => v.y));
  let maxY = max(segmentVertices.map(v => v.y));

  // Create grid of polygons
  for (let x = minX; x <= maxX; x += gridSize) {
    for (let y = minY; y <= maxY; y += gridSize) {
      // Check if this point is inside the segment
      if (pointInPolygon(x, y, segmentVertices)) {
        // Draw polygon at this position
        drawPolygon(x, y, polygonType, color, gridSize * 0.4);
      }
    }
  }
}

function drawPolygon(x, y, type, color, size) {
  // Draw different types of polygons
  fill(color[0], color[1], color[2]);
  stroke(255);
  strokeWeight(1);

  if (type === 'triangle') {
    // Equilateral triangle
    let h = size * sqrt(3) / 2;
    triangle(x, y - size * 0.6, x - size * 0.5, y + h * 0.4, x + size * 0.5, y + h * 0.4);
  } else if (type === 'square') {
    // Square
    rectMode(CENTER);
    square(x, y, size);
  } else if (type === 'hexagon') {
    // Hexagon
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i - HALF_PI;
      let px = x + cos(angle) * size * 0.5;
      let py = y + sin(angle) * size * 0.5;
      vertex(px, py);
    }
    endShape(CLOSE);
  } else if (type === 'diamond') {
    // Diamond (rhombus)
    beginShape();
    vertex(x, y - size * 0.5);
    vertex(x + size * 0.4, y);
    vertex(x, y + size * 0.5);
    vertex(x - size * 0.4, y);
    endShape(CLOSE);
  }
}

function pointInPolygon(px, py, vertices) {
  // Ray casting algorithm to check if point is inside polygon
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let xi = vertices[i].x, yi = vertices[i].y;
    let xj = vertices[j].x, yj = vertices[j].y;

    let intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function findClosestEdgePoints(corner, edgePoints) {
  // Find the 2 edge points that share edges with this corner
  let result = [];

  for (let point of edgePoints) {
    // Check if point shares an edge with the corner
    if ((point.x === corner.x) || (point.y === corner.y)) {
      result.push(point);
    }
  }

  // Sort by distance to corner to get the closest 2
  result.sort((a, b) => {
    let distA = dist(a.x, a.y, corner.x, corner.y);
    let distB = dist(b.x, b.y, corner.x, corner.y);
    return distA - distB;
  });

  return result.slice(0, 2);
}

function connectsOppositeEdges(line) {
  // Check if a line connects opposite edges (not adjacent edges)
  let edge1 = getEdge(line.x1, line.y1);
  let edge2 = getEdge(line.x2, line.y2);

  // Opposite edges: top-bottom or left-right
  if ((edge1 === 'top' && edge2 === 'bottom') || (edge1 === 'bottom' && edge2 === 'top')) {
    return true;  // Top and bottom are opposite
  }
  if ((edge1 === 'left' && edge2 === 'right') || (edge1 === 'right' && edge2 === 'left')) {
    return true;  // Left and right are opposite
  }

  return false;  // Adjacent edges
}

function getEdge(x, y) {
  // Determine which edge a point is on (with small tolerance)
  let tolerance = 0.1;

  if (abs(y) < tolerance) return 'top';
  if (abs(y - height) < tolerance) return 'bottom';
  if (abs(x) < tolerance) return 'left';
  if (abs(x - width) < tolerance) return 'right';

  // Shouldn't happen, but return something
  return 'unknown';
}

function findEdgePoints(cx, cy, angle) {
  // Find where a line through (cx, cy) at given angle hits canvas edges
  let dx = cos(angle);
  let dy = sin(angle);

  let points = [];

  // Check intersection with left edge (x = 0)
  if (abs(dx) > 0.001) {
    let t = -cx / dx;
    let y = cy + t * dy;
    if (y >= 0 && y <= height) {
      points.push({ x: 0, y: y, t: t });
    }
  }

  // Check intersection with right edge (x = width)
  if (abs(dx) > 0.001) {
    let t = (width - cx) / dx;
    let y = cy + t * dy;
    if (y >= 0 && y <= height) {
      points.push({ x: width, y: y, t: t });
    }
  }

  // Check intersection with top edge (y = 0)
  if (abs(dy) > 0.001) {
    let t = -cy / dy;
    let x = cx + t * dx;
    if (x >= 0 && x <= width) {
      points.push({ x: x, y: 0, t: t });
    }
  }

  // Check intersection with bottom edge (y = height)
  if (abs(dy) > 0.001) {
    let t = (height - cy) / dy;
    let x = cx + t * dx;
    if (x >= 0 && x <= width) {
      points.push({ x: x, y: height, t: t });
    }
  }

  // Sort by t value to get the two points on opposite sides
  points.sort((a, b) => a.t - b.t);

  // Return the first and last points (opposite sides)
  return {
    x1: points[0].x,
    y1: points[0].y,
    x2: points[points.length - 1].x,
    y2: points[points.length - 1].y
  };
}

function draw() {
  // No animation needed
}
