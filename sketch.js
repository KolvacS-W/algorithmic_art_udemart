function setup() {
  createCanvas(600, 600);
  background(40); // Blackchalk color

  // Step 1: Pick first line connecting two opposite edges
  let line1 = {};
  let line1Vertical = random() < 0.5;

  if (line1Vertical) {
    // Line 1 connects top-bottom
    line1.x1 = random(100, width - 100);
    line1.y1 = 0;
    line1.x2 = random(100, width - 100);
    line1.y2 = height;
  } else {
    // Line 1 connects left-right
    line1.x1 = 0;
    line1.y1 = random(100, height - 100);
    line1.x2 = width;
    line1.y2 = random(100, height - 100);
  }

  // Step 2: Find a perpendicular line that connects the other two opposite edges
  let line2 = {};
  let angle1 = atan2(line1.y2 - line1.y1, line1.x2 - line1.x1);
  let angle2 = angle1 + HALF_PI;
  let maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Pick a random point on line1
    let t = random(0.2, 0.8); // Stay away from edges
    let px = line1.x1 + t * (line1.x2 - line1.x1);
    let py = line1.y1 + t * (line1.y2 - line1.y1);

    // Find where perpendicular line hits canvas edges
    line2 = findEdgePoints(px, py, angle2);

    // Check if line2 connects the other two opposite edges
    if (connectsOppositeEdges(line2) && !connectsSameEdges(line1, line2)) {
      break;
    }
  }

  // Use the intersection point as center (the "heart")
  let intersection = findLineIntersection(line1, line2);
  let cx = intersection.x;
  let cy = intersection.y;
  let heart = { x: cx, y: cy };

  // Collect all 4 edge points where lines hit the canvas
  let edgePoints = [
    { x: line1.x1, y: line1.y1 },
    { x: line1.x2, y: line1.y2 },
    { x: line2.x1, y: line2.y1 },
    { x: line2.x2, y: line2.y2 },
  ];

  // Define the 4 corners
  let corners = [
    { x: 0, y: 0, name: "top-left" },
    { x: width, y: 0, name: "top-right" },
    { x: width, y: height, name: "bottom-right" },
    { x: 0, y: height, name: "bottom-left" },
  ];

  // Define beverage-inspired colorset from the picture
  let beverageColorset = [
    [139, 69, 19], // Brown (beer bottles)
    [160, 82, 45], // Saddle brown (beer)
    [0, 48, 135], // Dark blue (Pepsi)
    [220, 20, 60], // Crimson red (Pepsi, cans)
    [34, 139, 34], // Forest green (7Up)
    [173, 255, 47], // Yellow-green (Mountain Dew)
    [255, 140, 0], // Dark orange (Crush, Gatorade)
    [255, 69, 0], // Red-orange (Gatorade)
    [65, 105, 225], // Royal blue (Gatorade)
    [138, 43, 226], // Blue violet (drinks)
    [255, 215, 0], // Gold (bottles)
    [50, 205, 50], // Lime green (Mountain Dew)
    [178, 34, 34], // Fire brick red (Dr Pepper)
    [70, 130, 180], // Steel blue (cans)
  ];

  // Define polygon types for each segment
  let polygonTypes = ["triangle", "square", "hexagon", "diamond"];

  // Define different goodsize and goodensity for each segment
  let goodsizes = [
    random(30, 90), // Segment 1
    random(20, 80), // Segment 2
    random(50, 90), // Segment 3
    random(35, 85), // Segment 4
  ];

  let densityreduce = 0.4;
  let goodensities = [
    random(1.7, 2.3) - densityreduce, // Segment 1 density multiplier
    random(1.8, 2.2) - densityreduce, // Segment 2 density multiplier
    random(1.6, 2.4) - densityreduce, // Segment 3 density multiplier
    random(1.9, 2.1) - densityreduce, // Segment 4 density multiplier
  ];

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
        { x: cx, y: cy },
        closestPoints[1],
      ];

      // Fill segment with grid of polygons aligned with the lines
      fillSegmentWithPolygons(
        segmentVertices,
        polygonTypes[i],
        beverageColorset,
        angle1,
        goodsizes[i],
        goodensities[i],
      );
    }
  }

  // Draw pepcircle1 around the heart
  // Circle center is randomly placed within a distance range from heart
  let minDistFromHeart = 20;
  let maxDistFromHeart = 80;
  let distFromHeart = random(minDistFromHeart, maxDistFromHeart);
  let angleFromHeart = random(TWO_PI);

  let pepcircle1 = {
    x: heart.x + cos(angleFromHeart) * distFromHeart,
    y: heart.y + sin(angleFromHeart) * distFromHeart,
    radius: 0,
  };

  // Radius must be larger than distance from circle center to heart
  let minRadius = distFromHeart;
  pepcircle1.radius = random(minRadius + 10, minRadius + 60);

  // Create pepcircle2
  // Sample a point at distance [pepcircle1.radius, pepcircle1.radius * 1.5] from pepcircle1
  let distFromPepcircle1 = random(pepcircle1.radius, pepcircle1.radius * 1.5);
  let angleFromPepcircle1 = random(TWO_PI);

  let pepcircle2 = {
    x: pepcircle1.x + cos(angleFromPepcircle1) * distFromPepcircle1,
    y: pepcircle1.y + sin(angleFromPepcircle1) * distFromPepcircle1,
    radius: random(pepcircle1.radius * 0.5, pepcircle1.radius),
  };

  // Draw pepcircle1 (red)
  fill(220, 60, 60);
  noStroke();
  circle(pepcircle1.x, pepcircle1.y, pepcircle1.radius * 2);

  // Draw pepcircle2 (blue)
  fill(60, 120, 220);
  noStroke();
  circle(pepcircle2.x, pepcircle2.y, pepcircle2.radius * 2);

  // Draw intersection in white
  drawCircleIntersection(pepcircle1, pepcircle2);

  // Draw the 2 perpendicular lines on top
  // stroke(60, 90, 180);
  noStroke();
  strokeWeight(4);
  line(line1.x1, line1.y1, line1.x2, line1.y2);
  line(line2.x1, line2.y1, line2.x2, line2.y2);
}

