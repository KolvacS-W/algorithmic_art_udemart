function setup() {
  createCanvas(600, 600);
  background(240);

  // Pick a random center point where the two lines intersect
  let cx = random(100, 500);
  let cy = random(100, 500);

  // Pick a random angle for the first line
  let angle1 = random(TWO_PI);

  // Second line is perpendicular (90 degrees)
  let angle2 = angle1 + HALF_PI;

  // Find where line 1 hits the edges
  let line1 = findEdgePoints(cx, cy, angle1);

  // Find where line 2 hits the edges
  let line2 = findEdgePoints(cx, cy, angle2);

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

  // Draw the 4 colored segments
  noStroke();
  let colors = [
    [200, 220, 255],  // light blue
    [255, 180, 180],  // light coral
    [255, 240, 180],  // light yellow
    [200, 255, 200]   // light green
  ];

  // For each corner, find its 2 closest edge points and draw the segment
  for (let i = 0; i < 4; i++) {
    fill(colors[i][0], colors[i][1], colors[i][2]);

    // Find the 2 edge points closest to this corner
    let closestPoints = findClosestEdgePoints(corners[i], edgePoints);

    // Draw polygon: corner -> edge point 1 -> center -> edge point 2 -> corner
    beginShape();
    vertex(corners[i].x, corners[i].y);
    vertex(closestPoints[0].x, closestPoints[0].y);
    vertex(cx, cy);
    vertex(closestPoints[1].x, closestPoints[1].y);
    endShape(CLOSE);
  }

  // Draw the 2 perpendicular lines on top
  stroke(60, 90, 180);
  strokeWeight(4);
  line(line1.x1, line1.y1, line1.x2, line1.y2);
  line(line2.x1, line2.y1, line2.x2, line2.y2);
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

function findEdgePoints(cx, cy, angle) {
  // Direction vector
  let dx = cos(angle);
  let dy = sin(angle);

  // Find intersection points with canvas edges
  let points = [];

  // Check intersection with left edge (x = 0)
  if (dx != 0) {
    let t = -cx / dx;
    let y = cy + t * dy;
    if (y >= 0 && y <= height) {
      points.push({ x: 0, y: y, t: t });
    }
  }

  // Check intersection with right edge (x = width)
  if (dx != 0) {
    let t = (width - cx) / dx;
    let y = cy + t * dy;
    if (y >= 0 && y <= height) {
      points.push({ x: width, y: y, t: t });
    }
  }

  // Check intersection with top edge (y = 0)
  if (dy != 0) {
    let t = -cy / dy;
    let x = cx + t * dx;
    if (x >= 0 && x <= width) {
      points.push({ x: x, y: 0, t: t });
    }
  }

  // Check intersection with bottom edge (y = height)
  if (dy != 0) {
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
