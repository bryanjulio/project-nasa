
import * as THREE from "three";

export function createMars() {
  const marsTexture = new THREE.TextureLoader().load( '/img/8k_mars.jpg' );
  marsTexture.colorSpace = THREE.SRGBColorSpace;
  marsTexture.anisotropy = 8;

  const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });

  const marsGeometry = new THREE.SphereGeometry(3389e3, 64, 64);
  const mars = new THREE.Mesh( marsGeometry, marsMaterial );

  return mars;
}