function fillSegmentWithPolygons(
  segmentVertices,
  polygonType,
  colorset,
  gridAngle,
  goodSize,
  goodensity,
) {
  // Fill a segment with a grid of polygons aligned with the lines
  // goodSize: base distance between polygon centers
  // goodensity: density multiplier (higher = denser grid, more polygons)

  // Apply density to grid spacing (inverse relationship: higher density = smaller spacing)
  let effectiveGridSize = goodSize / goodensity;

  // Find bounding box of the segment
  let minX = min(segmentVertices.map((v) => v.x));
  let maxX = max(segmentVertices.map((v) => v.x));
  let minY = min(segmentVertices.map((v) => v.y));
  let maxY = max(segmentVertices.map((v) => v.y));

  // Calculate grid directions (aligned with the lines)
  let dx1 = cos(gridAngle);
  let dy1 = sin(gridAngle);
  let dx2 = cos(gridAngle + HALF_PI);
  let dy2 = sin(gridAngle + HALF_PI);

  // Find center of segment for grid origin
  let centerX = (minX + maxX) / 2;
  let centerY = (minY + maxY) / 2;

  // Determine how many grid steps we need in each direction
  let maxDist = max(maxX - minX, maxY - minY) * 1.5;
  let steps = ceil(maxDist / effectiveGridSize);

  // Create rotated grid of polygons
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      // Calculate position in rotated grid
      let x =
        centerX + i * effectiveGridSize * dx1 + j * effectiveGridSize * dx2;
      let y =
        centerY + i * effectiveGridSize * dy1 + j * effectiveGridSize * dy2;

      // Check if this point is inside the segment
      if (pointInPolygon(x, y, segmentVertices)) {
        // Randomize polygon size within [goodSize*0.8, goodSize*1.2]
        let randomSize = random(goodSize * 0.6, goodSize * 1.7) * 0.4;

        // Randomly sample a color from the colorset
        let randomColor = random(colorset);

        // Draw polygon at this position with rotation and random properties
        drawPolygon(x, y, polygonType, randomColor, randomSize, gridAngle);
      }
    }
  }
}

function drawPolygon(x, y, type, color, size, rotation) {
  // Draw different types of polygons with rotation
  push();
  translate(x, y);
  rotate(rotation);

  fill(color[0], color[1], color[2]);
  // stroke(255);
  noStroke();
  strokeWeight(1);

  if (type === "triangle") {
    // Equilateral triangle
    let h = (size * sqrt(3)) / 2;
    triangle(0, -size * 0.6, -size * 0.5, h * 0.4, size * 0.5, h * 0.4);
  } else if (type === "square") {
    // Square
    rectMode(CENTER);
    square(0, 0, size);
  } else if (type === "hexagon") {
    // Hexagon
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = (TWO_PI / 6) * i - HALF_PI;
      let px = cos(angle) * size * 0.5;
      let py = sin(angle) * size * 0.5;
      vertex(px, py);
    }
    endShape(CLOSE);
  } else if (type === "diamond") {
    // Diamond (rhombus)
    beginShape();
    vertex(0, -size * 0.5);
    vertex(size * 0.4, 0);
    vertex(0, size * 0.5);
    vertex(-size * 0.4, 0);
    endShape(CLOSE);
  }

  pop();
}

