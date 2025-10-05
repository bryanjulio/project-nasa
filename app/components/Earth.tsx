
import * as THREE from "three";

export function createEarth() {
  const earthTexture = new THREE.TextureLoader().load( '/img/8k_earth_daymap.jpg' );
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  earthTexture.anisotropy = 8;

  const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });

  const earthGeometry = new THREE.SphereGeometry(6371e3 * 500, 64, 64);
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  
  return earth;
}
