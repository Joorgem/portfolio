/**
 * Global Three.js object pool for performance optimization
 * Prevents garbage collection pressure in render loops (60fps)
 *
 * Based on React Three Fiber best practices from Context7 research:
 * - Reuse Vector3, Matrix4, and other Three.js objects
 * - Minimize allocations in useFrame loops
 * - Reduce memory pressure and GC activity
 */
import * as THREE from 'three';

// Pre-allocated objects for reuse across components
export const ObjectPool = {
  // Vector3 pool - most commonly used
  tempVector1: new THREE.Vector3(),
  tempVector2: new THREE.Vector3(),
  tempVector3: new THREE.Vector3(),
  tempVector4: new THREE.Vector3(),

  // Matrix4 pool for transformations
  tempMatrix1: new THREE.Matrix4(),
  tempMatrix2: new THREE.Matrix4(),

  // Quaternion pool for rotations
  tempQuaternion1: new THREE.Quaternion(),
  tempQuaternion2: new THREE.Quaternion(),

  // Euler pool for angle calculations
  tempEuler1: new THREE.Euler(),
  tempEuler2: new THREE.Euler(),

  // Color pool for material updates
  tempColor1: new THREE.Color(),
  tempColor2: new THREE.Color(),
} as const;

// Utility functions for resetting objects to clean state
export const resetVector = (vector: THREE.Vector3) => vector.set(0, 0, 0);
export const resetMatrix = (matrix: THREE.Matrix4) => matrix.identity();
export const resetQuaternion = (quaternion: THREE.Quaternion) => quaternion.set(0, 0, 0, 1);
export const resetEuler = (euler: THREE.Euler) => euler.set(0, 0, 0);
export const resetColor = (color: THREE.Color) => color.setRGB(1, 1, 1);

// Typed helper for vector operations with automatic cleanup
export const withTempVector = <T>(
  callback: (vector: THREE.Vector3) => T,
  vector: THREE.Vector3 = ObjectPool.tempVector1
): T => {
  const result = callback(vector);
  resetVector(vector);
  return result;
};

// Typed helper for matrix operations with automatic cleanup
export const withTempMatrix = <T>(
  callback: (matrix: THREE.Matrix4) => T,
  matrix: THREE.Matrix4 = ObjectPool.tempMatrix1
): T => {
  const result = callback(matrix);
  resetMatrix(matrix);
  return result;
};

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  // Log object pool usage in development
  console.log('🎯 ObjectPool initialized with pre-allocated Three.js objects');
}