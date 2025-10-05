"use client";

/**
 * Calculates the initial translation and 3D rotation of an element, moving and rotating it further away from the center of the screen.
 * The rotation and Z-axis translation are proportional to the distance from the center, with elements near the center rotating less and moving less in Z.
 * 
 * @param {Element} element - The DOM element to calculate the translation and rotation for
 * @param {Number} offsetDistance - The distance by which the element will be moved away from the center (default: 250px)
 * @param {Number} maxRotation - The maximum rotation in degrees for farthest elements (default: 300 degrees)
 * @param {Number} maxZTranslation - The maximum Z-axis translation in pixels for farthest elements (default: 2000px)
 * @returns {Object} The x, y, z translation and rotateX, rotateY values as {x, y, z, rotateX, rotateY}
 */
export const calculateInitialTransform = (
  element: HTMLElement, 
  offsetDistance = 250, 
  maxRotation = 300, 
  maxZTranslation = 2000
) => {
  const viewportCenter = { 
    width: window.innerWidth / 2, 
    height: window.innerHeight / 2 
  };
  
  const elementCenter = { 
    x: element.offsetLeft + element.offsetWidth / 2, 
    y: element.offsetTop + element.offsetHeight / 2 
  };

  // Calculate the angle between the center of the element and the center of the viewport
  const angle = Math.atan2(
    Math.abs(viewportCenter.height - elementCenter.y), 
    Math.abs(viewportCenter.width - elementCenter.x)
  );

  // Calculate the x and y translation based on the angle and distance
  const translateX = Math.abs(Math.cos(angle) * offsetDistance);
  const translateY = Math.abs(Math.sin(angle) * offsetDistance);

  // Calculate the maximum possible distance from the center (diagonal of the viewport)
  const maxDistance = Math.sqrt(
    Math.pow(viewportCenter.width, 2) + 
    Math.pow(viewportCenter.height, 2)
  );

  // Calculate the current distance from the center
  const currentDistance = Math.sqrt(
    Math.pow(viewportCenter.width - elementCenter.x, 2) + 
    Math.pow(viewportCenter.height - elementCenter.y, 2)
  );

  // Scale rotation and Z-translation based on distance from the center
  // (closer elements rotate/translate less, farther ones rotate/translate more)
  const distanceFactor = currentDistance / maxDistance;

  // Calculate the rotation values based on the position relative to the center
  const rotationX = (
    (elementCenter.y < viewportCenter.height ? -1 : 1) * 
    (translateY / offsetDistance) * 
    maxRotation * 
    distanceFactor
  );
  
  const rotationY = (
    (elementCenter.x < viewportCenter.width ? 1 : -1) * 
    (translateX / offsetDistance) * 
    maxRotation * 
    distanceFactor
  );

  // Calculate the Z-axis translation (depth) based on the distance from the center
  const translateZ = maxZTranslation * distanceFactor;

  // Determine direction based on position relative to the viewport center
  return {
    x: elementCenter.x < viewportCenter.width ? -translateX : translateX,
    y: elementCenter.y < viewportCenter.height ? -translateY : translateY,
    z: translateZ,
    rotateX: rotationX,
    rotateY: rotationY
  };
};