function drawCircleIntersection(circle1, circle2) {
  // Calculate distance between circle centers
  let d = dist(circle1.x, circle1.y, circle2.x, circle2.y);

  // Check if circles intersect
  if (
    d >= circle1.radius + circle2.radius ||
    d <= abs(circle1.radius - circle2.radius)
  ) {
    // No intersection or one circle is inside the other
    return;
  }

  // Calculate intersection points using circle-circle intersection formula
  let a =
    (circle1.radius * circle1.radius -
      circle2.radius * circle2.radius +
      d * d) /
    (2 * d);
  let h = sqrt(circle1.radius * circle1.radius - a * a);

  // Point on line between centers
  let px = circle1.x + (a * (circle2.x - circle1.x)) / d;
  let py = circle1.y + (a * (circle2.y - circle1.y)) / d;

  // The two intersection points
  let ix1 = px + (h * (circle2.y - circle1.y)) / d;
  let iy1 = py - (h * (circle2.x - circle1.x)) / d;
  let ix2 = px - (h * (circle2.y - circle1.y)) / d;
  let iy2 = py + (h * (circle2.x - circle1.x)) / d;

  // Calculate angles from each circle center to intersection points
  let angle1_1 = atan2(iy1 - circle1.y, ix1 - circle1.x);
  let angle1_2 = atan2(iy2 - circle1.y, ix2 - circle1.x);
  let angle2_1 = atan2(iy1 - circle2.y, ix1 - circle2.x);
  let angle2_2 = atan2(iy2 - circle2.y, ix2 - circle2.x);

  // Determine which arc direction to use (we want the smaller arc towards the other circle)
  let mid1 = (angle1_1 + angle1_2) / 2;
  let angleTo2 = atan2(circle2.y - circle1.y, circle2.x - circle1.x);

  // Normalize angle difference
  let diff = angleTo2 - mid1;
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  // If the midpoint of the arc is not towards circle2, swap the angles
  if (abs(diff) > HALF_PI) {
    let temp = angle1_1;
    angle1_1 = angle1_2;
    angle1_2 = temp;
  }

  // Same for circle2
  let mid2 = (angle2_1 + angle2_2) / 2;
  let angleTo1 = atan2(circle1.y - circle2.y, circle1.x - circle2.x);

  diff = angleTo1 - mid2;
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  if (abs(diff) > HALF_PI) {
    let temp = angle2_1;
    angle2_1 = angle2_2;
    angle2_2 = temp;
  }

  // Draw the lens-shaped intersection
  fill(255); // White
  noStroke();
  beginShape();

  // Arc from circle1 using proper angle interpolation
  let steps = 50;
  for (let i = 0; i <= steps; i++) {
    let angle = lerpAngle(angle1_1, angle1_2, i / steps);
    let x = circle1.x + cos(angle) * circle1.radius;
    let y = circle1.y + sin(angle) * circle1.radius;
    vertex(x, y);
  }

  // Arc from circle2 (reverse direction)
  for (let i = 0; i <= steps; i++) {
    let angle = lerpAngle(angle2_2, angle2_1, i / steps);
    let x = circle2.x + cos(angle) * circle2.radius;
    let y = circle2.y + sin(angle) * circle2.radius;
    vertex(x, y);
  }

  endShape(CLOSE);
}

function lerpAngle(a1, a2, t) {
  // Properly interpolate between two angles, taking the shortest path
  let diff = a2 - a1;

  // Normalize to [-PI, PI]
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;

  return a1 + diff * t;
}

function pointInPolygon(px, py, vertices) {
  // Ray casting algorithm to check if point is inside polygon
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let xi = vertices[i].x,
      yi = vertices[i].y;
    let xj = vertices[j].x,
      yj = vertices[j].y;

    let intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function findClosestEdgePoints(corner, edgePoints) {
  // Find the 2 edge points that share edges with this corner
  let result = [];

  for (let point of edgePoints) {
    // Check if point shares an edge with the corner
    if (point.x === corner.x || point.y === corner.y) {
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
  if (
    (edge1 === "top" && edge2 === "bottom") ||
    (edge1 === "bottom" && edge2 === "top")
  ) {
    return true; // Top and bottom are opposite
  }
  if (
    (edge1 === "left" && edge2 === "right") ||
    (edge1 === "right" && edge2 === "left")
  ) {
    return true; // Left and right are opposite
  }

  return false; // Adjacent edges
}

function connectsSameEdges(line1, line2) {
  // Check if two lines share any edge
  let edges1 = [getEdge(line1.x1, line1.y1), getEdge(line1.x2, line1.y2)];
  let edges2 = [getEdge(line2.x1, line2.y1), getEdge(line2.x2, line2.y2)];

  // Check if any edge is shared
  for (let e1 of edges1) {
    for (let e2 of edges2) {
      if (e1 === e2) {
        return true;
      }
    }
  }
  return false;
}

function findLineIntersection(line1, line2) {
  // Find intersection point of two lines
  let x1 = line1.x1,
    y1 = line1.y1;
  let x2 = line1.x2,
    y2 = line1.y2;
  let x3 = line2.x1,
    y3 = line2.y1;
  let x4 = line2.x2,
    y4 = line2.y2;

  let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (abs(denom) < 0.001) {
    // Lines are parallel, return midpoint
    return { x: width / 2, y: height / 2 };
  }

  let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1),
  };
}

function getEdge(x, y) {
  // Determine which edge a point is on (with small tolerance)
  let tolerance = 0.1;

  if (abs(y) < tolerance) return "top";
  if (abs(y - height) < tolerance) return "bottom";
  if (abs(x) < tolerance) return "left";
  if (abs(x - width) < tolerance) return "right";

  // Shouldn't happen, but return something
  return "unknown";
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
    y2: points[points.length - 1].y,
  };
}

function draw() {
  // No animation needed
}
